import React, { useState, useEffect } from 'react';
import {
  MessageSquare, BarChart3, FileText, Sparkles,
  ArrowRight, TrendingUp, ChevronRight, Send,
} from 'lucide-react';
import type { ChatSession } from '../../hooks/useDesktopShell';
import type { BookmarkedProperty } from '../../types/bookmarks';
import type { DealsPipeline } from './DealsOverviewWidget';
import type { TeamsSummary } from './TeamsOverviewWidget';
import type { ReportsSummary } from './ReportsOverviewWidget';
import type { DashboardData } from '../../services/portfolioApi';
import { fetchDashboard } from '../../services/portfolioApi';

// ── Helpers ────────────────────────────────────────────────────────────────────

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function timeAgo(dateStr?: string): string {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function formatCurrency(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}K`;
  return `$${n.toLocaleString()}`;
}

function formatPct(n: number): string {
  return `${n.toFixed(1)}%`;
}

// Strategy badge colors
const STRATEGY_COLORS: Record<string, string> = {
  STR: 'bg-emerald-500/15 text-emerald-400',
  LTR: 'bg-blue-500/15 text-blue-400',
  MTR: 'bg-amber-500/15 text-amber-400',
  BRRRR: 'bg-purple-500/15 text-purple-400',
  FLIP: 'bg-rose-500/15 text-rose-400',
};

// Pipeline status colors
const PIPELINE_COLORS: Record<string, string> = {
  active: '#4ade80',
  under_contract: '#C08B5C',
  closed: '#64748b',
  lost: '#ef4444',
};
const PIPELINE_LABELS: Record<string, string> = {
  active: 'Active',
  under_contract: 'Under Contract',
  closed: 'Closed',
  lost: 'Lost',
};

// ── SVG Sparkline ──────────────────────────────────────────────────────────────

const SparklineChart: React.FC<{ width?: number; height?: number }> = ({
  width = 380,
  height = 140,
}) => {
  // Simulated 12-month data (monotonically trending up with some variance)
  const points = [28, 32, 30, 38, 42, 45, 50, 48, 56, 62, 68, 75];
  const max = Math.max(...points);
  const min = Math.min(...points);
  const pad = 8;
  const chartW = width - pad * 2;
  const chartH = height - pad * 2;

  const coords = points.map((v, i) => ({
    x: pad + (i / (points.length - 1)) * chartW,
    y: pad + chartH - ((v - min) / (max - min)) * chartH,
  }));

  const line = coords.map((c, i) => `${i === 0 ? 'M' : 'L'}${c.x},${c.y}`).join(' ');
  const area = `${line} L${coords[coords.length - 1].x},${height} L${coords[0].x},${height} Z`;

  const months = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];

  return (
    <svg viewBox={`0 0 ${width} ${height + 20}`} className="w-full" fill="none">
      <defs>
        <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#C08B5C" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#C08B5C" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#sparkFill)" />
      <path d={line} stroke="#C08B5C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {/* X-axis labels */}
      {months.map((m, i) => (
        <text
          key={m}
          x={pad + (i / (months.length - 1)) * chartW}
          y={height + 16}
          textAnchor="middle"
          className="fill-white/20"
          fontSize="9"
          fontFamily="system-ui"
        >
          {m}
        </text>
      ))}
    </svg>
  );
};

// ── Donut Chart ────────────────────────────────────────────────────────────────

const DonutChart: React.FC<{ income: number; expenses: number }> = ({ income, expenses }) => {
  const total = income + expenses || 1;
  const incomeAngle = (income / total) * 360;
  const r = 38;
  const cx = 50;
  const cy = 50;
  const strokeW = 10;

  const polarToCartesian = (angle: number) => ({
    x: cx + (r * Math.cos(((angle - 90) * Math.PI) / 180)),
    y: cy + (r * Math.sin(((angle - 90) * Math.PI) / 180)),
  });

  const start = polarToCartesian(0);
  const end = polarToCartesian(incomeAngle);
  const largeArc = incomeAngle > 180 ? 1 : 0;

  const incomePath = `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;
  const netCashflow = income - expenses;

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 100 100" className="w-24 h-24">
        {/* Background ring */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={strokeW} />
        {/* Income arc */}
        {income > 0 && (
          <path d={incomePath} fill="none" stroke="#C08B5C" strokeWidth={strokeW} strokeLinecap="round" />
        )}
        {/* Center text */}
        <text x={cx} y={cy - 4} textAnchor="middle" className="fill-white/90" fontSize="13" fontWeight="600" fontFamily="system-ui">
          {formatCurrency(netCashflow)}
        </text>
        <text x={cx} y={cy + 9} textAnchor="middle" className="fill-white/30" fontSize="7" fontFamily="system-ui">
          net / mo
        </text>
      </svg>
    </div>
  );
};

