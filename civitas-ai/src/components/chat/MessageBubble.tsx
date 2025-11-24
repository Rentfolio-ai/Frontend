// FILE: src/components/chat/MessageBubble.tsx
import React from 'react';
import { cn } from '../../lib/utils';
import type { Message } from '@/types/chat';
import { AgentAvatar, type AgentStatus } from '../common/AgentAvatar';
import { ActionButtons } from './ActionButtons';
import { useAuth } from '../../contexts/AuthContext';

interface MessageBubbleProps {
  message: Message;
  onAction?: (actionValue: string, actionContext?: any) => void;
  agentStatus?: AgentStatus;
}
export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, onAction, agentStatus = 'online' }) => {
  const isUser = message.role === 'user';
  const { user } = useAuth();
  const userInitials = (user?.name || 'You')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase())
    .join('') || 'YOU';
  
  const timestampLabel = typeof message.timestamp === 'string'
    ? message.timestamp
    : new Date(message.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

  const messageContent = (
    <>
      <div 
        className={cn(
          'text-[15px] leading-relaxed whitespace-pre-wrap font-medium tracking-wide',
          message.isStreaming && 'inline',
          isUser ? 'text-[#4B2A1A]' : 'text-slate-800'
        )}
      >
        {message.content}
        {message.isStreaming && (
          <span 
            className="inline-block w-2 h-4 ml-1 align-middle bg-teal-500 animate-pulse rounded-sm"
            style={{ animationDuration: '0.8s' }}
          />
        )}
      </div>
      <div className={cn(
        'flex items-center gap-2 text-[10px] font-medium mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200',
        isUser ? 'text-[#B7613A]' : 'text-slate-500'
      )}>
        <span>{timestampLabel}</span>
      </div>
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
              className={cn(
                'inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors border',
                isUser
                  ? 'bg-white/80 border-[#F4BC9E] text-[#5C2C1E] hover:bg-white'
                  : 'bg-black/10 hover:bg-black/20 border-transparent'
              )}
            >
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                <path d="M12 16V4M12 16l-4-4m4 4l4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <rect x="4" y="18" width="16" height="2" rx="1" fill="currentColor" />
              </svg>
              {message.attachment.name}
            </a>
          )}
        </div>
      )}
      {!isUser && message.action && onAction && (
        <ActionButtons action={message.action} onAction={onAction} />
      )}
    </>
  );
  
  // Translucent, breathable design
  return (
    <div className={cn(
      'flex gap-3 animate-slide-in mb-3',
      isUser ? 'justify-end' : 'justify-start'
    )}>
      {/* AI Agent Avatar - Left side only */}
      {!isUser && (
        <div className="flex-shrink-0 pt-1">
          <AgentAvatar size="md" status={agentStatus} />
        </div>
      )}
      
      {/* Message Card - Real Estate Copilot Theme */}
      {isUser ? (
        <div className="relative max-w-[75%] group">
          <div className="flex overflow-hidden rounded-[26px] border border-[#F1C2A4]/70 shadow-[0_18px_38px_rgba(171,94,56,0.18)] bg-[#FFE6D4]/90">
            <div className="relative w-14 bg-gradient-to-b from-[#FF7A45] via-[#FF8C5C] to-[#FFAF8C] text-white font-semibold tracking-[0.12em] flex items-center justify-center uppercase">
              <span>{userInitials}</span>
              <div className="absolute inset-0 bg-white/10 mix-blend-soft-light" />
              <div className="absolute inset-y-0 right-0 w-px bg-white/20" />
            </div>
            <div
              className="relative flex-1 bg-[#FFF4EC]/95"
              style={{ clipPath: 'polygon(0 0, calc(100% - 28px) 0, 100% 28px, 100% 100%, 0 100%)' }}
            >
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-white/70 to-transparent pointer-events-none" />
              <div className="relative px-6 py-4">
                {messageContent}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className={cn(
          'max-w-[55%] px-6 py-4 rounded-2xl rounded-tl-sm bg-blue-50/90 border border-blue-900/10 shadow-blue-900/5 text-slate-800 backdrop-blur-2xl transition-all duration-200 hover:shadow-lg group'
        )}>
          {messageContent}
        </div>
      )}
      
    </div>
  );
};