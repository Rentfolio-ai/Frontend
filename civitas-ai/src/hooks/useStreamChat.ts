// FILE: src/hooks/useStreamChat.ts
/**
 * Hook for handling SSE streaming chat with thinking states
 */

import { useState, useCallback, useRef } from 'react';
import type { StreamEvent, CompletedTool, StreamState } from '../types/stream';
import type { AgentMode } from '../types/chat';

const envApiUrl = import.meta.env.VITE_DATALAYER_API_URL;
// Use relative URLs in dev (proxied by Vite), absolute in prod
const CIVITAS_API_BASE = (envApiUrl && typeof envApiUrl === 'string' && envApiUrl.startsWith('http'))
  ? envApiUrl
  : (import.meta.env.DEV ? '' : 'http://localhost:8001');
const CIVITAS_API_KEY = import.meta.env.VITE_API_KEY;

// Debug: Log API key status (only first 10 chars for security)
console.log('[useStreamChat] API Key loaded:', CIVITAS_API_KEY ? `${CIVITAS_API_KEY.substring(0, 10)}...` : 'MISSING');


interface UseStreamChatOptions {
  onContent?: (content: string) => void;
  onComplete?: (content: string, threadId: string | null) => void;
  onError?: (error: string) => void;
  onToolComplete?: (tool: CompletedTool) => void;
}

export function useStreamChat(options: UseStreamChatOptions = {}) {
  const [streamState, setStreamState] = useState<StreamState>({
    thinking: null,
    completedTools: [],
    content: '',
    isComplete: true,
    error: null,
    threadId: null,
    contextSources: [],
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const contentRef = useRef<string>('');

  const resetState = useCallback(() => {
    contentRef.current = '';
    setStreamState({
      thinking: { status: 'Understanding your request...', icon: '🤔' },
      completedTools: [],
      content: '',
      isComplete: false,
      error: null,
      threadId: null,
      contextSources: [],
    });
  }, []);

  const handleEvent = useCallback((event: StreamEvent) => {
    switch (event.type) {
      case 'init':
        setStreamState(prev => ({
          ...prev,
          threadId: event.thread_id,
        }));
        // Persist thread_id - REMOVED to prevent stuck state
        // if (typeof window !== 'undefined' && event.thread_id) {
        //   window.localStorage.setItem('civitas-thread-id', event.thread_id);
        // }
        break;

      case 'thinking':
        setStreamState(prev => ({
          ...prev,
          thinking: {
            status: event.status,
            source: event.source,
            icon: event.icon,
            tool: event.tool,
          },
        }));
        break;

      case 'tool_start':
        setStreamState(prev => ({
          ...prev,
          thinking: {
            status: event.thinking,
            source: event.source,
            icon: event.icon,
            tool: event.tool,
          },
        }));
        break;

      case 'tool_end':
        setStreamState(prev => {
          const newTool: CompletedTool | null = event.summary ? {
            tool: event.tool,
            summary: event.summary,
            icon: event.icon || '✓',
            data: event.data,
          } : null;

          if (newTool) {
            options.onToolComplete?.(newTool);
          }

          return {
            ...prev,
            thinking: null,
            completedTools: newTool
              ? [...prev.completedTools, newTool]
              : prev.completedTools,
          };
        });
        break;

      case 'context_attribution':
        setStreamState(prev => ({
          ...prev,
          contextSources: event.sources
        }));
        break;

      case 'content':
        contentRef.current += event.content;
        setStreamState(prev => ({
          ...prev,
          thinking: null,
          content: contentRef.current,
        }));
        options.onContent?.(contentRef.current);
        break;

      case 'done':
        setStreamState(prev => ({
          ...prev,
          thinking: null,
          isComplete: true,
        }));
        options.onComplete?.(contentRef.current, streamState.threadId);
        break;

      case 'error':
        setStreamState(prev => ({
          ...prev,
          thinking: null,
          error: event.error,
          isComplete: true,
        }));
        options.onError?.(event.error);
        break;

      // 🚀 NEW: Handle citations from backend
      case 'citations':
        // Citations will be passed to MessageBubble via props
        // Store in state for current message
        setStreamState(prev => ({
          ...prev,
          citations: event.citations,
        }));
        break;

      // 🚀 NEW: Handle reasoning steps
      case 'reasoning_step':
        setStreamState(prev => ({
          ...prev,
          reasoningSteps: [...(prev.reasoningSteps || []), event.step],
        }));
        break;

      // 🚀 NEW: Handle confidence scores
      case 'confidence':
        setStreamState(prev => ({
          ...prev,
          confidence: event.score,
        }));
        break;

      // 🚀 NEW: Handle data sources
      case 'data_sources':
        setStreamState(prev => ({
          ...prev,
          dataSources: event.sources,
        }));
        break;

      case 'clarification_request':
        setStreamState(prev => ({
          ...prev,
          clarificationRequest: event.data,
        }));
        break;

      case 'clear_content':
        // Reset content - used when agent retries generation (e.g. after hallucination check)
        contentRef.current = '';
        setStreamState(prev => ({
          ...prev,
          content: '',
        }));
        options.onContent?.('');
        break;
    }
  }, [options, streamState.threadId]);

  const sendMessage = useCallback(async (
    message: string,
    threadId?: string,
    userContext?: { name?: string; onboarding_completed?: boolean },
    mode?: AgentMode
  ) => {
    // Cancel any existing stream
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Reset state
    resetState();

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    try {
      const effectiveThreadId = threadId;
      // REMOVED localStorage fallback to prevent stuck state
      // const effectiveThreadId = threadId || (
      //   typeof window !== 'undefined'
      //     ? window.localStorage.getItem('civitas-thread-id') || undefined
      //     : undefined
      // );

      const headers = {
        'Content-Type': 'application/json',
        ...(CIVITAS_API_KEY ? { 'X-API-Key': CIVITAS_API_KEY } : {}),
      };

      // Debug: Log headers being sent (mask API key)
      console.log('[useStreamChat] Request headers:', {
        ...headers,
        'X-API-Key': headers['X-API-Key'] ? `${headers['X-API-Key'].substring(0, 10)}...` : 'MISSING'
      });

      const response = await fetch(`${CIVITAS_API_BASE}/api/stream`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          message,
          thread_id: effectiveThreadId,
          temperature: 0.2,
          max_tokens: null,
          context: userContext ? { user_context: userContext } : undefined,
          mode: mode || 'hunter',
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const jsonStr = line.slice(6).trim();
            if (jsonStr === '[DONE]' || jsonStr === '') continue;

            try {
              const data = JSON.parse(jsonStr) as StreamEvent;
              handleEvent(data);
            } catch {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        // Stream was cancelled, ignore
        return;
      }

      const errorMessage = err instanceof Error ? err.message : 'Stream failed';
      setStreamState(prev => ({
        ...prev,
        thinking: null,
        error: errorMessage,
        isComplete: true,
      }));
      options.onError?.(errorMessage);
    }
  }, [handleEvent, options, resetState]);

  const cancelStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setStreamState(prev => ({
      ...prev,
      thinking: null,
      isComplete: true,
    }));
  }, []);

  return {
    ...streamState,
    sendMessage,
    cancelStream,
    isStreaming: !streamState.isComplete,
  };
}
