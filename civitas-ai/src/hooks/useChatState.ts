// FILE: src/hooks/useChatState.ts
import { useState, useEffect } from 'react';
import type { Message } from '../types/chat';

export interface ChatSession {
  id: string;
  title?: string;
  timestamp?: string;
  isActive?: boolean;
  messages: Message[];
}

export function useChatState() {
  // Persistent chat history
  const [chatHistory, setChatHistory] = useState<ChatSession[]>(() => {
    const saved = typeof window !== 'undefined'
      ? window.localStorage.getItem('civitas-chat-history')
      : null;
    if (!saved) return [];

    try {
      const parsed = JSON.parse(saved);
      // Migrate legacy ChatHistoryItem[] format
      return parsed.map((chat: any) => ({
        id: chat.id,
        title: chat.title,
        timestamp: chat.timestamp,
        messages: chat.messages || []
      }));
    } catch (error) {
      console.error('Failed to parse chat history:', error);
      // Clear corrupted data
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('civitas-chat-history');
      }
      return [];
    }
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
    if (!saved) return [];
    
    try {
      return JSON.parse(saved);
    } catch (error) {
      console.error('Failed to parse chat messages:', error);
      // Clear corrupted data
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('civitas-chat-messages');
      }
      return [];
    }
  });

  // Persist chat history
  useEffect(() => {
    if (chatHistory.length > 0) {
      window.localStorage.setItem('civitas-chat-history', JSON.stringify(chatHistory));
    }
  }, [chatHistory]);

  // Persist active chat ID
  useEffect(() => {
    window.localStorage.setItem('civitas-active-chat-id', activeChatId);
  }, [activeChatId]);

  // Persist messages
  useEffect(() => {
    if (messages.length > 0) {
      window.localStorage.setItem('civitas-chat-messages', JSON.stringify(messages));
    }
  }, [messages]);

  return {
    chatHistory,
    setChatHistory,
    activeChatId,
    setActiveChatId,
    messages,
    setMessages
  };
}
