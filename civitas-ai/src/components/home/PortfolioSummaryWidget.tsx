import React, { useEffect, useState } from 'react';
import { Home, TrendingUp, DollarSign, PieChart } from 'lucide-react';
import { getPortfolios } from '../../services/agentsApi';
import type { Portfolio } from '../../services/agentsApi';

interface StatData {
  label: string;
  value: string;
  icon: React.FC<{ className?: string }>;
}

function formatValue(val: number): string {
  if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
  if (val >= 1000) return `$${(val / 1000).toFixed(0)}K`;
  return `$${val.toFixed(0)}`;
}

export const PortfolioSummaryWidget: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [portfolioCount, setPortfolioCount] = useState(0);
  const [totalValue, setTotalValue] = useState(0);
  const [avgRoi, setAvgRoi] = useState<number | null>(null);
  const [monthlyCash, setMonthlyCash] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await getPortfolios();
        const portfolios: Portfolio[] = res?.portfolios || [];
        setPortfolioCount(portfolios.length);

        if (portfolios.length > 0) {
          const sumValue = portfolios.reduce((s, p) => s + (p.totalValue || 0), 0);
          const sumCash = portfolios.reduce((s, p) => s + (p.monthlyCashFlow || 0), 0);
          const roiValues = portfolios.filter(p => p.totalROI != null && p.totalROI !== 0);
          const meanRoi = roiValues.length > 0
            ? roiValues.reduce((s, p) => s + p.totalROI, 0) / roiValues.length
            : null;

          setTotalValue(sumValue);
          setMonthlyCash(sumCash);
          setAvgRoi(meanRoi);
        }
      } catch {
        /* best-effort */
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const stats: StatData[] = [
    { label: 'Properties', value: String(portfolioCount), icon: Home },
    { label: 'Total Value', value: totalValue > 0 ? formatValue(totalValue) : '--', icon: DollarSign },
    { label: 'Avg ROI', value: avgRoi != null ? `${avgRoi.toFixed(1)}%` : '--', icon: TrendingUp },
    { label: 'Monthly Cash', value: monthlyCash != null ? formatValue(monthlyCash) : '--', icon: PieChart },
  ];

  if (loading) {
    return (
      <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-4">
        <div className="animate-pulse grid grid-cols-2 md:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-lg border border-white/[0.04] bg-white/[0.02] p-3 space-y-2">
              <div className="w-5 h-5 rounded bg-white/[0.05]" />
              <div className="h-3 w-20 rounded bg-white/[0.05]" />
              <div className="h-2 w-14 rounded bg-white/[0.04]" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg border border-white/[0.04] bg-white/[0.02] p-3">
            <div className="flex items-center gap-2 mb-2">
              <s.icon className="w-4 h-4 text-white/25" />
              <span className="text-[10px] uppercase tracking-wider text-white/30">{s.label}</span>
            </div>
            <div>
              <span className="text-[16px] font-semibold text-white/90 font-mono tracking-tight">{s.value}</span>
            </div>
          </div>
        ))}
    </div>
  );
};
