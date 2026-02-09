/**
 * Reports Page — Premium Aesthetic Redesign
 * A visually stunning, glassmorphic interface for investment reports.
 */

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, ExternalLink, Printer, Trash2, X, Loader2,
  FileText, Building2, Home, Layers, RefreshCw, Target,
  TrendingUp, Shield, Zap, BookOpen, Scale, Clock,
  ArrowUpDown, Briefcase,
} from 'lucide-react';
import { reportsService, type ReportSummary } from '../../services/reportsApi';
import { cn } from '../../lib/utils';
import { useToast } from '../../hooks/useToast';

/* ═══════════════════════════════════════════════════════════════════════════ */
/*                              Configuration                                 */
/* ═══════════════════════════════════════════════════════════════════════════ */

type SortField = 'type' | 'property' | 'recommendation' | 'date';
type SortOrder = 'asc' | 'desc';

interface ReportTypeConfig {
  icon: React.ElementType;
  label: string;
  shortLabel: string;
  color: string;
  bgColor: string;
  gradient: string;
}

const REPORT_CONFIG: Record<string, ReportTypeConfig> = {
  str: { icon: Building2, label: 'STR Analysis', shortLabel: 'STR', color: 'text-white/80', bgColor: 'bg-white/[0.03] border-white/[0.08]', gradient: 'from-white/[0.02] to-transparent' },
  ltr: { icon: Home, label: 'LTR Underwriting', shortLabel: 'LTR', color: 'text-white/80', bgColor: 'bg-white/[0.03] border-white/[0.08]', gradient: 'from-white/[0.02] to-transparent' },
  adu: { icon: Layers, label: 'ADU Analysis', shortLabel: 'ADU', color: 'text-white/80', bgColor: 'bg-white/[0.03] border-white/[0.08]', gradient: 'from-white/[0.02] to-transparent' },
  flip: { icon: RefreshCw, label: 'Flip Analysis', shortLabel: 'Flip', color: 'text-white/80', bgColor: 'bg-white/[0.03] border-white/[0.08]', gradient: 'from-white/[0.02] to-transparent' },
  full: { icon: FileText, label: 'Full Report', shortLabel: 'Full', color: 'text-[#D4A27F]', bgColor: 'bg-[#C08B5C]/10 border-[#C08B5C]/20', gradient: 'from-[#C08B5C]/10 to-transparent' },
  portfolio: { icon: Briefcase, label: 'Portfolio Strategy', shortLabel: 'Portfolio', color: 'text-white/80', bgColor: 'bg-white/[0.03] border-white/[0.08]', gradient: 'from-white/[0.02] to-transparent' },
  strategy: { icon: Target, label: 'Investment Thesis', shortLabel: 'Strategy', color: 'text-white/80', bgColor: 'bg-white/[0.03] border-white/[0.08]', gradient: 'from-white/[0.02] to-transparent' },
  market: { icon: BookOpen, label: 'Market Research', shortLabel: 'Market', color: 'text-white/80', bgColor: 'bg-white/[0.03] border-white/[0.08]', gradient: 'from-white/[0.02] to-transparent' },
  comparison: { icon: Scale, label: 'Comparative Analysis', shortLabel: 'CMA', color: 'text-white/80', bgColor: 'bg-white/[0.03] border-white/[0.08]', gradient: 'from-white/[0.02] to-transparent' },
};

const REC_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  buy: { label: 'Buy', color: 'text-[#D4A27F]', dot: 'bg-[#C08B5C]' },
  pass: { label: 'Pass', color: 'text-white/40', dot: 'bg-white/20' },
  negotiate: { label: 'Negotiate', color: 'text-white/80', dot: 'bg-white/60' },
  hold: { label: 'Hold', color: 'text-white/60', dot: 'bg-white/40' },
  'explore further': { label: 'Explore', color: 'text-white/60', dot: 'bg-white/40' },
  'strong candidate': { label: 'Strong', color: 'text-[#D4A27F]', dot: 'bg-[#C08B5C]' },
  reposition: { label: 'Reposition', color: 'text-white/60', dot: 'bg-white/40' },
  monitor: { label: 'Monitor', color: 'text-white/40', dot: 'bg-white/20' },
};

/* ═══════════════════════════════════════════════════════════════════════════ */
/*                              Helpers                                       */
/* ═══════════════════════════════════════════════════════════════════════════ */

const getReportConfig = (type: string): ReportTypeConfig =>
  REPORT_CONFIG[type] || { icon: FileText, label: type, shortLabel: type, color: 'text-white/60', bgColor: 'bg-white/5 border-white/10', gradient: 'from-white/10 to-transparent' };

const getRecConfig = (rec: string) =>
  REC_CONFIG[rec.toLowerCase()] || { label: rec, color: 'text-white/60', dot: 'bg-white/40' };

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

/* ═══════════════════════════════════════════════════════════════════════════ */
/*                              Components                                    */
/* ═══════════════════════════════════════════════════════════════════════════ */

