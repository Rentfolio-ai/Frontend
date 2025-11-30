// FILE: src/components/desktop-shell/ChatTabView.tsx
import React, { useState, useEffect, useRef } from 'react';
import { MessageList } from '../chat/MessageList';
import { Composer, type ComposerRef } from '../chat/Composer';
import { AgentAvatar, type AgentStatus } from '../common/AgentAvatar';
import type { Message } from '../../types/chat';
import type { InvestmentStrategy } from '../../types/pnl';
import type { ThinkingState, CompletedTool } from '../../types/stream';
import { getOnboardingMessage } from '../../services/chatApi';
import { checkHealth } from '../../services/agentsApi';
import type { BookmarkedProperty } from '../../types/bookmarks';
import type { ScoutedProperty } from '../../types/backendTools';

interface ChatTabViewProps {
  messages: Message[];
  isLoading: boolean;
  userName?: string;
  selectedState?: string;
  onSendMessage: (message: string) => void;
  onAction?: (actionValue: string, actionContext?: any) => void;
  onAttach?: (file: File) => void;
  attachment?: File | null;
  onClearAttachment?: () => void;
  onOpenDealAnalyzer?: (propertyId: string | null, strategy: InvestmentStrategy, purchasePrice?: number, propertyAddress?: string) => void;
  bookmarks?: BookmarkedProperty[];
  onToggleBookmark?: (property: ScoutedProperty) => void;
  onNavigateToReports?: () => void;
  onOpenSidebar?: () => void;
  onNewChat?: () => void;
  // Thinking state
  thinking?: ThinkingState | null;
  completedTools?: CompletedTool[];
}

// Quick action chips for new users - designed to guide and help
const QUICK_ACTIONS = [
  {
    id: 'search',
    label: 'Find investment properties',
    icon: '🏠',
    query: 'Show me investment properties in Austin, TX under $500k with good rental potential',
    description: 'Discover properties that match your criteria'
  },
  {
    id: 'analyze',
    label: 'Calculate ROI & cash flow',
    icon: '💰',
    query: 'I want to analyze a rental property. What information do you need to calculate my potential returns?',
    description: 'Get detailed financial projections'
  },
  {
    id: 'market',
    label: 'Explore market trends',
    icon: '📊',
    query: 'What are the best markets for rental property investing right now? Show me data on prices, rents, and growth.',
    description: 'See where opportunities are'
  },
  {
    id: 'learn',
    label: 'Get started guide',
    icon: '🎯',
    query: 'I\'m new to real estate investing. Can you walk me through the basics and what I should know?',
    description: 'Learn the fundamentals'
  },
];

