// FILE: src/components/desktop-shell/ChatTabView.tsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { usePreferencesStore } from '../../stores/preferencesStore';
import { MessageList } from '../chat/MessageList';
import { Composer, type ComposerRef } from '../chat/Composer';
import { AgentAvatar, type AgentStatus } from '../common/AgentAvatar';
import { PreferencesModalSimplified } from '../PreferencesModalSimplified';
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

import { ScrollToBottomButton } from '../chat/ScrollToBottomButton';
import { InConversationSearch } from '../chat/InConversationSearch';
import { motion, AnimatePresence } from 'framer-motion';
import { KeyboardShortcutsModal } from '../chat/KeyboardShortcutsModal';

import type { AgentMode } from '../../types/chat';


interface ChatTabViewProps {
  messages: Message[];
  isLoading: boolean;
  userName?: string;
  userAvatar?: string;
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
  chatTitle?: string;
  currentMode: AgentMode;
  onModeChange: (mode: AgentMode) => void;
}

// Context-aware greeting with tagline + subtitle for a richer welcome
const getContextAwareGreeting = (
  userPreferences?: any,
  userName?: string
): { title: string; tagline: string; subtitle: string } => {
  const hour = new Date().getHours();
  const name = userName || '';
  const n = (msg: string) => (name ? `${name}, ${msg}` : msg.charAt(0).toUpperCase() + msg.slice(1));
  const day = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date().getDay()];

  type G = { title: string; tagline: string; subtitle: string };
  const pool: G[] = [];

  // ── Contextual greetings based on user data ──

  if (userPreferences?.last_search_city) {
    const city = userPreferences.last_search_city;
    pool.push(
      { title: '', tagline: n(`new listings just dropped in ${city}`), subtitle: 'I\'ve been watching the market while you were away.' },
      { title: '', tagline: n(`${city} is moving — want the latest?`), subtitle: 'Median prices shifted since your last search.' },
      { title: '', tagline: `Back to ${city}${name ? ', ' + name : ''}?`, subtitle: 'Pick up right where you left off, or explore something new.' },
      { title: '', tagline: n(`let's dig deeper into ${city}`), subtitle: 'I can pull comps, analyze neighborhoods, or scout new deals.' },
    );
  }

  if (userPreferences?.default_strategy) {
    const strats: Record<string, string> = { STR: 'short-term rental', LTR: 'long-term rental', FLIP: 'fix & flip' };
    const s = strats[userPreferences.default_strategy] || 'investment';
    pool.push(
      { title: '', tagline: n(`let's find your next ${s} win`), subtitle: 'Tell me a market and I\'ll run the numbers.' },
      { title: '', tagline: n(`${s} deals are heating up`), subtitle: 'Ask me to scout any zip code or neighborhood.' },
    );
  }

  if (userPreferences?.portfolio_count && userPreferences.portfolio_count > 0) {
    const ct = userPreferences.portfolio_count;
    pool.push(
      { title: '', tagline: n(`time to turn ${ct} properties into ${ct + 1}?`), subtitle: 'I can find deals that complement your existing portfolio.' },
      { title: '', tagline: n(`your ${ct}-door portfolio is growing`), subtitle: 'Want a performance check or new acquisition targets?' },
    );
  }

  if (userPreferences?.favorite_markets?.length > 0) {
    const mkt = userPreferences.favorite_markets[Math.floor(Math.random() * userPreferences.favorite_markets.length)];
    pool.push(
      { title: '', tagline: n(`${mkt} market pulse — ready when you are`), subtitle: 'I\'ll break down trends, comps, and off-market intel.' },
      { title: '', tagline: `What's happening in ${mkt}${name ? ', ' + name : ''}?`, subtitle: 'I track price shifts, days on market, and inventory changes daily.' },
    );
  }

  if (userPreferences?.goals?.includes('cash_flow')) {
    pool.push(
      { title: '', tagline: n(`cash flow is king — let's find yours`), subtitle: 'I analyze rent-to-price ratios across every market I cover.' },
    );
  }

  if (userPreferences?.goals?.includes('appreciation')) {
    pool.push(
      { title: '', tagline: n(`growth markets are shifting fast`), subtitle: 'Ask me which neighborhoods are trending before they peak.' },
    );
  }

  // ── Time-of-day greetings with personality ──

  const timeGreetings: G[] = [];
  if (hour >= 5 && hour < 12) {
    timeGreetings.push(
      { title: '', tagline: `Good morning${name ? ', ' + name : ''} — the early investor gets the deal`, subtitle: 'New listings from overnight are ready for analysis.' },
      { title: '', tagline: `Morning${name ? ', ' + name : ''}. Coffee and cap rates?`, subtitle: 'Tell me a city and I\'ll pull the best opportunities.' },
      { title: '', tagline: `Rise and grind${name ? ', ' + name : ''} — markets are open`, subtitle: 'What neighborhood should we scout today?' },
    );
  } else if (hour >= 12 && hour < 17) {
    timeGreetings.push(
      { title: '', tagline: `Afternoon${name ? ', ' + name : ''}. Let's make moves`, subtitle: 'I\'m ready to analyze deals, compare properties, or scout markets.' },
      { title: '', tagline: `Happy ${day}${name ? ', ' + name : ''} — what are we building today?`, subtitle: 'Ask me anything about real estate investing.' },
      { title: '', tagline: `${name ? name + ', t' : 'T'}he market doesn't take lunch breaks`, subtitle: 'Neither do I. What can I research for you?' },
    );
  } else if (hour >= 17 && hour < 21) {
    timeGreetings.push(
      { title: '', tagline: `Evening${name ? ', ' + name : ''}. Prime time for deal hunting`, subtitle: 'Sellers often update listings after business hours.' },
      { title: '', tagline: `Wind down with some market research${name ? ', ' + name : ''}?`, subtitle: 'I can run numbers while you relax.' },
      { title: '', tagline: `${name ? name + ', l' : 'L'}et's end the day with a smart find`, subtitle: 'Tell me your criteria and I\'ll do the heavy lifting.' },
    );
  } else {
    timeGreetings.push(
      { title: '', tagline: `Burning the midnight oil${name ? ', ' + name : ''}?`, subtitle: 'Late-night research sessions build empires. How can I help?' },
      { title: '', tagline: `Night owl mode${name ? ', ' + name : ''} — let's find something good`, subtitle: 'Less competition at this hour. What market interests you?' },
    );
  }

  // ── Generic greetings — engaging, not boring ──

  const genericGreetings: G[] = [
    { title: '', tagline: n('what deal are we chasing today?'), subtitle: 'Search a city, analyze a property, or compare investments.' },
    { title: '', tagline: n('your real estate research starts here'), subtitle: 'I crunch numbers, scout markets, and find what others miss.' },
    { title: '', tagline: n('tell me a market and I\'ll tell you the truth'), subtitle: 'No fluff — just data, comps, and honest analysis.' },
    { title: '', tagline: n('let\'s turn data into deals'), subtitle: 'Ask me to scout properties, run P&L, or analyze any neighborhood.' },
    { title: '', tagline: n('every great portfolio starts with a question'), subtitle: 'What\'s on your mind? I can search, analyze, or compare.' },
    { title: '', tagline: n('the smartest investors ask the most questions'), subtitle: 'I\'m here to answer all of them. Fire away.' },
    { title: '', tagline: n('ready to outsmart the market?'), subtitle: 'I analyze thousands of listings so you don\'t have to.' },
    { title: '', tagline: n('think of me as your deal analyst on speed dial'), subtitle: 'Comps, cap rates, cash flow — just ask.' },
    { title: '', tagline: n('where should we invest next?'), subtitle: 'Give me a city, budget, or strategy and I\'ll get to work.' },
    { title: '', tagline: n('your unfair advantage in real estate'), subtitle: 'AI-powered research that would take humans weeks.' },
    { title: '', tagline: n('from market scan to offer — I\'ve got you'), subtitle: 'Scout, analyze, compare, report. What\'s first?' },
    { title: '', tagline: n('let\'s find the deal everyone else is missing'), subtitle: 'I dig through data that most investors never see.' },
  ];

  // ── Selection logic ──
  // Combine: 2x context-aware, 1x time, 1x generic
  const all: G[] = [
    ...pool, ...pool,
    ...timeGreetings,
    ...genericGreetings,
  ];

  if (all.length === 0) {
    return { title: '', tagline: n('your real estate intelligence platform'), subtitle: 'Ask me anything about property investing.' };
  }

  // Session-stable pick (changes roughly every hour)
  const idx = Math.floor(Date.now() / 3600000) % all.length;
  return all[idx];
};

