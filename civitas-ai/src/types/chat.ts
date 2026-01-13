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
  | 'report';

export interface ToolCard {
  id: string;
  title: string;
  description: string;
  status: 'running' | 'completed' | 'error' | 'success' | 'warning';
  kind?: ToolKind;
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

export interface Message {
  id: string;
  content: string;
  role?: 'user' | 'assistant';
  type?: 'user' | 'assistant'; // For backward compatibility
  timestamp: string | Date;
  isStreaming?: boolean;
  assistantName?: string; // For voice sessions: "Vasthu live", regular chat: undefined
  attachment?: {
    name: string;
    type: string;
    url: string;
  };
  tools?: ToolCard[];
  action?: Action;
  summary_markdown?: string;
  contextSources?: string[]; // Badges for context attribution
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