export const ChatTabView: React.FC<ChatTabViewProps> = ({
  messages,
  isLoading,
  userName,
  selectedState: _selectedState,
  onSendMessage,
  onAction,
  onAttach,
  attachment,
  onClearAttachment,
  onOpenDealAnalyzer,
  bookmarks,
  onToggleBookmark,
  onNavigateToReports,
  onOpenSidebar,
  onNewChat,
  thinking,
  completedTools = [],
}) => {
  const [onboardingMessage, setOnboardingMessage] = useState<string>('');
  const [backendStatus, setBackendStatus] = useState<'unknown' | 'up' | 'down'>('unknown');
  const composerRef = useRef<ComposerRef>(null);

  const agentStatus: AgentStatus = backendStatus === 'down' ? 'offline' : backendStatus === 'unknown' ? 'unknown' : 'online';

  useEffect(() => {
    const fetchOnboarding = async () => {
      const data = await getOnboardingMessage(userName);
      setOnboardingMessage(data.message);
    };
    fetchOnboarding();
  }, [userName]);

  useEffect(() => {
    let isMounted = true;
    const fetchHealthStatus = async () => {
      try {
        await checkHealth();
        if (isMounted) setBackendStatus('up');
      } catch {
        if (isMounted) setBackendStatus('down');
      }
    };
    fetchHealthStatus();
    const intervalId = window.setInterval(fetchHealthStatus, 60000);
    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  const handleQuickAction = (query: string) => {
    onSendMessage(query);
  };

  const showEmptyState = messages.length === 0 && !isLoading;

  return (
    <div className="h-full flex flex-col relative">
      {/* Floating Menu Button - Top Left */}
      {onOpenSidebar && (
        <button
          onClick={onOpenSidebar}
          className="absolute top-4 left-4 z-20 p-2.5 rounded-xl glass-card hover:bg-white/[0.08] transition-all duration-300 group"
          aria-label="Open menu"
        >
          <svg className="w-5 h-5 text-white/70 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}

      {/* New Chat Button - Top Right */}
      {onNewChat && !showEmptyState && (
        <button
          onClick={onNewChat}
          className="absolute top-4 right-4 z-20 px-3 py-2 rounded-xl glass-card hover:bg-white/[0.08] transition-all duration-300 group flex items-center gap-2"
          aria-label="New chat"
        >
          <svg className="w-4 h-4 text-white/70 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="text-sm font-medium text-white/70 group-hover:text-white transition-colors">New Chat</span>
        </button>
      )}

      {/* Messages or Empty State */}
      <div className="flex-1 overflow-hidden">
        {showEmptyState ? (
          /* Premium Empty State - Centered Hero */
          <div className="h-full flex flex-col items-center justify-center px-6">
            <div className="max-w-2xl w-full space-y-8 animate-fade-in">
              {/* Hero Section */}
              <div className="text-center space-y-6">
                {/* Glowing Avatar */}
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-primary/30 rounded-full blur-2xl scale-150 animate-pulse-glow" />
                  <AgentAvatar size="lg" className="relative" status={agentStatus} />
                </div>

                {/* Brand & Tagline */}
                <div className="space-y-3">
                  <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                    OmniEstate
                  </h1>
                  <p className="text-lg md:text-xl text-white/60 font-medium">
                    Your AI-powered real estate intelligence
                  </p>
                </div>

                {/* Welcome Message */}
                <div className="max-w-lg mx-auto">
                  <p className="text-white/50 text-sm leading-relaxed">
                    {onboardingMessage || 'I\'m here to help you find and evaluate real estate investment opportunities. Click any option below to get started, or ask me anything about properties, markets, or investing.'}
                  </p>
                </div>
              </div>

              {/* Quick Action Chips - Helpful for new users */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl w-full">
                {QUICK_ACTIONS.map((action, index) => (
                  <button
                    key={action.id}
                    onClick={() => handleQuickAction(action.query)}
                    className="group relative px-5 py-4 rounded-xl glass-card hover:bg-white/[0.08] border border-white/[0.06] hover:border-white/[0.12] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10 animate-slide-up text-left"
                    style={{ animationDelay: `${index * 75}ms` }}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl group-hover:scale-110 transition-transform flex-shrink-0 mt-0.5">
                        {action.icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-white/90 group-hover:text-white transition-colors mb-1">
                          {action.label}
                        </div>
                        {action.description && (
                          <div className="text-xs text-white/50 group-hover:text-white/60 transition-colors leading-relaxed">
                            {action.description}
                          </div>
                        )}
                      </div>
                      <svg
                        className="w-4 h-4 text-white/30 group-hover:text-white/60 transition-colors flex-shrink-0 mt-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                ))}
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center justify-center gap-6 pt-4">
                <div className="flex items-center gap-2 text-white/30 text-xs">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span>Secure & Private</span>
                </div>
                <div className="w-px h-4 bg-white/10" />
                <div className="flex items-center gap-2 text-white/30 text-xs">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>Real-time Data</span>
                </div>
                <div className="w-px h-4 bg-white/10" />
                <div className="flex items-center gap-2 text-white/30 text-xs">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <span>AI-Powered</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Chat Messages */
          <div className="h-full overflow-y-auto chat-scroll">
            <MessageList
              messages={messages}
              isLoading={isLoading}
              onAction={onAction}
              agentStatus={agentStatus}
              onOpenDealAnalyzer={onOpenDealAnalyzer}
              bookmarks={bookmarks}
              onToggleBookmark={onToggleBookmark}
              onNavigateToReports={onNavigateToReports}
              thinking={thinking}
              completedTools={completedTools}
              userName={userName}
            />
          </div>
        )}
      </div>

      {/* Composer - Bottom with gradient fade */}
      <div className="flex-shrink-0 relative">
        {/* Gradient fade above composer */}
        <div className="absolute -top-20 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent pointer-events-none" />

        <div className="px-4 md:px-8 pb-6 pt-4">
          <div className="w-full max-w-3xl mx-auto">
            <Composer
              ref={composerRef}
              onSend={onSendMessage}
              onAttach={onAttach}
              attachment={attachment}
              onClearAttachment={onClearAttachment}
              aria-label="Chat input"
            />

            {/* Subtle disclaimer */}
            <p className="text-center text-[11px] text-white/20 mt-3">
              OmniEstate can make mistakes. Verify important information independently.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
