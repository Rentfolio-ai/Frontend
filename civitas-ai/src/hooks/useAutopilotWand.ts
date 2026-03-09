import { useState, useCallback, useRef, useEffect } from 'react';
import { autopilotService } from '../services/autopilotApi';
import type { TabType, AgentMode } from './useDesktopShell';
import type { Message } from '../types/chat';
import type { AppSnapshot } from './useAppStateBridge';

// ── Types ────────────────────────────────────────────────────────────

export type WandStatus =
  | 'idle'
  | 'observing'
  | 'deciding'
  | 'acting'
  | 'waiting'
  | 'verifying'
  | 'paused'
  | 'done'
  | 'ready';  // wand is on, waiting for next goal

export interface WandState {
  isActive: boolean;
  status: WandStatus;
  currentStep: number;
  estimatedTotal: number;
  wandMessage: string;       // text being typed into composer
  statusText: string;        // current action explanation
  goal: string;
  confidence: number;
  targetElementId: string | null;
}

interface ActionHistoryEntry {
  action: string;
  params: Record<string, any>;
  result: 'success' | 'failed';
  response_preview?: string;
}

interface UseAutopilotWandOptions {
  userId: string;
  mode: AgentMode;
  sendMessage: (message: string) => void;
  setActiveTab: (tab: TabType) => void;
  setCurrentMode: (mode: AgentMode) => void;
  handleNewChat: () => void;
  isStreaming: boolean;
  messages: Message[];
  bookmarkCount: number;
  getSnapshot: () => AppSnapshot;
  getUserPreferences: () => Record<string, any>;

  // Tier 4: Read local state (no API calls)
  readDeals?: () => { total: number; active: number; under_contract: number; closed: number; deals: Array<{ name: string; price: number; status: string }> };
  readPortfolio?: () => { totalValue: number; cashflow: number; capRate: number; propertyCount: number };
  savedReports?: Array<{ report_id: string; property_address: string; recommendation: string; report_type: string }>;
}

const TYPING_SPEED_MS = 30;
const MAX_STEPS = 20;

// ── Hook ─────────────────────────────────────────────────────────────

