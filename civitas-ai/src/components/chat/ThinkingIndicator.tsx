// FILE: src/components/chat/ThinkingIndicator.tsx
import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ChevronRight, AlertCircle, RefreshCw, X, Sparkles } from 'lucide-react';
import type { ThinkingState, CompletedTool } from '@/types/stream';
import type { ReasoningStep } from './AIReasoningPanel';
import type { ThinkingStep } from '@/hooks/useThinkingQueue';

const GENERIC_MESSAGES = new Set(['Thinking', 'Thinking...', 'Thinking…', 'Working...']);

export function extractThinkingLabel(text: string): string | null {
  if (!text) return null;
  const headings = text.match(/\*\*(.+?)\*\*/g);
  if (headings && headings.length > 0) {
    const last = headings[headings.length - 1];
    return last.replace(/\*\*/g, '').trim();
  }
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
  const paragraphs = text.split(/\n\n+/).map(p => p.trim()).filter(p => p.length > 0);
  if (paragraphs.length === 0) return [{ body: text.trim() }];
  return paragraphs.map(p => ({ body: p }));
}

export const ThinkingContent: React.FC<{
  text: string;
  isStreaming?: boolean;
  scrollRef?: React.RefObject<HTMLDivElement | null>;
}> = ({ text, isStreaming = false, scrollRef }) => {
  const sections = React.useMemo(() => parseThinkingSections(text), [text]);

  return (
    <div
      ref={scrollRef}
      className="max-h-[340px] overflow-y-auto rounded-lg bg-white/[0.02] border border-white/[0.04] px-3.5 py-3 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent space-y-2.5"
    >
      {sections.map((section, idx) => (
        <div key={idx}>
          {section.heading && (
            <p className="text-[11px] font-semibold text-[#C08B5C]/70 tracking-wide uppercase mb-1">
              {section.heading}
            </p>
          )}
          {section.body && (
            <p className="text-[12px] leading-[19px] text-white/50">
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

/**
 * Convert step messages into a single flowing text for the unified expanded view.
 * Active (last) step gets a trailing "..." to show it's in progress.
 */
function stepsToFlowingText(steps: ThinkingStep[], isActive: boolean): string {
  return steps
    .map((step, idx) => {
      const isLast = idx === steps.length - 1;
      const suffix = isLast && isActive ? '...' : '';
      return step.message + suffix;
    })
    .join('\n\n');
}

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
  /** Short display name for the currently active model (e.g. "Claude Sonnet"). */
  activeModel?: string;
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
  nativeThinkingText,
  hasThinkingModel = false,
  activeModel,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current && thinkingIsActive) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [nativeThinkingText, thinkingIsActive, thinkingSteps.length]);

  const hasNativeThinking = !!nativeThinkingText;
  const thinkingLabel = hasNativeThinking ? extractThinkingLabel(nativeThinkingText!) : null;

  const meaningfulSteps = hasThinkingModel
    ? []
    : thinkingSteps.filter(s => !GENERIC_MESSAGES.has(s.message));
  const hasSteps = meaningfulSteps.length > 0;
  const currentStep = hasSteps ? meaningfulSteps[meaningfulSteps.length - 1] : null;
  const allSteps = meaningfulSteps;
  const legacyStatus = thinking?.title || thinking?.status || '';
  const showLegacy = !hasSteps && !!thinking;
  const canExpand = hasNativeThinking || (!hasThinkingModel && allSteps.length > 0);

  const timeText = thinkingElapsed > 0
    ? thinkingElapsed < 60
      ? `${thinkingElapsed}s`
      : `${Math.floor(thinkingElapsed / 60)}:${String(thinkingElapsed % 60).padStart(2, '0')}`
    : null;

  let headerText: string;
  let headerKey: string;
  if (thinkingIsDone) {
    headerText = `Thought for ${timeText || '0s'}`;
    headerKey = 'done';
  } else if (hasNativeThinking && thinkingIsActive) {
    headerText = thinkingLabel || 'Reasoning...';
    headerKey = `native-${thinkingLabel}`;
  } else if (hasThinkingModel) {
    headerText = 'Thinking...';
    headerKey = 'thinking-model';
  } else if (currentStep) {
    headerText = currentStep.message;
    headerKey = currentStep.id;
  } else if (showLegacy) {
    headerText = GENERIC_MESSAGES.has(legacyStatus) ? 'Thinking...' : legacyStatus;
    headerKey = `legacy-${legacyStatus}`;
  } else {
    headerText = 'Thinking...';
    headerKey = 'default';
  }

  const canShowExpanded = hasNativeThinking || (!hasThinkingModel && allSteps.length > 0);

  if (!thinking && !hasSteps && !error && !hasNativeThinking) return null;

  return (
    <div className={cn('max-w-3xl mx-auto', className)}>
      {(hasSteps || showLegacy || hasNativeThinking) && (
        <div className="select-none">
          {/* Header — 7A: Smooth single-line transitions */}
          <button
            onClick={() => canExpand && setIsExpanded(!isExpanded)}
            className={cn(
              'flex items-center gap-2 py-1.5 group w-full text-left',
              canExpand ? 'cursor-pointer' : 'cursor-default',
            )}
          >
            {canExpand ? (
              <motion.span
                animate={{ rotate: isExpanded ? 90 : 0 }}
                transition={{ duration: 0.15 }}
                className="text-white/30 group-hover:text-white/50 transition-colors flex-shrink-0"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </motion.span>
            ) : (
              <span className="w-3.5 flex-shrink-0" />
            )}

            <Sparkles className="w-3.5 h-3.5 flex-shrink-0 text-[#C08B5C]/60" />

            {/* Animated header text — fades between steps */}
            <span className="flex-1 min-w-0 relative overflow-hidden h-[20px]">
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={headerKey}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  className={cn(
                    'text-[13px] truncate font-medium absolute inset-0 flex items-center',
                    thinkingIsDone ? 'text-white/35' : 'text-white/50',
                  )}
                >
                  {headerText}
                  {!thinkingIsDone && thinkingIsActive && (
                    <span className="inline-flex ml-0.5 gap-[2px]">
                      <span className="w-[3px] h-[3px] rounded-full bg-current animate-[pulse-dot_1.5s_ease-in-out_infinite]" />
                      <span className="w-[3px] h-[3px] rounded-full bg-current animate-[pulse-dot_1.5s_ease-in-out_0.3s_infinite]" />
                      <span className="w-[3px] h-[3px] rounded-full bg-current animate-[pulse-dot_1.5s_ease-in-out_0.6s_infinite]" />
                    </span>
                  )}
                </motion.span>
              </AnimatePresence>
            </span>

            {timeText && (
              <span className="text-[11px] font-mono text-white/20 flex-shrink-0 tabular-nums ml-2">
                {timeText}
              </span>
            )}

            {/* Model badge — shown while streaming so user can see which model is active */}
            {thinkingIsActive && activeModel && (
              <span className="text-[10px] font-mono text-white/20 flex-shrink-0 ml-1 px-1.5 py-0.5 rounded bg-white/[0.04] leading-tight">
                {activeModel}
              </span>
            )}
          </button>

          {/* Expanded: animated building list (steps) or native thinking prose */}
          <AnimatePresence initial={false}>
            {isExpanded && canShowExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="ml-5 mb-2 pl-4 border-l border-[#C08B5C]/20">
                  {hasNativeThinking ? (
                    <ThinkingContent
                      text={nativeThinkingText!}
                      isStreaming={thinkingIsActive}
                      scrollRef={scrollRef}
                    />
                  ) : (
                    /* Animated building list — each step fades in from below as it arrives */
                    <ul
                      ref={scrollRef}
                      className="max-h-[280px] overflow-y-auto space-y-0.5 py-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
                    >
                      <AnimatePresence initial={false}>
                        {allSteps.map((step, idx) => {
                          const isLast = idx === allSteps.length - 1;
                          return (
                            <motion.li
                              key={step.id}
                              initial={{ opacity: 0, y: 4 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.18, ease: 'easeOut' }}
                              className="flex items-center gap-2"
                            >
                              <span className="w-4 text-right text-[10px] text-[#C08B5C]/30 font-mono tabular-nums flex-shrink-0">
                                {idx + 1}
                              </span>
                              <span className="text-[12px] leading-[18px] text-white/45 flex-1">
                                {step.message}
                              </span>
                              {isLast && thinkingIsActive && (
                                <span className="inline-flex gap-[2px] flex-shrink-0">
                                  <span className="w-[3px] h-[3px] rounded-full bg-white/30 animate-[pulse-dot_1.5s_ease-in-out_infinite]" />
                                  <span className="w-[3px] h-[3px] rounded-full bg-white/30 animate-[pulse-dot_1.5s_ease-in-out_0.3s_infinite]" />
                                  <span className="w-[3px] h-[3px] rounded-full bg-white/30 animate-[pulse-dot_1.5s_ease-in-out_0.6s_infinite]" />
                                </span>
                              )}
                            </motion.li>
                          );
                        })}
                      </AnimatePresence>
                    </ul>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Stop button */}
      {thinking && onCancel && thinkingIsActive && (
        <div className="flex justify-start ml-5 pl-4 pb-1">
          <button
            onClick={onCancel}
            className="flex items-center gap-1 text-[11px] text-white/20 hover:text-red-400/60 transition-colors"
          >
            <X className="w-3 h-3" />
            Stop
          </button>
        </div>
      )}

      {/* Error state */}
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