// ── Visual Empty State ───────────────────────────────────────────────────────

const EmptyState: React.FC = () => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-4">
      <FileText className="w-5 h-5 text-white/20" />
    </div>
    <h3 className="text-sm font-medium text-white/90 mb-1">No reports found</h3>
    <p className="text-xs text-white/40 max-w-xs mx-auto mb-6">
      Get started by analyzing a property or market in the chat.
    </p>
    <button className="px-4 py-2 rounded-lg bg-[#C08B5C] hover:bg-[#A8734A] text-white text-xs font-medium transition-colors">
      Start Analysis
    </button>
  </div>
);

// ── Glass Stats Bar ──────────────────────────────────────────────────────────

const StatsBar: React.FC<{ reports: ReportSummary[] }> = ({ reports }) => {
  const total = reports.length;
  const buys = reports.filter(r => r.recommendation.toLowerCase() === 'buy').length;
  const avgCap = total > 0 ? reports.reduce((s, r) => s + (r.key_metrics?.cap_rate || 0), 0) / total : 0;
  const avgCF = total > 0 ? reports.reduce((s, r) => s + (r.key_metrics?.monthly_cash_flow || 0), 0) / total : 0;

  const stats = [
    { label: 'Total Reports', value: String(total) },
    { label: 'Buy Opps', value: String(buys), highlight: true },
    { label: 'Avg Cap Rate', value: fmtPct(avgCap) },
    { label: 'Avg Cash Flow', value: fmtCurrency(avgCF) },
  ];

  return (
    <div className="flex items-center gap-8 mb-8 px-6 py-4 mx-8 rounded-xl bg-[#161618] border border-white/[0.08] shadow-2xl w-full max-w-4xl">
      {stats.map((s, i) => (
        <React.Fragment key={s.label}>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-medium uppercase tracking-wider text-white/30">{s.label}</span>
            <span className={cn("text-sm font-mono font-medium", s.highlight ? "text-[#D4A27F]" : "text-white/80")}>
              {s.value}
            </span>
          </div>
          {i < stats.length - 1 && <div className="w-px h-3 bg-white/[0.06]" />}
        </React.Fragment>
      ))}
    </div>
  );
};

// ── Viewer Modal ─────────────────────────────────────────────────────────────

const ReportViewerModal: React.FC<{
  reportId: string | null;
  reportAddress?: string;
  onClose: () => void;
}> = ({ reportId, reportAddress, onClose }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  if (!reportId) return null;

  const htmlUrl = reportsService.getHtmlUrl(reportId);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-[#0C0C0E]/90 backdrop-blur-xl p-6"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="w-full max-w-6xl h-[90vh] bg-[#161618] border border-white/[0.08] rounded-2xl overflow-hidden flex flex-col shadow-2xl relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] bg-white/[0.02]">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/[0.08] flex items-center justify-center shadow-inner">
                <FileText className="w-5 h-5 text-white/70" />
              </div>
              <div>
                <h3 className="text-sm font-display font-semibold text-white/90">Report Viewer</h3>
                {reportAddress && <p className="text-xs font-sans text-white/40">{reportAddress}</p>}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => window.open(htmlUrl, '_blank')}
                className="p-2 rounded-lg hover:bg-white/[0.06] text-white/40 hover:text-white transition-colors border border-transparent hover:border-white/[0.05]"
                title="Open in new tab"
              >
                <ExternalLink className="w-4 h-4" />
              </button>
              <button
                onClick={() => iframeRef.current?.contentWindow?.print()}
                className="p-2 rounded-lg hover:bg-white/[0.06] text-white/40 hover:text-white transition-colors border border-transparent hover:border-white/[0.05]"
                title="Print"
              >
                <Printer className="w-4 h-4" />
              </button>
              <div className="w-px h-6 bg-white/[0.08] mx-2" />
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/[0.06] text-white/40 hover:text-white transition-colors border border-transparent hover:border-white/[0.05]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* IFrame Container */}
          <div className="flex-1 bg-white relative">
            <iframe ref={iframeRef} src={htmlUrl} className="w-full h-full border-0" title="Report Content" />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════ */
/*                              Main Component                                */
/* ═══════════════════════════════════════════════════════════════════════════ */

