// FILE: src/components/reports/ReportDrawer.tsx
/**
 * Report Drawer Component
 * Slide-in panel for viewing and downloading investment reports
 */
import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Maximize2,
  Minimize2,
  Download,
  Copy,
  Check,
  FileText,
  Building2,
  Home,
  Layers,
  RefreshCw,
  Calendar,
  MapPin,
  Loader2,
  TrendingUp,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { ReportTypeSelector } from './ReportTypeSelector';
import type { InvestmentReportFormat } from '../../types/enums';
import type { InvestmentStrategy } from '../../types/pnl';
import type { 
  ReportStrategy, 
  ReportRecommendation,
  ReportDealMetrics,
  ReportPropertyData,
} from '../../types/backendTools';

/* -------------------------------------------------------------------------- */
/*                              Type Definitions                              */
/* -------------------------------------------------------------------------- */

export interface ReportData {
  content: string;
  report_type: InvestmentReportFormat;
  generated_at: string;
  property_address?: string;
  strategy?: ReportStrategy;
  recommendation?: ReportRecommendation;
  property_details?: {
    price?: number;
    location?: string;
    roi?: number;
    tier?: string;
    bedrooms?: number;
    bathrooms?: number;
    sqft?: number;
  };
  metrics?: ReportDealMetrics;
  sections?: {
    executive_summary?: string;
    property_overview?: string;
    financial_analysis?: string;
    market_analysis?: string;
    risk_assessment?: string;
    recommendation?: string;
  };
  pros?: string[];
  cons?: string[];
  risk_factors?: string[];
}

interface ReportDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  report?: ReportData | null;
  isLoading?: boolean;
  error?: string | null;
  onGenerateReport?: (reportType: InvestmentReportFormat) => Promise<void>;
  inferredStrategy?: InvestmentStrategy;
  propertyAddress?: string;
}

/* -------------------------------------------------------------------------- */
/*                              Helper Functions                              */
/* -------------------------------------------------------------------------- */

const REPORT_TYPE_LABELS: Record<InvestmentReportFormat, string> = {
  str: 'Short-Term Rental',
  ltr: 'Long-Term Rental',
  adu: 'ADU Analysis',
  flip: 'Flip Analysis',
  full: 'Full Report',
};

const REPORT_TYPE_ICONS: Record<InvestmentReportFormat, React.ReactNode> = {
  str: <Building2 className="w-4 h-4" />,
  ltr: <Home className="w-4 h-4" />,
  adu: <Layers className="w-4 h-4" />,
  flip: <RefreshCw className="w-4 h-4" />,
  full: <FileText className="w-4 h-4" />,
};

function inferReportTypeFromStrategy(strategy?: InvestmentStrategy | ReportStrategy): InvestmentReportFormat {
  if (!strategy) return 'full';
  const normalized = strategy.toUpperCase();
  if (normalized === 'STR') return 'str';
  if (normalized === 'LTR') return 'ltr';
  if (normalized === 'MTR') return 'ltr'; // Mid-term rental → LTR report
  if (normalized === 'ADU') return 'adu';
  if (normalized === 'FLIP' || normalized === 'BRRRR') return 'flip';
  return 'full';
}

function formatDate(dateString?: string): string {
  if (!dateString) return new Date().toLocaleDateString();
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
}

/**
 * Generate PDF from report content using browser print
 */
