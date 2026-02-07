// FILE: src/components/chat/tool-cards/GeneratedReportCard.tsx
// Displays generated investment reports with HTML iframe viewer
// Reports are auto-saved on backend - no manual save needed

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, X, Printer, ExternalLink, FolderOpen,
  TrendingUp, Shield, Search, Target, ChevronRight,
  BarChart3, Zap
} from 'lucide-react';
import type { GenerateReportOutput } from '@/types/backendTools';
import { reportsService } from '@/services/reportsApi';

// Mode-to-theme config
const MODE_THEMES: Record<string, { gradient: string; icon: React.ReactNode; badge: string; badgeBg: string }> = {
  hunter: {
    gradient: 'from-amber-500/20 via-yellow-500/10 to-orange-500/5',
    icon: <Target className="w-4 h-4" />,
    badge: 'Deal Analysis',
    badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/20',
  },
  strategist: {
    gradient: 'from-violet-500/20 via-purple-500/10 to-indigo-500/5',
    icon: <BarChart3 className="w-4 h-4" />,
    badge: 'Strategy',
    badgeBg: 'bg-violet-500/20 text-violet-300 border-violet-500/20',
  },
  research: {
    gradient: 'from-cyan-500/20 via-[#C08B5C]/10 to-blue-500/5',
    icon: <Search className="w-4 h-4" />,
    badge: 'Research',
    badgeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/20',
  },
};

// Recommendation badge styling
const REC_STYLES: Record<string, string> = {
  buy: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/20',
  pass: 'bg-rose-500/20 text-rose-300 border-rose-500/20',
  negotiate: 'bg-amber-500/20 text-amber-300 border-amber-500/20',
  hold: 'bg-blue-500/20 text-blue-300 border-blue-500/20',
  'explore further': 'bg-cyan-500/20 text-cyan-300 border-cyan-500/20',
  'strong candidate': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/20',
  'below market': 'bg-amber-500/20 text-amber-300 border-amber-500/20',
  monitor: 'bg-blue-500/20 text-blue-300 border-blue-500/20',
  reposition: 'bg-violet-500/20 text-violet-300 border-violet-500/20',
};

// Report Modal Component
interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportId: string;
  reportType: string;
  propertyAddress: string;
  htmlContent?: string;
  mode?: string;
}

