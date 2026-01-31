// FILE: src/types/stream.ts
/**
 * Types for SSE streaming events from /api/stream
 */

import type { ClarificationRequest } from './chat';

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
  mode?: 'quick' | 'smart' | 'deep';  // Reasoning mode from backend
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

// 🚀 NEW: Citations event
export interface StreamCitationsEvent {
  type: 'citations';
  citations: any[];
  message_id?: string;
}

// 🚀 NEW: Reasoning step event
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

// 🚀 NEW: Confidence event
export interface StreamConfidenceEvent {
  type: 'confidence';
  score: number;
  message_id?: string;
}

// 🚀 NEW: Data sources event
export interface StreamDataSourcesEvent {
  type: 'data_sources';
  sources: Array<{
    source: string;
    dataCount?: number;
    status?: 'live' | 'cached' | 'recent';
  }>;
}

// 🚀 NEW: Clarification event
export interface StreamClarificationEvent {
  type: 'clarification_request';
  data: any; // Raw tool output
}

export type StreamEvent =
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
  | StreamDataSourcesEvent
  | StreamClarificationEvent
  | StreamClearContentEvent;

export interface StreamClearContentEvent {
  type: 'clear_content';
}

export interface ThinkingState {
  title?: string;        // Main action title (e.g., "Searching for properties")
  status: string;       // Status text (e.g., "Searching for properties...")
  explanation?: string; // Why this is happening (e.g., "I need to find properties...")
  source?: string;
  mode?: 'quick' | 'smart' | 'deep';  // Reasoning mode from backend
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
  // 🚀 NEW: Week 1 & 2 + Citations
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
}
