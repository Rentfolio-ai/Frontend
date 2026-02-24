// FILE: src/components/desktop-shell/ChatTabView.tsx
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { usePreferencesStore } from '../../stores/preferencesStore';
import { MessageList } from '../chat/MessageList';
import { Composer, type ComposerRef } from '../chat/Composer';
import { AgentAvatar, type AgentStatus } from '../common/AgentAvatar';
import { ShortcutsModal } from '../ShortcutsModal';
import { FAQModal } from '../FAQModal';


import type { Message, AgentMode } from '../../types/chat';
import type { InvestmentStrategy } from '../../types/pnl';
import { AVAILABLE_MODELS, modelSupportsThinking } from '../../constants/models';
import type { ThinkingState, CompletedTool } from '../../types/stream';
import type { ThinkingStep } from '@/hooks/useThinkingQueue';
import { PreferenceSuggestionToast, detectPreferenceSuggestion, type PreferenceSuggestion } from '../chat/PreferenceSuggestionToast';
import { uploadFile, ingestFileToBackend } from '../../services/fileStorage';

import { checkHealth } from '../../services/agentsApi';
import { useSubscription } from '../../hooks/useSubscription';
import { useTokenUsage } from '../../hooks/useTokenUsage';
import { useAuth } from '../../contexts/AuthContext';
import type { BookmarkedProperty } from '../../types/bookmarks';
import type { ScoutedProperty } from '../../types/backendTools';
import { useSmartSuggestions } from '../../hooks/useSmartSuggestions';

import { ScrollToBottomButton } from '../chat/ScrollToBottomButton';
import { InConversationSearch } from '../chat/InConversationSearch';
import { KeyboardShortcutsModal } from '../chat/KeyboardShortcutsModal';
import { InlineContextBanner, type BannerAction } from '../chat/InlineContextBanner';
import { VoiceChatBar } from '../voice/VoiceChatBar';
import { VoiceWaveform } from '../voice/VoiceWaveform';
import { PersonaPickerModal } from '../voice/PersonaPickerModal';
import { useVoiceSession } from '../../hooks/useVoiceSession';
import { getPersonaById, type VoicePersona } from '../../config/voicePersonas';


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
  onNavigateToInvestmentPreferences?: () => void;
  onNavigateToUpgrade?: () => void;
  onOpenSidebar?: () => void;
  onNewChat?: () => void;
  onRecalculate?: (property: any, params: any) => Promise<any>;
  // Thinking state
  thinking?: ThinkingState | null;
  completedTools?: CompletedTool[];
  // Thinking steps (ChatGPT-style collapsible thinking)
  thinkingSteps?: ThinkingStep[];
  thinkingIsActive?: boolean;
  thinkingIsDone?: boolean;
  thinkingElapsed?: number;
  nativeThinkingText?: string | null;
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
  selectedModel?: string;
  onModelChange?: (modelId: string) => void;
  // Voice mode
  onVoiceTurn?: (role: 'user' | 'assistant', content: string) => void;
  onVoiceStart?: () => void;
  conversationId?: string;
  onOpenIntegrations?: () => void;
  onSendComplete?: (summary: string) => void;
  // Temporary chat (not saved to history)
  isTemporary?: boolean;
  onToggleTemporary?: () => void;
  onBuyTokenPack?: () => void;
}

