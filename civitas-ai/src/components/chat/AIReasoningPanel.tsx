/**
 * AIReasoningPanel — Post-response collapsible reasoning trace
 *
 * Rendered below AI messages that have a persisted `thinkingTrace`.
 * When native model reasoning (Claude/Gemini) is available, it displays
 * as the primary content with status steps as compact context.
 * Falls back to a step list for models without native thinking.
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  ChevronRight,
  Wrench,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThinkingContent } from './ThinkingIndicator';

export interface ReasoningStep {
  title: string;
  description: string;
  tool?: string;
  status: 'pending' | 'running' | 'complete' | 'error';
  confidence?: number;
}

interface ThinkingTrace {
  steps: { text: string; source: string }[];
  durationMs: number;
  toolsUsed: string[];
}

interface AIReasoningPanelProps {
  trace: ThinkingTrace;
  steps?: ReasoningStep[];
  totalFactors?: number;
  className?: string;
  nativeThinkingText?: string;
}

function formatDuration(ms: number): string {
  const secs = Math.round(ms / 1000);
  if (secs < 1) return 'less than a second';
  if (secs === 1) return '1 second';
  if (secs < 60) return `${secs} seconds`;
  const mins = Math.floor(secs / 60);
  const remainSecs = secs % 60;
  return remainSecs > 0 ? `${mins}m ${remainSecs}s` : `${mins}m`;
}

export const AIReasoningPanel: React.FC<AIReasoningPanelProps> = ({
  trace,
  steps: legacySteps = [],
  className = '',
  nativeThinkingText,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const displaySteps = useMemo(() => {
    if (trace.steps.length > 0) return trace.steps;
    return legacySteps.map((s) => ({
      text: s.title + (s.description ? ` — ${s.description}` : ''),
      source: s.tool || 'AI',
    }));
  }, [trace.steps, legacySteps]);

  const hasNativeThinking = !!nativeThinkingText;
  const hasSteps = displaySteps.length > 0;

  if (!hasSteps && !hasNativeThinking) return null;

  const durationText = trace.durationMs > 0
    ? formatDuration(trace.durationMs)
    : null;

  return (
    <div className={cn('mt-2', className)}>
      {/* Clickable header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="group flex items-center gap-1.5 text-[12px] text-white/30 hover:text-white/50 transition-colors"
      >
        {hasNativeThinking ? (
          <Sparkles className="w-3.5 h-3.5 text-[#C08B5C]/40 group-hover:text-[#C08B5C]/60 transition-colors" />
        ) : (
          <Brain className="w-3.5 h-3.5 text-[#C08B5C]/40 group-hover:text-[#C08B5C]/60 transition-colors" />
        )}
        <span>
          Thought{durationText ? ` for ${durationText}` : ''}
        </span>
        <motion.div
          animate={{ rotate: isExpanded ? 90 : 0 }}
          transition={{ duration: 0.15 }}
        >
          <ChevronRight className="w-3 h-3" />
        </motion.div>
      </button>

      {/* Expandable content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-2 pl-3 border-l border-white/[0.06]">

              {hasNativeThinking ? (
                <div className="mb-1.5">
                  <ThinkingContent text={nativeThinkingText!} />
                </div>
              ) : hasSteps ? (
                <div className="space-y-0.5">
                  {displaySteps.map((step, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className="flex items-start gap-2 py-0.5"
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        <span className="flex-shrink-0 w-1 h-1 rounded-full bg-white/20 inline-block" />
                      </div>
                      <span className="text-[11px] leading-relaxed text-white/35">
                        {step.text}
                      </span>
                    </motion.div>
                  ))}
                </div>
              ) : null}

              {/* Tools used summary */}
              {trace.toolsUsed.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1.5 mt-1 border-t border-white/[0.04]">
                  {trace.toolsUsed.map((tool, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-medium bg-white/[0.04] text-white/25"
                    >
                      <Wrench className="w-2.5 h-2.5" />
                      {tool}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
