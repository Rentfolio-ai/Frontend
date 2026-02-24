// FILE: src/components/chat/ThinkingIndicator.tsx
import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ChevronRight, AlertCircle, RefreshCw, X, Search, Brain, PenLine, Sparkles, Eye } from 'lucide-react';
import type { ThinkingState, CompletedTool } from '@/types/stream';
import type { ReasoningStep } from './AIReasoningPanel';
import type { ThinkingStep } from '@/hooks/useThinkingQueue';
import { isReasoningStage } from '@/hooks/useThinkingQueue';

const GENERIC_MESSAGES = new Set(['Thinking', 'Thinking...', 'Thinking…', 'Working...']);

/**
 * Extract a dynamic shimmer label from native thinking text.
 * Gemini: grabs the last `**Heading**`.
 * Claude: grabs the first sentence of the most recent paragraph.
 */
function extractThinkingLabel(text: string): string | null {
  if (!text) return null;

  // Gemini-style: last **heading**
  const headings = text.match(/\*\*(.+?)\*\*/g);
  if (headings && headings.length > 0) {
    const last = headings[headings.length - 1];
    return last.replace(/\*\*/g, '').trim();
  }

  // Claude-style: first sentence of the last paragraph
  const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 0);
  const last = paragraphs[paragraphs.length - 1]?.trim();
  if (last) {
    const sentenceMatch = last.match(/^[^.!?]+[.!?]/);
    const label = sentenceMatch ? sentenceMatch[0].trim() : last;
    return label.length > 65 ? label.slice(0, 62) + '...' : label;
  }
  return null;
}

interface ThinkingSection {
  heading?: string;
  body: string;
}

/**
 * Parse native thinking text into structured sections.
 * Gemini: splits on `**heading**` markers into heading + body pairs.
 * Claude: splits on double newlines into discrete paragraph blocks.
 */
export function parseThinkingSections(text: string): ThinkingSection[] {
  if (!text) return [];

  const hasMarkdownHeadings = /\*\*.+?\*\*/.test(text);

  if (hasMarkdownHeadings) {
    const parts = text.split(/\*\*(.+?)\*\*/);
    const sections: ThinkingSection[] = [];
    if (parts[0]?.trim()) {
      sections.push({ body: parts[0].trim() });
    }
    for (let i = 1; i < parts.length; i += 2) {
      const heading = parts[i]?.trim();
      const body = parts[i + 1]?.trim() || '';
      if (heading || body) {
        sections.push({ heading, body });
      }
    }
    return sections.length > 0 ? sections : [{ body: text.trim() }];
  }

  // Claude / generic: split on double newlines into paragraph blocks
  const paragraphs = text.split(/\n\n+/).map(p => p.trim()).filter(p => p.length > 0);
  if (paragraphs.length === 0) return [{ body: text.trim() }];
  return paragraphs.map(p => ({ body: p }));
}

/**
 * Renders parsed thinking sections with custom typography.
 * Shared between ThinkingIndicator (streaming) and AIReasoningPanel (completed).
 */
export const ThinkingContent: React.FC<{
  text: string;
  isStreaming?: boolean;
  scrollRef?: React.RefObject<HTMLDivElement | null>;
}> = ({ text, isStreaming = false, scrollRef }) => {
  const sections = React.useMemo(() => parseThinkingSections(text), [text]);

  return (
    <div
      ref={scrollRef}
      className="max-h-[300px] overflow-y-auto rounded-lg bg-white/[0.02] border border-white/[0.04] px-3.5 py-3 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent space-y-2.5"
    >
      {sections.map((section, idx) => (
        <div key={idx}>
          {section.heading && (
            <p className="text-[11px] font-semibold text-[#C08B5C]/70 tracking-wide uppercase mb-1">
              {section.heading}
            </p>
          )}
          {section.body && (
            <p className="text-[11.5px] leading-[18px] text-white/35">
              {section.body}
            </p>
          )}
        </div>
      ))}
      {isStreaming && (
        <span className="inline-block w-[5px] h-[13px] bg-[#C08B5C]/40 animate-pulse ml-0.5 align-middle rounded-sm" />
      )}
    </div>
  );
};

const STAGE_ICONS: Record<string, React.ReactNode> = {
  understanding: <Eye className="w-3 h-3" />,
  gathering: <Search className="w-3 h-3" />,
  analyzing: <Brain className="w-3 h-3" />,
  composing: <PenLine className="w-3 h-3" />,
  refining: <Sparkles className="w-3 h-3" />,
  reasoning: <Sparkles className="w-3 h-3" />,
};

// ── Gradient shimmer CSS (injected once) ───────────────────────────

const SHIMMER_STYLE_ID = 'thinking-gradient-style';

function ensureShimmerStyle() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(SHIMMER_STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = SHIMMER_STYLE_ID;
  style.textContent = `
    @keyframes gradient-flow {
      0% { background-position: 0% 50%; }
      100% { background-position: 200% 50%; }
    }
    .thinking-shimmer {
      background: linear-gradient(
        90deg,
        rgba(255,255,255,0.25) 0%,
        rgba(192,139,92,0.75) 25%,
        rgba(255,255,255,0.5) 50%,
        rgba(192,139,92,0.75) 75%,
        rgba(255,255,255,0.25) 100%
      );
      background-size: 200% 100%;
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
      animation: gradient-flow 2.5s ease-in-out infinite;
    }
  `;
  document.head.appendChild(style);
}

// ── Props ──────────────────────────────────────────────────────────

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
  thinkingSteps?: ThinkingStep[];
  thinkingIsActive?: boolean;
  thinkingIsDone?: boolean;
  thinkingElapsed?: number;
  nativeThinkingText?: string | null;
  hasThinkingModel?: boolean;
}

