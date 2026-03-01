// FILE: src/components/chat/MessageList.tsx
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowDown } from 'lucide-react';
import { MessageBubble } from './MessageBubble';
import { ThinkingIndicator } from './ThinkingIndicator';
import type { AgentStatus } from '../common/AgentAvatar';
import type { Message } from '../../types/chat';
import type { InvestmentStrategy } from '../../types/pnl';
import type { BookmarkedProperty } from '../../types/bookmarks';
import type { ScoutedProperty } from '../../types/backendTools';
import type { ThinkingState, CompletedTool } from '../../types/stream';
import type { ReasoningStep } from './AIReasoningPanel';
import type { ThinkingStep } from '@/hooks/useThinkingQueue';

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
  reasoningSteps?: ReasoningStep[];
  // Thinking steps (ChatGPT-style collapsible thinking)
  thinkingSteps?: ThinkingStep[];
  thinkingIsActive?: boolean;
  thinkingIsDone?: boolean;
  thinkingElapsed?: number;
  nativeThinkingText?: string | null;
  reasoningText?: string | null;
  hasThinkingModel?: boolean;
  /** Active model display name for ThinkingIndicator badge */
  activeModel?: string;
  userName?: string;
  userAvatar?: string;
  onRefresh?: (messageId: string) => void;
  onViewDetails?: (property: any) => void;
  onEdit?: (messageId: string, content: string) => void;
  // Cancel and error handling
  onCancel?: () => void;
  error?: string | null;
  onRetry?: () => void;
  // Preferences
  onOpenPreferences?: () => void;
  isWideMode?: boolean;
  onNavigateBranch?: (messageId: string, direction: 'prev' | 'next') => void;
  onSuggestionSelect?: (suggestion: string) => void;
  onModeSwitch?: (mode: string, autoQuery?: string) => void;
  onNavigateToPreferences?: () => void;
  onNavigateToUpgrade?: () => void;
  onRecalculate?: (property: any, params: any) => Promise<any>;
  onRefine?: (instruction: string) => void;
  onGoToIntegrations?: () => void;
  onSendComplete?: (summary: string) => void;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  reasoningSteps = [],
  isLoading = false,
  onAction,
  agentStatus = 'online',
  onOpenDealAnalyzer,
  bookmarks,
  onToggleBookmark,
  onNavigateToReports,
  thinking,
  completedTools = [],
  thinkingSteps,
  thinkingIsActive,
  thinkingIsDone,
  thinkingElapsed,
  nativeThinkingText,
  reasoningText,
  hasThinkingModel = false,
  activeModel,
  userName,
  userAvatar,
  onRefresh,
  onViewDetails,
  onEdit,
  onCancel,
  error,
  onRetry,
  onOpenPreferences,
  isWideMode = false,
  onNavigateBranch,
  onSuggestionSelect,
  onModeSwitch,
  onNavigateToPreferences,
  onNavigateToUpgrade,
  onRecalculate,
  onRefine,
  onGoToIntegrations,
  onSendComplete,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  }, []);

  // Track scroll position to show/hide scroll-to-bottom button
  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    setShowScrollButton(distanceFromBottom > 200);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, thinking, completedTools, scrollToBottom]);

  // Show thinking state whenever loading
  const showThinkingState = isLoading;
  const lastMessage = messages[messages.length - 1];
  const isLastMessageAssistant = lastMessage?.role === 'assistant';
  const isStreaming = lastMessage?.isStreaming;

  // Debug logging with timestamp
  console.log(`[MessageList] ${new Date().toLocaleTimeString()} State:`, {
    isLoading,
    showThinkingState,
    hasThinking: !!thinking,
    thinkingStatus: thinking?.status,
    isStreaming,
    willRender: showThinkingState && !isStreaming
  });

  // Find the last user message for context-aware thinking
  const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');

  // Extract partial content from last streaming message (for preview in thinking indicator)
  const partialContent = (isLoading && isLastMessageAssistant && isStreaming)
    ? lastMessage.content
    : '';

  // Filter messages to hide the last assistant message while it's being generated (loading)
  // This ensures we only show the ThinkingIndicator until the full message is ready
  const visibleMessages = isLoading && isLastMessageAssistant
    ? messages.slice(0, -1)
    : messages;

  return (
    <div
      ref={scrollContainerRef}
      className="h-full overflow-y-auto overflow-x-hidden chat-scroll relative"
      onScroll={handleScroll}
    >
      <div
        className={`${isWideMode ? 'max-w-2xl' : 'max-w-[580px]'} mx-auto py-4 px-3 md:px-4 flex flex-col transition-all duration-300`}
        style={{ gap: 'var(--chat-density, 12px)' }}
      >
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
              userAvatar={userAvatar}
              onRefresh={onRefresh}
              onViewDetails={onViewDetails}
              onEdit={(content) => onEdit?.(message.id, content)}
              onNavigateBranch={onNavigateBranch}
              onSuggestionSelect={onSuggestionSelect}
              onModeSwitch={onModeSwitch}
              onNavigateToPreferences={onNavigateToPreferences}
              onNavigateToUpgrade={onNavigateToUpgrade}
              onRecalculate={onRecalculate}
              citations={message.citations}
              onRefine={onRefine}
              onGoToIntegrations={onGoToIntegrations}
              onSendComplete={onSendComplete}
            />
          );
        })}

        {/* Thinking State - Always show when loading, even during early streaming */}
        {showThinkingState && (
          <div className="flex gap-3 items-start animate-fade-in mb-4">
            <div className="flex-1 pt-1">
              <ThinkingIndicator
                thinking={thinking || { status: 'Thinking' }}
                completedTools={completedTools}
                reasoningSteps={reasoningSteps}
                partialContent={partialContent}
                userQuery={lastUserMessage?.content}
                onCancel={onCancel}
                error={error}
                onRetry={onRetry}
                onOpenPreferences={onOpenPreferences}
                thinkingSteps={thinkingSteps}
                thinkingIsActive={thinkingIsActive}
                thinkingIsDone={thinkingIsDone}
                thinkingElapsed={thinkingElapsed}
                nativeThinkingText={nativeThinkingText}
                reasoningText={reasoningText}
                hasThinkingModel={hasThinkingModel}
                activeModel={activeModel}
              />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Floating Scroll-to-Bottom Button */}
      <AnimatePresence>
        {showScrollButton && (
          <motion.button
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            onClick={() => scrollToBottom()}
            className="fixed bottom-28 right-8 z-20 p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/80 hover:text-white hover:bg-white/20 shadow-lg transition-colors"
            aria-label="Scroll to bottom"
          >
            <ArrowDown className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};
