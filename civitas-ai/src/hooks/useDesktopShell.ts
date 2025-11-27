// FILE: src/hooks/useDesktopShell.ts
import { useState, useEffect, useRef, useCallback } from 'react';
import type { Message } from '../types/chat';
import type { InvestmentStrategy, PnLOutput } from '../types/pnl';
import type { InvestmentReportFormat } from '../types/enums';
import type { ReportData } from '../components/reports/ReportDrawer';
import { generateChatTitle } from '../utils/chatTitles';
import { ChatService } from '../services/ChatService';
import { useAuth } from '../contexts/AuthContext';
import { analyzeFile, askAboutFile } from '../services/fileService';
import { fetchToolResults } from '../services/chatApi';
import { generateReport } from '../services/agentsApi';
import type { ToolResultRecord } from '../types/toolResults';
import { toolResultsToRecords, toolResultsToToolCards } from '../utils/toolResults';
import { logger } from '../utils/logger';
// import { usePortfolio } from '../contexts/PortfolioContext';

export interface ChatSession {
  id: string;
  title?: string;
  timestamp?: string;
  createdAt?: string;
  isActive?: boolean;
  messages: Message[];
}

export type TabType = 'chat' | 'settings' | 'reports';

// Deal Analyzer state
export interface DealAnalyzerState {
  isOpen: boolean;
  propertyId: string | null;
  purchasePrice: number;
  strategy: InvestmentStrategy;
  propertyAddress?: string;
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

const NAVIGABLE_TABS: TabType[] = ['chat', 'settings', 'reports'];
const isNavigableTab = (tab?: string): tab is TabType =>
  !!tab && NAVIGABLE_TABS.includes(tab as TabType);

export function useDesktopShell() {
  // Get user context
  const { user } = useAuth();
  // Get portfolio context for tracking properties
  // const { addProperty } = usePortfolio();
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

  const handleStopStream = () => {
    if (streamIntervalId) {
      clearInterval(streamIntervalId);
      setStreamIntervalId(null);
      setIsLoading(false);
      setMessages(prev => prev.map(m => m.isStreaming ? { ...m, isStreaming: false } : m));
    }
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
    propertyAddress?: string
  ) => {
    setDealAnalyzer({
      isOpen: true,
      propertyId,
      purchasePrice,
      strategy,
      propertyAddress,
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
      setActiveTab('settings');
      setIsSidebarOpen(false);
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

    if (actionValue === 'skip') {
      console.log('User skipped action');
    }
  };

  return {
    // State
    chatHistory,
    setChatHistory,
    activeChatId,
    messages,
    isRailCollapsed,
    isSidebarOpen,
    activeTab,
    isLoading,
    showSuggestions,
    attachment,
    dealAnalyzer,
    reportDrawer,
    currentThreadId,
    toolResultsByThread,
    isFetchingToolResults,
    toolMemoryError,
    
    // Setters
    setIsSidebarOpen,
    setActiveTab,
    setAttachment,
    
    // Handlers
    toggleRail,
    toggleSidebar,
    handleSendMessage,
    handleStopStream,
    handleNewChat,
    handleLoadChat,
    handleDeleteChat,
    handleAction,
    openDealAnalyzer,
    closeDealAnalyzer,
    openReportDrawer,
    closeReportDrawer,
    generateReportWithType,
    clearReport,
    updateLatestPnlOutput,
    refreshToolResults,
    clearToolMemoryError
  };
}
