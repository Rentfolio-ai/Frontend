// FILE: src/services/chatApi.ts

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

/**
 * Send a chat message to the backend and receive response with potential tool calls
 */
export const sendChatMessage = async (
  message: string,
  conversationHistory: ChatMessage[] = []
): Promise<ChatResponse> => {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

  try {
    const response = await fetch(`${BACKEND_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        history: conversationHistory,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
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
    console.error('Chat API error:', error);
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
  user_name?: string;
  timestamp?: string;
}

/**
 * Fetch the onboarding/welcome message from backend
 */
export const getOnboardingMessage = async (userName?: string): Promise<OnboardingData> => {
  const BACKEND_URL = import.meta.env.VITE_CIVITAS_API_URL || 'http://localhost:8000';

  try {
    const url = new URL(`${BACKEND_URL}/onboarding`);
    if (userName) {
      url.searchParams.append('user_name', userName);
    }

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch onboarding message:', error);
    // Return fallback message if API fails
    return {
      message: "Welcome to Civitas! 🏠✨\n\nI'm your AI-powered short-term rental investment assistant. Ask me anything about STR properties!",
      example_prompts: [
        { text: "Find properties in Austin", label: "🏠 Search", category: "search" },
        { text: "Analyze Miami market", label: "📊 Market", category: "market" }
      ]
    };
  }
};
