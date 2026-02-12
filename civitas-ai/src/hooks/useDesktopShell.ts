// FILE: src/hooks/useDesktopShell.ts
import { useState, useEffect, useRef, useCallback } from 'react';
import type { Message } from '../types/chat';
import type { InvestmentStrategy, PnLOutput } from '../types/pnl';
import type { InvestmentReportFormat } from '../types/enums';
import type { ReportData } from '../components/reports/ReportDrawer';
import type { ThinkingState, CompletedTool, StreamEvent } from '../types/stream';
import { generateChatTitle, sanitizeChatTitle } from '../utils/chatTitleGenerator';
import { ChatService } from '../services/ChatService';
import { useAuth } from '../contexts/AuthContext';
import { analyzeFile, askAboutFile } from '../services/fileService';
import { fetchToolResults } from '../services/chatApi';
import { generateReport } from '../services/agentsApi';
import type { ToolResultRecord } from '../types/toolResults';
import { toolResultsToRecords, toolResultsToToolCards } from '../utils/toolResults';
import { logger } from '../utils/logger';
import { uploadFile } from '../services/fileStorage';
import { parsePropertyQuery, parseChatQuery } from '../utils/v2Helpers';
// import { usePortfolio } from '../contexts/PortfolioContext';

const envApiUrl = import.meta.env.VITE_DATALAYER_API_URL;
const CIVITAS_API_BASE = (envApiUrl && typeof envApiUrl === 'string' && envApiUrl.startsWith('http')) ? envApiUrl : 'http://localhost:8001';
const CIVITAS_API_KEY = import.meta.env.VITE_API_KEY;


export type AgentMode = 'research' | 'strategist' | 'hunter';


export interface ChatSession {
  id: string;
  title?: string;
  timestamp?: string;
  createdAt?: string;
  isActive?: boolean;
  isPinned?: boolean;
  isArchived?: boolean;
  isTemporary?: boolean;
  messages: Message[];
}

import { useToast } from './useToast';

export type TabType = 'chat' | 'reports' | 'portfolio' | 'analysis' | 'files' | 'settings' | 'help' | 'upgrade' | 'about' | 'profile' | 'notifications' | 'appearance' | 'language_region' | 'investment_preferences' | 'contact_support' | 'privacy_security' | 'voice_notes';

// Deal Analyzer state
export interface DealAnalyzerState {
  isOpen: boolean;
  propertyId: string | null;
  purchasePrice: number;
  strategy: InvestmentStrategy;
  propertyAddress?: string;
  initialOverrides?: any; // Allow passing overrides (tax, hoa)
}

// Report Drawer state
export interface ReportDrawerState {
  isOpen: boolean;
  report: ReportData | null;
  isLoading: boolean;
  error: string | null;
  inferredStrategy?: InvestmentStrategy;
  propertyAddress?: string;
}

// Command Center state (for property intelligence workspace)
export interface CommandCenterState {
  selectedPropertyId: string | null;
  comparisonDockProperties: any[]; // ScoutedProperty[]
  intelligencePaneView: 'details' | 'comparison';
  isPanePinned: boolean;
}

const NAVIGABLE_TABS: TabType[] = ['chat', 'reports', 'portfolio', 'analysis'];
const isNavigableTab = (tab?: string): tab is TabType =>
  !!tab && NAVIGABLE_TABS.includes(tab as TabType);

import { usePreferencesStore } from '../stores/preferencesStore';

