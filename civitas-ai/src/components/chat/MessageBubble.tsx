// FILE: src/components/chat/MessageBubble.tsx
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { cn } from '../../lib/utils';
import { SuggestionChips } from './SuggestionChips';
import type { Message } from '@/types/chat';
import { AgentAvatar, type AgentStatus } from '../common/AgentAvatar';
import { ActionButtons } from './ActionButtons';
import { ToolMessage } from './ToolMessage';
import { PropertyBookmarkCard, GeneratedReportCard, PropertyListCard } from './tool-cards';
import type { InvestmentStrategy } from '../../types/pnl';
import type { BookmarkedProperty } from '../../types/bookmarks';
import type { ScoutedProperty } from '../../types/backendTools';
import type { CompletedTool } from '../../types/stream';
import {
  Copy, RotateCcw, Check, ThumbsUp, ThumbsDown, Pencil,
  Clipboard, FileSpreadsheet, ChevronLeft,
  ChevronRight, ChevronDown, ChevronUp
} from 'lucide-react';
import { submitFeedback } from '../../services/feedbackApi';
import { extractFirstTable, markdownTableToCsv, downloadCsv } from '../../lib/tableUtils';
import { ContextBadge } from './ContextBadge';
import { useClipboard } from '../../hooks/useClipboard';
import { highlightKeyStats } from '../../utils/messageHighlighter';
import rehypeRaw from 'rehype-raw';

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

