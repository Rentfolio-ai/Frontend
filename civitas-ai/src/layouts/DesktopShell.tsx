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
  const [isNavOpen, setIsNavOpen] = useState(false);

  const tabs = [
    { id: 'chat' as const, label: 'Chat / AI Assistant', icon: '💬' },
    { id: 'properties' as const, label: 'Properties', icon: '🏠' },
    { id: 'portfolio' as const, label: 'Portfolio', icon: '💼' },
    { id: 'market' as const, label: 'Market Analysis', icon: '📊' },
    { id: 'reports' as const, label: 'Reports', icon: '📈' },
  ];

  return (
    <div 
      className="h-screen flex flex-col overflow-hidden"
      style={{
        background: 'linear-gradient(145deg, #FDFDFE 0%, #EAF3FA 25%, #DAF4F0 65%, #F2F7FF 100%)'
      }}
    >
      {/* Immersive top bar with capsule navigation */}
      <header className="flex-shrink-0 px-6 py-4 flex items-center justify-between">
        {/* Capsule Dropdown Navigation */}
        <div className="relative">
          <button
            onClick={() => setIsNavOpen(!isNavOpen)}
            className="flex items-center gap-3 px-5 py-3 rounded-full backdrop-blur-md transition-all duration-300 hover:shadow-lg"
            style={{
              background: 'linear-gradient(135deg, #00B2FF 0%, #00C6AE 50%, #7EE8FA 100%)',
              boxShadow: '0px 4px 14px rgba(0, 0, 0, 0.08)'
            }}
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <span className="text-white font-semibold text-sm" style={{ fontFamily: 'Satoshi, sans-serif' }}>
              {tabs.find(t => t.id === activeTab)?.label || 'Navigation'}
            </span>
            <svg 
              className={`w-4 h-4 text-white transition-transform duration-300 ${isNavOpen ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Dropdown Menu */}
          {isNavOpen && (
            <div 
              className="absolute top-full left-0 mt-2 w-64 rounded-2xl backdrop-blur-md overflow-hidden z-50 animate-slide-in"
              style={{
                background: 'rgba(255, 255, 255, 0.9)',
                boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.12)',
              }}
            >
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setIsNavOpen(false);
                  }}
                  className={`w-full px-4 py-3 flex items-center gap-3 transition-all duration-200 ${
                    activeTab === tab.id 
                      ? 'bg-gradient-to-r from-blue-50 to-cyan-50' 
                      : 'hover:bg-gray-50'
                  }`}
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    color: activeTab === tab.id ? '#007BFF' : '#1A1A1A'
                  }}
                >
                  <span className="text-xl">{tab.icon}</span>
                  <span className="font-medium text-sm">{tab.label}</span>
                  {activeTab === tab.id && (
                    <div className="ml-auto w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"></div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right side - Civitas AI branding + User */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <AgentAvatar size="sm" />
            <span className="font-bold text-lg" style={{ fontFamily: 'Satoshi, sans-serif', color: '#1A1A1A' }}>
              Civitas AI
            </span>
            <span className="w-2 h-2 bg-green-500 rounded-full shadow-lg animate-pulse"></span>
          </div>
          
          <div 
            className="flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md border"
            style={{
              background: 'rgba(255, 255, 255, 0.6)',
              borderColor: 'rgba(0, 123, 255, 0.2)',
              boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.04)'
            }}
          >
            <span className="text-sm font-medium" style={{ color: '#1A1A1A', fontFamily: 'Inter, sans-serif' }}>
              {user?.name || 'User'}
            </span>
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #00B2FF 0%, #00C6AE 100%)'
              }}
            >
              <span className="text-xs font-bold text-white">
                {user?.name ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) : 'U'}
              </span>
            </div>
          </div>
        </div>
      </header>

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