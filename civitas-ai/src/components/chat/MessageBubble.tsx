// FILE: src/components/chat/MessageBubble.tsx
import React from 'react';
import { cn } from '../../lib/utils';
import type { Message } from '@/types/chat';

interface MessageBubbleProps {
  message: Message;
  groupLength?: number;
  isFirst?: boolean;
}
export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';
  
  // iMessage style: AI on left, User on right - stacked conversation
  return (
    <div className={cn(
      'flex gap-3 animate-slide-in px-6 mb-3',
      isUser ? 'justify-end' : 'justify-start'
    )}>
      {/* Message Bubble - iMessage style */}
      <div className={cn(
        'max-w-[70%] px-5 py-3.5 rounded-[22px] backdrop-blur-lg transition-all duration-200 relative',
        isUser 
          ? 'rounded-br-md' // User bubble tail on bottom-right
          : 'rounded-bl-md'  // AI bubble tail on bottom-left
      )}
      style={{
        background: isUser 
          ? 'linear-gradient(135deg, #477CB2 0%, #3B5998 100%)' // Darker blue like reference
          : 'rgba(235, 238, 241, 0.95)', // Light gray like reference
        boxShadow: isUser 
          ? '0px 1px 4px rgba(0, 0, 0, 0.15)'
          : '0px 1px 4px rgba(0, 0, 0, 0.08)',
        border: isUser 
          ? 'none'
          : '1px solid rgba(0, 0, 0, 0.04)'
      }}
      >
        <div 
          className={cn(
            'text-[15px] leading-[1.47] whitespace-pre-wrap',
            message.isStreaming && 'inline'
          )}
          style={{
            color: isUser ? '#FFFFFF' : '#4A5568',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontWeight: 400
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
        
        {/* Timestamp inside bubble - bottom right */}
        <div 
          className="text-[11px] mt-1.5 text-right opacity-70"
          style={{
            color: isUser ? '#FFFFFF' : '#6B7280',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
          }}
        >
          {typeof message.timestamp === 'string' 
            ? message.timestamp 
            : new Date(message.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
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
    </div>
  );
};