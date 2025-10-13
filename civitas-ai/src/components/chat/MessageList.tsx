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
    // Show welcome message as first AI message - Real Estate Agent style
    const welcomeMessage: Message = {
      id: 'welcome',
      role: 'assistant',
      content: "Hey there! 👋 I'm Civitas, your personal STR investment advisor.\n\nThink of me as your always-available real estate partner who lives and breathes short-term rentals. I've helped investors like you analyze thousands of properties and maximize their returns.\n\nHere's what I can help you with:\n\n💰 Find high-performing STR markets and properties\n📊 Run detailed revenue projections and cash flow analysis\n📈 Optimize your pricing and boost occupancy rates\n🏘️ Navigate local STR regulations and licensing\n⭐ Track your portfolio's performance in real-time\n\nWhether you're eyeing your first Airbnb or scaling to 10+ properties, I'm here to make sure you make data-driven decisions.\n\nSo... what property are you curious about? Or should we explore some hot markets together?",
      timestamp: new Date(),
      isStreaming: false
    };
    
    return (
      <div className="h-full overflow-y-auto">
        <div className="max-w-4xl mx-auto py-8 px-4 space-y-4">
          <MessageBubble message={welcomeMessage} />
          <div ref={messagesEndRef} />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto py-8 px-4 space-y-4">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        {isLoading && <LoadingBubble />}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};