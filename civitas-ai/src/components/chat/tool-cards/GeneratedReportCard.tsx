// FILE: src/components/chat/tool-cards/GeneratedReportCard.tsx
// Clean, professional in-chat report card.
// Reports are auto-saved on backend — no manual save needed.

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, X, Printer, ExternalLink, FolderOpen,
  TrendingUp, ChevronRight,
} from 'lucide-react';
import type { GenerateReportOutput } from '@/types/backendTools';
import { reportsService } from '@/services/reportsApi';

/* ── Report type config ────────────────────────────────────────────── */

const TYPE_CONFIG: Record<string, { label: string; color: string; textClass: string }> = {
  str:        { label: 'STR Analysis',       color: '#34d399', textClass: 'text-emerald-400' },
  ltr:        { label: 'LTR Underwriting',   color: '#38bdf8', textClass: 'text-sky-400' },
  adu:        { label: 'ADU Analysis',       color: '#fbbf24', textClass: 'text-amber-400' },
  flip:       { label: 'Flip Analysis',      color: '#fb7185', textClass: 'text-rose-400' },
  full:       { label: 'Full Report',        color: '#5eead4', textClass: 'text-teal-300' },
  portfolio:  { label: 'Portfolio Strategy', color: '#a78bfa', textClass: 'text-violet-400' },
  strategy:   { label: 'Investment Thesis',  color: '#e879f9', textClass: 'text-fuchsia-400' },
  market:     { label: 'Market Research',    color: '#22d3ee', textClass: 'text-cyan-400' },
  comparison: { label: 'Comparative Analysis', color: '#818cf8', textClass: 'text-indigo-400' },
};

const REC_STYLES: Record<string, { textClass: string; dotClass: string }> = {
  buy:                { textClass: 'text-emerald-400', dotClass: 'bg-emerald-400' },
  pass:               { textClass: 'text-muted-foreground/70',    dotClass: 'bg-white/30' },
  negotiate:          { textClass: 'text-amber-400',   dotClass: 'bg-amber-400' },
  hold:               { textClass: 'text-sky-400',     dotClass: 'bg-sky-400' },
  'explore further':  { textClass: 'text-cyan-400',    dotClass: 'bg-cyan-400' },
  'strong candidate': { textClass: 'text-emerald-300', dotClass: 'bg-emerald-300' },
  'below market':     { textClass: 'text-amber-300',   dotClass: 'bg-amber-300' },
  monitor:            { textClass: 'text-muted-foreground',    dotClass: 'bg-white/40' },
  reposition:         { textClass: 'text-violet-400',  dotClass: 'bg-violet-400' },
};

const getTypeConfig = (type: string) =>
  TYPE_CONFIG[type?.toLowerCase()] || { label: type || 'Report', color: '#888', textClass: 'text-muted-foreground' };

const getRecStyle = (rec: string) =>
  REC_STYLES[rec?.toLowerCase()] || { textClass: 'text-muted-foreground/70', dotClass: 'bg-white/30' };

/* ── Report Modal ──────────────────────────────────────────────────── */

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportId: string;
  reportType: string;
  propertyAddress: string;
  htmlContent?: string;
}

const ReportModal: React.FC<ReportModalProps> = ({
  isOpen, onClose, reportId, reportType, propertyAddress, htmlContent,
}) => {
  const iframeRef = React.useRef<HTMLIFrameElement>(null);
  const htmlUrl = reportsService.getHtmlUrl(reportId);
  const cfg = getTypeConfig(reportType);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/70"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: 8 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-5xl max-h-[90vh] mx-4 bg-card rounded-xl shadow-2xl overflow-hidden flex flex-col border border-black/[0.08]"
        >
          {/* Accent strip */}
          <div className="h-[2px] w-full flex-shrink-0" style={{ backgroundColor: cfg.color }} />

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-black/[0.06]">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className={`text-[10px] font-semibold uppercase tracking-wider ${cfg.textClass}`}>
                  {getTypeConfig(reportType).label}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground/60 truncate">{propertyAddress}</p>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() => iframeRef.current?.contentWindow?.print()}
                className="p-2 rounded-lg hover:bg-black/[0.05] text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                title="Print"
              >
                <Printer className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  if (htmlContent) {
                    const blob = new Blob([htmlContent], { type: 'text/html' });
                    window.open(URL.createObjectURL(blob), '_blank');
                  } else {
                    window.open(htmlUrl, '_blank');
                  }
                }}
                className="p-2 rounded-lg hover:bg-black/[0.05] text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                title="Open in new tab"
              >
                <ExternalLink className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-black/[0.05] text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Report Content */}
          <div className="flex-1 overflow-hidden bg-[#F7F8FA]">
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

