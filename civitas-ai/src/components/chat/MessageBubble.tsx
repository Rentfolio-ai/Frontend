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
import { InlineActionsBar } from './InlineActionsBar';
import { ToolMessage } from './ToolMessage';
import { PropertyBookmarkCard, GeneratedReportCard } from './tool-cards';
import { PropertyContextCard } from './PropertyContextCard';
import type { InvestmentStrategy } from '../../types/pnl';
import type { BookmarkedProperty } from '../../types/bookmarks';
import type { ScoutedProperty } from '../../types/backendTools';
import type { CompletedTool } from '../../types/stream';
import {
  Copy, RotateCcw, Check, ThumbsUp, ThumbsDown, Pencil,
  Clipboard, FileSpreadsheet, ChevronLeft,
  ChevronRight, ChevronDown, ChevronUp, Zap
} from 'lucide-react';
import { submitFeedback } from '../../services/feedbackApi';
import { extractFirstTable, markdownTableToCsv, downloadCsv } from '../../lib/tableUtils';
import { ContextBadge } from './ContextBadge';
import { useClipboard } from '../../hooks/useClipboard';
import rehypeRaw from 'rehype-raw';

// 🚀 NEW: Import all Week 1 & 2 + Citation components
import type { Citation } from './CitationBadge';
import { StreamingCursor } from './StreamingCursor';
import { CitationsPanel } from './CitationsPanel';
import { AIReasoningPanel, type ReasoningStep } from './AIReasoningPanel';
import { DataSourceBadge } from './DataSourceBadge';
import '../../styles/llm-theme.css';