// Extract entities from recent conversation messages
function extractConversationContext(messages: Message[]): {
  cities: string[];
  categories: string[];
  propertyTypes: string[];
  professionals: string[];
} {
  const recent = messages.slice(-10);
  const text = recent
    .map(m => (m.role === 'user' || m.role === 'assistant') ? (m.content || '') : '')
    .join(' ');

  const cityStateRe = /\b([A-Z][a-z]+(?:\s[A-Z][a-z]+)*),\s*([A-Z]{2})\b/g;
  const cities = new Set<string>();
  let match;
  while ((match = cityStateRe.exec(text)) !== null) {
    cities.add(`${match[1]}, ${match[2]}`);
  }

  const catKeywords: Record<string, string> = {
    'real estate agent': 'agents', 'realtor': 'agents', 'agent': 'agents',
    'lender': 'lenders', 'mortgage': 'lenders', 'loan': 'lenders',
    'contractor': 'contractors', 'builder': 'contractors',
    'property manager': 'managers', 'inspector': 'inspectors',
  };
  const categories = new Set<string>();
  const lower = text.toLowerCase();
  for (const [kw, cat] of Object.entries(catKeywords)) {
    if (lower.includes(kw)) categories.add(cat);
  }

  const propTypes = new Set<string>();
  const propKeywords = ['multifamily', 'single family', 'condo', 'townhouse', 'STR', 'short-term rental', 'duplex', 'triplex', 'fourplex'];
  for (const kw of propKeywords) {
    if (lower.includes(kw.toLowerCase())) propTypes.add(kw);
  }

  const profNameRe = /(?:email|text|message|contact|reach out to)\s+([A-Z][a-z]+(?:\s[A-Z][a-z]+)?)/g;
  const professionals = new Set<string>();
  while ((match = profNameRe.exec(text)) !== null) {
    professionals.add(match[1]);
  }

  return {
    cities: Array.from(cities),
    categories: Array.from(categories),
    propertyTypes: Array.from(propTypes),
    professionals: Array.from(professionals),
  };
}

