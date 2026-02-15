/**
 * useThinkingQueue — accumulates thinking steps like ChatGPT / Claude,
 * with a **reveal queue** so steps appear one at a time with a pause.
 *
 * Even when the backend sends a burst of events at once (e.g. after a
 * synchronous search completes), the user sees them revealed sequentially
 * with a configurable dwell time between each.
 *
 * Flow:
 *  push() → pendingQueue (internal) → revealTimer → visibleSteps (exposed)
 *
 * Features:
 * - Staggered reveal: each step pauses before the next (shorter in bursts)
 * - Deduplication: consecutive events with the same stage are collapsed
 * - Elapsed time tracking
 * - When finish() is called, remaining pending steps drain then state → done
 */

import { useCallback, useEffect, useRef, useState } from 'react';

// ── Types ───────────────────────────────────────────────────────

export interface ThinkingStep {
  id: string;
  stage: string;
  message: string;
  source?: string;
  receivedAt: number;
  /** Whether this step is still in progress or completed. */
  status: 'active' | 'done';
}

export interface ThinkingQueueState {
  /** Visible thinking steps revealed so far (oldest first). */
  steps: ThinkingStep[];
  /** Whether thinking is currently active. */
  isActive: boolean;
  /** Whether thinking has finished (steps exist but no longer active). */
  isDone: boolean;
  /** Elapsed time in seconds since thinking started. */
  elapsedSeconds: number;
  /** Push a new thinking event into the reveal queue. */
  push: (event: ThinkingStepInput) => void;
  /** Mark thinking as done (call when stream completes). */
  finish: () => void;
  /** Clear everything (call on new message / cancel). */
  reset: () => void;
}

export interface ThinkingStepInput {
  stage: string;
  message: string;
  source?: string;
}

// Stages that are reasoning subtags
const REASONING_STAGES = new Set([
  'reasoning_client_read',
  'reasoning_market_instinct',
  'reasoning_due_diligence',
  'reasoning_risk_radar',
  'reasoning_client_advisory',
  'reasoning',
]);

export function isReasoningStage(stage: string): boolean {
  return REASONING_STAGES.has(stage) || stage.startsWith('reasoning_');
}

// ── Constants ───────────────────────────────────────────────────

/** Time each step stays as the latest before the next is revealed. */
const REVEAL_DELAY_NORMAL_MS = 1200;
/** Shorter delay when many events are queued (burst from backend batch). */
const REVEAL_DELAY_BURST_MS = 600;
/** If this many or more events are pending, use the burst delay. */
const BURST_THRESHOLD = 3;

let stepIdCounter = 0;

function makeStep(input: ThinkingStepInput): ThinkingStep {
  stepIdCounter += 1;
  return {
    id: `step-${stepIdCounter}`,
    stage: input.stage,
    message: input.message,
    source: input.source,
    receivedAt: Date.now(),
    status: 'active',
  };
}

/** Pick reveal delay based on how many events are queued. */
function getRevealDelay(pendingCount: number): number {
  return pendingCount >= BURST_THRESHOLD
    ? REVEAL_DELAY_BURST_MS
    : REVEAL_DELAY_NORMAL_MS;
}

// ── Hook ────────────────────────────────────────────────────────

