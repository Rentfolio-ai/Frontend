// FILE: src/types/stream.ts
/**
 * Types for SSE streaming events from /api/stream
 */

export interface StreamInitEvent {
  type: 'init';
  thread_id: string;
}

export interface StreamThinkingEvent {
  type: 'thinking';
  title?: string;        // Main action title (e.g., "Searching for properties")
  status: string;        // Status text (e.g., "Searching for properties...")
  explanation?: string;  // Why this is happening (e.g., "I need to find properties...")
  source?: string;
  icon?: string;
  tool?: string;
  filters_applied?: string[];  // Filters being applied (e.g., ["Max $400k", "Excluding HOA"])
  user_context?: {             // User preferences context
    budget_max?: number;
    dislikes?: string[];
    favorite_markets?: string[];
    strategy?: string;
  };
}

export interface StreamToolStartEvent {
  type: 'tool_start';
  title?: string;        // Main action title (e.g., "Analyzing market data")
  tool: string;
  thinking: string;      // Status text (e.g., "Analyzing market data...")
  explanation?: string;  // Why this is happening
  source?: string;
  icon?: string;
}

export interface StreamToolEndEvent {
  type: 'tool_end';
  tool: string;
  icon?: string;
  summary?: string;
  data?: any;
  reason?: string;       // Why no results (e.g., "No properties under $400k")
  suggestion?: string;   // What to try next (e.g., "Try increasing budget")
}

export interface StreamContentEvent {
  type: 'content';
  content: string;
}

export interface StreamAnswerDeltaEvent {
  type: 'answer.delta';
  content: string;
}

export interface StreamDoneEvent {
  type: 'done';
  thread_id?: string;
  duration_ms?: number;
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

export type StreamEvent =
  | StreamInitEvent
  | StreamThinkingEvent
  | StreamToolStartEvent
  | StreamToolEndEvent
  | StreamContentEvent
  | StreamAnswerDeltaEvent
  | StreamDoneEvent
  | StreamErrorEvent
  | StreamSuggestionsEvent
  | StreamContextAttributionEvent;

export interface ThinkingState {
  title?: string;        // Main action title (e.g., "Searching for properties")
  status: string;       // Status text (e.g., "Searching for properties...")
  explanation?: string; // Why this is happening (e.g., "I need to find properties...")
  source?: string;
  icon?: string;
  tool?: string;
  filtersApplied?: string[];  // Filters from backend (camelCase for frontend)
  userContext?: {              // User context from backend
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
  reason?: string;       // Why no results
  suggestion?: string;   // What to try next
}

export interface StreamState {
  thinking: ThinkingState | null;
  completedTools: CompletedTool[];
  content: string;
  isComplete: boolean;
  error: string | null;
  threadId: string | null;
  contextSources: string[];
}
