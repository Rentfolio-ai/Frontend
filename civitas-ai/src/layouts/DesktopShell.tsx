// FILE: src/layouts/DesktopShell.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from '../components/sidebar/Sidebar';
import { MessageList } from '../components/chat/MessageList';
import type { Message } from '../types/chat';
import { Composer } from '../components/chat/Composer';
import { generateChatTitle } from '../utils/chatTitles';
import { SmartSuggestions } from '../components/chat/SmartSuggestions';
import { useAuth } from '../contexts/AuthContext';

interface DesktopShellProps {
  children?: React.ReactNode;
}

export const DesktopShell: React.FC<DesktopShellProps> = () => {
  const { user } = useAuth();
  
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

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    window.localStorage.setItem('civitas-theme', theme);
  }, [theme]);
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
  const [attachmentUrls, setAttachmentUrls] = useState<string[]>([]);
  // Create a ref to track attachment URLs that persists across renders
  const attachmentUrlsRef = useRef<string[]>([]);

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
      // Track the URL in both state (for UI) and ref (for cleanup)
      setAttachmentUrls(prev => [...prev, url]);
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
    const fullResponse = `This is a simulated LLM response to: "${message}"`;
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
    }, 30);
    setStreamIntervalId(interval);
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
  }, [messages]);

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
    setAttachmentUrls([]);
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

  const [activeTab, setActiveTab] = useState<'chat' | 'properties' | 'portfolio' | 'market' | 'reports'>('chat');
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
      className="h-screen flex flex-col overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #56CCF2 0%, #2F80ED 100%)'
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
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
            }}
          >
            {/* Sidebar Header with User Profile */}
            <div className="p-6 border-b" style={{ borderColor: 'rgba(0, 123, 255, 0.1)' }}>
              <div className="flex items-center gap-3">
                <div 
                  className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    background: 'linear-gradient(135deg, #00B2FF 0%, #00C6AE 100%)'
                  }}
                >
                  <span className="text-base font-bold text-white">
                    {user?.name ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) : 'U'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-base truncate" style={{ color: '#1A1A1A', fontFamily: 'Inter, sans-serif' }}>
                    {user?.name || 'User'}
                  </p>
                  <p className="text-xs truncate" style={{ color: '#5A6473', fontFamily: 'Inter, sans-serif' }}>
                    {user?.email || 'user@example.com'}
                  </p>
                </div>
              </div>
            </div>

            {/* Main Navigation */}
            <div className="flex-1 overflow-y-auto py-6">
              <div className="px-4 space-y-3">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsSidebarOpen(false);
                    }}
                    className={`w-full px-5 py-4 rounded-2xl flex items-center gap-4 transition-all duration-200 ${
                      activeTab === item.id
                        ? 'shadow-lg'
                        : 'hover:bg-gray-50'
                    }`}
                    style={{
                      background: activeTab === item.id 
                        ? 'linear-gradient(135deg, rgba(0, 178, 255, 0.1) 0%, rgba(0, 198, 174, 0.1) 100%)'
                        : 'transparent'
                    }}
                  >
                    <span className="text-2xl">{item.icon}</span>
                    <span 
                      className="font-semibold text-base"
                      style={{ 
                        fontFamily: 'Inter, sans-serif',
                        color: activeTab === item.id ? '#007BFF' : '#1A1A1A'
                      }}
                    >
                      {item.label}
                    </span>
                    {activeTab === item.id && (
                      <div className="ml-auto w-2 h-2 rounded-full" style={{ background: 'linear-gradient(135deg, #00B2FF 0%, #00C6AE 100%)' }}></div>
                    )}
                  </button>
                ))}
              </div>

              {/* Divider */}
              <div className="my-6 mx-4 border-t" style={{ borderColor: 'rgba(0, 123, 255, 0.1)' }} />

              {/* Account Items */}
              <div className="px-4 space-y-3">
                {accountMenuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setIsSidebarOpen(false);
                    }}
                    className="w-full px-5 py-4 rounded-2xl flex items-center gap-4 transition-all duration-200 hover:bg-gray-50"
                  >
                    <span className="text-2xl">{item.icon}</span>
                    <span 
                      className="font-semibold text-base"
                      style={{ 
                        fontFamily: 'Inter, sans-serif',
                        color: '#1A1A1A'
                      }}
                    >
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Enhanced Floating Hamburger Menu */}
      <div className="absolute top-6 left-6 z-30">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="group flex items-center justify-center w-14 h-14 rounded-2xl backdrop-blur-xl transition-all duration-300 hover:scale-110 hover:rotate-180"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.15) 100%)',
            boxShadow: '0px 8px 32px rgba(0, 0, 0, 0.15), inset 0px 1px 2px rgba(255, 255, 255, 0.3)',
            border: '1.5px solid rgba(255, 255, 255, 0.4)'
          }}
        >
          <svg className="w-7 h-7 text-white transition-transform duration-300 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
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
            onNewChat={() => {
              // Save current chat to history if it has messages
              if (messages.length > 0) {
                const firstUserMessage = messages.find(msg => msg.role === 'user' || msg.type === 'user')?.content || '';
                setChatHistory(prev => [
                  ...prev,
                  { 
                    id: activeChatId, 
                    messages,
                    title: generateChatTitle(firstUserMessage),
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  }
                ]);
              }
              setMessages([]);
              clearAttachments(); // Use the helper function to clean up attachment URLs
              setIsLoading(false);
              if (streamIntervalId) {
                clearInterval(streamIntervalId);
                setStreamIntervalId(null);
              }
              const newId = Date.now().toString();
              setActiveChatId(newId);
            }}
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
              {/* Chat Header - STR Investment AI */}
              <div className="flex-shrink-0 px-8 pt-6 pb-4 flex items-center gap-3">
                <div 
                  className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{
                    background: 'rgba(255, 255, 255, 0.25)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)'
                  }}
                >
                  <span className="text-2xl">🏠</span>
                </div>
                <div>
                  <h1 
                    className="text-2xl font-bold text-white"
                    style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
                  >
                    STR Investment AI
                  </h1>
                  <p 
                    className="text-sm text-white/70"
                    style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
                  >
                    Your intelligent real estate assistant
                  </p>
                </div>
              </div>

              {/* Message List - Full height, full width */}
              <div className="flex-1 overflow-y-auto">
                <MessageList messages={messages} isLoading={isLoading} />
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

          {/* Other Tabs Placeholder */}
          {(activeTab === 'portfolio' || activeTab === 'market' || activeTab === 'reports') && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-white/80">
                <div className="text-6xl mb-4">
                  {activeTab === 'portfolio' && '💼'}
                  {activeTab === 'market' && '📊'}
                  {activeTab === 'reports' && '📈'}
                </div>
                <h2 className="text-2xl font-bold mb-2 capitalize">{activeTab}</h2>
                <p>Coming soon...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};