async function downloadReportAsPdf(report: ReportData): Promise<void> {
  // Create a hidden iframe for printing
  const iframe = document.createElement('iframe');
  iframe.style.position = 'absolute';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = 'none';
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!doc) {
    document.body.removeChild(iframe);
    throw new Error('Could not create print document');
  }

  // Build styled HTML content
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Investment Report - ${report.property_address || 'Property'}</title>
        <style>
          @page { margin: 1in; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #1a1a1a;
            max-width: 8.5in;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            border-bottom: 2px solid #0066cc;
            padding-bottom: 16px;
            margin-bottom: 24px;
          }
          .header h1 {
            font-size: 24px;
            margin: 0 0 8px 0;
            color: #0066cc;
          }
          .header-meta {
            display: flex;
            flex-wrap: wrap;
            gap: 16px;
            font-size: 12px;
            color: #666;
          }
          .header-meta span {
            display: flex;
            align-items: center;
            gap: 4px;
          }
          .content {
            white-space: pre-wrap;
            font-size: 14px;
          }
          .content h2 {
            color: #0066cc;
            font-size: 18px;
            margin-top: 24px;
            margin-bottom: 12px;
          }
          .content h3 {
            color: #333;
            font-size: 16px;
            margin-top: 20px;
            margin-bottom: 8px;
          }
          .footer {
            margin-top: 32px;
            padding-top: 16px;
            border-top: 1px solid #ddd;
            font-size: 11px;
            color: #888;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${REPORT_TYPE_LABELS[report.report_type]} Report</h1>
          <div class="header-meta">
            ${report.property_address ? `<span>📍 ${report.property_address}</span>` : ''}
            <span>📅 ${formatDate(report.generated_at)}</span>
            <span>📊 ${REPORT_TYPE_LABELS[report.report_type]}</span>
          </div>
        </div>
        <div class="content">${report.content}</div>
        <div class="footer">
          Generated by Civitas AI • ${new Date().toISOString().split('T')[0]}
        </div>
      </body>
    </html>
  `;

  doc.open();
  doc.write(htmlContent);
  doc.close();

  // Wait for content to render
  await new Promise(resolve => setTimeout(resolve, 250));

  // Trigger print dialog (which allows Save as PDF)
  iframe.contentWindow?.print();

  // Clean up after a delay
  setTimeout(() => {
    document.body.removeChild(iframe);
  }, 1000);
}

/* -------------------------------------------------------------------------- */
/*                             Sub-Components                                 */
/* -------------------------------------------------------------------------- */

/** Report Header with metadata fields */
const ReportHeader: React.FC<{ report: ReportData }> = ({ report }) => (
  <div className="flex-shrink-0 px-6 py-4 border-b border-border/50 bg-gradient-to-r from-primary/5 to-transparent">
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          {REPORT_TYPE_ICONS[report.report_type]}
          {REPORT_TYPE_LABELS[report.report_type]} Report
        </h2>
        {report.property_address && (
          <p className="text-sm text-foreground/70 flex items-center gap-1.5 mt-1">
            <MapPin className="w-3.5 h-3.5" />
            {report.property_address}
          </p>
        )}
      </div>
      <div className="flex flex-col items-end text-xs text-foreground/60 shrink-0">
        <span className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {formatDate(report.generated_at)}
        </span>
        <span className="mt-1 px-2 py-0.5 rounded bg-muted text-foreground/70 capitalize">
          {report.report_type.toUpperCase()}
        </span>
      </div>
    </div>
  </div>
);

/** Scrollable report content */
const ReportContent: React.FC<{ content: string }> = ({ content }) => (
  <div className="flex-1 overflow-auto px-6 py-4">
    <pre className="whitespace-pre-wrap font-sans text-sm text-foreground/90 leading-relaxed">
      {content}
    </pre>
  </div>
);

/** Report generator form (when no report is loaded) */
const ReportGenerator: React.FC<{
  onGenerate: (type: InvestmentReportFormat) => void;
  inferredType?: InvestmentReportFormat;
  isLoading: boolean;
  error?: string | null;
}> = ({ onGenerate, inferredType, isLoading, error }) => {
  const [selectedType, setSelectedType] = useState<InvestmentReportFormat | null>(null);

  const handleGenerate = () => {
    const typeToUse = selectedType || inferredType || 'full';
    onGenerate(typeToUse);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl w-full space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold text-foreground">Generate Investment Report</h3>
          <p className="text-sm text-foreground/60 mt-2">
            Select a report type to generate an investor-ready document based on your analysis.
          </p>
        </div>

        <ReportTypeSelector
          selectedType={selectedType}
          onSelect={setSelectedType}
          inferredType={inferredType}
          disabled={isLoading}
        />

        {error && (
          <div className="p-3 rounded-lg bg-danger/10 border border-danger/30 text-danger text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleGenerate}
          disabled={isLoading}
          className={cn(
            'w-full px-4 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2',
            'bg-primary text-primary-foreground hover:bg-primary/90',
            isLoading && 'opacity-70 cursor-not-allowed'
          )}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating Report...
            </>
          ) : (
            <>
              <FileText className="w-4 h-4" />
              Generate Report
            </>
          )}
        </button>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                             Main Component                                 */
/* -------------------------------------------------------------------------- */

export const ReportDrawer: React.FC<ReportDrawerProps> = ({
  isOpen,
  onClose,
  report,
  isLoading = false,
  error = null,
  onGenerateReport,
  inferredStrategy,
  propertyAddress: _propertyAddress, // Available for future use; report data has property_address
}) => {
  const [isMaximized, setIsMaximized] = useState(false);
  const [copied, setCopied] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  // Infer report type from strategy
  const inferredReportType = useMemo(
    () => inferReportTypeFromStrategy(inferredStrategy),
    [inferredStrategy]
  );

  // Handle escape key to close
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Copy report to clipboard
  const handleCopy = useCallback(async () => {
    if (!report?.content) return;
    try {
      await navigator.clipboard.writeText(report.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [report?.content]);

  // Download as PDF
  const handleDownloadPdf = useCallback(async () => {
    if (!report) return;
    setDownloadingPdf(true);
    try {
      await downloadReportAsPdf(report);
    } catch (err) {
      console.error('Failed to download PDF:', err);
    } finally {
      setDownloadingPdf(false);
    }
  }, [report]);

  // Handle report generation
  const handleGenerate = useCallback(
    async (type: InvestmentReportFormat) => {
      if (onGenerateReport) {
        await onGenerateReport(type);
      }
    },
    [onGenerateReport]
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className={cn(
              'fixed top-0 right-0 h-full bg-background shadow-2xl z-50 flex flex-col',
              isMaximized ? 'w-full' : 'w-full max-w-3xl'
            )}
          >
            {/* Header */}
            <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-border/50 bg-muted/30">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMaximized(!isMaximized)}
                  className="p-2 rounded-lg hover:bg-muted transition-colors"
                  title={isMaximized ? 'Restore' : 'Maximize'}
                >
                  {isMaximized ? (
                    <Minimize2 className="w-4 h-4 text-foreground/60" />
                  ) : (
                    <Maximize2 className="w-4 h-4 text-foreground/60" />
                  )}
                </button>
                {report && (
                  <>
                    <button
                      onClick={handleCopy}
                      className="p-2 rounded-lg hover:bg-muted transition-colors"
                      title="Copy to clipboard"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-success" />
                      ) : (
                        <Copy className="w-4 h-4 text-foreground/60" />
                      )}
                    </button>
                    <button
                      onClick={handleDownloadPdf}
                      disabled={downloadingPdf}
                      className="p-2 rounded-lg hover:bg-muted transition-colors flex items-center gap-1.5"
                      title="Download PDF"
                    >
                      {downloadingPdf ? (
                        <Loader2 className="w-4 h-4 text-foreground/60 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4 text-foreground/60" />
                      )}
                      <span className="text-xs text-foreground/60">PDF</span>
                    </button>
                  </>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
                title="Close"
              >
                <X className="w-5 h-5 text-foreground/60" />
              </button>
            </div>

            {/* Content */}
            {report ? (
              <>
                <ReportHeader report={report} />
                <ReportContent content={report.content} />
              </>
            ) : (
              <ReportGenerator
                onGenerate={handleGenerate}
                inferredType={inferredReportType}
                isLoading={isLoading}
                error={error}
              />
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ReportDrawer;
