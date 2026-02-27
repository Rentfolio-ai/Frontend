/**
 * AIReasoningPanel -- Post-response collapsible reasoning trace
 *
 * Priority for expanded content:
 *   1. nativeThinkingText  — raw Claude/Gemini chain-of-thought prose
 *   2. reasoningTrace.steps — AI analysis from <thinking> tags (reasoning-delta events only)
 *   3. Minimal fallback     — source chips only (web search with no analysis steps)
 *
 * Operational tool steps ("Searching the web", "Reading sources", etc.) are intentionally
 * excluded — those appear in the live ThinkingIndicator during streaming.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Sparkles, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThinkingContent, extractThinkingLabel } from './ThinkingIndicator';

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

interface ReasoningTrace {
  steps: { text: string; source: string }[];
  durationMs: number;
}

interface AIReasoningPanelProps {
  trace: ThinkingTrace;
  reasoningTrace?: ReasoningTrace;
  steps?: ReasoningStep[];
  totalFactors?: number;
  className?: string;
  nativeThinkingText?: string;
  webSources?: Array<{ url: string; title?: string; snippet?: string }>;
}

function formatDuration(ms: number): string {
  const secs = Math.round(ms / 1000);
  if (secs < 1) return 'less than a second';
  if (secs === 1) return '1 second';
  if (secs < 60) return `${secs}s`;
  const mins = Math.floor(secs / 60);
  const remainSecs = secs % 60;
  return remainSecs > 0 ? `${mins}m ${remainSecs}s` : `${mins}m`;
}

function getHostname(url: string): string {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return url.slice(0, 25);
  }
}

function buildSummary(
  nativeThinkingText: string | undefined,
  reasoningSteps: { text: string }[],
  hasSources: boolean,
): string {
  if (nativeThinkingText) {
    const label = extractThinkingLabel(nativeThinkingText);
    if (label) return label.length > 60 ? label.slice(0, 57) + '...' : label;
  }
  if (reasoningSteps.length > 0) {
    const last = reasoningSteps[reasoningSteps.length - 1].text;
    // Strip leading subtag prefix like "client_read — " before showing in header
    const clean = last.replace(/^\w+ — /, '');
    return clean.length > 60 ? clean.slice(0, 57) + '...' : clean;
  }
  if (hasSources) return 'Web search';
  return '';
}

export const AIReasoningPanel: React.FC<AIReasoningPanelProps> = ({
  trace,
  reasoningTrace,
  steps: legacySteps = [],
  className = '',
  nativeThinkingText,
  webSources,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const hasNativeThinking = !!nativeThinkingText;

  // Reasoning steps: use reasoningTrace if available (pure AI analysis).
  // Fall back to legacy ReasoningStep[] props for older callers.
  const reasoningSteps: { text: string; source: string }[] = reasoningTrace?.steps?.length
    ? reasoningTrace.steps
    : legacySteps.map((s) => ({
        text: s.title + (s.description ? ` — ${s.description}` : ''),
        source: s.tool || 'AI',
      }));

  const hasReasoningSteps = reasoningSteps.length > 0;
  const hasSources = !!webSources && webSources.length > 0;

  // Only render when there is something to show
  const hasContent = hasNativeThinking || hasReasoningSteps || hasSources;
  if (!hasContent) return null;

  const durationMs = reasoningTrace?.durationMs ?? trace.durationMs;
  const durationText = durationMs > 0 ? formatDuration(durationMs) : null;
  const summary = buildSummary(nativeThinkingText, reasoningSteps, hasSources);

  return (
    <div className={cn('mt-2', className)}>
      {/* Collapsed header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="group flex items-center gap-2 text-[13px] font-medium text-white/35 hover:text-white/50 transition-colors py-1 w-full text-left"
      >
        <motion.div
          animate={{ rotate: isExpanded ? 90 : 0 }}
          transition={{ duration: 0.15 }}
          className="flex-shrink-0"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </motion.div>

        <Sparkles className="w-3.5 h-3.5 text-[#C08B5C]/50 group-hover:text-[#C08B5C]/70 transition-colors flex-shrink-0" />

        <span className="truncate">
          Thought{durationText ? ` for ${durationText}` : ''}
          {summary && (
            <span className="text-white/20 ml-1">· {summary}</span>
          )}
        </span>
      </button>

      {/* Expandable content */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="mt-1 ml-2 pl-4 border-l border-[#C08B5C]/20 pb-2">

              {/* 1. Native thinking: scrollable prose (Claude / Gemini) */}
              {hasNativeThinking && (
                <div className="mb-2">
                  <ThinkingContent text={nativeThinkingText!} />
                </div>
              )}

              {/* 2. Reasoning steps from <thinking> tag analysis (reasoning-delta only) */}
              {!hasNativeThinking && hasReasoningSteps && (
                <ul className="space-y-1.5 py-1">
                  {reasoningSteps.map((step, idx) => {
                    // Strip subtag prefixes like "client_read — " for cleaner display
                    const display = step.text.replace(/^\w+ — /, '');
                    return (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-[#C08B5C]/35 text-[10px] mt-[2px] font-mono tabular-nums w-4 flex-shrink-0 text-right">
                          {idx + 1}
                        </span>
                        <span className="text-[12px] leading-[18px] text-white/50">{display}</span>
                      </li>
                    );
                  })}
                </ul>
              )}

              {/* 3. Minimal fallback when there are only web sources (no reasoning) */}
              {!hasNativeThinking && !hasReasoningSteps && hasSources && (
                <div className="py-1 flex items-center gap-1.5 text-[12px] text-white/30">
                  <Globe className="w-3 h-3 flex-shrink-0" />
                  <span>Searched the web · {webSources!.length} source{webSources!.length !== 1 ? 's' : ''}</span>
                </div>
              )}

              {/* Source domain chips — always shown when web sources exist */}
              {hasSources && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {webSources!.slice(0, 6).map((s, i) => {
                    const host = getHostname(s.url);
                    return (
                      <a
                        key={i}
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={s.title || s.url}
                        className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/[0.04] border border-white/[0.06] text-[11px] text-white/40 hover:text-white/65 hover:border-white/15 transition-colors"
                      >
                        <img
                          src={`https://www.google.com/s2/favicons?domain=${host}&sz=16`}
                          alt=""
                          className="w-3 h-3 rounded-sm opacity-60"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                        <span className="truncate max-w-[110px]">{host}</span>
                      </a>
                    );
                  })}
                  {webSources!.length > 6 && (
                    <span className="inline-flex items-center px-2 py-1 text-[11px] text-white/25">
                      +{webSources!.length - 6} more
                    </span>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
