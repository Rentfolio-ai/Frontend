import { useState, useEffect, useCallback, useRef } from 'react';

const envApiUrl = import.meta.env.VITE_DATALAYER_API_URL;
const API_BASE = (envApiUrl && typeof envApiUrl === 'string' && envApiUrl.startsWith('http')) ? envApiUrl : 'http://localhost:8001';
const API_KEY = import.meta.env.VITE_API_KEY;

const TIER_BUDGETS: Record<string, number> = {
  free: 25_000,
  pro: 100_000,
  enterprise: -1,
};

export interface TokenUsage {
  used: number;
  budget: number;
  remaining: number;
  percentage: number;
  resetDate: string;
  tier: string;
  modelBreakdown: Record<string, number>;
}

interface UseTokenUsageResult {
  usage: TokenUsage | null;
  refresh: () => void;
  isNearLimit: boolean;
  isExhausted: boolean;
  isLoading: boolean;
}

function defaultUsage(tier: string): TokenUsage {
  const budget = TIER_BUDGETS[tier] ?? TIER_BUDGETS.free;
  return {
    used: 0,
    budget,
    remaining: budget,
    percentage: 0,
    resetDate: '',
    tier,
    modelBreakdown: {},
  };
}

export function useTokenUsage(userId: string, tier: string = 'free'): UseTokenUsageResult {
  const [usage, setUsage] = useState<TokenUsage | null>(() => defaultUsage(tier));
  const [isLoading, setIsLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const fetchUsage = useCallback(async () => {
    if (!userId) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsLoading(true);
    try {
      const url = `${API_BASE}/v2/usage?user_id=${encodeURIComponent(userId)}&tier=${encodeURIComponent(tier)}`;
      const headers: Record<string, string> = { 'X-User-ID': userId };
      if (API_KEY) headers['X-API-Key'] = API_KEY;

      const res = await fetch(url, { headers, signal: controller.signal });
      if (!res.ok) {
        setUsage(defaultUsage(tier));
        return;
      }

      const data = await res.json();
      setUsage({
        used: data.used ?? 0,
        budget: data.budget ?? TIER_BUDGETS[tier] ?? TIER_BUDGETS.free,
        remaining: data.remaining ?? 0,
        percentage: data.percentage ?? 0,
        resetDate: data.reset_date ?? '',
        tier: data.tier ?? tier,
        modelBreakdown: data.model_breakdown ?? {},
      });
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.warn('[useTokenUsage] fetch failed:', err);
        setUsage(defaultUsage(tier));
      }
    } finally {
      setIsLoading(false);
    }
  }, [userId, tier]);

  useEffect(() => {
    fetchUsage();
    return () => { abortRef.current?.abort(); };
  }, [fetchUsage]);

  const isNearLimit = usage ? usage.budget > 0 && usage.percentage >= 80 : false;
  const isExhausted = usage ? usage.budget > 0 && usage.used >= usage.budget : false;

  return { usage, refresh: fetchUsage, isNearLimit, isExhausted, isLoading };
}