// 🎯 Hunter Mode: Interactive tool result cards
import {
  DealKillerCard,
  OfferStrategyCard,
  CompsIntelCard,
  NeighborhoodTrajectoryCard,
} from '../hunter';
import { DealIntelligenceCard } from './tool-cards/DealIntelligenceCard';
import { PropertyFlashcardRow } from './tool-cards/PropertyFlashcardRow';

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
  userAvatar?: string;
  onRefresh?: (messageId: string) => void;
  onViewDetails?: (property: ScoutedProperty) => void;
  onEdit?: (content: string) => void;
  onNavigateBranch?: (messageId: string, direction: 'prev' | 'next') => void;
  onSuggestionSelect?: (suggestion: string) => void;

  // 🚀 NEW: Week 1 & 2 + Citation props
  citations?: Citation[];
  aiReasoningSteps?: ReasoningStep[];
  confidence?: number;
  dataSources?: Array<{
    source: string;
    dataCount?: number;
    status?: 'live' | 'cached' | 'recent';
  }>;
  // Mode switch handler (for AI-suggested mode changes)
  onModeSwitch?: (mode: string, autoQuery?: string) => void;
  // Navigate to Investment Criteria / Preferences page
  onNavigateToPreferences?: () => void;
  // Navigate to Upgrade / Billing page
  onNavigateToUpgrade?: () => void;
  onRecalculate?: (property: any, params: any) => Promise<any>;
  onRefine?: (instruction: string) => void;
  onGoToIntegrations?: () => void;
  onSendComplete?: (summary: string) => void;
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
  userAvatar,
  onRefresh,
  onViewDetails,
  onEdit,
  onNavigateBranch,
  onSuggestionSelect,
  // 🚀 NEW: Week 1 & 2 + Citation props
  citations = [],
  aiReasoningSteps = [],
  confidence: _confidence,
  dataSources = [],
  onModeSwitch,
  onNavigateToPreferences,
  onNavigateToUpgrade,
  onRecalculate,
  onRefine,
  onGoToIntegrations,
  onSendComplete,
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
  const shouldTruncate = message.content && message.content.length > MAX_LENGTH && !isUser;
  const displayContent = shouldTruncate && !isExpanded
    ? message.content!.slice(0, MAX_LENGTH) + '...'
    : (message.content || '');

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

  const hasTable = message.content && message.content.includes('|') && message.content.includes('---');

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
        "group flex w-full mb-2 relative animate-in fade-in slide-in-from-bottom-2 duration-300",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {/* Agent Avatar (Left) */}
      {!isUser && (
        <div className="flex-shrink-0 mr-3 mt-0.5">
          <AgentAvatar status={agentStatus} className="w-7 h-7 shadow-lg shadow-blue-500/10" />
        </div>
      )}

      <div className={cn(
        "flex flex-col max-w-[80%] md:max-w-[65%]",
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
          "flex items-center gap-1.5 text-[10px] text-white/25 mb-1 px-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200",
          isUser ? "flex-row-reverse" : "flex-row"
        )}>
          <span className="font-medium text-white/35">{isUser ? (userName?.split(' ')[0] || 'You') : 'Vasthu AI'}</span>
          <span className="text-white/15">·</span>
          <span>{formatRelativeTime(message.timestamp)}</span>
        </div>

        {/* Message Content with Card */}
        <div
          className={cn(
            "relative whitespace-pre-wrap break-words overflow-hidden transition-all duration-200",
            message.isStreaming && "streaming-message",
            isUser && [
              "rounded-2xl rounded-br-md",
              "accent-user-bubble",
              "border border-white/[0.1]",
              "px-3.5 py-2.5",
              "text-[14px] leading-normal text-white/90",
              "backdrop-blur-xl",
            ],
            !isUser && "text-[15px] leading-relaxed",
            
          )}
          style={{
            color: isUser ? '#F0FDFA' : '#E8DED2',
          }}
        >

          {/* Check for "Deep Reasoning" source from backend and render badge */}
          {message.contextSources?.includes('System 2 Reasoning') && (
            <div className="mb-2">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-[10px] font-medium text-purple-300">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-purple-500"></span>
                </span>
                Deep Reasoning
              </span>
            </div>
          )}

          {/* Property context card (from Explore → Chat handoff) */}
          {isUser && message.propertyContext && (
            <div className="mb-2">
              <PropertyContextCard data={message.propertyContext} />
            </div>
          )}

          {/* Content Area */}
          <div
            className={cn(
              "prose prose-sm prose-compact max-w-none relative z-10 chat-message-text",
              message.isStreaming && !isUser && "streaming-text",
              isUser ? "text-white/90" : "text-[#E8DED2]"
            )}
          >
            {isUser && isEditing ? (
              <div className="bg-white/[0.06] rounded-xl p-3 border border-white/[0.1] w-full min-w-[300px]">
                <textarea
                  ref={textareaRef}
                  value={editContent}
                  onChange={(e) => {
                    setEditContent(e.target.value);
                    e.target.style.height = 'auto';
                    e.target.style.height = `${e.target.scrollHeight}px`;
                  }}
                  onKeyDown={handleKeyDown}
                  className="w-full bg-transparent border-none focus:ring-0 focus:outline-none text-white/90 resize-none p-0 placeholder:text-white/30"
                  style={{ fontSize: '14px', lineHeight: '1.6' }}
                  rows={1}
                />
                <div className="flex justify-end gap-1.5 mt-2 pt-2 border-t border-white/[0.06]">
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditContent(message.content);
                    }}
                    className="px-3 py-1.5 text-xs font-medium text-white/40 hover:text-white/70 hover:bg-white/[0.06] rounded-lg transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleEditSubmit}
                    disabled={!editContent.trim() || editContent === message.content}
                    className="px-3 py-1.5 text-xs font-semibold accent-btn text-white rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Save & Submit
                  </button>
                </div>
              </div>
            ) : (
              <>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]}
                  components={{
                    // --- Headings ---
                    h2: ({ children }) => (
                      <h2 className="ai-heading-2 flex items-center gap-2.5 text-[17px] font-bold text-[#F5E6D0] mt-3 -mb-1 pb-0.5 border-b border-white/[0.06]">
                        <span className="inline-block w-1 h-4 rounded-full accent-bar flex-shrink-0" />
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-[15.5px] font-semibold text-[#F0DCC0] mt-3 mb-1">
                        {children}
                      </h3>
                    ),
                    // --- Paragraphs (collapse empty ones) ---
                    p: ({ children }) => {
                      // Collapse empty paragraphs that ReactMarkdown creates between block elements
                      const isEmpty = !children ||
                        (Array.isArray(children) && children.every(c => c == null || c === '' || c === '\n')) ||
                        (typeof children === 'string' && !children.trim());
                      if (isEmpty) return null;
                      return (
                        <p className="text-[15px] leading-[1.75] text-[#E8DED2]/90 my-1.5">
                          {children}
                        </p>
                      );
                    },
                    // --- Strong/Bold ---
                    strong: ({ children }) => (
                      <strong className="font-bold text-[#FAF0E4]">
                        {children}
                      </strong>
                    ),
                    // --- Code ---
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
                    code({ node, inline, className, children, ...props }: any) {
                      const match = /language-(\w+)/.exec(className || '');
                      const language = match ? match[1] : '';

                      if (!inline && match) {
                        return (
                          <div className="relative group/code my-4 rounded-xl overflow-hidden border border-white/[0.08] bg-[#0a0a0f]">
                            <div className="flex items-center justify-between px-3 py-1.5 bg-white/[0.03] border-b border-white/[0.06]">
                              <span className="text-[10px] uppercase tracking-wider text-white/30 font-semibold">{language}</span>
                              <button
                                onClick={async () => {
                                  await copy(children as string);
                                }}
                                className="p-1 hover:bg-white/10 rounded text-white/30 hover:text-white transition-colors"
                                title="Copy code"
                              >
                                <Clipboard className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <SyntaxHighlighter
                              style={vscDarkPlus}
                              language={language}
                              PreTag="div"
                              customStyle={{ margin: 0, padding: '1rem', background: 'transparent', fontSize: '12px' }}
                              {...props}
                            >
                              {String(children).replace(/\n$/, '')}
                            </SyntaxHighlighter>
                          </div>
                        );
                      }

                      return (
                        <code className={cn(
                          "px-1.5 py-0.5 text-[0.88em] font-mono rounded-md accent-code",
                          className
                        )} {...props}>
                          {children}
                        </code>
                      );
                    },
                    // --- Links ---
                    a: ({ children, href }) => (
                      <a href={href} target="_blank" rel="noopener noreferrer"
                        className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2 decoration-cyan-400/30 hover:decoration-cyan-300/50 transition-colors">
                        {children}
                      </a>
                    ),
                    // --- Tables ---
                    table: ({ children }) => (
                      <div className="overflow-x-auto -mt-3 mb-2 rounded-xl border border-white/[0.08] bg-white/[0.02]">
                        <table className="min-w-full text-[12px]">
                          {children}
                        </table>
                      </div>
                    ),
                    thead: ({ children }) => (
                      <thead className="accent-thead border-b border-white/[0.08]">
                        {children}
                      </thead>
                    ),
                    th: ({ children }) => (
                      <th className="px-3 py-2.5 text-left text-[10px] uppercase tracking-wider font-bold text-white/50">
                        {children}
                      </th>
                    ),
                    td: ({ children }) => (
                      <td className="px-3 py-2 text-[#E8DED2]/85 border-t border-white/[0.04] font-medium">
                        {children}
                      </td>
                    ),
                    tr: ({ children }) => (
                      <tr className="hover:bg-white/[0.03] transition-colors">
                        {children}
                      </tr>
                    ),
                    // --- Lists ---
                    ul: ({ children }) => (
                      <ul className="ai-list-ul space-y-1.5 mt-1 mb-2 pl-0 list-none">
                        {children}
                      </ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="ai-list-ol space-y-1.5 mt-1 mb-2 pl-0 list-none counter-reset-item">
                        {children}
                      </ol>
                    ),
                    li: ({ children, ordered, ...props }: any) => (
                      <li className="flex items-start gap-2.5 text-[15px] leading-[1.75] text-[#E8DED2]/90 pl-1" {...props}>
                        <span className="flex-shrink-0 mt-[7px] w-1.5 h-1.5 rounded-full accent-dot opacity-60" />
                        <span className="flex-1">{children}</span>
                      </li>
                    ),
                    // --- Blockquotes ---
                    blockquote: ({ children }) => (
                      <blockquote className="my-3 pl-4 py-2 pr-3 rounded-r-xl accent-blockquote">
                        <div className="text-[14px] text-white/60 italic">
                          {children}
                        </div>
                      </blockquote>
                    ),
                    // --- Horizontal Rule ---
                    hr: () => (
                      <div className="my-5">
                        <div className="h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
                      </div>
                    ),
                  }}
                >
                  {displayContent}
                </ReactMarkdown>

                {/* 🚀 GPT-Style Streaming Cursor */}
                {message.isStreaming && !isUser && (
                  <StreamingCursor />
                )}
              </>
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
              <div className="mt-3 p-4 bg-white/5 rounded-xl border border-white/10 flex items-center gap-3">
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

            {/* 🚀 NEW: Data Sources */}
            {!isUser && dataSources.length > 0 && !message.isStreaming && (
              <div className="mt-3 pt-3 border-t border-white/5">
                <div className="text-[10px] text-white/40 mb-2 font-medium">Data Sources:</div>
                <div className="flex flex-wrap gap-2">
                  {dataSources.map((ds, i) => (
                    <DataSourceBadge
                      key={i}
                      source={ds.source}
                      dataCount={ds.dataCount}
                      status={ds.status || 'live'}
                      lastUpdated={new Date()}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* 🚀 NEW: Citations Panel */}
            {!isUser && citations.length > 0 && !message.isStreaming && (
              <div className="mt-3">
                <CitationsPanel
                  citations={citations}
                  collapsible={true}
                  defaultExpanded={false}
                />
              </div>
            )}

            {/* Action Toolbar (visible on hover) - Clean Modern Style */}
            {!message.isStreaming && !isUser && (
              <div className="flex items-center gap-1.5 mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                <button
                  onClick={() => handleCopyMessage()}
                  className="p-1.5 rounded-lg hover:bg-white/5 transition-all"
                  style={{ color: isCopied ? '#10B981' : '#94A3B8' }}
                  title="Copy message"
                >
                  {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => handleFeedback(true)}
                  className="p-1.5 rounded-lg hover:bg-white/5 transition-all"
                  style={{ color: feedback === 'up' ? '#10B981' : '#94A3B8' }}
                  title="Helpful"
                >
                  <ThumbsUp className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleFeedback(false)}
                  className="p-1.5 rounded-lg hover:bg-white/5 transition-all"
                  style={{ color: feedback === 'down' ? '#EF4444' : '#94A3B8' }}
                  title="Not helpful"
                >
                  <ThumbsDown className="w-4 h-4" />
                </button>

                {/* Divider */}
                <div className="w-px h-4 mx-1" style={{ backgroundColor: 'rgba(148, 163, 184, 0.15)' }} />

                {/* Reactions - Clean minimal style */}
                <button
                  onClick={() => toggleReaction('👍')}
                  className={cn(
                    "p-1.5 rounded-lg transition-all text-sm",
                    reactions['👍'] ? "opacity-100 bg-white/5" : "opacity-40 hover:opacity-70 hover:bg-white/5"
                  )}
                >
                  👍
                </button>
                <button
                  onClick={() => toggleReaction('❤️')}
                  className={cn(
                    "p-1.5 rounded-lg transition-all text-sm",
                    reactions['❤️'] ? "opacity-100 bg-white/5" : "opacity-40 hover:opacity-70 hover:bg-white/5"
                  )}
                >
                  ❤️
                </button>
                <button
                  onClick={() => toggleReaction('🎯')}
                  className={cn(
                    "p-1.5 rounded-lg transition-all text-sm",
                    reactions['🎯'] ? "opacity-100 bg-white/5" : "opacity-40 hover:opacity-70 hover:bg-white/5"
                  )}
                >
                  🎯
                </button>

                {hasTable && (
                  <>
                    <div className="w-px h-3" style={{ backgroundColor: 'rgba(148, 163, 184, 0.2)' }} />
                    <button
                      onClick={handleDownloadTable}
                      className="transition-colors"
                      style={{ color: '#94A3B8' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#10B981'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#94A3B8'}
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

        {/* User Message Action Buttons (Copy, Edit & Restart) */}
        {isUser && !isEditing && (
          <div className="flex items-center gap-1 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={() => copy(message.content)}
              className="flex items-center justify-center p-1.5 text-white/30 hover:text-white/70 hover:bg-white/[0.06] rounded-lg transition-all"
              title={isCopied ? "Copied!" : "Copy message"}
            >
              {isCopied ? (
                <Check className="w-3 h-3 text-emerald-400" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </button>
            {onEdit && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center justify-center p-1.5 text-white/30 hover:text-white/70 hover:bg-white/[0.06] rounded-lg transition-all"
                title="Edit message"
              >
                <Pencil className="w-3 h-3" />
              </button>
            )}
            {onRefresh && (
              <button
                onClick={() => onRefresh(message.id)}
                className="flex items-center justify-center p-1.5 text-white/30 hover:text-white/70 hover:bg-white/[0.06] rounded-lg transition-all"
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

        {/* Inline Actions from suggest_actions tool */}
        {!isUser && message.inlineActions && message.inlineActions.length > 0 && !message.isStreaming && (
          <div className="w-full">
            <InlineActionsBar
              actions={message.inlineActions}
              onExecute={(action) => {
                // Navigate to Investment Criteria / Preferences page
                if (action.tool_name === 'navigate_to_preferences') {
                  onNavigateToPreferences?.();
                  return;
                }
                // Navigate to Upgrade / Billing page
                if (action.tool_name === 'navigate_to_upgrade') {
                  onNavigateToUpgrade?.();
                  return;
                }

                // Generate Report — open the report drawer with property context
                // instead of sending a new chat message (which loses property data)
                if (action.tool_name === 'generate_report') {
                  // Extract property address from the message's tool results
                  const propTool = message.tools?.find(
                    (t: any) => t.kind === 'scout_properties' || t.name === 'scout_properties'
                  );
                  const firstProp = propTool?.data?.properties?.[0];
                  const propertyAddress = firstProp?.address || propTool?.data?.market_context?.location || '';
                  onAction?.('generate_report', { propertyAddress, strategy: 'LTR' });
                  return;
                }

                // Deal Analysis — open the deal analyzer with the top property
                if (action.tool_name === 'request_financial_analysis') {
                  const propTool = message.tools?.find(
                    (t: any) => t.kind === 'scout_properties' || t.name === 'scout_properties'
                  );
                  const firstProp = propTool?.data?.properties?.[0];
                  if (firstProp && onOpenDealAnalyzer) {
                    onOpenDealAnalyzer(
                      firstProp.listing_id || null,
                      'STR',
                      firstProp.price || 500000,
                      firstProp.address
                    );
                    return;
                  }
                }

                // Recalculate PnL
                if (action.tool_name === 'recalculate_pnl' && onRecalculate) {
                  onRecalculate(null, action.arguments);
                  return;
                }

                const query = action.query || action.label;
                if (action.target_mode && onModeSwitch) {
                  // Cross-mode action: switch mode first, then fire the query
                  onModeSwitch(action.target_mode, query);
                } else {
                  onAction?.(query);
                }
              }}
            />
          </div>
        )}

        {/* Mode Switch Suggestion — Cursor-style minimal banner */}
        {!isUser && message.modeSuggestion && !message.isStreaming && (
          <div className="w-full mt-4 flex items-center gap-3 px-3 py-2.5 rounded-lg border border-white/[0.08] bg-white/[0.03]">
            <div className="flex-1 text-[13px] text-zinc-400">
              {message.modeSuggestion.reason}
            </div>
            <button
              onClick={() => onModeSwitch?.(
                message.modeSuggestion!.suggestedMode,
                message.modeSuggestion!.autoQuery
              )}
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-[13px]
                rounded-lg border border-white/[0.12] bg-white/[0.06]
                text-zinc-300 hover:text-white hover:bg-white/[0.1] hover:border-white/[0.2]
                transition-all duration-150 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5" />
              Switch to {message.modeSuggestion.suggestedMode.charAt(0).toUpperCase() + message.modeSuggestion.suggestedMode.slice(1)}
            </button>
          </div>
        )}

        {/* Tool Cards - No container, float directly */}
        {hasTools && (
          <div className="w-full mt-3">
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
              else if (tool.kind === 'scout_properties' && tool.data) {
                const d = tool.data as any;
                const allProps = d.properties || d.top_picks || [];
                const topPicks = (d.top_picks || allProps).slice(0, 5);
                const moreMatches = d.more_matches || allProps.slice(5);
                return (
                  <PropertyFlashcardRow
                    key={tool.id}
                    topPicks={topPicks}
                    moreMatches={moreMatches}
                    totalFound={d.total_found || allProps.length}
                    marketContext={d.market_context}
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
                  tool={tool as any}
                  timestamp={new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  bookmarks={bookmarks}
                  onToggleBookmark={onToggleBookmark}
                  onOpenDealAnalyzer={onOpenDealAnalyzer}
                  onAction={(query) => onAction?.(query)}
                  onRefine={onRefine}
                  onGoToIntegrations={onGoToIntegrations}
                  onSendComplete={onSendComplete}
                />
              );
            })}
          </div>
        )}

        {/* Hunter Mode: Interactive Tool Result Cards */}
        {message.data?.tool_results?.detect_deal_killers && (
          <div className="mt-4">
            <DealKillerCard
              data={message.data.tool_results.detect_deal_killers}
              onAction={(query) => onAction?.(query)}
            />
          </div>
        )}

        {message.data?.tool_results?.generate_offer_strategy && (
          <div className="mt-4">
            <OfferStrategyCard
              data={message.data.tool_results.generate_offer_strategy}
              onAction={(query) => onAction?.(query)}
            />
          </div>
        )}

        {message.data?.tool_results?.find_comps_with_intel && (
          <div className="mt-4">
            <CompsIntelCard
              data={message.data.tool_results.find_comps_with_intel}
              onAction={(query) => onAction?.(query)}
            />
          </div>
        )}

        {message.data?.tool_results?.analyze_neighborhood_trajectory && (
          <div className="mt-4">
            <NeighborhoodTrajectoryCard
              data={message.data.tool_results.analyze_neighborhood_trajectory}
              onAction={(query) => onAction?.(query)}
            />
          </div>
        )}

        {message.data?.tool_results?.request_financial_analysis && (
          <div className="mt-4">
            <DealIntelligenceCard
              data={{
                propertyAddress: message.data.tool_results.request_financial_analysis.address,
                strategy: message.data.tool_results.request_financial_analysis.strategy,
                pnlSummary: message.data.tool_results.request_financial_analysis.year1 ? {
                  monthlyCashflow: message.data.tool_results.request_financial_analysis.year1.monthly_cashflow || message.data.tool_results.request_financial_analysis.year1.monthlyCashflow || 0,
                  cashOnCash: message.data.tool_results.request_financial_analysis.year1.cash_on_cash_return || message.data.tool_results.request_financial_analysis.year1.cashOnCash || 0,
                  capRate: message.data.tool_results.request_financial_analysis.year1.cap_rate || message.data.tool_results.request_financial_analysis.year1.capRate || 0,
                  noi: message.data.tool_results.request_financial_analysis.year1.noi || 0,
                } : undefined,
              }}
            />
          </div>
        )}


        {/* AI Reasoning Trace — "Thought for Xs" collapsible panel */}
        {!isUser && !message.isStreaming && (message.thinkingTrace?.steps?.length || message.nativeThinkingText) && (
          <div className="w-full">
            <AIReasoningPanel
              trace={message.thinkingTrace || { steps: [], durationMs: 0, toolsUsed: [] }}
              steps={aiReasoningSteps}
              nativeThinkingText={message.nativeThinkingText}
            />
          </div>
        )}
        {/* Legacy fallback: show reasoning steps even without thinkingTrace */}
        {!isUser && !message.isStreaming && !message.thinkingTrace && !message.nativeThinkingText && aiReasoningSteps.length > 0 && (
          <div className="w-full">
            <AIReasoningPanel
              trace={{ steps: [], durationMs: 0, toolsUsed: [] }}
              steps={aiReasoningSteps}
            />
          </div>
        )}
      </div>

      {/* User Avatar (Right) */}
      {isUser && (
        <div className="flex-shrink-0 ml-3 mt-1">
          <div className="relative group/user-avatar">
            {/* Subtle outer glow on hover */}
            <div className="absolute -inset-0.5 rounded-full bg-gradient-to-br from-[#C08B5C]/30 to-[#D4A27F]/30 opacity-0 group-hover/user-avatar:opacity-100 blur-sm transition-opacity duration-300" />

            {/* Avatar container */}
            <div className="relative w-8 h-8 rounded-full overflow-hidden ring-[1.5px] ring-white/[0.12] shadow-lg shadow-black/20 group-hover/user-avatar:ring-[#C08B5C]/30 transition-all duration-300">
              {userAvatar && userAvatar.length > 200 ? (
                /* Profile picture / Memoji (base64 or URL) */
                <img
                  src={userAvatar}
                  alt={userName || 'User'}
                  className="w-full h-full object-cover"
                />
              ) : (
                /* Gradient initials fallback */
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#C08B5C] to-[#8A5D3B]">
                  <span className="text-[11px] font-bold text-white/90 leading-none">
                    {userName ? userName.split(' ')[0].charAt(0).toUpperCase() : 'U'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
