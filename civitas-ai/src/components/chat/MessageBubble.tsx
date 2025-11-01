// FILE: src/components/chat/MessageBubble.tsx
import React from 'react';
import { cn } from '../../lib/utils';
import type { Message } from '@/types/chat';
import { AgentAvatar } from '../common/AgentAvatar';
import { UserAvatar } from '../common/UserAvatar';
import { ActionButtons } from './ActionButtons';
import { useAuth } from '../../contexts/AuthContext';

interface MessageBubbleProps {
  message: Message;
  onAction?: (actionValue: string, actionContext?: any) => void;
}
export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, onAction }) => {
  const isUser = message.role === 'user';
  const { user } = useAuth();
  
  // Translucent, breathable design
  return (
    <div className={cn(
      'flex gap-3 animate-slide-in mb-3',
      isUser ? 'justify-end' : 'justify-start'
    )}>
      {/* AI Agent Avatar - Left side only */}
      {!isUser && (
        <div className="flex-shrink-0 pt-1">
          <AgentAvatar size="md" />
        </div>
      )}
      
      {/* Message Card - Premium glassmorphism with STR context */}
      <div className={cn(
        'max-w-[55%] px-4 py-3.5 backdrop-blur-2xl transition-all duration-150 hover:translate-y-[-2px] group',
        isUser 
          ? 'rounded-2xl rounded-br-md bg-gradient-to-br from-blue-500/20 to-cyan-500/15 border border-blue-400/25 shadow-2xl shadow-blue-500/10 hover:shadow-blue-500/20 hover:border-blue-400/35' 
          : 'rounded-2xl rounded-tl-md bg-white/[0.08] border border-white/[0.12] hover:bg-white/[0.11] shadow-xl shadow-black/5 hover:shadow-cyan-500/5 hover:border-white/[0.18]'
      )}
      >

        <div 
          className={cn(
            'text-sm leading-relaxed whitespace-pre-wrap group-hover:text-white/95 transition-colors duration-150',
            message.isStreaming && 'inline',
            isUser ? 'text-white/95' : 'text-white/85'
          )}
        >
          {message.content}
          {message.isStreaming && (
            <span 
              className="inline-block w-1 h-4 ml-1 animate-pulse align-middle rounded-sm bg-blue-400"
            />
          )}
        </div>
        
        {/* Timestamp - Subtle */}
        <div className="flex items-center gap-2 text-[10px] text-white/30 font-medium mt-2">
          <span>
            {typeof message.timestamp === 'string' 
              ? message.timestamp 
              : new Date(message.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
          </span>
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

        {/* Action Buttons - for assistant messages only */}
        {!isUser && message.action && onAction && (
          <ActionButtons action={message.action} onAction={onAction} />
        )}
      </div>
      
      {/* User Avatar - Right side only */}
      {isUser && (
        <div className="flex-shrink-0 pt-1">
          <UserAvatar name={user?.name || 'User'} size="md" />
        </div>
      )}
    </div>
  );
};