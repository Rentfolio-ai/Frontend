// FILE: src/components/chat/tool-cards/MarketDataCard.tsx
import React from 'react';
import { cn } from '@/lib/utils';

interface MarketData {
  medianPrice: string;
  priceGrowth: number;
  inventory: number;
  location: string;
  date: string;
}

interface MarketDataCardProps {
  data: MarketData;
}

// Format price with proper formatting
const formatPrice = (price: string | number): string => {
  const numPrice = typeof price === 'string' ? parseFloat(price.replace(/[^0-9.]/g, '')) : price;
  if (isNaN(numPrice)) return String(price);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numPrice);
};

export const MarketDataCard: React.FC<MarketDataCardProps> = ({ data }) => {
  const isPositiveGrowth = data.priceGrowth > 0;
  const isNegativeGrowth = data.priceGrowth < 0;
  
  return (
    <div className="space-y-4 mt-3">
      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        {/* Median Price */}
        <div className="bg-slate-100 dark:bg-muted rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-slate-900 dark:text-foreground">
            {formatPrice(data.medianPrice)}
          </div>
          <div className="text-xs font-medium text-muted-foreground/70 dark:text-muted-foreground uppercase tracking-wide mt-1">
            Median Price
          </div>
        </div>
        
        {/* YoY Growth */}
        <div className={cn(
          'rounded-xl p-4 text-center',
          isPositiveGrowth && 'bg-emerald-50 dark:bg-emerald-900/30',
          isNegativeGrowth && 'bg-red-50 dark:bg-red-900/30',
          !isPositiveGrowth && !isNegativeGrowth && 'bg-slate-100 dark:bg-muted'
        )}>
          <div className={cn(
            'text-2xl font-bold',
            isPositiveGrowth && 'text-emerald-600 dark:text-emerald-400',
            isNegativeGrowth && 'text-red-600 dark:text-red-400',
            !isPositiveGrowth && !isNegativeGrowth && 'text-slate-900 dark:text-foreground'
          )}>
            {isPositiveGrowth ? '+' : ''}{data.priceGrowth}%
          </div>
          <div className="text-xs font-medium text-muted-foreground/70 dark:text-muted-foreground uppercase tracking-wide mt-1">
            YoY Growth
          </div>
        </div>
        
        {/* Days on Market */}
        <div className="bg-slate-100 dark:bg-muted rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-slate-900 dark:text-foreground">
            {data.inventory}
          </div>
          <div className="text-xs font-medium text-muted-foreground/70 dark:text-muted-foreground uppercase tracking-wide mt-1">
            Days on Market
          </div>
        </div>
      </div>
      
      {/* Location & Date */}
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-slate-700 dark:text-foreground/70">
          📍 {data.location}
        </span>
        <span className="text-muted-foreground/70 dark:text-muted-foreground">
          as of {data.date}
        </span>
      </div>
    </div>
  );
};
