// FILE: src/types/reports.ts
// Type definitions for reports - aligned with backend API schema

export interface ReportKeyMetrics {
  monthly_cash_flow: number;
  cap_rate: number;
  cash_on_cash: number;
  dscr: number;
}

// Report summary returned from list endpoint
export interface ReportSummary {
  report_id: string;
  thread_id: string | null;
  property_address: string;
  report_type: string;
  recommendation: string;
  key_metrics: ReportKeyMetrics;
  created_at: string;
  view_url: string;
}

// Full report detail with HTML content
export interface ReportDetail extends ReportSummary {
  html_content: string;
  metadata: {
    narrative_summary?: string;
    pros?: string[];
    risk_factors?: string[];
    cons?: string[];
  };
}

// Response from list endpoint
export interface ReportListResponse {
  reports: ReportSummary[];
  total: number;
}

// Tool result from generate_report in chat
export interface GenerateReportToolResult {
  report_id: string;
  report_type: string;
  property_address: string;
  recommendation: string;
  key_metrics: ReportKeyMetrics;
  view_url: string;
  created_at: string;
  message: string;
}

// Delete response
export interface DeleteReportResponse {
  success: boolean;
  message: string;
}

// Legacy SavedReport type for backward compatibility
// Now reports are saved on backend, not localStorage
export interface SavedReport {
  id: string;
  report_id?: string;
  format: 'html' | 'text';
  report: string;
  report_type: string;
  property_address: string;
  recommendation: 'Buy' | 'Pass' | 'Negotiate';
  key_metrics?: ReportKeyMetrics;
  generated_at: string;
  saved_at: string;
  notes?: string;
  tags?: string[];
}

// Legacy state for localStorage (deprecated - now uses backend)
export interface SavedReportsState {
  reports: SavedReport[];
  lastUpdatedAt?: string;
}
