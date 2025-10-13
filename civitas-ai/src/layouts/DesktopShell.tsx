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

      {/* Floating Hamburger Menu */}
      <div className="absolute top-6 left-6 z-30">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="flex items-center justify-center w-12 h-12 rounded-2xl backdrop-blur-xl transition-all duration-300 hover:scale-105"
          style={{
            background: 'rgba(255, 255, 255, 0.25)',
            boxShadow: '0px 8px 32px rgba(0, 0, 0, 0.12)',
            border: '1px solid rgba(255, 255, 255, 0.3)'
          }}
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

        {/* Center: Clean Chat Interface - No Clutter */}
        <div className="flex-1 flex flex-col min-w-0 relative max-w-5xl mx-auto w-full">
          {/* Message List - Full height, centered, clean */}
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
          {/* Clean Composer - Centered and minimal */}
          <div className="flex-shrink-0 p-6">
            <div className="max-w-4xl mx-auto">
              <Composer onSend={handleSendMessage} aria-label="Chat input" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};