export function useAutopilotWand({
  userId,
  mode,
  sendMessage,
  setActiveTab,
  setCurrentMode,
  handleNewChat,
  isStreaming,
  messages,
  bookmarkCount: _bookmarkCount,
  getSnapshot,
  getUserPreferences,
  // Tier 4: Read local state
  readDeals: readDealsFn,
  readPortfolio: readPortfolioFn,
  savedReports,
}: UseAutopilotWandOptions) {
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState<WandStatus>('idle');
  const [currentStep, setCurrentStep] = useState(0);
  const [estimatedTotal, setEstimatedTotal] = useState(0);
  const [wandMessage, setWandMessage] = useState('');
  const [statusText, setStatusText] = useState('');
  const [goal, setGoal] = useState('');
  const [confidence, setConfidence] = useState(1);
  const [targetElementId, setTargetElementId] = useState<string | null>(null);

  const abortRef = useRef(false);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loopRunningRef = useRef(false);
  const streamingResolveRef = useRef<(() => void) | null>(null);
  const prevStreamingRef = useRef(false);

  // ── Refs for latest values (avoid stale closures) ──────────────
  const isStreamingRef = useRef(isStreaming);
  const messagesRef = useRef(messages);
  const modeRef = useRef(mode);

  useEffect(() => { isStreamingRef.current = isStreaming; }, [isStreaming]);
  useEffect(() => { messagesRef.current = messages; }, [messages]);
  useEffect(() => { modeRef.current = mode; }, [mode]);

  // Resolve the wait_response promise when streaming finishes
  useEffect(() => {
    if (prevStreamingRef.current && !isStreaming && streamingResolveRef.current) {
      const resolve = streamingResolveRef.current;
      streamingResolveRef.current = null;
      // Small delay so the final message renders
      setTimeout(resolve, 500);
    }
    prevStreamingRef.current = isStreaming;
  }, [isStreaming]);

  // ── Helpers ──────────────────────────────────────────────────────

  const cleanup = useCallback(() => {
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = null;
    streamingResolveRef.current = null;
    loopRunningRef.current = false;
  }, []);

  const deactivate = useCallback(() => {
    abortRef.current = true;
    cleanup();
    setIsActive(false);
    setStatus('idle');
    setCurrentStep(0);
    setEstimatedTotal(0);
    setWandMessage('');
    setStatusText('');
    setGoal('');
    setConfidence(1);
    setTargetElementId(null);
  }, [cleanup]);

  // Animated typing into composer
  const typeText = useCallback((text: string): Promise<void> => {
    return new Promise((resolve) => {
      let i = 0;
      setWandMessage('');

      const typeNext = () => {
        if (abortRef.current) { resolve(); return; }
        if (i < text.length) {
          setWandMessage(text.slice(0, i + 1));
          i++;
          typingTimerRef.current = setTimeout(typeNext, TYPING_SPEED_MS);
        } else {
          resolve();
        }
      };
      typeNext();
    });
  }, []);

  // Wait for AI response to finish streaming (reads ref, not closure)
  const waitForResponse = useCallback((): Promise<void> => {
    return new Promise((resolve) => {
      // Phase 1: wait for streaming to START (up to 8s)
      let startChecks = 0;
      const maxStartChecks = 80; // 8 seconds

      const waitForStart = setInterval(() => {
        if (abortRef.current) { clearInterval(waitForStart); resolve(); return; }
        startChecks++;
        if (isStreamingRef.current) {
          clearInterval(waitForStart);
          // Phase 2: wait for streaming to END
          streamingResolveRef.current = resolve;
        } else if (startChecks > maxStartChecks) {
          clearInterval(waitForStart);
          // Check if messages appeared while we waited (response already came)
          const msgs = messagesRef.current;
          const hasAssistant = msgs.some(m => m.role === 'assistant' && m.content);
          if (hasAssistant) {
            resolve(); // Response already arrived
          } else {
            console.warn('[Wand] waitForResponse: streaming never started after 8s');
            resolve();
          }
        }
      }, 100);
    });
  }, []);

  // Get last assistant message preview (reads ref, not closure)
  const getLastResponse = useCallback((): string => {
    const msgs = messagesRef.current;
    for (let i = msgs.length - 1; i >= 0; i--) {
      if (msgs[i].role === 'assistant' && msgs[i].content) {
        return msgs[i].content.slice(0, 500);
      }
    }
    return '';
  }, []);

  // ── Action Executor ─────────────────────────────────────────────

  const executeAction = useCallback(async (
    action: string,
    params: Record<string, any>,
  ): Promise<{ success: boolean; responsePreview?: string }> => {
    console.log(`[Wand] Executing: ${action}`, params);

    switch (action) {
      case 'navigate': {
        const tab = params.tab as TabType;
        if (tab) setActiveTab(tab);
        await new Promise(r => setTimeout(r, 600));
        return { success: true };
      }

      case 'set_mode': {
        const newMode = params.mode as AgentMode;
        if (newMode) setCurrentMode(newMode);
        await new Promise(r => setTimeout(r, 400));
        return { success: true };
      }

      case 'type_and_send': {
        const text = params.text as string;
        if (!text) return { success: false };
        setStatus('acting');
        await typeText(text);
        if (abortRef.current) return { success: false };
        // Send the message — don't wait for response here;
        // LLM will issue wait_response + read_response as separate steps
        await new Promise(r => setTimeout(r, 200));
        sendMessage(text);
        setWandMessage('');
        await new Promise(r => setTimeout(r, 500));
        return { success: true };
      }

      case 'type_composer': {
        const text = params.text as string;
        if (!text) return { success: false };
        await typeText(text);
        return { success: true };
      }

      case 'send_message': {
        const composerText = wandMessage || '';
        if (composerText) {
          sendMessage(composerText);
          setWandMessage('');
        }
        return { success: true };
      }

      case 'wait_response': {
        setStatus('waiting');
        setStatusText('Waiting for AI response...');
        await waitForResponse();
        return { success: true, responsePreview: getLastResponse() };
      }

      case 'read_response': {
        const preview = getLastResponse();
        return { success: !!preview, responsePreview: preview };
      }

      case 'read_state': {
        // Observe step — no side effects
        return { success: true };
      }

      case 'new_chat': {
        handleNewChat();
        await new Promise(r => setTimeout(r, 400));
        return { success: true };
      }

      case 'click_element': {
        const elId = params.element_id as string;
        if (!elId) return { success: false };
        try {
          const el = document.querySelector(`[data-wand-id="${elId}"]`) as HTMLElement;
          if (el) {
            el.click();
            await new Promise(r => setTimeout(r, 400));
            return { success: true };
          }
        } catch { /* ignore */ }
        return { success: false };
      }

      case 'scroll': {
        const dir = params.direction === 'up' ? -300 : 300;
        const scrollEl = document.querySelector('[data-wand-id="message-list"]') ||
                         document.querySelector('.overflow-y-auto');
        if (scrollEl) scrollEl.scrollTop += dir;
        await new Promise(r => setTimeout(r, 300));
        return { success: true };
      }

      case 'pause': {
        setStatus('paused');
        setStatusText(params.message || 'Paused');
        await new Promise(r => setTimeout(r, 4000));
        return { success: true };
      }

      case 'done': {
        setStatusText(params.summary || 'Complete');
        return { success: true };
      }

      // ── Tier 4: Read Local State (no API calls) ────────────────

      case 'read_deals': {
        if (!readDealsFn) return { success: false };
        const deals = readDealsFn();
        const preview = `${deals.total} deals (${deals.active} active, ${deals.under_contract} under contract, ${deals.closed} closed)\n` +
          deals.deals.slice(0, 5).map(d => `• ${d.name} — $${d.price.toLocaleString()} [${d.status}]`).join('\n');
        return { success: true, responsePreview: preview };
      }

      case 'read_portfolio': {
        if (!readPortfolioFn) return { success: false };
        const pf = readPortfolioFn();
        const preview = `Portfolio: ${pf.propertyCount} properties, $${pf.totalValue.toLocaleString()} total value, $${pf.cashflow.toLocaleString()}/mo cashflow, ${pf.capRate.toFixed(1)}% cap rate`;
        return { success: true, responsePreview: preview };
      }

      case 'read_reports': {
        if (!savedReports?.length) return { success: false, responsePreview: 'No saved reports' };
        const preview = savedReports.slice(0, 5).map(r =>
          `• ${r.property_address} — ${r.report_type} — ${r.recommendation}`
        ).join('\n');
        return { success: true, responsePreview: `${savedReports.length} reports:\n${preview}` };
      }

      // ── Tier 2: Form & Input Manipulation ─────────────────────

      case 'fill_input': {
        const elId = params.element_id as string;
        const value = params.value as string;
        if (!elId || value === undefined) return { success: false };
        try {
          const el = document.querySelector(`[data-wand-id="${elId}"]`) as HTMLInputElement | HTMLSelectElement | null;
          if (!el) return { success: false };
          // Set value and dispatch events so React picks it up
          const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
            el.tagName === 'SELECT' ? HTMLSelectElement.prototype : HTMLInputElement.prototype,
            'value'
          )?.set;
          if (nativeInputValueSetter) {
            nativeInputValueSetter.call(el, String(value));
          } else {
            el.value = String(value);
          }
          el.dispatchEvent(new Event('input', { bubbles: true }));
          el.dispatchEvent(new Event('change', { bubbles: true }));
          await new Promise(r => setTimeout(r, 200));
          return { success: true, responsePreview: `Set ${elId} = ${value}` };
        } catch {
          return { success: false };
        }
      }

      default:
        console.warn(`[Wand] Unknown action: ${action}`);
        return { success: false };
    }
  }, [setActiveTab, setCurrentMode, handleNewChat, sendMessage, typeText, waitForResponse, getLastResponse, wandMessage,
      readDealsFn, readPortfolioFn, savedReports]);

  // ── Main Loop ───────────────────────────────────────────────────

  const runLoop = useCallback(async (userGoal: string) => {
    if (loopRunningRef.current) return;
    loopRunningRef.current = true;

    const history: ActionHistoryEntry[] = [];
    let stepNum = 0;
    let hasReadResponse = false; // Track if we've read the AI response

    // Helper: finish the current task gracefully (wand stays on)
    const finishDone = async (summary: string) => {
      setStatus('done');
      setStatusText(summary);
      try {
        await autopilotService.recordLearning(
          userId, 'workflow',
          `Goal: "${userGoal}" — completed in ${stepNum + 1} steps. Actions: ${history.map(h => h.action).join(' → ')}`,
          'success',
          { goal: userGoal, steps: stepNum + 1 },
        );
      } catch { /* non-critical */ }
      // Transition to 'ready' after showing done status — wand stays active
      setTimeout(() => {
        if (!abortRef.current) {
          setStatus('ready');
          setStatusText('Ready for next task');
          setGoal('');
          setWandMessage('');
          setTargetElementId(null);
        }
      }, 3000);
    };

    while (stepNum < MAX_STEPS && !abortRef.current) {
      // OBSERVE
      setStatus('observing');
      setStatusText('Reading app state...');
      const snapshot = getSnapshot();

      // DECIDE
      setStatus('deciding');
      setStatusText('Deciding next action...');
      setCurrentStep(stepNum);

      let decision;
      try {
        decision = await autopilotService.getNextAction(
          userId,
          userGoal,
          stepNum,
          snapshot,
          history,
          getUserPreferences(),
        );
      } catch (err) {
        console.error('[Wand] Decision failed:', err);
        setStatus('paused');
        setStatusText('Connection error — retrying...');
        await new Promise(r => setTimeout(r, 2000));
        if (abortRef.current) break;
        // Retry once
        try {
          decision = await autopilotService.getNextAction(
            userId, userGoal, stepNum, snapshot, history, getUserPreferences(),
          );
        } catch {
          setStatusText('Failed to get next action');
          await new Promise(r => setTimeout(r, 2000));
          break;
        }
      }

      if (abortRef.current) break;

      console.log(`[Wand] Step ${stepNum}: ${decision.action}`, decision);

      setConfidence(decision.confidence);
      setEstimatedTotal(stepNum + decision.estimated_remaining + 1);
      setTargetElementId(decision.target_element_id || null);
      setStatusText(decision.reason || decision.action);

      // Done check
      if (decision.done || decision.action === 'done') {
        await finishDone(decision.params?.summary || decision.reason || 'Goal complete');
        break;
      }

      // Stuck-loop detection: same action 3+ times in a row
      if (history.length >= 2) {
        const tail = history.slice(-2);
        if (tail.every(h => h.action === decision.action)) {
          console.warn(`[Wand] Stuck loop detected: "${decision.action}" repeated 3x`);
          await finishDone(decision.reason || 'Completed — no further actions needed');
          break;
        }
      }

      // If we already read the response and the LLM still isn't done, force finish
      if (hasReadResponse && decision.action !== 'done' && decision.action !== 'scroll') {
        // LLM should have issued done after read_response — force it
        console.warn('[Wand] Post-read_response: LLM did not issue done, forcing completion');
        const lastPreview = getLastResponse();
        await finishDone(lastPreview ? lastPreview.slice(0, 200) : decision.reason || 'Response received');
        break;
      }

      // Confidence gate
      if (decision.confidence < 0.5) {
        setStatus('paused');
        setStatusText(`Low confidence: ${decision.reason}. Pausing...`);
        await new Promise(r => setTimeout(r, 5000));
        if (abortRef.current) break;
      }

      // ACT
      setStatus('acting');
      const result = await executeAction(decision.action, decision.params);

      if (abortRef.current) break;

      // Track if we've read the AI response
      if (decision.action === 'read_response' && result.success) {
        hasReadResponse = true;
      }

      // Record in history
      const entry: ActionHistoryEntry = {
        action: decision.action,
        params: decision.params,
        result: result.success ? 'success' : 'failed',
      };
      if (result.responsePreview) {
        entry.response_preview = result.responsePreview;
      }
      history.push(entry);

      // VERIFY
      setStatus('verifying');
      const totalFailCount = history.filter(h => h.result === 'failed').length;
      // Check consecutive failures of the same action
      const lastFails = history.slice(-2);
      const consecutiveSameFail = lastFails.length >= 2 &&
        lastFails.every(h => h.result === 'failed' && h.action === decision.action);
      if (consecutiveSameFail || (!result.success && totalFailCount >= 3)) {
        setStatus('paused');
        setStatusText('Too many failed actions — try a different goal');
        try {
          await autopilotService.recordLearning(
            userId, 'error_recovery',
            `Goal: "${userGoal}" — failed after ${stepNum + 1} steps. Last failed action: ${decision.action}`,
            'failed',
            { goal: userGoal, history },
          );
        } catch { /* non-critical */ }
        // Transition to ready — wand stays active
        setTimeout(() => {
          if (!abortRef.current) {
            setStatus('ready');
            setStatusText('Ready for next task');
            setGoal('');
            setWandMessage('');
            setTargetElementId(null);
          }
        }, 3000);
        break;
      }

      stepNum++;

      // Brief pause between steps for visual effect
      await new Promise(r => setTimeout(r, 300));
    }

    loopRunningRef.current = false;
  }, [userId, getSnapshot, getUserPreferences, executeAction, deactivate]);

  // ── Public API ──────────────────────────────────────────────────

  const activate = useCallback(async (userGoal: string) => {
    console.log('[Wand] activate called', { userId, userGoal, mode });
    if (!userId) {
      console.warn('[Wand] No userId, aborting');
      return;
    }

    // If a loop is already running, abort it first
    if (loopRunningRef.current) {
      abortRef.current = true;
      // Wait for previous loop to wind down
      await new Promise(r => setTimeout(r, 500));
    }

    abortRef.current = false;
    setIsActive(true);
    setGoal(userGoal);
    setStatus('acting');
    setStatusText('Setting goal...');
    setCurrentStep(0);
    setEstimatedTotal(0);
    setWandMessage('');
    setTargetElementId(null);

    // Visually type the goal into the composer so user sees what's happening
    await typeText(userGoal);
    if (abortRef.current) return;
    await new Promise(r => setTimeout(r, 600));
    setWandMessage('');

    // Start the observe→decide→act→verify loop
    setStatus('observing');
    setStatusText('Starting wand...');
    runLoop(userGoal);
  }, [userId, mode, runLoop]);

  const state: WandState = {
    isActive,
    status,
    currentStep,
    estimatedTotal,
    wandMessage,
    statusText,
    goal,
    confidence,
    targetElementId,
  };

  return {
    wand: state,
    activateWand: activate,
    deactivateWand: deactivate,
  };
}
