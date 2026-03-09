import React, { useEffect, useState } from 'react';
import { Home, TrendingUp, TrendingDown, DollarSign, BarChart3, Layers } from 'lucide-react';
import { getPortfolios, getPortfolioSummary } from '../../services/agentsApi';
import type { Portfolio } from '../../services/agentsApi';

function fmt(val: number): string {
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `$${(val / 1_000).toFixed(0)}K`;
  return `$${val.toFixed(0)}`;
}

function fmtSigned(val: number): string {
  const prefix = val >= 0 ? '+' : '';
  return `${prefix}${fmt(Math.abs(val))}`;
}

interface SecondaryKpi {
  label: string;
  value: string;
  icon: React.FC<{ className?: string }>;
  color?: 'positive' | 'negative' | 'neutral';
}

const COLOR_MAP = {
  positive: 'text-emerald-400',
  negative: 'text-red-400',
  neutral: 'text-foreground',
};

const SPOTLIGHT_SHADOW = '0 0 60px rgba(192,139,92,0.04), 0 4px 24px rgba(0,0,0,0.4)';
const GRADIENT_TOP_BORDER = 'linear-gradient(90deg, transparent 10%, rgba(192,139,92,0.3) 50%, transparent 90%)';

const SpotlightCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`relative rounded-xl bg-card border border-black/[0.06] overflow-hidden ${className}`}
    style={{ boxShadow: SPOTLIGHT_SHADOW }}
  >
    <div className="absolute inset-x-0 top-0 h-px" style={{ background: GRADIENT_TOP_BORDER }} />
    {children}
  </div>
);

export const PortfolioHero: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [equity, setEquity] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await getPortfolios();
        const portfolios: Portfolio[] = res?.portfolios || [];
        if (portfolios.length > 0) {
          setPortfolio(portfolios[0]);
          try {
            const summary = await getPortfolioSummary(portfolios[0].id);
            if (summary?.data?.performanceMetrics) {
              setEquity(summary.data.performanceMetrics.totalEquity);
            }
          } catch { /* summary is optional */ }
        }
      } catch { /* best-effort */ }
      finally { setLoading(false); }
    })();
  }, []);

  if (loading) {
    return (
      <SpotlightCard>
        <div className="p-6">
          <div className="h-4 w-24 rounded bg-black/[0.04] mb-4" />
          <div className="h-9 w-40 rounded bg-black/[0.03] mb-6" />
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-2.5 w-16 rounded bg-black/[0.04]" />
                <div className="h-5 w-20 rounded bg-black/[0.03]" />
              </div>
            ))}
          </div>
        </div>
      </SpotlightCard>
    );
  }

  if (!portfolio) {
    return (
      <div className="flex items-center gap-3 py-3 text-[13px] text-muted-foreground/60">
        <Home className="w-4 h-4 text-muted-foreground/40" />
        <span>No portfolio yet</span>
        <span className="text-muted-foreground/40">&middot;</span>
        <span className="text-[#C08B5C] cursor-pointer hover:text-[#D4A27F] transition-colors">
          Add your first property
        </span>
      </div>
    );
  }

  const cashFlow = portfolio.monthlyCashFlow || 0;
  const cashColor: SecondaryKpi['color'] = cashFlow > 0 ? 'positive' : cashFlow < 0 ? 'negative' : 'neutral';
  const ytd = portfolio.ytdReturn || 0;
  const ytdColor: SecondaryKpi['color'] = ytd > 0 ? 'positive' : ytd < 0 ? 'negative' : 'neutral';

  const secondaryKpis: SecondaryKpi[] = [
    { label: 'Cash Flow / mo', value: cashFlow !== 0 ? fmtSigned(cashFlow) : '--', icon: cashFlow >= 0 ? TrendingUp : TrendingDown, color: cashColor },
    { label: 'Avg ROI', value: portfolio.totalROI ? `${portfolio.totalROI.toFixed(1)}%` : '--', icon: BarChart3 },
    { label: 'Equity', value: equity != null && equity > 0 ? fmt(equity) : '--', icon: Layers },
    { label: 'Properties', value: String(portfolio.propertyCount || 0), icon: Home },
    { label: 'YTD Return', value: ytd !== 0 ? `${ytd > 0 ? '+' : ''}${ytd.toFixed(1)}%` : '--', icon: TrendingUp, color: ytdColor },
  ];

  return (
    <SpotlightCard>
      <div className="p-6">
        {/* Primary metric */}
        <div className="mb-6">
          <div className="flex items-center gap-1.5 mb-2">
            <DollarSign className="w-3.5 h-3.5 text-muted-foreground/40" />
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground/50">Total Value</span>
          </div>
          <span className="text-[36px] font-bold font-mono text-foreground tracking-tight leading-none">
            {portfolio.totalValue > 0 ? fmt(portfolio.totalValue) : '--'}
          </span>
        </div>

        {/* Secondary KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-x-0 gap-y-4">
          {secondaryKpis.map((kpi, i) => (
            <div
              key={kpi.label}
              className={`px-3 py-1 ${i < secondaryKpis.length - 1 ? 'md:border-r md:border-black/[0.04]' : ''}`}
            >
              <div className="flex items-center gap-1.5 mb-1.5">
                <kpi.icon className="w-3 h-3 text-muted-foreground/40" />
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground/50">{kpi.label}</span>
              </div>
              <span className={`text-[16px] font-semibold font-mono tracking-tight leading-none ${COLOR_MAP[kpi.color || 'neutral']}`}>
                {kpi.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </SpotlightCard>
  );
};

export { PortfolioHero as PortfolioSummaryWidget };
