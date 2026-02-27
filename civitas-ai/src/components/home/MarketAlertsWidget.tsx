import React, { useEffect, useState, useMemo } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { getMarketTrends } from '../../services/agentsApi';
import { usePreferencesStore } from '../../stores/preferencesStore';
import { HomePanelEmptyState } from '../EmptyStates';

interface MarketRow {
  city: string;
  state: string;
  metric: string;
  change: number | null;
  direction: 'up' | 'down' | 'flat';
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

const DirectionIcon: React.FC<{ dir: 'up' | 'down' | 'flat' }> = ({ dir }) => {
  if (dir === 'up') return <TrendingUp className="w-3.5 h-3.5" />;
  if (dir === 'down') return <TrendingDown className="w-3.5 h-3.5" />;
  return <Minus className="w-3.5 h-3.5" />;
};

const dirColor = {
  up: 'text-emerald-400',
  down: 'text-red-400',
  flat: 'text-amber-400',
};

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
            const d = result.value.data;
            const rent = d.median_rent;
            const medianPrice = d.median_price;
            if (rent || medianPrice) {
              parsed.push({
                city: market.city,
                state: market.state,
                metric: rent
                  ? `Median Rent $${rent.toLocaleString()}`
                  : `Median Price $${(medianPrice || 0).toLocaleString()}`,
                change: null,
                direction: 'flat',
              });
            }
          }
        });

        setRows(parsed.length > 0 ? parsed : []);
      } catch {
        setRows([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [trackedMarkets]);

  if (loading) {
    return (
      <div>
        <h3 className="text-[11px] font-semibold uppercase tracking-widest text-white/25 mb-4">Market Alerts</h3>
        <div className="rounded-xl bg-white/[0.03] border border-white/[0.04] p-5">
          <div className="animate-pulse space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 rounded bg-white/[0.04]" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div>
        <h3 className="text-[11px] font-semibold uppercase tracking-widest text-white/25 mb-4">Market Alerts</h3>
        <HomePanelEmptyState
          icon={<Minus className="w-4 h-4" />}
          title="No market data available"
          description="Add favorite markets in preferences to track them here."
        />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[11px] font-semibold uppercase tracking-widest text-white/25">Market Alerts</h3>
        <span className="text-[10px] font-semibold uppercase tracking-widest text-white/15">Live</span>
      </div>

      <div className="rounded-xl bg-white/[0.03] border border-white/[0.04] divide-y divide-white/[0.04]">
        {rows.map((row) => (
          <div
            key={`${row.city}-${row.metric}`}
            className="flex items-center justify-between px-4 py-3 hover:bg-white/[0.02]"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-[10px] font-bold text-white/25 w-6 text-center">{row.state}</span>
              <div className="min-w-0">
                <div className="text-[13px] text-white/80">{row.city}</div>
                <div className="text-[10px] text-white/25 truncate">{row.metric}</div>
              </div>
            </div>
            {row.change != null ? (
              <div className={`flex items-center gap-1.5 text-[12px] font-semibold ${dirColor[row.direction]}`}>
                <DirectionIcon dir={row.direction} />
                <span>{row.change > 0 ? '+' : ''}{row.change}%</span>
              </div>
            ) : (
              <span className="text-[11px] text-white/20">--</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
