// FILE: src/hooks/useDesktopShell.ts
import { useState, useEffect, useRef } from 'react';
import type { Message } from '../types/chat';
import { generateChatTitle } from '../utils/chatTitles';
import { ChatService } from '../services/ChatService';

export interface ChatSession {
  id: string;
  title?: string;
  timestamp?: string;
  isActive?: boolean;
  messages: Message[];
}

export type TabType = 'chat' | 'properties' | 'portfolio' | 'market' | 'reports' | 'settings';

export function useDesktopShell() {
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

    // Create user message
    const userMessage: Message = ChatService.createUserMessage(message, 
      attachment ? {
        name: attachment.name,
        type: attachment.type,
        url: URL.createObjectURL(attachment)
      } : undefined
    );

    if (userMessage.attachment?.url) {
      attachmentUrlsRef.current.push(userMessage.attachment.url);
    }

    setMessages(prev => [...prev, userMessage]);
    setAttachment(null);
    setIsLoading(true);
    
    // Simulate AI response with delay
    const delay = 1000 + Math.random() * 1000;
    setTimeout(() => {
      const fullResponse = ChatService.generateSTRResponse(message);
      
      const { intervalId } = ChatService.streamResponse(
        fullResponse,
        (content, id) => {
          setMessages(prev => {
            const filtered = prev.filter(m => m.id !== id);
            return [
              ...filtered,
              {
                id,
                content,
                role: 'assistant',
                type: 'assistant',
                timestamp: new Date(),
                isStreaming: content.length < fullResponse.length
              } as Message
            ];
          });
        },
        () => {
          setStreamIntervalId(null);
          setIsLoading(false);
        }
      );
      
      setStreamIntervalId(intervalId);
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
    handleDeleteChat
  };
}
