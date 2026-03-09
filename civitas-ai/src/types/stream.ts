// FILE: src/types/stream.ts
/**
 * SSE streaming event types — 8 canonical event protocol.
 *
 * status  — stage label (understanding/gathering/analyzing/composing/refining)
 * tool    — tool execution bubble (running/done/error)
 * token   — append-only text delta
 * data    — structured payload (properties, rentals, mode switches, actions)
 * warning — non-fatal issue (timeouts, missing config)
 * final   — authoritative full text + tools (reconcile streamed deltas)
 * done    — end-of-stream marker with metadata
 * ping    — keepalive heartbeat
 *
 * Every event carries: seq, request_id, ts (stamped by SSE generator)
 */

import type { ClarificationRequest } from './chat';

// ── Base metadata stamped on every event ─────────────────────────

interface StreamEventBase {
  seq: number;
  request_id: string;
  ts: number;
}

// ── 8 Canonical Event Types ──────────────────────────────────────

export interface StreamStatusEvent extends StreamEventBase {
  type: 'status';
  stage: 'understanding' | 'gathering' | 'analyzing' | 'composing' | 'refining' | 'reasoning';
  label: string;
  source?: string;
  subtag?: string;
}

export interface StreamThinkingTokenEvent extends StreamEventBase {
  type: 'thinking_token';
  delta: string;
}

export interface StreamToolEvent extends StreamEventBase {
  type: 'tool';
  name: string;
  label: string;
  status: 'running' | 'done' | 'error';
  data?: any;
}

export interface StreamTokenEvent extends StreamEventBase {
  type: 'token';
  delta: string;
}

export interface StreamDataEvent extends StreamEventBase {
  type: 'data';
  kind: 'properties' | 'rentals' | 'mode_switched' | 'mode_suggestion'
      | 'confirm_action' | 'inline_actions' | 'confidence' | 'rewrite'
      | 'web_sources' | 'model_selected';
  payload: any;
}

export interface StreamWarningEvent extends StreamEventBase {
  type: 'warning';
  message: string;
  code?: string;
}

export interface StreamFinalEvent extends StreamEventBase {
  type: 'final';
  text: string;
  models_used?: string[];
}

export interface StreamDoneEventV2 extends StreamEventBase {
  type: 'done';
  models_used?: string[];
  duration_ms?: number;
  error?: string;
}

export interface StreamPingEvent extends StreamEventBase {
  type: 'ping';
}

// ── Legacy/backward-compat types (V1 endpoints) ─────────────────

export interface StreamInitEvent {
  type: 'init';
  thread_id: string;
}

export interface StreamThinkingEvent {
  type: 'thinking';
  title?: string;
  status?: string;
  message?: string;
  explanation?: string;
  replace?: boolean;
  source?: string;
  icon?: string;
  tool?: string;
  mode?: 'quick' | 'smart' | 'deep';
  stage?: string;
  duration_hint_ms?: number;
  progress?: number;
  step_number?: number;
  total_steps?: number;
  filters_applied?: string[];
  user_context?: {
    budget_max?: number;
    dislikes?: string[];
    favorite_markets?: string[];
    strategy?: string;
  };
}

export interface StreamToolStartEvent {
  type: 'tool_start';
  title?: string;
  tool: string;
  thinking: string;
  explanation?: string;
  source?: string;
  icon?: string;
}

export interface StreamToolEndEvent {
  type: 'tool_end';
  tool: string;
  icon?: string;
  summary?: string;
  data?: any;
  reason?: string;
  suggestion?: string;
}

export interface StreamContentEvent {
  type: 'content';
  content: string;
}

export interface StreamDoneEvent {
  type: 'done';
}

export interface StreamErrorEvent {
  type: 'error';
  error: string;
}

export interface StreamContextAttributionEvent {
  type: 'context_attribution';
  sources: string[];
}

export interface StreamSuggestionsEvent {
  type: 'suggestions';
  suggestions: any[];
}

export interface StreamCitationsEvent {
  type: 'citations';
  citations: any[];
  message_id?: string;
}

export interface StreamReasoningStepEvent {
  type: 'reasoning_step';
  step: {
    title: string;
    description: string;
    tool?: string;
    status: 'pending' | 'running' | 'complete' | 'error';
    confidence?: number;
  };
}

export interface StreamConfidenceEvent {
  type: 'confidence';
  score: number;
  message_id?: string;
}

export interface StreamDataSourcesEvent {
  type: 'data_sources';
  sources: Array<{
    source: string;
    dataCount?: number;
    status?: 'live' | 'cached' | 'recent';
  }>;
}

export interface StreamClarificationEvent {
  type: 'clarification_request';
  data: any;
}

export interface StreamPropertiesEvent {
  type: 'properties';
  top_picks?: any[];
  more_matches?: any[];
  properties: any[];
  total_found?: number;
  market_context?: any;
}

export interface StreamRentalsEvent {
  type: 'rentals';
  listings: any[];
  total_found?: number;
  sources?: string[];
}

export interface StreamAiChunkEvent {
  type: 'ai_chunk';
  text: string;
}

export interface StreamCompleteEvent {
  type: 'complete';
  message?: string;
}

export interface StreamClearContentEvent {
  type: 'clear_content';
}

export interface StreamToolsBatchStartEvent {
  type: 'tools_batch_start';
  tools: Array<{
    id: string;
    name: string;
    priority: 'high' | 'medium' | 'low';
    args?: any;
  }>;
}

