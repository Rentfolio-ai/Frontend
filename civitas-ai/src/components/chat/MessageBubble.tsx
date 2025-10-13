// FILE: src/components/chat/MessageBubble.tsx
import React from 'react';
import { cn } from '../../lib/utils';
import type { Message } from '@/types/chat';
import { AgentAvatar } from '../common/AgentAvatar';
import { useAuth } from '../../contexts/AuthContext';

interface MessageBubbleProps {
  message: Message;
  groupLength?: number;
  isFirst?: boolean;
}
export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, groupLength = 1, isFirst = true }) => {
  const isUser = message.role === 'user';
  const { user } = useAuth();
  
  // Get user initials
  const getUserInitials = () => {
    if (user?.name) {
      const names = user.name.split(' ');
      if (names.length >= 2) {
        return `${names[0][0]}${names[1][0]}`.toUpperCase();
      }
      return user.name.substring(0, 2).toUpperCase();
    }
    return 'U';
  };
  
  // Only show avatar/timestamp for first message in group
  return (
    <div className={cn(
      'flex gap-4 mb-6 animate-slide-in',
      'justify-start' // Always align left with avatar on left
    )}>
      {/* Avatar - Always on the left */}
      {(isFirst || groupLength === 1) && (
        <div className="flex flex-col items-center gap-1 flex-shrink-0">
          {!isUser ? (
            <AgentAvatar size="md" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-lg border-2 border-white/30">
              <span className="text-base font-bold text-white">
                {getUserInitials()}
              </span>
            </div>
          )}
          {/* Timestamp below avatar */}
          <div className="text-xs text-gray-500 font-medium whitespace-nowrap">
            {typeof message.timestamp === 'string' 
              ? message.timestamp 
              : message.timestamp.toLocaleString()}
          </div>
        </div>
      )}
      
      {/* Spacer when avatar is hidden */}
      {!(isFirst || groupLength === 1) && (
        <div className="w-12 flex-shrink-0" />
      )}

      {/* Message Content - Clean white card */}
      <div className="flex-1 max-w-3xl">
        <div className={cn(
          'px-6 py-4 rounded-2xl shadow-md transition-all duration-300 bg-white border border-gray-200',
          isUser && 'bg-gray-50'
        )}>
          <div className={cn(
            'text-base leading-relaxed whitespace-pre-wrap text-gray-800',
            message.isStreaming && 'inline'
          )}>
            {message.content}
            {message.isStreaming && (
              <span className="inline-block w-0.5 h-5 ml-1 bg-gray-800 animate-pulse align-middle" />
            )}
          </div>
          
          {/* Attachment rendering */}
          {message.attachment && (
            <div className="mt-3">
              {message.attachment.type.startsWith('image') ? (
                <img
                  src={message.attachment.url}
                  alt={message.attachment.name}
                  className="max-w-md max-h-64 rounded-xl border border-gray-200 shadow"
                />
              ) : (
                <a
                  href={message.attachment.url}
                  download={message.attachment.name}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg text-sm text-gray-700 border border-gray-200 hover:bg-gray-200 transition-colors"
                >
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M12 16V4M12 16l-4-4m4 4l4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><rect x="4" y="18" width="16" height="2" rx="1" fill="currentColor"/></svg>
                  {message.attachment.name}
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};