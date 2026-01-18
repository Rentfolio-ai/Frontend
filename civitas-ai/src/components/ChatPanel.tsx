/**
 * Chat Panel: GPT/Claude Style Interface
 * 
 * Following Sam Altman + Boris Cherny + Jony Ive analysis:
 * - Full-width, left-aligned messages (NO right-alignment)
 * - Avatar icons on left to differentiate roles
 * - Centered 768px container
 * - Input at bottom of scroll (not sticky)
 * - Generous whitespace
 */

import React, { useRef, useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Send } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Message } from './chat/Message';
import type { Message as MessageType } from '@/types/chat';

interface ChatPanelProps {
  messages: MessageType[];
  currentAnswer?: string;
  isLoading: boolean;
  onSendMessage: (message: string) => void;
  inputValue?: string;
  onInputChange?: (value: string) => void;
  className?: string;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  messages,
  currentAnswer = '',
  isLoading,
  onSendMessage,
  inputValue: externalInputValue,
  onInputChange: externalOnInputChange,
  className,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [internalInputValue, setInternalInputValue] = useState('');

  // Use external or internal state
  const inputValue = externalInputValue !== undefined ? externalInputValue : internalInputValue;
  const setInputValue = externalOnInputChange || setInternalInputValue;

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentAnswer]);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [inputValue]);

  // Convert currentAnswer to streaming message
  const displayMessages = React.useMemo(() => {
    const msgs = [...messages];
    if (currentAnswer?.trim()) {
      msgs.push({
        id: 'streaming',
        role: 'assistant',
        content: currentAnswer,
        timestamp: Date.now(),
        streaming: true,
      });
    }
    return msgs;
  }, [messages, currentAnswer]);

  const handleSend = () => {
    if (inputValue?.trim() && !isLoading) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div 
      className={cn('flex flex-col h-full overflow-y-auto', className)} 
      style={{ 
        background: 'linear-gradient(180deg, rgba(10, 14, 26, 1) 0%, rgba(15, 20, 35, 1) 50%, rgba(10, 14, 26, 1) 100%)'
      }}
    >
      {/* Messages Container - Centered 768px */}
      <div className="flex-1 w-full max-w-[768px] mx-auto px-6 py-8">
        <AnimatePresence mode="popLayout">
          {displayMessages.map((message) => (
            <Message
              key={message.id}
              message={message}
              onSuggestionClick={(suggestion) => {
                setInputValue(suggestion);
                textareaRef.current?.focus();
              }}
            />
          ))}
        </AnimatePresence>
        
        <div ref={messagesEndRef} />

        {/* Input - Part of scroll, not sticky */}
        <div className="mt-8 relative">
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            placeholder="Ask about properties..."
            rows={1}
            className="w-full resize-none rounded-2xl px-4 py-3.5 pr-14 text-[15px] transition-all focus:outline-none"
            style={{
              background: 'rgba(26, 35, 50, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: '#f8fafc',
              minHeight: '52px',
              maxHeight: '200px',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.4)';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(245, 158, 11, 0.1)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />

          {/* Send Button */}
          <motion.button
            onClick={handleSend}
            disabled={!inputValue?.trim() || isLoading}
            whileHover={inputValue?.trim() && !isLoading ? { scale: 1.05 } : {}}
            whileTap={inputValue?.trim() && !isLoading ? { scale: 0.95 } : {}}
            className="absolute right-2 bottom-2 w-9 h-9 rounded-full flex items-center justify-center transition-all"
            style={{
              background: inputValue?.trim() && !isLoading
                ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                : 'rgba(100, 116, 139, 0.3)',
              cursor: inputValue?.trim() && !isLoading ? 'pointer' : 'not-allowed',
              opacity: inputValue?.trim() && !isLoading ? 1 : 0.4,
            }}
          >
            <Send className="w-4 h-4" style={{ color: '#ffffff' }} />
          </motion.button>
        </div>
      </div>
    </div>
  );
};
