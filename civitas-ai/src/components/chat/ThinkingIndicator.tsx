// FILE: src/components/chat/ThinkingIndicator.tsx
import React, { useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ChevronRight, AlertCircle, RefreshCw, X } from 'lucide-react';
import type { ThinkingState, CompletedTool } from '@/types/stream';
import type { ReasoningStep } from './AIReasoningPanel';
import type { ThinkingStep } from '@/hooks/useThinkingQueue';

const GENERIC_MESSAGES = new Set(['Thinking', 'Thinking...', 'Thinking…', 'Working...']);

/* ── Algorithm #2: Time-based message evolution ── */
const TIME_EVOLUTION: Array<{ afterSec: number; message: string }> = [
  { afterSec: 3,  message: 'Analyzing your request...' },
  { afterSec: 8,  message: 'Running deeper analysis...' },
  { afterSec: 15, message: 'This is a complex query — working through it...' },
  { afterSec: 25, message: 'Almost there — refining results...' },
  { afterSec: 40, message: 'Taking extra care with this one...' },
];

function getTimeEvolvedMessage(elapsedSec: number): string | null {
  let result: string | null = null;
  for (const entry of TIME_EVOLUTION) {
    if (elapsedSec >= entry.afterSec) result = entry.message;
  }
  return result;
}

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

const VasthuThinkingGlyph: React.FC<{ active?: boolean; className?: string }> = ({ active = false, className = '' }) => (
  <motion.svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`flex-shrink-0 ${className}`}
    animate={active ? { opacity: [0.45, 0.8, 0.45] } : { opacity: 0.55 }}
    transition={active ? { duration: 1.8, repeat: Infinity, ease: 'easeInOut' } : undefined}
  >
    <motion.path
      d="M2.2 8C3.4 5.1 5.6 5.1 8 8C10.4 10.9 12.6 10.9 13.8 8C12.6 5.1 10.4 5.1 8 8C5.6 10.9 3.4 10.9 2.2 8Z"
      stroke="currentColor"
      strokeWidth="1.35"
      strokeLinecap="round"
      strokeLinejoin="round"
      initial={{ pathLength: 0.75 }}
      animate={active ? { pathLength: [0.75, 1, 0.75] } : { pathLength: 0.95 }}
      transition={active ? { duration: 2.1, repeat: Infinity, ease: 'easeInOut' } : undefined}
    />
    {active && (
      <motion.circle
        cx="4.5"
        cy="8"
        r="1"
        fill="currentColor"
        animate={{ cx: [4.5, 11.5, 4.5], opacity: [0.2, 0.95, 0.2] }}
        transition={{ duration: 2.1, repeat: Infinity, ease: 'easeInOut' }}
      />
    )}
  </motion.svg>
);

