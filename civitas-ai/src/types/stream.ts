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

export type StreamEvent =
  | StreamInitEvent
  | StreamThinkingEvent
  | StreamToolStartEvent
  | StreamToolEndEvent
  | StreamContentEvent
  | StreamDoneEvent
  | StreamErrorEvent;

export interface ThinkingState {
  title?: string;        // Main action title (e.g., "Searching for properties")
  status: string;       // Status text (e.g., "Searching for properties...")
  explanation?: string; // Why this is happening (e.g., "I need to find properties...")
  source?: string;
  icon?: string;
  tool?: string;
}

export interface CompletedTool {
  tool: string;
  summary: string;
  icon: string;
  data?: any;
}

export interface StreamState {
  thinking: ThinkingState | null;
  completedTools: CompletedTool[];
  content: string;
  isComplete: boolean;
  error: string | null;
  threadId: string | null;
}
