import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Search, ExternalLink, Printer, Trash2, X,
  FileText, RefreshCw, ArrowUpDown, ArrowLeft,
  TrendingUp, BarChart3, DollarSign, MessageSquare,
} from 'lucide-react';
import { reportsService, type ReportSummary } from '../../services/reportsApi';
import { cn } from '../../lib/utils';
import { useToast } from '../../hooks/useToast';
import { AmbientBackground } from '../ui/AmbientBackground';

type SortField = 'type' | 'property' | 'recommendation' | 'date';
type SortOrder = 'asc' | 'desc';
type TabId = 'all' | 'buy-signals' | 'recent';

interface ReportTypeConfig {
  label: string;
  shortLabel: string;
  color: string;
  textClass: string;
  bgClass: string;
}

const REPORT_CONFIG: Record<string, ReportTypeConfig> = {
  str:        { label: 'STR Analysis',         shortLabel: 'STR',       color: '#34d399', textClass: 'text-emerald-400', bgClass: 'bg-emerald-500/10' },
  ltr:        { label: 'LTR Underwriting',     shortLabel: 'LTR',       color: '#38bdf8', textClass: 'text-sky-400',     bgClass: 'bg-sky-500/10' },
  adu:        { label: 'ADU Analysis',         shortLabel: 'ADU',       color: '#fbbf24', textClass: 'text-amber-400',   bgClass: 'bg-amber-500/10' },
  flip:       { label: 'Flip Analysis',        shortLabel: 'Flip',      color: '#fb7185', textClass: 'text-rose-400',    bgClass: 'bg-rose-500/10' },
  full:       { label: 'Full Report',          shortLabel: 'Full',      color: '#5eead4', textClass: 'text-teal-300',    bgClass: 'bg-teal-500/10' },
  portfolio:  { label: 'Portfolio Strategy',   shortLabel: 'Portfolio',  color: '#a78bfa', textClass: 'text-violet-400',  bgClass: 'bg-violet-500/10' },
  strategy:   { label: 'Investment Thesis',    shortLabel: 'Strategy',  color: '#e879f9', textClass: 'text-fuchsia-400', bgClass: 'bg-fuchsia-500/10' },
  market:     { label: 'Market Research',      shortLabel: 'Market',    color: '#22d3ee', textClass: 'text-cyan-400',    bgClass: 'bg-cyan-500/10' },
  comparison: { label: 'Comparative Analysis', shortLabel: 'CMA',       color: '#818cf8', textClass: 'text-indigo-400',  bgClass: 'bg-indigo-500/10' },
};

const REC_CONFIG: Record<string, { label: string; dotClass: string; textClass: string }> = {
  buy:                { label: 'Buy',       dotClass: 'bg-emerald-400/70', textClass: 'text-emerald-400/70' },
  pass:               { label: 'Pass',      dotClass: 'bg-white/25',      textClass: 'text-white/35' },
  negotiate:          { label: 'Negotiate', dotClass: 'bg-amber-400/70',  textClass: 'text-amber-400/70' },
  hold:               { label: 'Hold',      dotClass: 'bg-sky-400/70',    textClass: 'text-sky-400/70' },
  'explore further':  { label: 'Explore',   dotClass: 'bg-cyan-400/70',   textClass: 'text-cyan-400/70' },
  'strong candidate': { label: 'Strong',    dotClass: 'bg-emerald-300/70', textClass: 'text-emerald-300/70' },
  reposition:         { label: 'Reposition', dotClass: 'bg-violet-400/70', textClass: 'text-violet-400/70' },
  monitor:            { label: 'Monitor',   dotClass: 'bg-white/30',      textClass: 'text-white/40' },
};

const getReportConfig = (type: string): ReportTypeConfig =>
  REPORT_CONFIG[type] || { label: type, shortLabel: type, color: '#555', textClass: 'text-white/50', bgClass: 'bg-white/5' };

const getRecConfig = (rec: string) =>
  REC_CONFIG[rec.toLowerCase()] || { label: rec, dotClass: 'bg-white/40', textClass: 'text-white/50' };

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
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const isRecent = (iso: string) => {
  const d = new Date(iso);
  const now = new Date();
  return (now.getTime() - d.getTime()) < 7 * 24 * 60 * 60 * 1000;
};

const isBuySignal = (rec: string) =>
  ['buy', 'strong candidate'].includes(rec.toLowerCase());

