// FILE: src/components/desktop-shell/ChatTabView.tsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Settings, HelpCircle } from 'lucide-react';
import { MessageList } from '../chat/MessageList';
import { Composer, type ComposerRef } from '../chat/Composer';
import { AgentAvatar, type AgentStatus } from '../common/AgentAvatar';
import { PreferencesModal } from '../PreferencesModal';
import { FAQModal } from '../FAQModal';
import { Tooltip } from '../Tooltip';
import type { Message } from '../../types/chat';
import type { InvestmentStrategy } from '../../types/pnl';
import type { ThinkingState, CompletedTool } from '../../types/stream';
import { PreferenceSuggestionToast, detectPreferenceSuggestion, type PreferenceSuggestion } from '../chat/PreferenceSuggestionToast';

import { checkHealth } from '../../services/agentsApi';
import type { BookmarkedProperty } from '../../types/bookmarks';
import type { ScoutedProperty } from '../../types/backendTools';
import { useSmartSuggestions } from '../../hooks/useSmartSuggestions';
import { SuggestionChips } from '../chat/SuggestionChips';

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
  onRefresh?: (messageId: string) => void;
  onViewDetails?: (property: any) => void;
  // Cancel and error handling
  onCancel?: () => void;
  error?: string | null;
  onRetry?: () => void;
}

// Greeting variety based on time of day
const getTimeBasedGreeting = (): { title: string; tagline: string } => {
  const hour = new Date().getHours();
  const greetings = [
    { title: 'OmniEstate', tagline: 'Your AI-powered real estate intelligence' },
    { title: 'OmniEstate', tagline: 'Ready to find your next investment?' },
    { title: 'OmniEstate', tagline: "Let's analyze some deals today" },
    { title: 'OmniEstate', tagline: 'What property questions can I help with?' },
    { title: 'OmniEstate', tagline: 'Discover opportunities, backed by data' },
  ];

  // Time-based greeting
  let timeGreeting: string;
  if (hour < 12) {
    timeGreeting = 'Good morning! Ready to explore?';
  } else if (hour < 17) {
    timeGreeting = 'Good afternoon! What can I find for you?';
  } else {
    timeGreeting = 'Good evening! Time to discover deals?';
  }

  // 40% chance for time-based greeting, 60% for variety
  if (Math.random() < 0.4) {
    return { title: 'OmniEstate', tagline: timeGreeting };
  }

  // Pick from variety pool based on session (consistent within session)
  const sessionIndex = Math.floor(Date.now() / 3600000) % greetings.length;
  return greetings[sessionIndex];
};


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
  thinking,
  completedTools = [],
  onRefresh,
  onViewDetails,
  onCancel,
  error,
  onRetry,
}) => {
  const [backendStatus, setBackendStatus] = useState<'unknown' | 'up' | 'down'>('unknown');
  const [showPreferences, setShowPreferences] = useState(false);
  const [showFAQ, setShowFAQ] = useState(false);
  const [preferenceSuggestion, setPreferenceSuggestion] = useState<PreferenceSuggestion | null>(null);
  const composerRef = useRef<ComposerRef>(null);
  const lastProcessedMessageId = useRef<string | null>(null);


  const agentStatus: AgentStatus = backendStatus === 'down' ? 'offline' : backendStatus === 'unknown' ? 'unknown' : 'online';

  // Get greeting for this session (stable within session)
  const greeting = useMemo(() => getTimeBasedGreeting(), []);

  const suggestions = useSmartSuggestions({ messages, completedTools, isLoading });

  // Detect preference suggestions from new AI responses
  useEffect(() => {
    if (messages.length === 0 || isLoading) return;

    // Get the last assistant message
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role !== 'assistant' || lastMessage.id === lastProcessedMessageId.current) return;

    lastProcessedMessageId.current = lastMessage.id;

    // Find the user query that triggered this response
    const userMessages = messages.filter(m => m.role === 'user');
    const userQuery = userMessages.length > 0 ? userMessages[userMessages.length - 1].content : '';

    // Detect any preference suggestions
    const suggestion = detectPreferenceSuggestion(lastMessage.content, userQuery);
    if (suggestion) {
      setPreferenceSuggestion(suggestion);
    }
  }, [messages, isLoading]);

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

  // Handle editing a user message - puts content into composer
  const handleEdit = (content: string) => {
    composerRef.current?.setInput(content);
    composerRef.current?.focus();
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

      {/* Header Buttons - Top Right */}
      <div className="absolute top-4 right-4 z-20 flex gap-2">
        {/* FAQ Button */}
        <Tooltip content="FAQ & Help" shortcut="⌘/">
          <button
            onClick={() => setShowFAQ(true)}
            className="p-2.5 rounded-xl glass-card hover:bg-white/[0.08] transition-all duration-300 group"
            aria-label="FAQ and Help"
          >
            <HelpCircle className="w-5 h-5 text-white/70 group-hover:text-white transition-colors" />
          </button>
        </Tooltip>

        {/* Settings Button */}
        <Tooltip content="Preferences" shortcut="⌘,">
          <button
            onClick={() => setShowPreferences(true)}
            className="p-2.5 rounded-xl glass-card hover:bg-white/[0.08] transition-all duration-300 group"
            aria-label="Settings"
          >
            <Settings className="w-5 h-5 text-white/70 group-hover:text-white transition-colors" />
          </button>
        </Tooltip>


      </div>

      {/* Modals */}
      <FAQModal isOpen={showFAQ} onClose={() => setShowFAQ(false)} />
      <PreferencesModal isOpen={showPreferences} onClose={() => setShowPreferences(false)} />

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
                    {greeting.title}
                  </h1>
                  <p className="text-lg md:text-xl text-white/60 font-medium">
                    {greeting.tagline}
                  </p>
                </div>
              </div>

              {/* Quick Action Chips - Helpful for new users */}
              <SuggestionChips
                suggestions={suggestions}
                onSelect={onSendMessage}
                variant="grid"
              />

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
              onRefresh={onRefresh}
              onViewDetails={onViewDetails}
              onEdit={handleEdit}
              onCancel={onCancel}
              error={error}
              onRetry={onRetry}
              onOpenPreferences={() => setShowPreferences(true)}
            />
          </div>
        )}
      </div>

      {/* Composer - Bottom with gradient fade */}
      <div className="flex-shrink-0 relative">
        {/* Gradient fade above composer */}
        <div className="absolute -top-20 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent pointer-events-none" />

        {/* Dynamic Context Chips (Floating) */}
        {!showEmptyState && suggestions.length > 0 && (
          <div className="w-full max-w-3xl mx-auto mb-2 relative z-10">
            <SuggestionChips
              suggestions={suggestions}
              onSelect={onSendMessage}
              variant="carousel"
            />
          </div>
        )}

        <div className="px-4 md:px-8 pb-6 pt-4 relative z-20">
          <div className="w-full max-w-3xl mx-auto">
            <Composer
              ref={composerRef}
              onSend={onSendMessage}
              onAttach={onAttach}
              attachment={attachment}
              onClearAttachment={onClearAttachment}
              onOpenPreferences={() => setShowPreferences(true)}
              aria-label="Chat input"
            />

            {/* Subtle disclaimer */}
            <p className="text-center text-[11px] text-white/20 mt-3">
              OmniEstate can make mistakes. Verify important information independently.
            </p>
          </div>
        </div>
      </div>

      {/* Preference Suggestion Toast */}
      <PreferenceSuggestionToast
        suggestion={preferenceSuggestion}
        onDismiss={() => setPreferenceSuggestion(null)}
      />
    </div>
  );
};
