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
// import { usePortfolio } from '../contexts/PortfolioContext';

const envApiUrl = import.meta.env.VITE_DATALAYER_API_URL;
// In development, use relative URLs to leverage Vite proxy
// In production, use absolute URL from environment
const CIVITAS_API_BASE = import.meta.env.DEV 
  ? '' // Relative URL - Vite proxy will handle /api/* requests
  : (envApiUrl && typeof envApiUrl === 'string' && envApiUrl.startsWith('http')) 
    ? envApiUrl 
    : 'http://localhost:8001';
const CIVITAS_API_KEY = import.meta.env.VITE_API_KEY;

export interface ChatSession {
  id: string;
  title?: string;
  timestamp?: string;
  createdAt?: string;
  isActive?: boolean;
  isPinned?: boolean;
  isArchived?: boolean;
  messages: Message[];
}

import { useToast } from './useToast';

export type TabType = 'chat' | 'reports' | 'portfolio' | 'analysis' | 'files';

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

const NAVIGABLE_TABS: TabType[] = ['chat', 'reports', 'portfolio', 'analysis', 'files'];
const isNavigableTab = (tab?: string): tab is TabType =>
  !!tab && NAVIGABLE_TABS.includes(tab as TabType);

import { usePreferencesStore } from '../stores/preferencesStore';

