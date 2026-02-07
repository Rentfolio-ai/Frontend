/**
 * Reports Page — Redesigned with dark glassmorphic theme
 * Compact, organized, mode-aware report management
 */

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, ExternalLink, Printer, Trash2, X, Loader2,
  FileText, Building2, Home, Layers, RefreshCw, Target,
  BarChart3, TrendingUp, Shield, Zap, ChevronDown,
  ArrowUpDown, Eye, MoreHorizontal, Filter, Briefcase,
  BookOpen, Scale
} from 'lucide-react';
import { reportsService, type ReportSummary } from '@/services/reportsApi';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/useToast';

/* ═══════════════════════════════════════════════════════════════════════════ */
/*                              Configuration                                 */
/* ═══════════════════════════════════════════════════════════════════════════ */

type SortField = 'type' | 'property' | 'recommendation' | 'date';
type SortOrder = 'asc' | 'desc';

// Report type config — includes new mode-specific types
interface ReportTypeConfig {
  icon: React.ReactNode;
  label: string;
  shortLabel: string;
  color: string;
  bgColor: string;
}

const REPORT_CONFIG: Record<string, ReportTypeConfig> = {
  str:        { icon: <Building2 className="w-3.5 h-3.5" />, label: 'STR Analysis', shortLabel: 'STR', color: 'text-amber-400', bgColor: 'bg-amber-500/10 border-amber-500/20' },
  ltr:        { icon: <Home className="w-3.5 h-3.5" />, label: 'LTR Underwriting', shortLabel: 'LTR', color: 'text-emerald-400', bgColor: 'bg-emerald-500/10 border-emerald-500/20' },
  adu:        { icon: <Layers className="w-3.5 h-3.5" />, label: 'ADU Analysis', shortLabel: 'ADU', color: 'text-sky-400', bgColor: 'bg-sky-500/10 border-sky-500/20' },
  flip:       { icon: <RefreshCw className="w-3.5 h-3.5" />, label: 'Flip Analysis', shortLabel: 'Flip', color: 'text-orange-400', bgColor: 'bg-orange-500/10 border-orange-500/20' },
  full:       { icon: <FileText className="w-3.5 h-3.5" />, label: 'Full Report', shortLabel: 'Full', color: 'text-violet-400', bgColor: 'bg-violet-500/10 border-violet-500/20' },
  portfolio:  { icon: <Briefcase className="w-3.5 h-3.5" />, label: 'Portfolio Strategy', shortLabel: 'Portfolio', color: 'text-purple-400', bgColor: 'bg-purple-500/10 border-purple-500/20' },
  strategy:   { icon: <Target className="w-3.5 h-3.5" />, label: 'Investment Thesis', shortLabel: 'Strategy', color: 'text-indigo-400', bgColor: 'bg-indigo-500/10 border-indigo-500/20' },
  market:     { icon: <BookOpen className="w-3.5 h-3.5" />, label: 'Market Research', shortLabel: 'Market', color: 'text-cyan-400', bgColor: 'bg-cyan-500/10 border-cyan-500/20' },
  comparison: { icon: <Scale className="w-3.5 h-3.5" />, label: 'Comparative Analysis', shortLabel: 'CMA', color: 'text-[#D4A27F]', bgColor: 'bg-[#C08B5C]/10 border-[#C08B5C]/20' },
};

// Recommendation styles — expanded
const REC_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  buy:              { label: 'Buy', color: 'text-emerald-300', bg: 'bg-emerald-500/15 border-emerald-500/25' },
  pass:             { label: 'Pass', color: 'text-rose-300', bg: 'bg-rose-500/15 border-rose-500/25' },
  negotiate:        { label: 'Negotiate', color: 'text-amber-300', bg: 'bg-amber-500/15 border-amber-500/25' },
  hold:             { label: 'Hold', color: 'text-blue-300', bg: 'bg-blue-500/15 border-blue-500/25' },
  'explore further': { label: 'Explore', color: 'text-cyan-300', bg: 'bg-cyan-500/15 border-cyan-500/25' },
  'strong candidate': { label: 'Strong', color: 'text-emerald-300', bg: 'bg-emerald-500/15 border-emerald-500/25' },
  reposition:       { label: 'Reposition', color: 'text-violet-300', bg: 'bg-violet-500/15 border-violet-500/25' },
  monitor:          { label: 'Monitor', color: 'text-sky-300', bg: 'bg-sky-500/15 border-sky-500/25' },
};

