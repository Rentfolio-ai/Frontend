/**
 * Reports Page
 * Card & table views for investment analysis reports.
 */

import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  Search, ExternalLink, Printer, Trash2, X, Loader2,
  FileText, Building2, Home, Layers, RefreshCw, Target,
  TrendingUp, Zap, BookOpen, Scale, Clock,
  ArrowUpDown, Briefcase, BarChart3,
  DollarSign, Percent, Activity,
} from 'lucide-react';
import { reportsService, type ReportSummary } from '../../services/reportsApi';
import { cn } from '../../lib/utils';
import { useToast } from '../../hooks/useToast';

/* ═══════════════════════════════════════════════════════════════════ */
/*                          Configuration                             */
/* ═══════════════════════════════════════════════════════════════════ */

type SortField = 'type' | 'property' | 'recommendation' | 'date';
type SortOrder = 'asc' | 'desc';
type ViewMode = 'grid' | 'table';

interface ReportTypeConfig {
  icon: React.ElementType;
  label: string;
  shortLabel: string;
  accent: string;      // tailwind text color
  accentBg: string;    // tailwind bg color for badge
  gradient: string;    // CSS gradient string
}

const REPORT_CONFIG: Record<string, ReportTypeConfig> = {
  str: { icon: Building2, label: 'STR Analysis', shortLabel: 'STR', accent: 'text-emerald-400', accentBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', gradient: 'linear-gradient(135deg, rgba(16,185,129,0.12) 0%, rgba(6,78,59,0.06) 100%)' },
  ltr: { icon: Home, label: 'LTR Underwriting', shortLabel: 'LTR', accent: 'text-sky-400', accentBg: 'bg-sky-500/10 text-sky-400 border-sky-500/20', gradient: 'linear-gradient(135deg, rgba(14,165,233,0.12) 0%, rgba(12,74,110,0.06) 100%)' },
  adu: { icon: Layers, label: 'ADU Analysis', shortLabel: 'ADU', accent: 'text-amber-400', accentBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20', gradient: 'linear-gradient(135deg, rgba(245,158,11,0.12) 0%, rgba(120,53,15,0.06) 100%)' },
  flip: { icon: RefreshCw, label: 'Flip Analysis', shortLabel: 'Flip', accent: 'text-rose-400', accentBg: 'bg-rose-500/10 text-rose-400 border-rose-500/20', gradient: 'linear-gradient(135deg, rgba(244,63,94,0.12) 0%, rgba(136,19,55,0.06) 100%)' },
  full: { icon: FileText, label: 'Full Report', shortLabel: 'Full', accent: 'text-teal-300', accentBg: 'bg-teal-500/10 text-teal-300 border-teal-500/20', gradient: 'linear-gradient(135deg, rgba(20,184,166,0.15) 0%, rgba(19,78,74,0.06) 100%)' },
  portfolio: { icon: Briefcase, label: 'Portfolio Strategy', shortLabel: 'Portfolio', accent: 'text-violet-400', accentBg: 'bg-violet-500/10 text-violet-400 border-violet-500/20', gradient: 'linear-gradient(135deg, rgba(139,92,246,0.12) 0%, rgba(76,29,149,0.06) 100%)' },
  strategy: { icon: Target, label: 'Investment Thesis', shortLabel: 'Strategy', accent: 'text-fuchsia-400', accentBg: 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20', gradient: 'linear-gradient(135deg, rgba(217,70,239,0.12) 0%, rgba(112,26,117,0.06) 100%)' },
  market: { icon: BookOpen, label: 'Market Research', shortLabel: 'Market', accent: 'text-cyan-400', accentBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20', gradient: 'linear-gradient(135deg, rgba(6,182,212,0.12) 0%, rgba(21,94,117,0.06) 100%)' },
  comparison: { icon: Scale, label: 'Comparative Analysis', shortLabel: 'CMA', accent: 'text-indigo-400', accentBg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20', gradient: 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(49,46,129,0.06) 100%)' },
};

const REC_CONFIG: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  buy: { label: 'Buy', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', dot: 'bg-emerald-400' },
  pass: { label: 'Pass', color: 'text-white/40', bg: 'bg-white/[0.03] border-white/[0.06]', dot: 'bg-white/30' },
  negotiate: { label: 'Negotiate', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', dot: 'bg-amber-400' },
  hold: { label: 'Hold', color: 'text-sky-400', bg: 'bg-sky-500/10 border-sky-500/20', dot: 'bg-sky-400' },
  'explore further': { label: 'Explore', color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20', dot: 'bg-cyan-400' },
  'strong candidate': { label: 'Strong', color: 'text-emerald-300', bg: 'bg-emerald-500/10 border-emerald-500/20', dot: 'bg-emerald-300' },
  reposition: { label: 'Reposition', color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20', dot: 'bg-violet-400' },
  monitor: { label: 'Monitor', color: 'text-white/50', bg: 'bg-white/[0.03] border-white/[0.06]', dot: 'bg-white/40' },
};

/* ═══════════════════════════════════════════════════════════════════ */
/*                            Helpers                                 */
/* ═══════════════════════════════════════════════════════════════════ */

const getReportConfig = (type: string): ReportTypeConfig =>
  REPORT_CONFIG[type] || { icon: FileText, label: type, shortLabel: type, accent: 'text-white/60', accentBg: 'bg-white/5 text-white/60 border-white/10', gradient: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 100%)' };

const getRecConfig = (rec: string) =>
  REC_CONFIG[rec.toLowerCase()] || { label: rec, color: 'text-white/60', bg: 'bg-white/[0.03] border-white/[0.06]', dot: 'bg-white/40' };

const fmtCurrency = (v: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v);

const fmtPct = (v: number) => `${(v * 100).toFixed(1)}%`;

const fmtDate = (iso: string) => {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};


/* ═══════════════════════════════════════════════════════════════════ */
/*                          Sub-Components                            */
/* ═══════════════════════════════════════════════════════════════════ */



// ── Empty State ──────────────────────────────────────────────────
const EmptyState: React.FC = () => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <div className="relative mb-6">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500/10 to-emerald-500/5 border border-teal-500/10 flex items-center justify-center">
        <BarChart3 className="w-7 h-7 text-teal-400/40" />
      </div>
      <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-teal-500/20 border border-teal-500/30 flex items-center justify-center">
        <span className="text-[8px] text-teal-300 font-bold">0</span>
      </div>
    </div>
    <h3 className="text-base font-display font-semibold text-white/90 mb-2">No reports yet</h3>
    <p className="text-sm text-white/40 max-w-sm mx-auto mb-6 leading-relaxed">
      Analyze a property or market in the chat to generate your first investment report.
    </p>
    <div className="flex items-center gap-2 text-xs text-teal-400/60">
      <Zap className="w-3.5 h-3.5" />
      <span>Reports are auto-generated during conversations</span>
    </div>
  </div>
);

// ── Stats Strip ──────────────────────────────────────────────────
const StatsStrip: React.FC<{ reports: ReportSummary[] }> = ({ reports }) => {
  const total = reports.length;
  const buys = reports.filter(r => r.recommendation.toLowerCase() === 'buy' || r.recommendation.toLowerCase() === 'strong candidate').length;
  const reportsWithCap = reports.filter(r => r.key_metrics?.cap_rate != null && !isNaN(r.key_metrics.cap_rate));
  const avgCap = reportsWithCap.length > 0 ? reportsWithCap.reduce((s, r) => s + r.key_metrics.cap_rate, 0) / reportsWithCap.length : 0;
  const reportsWithCF = reports.filter(r => r.key_metrics?.monthly_cash_flow != null && !isNaN(r.key_metrics.monthly_cash_flow));
  const avgCF = reportsWithCF.length > 0 ? reportsWithCF.reduce((s, r) => s + r.key_metrics.monthly_cash_flow, 0) / reportsWithCF.length : 0;

  const stats = [
    { icon: FileText, label: 'Reports', value: String(total), color: 'text-teal-400' },
    { icon: TrendingUp, label: 'Buy Signals', value: String(buys), color: 'text-emerald-400' },
    { icon: Percent, label: 'Avg Cap Rate', value: fmtPct(avgCap), color: 'text-sky-400' },
    { icon: DollarSign, label: 'Avg Cash Flow', value: fmtCurrency(avgCF), color: 'text-amber-400' },
  ];

  return (
    <div className="grid grid-cols-4 gap-3 mb-6">
      {stats.map((s) => (
        <div
          key={s.label}
          className="relative overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 group hover:border-white/[0.10] transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center flex-shrink-0">
              <s.icon className={cn("w-3.5 h-3.5", s.color)} />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-white/30 font-medium">{s.label}</p>
              <p className={cn("text-sm font-mono font-semibold", s.color)}>{s.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// ── Report Card (Grid View) ──────────────────────────────────────
const ReportCard: React.FC<{
  report: ReportSummary;
  onView: () => void;
  onDelete: (e: React.MouseEvent) => void;
  onOpenTab: (e: React.MouseEvent) => void;
}> = ({ report, onView, onDelete, onOpenTab }) => {
  const cfg = getReportConfig(report.report_type);
  const rec = getRecConfig(report.recommendation);
  const Icon = cfg.icon;
  const metrics = report.key_metrics;

  return (
    <div
      onClick={onView}
      className="group relative rounded-xl border border-white/[0.06] bg-[#131315] overflow-hidden cursor-pointer hover:border-white/[0.10] transition-colors"
    >
      {/* Accent top edge */}
      <div
        className="h-[2px] w-full"
        style={{ background: cfg.gradient.replace('135deg', '90deg') }}
      />

      {/* Card body */}
      <div className="p-5">
        {/* Top row: type badge + date */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center border border-white/[0.06]"
              style={{ background: cfg.gradient }}
            >
              <Icon className={cn("w-4 h-4", cfg.accent)} />
            </div>
            <div>
              <span className={cn("text-[10px] font-semibold uppercase tracking-wider", cfg.accent)}>{cfg.shortLabel}</span>
              <p className="text-[11px] text-white/30 mt-0.5">{cfg.label}</p>
            </div>
          </div>

          {/* Recommendation badge */}
          <span className={cn("text-[10px] font-semibold px-2.5 py-1 rounded-full border", rec.bg)}>
            <span className="flex items-center gap-1.5">
              <span className={cn("w-1.5 h-1.5 rounded-full", rec.dot)} />
              {rec.label}
            </span>
          </span>
        </div>

        {/* Property address */}
        <p className="text-sm font-medium text-white/85 group-hover:text-white mb-4 line-clamp-2 leading-snug transition-colors" title={report.property_address}>
          {report.property_address}
        </p>

        {/* Metrics row */}
        {metrics && (
          <div className="grid grid-cols-2 gap-2 mb-4">
            {metrics.cap_rate != null && !isNaN(metrics.cap_rate) && metrics.cap_rate > 0 && (
              <div className="rounded-lg bg-white/[0.02] border border-white/[0.04] px-3 py-2">
                <p className="text-[9px] uppercase text-white/25 tracking-wider font-medium">Cap Rate</p>
                <p className="text-xs font-mono font-semibold text-white/70">{fmtPct(metrics.cap_rate)}</p>
              </div>
            )}
            {metrics.monthly_cash_flow != null && !isNaN(metrics.monthly_cash_flow) && metrics.monthly_cash_flow !== 0 && (
              <div className="rounded-lg bg-white/[0.02] border border-white/[0.04] px-3 py-2">
                <p className="text-[9px] uppercase text-white/25 tracking-wider font-medium">Cash Flow</p>
                <p className={cn("text-xs font-mono font-semibold", metrics.monthly_cash_flow > 0 ? "text-emerald-400/80" : "text-rose-400/80")}>
                  {fmtCurrency(metrics.monthly_cash_flow)}/mo
                </p>
              </div>
            )}
            {metrics.cash_on_cash != null && !isNaN(metrics.cash_on_cash) && metrics.cash_on_cash > 0 && (
              <div className="rounded-lg bg-white/[0.02] border border-white/[0.04] px-3 py-2">
                <p className="text-[9px] uppercase text-white/25 tracking-wider font-medium">CoC Return</p>
                <p className="text-xs font-mono font-semibold text-white/70">{fmtPct(metrics.cash_on_cash)}</p>
              </div>
            )}
            {metrics.dscr != null && !isNaN(metrics.dscr) && metrics.dscr > 0 && (
              <div className="rounded-lg bg-white/[0.02] border border-white/[0.04] px-3 py-2">
                <p className="text-[9px] uppercase text-white/25 tracking-wider font-medium">DSCR</p>
                <p className="text-xs font-mono font-semibold text-white/70">{metrics.dscr.toFixed(2)}x</p>
              </div>
            )}
          </div>
        )}

        {/* Footer: date + actions */}
        <div className="flex items-center justify-between pt-3 border-t border-white/[0.04]">
          <div className="flex items-center gap-1.5 text-white/30">
            <Clock className="w-3 h-3" />
            <span className="text-[11px] font-mono">{fmtDate(report.created_at)}</span>
          </div>

          <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={onOpenTab}
              className="p-1.5 rounded-lg hover:bg-white/[0.06] text-white/30 hover:text-white/70 transition-colors"
              title="Open in new tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onDelete}
              className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/30 hover:text-red-400 transition-colors"
              title="Delete"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Report Table Row (Table View) ────────────────────────────────
const ReportRow: React.FC<{
  report: ReportSummary;
  onView: () => void;
  onDelete: (e: React.MouseEvent) => void;
  onOpenTab: (e: React.MouseEvent) => void;
}> = ({ report, onView, onDelete, onOpenTab }) => {
  const cfg = getReportConfig(report.report_type);
  const rec = getRecConfig(report.recommendation);
  const Icon = cfg.icon;

  return (
    <tr
      onClick={onView}
      className="group hover:bg-white/[0.03] border-b border-white/[0.04] transition-all cursor-pointer"
    >
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center border border-white/[0.06] flex-shrink-0"
            style={{ background: cfg.gradient }}
          >
            <Icon className={cn("w-3.5 h-3.5", cfg.accent)} />
          </div>
          <div>
            <p className="text-sm font-medium text-white/85 group-hover:text-white transition-colors">{cfg.label}</p>
            <p className={cn("text-[10px] font-semibold uppercase tracking-wider", cfg.accent)}>{cfg.shortLabel}</p>
          </div>
        </div>
      </td>
      <td className="px-5 py-4">
        <p className="text-sm text-white/70 group-hover:text-white/90 truncate max-w-[220px] transition-colors" title={report.property_address}>
          {report.property_address}
        </p>
      </td>
      <td className="px-5 py-4">
        <span className={cn("text-[10px] font-semibold px-2.5 py-1 rounded-full border inline-flex items-center gap-1.5", rec.bg)}>
          <span className={cn("w-1.5 h-1.5 rounded-full", rec.dot)} />
          {rec.label}
        </span>
      </td>
      <td className="px-5 py-4">
        <div className="flex items-center gap-4 text-xs font-mono text-white/40">
          {report.key_metrics?.cap_rate != null && !isNaN(report.key_metrics.cap_rate) && report.key_metrics.cap_rate > 0 && (
            <span title="Cap Rate">{fmtPct(report.key_metrics.cap_rate)}</span>
          )}
          {report.key_metrics?.monthly_cash_flow != null && !isNaN(report.key_metrics.monthly_cash_flow) && report.key_metrics.monthly_cash_flow !== 0 && (
            <span className={report.key_metrics.monthly_cash_flow > 0 ? 'text-emerald-400/60' : 'text-rose-400/60'} title="Monthly Cash Flow">
              {fmtCurrency(report.key_metrics.monthly_cash_flow)}
            </span>
          )}
        </div>
      </td>
      <td className="px-5 py-4">
        <span className="text-xs font-mono text-white/35">{fmtDate(report.created_at)}</span>
      </td>
      <td className="px-5 py-4 text-right">
        <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200">
          <button
            onClick={onOpenTab}
            className="p-1.5 rounded-lg hover:bg-white/[0.06] text-white/30 hover:text-white/70 transition-colors"
            title="Open in new tab"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/30 hover:text-red-400 transition-colors"
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
};

// ── Viewer Modal ─────────────────────────────────────────────────
const ReportViewerModal: React.FC<{
  reportId: string | null;
  reportAddress?: string;
  reportType?: string;
  onClose: () => void;
}> = ({ reportId, reportAddress, reportType, onClose }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  if (!reportId) return null;

  const htmlUrl = reportsService.getHtmlUrl(reportId);
  const cfg = reportType ? getReportConfig(reportType) : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6"
      onClick={onClose}
    >
      <div
        className="w-full max-w-6xl h-[90vh] bg-[#131315] border border-white/[0.08] rounded-xl overflow-hidden flex flex-col relative"
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        {/* Modal accent bar */}
        {cfg && (
          <div className="h-[3px] w-full" style={{ background: cfg.gradient.replace('135deg', '90deg') }} />
        )}

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] bg-white/[0.02]">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center border border-white/[0.06]"
              style={{ background: cfg?.gradient || 'linear-gradient(135deg, rgba(20,184,166,0.1), transparent)' }}
            >
              {cfg ? <cfg.icon className={cn("w-5 h-5", cfg.accent)} /> : <FileText className="w-5 h-5 text-teal-400" />}
            </div>
            <div>
              <h3 className="text-sm font-display font-semibold text-white/90">Report Viewer</h3>
              {reportAddress && <p className="text-xs text-white/40 mt-0.5">{reportAddress}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.open(htmlUrl, '_blank')}
              className="p-2 rounded-lg hover:bg-white/[0.06] text-white/40 hover:text-white transition-colors"
              title="Open in new tab"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
            <button
              onClick={() => iframeRef.current?.contentWindow?.print()}
              className="p-2 rounded-lg hover:bg-white/[0.06] text-white/40 hover:text-white transition-colors"
              title="Print"
            >
              <Printer className="w-4 h-4" />
            </button>
            <div className="w-px h-6 bg-white/[0.06] mx-1" />
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/[0.06] text-white/40 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* IFrame */}
        <div className="flex-1 bg-white relative">
          <iframe ref={iframeRef} src={htmlUrl} className="w-full h-full border-0" title="Report Content" />
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════ */
/*                          Main Component                            */
/* ═══════════════════════════════════════════════════════════════════ */

export const ReportsPage: React.FC = () => {
  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewingReport, setViewingReport] = useState<ReportSummary | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const { success, error } = useToast();

  // Sorting
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const loadReports = useCallback(async (showRefresh = false) => {
    if (showRefresh) setIsRefreshing(true);
    try {
      const data = await reportsService.list();
      setReports(data.reports);
    } catch (err) {
      console.error('Failed to load reports:', err);
      error('Failed to load reports');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [error]);

  useEffect(() => { loadReports(); }, [loadReports]);

  // Auto-refresh when a new report is generated from the chat drawer
  useEffect(() => {
    const handler = () => loadReports(true);
    window.addEventListener('reports-updated', handler);
    return () => window.removeEventListener('reports-updated', handler);
  }, [loadReports]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this report?')) return;
    try {
      await reportsService.delete(id);
      setReports(prev => prev.filter(r => r.report_id !== id));
      success('Report deleted');
    } catch {
      error('Failed to delete report');
    }
  };

  const sortedReports = [...reports].filter(r =>
    searchQuery ? (
      r.property_address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.report_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.recommendation.toLowerCase().includes(searchQuery.toLowerCase())
    ) : true
  ).sort((a, b) => {
    let cmp = 0;
    switch (sortField) {
      case 'type': cmp = a.report_type.localeCompare(b.report_type); break;
      case 'property': cmp = a.property_address.localeCompare(b.property_address); break;
      case 'recommendation': cmp = a.recommendation.localeCompare(b.recommendation); break;
      case 'date': cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime(); break;
    }
    return sortOrder === 'asc' ? cmp : -cmp;
  });

  return (
    <div className="h-full flex flex-col bg-[#0C0C0E] overflow-hidden">

      {/* ── Header ── */}
      <div className="px-8 pt-8 pb-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-teal-500/10 border border-teal-500/15 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-teal-400" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-semibold text-white tracking-tight">Reports</h1>
              <p className="text-xs text-white/35 mt-0.5 flex items-center gap-1.5">
                <Activity className="w-3 h-3 text-teal-500/50" />
                Investment analysis archive
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Search */}
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25 group-focus-within:text-teal-400/60 transition-colors" />
              <input
                type="text"
                placeholder="Search reports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white/[0.03] hover:bg-white/[0.04] focus:bg-white/[0.06] border border-white/[0.06] focus:border-teal-500/30 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-teal-500/20 transition-all w-60"
              />
            </div>

            {/* View toggle */}
            <div className="flex rounded-xl border border-white/[0.06] overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  "p-2.5 transition-all text-xs",
                  viewMode === 'grid'
                    ? "bg-teal-500/10 text-teal-400 border-r border-teal-500/20"
                    : "bg-white/[0.02] text-white/30 hover:text-white/60 border-r border-white/[0.06]"
                )}
                title="Grid view"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
                  <rect x="0" y="0" width="7" height="7" rx="1.5" />
                  <rect x="9" y="0" width="7" height="7" rx="1.5" />
                  <rect x="0" y="9" width="7" height="7" rx="1.5" />
                  <rect x="9" y="9" width="7" height="7" rx="1.5" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={cn(
                  "p-2.5 transition-all text-xs",
                  viewMode === 'table'
                    ? "bg-teal-500/10 text-teal-400"
                    : "bg-white/[0.02] text-white/30 hover:text-white/60"
                )}
                title="Table view"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
                  <rect x="0" y="0" width="16" height="3" rx="1" />
                  <rect x="0" y="5" width="16" height="3" rx="1" />
                  <rect x="0" y="10" width="16" height="3" rx="1" />
                </svg>
              </button>
            </div>

            {/* Refresh */}
            <button
              onClick={() => loadReports(true)}
              disabled={isRefreshing}
              className="p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] hover:border-teal-500/20 text-white/35 hover:text-teal-400 transition-all"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 overflow-y-auto px-8 pb-8">

        {!isLoading && reports.length > 0 && <StatsStrip reports={reports} />}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-3">
            <Loader2 className="w-5 h-5 text-white/30 animate-spin" />
            <p className="text-xs text-white/30">Loading reports...</p>
          </div>
        ) : sortedReports.length === 0 && !searchQuery ? (
          <EmptyState />
        ) : sortedReports.length === 0 && searchQuery ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Search className="w-8 h-8 text-white/10 mb-3" />
            <p className="text-sm text-white/40">No reports matching "{searchQuery}"</p>
          </div>
        ) : viewMode === 'grid' ? (
          /* ── Grid View ── */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedReports.map((report) => (
              <ReportCard
                key={report.report_id}
                report={report}
                onView={() => setViewingReport(report)}
                onDelete={(e) => handleDelete(e, report.report_id)}
                onOpenTab={(e) => { e.stopPropagation(); window.open(reportsService.getHtmlUrl(report.report_id), '_blank'); }}
              />
            ))}
          </div>
        ) : (
          /* ── Table View ── */
          <div
            className="rounded-2xl border border-white/[0.06] bg-[#131315] overflow-hidden"
          >
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/[0.08] bg-white/[0.02]">
                  <th className="px-5 py-4 text-[10px] uppercase font-bold text-white/40 tracking-wider cursor-pointer hover:text-white/70 select-none transition-colors" onClick={() => handleSort('type')}>
                    <div className="flex items-center gap-1.5">Type <ArrowUpDown className="w-3 h-3 opacity-30" /></div>
                  </th>
                  <th className="px-5 py-4 text-[10px] uppercase font-bold text-white/40 tracking-wider cursor-pointer hover:text-white/70 select-none transition-colors" onClick={() => handleSort('property')}>
                    <div className="flex items-center gap-1.5">Property <ArrowUpDown className="w-3 h-3 opacity-30" /></div>
                  </th>
                  <th className="px-5 py-4 text-[10px] uppercase font-bold text-white/40 tracking-wider cursor-pointer hover:text-white/70 select-none transition-colors" onClick={() => handleSort('recommendation')}>
                    <div className="flex items-center gap-1.5">Signal <ArrowUpDown className="w-3 h-3 opacity-30" /></div>
                  </th>
                  <th className="px-5 py-4 text-[10px] uppercase font-bold text-white/40 tracking-wider">Metrics</th>
                  <th className="px-5 py-4 text-[10px] uppercase font-bold text-white/40 tracking-wider cursor-pointer hover:text-white/70 select-none transition-colors" onClick={() => handleSort('date')}>
                    <div className="flex items-center gap-1.5">Date <ArrowUpDown className="w-3 h-3 opacity-30" /></div>
                  </th>
                  <th className="px-5 py-4 text-[10px] uppercase font-bold text-white/30 tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {sortedReports.map((report) => (
                  <ReportRow
                    key={report.report_id}
                    report={report}
                    onView={() => setViewingReport(report)}
                    onDelete={(e) => handleDelete(e, report.report_id)}
                    onOpenTab={(e) => { e.stopPropagation(); window.open(reportsService.getHtmlUrl(report.report_id), '_blank'); }}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Report Viewer Modal ─────────────────────────────── */}
      <ReportViewerModal
        reportId={viewingReport?.report_id || null}
        reportAddress={viewingReport?.property_address}
        reportType={viewingReport?.report_type}
        onClose={() => setViewingReport(null)}
      />
    </div>
  );
};