/* ── Main Card ─────────────────────────────────────────────────────── */

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

  const cfg = getTypeConfig(report_type);
  const recStyle = getRecStyle(recommendation || '');

  // Extract key metrics
  const cashFlow = key_metrics?.monthly_cash_flow;
  const capRate = key_metrics?.cap_rate;
  const coc = key_metrics?.cash_on_cash;

  return (
    <>
      {/* Report Card — clean flat style */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="mt-3 rounded-lg border border-black/[0.08] bg-black/[0.02] overflow-hidden"
      >
        {/* Accent strip */}
        <div className="h-[2px] w-full" style={{ backgroundColor: cfg.color }} />

        {/* Card Header */}
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="w-3.5 h-3.5 text-muted-foreground/50 flex-shrink-0" />
              <span className={`text-[12px] font-semibold ${cfg.textClass}`}>{cfg.label}</span>
            </div>
            <p className="text-[11px] text-muted-foreground/70 truncate max-w-[300px]">{property_address}</p>
          </div>

          {/* Recommendation */}
          {recommendation && (
            <span className="flex items-center gap-1.5 flex-shrink-0">
              <span className={`w-1.5 h-1.5 rounded-full ${recStyle.dotClass}`} />
              <span className={`text-[11px] font-semibold ${recStyle.textClass}`}>
                {recommendation.toUpperCase()}
              </span>
            </span>
          )}
        </div>

        {/* Metrics Row */}
        {(cashFlow != null || capRate != null || coc != null) && (
          <div className="px-4 pb-2.5 flex items-center gap-4 text-[11px]">
            {cashFlow != null && (
              <div className="flex items-center gap-1.5">
                <TrendingUp className={`w-3 h-3 ${cashFlow >= 0 ? 'text-emerald-400/60' : 'text-rose-400/60'}`} />
                <span className="text-muted-foreground/60">Cash Flow</span>
                <span className={`font-semibold font-mono ${cashFlow >= 0 ? 'text-emerald-400/80' : 'text-rose-400/80'}`}>
                  ${Math.abs(cashFlow).toLocaleString()}/mo
                </span>
              </div>
            )}
            {capRate != null && (
              <div className="flex items-center gap-1.5">
                <span className="text-muted-foreground/60">Cap Rate</span>
                <span className="font-semibold font-mono text-foreground/70">{(capRate * 100).toFixed(1)}%</span>
              </div>
            )}
            {coc != null && (
              <div className="flex items-center gap-1.5">
                <span className="text-muted-foreground/60">CoC</span>
                <span className="font-semibold font-mono text-foreground/70">{(coc * 100).toFixed(1)}%</span>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="px-4 py-2.5 flex items-center gap-2 border-t border-black/[0.05]">
          <button
            onClick={() => setIsReportOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-black/[0.05] hover:bg-black/[0.07] text-foreground/70 hover:text-foreground rounded-md text-[12px] font-medium transition-all"
          >
            <FileText className="w-3.5 h-3.5" />
            View Full Report
            <ChevronRight className="w-3 h-3 opacity-50" />
          </button>

          {onNavigateToReports && (
            <button
              onClick={onNavigateToReports}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-muted-foreground/50 hover:text-muted-foreground text-[11px] font-medium transition-colors rounded-md hover:bg-black/[0.02]"
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
        />
      )}
    </>
  );
};
