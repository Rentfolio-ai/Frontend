// FILE: src/components/chat/ThinkingIndicator.tsx
/**
 * Thinking indicator — ChatGPT-style single-line with expandable history.
 *
 * ONE main line shows the latest/current event with a spinner.
 * Click to expand and see completed steps underneath.
 *
 * While thinking (collapsed):
 *   ▸ ⟳ Writing deal analysis...                       5s
 *
 * While thinking (expanded):
 *   ▾ ⟳ Writing deal analysis...                       5s
 *     · Understanding your query
 *     · Searching San Francisco, CA
 *     · Found 50 properties — scoring top 7
 *
 * After thinking (collapsed):
 *   ▸ Thought for 5s
 *
 * After thinking (expanded):
 *   ▾ Thought for 5s
 *     · Understanding your query
 *     · Searching San Francisco, CA
 *     · Found 50 properties
 *     · Writing deal analysis
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ChevronRight, AlertCircle, RefreshCw, X } from 'lucide-react';
import type { ThinkingState, CompletedTool } from '@/types/stream';
import type { ReasoningStep } from './AIReasoningPanel';
import type { ThinkingStep } from '@/hooks/useThinkingQueue';
import { isReasoningStage } from '@/hooks/useThinkingQueue';

// ── Ignore generic filler steps in the header ────────────────
const GENERIC_MESSAGES = new Set(['Thinking', 'Thinking...', 'Thinking…']);

interface ThinkingIndicatorProps {
  thinking: ThinkingState | null;
  completedTools?: CompletedTool[];
  reasoningSteps?: ReasoningStep[];
  partialContent?: string;
  className?: string;
  userQuery?: string;
  onCancel?: () => void;
  error?: string | null;
  onRetry?: () => void;
  onOpenPreferences?: () => void;
  /** Accumulated thinking steps from useThinkingQueue. */
  thinkingSteps?: ThinkingStep[];
  /** Whether thinking is active. */
  thinkingIsActive?: boolean;
  /** Whether thinking is done. */
  thinkingIsDone?: boolean;
  /** Elapsed seconds from useThinkingQueue. */
  thinkingElapsed?: number;
}

