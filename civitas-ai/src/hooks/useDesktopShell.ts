// FILE: src/hooks/useDesktopShell.ts
import { useState, useEffect, useRef } from 'react';
import type { Message } from '../types/chat';
import { generateChatTitle } from '../utils/chatTitles';
import { ChatService } from '../services/ChatService';
import { useAuth } from '../contexts/AuthContext';
import { analyzeFile } from '../services/fileService';
// import { usePortfolio } from '../contexts/PortfolioContext';

export interface ChatSession {
  id: string;
  title?: string;
  timestamp?: string;
  createdAt?: string;
  isActive?: boolean;
  messages: Message[];
}

export type TabType = 'chat' | 'settings';

const NAVIGABLE_TABS: TabType[] = ['chat', 'settings'];
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
  };

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

        if (currentAttachment) {
          try {
            const analysisPrompt = trimmedMessage || `Analyze ${currentAttachment.name} and summarize the key details.`;
            const analysisResult = await analyzeFile(currentAttachment, analysisPrompt);
            fullResponse = analysisResult.analysis || 'Here is what I found in that attachment.';
            toolResults = analysisResult.metadata;
          } catch (error) {
            console.error('File analysis failed:', error);
            fullResponse = "I couldn't analyze that attachment right now. Please share the important details in chat or try again.";
          }
        } else {
          // Pass user context to backend
          const userContext = {
            name: user?.name?.split(' ')[0] || 'there',
            onboarding_completed: false
          };
          const response = await ChatService.generateSTRResponse(trimmedMessage, userContext, messages);
          fullResponse = response.content;
          navigate = response.navigate;
          action = response.action;
          toolResults = response.tool_results;
          tour = response.tour;
        }
        
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
              if (isComplete && toolResults) {
                assistantMessage.tool_results = toolResults;
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

  const handleAction = (actionValue: string, _actionContext?: any) => {
    if (actionValue === 'navigate_settings') {
      setActiveTab('settings');
      setIsSidebarOpen(false);
      return;
    }

    if (['generate_report', 'view_report', 'navigate_market_insights'].includes(actionValue)) {
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
    handleAction
  };
}
