// FILE: src/layouts/DesktopShell.tsx
import React, { useState, useEffect, useRef } from 'react';
import { TopBar } from '../components/topbar/TopBar';
import { Sidebar } from '../components/sidebar/Sidebar';
import { MessageList } from '../components/chat/MessageList';
import type { Message } from '../types/chat';
import { Composer } from '../components/chat/Composer';
import { generateChatTitle } from '../utils/chatTitles';
import { ContextRail } from '../components/rail/ContextRail';

interface DesktopShellProps {
  children?: React.ReactNode;
}

export const DesktopShell: React.FC<DesktopShellProps> = () => {
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

  // Static quick actions
  const quickActions: { label: string; value: string }[] = [
    { label: 'Show me properties under $500k', value: 'Show me properties under $500k' },
    { label: 'Summarize my dashboard', value: 'Summarize my dashboard' },
    { label: 'Generate a market report', value: 'Generate a market report' },
    { label: 'What are the top zip codes?', value: 'What are the top zip codes?' }
  ];

  return (
    <div className="h-screen bg-background text-foreground flex flex-col overflow-hidden">
      {/* Top Bar */}
      <TopBar 
        onToggleSidebar={toggleSidebar}
        onToggleRail={toggleRail}
        isRailCollapsed={isRailCollapsed}
      />
      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar (collapsed by default) */}
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
            activeChatId={activeChatId}
          />
        </div>

        {/* Center: Chat Area - visually dominant */}
        <div className="flex-1 flex flex-col min-w-0 bg-background relative">
          {/* Contextual Quick Actions for LLM */}
          <div className="p-6 pb-2 border-b border-border bg-background sticky top-0 z-10">
            <div className="flex flex-wrap gap-2">
              {quickActions.map((action) => (
                <button
                  key={action.value}
                  className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium hover:bg-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/60 transition-colors"
                  onClick={() => handleSendMessage(action.value)}
                  aria-label={action.label}
                  tabIndex={0}
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>
          {/* Message List */}
          <div className="flex-1 overflow-y-auto px-0 md:px-8 pb-32">
            <MessageList messages={messages} isLoading={isLoading} />
          </div>
          {/* Sticky Composer with attachment */}
          <div className="sticky bottom-0 left-0 right-0 bg-background p-4 border-t border-border z-20">
            <div className="max-w-chat mx-auto flex items-center gap-2">
              <input
                type="file"
                id="chat-attachment"
                className="hidden"
                onChange={e => {
                  if (e.target.files && e.target.files[0]) {
                    setAttachment(e.target.files[0]);
                  }
                }}
                aria-label="Attach file or image"
              />
              <label htmlFor="chat-attachment" className="cursor-pointer flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 hover:bg-primary/30 border border-primary text-primary focus:outline-none focus:ring-2 focus:ring-primary/60" aria-label="Attach file or image" tabIndex={0}>
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M16.5 13.5V7.5C16.5 5.01472 14.4853 3 12 3C9.51472 3 7.5 5.01472 7.5 7.5V16.5C7.5 18.9853 9.51472 21 12 21C14.4853 21 16.5 18.9853 16.5 16.5V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </label>
              {attachment && (
                <span className="text-xs text-primary font-medium px-2 py-1 bg-primary/10 rounded">{attachment.name}</span>
              )}
              <Composer onSend={handleSendMessage} aria-label="Chat input" />
              {isLoading && (
                <button
                  className="ml-2 w-10 h-10 flex items-center justify-center rounded-xl bg-red-600/20 hover:bg-red-600/40 transition-colors border border-red-600 shadow focus:outline-none focus:ring-2 focus:ring-red-600"
                  onClick={handleStopStream}
                  title="Stop response"
                  aria-label="Stop assistant response"
                  tabIndex={0}
                >
                  <span className="w-6 h-6 flex items-center justify-center rounded-full bg-red-600 text-white">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="4" y="4" width="8" height="8" rx="2" fill="currentColor" />
                    </svg>
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Context Rail (less visual emphasis) */}
        <div className={`
          flex-shrink-0 transition-all duration-300 ease-in-out border-l border-border
          ${isRailCollapsed ? 'w-0' : 'w-right-rail'}
          ${isRailCollapsed ? 'opacity-0' : 'opacity-100'}
        `}>
          <ContextRail 
            isCollapsed={isRailCollapsed} 
            onSendMessage={handleSendMessage}
          />
        </div>
      </div>
    </div>
  );
};