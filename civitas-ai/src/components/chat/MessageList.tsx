// FILE: src/components/chat/MessageList.tsx
import React, { useEffect, useRef } from 'react';
import { MessageBubble } from './MessageBubble';
import { LoadingBubble } from './LoadingBubble';
import { AgentAvatar } from '../common/AgentAvatar';
import type { Message } from '../../data/seed';

interface MessageListProps {
  messages: Message[];
  isLoading?: boolean;
}

export const MessageList: React.FC<MessageListProps> = ({ messages, isLoading = false }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  if (messages.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center px-6 py-12">
        <div className="max-w-3xl w-full space-y-8">
          {/* Personalized Greeting */}
          <div className="text-center space-y-4">
            <div className="mx-auto flex justify-center mb-6">
              <div 
                className="p-5 rounded-3xl backdrop-blur-md"
                style={{
                  background: 'rgba(255, 255, 255, 0.6)',
                  boxShadow: '0px 4px 14px rgba(0, 0, 0, 0.06)'
                }}
              >
                <AgentAvatar size="lg" />
              </div>
            </div>
            <h2 
              className="text-4xl font-bold mb-3"
              style={{
                fontFamily: 'Satoshi, sans-serif',
                color: '#1A1A1A',
                background: 'linear-gradient(135deg, #007BFF 0%, #00C6AE 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              Welcome back, [User Name].
            </h2>
            <p 
              className="text-xl leading-relaxed"
              style={{ color: '#5A6473', fontFamily: 'Inter, sans-serif' }}
            >
              Let's explore your portfolio and discover new opportunities.
            </p>
          </div>

          {/* AI Suggestion Chips */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-8">
            {[
              { icon: '📊', label: 'Analyze my active listings', gradient: 'from-blue-500 to-cyan-400' },
              { icon: '📈', label: 'Show me STR performance this week', gradient: 'from-cyan-400 to-teal-400' },
              { icon: '📝', label: 'Summarize my reports', gradient: 'from-teal-400 to-green-400' },
              { icon: '🎯', label: 'Find new investment opportunities', gradient: 'from-blue-500 to-purple-400' },
            ].map((suggestion, i) => (
              <button
                key={i}
                className="group relative px-5 py-4 rounded-2xl backdrop-blur-md transition-all duration-300 hover:scale-105 text-left"
                style={{
                  background: 'rgba(255, 255, 255, 0.6)',
                  boxShadow: '0px 4px 14px rgba(0, 0, 0, 0.06)',
                  border: '1px solid rgba(0, 123, 255, 0.1)'
                }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{suggestion.icon}</span>
                  <span 
                    className="font-medium text-sm group-hover:text-blue-600 transition-colors"
                    style={{ color: '#1A1A1A', fontFamily: 'Inter, sans-serif' }}
                  >
                    {suggestion.label}
                  </span>
                </div>
                <div 
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"
                  style={{
                    background: 'linear-gradient(135deg, #00B2FF 0%, #00C6AE 100%)'
                  }}
                ></div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Group consecutive messages by sender
  const grouped: Array<{ message: Message; groupLength: number; isFirst: boolean }> = [];
  let i = 0;
  while (i < messages.length) {
    const current = messages[i];
    let groupLen = 1;
    let j = i + 1;
    while (j < messages.length && messages[j].role === current.role) {
      groupLen++;
      j++;
    }
    for (let k = 0; k < groupLen; k++) {
      grouped.push({
        message: messages[i + k],
        groupLength: groupLen,
        isFirst: k === 0
      });
    }
    i += groupLen;
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto p-6 pb-32 space-y-1">
        {grouped.map(({ message, groupLength, isFirst }) => (
          <MessageBubble key={message.id} message={message} groupLength={groupLength} isFirst={isFirst} />
        ))}
        {isLoading && <LoadingBubble />}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};