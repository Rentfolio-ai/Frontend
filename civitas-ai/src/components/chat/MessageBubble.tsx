// FILE: src/components/chat/MessageBubble.tsx
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '../../lib/utils';
import type { Message } from '@/types/chat';
import { AgentAvatar, type AgentStatus } from '../common/AgentAvatar';
import { ActionButtons } from './ActionButtons';
import { ToolMessage } from './ToolMessage';
import { PropertyBookmarkCard, PropertyComparisonTableCard, GeneratedReportCard, VisionAnalysisCard, PropertyListCard } from './tool-cards';
import type { ComparePropertiesOutput, GenerateReportOutput } from '../../types/backendTools';
import type { VisionAnalysisData } from './tool-cards/VisionAnalysisCard';
import type { InvestmentStrategy } from '../../types/pnl';
import type { BookmarkedProperty } from '../../types/bookmarks';
import type { ScoutedProperty } from '../../types/backendTools';

import type { CompletedTool } from '../../types/stream';

import { Copy, RotateCcw, Check, ThumbsUp, ThumbsDown, Pencil, Clipboard, ClipboardCheck } from 'lucide-react';
import { submitFeedback } from '../../services/feedbackApi';

// Format relative time (e.g., "just now", "2m ago", "1h ago")
const formatRelativeTime = (timestamp: string | Date): string => {
  const now = new Date();
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay === 1) return 'yesterday';
  if (diffDay < 7) return `${diffDay}d ago`;

  // For older messages, show the date
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// Code block with copy button component
const CodeBlockWithCopy: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    const text = String(children).replace(/\n$/, '');
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  return (
    <div className="relative group/code my-2">
      <button
        onClick={handleCopy}
        className="absolute right-2 top-2 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/50 hover:text-white transition-all opacity-0 group-hover/code:opacity-100 z-10"
        title="Copy code"
      >
        {copied ? <ClipboardCheck className="w-3.5 h-3.5" /> : <Clipboard className="w-3.5 h-3.5" />}
      </button>
      <code className={cn("block bg-black/30 rounded-lg p-3 pr-10 text-sm font-mono text-white/90 overflow-x-auto", className)}>
        {children}
      </code>
    </div>
  );
};

