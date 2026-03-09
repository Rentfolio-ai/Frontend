import React, { useEffect, useState, useMemo } from 'react';
import { Minus } from 'lucide-react';
import { getMarketTrends } from '../../services/agentsApi';
import type { MarketTrendsData } from '../../services/agentsApi';
import { usePreferencesStore } from '../../stores/preferencesStore';

interface MarketRow extends MarketTrendsData {
  city: string;
  state: string;
}

const DEFAULT_MARKETS = [
  { city: 'Austin', state: 'TX' },
  { city: 'Denver', state: 'CO' },
  { city: 'Miami', state: 'FL' },
  { city: 'Phoenix', state: 'AZ' },
  { city: 'Nashville', state: 'TN' },
];

function parseMarketString(m: string): { city: string; state: string } | null {
  const parts = m.split(',').map(s => s.trim());
  if (parts.length >= 2) return { city: parts[0], state: parts[1] };
  return null;
}

function fmtPrice(val?: number): string {
  if (!val) return '--';
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `$${(val / 1_000).toFixed(0)}K`;
  return `$${val.toFixed(0)}`;
}

const LEVEL2_CARD = 'rounded-xl bg-card border border-black/[0.06] shadow-[0_2px_8px_rgba(0,0,0,0.4)] overflow-hidden';

export const MarketAlertsWidget: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<MarketRow[]>([]);
  const favoriteMarkets = usePreferencesStore(s => s.favoriteMarkets);

  const trackedMarkets = useMemo(() => {
    if (favoriteMarkets.length > 0) {
      const parsed = favoriteMarkets.map(parseMarketString).filter(Boolean) as { city: string; state: string }[];
      return parsed.length > 0 ? parsed : DEFAULT_MARKETS;
    }
    return DEFAULT_MARKETS;
  }, [favoriteMarkets]);

  useEffect(() => {
    (async () => {
      try {
        const results = await Promise.allSettled(
          trackedMarkets.map(m => getMarketTrends(m.city, m.state))
        );

        const parsed: MarketRow[] = [];
        results.forEach((result, i) => {
          const market = trackedMarkets[i];
          if (result.status === 'fulfilled' && result.value.data) {
            parsed.push({ ...result.value.data, city: market.city, state: market.state });
          }
        });

        setRows(parsed);
      } catch {
        setRows([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [trackedMarkets]);

  if (loading) {
    return (
      <div className={LEVEL2_CARD}>
        <div className="px-4 py-2.5 bg-surface border-b border-black/[0.05]">
          <div className="h-3 w-28 rounded bg-black/[0.05]" />
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="px-4 py-3 flex gap-4 border-b border-black/[0.05]">
            <div className="h-3 w-24 rounded bg-black/[0.04]" />
            <div className="h-3 w-16 rounded bg-black/[0.04]" />
            <div className="h-3 w-16 rounded bg-black/[0.04]" />
          </div>
        ))}
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="flex items-center gap-3 py-3 text-[13px] text-muted-foreground/60">
        <Minus className="w-4 h-4 text-muted-foreground/40" />
        <span>No market data</span>
        <span className="text-muted-foreground/40">&middot;</span>
        <span className="text-muted-foreground/50">Add favorite markets in preferences</span>
      </div>
    );
  }

  return (
    <div className={LEVEL2_CARD}>
      <div className="grid grid-cols-[1fr_80px_80px_64px_64px] gap-2 px-4 py-2.5 bg-surface border-b border-black/[0.05] text-[10px] uppercase tracking-wider text-muted-foreground/50">
        <span>Market</span>
        <span className="text-right">Med. Price</span>
        <span className="text-right">Med. Rent</span>
        <span className="text-right">DOM</span>
        <span className="text-right">Inventory</span>
      </div>

      {rows.map((row) => (
        <div
          key={`${row.city}-${row.state}`}
          className="grid grid-cols-[1fr_80px_80px_64px_64px] gap-2 px-4 py-2.5 border-b border-black/[0.05] hover:bg-black/[0.02] items-center transition-colors duration-100"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-[10px] font-bold text-muted-foreground/50 bg-black/[0.04] rounded px-1.5 py-0.5 w-7 text-center flex-shrink-0">
              {row.state}
            </span>
            <span className="text-[13px] text-foreground/80 truncate">{row.city}</span>
          </div>
          <span className="text-[13px] text-foreground/75 font-mono text-right">
            {fmtPrice(row.median_price)}
          </span>
          <span className="text-[13px] text-foreground/75 font-mono text-right">
            {row.median_rent ? `$${row.median_rent.toLocaleString()}` : '--'}
          </span>
          <span className="text-[12px] text-muted-foreground text-right">
            {row.avg_days_on_market != null ? `${row.avg_days_on_market}d` : '--'}
          </span>
          <span className="text-[12px] text-muted-foreground text-right">
            {row.active_listings != null ? row.active_listings.toLocaleString() : '--'}
          </span>
        </div>
      ))}
    </div>
  );
};