export const ThinkingContent: React.FC<{
  text: string;
  isStreaming?: boolean;
  scrollRef?: React.RefObject<HTMLDivElement | null>;
  variant?: 'panel' | 'inline';
}> = ({ text, isStreaming = false, scrollRef, variant = 'panel' }) => {
  const sections = React.useMemo(() => parseThinkingSections(text), [text]);
  const isInline = variant === 'inline';

  return (
    <div
      ref={scrollRef}
      className={cn(
        "max-h-[340px] overflow-y-auto scrollbar-thin scrollbar-thumb-black/10 scrollbar-track-transparent space-y-2.5",
        isInline
          ? "px-0 py-0.5"
          : "rounded-lg bg-black/[0.02] border border-black/[0.04] px-3.5 py-3"
      )}
    >
      {sections.map((section, idx) => (
        <div key={idx}>
          {section.heading && (
            <p className={cn(
              "font-semibold text-[#C08B5C]/70 tracking-wide uppercase mb-1",
              isInline ? "text-[11px]" : "text-[11px]"
            )}>
              {section.heading}
            </p>
          )}
          {section.body && (
            <p className={cn(
              "text-muted-foreground",
              isInline ? "text-[16px] leading-[28px]" : "text-[12px] leading-[19px]"
            )}>
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

/* ── Completed tools timeline ── */
const CompletedToolsTimeline: React.FC<{ steps: ThinkingStep[] }> = ({ steps }) => {
  const completed = steps.filter(s => s.status === 'done');
  if (completed.length < 2) return null;
  return (
    <div className="ml-8 mb-1.5 pl-3 flex items-center gap-1 flex-wrap">
      {completed.map((step, i) => (
        <React.Fragment key={step.id}>
          <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground/40">
            <span className="w-1 h-1 rounded-full bg-emerald-400/50" />
            <span className="truncate max-w-[140px]">{step.message}</span>
          </span>
          {i < completed.length - 1 && (
            <span className="text-[8px] text-muted-foreground/25">→</span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

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
  /** Reasoning-only prose built from reasoning-delta events (excludes operational status). */
  reasoningText?: string | null;
  hasThinkingModel?: boolean;
  /** Short display name for the currently active model (e.g. "Claude Sonnet"). */
  activeModel?: string;
  reasoningEffort?: 'low' | 'medium' | 'high';
  /** Agent mode for persona-aware messaging. */
  agentMode?: 'hunter' | 'research' | 'strategist';
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
  reasoningText,
  hasThinkingModel = false,
  activeModel,
  reasoningEffort = 'medium',
  agentMode,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(true);
  const proseScrollRef = useRef<HTMLDivElement>(null);
  const hasNativeThinking = !!nativeThinkingText;
  const hasReasoningProse = !!reasoningText;
  const hasAnyProse = hasNativeThinking || hasReasoningProse;

  useEffect(() => {
    if (proseScrollRef.current && thinkingIsActive) {
      proseScrollRef.current.scrollTop = proseScrollRef.current.scrollHeight;
    }
  }, [nativeThinkingText, reasoningText, thinkingIsActive]);

  const thinkingLabel = hasNativeThinking ? extractThinkingLabel(nativeThinkingText!) : null;

  const meaningfulSteps = hasThinkingModel
    ? []
    : thinkingSteps.filter(s => !GENERIC_MESSAGES.has(s.message));
  const hasSteps = meaningfulSteps.length > 0;
  const currentStep = hasSteps ? meaningfulSteps[meaningfulSteps.length - 1] : null;
  const legacyStatus = thinking?.title || thinking?.status || '';
  const showLegacy = !hasSteps && !!thinking;
  const canExpand = hasAnyProse || (thinkingIsActive && !thinkingIsDone);

  const timeText = thinkingElapsed > 0
    ? thinkingElapsed < 60
      ? `${thinkingElapsed}s`
      : `${Math.floor(thinkingElapsed / 60)}:${String(thinkingElapsed % 60).padStart(2, '0')}`
    : null;

  /* Algorithm #5: Persona-aware effort labels */
  const personaLabels: Record<string, typeof effortLabelsDefault> = {
    hunter: {
      low:    { active: 'Quick scan...', done: (t: string) => `Scanned for ${t}` },
      medium: { active: 'Hunting deals...', done: (t: string) => `Hunted for ${t}` },
      high:   { active: 'Deep deal analysis...', done: (t: string) => `Analyzed deeply for ${t}` },
    },
    research: {
      low:    { active: 'Quick lookup...', done: (t: string) => `Looked up for ${t}` },
      medium: { active: 'Researching...', done: (t: string) => `Researched for ${t}` },
      high:   { active: 'Deep research...', done: (t: string) => `Researched deeply for ${t}` },
    },
    strategist: {
      low:    { active: 'Quick review...', done: (t: string) => `Reviewed for ${t}` },
      medium: { active: 'Strategizing...', done: (t: string) => `Strategized for ${t}` },
      high:   { active: 'Deep strategic analysis...', done: (t: string) => `Analyzed strategy for ${t}` },
    },
  };
  const effortLabelsDefault = {
    low:    { active: 'Quick check...', done: (t: string) => `Checked for ${t}` },
    medium: { active: 'Thinking...', done: (t: string) => `Thought for ${t}` },
    high:   { active: 'Deep reasoning...', done: (t: string) => `Thought deeply for ${t}` },
  };
  const activeLabels = (agentMode && personaLabels[agentMode]) || effortLabelsDefault;
  const effortLabel = activeLabels[reasoningEffort] || activeLabels.medium;

  /* Algorithm #2: Time-based evolution — if we have no tool-specific steps,
     evolve the generic message based on elapsed time */
  const timeEvolvedMsg = (!hasSteps && !hasNativeThinking && thinkingIsActive)
    ? getTimeEvolvedMessage(thinkingElapsed)
    : null;

  let headerText: string;
  let headerKey: string;
  if (thinkingIsDone) {
    headerText = effortLabel.done(timeText || '0s');
    headerKey = 'done';
  } else if (thinkingIsActive && currentStep) {
    headerText = currentStep.message;
    headerKey = `live-${currentStep.id}`;
  } else if (hasNativeThinking) {
    headerText = thinkingLabel || (reasoningEffort === 'high' ? 'Deep reasoning' : 'Reasoning');
    headerKey = `native-${thinkingLabel || 'reasoning'}`;
  } else if (hasThinkingModel) {
    headerText = effortLabel.active;
    headerKey = 'thinking-model';
  } else if (timeEvolvedMsg) {
    headerText = timeEvolvedMsg;
    headerKey = `time-${thinkingElapsed}`;
  } else if (currentStep) {
    headerText = currentStep.message;
    headerKey = currentStep.id;
  } else if (showLegacy) {
    headerText = GENERIC_MESSAGES.has(legacyStatus) ? effortLabel.active : legacyStatus;
    headerKey = `legacy-${legacyStatus}`;
  } else {
    headerText = effortLabel.active;
    headerKey = 'default';
  }

  const canShowExpanded = hasAnyProse || (thinkingIsActive && !thinkingIsDone);

  const proseContent = nativeThinkingText || reasoningText || '';
  const proseSections = useMemo(
    () => parseThinkingSections(proseContent),
    [proseContent],
  );
  const latestSection = proseSections.length > 0 ? proseSections[proseSections.length - 1] : null;
  const latestSectionKey = latestSection
    ? `${proseSections.length}-${latestSection.heading || ''}-${latestSection.body}`.slice(0, 180)
    : 'prose-empty';

  if (!thinking && !hasSteps && !error && !hasAnyProse && !thinkingIsActive) return null;

  return (
    <div className={cn('max-w-3xl mx-auto', className)}>
      {(hasSteps || showLegacy || hasAnyProse || thinkingIsActive) && (
        <div className="select-none">
          {/* Header — 7A: Smooth single-line transitions */}
          <button
            onClick={() => canExpand && setIsExpanded(!isExpanded)}
            className={cn(
              'flex items-center gap-2.5 py-2.5 group w-full text-left',
              canExpand ? 'cursor-pointer' : 'cursor-default',
            )}
          >
            {canExpand ? (
              <motion.span
                animate={{ rotate: isExpanded ? 90 : 0 }}
                transition={{ duration: 0.15 }}
                className="text-muted-foreground/50 group-hover:text-muted-foreground transition-colors flex-shrink-0 mt-[1px]"
              >
                <ChevronRight className="w-4 h-4" />
              </motion.span>
            ) : (
              <span className="w-4 flex-shrink-0" />
            )}

            <span className="text-muted-foreground/70 mt-[1px]">
              <VasthuThinkingGlyph active={thinkingIsActive && !thinkingIsDone} />
            </span>

            {/* Animated header text — fades between steps */}
            <span className="flex-1 min-w-0 relative overflow-hidden h-[26px]">
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={headerKey}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                  className={cn(
                    'text-[16px] truncate font-medium absolute inset-0 flex items-center',
                    thinkingIsDone ? 'text-muted-foreground/60' : 'text-muted-foreground',
                  )}
                >
                  {headerText}
                </motion.span>
              </AnimatePresence>
            </span>

            {timeText && (
              <span className="text-[12px] font-mono text-muted-foreground/40 flex-shrink-0 tabular-nums ml-2">
                {timeText}
              </span>
            )}

            {/* Model badge — shown while streaming so user can see which model is active */}
            {thinkingIsActive && activeModel && (
              <span className="text-[10px] font-mono text-muted-foreground/40 flex-shrink-0 ml-1 px-1.5 py-0.5 rounded bg-black/[0.03] leading-tight">
                {activeModel}
              </span>
            )}
          </button>

          {/* Completed tools timeline */}
          {thinkingIsActive && !thinkingIsDone && meaningfulSteps.length >= 2 && (
            <CompletedToolsTimeline steps={meaningfulSteps} />
          )}

          {/* Expanded: flowing reasoning prose (only renders when prose exists) */}
          <AnimatePresence initial={false}>
            {isExpanded && canShowExpanded && hasAnyProse && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
              >
                <div className="ml-8 mb-2 pl-3">
                  {thinkingIsActive && !thinkingIsDone ? (
                    <div
                      ref={proseScrollRef}
                      className="max-h-[420px] overflow-y-auto scrollbar-thin scrollbar-thumb-black/10 scrollbar-track-transparent py-0.5"
                    >
                      <AnimatePresence mode="wait" initial={false}>
                        <motion.div
                          key={latestSectionKey}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2, ease: 'easeOut' }}
                        >
                          {latestSection?.heading && (
                            <p className="text-[11px] font-semibold text-[#C08B5C]/70 tracking-wide uppercase mb-1">
                              {latestSection.heading}
                            </p>
                          )}
                          <p className="text-[14px] leading-[24px] text-muted-foreground/70">
                            {latestSection?.body}
                          </p>
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  ) : (
                    <ThinkingContent
                      text={proseContent}
                      isStreaming={false}
                      scrollRef={proseScrollRef}
                      variant="inline"
                    />
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
            className="flex items-center gap-1 text-[11px] text-muted-foreground/40 hover:text-red-400/60 transition-colors"
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
    <div className="flex items-center gap-2.5 text-muted-foreground text-sm">
      <span className="text-muted-foreground/70">
        <VasthuThinkingGlyph active={true} className="w-4 h-4" />
      </span>
      {icon && <span>{icon}</span>}
      <span className="text-[15px] leading-6">{status}</span>
    </div>
  );
};
