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



const FolderIcon = ({ className }: { className?: string }) => (
  <svg className={cn('w-4 h-4', className)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
  </svg>
);



// Report Modal Component - Uses iframe with backend HTML endpoint or embedded content
interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportId: string;
  reportType: string;
  propertyAddress: string;
  htmlContent?: string;
}

const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  reportId,
  reportType,
  propertyAddress,
  htmlContent,
}) => {
  const iframeRef = React.useRef<HTMLIFrameElement>(null);

  // Get the HTML URL from the reports service (fallback)
  const htmlUrl = reportsService.getHtmlUrl(reportId);

  const handlePrint = () => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.print();
    }
  };

  const handleOpenNewTab = () => {
    if (htmlContent) {
      // Create a blob URL for the content
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } else {
      window.open(htmlUrl, '_blank');
    }
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

        {/* Report Content - iframe pointing to HTML endpoint or embedded content */}
        <div className="flex-1 overflow-hidden">
          <iframe
            ref={iframeRef}
            src={htmlContent ? undefined : htmlUrl}
            srcDoc={htmlContent}
            className="w-full h-full min-h-[600px] border-0 bg-white"
            title={reportType}
          />
        </div>
      </div>
    </div>
  );
};



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
    report_id,
    html_content, // Destructure new field
  } = data;

  return (
    <>
      {/* Single immersed button - no box, just clean UI */}
      {/* Primary View Button */}
      <button
        onClick={() => setIsReportOpen(true)}
        className="mt-3 flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors text-sm font-medium shadow-sm"
      >
        <DocumentIcon className="w-4 h-4" />
        View Full Report
      </button>

      {/* Secondary Link to Reports Tab */}
      {onNavigateToReports && (
        <button
          onClick={onNavigateToReports}
          className={cn(
            'mt-2 flex items-center gap-2 text-xs font-medium transition-colors',
            'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
          )}
        >
          <FolderIcon className="w-3 h-3" />
          View all reports
        </button>
      )}

      {/* Report Modal - Uses iframe with backend HTML endpoint */}
      {report_id && (
        <ReportModal
          isOpen={isReportOpen}
          onClose={() => setIsReportOpen(false)}
          reportId={report_id}
          reportType={report_type}
          propertyAddress={property_address}
          htmlContent={html_content}
        />
      )}
    </>
  );
};
