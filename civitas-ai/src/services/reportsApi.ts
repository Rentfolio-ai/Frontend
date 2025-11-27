// FILE: src/services/reportsApi.ts
// API service for fetching and managing reports from the backend
// Based on /api/v1/reports/ endpoints

import { logger } from '../utils/logger';

const CIVITAS_API_BASE = import.meta.env.VITE_CIVITAS_API_URL || 'http://localhost:8000';
const API_BASE = `${CIVITAS_API_BASE}/api/reports`;
const CIVITAS_API_KEY = import.meta.env.VITE_API_KEY;

// ═══════════════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════════════

export interface ReportKeyMetrics {
  monthly_cash_flow: number;
  cap_rate: number;
  cash_on_cash: number;
  dscr: number;
}

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

export interface ReportListResponse {
  reports: ReportSummary[];
  total: number;
}

export interface ReportDetail extends ReportSummary {
  html_content: string;
  metadata: {
    narrative_summary?: string;
    pros?: string[];
    risk_factors?: string[];
    cons?: string[];
  };
}

export interface DeleteReportResponse {
  success: boolean;
  message: string;
}

// Tool result from generate_report in chat response
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

// ═══════════════════════════════════════════════════════════════════════════════
// Helper
// ═══════════════════════════════════════════════════════════════════════════════

function getHeaders(): HeadersInit {
  return {
    'Content-Type': 'application/json',
    ...(CIVITAS_API_KEY ? { 'X-API-Key': CIVITAS_API_KEY } : {}),
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// Service
// ═══════════════════════════════════════════════════════════════════════════════

export const reportsService = {
  /**
   * List all reports, optionally filtered by thread
   */
  list: async (threadId?: string, limit = 50): Promise<ReportListResponse> => {
    const params = new URLSearchParams();
    if (threadId) params.set('thread_id', threadId);
    if (limit) params.set('limit', String(limit));
    
    const url = `${API_BASE}/?${params}`;
    logger.info('[reportsApi] Listing reports', { url });
    
    const res = await fetch(url, { headers: getHeaders() });
    if (!res.ok) {
      logger.error('[reportsApi] Failed to fetch reports', { status: res.status });
      throw new Error('Failed to fetch reports');
    }
    
    const data = await res.json();
    logger.info('[reportsApi] Reports fetched', { total: data.total });
    return data;
  },

  /**
   * Get single report with full details and HTML content
   */
  get: async (reportId: string): Promise<ReportDetail> => {
    logger.info('[reportsApi] Fetching report', { reportId });
    
    const res = await fetch(`${API_BASE}/${reportId}`, { headers: getHeaders() });
    if (!res.ok) {
      logger.error('[reportsApi] Report not found', { reportId, status: res.status });
      throw new Error('Report not found');
    }
    
    return res.json();
  },

  /**
   * Get URL for rendering report HTML in iframe
   * This returns the direct URL - the browser will fetch HTML content
   */
  getHtmlUrl: (reportId: string): string => {
    return `${API_BASE}/${reportId}/html`;
  },

  /**
   * Delete a report permanently
   */
  delete: async (reportId: string): Promise<DeleteReportResponse> => {
    logger.info('[reportsApi] Deleting report', { reportId });
    
    const res = await fetch(`${API_BASE}/${reportId}`, { 
      method: 'DELETE',
      headers: getHeaders(),
    });
    
    if (!res.ok) {
      logger.error('[reportsApi] Failed to delete report', { reportId, status: res.status });
      throw new Error('Failed to delete report');
    }
    
    logger.info('[reportsApi] Report deleted', { reportId });
    return res.json();
  },

  /**
   * Get all reports for a specific conversation thread
   */
  getByThread: async (threadId: string): Promise<ReportListResponse> => {
    logger.info('[reportsApi] Fetching reports for thread', { threadId });
    
    const res = await fetch(`${API_BASE}/thread/${threadId}`, { headers: getHeaders() });
    if (!res.ok) {
      logger.error('[reportsApi] Failed to fetch reports for thread', { threadId, status: res.status });
      throw new Error('Failed to fetch reports for thread');
    }
    
    return res.json();
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// Chat Response Handler
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Check if a chat response contains a newly generated report
 */
export function extractReportFromToolResults(toolResults: Array<{ tool_name: string; data: unknown }>): GenerateReportToolResult | null {
  const reportResult = toolResults.find(t => t.tool_name === 'generate_report');
  
  if (reportResult && reportResult.data) {
    return reportResult.data as GenerateReportToolResult;
  }
  return null;
}

// Legacy exports for backward compatibility
export async function fetchReportById(reportId: string): Promise<ReportDetail | null> {
  try {
    return await reportsService.get(reportId);
  } catch {
    return null;
  }
}

export async function fetchReportFromUrl(viewUrl: string): Promise<string | null> {
  try {
    const fullUrl = viewUrl.startsWith('http') ? viewUrl : `${CIVITAS_API_BASE}${viewUrl}`;
    const res = await fetch(fullUrl, { headers: getHeaders() });
    if (!res.ok) return null;
    
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('text/html')) {
      return await res.text();
    } else if (contentType.includes('application/json')) {
      const data = await res.json();
      return data.html_content || data.content || data.report || null;
    }
    return await res.text();
  } catch {
    return null;
  }
}

export async function listReports(options?: { limit?: number; threadId?: string }): Promise<ReportListResponse | null> {
  try {
    return await reportsService.list(options?.threadId, options?.limit);
  } catch {
    return null;
  }
}

export async function deleteReportById(reportId: string): Promise<boolean> {
  try {
    await reportsService.delete(reportId);
    return true;
  } catch {
    return false;
  }
}