export function useDesktopShell() {
  // Get user context
  const { user } = useAuth();
  const { showToast } = useToast();
  const {
    sync,
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

  // Track latest P&L output for report generation
  const [latestPnlOutput, setLatestPnlOutput] = useState<PnLOutput | null>(null);

  // Thinking state for SSE streaming
  const [thinking, setThinking] = useState<ThinkingState | null>(null);
  const [completedTools, setCompletedTools] = useState<CompletedTool[]>([]);
  const [streamError, _setStreamError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const streamContentRef = useRef<string>('');
  const currentToolsRef = useRef<CompletedTool[]>([]);

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
            'info',
            undefined,
            6000
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

  // Reset thinking state
  const resetThinkingState = useCallback(() => {
    setThinking({
      status: 'Thinking...',
      title: 'Analyzing your request',
      explanation: 'I\'m processing your question to determine the best approach and tools to use.',
      icon: '🤔'
    });
    setCompletedTools([]);
    streamContentRef.current = '';
    currentToolsRef.current = [];
  }, []);

  // Handle SSE stream event
  const handleStreamEvent = useCallback((event: StreamEvent, messageId: string) => {
    switch (event.type) {
      case 'init':
        if (event.thread_id) {
          updateThreadIdForChat(activeChatId, event.thread_id);
        }
        break;

      case 'thinking':
        setThinking({
          title: event.title,
          status: event.status,
          explanation: event.explanation,
          source: event.source,
          icon: event.icon,
          tool: event.tool,
          // Map snake_case SSE fields to camelCase
          filtersApplied: event.filters_applied,
          userContext: event.user_context ? {
            budgetMax: event.user_context.budget_max,
            dislikes: event.user_context.dislikes,
            favoriteMarkets: event.user_context.favorite_markets,
            strategy: event.user_context.strategy,
          } : undefined,
        });
        break;

      case 'tool_start':
        setThinking({
          title: event.title,
          status: event.thinking,
          explanation: event.explanation,
          source: event.source,
          icon: event.icon,
          tool: event.tool,
        });
        break;

      case 'tool_end':
        setThinking(null);
        if (event.summary) {
          const newTool: CompletedTool = {
            tool: event.tool,
            summary: event.summary!,
            icon: event.icon || '✓',
            data: event.data,
            reason: event.reason,
            suggestion: event.suggestion,
          };

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
        setThinking(null);
        streamContentRef.current += event.content;
        setMessages(prev => {
          const filtered = prev.filter(m => m.id !== messageId);

          // Map completed tools to ToolCards
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
                    estimated_monthly_cash_flow: deal.estimated_rent ? (deal.estimated_rent - (deal.list_price * 0.007)) : 0, // Rough estimate if missing
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
            content: streamContentRef.current,
            role: 'assistant',
            type: 'assistant',
            timestamp: new Date(),
            isStreaming: true,
            tools: toolCards.length > 0 ? toolCards : undefined
          } as Message];
        });
        break;

      case 'done':
        setThinking(null);
        setIsLoading(false);
        setMessages(prev => prev.map(m =>
          m.id === messageId ? { ...m, isStreaming: false } : m
        ));
        break;


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
  }, [activeChatId, updateThreadIdForChat]);

  // Send message with SSE streaming
  const sendMessageWithStream = useCallback(async (message: string, options?: { skipUserMessage?: boolean }) => {
    if (!message.trim()) return;

    // Cancel any existing stream
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Only add user message if NOT skipping (e.g. not regenerating)
    if (!options?.skipUserMessage) {
      const userMessage: Message = ChatService.createUserMessage(message.trim());
      setMessages(prev => [...prev, userMessage]);
    }

    setIsLoading(true);
    resetThinkingState();

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
        clientLocation
      } = usePreferencesStore.getState();

      const response = await fetch(`${CIVITAS_API_BASE}/api/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${CIVITAS_API_KEY}`,
          'X-Api-Key': CIVITAS_API_KEY
        },
        body: JSON.stringify({
          message: message.trim(),
          stream: true,
          thread_id: effectiveThreadId,
          user_preferences: {
            budget: budgetRange ? `up to $${budgetRange.max.toLocaleString()}` : undefined,
            strategy: defaultStrategy || undefined,
            dislikes: interactionProfile?.dislikes || [],
            favorite_markets: favoriteMarkets || [],
            financial_dna: financialDna || undefined,
            client_location: clientLocation || undefined
          }
        }),
      }); if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const jsonStr = line.slice(6).trim();
            if (jsonStr === '[DONE]' || jsonStr === '') continue;

            try {
              const data = JSON.parse(jsonStr) as StreamEvent;
              handleStreamEvent(data, messageId);
            } catch {
              // Skip invalid JSON
            }
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
  }, [currentThreadId, user, resetThinkingState, handleStreamEvent]);

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
  const handleSendMessage = (message: string) => {
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

    // Get AI response from Civitas API
    const delay = 1000 + Math.random() * 1000;
    setTimeout(async () => {
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
            undefined,
            currentThreadId || undefined
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

        // Auto-track properties from search results (temporarily disabled)
        /*
        if (metadata?.properties && Array.isArray(metadata.properties)) {
          metadata.properties.forEach((prop: any) => {
            try {
              addProperty({
                address: prop.address || prop.full_address || 'Unknown Address',
                city: prop.city || extractCity(prop.location),
                state: prop.state || extractState(prop.location),
                zip: prop.zip || prop.zipcode || '',
                type: 'searched',
                metadata: {
                  price: prop.price || prop.list_price,
                  bedrooms: prop.bedrooms || prop.beds,
                  bathrooms: prop.bathrooms || prop.baths,
                  sqft: prop.sqft || prop.square_feet,
                }
              });
              console.log('✅ Auto-tracked property:', prop.address || prop.location);
            } catch (error) {
              console.error('Failed to track property:', error);
            }
          });
        }
        
        // Helper functions for extracting location
        const extractCity = (location: string) => location?.split(',')[0]?.trim() || '';
        const extractState = (location: string) => location?.split(',')[1]?.trim() || '';
        */

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
    }, delay);
  };

  const handleNewChat = () => {
    if (messages.length > 0) {
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
  };

  const handleLoadChat = (chatId: string) => {
    const chat = chatHistory.find(c => c.id === chatId);
    if (!chat) return;

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

  const handleDeleteChat = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (chatHistory.length === 1) return;

    const updatedHistory = chatHistory.filter(c => c.id !== chatId);
    setChatHistory(updatedHistory);

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
    setDealAnalyzer({
      isOpen: true,
      propertyId,
      purchasePrice,
      strategy,
      propertyAddress,
      initialOverrides,
    });
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
        report_type: reportType,
        export_format: 'text',
        property_address: reportDrawer.propertyAddress,
      });

      if (!response.success) {
        throw new Error(response.message || 'Report generation failed');
      }

      const reportData: ReportData = {
        content: response.report,
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
      // Send a hidden prompt or explicit prompt
      sendMessageWithStream("Explain that to me like I'm 5 years old.");
      return;
    }

    if (actionValue === 'skip') {
      console.log('User skipped action');
    }
  };

  // Handle viewing property details
  const handleViewPropertyDetails = useCallback((property: any) => {
    console.log('[useDesktopShell] handleViewPropertyDetails called with:', property);
    setActiveProperty(property);
    setActiveTab('analysis');
  }, []);

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
  };

}