export const ChatTabView: React.FC<ChatTabViewProps> = ({
  messages,
  isLoading,
  userName,
  userAvatar,
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
  chatTitle,
  currentMode,
  onModeChange
}) => {
  const [backendStatus, setBackendStatus] = useState<'unknown' | 'up' | 'down'>('unknown');
  const [showPreferences, setShowPreferences] = useState(false);

  const [showFAQ, setShowFAQ] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [showInConvoSearch, setShowInConvoSearch] = useState(false);
  const [preferenceSuggestion, setPreferenceSuggestion] = useState<PreferenceSuggestion | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showSuggestionChips, setShowSuggestionChips] = useState(true);
  const composerRef = useRef<ComposerRef>(null);
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const lastProcessedMessageId = useRef<string | null>(null);

  const prefsStore = usePreferencesStore();
  const showEmptyState = messages.length === 0 && !isLoading;

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

  const suggestions = useSmartSuggestions({ messages, completedTools, isLoading, mode: currentMode });

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

      // Cmd+K - Focus composer
      if (isMod && e.key === 'k') {
        e.preventDefault();
        composerRef.current?.focus();
      }

      // Cmd+F - Search in conversation
      if (isMod && e.key === 'f') {
        e.preventDefault();
        setShowInConvoSearch(true);
      }

      // Cmd+Shift+F - Toggle wide mode
      if (isMod && e.shiftKey && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        prefsStore.setWideMode(!prefsStore.isWideMode);
      }

      // Cmd+, - Open preferences
      if (isMod && e.key === ',') {
        e.preventDefault();
        setShowPreferences(true);
      }

      // Cmd+/ - Show keyboard shortcuts
      if (isMod && e.key === '/') {
        e.preventDefault();
        setShowKeyboardShortcuts(true);
      }

      // Escape - Close modals
      if (e.key === 'Escape') {
        if (showKeyboardShortcuts) setShowKeyboardShortcuts(false);
        if (showInConvoSearch) setShowInConvoSearch(false);
        if (showShortcuts) setShowShortcuts(false);
        if (showPreferences) setShowPreferences(false);
        if (showFAQ) setShowFAQ(false);
        onCancel?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [prefsStore.isWideMode, prefsStore.setWideMode, showPreferences, showFAQ, showShortcuts, showKeyboardShortcuts, showInConvoSearch, onCancel]);




  // Handler for search navigation
  const handleNavigateToSearchMatch = (messageId: string) => {
    const messageElement = document.getElementById(`message-${messageId}`);
    if (messageElement) {
      messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      messageElement.classList.add('message-jump-highlight');
      setTimeout(() => {
        messageElement.classList.remove('message-jump-highlight');
      }, 2000);
    }
  };




  return (
    <div className="h-full flex flex-col relative">





      {/* Header buttons removed per user request */}

      {/* Modals */}
      <FAQModal isOpen={showFAQ} onClose={() => setShowFAQ(false)} />
      <PreferencesModalSimplified isOpen={showPreferences} onClose={() => setShowPreferences(false)} />
      <ShortcutsModal isOpen={showShortcuts} onClose={() => setShowShortcuts(false)} />
      <KeyboardShortcutsModal isOpen={showKeyboardShortcuts} onClose={() => setShowKeyboardShortcuts(false)} />

      {/* Messages or Empty State */}
      <div className="flex-1 overflow-hidden">
        {showEmptyState ? (
          /* Notion-style: Avatar + Greeting + Composer + Cards below */
          <div className="h-full flex flex-col items-center justify-center px-4 py-6">
            <div className="w-full max-w-[680px] mx-auto space-y-5">
              {/* Avatar + Greeting */}
              <div className="text-center space-y-3">
                <div className="relative inline-block">
                  <AgentAvatar size="lg" className="relative" status={agentStatus} />
                </div>
                <div className="space-y-1.5 px-4">
                  <h1 className="text-[22px] md:text-[26px] font-semibold text-white/95 tracking-tight leading-snug">
                    {greeting.tagline}
                  </h1>
                  {greeting.subtitle && (
                    <p className="text-[13px] text-white/40 font-normal leading-relaxed max-w-md mx-auto">
                      {greeting.subtitle}
                    </p>
                  )}
                </div>
              </div>

              {/* Composer - Main focus */}
              <div className="w-full">
                <Composer
                  ref={composerRef}
                  onSend={handleSendMessage}
                  onStop={onCancel}
                  onAttach={onAttach}
                  attachment={attachment}
                  onClearAttachment={onClearAttachment}
                  onOpenPreferences={() => setShowPreferences(true)}
                  aria-label="Chat input"
                  currentMode={currentMode}
                  onModeChange={onModeChange}
                />
              </div>

              {/* Suggestion Chips - Pill Shaped */}
              {showSuggestionChips && (
                <div className="animate-in fade-in duration-200">
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    {suggestions.slice(0, 3).map((suggestion, index) => {
                      const isObject = typeof suggestion !== 'string';
                      const label = isObject ? suggestion.label : suggestion;
                      const query = isObject ? suggestion.query : suggestion;
                      const key = isObject ? suggestion.id : index;

                      // Icons that match your app's features
                      const chipIcons = ['🏠', '📈', '📋', '🎯'];
                      const icon = chipIcons[index % 4];

                      return (
                        <button
                          key={key}
                          onClick={() => handleSendMessage(query)}
                          className="group flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] hover:border-white/[0.12] transition-all duration-200"
                        >
                          <span className="text-[10px] opacity-60 group-hover:opacity-90 transition-opacity">{icon}</span>
                          <span className="text-[10px] text-white/50 group-hover:text-white/80 font-medium leading-none">{label}</span>
                        </button>
                      );
                    })}
                    {/* Close button for suggestions */}
                    <button
                      onClick={() => setShowSuggestionChips(false)}
                      className="flex items-center justify-center w-5 h-5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] hover:border-white/[0.12] text-white/25 hover:text-white/60 transition-all"
                      title="Hide suggestions"
                    >
                      <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Chat Messages - Compact centered */
          <div ref={messageContainerRef} className="h-full overflow-y-auto chat-scroll relative">
            <div className="max-w-[800px] mx-auto px-4">
              {/* In-Conversation Search */}
              <InConversationSearch
                isOpen={showInConvoSearch}
                onClose={() => setShowInConvoSearch(false)}
                messages={messages}
                onNavigateToMatch={handleNavigateToSearchMatch}
              />

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
                userAvatar={userAvatar}
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

              {/* Scroll to Bottom Button */}
              <ScrollToBottomButton containerRef={messageContainerRef} />
            </div>
          </div>
        )}
      </div>

      {/* Composer - Only show when NOT empty state */}
      {!showEmptyState && (
        <div className="flex-shrink-0 relative">


          <div className="px-4 md:px-6 pb-4 pt-3 relative z-20">
            <div className={`w-full ${prefsStore.isWideMode ? 'max-w-3xl' : 'max-w-[680px]'} mx-auto transition-all duration-200`}>
              <Composer
                ref={composerRef}
                onSend={handleSendMessage}
                onStop={onCancel}
                onAttach={onAttach}
                attachment={attachment}
                onClearAttachment={onClearAttachment}
                onOpenPreferences={() => setShowPreferences(true)}
                aria-label="Chat input"
                currentMode={currentMode}
                onModeChange={onModeChange}
              />

              {/* Minimal disclaimer */}
              <p className="text-center text-[10.5px] text-white/25 mt-2.5">
                Vasthu can make mistakes. Verify important information.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Preference Suggestion Toast */}
      <PreferenceSuggestionToast
        suggestion={preferenceSuggestion}
        onDismiss={() => setPreferenceSuggestion(null)}
      />
    </div>
  );
};
