// FILE: src/components/sidebar/Sidebar.tsx
import React, { useState } from 'react';
import type { Message } from '@/types/chat';
import { NewChatButton } from './NewChatButton';
import { Button } from '../primitives/Button';
// import { ChatList } from './ChatList';
// import { seedChats } from '../../data/seed';
import { cn } from '../../lib/utils';
import { generateChatTitle } from '../../utils/chatTitles';

// Extended ChatSession interface that includes messages
interface ChatSession {
  id: string;
  title?: string;
  timestamp?: string;
  isActive?: boolean;
  messages: Message[];
}

interface SidebarProps {
  isCollapsed: boolean;
  onNewChat?: () => void;
  chatHistory?: ChatSession[];
  onSelectChat?: (chatId: string) => void;
  onDeleteChat?: (chatId: string, e: React.MouseEvent) => void;
  activeChatId?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onNewChat, chatHistory = [], onSelectChat, onDeleteChat, activeChatId }) => {
  const [activeSection, setActiveSection] = useState<'chats' | 'properties'>('chats');
  const handleNewChat = onNewChat ?? (() => {});

  if (isCollapsed) {
    return null;
  }

  // Define a type for section IDs to match the activeSection state type
  type SectionId = 'chats' | 'properties';
  
  // Define the section interface with proper typing
  interface Section {
    id: SectionId;
    label: string;
    icon: string;
  }

  // Define sections with the correct type
  const sections: Section[] = [
    { id: 'chats', label: 'Chats', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
    { id: 'properties', label: 'Properties', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
  ];

  return (
    <aside className="h-full bg-surface border-r border-border flex flex-col">
      {/* Header */}
      <div className="p-4 space-y-4">
        <NewChatButton onClick={handleNewChat} />
      </div>

      {/* Navigation */}
      <div className="px-4 pb-6">
        <nav className="grid grid-cols-2 gap-1 bg-muted rounded-lg p-1">
          {sections.map(section => (
            <Button
              key={section.id}
              variant={activeSection === section.id ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setActiveSection(section.id)}
              className={cn(
                "h-9 flex-col gap-1 rounded-md transition-all duration-200",
                activeSection === section.id 
                  ? "bg-background shadow-sm text-foreground" 
                  : "hover:bg-background/50 text-foreground/70"
              )}
            >
              <svg
                className={cn(
                  "w-4 h-4 transition-colors",
                  activeSection === section.id ? "text-primary" : "text-current"
                )}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={section.icon}
                />
              </svg>
              <span className="text-xs font-medium">{section.label}</span>
            </Button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full px-4 pb-4">
          {activeSection === 'chats' && (
            <div className="h-full overflow-y-auto space-y-2">
              {/* Render persistent chat history */}
              {Array.isArray(chatHistory) && chatHistory.length === 0 && (
                <div className="text-xs text-muted text-center py-4">No previous chats</div>
              )}
              {Array.isArray(chatHistory) && chatHistory.map((chat: ChatSession) => {
                const firstUserMessage = chat.messages.find(msg => msg.role === 'user')?.content || '';
                const chatTitle = chat.title || generateChatTitle(firstUserMessage);
                return (
                  <div key={chat.id} className="relative group">
                    <button
                      onClick={() => onSelectChat && onSelectChat(chat.id)}
                      className={cn(
                        "w-full text-left p-3 rounded-lg transition-colors",
                        activeChatId === chat.id
                          ? "bg-blue-50 border border-blue-200"
                          : "hover:bg-gray-50"
                      )}
                      aria-label={`Select chat: ${chatTitle}`}
                    >
                      <div className="font-medium pr-8">{chatTitle}</div>
                      <div className="text-sm text-gray-500 truncate">
                        {chat.messages.length} messages
                      </div>
                    </button>
                    {chatHistory.length > 1 && onDeleteChat && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          onDeleteChat(chat.id, e);
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center rounded hover:bg-red-100 text-gray-400 hover:text-red-600 transition-all"
                        aria-label="Delete chat"
                        title="Delete chat"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          
          {activeSection === 'properties' && (
            <div className="text-center py-12 px-4">
              <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-foreground/40"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <h3 className="text-sm font-medium text-foreground mb-2">No saved properties</h3>
              <p className="text-xs text-foreground/60 leading-relaxed">
                Save properties from our conversations to quickly access them later.
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};