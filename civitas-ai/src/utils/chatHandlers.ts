// FILE: src/utils/chatHandlers.ts

interface ChatSession {
  id: string;
  title: string;
  timestamp: string;
  createdAt?: string;
  isActive?: boolean;
}

export class ChatHandlers {
  /**
   * Create a new chat session
   */
  static createNewChat(
    chatHistory: ChatSession[],
    setChatHistory: (history: ChatSession[]) => void
  ): void {
    const newId = Date.now().toString();
    const newChat: ChatSession = {
      id: newId,
      title: 'New Chat',
      timestamp: 'Just now',
      createdAt: new Date().toISOString(),
      isActive: true
    };
    
    // Update existing chats to not be active
    const updatedHistory = chatHistory.map(chat => ({
      ...chat,
      isActive: false
    }));
    
    // Add new chat to history
    setChatHistory([newChat, ...updatedHistory]);
  }

  /**
   * Select a chat session
   */
  static selectChat(
    id: string,
    chatHistory: ChatSession[],
    setChatHistory: (history: ChatSession[]) => void
  ): void {
    // Set the selected chat as active and others as inactive
    const updatedHistory = chatHistory.map(chat => ({
      ...chat,
      isActive: chat.id === id
    }));
    
    setChatHistory(updatedHistory);
  }

  /**
   * Edit a chat session title
   */
  static editChat(
    id: string,
    chatHistory: ChatSession[],
    setChatHistory: (history: ChatSession[]) => void
  ): void {
    const chat = chatHistory.find(c => c.id === id);
    if (chat) {
      const newTitle = prompt("Enter new chat title:", chat.title);
      if (newTitle) {
        const updatedHistory = chatHistory.map(c => 
          c.id === id ? { ...c, title: newTitle } : c
        );
        setChatHistory(updatedHistory);
      }
    }
  }

  /**
   * Delete a chat session
   */
  static deleteChat(
    id: string,
    chatHistory: ChatSession[],
    setChatHistory: (history: ChatSession[]) => void
  ): void {
    const confirmDelete = window.confirm("Delete this chat?");
    if (confirmDelete) {
      const updatedHistory = chatHistory.filter(chat => chat.id !== id);
      setChatHistory(updatedHistory);
    }
  }

  /**
   * Clear all chat sessions
   */
  static clearAllChats(setChatHistory: (history: ChatSession[]) => void): void {
    const confirmClear = window.confirm(
      "Are you sure you want to clear all chats? This action cannot be undone."
    );
    if (confirmClear) {
      setChatHistory([]);
    }
  }
}
