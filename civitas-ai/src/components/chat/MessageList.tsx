// FILE: src/components/chat/MessageList.tsx
import React, { useEffect, useRef } from 'react';
import { MessageBubble } from './MessageBubble';
import { ThinkingIndicator } from './ThinkingIndicator';
import { AgentAvatar, type AgentStatus } from '../common/AgentAvatar';
import type { Message } from '../../types/chat';
import type { InvestmentStrategy } from '../../types/pnl';
import type { BookmarkedProperty } from '../../types/bookmarks';
import type { ScoutedProperty } from '../../types/backendTools';
import type { ThinkingState, CompletedTool } from '../../types/stream';

interface MessageListProps {
  messages: Message[];
  isLoading?: boolean;
  onAction?: (actionValue: string, actionContext?: any) => void;
  agentStatus?: AgentStatus;
  onOpenDealAnalyzer?: (propertyId: string | null, strategy: InvestmentStrategy, purchasePrice?: number, propertyAddress?: string) => void;
  bookmarks?: BookmarkedProperty[];
  onToggleBookmark?: (property: ScoutedProperty) => void;
  onNavigateToReports?: () => void;
  // Thinking state props
  thinking?: ThinkingState | null;
  completedTools?: CompletedTool[];
  userName?: string;
  onRefresh?: (messageId: string) => void;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  isLoading = false,
  onAction,
  agentStatus = 'online',
  onOpenDealAnalyzer,
  bookmarks,
  onToggleBookmark,
  onNavigateToReports,
  thinking,
  completedTools = [],
  userName,
  onRefresh,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, thinking, completedTools]);

  // Show thinking state whenever loading
  const showThinkingState = isLoading;
  const lastMessage = messages[messages.length - 1];
  const isLastMessageAssistant = lastMessage?.role === 'assistant';

  // Find the last user message for context-aware thinking
  const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');

  // Filter messages to hide the last assistant message while it's being generated (loading)
  // This ensures we only show the ThinkingIndicator until the full message is ready
  const visibleMessages = isLoading && isLastMessageAssistant
    ? messages.slice(0, -1)
    : messages;

  return (
    <div className="h-full overflow-y-auto chat-scroll">
      <div className="max-w-3xl mx-auto py-8 px-4 md:px-6 space-y-12">
        {visibleMessages.map((message, index) => {
          const isLast = index === visibleMessages.length - 1;
          // Pass reasoning steps only to the last message if it's from assistant
          // AND we are not loading (since we hide the message while loading)
          const steps = (isLast && message.role === 'assistant' && !isLoading) ? completedTools : undefined;

          return (
            <MessageBubble
              key={message.id}
              message={message}
              onAction={onAction}
              agentStatus={agentStatus}
              onOpenDealAnalyzer={onOpenDealAnalyzer}
              bookmarks={bookmarks}
              onToggleBookmark={onToggleBookmark}
              onNavigateToReports={onNavigateToReports}
              reasoningSteps={steps}
              userName={userName}
              onRefresh={onRefresh}
            />
          );
        })}

        {/* Thinking State - shown during loading */}
        {showThinkingState && (
          <div className="flex gap-3 animate-fade-in">
            <div className="flex-shrink-0 pt-1">
              <AgentAvatar size="md" status={agentStatus} />
            </div>
            <div className="flex-1 max-w-[75%]">
              <ThinkingIndicator
                thinking={thinking || { status: 'processing' }}
                completedTools={completedTools}
                userQuery={lastUserMessage?.content}
              />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};