export const ThinkingIndicator: React.FC<ThinkingIndicatorProps> = ({
  thinking,
  className,
  onCancel,
  error,
  onRetry,
  thinkingSteps = [],
  thinkingIsActive = false,
  thinkingIsDone = false,
  thinkingElapsed = 0,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  // ── Derive display data ───────────────────────────────────

  // Filter out generic "Thinking..." filler steps
  const meaningfulSteps = thinkingSteps.filter(s => !GENERIC_MESSAGES.has(s.message));
  const hasSteps = meaningfulSteps.length > 0;

  // The current step = the latest one (shown in the header)
  const currentStep = hasSteps ? meaningfulSteps[meaningfulSteps.length - 1] : null;

  // Past steps = everything except the current one (shown in the dropdown)
  const pastSteps = hasSteps ? meaningfulSteps.slice(0, -1) : [];
  const hasPastSteps = pastSteps.length > 0;

  // Fallback for legacy (no queue steps)
  const legacyStatus = thinking?.title || thinking?.status || '';
  const showLegacy = !hasSteps && !!thinking;

  // Format elapsed time
  const timeText = thinkingElapsed > 0
    ? thinkingElapsed < 60
      ? `${thinkingElapsed}s`
      : `${Math.floor(thinkingElapsed / 60)}:${String(thinkingElapsed % 60).padStart(2, '0')}`
    : null;

  // Header text: current step message while active, "Thought for Xs" when done
  let headerText: string;
  if (thinkingIsDone) {
    headerText = `Thought for ${timeText || '0s'}`;
  } else if (currentStep) {
    headerText = currentStep.message;
  } else if (showLegacy) {
    headerText = GENERIC_MESSAGES.has(legacyStatus) ? 'Thinking...' : legacyStatus;
  } else {
    headerText = 'Thinking...';
  }

  const headerIsReasoning = currentStep ? isReasoningStage(currentStep.stage) : false;

  // If nothing to show, render nothing
  if (!thinking && !hasSteps && !error) return null;

  return (
    <div className={cn('max-w-3xl mx-auto', className)}>
      {/* ── Main line (always visible) ───────────────────────── */}
      {(hasSteps || showLegacy) && (
        <div className="select-none">
          <button
            onClick={() => hasPastSteps && setIsExpanded(!isExpanded)}
            className={cn(
              'flex items-center gap-1.5 py-1 group w-full text-left',
              hasPastSteps ? 'cursor-pointer' : 'cursor-default',
            )}
          >
            {/* Chevron (only if there are past steps to expand) */}
            {hasPastSteps ? (
              <motion.span
                animate={{ rotate: isExpanded ? 90 : 0 }}
                transition={{ duration: 0.15 }}
                className="text-white/20 group-hover:text-white/35 transition-colors flex-shrink-0"
              >
                <ChevronRight className="w-3 h-3" />
              </motion.span>
            ) : (
              <span className="w-3 flex-shrink-0" />
            )}

            {/* Spinner (only while actively thinking) */}
            {thinkingIsActive && (
              <span className="relative flex-shrink-0 w-3.5 h-3.5">
                <span className="absolute inset-0 rounded-full border-[1.5px] border-white/8" />
                <span className="absolute inset-0 rounded-full border-[1.5px] border-white/35 border-t-transparent animate-spin" />
              </span>
            )}

            {/* Header text (current event or "Thought for Xs") */}
            <AnimatePresence mode="wait">
              <motion.span
                key={headerText}
                initial={{ opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -3 }}
                transition={{ duration: 0.15 }}
                className={cn(
                  'text-[13px] flex-1 min-w-0 truncate',
                  thinkingIsDone
                    ? 'text-white/25'
                    : headerIsReasoning
                      ? 'text-white/40 italic'
                      : 'text-white/45',
                )}
              >
                {headerText}
              </motion.span>
            </AnimatePresence>

            {/* Elapsed time */}
            {thinkingIsActive && timeText && (
              <span className="text-[11px] font-mono text-white/15 flex-shrink-0 tabular-nums ml-2">
                {timeText}
              </span>
            )}
          </button>

          {/* ── Expanded: past steps dropdown ────────────────── */}
          <AnimatePresence initial={false}>
            {isExpanded && hasPastSteps && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="pl-[22px] pb-1.5 space-y-0">
                  {pastSteps.map((step, idx) => (
                    <motion.div
                      key={step.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.1, delay: idx * 0.02 }}
                      className="flex items-center gap-1.5 py-[2px]"
                    >
                      <span className="flex-shrink-0 w-1 h-1 rounded-full bg-white/15" />
                      <span className={cn(
                        'text-[11px] leading-[16px] text-white/20 truncate',
                        isReasoningStage(step.stage) && 'italic',
                      )}>
                        {step.message}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ── Stop button ────────────────────────────────────── */}
      {thinking && onCancel && thinkingIsActive && (
        <div className="flex justify-start pl-[22px] pb-1">
          <button
            onClick={onCancel}
            className="flex items-center gap-1 text-[11px] text-white/15 hover:text-red-400/60 transition-colors"
          >
            <X className="w-3 h-3" />
            Stop
          </button>
        </div>
      )}

      {/* ── Error state ────────────────────────────────────── */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 mt-1"
        >
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-red-300">Something went wrong</p>
              <p className="text-xs text-red-400/70 mt-0.5 truncate">{error}</p>
            </div>
          </div>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-2 flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-red-500/20 text-red-300 hover:bg-red-500/30 transition-colors w-full justify-center"
            >
              <RefreshCw className="w-3 h-3" />
              Try Again
            </button>
          )}
        </motion.div>
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
        <div className="absolute inset-0 rounded-full border-2 border-[#C08B5C] border-t-transparent animate-spin" />
      </div>
      {icon && <span>{icon}</span>}
      <span>{status}</span>
    </div>
  );
};
