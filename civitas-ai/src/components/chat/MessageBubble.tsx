// FILE: src/components/chat/MessageBubble.tsx
import React from 'react';
import { cn } from '../../lib/utils';
import type { Message } from '@/types/chat';
import { AgentAvatar } from '../common/AgentAvatar';
import { UserAvatar } from '../common/UserAvatar';
import { useAuth } from '../../contexts/AuthContext';

interface MessageBubbleProps {
  message: Message;
}
export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const { user } = useAuth();
  
  // Real Estate STR-focused design: Professional cards with investment theme
  return (
    <div className={cn(
      'flex gap-4 animate-slide-in px-6 mb-4',
      isUser ? 'justify-end' : 'justify-start'
    )}>
      {/* AI Agent Avatar - Left side only */}
      {!isUser && (
        <div className="flex-shrink-0 pt-1">
          <AgentAvatar size="md" />
        </div>
      )}
      
      {/* Message Card - Floating Real Estate Style */}
      <div className={cn(
        'max-w-[68%] px-6 py-4 rounded-2xl backdrop-blur-2xl transition-all duration-300 relative hover:translate-y-[-2px]',
        isUser 
          ? 'rounded-tr-sm' // Subtle corner cut for user
          : 'rounded-tl-sm'  // Subtle corner cut for AI
      )}
      style={{
        background: isUser 
          ? 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)' // Brighter blue gradient
          : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #f1f5f9 100%)', // Soft white-to-light-gray gradient
        boxShadow: isUser 
          ? '0px 12px 32px rgba(37, 99, 235, 0.3), 0px 4px 12px rgba(30, 64, 175, 0.2), 0px 2px 4px rgba(0, 0, 0, 0.1)'
          : '0px 4px 20px rgba(148, 163, 184, 0.12), 0px 2px 10px rgba(203, 213, 225, 0.1), 0px 1px 3px rgba(100, 116, 139, 0.08)',
        border: isUser 
          ? '1px solid rgba(255, 255, 255, 0.15)'
          : '1px solid rgba(226, 232, 240, 0.8)',
        transform: 'translateZ(0)' // Hardware acceleration for smooth floating effect
      }}
      >
        {/* Real Estate Professional Badge (for AI messages) */}
        {!isUser && (
          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-100">
            <span 
              className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider"
              style={{ fontFamily: 'Inter, system-ui, sans-serif', letterSpacing: '0.08em' }}
            >
              Civitas Advisor
            </span>
          </div>
        )}

        <div 
          className={cn(
            'leading-relaxed whitespace-pre-wrap',
            message.isStreaming && 'inline'
          )}
          style={{
            color: isUser ? '#FFFFFF' : '#1e293b',
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
            fontSize: '15px',
            fontWeight: isUser ? 400 : 450,
            lineHeight: '1.6',
            letterSpacing: '0.01em'
          }}
        >
          {message.content}
          {message.isStreaming && (
            <span 
              className="inline-block w-1 h-4 ml-1 animate-pulse align-middle rounded-sm"
              style={{ background: isUser ? 'rgba(255, 255, 255, 0.8)' : '#3b82f6' }}
            />
          )}
        </div>
        
        {/* Timestamp with property context indicator */}
        <div 
          className="flex items-center justify-between mt-3 pt-2 border-t"
          style={{
            borderColor: isUser ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.05)'
          }}
        >
          <div 
            className="text-[10px] font-medium uppercase"
            style={{
              color: isUser ? 'rgba(255, 255, 255, 0.7)' : '#94a3b8',
              fontFamily: 'Inter, system-ui, sans-serif',
              letterSpacing: '0.06em'
            }}
          >
            {typeof message.timestamp === 'string' 
              ? message.timestamp 
              : new Date(message.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
          </div>
          
          {/* STR Investment Badge */}
          {!isUser && (
            <div className="flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 22V12h6v10" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span 
                className="text-[9px] font-bold text-emerald-600"
                style={{ fontFamily: 'Inter, system-ui, sans-serif', letterSpacing: '0.05em' }}
              >
                STR
              </span>
            </div>
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
      
      {/* User Avatar - Right side only */}
      {isUser && (
        <div className="flex-shrink-0 pt-1">
          <UserAvatar name={user?.name || 'User'} size="md" />
        </div>
      )}
    </div>
  );
};