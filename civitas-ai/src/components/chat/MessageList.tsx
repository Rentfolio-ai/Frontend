// FILE: src/components/chat/MessageList.tsx
import React, { useEffect, useRef } from 'react';
import { MessageBubble } from './MessageBubble';
import { LoadingBubble } from './LoadingBubble';
import type { Message } from '../../data/seed';

interface MessageListProps {
  messages: Message[];
  isLoading?: boolean;
  onAction?: (actionValue: string, actionContext?: any) => void;
}

export const MessageList: React.FC<MessageListProps> = ({ messages, isLoading = false, onAction }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  if (messages.length === 0) {
    // Show comprehensive onboarding message as first AI message
    const welcomeMessage: Message = {
      id: 'welcome',
      role: 'assistant',
      content: "Welcome to Civitas! 🏠✨\n\nYour AI-powered assistant for finding profitable Airbnb/VRBO properties across the U.S. I analyze properties, calculate ROI projections, and generate agent-ready reports.\n\nWHAT I CAN DO:\n\n🔍 Scout properties based on location, price, and criteria\n📊 Calculate STR revenue projections with occupancy and rates\n💰 Show cash-on-cash returns and investment grades (A/B/C/D)\n📋 Generate comprehensive reports with market data\n⚖️ Check local STR regulations and compliance\n\nEXPLORE THE APP:\n\n🏘️ Properties - Saved properties with STR analysis\n📈 Portfolio - Track performance and returns\n📄 Reports - Investment reports and analysis\n🌍 Market - U.S. market trends and demand\n⚙️ Settings - Customize preferences\n\nTRY ASKING:\n• \"Find properties in Austin under $400k\"\n• \"What makes a good STR investment?\"\n• \"Search for 3 bedroom homes in Miami\"\n\nWhat would you like to explore? 🚀",
      timestamp: new Date(),
      isStreaming: false
    };
    
    return (
      <div className="h-full overflow-y-auto">
        <div className="max-w-4xl mx-auto py-8 px-4 space-y-4">
          <MessageBubble message={welcomeMessage} onAction={onAction} />
          <div ref={messagesEndRef} />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto py-8 px-4 space-y-4">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} onAction={onAction} />
        ))}
        {isLoading && <LoadingBubble />}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};