const KPIStrip: React.FC<{ reports: ReportSummary[] }> = ({ reports }) => {
  const total = reports.length;
  const buys = reports.filter(r => isBuySignal(r.recommendation)).length;
  const withCap = reports.filter(r => r.key_metrics?.cap_rate != null && !isNaN(r.key_metrics.cap_rate) && r.key_metrics.cap_rate > 0);
  const avgCap = withCap.length > 0 ? withCap.reduce((s, r) => s + r.key_metrics.cap_rate, 0) / withCap.length : 0;
  const withCF = reports.filter(r => r.key_metrics?.monthly_cash_flow != null && !isNaN(r.key_metrics.monthly_cash_flow));
  const avgCF = withCF.length > 0 ? withCF.reduce((s, r) => s + r.key_metrics.monthly_cash_flow, 0) / withCF.length : 0;

  const kpis = [
    { label: 'Total Reports', value: String(total), icon: FileText },
    { label: 'Buy Signals', value: String(buys), icon: TrendingUp },
    { label: 'Avg Cap Rate', value: avgCap > 0 ? fmtPct(avgCap) : '--', icon: BarChart3 },
    { label: 'Avg Cash Flow', value: avgCF !== 0 ? `${fmtCurrency(avgCF)}/mo` : '--', icon: DollarSign },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-1 mb-4">
      {kpis.map((kpi) => (
        <div key={kpi.label} className="rounded-lg bg-white/[0.03] border border-white/[0.04] px-3 py-2.5">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-[10px] text-white/30 font-medium">{kpi.label}</p>
            <kpi.icon className="w-3 h-3 text-white/20" />
          </div>
          <p className="text-[17px] font-mono font-bold text-white/90 tracking-tight leading-none">{kpi.value}</p>
        </div>
      ))}
    </div>
  );
};

const EmptyState: React.FC<{ onAnalyze: () => void }> = ({ onAnalyze }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <div className="w-12 h-12 rounded-full bg-white/[0.04] flex items-center justify-center mb-4">
      <FileText className="w-5 h-5 text-white/20" strokeWidth={1.5} />
    </div>
    <h2 className="text-[14px] font-medium text-white/70 mb-1">No reports yet</h2>
    <p className="text-[12px] text-white/30 mb-5">
      Analyze a property in chat to generate your first report.
    </p>
    <button
      onClick={onAnalyze}
      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.09] text-[12px] font-medium text-white/60 hover:text-white/80"
    >
      <MessageSquare className="w-3.5 h-3.5" strokeWidth={1.5} />
      Analyze a Property
    </button>
  </div>
);

const LoadingSkeleton: React.FC = () => (
  <div className="space-y-4">
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-1">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-[60px] rounded-lg bg-white/[0.03] border border-white/[0.04] animate-pulse" />
      ))}
    </div>
    <div className="rounded-lg bg-white/[0.03] border border-white/[0.04] overflow-hidden">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-10 border-b border-white/[0.03] animate-pulse" />
      ))}
    </div>
  </div>
);