export function useThinkingQueue(): ThinkingQueueState {
  // ── Visible state (what the UI renders) ─────────────────────
  const [visibleSteps, setVisibleSteps] = useState<ThinkingStep[]>([]);
  const [isActive, setIsActive] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // ── Internal refs (mutable, no re-renders) ──────────────────
  const pendingRef = useRef<ThinkingStep[]>([]);
  const visibleRef = useRef<ThinkingStep[]>([]);   // mirror of visibleSteps for sync reads
  const revealTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const elapsedTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const finishRequestedRef = useRef(false);
  const isActiveRef = useRef(false);

  // ── Helper: update visible steps (keeps ref in sync) ────────

  const updateVisible = useCallback(
    (updater: (prev: ThinkingStep[]) => ThinkingStep[]) => {
      setVisibleSteps(prev => {
        const next = updater(prev);
        visibleRef.current = next;
        return next;
      });
    },
    [],
  );

  // ── Elapsed time ────────────────────────────────────────────

  const startElapsedTimer = useCallback(() => {
    if (elapsedTimerRef.current) return;
    startTimeRef.current = Date.now();
    setElapsedSeconds(0);
    elapsedTimerRef.current = setInterval(() => {
      if (startTimeRef.current) {
        setElapsedSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }
    }, 1000);
  }, []);

  const stopElapsedTimer = useCallback(() => {
    if (elapsedTimerRef.current) {
      clearInterval(elapsedTimerRef.current);
      elapsedTimerRef.current = null;
    }
  }, []);

  // ── Complete (mark as done) ─────────────────────────────────

  const markDone = useCallback(() => {
    finishRequestedRef.current = false;
    stopElapsedTimer();
    isActiveRef.current = false;
    setIsActive(false);
    setIsDone(true);
    updateVisible(prev => prev.map(s => ({ ...s, status: 'done' as const })));
  }, [stopElapsedTimer, updateVisible]);

  // ── Reveal next step from the pending queue ─────────────────

  const revealNext = useCallback(() => {
    revealTimerRef.current = null;
    const pending = pendingRef.current;

    if (pending.length === 0) {
      // Nothing left — if finish was requested, complete now
      if (finishRequestedRef.current) markDone();
      return;
    }

    // Take the next step from the pending queue
    const next = pending.shift()!;

    updateVisible(prev => {
      const updated = prev.map(s =>
        s.status === 'active' ? { ...s, status: 'done' as const } : s
      );
      updated.push(next);
      return updated;
    });

    // Keep the pump going if there are more steps or we need to finish
    if (pending.length > 0 || finishRequestedRef.current) {
      const delay = getRevealDelay(pending.length);
      revealTimerRef.current = setTimeout(revealNext, delay);
    }
  }, [markDone, updateVisible]);

  // ── Start the reveal pump (if not already running) ──────────

  const ensureRevealPump = useCallback(() => {
    if (revealTimerRef.current) return; // already ticking

    const visible = visibleRef.current;
    const pending = pendingRef.current;

    if (visible.length === 0 && pending.length > 0) {
      // Nothing visible yet — reveal the first step immediately
      const first = pending.shift()!;
      updateVisible(() => [first]);

      // Schedule subsequent reveals
      if (pending.length > 0) {
        const delay = getRevealDelay(pending.length);
        revealTimerRef.current = setTimeout(revealNext, delay);
      }
    } else if (pending.length > 0) {
      // Steps already visible — schedule the next reveal
      const delay = getRevealDelay(pending.length);
      revealTimerRef.current = setTimeout(revealNext, delay);
    }
  }, [revealNext, updateVisible]);

  // ── Push event ──────────────────────────────────────────────

  const push = useCallback(
    (input: ThinkingStepInput) => {
      // Activate if not already active
      if (!isActiveRef.current) {
        isActiveRef.current = true;
        setIsActive(true);
        setIsDone(false);
        finishRequestedRef.current = false;
        startElapsedTimer();
      }

      const pending = pendingRef.current;

      // Dedup against last pending step
      if (pending.length > 0 && pending[pending.length - 1].stage === input.stage) {
        pending[pending.length - 1] = makeStep(input);
        return;
      }

      // Dedup against last visible step (only when nothing pending)
      const visible = visibleRef.current;
      if (
        pending.length === 0 &&
        visible.length > 0 &&
        visible[visible.length - 1].stage === input.stage
      ) {
        updateVisible(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            ...updated[updated.length - 1],
            message: input.message,
            source: input.source,
          };
          return updated;
        });
        return;
      }

      // Enqueue the new step and start the reveal pump
      pending.push(makeStep(input));
      ensureRevealPump();
    },
    [startElapsedTimer, ensureRevealPump, updateVisible],
  );

  // ── Finish thinking ─────────────────────────────────────────

  const finish = useCallback(() => {
    finishRequestedRef.current = true;

    if (pendingRef.current.length > 0) {
      // Let the reveal pump drain remaining steps first (use burst speed)
      if (!revealTimerRef.current) {
        const delay = getRevealDelay(pendingRef.current.length);
        revealTimerRef.current = setTimeout(revealNext, delay);
      }
      return;
    }

    // No pending steps — finish now
    markDone();
  }, [revealNext, markDone]);

  // ── Reset ───────────────────────────────────────────────────

  const reset = useCallback(() => {
    pendingRef.current = [];
    visibleRef.current = [];
    finishRequestedRef.current = false;
    isActiveRef.current = false;

    if (revealTimerRef.current) {
      clearTimeout(revealTimerRef.current);
      revealTimerRef.current = null;
    }
    stopElapsedTimer();

    setVisibleSteps([]);
    setIsActive(false);
    setIsDone(false);
    setElapsedSeconds(0);
    startTimeRef.current = null;
  }, [stopElapsedTimer]);

  // ── Cleanup on unmount ──────────────────────────────────────

  useEffect(() => {
    return () => {
      if (revealTimerRef.current) clearTimeout(revealTimerRef.current);
      if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
    };
  }, []);

  return {
    steps: visibleSteps,
    isActive,
    isDone,
    elapsedSeconds,
    push,
    finish,
    reset,
  };
}