// ── Component ──────────────────────────────────────────────────────

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
  nativeThinkingText,
  hasThinkingModel = false,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { ensureShimmerStyle(); }, []);

  useEffect(() => {
    if (scrollRef.current && thinkingIsActive) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [nativeThinkingText, thinkingIsActive]);

  // Collapse panel when done
  useEffect(() => {
    if (thinkingIsDone) {
      setIsExpanded(false);
    }
  }, [thinkingIsDone]);

  const hasNativeThinking = !!nativeThinkingText;
  const thinkingLabel = hasNativeThinking ? extractThinkingLabel(nativeThinkingText!) : null;

  // For thinking-capable models (Gemini, Claude): suppress fallback steps entirely.
  const meaningfulSteps = hasThinkingModel
    ? []
    : thinkingSteps.filter(s => !GENERIC_MESSAGES.has(s.message));
  const hasSteps = meaningfulSteps.length > 0;
  const currentStep = hasSteps ? meaningfulSteps[meaningfulSteps.length - 1] : null;
  const pastSteps = hasSteps ? meaningfulSteps.slice(0, -1) : [];
  const hasPastSteps = pastSteps.length > 0;
  const legacyStatus = thinking?.title || thinking?.status || '';
  const showLegacy = !hasSteps && !!thinking;
  const canExpand = hasNativeThinking || (!hasThinkingModel && hasPastSteps);

  const timeText = thinkingElapsed > 0
    ? thinkingElapsed < 60
      ? `${thinkingElapsed}s`
      : `${Math.floor(thinkingElapsed / 60)}:${String(thinkingElapsed % 60).padStart(2, '0')}`
    : null;

  let headerText: string;
  if (thinkingIsDone) {
    headerText = `Thought for ${timeText || '0s'}`;
  } else if (hasNativeThinking && thinkingIsActive) {
    // Use the extracted heading as the shimmer label
    headerText = thinkingLabel || 'Reasoning...';
  } else if (hasThinkingModel) {
    headerText = 'Thinking...';
  } else if (currentStep) {
    headerText = currentStep.message;
  } else if (showLegacy) {
    headerText = GENERIC_MESSAGES.has(legacyStatus) ? 'Thinking...' : legacyStatus;
  } else {
    headerText = 'Thinking...';
  }

  if (!thinking && !hasSteps && !error && !hasNativeThinking) return null;

  return (
    <div className={cn('max-w-3xl mx-auto', className)}>
      {/* ── Main header line ─────────────────────────────────── */}
      {(hasSteps || showLegacy || hasNativeThinking) && (
        <div className="select-none">
          <button
            onClick={() => canExpand && setIsExpanded(!isExpanded)}
            className={cn(
              'flex items-center gap-1.5 py-1 group w-full text-left',
              canExpand ? 'cursor-pointer' : 'cursor-default',
            )}
          >
            {canExpand ? (
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

            {(thinkingIsActive || hasThinkingModel) ? (
              <Sparkles className="w-3.5 h-3.5 flex-shrink-0 text-[#C08B5C]/60" />
            ) : currentStep && STAGE_ICONS[currentStep.stage] ? (
              <span className="flex-shrink-0 text-white/20">
                {STAGE_ICONS[currentStep.stage]}
              </span>
            ) : null}

            <AnimatePresence mode="wait">
              <motion.span
                key={headerText}
                initial={{ opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -3 }}
                transition={{ duration: 0.15 }}
                className={cn(
                  'text-[13px] flex-1 min-w-0 truncate font-medium',
                  thinkingIsDone
                    ? 'text-white/25'
                    : (thinkingIsActive || hasThinkingModel)
                      ? 'thinking-shimmer'
                      : 'text-white/45',
                )}
              >
                {headerText}
              </motion.span>
            </AnimatePresence>

            {(thinkingIsActive || hasThinkingModel) && timeText && (
              <span className="text-[11px] font-mono text-white/15 flex-shrink-0 tabular-nums ml-2">
                {timeText}
              </span>
            )}
          </button>

          {/* ── Expanded content ──────────────────────────────── */}
          <AnimatePresence initial={false}>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                {hasNativeThinking ? (
                  <div className="ml-[22px] mb-2">
                    <ThinkingContent
                      text={nativeThinkingText!}
                      isStreaming={thinkingIsActive}
                      scrollRef={scrollRef}
                    />
                  </div>
                ) : hasPastSteps ? (
                  <div className="pl-[22px] pb-1.5 space-y-0">
                    {pastSteps.map((step, idx) => (
                      <motion.div
                        key={step.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.1, delay: idx * 0.02 }}
                        className="flex items-center gap-1.5 py-[2px]"
                      >
                        {STAGE_ICONS[step.stage] ? (
                          <span className="flex-shrink-0 text-white/12 w-3 h-3 flex items-center justify-center">
                            {STAGE_ICONS[step.stage]}
                          </span>
                        ) : (
                          <span className="flex-shrink-0 w-1 h-1 rounded-full bg-white/15" />
                        )}
                        <span className={cn(
                          'text-[11px] leading-[16px] text-white/20 truncate',
                          isReasoningStage(step.stage) && 'italic',
                        )}>
                          {step.message}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                ) : null}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ── Stop button ──────────────────────────────────────── */}
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

      {/* ── Error state ──────────────────────────────────────── */}
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

export const ThinkingIndicatorInline: React.FC<{ status: string; icon?: string }> = ({
  status,
  icon,
}) => {
  return (
    <div className="flex items-center gap-2 text-white/50 text-sm">
      <Sparkles className="w-3.5 h-3.5 text-[#C08B5C]/60" />
      {icon && <span>{icon}</span>}
      <span>{status}</span>
    </div>
  );
};