const ReportRow: React.FC<{
  report: ReportSummary;
  onView: () => void;
  onDelete: (e: React.MouseEvent) => void;
  onOpenTab: (e: React.MouseEvent) => void;
}> = ({ report, onView, onDelete, onOpenTab }) => {
  const cfg = getReportConfig(report.report_type);
  const rec = getRecConfig(report.recommendation);
  return (
    <tr onClick={onView} className="group hover:bg-white/[0.02] cursor-pointer border-b border-white/[0.04] last:border-b-0">
      <td className="px-3 py-2.5">
        <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-white/[0.05] text-white/50">
          {cfg.shortLabel}
        </span>
      </td>
      <td className="px-3 py-2.5">
        <p className="text-[12px] text-white/65 group-hover:text-white/90 truncate max-w-[300px]" title={report.property_address}>
          {report.property_address}
        </p>
      </td>
      <td className="px-3 py-2.5">
        <span className="flex items-center gap-1.5 w-fit">
          <span className={cn("w-1.5 h-1.5 rounded-full", rec.dotClass)} />
          <span className={cn("text-[10px] font-semibold", rec.textClass)}>{rec.label}</span>
        </span>
      </td>
      <td className="px-3 py-2.5">
        <div className="flex items-center gap-2.5 text-[10px] font-mono text-white/30">
          {report.key_metrics?.cap_rate != null && !isNaN(report.key_metrics.cap_rate) && report.key_metrics.cap_rate > 0 && (
            <span>{fmtPct(report.key_metrics.cap_rate)} cap</span>
          )}
          {report.key_metrics?.monthly_cash_flow != null && !isNaN(report.key_metrics.monthly_cash_flow) && report.key_metrics.monthly_cash_flow !== 0 && (
            <span className={report.key_metrics.monthly_cash_flow > 0 ? 'text-emerald-400/50' : 'text-rose-400/50'}>
              {fmtCurrency(report.key_metrics.monthly_cash_flow)}/mo
            </span>
          )}
          {report.key_metrics?.cash_on_cash != null && !isNaN(report.key_metrics.cash_on_cash) && report.key_metrics.cash_on_cash > 0 && (
            <span>{fmtPct(report.key_metrics.cash_on_cash)} CoC</span>
          )}
        </div>
      </td>
      <td className="px-3 py-2.5">
        <span className="text-[10px] font-mono text-white/20">{fmtDate(report.created_at)}</span>
      </td>
      <td className="px-3 py-2.5 text-right">
        <div className="flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100">
          <button onClick={onOpenTab} className="p-1 rounded hover:bg-white/[0.08] text-white/25 hover:text-white/60" title="Open in new tab">
            <ExternalLink className="w-3 h-3" />
          </button>
          <button onClick={onDelete} className="p-1 rounded hover:bg-red-500/10 text-white/25 hover:text-red-400" title="Delete">
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </td>
    </tr>
  );
};

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
      className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-6xl h-[90vh] rounded-xl overflow-hidden flex flex-col bg-[#131316] border border-white/[0.08] shadow-2xl shadow-black/40"
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.06] flex-shrink-0">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              {cfg && (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-white/[0.05] text-white/50">
                  {cfg.shortLabel}
                </span>
              )}
              <h3 className="text-[13px] font-semibold text-white/90">{cfg ? cfg.label : 'Report'}</h3>
            </div>
            {reportAddress && <p className="text-[11px] text-white/35 truncate ml-[26px]">{reportAddress}</p>}
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <button onClick={() => window.open(htmlUrl, '_blank')} className="p-1.5 rounded hover:bg-white/[0.06] text-white/30 hover:text-white/60" title="Open in new tab">
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => iframeRef.current?.contentWindow?.print()} className="p-1.5 rounded hover:bg-white/[0.06] text-white/30 hover:text-white/60" title="Print / Save PDF">
              <Printer className="w-3.5 h-3.5" />
            </button>
            <div className="w-px h-4 mx-1 bg-white/[0.06]" />
            <button onClick={onClose} className="p-1.5 rounded hover:bg-white/[0.06] text-white/30 hover:text-white/60">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="flex-1 bg-[#F7F8FA] relative">
          <iframe ref={iframeRef} src={htmlUrl} className="w-full h-full border-0" title="Report Content" />
        </div>
      </div>
    </div>
  );
};

const TABS: { id: TabId; label: string; count?: (reports: ReportSummary[]) => number }[] = [
  { id: 'all', label: 'All' },
  { id: 'buy-signals', label: 'Buy Signals', count: (reports) => reports.filter(r => isBuySignal(r.recommendation)).length },
  { id: 'recent', label: 'Recent', count: (reports) => reports.filter(r => isRecent(r.created_at)).length },
];

