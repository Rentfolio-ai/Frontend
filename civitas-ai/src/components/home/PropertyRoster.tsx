import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Minus, Search } from 'lucide-react';
import { getPortfolios, getPortfolioSummary } from '../../services/agentsApi';
import type { PortfolioProperty } from '../../services/agentsApi';

function fmt(val: number): string {
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `$${(val / 1_000).toFixed(0)}K`;
  return `$${val.toFixed(0)}`;
}

const TIER_STYLES: Record<string, string> = {
  A: 'bg-emerald-500/15 text-emerald-400',
  B: 'bg-sky-500/15 text-sky-400',
  C: 'bg-amber-500/15 text-amber-400',
  D: 'bg-red-500/15 text-red-400',
};

const TYPE_LABELS: Record<string, string> = {
  single_family: 'SFH',
  multi_family: 'Multi',
  condo: 'Condo',
  townhouse: 'Town',
  commercial: 'Comm',
};

const TrendIcon: React.FC<{ trend?: 'up' | 'down' | 'stable' }> = ({ trend }) => {
  if (trend === 'up') return <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />;
  if (trend === 'down') return <TrendingDown className="w-3.5 h-3.5 text-red-400" />;
  return <Minus className="w-3 h-3 text-white/20" />;
};

const MAX_VISIBLE = 10;

const LEVEL2_CARD = 'rounded-xl bg-[#1C1C21] border border-white/[0.06] shadow-[0_2px_8px_rgba(0,0,0,0.4)] overflow-hidden';

interface PropertyRosterProps {
  onNavigateToDeals?: () => void;
}

export const PropertyRoster: React.FC<PropertyRosterProps> = ({ onNavigateToDeals }) => {
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState<PortfolioProperty[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await getPortfolios();
        const portfolios = res?.portfolios || [];
        if (portfolios.length > 0) {
          const summary = await getPortfolioSummary(portfolios[0].id);
          const props = summary?.data?.properties || [];
          props.sort((a, b) => (b.roi || 0) - (a.roi || 0));
          setProperties(props);
        }
      } catch { /* best-effort */ }
      finally { setLoading(false); }
    })();
  }, []);

  if (loading) {
    return (
      <div className={LEVEL2_CARD}>
        <div className="px-4 py-3 bg-[#18181C] border-b border-white/[0.05]">
          <div className="h-3 w-32 rounded bg-white/[0.06]" />
        </div>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="px-4 py-3 flex gap-4 border-b border-white/[0.03]">
            <div className="h-3 w-40 rounded bg-white/[0.05]" />
            <div className="h-3 w-16 rounded bg-white/[0.05]" />
            <div className="h-3 w-20 rounded bg-white/[0.05]" />
          </div>
        ))}
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="flex items-center gap-3 py-3 text-[13px] text-white/35">
        <Search className="w-4 h-4 text-white/20" />
        <span>No properties yet</span>
        <span className="text-white/15">&middot;</span>
        {onNavigateToDeals && (
          <button onClick={onNavigateToDeals} className="text-[#C08B5C] hover:text-[#D4A27F] transition-colors">
            Browse deals
          </button>
        )}
      </div>
    );
  }

  const visible = properties.slice(0, MAX_VISIBLE);
  const hasMore = properties.length > MAX_VISIBLE;

  return (
    <div className={LEVEL2_CARD}>
      <div className="grid grid-cols-[1fr_56px_80px_80px_56px_36px_28px] gap-2 px-4 py-2.5 bg-[#18181C] border-b border-white/[0.05] text-[10px] uppercase tracking-wider text-white/25">
        <span>Property</span>
        <span>Type</span>
        <span className="text-right">Value</span>
        <span className="text-right">Cash Flow</span>
        <span className="text-right">ROI</span>
        <span className="text-center">Tier</span>
        <span />
      </div>

      {visible.map((p) => {
        const cashColor = (p.cashFlow || 0) > 0 ? 'text-emerald-400' : (p.cashFlow || 0) < 0 ? 'text-red-400' : 'text-white/50';
        const tierStyle = TIER_STYLES[p.tier || ''] || 'bg-white/[0.05] text-white/30';
        return (
          <div
            key={p.id}
            className="grid grid-cols-[1fr_56px_80px_80px_56px_36px_28px] gap-2 px-4 py-2.5 border-b border-white/[0.03] hover:bg-white/[0.02] items-center transition-colors duration-100"
          >
            <div className="min-w-0">
              <div className="text-[13px] text-white/80 truncate">{p.address}</div>
              <div className="text-[10px] text-white/25 truncate">{p.city}, {p.state}</div>
            </div>
            <span className="text-[11px] text-white/40">{TYPE_LABELS[p.propertyType] || p.propertyType}</span>
            <span className="text-[13px] text-white/75 font-mono text-right">{fmt(p.currentValue)}</span>
            <span className={`text-[13px] font-mono text-right ${cashColor}`}>
              {p.cashFlow ? `${p.cashFlow > 0 ? '+' : ''}${fmt(Math.abs(p.cashFlow))}` : '--'}
            </span>
            <span className="text-[13px] text-white/75 font-mono text-right">
              {p.roi ? `${p.roi.toFixed(1)}%` : '--'}
            </span>
            <div className="flex justify-center">
              {p.tier ? (
                <span className={`text-[9px] font-bold w-5 h-5 rounded flex items-center justify-center ${tierStyle}`}>
                  {p.tier}
                </span>
              ) : (
                <span className="text-[10px] text-white/15">--</span>
              )}
            </div>
            <div className="flex justify-center">
              <TrendIcon trend={p.marketTrend} />
            </div>
          </div>
        );
      })}

      {hasMore && onNavigateToDeals && (
        <button
          onClick={onNavigateToDeals}
          className="w-full px-4 py-2.5 text-[12px] text-white/30 hover:text-[#C08B5C] text-center transition-colors"
        >
          View all {properties.length} properties
        </button>
      )}
    </div>
  );
};
