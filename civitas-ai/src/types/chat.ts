// FILE: src/types/chat.ts
import type { PresentationBundle } from './pnl';
import type { ComplianceResult } from './compliance';

// Tool kinds for discriminated union pattern
// Maps to backend tool_name values and frontend card components
export type ToolKind =
  // Legacy/generic kinds
  | 'roi_analysis'
  | 'market_data'
  | 'property_comparison'
  | 'property_comparison_table'  // compare_properties tool output
  | 'alert'
  | 'deal_analyzer'
  | 'compliance_check'
  | 'valuation'
  | 'generated_report'  // generate_report tool output
  | 'generic'
  // New backend tool kinds
  | 'portfolio_analysis'
  | 'cashflow_timeseries'
  | 'renovation_analysis'
  | 'renovation_analysis'
  | 'report'
  | 'scout_properties';

export interface Citation {
  id: number;
  title: string;
  url?: string;
  source: string;
  snippet?: string;
  publishedDate?: string;
  favicon?: string;
}

export type AgentMode = 'research' | 'strategist' | 'hunter';

export interface ClarificationQuestion {
  id: string;
  text: string;
  type: 'text' | 'number' | 'single_choice' | 'multiple_choice';
  options?: string[];
  default_value?: any;
  allow_multiple?: boolean;
}

export interface ClarificationRequest {
  type: 'clarification_request';
  questions: ClarificationQuestion[];
  reason: string;
  ui_component: 'ClarificationForm';
}

export interface ToolCard {
  id: string;
  title: string;
  description: string;
  status: 'running' | 'completed' | 'error' | 'success' | 'warning';
  kind?: ToolKind;
  priority?: 'high' | 'medium' | 'low';
  data?: any;
}

export interface ActionOption {
  label: string;
  action: string;
}

export interface Action {
  type: 'confirm';
  message: string;
  options: ActionOption[];
  context?: {
    action_type: string;
    query: string;
    [key: string]: any;
  };
}

export interface InlineAction {
  label: string;
  tool_name: string;
  arguments?: any;
  query?: string;  // Pre-built contextual query (sent instead of label when clicked)
  target_mode?: 'hunter' | 'research' | 'strategist';  // Mode to switch to before executing
  style?: 'primary' | 'secondary' | 'danger';
}

export interface Message {
  id: string;
  content: string;
  role?: 'user' | 'assistant';
  type?: 'user' | 'assistant'; // For backward compatibility
  timestamp: string | Date;
  isStreaming?: boolean;
  attachment?: {
    name: string;
    type: string;
    url: string;
  };
  tools?: ToolCard[];
  action?: Action;
  inlineActions?: InlineAction[]; // structured next steps from suggest_actions tool
  summary_markdown?: string;
  contextSources?: string[]; // Badges for context attribution
  citations?: Citation[];
  /** Persisted AI reasoning trace (populated after stream completes) */
  thinkingTrace?: {
    steps: { text: string; source: string }[];
    durationMs: number;
    toolsUsed: string[];
  };
  /** Mode switch suggestion from AI (e.g. research → hunter) */
  modeSuggestion?: {
    suggestedMode: string;
    reason: string;
    autoQuery: string;
  };
  data?: {
    presentation?: PresentationBundle;
    compliance?: ComplianceResult;
    [key: string]: any;
    tool_results?: any;
    suggestions?: (string | { id: string; label: string; query: string; icon?: string; category?: 'action' | 'analysis' | 'info' })[];
    branching?: {
      currentVersion: number;
      versions: {
        timestamp: string | Date;
        content: string;
        subsequentMessages: Message[];
      }[];
    };
  };
}
