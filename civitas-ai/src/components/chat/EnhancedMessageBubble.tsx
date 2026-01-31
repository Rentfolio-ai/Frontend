// FILE: src/components/chat/EnhancedMessageBubble.tsx
/**
 * Enhanced Message Bubble with ALL new features:
 * - Token streaming with cursor
 * - Citations (inline and panel)
 * - AI Reasoning Panel
 * - Confidence Meter
 * - Data Source Badges
 * - Enhanced property cards
 * 
 * Drop-in replacement for MessageBubble.tsx
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check, ThumbsUp, ThumbsDown, RotateCcw } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { Message } from '@/types/chat';
import { AgentAvatar, type AgentStatus } from '../common/AgentAvatar';

// Import all new components
import { CitationBadge, type Citation } from './CitationBadge';
import { CitationsPanel } from './CitationsPanel';
import { AIReasoningPanel, type ReasoningStep } from './AIReasoningPanel';
import { DataSourceBadge } from './DataSourceBadge';
import { EnhancedPropertyCard } from './tool-cards/EnhancedPropertyCard';

import '../../styles/llm-theme.css';

interface EnhancedMessageBubbleProps {
  message: Message;
  agentStatus?: AgentStatus;
  userName?: string;
  onCopy?: () => void;
  onRefresh?: (messageId: string) => void;
  onFeedback?: (messageId: string, isPositive: boolean) => void;
  
  // New Week 1 & 2 props
  citations?: Citation[];
  reasoningSteps?: ReasoningStep[];
  confidence?: number;
  dataSources?: Array<{
    source: string;
    dataCount?: number;
    status?: 'live' | 'cached' | 'recent';
  }>;
}

export const EnhancedMessageBubble: React.FC<EnhancedMessageBubbleProps> = ({
  message,
  agentStatus = 'online',
  userName,
  onCopy,
  onRefresh,
  onFeedback,
  citations = [],
  reasoningSteps = [],
  confidence,
  dataSources = []
}) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);
  
  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onCopy?.();
  };
  
  const handleFeedback = (isPositive: boolean) => {
    setFeedback(isPositive ? 'up' : 'down');
    onFeedback?.(message.id, isPositive);
  };
  
  // Process content to add inline citations
  const processContentWithCitations = (content: string) => {
    if (!citations || citations.length === 0) return content;
    
    // Replace [1], [2], etc. with citation components
    const parts = [];
    let lastIndex = 0;
    const citationRegex = /\[(\d+)\]/g;
    let match;
    
    while ((match = citationRegex.exec(content)) !== null) {
      // Add text before citation
      if (match.index > lastIndex) {
        parts.push(content.slice(lastIndex, match.index));
      }
      
      // Add citation badge
      const citationNum = parseInt(match[1]);
      const citation = citations.find(c => c.id === citationNum);
      if (citation) {
        parts.push(`<citation-${citationNum} />`);
      } else {
        parts.push(match[0]);
      }
      
      lastIndex = match.index + match[0].length;
    }
    
    // Add remaining text
    if (lastIndex < content.length) {
      parts.push(content.slice(lastIndex));
    }
    
    return parts.join('');
  };
  
  const contentWithCitations = processContentWithCitations(message.content);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={cn(
        "group flex w-full mb-6 relative",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {/* Agent Avatar */}
      {!isUser && (
        <div className="flex-shrink-0 mr-4 mt-1">
          <AgentAvatar status={agentStatus} className="w-9 h-9" />
        </div>
      )}
      
      <div className={cn(
        "flex flex-col max-w-[85%] md:max-w-[75%]",
        isUser ? "items-end" : "items-start"
      )}>
        {/* Name and timestamp */}
        <div className={cn(
          "text-xs text-white/30 mb-1 px-1 opacity-0 group-hover:opacity-100 transition-opacity",
          isUser ? "text-right" : "text-left"
        )}>
          <span className="text-white/40">{isUser ? (userName || 'You') : 'Vasthu AI'}</span>
          <span className="mx-1">•</span>
          <span>{new Date(message.timestamp).toLocaleTimeString()}</span>
        </div>
        
        {/* Message Content */}
        <div
          className={cn(
            "relative p-4 rounded-xl",
            isUser ? "user-message" : "ai-message",
            message.isStreaming && "relative"
          )}
        >
          {/* Markdown with citation support */}
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
            className="prose prose-invert prose-sm max-w-none"
            components={{
              // Custom citation rendering
              p: ({ children, ...props }) => {
                const processChildren = (child: any): any => {
                  if (typeof child === 'string') {
                    // Check for citation placeholders
                    const citationRegex = /<citation-(\d+) \/>/g;
                    const parts = [];
                    let lastIndex = 0;
                    let match;
                    
                    while ((match = citationRegex.exec(child)) !== null) {
                      if (match.index > lastIndex) {
                        parts.push(child.slice(lastIndex, match.index));
                      }
                      
                      const citationNum = parseInt(match[1]);
                      const citation = citations.find(c => c.id === citationNum);
                      if (citation) {
                        parts.push(
                          <CitationBadge
                            key={`cite-${citationNum}`}
                            citation={citation}
                          />
                        );
                      }
                      
                      lastIndex = match.index + match[0].length;
                    }
                    
                    if (lastIndex < child.length) {
                      parts.push(child.slice(lastIndex));
                    }
                    
                    return parts.length > 0 ? parts : child;
                  }
                  
                  if (Array.isArray(child)) {
                    return child.map(processChildren);
                  }
                  
                  return child;
                };
                
                return <p {...props}>{processChildren(children)}</p>;
              },
              code({ node, inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '');
                return !inline && match ? (
                  <SyntaxHighlighter
                    style={vscDarkPlus as any}
                    language={match[1]}
                    PreTag="div"
                    {...props}
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                ) : (
                  <code className={className} {...props}>
                    {children}
                  </code>
                );
              },
            }}
          >
            {contentWithCitations}
          </ReactMarkdown>
          
          {/* Streaming cursor */}
          {message.isStreaming && !isUser && (
            <motion.span
              className="inline-block w-0.5 h-5 bg-purple-500 ml-1"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            />
          )}
          
          {/* Data Sources */}
          {!isUser && dataSources.length > 0 && !message.isStreaming && (
            <div className="mt-3">
              <div className="text-xs text-white/40 mb-2">Data Sources:</div>
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
          
          {/* Citations Panel */}
          {!isUser && citations.length > 0 && !message.isStreaming && (
            <CitationsPanel
              citations={citations}
              collapsible={true}
              defaultExpanded={false}
            />
          )}
          
          {/* Action Buttons (for AI messages only) */}
          {!isUser && !message.isStreaming && (
            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={handleCopy}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                title="Copy"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4 text-white/60" />
                )}
              </button>
              
              <button
                onClick={() => onRefresh?.(message.id)}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                title="Regenerate"
              >
                <RotateCcw className="w-4 h-4 text-white/60" />
              </button>
              
              <div className="flex-1" />
              
              <button
                onClick={() => handleFeedback(true)}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  feedback === 'up' ? "bg-green-500/20 text-green-400" : "hover:bg-white/10 text-white/60"
                )}
                title="Good response"
              >
                <ThumbsUp className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => handleFeedback(false)}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  feedback === 'down' ? "bg-red-500/20 text-red-400" : "hover:bg-white/10 text-white/60"
                )}
                title="Bad response"
              >
                <ThumbsDown className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
        
        {/* AI Reasoning Panel (below message) */}
        {!isUser && reasoningSteps.length > 0 && !message.isStreaming && (
          <div className="w-full mt-3">
            <AIReasoningPanel
              steps={reasoningSteps}
              totalFactors={reasoningSteps.length}
            />
          </div>
        )}
      </div>
    </motion.div>
  );
};
