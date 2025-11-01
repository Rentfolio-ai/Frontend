// FILE: src/hooks/useDesktopShell.ts
import { useState, useEffect, useRef } from 'react';
import type { Message } from '../types/chat';
import { generateChatTitle } from '../utils/chatTitles';
import { ChatService } from '../services/ChatService';
import { useReportsStore } from '../stores/reportsStore';
import { generateReport, saveReport } from '../services/agentsApi';
import { useAuth } from '../contexts/AuthContext';
// import { usePortfolio } from '../contexts/PortfolioContext';

export interface ChatSession {
  id: string;
  title?: string;
  timestamp?: string;
  isActive?: boolean;
  messages: Message[];
}

export type TabType = 'chat' | 'properties' | 'portfolio' | 'market' | 'reports' | 'settings';

export function useDesktopShell() {
  // Get user context
  const { user } = useAuth();
  // Get portfolio context for tracking properties
  // const { addProperty } = usePortfolio();
  const { addReport } = useReportsStore();
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
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
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

  // Cleanup interval
  useEffect(() => {
    return () => {
      if (streamIntervalId) {
        clearInterval(streamIntervalId);
      }
    };
  }, [streamIntervalId]);
  
  // Cleanup attachment URLs
  useEffect(() => {
    return () => {
      attachmentUrlsRef.current.forEach(url => URL.revokeObjectURL(url));
      attachmentUrlsRef.current = [];
    };
  }, []);

  // Helper functions
  const clearAttachments = () => {
    attachmentUrlsRef.current.forEach(url => URL.revokeObjectURL(url));
    attachmentUrlsRef.current = [];
    setAttachment(null);
  };

  const toggleRail = () => {
    const newState = !isRailCollapsed;
    setIsRailCollapsed(newState);
    localStorage.setItem('civitas-rail-collapsed', JSON.stringify(newState));
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Chat handlers
  const handleSendMessage = (message: string) => {
    if (!message.trim() && !attachment) return;

    // Create user message with attachment if present
    const attachmentInfo = attachment 
      ? {
          name: attachment.name,
          type: attachment.type,
          url: URL.createObjectURL(attachment)
        }
      : undefined;
    
    const userMessage: Message = ChatService.createUserMessage(message, attachmentInfo);

    if (userMessage.attachment?.url) {
      attachmentUrlsRef.current.push(userMessage.attachment.url);
    }

    setMessages(prev => [...prev, userMessage]);
    setAttachment(null);
    setIsLoading(true);
    
    // Get AI response from Civitas API
    const delay = 1000 + Math.random() * 1000;
    setTimeout(async () => {
      try {
        // Pass user context to backend
        const userContext = {
          name: user?.name?.split(' ')[0] || 'there',
          onboarding_completed: false
        };
        const response = await ChatService.generateSTRResponse(message, userContext, messages);
        const fullResponse = response.content;
        const navigate = response.navigate;
        const action = response.action; // Get action data from backend
        // const metadata = response.metadata; // Get metadata from backend if needed
        const toolResults = response.tool_results; // Get tool_results for context
        
        // Check if this was a market analysis and emit toast event
        if (toolResults?.query_type === 'market_analysis') {
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('market-analysis-saved'));
          }, 1000); // Small delay so message appears first
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
              return [
                ...filtered,
                assistantMessage as Message
              ];
            });
          },
          () => {
            setStreamIntervalId(null);
            setIsLoading(false);
            
            // Handle navigation after message is displayed (only if explicitly set to a valid tab)
            if (navigate && typeof navigate === 'string' && ['properties', 'portfolio', 'market', 'reports', 'settings'].includes(navigate)) {
              setTimeout(() => {
                setActiveTab(navigate as TabType);
              }, 800); // Small delay so user sees the message
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
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
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
    clearAttachments();
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
    clearAttachments();
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
      clearAttachments();
    }
  };

  const handleAction = (actionValue: string, actionContext?: any) => {
    if (actionValue === 'generate_report') {
      // User clicked "Generate Report" button
      console.log('📊 Generate report action triggered');
      console.log('Action context:', actionContext);
      setIsLoading(true);
      
      const delay = 500;
      setTimeout(async () => {
        try {
          // If we have actionContext with valuation data, generate report directly
          if (actionContext?.valuation) {
            console.log('✅ Using direct report generation (valuation path)');
            // Call backend API to generate report
            const reportData = await generateReport({
              valuation: actionContext.valuation,
              export_format: 'text'
            });
            
            // Extract location
            const location = reportData.property_details?.location || actionContext.location || 'Unknown Location';
            const property_address = 'Property Address'; // Address not in property_details type
            const title = `Investment Analysis - ${location}`;
            
            // Save report to backend (in-memory storage)
            await saveReport({
              title,
              location,
              property_address,
              report_content: reportData.report,
              property_details: reportData.property_details
            });
            
            // Also save to local store for immediate display
            addReport({
              title,
              content: reportData.report,
              location,
              property_details: reportData.property_details,
              type: 'property_analysis'
            });
            
            // Emit event for toast notification
            window.dispatchEvent(new CustomEvent('report-saved'));
            
            // Show success message with action button to view report
            const successMessage: Message = {
              id: `${Date.now() + 1}`,
              content: '✅ Report generated and saved successfully!',
              role: 'assistant',
              type: 'assistant',
              timestamp: new Date(),
              isStreaming: false,
              action: {
                type: 'confirm',
                message: 'Your investment report is ready',
                options: [
                  { label: 'View Report', action: 'view_report' },
                  { label: 'Stay Here', action: 'skip' }
                ]
              }
            };
            setMessages(prev => [...prev, successMessage]);
            setIsLoading(false);
            
          } else {
          // Fallback: Let backend handle it through chat
            console.log('🔄 Using backend chat service for report generation');
            const userContext = {
              name: user?.name?.split(' ')[0] || 'there',
              onboarding_completed: false
            };
            
            const response = await ChatService.generateSTRResponse(
              'User confirmed report generation',
              userContext,
              messages,
              actionContext
            );
            
            const fullResponse = response.content;
            const navigate = response.navigate;
            const action = response.action;
            
            console.log('📨 Backend response:', { navigate, action: action?.type });
            
            // If backend returned generated report data, save it to backend
            if (action && action.type === 'report_generated') {
              const location = action.location || 'Unknown Location';
              const title = `Investment Report - ${location} - ${new Date().toLocaleString()}`;
              
              // Save comprehensive multi-property report to backend
              await saveReport({
                title,
                location,
                property_address: `${action.properties?.length || 0} properties`,
                report_content: action.report_text,
                property_details: {
                  property_count: action.properties?.length,
                  properties: action.properties
                }
              });
              
              console.log('✅ Multi-property report saved to backend');
              
              // Emit event for toast notification
              window.dispatchEvent(new CustomEvent('report-saved'));
              
              // IMPORTANT: Don't save to local store here
              // The backend is the source of truth, and ReportsTabView will fetch from there
              // This prevents duplicate reports in the UI
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
                    action: isComplete ? action : undefined
                  };
                  // Include tool_results for conversation context if available from report generation
                  if (isComplete && (response as any).tool_results) {
                    assistantMessage.tool_results = (response as any).tool_results;
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
                
                console.log('🔍 Stream complete. Navigate value:', navigate);
                
                // Don't auto-navigate, let user click button instead
                // (Navigation handled by view_report action)
              }
            );
            
            setStreamIntervalId(intervalId);
          }
        } catch (error) {
          console.error('Failed to generate report:', error);
          setIsLoading(false);
          
          const errorMessage: Message = {
            id: `error_${Date.now()}`,
            content: "❌ I'm having trouble generating the report. Please try again.",
            role: 'assistant',
            type: 'assistant',
            timestamp: new Date(),
            isStreaming: false
          };
          setMessages(prev => [...prev, errorMessage]);
        }
      }, delay);
    } else if (actionValue === 'view_report') {
      // User clicked "View Report" - navigate to reports tab
      console.log('📊 User chose to view report - navigating to reports tab');
      setActiveTab('reports');
    } else if (actionValue === 'navigate_market_insights') {
      // User clicked "View in Market Insights" - navigate to market tab
      console.log('📊 User chose to view market insights - navigating to market tab');
      setActiveTab('market');
    } else if (actionValue === 'skip') {
      // User clicked "No, thanks" or "Stay Here" - just hide the buttons
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
