/**
 * AIReasoningPanel — Post-response collapsible reasoning trace
 *
 * Rendered below AI messages that have a persisted `thinkingTrace`.
 * Shows "Thought for Xs" header, and expands to reveal the step-by-step
 * reasoning the model went through before responding. Inspired by
 * ChatGPT's "Thought for …" and Gemini's "Thinking" panels.
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  ChevronRight,
  Search,
  BarChart3,
  Shield,
  Zap,
  FileText,
  Wrench,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Re-export for backward compat
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
  /** Full reasoning trace from Message.thinkingTrace */
  trace: ThinkingTrace;
  /** Legacy steps prop (fallback if trace not available) */
  steps?: ReasoningStep[];
  totalFactors?: number;
  className?: string;
}

// --- Icon from source ---
function sourceIcon(source: string): React.ReactNode {
  const s = source.toLowerCase();
  if (s.includes('safety') || s.includes('guardrail') || s.includes('grader'))
    return <Shield className="w-3 h-3 text-amber-400/60" />;
  if (s.includes('reasoning') || s.includes('system 2') || s.includes('strategic'))
    return <Brain className="w-3 h-3 text-[#D4A27F]/60" />;
  if (s.includes('scan') || s.includes('search') || s.includes('scout'))
    return <Search className="w-3 h-3 text-blue-400/60" />;
  if (s.includes('pnl') || s.includes('metric') || s.includes('valuation') || s.includes('analysis'))
    return <BarChart3 className="w-3 h-3 text-emerald-400/60" />;
  if (s.includes('report') || s.includes('generate'))
    return <FileText className="w-3 h-3 text-[#D4A27F]/60" />;
  if (s.includes('tool'))
    return <Wrench className="w-3 h-3 text-blue-400/60" />;
  return <Zap className="w-3 h-3 text-white/30" />;
}

// --- Format duration ---
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
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Merge legacy steps into trace format
  const displaySteps = useMemo(() => {
    if (trace.steps.length > 0) return trace.steps;
    // Fallback to legacy steps
    return legacySteps.map((s) => ({
      text: s.title + (s.description ? ` — ${s.description}` : ''),
      source: s.tool || 'AI',
    }));
  }, [trace.steps, legacySteps]);

  // Don't render if no steps
  if (displaySteps.length === 0) return null;

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
        <Brain className="w-3.5 h-3.5 text-[#C08B5C]/40 group-hover:text-[#C08B5C]/60 transition-colors" />
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

      {/* Expandable trace */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-2 pl-3 border-l border-white/[0.06] space-y-0.5">
              {displaySteps.map((step, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className="flex items-start gap-2 py-0.5"
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {sourceIcon(step.source)}
                  </div>
                  <span className="text-[11px] leading-relaxed text-white/35">
                    {step.text}
                  </span>
                </motion.div>
              ))}

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