export const ReportsPage: React.FC<{ onNavigateToChat?: () => void; onBack?: () => void }> = ({ onNavigateToChat, onBack }) => {
  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewingReport, setViewingReport] = useState<ReportSummary | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('all');
  const { success, error } = useToast();

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

  useEffect(() => {
    const handler = () => loadReports(true);
    window.addEventListener('reports-updated', handler);
    return () => window.removeEventListener('reports-updated', handler);
  }, [loadReports]);

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortOrder(o => o === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortOrder('desc'); }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm('Delete this report?')) return;
    try {
      await reportsService.delete(id);
      setReports(prev => prev.filter(r => r.report_id !== id));
      success('Report deleted');
    } catch { error('Failed to delete report'); }
  };

  const hasReports = reports.length > 0;

  const tabFilteredReports = reports.filter(r => {
    if (activeTab === 'buy-signals') return isBuySignal(r.recommendation);
    if (activeTab === 'recent') return isRecent(r.created_at);
    return true;
  });

  const filteredReports = tabFilteredReports
    .filter(r => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return r.property_address.toLowerCase().includes(q) ||
             r.report_type.toLowerCase().includes(q) ||
             r.recommendation.toLowerCase().includes(q);
    })
    .sort((a, b) => {
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
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="h-full flex flex-col overflow-hidden bg-[#161619] relative"
    >
      <AmbientBackground variant="reports" />
      <div className="px-6 pt-6 flex-shrink-0 relative z-10">
        <div className="space-y-1 mb-1">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-shrink-0">
              {onBack && (
                <button
                  onClick={onBack}
                  className="w-8 h-8 rounded-lg hover:bg-white/[0.04] border border-transparent hover:border-white/[0.08] flex items-center justify-center transition-all group -ml-1"
                  title="Back to Home"
                >
                  <ArrowLeft className="w-4 h-4 text-white/50 group-hover:text-white transition-colors" />
                </button>
              )}
              <h1 className="text-lg font-bold gradient-text">Reports</h1>
            </div>
            {hasReports && (
              <div className="flex items-center gap-2 flex-1 max-w-[320px]">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06]
                               text-[12px] text-white/80 placeholder:text-white/20
                               focus:outline-none focus:border-[#C08B5C]/30 focus:ring-1 focus:ring-[#C08B5C]/20
                               transition-all duration-150"
                  />
                </div>
                <button
                  onClick={() => loadReports(true)}
                  disabled={isRefreshing}
                  className="w-7 h-7 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center
                             text-white/30 hover:text-[#D4A27F]/70 hover:border-[#C08B5C]/20 transition-all
                             disabled:opacity-40 flex-shrink-0"
                  title="Refresh"
                >
                  <RefreshCw className={cn("w-3.5 h-3.5", isRefreshing && "animate-spin")} />
                </button>
              </div>
            )}
          </div>
          <div className="flex items-center justify-between">
            <p className="text-[12px] text-white/35">
              Investment analysis reports
            </p>
            <span className="text-[10px] text-white/20 font-mono">
              {reports.length} reports
            </span>
          </div>
        </div>

        {hasReports && (
          <div className="flex items-center gap-0 mt-4 border-b border-white/[0.06]">
            {TABS.map(tab => {
              const count = tab.count ? tab.count(reports) : reports.length;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "relative px-3.5 pb-2.5 text-[12px] font-medium",
                    isActive ? "text-white/90" : "text-white/35 hover:text-white/55"
                  )}
                >
                  <span className="flex items-center gap-1.5">
                    {tab.label}
                    <span className={cn(
                      "text-[10px] font-mono px-1 rounded",
                      isActive ? "text-white/50" : "text-white/20"
                    )}>
                      {count}
                    </span>
                  </span>
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/60 rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-6 pt-4 pb-6 relative z-10" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.06) transparent' }}>
        {isLoading ? (
          <LoadingSkeleton />
        ) : !hasReports ? (
          <EmptyState onAnalyze={() => onNavigateToChat?.()} />
        ) : (
          <>
            <span className="text-[12px] text-white/30 font-medium">Key Metrics</span>
            <div className="mt-2">
              <KPIStrip reports={reports} />
            </div>

            {filteredReports.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <p className="text-[12px] text-white/30">
                  {searchQuery ? `No reports matching "${searchQuery}"` : 'No reports in this tab'}
                </p>
              </div>
            ) : (
              <div className="rounded-lg overflow-hidden bg-white/[0.03] border border-white/[0.04]">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/[0.05]">
                      {[
                        { field: 'type' as SortField, label: 'Type', width: 'w-[80px]' },
                        { field: 'property' as SortField, label: 'Property', width: '' },
                        { field: 'recommendation' as SortField, label: 'Signal', width: 'w-[80px]' },
                        { field: undefined as SortField | undefined, label: 'Metrics', width: 'w-[200px]' },
                        { field: 'date' as SortField, label: 'Date', width: 'w-[80px]' },
                        { field: undefined as SortField | undefined, label: '', width: 'w-[60px]' },
                      ].map((col, i) => (
                        <th
                          key={i}
                          className={cn(
                            "px-3 py-2.5 text-[10px] uppercase font-semibold text-white/25 tracking-wider select-none",
                            col.width,
                            col.field && "cursor-pointer hover:text-white/50",
                            i === 5 && "text-right"
                          )}
                          onClick={col.field ? () => handleSort(col.field!) : undefined}
                        >
                          {col.field ? (
                            <span className="flex items-center gap-1">
                              {col.label}
                              <ArrowUpDown className={cn("w-2.5 h-2.5", sortField === col.field ? "opacity-60" : "opacity-20")} />
                            </span>
                          ) : col.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReports.map(report => (
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
          </>
        )}
      </div>

      <ReportViewerModal
        reportId={viewingReport?.report_id || null}
        reportAddress={viewingReport?.property_address}
        reportType={viewingReport?.report_type}
        onClose={() => setViewingReport(null)}
      />
    </motion.div>
  );
};