export function useDesktopShell() {
  // Get user context
  const { user } = useAuth();
  const { showToast } = useToast();
  const {
    sync,
    preferredMode,
    setPreferredMode,
  } = usePreferencesStore();

  // ... existing code ...

  // Hydrate User Preferences & Prompts
  useEffect(() => {
    sync();
  }, [sync]);
  // Chat history state
  const [chatHistory, setChatHistory] = useState<ChatSession[]>(() => {
    const saved = typeof window !== 'undefined'
      ? window.localStorage.getItem('civitas-chat-history')
      : null;
    if (!saved) return [];

    const parsed = JSON.parse(saved);
    return parsed.map((chat: any) => ({
      id: chat.id,
      title: chat.title,
      timestamp: chat.timestamp,
      createdAt: chat.createdAt,
      isPinned: chat.isPinned,
      isArchived: chat.isArchived,
      messages: chat.messages || []
    }));
  });

  const [activeChatId, setActiveChatId] = useState<string>(() => {
    const saved = typeof window !== 'undefined'
      ? window.localStorage.getItem('civitas-active-chat-id')
      : null;
    return saved || 'main';
  });

  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = typeof window !== 'undefined'
      ? window.localStorage.getItem('civitas-chat-messages')
      : null;
    return saved ? JSON.parse(saved) : [];
  });

  // Temporary chat state - not persisted to localStorage
  const [isCurrentChatTemporary, setIsCurrentChatTemporary] = useState(false);

  // Agent Mode State — initialized from persisted preference
  const [currentMode, setCurrentMode] = useState<AgentMode>(preferredMode || 'hunter');

  // UI state
  const [isRailCollapsed, setIsRailCollapsed] = useState(() => {
    const saved = typeof window !== 'undefined'
      ? localStorage.getItem('civitas-rail-collapsed')
      : null;
    return saved ? JSON.parse(saved) : false;
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('chat');
  const [activeProperty, setActiveProperty] = useState<any | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [fileThreadId, setFileThreadId] = useState<string | null>(null);
  const [fileContextName, setFileContextName] = useState<string | null>(null);
  const [threadMap, setThreadMap] = useState<Record<string, string>>(() => {
    if (typeof window === 'undefined') return {};
    const stored = window.localStorage.getItem('civitas-thread-map');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (error) {
        console.warn('Failed to parse thread map from storage', error);
        return {};
      }
    }
    const legacyThreadId = window.localStorage.getItem('civitas-thread-id');
    const legacyChatId = window.localStorage.getItem('civitas-active-chat-id') || 'main';
    if (legacyThreadId) {
      const initial = { [legacyChatId]: legacyThreadId };
      window.localStorage.setItem('civitas-thread-map', JSON.stringify(initial));
      return initial;
    }
    return {};
  });

  // Update chat title
  const updateChatTitle = useCallback((chatId: string, newTitle: string) => {
    setChatHistory(prev =>
      prev.map(chat =>
        chat.id === chatId
          ? { ...chat, title: sanitizeChatTitle(newTitle) }
          : chat
      )
    );
  }, []);

  const [toolResultsByThread, setToolResultsByThread] = useState<Record<string, ToolResultRecord[]>>({});
  const [isFetchingToolResults, setIsFetchingToolResults] = useState(false);
  const [toolMemoryError, setToolMemoryError] = useState<string | null>(null);
  const currentThreadId = threadMap[activeChatId] || null;

  // Deal Analyzer state
  const [dealAnalyzer, setDealAnalyzer] = useState<DealAnalyzerState>({
    isOpen: false,
    propertyId: null,
    purchasePrice: 500000,
    strategy: 'STR',
    propertyAddress: undefined,
    initialOverrides: undefined,
  });

  // Report Drawer state
  const [reportDrawer, setReportDrawer] = useState<ReportDrawerState>({
    isOpen: false,
    report: null,
    isLoading: false,
    error: null,
    inferredStrategy: undefined,
    propertyAddress: undefined,
  });

  // Command Center state (Property Intelligence Workspace)
  const [commandCenter, setCommandCenter] = useState<CommandCenterState>({
    selectedPropertyId: null,
    comparisonDockProperties: [],
    intelligencePaneView: 'details',
    isPanePinned: false,
  });

  // Track latest P&L output for report generation
  const [latestPnlOutput, setLatestPnlOutput] = useState<PnLOutput | null>(null);

  // Thinking state for SSE streaming
  const [thinking, setThinking] = useState<ThinkingState | null>(null);
  const [completedTools, setCompletedTools] = useState<CompletedTool[]>([]);
  const [reasoningSteps, setReasoningSteps] = useState<any[]>([]); // NEW: Reasoning steps from stream
  const [streamError, _setStreamError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const streamContentRef = useRef<string>('');
  const currentToolsRef = useRef<CompletedTool[]>([]);
  const inlineActionsRef = useRef<any[]>([]);

  // --- Mode suggestion from AI (research/strategist → hunter switch) ---
  const modeSuggestionRef = useRef<{ suggestedMode: string; reason: string; autoQuery: string } | null>(null);

  // --- Accumulated thinking trace (persisted to final message) ---
  const thinkingTraceRef = useRef<{ text: string; source: string }[]>([]);
  const thinkingStartTimeRef = useRef<number | null>(null);

  // --- Typewriter word-buffer system ---
  const wordBufferRef = useRef<string[]>([]);       // incoming words waiting to be displayed
  const displayedContentRef = useRef<string>('');    // what the user actually sees
  const rafIdRef = useRef<number | null>(null);      // setTimeout id for drain loop
  const isStreamingRef = useRef<boolean>(false);     // whether we're actively streaming
  // --- Drain loop timing ---
  // Fixed interval: fires every 30ms.  Each tick drains a small number of words.
  // Target: ~60-80 words/sec (GPT-like).  A 300-word response streams over ~4-5 seconds.
  // NEVER ramp up aggressively — that's what made it look like "all at once."
  const DRAIN_TICK_MS = 30;
  // Pending finalization: when done/complete fires, we store the callback here
  // and let the drain loop apply it after the buffer is empty (preserving typewriter effect)
  const pendingFinalizationRef = useRef<((msgId: string) => void) | null>(null);

  // Cancel active stream
  const cancelStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setThinking(null);
    setIsLoading(false);
    // Note: _setStreamError is available for future error handling
  }, []);

  // --- Typewriter drain helpers ---
  // Push incoming text into word buffer (split on whitespace boundaries, preserving spaces)
  const pushToWordBuffer = useCallback((text: string) => {
    if (!text) return;
    // Split into tokens that preserve whitespace as separate entries
    const tokens = text.split(/(\s+)/);
    wordBufferRef.current.push(...tokens);
  }, []);

  // Flush all remaining buffer content immediately (safety escape hatch)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _flushWordBuffer = useCallback((messageId: string) => {
    if (wordBufferRef.current.length > 0) {
      displayedContentRef.current += wordBufferRef.current.join('');
      wordBufferRef.current = [];
    }
    // Cancel any pending drain timer
    if (rafIdRef.current !== null) {
      clearTimeout(rafIdRef.current);
      rafIdRef.current = null;
    }
    isStreamingRef.current = false;
    // Final update to displayed content
    setMessages(prev => prev.map(m =>
      m.id === messageId ? { ...m, content: displayedContentRef.current } : m
    ));
  }, []);

  // Start the drain loop that moves words from buffer → displayed content.
  // Uses a FIXED rate so text always streams visibly (like ChatGPT).
  //
  // Key design decisions:
  //  • Fixed 2 words per 30ms tick = ~66 words/sec.
  //  • When streaming is DONE but buffer has leftover, allow 3 words/tick to
  //    catch up gently (still perceivable at ~100 words/sec).
  //  • NEVER go faster than 3 words/tick — that's what caused the "all at once" bug.
  const startDrainLoop = useCallback((messageId: string) => {
    if (rafIdRef.current !== null) return; // Already running

    const drain = () => {
      if (wordBufferRef.current.length > 0) {
        // Fixed speed: 2 words/tick while streaming, 3 words/tick when catching up after done
        const wordsThisTick = isStreamingRef.current ? 2 : 3;
        const batch = wordBufferRef.current.splice(0, wordsThisTick);
        displayedContentRef.current += batch.join('');

        // Update message in state
        setMessages(prev => prev.map(m =>
          m.id === messageId
            ? { ...m, content: displayedContentRef.current, isStreaming: true }
            : m
        ));
      }

      // Continue loop while streaming or buffer still has content
      if (isStreamingRef.current || wordBufferRef.current.length > 0) {
        rafIdRef.current = window.setTimeout(drain, DRAIN_TICK_MS) as unknown as number;
      } else {
        // Buffer empty and streaming done — apply pending finalization if any
        rafIdRef.current = null;
        if (pendingFinalizationRef.current) {
          pendingFinalizationRef.current(messageId);
          pendingFinalizationRef.current = null;
        }
      }
    };

    rafIdRef.current = window.setTimeout(drain, DRAIN_TICK_MS) as unknown as number;
  }, []);

  // Refs for cleanup
  const [streamIntervalId, setStreamIntervalId] = useState<ReturnType<typeof setInterval> | null>(null);
  const attachmentUrlsRef = useRef<string[]>([]);

  // Persist chat history
  useEffect(() => {
    window.localStorage.setItem('civitas-chat-history', JSON.stringify(chatHistory));
  }, [chatHistory]);

  // Persist active chat ID
  useEffect(() => {
    window.localStorage.setItem('civitas-active-chat-id', activeChatId);
  }, [activeChatId]);

  // Persist thread map
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('civitas-thread-map', JSON.stringify(threadMap));
    }
  }, [threadMap]);

  // Persist messages and auto-save to history
  useEffect(() => {
    window.localStorage.setItem('civitas-chat-messages', JSON.stringify(messages));

    if (messages.length > 0) {
      const firstUserMessage = messages.find(msg => msg.role === 'user' || msg.type === 'user')?.content || '';

      setChatHistory(prev => {
        const chatExists = prev.some(chat => chat.id === activeChatId);

        if (chatExists) {
          return prev.map(chat =>
            chat.id === activeChatId
              ? {
                ...chat,
                messages: [...messages],
                title: generateChatTitle(firstUserMessage),
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                createdAt: chat.createdAt || new Date().toISOString()
              }
              : chat
          );
        }
        return prev;
      });
    }
  }, [messages, activeChatId]);

  // Control smart suggestions display
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    const shouldShow = !isLoading && messages.length > 1 &&
      lastMessage?.role === 'assistant' && !lastMessage?.isStreaming;
    if (shouldShow) {
      const timer = setTimeout(() => setShowSuggestions(true), 300);
      return () => clearTimeout(timer);
    } else {
      setShowSuggestions(false);
    }
  }, [messages, isLoading]);

  // Smart Error Recovery: Check for stuck error state on load
  useEffect(() => {
    // Only run once on mount
    const checkForErrorState = () => {
      if (messages.length > 0) {
        const lastMessage = messages[messages.length - 1];
        const isError =
          (lastMessage.role === 'assistant' &&
            (lastMessage.content.includes("I'm having trouble connecting") ||
              lastMessage.content.includes("Sorry, I encountered an error") ||
              lastMessage.content.includes("I'm sorry, I couldn't process that request")));

        if (isError) {
          console.log('[SmartRecovery] Detected error state in last session. Archiving and resetting.');

          // Archive current chat
          handleNewChat();

          // Notify user
          showToast(
            'Your previous chat ended in an error, so we started a fresh one. The old chat is saved in your history.',
            'info'
          );
        }
      }
    };

    // Small timeout to ensure initial state is settled
    const timer = setTimeout(checkForErrorState, 1000);
    return () => clearTimeout(timer);
  }, []); // Empty dependency array = run once on mount



  // Cleanup stream interval
  useEffect(() => {
    return () => {
      if (streamIntervalId) {
        clearInterval(streamIntervalId);
      }
    };
  }, [streamIntervalId]);

  // Cleanup attachment URLs on unmount
  useEffect(() => {
    return () => {
      attachmentUrlsRef.current.forEach(url => URL.revokeObjectURL(url));
      attachmentUrlsRef.current = [];
    };
  }, []);

  const toggleRail = () => {
    const newState = !isRailCollapsed;
    setIsRailCollapsed(newState);
    localStorage.setItem('civitas-rail-collapsed', JSON.stringify(newState));
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const clearPendingAttachment = () => {
    setAttachment(null);
    setFileThreadId(null);
    setFileContextName(null);
  };

  const updateThreadIdForChat = useCallback((chatId: string, newThreadId: string | null) => {
    setThreadMap(prev => {
      const next = { ...prev };
      if (!newThreadId) {
        delete next[chatId];
      } else {
        next[chatId] = newThreadId;
      }
      return next;
    });

    if (typeof window !== 'undefined') {
      if (newThreadId) {
        window.localStorage.setItem('civitas-thread-id', newThreadId);
      } else {
        window.localStorage.removeItem('civitas-thread-id');
      }
    }
  }, []);

  const refreshToolResults = useCallback(async (options?: {
    threadId?: string;
  }) => {
    const threadToFetch = options?.threadId || currentThreadId;
    if (!threadToFetch) return;

    setIsFetchingToolResults(true);
    setToolMemoryError(null);

    try {
      const results = await fetchToolResults(threadToFetch);
      setToolResultsByThread(prev => ({
        ...prev,
        [threadToFetch]: results,
      }));
    } catch (error) {
      console.error('Failed to fetch tool results', error);
      setToolMemoryError('Unable to load recent calculations. Please try again later.');
    } finally {
      setIsFetchingToolResults(false);
    }
  }, [currentThreadId]);

  useEffect(() => {
    if (currentThreadId && !toolResultsByThread[currentThreadId]) {
      refreshToolResults({ threadId: currentThreadId });
    }
  }, [currentThreadId, toolResultsByThread, refreshToolResults]);

  const clearToolMemoryError = useCallback(() => setToolMemoryError(null), []);

  // Reset thinking state - backend will provide actual status
  const resetThinkingState = useCallback(() => {
    setThinking({
      status: 'Thinking...'
    });
    setCompletedTools([]);
    setReasoningSteps([]); // NEW: Reset reasoning steps
    streamContentRef.current = '';
    currentToolsRef.current = [];
    inlineActionsRef.current = [];
    modeSuggestionRef.current = null;
    thinkingTraceRef.current = [];
    thinkingStartTimeRef.current = Date.now();
    pendingFinalizationRef.current = null;
    // Reset typewriter state
    wordBufferRef.current = [];
    displayedContentRef.current = '';
    isStreamingRef.current = false;
    if (rafIdRef.current !== null) {
      clearTimeout(rafIdRef.current);
      rafIdRef.current = null;
    }
  }, []);

  // Auto-generate inline actions based on completed tools and current mode
  const generateInlineActions = useCallback((tools: CompletedTool[], mode: AgentMode) => {
    if (tools.length === 0) return [];

    const toolNames = tools.map(t => t.tool);
    const actions: Array<{ label: string; tool_name: string; arguments: Record<string, unknown>; style?: string }> = [];

    // Detect what tools were used and suggest contextual next steps
    const hadPropertySearch = toolNames.some(t =>
      ['Property Search', 'scan_market', 'Deal Hunter', 'hunt_deals'].includes(t)
    );
    const hadAnalysis = toolNames.some(t =>
      ['Financial Analysis', 'request_financial_analysis', 'Metrics Calculation', 'request_metrics_calculation'].includes(t)
    );
    const hadMarketStats = toolNames.some(t =>
      ['Market Analysis', 'get_market_stats', 'Market Research', 'research_new_market'].includes(t)
    );
    const hadComps = toolNames.some(t =>
      ['find_comps_with_intel', 'Property Comparison', 'compare_properties'].includes(t)
    );
    const hadReport = toolNames.some(t =>
      ['Report Generation', 'Generate Report', 'generate_report'].includes(t)
    );
    const hadPortfolio = toolNames.some(t =>
      ['Portfolio Analysis', 'portfolio_analyzer_tool', 'Cashflow Projection', 'cashflow_timeseries_tool'].includes(t)
    );

    if (mode === 'hunter') {
      if (hadReport) {
        // After report → suggest next deal actions
        actions.push({ label: 'Analyze another property', tool_name: 'scan_market', arguments: {}, style: 'primary' });
        actions.push({ label: 'Compare top picks', tool_name: 'find_comps_with_intel', arguments: {}, style: 'secondary' });
        actions.push({ label: 'Search new market', tool_name: 'research_new_market', arguments: {}, style: 'secondary' });
      } else if (hadPropertySearch) {
        actions.push({ label: 'Deep-dive top pick', tool_name: 'request_financial_analysis', arguments: {}, style: 'primary' });
        actions.push({ label: 'Check deal killers', tool_name: 'detect_deal_killers', arguments: {}, style: 'secondary' });
        actions.push({ label: 'Pull comps', tool_name: 'find_comps_with_intel', arguments: {}, style: 'secondary' });
      } else if (hadAnalysis) {
        actions.push({ label: 'Generate report', tool_name: 'generate_report', arguments: {}, style: 'primary' });
        actions.push({ label: 'Draft offer strategy', tool_name: 'generate_offer_strategy', arguments: {}, style: 'secondary' });
        actions.push({ label: 'Check deal killers', tool_name: 'detect_deal_killers', arguments: {}, style: 'secondary' });
      } else if (hadComps) {
        actions.push({ label: 'Make an offer', tool_name: 'generate_offer_strategy', arguments: {}, style: 'primary' });
        actions.push({ label: 'Generate report', tool_name: 'generate_report', arguments: {}, style: 'secondary' });
        actions.push({ label: 'Neighborhood trajectory', tool_name: 'analyze_neighborhood_trajectory', arguments: {}, style: 'secondary' });
      } else if (hadMarketStats) {
        actions.push({ label: 'Hunt deals here', tool_name: 'scan_market', arguments: {}, style: 'primary' });
        actions.push({ label: 'Compare another market', tool_name: 'get_market_stats', arguments: {}, style: 'secondary' });
      }
    } else if (mode === 'strategist') {
      if (hadReport) {
        // After strategy report → suggest next strategic actions
        actions.push({ label: 'Refine strategy', tool_name: 'ask_clarifying_questions', arguments: {}, style: 'primary' });
        actions.push({ label: 'Find matching properties', tool_name: 'scan_market', arguments: {}, style: 'secondary' });
        actions.push({ label: 'Review risk exposure', tool_name: 'detect_portfolio_vulnerabilities', arguments: {}, style: 'secondary' });
      } else if (hadPortfolio) {
        actions.push({ label: 'Generate strategy report', tool_name: 'generate_report', arguments: {}, style: 'primary' });
        actions.push({ label: 'Stress test scenarios', tool_name: 'simulate_portfolio_scenarios', arguments: {}, style: 'secondary' });
        actions.push({ label: 'Tax optimization', tool_name: 'generate_tax_strategy', arguments: {}, style: 'secondary' });
      } else if (hadPropertySearch) {
        actions.push({ label: 'Portfolio fit analysis', tool_name: 'portfolio_analyzer_tool', arguments: {}, style: 'primary' });
        actions.push({ label: 'Stress test scenarios', tool_name: 'simulate_portfolio_scenarios', arguments: {}, style: 'secondary' });
        actions.push({ label: 'Tax implications', tool_name: 'generate_tax_strategy', arguments: {}, style: 'secondary' });
      } else if (hadAnalysis) {
        actions.push({ label: 'Generate strategy report', tool_name: 'generate_report', arguments: {}, style: 'primary' });
        actions.push({ label: 'Simulate scenarios', tool_name: 'simulate_portfolio_scenarios', arguments: {}, style: 'secondary' });
        actions.push({ label: 'Check portfolio risk', tool_name: 'detect_portfolio_vulnerabilities', arguments: {}, style: 'secondary' });
      } else if (hadMarketStats) {
        actions.push({ label: 'Find matching properties', tool_name: 'scan_market', arguments: {}, style: 'primary' });
        actions.push({ label: 'Compare markets', tool_name: 'get_market_stats', arguments: {}, style: 'secondary' });
      } else {
        actions.push({ label: 'Review my portfolio', tool_name: 'portfolio_analyzer_tool', arguments: {}, style: 'primary' });
        actions.push({ label: 'Define buy box', tool_name: 'ask_clarifying_questions', arguments: {}, style: 'secondary' });
      }
    } else {
      // Research mode
      if (hadReport) {
        // After research report → suggest further research
        actions.push({ label: 'Compare to another market', tool_name: 'get_market_stats', arguments: {}, style: 'secondary' });
        actions.push({ label: 'Dig deeper into trends', tool_name: 'analyze_market_trend_depth', arguments: {}, style: 'secondary' });
        actions.push({ label: 'Apply to my portfolio', tool_name: 'portfolio_analyzer_tool', arguments: {}, style: 'secondary' });
      } else if (hadMarketStats) {
        actions.push({ label: 'Generate research report', tool_name: 'generate_report', arguments: {}, style: 'secondary' });
        actions.push({ label: 'Dig deeper into trends', tool_name: 'analyze_market_trend_depth', arguments: {}, style: 'secondary' });
        actions.push({ label: 'Compare to another market', tool_name: 'get_market_stats', arguments: {}, style: 'secondary' });
        actions.push({ label: 'Economic drivers', tool_name: 'research_economic_drivers', arguments: {}, style: 'secondary' });
      } else if (hadPropertySearch) {
        actions.push({ label: 'Market context', tool_name: 'get_market_stats', arguments: {}, style: 'secondary' });
        actions.push({ label: 'Rental demand analysis', tool_name: 'analyze_rental_demand_depth', arguments: {}, style: 'secondary' });
      } else {
        actions.push({ label: 'Explore a market', tool_name: 'research_new_market', arguments: {}, style: 'secondary' });
        actions.push({ label: 'Check regulations', tool_name: 'forecast_regulatory_changes', arguments: {}, style: 'secondary' });
      }
    }

    return actions.slice(0, 4); // Max 4 actions
  }, []);

  // Handle SSE stream event
  const handleStreamEvent = useCallback((event: StreamEvent, messageId: string) => {
    // Handle inline_actions event (from suggest_actions tool)
    const eventAny = event as any;
    if (eventAny.type === 'inline_actions' && eventAny.actions && Array.isArray(eventAny.actions)) {
      inlineActionsRef.current = eventAny.actions;
      logger.info('[useDesktopShell] Received inline_actions event', {
        count: eventAny.actions.length,
        context: eventAny.context,
      });
      // Immediately attach to current message
      setMessages(prev => prev.map(m =>
        m.id === messageId
          ? { ...m, inlineActions: eventAny.actions }
          : m
      ));
      return;
    }

    switch (event.type) {
      case 'init':
        if (event.thread_id) {
          updateThreadIdForChat(activeChatId, event.thread_id);
        }
        break;

      // V2 Event: properties received
      case 'properties':
        console.log('🏠 [V2-SSE] PROPERTIES EVENT:', event);
        // DON'T clear thinking here - more thinking events come after properties
        // Thinking will be cleared by 'complete' or 'ai_chunk' when AI starts streaming

        // Extract key info
        const propertyCount = event.total_found || event.properties?.length || 0;
        const location = event.market_context?.location || 'this area';
        const properties = event.properties || [];

        // Calculate price range
        const prices = properties.map((p: any) => p.price || p.current_value_estimate || 0).filter((p: number) => p > 0);
        const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
        const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
        const priceRange = minPrice > 0 ? `$${(minPrice / 1000).toFixed(0)}k - $${(maxPrice / 1000).toFixed(0)}k` : '';

        // 🚀 NO HEADER - Let AI response speak for itself
        streamContentRef.current = '';
        displayedContentRef.current = '';
        wordBufferRef.current = [];

        // Use backend calculated_metrics when available, fallback to rough estimates
        const enhancedProperties = properties.map((prop: any, idx: number) => {
          const price = prop.price || prop.current_value_estimate || 0;
          const rent = prop.estimated_rent || prop.current_rent_estimate || 0;
          const metrics = prop.calculated_metrics;

          // Use backend metrics if available, otherwise rough fallback
          const capRate = metrics?.cap_rate ?? (price > 0 && rent > 0 ? ((rent * 12) / price) * 100 : 0);
          const cashflow = metrics?.monthly_cash_flow ?? (rent > 0 ? rent - (price * 0.007) : 0);
          const cashOnCash = metrics?.cash_on_cash_roi ?? 0;
          const monthlyMortgage = metrics?.monthly_mortgage ?? 0;
          const monthlyExpenses = metrics?.monthly_expenses ?? 0;
          const annualNoi = metrics?.annual_noi ?? 0;
          const totalRoi = metrics?.total_roi ?? 0;

          // Use backend ai_score, not fake hardcoded score
          const matchScore = prop.ai_score ?? (85 + (idx * -5));

          return {
            ...prop,
            ai_match_score: matchScore,
            cap_rate: capRate,
            monthly_cashflow: cashflow,
            cash_on_cash_roi: cashOnCash,
            monthly_mortgage: monthlyMortgage,
            monthly_expenses: monthlyExpenses,
            annual_noi: annualNoi,
            total_roi: totalRoi,
            // Keep calculated_metrics for components that read it directly
            calculated_metrics: metrics || {
              monthly_mortgage: monthlyMortgage,
              monthly_expenses: monthlyExpenses,
              monthly_cash_flow: cashflow,
              annual_noi: annualNoi,
              cap_rate: capRate,
              cash_on_cash_roi: cashOnCash,
              total_roi: totalRoi,
            },
            // financial_snapshot for PropertyListCard compatibility
            financial_snapshot: {
              estimated_monthly_cash_flow: Math.round(cashflow),
              estimated_rent: Math.round(rent),
              monthly_mortgage: Math.round(monthlyMortgage),
              monthly_expenses: Math.round(monthlyExpenses),
              cap_rate: capRate,
              cash_on_cash_roi: cashOnCash,
              status: cashflow > 0 ? 'positive' : 'negative',
            },
            ai_badge: idx === 0 ? '🌟 AI TOP PICK' : idx === 1 ? '💰 BEST VALUE' : idx === 2 ? '📈 HIGH GROWTH' : null,
            ai_reason: idx === 0 ? 'Perfect match for your LTR strategy' :
              idx === 1 ? `Undervalued by ~15%` :
                idx === 2 ? 'Emerging neighborhood with strong growth' : null
          };
        });

        console.log('[V2-SSE] Enhanced properties sample:', enhancedProperties[0]);
        console.log('[V2-SSE] Enhanced properties count:', enhancedProperties.length);

        // Convert to tool card format with enhanced data
        const propertyToolCard = {
          tool: 'scout_properties',
          summary: `${propertyCount} Properties Found · AI-ranked by match score · ${location}`,
          icon: '🏠',
          id: `properties-${Date.now()}`,
          title: `${propertyCount} Properties Found`,
          description: `AI-ranked by match score · ${location}`,
          status: 'success',
          kind: 'scout_properties',
          name: 'scout_properties',
          data: {
            properties: enhancedProperties,
            total_found: event.total_found,
            market_context: {
              ...event.market_context,
              price_range: priceRange,
              location: location
            },
            sorted_by: 'ai_match_score',
            filters_applied: {
              max_price: enhancedProperties[0]?.max_price,
              strategy: 'Long-Term Rental'
            }
          }
        };

        currentToolsRef.current = [propertyToolCard];
        setCompletedTools([propertyToolCard]);

        // Add message with header and properties
        setMessages(prev => {
          const filtered = prev.filter(m => m.id !== messageId);
          return [...filtered, {
            id: messageId,
            content: streamContentRef.current,
            role: 'assistant',
            type: 'assistant',
            timestamp: new Date(),
            isStreaming: true,
            tools: [propertyToolCard]
          } as Message];
        });
        break;

      // V2 Event: AI insight chunks (streaming text)
      case 'ai_chunk':
        console.log('🤖 [V2-SSE] AI_CHUNK:', event.text?.substring(0, 50));

        // Accumulate full content for reference (used by complete/done)
        streamContentRef.current += event.text || '';

        // Don't clear thinking here — let the 'complete' event handle it.
        // Clearing thinking mid-stream causes the indicator to flash/reset,
        // especially when the backend sends interleaved thinking + ai_chunk
        // events (e.g. from the ThinkingTagParser routing <thinking> content).
        // The ThinkingIndicator stays visible while isLoading is true and
        // gracefully fades on 'complete'.

        // Ensure the assistant message exists (research/strategist mode
        // skips the `properties` event that normally creates it)
        setMessages(prev => {
          const exists = prev.some(m => m.id === messageId);
          if (!exists) {
            return [...prev, {
              id: messageId,
              content: '',
              role: 'assistant',
              type: 'assistant',
              timestamp: new Date(),
              isStreaming: true,
            } as Message];
          }
          return prev;
        });

        // Push into typewriter word buffer for smooth animation
        isStreamingRef.current = true;
        pushToWordBuffer(event.text || '');
        startDrainLoop(messageId);
        break;

      // V2 Event: AI suggests switching modes (e.g. research → hunter)
      case 'mode_suggestion': {
        const suggestedMode = event.suggested_mode || 'hunter';
        const reason = event.reason || 'Switch mode for better results.';
        const autoQuery = event.auto_query || '';

        // Store the suggestion so the frontend can render a switch prompt
        // We attach it as a special field on the current assistant message
        modeSuggestionRef.current = { suggestedMode, reason, autoQuery };

        // Also inject a visible hint into the AI text stream
        const switchHint = `\n\n---\n**Tip:** ${reason}\n`;
        pushToWordBuffer(switchHint);
        startDrainLoop(messageId);
        break;
      }

      // V2 Event: Backend auto-switched mode (high confidence mismatch)
      case 'mode_switched': {
        const eventData = event as any;
        const toMode = eventData.to_mode || 'hunter';
        const fromMode = eventData.from_mode || currentMode;
        const reason = eventData.reason || 'Detected a better mode for your query.';
        const autoQuery = eventData.auto_query || '';

        logger.info(`[useDesktopShell] Mode auto-switched: ${fromMode} → ${toMode}`, { reason, autoQuery });

        // Change mode immediately
        setCurrentMode(toMode as AgentMode);

        // Show toast notification
        const modeLabels: Record<string, string> = {
          hunter: 'Hunter',
          research: 'Research',
          strategist: 'Strategist',
        };
        showToast(
          `Switched to ${modeLabels[toMode] || toMode} mode — ${reason}`,
          'info'
        );

        // Re-send the query in the new mode after a short delay
        // (so mode state updates and the correct endpoint is selected)
        if (autoQuery) {
          setTimeout(() => {
            sendMessageWithStream(autoQuery, { skipUserMessage: true });
          }, 400);
        }
        break;
      }

      // V2 Event: search complete
      case 'complete': {
        console.log('✅ [V2-SSE] COMPLETE:', event.message);
        setThinking(null);
        setIsLoading(false);

        // Signal no more chunks — let drain loop finish naturally
        isStreamingRef.current = false;

        // Capture finalization data
        const v2Duration = thinkingStartTimeRef.current
          ? Date.now() - thinkingStartTimeRef.current
          : 0;
        const v2Steps = thinkingTraceRef.current.length > 0
          ? [...thinkingTraceRef.current]
          : undefined;
        const v2Tools = currentToolsRef.current.map(t => t.tool).filter(Boolean);
        const v2Trace = v2Steps
          ? { steps: v2Steps, durationMs: v2Duration, toolsUsed: v2Tools }
          : undefined;
        const v2Content = streamContentRef.current;
        const v2ModeSuggestion = modeSuggestionRef.current;
        modeSuggestionRef.current = null; // Reset for next message

        pendingFinalizationRef.current = (mId: string) => {
          setMessages(prev => {
            const exists = prev.some(m => m.id === mId);
            if (!exists) {
              // Message was never created (e.g. research/strategist with all events in one chunk)
              return [...prev, {
                id: mId,
                content: v2Content,
                role: 'assistant',
                type: 'assistant',
                timestamp: new Date(),
                isStreaming: false,
                ...(v2Trace ? { thinkingTrace: v2Trace } : {}),
                ...(v2ModeSuggestion ? { modeSuggestion: v2ModeSuggestion } : {}),
              } as Message];
            }
            return prev.map(m =>
              m.id === mId
                ? {
                  ...m,
                  content: v2Content,
                  isStreaming: false,
                  ...(v2Trace ? { thinkingTrace: v2Trace } : {}),
                  ...(v2ModeSuggestion ? { modeSuggestion: v2ModeSuggestion } : {}),
                }
                : m
            );
          });
        };

        if (rafIdRef.current === null) {
          pendingFinalizationRef.current(messageId);
          pendingFinalizationRef.current = null;
        }
        break;
      }

      // 🚀 NEW: Handle reasoning step events
      case 'reasoning_step':
        console.log('🧠 [SSE] REASONING_STEP EVENT:', event.step);
        setReasoningSteps(prev => {
          // Update existing step or add new one
          const existingIndex = prev.findIndex(s => s.title === event.step.title);
          if (existingIndex >= 0) {
            // Update existing step (e.g., from running to complete)
            const updated = [...prev];
            updated[existingIndex] = event.step;
            return updated;
          } else {
            // Add new step
            return [...prev, event.step];
          }
        });
        break;

      case 'thinking': {
        // V2 uses 'message' field, V1 uses 'status' field
        const thinkingStatus = event.status || event.message || 'Thinking';
        console.log('🧠 [SSE] THINKING EVENT:', thinkingStatus, 'replace:', !!event.replace, 'at', new Date().toLocaleTimeString());

        // If "replace" flag is set (V2 property search), update the status in-place
        // instead of accumulating numbered steps. Skip trace too.
        if (event.replace) {
          setThinking(prev => ({
            ...(prev || {}),
            status: thinkingStatus,
            explanation: event.explanation || prev?.explanation,
            source: event.source || prev?.source || 'V2 Property Intelligence',
          }));
          break;
        }

        // --- Persist to structured trace for post-response display ---
        const traceSource = event.source || event.tool || 'AI';
        const alreadyInTrace = thinkingTraceRef.current.some(s => s.text === thinkingStatus);
        if (!alreadyInTrace && thinkingStatus !== 'Thinking') {
          thinkingTraceRef.current.push({ text: thinkingStatus, source: traceSource });
        }

        // Accumulate thinking events into multi-line display (V1 agent flow).
        setThinking(prev => {
          if (prev && prev.status) {
            // Avoid duplicate lines
            const alreadyHasThisLine = prev.status.includes(thinkingStatus);
            if (alreadyHasThisLine) return prev;

            const newStatus = prev.status + '\n' + thinkingStatus;
            return {
              ...prev,
              status: newStatus,
              explanation: event.explanation || prev.explanation,
            };
          }
          // First thinking event — set initial state
          return {
            title: event.title,
            status: thinkingStatus,
            explanation: event.explanation,
            source: event.source || 'V2 Property Intelligence',
            icon: event.icon,
            tool: event.tool,
            mode: event.mode,
            filtersApplied: event.filters_applied,
            userContext: event.user_context ? {
              budgetMax: event.user_context.budget_max,
              dislikes: event.user_context.dislikes,
              favoriteMarkets: event.user_context.favorite_markets,
              strategy: event.user_context.strategy,
            } : undefined,
          };
        });
        break;
      }

      case 'tool_start': {
        const toolStartStatus = event.thinking || event.title || `Running ${event.tool}...`;
        // Persist to trace
        thinkingTraceRef.current.push({ text: toolStartStatus, source: event.tool || 'Tool' });
        // Always accumulate tool_start into the thinking status
        setThinking(prev => {
          if (prev && prev.status) {
            const alreadyHas = prev.status.includes(toolStartStatus);
            if (alreadyHas) return prev;
            return {
              ...prev,
              status: prev.status + '\n' + toolStartStatus,
            };
          }
          return {
            title: event.title,
            status: toolStartStatus,
            explanation: event.explanation,
            source: event.source,
            icon: event.icon,
            tool: event.tool,
          };
        });
        break;
      }

      case 'tool_end':
        // Never clear thinking — keep accumulated steps visible until streaming starts
        // (thinking is cleared by 'ai_chunk'/'content' events once the AI starts responding)

        if (event.summary) {
          const newTool: CompletedTool = {
            tool: event.tool,
            summary: event.summary!,
            icon: event.icon || '✓',
            data: event.data,
            reason: event.reason,
            suggestion: event.suggestion,
          };

          // Detect suggest_actions tool and extract inline actions
          if (
            (event.tool === 'suggest_actions' || event.tool === 'Suggest Actions') &&
            event.data?.type === 'inline_actions' &&
            Array.isArray(event.data?.actions)
          ) {
            inlineActionsRef.current = event.data.actions;
            logger.info('[useDesktopShell] Captured inline actions from suggest_actions', {
              count: event.data.actions.length,
              context: event.data.context,
            });
          }

          setCompletedTools(prev => [...prev, newTool]);
          currentToolsRef.current = [...currentToolsRef.current, newTool];

          // Update message immediately to show tool result if needed
          setMessages(prev => {
            // Find if we already have a message for this stream
            const existing = prev.find(m => m.id === messageId);
            const baseMessage = existing || {
              id: messageId,
              content: streamContentRef.current, // Might be empty initially
              role: 'assistant',
              type: 'assistant',
              timestamp: new Date(),
              isStreaming: true,
            };

            const updatedMessage = {
              ...baseMessage,
              tools: currentToolsRef.current.map(t => ({
                id: `${t.tool}-${Date.now()}`,
                title: t.tool,
                description: t.summary,
                status: 'success',
                kind: 'generic', // Default, logic below could refine this
                data: t.data,
                // Map tool names to kinds if needed
                ...(t.tool === 'Property Search' || t.tool === 'scan_market' ? {
                  kind: 'scout_properties',
                  name: 'scout_properties',
                  // Ensure data is passed through, python side handles structure
                  data: t.data
                } : {}),
                ...(t.tool === 'Property Comparison' ? { kind: 'property_comparison_table', name: 'compare_properties' } : {}),
                ...(t.tool === 'Deal Hunter' ? {
                  kind: 'scout_properties',
                  name: 'hunt_deals',
                  data: {
                    ...t.data,
                    properties: t.data?.vetted_deals?.map((deal: any) => ({
                      ...deal.details,
                      ...deal,
                      financial_snapshot: {
                        estimated_monthly_cash_flow: deal.estimated_rent ? (deal.estimated_rent - (deal.list_price * 0.007)) : 0,
                        status: (deal.estimated_rent && (deal.estimated_rent > (deal.list_price * 0.007))) ? 'positive' : 'negative',
                        estimated_rent: deal.estimated_rent
                      }
                    }))
                  }
                } : {}),
                ...(['Report Generation', 'Generate Report', 'generate_report'].includes(t.tool) ? { kind: 'generated_report', name: 'generate_report' } : {})
              }))
            };

            const filtered = prev.filter(m => m.id !== messageId);
            return [...filtered, updatedMessage as Message];
          });
        }
        break;

      case 'content':
        console.log('📝 [SSE] CONTENT at', new Date().toLocaleTimeString(), '- length:', streamContentRef.current.length);
        // Clear thinking state after a few content chunks (not immediately)
        if (streamContentRef.current.length > 20) {
          console.log('✂️ Clearing thinking (content > 20)');
          setThinking(null);
        }
        streamContentRef.current += event.content;

        // Push into typewriter word buffer
        isStreamingRef.current = true;
        pushToWordBuffer(event.content);

        // Ensure message exists with tool cards (only needed on first content event)
        if (displayedContentRef.current.length === 0) {
          setMessages(prev => {
            const filtered = prev.filter(m => m.id !== messageId);
            const toolCards = currentToolsRef.current.map(t => ({
              id: `${t.tool}-${Date.now()}`,
              title: t.tool,
              description: t.summary,
              status: 'success',
              kind: 'generic',
              data: t.data,
              ...(t.tool === 'Property Search' || t.tool === 'scan_market' ? { kind: 'scout_properties', name: 'scout_properties', data: t.data } : {}),
              ...(t.tool === 'Property Comparison' ? { kind: 'property_comparison_table', name: 'compare_properties' } : {}),
              ...(t.tool === 'Deal Hunter' ? {
                kind: 'scout_properties',
                name: 'hunt_deals',
                data: {
                  ...t.data,
                  properties: t.data?.vetted_deals?.map((deal: any) => ({
                    ...deal.details,
                    ...deal,
                    financial_snapshot: {
                      estimated_monthly_cash_flow: deal.estimated_rent ? (deal.estimated_rent - (deal.list_price * 0.007)) : 0,
                      status: (deal.estimated_rent && (deal.estimated_rent > (deal.list_price * 0.007))) ? 'positive' : 'negative',
                      estimated_rent: deal.estimated_rent
                    }
                  }))
                }
              } : {}),
              ...(['Report Generation', 'Generate Report', 'generate_report'].includes(t.tool) ? { kind: 'generated_report', name: 'generate_report' } : {})
            }));

            return [...filtered, {
              id: messageId,
              content: '',
              role: 'assistant',
              type: 'assistant',
              timestamp: new Date(),
              isStreaming: true,
              tools: toolCards.length > 0 ? toolCards : undefined
            } as Message];
          });
        }

        startDrainLoop(messageId);
        break;

      case 'done': {
        setThinking(null);
        setIsLoading(false);

        // Signal that no more chunks are coming — drain loop will finish naturally
        isStreamingRef.current = false;

        // Capture finalization data now (refs may change)
        const doneInlineActions = inlineActionsRef.current.length > 0
          ? [...inlineActionsRef.current]
          : generateInlineActions([...currentToolsRef.current], currentMode);
        const doneDuration = thinkingStartTimeRef.current
          ? Date.now() - thinkingStartTimeRef.current
          : 0;
        const doneTraceSteps = thinkingTraceRef.current.length > 0
          ? [...thinkingTraceRef.current]
          : undefined;
        const doneToolsUsed = currentToolsRef.current.map(t => t.tool).filter(Boolean);
        const doneThinkingTrace = doneTraceSteps
          ? { steps: doneTraceSteps, durationMs: doneDuration, toolsUsed: doneToolsUsed }
          : undefined;
        const doneFinalContent = streamContentRef.current;

        // Store finalization callback — drain loop will call it when buffer is empty
        pendingFinalizationRef.current = (mId: string) => {
          setMessages(prev => prev.map(m =>
            m.id === mId
              ? {
                ...m,
                content: doneFinalContent,
                isStreaming: false,
                ...(doneInlineActions.length > 0 ? { inlineActions: doneInlineActions } : {}),
                ...(doneThinkingTrace ? { thinkingTrace: doneThinkingTrace } : {}),
              }
              : m
          ));
        };

        // If drain loop is not running (e.g. no content was streamed), finalize now
        if (rafIdRef.current === null) {
          pendingFinalizationRef.current(messageId);
          pendingFinalizationRef.current = null;
        }
        break;
      }


      case 'suggestions':
        if (event.suggestions) {
          setMessages(prev => prev.map(m =>
            m.id === messageId ? { ...m, suggestions: event.suggestions } : m
          ));
        }
        break;

      case 'error':
        setThinking(null);
        setIsLoading(false);
        setMessages(prev => {
          const filtered = prev.filter(m => m.id !== messageId);
          return [...filtered, {
            id: messageId,
            content: event.error || "I'm having trouble connecting. Please try again.",
            role: 'assistant',
            type: 'assistant',
            timestamp: new Date(),
            isStreaming: false,
          } as Message];
        });
        break;
    }
  }, [activeChatId, currentMode, updateThreadIdForChat]);

  // Send message with SSE streaming
  const sendMessageWithStream = useCallback(async (message: string, options?: { skipUserMessage?: boolean }) => {
    if (!message.trim() && !attachment) return;

    const currentAttachment = attachment;
    const trimmedMessage = message.trim();

    // All queries go through V2 (unless there's a file attachment which needs V1)
    const shouldUseV2 = !currentAttachment;

    // Cancel any existing stream
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Only add user message if NOT skipping (e.g. not regenerating)
    if (!options?.skipUserMessage) {
      const userMessage: Message = ChatService.createUserMessage(trimmedMessage);
      setMessages(prev => [...prev, userMessage]);
    }

    setAttachment(null);
    setIsLoading(true);
    resetThinkingState();

    // Upload file to Firebase for Files vault
    if (currentAttachment) {
      try {
        const chatTitle = chatHistory.find(c => c.id === activeChatId)?.title || 'Untitled Chat';
        await uploadFile(currentAttachment, {
          chatId: activeChatId,
          chatTitle: chatTitle,
          conversationTopic: trimmedMessage || undefined,
        });
        logger.info(`[useDesktopShell] File uploaded to vault (streaming): ${currentAttachment.name}`);
      } catch (error) {
        logger.error(`[useDesktopShell] Failed to upload file to vault (streaming): ${error}`);
        // Don't block the chat if upload fails
      }
    }

    const messageId = `stream_${Date.now()}`;
    abortControllerRef.current = new AbortController();

    try {
      const effectiveThreadId = currentThreadId || undefined;

      const {
        budgetRange,
        defaultStrategy,
        interactionProfile,
        favoriteMarkets,
        financialDna,
        clientLocation,
        language
      } = usePreferencesStore.getState();

      // Determine endpoint and payload based on mode
      let endpoint: string;
      let requestBody: any;

      if (!shouldUseV2) {
        // V1 fallback (file attachment)
        endpoint = `${CIVITAS_API_BASE}/api/stream`;
        requestBody = {
          message: trimmedMessage,
          stream: true,
          thread_id: effectiveThreadId,
          mode: currentMode,
          response_language: language && language !== 'en-US' ? language : undefined,
          user_preferences: {
            user_id: user?.id || undefined,
            budget: budgetRange ? `up to $${budgetRange.max.toLocaleString()}` : undefined,
            strategy: defaultStrategy || undefined,
            dislikes: interactionProfile?.dislikes || [],
            favorite_markets: favoriteMarkets || [],
            financial_dna: financialDna || undefined,
            client_location: clientLocation || undefined
          }
        };
      } else if (currentMode === 'hunter') {
        // Hunter mode → property search endpoint
        endpoint = `${CIVITAS_API_BASE}/v2/property/search/stream`;
        requestBody = parsePropertyQuery(trimmedMessage, { budgetRange, defaultStrategy, interactionProfile, favoriteMarkets, financialDna, clientLocation, language }, currentMode);
      } else {
        // Research / Strategist → chat endpoint
        endpoint = `${CIVITAS_API_BASE}/v2/chat/stream`;
        requestBody = parseChatQuery(trimmedMessage, currentMode as 'research' | 'strategist', effectiveThreadId, language);
      }

      console.log(`[useDesktopShell] Calling ${shouldUseV2 ? `V2 ${currentMode}` : 'V1'} endpoint:`, endpoint);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${CIVITAS_API_KEY}`,
          'X-Api-Key': CIVITAS_API_KEY,
          ...(user?.id ? { 'X-User-ID': user.id } : {}),
        },
        body: JSON.stringify(requestBody),
        signal: abortControllerRef.current?.signal
      });

      if (!response.ok) {
        // Parse plan enforcement 403 errors
        if (response.status === 403) {
          const { parseApiError } = await import('../utils/apiErrors');
          const planErr = await parseApiError(response);
          if (planErr) {
            throw new Error(planErr.message);
          }
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      // Buffer for partial lines that may be split across chunk boundaries.
      // Without this, a data: line split across two reader.read() calls
      // would fail to parse and be silently dropped.
      let sseLineBuffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        sseLineBuffer += chunk;

        // Split on newline to get complete lines
        const sseLines = sseLineBuffer.split('\n');
        // Keep the last element — it might be an incomplete line
        sseLineBuffer = sseLines.pop() || '';

        for (const line of sseLines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data: ')) continue;

          const jsonStr = trimmed.slice(6).trim();
          if (jsonStr === '[DONE]' || jsonStr === '') continue;

          try {
            const data = JSON.parse(jsonStr) as StreamEvent;
            console.log('[SSE] Event received:', data.type, data);
            handleStreamEvent(data, messageId);
          } catch (err) {
            console.error('[SSE] Failed to parse:', jsonStr, err);
          }
        }
      }

      // Process any remaining buffered data after stream ends
      if (sseLineBuffer.trim()) {
        const remaining = sseLineBuffer.trim();
        if (remaining.startsWith('data: ')) {
          const jsonStr = remaining.slice(6).trim();
          if (jsonStr && jsonStr !== '[DONE]') {
            try {
              const data = JSON.parse(jsonStr) as StreamEvent;
              handleStreamEvent(data, messageId);
            } catch (_) { /* ignore final partial */ }
          }
        }
      }
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        return;
      }

      setThinking(null);
      setIsLoading(false);
      setMessages(prev => [...prev, {
        id: messageId,
        content: "I'm having trouble connecting. Please try again.",
        role: 'assistant',
        type: 'assistant',
        timestamp: new Date(),
        isStreaming: false,
      } as Message]);
    }
  }, [currentThreadId, currentMode, user, resetThinkingState, handleStreamEvent]);

  const handleRegenerate = useCallback((messageId: string) => {
    const messageIndex = messages.findIndex(m => m.id === messageId);
    if (messageIndex === -1) return;

    const message = messages[messageIndex];
    let userMessageContent = '';
    let newMessages = [...messages];
    let skipUserMessage = false;

    if (message.role === 'assistant') {
      // Find the preceding user message
      const prevMessage = messages[messageIndex - 1];
      if (prevMessage && prevMessage.role === 'user') {
        userMessageContent = prevMessage.content;
        // Only remove THIS assistant message, keep the user message
        newMessages = messages.slice(0, messageIndex);
        skipUserMessage = true;
      }
    } else if (message.role === 'user') {
      userMessageContent = message.content;
      // Remove this user message and everything after (standard edit behavior)
      newMessages = messages.slice(0, messageIndex);
      skipUserMessage = false;
    }

    if (userMessageContent) {
      setMessages(newMessages);
      // Trigger new stream
      sendMessageWithStream(userMessageContent, { skipUserMessage });
    }
  }, [messages, sendMessageWithStream]);

  // Handle editing a user message
  const handleEditMessage = useCallback((messageId: string, newContent: string) => {
    const messageIndex = messages.findIndex(m => m.id === messageId);
    if (messageIndex === -1) return;

    setMessages(prev => {
      const newMessages = [...prev];
      const msg = { ...newMessages[messageIndex] };

      // Initialize branching if not present
      if (!msg.data) {
        msg.data = {};
      }
      if (!msg.data.branching) {
        msg.data.branching = {
          currentVersion: 0,
          versions: [{
            timestamp: msg.timestamp,
            content: msg.content,
            subsequentMessages: newMessages.slice(messageIndex + 1)
          }]
        };
      }

      // Create new version
      const newVersion = {
        timestamp: new Date().toISOString(),
        content: newContent,
        subsequentMessages: [] // Will be populated by new response
      };

      msg.data.branching.versions.push(newVersion);
      msg.data.branching.currentVersion = msg.data.branching.versions.length - 1;

      // Update current message display
      msg.content = newContent;
      msg.timestamp = newVersion.timestamp;

      newMessages[messageIndex] = msg;

      // Truncate history for display (linear view)
      return newMessages.slice(0, messageIndex + 1);
    });

    // Send the new content as a fresh message
    sendMessageWithStream(newContent);
  }, [messages, sendMessageWithStream]);

  // Navigate between message versions
  const handleNavigateBranch = useCallback((messageId: string, direction: 'prev' | 'next') => {
    setMessages(prev => {
      const index = prev.findIndex(m => m.id === messageId);
      if (index === -1) return prev;

      const newMessages = [...prev];
      const msg = { ...newMessages[index] };

      if (!msg.data?.branching) return prev;

      const newVersionIndex = direction === 'next'
        ? Math.min(msg.data.branching.currentVersion + 1, msg.data.branching.versions.length - 1)
        : Math.max(msg.data.branching.currentVersion - 1, 0);

      if (newVersionIndex === msg.data.branching.currentVersion) return prev;

      const targetVersion = msg.data.branching.versions[newVersionIndex];

      // Update current state
      msg.data.branching.currentVersion = newVersionIndex;
      msg.content = targetVersion.content;
      msg.timestamp = targetVersion.timestamp;

      newMessages[index] = msg;

      // Restore subsequent messages from history
      return [...newMessages.slice(0, index + 1), ...targetVersion.subsequentMessages];
    });
  }, []);

  // Chat management handlers
  const handlePinChat = useCallback((chatId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setChatHistory(prev => prev.map(chat =>
      chat.id === chatId ? { ...chat, isPinned: !chat.isPinned } : chat
    ));
  }, []);

  const handleArchiveChat = useCallback((chatId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setChatHistory(prev => prev.map(chat =>
      chat.id === chatId ? { ...chat, isArchived: !chat.isArchived } : chat
    ));

    // If archiving active chat, switch to main or new
    if (activeChatId === chatId) {
      handleNewChat();
    }
  }, [activeChatId]);

  // Chat handlers
  const handleSendMessage = async (message: string) => {
    if (!message.trim() && !attachment) return;

    const currentAttachment = attachment;
    const trimmedMessage = message.trim();
    const attachmentInfo = currentAttachment
      ? {
        name: currentAttachment.name,
        type: currentAttachment.type,
        url: URL.createObjectURL(currentAttachment)
      }
      : undefined;

    if (attachmentInfo?.url) {
      attachmentUrlsRef.current.push(attachmentInfo.url);
    }

    const displayMessage = trimmedMessage || (currentAttachment ? 'Shared an attachment' : '');
    const userMessage: Message = ChatService.createUserMessage(displayMessage, attachmentInfo);

    setMessages(prev => [...prev, userMessage]);
    setAttachment(null);
    setIsLoading(true);

    // Upload file to Firebase for Files vault
    if (currentAttachment) {
      try {
        const chatTitle = chatHistory.find(c => c.id === activeChatId)?.title || 'Untitled Chat';
        await uploadFile(currentAttachment, {
          chatId: activeChatId,
          chatTitle: chatTitle,
          conversationTopic: trimmedMessage || undefined,
        });
        logger.info(`[useDesktopShell] File uploaded to vault: ${currentAttachment.name}`);
      } catch (error) {
        logger.error(`[useDesktopShell] Failed to upload file to vault: ${error}`);
        // Don't block the chat if upload fails
      }
    }

    // Get AI response from Civitas API
    const fetchResponse = async () => {
      try {
        let fullResponse = '';
        let navigate: string | undefined;
        let action: any;
        let toolResults: any;
        let tour: any;
        let resolvedThreadId = currentThreadId;

        if (currentAttachment) {
          try {
            const analysisPrompt = trimmedMessage || `Analyze ${currentAttachment.name} and summarize the key details.`;
            const analysisResult = await analyzeFile(currentAttachment, analysisPrompt);
            fullResponse = analysisResult.analysis || 'Here is what I found in that attachment.';
            toolResults = {
              file_name: analysisResult.file_name || currentAttachment.name,
              highlights: analysisResult.highlights,
              ...analysisResult.metadata
            };
            if (analysisResult.thread_id) {
              setFileThreadId(analysisResult.thread_id);
              setFileContextName(analysisResult.file_name || currentAttachment.name);
            }
          } catch (error) {
            console.error('File analysis failed:', error);
            fullResponse = "I couldn't analyze that attachment right now. Please share the important details in chat or try again.";
          }
        } else if (fileThreadId) {
          try {
            const followUp = await askAboutFile(trimmedMessage, fileThreadId);
            fullResponse = followUp.analysis;
            toolResults = {
              file_name: followUp.file_name || fileContextName,
              follow_up: true,
              ...followUp.metadata
            };
            setFileThreadId(followUp.thread_id);
            if (followUp.file_name) {
              setFileContextName(followUp.file_name);
            }
          } catch (error) {
            console.error('Follow-up analysis failed:', error);
            fullResponse = "I couldn't look back at that file just now. Please try again soon.";
          }
        } else {
          // Pass user context to backend
          const userContext = {
            name: user?.name?.split(' ')[0] || 'there',
            onboarding_completed: false
          };
          const response = await ChatService.generateSTRResponse(
            trimmedMessage,
            userContext,
            messages,
            undefined, // actionContext
            undefined, // attachment
            currentThreadId || undefined, // threadId
            currentMode // mode
          );
          fullResponse = response.content;
          navigate = response.navigate;
          action = response.action;
          toolResults = response.tool_results;
          tour = response.tour;
          if (response.threadId) {
            updateThreadIdForChat(activeChatId, response.threadId);
            resolvedThreadId = response.threadId;
          }
        }

        const optimisticRecords = toolResultsToRecords(toolResults);

        // For tour navigation, navigate IMMEDIATELY before showing message
        if (tour?.navigate_first && isNavigableTab(navigate)) {
          console.log(`🎯 Tour navigation: Jumping to ${navigate} FIRST`);
          setActiveTab(navigate as TabType);
        }

        const { intervalId } = ChatService.streamResponse(
          fullResponse,
          (content, id) => {
            const isComplete = content.length >= fullResponse.length;
            setMessages(prev => {
              const filtered = prev.filter(m => m.id !== id);
              const assistantMessage: any = {
                id,
                content,
                role: 'assistant',
                type: 'assistant',
                timestamp: new Date(),
                isStreaming: !isComplete,
                action: isComplete ? action : undefined // Add action only when complete
              };
              // Include tool_results for conversation context if available
              if (isComplete) {
                if (toolResults) {
                  assistantMessage.tool_results = toolResults;
                  logger.info('[useDesktopShell] Processing tool results for message', {
                    messageId: id,
                    hasToolResults: !!toolResults,
                    toolResultsType: typeof toolResults,
                    isArray: Array.isArray(toolResults),
                  });
                }
                const cards = toolResultsToToolCards(toolResults);
                logger.info('[useDesktopShell] Tool cards generated', {
                  messageId: id,
                  cardCount: cards.length,
                  cardKinds: cards.map(c => c.kind),
                });
                if (cards.length > 0) {
                  assistantMessage.tools = cards;
                  logger.info('[useDesktopShell] ✅ Attached tool cards to message', {
                    messageId: id,
                    cards: cards.map(c => ({ kind: c.kind, title: c.title, hasData: !!c.data })),
                  });
                } else if (toolResults) {
                  logger.warn('[useDesktopShell] ⚠️ Tool results present but no cards created', {
                    messageId: id,
                    toolResultsSummary: Array.isArray(toolResults)
                      ? toolResults.map((tr: any) => tr.tool_name || tr.kind || 'unknown')
                      : Object.keys(toolResults),
                  });
                }

                const threadKey = resolvedThreadId || currentThreadId;
                if (threadKey && optimisticRecords.length > 0) {
                  setToolResultsByThread(prev => {
                    const existing = prev[threadKey] || [];
                    return {
                      ...prev,
                      [threadKey]: [...optimisticRecords, ...existing],
                    };
                  });
                }
              }
              // Include tour data if available
              if (isComplete && tour) {
                assistantMessage.tour = tour;
              }
              return [
                ...filtered,
                assistantMessage as Message
              ];
            });
          },
          () => {
            setStreamIntervalId(null);
            setIsLoading(false);

            // Handle navigation after message is displayed
            if (isNavigableTab(navigate)) {
              // For tour navigation, navigate immediately
              // For other navigation, add small delay so user sees the message
              const isTour = tour && tour.active;
              const delay = isTour ? 100 : 800;

              setTimeout(() => {
                console.log(`📡 Navigating to: ${navigate}`);
                setActiveTab(navigate as TabType);
              }, delay);
            }
          }
        );

        setStreamIntervalId(intervalId);
      } catch (error) {
        console.error('Failed to get AI response:', error);
        setIsLoading(false);

        // Add error message
        const errorMessage: Message = {
          id: `error_${Date.now()}`,
          content: "I'm having trouble connecting to the AI service. Please try again.",
          role: 'assistant',
          type: 'assistant',
          timestamp: new Date(),
          isStreaming: false
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    };
    fetchResponse();
  };

  const handleNewChat = () => {
    // Only save to history if current chat is not temporary and has messages
    if (messages.length > 0 && !isCurrentChatTemporary) {
      const firstUserMessage = messages.find(msg => msg.role === 'user' || msg.type === 'user')?.content || '';
      const chatExists = chatHistory.some(chat => chat.id === activeChatId);

      if (!chatExists) {
        setChatHistory(prev => [
          {
            id: activeChatId,
            messages: [...messages],
            title: generateChatTitle(firstUserMessage),
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            createdAt: new Date().toISOString()
          },
          ...prev
        ]);
      } else {
        setChatHistory(prev => prev.map(chat =>
          chat.id === activeChatId ? { ...chat, messages: [...messages] } : chat
        ));
      }
    }

    setMessages([]);
    clearPendingAttachment();
    setIsLoading(false);
    if (streamIntervalId) {
      clearInterval(streamIntervalId);
      setStreamIntervalId(null);
    }

    const newId = Date.now().toString();
    setActiveChatId(newId);
    updateThreadIdForChat(newId, null);
    setIsCurrentChatTemporary(false);
  };

  // ── Voice mode helpers ──

  /** Called when voice overlay opens — creates a fresh chat session for the voice conversation */
  const handleVoiceStart = useCallback(() => {
    handleNewChat();
  }, [handleNewChat]); // eslint-disable-line react-hooks/exhaustive-deps

  /** Called each time a voice turn (user or assistant) is transcribed */
  const handleVoiceTurn = useCallback((role: 'user' | 'assistant', content: string) => {
    if (!content.trim()) return;
    const message: Message = role === 'user'
      ? ChatService.createUserMessage(content)
      : ChatService.createAssistantMessage(content);
    setMessages(prev => [...prev, message]);
  }, []);

  const handleLoadChat = (chatId: string) => {
    const chat = chatHistory.find(c => c.id === chatId);
    if (!chat) return;

    // Loading a saved chat means it's not temporary
    setIsCurrentChatTemporary(false);

    setActiveChatId(chatId);
    setMessages(chat.messages || []);
    clearPendingAttachment();
    setIsLoading(false);
    if (streamIntervalId) {
      clearInterval(streamIntervalId);
      setStreamIntervalId(null);
    }
    setIsSidebarOpen(false);
    setActiveTab('chat');

    const existingThreadId = threadMap[chatId];
    if (existingThreadId) {
      refreshToolResults({ threadId: existingThreadId });
    }
  };

  const handleDeleteChat = (chatId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (chatHistory.length === 1) return;

    // Grab the thread ID before removing from state so we can call the backend
    const threadIdToDelete = threadMap[chatId];

    const updatedHistory = chatHistory.filter(c => c.id !== chatId);
    setChatHistory(updatedHistory);

    // Remove from thread map
    setThreadMap(prev => {
      const next = { ...prev };
      delete next[chatId];
      return next;
    });

    if (chatId === activeChatId) {
      const nextChat = updatedHistory[0];
      setActiveChatId(nextChat.id);
      setMessages(nextChat.messages || []);
      clearPendingAttachment();
      updateThreadIdForChat(nextChat.id, threadMap[nextChat.id] || null);
      const nextThreadId = threadMap[nextChat.id];
      if (nextThreadId) {
        refreshToolResults({ threadId: nextThreadId });
      }
    }

    // Delete backend conversation data (fire-and-forget)
    if (threadIdToDelete) {
      fetch(`${CIVITAS_API_BASE}/api/threads/${threadIdToDelete}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(CIVITAS_API_KEY ? { 'X-API-Key': CIVITAS_API_KEY } : {}),
        },
      }).catch(err => console.warn('Failed to delete thread from backend:', err));
    }
  };

  const notifyFeatureUnavailable = () => {
    const infoMessage: Message = {
      id: `${Date.now()}`,
      content: "That dashboard feature isn't available in this build, but I'm here in chat to help with anything else.",
      role: 'assistant',
      type: 'assistant',
      timestamp: new Date(),
      isStreaming: false
    };
    setMessages(prev => [...prev, infoMessage]);
  };

  // Deal Analyzer handlers
  const openDealAnalyzer = (
    propertyId: string | null = null,
    strategy: InvestmentStrategy = 'STR',
    purchasePrice: number = 500000,
    propertyAddress?: string,
    initialOverrides?: any
  ) => {
    // Store deal analyzer data
    setDealAnalyzer({
      isOpen: true,
      propertyId,
      purchasePrice,
      strategy,
      propertyAddress,
      initialOverrides,
    });
    // Don't change tab - drawer overlays on current view
  };

  const closeDealAnalyzer = () => {
    setDealAnalyzer(prev => ({
      ...prev,
      isOpen: false,
    }));
  };

  // Report Drawer handlers
  const openReportDrawer = (
    inferredStrategy?: InvestmentStrategy,
    propertyAddress?: string
  ) => {
    setReportDrawer(prev => ({
      ...prev,
      isOpen: true,
      inferredStrategy: inferredStrategy || prev.inferredStrategy || dealAnalyzer.strategy,
      propertyAddress: propertyAddress || prev.propertyAddress || dealAnalyzer.propertyAddress,
    }));
  };

  const closeReportDrawer = () => {
    setReportDrawer(prev => ({
      ...prev,
      isOpen: false,
    }));
  };

  const generateReportWithType = async (reportType: InvestmentReportFormat) => {
    setReportDrawer(prev => ({ ...prev, isLoading: true, error: null }));

    logger.info('[useDesktopShell] Generating report', { reportType, propertyAddress: reportDrawer.propertyAddress });

    try {
      // Build valuation data from latest P&L output if available
      const valuationData = latestPnlOutput
        ? {
          strategy: latestPnlOutput.meta.strategy,
          purchase_price: latestPnlOutput.financingSummary.downPayment + latestPnlOutput.financingSummary.loanAmount,
          total_investment: latestPnlOutput.financingSummary.totalInvestment,
          monthly_cashflow: latestPnlOutput.year1.monthlyCashflow,
          noi: latestPnlOutput.year1.noi,
          cap_rate: latestPnlOutput.year1.capRate,
          cash_on_cash: latestPnlOutput.year1.cashOnCash,
        }
        : {};

      const response = await generateReport({
        valuation: valuationData,
        report_type: reportType as 'str' | 'ltr' | 'adu' | 'flip' | 'full',
        export_format: 'text',
        property_address: reportDrawer.propertyAddress,
      });

      if (!response.success) {
        throw new Error(response.message || 'Report generation failed');
      }

      const reportData: ReportData = {
        content: response.report,
        report_id: response.report_id,
        view_url: response.view_url,
        report_type: response.report_type || reportType,
        generated_at: response.generated_at || new Date().toISOString(),
        property_address: response.property_details?.address || reportDrawer.propertyAddress,
        property_details: response.property_details,
      };

      setReportDrawer(prev => ({
        ...prev,
        report: reportData,
        isLoading: false,
      }));

      // Notify Reports page to refresh its list
      window.dispatchEvent(new CustomEvent('reports-updated'));

      logger.info('[useDesktopShell] Report generated successfully', { reportType });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate report';
      setReportDrawer(prev => ({
        ...prev,
        isLoading: false,
        error: message,
      }));
      logger.error('[useDesktopShell] Report generation failed', { error: message });
    }
  };

  const clearReport = () => {
    setReportDrawer(prev => ({
      ...prev,
      report: null,
      error: null,
    }));
  };

  // Update latest P&L output when deal analyzer produces results
  const updateLatestPnlOutput = useCallback((output: PnLOutput | null) => {
    setLatestPnlOutput(output);
  }, []);

  const handleAction = (actionValue: string, _actionContext?: any) => {
    if (actionValue === 'navigate_settings') {
      console.warn('Settings page has been removed. Use the preferences modal instead.');
      return;
    }

    // Handle Deal Analyzer action
    if (actionValue === 'open_deal_analyzer') {
      const context = _actionContext || {};
      openDealAnalyzer(
        context.propertyId || null,
        context.strategy || 'STR',
        context.purchasePrice || 500000,
        context.propertyAddress
      );
      return;
    }

    // Handle Report generation action
    if (actionValue === 'generate_report' || actionValue === 'view_report') {
      const context = _actionContext || {};
      openReportDrawer(
        context.strategy || dealAnalyzer.strategy,
        context.propertyAddress || dealAnalyzer.propertyAddress
      );
      return;
    }

    if (['navigate_market_insights'].includes(actionValue)) {
      notifyFeatureUnavailable();
      return;
    }

    if (actionValue === 'eli5') {
      sendMessageWithStream("Explain that to me like I'm 5 years old.");
      return;
    }

    if (actionValue === 'skip' || actionValue === 'dismiss') {
      logger.info('User skipped/dismissed action');
      return;
    }

    // Fallback: Treat any unrecognized action as a natural language query
    // This powers inline actions from suggest_actions tool — the label or value
    // is sent as a message, which the LLM then processes with the right tools
    if (actionValue && actionValue.length > 3) {
      logger.info(`[handleAction] Sending action as message: "${actionValue}"`);
      sendMessageWithStream(actionValue);
      return;
    }

    logger.warn(`[handleAction] Unhandled action: "${actionValue}"`);
  };

  // Handle viewing property details
  const handleViewPropertyDetails = useCallback((property: any) => {
    console.log('[useDesktopShell] handleViewPropertyDetails called with:', property);
    setActiveProperty(property);
    setActiveTab('analysis');
  }, []);

  // Command Center handlers
  const selectProperty = useCallback((property: any) => {
    const propertyId = property.listing_id || property.address;
    setCommandCenter(prev => ({
      ...prev,
      selectedPropertyId: propertyId,
      intelligencePaneView: 'details',
    }));
  }, []);

  const addToComparisonDock = useCallback((property: any) => {
    setCommandCenter(prev => {
      // Check if already in dock
      const exists = prev.comparisonDockProperties.some(
        p => (p.listing_id || p.address) === (property.listing_id || property.address)
      );
      if (exists) return prev;

      // Max 4 properties
      if (prev.comparisonDockProperties.length >= 4) {
        showToast('Maximum 4 properties can be compared at once', 'warning');
        return prev;
      }

      return {
        ...prev,
        comparisonDockProperties: [...prev.comparisonDockProperties, property],
      };
    });
  }, [showToast]);

  const removeFromComparisonDock = useCallback((propertyId: string) => {
    setCommandCenter(prev => ({
      ...prev,
      comparisonDockProperties: prev.comparisonDockProperties.filter(
        p => (p.listing_id || p.address) !== propertyId
      ),
    }));
  }, []);

  const clearComparisonDock = useCallback(() => {
    setCommandCenter(prev => ({
      ...prev,
      comparisonDockProperties: [],
      intelligencePaneView: 'details',
    }));
  }, []);

  const startComparison = useCallback(() => {
    if (commandCenter.comparisonDockProperties.length < 2) {
      showToast('Add at least 2 properties to compare', 'warning');
      return;
    }
    setCommandCenter(prev => ({
      ...prev,
      intelligencePaneView: 'comparison',
    }));
  }, [commandCenter.comparisonDockProperties.length, showToast]);

  const togglePanePin = useCallback(() => {
    setCommandCenter(prev => ({
      ...prev,
      isPanePinned: !prev.isPanePinned,
    }));
  }, []);

  // Mode transition handler — injects a brief context message when switching modes
  const handleModeChange = useCallback((newMode: AgentMode) => {
    if (newMode === currentMode) return;

    const modeLabels: Record<AgentMode, string> = {
      hunter: 'Hunter',
      research: 'Research',
      strategist: 'Strategist',
    };
    const modeDescriptions: Record<AgentMode, string> = {
      hunter: '**Deal Hunter activated.** I search, score, and vet deals — no fluff. Every property gets a verdict: **Buy, Negotiate, or Pass.** Give me a city or address and I\'ll run the numbers.',
      research: '**Research Analyst activated.** I dig deep into markets, trends, and fundamentals — with citations. I\'ll match my depth to your experience level. Ask me about any market or investing concept.',
      strategist: '**Portfolio Strategist activated.** I think in decades, not deals. Every recommendation connects to your broader portfolio: risk exposure, diversification, and long-term wealth. Tell me your goals and current position.',
    };

    // Only inject transition message if there are existing messages in the conversation
    if (messages.length > 0) {
      const transitionMessage: Message = {
        id: `mode-transition-${Date.now()}`,
        role: 'assistant',
        type: 'assistant',
        content: modeDescriptions[newMode],
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, transitionMessage]);
    }

    setCurrentMode(newMode);
    setPreferredMode(newMode);
    logger.info(`Mode switched: ${modeLabels[currentMode]} → ${modeLabels[newMode]}`);
  }, [currentMode, messages.length, setPreferredMode]);

  return {
    // State
    chatHistory,
    activeChatId,
    messages,
    isRailCollapsed,
    isSidebarOpen,
    activeTab,
    activeProperty,
    isLoading,
    showSuggestions,
    attachment,

    // Setters
    setIsSidebarOpen,
    setActiveTab,
    setAttachment,
    clearPendingAttachment,

    // Handlers
    handleSendMessage,
    sendMessageWithStream,
    handleNewChat,
    handleLoadChat,
    handleDeleteChat,
    handleAction,
    handleEditMessage,
    handleNavigateBranch,
    toggleRail,
    toggleSidebar,
    handleViewPropertyDetails,

    // Deal Analyzer
    dealAnalyzer,
    openDealAnalyzer,
    closeDealAnalyzer,

    // Report Drawer
    reportDrawer,
    openReportDrawer,
    closeReportDrawer,
    generateReportWithType,
    clearReport,
    updateLatestPnlOutput,

    // Thinking / Tools
    thinking,
    completedTools,
    reasoningSteps, // 🚀 NEW: Real-time reasoning steps
    handleRegenerate,
    refreshToolResults,
    toolResultsByThread,
    isFetchingToolResults,
    toolMemoryError,
    clearToolMemoryError,

    // Stream control
    streamError,
    cancelStream,

    // Chat management
    handlePinChat,
    handleArchiveChat,
    updateChatTitle,
    isCurrentChatTemporary,
    setIsCurrentChatTemporary,
    currentMode,
    setCurrentMode: handleModeChange,

    // Voice mode
    handleVoiceTurn,
    handleVoiceStart,

    // Command Center
    commandCenter,
    selectProperty,
    addToComparisonDock,
    removeFromComparisonDock,
    clearComparisonDock,
    startComparison,
    togglePanePin,
  };

}
