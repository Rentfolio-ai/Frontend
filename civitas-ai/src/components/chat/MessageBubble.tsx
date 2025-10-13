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
  
  // iMessage style: AI on left, User on right
  return (
    <div className={cn(
      'flex gap-3 mb-4 animate-slide-in px-4',
      isUser ? 'justify-end' : 'justify-start'
    )}>
      {/* AI Avatar - Left side only */}
      {!isUser && (isFirst || groupLength === 1) && (
        <div className="flex flex-col items-center gap-1 flex-shrink-0">
          <AgentAvatar size="sm" />
          <div 
            className="text-[10px] font-medium whitespace-nowrap text-white/60"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            {typeof message.timestamp === 'string' 
              ? message.timestamp 
              : new Date(message.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
          </div>
        </div>
      )}
      
      {/* Spacer when AI avatar is hidden */}
      {!isUser && !(isFirst || groupLength === 1) && (
        <div className="w-10 flex-shrink-0" />
      )}

      {/* Message Bubble - iMessage style */}
      <div className={cn(
        'max-w-[65%] px-4 py-3 rounded-[20px] backdrop-blur-lg transition-all duration-200',
        isUser 
          ? 'rounded-br-sm' // User bubble tail on bottom-right
          : 'rounded-bl-sm'  // AI bubble tail on bottom-left
      )}
      style={{
        background: isUser 
          ? 'linear-gradient(135deg, #0084FF 0%, #0071E3 100%)' // iMessage blue
          : 'rgba(255, 255, 255, 0.9)',
        boxShadow: isUser 
          ? '0px 2px 8px rgba(0, 132, 255, 0.25)'
          : '0px 2px 8px rgba(0, 0, 0, 0.1)',
        border: isUser 
          ? 'none'
          : '1px solid rgba(0, 0, 0, 0.05)'
      }}
      >
        <div 
          className={cn(
            'text-[15px] leading-[1.4] whitespace-pre-wrap',
            message.isStreaming && 'inline'
          )}
          style={{
            color: isUser ? '#FFFFFF' : '#1A1A1A',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
          }}
        >
          {message.content}
          {message.isStreaming && (
            <span 
              className="inline-block w-0.5 h-4 ml-1 animate-pulse align-middle"
              style={{ background: isUser ? '#FFFFFF' : '#007AFF' }}
            />
          )}
        </div>
        
        {/* Attachment rendering */}
        {message.attachment && (
          <div className="mt-2">
            {message.attachment.type.startsWith('image') ? (
              <img
                src={message.attachment.url}
                alt={message.attachment.name}
                className="max-w-md max-h-64 rounded-xl shadow"
              />
            ) : (
              <a
                href={message.attachment.url}
                download={message.attachment.name}
                className="inline-flex items-center gap-2 px-3 py-2 bg-black/10 rounded-lg text-sm hover:bg-black/20 transition-colors"
                style={{ color: isUser ? '#FFFFFF' : '#1A1A1A' }}
              >
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M12 16V4M12 16l-4-4m4 4l4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><rect x="4" y="18" width="16" height="2" rx="1" fill="currentColor"/></svg>
                {message.attachment.name}
              </a>
            )}
          </div>
        )}
      </div>
      
      {/* User timestamp - Right side only */}
      {isUser && (isFirst || groupLength === 1) && (
        <div className="flex flex-col items-center gap-1 flex-shrink-0 justify-end pb-1">
          <div 
            className="text-[10px] font-medium whitespace-nowrap text-white/60"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            {typeof message.timestamp === 'string' 
              ? message.timestamp 
              : new Date(message.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
          </div>
        </div>
      )}
    </div>
  );
};