interface MessageBubbleProps {
  message: Message;
  onAction?: (actionValue: string, actionContext?: any) => void;
  agentStatus?: AgentStatus;
  onOpenDealAnalyzer?: (propertyId: string | null, strategy: InvestmentStrategy, purchasePrice?: number, propertyAddress?: string) => void;
  bookmarks?: BookmarkedProperty[];
  onToggleBookmark?: (property: ScoutedProperty) => void;
  onNavigateToReports?: () => void;
  reasoningSteps?: CompletedTool[];
  userName?: string;
  onRefresh?: (messageId: string) => void;
  onViewDetails?: (property: any) => void;
  onEdit?: (content: string) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  onAction,
  agentStatus = 'online',
  onOpenDealAnalyzer,
  bookmarks,
  onToggleBookmark,
  onNavigateToReports,
  reasoningSteps = [],
  userName,
  onRefresh,
  onViewDetails,
  onEdit,
}) => {
  const isUser = message.role === 'user';
  const [isCopied, setIsCopied] = React.useState(false);
  const [feedback, setFeedback] = React.useState<'up' | 'down' | null>(null);

  const handleFeedback = async (score: number) => {
    if (feedback !== null) return; // Prevent multiple votes

    // Optimistic update
    setFeedback(score === 1 ? 'up' : 'down');

    // Send to backend (fire and forget)
    // We use a dummy threadId if missing, but ideally it should come from context
    const threadId = 'current-thread';
    if (message.id) {
      submitFeedback(threadId, message.id, score);
    }
  };

  const timestampLabel = formatRelativeTime(message.timestamp);

  const messageContent = (
    <>
      {!isUser ? (
        <div className="relative">
          {/* Reasoning Steps */}
          {reasoningSteps.length > 0 && (
            <div className="mb-4 space-y-2 border-b border-white/5 pb-3">
              {reasoningSteps.map((step, idx) => (
                <div key={`${step.tool}-${idx}`} className="flex items-start gap-2 text-xs text-white/40">
                  <span className="text-emerald-400/80 mt-0.5">✓</span>
                  <span className="font-medium">{step.summary}</span>
                </div>
              ))}
            </div>
          )}

          <div className="text-[15px] leading-[1.75] text-[#ececec] font-normal markdown-content">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                a: ({ node: _node, ...props }: any) => (
                  <a
                    {...props}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 hover:underline transition-colors"
                  />
                ),
                p: ({ node: _node, ...props }: any) => (
                  <p {...props} className="mb-3 last:mb-0" />
                ),
                ul: ({ node: _node, ...props }: any) => (
                  <ul {...props} className="list-disc pl-4 mb-3 space-y-1" />
                ),
                ol: ({ node: _node, ...props }: any) => (
                  <ol {...props} className="list-decimal pl-4 mb-3 space-y-1" />
                ),
                li: ({ node: _node, ...props }: any) => (
                  <li {...props} className="pl-1" />
                ),
                h1: ({ node: _node, ...props }: any) => (
                  <h1 {...props} className="text-xl font-bold mb-3 mt-4 first:mt-0" />
                ),
                h2: ({ node: _node, ...props }: any) => (
                  <h2 {...props} className="text-lg font-bold mb-2 mt-3 first:mt-0" />
                ),
                h3: ({ node: _node, ...props }: any) => (
                  <h3 {...props} className="text-base font-bold mb-2 mt-3 first:mt-0" />
                ),
                code: ({ node: _node, className, children, ...props }: any) => {
                  const match = /language-(\w+)/.exec(className || '');
                  const isInline = !match && !String(children).includes('\n');
                  return isInline ? (
                    <code {...props} className="bg-white/10 rounded px-1 py-0.5 text-sm font-mono text-white/90">
                      {children}
                    </code>
                  ) : (
                    <CodeBlockWithCopy className={className}>
                      {children}
                    </CodeBlockWithCopy>
                  );
                },
                table: ({ node: _node, ...props }: any) => (
                  <div className="overflow-x-auto my-4 rounded-lg border border-white/10">
                    <table {...props} className="w-full text-sm text-left" />
                  </div>
                ),
                thead: ({ node: _node, ...props }: any) => (
                  <thead {...props} className="bg-white/5 text-white/90 font-medium" />
                ),
                tbody: ({ node: _node, ...props }: any) => (
                  <tbody {...props} className="divide-y divide-white/5" />
                ),
                tr: ({ node: _node, ...props }: any) => (
                  <tr {...props} className="hover:bg-white/5 transition-colors" />
                ),
                th: ({ node: _node, ...props }: any) => (
                  <th {...props} className="px-4 py-3 font-medium" />
                ),
                td: ({ node: _node, ...props }: any) => (
                  <td {...props} className="px-4 py-3 text-white/70" />
                ),
                blockquote: ({ node: _node, ...props }: any) => (
                  <blockquote {...props} className="border-l-2 border-white/20 pl-4 italic text-white/60 my-3" />
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
          {message.isStreaming && (
            <span
              className="inline-block w-[2px] h-4 ml-1.5 align-middle bg-[#10b981] rounded-sm animate-pulse"
              style={{ animationDuration: '1s' }}
            />
          )}
        </div>
      ) : (
        <div className="text-[15px] leading-[1.75] whitespace-pre-wrap text-white/95 font-normal">
          {message.content}
        </div>
      )}

      {/* Timestamp */}
      <div className={cn(
        'flex items-center gap-2 text-[11px] font-normal mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200',
        isUser ? 'text-white/50 justify-end' : 'text-white/40'
      )}>
        <span>{timestampLabel}</span>
      </div>

      {/* Attachment */}
      {message.attachment && (
        <div className="mt-3">
          {message.attachment.type.startsWith('image') ? (
            <img
              src={message.attachment.url}
              alt={message.attachment.name}
              className="max-w-md max-h-64 rounded-xl shadow-lg"
            />
          ) : (
            <a
              href={message.attachment.url}
              download={message.attachment.name}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors bg-white/[0.06] hover:bg-white/[0.1] text-white/80 border border-white/[0.08]"
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

      {/* Action Buttons */}
      {!isUser && message.action && onAction && (
        <div className="mt-4">
          <ActionButtons action={message.action} onAction={onAction} />
        </div>
      )}

      {/* Tool Results */}
      {!isUser && message.tools && message.tools.length > 0 && (
        <div className="mt-4 space-y-3">
          {message.tools
            .filter((tool) => {
              // Suppress search tools - they work silently
              const suppressedTools = ['scan_market', 'hunt_deals', 'scout_properties', 'get_market_stats', 'Market Scanner'];
              const toolTitle = tool.title?.toLowerCase() || '';
              return !suppressedTools.some(s =>
                toolTitle.includes(s.toLowerCase()) ||
                tool.id?.includes(s)
              );
            })
            .map((tool) => {
              if (tool.kind === 'property_comparison' && tool.data) {
                return (
                  <PropertyBookmarkCard
                    key={tool.id}
                    data={tool.data}
                    bookmarks={bookmarks}
                    onToggleBookmark={onToggleBookmark}
                    onOpenDealAnalyzer={onOpenDealAnalyzer}
                  />
                );
              }

              if (tool.kind === 'property_comparison_table' && tool.data) {
                return (
                  <PropertyComparisonTableCard
                    key={tool.id}
                    data={tool.data as ComparePropertiesOutput}
                    bookmarks={bookmarks}
                    onToggleBookmark={onToggleBookmark}
                    onOpenDealAnalyzer={onOpenDealAnalyzer}
                  />
                );
              }

              if (tool.kind === 'generated_report' && tool.data) {
                return (
                  <GeneratedReportCard
                    key={tool.id}
                    data={tool.data as GenerateReportOutput}
                    onNavigateToReports={onNavigateToReports}
                  />
                );
              }

              if (tool.kind === 'renovation_analysis' && tool.data) {
                return (
                  <VisionAnalysisCard
                    key={tool.id}
                    data={tool.data as VisionAnalysisData}
                  />
                );
              }

              if (tool.data?.properties && Array.isArray(tool.data.properties) && tool.data.properties.length > 0) {
                return (
                  <PropertyListCard
                    key={tool.id}
                    properties={tool.data.properties}
                    onOpenDealAnalyzer={onOpenDealAnalyzer}
                    onViewDetails={onViewDetails}
                  />
                );
              }

              if (tool.kind && tool.kind !== 'generic' && tool.kind !== 'renovation_analysis') {
                return (
                  <ToolMessage
                    key={tool.id}
                    tool={tool as any}
                    timestamp={typeof message.timestamp === 'string' ? message.timestamp : message.timestamp.toISOString()}
                    onOpenDealAnalyzer={onOpenDealAnalyzer}
                    bookmarks={bookmarks}
                    onToggleBookmark={onToggleBookmark}
                  />
                );
              }

              return (
                <div
                  key={tool.id}
                  className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08]"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm text-white/90">{tool.title}</span>
                    <span className={cn(
                      'text-xs px-2 py-0.5 rounded-full',
                      tool.status === 'completed' && 'bg-primary/20 text-primary',
                      tool.status === 'running' && 'bg-warning/20 text-warning',
                      tool.status === 'error' && 'bg-danger/20 text-danger'
                    )}>
                      {tool.status}
                    </span>
                  </div>
                  {tool.description && (
                    <p className="text-xs text-white/50 mt-1">{tool.description}</p>
                  )}
                </div>
              );
            })}
        </div>
      )}
    </>
  );

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.split(' ').filter(Boolean);
    if (parts.length === 0) return 'U';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  return (
    <div className={cn(
      'flex gap-4 animate-slide-in mb-6 group',
      isUser ? 'justify-end' : 'justify-start'
    )}>
      {/* AI Avatar (Left) */}
      {!isUser && (
        <div className="flex-shrink-0 pt-0.5">
          <AgentAvatar size="md" status={agentStatus} />
        </div>
      )}

      {/* Message Bubble */}
      {isUser ? (
        /* User Message - Clean text only */
        <div className="relative max-w-[70%] text-right flex items-start justify-end gap-2">
          {/* User Actions (Left of message) */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 pt-1">
            {onEdit && (
              <button
                onClick={() => onEdit(message.content)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                title="Edit message"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors"
              title="Copy message"
            >
              {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="text-[15px] leading-[1.75] text-white/95 font-normal">
            {message.content}
          </div>
        </div>
      ) : (
        /* Assistant Message - Clean text only, no bubble */
        <div className="max-w-[95%] pl-1">
          {messageContent}

          {/* Assistant Actions (Bottom) */}
          <div className="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {/* Feedback Buttons */}
            <div className="flex items-center gap-0.5 mr-2 pr-2 border-r border-white/10">
              <button
                onClick={() => handleFeedback(1)}
                className={cn(
                  "p-1.5 rounded-lg transition-colors flex items-center gap-1.5",
                  feedback === 'up'
                    ? "text-emerald-400 bg-emerald-400/10"
                    : "text-white/40 hover:text-white hover:bg-white/10"
                )}
                title="Helpful"
                disabled={feedback !== null}
              >
                <ThumbsUp className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleFeedback(-1)}
                className={cn(
                  "p-1.5 rounded-lg transition-colors flex items-center gap-1.5",
                  feedback === 'down'
                    ? "text-red-400 bg-red-400/10"
                    : "text-white/40 hover:text-white hover:bg-white/10"
                )}
                title="Not helpful"
                disabled={feedback !== null}
              >
                <ThumbsDown className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={handleCopy}
              className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors flex items-center gap-1.5"
              title="Copy response"
            >
              {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="text-xs">Copy</span>
            </button>

            {onRefresh && (
              <button
                onClick={() => onRefresh(message.id)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors flex items-center gap-1.5"
                title="Regenerate response"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="text-xs">Regenerate</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* User Avatar (Right) */}
      {isUser && (
        <div className="flex-shrink-0 pt-0.5">
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-medium text-white/70 border border-white/10">
            {getInitials(userName)}
          </div>
        </div>
      )}
    </div>
  );
};