export interface StreamToolResultEvent {
  type: 'tool_result';
  id: string;
  tool: string;
  data: any;
  priority: string;
}

export interface StreamInlineActionsEvent {
  type: 'inline_actions';
  actions: Array<{
    label: string;
    tool_name: string;
    arguments?: Record<string, unknown>;
    query?: string;
    target_mode?: 'hunter' | 'research' | 'strategist';
    style?: 'primary' | 'secondary' | 'danger';
  }>;
  context?: string;
}

export interface StreamModeSuggestionEvent {
  type: 'mode_suggestion';
  suggested_mode: 'hunter' | 'research' | 'strategist';
  reason: string;
  auto_query?: string;
}

export interface StreamModeHintEvent extends StreamEventBase {
  type: 'mode_hint';
  suggested_mode: 'hunter' | 'research' | 'strategist';
  reason: string;
}

export interface StreamModeSwitchedEvent {
  type: 'mode_switched';
  from_mode: 'hunter' | 'research' | 'strategist';
  to_mode: 'hunter' | 'research' | 'strategist';
  reason: string;
  auto_query?: string;
  confidence?: number;
}

// ── Unified streaming protocol events (Vercel AI SDK inspired) ──

export interface StreamModelSelectedEvent {
  type: 'model-selected';
  model_id: string;
  model_name: string;
  reason: string;
}

export interface StreamReasoningStartEvent {
  type: 'reasoning-start';
  subtag?: string;
  source?: string;
}

export interface StreamReasoningDeltaEvent {
  type: 'reasoning-delta';
  text: string;
  subtag?: string;
  source?: string;
}

export interface StreamReasoningEndEvent {
  type: 'reasoning-end';
  subtag?: string;
}

export interface StreamUnifiedToolStartEvent {
  type: 'tool-start';
  tool_name: string;
  label: string;
}

export interface StreamUnifiedToolProgressEvent {
  type: 'tool-progress';
  tool_name: string;
  label: string;
}

export interface StreamUnifiedToolEndEvent {
  type: 'tool-end';
  tool_name: string;
  label: string;
  result_summary?: string;
}

export interface StreamStepStartEvent {
  type: 'step-start';
  step_id?: string;
}

export interface StreamStepEndEvent {
  type: 'step-end';
  step_id?: string;
  duration_ms?: number;
}

// ── Union of all event types ─────────────────────────────────────

export type StreamEvent =
  // New canonical types
  | StreamStatusEvent
  | StreamThinkingTokenEvent
  | StreamToolEvent
  | StreamTokenEvent
  | StreamDataEvent
  | StreamWarningEvent
  | StreamFinalEvent
  | StreamDoneEventV2
  | StreamPingEvent
  // Unified streaming protocol (Vercel AI SDK inspired)
  | StreamModelSelectedEvent
  | StreamReasoningStartEvent
  | StreamReasoningDeltaEvent
  | StreamReasoningEndEvent
  | StreamUnifiedToolStartEvent
  | StreamUnifiedToolProgressEvent
  | StreamUnifiedToolEndEvent
  | StreamStepStartEvent
  | StreamStepEndEvent
  // Legacy types (V1 backward compat)
  | StreamInitEvent
  | StreamThinkingEvent
  | StreamToolStartEvent
  | StreamToolEndEvent
  | StreamContentEvent
  | StreamDoneEvent
  | StreamErrorEvent
  | StreamSuggestionsEvent
  | StreamContextAttributionEvent
  | StreamCitationsEvent
  | StreamReasoningStepEvent
  | StreamConfidenceEvent
  | StreamDataSourcesEvent
  | StreamClarificationEvent
  | StreamClearContentEvent
  | StreamPropertiesEvent
  | StreamRentalsEvent
  | StreamAiChunkEvent
  | StreamCompleteEvent
  | StreamToolsBatchStartEvent
  | StreamToolResultEvent
  | StreamInlineActionsEvent
  | StreamModeHintEvent
  | StreamModeSuggestionEvent
  | StreamModeSwitchedEvent;

// ── State interfaces ─────────────────────────────────────────────

export interface ThinkingState {
  title?: string;
  status: string;
  explanation?: string;
  source?: string;
  mode?: 'quick' | 'smart' | 'deep';
  icon?: string;
  tool?: string;
  stage?: string;
  durationHintMs?: number;
  progress?: number;
  filtersApplied?: string[];
  userContext?: {
    budgetMax?: number;
    dislikes?: string[];
    favoriteMarkets?: string[];
    strategy?: string;
  };
}

export interface CompletedTool {
  tool: string;
  summary: string;
  icon: string;
  data?: any;
  reason?: string;
  suggestion?: string;
}

export interface StreamState {
  thinking: ThinkingState | null;
  completedTools: CompletedTool[];
  content: string;
  isComplete: boolean;
  error: string | null;
  threadId: string | null;
  contextSources: string[];
  citations?: any[];
  reasoningSteps?: Array<{
    title: string;
    description: string;
    tool?: string;
    status: 'pending' | 'running' | 'complete' | 'error';
    confidence?: number;
  }>;
  confidence?: number;
  dataSources?: Array<{
    source: string;
    dataCount?: number;
    status?: 'live' | 'cached' | 'recent';
  }>;
  clarificationRequest?: ClarificationRequest;
  toolBatch?: ToolBatchItem[];
}

export interface ToolBatchItem {
  id: string;
  name: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'running' | 'complete';
  result?: any;
}
