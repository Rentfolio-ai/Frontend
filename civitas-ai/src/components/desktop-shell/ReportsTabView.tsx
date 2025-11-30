// FILE: src/components/desktop-shell/ReportsTabView.tsx
// Reports tab view - fetches from backend API and displays HTML reports in iframe

import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { reportsService, type ReportSummary } from '@/services/reportsApi';

// Icons
const DocumentIcon = ({ className }: { className?: string }) => (
  <svg className={cn('w-5 h-5', className)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const TrashIcon = ({ className }: { className?: string }) => (
  <svg className={cn('w-4 h-4', className)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const CloseIcon = ({ className }: { className?: string }) => (
  <svg className={cn('w-5 h-5', className)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const PrintIcon = ({ className }: { className?: string }) => (
  <svg className={cn('w-4 h-4', className)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
  </svg>
);

const ExternalLinkIcon = ({ className }: { className?: string }) => (
  <svg className={cn('w-4 h-4', className)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
  </svg>
);

const RefreshIcon = ({ className }: { className?: string }) => (
  <svg className={cn('w-4 h-4', className)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const EmptyReportsIcon = ({ className }: { className?: string }) => (
  <svg className={cn('w-16 h-16', className)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const LoadingSpinner = ({ className }: { className?: string }) => (
  <svg className={cn('w-6 h-6 animate-spin', className)} fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
);

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const formatPercent = (value: number): string => {
  return `${(value * 100).toFixed(1)}%`;
};

const formatDate = (isoString: string): string => {
  return new Date(isoString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

// Recommendation badge colors
const getRecommendationStyle = (rec: string) => {
  switch (rec.toLowerCase()) {
    case 'buy':
      return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400';
    case 'pass':
      return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400';
    case 'negotiate':
      return 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400';
    default:
      return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
  }
};

// Report Viewer Modal - Uses iframe with backend HTML endpoint
interface ReportViewerModalProps {
  report: ReportSummary | null;
  onClose: () => void;
}

const ReportViewerModal: React.FC<ReportViewerModalProps> = ({ report, onClose }) => {
  const iframeRef = React.useRef<HTMLIFrameElement>(null);
  
  if (!report) return null;
  
  // Get the HTML URL from the reports service
  const htmlUrl = reportsService.getHtmlUrl(report.report_id);
  
  const handlePrint = () => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.print();
    }
  };
  
  const handleOpenNewTab = () => {
    window.open(htmlUrl, '_blank');
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-5xl max-h-[90vh] mx-4 bg-primary/10 dark:bg-slate-900 rounded-xl shadow-2xl overflow-hidden flex flex-col backdrop-blur-xl border border-primary/20">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-primary/20 dark:border-slate-700 bg-primary/8 dark:bg-slate-800/50 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <DocumentIcon className="w-5 h-5 text-blue-500" />
            <div>
              <h2 className="font-semibold text-slate-800 dark:text-slate-200">
                {report.report_type}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {report.property_address}
              </p>
            </div>
            <span className={cn(
              'px-2 py-0.5 rounded-full text-xs font-medium',
              getRecommendationStyle(report.recommendation)
            )}>
              {report.recommendation}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-400"
              title="Print report"
            >
              <PrintIcon />
            </button>
            <button
              onClick={handleOpenNewTab}
              className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-400"
              title="Open in new tab"
            >
              <ExternalLinkIcon />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-400"
              title="Close"
            >
              <CloseIcon />
            </button>
          </div>
        </div>
        
        {/* Report Content - iframe pointing to HTML endpoint */}
        <div className="flex-1 overflow-hidden">
          <iframe
            ref={iframeRef}
            src={htmlUrl}
            className="w-full h-full min-h-[600px] border-0 bg-primary/5"
            title={report.report_type}
          />
        </div>
      </div>
    </div>
  );
};

// Report Card Component
interface ReportCardProps {
  report: ReportSummary;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

const ReportCard: React.FC<ReportCardProps> = ({ report, isSelected, onSelect, onDelete }) => {
  const hasMetrics = report.key_metrics !== undefined;
  const cashFlowPositive = hasMetrics && report.key_metrics.monthly_cash_flow > 0;
  
  return (
    <div 
      className={cn(
        'group bg-primary/10 dark:bg-slate-800/50 rounded-xl border border-primary/20 p-4 hover:shadow-lg hover:bg-primary/15 transition-all cursor-pointer backdrop-blur-sm',
        isSelected 
          ? 'border-blue-500 ring-2 ring-blue-500/20' 
          : 'border-slate-200 dark:border-slate-700 hover:border-blue-300'
      )}
      onClick={onSelect}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <DocumentIcon className="w-5 h-5 text-blue-500" />
          <div>
            <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
              {report.report_type}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
              {report.property_address}
            </p>
          </div>
        </div>
        <span className={cn(
          'px-2 py-0.5 rounded-full text-xs font-medium',
          getRecommendationStyle(report.recommendation)
        )}>
          {report.recommendation}
        </span>
      </div>
      
      {/* Key Metrics */}
      {hasMetrics && (
        <div className="grid grid-cols-4 gap-2 mb-3">
          <div className="text-center p-2 rounded bg-slate-50 dark:bg-slate-800">
            <div className={cn(
              'text-sm font-semibold',
              cashFlowPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
            )}>
              {formatCurrency(report.key_metrics.monthly_cash_flow)}
            </div>
            <div className="text-[10px] text-slate-500 uppercase">CF/mo</div>
          </div>
          <div className="text-center p-2 rounded bg-slate-50 dark:bg-slate-800">
            <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {formatPercent(report.key_metrics.cap_rate)}
            </div>
            <div className="text-[10px] text-slate-500 uppercase">Cap</div>
          </div>
          <div className="text-center p-2 rounded bg-slate-50 dark:bg-slate-800">
            <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {formatPercent(report.key_metrics.cash_on_cash)}
            </div>
            <div className="text-[10px] text-slate-500 uppercase">CoC</div>
          </div>
          <div className="text-center p-2 rounded bg-slate-50 dark:bg-slate-800">
            <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {report.key_metrics.dscr.toFixed(2)}
            </div>
            <div className="text-[10px] text-slate-500 uppercase">DSCR</div>
          </div>
        </div>
      )}
      
      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700">
        <div className="text-xs text-slate-400">
          {formatDate(report.created_at)}
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
          title="Delete report"
        >
          <TrashIcon />
        </button>
      </div>
    </div>
  );
};

// Main Component Props
export interface ReportsTabViewProps {
  // Legacy props - no longer needed, component fetches from API
  reports?: unknown[];
  onDeleteReport?: (id: string) => void;
}

export const ReportsTabView: React.FC<ReportsTabViewProps> = () => {
  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<ReportSummary | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  
  // Fetch reports from backend
  const loadReports = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await reportsService.list();
      setReports(data.reports);
    } catch (err) {
      console.error('[ReportsTabView] Failed to load reports:', err);
      setError('Failed to load reports');
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Load on mount
  useEffect(() => {
    loadReports();
  }, [loadReports]);
  
  // Handle delete
  const handleDelete = async (reportId: string) => {
    if (confirmDelete === reportId) {
      try {
        await reportsService.delete(reportId);
        setReports(prev => prev.filter(r => r.report_id !== reportId));
        if (selectedReport?.report_id === reportId) {
          setSelectedReport(null);
        }
      } catch (err) {
        console.error('[ReportsTabView] Failed to delete report:', err);
      }
      setConfirmDelete(null);
    } else {
      setConfirmDelete(reportId);
      setTimeout(() => setConfirmDelete(null), 3000);
    }
  };
  
  // Group reports by property
  const reportsByProperty = React.useMemo(() => {
    const grouped: Record<string, ReportSummary[]> = {};
    reports.forEach(report => {
      const key = report.property_address;
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(report);
    });
    return grouped;
  }, [reports]);
  
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 px-8 pt-6 pb-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                Saved Reports
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {isLoading ? 'Loading...' : `${reports.length} report${reports.length !== 1 ? 's' : ''} saved`}
              </p>
            </div>
            <button
              onClick={loadReports}
              disabled={isLoading}
              className={cn(
                'p-2 rounded-lg transition-colors',
                'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700',
                'text-slate-600 dark:text-slate-400',
                isLoading && 'opacity-50 cursor-not-allowed'
              )}
              title="Refresh reports"
            >
              <RefreshIcon className={isLoading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-y-auto px-8 pb-8">
        <div className="max-w-4xl mx-auto">
          {/* Loading State */}
          {isLoading && reports.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16">
              <LoadingSpinner className="text-blue-500 mb-4" />
              <p className="text-sm text-slate-500">Loading reports...</p>
            </div>
          )}
          
          {/* Error State */}
          {error && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <span className="text-red-500 text-2xl mb-4">⚠️</span>
              <h3 className="text-lg font-medium text-slate-600 dark:text-slate-400 mb-2">
                {error}
              </h3>
              <button
                onClick={loadReports}
                className="text-sm text-blue-500 hover:underline"
              >
                Try again
              </button>
            </div>
          )}
          
          {/* Empty State */}
          {!isLoading && !error && reports.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <EmptyReportsIcon className="text-slate-300 dark:text-slate-600 mb-4" />
              <h3 className="text-lg font-medium text-slate-600 dark:text-slate-400 mb-2">
                No saved reports yet
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-500 max-w-sm">
                Generate investment reports in chat and they'll appear here automatically.
              </p>
            </div>
          )}
          
          {/* Reports Grid */}
          {!isLoading && !error && reports.length > 0 && (
            <div className="space-y-6">
              {Object.entries(reportsByProperty).map(([address, propertyReports]) => (
                <div key={address}>
                  {/* Property Header (only show if multiple properties) */}
                  {Object.keys(reportsByProperty).length > 1 && (
                    <h2 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      {address}
                      <span className="text-slate-400 dark:text-slate-500">
                        ({propertyReports.length})
                      </span>
                    </h2>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {propertyReports.map(report => (
                      <ReportCard
                        key={report.report_id}
                        report={report}
                        isSelected={selectedReport?.report_id === report.report_id}
                        onSelect={() => setSelectedReport(report)}
                        onDelete={() => handleDelete(report.report_id)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Report Viewer Modal */}
      <ReportViewerModal
        report={selectedReport}
        onClose={() => setSelectedReport(null)}
      />
    </div>
  );
};