// Context-aware greeting with tagline + subtitle for a richer welcome
const getContextAwareGreeting = (
  userPreferences?: any,
  userName?: string,
  conversationContext?: ReturnType<typeof extractConversationContext>,
): { title: string; tagline: string; subtitle: string } => {
  const hour = new Date().getHours();
  const name = userName?.split(' ')[0] || '';
  const n = (msg: string) => (name ? `${name}, ${msg}` : msg.charAt(0).toUpperCase() + msg.slice(1));
  const day = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date().getDay()];

  type G = { title: string; tagline: string; subtitle: string };
  const pool: G[] = [];

  // ── Conversation-derived taglines (highest priority, 3x weight) ──
  const convPool: G[] = [];
  if (conversationContext) {
    const { cities, categories, propertyTypes, professionals } = conversationContext;
    if (cities.length > 0) {
      const city = cities[0];
      convPool.push(
        { title: '', tagline: `Properties in ${city}`, subtitle: 'Continuing where you left off.' },
        { title: '', tagline: `Still exploring ${city}?`, subtitle: 'I can pull fresh listings or run new analysis.' },
        { title: '', tagline: `Back to ${city} — what's next?`, subtitle: 'More deals, deeper analysis, or new neighborhoods.' },
      );
    }
    if (professionals.length > 0) {
      const prof = professionals[0];
      convPool.push(
        { title: '', tagline: `Following up with ${prof}?`, subtitle: 'I can draft a message or check for replies.' },
        { title: '', tagline: `More deals through ${prof}?`, subtitle: 'Want to reach out again or explore other contacts?' },
      );
    }
    if (propertyTypes.length > 0) {
      const pt = propertyTypes[0];
      convPool.push(
        { title: '', tagline: `That ${pt.toLowerCase()} deal — want to dig deeper?`, subtitle: 'I can run numbers, pull comps, or find similar properties.' },
      );
    }
    if (categories.length > 0) {
      const cat = categories[0];
      convPool.push(
        { title: '', tagline: `Need more ${cat}?`, subtitle: 'I can search the marketplace for top-rated professionals.' },
      );
    }
  }

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
  // Combine: 3x conversation context (highest priority), 2x preference context, 1x time, 1x generic
  const all: G[] = [
    ...convPool, ...convPool, ...convPool,
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
  onNavigateToInvestmentPreferences,
  onNavigateToUpgrade,

  thinking,
  completedTools = [],
  thinkingSteps,
  thinkingIsActive,
  thinkingIsDone,
  thinkingElapsed,
  nativeThinkingText,
  onRefresh,
  onViewDetails,
  onCancel,
  error,
  onRetry,
  onEditMessage,
  onNavigateBranch,
  currentMode,
  onModeChange,
  selectedModel,
  onModelChange,
  onVoiceTurn,
  onVoiceStart,
  conversationId,
  onRecalculate,
  onOpenIntegrations,
  onSendComplete,
  isTemporary,
  onToggleTemporary,
  onBuyTokenPack,
}) => {
  const [backendStatus, setBackendStatus] = useState<'unknown' | 'up' | 'down'>('unknown');
  const [showFAQ, setShowFAQ] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [showInConvoSearch, setShowInConvoSearch] = useState(false);
  const [preferenceSuggestion, setPreferenceSuggestion] = useState<PreferenceSuggestion | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showSuggestionChips, setShowSuggestionChips] = useState(true);
  const [contextBanner, setContextBanner] = useState<{ message: string; actions: BannerAction[] } | null>(null);
  const lastBannerMessageId = useRef<string | null>(null);
  const [voiceActive, setVoiceActive] = useState(false);
  const [showPersonaPicker, setShowPersonaPicker] = useState(false);
  const savedPersonaId = usePreferencesStore(s => s.voicePersona);
  const setVoicePersonaPref = usePreferencesStore(s => s.setVoicePersona);
  const composerRef = useRef<ComposerRef>(null);
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const lastProcessedMessageId = useRef<string | null>(null);

  const prefsStore = usePreferencesStore();
  const { isPro, isFree } = useSubscription();
  const { user: authUser } = useAuth();

  // Token usage metering
  const tier = isPro ? 'pro' : 'free';
  const { usage: tokenUsage, isNearLimit: isNearTokenLimit, isExhausted: isTokenExhausted } = useTokenUsage(authUser?.id || '', tier);

  const showEmptyState = messages.length === 0 && !isLoading && !voiceActive;

  // Voice session hook — manages Gemini Live connection, audio, camera, turns
  const voiceSession = useVoiceSession({
    conversationId,
    onTurn: onVoiceTurn,
  });

  // Streaming voice partials — cleaned for display
  const voiceUserPartial = useMemo(() => {
    if (!voiceActive) return '';
    return voiceSession.partialUserTranscript
      .trim()
      .replace(/^[.,;:!?\s]+/, '')
      .replace(/\s{2,}/g, ' ')
      .trim();
  }, [voiceActive, voiceSession.partialUserTranscript]);

  const voiceAIPartial = useMemo(() => {
    if (!voiceActive) return '';
    return voiceSession.partialTranscript.trim();
  }, [voiceActive, voiceSession.partialTranscript]);

  // Auto-scroll when voice partials update (smooth)
  useEffect(() => {
    if ((voiceUserPartial || voiceAIPartial) && messageContainerRef.current) {
      const el = messageContainerRef.current;
      // Only auto-scroll if user is near the bottom (within 150px)
      const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 150;
      if (isNearBottom) {
        requestAnimationFrame(() => {
          el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
        });
      }
    }
  }, [voiceUserPartial, voiceAIPartial]);

  console.log('[ChatTabView] Render started', {
    isLoading,
    messagesCount: messages.length,
    attachment: !!attachment,
    isUploading
  });

  // Voice activation: show persona picker (or auto-connect with saved persona)
  const handleVoiceActivate = useCallback(() => {
    onVoiceStart?.();
    // If user has a saved persona, skip the picker and connect directly
    if (savedPersonaId) {
      const persona = getPersonaById(savedPersonaId);
      setVoiceActive(true);
      voiceSession.connect(persona);
      setVoicePersonaPref(persona.id);
    } else {
      setShowPersonaPicker(true);
    }
  }, [onVoiceStart, savedPersonaId, voiceSession, setVoicePersonaPref]);

  // Handle persona selection from the picker modal
  const handlePersonaSelect = useCallback((persona: VoicePersona) => {
    setShowPersonaPicker(false);
    setVoiceActive(true);
    setVoicePersonaPref(persona.id);
    voiceSession.connect(persona);
  }, [voiceSession, setVoicePersonaPref]);

  // End voice session
  const handleVoiceEnd = useCallback(() => {
    voiceSession.disconnect();
    setVoiceActive(false);
  }, [voiceSession]);

  // Change persona mid-session
  const handleChangePersona = useCallback(() => {
    voiceSession.disconnect();
    setShowPersonaPicker(true);
  }, [voiceSession]);

  const handleSendMessage = async (text: string) => {
    // Auto-dismiss context banner on any user message
    setContextBanner(null);
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


  // Handle AI-suggested mode switch: switch mode and optionally re-send the query
  const handleModeSwitch = useCallback((mode: string, autoQuery?: string) => {
    onModeChange(mode as AgentMode);
    // Auto-send the query in the new mode after a short delay (so mode state updates first)
    if (autoQuery) {
      setTimeout(() => onSendMessage(autoQuery), 300);
    }
  }, [onModeChange, onSendMessage]);

  const agentStatus: AgentStatus = backendStatus === 'down' ? 'offline' : backendStatus === 'unknown' ? 'unknown' : 'online';

  // Extract conversation context for adaptive taglines and composer placeholders
  const conversationContext = useMemo(
    () => extractConversationContext(messages),
    [messages.length],
  );

  // Generate dynamic placeholders from conversation context
  const contextPlaceholders = useMemo(() => {
    const ph: string[] = [];
    const { cities, categories, propertyTypes } = conversationContext;
    if (cities.length > 0) {
      ph.push(`More properties in ${cities[0]}...`);
      ph.push(`Email another agent in ${cities[0]}...`);
      ph.push(`Analyze a deal in ${cities[0]}...`);
    }
    if (propertyTypes.length > 0) {
      ph.push(`Find more ${propertyTypes[0].toLowerCase()} deals...`);
    }
    if (categories.length > 0) {
      ph.push(`Search for top ${categories[0]}...`);
    }
    return ph;
  }, [conversationContext]);

  // Get context-aware greeting (updates when preferences or messages change)
  const greeting = useMemo(() => {
    return getContextAwareGreeting(prefsStore, userName, conversationContext);
  }, [
    prefsStore.lastSearchCity,
    prefsStore.defaultStrategy,
    prefsStore.favoriteMarkets,
    prefsStore.budgetRange,
    prefsStore.financialDna,
    userName,
    conversationContext,
  ]);

  const { suggestions, trackClick } = useSmartSuggestions({ messages, completedTools, isLoading, mode: currentMode });

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

  // Detect contextual inline action banners after assistant messages
  useEffect(() => {
    if (messages.length === 0 || isLoading) return;
    const lastMsg = messages[messages.length - 1];
    if (lastMsg.role !== 'assistant' || lastMsg.id === lastBannerMessageId.current) return;
    lastBannerMessageId.current = lastMsg.id;

    const content = (lastMsg.content || '').toLowerCase();
    const turnCount = messages.filter(m => m.role === 'user').length;
    const toolNames = completedTools.map(t => (typeof t === 'string' ? t : t.tool || '').toLowerCase());

    // Only show one banner at a time — first match wins
    // 1. Mode mismatch: research-heavy content while in hunter mode
    const researchKeywords = ['explain', 'trends', 'compare markets', 'education', 'market overview', 'outlook', 'median', 'growth rate', 'historical'];
    const isResearchContent = researchKeywords.filter(kw => content.includes(kw)).length >= 2;
    if (currentMode === 'hunter' && isResearchContent) {
      setContextBanner({
        message: 'This looks like a deep research question.',
        actions: [
          { label: 'Switch to Research', primary: true, onClick: () => { onModeChange('research' as AgentMode); setContextBanner(null); } },
        ],
      });
      return;
    }

    // 2. Report opportunity: deal analysis or property search completed
    const hasAnalysisTool = toolNames.some(t => t.includes('analysis') || t.includes('deal') || t.includes('pnl') || t.includes('underwrite'));
    const hasPropertyTool = toolNames.some(t => t.includes('search') || t.includes('property') || t.includes('scout'));
    if (hasAnalysisTool || (hasPropertyTool && content.includes('found'))) {
      setContextBanner({
        message: hasAnalysisTool ? 'Analysis complete.' : 'Properties found.',
        actions: [
          { label: 'Generate Report', primary: true, onClick: () => { onSendMessage('Generate a detailed report for this analysis'); setContextBanner(null); } },
          ...(hasPropertyTool && !hasAnalysisTool ? [{ label: 'Analyze top property', onClick: () => { onSendMessage('Analyze the top property from these results'); setContextBanner(null); } }] : []),
        ],
      });
      return;
    }

    // 3. Strategy depth: 6+ user turns with financial analysis → suggest strategist
    const financialKeywords = ['roi', 'cash flow', 'cap rate', 'portfolio', 'irr', 'leverage', 'equity'];
    const isFinancialContent = financialKeywords.some(kw => content.includes(kw));
    if (turnCount >= 6 && isFinancialContent && currentMode !== 'strategist') {
      setContextBanner({
        message: 'This conversation has portfolio-level depth.',
        actions: [
          { label: 'Switch to Strategist', primary: true, onClick: () => { onModeChange('strategist' as AgentMode); setContextBanner(null); } },
        ],
      });
      return;
    }

    // 4. Action prompt: properties found but no follow-up after 2+ messages
    if (hasPropertyTool && turnCount >= 2) {
      const lastTwoUserMsgs = messages.filter(m => m.role === 'user').slice(-2);
      const hasFollowUp = lastTwoUserMsgs.some(m =>
        ['analyze', 'compare', 'report', 'detail'].some(kw => (m.content || '').toLowerCase().includes(kw))
      );
      if (!hasFollowUp) {
        setContextBanner({
          message: 'Properties were found. Want to go deeper?',
          actions: [
            { label: 'Compare these deals', primary: true, onClick: () => { onSendMessage('Compare these properties side by side'); setContextBanner(null); } },
            { label: 'Analyze top pick', onClick: () => { onSendMessage('Analyze the best property from the search results'); setContextBanner(null); } },
          ],
        });
        return;
      }
    }
  }, [messages, isLoading, currentMode, completedTools, onModeChange, onSendMessage]);

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
        onNavigateToInvestmentPreferences?.();
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
        if (showFAQ) setShowFAQ(false);
        onCancel?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [prefsStore.isWideMode, prefsStore.setWideMode, showFAQ, showShortcuts, showKeyboardShortcuts, showInConvoSearch, onCancel, onNavigateToInvestmentPreferences]);




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
    <div className="h-full flex flex-col relative max-w-[48rem] mx-auto w-full">





      {/* Header buttons removed per user request */}

      {/* Modals */}
      <FAQModal isOpen={showFAQ} onClose={() => setShowFAQ(false)} />
      <ShortcutsModal isOpen={showShortcuts} onClose={() => setShowShortcuts(false)} />
      <KeyboardShortcutsModal isOpen={showKeyboardShortcuts} onClose={() => setShowKeyboardShortcuts(false)} />

      {/* Messages or Empty State */}
      <div className="flex-1 overflow-hidden">
        {showEmptyState ? (
          /* Notion-style: Avatar + Greeting + Composer + Cards below */
          <div className="h-full flex flex-col items-center justify-center px-4 py-6 chat-gradient-bg">
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
                  onOpenPreferences={() => onNavigateToInvestmentPreferences?.()}
                  onOpenIntegrations={onOpenIntegrations}
                  aria-label="Chat input"
                  currentMode={currentMode}
                  onModeChange={onModeChange}
                  selectedModel={selectedModel}
                  onModelChange={onModelChange}
                  availableModels={AVAILABLE_MODELS.map(m => ({ ...m, accessible: m.tier === 'free' || isPro }))}
                  voiceActive={voiceActive}
                  onVoiceActivate={handleVoiceActivate}
                  isPro={isPro}
                  onUpgradePrompt={onNavigateToUpgrade}
                  contextPlaceholders={contextPlaceholders}
                  tokenUsage={tokenUsage}
                  isNearTokenLimit={isNearTokenLimit}
                  isTokenExhausted={isTokenExhausted}
                  onTokenUpgrade={onNavigateToUpgrade}
                  onBuyTokenPack={onBuyTokenPack}
                />
                {/* Temporary toggle + disclaimer */}
                <div className="flex items-center justify-center gap-3 mt-2">
                  {onToggleTemporary && (
                    <button
                      type="button"
                      onClick={onToggleTemporary}
                      className={`flex items-center gap-1.5 text-[10.5px] transition-colors ${
                        isTemporary
                          ? 'text-amber-400/70 hover:text-amber-400'
                          : 'text-white/20 hover:text-white/40'
                      }`}
                      title={isTemporary ? 'Chat won\'t be saved. Click to disable.' : 'Enable temporary chat (not saved to history)'}
                    >
                      <span className={`inline-block w-5 h-2.5 rounded-full relative transition-colors ${
                        isTemporary ? 'bg-amber-400/30' : 'bg-white/[0.08]'
                      }`}>
                        <span className={`absolute top-0.5 w-1.5 h-1.5 rounded-full transition-all ${
                          isTemporary ? 'right-0.5 bg-amber-400' : 'left-0.5 bg-white/30'
                        }`} />
                      </span>
                      <span>Temporary</span>
                    </button>
                  )}
                  <p className="text-[10.5px] text-white/25">
                    Vasthu can make mistakes. Verify important information.
                  </p>
                </div>
              </div>

              {/* Suggestion Chips - Pill Shaped */}
              {showSuggestionChips && (
                <div className="animate-in fade-in duration-200">
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    {suggestions.slice(0, 3).map((suggestion, index) => {
                      const chipFallbackIcons = ['🏠', '📈', '📋', '🎯'];
                      const label = suggestion.label;
                      const query = suggestion.query;
                      const key = suggestion.id || index;
                      const icon = suggestion.icon || chipFallbackIcons[index % 4];

                      return (
                        <button
                          key={key}
                          onClick={() => {
                            trackClick(suggestion);
                            // Switch mode if chip targets a different mode
                            if (suggestion.target_mode && suggestion.target_mode !== currentMode) {
                              onModeChange(suggestion.target_mode as AgentMode);
                              setTimeout(() => handleSendMessage(query), 300);
                            } else {
                              handleSendMessage(query);
                            }
                          }}
                          className="group flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] hover:border-white/[0.12] transition-all duration-200"
                        >
                          <span className="text-xs opacity-60 group-hover:opacity-90 transition-opacity">{icon}</span>
                          <span className="text-[12px] text-white/50 group-hover:text-white/80 font-medium leading-none">{label}</span>
                        </button>
                      );
                    })}
                    {/* Close button for suggestions */}
                    <button
                      onClick={() => setShowSuggestionChips(false)}
                      className="flex items-center justify-center w-6 h-6 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] hover:border-white/[0.12] text-white/25 hover:text-white/60 transition-all"
                      title="Hide suggestions"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          <div ref={messageContainerRef} className="h-full overflow-y-auto overflow-x-hidden chat-scroll relative chat-gradient-bg">
            {/* Centered waveform + "Start talking" when voice is active with no content yet */}
            {voiceActive && messages.length < 3 && !voiceUserPartial && !voiceAIPartial && (
              <div className="flex flex-col items-center justify-center gap-4 py-16">
                <VoiceWaveform
                  active={voiceSession.isAISpeaking || !voiceSession.muted}
                  size="md"
                />
                <p className="text-white/40 text-lg font-medium">
                  {voiceSession.status === 'connecting' || voiceSession.status === 'idle'
                    ? 'Connecting...'
                    : 'Start talking'}
                </p>
              </div>
            )}

            <div className="max-w-[680px] mx-auto px-3">
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
                thinkingSteps={thinkingSteps}
                thinkingIsActive={thinkingIsActive}
                thinkingIsDone={thinkingIsDone}
                thinkingElapsed={thinkingElapsed}
                nativeThinkingText={nativeThinkingText}
                hasThinkingModel={modelSupportsThinking(selectedModel || '')}
                userName={userName}
                userAvatar={userAvatar}
                onRefresh={onRefresh}
                onViewDetails={onViewDetails}
                onEdit={onEditMessage}
                onCancel={onCancel}
                error={error}
                onRetry={onRetry}
                onOpenPreferences={() => onNavigateToInvestmentPreferences?.()}
                isWideMode={prefsStore.isWideMode}
                onNavigateBranch={onNavigateBranch}
                onSuggestionSelect={handleSendMessage}
                onModeSwitch={handleModeSwitch}
                onNavigateToPreferences={onNavigateToInvestmentPreferences}
                onNavigateToUpgrade={onNavigateToUpgrade}
                onRecalculate={onRecalculate}
                onRefine={(instruction) => handleSendMessage(instruction)}
                onGoToIntegrations={onOpenIntegrations}
                onSendComplete={onSendComplete}
              />

              {/* ── Voice Streaming Partials ── */}
              {voiceActive && (
                <div
                  className={`${prefsStore.isWideMode ? 'max-w-3xl' : 'max-w-[680px]'} mx-auto flex flex-col`}
                  style={{ gap: 'var(--chat-density, 24px)' }}
                >
                  {/* Listening indicator — shows immediately while waiting for transcription */}
                  <div
                    className="flex w-full mb-3 justify-end items-center"
                    style={{
                      opacity: !voiceUserPartial && !voiceAIPartial && voiceSession.status === 'listening' && !voiceSession.muted ? 1 : 0,
                      maxHeight: !voiceUserPartial && !voiceAIPartial && voiceSession.status === 'listening' && !voiceSession.muted ? 40 : 0,
                      overflow: 'hidden',
                      transition: 'opacity 0.3s ease, max-height 0.3s ease',
                    }}
                  >
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.04] border border-white/[0.06]">
                      <div className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#C08B5C]" style={{ animation: 'pulse 1.4s ease-in-out infinite' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-[#C08B5C]" style={{ animation: 'pulse 1.4s ease-in-out 0.2s infinite' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-[#C08B5C]" style={{ animation: 'pulse 1.4s ease-in-out 0.4s infinite' }} />
                      </div>
                      <span className="text-[11px] text-white/35 font-medium">Listening...</span>
                    </div>
                  </div>

                  {/* Streaming user message — smooth opacity transition, no re-triggering animation */}
                  <div
                    className="flex w-full mb-4 justify-end"
                    style={{
                      opacity: voiceUserPartial ? 1 : 0,
                      maxHeight: voiceUserPartial ? 500 : 0,
                      overflow: 'hidden',
                      transition: 'opacity 0.25s ease, max-height 0.3s ease',
                    }}
                  >
                    <div className="flex flex-col max-w-[90%] md:max-w-[85%] items-end">
                      <div
                        className="relative whitespace-pre-wrap break-words overflow-hidden rounded-2xl rounded-br-md accent-user-bubble border border-white/[0.1] px-4 py-3 text-[14px] leading-relaxed backdrop-blur-xl"
                        style={{ color: '#F0FDFA' }}
                      >
                        <div className="text-white/90">
                          {voiceUserPartial || '\u00A0'}
                          <span
                            className="inline-block w-[2px] h-[1em] bg-white/50 ml-0.5 align-text-bottom"
                            style={{ animation: 'pulse 1.2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}
                          />
                        </div>
                      </div>
                    </div>
                    {/* User avatar */}
                    {userAvatar ? (
                      <img src={userAvatar} alt="" className="w-7 h-7 rounded-full ml-3 mt-1 flex-shrink-0" />
                    ) : (
                      <div className="w-7 h-7 rounded-full ml-3 mt-1 flex-shrink-0 bg-[#C08B5C]/30 flex items-center justify-center text-[11px] font-semibold text-[#C08B5C]">
                        {userName?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                    )}
                  </div>

                  {/* Streaming AI message — smooth opacity transition */}
                  <div
                    className="flex w-full mb-4 justify-start"
                    style={{
                      opacity: voiceAIPartial ? 1 : 0,
                      maxHeight: voiceAIPartial ? 2000 : 0,
                      overflow: 'hidden',
                      transition: 'opacity 0.25s ease, max-height 0.3s ease',
                    }}
                  >
                    <div className="flex-shrink-0 mr-4 mt-1">
                      <AgentAvatar status={agentStatus} className="w-9 h-9 shadow-lg shadow-blue-500/10" />
                    </div>
                    <div className="flex flex-col max-w-[90%] md:max-w-[85%] items-start">
                      <div className="text-[15px] leading-relaxed text-slate-200">
                        {voiceAIPartial || '\u00A0'}
                        <span
                          className="inline-block w-[2px] h-[1em] bg-white/50 ml-0.5 align-text-bottom"
                          style={{ animation: 'pulse 1.2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Scroll to Bottom Button */}
              <ScrollToBottomButton containerRef={messageContainerRef} />
            </div>
          </div>
        )}
      </div>

      {/* Inline Context Banner — between messages and composer */}
      {!showEmptyState && contextBanner && (
        <InlineContextBanner
          message={contextBanner.message}
          actions={contextBanner.actions}
          onDismiss={() => setContextBanner(null)}
        />
      )}

      {/* Bottom bar: VoiceChatBar (when voice active) or Composer */}
      {!showEmptyState && (
        <div className="flex-shrink-0 relative">
          <div className="px-3 md:px-4 pb-3 pt-2 relative z-20">
            <div className={`w-full ${prefsStore.isWideMode ? 'max-w-3xl' : 'max-w-[680px]'} mx-auto transition-all duration-200`}>
              {voiceActive ? (
                <VoiceChatBar
                  session={voiceSession}
                  onSend={handleSendMessage}
                  onEnd={handleVoiceEnd}
                  onChangePersona={handleChangePersona}
                />
              ) : (
                <>
                  <Composer
                    ref={composerRef}
                    onSend={handleSendMessage}
                    onStop={onCancel}
                    onAttach={onAttach}
                    attachment={attachment}
                    onClearAttachment={onClearAttachment}
                    onOpenPreferences={() => onNavigateToInvestmentPreferences?.()}
                    onOpenIntegrations={onOpenIntegrations}
                    aria-label="Chat input"
                    currentMode={currentMode}
                    onModeChange={onModeChange}
                    selectedModel={selectedModel}
                    onModelChange={onModelChange}
                    availableModels={AVAILABLE_MODELS.map(m => ({ ...m, accessible: m.tier === 'free' || isPro }))}
                    voiceActive={voiceActive}
                    onVoiceActivate={handleVoiceActivate}
                    isPro={isPro}
                    onUpgradePrompt={onNavigateToUpgrade}
                    contextPlaceholders={contextPlaceholders}
                    tokenUsage={tokenUsage}
                    isNearTokenLimit={isNearTokenLimit}
                    isTokenExhausted={isTokenExhausted}
                    onTokenUpgrade={onNavigateToUpgrade}
                    onBuyTokenPack={onBuyTokenPack}
                  />

                  {/* Temporary chat toggle + disclaimer */}
                  <div className="flex items-center justify-center gap-3 mt-2">
                    {onToggleTemporary && (
                      <button
                        type="button"
                        onClick={onToggleTemporary}
                        className={`flex items-center gap-1.5 text-[10.5px] transition-colors ${
                          isTemporary
                            ? 'text-amber-400/70 hover:text-amber-400'
                            : 'text-white/20 hover:text-white/40'
                        }`}
                        title={isTemporary ? 'Chat won\'t be saved. Click to disable.' : 'Enable temporary chat (not saved to history)'}
                      >
                        <span className={`inline-block w-5 h-2.5 rounded-full relative transition-colors ${
                          isTemporary ? 'bg-amber-400/30' : 'bg-white/[0.08]'
                        }`}>
                          <span className={`absolute top-0.5 w-1.5 h-1.5 rounded-full transition-all ${
                            isTemporary ? 'right-0.5 bg-amber-400' : 'left-0.5 bg-white/30'
                          }`} />
                        </span>
                        <span>Temporary</span>
                      </button>
                    )}
                    <p className="text-[10.5px] text-white/25">
                      Vasthu can make mistakes. Verify important information.
                    </p>
                  </div>

                  {/* Free plan usage indicator — hidden for Pro and in dev */}
                  {isFree && !import.meta.env.DEV && (
                    <div className="mt-1.5 flex items-center justify-center gap-3 text-[10px] text-white/30">
                      <span>Free plan</span>
                      <span className="w-px h-2.5 bg-white/10" />
                      <button
                        onClick={onNavigateToUpgrade}
                        className="text-amber-400/60 hover:text-amber-400 transition-colors"
                      >
                        Upgrade to Pro
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Preference Suggestion Toast */}
      <PreferenceSuggestionToast
        suggestion={preferenceSuggestion}
        onDismiss={() => setPreferenceSuggestion(null)}
      />

      {/* Persona Picker Modal */}
      <PersonaPickerModal
        isOpen={showPersonaPicker}
        onSelect={handlePersonaSelect}
        onClose={() => setShowPersonaPicker(false)}
        currentPersonaId={savedPersonaId}
      />
    </div>
  );
};
