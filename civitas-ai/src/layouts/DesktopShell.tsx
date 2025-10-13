// FILE: src/layouts/DesktopShell.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from '../components/sidebar/Sidebar';
import { MessageList } from '../components/chat/MessageList';
import type { Message } from '../types/chat';
import { Composer } from '../components/chat/Composer';
import { generateChatTitle } from '../utils/chatTitles';
import { SmartSuggestions } from '../components/chat/SmartSuggestions';
import { AgentAvatar } from '../components/common/AgentAvatar';
import { useAuth } from '../contexts/AuthContext';

interface DesktopShellProps {
  children?: React.ReactNode;
}

// State theme colors
const STATE_THEMES = {
  'California': { primary: '#F59E0B', secondary: '#FBBF24', gradient: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)' },
  'Texas': { primary: '#DC2626', secondary: '#EF4444', gradient: 'linear-gradient(135deg, #DC2626 0%, #EF4444 100%)' },
  'Florida': { primary: '#06B6D4', secondary: '#22D3EE', gradient: 'linear-gradient(135deg, #06B6D4 0%, #22D3EE 100%)' },
  'New York': { primary: '#6366F1', secondary: '#818CF8', gradient: 'linear-gradient(135deg, #6366F1 0%, #818CF8 100%)' },
  'Colorado': { primary: '#10B981', secondary: '#34D399', gradient: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)' },
  'Tennessee': { primary: '#8B5CF6', secondary: '#A78BFA', gradient: 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)' },
  'Arizona': { primary: '#EF4444', secondary: '#F87171', gradient: 'linear-gradient(135deg, #EF4444 0%, #F87171 100%)' },
  'Georgia': { primary: '#F97316', secondary: '#FB923C', gradient: 'linear-gradient(135deg, #F97316 0%, #FB923C 100%)' },
  'Nevada': { primary: '#EC4899', secondary: '#F472B6', gradient: 'linear-gradient(135deg, #EC4899 0%, #F472B6 100%)' },
};

