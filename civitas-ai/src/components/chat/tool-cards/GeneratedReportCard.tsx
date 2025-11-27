// FILE: src/components/chat/tool-cards/GeneratedReportCard.tsx
// Displays generated investment reports with HTML iframe viewer
// Reports are auto-saved on backend - no manual save needed

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import type { GenerateReportOutput } from '@/types/backendTools';
import { reportsService } from '@/services/reportsApi';

// Icons
const DocumentIcon = ({ className }: { className?: string }) => (
  <svg className={cn('w-4 h-4', className)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
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

const TrendingUpIcon = ({ className }: { className?: string }) => (
  <svg className={cn('w-4 h-4', className)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

const CheckIcon = ({ className }: { className?: string }) => (
  <svg className={cn('w-4 h-4', className)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const FolderIcon = ({ className }: { className?: string }) => (
  <svg className={cn('w-4 h-4', className)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
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
  switch (rec) {
    case 'Buy':
      return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
    case 'Pass':
      return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400 border-red-200 dark:border-red-800';
    case 'Negotiate':
      return 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 border-amber-200 dark:border-amber-800';
    default:
      return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
  }
};

// Report Modal Component - Uses iframe with backend HTML endpoint
interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportId: string;
  reportType: string;
  propertyAddress: string;
}

const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  reportId,
  reportType,
  propertyAddress,
}) => {
  const iframeRef = React.useRef<HTMLIFrameElement>(null);
  
  // Get the HTML URL from the reports service
  const htmlUrl = reportsService.getHtmlUrl(reportId);
  
  const handlePrint = () => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.print();
    }
  };
  
  const handleOpenNewTab = () => {
    window.open(htmlUrl, '_blank');
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-5xl max-h-[90vh] mx-4 bg-white dark:bg-slate-900 rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2">
            <DocumentIcon className="w-5 h-5 text-blue-500" />
            <div>
              <h2 className="font-semibold text-slate-800 dark:text-slate-200">
                {reportType}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {propertyAddress}
              </p>
            </div>
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
            className="w-full h-full min-h-[600px] border-0 bg-white"
            title={reportType}
          />
        </div>
      </div>
    </div>
  );
};

// Key Metrics Mini Card
interface MetricCardProps {
  label: string;
  value: string;
  isPositive?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({ label, value, isPositive }) => (
  <div className="flex flex-col items-center p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
    <span className={cn(
      'text-sm font-semibold',
      isPositive === true && 'text-emerald-600 dark:text-emerald-400',
      isPositive === false && 'text-red-600 dark:text-red-400',
      isPositive === undefined && 'text-slate-700 dark:text-slate-300'
    )}>
      {value}
    </span>
    <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wide">
      {label}
    </span>
  </div>
);

export interface GeneratedReportCardProps {
  data: GenerateReportOutput;
  onNavigateToReports?: () => void;
  // Legacy props - kept for backward compatibility but not used
  onSaveReport?: (data: GenerateReportOutput) => void;
  isSaved?: boolean;
  autoSave?: boolean;
}

export const GeneratedReportCard: React.FC<GeneratedReportCardProps> = ({ 
  data, 
  onNavigateToReports,
}) => {
  const [isReportOpen, setIsReportOpen] = useState(false);
  
  const {
    report_type,
    property_address,
    recommendation,
    key_metrics,
    report_id,
    created_at,
    // Fallback to generated_at for legacy format
    generated_at,
  } = data;
  
  // Use created_at or generated_at for timestamp
  const timestamp = created_at || generated_at;
  
  // Reports are auto-saved on backend, always show as saved
  const cashFlowPositive = key_metrics?.monthly_cash_flow && key_metrics.monthly_cash_flow > 0;
  
  return (
    <>
      <div className="mt-3 space-y-3">
        {/* Header with Report Type & Recommendation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DocumentIcon className="w-5 h-5 text-blue-500" />
            <div>
              <span className="font-medium text-sm text-slate-700 dark:text-slate-300">
                {report_type}
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500 ml-2">
                {property_address}
              </span>
            </div>
          </div>
          
          {/* Recommendation Badge */}
          <span className={cn(
            'px-2.5 py-1 rounded-full text-xs font-semibold border',
            getRecommendationStyle(recommendation)
          )}>
            {recommendation}
          </span>
        </div>
        
        {/* Key Metrics Grid */}
        {key_metrics && (
          <div className="grid grid-cols-4 gap-2">
            <MetricCard 
              label="Monthly CF" 
              value={formatCurrency(key_metrics.monthly_cash_flow)}
              isPositive={cashFlowPositive}
            />
            <MetricCard 
              label="Cap Rate" 
              value={formatPercent(key_metrics.cap_rate)}
              isPositive={key_metrics.cap_rate > 0.06}
            />
            <MetricCard 
              label="CoC Return" 
              value={formatPercent(key_metrics.cash_on_cash)}
              isPositive={key_metrics.cash_on_cash > 0.08}
            />
            <MetricCard 
              label="DSCR" 
              value={key_metrics.dscr.toFixed(2)}
              isPositive={key_metrics.dscr > 1.2}
            />
          </div>
        )}
        
        {/* Success Message - Report is auto-saved on backend */}
        <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
          <CheckIcon className="w-5 h-5 text-emerald-500" />
          <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
            ✅ Your {report_type} is ready!
          </span>
          {onNavigateToReports && (
            <button
              onClick={onNavigateToReports}
              className="ml-auto text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              View in Reports Tab →
            </button>
          )}
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-2">
          {/* View Report Button */}
          <button
            onClick={() => setIsReportOpen(true)}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all',
              'bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50',
              'text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
            )}
          >
            <TrendingUpIcon className="w-4 h-4" />
            View Report
          </button>
          
          {/* Go to Reports Tab Button */}
          {onNavigateToReports && (
            <button
              onClick={onNavigateToReports}
              className={cn(
                'flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all',
                'bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800',
                'text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
              )}
              title="View all reports"
            >
              <FolderIcon className="w-4 h-4" />
              Reports
            </button>
          )}
        </div>
        
        {/* Generated timestamp */}
        {timestamp && (
          <div className="text-[10px] text-slate-400 dark:text-slate-500 text-center">
            Generated {formatDate(timestamp)}
          </div>
        )}
      </div>
      
      {/* Report Modal - Uses iframe with backend HTML endpoint */}
      {report_id && (
        <ReportModal
          isOpen={isReportOpen}
          onClose={() => setIsReportOpen(false)}
          reportId={report_id}
          reportType={report_type}
          propertyAddress={property_address}
        />
      )}
    </>
  );
};
