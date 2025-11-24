// FILE: src/components/chat/MessageList.tsx
import React, { useEffect, useRef } from 'react';
import { MessageBubble } from './MessageBubble';
import { LoadingBubble } from './LoadingBubble';
import type { Message } from '../../data/seed';
import type { AgentStatus } from '../common/AgentAvatar';

interface MessageListProps {
  messages: Message[];
  isLoading?: boolean;
  onAction?: (actionValue: string, actionContext?: any) => void;
  agentStatus?: AgentStatus;
}

export const MessageList: React.FC<MessageListProps> = ({ messages, isLoading = false, onAction, agentStatus = 'online' }) => {
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
      content: "Welcome to Civitas! 🏠✨\n\nI'm your AI partner for scouting profitable STR opportunities across the U.S. I can analyze properties, calculate revenue projections, and help you craft a winning plan—directly from this chat window.\n\nWHAT I CAN DO:\n\n🔍 Scout properties by city, budget, or criteria\n📊 Estimate nightly rates, occupancy, and cash-on-cash returns\n💬 Summarize pros/cons and surface hidden insights\n⚖️ Check local regulations, fees, and permitting steps\n🧠 Suggest next steps for offers, financing, or ops\n\nAPP CONTROLS:\n\n💬 Chat - Ask me anything and I'll run the analysis\n⚙️ Settings - Update your state focus and alert preferences\n\nTRY ASKING:\n• \"Find STR-friendly markets with strong ROI\"\n• \"Analyze a 3 bed in Scottsdale at $750k\"\n• \"Compare nightly rates for Austin vs. Nashville\"\n\nReady when you are—what should we explore first? 🚀",
      timestamp: new Date(),
      isStreaming: false
    };
    
    return (
      <div className="h-full overflow-y-auto">
        <div className="max-w-6xl mx-auto py-8 px-4 space-y-4">
          <MessageBubble message={welcomeMessage} onAction={onAction} agentStatus={agentStatus} />
          <div ref={messagesEndRef} />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-6xl mx-auto py-8 px-4 space-y-4">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} onAction={onAction} agentStatus={agentStatus} />
        ))}
        {isLoading && <LoadingBubble />}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};