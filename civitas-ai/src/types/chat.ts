// FILE: src/types/chat.ts

export interface ToolCard {
  id: string;
  title: string;
  description: string;
  status: 'running' | 'completed' | 'error';
  data?: any;
}

export interface ActionOption {
  label: string;
  action: string;
}

export interface Action {
  type: 'confirm';
  message: string;
  options: ActionOption[];
  context?: {
    action_type: string;
    query: string;
    [key: string]: any;
  };
}

export interface Message {
  id: string;
  content: string;
  role?: 'user' | 'assistant';
  type?: 'user' | 'assistant'; // For backward compatibility
  timestamp: string | Date;
  isStreaming?: boolean;
  attachment?: {
    name: string;
    type: string;
    url: string;
  };
  tools?: ToolCard[];
  action?: Action;
}
