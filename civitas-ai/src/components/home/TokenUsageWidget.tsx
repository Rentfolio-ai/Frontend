import React, { useEffect, useState } from 'react';
import { subscriptionService } from '../../services/subscriptionService';

interface UsageData {
  tier: string;
  used: number;
  limit: number;
}

const TIER_LIMITS: Record<string, number> = { free: 25000, pro: 100000 };

export const TokenUsageWidget: React.FC<{ onUpgrade: () => void }> = ({ onUpgrade }) => {
  const [loading, setLoading] = useState(true);
  const [usage, setUsage] = useState<UsageData>({ tier: 'free', used: 0, limit: 25000 });

  useEffect(() => {
    (async () => {
      try {
        const sub = await subscriptionService.getSubscription();
        const tier = sub.tier || 'free';
        const limit = TIER_LIMITS[tier] || 25000;
        const used = sub.usage_this_month?.tokens || 0;
        setUsage({ tier, used, limit });
      } catch {
        /* best-effort */
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const pct = Math.min((usage.used / usage.limit) * 100, 100);
  const isWarning = pct > 80;
  const tierLabel = usage.tier === 'pro' ? 'Pro' : 'Free';

  if (loading) {
    return (
      <div className="rounded-xl bg-white/[0.03] border border-white/[0.04] p-4">
        <div className="animate-pulse flex items-center gap-4">
          <div className="h-3 w-20 rounded bg-white/[0.05]" />
          <div className="flex-1 h-2 rounded-full bg-white/[0.05]" />
          <div className="h-3 w-24 rounded bg-white/[0.05]" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-white/[0.03] border border-white/[0.04] p-4 flex items-center gap-4 flex-wrap">
      <div className="flex items-center gap-2">
        <span className="text-[12px] font-medium text-white/50">Tokens</span>
        <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/[0.06] text-white/40">
          {tierLabel}
        </span>
      </div>

      <div className="flex-1 min-w-[120px]">
        <div className="h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
          <div
            className={`h-full rounded-full ${isWarning ? 'bg-amber-500' : 'bg-[#C08B5C]'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <span className="text-[12px] font-mono text-white/40">
        {usage.used.toLocaleString()} <span className="text-white/15">/</span> {(usage.limit / 1000).toFixed(0)}K
      </span>

      {usage.tier === 'free' ? (
        <button onClick={onUpgrade} className="text-[11px] font-semibold text-[#C08B5C] hover:text-[#D4A27F]">
          Upgrade
        </button>
      ) : isWarning ? (
        <button onClick={onUpgrade} className="text-[11px] font-semibold text-amber-400 hover:text-amber-300">
          Buy tokens
        </button>
      ) : null}
    </div>
  );
};
