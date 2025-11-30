// FILE: src/hooks/useSavedReports.ts
// Hook for managing reports - now uses backend API instead of localStorage

import { useState, useEffect, useCallback } from 'react';
import { reportsService, type ReportSummary, type ReportListResponse } from '@/services/reportsApi';
import type { GenerateReportOutput } from '@/types/backendTools';

export interface UseSavedReportsReturn {
  // State
  reports: ReportSummary[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  refreshReports: () => Promise<void>;
  deleteReport: (reportId: string) => Promise<void>;
  
  // Queries
  getReportById: (reportId: string) => ReportSummary | undefined;
  getReportsByProperty: (address: string) => ReportSummary[];
  isReportSaved: (reportOutput: GenerateReportOutput) => boolean;
  
  // For backward compatibility - now a no-op since backend auto-saves
  saveReport: (reportOutput: GenerateReportOutput) => void;
}

export function useSavedReports(threadId?: string): UseSavedReportsReturn {
  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch reports from backend
  const refreshReports = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      let data: ReportListResponse;
      
      if (threadId) {
        data = await reportsService.getByThread(threadId);
      } else {
        data = await reportsService.list();
      }
      
      setReports(data.reports);
    } catch (err) {
      console.error('[useSavedReports] Failed to fetch reports:', err);
      setError('Failed to load reports');
      setReports([]);
    } finally {
      setIsLoading(false);
    }
  }, [threadId]);
  
  // Load reports on mount and when threadId changes
  useEffect(() => {
    refreshReports();
  }, [refreshReports]);
  
  // Delete a report
  const deleteReport = useCallback(async (reportId: string) => {
    try {
      await reportsService.delete(reportId);
      setReports(prev => prev.filter(r => r.report_id !== reportId));
    } catch (err) {
      console.error('[useSavedReports] Failed to delete report:', err);
      throw err;
    }
  }, []);
  
  // Get report by ID
  const getReportById = useCallback((reportId: string): ReportSummary | undefined => {
    return reports.find(r => r.report_id === reportId);
  }, [reports]);
  
  // Get reports by property address
  const getReportsByProperty = useCallback((address: string): ReportSummary[] => {
    const normalizedAddress = address.toLowerCase().trim();
    return reports.filter(r => 
      r.property_address.toLowerCase().includes(normalizedAddress)
    );
  }, [reports]);
  
  // Check if a report is saved (by report_id)
  const isReportSaved = useCallback((reportOutput: GenerateReportOutput): boolean => {
    if (!reportOutput.report_id) return false;
    return reports.some(r => r.report_id === reportOutput.report_id);
  }, [reports]);
  
  // No-op save - backend auto-saves reports when generated
  // This is kept for backward compatibility with existing components
  const saveReport = useCallback((_reportOutput: GenerateReportOutput) => {
    // Reports are automatically saved on backend when generated
    // Just refresh the list to show the new report
    refreshReports();
  }, [refreshReports]);
  
  return {
    reports,
    isLoading,
    error,
    refreshReports,
    deleteReport,
    getReportById,
    getReportsByProperty,
    isReportSaved,
    saveReport,
  };
}
