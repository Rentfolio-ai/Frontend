// FILE: src/components/desktop-shell/ChatTabView.tsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { usePreferencesStore } from '../../stores/preferencesStore';
import { MessageList } from '../chat/MessageList';
import { Composer, type ComposerRef } from '../chat/Composer';
import { AgentAvatar, type AgentStatus } from '../common/AgentAvatar';
import { PreferencesModal } from '../PreferencesModal';
import { ShortcutsModal } from '../ShortcutsModal';
import { FAQModal } from '../FAQModal';

import type { Message } from '../../types/chat';
import type { InvestmentStrategy } from '../../types/pnl';
import type { ThinkingState, CompletedTool } from '../../types/stream';
import { PreferenceSuggestionToast, detectPreferenceSuggestion, type PreferenceSuggestion } from '../chat/PreferenceSuggestionToast';
import { uploadFile, ingestFileToBackend } from '../../services/fileStorage';

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
  onEditMessage?: (id: string, newContent: string) => void;
  onNavigateBranch?: (messageId: string, direction: 'prev' | 'next') => void;
}

// Context-aware greeting based on user preferences and activity
const getContextAwareGreeting = (userPreferences?: any, userName?: string): { title: string; tagline: string } => {
  // console.log('[ChatTabView] getContextAwareGreeting called');
  const hour = new Date().getHours();
  const namePrefix = userName ? `${userName}, ` : '';

  // Build context-aware pool
  const contextAwareGreetings: { title: string; tagline: string }[] = [];

  // 1. Resume-based greetings (if user has recent activity)
  if (userPreferences?.last_search_city) {
    const city = userPreferences.last_search_city;
    contextAwareGreetings.push(
      { title: '', tagline: `${namePrefix}ready to continue exploring ${city}?` },
      { title: '', tagline: `${namePrefix}let's find more opportunities in ${city}` },
      { title: '', tagline: `What's next for your ${city} search${userName ? ', ' + userName : ''}?` }
    );
  }

  // 2. Strategy-based greetings
  if (userPreferences?.default_strategy) {
    const strategyNames: Record<string, string> = {
      'STR': 'short-term rental',
      'LTR': 'long-term rental',
      'FLIP': 'fix & flip'
    };
    const strategy = strategyNames[userPreferences.default_strategy] || 'investment';
    contextAwareGreetings.push(
      { title: '', tagline: `${namePrefix}find your next ${strategy} opportunity` },
      { title: '', tagline: `Analyzing ${strategy} deals just for you${userName ? ', ' + userName : ''}` }
    );
  }

  // 3. Portfolio-based greetings (if they have properties)
  if (userPreferences?.portfolio_count && userPreferences.portfolio_count > 0) {
    contextAwareGreetings.push(
      { title: '', tagline: `${namePrefix}grow your ${userPreferences.portfolio_count}-property portfolio` },
      { title: '', tagline: `${namePrefix}optimize your portfolio with data insights` }
    );
  }

  // 4. Goal-based greetings
  if (userPreferences?.goals?.includes('cash_flow')) {
    contextAwareGreetings.push(
      { title: '', tagline: `${namePrefix}find properties that maximize cash flow` },
      { title: '', tagline: `Your next cash-flowing asset awaits${userName ? ', ' + userName : ''}` }
    );
  }

  if (userPreferences?.goals?.includes('appreciation')) {
    contextAwareGreetings.push(
      { title: '', tagline: `${namePrefix}discover high-growth market opportunities` }
    );
  }

  // 5. Budget-aware greetings
  if (userPreferences?.budget_max) {
    const budget = userPreferences.budget_max;
    if (budget < 300000) {
      contextAwareGreetings.push(
        { title: '', tagline: `${namePrefix}smart deals await in your budget range` }
      );
    } else if (budget > 500000) {
      contextAwareGreetings.push(
        { title: '', tagline: `${namePrefix}premium properties matched to your criteria` }
      );
    }
  }

  // 6. Market-based greetings (if they have favorite markets)
  if (userPreferences?.favorite_markets && userPreferences.favorite_markets.length > 0) {
    const market = userPreferences.favorite_markets[Math.floor(Math.random() * userPreferences.favorite_markets.length)];
    contextAwareGreetings.push(
      { title: '', tagline: `${namePrefix}explore new listings in ${market}` },
      { title: '', tagline: `${market} market insights at your fingertips${userName ? ', ' + userName : ''}` }
    );
  }

  // Generic time-based greetings (fallback/mix-in)
  const genericGreetings = [
    { title: '', tagline: `${namePrefix}your AI-powered real estate intelligence` },
    { title: '', tagline: `${namePrefix}ready to find your next investment?` },
    { title: '', tagline: `${namePrefix}let's analyze some deals today` },
    { title: '', tagline: `What property questions can I help with${userName ? ', ' + userName : ''}?` },
    { title: '', tagline: `${namePrefix}discover opportunities, backed by data` },
    { title: '', tagline: `${namePrefix}your investment research partner` },
    { title: '', tagline: `${namePrefix}data-driven insights for smarter investing` },
    { title: '', tagline: `${namePrefix}find hidden gems in the market` },
  ];

  // Time-based personal touch
  let timeGreeting: string;
  if (hour < 12) {
    timeGreeting = userPreferences?.last_search_city
      ? `Good morning${userName ? ', ' + userName : ''}! New listings in ${userPreferences.last_search_city} are waiting`
      : `Good morning${userName ? ', ' + userName : ''}! Ready to explore?`;
  } else if (hour < 17) {
    timeGreeting = `Good afternoon${userName ? ', ' + userName : ''}! What can I find for you?`;
  } else {
    timeGreeting = `Good evening${userName ? ', ' + userName : ''}! Time to discover deals?`;
  }

  // Combine pools: 50% context-aware (if available), 30% generic, 20% time-based
  const allGreetings = [
    ...contextAwareGreetings,
    ...contextAwareGreetings, // Double weight for context-aware
    ...genericGreetings,
  ];

  const rand = Math.random();

  // 20% chance for time-based greeting with personal touch
  if (rand < 0.2) {
    return { title: '', tagline: timeGreeting };
  }

  // 80% chance: pick from combined pool (with session-based consistency)
  if (allGreetings.length > 0) {
    const sessionIndex = Math.floor(Date.now() / 3600000) % allGreetings.length;
    return allGreetings[sessionIndex];
  }

  // Ultimate fallback
  return { title: '', tagline: `${namePrefix}your AI-powered real estate intelligence` };
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

  thinking,
  completedTools = [],
  onRefresh,
  onViewDetails,
  onCancel,
  error,
  onRetry,
  onEditMessage,
  onNavigateBranch,
}) => {
  const [backendStatus, setBackendStatus] = useState<'unknown' | 'up' | 'down'>('unknown');
  const [showPreferences, setShowPreferences] = useState(false);
  const [showFAQ, setShowFAQ] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [preferenceSuggestion, setPreferenceSuggestion] = useState<PreferenceSuggestion | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const composerRef = useRef<ComposerRef>(null);
  const lastProcessedMessageId = useRef<string | null>(null);

  const prefsStore = usePreferencesStore();

  console.log('[ChatTabView] Render started', {
    isLoading,
    messagesCount: messages.length,
    attachment: !!attachment,
    isUploading
  });

  const handleSendMessage = async (text: string) => {
    if (attachment) {
      setIsUploading(true);
      try {
        // 1. Upload to Firebase
        const uploadedFile = await uploadFile(attachment, {
          chatId: 'current-thread', // TODO: Get actual thread ID
          chatTitle: 'Chat Upload',
        });

        // 2. Ingest to Backend (Classify & Index)
        await ingestFileToBackend(uploadedFile);

        // 3. Send message with context
        const messageWithContext = `${text}\n\n[Uploaded File: ${uploadedFile.fileName}]`;
        onSendMessage(messageWithContext);

        if (onClearAttachment) onClearAttachment();
      } catch (err) {
        console.error("Upload failed", err);
        // Still send text if upload fails? Or show error?
        onSendMessage(text + " (File upload failed)");
      } finally {
        setIsUploading(false);
      }
    } else {
      onSendMessage(text);
    }
  };


  const agentStatus: AgentStatus = backendStatus === 'down' ? 'offline' : backendStatus === 'unknown' ? 'unknown' : 'online';

  // Get context-aware greeting (updates when preferences change)
  const greeting = useMemo(() => {
    console.log('[ChatTabView] Calculating greeting with prefs:', {
      city: prefsStore.lastSearchCity,
      strategy: prefsStore.defaultStrategy
    });
    return getContextAwareGreeting(prefsStore, userName);
  }, [
    prefsStore.lastSearchCity,
    prefsStore.defaultStrategy,
    prefsStore.favoriteMarkets,
    prefsStore.budgetRange,
    prefsStore.financialDna,
    userName
  ]);

  const suggestions = useSmartSuggestions({ messages, completedTools, isLoading });

  // Detect preference suggestions from new AI responses
  useEffect(() => {
    console.log('[ChatTabView] Effect: Detect Preferences', {
      messagesLen: messages.length,
      isLoading,
      lastProcessed: lastProcessedMessageId.current
    });

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
      console.log('[ChatTabView] Preference suggestion found:', suggestion);
      setPreferenceSuggestion(suggestion);
    }
  }, [messages, isLoading]);

  // Check backend health
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const status = await checkHealth();
        setBackendStatus(status ? 'up' : 'down');
      } catch (error) {
        console.error('Failed to check backend:', error);
      }
    };
    checkBackend();
  }, []);

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

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey;

      if (isMod && e.key === 'k') {
        e.preventDefault();
        composerRef.current?.focus();
      }

      if (isMod && e.shiftKey && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        prefsStore.setWideMode(!prefsStore.isWideMode);
      }

      if (isMod && e.key === ',') {
        e.preventDefault();
        setShowPreferences(true);
      }

      if (isMod && e.key === '/') {
        e.preventDefault();
        setShowShortcuts(true);
      }

      if (e.key === 'Escape') {
        if (showShortcuts) setShowShortcuts(false);
        if (showPreferences) setShowPreferences(false);
        if (showFAQ) setShowFAQ(false);
        onCancel?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [prefsStore.isWideMode, prefsStore.setWideMode, showPreferences, showFAQ, showShortcuts, onCancel]);



  const showEmptyState = messages.length === 0 && !isLoading;

  return (
    <div className="h-full flex flex-col relative">


      {/* Header buttons removed per user request */}

      {/* Modals */}
      <FAQModal isOpen={showFAQ} onClose={() => setShowFAQ(false)} />
      <PreferencesModal isOpen={showPreferences} onClose={() => setShowPreferences(false)} />
      <ShortcutsModal isOpen={showShortcuts} onClose={() => setShowShortcuts(false)} />

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

                {/* Welcome Message - Subtle and flashy */}
                <div className="space-y-3">
                  <p className="text-2xl md:text-3xl font-medium bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 bg-clip-text text-transparent animate-gradient-shift">
                    {greeting.tagline}
                  </p>
                </div>
              </div>

              {/* Integrated Guidance - Plain text style like thinking state */}
              <div className="space-y-4 max-w-xl mx-auto">
                <div className="text-xs text-white/30 font-medium uppercase tracking-wider text-center mb-3">Try asking about</div>
                <div className="space-y-2">
                  {suggestions.map((suggestion, index) => {
                    const isObject = typeof suggestion !== 'string';
                    const label = isObject ? suggestion.label : suggestion;
                    const query = isObject ? suggestion.query : suggestion;
                    const icon = isObject ? suggestion.icon : null;
                    const key = isObject ? suggestion.id : index;

                    return (
                      <button
                        key={key}
                        onClick={() => handleSendMessage(query)}
                        className="group flex items-start gap-3 w-full text-left hover:opacity-80 transition-opacity"
                      >
                        <span className="text-xl flex-shrink-0 mt-0.5">{icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-white/70 group-hover:text-white/90 transition-colors text-[15px] leading-relaxed">
                            {label}
                          </div>
                          <div className="text-xs text-white/30 mt-0.5 line-clamp-1">{query}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
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
              onRefresh={onRefresh}
              onViewDetails={onViewDetails}
              onEdit={onEditMessage}
              onCancel={onCancel}
              error={error}
              onRetry={onRetry}
              onOpenPreferences={() => setShowPreferences(true)}
              isWideMode={prefsStore.isWideMode}
              onNavigateBranch={onNavigateBranch}
              onSuggestionSelect={handleSendMessage}
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
          <div className={`w-full ${prefsStore.isWideMode ? 'max-w-[95%]' : 'max-w-3xl'} mx-auto mb-2 relative z-10 transition-all duration-300`}>
            <SuggestionChips
              suggestions={suggestions}
              onSelect={handleSendMessage}
              variant="carousel"
            />
          </div>
        )}

        <div className="px-4 md:px-8 pb-6 pt-4 relative z-20">
          <div className={`w-full ${prefsStore.isWideMode ? 'max-w-[95%]' : 'max-w-2xl'} mx-auto transition-all duration-300`}>
            <Composer
              ref={composerRef}
              onSend={handleSendMessage}
              onStop={onCancel}
              onAttach={onAttach}
              attachment={attachment}
              onClearAttachment={onClearAttachment}
              onOpenPreferences={() => setShowPreferences(true)}
              aria-label="Chat input"
            />

            {/* Subtle disclaimer */}
            <p className="text-center text-[11px] text-white/20 mt-3">
              Vasthu can make mistakes. Verify important information independently.
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