export const ReportsPage: React.FC = () => {
  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewingReport, setViewingReport] = useState<ReportSummary | null>(null);
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

  useEffect(() => {
    loadReports();
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
      r.report_type.toLowerCase().includes(searchQuery.toLowerCase())
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
    <div className="h-full flex flex-col bg-[#0C0C0E] relative overflow-hidden">
      {/* Ambient Background Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-blue-900/[0.04] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-[var(--accent-primary,#C08B5C)]/[0.03] rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <div className="px-8 pt-8 pb-6 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/[0.08] flex items-center justify-center shadow-lg backdrop-blur-sm">
            <FileText className="w-5 h-5 text-[var(--accent-light,#D4A27F)]" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-semibold text-white tracking-tight">Reports</h1>
            <p className="text-xs font-sans text-white/40 mt-0.5">Archive of your generated investment analyses</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30 group-focus-within:text-white/60 transition-colors" />
            <input
              type="text"
              placeholder="Search reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white/[0.03] hover:bg-white/[0.05] focus:bg-white/[0.08] border border-white/[0.06] focus:border-white/[0.15] rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-white/20 focus:outline-none transition-all w-64 shadow-sm backdrop-blur-sm"
            />
          </div>
          <button
            onClick={() => loadReports(true)}
            disabled={isRefreshing}
            className="p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] hover:border-white/[0.1] text-white/40 hover:text-white transition-all shadow-sm backdrop-blur-sm"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto relative z-10 px-8 pb-8">

        {!isLoading && reports.length > 0 && <StatsBar reports={reports} />}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-3">
            <Loader2 className="w-6 h-6 text-white/20 animate-spin" />
            <p className="text-xs text-white/30 font-sans">Loading your reports...</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="rounded-2xl border border-white/[0.08] bg-white/[0.01] backdrop-blur-md overflow-hidden shadow-2xl"
          >
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/[0.1] bg-[#161618]">
                  <th className="px-6 py-5 text-[11px] uppercase font-bold text-white/50 tracking-wider cursor-pointer hover:text-white select-none transition-colors" onClick={() => handleSort('type')}>
                    <div className="flex items-center gap-2">Report Type <ArrowUpDown className="w-3 h-3 opacity-30" /></div>
                  </th>
                  <th className="px-5 py-5 text-[11px] uppercase font-bold text-white/50 tracking-wider cursor-pointer hover:text-white select-none transition-colors" onClick={() => handleSort('property')}>
                    <div className="flex items-center gap-2">Property <ArrowUpDown className="w-3 h-3 opacity-30" /></div>
                  </th>
                  <th className="px-5 py-5 text-[11px] uppercase font-bold text-white/50 tracking-wider cursor-pointer hover:text-white select-none transition-colors" onClick={() => handleSort('recommendation')}>
                    <div className="flex items-center gap-2">Status <ArrowUpDown className="w-3 h-3 opacity-30" /></div>
                  </th>
                  <th className="px-5 py-5 text-[11px] uppercase font-bold text-white/50 tracking-wider cursor-pointer hover:text-white select-none transition-colors" onClick={() => handleSort('date')}>
                    <div className="flex items-center gap-2">Date <ArrowUpDown className="w-3 h-3 opacity-30" /></div>
                  </th>
                  <th className="px-6 py-4 text-[10px] uppercase font-bold text-white/30 tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {sortedReports.length === 0 ? (
                  <tr>
                    <td colSpan={5}>
                      <EmptyState />
                    </td>
                  </tr>
                ) : (
                  sortedReports.map((report, idx) => {
                    const cfg = getReportConfig(report.report_type);
                    const rec = getRecConfig(report.recommendation);
                    return (
                      <motion.tr
                        key={report.report_id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: idx * 0.03 }}
                        onClick={() => setViewingReport(report)}
                        className="group hover:bg-white/[0.04] border-b border-white/[0.04] transition-all cursor-pointer relative even:bg-white/[0.01]"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center border transition-all shadow-sm ${cfg.bgColor}`}>
                              <cfg.icon className={`w-4 h-4 ${cfg.color}`} />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white/90 group-hover:text-white transition-colors">{cfg.label}</p>
                              <p className="text-[10px] text-white/30">{cfg.shortLabel}</p>
                            </div>
                          </div>
                          {/* Gradient shine on hover */}
                          <div
                            className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${cfg.gradient} opacity-0 group-hover:opacity-100 transition-opacity`}
                          />
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-sm font-sans text-white/70 group-hover:text-white/90 truncate max-w-[240px]" title={report.property_address}>
                            {report.property_address}
                          </p>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <div className={`w-1.5 h-1.5 rounded-full ${rec.dot}`} />
                            <span className={`text-[11px] font-medium ${rec.color}`}>
                              {rec.label}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2 text-white/40 group-hover:text-white/60 transition-colors">
                            <Clock className="w-3 h-3" />
                            <span className="text-xs font-mono text-white/40">{fmtDate(report.created_at)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                            <button
                              onClick={(e) => { e.stopPropagation(); window.open(reportsService.getHtmlUrl(report.report_id), '_blank'); }}
                              className="p-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.05] hover:border-white/[0.1] text-white/40 hover:text-white transition-all shadow-sm"
                              title="Open in New Tab"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => handleDelete(e, report.report_id)}
                              className="p-2 rounded-lg bg-white/[0.03] hover:bg-red-500/10 border border-white/[0.05] hover:border-red-500/20 text-white/40 hover:text-red-400 transition-all shadow-sm"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </motion.div>
        )}
      </div>

      <ReportViewerModal
        reportId={viewingReport?.report_id || null}
        reportAddress={viewingReport?.property_address}
        onClose={() => setViewingReport(null)}
      />
    </div>
  );
};
