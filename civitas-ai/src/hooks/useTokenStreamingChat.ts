// FILE: src/hooks/useTokenStreamingChat.ts
/**
 * Enhanced Chat Hook with True Token-by-Token Streaming
 * 
 * This hook handles real-time token streaming from the backend,
 * providing a ChatGPT-like experience where text appears character-by-character.
 */

import { useState, useCallback, useRef } from 'react';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  streaming?: boolean;
}

export interface ThinkingState {
  status: string;
  explanation?: string;
  source?: string;
}

export interface CompletedTool {
  name: string;
  tool?: string;
  data?: any;
}

export interface UseTokenStreamingChatOptions {
  apiUrl?: string;
  apiKey?: string;
  onError?: (error: Error) => void;
  onComplete?: () => void;
  enableTokenStreaming?: boolean;
  streamingMode?: 'fast' | 'normal' | 'word' | 'smart' | 'off';
}

export const useTokenStreamingChat = (options: UseTokenStreamingChatOptions = {}) => {
  const {
    apiUrl = '/api/chat/stream',
    apiKey = process.env.REACT_APP_API_KEY || '',
    onError,
    onComplete,
    enableTokenStreaming = true,
    streamingMode = 'fast'
  } = options;
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [thinking, setThinking] = useState<ThinkingState | null>(null);
  const [completedTools, setCompletedTools] = useState<CompletedTool[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const currentMessageRef = useRef<string>('');
  
  /**
   * Send a message and stream the response token-by-token
   */
  const sendMessage = useCallback(async (
    content: string,
    userPreferences?: any,
    context?: any
  ) => {
    if (!content.trim()) return;
    
    // Add user message immediately
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setThinking({ status: 'Initializing...' });
    setCompletedTools([]);
    currentMessageRef.current = '';
    
    // Create abort controller for this request
    abortControllerRef.current = new AbortController();
    
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey,
        },
        body: JSON.stringify({
          message: content,
          thread_id: threadId,
          user_preferences: userPreferences,
          context,
          streaming_mode: streamingMode,
          enable_token_streaming: enableTokenStreaming
        }),
        signal: abortControllerRef.current.signal
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      if (!response.body) {
        throw new Error('No response body');
      }
      
      // Create AI message (will be updated as tokens stream in)
      const aiMessageId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, {
        id: aiMessageId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        streaming: true
      }]);
      
      // Process SSE stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      
      while (true) {
        const { value, done } = await reader.read();
        
        if (done) break;
        
        // Decode chunk
        buffer += decoder.decode(value, { stream: true });
        
        // Process complete SSE events
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.substring(6));
              
              // Handle different event types
              switch (data.type) {
                case 'init':
                  // Store thread ID
                  if (data.thread_id) {
                    setThreadId(data.thread_id);
                  }
                  break;
                
                case 'thinking':
                  // V2 uses 'message' field, V1 uses 'status' field
                  const thinkingText = data.status || data.message || 'Thinking...';
                  const shouldAccumulate = data.source === 'Agent Reasoning' || data.progress !== undefined;
                  
                  setThinking(prev => {
                    if (shouldAccumulate && prev) {
                      const alreadyHas = (prev.status || '').includes(thinkingText);
                      if (!alreadyHas) {
                        return {
                          ...prev,
                          status: prev.status + '\n' + thinkingText,
                          explanation: data.explanation || prev.explanation,
                        };
                      }
                      return prev;
                    } else {
                      return {
                        status: thinkingText,
                        explanation: data.explanation,
                        source: data.source
                      };
                    }
                  });
                  break;
                
                case 'tool_start':
                  // Tool started
                  setThinking({
                    status: data.thinking || `Running ${data.tool}...`,
                    source: 'Tools'
                  });
                  break;
                
                case 'tool_end':
                  // Tool completed
                  // IMPROVED PROMPTS V2: Don't clear Agent Reasoning thinking
                  setThinking(prev => {
                    if (prev && prev.source === 'Agent Reasoning') {
                      return prev; // Keep Agent Reasoning thinking
                    }
                    return null; // Clear other thinking
                  });
                  
                  setCompletedTools(prev => [
                    ...prev,
                    {
                      name: data.tool || 'Unknown',
                      data: data.data
                    }
                  ]);
                  break;
                
                case 'content':
                  // **THIS IS WHERE THE MAGIC HAPPENS**
                  // Each token arrives and is appended immediately
                  const token = data.content || '';
                  if (token) {
                    currentMessageRef.current += token;
                    
                    // Update AI message with new token
                    setMessages(prev => prev.map(msg =>
                      msg.id === aiMessageId
                        ? { ...msg, content: currentMessageRef.current }
                        : msg
                    ));
                  }
                  break;
                
                case 'done':
                  // Streaming complete
                  setThinking(null);
                  setMessages(prev => prev.map(msg =>
                    msg.id === aiMessageId
                      ? { ...msg, streaming: false }
                      : msg
                  ));
                  setIsLoading(false);
                  onComplete?.();
                  break;
                
                case 'suggestions':
                  // Handle suggestions (optional)
                  // You can emit these to a callback if needed
                  console.log('Suggestions:', data.suggestions);
                  break;
                
                case 'error':
                  throw new Error(data.message || 'Streaming error');
              }
            } catch (parseError) {
              console.error('Failed to parse SSE event:', parseError);
            }
          }
        }
      }
      
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Request aborted');
      } else {
        console.error('Chat error:', error);
        onError?.(error);
        
        // Add error message
        setMessages(prev => [...prev, {
          id: (Date.now() + 2).toString(),
          role: 'system',
          content: `Error: ${error.message}`,
          timestamp: new Date()
        }]);
      }
    } finally {
      setIsLoading(false);
      setThinking(null);
      abortControllerRef.current = null;
    }
  }, [apiUrl, apiKey, threadId, streamingMode, enableTokenStreaming, onError, onComplete]);
  
  /**
   * Cancel ongoing request
   */
  const cancelRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
      setThinking(null);
    }
  }, []);
  
  /**
   * Clear all messages
   */
  const clearMessages = useCallback(() => {
    setMessages([]);
    setThreadId(null);
    currentMessageRef.current = '';
  }, []);
  
  /**
   * Retry last message
   */
  const retryLastMessage = useCallback(() => {
    const lastUserMessage = messages
      .filter(m => m.role === 'user')
      .pop();
    
    if (lastUserMessage) {
      // Remove last AI response
      setMessages(prev => prev.slice(0, -1));
      sendMessage(lastUserMessage.content);
    }
  }, [messages, sendMessage]);
  
  return {
    messages,
    thinking,
    completedTools,
    isLoading,
    threadId,
    sendMessage,
    cancelRequest,
    clearMessages,
    retryLastMessage
  };
};
