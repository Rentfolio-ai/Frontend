// FILE: src/components/chat/MessageBubble.tsx
import React from 'react';
import { cn } from '../../lib/utils';
import type { Message } from '@/types/chat';


interface MessageBubbleProps {
  message: Message;
  groupLength?: number;
  isFirst?: boolean;
}
export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, groupLength = 1, isFirst = true }) => {
  const isUser = message.role === 'user';
  // Only show avatar/timestamp for first message in group
  return (
    <div className={cn(
      'flex gap-3 mb-1 animate-slide-in',
      isUser ? 'justify-end' : 'justify-start'
    )}>
      {/* Avatar */}
      {!isUser && (isFirst || groupLength === 1) && (
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
          <svg
            className="w-4 h-4 text-primary-foreground"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
          </svg>
        </div>
      )}

      {/* Message Content */}
      <div className={cn(
        'max-w-[80%] space-y-2',
        isUser ? 'order-first' : ''
      )}>
        {/* Message bubble */}
        <div className={cn(
          'px-4 py-3 rounded-2xl shadow-md transition-transform duration-200',
          isUser
            ? 'bg-gradient-to-br from-primary via-primary/80 to-primary/60 text-primary-foreground ml-auto scale-105'
            : 'bg-gradient-to-br from-surface via-surface/80 to-surface/60 border border-border scale-100'
        )}>
          <div className={cn(
            'text-body whitespace-pre-wrap',
            message.isStreaming && 'typing-animation'
          )}>
            {message.content}
            {message.isStreaming && (
              <span className="inline-block w-2 h-5 ml-1 bg-current animate-pulse" />
            )}
            {/* Attachment rendering */}
            {message.attachment && (
              <div className="mt-2">
                {message.attachment.type.startsWith('image') ? (
                  <img
                    src={message.attachment.url}
                    alt={message.attachment.name}
                    className="max-w-xs max-h-48 rounded-lg border border-border shadow"
                  />
                ) : (
                  <a
                    href={message.attachment.url}
                    download={message.attachment.name}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-muted rounded text-xs text-primary border border-border"
                  >
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M12 16V4M12 16l-4-4m4 4l4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><rect x="4" y="18" width="16" height="2" rx="1" fill="currentColor"/></svg>
                    {message.attachment.name}
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Timestamp */}
        {(isFirst || groupLength === 1) && (
          <div className={cn(
            'text-xs text-foreground/60',
            isUser ? 'text-right' : 'text-left'
          )}>
            {typeof message.timestamp === 'string' 
              ? message.timestamp 
              : message.timestamp.toLocaleString()}
          </div>
        )}
      </div>

      {/* User Avatar */}
      {isUser && (isFirst || groupLength === 1) && (
        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-medium text-foreground">
            U
          </span>
        </div>
      )}
    </div>
  );
};