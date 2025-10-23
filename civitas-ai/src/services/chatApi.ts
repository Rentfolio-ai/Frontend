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
  // TODO: Replace with your actual backend endpoint
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

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
