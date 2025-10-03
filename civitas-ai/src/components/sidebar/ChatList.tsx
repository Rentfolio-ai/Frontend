// FILE: src/components/sidebar/ChatList.tsx
import React, { useState } from 'react';
import { ChatListItem } from './ChatListItem';
import { Button } from '../primitives/Button';

interface Chat {
  id: string;
  title: string;
  timestamp: string;
  messagePreview?: string;
  hasUnread?: boolean;
  date: Date;
}

interface ChatGroup {
  label: string;
  chats: Chat[];
}

interface ChatListProps {
  chats: Chat[];
  activeChatId?: string;
  onChatSelect: (chatId: string) => void;
  onChatDelete?: (chatId: string) => void;
}

const groupChatsByDate = (chats: Chat[]): ChatGroup[] => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

  const groups: ChatGroup[] = [
    { label: 'Today', chats: [] },
    { label: 'Yesterday', chats: [] },
    { label: 'Last 7 days', chats: [] },
    { label: 'Earlier', chats: [] },
  ];

  chats.forEach(chat => {
    const chatDate = new Date(chat.date);
    if (chatDate >= today) {
      groups[0].chats.push(chat);
    } else if (chatDate >= yesterday) {
      groups[1].chats.push(chat);
    } else if (chatDate >= lastWeek) {
      groups[2].chats.push(chat);
    } else {
      groups[3].chats.push(chat);
    }
  });

  return groups.filter(group => group.chats.length > 0);
};

export const ChatList: React.FC<ChatListProps> = ({
  chats,
  activeChatId,
  onChatSelect,
  onChatDelete,
}) => {
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  const groupedChats = groupChatsByDate(chats);

  const toggleGroup = (groupLabel: string) => {
    const newCollapsed = new Set(collapsedGroups);
    if (newCollapsed.has(groupLabel)) {
      newCollapsed.delete(groupLabel);
    } else {
      newCollapsed.add(groupLabel);
    }
    setCollapsedGroups(newCollapsed);
  };

  return (
    <div className="space-y-1">
      {groupedChats.map(group => (
        <div key={group.label} className="space-y-1">
          {/* Group Header */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleGroup(group.label)}
            className="w-full justify-between px-2 py-1 h-auto text-xs font-medium text-foreground/60 hover:text-foreground"
          >
            <span>{group.label}</span>
            <svg
              className={`w-3 h-3 transition-transform ${
                collapsedGroups.has(group.label) ? 'rotate-0' : 'rotate-90'
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Button>

          {/* Group Items */}
          {!collapsedGroups.has(group.label) && (
            <div className="space-y-1 pl-2">
              {group.chats.map(chat => (
                <ChatListItem
                  key={chat.id}
                  id={chat.id}
                  title={chat.title}
                  timestamp={chat.timestamp}
                  messagePreview={chat.messagePreview}
                  hasUnread={chat.hasUnread}
                  isActive={chat.id === activeChatId}
                  onClick={onChatSelect}
                  onDelete={onChatDelete}
                />
              ))}
            </div>
          )}
        </div>
      ))}

      {chats.length === 0 && (
        <div className="text-center py-8 text-foreground/60">
          <p className="text-sm">No conversations yet</p>
          <p className="text-xs mt-1">Start a new chat to begin</p>
        </div>
      )}
    </div>
  );
};