const DEFAULT_THEME = { primary: '#3b82f6', secondary: '#2563eb', gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' };

export const DesktopShell: React.FC<DesktopShellProps> = () => {
  const { user, signOut } = useAuth();
  
  // Import ChatSession from Sidebar component
  type ChatSession = {
    id: string;
    title?: string;
    timestamp?: string;
    isActive?: boolean;
    messages: Message[];
  };

  // Persistent chat history
  const [chatHistory, setChatHistory] = useState<ChatSession[]>(() => {
    const saved = typeof window !== 'undefined'
      ? window.localStorage.getItem('civitas-chat-history')
      : null;
    if (!saved) return [];

    const parsed = JSON.parse(saved);
    // Migrate legacy ChatHistoryItem[] format
    return parsed.map((chat: any) => ({
      id: chat.id,
      title: chat.title,
      timestamp: chat.timestamp,
      messages: chat.messages || []
    }));
  });
  const [activeChatId, setActiveChatId] = useState<string>(() => {
    const saved = typeof window !== 'undefined' ? window.localStorage.getItem('civitas-active-chat-id') : null;
    return saved || 'main';
  });
  // Theme state
  const [theme] = useState<'light' | 'dark'>(
    typeof window !== 'undefined' && window.localStorage.getItem('civitas-theme') === 'dark' ? 'dark' : 'light'
  );

  // Selected state for theme customization
  const [selectedState, setSelectedState] = useState<string>(() => {
    const saved = typeof window !== 'undefined' ? window.localStorage.getItem('civitas-selected-state') : null;
    return saved || '';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    window.localStorage.setItem('civitas-theme', theme);
  }, [theme]);

  // Persist selected state
  useEffect(() => {
    if (selectedState) {
      window.localStorage.setItem('civitas-selected-state', selectedState);
    }
  }, [selectedState]);

  // Get current theme colors based on selected state
  const currentTheme = selectedState && STATE_THEMES[selectedState as keyof typeof STATE_THEMES] 
    ? STATE_THEMES[selectedState as keyof typeof STATE_THEMES] 
    : DEFAULT_THEME;

  const [isRailCollapsed, setIsRailCollapsed] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  // Chat message state
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = typeof window !== 'undefined' ? window.localStorage.getItem('civitas-chat-messages') : null;
    return saved ? JSON.parse(saved) : [];
  });
  const [streamIntervalId, setStreamIntervalId] = useState<ReturnType<typeof setInterval> | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [attachment, setAttachment] = useState<File | null>(null);
  // Create a ref to track attachment URLs that persists across renders
  const attachmentUrlsRef = useRef<string[]>([]);
  // Preferences state
  const [emailNotifications, setEmailNotifications] = useState(() => {
    const saved = typeof window !== 'undefined' ? window.localStorage.getItem('civitas-email-notifications') : null;
    return saved ? JSON.parse(saved) : true;
  });
  const [marketAlerts, setMarketAlerts] = useState(() => {
    const saved = typeof window !== 'undefined' ? window.localStorage.getItem('civitas-market-alerts') : null;
    return saved ? JSON.parse(saved) : true;
  });

  // Helper to get current time
  const getTime = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Handle user message
  const handleSendMessage = (message: string) => {
    if (!message.trim() && !attachment) return;
    let newMsg: any = {
      id: `${Date.now()}`,
      content: message,
      role: 'user',
      timestamp: getTime()
    };
    if (attachment) {
      const url = URL.createObjectURL(attachment);
      newMsg.attachment = {
        name: attachment.name,
        type: attachment.type,
        url: url
      };
      // Track the URL in ref (for cleanup)
      attachmentUrlsRef.current.push(url);
    }
    setMessages((prev) => [
      ...prev,
      newMsg
    ]);
    // We already created a URL for this attachment (if one exists), but we'll keep the URL active
    // Just clear the attachment input state without revoking URLs
    setAttachment(null); 
    setIsLoading(true);
    
    // Add 1-2 second delay before AI response starts (simulating thinking)
    const delay = 1000 + Math.random() * 1000; // Random delay between 1-2 seconds
    setTimeout(() => {
      // Generate human-like STR-focused responses
      const getSTRResponse = (userMessage: string): string => {
        const lower = userMessage.toLowerCase();
        
        // Property analysis questions
        if (lower.includes('property') || lower.includes('address') || lower.includes('location')) {
          return "Great question! 🏡 For property analysis, I'd need the address or location you're considering. Once you share that, I can pull up:\n\n• Recent comparable STR listings and their revenue\n• Average occupancy rates in that area\n• Seasonal demand trends\n• Local regulations and permit requirements\n• Estimated startup costs and ROI projections\n\nJust drop the address or city you're interested in, and I'll get to work!";
        }
        
        // Market research questions
        if (lower.includes('market') || lower.includes('city') || lower.includes('where')) {
          return "Love that you're thinking strategically! 📊 The best STR markets right now really depend on your investment goals. Are you looking for:\n\n• High cash flow with strong year-round demand?\n• Appreciation potential in emerging markets?\n• Low competition with underserved demand?\n• Specific regions or budget ranges?\n\nTell me more about your criteria, and I can recommend some markets that might be perfect for you.";
        }
        
        // Revenue/ROI questions
        if (lower.includes('revenue') || lower.includes('roi') || lower.includes('money') || lower.includes('profit')) {
          return "Ah, the bottom line – my favorite topic! 💰 STR returns can vary wildly based on location, property type, and how well you manage it.\n\nTypically, I see successful STRs generating:\n• 8-15% cash-on-cash returns in good markets\n• 15-25%+ in exceptional locations with great management\n• Higher returns during peak seasons\n\nTo give you a specific analysis, I'd need to know more about the property you're considering. Want to share some details?";
        }
        
        // Regulations/legal questions
        if (lower.includes('regulation') || lower.includes('legal') || lower.includes('permit') || lower.includes('law')) {
          return "Smart to think about regulations upfront – this trips up a lot of new investors! 📋\n\nSTR regulations vary dramatically by location. Some cities welcome them with open arms, others have strict caps or outright bans.\n\nWhich market are you looking at? I can check:\n• Registration/licensing requirements\n• Occupancy limits and rental restrictions\n• Tax obligations (TOT, sales tax, etc.)\n• HOA restrictions if applicable\n\nThis stuff matters way more than people think!";
        }
        
        // Pricing/occupancy optimization
        if (lower.includes('price') || lower.includes('pricing') || lower.includes('occupancy') || lower.includes('optimize')) {
          return "Pricing is both an art and a science! 🎯 Get it right and you'll maximize revenue while keeping occupancy high.\n\nHere's what I typically recommend:\n• Dynamic pricing based on demand, seasonality, and local events\n• Competitive analysis against similar listings\n• Weekend vs. weekday pricing strategies\n• Minimum stay requirements for peak periods\n\nAre you managing an existing property or planning for a future one? I can give you more specific guidance based on your situation.";
        }
        
        // General/other questions
        return "That's a great question! 🤔 I'm here to help you navigate the STR investment world.\n\nTo give you the most useful answer, could you tell me a bit more about:\n• What stage you're at (researching, analyzing, or already managing properties?)\n• Any specific markets or properties you're interested in?\n• Your main goals (cash flow, appreciation, portfolio growth?)\n\nThe more context you share, the better I can tailor my advice to your situation!";
      };
      
      const fullResponse = getSTRResponse(message);
      let current = '';
      let i = 0;
      const streamId = `${Date.now() + 1}`;
      const interval = setInterval(() => {
        i++;
        current = fullResponse.slice(0, i);
        setMessages((prev) => {
          const filtered = prev.filter(m => m.id !== streamId);
          return [
            ...filtered,
            {
              id: streamId,
              content: current,
              role: 'assistant',
              timestamp: getTime(),
              isStreaming: i < fullResponse.length
            }
          ];
        });
        if (i >= fullResponse.length) {
          clearInterval(interval);
          setStreamIntervalId(null);
          setIsLoading(false);
        }
      }, 50); // Slower typing for more conversational feel
      setStreamIntervalId(interval);
    }, delay); // Close the setTimeout
  };

  // Interrupt streaming
  const handleStopStream = () => {
    if (streamIntervalId) {
      clearInterval(streamIntervalId);
      setStreamIntervalId(null);
      setIsLoading(false);
      // Remove isStreaming flag from last assistant message
      setMessages((prev) => prev.map(m => m.isStreaming ? { ...m, isStreaming: false } : m));
    }
  };

  useEffect(() => {
    const savedRailState = localStorage.getItem('civitas-rail-collapsed');
    if (savedRailState !== null) {
      setIsRailCollapsed(JSON.parse(savedRailState));
    }
  }, []);

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

  // Persist chat history, active chat, and messages to localStorage
  useEffect(() => {
    window.localStorage.setItem('civitas-chat-history', JSON.stringify(chatHistory));
  }, [chatHistory]);

  useEffect(() => {
    window.localStorage.setItem('civitas-active-chat-id', activeChatId);
  }, [activeChatId]);

  useEffect(() => {
    window.localStorage.setItem('civitas-chat-messages', JSON.stringify(messages));
    
    // Auto-save current chat to history when messages change
    if (messages.length > 0) {
      const firstUserMessage = messages.find(msg => msg.role === 'user' || msg.type === 'user')?.content || '';
      
      setChatHistory(prev => {
        const chatExists = prev.some(chat => chat.id === activeChatId);
        
        if (chatExists) {
          // Update existing chat in history
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

  // Cleanup interval when component unmounts or when streamIntervalId changes
  useEffect(() => {
    return () => {
      // Clean up interval on unmount or when streamIntervalId changes
      if (streamIntervalId) {
        clearInterval(streamIntervalId);
      }
    };
  }, [streamIntervalId]);
  
  // Cleanup object URLs only on component unmount
  useEffect(() => {
    return () => {
      // Revoke all attachment URLs on unmount using the ref
      attachmentUrlsRef.current.forEach(url => URL.revokeObjectURL(url));
      // Clear the ref array
      attachmentUrlsRef.current = [];
    };
  }, []);

  // Helper function to clean up attachment URLs and reset attachment state
  const clearAttachments = () => {
    // Revoke all current attachment URLs to prevent memory leaks
    attachmentUrlsRef.current.forEach(url => URL.revokeObjectURL(url));
    // Clear the ref array
    attachmentUrlsRef.current = [];
    // Reset state
    setAttachment(null);
  };

  const toggleRail = () => {
    const newState = !isRailCollapsed;
    setIsRailCollapsed(newState);
    localStorage.setItem('civitas-rail-collapsed', JSON.stringify(newState));
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  // Helper to start a new chat
  const handleNewChat = () => {
    // Save current chat to history if it has messages and isn't already saved
    if (messages.length > 0) {
      const firstUserMessage = messages.find(msg => msg.role === 'user' || msg.type === 'user')?.content || '';
      const chatExists = chatHistory.some(chat => chat.id === activeChatId);
      
      if (!chatExists) {
        // Add new chat to history
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
        // Update existing chat
        setChatHistory(prev => prev.map(chat =>
          chat.id === activeChatId
            ? { ...chat, messages: [...messages] }
            : chat
        ));
      }
    }
    
    // Clear current chat
    setMessages([]);
    clearAttachments();
    setIsLoading(false);
    if (streamIntervalId) {
      clearInterval(streamIntervalId);
      setStreamIntervalId(null);
    }
    
    // Create new chat
    const newId = Date.now().toString();
    setActiveChatId(newId);
  };

  // Load a chat from history
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

  // Handle chat deletion
  const handleDeleteChat = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // Prevent deletion if it's the only chat
    if (chatHistory.length === 1) return;
    
    // Remove the chat from history
    const updatedHistory = chatHistory.filter(c => c.id !== chatId);
    setChatHistory(updatedHistory);
    
    // If deleting the active chat, switch to another chat
    if (chatId === activeChatId) {
      const nextChat = updatedHistory[0];
      setActiveChatId(nextChat.id);
      setMessages(nextChat.messages || []);
      clearAttachments();
    }
  };

  // Static quick actions
  const quickActions: { label: string; value: string }[] = [
    { label: 'Show me properties under $500k', value: 'Show me properties under $500k' },
    { label: 'Summarize my dashboard', value: 'Summarize my dashboard' },
    { label: 'Generate a market report', value: 'Generate a market report' },
    { label: 'What are the top zip codes?', value: 'What are the top zip codes?' }
  ];

  const [activeTab, setActiveTab] = useState<'chat' | 'properties' | 'portfolio' | 'market' | 'reports' | 'settings'>('chat');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const menuItems = [
    { id: 'chat' as const, label: 'Chat', icon: '💬' },
    { id: 'properties' as const, label: 'Properties', icon: '🏠' },
    { id: 'portfolio' as const, label: 'Portfolio', icon: '💼' },
    { id: 'market' as const, label: 'Market Insights', icon: '📊' },
    { id: 'reports' as const, label: 'Reports', icon: '📈' },
  ];

  const accountMenuItems = [
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <div 
      className="h-screen flex flex-col overflow-hidden transition-all duration-500"
      style={{
        background: selectedState 
          ? `linear-gradient(180deg, ${currentTheme.primary} 0%, ${currentTheme.secondary} 100%)`
          : 'linear-gradient(180deg, #56CCF2 0%, #2F80ED 100%)'
      }}
    >
      {/* Sidebar Menu - Slides from left */}
      {isSidebarOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity duration-300"
            onClick={() => setIsSidebarOpen(false)}
          />
          
          {/* Sidebar Panel */}
          <div 
            className="fixed left-0 top-0 h-full w-80 z-50 flex flex-col shadow-2xl animate-slide-in-left"
            style={{
              background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.95) 50%, rgba(241, 245, 249, 0.92) 100%)',
              backdropFilter: 'blur(24px)',
              boxShadow: '0 0 0 1px rgba(148, 163, 184, 0.1), 0 20px 60px rgba(0, 0, 0, 0.15)',
            }}
          >
            {/* New Chat Button at Top */}
            <div className="p-4 pb-3 border-b" style={{ borderColor: 'rgba(148, 163, 184, 0.15)' }}>
              <button
                onClick={() => {
                  handleNewChat();
                  setActiveTab('chat');
                  setIsSidebarOpen(false);
                }}
                className="w-full px-4 py-3 rounded-xl flex items-center justify-center gap-2.5 transition-all duration-500 hover:scale-[1.02] hover:shadow-lg group"
                style={{
                  background: currentTheme.gradient,
                  boxShadow: `0px 4px 12px ${currentTheme.primary}55, 0px 2px 6px ${currentTheme.secondary}33`,
                }}
              >
                <svg className="w-4 h-4 text-white transition-transform duration-300 group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                <span 
                  className="font-semibold text-sm text-white tracking-wide"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  New Chat
                </span>
              </button>
            </div>

            {/* Chat History Section */}
            {chatHistory.length > 0 && (
              <div className="px-4 py-3 border-b" style={{ borderColor: 'rgba(148, 163, 184, 0.12)' }}>
                <h3 
                  className="text-xs font-bold uppercase tracking-wider mb-3 px-1"
                  style={{ 
                    color: '#64748b', 
                    fontFamily: 'Inter, sans-serif',
                    letterSpacing: '0.1em'
                  }}
                >
                  Recent Chats
                </h3>
                <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                  {chatHistory.slice(0, 10).map((chat) => (
                    <button
                      key={chat.id}
                      onClick={() => handleLoadChat(chat.id)}
                      className={`w-full px-3 py-2.5 rounded-xl flex items-center justify-between gap-2 transition-all duration-300 hover:translate-x-1 hover:shadow-md ${
                        activeChatId === chat.id ? '' : ''
                      }`}
                      style={{
                        background: activeChatId === chat.id 
                          ? `linear-gradient(135deg, ${currentTheme.primary}20 0%, ${currentTheme.secondary}12 100%)`
                          : 'rgba(255, 255, 255, 0.5)',
                        backdropFilter: 'blur(10px)',
                        border: activeChatId === chat.id 
                          ? `1.5px solid ${currentTheme.primary}50`
                          : '1px solid rgba(148, 163, 184, 0.15)',
                        boxShadow: activeChatId === chat.id 
                          ? `0 2px 8px ${currentTheme.primary}25`
                          : '0 1px 3px rgba(0, 0, 0, 0.05)',
                        transition: 'all 0.5s ease'
                      }}
                    >
                      <div className="flex-1 min-w-0 text-left">
                        <p 
                          className="text-sm font-medium truncate"
                          style={{ 
                            color: activeChatId === chat.id ? '#1e40af' : '#334155',
                            fontFamily: 'Inter, sans-serif'
                          }}
                        >
                          {chat.title || 'Untitled Chat'}
                        </p>
                        <p 
                          className="text-xs truncate mt-0.5"
                          style={{ color: '#94a3b8' }}
                        >
                          {chat.timestamp}
                        </p>
                      </div>
                      {chatHistory.length > 1 && (
                        <button
                          onClick={(e) => handleDeleteChat(chat.id, e)}
                          className="p-1 rounded hover:bg-red-100 transition-colors flex-shrink-0"
                        >
                          <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Main Navigation */}
            <div className="flex-1 overflow-y-auto py-6">
              <div className="px-4 space-y-2">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsSidebarOpen(false);
                    }}
                    className={`group w-full px-3 py-2.5 rounded-xl flex items-center gap-3 transition-all duration-300 relative overflow-hidden ${
                      activeTab === item.id
                        ? 'shadow-md'
                        : 'hover:shadow-sm hover:translate-x-1'
                    }`}
                    style={{
                      background: activeTab === item.id 
                        ? `linear-gradient(135deg, ${currentTheme.primary}20 0%, ${currentTheme.secondary}12 100%)`
                        : 'rgba(255, 255, 255, 0.45)',
                      backdropFilter: 'blur(12px)',
                      border: activeTab === item.id 
                        ? `1.5px solid ${currentTheme.primary}50` 
                        : '1px solid rgba(148, 163, 184, 0.15)',
                      boxShadow: activeTab === item.id
                        ? `0 2px 8px ${currentTheme.primary}20`
                        : '0 1px 2px rgba(0, 0, 0, 0.05)',
                      transition: 'all 0.5s ease'
                    }}
                  >
                    {/* Active indicator bar */}
                    {activeTab === item.id && (
                      <div 
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full transition-all duration-500"
                        style={{ 
                          background: currentTheme.gradient,
                          boxShadow: `0 0 8px ${currentTheme.primary}80`
                        }}
                      />
                    )}
                    
                    {/* Icon with background */}
                    <div 
                      className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-500 ${
                        activeTab === item.id ? 'scale-110' : 'group-hover:scale-105'
                      }`}
                      style={{
                        background: activeTab === item.id
                          ? currentTheme.gradient
                          : 'rgba(255, 255, 255, 0.6)',
                        boxShadow: activeTab === item.id
                          ? `0 3px 10px ${currentTheme.primary}55, inset 0 1px 0 rgba(255, 255, 255, 0.2)`
                          : '0 1px 2px rgba(0, 0, 0, 0.05)'
                      }}
                    >
                      <span className={`text-base ${activeTab === item.id ? 'filter brightness-0 invert' : ''}`}>
                        {item.icon}
                      </span>
                    </div>
                    
                    {/* Label */}
                    <span 
                      className="font-semibold text-sm flex-1 text-left transition-colors duration-200"
                      style={{ 
                        fontFamily: 'Inter, -apple-system, sans-serif',
                        color: activeTab === item.id ? '#1e40af' : '#334155'
                      }}
                    >
                      {item.label}
                    </span>
                    
                    {/* Active dot indicator */}
                    {activeTab === item.id && (
                      <div 
                        className="w-1.5 h-1.5 rounded-full animate-pulse transition-all duration-500"
                        style={{ background: currentTheme.primary }}
                      />
                    )}
                  </button>
                ))}
              </div>

              {/* Divider */}
              <div className="my-6 mx-4">
                <div 
                  className="h-px"
                  style={{ 
                    background: 'linear-gradient(90deg, transparent 0%, rgba(148, 163, 184, 0.2) 50%, transparent 100%)'
                  }}
                />
              </div>

              {/* Account Items */}
              <div className="px-4 space-y-2">
                {accountMenuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab('settings');
                      setIsSidebarOpen(false);
                    }}
                    className="group w-full px-3 py-2.5 rounded-xl flex items-center gap-3 transition-all duration-300 hover:shadow-sm hover:translate-x-1"
                    style={{
                      background: 'rgba(255, 255, 255, 0.45)',
                      backdropFilter: 'blur(12px)',
                      border: '1px solid rgba(148, 163, 184, 0.15)',
                      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                    }}
                  >
                    {/* Icon with background */}
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-105"
                      style={{
                        background: 'rgba(255, 255, 255, 0.5)'
                      }}
                    >
                      <span className="text-base">{item.icon}</span>
                    </div>
                    
                    <span 
                      className="font-semibold text-sm flex-1 text-left"
                      style={{ 
                        fontFamily: 'Inter, -apple-system, sans-serif',
                        color: '#334155'
                      }}
                    >
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* User Profile at Bottom */}
            <div 
              className="p-4 border-t" 
              style={{ 
                borderColor: 'rgba(148, 163, 184, 0.15)',
                background: 'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(248, 250, 252, 0.5) 100%)'
              }}
            >
              <div className="flex items-center gap-3">
                <div 
                  className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500"
                  style={{
                    background: currentTheme.gradient,
                    boxShadow: `0 3px 10px ${currentTheme.primary}55, inset 0 1px 0 rgba(255, 255, 255, 0.2)`
                  }}
                >
                  <span className="text-sm font-bold text-white tracking-tight">
                    {user?.name ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) : 'U'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate" style={{ color: '#1e293b', fontFamily: 'Inter, sans-serif' }}>
                    {user?.name || 'User'}
                  </p>
                </div>
                
                {/* Sign Out Button - compact icon only */}
                <button
                  onClick={() => {
                    signOut();
                    setIsSidebarOpen(false);
                  }}
                  className="p-2 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110"
                  style={{
                    background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(220, 38, 38, 0.12) 100%)',
                    border: '1.5px solid rgba(239, 68, 68, 0.25)',
                    color: '#dc2626',
                    boxShadow: '0 2px 6px rgba(239, 68, 68, 0.1)'
                  }}
                  title="Sign Out"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Compact Floating Hamburger Menu */}
      <div className="absolute top-5 left-5 z-30">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="group flex items-center justify-center w-10 h-10 rounded-xl backdrop-blur-xl transition-all duration-200 hover:scale-105"
          style={{
            background: 'rgba(255, 255, 255, 0.2)',
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.3)'
          }}
        >
          <svg className="w-5 h-5 text-white transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Hidden Left Sidebar - can be toggled if needed */}
        <div className={`
          flex-shrink-0 transition-all duration-300 ease-in-out
          ${isSidebarCollapsed ? 'w-0' : 'w-sidebar'}
          ${isSidebarCollapsed ? 'opacity-0' : 'opacity-100'}
        `}>
          <Sidebar
            isCollapsed={isSidebarCollapsed}
            onNewChat={handleNewChat}
            chatHistory={chatHistory}
            onSelectChat={chatId => {
              const chat = chatHistory.find(c => c.id === chatId);
              setMessages(chat ? chat.messages : []);
              clearAttachments(); // Clean up current attachments when switching chats
              setActiveChatId(chatId);
            }}
            onDeleteChat={handleDeleteChat}
            activeChatId={activeChatId}
          />
        </div>

        {/* Center: Main Content Area - Full Width */}
        <div className="flex-1 flex flex-col min-w-0 relative w-full">
          {/* Chat Tab */}
          {activeTab === 'chat' && (
            <>
              {/* Chat Header - Compact Agent Card */}
              <div className="flex-shrink-0 px-8 pt-4 pb-3">
                <div className="max-w-4xl mx-auto">
                  <div 
                    className="inline-flex items-center gap-3 px-4 py-2.5 rounded-xl backdrop-blur-md"
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.06)'
                    }}
                  >
                    {/* Professional Agent Avatar */}
                    <div className="relative flex-shrink-0">
                      <AgentAvatar size="sm" />
                    </div>

                    {/* Agent Info */}
                    <div className="flex flex-col items-center justify-center">
                      <h1 
                        className="text-base font-semibold text-white"
                        style={{ 
                          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                        }}
                      >
                        Civitas
                      </h1>
                      <p 
                        className="text-xs text-white/75"
                        style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
                      >
                        Real Estate Advisor
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Message List - Full height, full width */}
              <div className="flex-1 overflow-y-auto">
                {messages.length === 0 && !isLoading ? (
                  /* Empty State - Welcome Message with Pills */
                  <div className="max-w-4xl mx-auto px-4 md:px-8 pt-12">
                    {/* Agent Welcome Message Bubble */}
                    <div className="flex items-start gap-4 mb-6">
                      <div className="flex-shrink-0">
                        <AgentAvatar />
                      </div>
                      <div className="flex-1">
                        <div 
                          className="rounded-2xl rounded-tl-sm p-6 shadow-lg"
                          style={{
                            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.95) 100%)',
                            backdropFilter: 'blur(12px)',
                            border: '1px solid rgba(255, 255, 255, 0.6)',
                          }}
                        >
                          <div className="space-y-4">
                            <p className="text-gray-800 leading-relaxed text-[15px]">
                              <span className="font-semibold">Hi {user?.name?.split(' ')[0] || 'there'}, I'm really glad you're here.</span>
                            </p>
                            
                            <p className="text-gray-700 leading-relaxed text-[15px]">
                              {selectedState 
                                ? `I'm here to help you find and evaluate short-term rental properties in ${selectedState}. Here's what I can do for you:`
                                : `I'm here to help you find and evaluate short-term rental properties. Here's what I can do for you:`
                              }
                            </p>
                            
                            <p className="text-gray-700 leading-relaxed text-[15px]">
                              <span className="font-medium">🏡 Find Properties:</span> Tell me your criteria (location, price range, number of bedrooms) and I'll help you discover investment-worthy short-term rental properties.
                            </p>
                            
                            <p className="text-gray-700 leading-relaxed text-[15px]">
                              <span className="font-medium">📊 Generate ROI Scores:</span> I'll analyze each property and provide an ROI grade (A, B, C, or D) based on potential returns, market demand, occupancy rates, and investment viability.
                            </p>
                            
                            <p className="text-gray-700 leading-relaxed text-[15px]">
                              <span className="font-medium">📈 Create Reports:</span> Once we've analyzed properties, I can generate comprehensive investment reports that you'll find in your Reports tab, ready to download and share.
                            </p>
                            
                            <p className="text-gray-700 leading-relaxed text-[15px]">
                              Let's get started! Try asking me to "Find properties in [city]" or "Show me STR investments under $500k."
                            </p>
                          </div>
                        </div>
                        <div className="text-xs text-white/60 mt-2 ml-1">Just now</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <MessageList messages={messages} isLoading={isLoading} />
                )}
              </div>
              
              {/* Smart Suggestions */}
              <div 
                className="flex-shrink-0 transition-all duration-300 px-0 md:px-8" 
                style={{ 
                  minHeight: showSuggestions ? 'auto' : '0px', 
                  opacity: showSuggestions ? 1 : 0,
                  overflow: showSuggestions ? 'visible' : 'hidden'
                }}
              >
                {showSuggestions && messages.length > 0 && (
                  <SmartSuggestions 
                    lastMessage={messages[messages.length - 1]?.content || ''}
                    onSuggestionClick={handleSendMessage}
                  />
                )}
              </div>
              
              {/* Composer - Full width */}
              <div className="flex-shrink-0 px-8 py-6">
                <div className="w-full max-w-6xl mx-auto">
                  <Composer onSend={handleSendMessage} aria-label="Chat input" />
                </div>
              </div>
            </>
          )}

          {/* Properties Tab - Immersive Property View */}
          {activeTab === 'properties' && (
            <div className="flex-1 overflow-y-auto">
              <div className="h-full">
                {/* Hero Property View */}
                <div className="relative h-[60vh] overflow-hidden">
                  {/* Property Image */}
                  <img 
                    src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&auto=format&fit=crop" 
                    alt="Luxury Property"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  
                  {/* Property Info Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                    <div className="max-w-6xl mx-auto">
                      <div className="flex items-start justify-between">
                        <div>
                          <h2 className="text-4xl font-bold mb-2">Modern Luxury Villa</h2>
                          <p className="text-xl text-white/90 mb-4">📍 Beverly Hills, California</p>
                          <div className="flex gap-6 text-lg">
                            <span>🛏️ 4 Beds</span>
                            <span>🛁 3 Baths</span>
                            <span>📐 3,200 sq ft</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-bold">$12,500</div>
                          <div className="text-sm text-white/80">per night</div>
                          <div className="mt-2 px-4 py-2 rounded-full bg-green-500/20 backdrop-blur-sm border border-green-400/30">
                            <span className="text-green-300">92% Occupancy</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Property Details */}
                <div className="bg-white/95 backdrop-blur-lg">
                  <div className="max-w-6xl mx-auto px-8 py-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Revenue Card */}
                      <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100">
                        <div className="text-sm font-semibold text-blue-600 mb-2">Monthly Revenue</div>
                        <div className="text-3xl font-bold text-gray-900">$285K</div>
                        <div className="text-sm text-green-600 mt-1">↑ 12% vs last month</div>
                      </div>

                      {/* ROI Card */}
                      <div className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100">
                        <div className="text-sm font-semibold text-green-600 mb-2">Annual ROI</div>
                        <div className="text-3xl font-bold text-gray-900">18.5%</div>
                        <div className="text-sm text-gray-600 mt-1">Above market avg</div>
                      </div>

                      {/* Bookings Card */}
                      <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100">
                        <div className="text-sm font-semibold text-purple-600 mb-2">Next 30 Days</div>
                        <div className="text-3xl font-bold text-gray-900">28 Nights</div>
                        <div className="text-sm text-purple-600 mt-1">2 nights available</div>
                      </div>
                    </div>

                    {/* Amenities */}
                    <div className="mt-8">
                      <h3 className="text-xl font-bold text-gray-900 mb-4">Premium Amenities</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {['🏊 Pool', '🎾 Tennis Court', '🏋️ Gym', '🚗 Parking', '🔥 Fireplace', '🌳 Garden', '📺 Smart TV', '🍳 Gourmet Kitchen'].map((amenity) => (
                          <div key={amenity} className="px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-center">
                            <span className="text-sm font-medium text-gray-700">{amenity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Portfolio Tab */}
          {activeTab === 'portfolio' && (
            <div className="flex-1 overflow-y-auto p-8">
              <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold text-white mb-8">Your STR Portfolio</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="rounded-2xl overflow-hidden shadow-lg" style={{
                      background: 'rgba(255, 255, 255, 0.9)',
                      backdropFilter: 'blur(10px)'
                    }}>
                      <div className="h-48 bg-gradient-to-br from-blue-400 to-blue-600" />
                      <div className="p-6">
                        <h3 className="text-lg font-bold mb-2">Property {i}</h3>
                        <p className="text-sm text-gray-600 mb-4">Miami, FL</p>
                        <div className="flex justify-between text-sm">
                          <span className="text-green-600 font-semibold">$4,200/mo</span>
                          <span className="text-gray-500">85% Occ.</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Market Insights Tab */}
          {activeTab === 'market' && (
            <div className="flex-1 overflow-y-auto p-8">
              <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold text-white mb-8">Market Insights</h1>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {['Top Markets', 'Trending Cities', 'Occupancy Rates', 'Average ADR'].map((title) => (
                    <div key={title} className="rounded-2xl p-6 shadow-lg" style={{
                      background: 'rgba(255, 255, 255, 0.9)',
                      backdropFilter: 'blur(10px)'
                    }}>
                      <h3 className="text-xl font-bold mb-4">{title}</h3>
                      <div className="h-64 flex items-center justify-center text-gray-400">
                        Chart Visualization
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <div className="flex-1 overflow-y-auto p-8">
              <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold text-white mb-8">Reports & Analytics</h1>
                <div className="space-y-4">
                  {['Monthly Performance', 'Q4 2025 Summary', 'Year-End Report', 'Tax Documents'].map((report) => (
                    <div key={report} className="rounded-2xl p-6 shadow-lg flex items-center justify-between" style={{
                      background: 'rgba(255, 255, 255, 0.9)',
                      backdropFilter: 'blur(10px)'
                    }}>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                          <span className="text-2xl">📄</span>
                        </div>
                        <div>
                          <h3 className="font-semibold">{report}</h3>
                          <p className="text-sm text-gray-500">Generated on Oct 13, 2025</p>
                        </div>
                      </div>
                      <button className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700">
                        Download
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="flex-1 overflow-y-auto p-8">
              <div className="max-w-4xl mx-auto space-y-8">
                <h1 className="text-3xl font-bold text-white mb-8">Settings</h1>

                {/* User Information Section */}
                <div className="rounded-2xl p-6 shadow-lg" style={{
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)'
                }}>
                  <h2 className="text-xl font-bold mb-6 text-gray-900">User Information</h2>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={user?.name || ''}
                          readOnly
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-900"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          value={user?.email || ''}
                          readOnly
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-900"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Account Type
                      </label>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-700">
                          Premium Investor
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* State Theme Customization Section */}
                <div className="rounded-2xl p-6 shadow-lg" style={{
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)'
                }}>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">State Theme Customization</h2>
                      <p className="text-sm text-gray-600 mt-1">
                        Customize your experience based on the state you're investing in.
                      </p>
                    </div>
                    {selectedState && (
                      <div 
                        className="px-4 py-2 rounded-lg transition-all duration-500"
                        style={{
                          background: currentTheme.gradient,
                          boxShadow: `0 2px 8px ${currentTheme.primary}50`
                        }}
                      >
                        <div className="text-xs text-white/80 font-medium">Active Theme</div>
                        <div className="text-sm font-bold text-white">{selectedState}</div>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="block text-sm font-medium text-gray-700">
                          {selectedState ? 'Change Your Primary Investment State' : 'Select Your Primary Investment State'}
                        </label>
                        {selectedState && (
                          <button
                            onClick={() => {
                              setSelectedState('');
                              window.localStorage.removeItem('civitas-selected-state');
                            }}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300 hover:scale-105 hover:shadow-md flex items-center gap-1.5"
                            style={{
                              background: 'linear-gradient(135deg, rgba(100, 116, 139, 0.08) 0%, rgba(71, 85, 105, 0.12) 100%)',
                              border: '1.5px solid rgba(100, 116, 139, 0.2)',
                              color: '#475569'
                            }}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                              <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                              <line x1="10" y1="11" x2="10" y2="17"/>
                              <line x1="14" y1="11" x2="14" y2="17"/>
                            </svg>
                            Reset to Default
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {/* Default Theme Option */}
                        {(() => {
                          const isSelected = !selectedState;
                          return (
                            <button
                              key="default"
                              className="rounded-xl p-4 border-2 transition-all hover:scale-105 hover:shadow-lg relative"
                              style={{
                                borderColor: isSelected ? '#3b82f6' : '#E5E7EB',
                                background: isSelected 
                                  ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(37, 99, 235, 0.05) 100%)'
                                  : 'white',
                                boxShadow: isSelected 
                                  ? '0 4px 12px rgba(59, 130, 246, 0.2)'
                                  : 'none'
                              }}
                              onClick={() => {
                                setSelectedState('');
                                window.localStorage.removeItem('civitas-selected-state');
                              }}
                            >
                              {isSelected && (
                                <div 
                                  className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                                  style={{ backgroundColor: '#3b82f6' }}
                                >
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                                    <polyline points="20 6 9 17 4 12" />
                                  </svg>
                                </div>
                              )}
                              <div className="text-center">
                                <div className="text-3xl mb-2">🏠</div>
                                <div 
                                  className="font-semibold text-sm"
                                  style={{ color: isSelected ? '#3b82f6' : '#111827' }}
                                >
                                  Default Theme
                                </div>
                                <div 
                                  className="mt-2 h-1.5 rounded-full transition-all"
                                  style={{ 
                                    background: 'linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)',
                                    opacity: isSelected ? 1 : 0.4
                                  }}
                                />
                              </div>
                            </button>
                          );
                        })()}
                        
                        {/* State Options */}
                        {[
                          { name: 'California', emoji: '🌴', color: '#F59E0B' },
                          { name: 'Texas', emoji: '🤠', color: '#DC2626' },
                          { name: 'Florida', emoji: '🏖️', color: '#06B6D4' },
                          { name: 'New York', emoji: '🗽', color: '#6366F1' },
                          { name: 'Colorado', emoji: '⛰️', color: '#10B981' },
                          { name: 'Tennessee', emoji: '🎸', color: '#8B5CF6' },
                          { name: 'Arizona', emoji: '🌵', color: '#EF4444' },
                          { name: 'Georgia', emoji: '🍑', color: '#F97316' },
                          { name: 'Nevada', emoji: '🎰', color: '#EC4899' },
                        ].map((state) => {
                          const isSelected = selectedState === state.name;
                          return (
                            <button
                              key={state.name}
                              className="rounded-xl p-4 border-2 transition-all hover:scale-105 hover:shadow-lg relative"
                              style={{
                                borderColor: isSelected ? state.color : '#E5E7EB',
                                background: isSelected 
                                  ? `linear-gradient(135deg, ${state.color}15 0%, ${state.color}08 100%)`
                                  : 'white',
                                boxShadow: isSelected 
                                  ? `0 4px 12px ${state.color}30`
                                  : 'none'
                              }}
                              onClick={() => {
                                setSelectedState(state.name);
                              }}
                            >
                              {isSelected && (
                                <div 
                                  className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                                  style={{ backgroundColor: state.color }}
                                >
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                                    <polyline points="20 6 9 17 4 12" />
                                  </svg>
                                </div>
                              )}
                              <div className="text-center">
                                <div className="text-3xl mb-2">{state.emoji}</div>
                                <div 
                                  className="font-semibold text-sm"
                                  style={{ color: isSelected ? state.color : '#111827' }}
                                >
                                  {state.name}
                                </div>
                                <div 
                                  className="mt-2 h-1.5 rounded-full transition-all"
                                  style={{ 
                                    backgroundColor: state.color,
                                    opacity: isSelected ? 1 : 0.4
                                  }}
                                />
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {selectedState && (
                      <div className="pt-4 border-t border-gray-200">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{
                            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                          }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-1">✅ {selectedState} Theme Active</h3>
                            <p className="text-sm text-gray-600">
                              Civitas is now customizing insights based on {selectedState}'s STR regulations, 
                              tax laws, seasonal trends, and market conditions. Your chat responses will include 
                              state-specific guidance and recommendations.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {!selectedState && (
                      <div className="pt-4 border-t border-gray-200">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{
                            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
                          }}>
                            <span className="text-xl">🏠</span>
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-1">✅ Default Theme Active</h3>
                            <p className="text-sm text-gray-600">
                              You're using the classic Civitas theme. Select a state above to customize insights 
                              based on local STR regulations, tax laws, seasonal trends, and market conditions 
                              specific to that region.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Additional Settings */}
                <div className="rounded-2xl p-6 shadow-lg" style={{
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)'
                }}>
                  <h2 className="text-xl font-bold mb-4 text-gray-900">Preferences</h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">Email Notifications</h3>
                        <p className="text-sm text-gray-600">Receive updates about your properties and market trends</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={emailNotifications}
                          onChange={(e) => {
                            const newValue = e.target.checked;
                            setEmailNotifications(newValue);
                            window.localStorage.setItem('civitas-email-notifications', JSON.stringify(newValue));
                          }}
                        />
                        <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div>
                        <h3 className="font-semibold text-gray-900">Market Alerts</h3>
                        <p className="text-sm text-gray-600">Get notified about new investment opportunities</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={marketAlerts}
                          onChange={(e) => {
                            const newValue = e.target.checked;
                            setMarketAlerts(newValue);
                            window.localStorage.setItem('civitas-market-alerts', JSON.stringify(newValue));
                          }}
                        />
                        <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};