interface MessageBubbleProps {
  message: Message;
  onAction?: (actionValue: string, actionContext?: unknown) => void;
  agentStatus?: AgentStatus;
  onOpenDealAnalyzer?: (propertyId: string | null, strategy: InvestmentStrategy, purchasePrice?: number, propertyAddress?: string) => void;
  bookmarks?: BookmarkedProperty[];
  onToggleBookmark?: (property: ScoutedProperty) => void;
  onNavigateToReports?: () => void;
  reasoningSteps?: CompletedTool[];
  userName?: string;
  onRefresh?: (messageId: string) => void;
  onViewDetails?: (property: ScoutedProperty) => void;
  onEdit?: (content: string) => void;
  onNavigateBranch?: (messageId: string, direction: 'prev' | 'next') => void;
  onSuggestionSelect?: (suggestion: string) => void;
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
  onNavigateBranch,
  onSuggestionSelect
}) => {
  const isUser = message.role === 'user' || message.type === 'user';
  const hasAttachment = !!message.attachment;
  const hasTools = message.tools && message.tools.length > 0;

  // Local state for enhancements
  const [isExpanded, setIsExpanded] = useState(false);
  const [reactions, setReactions] = useState<Record<string, number>>({});
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const { copy, copied: isCopied } = useClipboard();

  // Consume reasoningSteps to avoid unused var warning
  React.useEffect(() => {
    if (reasoningSteps.length > 0) {
      // Placeholder for future logic engaging reasoning steps
    }
  }, [reasoningSteps]);

  // Truncation logic
  const MAX_LENGTH = 800;
  const shouldTruncate = message.content.length > MAX_LENGTH && !isUser;
  const displayContent = shouldTruncate && !isExpanded
    ? message.content.slice(0, MAX_LENGTH) + '...'
    : message.content;

  // Handle reaction toggle
  const toggleReaction = (emoji: string) => {
    setReactions(prev => {
      const current = prev[emoji] || 0;
      return { ...prev, [emoji]: current > 0 ? 0 : 1 };
    });
  };

  const handleCopyMessage = async () => {
    await copy(message.content);
  };

  // Handle feedback
  const handleFeedback = (isPositive: boolean) => {
    if (message.id) {
      // Using message.id as threadId placeholder if not available, since we lack thread context prop here
      submitFeedback('current-thread', message.id, isPositive ? 1 : -1);
      setFeedback(isPositive ? 'up' : 'down');
    }
  };

  // CSV download handler specifically for comparison tables
  const handleDownloadTable = () => {
    const tableData = extractFirstTable(message.content);
    if (!tableData) return;
    const csvContent = markdownTableToCsv(tableData);
    downloadCsv(csvContent, `table_export_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const hasTable = message.content.includes('|') && message.content.includes('---');

  const handleEditSubmit = () => {
    if (onEdit && editContent.trim() && editContent !== message.content) {
      onEdit(editContent);
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleEditSubmit();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditContent(message.content);
    }
  };

  React.useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [isEditing]);

  return (
    <div
      id={`message-${message.id}`}
      className={cn(
        "group flex w-full mb-6 relative animate-in fade-in slide-in-from-bottom-2 duration-300",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {/* Agent Avatar (Left) */}
      {!isUser && (
        <div className="flex-shrink-0 mr-4 mt-1">
          <AgentAvatar status={agentStatus} className="w-9 h-9 shadow-lg shadow-blue-500/10" />
        </div>
      )}

      <div className={cn(
        "flex flex-col max-w-[85%] md:max-w-[75%]",
        isUser ? "items-end" : "items-start"
      )}>
        {/* Branch Navigation */}
        {message.data?.branching && (
          <div className="flex items-center gap-2 mb-1 px-1">
            <button
              onClick={() => onNavigateBranch?.(message.id, 'prev')}
              disabled={message.data!.branching.currentVersion <= 1}
              className="p-1 hover:bg-white/10 rounded-full disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="w-3 h-3 text-white/60" />
            </button>
            <span className="text-[10px] text-white/40 font-mono">
              {message.data!.branching.currentVersion} / {message.data!.branching.versions.length}
            </span>
            <button
              onClick={() => onNavigateBranch?.(message.id, 'next')}
              disabled={message.data!.branching.currentVersion >= message.data!.branching.versions.length}
              className="p-1 hover:bg-white/10 rounded-full disabled:opacity-30 transition-colors"
            >
              <ChevronRight className="w-3 h-3 text-white/60" />
            </button>
          </div>
        )}

        {/* Timestamp & Name (Hover only) */}
        <div className={cn(
          "flex items-center gap-2 text-xs text-white/30 mb-1 px-1 opacity-0 group-hover:opacity-100 transition-opacity",
          isUser ? "flex-row-reverse" : "flex-row"
        )}>
          <span className="font-medium text-white/40">{isUser ? (userName || 'You') : 'Civitas AI'}</span>
          <span>•</span>
          <span>{formatRelativeTime(message.timestamp)}</span>
        </div>

        {/* Message Content - Plain Text */}
        <div className={cn(
          "relative text-[15px] leading-relaxed whitespace-pre-wrap break-words",
          isUser ? "text-white/95" : "text-white/90",
          message.isStreaming && "animate-pulse"
        )}>
          {/* No gradient overlay */}

          {/* Check for "Deep Reasoning" source from backend and render badge */}
          {message.contextSources?.includes('System 2 Reasoning') && (
            <div className="mb-3">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-[10px] font-medium text-purple-300">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-purple-500"></span>
                </span>
                Deep Reasoning
              </span>
            </div>
          )}

          {/* Content Area */}
          <div className={cn("prose prose-invert prose-sm max-w-none relative z-10", isUser && "text-white")}>
            {isUser && isEditing ? (
              <div className="bg-white/10 rounded-xl p-3 border border-white/20 w-full min-w-[300px]">
                <textarea
                  ref={textareaRef}
                  value={editContent}
                  onChange={(e) => {
                    setEditContent(e.target.value);
                    e.target.style.height = 'auto';
                    e.target.style.height = `${e.target.scrollHeight}px`;
                  }}
                  onKeyDown={handleKeyDown}
                  className="w-full bg-transparent border-none focus:ring-0 text-white/95 resize-none p-0 text-[15px] leading-[1.75]"
                  rows={1}
                />
                <div className="flex justify-end gap-2 mt-3">
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditContent(message.content);
                    }}
                    className="px-3 py-1.5 text-xs font-medium text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleEditSubmit}
                    disabled={!editContent.trim() || editContent === message.content}
                    className="px-3 py-1.5 text-xs font-medium bg-primary text-white hover:bg-primary/80 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Save & Submit
                  </button>
                </div>
              </div>
            ) : (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={{
                  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
                  code({ node, inline, className, children, ...props }: any) {
                    const match = /language-(\w+)/.exec(className || '');
                    const language = match ? match[1] : '';

                    if (!inline && match) {
                      return (
                        <div className="relative group/code my-4 rounded-lg overflow-hidden border border-white/10 bg-[#0d0d0d]">
                          <div className="flex items-center justify-between px-3 py-1.5 bg-white/5 border-b border-white/5">
                            <span className="text-xs text-white/40 font-mono">{language}</span>
                            <button
                              onClick={async () => {
                                await copy(children as string);
                              }}
                              className="p-1 hover:bg-white/10 rounded text-white/40 hover:text-white transition-colors"
                              title="Copy code"
                            >
                              <Clipboard className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <SyntaxHighlighter
                            style={vscDarkPlus}
                            language={language}
                            PreTag="div"
                            customStyle={{ margin: 0, padding: '1rem', background: 'transparent' }}
                            {...props}
                          >
                            {String(children).replace(/\n$/, '')}
                          </SyntaxHighlighter>
                        </div>
                      );
                    }

                    return (
                      <code className={cn("bg-white/10 rounded px-1.5 py-0.5 text-[0.9em] font-mono", className)} {...props}>
                        {children}
                      </code>
                    );
                  },
                  a: ({ children, href }) => (
                    <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline underline-offset-2">
                      {children}
                    </a>
                  ),
                  table: ({ children }) => (
                    <div className="overflow-x-auto my-4 border border-white/10 rounded-lg">
                      <table className="min-w-full divide-y divide-white/10 bg-white/5 text-sm">
                        {children}
                      </table>
                    </div>
                  ),
                  th: ({ children }) => <th className="px-3 py-2 text-left text-xs font-semibold text-white/60 bg-white/5">{children}</th>,
                  td: ({ children }) => <td className="px-3 py-2 text-white/80 border-t border-white/5">{children}</td>,
                  ul: ({ children }) => <ul className="list-disc pl-4 space-y-1 my-2">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal pl-4 space-y-1 my-2">{children}</ol>,
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-2 border-blue-500/50 pl-4 my-2 italic text-white/60 bg-blue-500/5 py-1 rounded-r">
                      {children}
                    </blockquote>
                  )
                }}
              >
                {!isUser ? highlightKeyStats(displayContent) : displayContent}
              </ReactMarkdown>
            )}

            {shouldTruncate && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="mt-2 text-xs font-medium text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
              >
                {isExpanded ? (
                  <>Show less <ChevronUp className="w-3 h-3" /></>
                ) : (
                  <>Read more <ChevronDown className="w-3 h-3" /></>
                )}
              </button>
            )}

            {/* Context/Source Badges */}
            {message.contextSources && message.contextSources.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3 pt-2 border-t border-white/5">
                {message.contextSources.filter(src => src !== 'System 2 Reasoning').map((source, idx) => (
                  <ContextBadge key={idx} source={source} />
                ))}
              </div>
            )}

            {/* Smart Suggestions Chips */}
            {message.data?.suggestions && message.data.suggestions.length > 0 && (
              <div className="mt-3 no-print">
                <SuggestionChips
                  suggestions={message.data.suggestions}
                  onSelect={(suggestion) => onSuggestionSelect?.(suggestion)}
                  variant="row"
                />
              </div>
            )}

            {/* Attachment Preview (Legacy) */}
            {hasAttachment && (
              <div className="mt-3 p-3 bg-white/5 rounded-lg border border-white/10 flex items-center gap-3">
                <div className="w-10 h-10 rounded bg-blue-500/20 flex items-center justify-center">
                  <FileSpreadsheet className="w-5 h-5 text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate text-white/90">{message.attachment!.name}</p>
                  <p className="text-xs text-white/50">{message.attachment!.type}</p>
                </div>
              </div>
            )}

            {/* Reaction Stats Display */}
            {Object.values(reactions).some(count => count > 0) && (
              <div className="flex gap-1 mt-2">
                {Object.entries(reactions).map(([emoji, count]) => (
                  count > 0 && (
                    <div key={emoji} className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded-full text-[10px] flex items-center gap-1">
                      <span>{emoji}</span>
                      <span className="text-white/40">{count}</span>
                    </div>
                  )
                ))}
              </div>
            )}

            {/* Action Toolbar (visible on hover) - Ingrained style, at bottom */}
            {!message.isStreaming && !isUser && (
              <div className="flex items-center gap-3 mt-4 pt-2 border-t border-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button
                  onClick={() => handleCopyMessage()}
                  className="text-white/20 hover:text-white/50 transition-colors"
                  title="Copy message"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => handleFeedback(true)}
                  className={cn("transition-colors", feedback === 'up' ? "text-green-400" : "text-white/20 hover:text-green-400/60")}
                  title="Helpful"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleFeedback(false)}
                  className={cn("transition-colors", feedback === 'down' ? "text-red-400" : "text-white/20 hover:text-red-400/60")}
                  title="Not helpful"
                >
                  <ThumbsDown className="w-3.5 h-3.5" />
                </button>

                {/* Subtle divider */}
                <div className="w-px h-3 bg-white/10" />

                {/* Reactions - minimal */}
                <button
                  onClick={() => toggleReaction('👍')}
                  className={cn("text-xs transition-colors", reactions['👍'] ? "opacity-100" : "opacity-20 hover:opacity-50")}
                >
                  👍
                </button>
                <button
                  onClick={() => toggleReaction('❤️')}
                  className={cn("text-xs transition-colors", reactions['❤️'] ? "opacity-100" : "opacity-20 hover:opacity-50")}
                >
                  ❤️
                </button>
                <button
                  onClick={() => toggleReaction('🎯')}
                  className={cn("text-xs transition-colors", reactions['🎯'] ? "opacity-100" : "opacity-20 hover:opacity-50")}
                >
                  🎯
                </button>

                {hasTable && (
                  <>
                    <div className="w-px h-3 bg-white/10" />
                    <button
                      onClick={handleDownloadTable}
                      className="text-white/20 hover:text-green-400/60 transition-colors"
                      title="Download CSV"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* User Message Action Buttons (Edit & Restart) */}
        {isUser && !isEditing && (onEdit || onRefresh) && (
          <div className="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {onEdit && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-white/60 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all"
                title="Edit message"
              >
                <Pencil className="w-3 h-3" />
                Edit
              </button>
            )}
            {onRefresh && (
              <button
                onClick={() => onRefresh(message.id)}
                className="flex items-center justify-center p-1.5 text-white/60 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all"
                title="Run this query again"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            )}
          </div>
        )}

        {/* Action Buttons (External) */}
        {message.action && onAction && (
          <div className="mt-2 w-full">
            <ActionButtons
              action={message.action}
              onAction={onAction}
            />
          </div>
        )}

        {/* Tool Cards */}
        {hasTools && (
          <div className="w-full mt-3 space-y-3">
            {message.tools?.map((tool) => {
              // Render appropriate tool card based on kind
              if (tool.kind === 'property_comparison' && tool.data) {
                return (
                  <PropertyBookmarkCard
                    key={tool.id}
                    data={{ properties: [tool.data] }}
                    bookmarks={bookmarks}
                    onToggleBookmark={onToggleBookmark}
                  />
                );
              }
              else if (tool.kind === 'generated_report' && tool.data) {
                return (
                  <GeneratedReportCard
                    key={tool.id}
                    data={tool.data}
                    onNavigateToReports={onNavigateToReports}
                  />
                );
              }

              return (
                <ToolMessage
                  key={tool.id}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  tool={tool as any} // Forced cast to solve discriminated union mismatch with minimal impact
                  timestamp={new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  bookmarks={bookmarks}
                  onToggleBookmark={onToggleBookmark}
                  onOpenDealAnalyzer={(propId) => onOpenDealAnalyzer?.(propId, 'STR')} // Default strategy
                />
              );
            })}
          </div>
        )}

        {/* Render specific tool result cards if data exists directly on message */}
        {message.data?.tool_results?.scouted_properties && (
          <PropertyListCard
            properties={message.data.tool_results.scouted_properties}
            onViewDetails={onViewDetails || (() => { })}
          />
        )}
      </div>

      {/* User Avatar (Right) */}
      {isUser && (
        <div className="flex-shrink-0 ml-4 mt-1">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center border border-white/5 shadow-inner">
            <span className="text-sm font-semibold text-white/90">
              {userName ? userName.charAt(0).toUpperCase() : 'U'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
