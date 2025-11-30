// FILE: src/components/market/MarketAnalysis.tsx
/**
 * Market Analysis component - displays comprehensive market statistics for a zip code
 */

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { marketAPI } from '@/services/marketApi';
import type { MarketStatsResponse } from '@/types/market';

// ============================================================================
// Helper Functions
// ============================================================================

const formatCurrency = (value: number | null): string => {
  if (value === null) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const formatPercent = (value: number | null, decimals = 1): string => {
  if (value === null) return 'N/A';
  return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`;
};

const formatNumber = (value: number | null, round = true): string => {
  if (value === null) return 'N/A';
  const num = round ? Math.round(value) : value;
  return new Intl.NumberFormat('en-US').format(num);
};

// ============================================================================
// Sub-components
// ============================================================================

interface StatCardProps {
  label: string;
  value: string;
  variant?: 'default' | 'positive' | 'negative' | 'highlight';
  size?: 'sm' | 'md' | 'lg';
  sublabel?: string;
}

const StatCard: React.FC<StatCardProps> = ({ 
  label, 
  value, 
  variant = 'default',
  size = 'md',
  sublabel,
}) => {
  const bgStyles = {
    default: 'bg-slate-100 dark:bg-slate-800',
    positive: 'bg-emerald-50 dark:bg-emerald-900/30',
    negative: 'bg-red-50 dark:bg-red-900/30',
    highlight: 'bg-blue-50 dark:bg-blue-900/30',
  };

  const textStyles = {
    default: 'text-slate-900 dark:text-slate-100',
    positive: 'text-emerald-600 dark:text-emerald-400',
    negative: 'text-red-600 dark:text-red-400',
    highlight: 'text-blue-600 dark:text-blue-400',
  };

  const sizeStyles = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  return (
    <div className={cn('rounded-xl p-4 text-center', bgStyles[variant])}>
      <div className={cn('font-bold', sizeStyles[size], textStyles[variant])}>
        {value}
      </div>
      <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mt-1">
        {label}
      </div>
      {sublabel && (
        <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
          {sublabel}
        </div>
      )}
    </div>
  );
};

const LoadingState: React.FC = () => (
  <div className="space-y-4">
    <div className="grid grid-cols-3 gap-3">
      {[1, 2, 3].map((i) => (
        <div 
          key={i} 
          className="bg-slate-100 dark:bg-slate-800 rounded-xl p-4 animate-pulse"
        >
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mx-auto" />
          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mx-auto mt-2" />
        </div>
      ))}
    </div>
    <div className="grid grid-cols-4 gap-3">
      {[1, 2, 3, 4].map((i) => (
        <div 
          key={i} 
          className="bg-slate-100 dark:bg-slate-800 rounded-xl p-3 animate-pulse"
        >
          <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mx-auto" />
          <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mx-auto mt-2" />
        </div>
      ))}
    </div>
  </div>
);

const ErrorState: React.FC<{ message: string; onRetry?: () => void }> = ({ message, onRetry }) => (
  <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 text-center">
    <div className="text-red-600 dark:text-red-400 font-medium">
      Failed to load market data
    </div>
    <div className="text-sm text-red-500 dark:text-red-400/80 mt-1">
      {message}
    </div>
    {onRetry && (
      <button
        onClick={onRetry}
        className="mt-3 px-4 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 
                   bg-red-100 dark:bg-red-900/40 rounded-lg hover:bg-red-200 
                   dark:hover:bg-red-900/60 transition-colors"
      >
        Retry
      </button>
    )}
  </div>
);

// ============================================================================
// Main Component
// ============================================================================

export interface MarketAnalysisProps {
  zipCode: string;
  className?: string;
  compact?: boolean;
}

export const MarketAnalysis: React.FC<MarketAnalysisProps> = ({ 
  zipCode, 
  className,
  compact = false,
}) => {
  const [data, setData] = useState<MarketStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await marketAPI.getMarketStats({ zip_code: zipCode });
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (zipCode) {
      fetchData();
    }
  }, [zipCode]);

  if (loading) {
    return (
      <div className={className}>
        <LoadingState />
      </div>
    );
  }

  if (error) {
    return (
      <div className={className}>
        <ErrorState message={error} onRetry={fetchData} />
      </div>
    );
  }

  if (!data) {
    return null;
  }

  // Determine growth variant
  const growthVariant = data.yoy_growth === null 
    ? 'default' 
    : data.yoy_growth > 0 
      ? 'positive' 
      : data.yoy_growth < 0 
        ? 'negative' 
        : 'default';

  // Determine yield variant (highlight if good yield > 5%)
  const yieldVariant = data.gross_yield === null
    ? 'default'
    : data.gross_yield >= 5
      ? 'positive'
      : 'default';

  if (compact) {
    return (
      <div className={cn('space-y-3', className)}>
        {/* Compact 4-column grid */}
        <div className="grid grid-cols-4 gap-2">
          <StatCard 
            label="Median Price" 
            value={formatCurrency(data.median_price)} 
            size="sm"
          />
          <StatCard 
            label="YoY Growth" 
            value={formatPercent(data.yoy_growth)} 
            variant={growthVariant}
            size="sm"
          />
          <StatCard 
            label="Median Rent" 
            value={formatCurrency(data.median_rent)} 
            size="sm"
          />
          <StatCard 
            label="Gross Yield" 
            value={data.gross_yield !== null ? `${data.gross_yield.toFixed(2)}%` : 'N/A'} 
            variant={yieldVariant}
            size="sm"
          />
        </div>
        
        {/* Location */}
        <div className="text-xs text-slate-500 dark:text-slate-400 text-center">
          📍 {data.location} • Source: {data.data_source}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Primary Stats - 3 column */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard 
          label="Median Price" 
          value={formatCurrency(data.median_price)}
          sublabel={data.price_per_sqft !== null ? `${formatCurrency(data.price_per_sqft)}/sqft` : undefined}
        />
        <StatCard 
          label="YoY Growth" 
          value={formatPercent(data.yoy_growth)} 
          variant={growthVariant}
        />
        <StatCard 
          label="Days on Market" 
          value={formatNumber(data.days_on_market)}
        />
      </div>

      {/* Secondary Stats - 4 column */}
      <div className="grid grid-cols-4 gap-3">
        <StatCard 
          label="Median Rent" 
          value={formatCurrency(data.median_rent)}
          size="sm"
          sublabel={data.rent_per_sqft !== null ? `${formatCurrency(data.rent_per_sqft)}/sqft` : undefined}
        />
        <StatCard 
          label="Gross Yield" 
          value={data.gross_yield !== null ? `${data.gross_yield.toFixed(2)}%` : 'N/A'}
          variant={yieldVariant}
          size="sm"
        />
        <StatCard 
          label="Sale Listings" 
          value={formatNumber(data.total_sale_listings)}
          size="sm"
        />
        <StatCard 
          label="Rental Listings" 
          value={formatNumber(data.total_rental_listings)}
          size="sm"
        />
      </div>

      {/* Market Summary Highlights */}
      {data.market_summary?.highlights && data.market_summary.highlights.length > 0 && (
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 space-y-1.5">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
            Market Insights
          </div>
          {data.market_summary.highlights.map((highlight, i) => (
            <div 
              key={i} 
              className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300"
            >
              <span className="text-amber-500 flex-shrink-0">💡</span>
              <span>{highlight}</span>
            </div>
          ))}
        </div>
      )}

      {/* Footer with location and source */}
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-slate-700 dark:text-slate-300">
          📍 {data.location}
        </span>
        <span className="text-slate-500 dark:text-slate-400">
          Source: {data.data_source}
        </span>
      </div>
    </div>
  );
};

export default MarketAnalysis;
