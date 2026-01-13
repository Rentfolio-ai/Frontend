// FILE: src/services/chatApi.ts
import { apiLogger } from '@/utils/logger';
import type { ToolResultRecord } from '../types/toolResults';

const CIVITAS_API_KEY = import.meta.env.VITE_API_KEY;

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatResponse {
  message: string;
  toolCalls?: Array<{
    name: string;
    parameters: Record<string, any>;
  }>;
}

// Helper to get backend URL with correct path
const getBackendUrl = () => {
  const envApiUrl = import.meta.env.VITE_DATALAYER_API_URL;
  let baseUrl = (envApiUrl && typeof envApiUrl === 'string' && envApiUrl.startsWith('http')) ? envApiUrl : 'http://localhost:8001';
  if (baseUrl.endsWith('/')) {
    baseUrl = baseUrl.slice(0, -1);
  }
  if (baseUrl.endsWith('/api')) {
    baseUrl = baseUrl.slice(0, -4);
  }
  return baseUrl;
};

export async function fetchToolResults(threadId: string, limit = 5): Promise<ToolResultRecord[]> {
  if (!threadId) return [];
  const BACKEND_URL = getBackendUrl();
  const url = `${BACKEND_URL}/api/tool-results/${threadId}?limit=${limit}`;

  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(CIVITAS_API_KEY ? { 'X-API-Key': CIVITAS_API_KEY } : {}),
      },
    });

    if (!response.ok) {
      // Silently return empty array if endpoint doesn't exist (404)
      // Tool results will come from chat response instead
      if (response.status === 404) {
        console.debug('[chatApi] Tool results endpoint not available, using chat response');
        return [];
      }
      throw new Error(`Failed to fetch tool results (${response.status})`);
    }

    return response.json();
  } catch (error) {
    // Network error or other issue - return empty array
    console.debug('[chatApi] fetchToolResults failed, using chat response', error);
    return [];
  }
}

/**
 * Send a chat message to the backend and receive response with potential tool calls
 */
export const sendChatMessage = async (
  message: string,
  conversationHistory: ChatMessage[] = []
): Promise<ChatResponse> => {
  const BACKEND_URL = getBackendUrl();
  const requestUrl = `${BACKEND_URL}/api/chat`;
  const startedAt = performance.now();

  try {
    apiLogger.request({ method: 'POST', url: requestUrl, service: 'chat', payloadPreview: message.slice(0, 120) });
    const response = await fetch(requestUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(CIVITAS_API_KEY ? { 'X-API-Key': CIVITAS_API_KEY } : {}),
      },
      body: JSON.stringify({
        message,
        context: {
          history: conversationHistory,
        }
      }),
    });

    if (!response.ok) {
      const durationMs = performance.now() - startedAt;
      apiLogger.error({ method: 'POST', url: requestUrl, service: 'chat', status: response.status, durationMs, error: `HTTP ${response.status}` });
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    apiLogger.response({ method: 'POST', url: requestUrl, service: 'chat', status: 200, durationMs: performance.now() - startedAt });

    // Expected backend response format:
    // {
    //   message: "I've turned off email notifications for you.",
    //   toolCalls: [
    //     {
    //       name: "updateUserSettings",
    //       parameters: { emailNotifications: false }
    //     }
    //   ]
    // }

    return data;
  } catch (error) {
    apiLogger.error({ method: 'POST', url: requestUrl, service: 'chat', error });
    throw error;
  }
};

/**
 * Get current user settings to send as context to backend
 */
export const getUserContext = () => {
  // This will be sent to backend so LLM knows current state
  return {
    settings: localStorage.getItem('civitas-settings'),
    user: localStorage.getItem('civitas-user'),
  };
};

interface OnboardingData {
  message: string;
  example_prompts?: Array<{
    text: string;
    label: string;
    category: string;
    placeholder?: boolean;
  }>;
  // Backend-specific fields from Vasthu /onboarding API
  thread_id?: string;
  suggested_actions?: string[];
  user_name?: string;
  timestamp?: string;
}

/**
 * Fetch the onboarding/welcome message from backend
 */
export const getOnboardingMessage = async (userName?: string): Promise<OnboardingData> => {
  const BACKEND_URL = getBackendUrl();
  const url = new URL(`${BACKEND_URL}/api/onboarding/welcome`);
  const startedAt = performance.now();

  try {
    if (userName) {
      url.searchParams.append('user_name', userName);
    }

    apiLogger.request({ method: 'GET', url: url.toString(), service: 'chat', payloadPreview: userName });
    const response = await fetch(url.toString(), {
      headers: {
        ...(CIVITAS_API_KEY ? { 'X-API-Key': CIVITAS_API_KEY } : {}),
      },
    });

    if (!response.ok) {
      apiLogger.error({ method: 'GET', url: url.toString(), service: 'chat', status: response.status, durationMs: performance.now() - startedAt, error: `HTTP ${response.status}` });
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const raw = await response.json();
    apiLogger.response({ method: 'GET', url: url.toString(), service: 'chat', status: 200, durationMs: performance.now() - startedAt });

    // Backend OnboardingResponse shape:
    // { message: string; thread_id: string; suggested_actions: string[] }
    const threadId: string | undefined = raw.thread_id;
    const suggestedActions: string[] | undefined = raw.suggested_actions;

    // Persist thread_id for subsequent chat calls
    if (typeof window !== 'undefined' && threadId) {
      window.localStorage.setItem('civitas-thread-id', threadId);
    }

    const example_prompts = Array.isArray(suggestedActions)
      ? suggestedActions.map((text: string) => ({
        text,
        label: text,
        category: 'general',
      }))
      : undefined;

    const data: OnboardingData = {
      message: raw.message,
      thread_id: threadId,
      suggested_actions: suggestedActions,
      example_prompts,
    };

    return data;
  } catch (error) {
    apiLogger.error({ method: 'GET', url: url.toString(), service: 'chat', error });

    // Fallback: keep experience usable even if backend is down
    const fallbackThreadId =
      typeof window !== 'undefined'
        ? window.localStorage.getItem('civitas-thread-id') || `local-${Date.now()}`
        : undefined;

    if (typeof window !== 'undefined' && fallbackThreadId) {
      window.localStorage.setItem('civitas-thread-id', fallbackThreadId);
    }

    // Return graceful static message if API fails
    const data: OnboardingData = {
      message:
        "Welcome to ProphetAtlas! 🏠✨\n\nI'm your all-knowing real estate intelligence assistant. Ask me anything about properties, markets, investments, and more!",
      example_prompts: [
        { text: 'Find properties in Austin', label: '🏠 Search', category: 'search' },
        { text: 'Analyze Miami market', label: '📊 Market', category: 'market' },
      ],
      thread_id: fallbackThreadId,
    };

    return data;
  }
};
