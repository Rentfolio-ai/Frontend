// FILE: src/components/desktop-shell/ReportsTabView.tsx
/**
 * Redesigned Reports Tab View with modern SaaS aesthetic
 * Matches Portfolio dashboard design with full-bleed layout
 */

import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Download, Eye, FileText, X } from 'lucide-react';
import { reportsService, type ReportSummary } from '@/services/reportsApi';
import { ReportCard } from '../reports/ReportCard';

// Report Viewer Modal
interface ReportViewerModalProps {
  report: ReportSummary | null;
  onClose: () => void;
}

const ReportViewerModal: React.FC<ReportViewerModalProps> = ({ report, onClose }) => {
  const iframeRef = React.useRef<HTMLIFrameElement>(null);
  const [htmlContent, setHtmlContent] = React.useState<string>('');
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Fetch HTML content when report changes
  React.useEffect(() => {
    if (!report) return;

    const fetchHtml = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(reportsService.getHtmlUrl(report.report_id).split('?')[0], {
          headers: {
            'X-API-Key': import.meta.env.VITE_API_KEY || '',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to load report');
        }

        const html = await response.text();
        setHtmlContent(html);
      } catch (err) {
        console.error('Failed to fetch report HTML:', err);
        setError('Failed to load report');
      } finally {
        setLoading(false);
      }
    };

    fetchHtml();
  }, [report]);

  if (!report) return null;

  const handlePrint = () => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.print();
    }
  };

  const handleOpenNewTab = () => {
    // Open in new window with the HTML content
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(htmlContent);
      newWindow.document.close();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-6xl max-h-[90vh] mx-4 rounded-xl overflow-hidden flex flex-col"
        style={{
          background: 'var(--color-bg-elevated)',
          border: '1px solid var(--color-border-default)',
          fontFamily: "'Inter', sans-serif"
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: '1px solid var(--color-border-default)' }}
        >
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5" style={{ color: 'var(--color-accent-teal-400)' }} />
            <div>
              <h2
                className="font-medium"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {report.report_type}
              </h2>
              <p
                className="text-sm"
                style={{ color: 'var(--color-text-tertiary)' }}
              >
                {report.property_address}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              disabled={loading}
              className="p-2 rounded-lg transition-colors"
              style={{
                background: 'var(--color-bg-tertiary)',
                border: '1px solid var(--color-border-default)',
                color: 'var(--color-text-secondary)',
                opacity: loading ? 0.5 : 1
              }}
              title="Print report"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={handleOpenNewTab}
              disabled={loading}
              className="p-2 rounded-lg transition-colors"
              style={{
                background: 'var(--color-bg-tertiary)',
                border: '1px solid var(--color-border-default)',
                color: 'var(--color-text-secondary)',
                opacity: loading ? 0.5 : 1
              }}
              title="Open in new tab"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg transition-colors"
              style={{
                background: 'var(--color-bg-tertiary)',
                border: '1px solid var(--color-border-default)',
                color: 'var(--color-text-secondary)'
              }}
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Report Content */}
        <div className="flex-1 overflow-hidden flex items-center justify-center">
          {loading && (
            <RefreshCw
              className="w-8 h-8 animate-spin"
              style={{ color: 'var(--color-accent-teal-400)' }}
            />
          )}

          {error && (
            <div className="text-center">
              <p style={{ color: 'var(--color-text-secondary)' }}>{error}</p>
            </div>
          )}

          {!loading && !error && htmlContent && (
            <iframe
              ref={iframeRef}
              srcDoc={htmlContent}
              className="w-full h-full min-h-[600px] border-0"
              title={report.report_type}
              style={{ background: 'var(--color-bg-primary)' }}
              sandbox="allow-same-origin allow-scripts"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export interface ReportsTabViewProps {
  reports?: unknown[];
  onDeleteReport?: (id: string) => void;
}

export const ReportsTabView: React.FC<ReportsTabViewProps> = () => {
  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<ReportSummary | null>(null);
  const [refreshing, setRefreshing] = useState(false);

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
      setRefreshing(false);
    }
  }, []);

  // Load on mount
  useEffect(() => {
    loadReports();
  }, [loadReports]);

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    loadReports();
  };

  // Handle delete
  const handleDelete = async (reportId: string) => {
    try {
      await reportsService.delete(reportId);
      setReports(prev => prev.filter(r => r.report_id !== reportId));
      if (selectedReport?.report_id === reportId) {
        setSelectedReport(null);
      }
    } catch (err) {
      console.error('[ReportsTabView] Failed to delete report:', err);
    }
  };

  // Convert report to ReportCard format
  const formatReportForCard = (report: ReportSummary) => {
    const stats = [];
    if (report.key_metrics) {
      stats.push(
        {
          label: 'Cash Flow',
          value: `$${Math.round(report.key_metrics.monthly_cash_flow).toLocaleString()}/mo`
        },
        {
          label: 'Cap Rate',
          value: `${(report.key_metrics.cap_rate * 100).toFixed(1)}%`
        }
      );
    }

    return {
      id: report.report_id,
      title: report.report_type,
      type: 'property' as const,
      date: new Date(report.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }),
      stats
    };
  };

  // Empty state
  if (!isLoading && !error && reports.length === 0) {
    return (
      <div
        className="h-full min-h-screen w-full flex flex-col"
        style={{
          background: 'var(--color-bg-primary)',
          fontFamily: "'Inter', sans-serif"
        }}
      >
        {/* Subtle gradient overlay */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: 'radial-gradient(circle at 50% 30%, rgba(20, 184, 166, 0.15), transparent 50%)'
          }}
        />

        {/* Content */}
        <div className="relative flex-1 flex items-center justify-center px-6">
          <div className="text-center max-w-md">
            {/* Icon */}
            <div
              className="w-16 h-16 mx-auto mb-6 rounded-xl flex items-center justify-center"
              style={{
                background: 'var(--color-accent-teal-500)',
                boxShadow: '0 4px 16px rgba(20, 184, 166, 0.3)'
              }}
            >
              <FileText className="w-8 h-8" style={{ color: 'var(--color-bg-primary)' }} />
            </div>

            {/* Title */}
            <h2
              className="text-2xl font-medium mb-3"
              style={{
                color: 'var(--color-text-primary)',
                fontWeight: 500
              }}
            >
              No Reports Yet
            </h2>

            {/* Description */}
            <p
              className="mb-8 leading-relaxed"
              style={{
                color: 'var(--color-text-secondary)',
                fontSize: '15px'
              }}
            >
              Generate investment reports in chat and they'll appear here automatically for easy access.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="h-full min-h-screen w-full overflow-x-hidden"
      style={{
        background: 'var(--color-bg-primary)',
        fontFamily: "'Inter', sans-serif"
      }}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-30 backdrop-blur-xl"
        style={{
          background: 'rgba(10, 14, 26, 0.8)',
          borderBottom: '1px solid var(--color-border-default)'
        }}
      >
        <div className="px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Title */}
            <div>
              <h1
                className="text-xl font-medium"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Reports
              </h1>
              <p
                className="text-sm mt-0.5"
                style={{ color: 'var(--color-text-tertiary)' }}
              >
                {isLoading ? 'Loading...' : `${reports.length} saved report${reports.length !== 1 ? 's' : ''}`}
              </p>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                className={`p-2 rounded-lg transition-all ${refreshing ? 'animate-spin' : ''}`}
                style={{
                  color: 'var(--color-text-tertiary)',
                  background: 'var(--color-bg-elevated)',
                  border: '1px solid var(--color-border-default)'
                }}
                title="Refresh reports"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 lg:px-8 py-6 pb-20">
        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-24">
            <RefreshCw
              className="w-8 h-8 animate-spin"
              style={{ color: 'var(--color-accent-teal-400)' }}
            />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div
            className="text-center py-24 rounded-lg"
            style={{ background: 'var(--color-bg-tertiary)' }}
          >
            <span className="text-4xl mb-4 block">⚠️</span>
            <h3
              className="text-lg font-medium mb-2"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {error}
            </h3>
            <button
              onClick={loadReports}
              className="text-sm mt-2"
              style={{ color: 'var(--color-accent-teal-400)' }}
            >
              Try again
            </button>
          </div>
        )}

        {/* Reports Grid */}
        {!isLoading && !error && reports.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {reports.map((report) => (
              <ReportCard
                key={report.report_id}
                {...formatReportForCard(report)}
                onView={() => setSelectedReport(report)}
                onDownload={() => {
                  const htmlUrl = reportsService.getHtmlUrl(report.report_id);
                  window.open(htmlUrl, '_blank');
                }}
              />
            ))}
          </div>
        )}
      </main>

      {/* Report Viewer Modal */}
      <ReportViewerModal
        report={selectedReport}
        onClose={() => setSelectedReport(null)}
      />
    </div>
  );
};
