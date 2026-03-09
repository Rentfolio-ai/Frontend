import React, { useState, useEffect } from 'react';
import {
  ChevronRight, ArrowUpRight, ArrowDownRight, MapPin
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

function formatCurrency(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}K`;
  return `$${n.toLocaleString()}`;
}






function buildYLabels(values: number[]): string[] {
  if (values.every(v => v === 0)) return ['$0', '$0', '$0', '$0'];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const step = (max - min) / 3 || 1;
  return Array.from({ length: 4 }, (_, i) => formatCurrency(min + step * i));
}

function buildChartPath(
  values: number[],
  width: number,
  height: number,
  padding = 0,
): string {
  const min = Math.min(...values) * 0.98;
  const max = Math.max(...values) * 1.02;
  const range = max - min || 1;
  const stepX = (width - padding * 2) / (values.length - 1);

  return values
    .map((v, i) => {
      const x = padding + i * stepX;
      const y = height - padding - ((v - min) / range) * (height - padding * 2);
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
}

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
  chatHistory: _chatHistory,
  bookmarks,
  dealsPipeline: _dealsPipeline,
  reportsSummary: _reportsSummary,
  onNavigateToChat: _onNavigateToChat,
  onNavigateToDeals,
  onNavigateToReports: _onNavigateToReports,
  onNavigateToTeams,
  onNewChat,
}) => {
  const firstName = userName || 'there';

  // ── Dashboard data ──
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [timeRange, setTimeRange] = useState<string>('6M');

  useEffect(() => {
    fetchDashboard('current')
      .then(setDashboard)
      .catch(() => { /* API unavailable */ });
  }, []);

  const totalValue = dashboard?.total_value || 0;
  const monthlyCashflow = dashboard?.monthly_cashflow || 0;
  const activeDeals = dashboard?.active_deals || 0;
  const properties = dashboard?.properties ?? bookmarks.slice(0, 5).map(b => ({
    address: b.displayName || 'Unknown',
    strategy: (b.property as any)?.property_type || 'STR',
    monthly_income: (b.property as any)?.monthly_revenue_estimate || 0,
    price: (b.property as any)?.price || 0,
    deal_status: b.dealStatus || 'active',
  }));

  // API-driven chart data (fallback to zeros)
  const chartValues = dashboard?.growth_history?.length
    ? dashboard.growth_history.map(p => p.value)
    : [0, 0, 0, 0, 0, 0];
  const chartYLabels = buildYLabels(chartValues);

  // API-driven recent activity
  const recentActivity = dashboard?.recent_activity ?? [];

  // AI bar state



  // Chart dimensions
  const chartW = 680;
  const chartH = 160;
  const chartPad = 8;
  const linePath = buildChartPath(chartValues, chartW, chartH, chartPad);

  return (
    <div className="h-full overflow-y-auto bg-background text-foreground font-sans selection:bg-black/12" style={{ scrollbarWidth: 'none' }}>
      <div className="max-w-[900px] mx-auto px-8 py-12 md:py-16">

        {/* Header - Stripped Down */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/50"></span>
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground/70 font-semibold">Pro Investor</span>
          </div>
          <h1 className="text-[32px] font-medium tracking-tight mb-6"> Good {getGreeting().toLowerCase().replace('good ', '')}, {firstName}</h1>

          <div className="flex flex-wrap gap-8 md:gap-12 text-sm">
            <div>
              <div className="text-muted-foreground/70 mb-1">Portfolio Value</div>
              <div className="text-xl tabular-nums">{totalValue > 0 ? formatCurrency(totalValue) : '$0'}</div>
            </div>
            <div>
              <div className="text-muted-foreground/70 mb-1">Monthly Cash Flow</div>
              <div className="text-xl tabular-nums">{monthlyCashflow > 0 ? `${formatCurrency(monthlyCashflow)}/mo` : '$0/mo'}</div>
            </div>
            <div>
              <div className="text-muted-foreground/70 mb-1">Active Deals</div>
              <div className="text-xl tabular-nums">{properties.length || 0}</div>
            </div>
            <div>
              <div className="text-muted-foreground/70 mb-1">Pending Deals</div>
              <div className="text-xl tabular-nums">{activeDeals}</div>
            </div>
          </div>
        </div>

        <div className="border-t border-black/[0.06] mb-10"></div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">

          {/* Main Column (2/3) */}
          <div className="md:col-span-2 space-y-12">

            {/* Portfolio Performance Chart (Minimal Line) */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[13px] uppercase tracking-wider text-muted-foreground/70 font-semibold">Performance</h2>
                <div className="flex gap-4 text-[12px] text-muted-foreground/50">
                  {['1M', '3M', '6M', '1Y', 'ALL'].map(range => (
                    <span
                      key={range}
                      onClick={() => setTimeRange(range)}
                      className={`cursor-pointer transition-colors ${timeRange === range ? 'text-foreground font-medium' : 'hover:text-foreground'}`}
                    >
                      {range}
                    </span>
                  ))}
                </div>
              </div>
              <div className="h-40 border border-black/[0.04] rounded-lg relative flex items-center justify-center">
                <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-full absolute inset-0 text-foreground/80" preserveAspectRatio="none">
                  {/* Grid lines */}
                  {chartYLabels.map((_, i) => {
                    const y = chartH - chartPad - (i / (chartYLabels.length - 1)) * (chartH - chartPad * 2);
                    return (
                      <line key={i} x1={chartPad} y1={y} x2={chartW - chartPad} y2={y}
                        stroke="rgba(0,0,0,0.03)" strokeWidth="1" />
                    );
                  })}
                  {/* Simple sharp line */}
                  <path d={linePath} fill="none" stroke="currentColor" strokeWidth="2.5" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </section>

            {/* Pipeline (List View) */}
            <section>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-[13px] uppercase tracking-wider text-muted-foreground/70 font-semibold">Active Targets</h2>
                <button onClick={onNavigateToDeals} className="text-[12px] text-muted-foreground/70 hover:text-foreground flex items-center transition-colors">
                  View Pipeline <ChevronRight className="w-3 h-3 ml-1" />
                </button>
              </div>
              <div className="divide-y divide-black/[0.04]">
                {properties.length > 0 ? properties.slice(0, 5).map((prop, i) => {
                  return (
                    <div key={i} onClick={onNavigateToDeals} className="py-3 flex items-center justify-between group cursor-pointer hover:bg-black/[0.02] -mx-3 px-3 rounded-lg transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded bg-black/[0.04] border border-black/[0.08] flex items-center justify-center text-muted-foreground/50 shrink-0">
                          <MapPin className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0 pr-4">
                          <div className="text-[14px] truncate">{prop.address}</div>
                          <div className="text-[12px] text-muted-foreground/70 capitalize">{prop.strategy} · {prop.deal_status?.replace('_', ' ') || 'Active'}</div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-[14px]">{prop.price > 0 ? `$${prop.price.toLocaleString()}` : 'TBD'}</div>
                        <div className="text-[12px] text-emerald-400/80">
                          {prop.monthly_income > 0 ? `Est. ~$${prop.monthly_income.toLocaleString()}/mo` : 'TBD'}
                        </div>
                      </div>
                    </div>
                  );
                }) : (
                  <div className="py-8 text-center text-sm text-muted-foreground/70">No active deals tracking.<br /><span className="text-muted-foreground cursor-pointer hover:underline mt-1 inline-block" onClick={onNewChat}>Start scouting</span></div>
                )}
              </div>
            </section>
          </div>

          {/* Right Column (1/3) */}
          <div className="space-y-12">

            {/* Market Intel */}
            <section>
              <h2 className="text-[13px] uppercase tracking-wider text-muted-foreground/70 font-semibold mb-4">Market Intel</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <ArrowUpRight className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-[12px] text-blue-400">Austin listings up</span>
                  </div>
                  <p className="text-[12px] text-muted-foreground leading-relaxed">Inventory in 78704 increased by 4% this week. Prices stabilizing.</p>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <ArrowDownRight className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-[12px] text-emerald-400">Rates dropped</span>
                  </div>
                  <p className="text-[12px] text-muted-foreground leading-relaxed">30-year fixed fell to 6.2%. Good time to re-evaluate Denver refi.</p>
                </div>
              </div>
            </section>

            {/* Recent Comms */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[13px] uppercase tracking-wider text-muted-foreground/70 font-semibold">Recent</h2>
                <button onClick={onNavigateToTeams} className="text-[12px] text-muted-foreground/70 hover:text-foreground flex items-center transition-colors">
                  CRM <ChevronRight className="w-3 h-3 ml-0.5" />
                </button>
              </div>
              <div className="space-y-4">
                {recentActivity.filter(a => a.type === 'bookmark').length > 0 ? (
                  recentActivity.filter(a => a.type === 'bookmark').slice(0, 3).map((msg, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="w-5 h-5 rounded-full bg-black/8 text-muted-foreground flex items-center justify-center text-[9px] uppercase tracking-tighter shrink-0 mt-0.5">
                        {msg.type === 'bookmark' ? 'PM' : 'AI'}
                      </div>
                      <div>
                        <div className="text-[13px] text-foreground/80">Partner/Agent <span className="text-[10px] text-muted-foreground/50 ml-2">Just now</span></div>
                        <p className="text-[12px] text-muted-foreground/70 line-clamp-3 leading-relaxed">"{msg.description}"</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="flex gap-3">
                      <div className="w-5 h-5 rounded-full bg-black/8 text-muted-foreground flex items-center justify-center text-[9px] uppercase tracking-tighter shrink-0 mt-0.5">M</div>
                      <div>
                        <div className="text-[13px] text-foreground/80">Mark (Contractor) <span className="text-[10px] text-muted-foreground/50 ml-2">2h ago</span></div>
                        <p className="text-[12px] text-muted-foreground/70 line-clamp-2 leading-relaxed">"Drywall quote came in. Taking a look at $4500 total..."</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-5 h-5 rounded-full bg-black/8 text-muted-foreground flex items-center justify-center text-[9px] uppercase tracking-tighter shrink-0 mt-0.5">S</div>
                      <div>
                        <div className="text-[13px] text-foreground/80">Sarah (Agent) <span className="text-[10px] text-muted-foreground/50 ml-2">5h ago</span></div>
                        <p className="text-[12px] text-muted-foreground/70 line-clamp-2 leading-relaxed">"Offer accepted! Wiring the earnest money tomorrow morning."</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};
