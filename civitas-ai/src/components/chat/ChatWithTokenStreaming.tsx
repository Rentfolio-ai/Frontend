// FILE: src/components/chat/ChatWithTokenStreaming.tsx
/**
 * Complete Chat Component with Token-by-Token Streaming
 * Drop-in replacement for your existing chat component
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Square, Sparkles } from 'lucide-react';
import { useStreamChat } from '../../hooks/useStreamChat';
import { ThinkingIndicator } from './ThinkingIndicator';
import { ClarificationForm } from './ClarificationForm';
import { AgentModeSelector } from './AgentModeSelector';
import type { AgentMode } from '../../types/chat';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import '../../styles/llm-theme.css';

interface ChatWithTokenStreamingProps {
  userPreferences?: Record<string, unknown>;
  onNewThread?: (threadId: string) => void;
}

export const ChatWithTokenStreaming: React.FC<ChatWithTokenStreamingProps> = ({
  userPreferences,
  onNewThread
}) => {
  const [inputValue, setInputValue] = useState('');
  const [currentMode, setCurrentMode] = useState<AgentMode>('hunter');



  const [messages, setMessages] = useState<Array<{
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    streaming?: boolean;
  }>>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const {
    sendMessage,
    cancelStream: stopStream,
    ...streamState
  } = useStreamChat({
    onContent: (content) => {
      setMessages(prev => {
        const lastMessage = prev[prev.length - 1];
        if (lastMessage && lastMessage.role === 'assistant' && lastMessage.streaming) {
          return [
            ...prev.slice(0, -1),
            { ...lastMessage, content }
          ];
        }
        return prev;
      });
    },
    onComplete: (_content, threadId) => {
      setMessages(prev => {
        const lastMessage = prev[prev.length - 1];
        if (lastMessage && lastMessage.role === 'assistant') {
          return [
            ...prev.slice(0, -1),
            { ...lastMessage, streaming: false }
          ];
        }
        return prev;
      });

      if (threadId && onNewThread) {
        onNewThread(threadId);
      }
    },
    onError: (error) => {
      console.error('Chat error:', error);
    }
  });

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    const timer = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);

    return () => clearTimeout(timer);
  }, [messages, streamState.thinking, streamState.clarificationRequest]);

  const submitMessage = async () => {
    if (!inputValue.trim() || !streamState.isComplete) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    setMessages(prev => [...prev, {
      id: (Date.now() + 1).toString(),
      role: 'assistant' as const,
      content: '',
      timestamp: new Date(),
      streaming: true
    }]);

    setInputValue('');

    // Cast userPreferences only effectively when calling, ensuring it's safe
    // If backend requires strict type, useStreamChat should define it
    await sendMessage(
      userMessage.content,
      streamState.threadId || undefined,
      userPreferences as { name?: string; onboarding_completed?: boolean } | undefined,
      currentMode
    );

    inputRef.current?.focus();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitMessage();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submitMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-black relative">
      {/* Mode Selector Header */}
      <AgentModeSelector
        currentMode={currentMode}
        onModeChange={setCurrentMode}
        disabled={!streamState.isComplete}
      />

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
        <AnimatePresence mode="popLayout">
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-4 rounded-xl ${message.role === 'user'
                  ? 'user-message'
                  : 'ai-message'
                  }`}
              >
                {message.streaming ? (
                  <div className="flex items-baseline gap-2">
                    <div className="text-white/90 whitespace-pre-wrap">
                      {message.content}
                    </div>
                    <motion.span
                      className="inline-block w-0.5 h-5 bg-purple-500"
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{
                        duration: 0.8,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                  </div>
                ) : (
                  <div className="text-white/90 prose prose-invert prose-sm max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {message.content}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Thinking Indicator & Clarification Form */}
        <AnimatePresence>
          {streamState.thinking && (
            <motion.div
              key="thinking"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex justify-start"
            >
              <div className="max-w-[80%]">
                <ThinkingIndicator
                  thinking={streamState.thinking}
                  completedTools={streamState.completedTools}
                  reasoningSteps={streamState.reasoningSteps}
                  onCancel={stopStream}
                />
              </div>
            </motion.div>
          )}

          {streamState.clarificationRequest && (
            <motion.div
              key="clarification"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start w-full"
            >
              <ClarificationForm
                request={streamState.clarificationRequest}
                onSubmit={async (answers) => {
                  const formattedArgs = Object.entries(answers)
                    .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
                    .join('\n');
                  const msg = `Here are the answers:\n${formattedArgs}`;

                  const userMessage = {
                    id: Date.now().toString(),
                    role: 'user' as const,
                    content: msg,
                    timestamp: new Date()
                  };
                  setMessages(prev => [...prev, userMessage]);
                  setMessages(prev => [...prev, {
                    id: (Date.now() + 1).toString(),
                    role: 'assistant' as const,
                    content: '',
                    timestamp: new Date(),
                    streaming: true
                  }]);

                  await sendMessage(
                    msg,
                    streamState.threadId || undefined,
                    userPreferences as { name?: string; onboarding_completed?: boolean } | undefined,
                    currentMode
                  );
                }}
                isLoading={!streamState.isComplete}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="glass border-t border-white/10 p-4">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything about real estate..."
              disabled={!streamState.isComplete}
              rows={1}
              className="w-full px-4 py-3 pr-12 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-purple-500/50 transition-colors resize-none max-h-32"
              style={{
                minHeight: '48px',
                height: 'auto'
              }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = Math.min(target.scrollHeight, 128) + 'px';
              }}
            />
          </div>

          {/* Send/Stop Button */}
          {!streamState.isComplete ? (
            <motion.button
              type="button"
              onClick={stopStream}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 font-medium transition-colors flex items-center gap-2"
            >
              <Square className="w-4 h-4" />
              Stop
            </motion.button>
          ) : (
            <motion.button
              type="submit"
              disabled={!inputValue.trim()}
              whileHover={{ scale: inputValue.trim() ? 1.05 : 1 }}
              whileTap={{ scale: inputValue.trim() ? 0.95 : 1 }}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Send
            </motion.button>
          )}
        </form>

        {/* Context Sources */}
        {streamState.contextSources && streamState.contextSources.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 flex items-center gap-2 text-xs text-white/50"
          >
            <Sparkles className="w-3 h-3" />
            <span>Using context from: {streamState.contextSources.join(', ')}</span>
          </motion.div>
        )}
      </div>
    </div>
  );
};
