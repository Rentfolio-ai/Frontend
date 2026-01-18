/**
 * Sidebar - ChatGPT Style
 * 
 * Left sidebar with:
 * - New chat button
 * - Chat history
 * - Collapsible
 */

import React from 'react';
import { Plus, MessageSquare, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Chat {
  id: string;
  title: string;
  timestamp: number;
}

interface SidebarProps {
  chats: Chat[];
  activeChat?: string;
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  chats,
  activeChat,
  onNewChat,
  onSelectChat,
  isCollapsed = false,
  onToggleCollapse,
  className,
}) => {
  if (isCollapsed) {
    return (
      <div
        className={cn('w-12 bg-[#171717] border-r border-[#262626] flex flex-col items-center py-3', className)}
      >
        <button
          onClick={onToggleCollapse}
          className="p-2 rounded-lg hover:bg-[#262626] transition-colors"
        >
          <MessageSquare className="w-5 h-5 text-[#a3a3a3]" />
        </button>
      </div>
    );
  }

  return (
    <div className={cn('w-60 bg-[#171717] border-r border-[#262626] flex flex-col', className)}>
      {/* Header */}
      <div className="p-3 flex items-center justify-between">
        <button
          onClick={onToggleCollapse}
          className="p-2 rounded-lg hover:bg-[#262626] transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-[#a3a3a3]" />
        </button>
      </div>

      {/* New Chat Button */}
      <div className="px-3 mb-2">
        <button
          onClick={onNewChat}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border border-[#404040] hover:bg-[#262626] transition-colors"
        >
          <Plus className="w-4 h-4 text-[#e5e5e5]" />
          <span className="text-sm text-[#e5e5e5]">New chat</span>
        </button>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto px-3 space-y-1">
        {chats.map((chat) => (
          <button
            key={chat.id}
            onClick={() => onSelectChat(chat.id)}
            className={cn(
              'w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors',
              activeChat === chat.id
                ? 'bg-[#404040] text-white'
                : 'text-[#a3a3a3] hover:bg-[#262626] hover:text-[#e5e5e5]'
            )}
          >
            <div className="flex items-center gap-3">
              <MessageSquare className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{chat.title}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
