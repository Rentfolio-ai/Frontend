export type ToolResultStatus = 'success' | 'warning' | 'error';

export interface ToolResultRecord {
  id?: string;
  tool_name: string;
  title?: string;
  summary?: string;
  inputs: Record<string, unknown>;
  output?: Record<string, unknown>;  // Tool output (varies by tool)
  timestamp: string;
  status?: ToolResultStatus;
  kind?: string;
  data?: unknown;
}
