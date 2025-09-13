// FILE: src/components/sidebar/Sidebar.tsx
import React, { useState } from 'react';
import { NewChatButton } from './NewChatButton';
import { Button } from '../primitives/Button';
// import { ChatList } from './ChatList';
// import { seedChats } from '../../data/seed';
import { cn } from '../../lib/utils';

interface SidebarProps {
  isCollapsed: boolean;
  onNewChat?: () => void;
  chatHistory?: { id: string; messages: any[] }[];
  onSelectChat?: (chatId: string) => void;
  activeChatId?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onNewChat, chatHistory = [], onSelectChat, activeChatId }) => {
  const [activeSection, setActiveSection] = useState<'chats' | 'reports' | 'properties'>('chats');
  const handleNewChat = onNewChat ?? (() => {});

  if (isCollapsed) {
    return null;
  }

  const sections = [
    { id: 'chats', label: 'Chats', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
    { id: 'reports', label: 'Reports', icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
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
        <nav className="grid grid-cols-3 gap-1 bg-muted rounded-lg p-1">
          {sections.map(section => (
            <Button
              key={section.id}
              variant={activeSection === section.id ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setActiveSection(section.id as any)}
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
              {Array.isArray(chatHistory) && chatHistory.map((chat: { id: string; messages: any[] }) => (
                <button
                  key={chat.id}
                  className={`w-full text-left px-3 py-2 rounded-lg border border-border bg-muted/30 hover:bg-primary/10 transition-colors ${activeChatId === chat.id ? 'bg-primary/20 border-primary font-bold' : ''}`}
                  onClick={() => onSelectChat && onSelectChat(chat.id)}
                  aria-label={`Open chat ${chat.id}`}
                >
                  Chat {chat.id}
                  <span className="ml-2 text-xs text-muted">({chat.messages.length} messages)</span>
                </button>
              ))}
            </div>
          )}
          
          {activeSection === 'reports' && (
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
                    d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-sm font-medium text-foreground mb-2">No reports yet</h3>
              <p className="text-xs text-foreground/60 leading-relaxed">
                Generate your first report by asking me to analyze properties or market trends.
              </p>
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