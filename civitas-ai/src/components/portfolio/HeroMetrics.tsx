/**
 * Hero Metrics Component
 * Displays portfolio value with animated counting and trend indicators
 */

import React, { useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Home, Percent } from 'lucide-react';

interface HeroMetricsProps {
  totalValue: number;
  change24h: number;
  change7d: number;
  change30d: number;
  changeYTD: number;
  propertyCount: number;
  occupancyRate: number;
  monthlyIncome: number;
}

export const HeroMetrics: React.FC<HeroMetricsProps> = ({
  totalValue,
  change24h,
  change7d,
  change30d,
  changeYTD,
  propertyCount,
  occupancyRate,
  monthlyIncome,
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'24h' | '7d' | '30d' | 'ytd'>('ytd');

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value.toFixed(0)}`;
  };

  const formatPercent = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };

  const getChangeValue = () => {
    switch (selectedPeriod) {
      case '24h': return change24h;
      case '7d': return change7d;
      case '30d': return change30d;
      case 'ytd': return changeYTD;
    }
  };

  const changeValue = getChangeValue();
  const isPositive = changeValue >= 0;

  return (
    <div className="bg-[#222] rounded-lg border border-gray-800 p-8">
      <div>
        {/* Main Portfolio Value */}
        <div className="text-center mb-8">
          <div className="mb-2">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
              Total Portfolio Value
            </span>
          </div>
          
          <div
            className="text-5xl font-semibold text-white mb-3"
            style={{ fontFamily: 'JetBrains Mono, monospace' }}
          >
            {formatCurrency(totalValue)}
          </div>

          {/* Performance Indicator */}
          <div className="flex items-center justify-center gap-3">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md ${
              isPositive 
                ? 'bg-green-500/10' 
                : 'bg-red-500/10'
            }`}>
              {isPositive ? (
                <TrendingUp className="w-4 h-4 text-green-400" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-400" />
              )}
              <span className={`text-lg font-semibold ${
                isPositive ? 'text-green-400' : 'text-red-400'
              }`}>
                {formatPercent(changeValue)}
              </span>
            </div>

            {/* Period Selector */}
            <div className="flex items-center gap-1 bg-gray-900 rounded-md p-0.5">
              {(['24h', '7d', '30d', 'ytd'] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                    selectedPeriod === period
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {period.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Properties Count */}
          <div className="bg-[#2a2a2a] rounded-md p-5 hover:bg-[#333] transition-colors">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 bg-blue-500/10 rounded-md">
                <Home className="w-5 h-5 text-blue-400" />
              </div>
              <span className="text-2xl font-semibold text-white">{propertyCount}</span>
            </div>
            <div className="text-xs text-gray-400 font-medium">Total Properties</div>
          </div>

          {/* Occupancy Rate */}
          <div className="bg-[#2a2a2a] rounded-md p-5 hover:bg-[#333] transition-colors">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 bg-green-500/10 rounded-md">
                <Percent className="w-5 h-5 text-green-400" />
              </div>
              <span className="text-2xl font-semibold text-white">{occupancyRate}%</span>
            </div>
            <div className="text-xs text-gray-400 font-medium">Occupancy Rate</div>
          </div>

          {/* Monthly Income */}
          <div className="bg-[#2a2a2a] rounded-md p-5 hover:bg-[#333] transition-colors">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 bg-purple-500/10 rounded-md">
                <DollarSign className="w-5 h-5 text-purple-400" />
              </div>
              <span className="text-2xl font-semibold text-white">{formatCurrency(monthlyIncome)}</span>
            </div>
            <div className="text-xs text-gray-400 font-medium">Monthly Income</div>
          </div>
        </div>
      </div>
    </div>
  );
};
