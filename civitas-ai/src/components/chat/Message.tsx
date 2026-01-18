/**
 * Message Component - Calm, Confident, AI-First
 * 
 * Following Jony Ive + Sam Altman principles:
 * - Left-aligned with avatars
 * - Structured AI responses (NOT text blobs)
 * - Inline evidence, confidence, next action
 * - Generous whitespace, restrained colors
 */

import React from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { User, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ConfidenceBadge } from '@/components/primitives/ConfidenceBadge';
import { EvidenceChip } from '@/components/primitives/EvidenceChip';
import type { Message as MessageType } from '@/types/chat';
import { usePreferencesStore } from '../../stores/preferencesStore';
import { LINE_HEIGHT_MAP } from '../../types/stream';

interface MessageProps {
  message: MessageType;
  onSuggestionClick?: (suggestion: string) => void;
  className?: string;
}

export const Message: React.FC<MessageProps> = ({
  message,
  onSuggestionClick,
  className,
}) => {
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';
  
  // Reading preferences (accessibility)
  const { readingPreferences } = usePreferencesStore();

  // Extract metadata from message (if available)
  const confidence = (message as any).confidence as 'high' | 'medium' | 'low' | undefined;
  const evidence = (message as any).evidence as Array<{id: string; label: string; url?: string}> | undefined;
  const nextAction = (message as any).nextAction as {label: string; action: string} | undefined;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={cn('flex gap-4 mb-6', className)}
    >
      {/* Avatar */}
      <div className="flex-shrink-0">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{
            background: isUser
              ? 'rgba(245, 158, 11, 0.15)'
              : 'rgba(139, 92, 246, 0.15)',
            border: `1px solid ${
              isUser ? 'rgba(245, 158, 11, 0.3)' : 'rgba(139, 92, 246, 0.3)'
            }`,
          }}
        >
          {isUser ? (
            <User className="w-4 h-4" style={{ color: '#f59e0b' }} />
          ) : (
            <Sparkles className="w-4 h-4" style={{ color: '#8b5cf6' }} />
          )}
        </div>
      </div>

      {/* Message Content */}
      <div className="flex-1 min-w-0">
        {isUser ? (
          // User message - simple, compact
          <div
            className="rounded-xl px-5 py-4"
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            <div
              className="leading-relaxed"
              style={{ 
                color: '#f8fafc',
                fontSize: `${readingPreferences.textSize}px`,
                lineHeight: LINE_HEIGHT_MAP[readingPreferences.lineSpacing],
                fontWeight: readingPreferences.boldText ? 600 : 400
              }}
            >
              {message.content}
              {message.edited && (
                <span className="ml-2 text-xs opacity-50">(edited)</span>
              )}
            </div>
          </div>
        ) : (
          // AI message - structured, rich
          <div className="space-y-4">
            {/* Main answer */}
            <div 
              className="leading-relaxed" 
              style={{ 
                color: '#cbd5e1',
                fontSize: `${readingPreferences.textSize}px`,
                lineHeight: LINE_HEIGHT_MAP[readingPreferences.lineSpacing],
                fontWeight: readingPreferences.boldText ? 600 : 400
              }}
            >
              <ReactMarkdown
                components={{
                  h3: ({ children }) => (
                    <h3
                      className="font-semibold mb-3"
                      style={{ 
                        color: '#f8fafc',
                        fontSize: `${readingPreferences.textSize + 2}px`  // Slightly larger for headings
                      }}
                    >
                      {children}
                    </h3>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-semibold" style={{ color: '#f8fafc' }}>
                      {children}
                    </strong>
                  ),
                  code: ({ children, ...props }) =>
                    (props as any).inline ? (
                      <code
                        className="px-1.5 py-0.5 rounded font-mono text-[14px]"
                        style={{
                          background: 'rgba(255, 255, 255, 0.08)',
                          color: '#fbbf24',
                        }}
                      >
                        {children}
                      </code>
                    ) : (
                      <code
                        className="block px-3 py-2 rounded-lg font-mono text-[14px] overflow-x-auto my-3"
                        style={{
                          background: 'rgba(0, 0, 0, 0.3)',
                          color: '#cbd5e1',
                        }}
                      >
                        {children}
                      </code>
                    ),
                  ul: ({ children }) => (
                    <ul className="space-y-1.5 my-3">{children}</ul>
                  ),
                  li: ({ children }) => (
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5" style={{ color: '#f59e0b' }}>
                        •
                      </span>
                      <span>{children}</span>
                    </li>
                  ),
                  p: ({ children }) => (
                    <p className="mb-3 last:mb-0">{children}</p>
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>

              {/* Streaming cursor */}
              {message.streaming && (
                <motion.span
                  className="inline-block w-0.5 h-[18px] ml-0.5"
                  style={{ background: '#f59e0b' }}
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              )}
            </div>

            {/* Evidence chips (if present) */}
            {evidence && evidence.length > 0 && !message.streaming && (
              <div className="flex gap-2 flex-wrap">
                {evidence.slice(0, 5).map((e) => (
                  <EvidenceChip key={e.id} label={e.label} url={e.url} />
                ))}
              </div>
            )}

            {/* Confidence + Next Action row */}
            {!message.streaming && (confidence || nextAction) && (
              <div className="flex items-center gap-3 flex-wrap">
                {/* Confidence badge */}
                {confidence && (
                  <ConfidenceBadge level={confidence} />
                )}

                {/* Next action chip */}
                {nextAction && (
                  <button
                    onClick={() => onSuggestionClick?.(nextAction.label)}
                    className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
                    style={{
                      background: 'rgba(245, 158, 11, 0.1)',
                      border: '1px solid rgba(245, 158, 11, 0.3)',
                      color: '#fbbf24',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(245, 158, 11, 0.15)';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(245, 158, 11, 0.1)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    {nextAction.label}
                  </button>
                )}
              </div>
            )}

            {/* Legacy suggestions (if no nextAction) */}
            {!nextAction &&
              message.suggestions &&
              message.suggestions.length > 0 &&
              !message.streaming && (
                <div className="flex flex-wrap gap-2">
                  {message.suggestions.slice(0, 1).map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => onSuggestionClick?.(suggestion)}
                      className="px-3.5 py-2 rounded-full text-[13px] transition-all"
                      style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        color: '#64748b',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(245, 158, 11, 0.08)';
                        e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.3)';
                        e.currentTarget.style.color = '#fbbf24';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                        e.currentTarget.style.color = '#64748b';
                      }}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
          </div>
        )}
      </div>
    </motion.div>
  );
};