/* ═══════════════════════════════════════════════════════════════════════════ */
/*                              Helpers                                       */
/* ═══════════════════════════════════════════════════════════════════════════ */

const fmtCurrency = (v: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v);

const fmtPct = (v: number) => `${(v * 100).toFixed(1)}%`;

const fmtDate = (iso: string) => {
  const d = new Date(iso);
  const now = Date.now();
  const diff = now - d.getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(diff / 3_600_000);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(diff / 86_400_000);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const getReportConfig = (type: string): ReportTypeConfig =>
  REPORT_CONFIG[type] || { icon: <FileText className="w-3.5 h-3.5" />, label: type, shortLabel: type, color: 'text-white/60', bgColor: 'bg-white/5 border-white/10' };

const getRecConfig = (rec: string) =>
  REC_CONFIG[rec.toLowerCase()] || { label: rec, color: 'text-white/60', bg: 'bg-white/5 border-white/10' };

/* ═══════════════════════════════════════════════════════════════════════════ */
/*                              Filter Chips                                  */
/* ═══════════════════════════════════════════════════════════════════════════ */

interface FilterChip { id: string; label: string; icon?: React.ReactNode }

const FILTER_CHIPS: FilterChip[] = [
  { id: 'all', label: 'All' },
  { id: 'str', label: 'STR', icon: <Building2 className="w-3 h-3" /> },
  { id: 'ltr', label: 'LTR', icon: <Home className="w-3 h-3" /> },
  { id: 'flip', label: 'Flip', icon: <RefreshCw className="w-3 h-3" /> },
  { id: 'full', label: 'Full', icon: <FileText className="w-3 h-3" /> },
  { id: 'portfolio', label: 'Portfolio', icon: <Briefcase className="w-3 h-3" /> },
  { id: 'market', label: 'Market', icon: <BookOpen className="w-3 h-3" /> },
  { id: 'buy', label: 'Buy' },
  { id: 'pass', label: 'Pass' },
  { id: 'negotiate', label: 'Negotiate' },
];

/* ═══════════════════════════════════════════════════════════════════════════ */
/*                              Stats Bar                                     */
/* ═══════════════════════════════════════════════════════════════════════════ */

const StatsBar: React.FC<{ reports: ReportSummary[] }> = ({ reports }) => {
  const totalReports = reports.length;
  const buyCount = reports.filter(r => r.recommendation.toLowerCase() === 'buy').length;
  const avgCapRate = reports.length > 0
    ? reports.reduce((sum, r) => sum + (r.key_metrics?.cap_rate || 0), 0) / reports.length
    : 0;
  const avgCashFlow = reports.length > 0
    ? reports.reduce((sum, r) => sum + (r.key_metrics?.monthly_cash_flow || 0), 0) / reports.length
    : 0;

  const stats = [
    { label: 'Total Reports', value: String(totalReports), icon: <FileText className="w-3.5 h-3.5" /> },
    { label: 'Buy Recs', value: String(buyCount), icon: <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> },
    { label: 'Avg Cap Rate', value: fmtPct(avgCapRate), icon: <Shield className="w-3.5 h-3.5" /> },
    { label: 'Avg Cash Flow', value: fmtCurrency(avgCashFlow), icon: <Zap className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="grid grid-cols-4 gap-3 mb-5">
      {stats.map((s) => (
        <div key={s.label} className="px-3.5 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.08] backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-white/40">{s.icon}</span>
            <span className="text-[10px] font-medium uppercase tracking-wider text-white/40">{s.label}</span>
          </div>
          <span className="text-lg font-semibold text-white/90">{s.value}</span>
        </div>
      ))}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════ */
/*                              Row Context Menu                              */
/* ═══════════════════════════════════════════════════════════════════════════ */

interface ContextMenuProps {
  reportId: string;
  onView: () => void;
  onPrint: () => void;
  onDelete: () => void;
  onClose: () => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ onView, onPrint, onDelete, onClose }) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  return (
    <motion.div
      ref={menuRef}
      initial={{ opacity: 0, scale: 0.95, y: -4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -4 }}
      transition={{ duration: 0.12 }}
      className="absolute right-0 top-full mt-1 w-44 bg-[#1e1e24] border border-white/[0.10] rounded-xl shadow-2xl z-30 overflow-hidden backdrop-blur-xl"
    >
      {[
        { label: 'View Report', icon: <Eye className="w-3.5 h-3.5" />, action: onView },
        { label: 'Open in New Tab', icon: <ExternalLink className="w-3.5 h-3.5" />, action: onView },
        { label: 'Print', icon: <Printer className="w-3.5 h-3.5" />, action: onPrint },
      ].map((item) => (
        <button
          key={item.label}
          onClick={(e) => { e.stopPropagation(); item.action(); }}
          className="w-full px-3.5 py-2 text-left text-[12px] text-white/70 hover:bg-white/[0.05] hover:text-white/90 transition-colors flex items-center gap-2.5"
        >
          {item.icon}
          {item.label}
        </button>
      ))}
      <div className="border-t border-white/[0.06] my-0.5" />
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        className="w-full px-3.5 py-2 text-left text-[12px] text-rose-400/80 hover:bg-rose-500/10 hover:text-rose-300 transition-colors flex items-center gap-2.5"
      >
        <Trash2 className="w-3.5 h-3.5" />
        Delete
      </button>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════ */
/*                              Expanded Metrics                              */
/* ═══════════════════════════════════════════════════════════════════════════ */

const MetricsPanel: React.FC<{ report: ReportSummary; onView: () => void }> = ({ report, onView }) => {
  const km = report.key_metrics;
  if (!km) return null;

  const metrics = [
    { label: 'Monthly Cash Flow', value: fmtCurrency(km.monthly_cash_flow), positive: km.monthly_cash_flow > 0, icon: <TrendingUp className="w-3.5 h-3.5" /> },
    { label: 'Cap Rate', value: fmtPct(km.cap_rate), positive: km.cap_rate >= 0.05, icon: <Shield className="w-3.5 h-3.5" /> },
    { label: 'Cash-on-Cash', value: fmtPct(km.cash_on_cash), positive: km.cash_on_cash >= 0.08, icon: <Zap className="w-3.5 h-3.5" /> },
    { label: 'DSCR', value: km.dscr.toFixed(2), positive: km.dscr >= 1.2, icon: <BarChart3 className="w-3.5 h-3.5" /> },
  ];

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="overflow-hidden"
    >
      <div className="px-5 py-4 bg-white/[0.03] border-b border-white/[0.06]">
        <div className="grid grid-cols-4 gap-3 mb-3">
          {metrics.map((m) => (
            <div key={m.label} className="px-3 py-2.5 rounded-lg bg-white/[0.05] border border-white/[0.07]">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-white/25">{m.icon}</span>
                <span className="text-[10px] text-white/35 uppercase tracking-wide">{m.label}</span>
              </div>
              <span className={cn(
                'text-base font-semibold',
                m.positive ? 'text-emerald-400/90' : 'text-white/75'
              )}>
                {m.value}
              </span>
            </div>
          ))}
        </div>
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={(e) => { e.stopPropagation(); onView(); }}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-[#A8734A]/90 to-[#A8734A]/90 text-white rounded-lg text-[12px] font-medium shadow-lg shadow-[#C08B5C]/10 hover:from-[#C08B5C] hover:to-[#C08B5C] transition-all"
        >
          <Eye className="w-3 h-3" />
          View Full Report
        </motion.button>
      </div>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════ */
/*                              Table Header                                  */
/* ═══════════════════════════════════════════════════════════════════════════ */

const SortableHeader: React.FC<{
  label: string;
  field: SortField;
  currentField: SortField;
  currentOrder: SortOrder;
  onSort: (f: SortField) => void;
  className?: string;
}> = ({ label, field, currentField, currentOrder, onSort, className }) => (
  <button
    onClick={() => onSort(field)}
    className={cn(
      'flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-white/35 hover:text-white/55 transition-colors',
      currentField === field && 'text-white/55',
      className,
    )}
  >
    {label}
    <ArrowUpDown className={cn(
      'w-3 h-3 transition-opacity',
      currentField === field ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'
    )} />
    {currentField === field && (
      <span className="text-[8px] text-white/30">{currentOrder === 'asc' ? '↑' : '↓'}</span>
    )}
  </button>
);

/* ═══════════════════════════════════════════════════════════════════════════ */
/*                              Main Component                                */
/* ═══════════════════════════════════════════════════════════════════════════ */

export const ReportsPage: React.FC = () => {
  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const { success: showSuccess, error: showError } = useToast();

  // Fetch reports
  useEffect(() => {
    const load = async () => {
      try {
        const data = await reportsService.list();
        setReports(data.reports);
      } catch (err) {
        console.error('[ReportsPage] Failed to load reports:', err);
        setError('Failed to load reports');
      } finally {
        setIsLoading(false);
      }
    };
    load();
    const iv = setInterval(load, 30_000);
    return () => clearInterval(iv);
  }, []);

  // Filter
  const filtered = reports.filter(r => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const cfg = getReportConfig(r.report_type);
      if (!cfg.label.toLowerCase().includes(q) && !r.property_address.toLowerCase().includes(q)) return false;
    }
    if (activeFilter !== 'all') {
      const typeFilters = Object.keys(REPORT_CONFIG);
      if (typeFilters.includes(activeFilter)) {
        if (r.report_type !== activeFilter) return false;
      } else {
        if (r.recommendation.toLowerCase() !== activeFilter) return false;
      }
    }
    return true;
  });

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    let cmp = 0;
    switch (sortField) {
      case 'type':
        cmp = getReportConfig(a.report_type).label.localeCompare(getReportConfig(b.report_type).label);
        break;
      case 'property':
        cmp = a.property_address.localeCompare(b.property_address);
        break;
      case 'recommendation':
        cmp = a.recommendation.localeCompare(b.recommendation);
        break;
      case 'date':
        cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        break;
    }
    return sortOrder === 'asc' ? cmp : -cmp;
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortOrder(o => o === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortOrder('desc'); }
  };

  const handleDelete = useCallback(async (id: string) => {
    try {
      await reportsService.delete(id);
      setReports(prev => prev.filter(r => r.report_id !== id));
      setDeleteTarget(null);
      if (expandedRow === id) setExpandedRow(null);
      showSuccess('Report deleted');
    } catch {
      showError('Failed to delete report');
    }
  }, [expandedRow, showSuccess, showError]);

  const handleView = (id: string) => {
    window.open(reportsService.getHtmlUrl(id), '_blank');
    setMenuOpen(null);
  };

  const handlePrint = (id: string) => {
    const w = window.open(reportsService.getHtmlUrl(id), '_blank');
    if (w) w.onload = () => w.print();
    setMenuOpen(null);
  };

  /* ─────────────────── Render ─────────────────── */

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: '#111114' }}>
      {/* ──── Header ──── */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-end justify-between mb-5">
          <div>
            <h1 className="text-xl font-semibold text-white/90 tracking-tight">Reports</h1>
            <p className="text-[12px] text-white/35 mt-0.5">Investment reports generated by Vasthu</p>
          </div>
          {!isLoading && reports.length > 0 && (
            <span className="text-[11px] text-white/25 tabular-nums">
              {sorted.length}{sorted.length !== reports.length ? ` of ${reports.length}` : ''} reports
            </span>
          )}
        </div>

        {/* Stats */}
        {!isLoading && reports.length > 0 && <StatsBar reports={reports} />}

        {/* Search + Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
            <input
              type="text"
              placeholder="Search by report type or property..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-9 bg-white/[0.06] border border-white/[0.08] rounded-lg text-[12px] text-white/85 placeholder-white/30 focus:outline-none focus:border-white/[0.15] focus:ring-1 focus:ring-white/[0.08] transition-all"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 hover:bg-white/[0.05] rounded transition-colors">
                <X className="w-3 h-3 text-white/30" />
              </button>
            )}
          </div>

          {/* Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
            <Filter className="w-3 h-3 text-white/20 flex-shrink-0 mr-1" />
            {FILTER_CHIPS.map(chip => (
              <button
                key={chip.id}
                onClick={() => setActiveFilter(activeFilter === chip.id ? 'all' : chip.id)}
                className={cn(
                  'flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all whitespace-nowrap',
                  activeFilter === chip.id
                    ? 'bg-[#C08B5C]/15 text-[#D4A27F] border-[#C08B5C]/25'
                    : 'bg-white/[0.04] text-white/45 border-white/[0.07] hover:bg-white/[0.06] hover:text-white/60'
                )}
              >
                {chip.icon}
                {chip.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ──── Content ──── */}
      {isLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-6 h-6 text-white/30 animate-spin" />
          <p className="text-[12px] text-white/40">Loading reports...</p>
        </div>
      ) : error ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-4">
            <X className="w-5 h-5 text-rose-400" />
          </div>
          <h3 className="text-sm font-medium text-white/60 mb-1">Failed to load reports</h3>
          <p className="text-[11px] text-white/30 mb-4 max-w-xs">
            {error.includes('network') ? 'Check your internet connection.' : 'Please try refreshing.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-3.5 py-1.5 bg-white/[0.05] text-white/50 rounded-lg hover:bg-white/[0.08] transition-colors text-[11px] font-medium"
          >
            Refresh
          </button>
        </div>
      ) : sorted.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
          {searchQuery || activeFilter !== 'all' ? (
            <>
              <Search className="w-10 h-10 text-white/10 mb-4" />
              <h3 className="text-sm font-medium text-white/55 mb-1">No matching reports</h3>
              <p className="text-[11px] text-white/30 mb-3">Try adjusting your search or filters</p>
              <button
                onClick={() => { setSearchQuery(''); setActiveFilter('all'); }}
                className="px-3.5 py-1.5 bg-white/[0.05] text-white/50 rounded-lg hover:bg-white/[0.08] transition-colors text-[11px] font-medium"
              >
                Clear Filters
              </button>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#C08B5C]/10 to-[#D4A27F]/5 border border-white/[0.08] flex items-center justify-center mb-4">
                <FileText className="w-7 h-7 text-[#D4A27F]/40" />
              </div>
              <h3 className="text-sm font-medium text-white/55 mb-1">No reports yet</h3>
              <p className="text-[11px] text-white/30 mb-5 max-w-[260px]">
                Generate investment reports by chatting with Vasthu. Reports are saved automatically.
              </p>
              <div className="flex flex-col gap-1.5 text-[11px] text-white/25">
                <span>Ask Vasthu to analyze a property</span>
                <span>Request a financial analysis or P&L</span>
                <span>Reports appear here automatically</span>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="flex-1 overflow-hidden flex flex-col mx-6 mb-6 rounded-xl border border-white/[0.08] bg-white/[0.04]">
          {/* Table Header */}
          <div className="grid grid-cols-[1.8fr_2.2fr_0.8fr_0.8fr_44px] gap-3 px-4 py-2.5 border-b border-white/[0.06] bg-white/[0.04]">
            <SortableHeader label="Report" field="type" currentField={sortField} currentOrder={sortOrder} onSort={handleSort} />
            <SortableHeader label="Property" field="property" currentField={sortField} currentOrder={sortOrder} onSort={handleSort} />
            <SortableHeader label="Rec" field="recommendation" currentField={sortField} currentOrder={sortOrder} onSort={handleSort} />
            <SortableHeader label="Date" field="date" currentField={sortField} currentOrder={sortOrder} onSort={handleSort} />
            <span />
          </div>

          {/* Table Body */}
          <div className="flex-1 overflow-y-auto">
            {sorted.map(report => {
              const isExpanded = expandedRow === report.report_id;
              const cfg = getReportConfig(report.report_type);
              const rec = getRecConfig(report.recommendation);

              return (
                <div key={report.report_id}>
                  <div
                    onClick={() => setExpandedRow(isExpanded ? null : report.report_id)}
                    className={cn(
                      'grid grid-cols-[1.8fr_2.2fr_0.8fr_0.8fr_44px] gap-3 px-4 py-2.5 border-b border-white/[0.03] transition-all cursor-pointer group',
                      isExpanded ? 'bg-white/[0.05]' : 'hover:bg-white/[0.03]'
                    )}
                  >
                    {/* Type */}
                    <div className="flex items-center gap-2.5 min-w-0">
                      <ChevronDown className={cn(
                        'w-3 h-3 text-white/20 flex-shrink-0 transition-transform duration-200',
                        !isExpanded && '-rotate-90'
                      )} />
                      <div className={cn('w-7 h-7 rounded-lg border flex items-center justify-center flex-shrink-0', cfg.bgColor, cfg.color)}>
                        {cfg.icon}
                      </div>
                      <div className="min-w-0">
                        <span className="text-[12px] font-medium text-white/80 truncate block">{cfg.label}</span>
                        <span className="text-[10px] text-white/25">{cfg.shortLabel}</span>
                      </div>
                    </div>

                    {/* Property */}
                    <div className="flex items-center min-w-0">
                      <span className="text-[12px] text-white/55 truncate" title={report.property_address}>
                        {report.property_address}
                      </span>
                    </div>

                    {/* Recommendation */}
                    <div className="flex items-center">
                      <span className={cn(
                        'px-2 py-0.5 rounded-md text-[10px] font-semibold border',
                        rec.bg, rec.color
                      )}>
                        {rec.label}
                      </span>
                    </div>

                    {/* Date */}
                    <div className="flex items-center">
                      <span className="text-[11px] text-white/35 tabular-nums">{fmtDate(report.created_at)}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end relative">
                      <button
                        onClick={e => { e.stopPropagation(); setMenuOpen(menuOpen === report.report_id ? null : report.report_id); }}
                        className="p-1 rounded-md hover:bg-white/[0.06] transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <MoreHorizontal className="w-3.5 h-3.5 text-white/40" />
                      </button>
                      <AnimatePresence>
                        {menuOpen === report.report_id && (
                          <ContextMenu
                            reportId={report.report_id}
                            onView={() => handleView(report.report_id)}
                            onPrint={() => handlePrint(report.report_id)}
                            onDelete={() => { setDeleteTarget(report.report_id); setMenuOpen(null); }}
                            onClose={() => setMenuOpen(null)}
                          />
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Expanded Metrics */}
                  <AnimatePresence>
                    {isExpanded && (
                      <MetricsPanel report={report} onView={() => handleView(report.report_id)} />
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ──── Delete Confirmation ──── */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#1e1e24] border border-white/[0.10] rounded-2xl p-5 max-w-sm w-full shadow-2xl"
            >
              <div className="flex items-start gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center flex-shrink-0">
                  <Trash2 className="w-4 h-4 text-rose-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white/90 mb-0.5">Delete Report?</h3>
                  <p className="text-[11px] text-white/40">This action cannot be undone.</p>
                </div>
              </div>
              <div className="flex items-center gap-2 justify-end">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="px-3.5 py-1.5 text-[12px] text-white/50 hover:text-white/70 transition-colors rounded-lg hover:bg-white/[0.04]"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteTarget)}
                  className="px-3.5 py-1.5 text-[12px] bg-rose-500/90 text-white rounded-lg hover:bg-rose-500 transition-colors font-medium"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