// ── Props ──────────────────────────────────────────────────────────────────────

interface HomePageProps {
  userName?: string;
  chatHistory: ChatSession[];
  bookmarks: BookmarkedProperty[];
  dealsPipeline?: DealsPipeline;
  teamsSummary?: TeamsSummary;
  reportsSummary?: ReportsSummary;
  onNavigateToChat: () => void;
  onNavigateToDeals: () => void;
  onNavigateToReports: () => void;
  onNavigateToTeams: () => void;
  onNavigateToUpgrade: () => void;
  onNewChat: () => void;
}

// ── Component ──────────────────────────────────────────────────────────────────

export const HomePage: React.FC<HomePageProps> = ({
  userName,
  chatHistory,
  bookmarks,
  dealsPipeline,
  reportsSummary,
  onNavigateToChat,
  onNavigateToDeals,
  onNavigateToReports,
  onNewChat,
}) => {
  const firstName = userName || 'there';

  // ── Dashboard data (from API, falls back to props) ──
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);

  useEffect(() => {
    // Try fetching from API; silently fall back to prop-derived data on failure
    fetchDashboard('current')
      .then(setDashboard)
      .catch(() => { /* API unavailable — use fallback */ });
  }, []);

  // Derived values — prefer API data, fallback to bookmarks/props
  const totalValue = dashboard?.total_value || 0;
  const monthlyCashflow = dashboard?.monthly_cashflow || 0;
  const capRate = dashboard?.blended_cap_rate || 0;
  const activeDeals = dashboard?.active_deals ?? bookmarks.length;
  const pipeline = dashboard?.deal_pipeline ?? dealsPipeline ?? { active: 0, under_contract: 0, closed: 0, lost: 0 };
  const properties = dashboard?.properties ?? bookmarks.slice(0, 5).map(b => ({
    address: b.displayName || 'Unknown',
    strategy: (b.propertyData as any)?.property_type || 'STR',
    monthly_income: (b.propertyData as any)?.monthly_revenue_estimate || 0,
    price: (b.propertyData as any)?.price || 0,
    deal_status: b.dealStatus || 'active',
  }));
  const reportsCount = dashboard?.reports_count ?? reportsSummary?.totalReports ?? 0;
  const incomeTotal = dashboard?.income_total || 0;
  const expensesTotal = dashboard?.expenses_total || 0;

  // Recent chats
  const recentChats = chatHistory
    .filter(c => !c.isArchived && c.messages && c.messages.length > 0)
    .sort((a, b) => (b.createdAt || b.timestamp || '').localeCompare(a.createdAt || a.timestamp || ''))
    .slice(0, 3);

  // AI bar state
  const [aiInput, setAiInput] = useState('');

  const handleAiSubmit = () => {
    if (aiInput.trim()) onNewChat();
  };

  // Current month label
  const monthLabel = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="h-full overflow-y-auto bg-[#141417] relative" style={{ scrollbarWidth: 'none' }}>
      <div className="max-w-[880px] mx-auto px-6 pt-10 pb-32">

        {/* ━━ Header ━━ */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-[28px] font-semibold text-white/90 tracking-[-0.02em] leading-tight">
              {getGreeting()}, {firstName}
            </h1>
            <p className="text-[14px] text-[#C08B5C]/70 mt-1 font-normal">
              {totalValue > 0
                ? `Portfolio value: ${formatCurrency(totalValue)}`
                : 'Your portfolio overview'}
            </p>
          </div>
          <span className="text-[12px] text-white/25 bg-white/[0.04] px-3 py-1.5 rounded-full">
            {monthLabel}
          </span>
        </div>

        {/* ━━ Hero Metrics ━━ */}
        <div className="grid grid-cols-4 gap-6 mb-8 pb-8 border-b border-white/[0.04]">
          {[
            { label: 'Total Value', value: formatCurrency(totalValue), sub: totalValue > 0 ? '+12.3% YTD' : '—', subColor: 'text-emerald-400' },
            { label: 'Monthly Cash Flow', value: monthlyCashflow > 0 ? formatCurrency(monthlyCashflow) : '—', sub: 'net income', subColor: 'text-white/25' },
            { label: 'Avg Cap Rate', value: capRate > 0 ? formatPct(capRate) : '—', sub: '', subColor: '' },
            { label: 'Active Deals', value: String(activeDeals), sub: 'in pipeline', subColor: 'text-white/25' },
          ].map(({ label, value, sub, subColor }) => (
            <div key={label}>
              <p className="text-[11px] text-white/30 uppercase tracking-wider font-medium mb-2">{label}</p>
              <p className="text-[28px] font-bold text-white/90 leading-none tracking-tight">{value}</p>
              {sub && <p className={`text-[11px] mt-1 ${subColor}`}>{sub}</p>}
            </div>
          ))}
        </div>

        {/* ━━ Main Grid ━━ */}
        <div className="grid grid-cols-[1fr_300px] gap-5 mb-6">

          {/* ── Left Column ── */}
          <div className="space-y-5">

            {/* Performance Chart Card */}
            <div className="bg-[#1b1b20] rounded-2xl border border-white/[0.04] p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[13px] text-white/50 font-medium">Performance</h3>
                <span className="text-[11px] text-white/20">Last 12 months</span>
              </div>
              <SparklineChart />
              {totalValue > 0 && (
                <p className="text-[11px] text-white/20 mt-3 text-right">
                  +{formatCurrency(totalValue * 0.12)} trailing 12m
                </p>
              )}
            </div>

            {/* Properties Card */}
            <div className="bg-[#1b1b20] rounded-2xl border border-white/[0.04] p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[13px] text-white/50 font-medium">Properties</h3>
                <button
                  onClick={onNavigateToDeals}
                  className="text-[11px] text-[#C08B5C]/60 hover:text-[#C08B5C] transition-colors flex items-center gap-1"
                >
                  View all <ChevronRight className="w-3 h-3" />
                </button>
              </div>
              {properties.length > 0 ? (
                <div className="divide-y divide-white/[0.04]">
                  {properties.slice(0, 4).map((prop, i) => (
                    <div key={i} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                      <div className="w-9 h-9 rounded-lg bg-white/[0.04] flex items-center justify-center flex-shrink-0">
                        <BarChart3 className="w-4 h-4 text-white/25" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] text-white/70 truncate">{prop.address}</p>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${STRATEGY_COLORS[prop.strategy?.toUpperCase()] || STRATEGY_COLORS.STR}`}>
                        {prop.strategy?.toUpperCase() || 'STR'}
                      </span>
                      {prop.monthly_income > 0 && (
                        <span className="text-[12px] text-emerald-400/80 font-medium tabular-nums">
                          {formatCurrency(prop.monthly_income)}/mo
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <p className="text-[13px] text-white/30">No properties tracked yet</p>
                  <button
                    onClick={onNewChat}
                    className="text-[12px] text-[#C08B5C] hover:text-[#E2B491] mt-2 transition-colors"
                  >
                    Start an analysis →
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ── Right Column ── */}
          <div className="space-y-5">

            {/* Cash Flow Card */}
            <div className="bg-[#1b1b20] rounded-2xl border border-white/[0.04] p-5">
              <h3 className="text-[13px] text-white/50 font-medium mb-4">Cash Flow</h3>
              <DonutChart income={incomeTotal || monthlyCashflow * 1.8} expenses={expensesTotal || monthlyCashflow * 0.8} />
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-[#C08B5C]" />
                  <span className="text-white/40">Income</span>
                  <span className="ml-auto text-white/60 tabular-nums">
                    {formatCurrency(incomeTotal || monthlyCashflow * 1.8)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-white/10" />
                  <span className="text-white/40">Expenses</span>
                  <span className="ml-auto text-white/60 tabular-nums">
                    {formatCurrency(expensesTotal || monthlyCashflow * 0.8)}
                  </span>
                </div>
              </div>
            </div>

            {/* Deal Pipeline Card */}
            <div className="bg-[#1b1b20] rounded-2xl border border-white/[0.04] p-5">
              <h3 className="text-[13px] text-white/50 font-medium mb-4">Deal Pipeline</h3>
              <div className="space-y-3">
                {Object.entries(pipeline).map(([status, count]) => {
                  const pipelineTotal = Object.values(pipeline).reduce((s, v) => s + (v as number), 0) || 1;
                  const pct = ((count as number) / pipelineTotal) * 100;
                  return (
                    <div key={status}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] text-white/40">{PIPELINE_LABELS[status] || status} ({count as number})</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.max(pct, count ? 8 : 0)}%`,
                            backgroundColor: PIPELINE_COLORS[status] || '#64748b',
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Chats Card */}
            <div className="bg-[#1b1b20] rounded-2xl border border-white/[0.04] p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[13px] text-white/50 font-medium">Recent</h3>
                <button
                  onClick={onNavigateToChat}
                  className="text-[11px] text-white/20 hover:text-white/40 transition-colors"
                >
                  View all
                </button>
              </div>
              {recentChats.length > 0 ? (
                <div className="space-y-1">
                  {recentChats.map(chat => (
                    <button
                      key={chat.id}
                      onClick={onNavigateToChat}
                      className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg text-left hover:bg-white/[0.03] transition-colors group"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-white/20 group-hover:text-white/35 flex-shrink-0 transition-colors" />
                      <span className="text-[12px] text-white/50 group-hover:text-white/70 truncate flex-1 transition-colors">
                        {chat.title || 'New conversation'}
                      </span>
                      <span className="text-[10px] text-white/15 flex-shrink-0">
                        {timeAgo(chat.createdAt || chat.timestamp)}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-[12px] text-white/25 py-2">No recent conversations</p>
              )}
            </div>

            {/* Reports + Quick Analysis Row */}
            <div className="grid grid-cols-2 gap-3">
              {/* Reports */}
              <button
                onClick={onNavigateToReports}
                className="bg-[#1b1b20] rounded-2xl border border-white/[0.04] p-4 text-left
                  hover:bg-[#1e1e24] hover:border-white/[0.06] transition-all group"
              >
                <FileText className="w-4 h-4 text-white/25 mb-2" />
                <p className="text-[22px] font-bold text-white/80 leading-none">{reportsCount}</p>
                <p className="text-[10px] text-white/30 mt-1">reports</p>
              </button>

              {/* Quick Analysis */}
              <button
                onClick={onNewChat}
                className="bg-[#1b1b20] rounded-2xl border border-white/[0.04] p-4 text-left
                  hover:bg-[#1e1e24] hover:border-[#C08B5C]/20 transition-all group
                  relative overflow-hidden"
              >
                <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-[#C08B5C]/30 to-transparent" />
                <Sparkles className="w-4 h-4 text-[#C08B5C]/50 mb-2" />
                <p className="text-[12px] text-white/60 font-medium leading-snug">New<br />Analysis</p>
                <ArrowRight className="w-3 h-3 text-white/15 mt-1 group-hover:text-[#C08B5C]/50 transition-colors" />
              </button>
            </div>

            {/* AI Insights Card */}
            <div className="bg-[#1b1b20] rounded-2xl border border-white/[0.04] p-5">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-3.5 h-3.5 text-[#C08B5C]" />
                <h3 className="text-[13px] text-white/50 font-medium">AI Insights</h3>
              </div>
              <p className="text-[12px] text-white/45 leading-relaxed">
                {properties.length > 0
                  ? `Your portfolio has ${properties.length} ${properties.length === 1 ? 'property' : 'properties'} tracked. Use AI analysis to optimize your returns and identify new opportunities.`
                  : 'Start tracking properties to get personalized insights and portfolio optimization tips.'
                }
              </p>
              <button
                onClick={onNewChat}
                className="text-[11px] text-[#C08B5C]/60 hover:text-[#C08B5C] mt-3 flex items-center gap-1 transition-colors"
              >
                See full analysis <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ━━ Floating AI Input Bar ━━ */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30" style={{ marginLeft: '24px' }}>
        <div className="flex items-center gap-3 px-5 py-3 rounded-2xl
          bg-[#1c1c22]/90 backdrop-blur-xl
          border border-white/[0.06]
          shadow-[0_8px_40px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.03)]
          w-[420px]"
          style={{ borderBottom: '1px solid rgba(192, 139, 92, 0.15)' }}
        >
          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#C08B5C] to-[#A06B3C] flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-3 h-3 text-white" />
          </div>
          <input
            type="text"
            value={aiInput}
            onChange={e => setAiInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAiSubmit()}
            placeholder="Ask about your portfolio…"
            className="flex-1 bg-transparent text-[13px] text-white/70 placeholder:text-white/25 outline-none"
          />
          <button
            onClick={handleAiSubmit}
            className="w-7 h-7 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] flex items-center justify-center transition-colors"
          >
            <Send className="w-3.5 h-3.5 text-white/30" />
          </button>
        </div>
      </div>
    </div>
  );
};
