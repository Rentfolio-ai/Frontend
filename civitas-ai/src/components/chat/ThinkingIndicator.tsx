// FILE: src/components/chat/ThinkingIndicator.tsx
/**
 * Thinking indicator component showing AI processing status
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { ThinkingState, CompletedTool } from '@/types/stream';

interface ThinkingIndicatorProps {
  thinking: ThinkingState | null;
  completedTools?: CompletedTool[];
  className?: string;
  userQuery?: string;
}

export const ThinkingIndicator: React.FC<ThinkingIndicatorProps> = ({
  thinking,
  completedTools = [],
  className,
  userQuery,
}) => {
  if (!thinking && completedTools.length === 0) {
    return null;
  }

  // Helper to format source text
  const getSourceText = (source: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const match = source.match(urlRegex);

    if (match) {
      const url = match[0];
      try {
        const hostname = new URL(url).hostname.replace('www.', '');
        let friendlySource = hostname.charAt(0).toUpperCase() + hostname.slice(1);

        if (hostname.includes('rentcast')) friendlySource = 'Rentcast';
        if (hostname.includes('zillow')) friendlySource = 'Zillow';
        if (hostname.includes('google')) friendlySource = 'Google';
        if (hostname.includes('redfin')) friendlySource = 'Redfin';
        if (hostname.includes('realtor')) friendlySource = 'Realtor.com';

        return `Checking ${friendlySource}...`;
      } catch (e) {
        return source;
      }
    }
    return source;
  };

  // Helper to humanize status messages based on query context
  const getFriendlyText = (text: string) => {
    const lowerText = text.toLowerCase();
    const lowerQuery = (userQuery || '').toLowerCase();
    const hasCompletedTools = completedTools.length > 0;

    // If the backend status is already specific (not generic), use it
    if (!lowerText.includes('analyzing') && !lowerText.includes('processing') && !lowerText.includes('generating')) {
      return text;
    }

    // If we have already completed some tools, we are likely in the analysis/finalization phase
    // So we shouldn't show the initial "Searching..." intent anymore
    if (hasCompletedTools) {
      if (lowerText.includes('generating')) return 'Writing response...';
      return 'Analyzing results...';
    }

    // Initial Phase: Context-aware overrides based on user query
    if (lowerQuery) {
      if (lowerQuery.includes('find') || lowerQuery.includes('search') || lowerQuery.includes('looking for') || lowerQuery.includes('show me')) {
        return 'Searching for properties...';
      }
      if (lowerQuery.includes('analyze') || lowerQuery.includes('roi') || lowerQuery.includes('cash flow') || lowerQuery.includes('investment')) {
        return 'Analyzing investment potential...';
      }
      if (lowerQuery.includes('market') || lowerQuery.includes('trend') || lowerQuery.includes('stats')) {
        return 'Evaluating market trends...';
      }
      if (lowerQuery.includes('rent') || lowerQuery.includes('lease')) {
        return 'Checking rental data...';
      }
      if (lowerQuery.includes('compare') || lowerQuery.includes('difference')) {
        return 'Comparing options...';
      }
    }

    // Fallbacks if no specific context found
    if (lowerText.includes('analyzing') || lowerText.includes('processing')) return 'Thinking...';
    if (lowerText.includes('searching')) return 'Looking that up...';
    if (lowerText.includes('generating')) return 'Working on it...';
    if (lowerText.includes('calculating')) return 'Crunching the numbers...';
    return text;
  };

  const displayStatus = getFriendlyText(thinking?.title || thinking?.status || '');
  const displayExplanation = thinking?.explanation && !thinking.explanation.toLowerCase().includes('processing')
    ? thinking.explanation
    : null;

  return (
    <div className={cn('space-y-1 max-w-3xl mx-auto py-2', className)}>
      {/* Completed Tools - Minimal text lines */}
      <div className="space-y-0.5">
        {completedTools.map((tool, index) => (
          <motion.div
            key={`${tool.tool} -${index} `}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-xs text-white/30 font-medium"
          >
            <span>✓</span>
            <span>{tool.summary}</span>
          </motion.div>
        ))}
      </div>

      {/* Active Thinking State - Just Text */}
      {thinking && (
        <div className="relative min-h-[24px] py-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={thinking.status + (thinking.explanation || '') + (thinking.source || '')}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-1"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 bg-clip-text text-transparent animate-pulse">
                  {displayStatus}
                </span>
                <span className="flex gap-0.5 mt-1">
                  <span className="w-1 h-1 rounded-full bg-purple-400/50 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1 h-1 rounded-full bg-purple-400/50 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1 h-1 rounded-full bg-purple-400/50 animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
              </div>

              {/* Source or Explanation - High contrast */}
              {(thinking.source || displayExplanation) && (
                <div className="text-xs text-white/70 font-normal leading-relaxed pl-0.5">
                  {thinking.source ? (
                    <span className="flex items-center gap-1.5 text-blue-300/90">
                      <span className="w-1 h-1 rounded-full bg-blue-400" />
                      {getSourceText(thinking.source)}
                    </span>
                  ) : (
                    displayExplanation
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

// Compact inline version for message list
export const ThinkingIndicatorInline: React.FC<{ status: string; icon?: string }> = ({
  status,
  icon,
}) => {
  return (
    <div className="flex items-center gap-2 text-white/50 text-sm">
      <div className="relative w-4 h-4">
        <div className="absolute inset-0 rounded-full border-2 border-white/10" />
        <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
      {icon && <span>{icon}</span>}
      <span>{status}</span>
    </div>
  );
};