const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  reportId,
  reportType,
  propertyAddress,
  htmlContent,
  mode = 'hunter',
}) => {
  const iframeRef = React.useRef<HTMLIFrameElement>(null);
  const htmlUrl = reportsService.getHtmlUrl(reportId);
  const theme = MODE_THEMES[mode] || MODE_THEMES.hunter;

  const handlePrint = () => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.print();
    }
  };

  const handleOpenNewTab = () => {
    if (htmlContent) {
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } else {
      window.open(htmlUrl, '_blank');
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-md"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-5xl max-h-[90vh] mx-4 bg-[#0d0f14] rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-white/[0.08]"
        >
          {/* Header */}
          <div className={`flex items-center justify-between px-5 py-3 border-b border-white/[0.08] bg-gradient-to-r ${theme.gradient}`}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/[0.08] backdrop-blur-sm flex items-center justify-center text-white/70">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-semibold text-white/90 text-sm">
                  {reportType}
                </h2>
                <p className="text-[11px] text-white/40">
                  {propertyAddress}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={handlePrint}
                className="p-2 rounded-lg hover:bg-white/[0.08] transition-colors text-white/40 hover:text-white/70"
                title="Print report"
              >
                <Printer className="w-4 h-4" />
              </button>
              <button
                onClick={handleOpenNewTab}
                className="p-2 rounded-lg hover:bg-white/[0.08] transition-colors text-white/40 hover:text-white/70"
                title="Open in new tab"
              >
                <ExternalLink className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/[0.08] transition-colors text-white/40 hover:text-white/70"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Report Content */}
          <div className="flex-1 overflow-hidden bg-white">
            <iframe
              ref={iframeRef}
              src={htmlContent ? undefined : htmlUrl}
              srcDoc={htmlContent}
              className="w-full h-full min-h-[600px] border-0"
              title={reportType}
            />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};


export interface GeneratedReportCardProps {
  data: GenerateReportOutput;
  onNavigateToReports?: () => void;
  // Legacy props
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
    recommendation,
    html_content,
    key_metrics,
  } = data;

  // Detect mode from data or infer from report type
  const mode = (data as any).mode || (
    ['portfolio', 'strategy'].some(t => (report_type || '').toLowerCase().includes(t)) ? 'strategist' :
    ['market', 'research', 'comparison'].some(t => (report_type || '').toLowerCase().includes(t)) ? 'research' :
    'hunter'
  );

  const theme = MODE_THEMES[mode] || MODE_THEMES.hunter;
  const recStyle = REC_STYLES[(recommendation || '').toLowerCase()] || REC_STYLES.negotiate;

  // Extract key metrics for the preview card
  const cashFlow = key_metrics?.cash_flow_monthly || key_metrics?.monthly_cash_flow;
  const capRate = key_metrics?.cap_rate;
  const coc = key_metrics?.cash_on_cash;

  return (
    <>
      {/* Report Card — dark glassmorphic style */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`mt-3 rounded-xl border border-white/[0.08] bg-gradient-to-br ${theme.gradient} backdrop-blur-xl overflow-hidden`}
      >
        {/* Card Header */}
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/[0.08] flex items-center justify-center text-white/60">
              {theme.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-semibold text-white/90">{report_type}</span>
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${theme.badgeBg}`}>
                  {theme.badge}
                </span>
              </div>
              <p className="text-[11px] text-white/40 mt-0.5 truncate max-w-[280px]">{property_address}</p>
            </div>
          </div>

          {/* Recommendation badge */}
          {recommendation && (
            <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border ${recStyle}`}>
              {recommendation.toUpperCase()}
            </span>
          )}
        </div>

        {/* Key Metrics Row */}
        {(cashFlow || capRate || coc) && (
          <div className="px-4 pb-2 flex gap-4 text-[11px]">
            {cashFlow != null && (
              <div className="flex items-center gap-1.5">
                <TrendingUp className={`w-3 h-3 ${cashFlow >= 0 ? 'text-emerald-400/70' : 'text-rose-400/70'}`} />
                <span className="text-white/40">Cash Flow</span>
                <span className={`font-semibold ${cashFlow >= 0 ? 'text-emerald-300/90' : 'text-rose-300/90'}`}>
                  ${Math.abs(cashFlow).toLocaleString()}/mo
                </span>
              </div>
            )}
            {capRate != null && (
              <div className="flex items-center gap-1.5">
                <Shield className="w-3 h-3 text-white/30" />
                <span className="text-white/40">Cap Rate</span>
                <span className="font-semibold text-white/80">{(capRate * 100).toFixed(1)}%</span>
              </div>
            )}
            {coc != null && (
              <div className="flex items-center gap-1.5">
                <Zap className="w-3 h-3 text-white/30" />
                <span className="text-white/40">CoC</span>
                <span className="font-semibold text-white/80">{(coc * 100).toFixed(1)}%</span>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="px-4 py-3 flex items-center gap-2 border-t border-white/[0.05]">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsReportOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-lg text-[12px] font-medium shadow-lg shadow-violet-500/15 hover:from-violet-500 hover:to-purple-500 transition-all"
          >
            <FileText className="w-3.5 h-3.5" />
            View Full Report
            <ChevronRight className="w-3 h-3 opacity-60" />
          </motion.button>

          {onNavigateToReports && (
            <button
              onClick={onNavigateToReports}
              className="flex items-center gap-1.5 px-3 py-1.5 text-white/40 hover:text-white/60 text-[11px] font-medium transition-colors rounded-lg hover:bg-white/[0.04]"
            >
              <FolderOpen className="w-3 h-3" />
              All Reports
            </button>
          )}
        </div>
      </motion.div>

      {/* Report Modal */}
      {report_id && (
        <ReportModal
          isOpen={isReportOpen}
          onClose={() => setIsReportOpen(false)}
          reportId={report_id}
          reportType={report_type}
          propertyAddress={property_address}
          htmlContent={html_content}
          mode={mode}
        />
      )}
    </>
  );
};
