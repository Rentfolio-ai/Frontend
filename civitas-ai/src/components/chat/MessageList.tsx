// FILE: src/components/chat/MessageList.tsx
import React, { useEffect, useRef } from 'react';
import { MessageBubble } from './MessageBubble';
import { LoadingBubble } from './LoadingBubble';
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
    // Show welcome message as first AI message
    const welcomeMessage: Message = {
      id: 'welcome',
      role: 'assistant',
      content: "Hi! I'm your STR Investment AI assistant. I'm here to help you analyze properties, understand market trends, maximize your rental income, and make smarter investment decisions.\n\nWhat would you like to explore today?",
      timestamp: new Date(),
      isStreaming: false
    };
    
    return (
      <div className="h-full overflow-y-auto">
        <div className="max-w-4xl mx-auto py-8 px-4 space-y-4">
          <MessageBubble message={welcomeMessage} groupLength={1} isFirst={true} />
          <div ref={messagesEndRef} />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto py-8 px-4 space-y-4">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} groupLength={1} isFirst={true} />
        ))}
        {isLoading && <LoadingBubble />}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};