/**
 * Advanced Analytics Component
 * Deep dive analytics with ROI trends, cash flow projections, and market comparisons
 */

import React, { useState } from 'react';
import { BarChart3, TrendingUp, DollarSign, Target } from 'lucide-react';

interface AdvancedAnalyticsProps {
  portfolioId: string;
}

export const AdvancedAnalytics: React.FC<AdvancedAnalyticsProps> = () => {
  const [selectedMetric, setSelectedMetric] = useState<'roi' | 'cashflow' | 'appreciation' | 'comparison'>('roi');

  // Mock data - replace with real API calls
  const roiData = Array.from({ length: 12 }, (_, i) => ({
    month: new Date(2024, i, 1).toLocaleDateString('en-US', { month: 'short' }),
    value: 8 + Math.random() * 6,
  }));

  const cashflowProjection = Array.from({ length: 24 }, (_, i) => ({
    month: new Date(2024, i, 1).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
    income: 18000 + Math.random() * 2000,
    expenses: 12000 + Math.random() * 1500,
    net: 6000 + Math.random() * 1000,
  }));

  const metrics = [
    {
      id: 'roi' as const,
      label: 'ROI Trends',
      icon: TrendingUp,
      value: '12.5%',
      change: '+2.3%',
      color: 'from-green-500/20 to-emerald-500/20 border-green-500/30 text-green-400',
    },
    {
      id: 'cashflow' as const,
      label: 'Cash Flow',
      icon: DollarSign,
      value: '$6,200',
      change: '+$450',
      color: 'from-blue-500/20 to-blue-600/20 border-blue-500/30 text-blue-400',
    },
    {
      id: 'appreciation' as const,
      label: 'Appreciation',
      icon: Target,
      value: '8.7%',
      change: '+1.2%',
      color: 'from-purple-500/20 to-purple-600/20 border-purple-500/30 text-purple-400',
    },
    {
      id: 'comparison' as const,
      label: 'vs Market',
      icon: BarChart3,
      value: '+4.2%',
      change: 'Outperforming',
      color: 'from-orange-500/20 to-orange-600/20 border-orange-500/30 text-orange-400',
    },
  ];

  const renderChart = () => {
    switch (selectedMetric) {
      case 'roi':
        return (
          <div className="space-y-4">
            <h4 className="text-white font-semibold">ROI Trend (Last 12 Months)</h4>
            <div className="h-64 flex items-end gap-2">
              {roiData.map((data, index) => (
                <div
                  key={index}
                  style={{ height: `${(data.value / 14) * 100}%` }}
                  className="flex-1 bg-gradient-to-t from-green-500 to-emerald-400 rounded-t-lg relative group cursor-pointer"
                >
                  <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-black/90 px-2 py-1 rounded text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {data.month}: {data.value.toFixed(1)}%
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              {roiData.filter((_, i) => i % 3 === 0).map((data) => (
                <span key={data.month}>{data.month}</span>
              ))}
            </div>
          </div>
        );

      case 'cashflow':
        return (
          <div className="space-y-4">
            <h4 className="text-white font-semibold">Cash Flow Projection (Next 24 Months)</h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {cashflowProjection.slice(0, 12).map((data, index) => (
                <div
                  key={index}
                  className="bg-[#2a2a2a] rounded-md p-3"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-white">{data.month}</span>
                    <span className="text-sm font-semibold text-green-400">
                      ${data.net.toFixed(0)}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-400"
                        style={{ width: `${(data.income / 20000) * 100}%` }}
                      />
                    </div>
                    <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-red-500 to-rose-400"
                        style={{ width: `${(data.expenses / 20000) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gradient-to-r from-green-500 to-emerald-400 rounded-full" />
                <span className="text-white/60">Income</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gradient-to-r from-red-500 to-rose-400 rounded-full" />
                <span className="text-white/60">Expenses</span>
              </div>
            </div>
          </div>
        );

      case 'appreciation':
        return (
          <div className="space-y-4">
            <h4 className="text-white font-semibold">Property Appreciation Analysis</h4>
            <div className="grid grid-cols-2 gap-4">
              {[
                { name: 'Austin, TX', value: 18.5, color: 'from-green-500 to-emerald-400' },
                { name: 'Denver, CO', value: 12.3, color: 'from-blue-500 to-blue-400' },
                { name: 'Seattle, WA', value: 15.7, color: 'from-purple-500 to-purple-400' },
                { name: 'Phoenix, AZ', value: 9.2, color: 'from-orange-500 to-orange-400' },
              ].map((property, index) => (
                <div
                  key={index}
                  className="bg-[#2a2a2a] rounded-md p-4"
                >
                  <div className="text-sm text-white/60 mb-2">{property.name}</div>
                  <div className="text-2xl font-bold text-white mb-3">+{property.value}%</div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${(property.value / 20) * 100}%` }}
                      className={`h-full bg-gradient-to-r ${property.color}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'comparison':
        return (
          <div className="space-y-4">
            <h4 className="text-white font-semibold">Market Comparison</h4>
            <div className="space-y-3">
              {[
                { metric: 'Average ROI', yours: 12.5, market: 8.3, better: true },
                { metric: 'Cap Rate', yours: 6.8, market: 5.2, better: true },
                { metric: 'Vacancy Rate', yours: 5.0, market: 7.5, better: true },
                { metric: 'Appreciation', yours: 8.7, market: 6.2, better: true },
              ].map((comparison, index) => (
                <div
                  key={index}
                  className="bg-white/5 rounded-lg p-4 border border-white/10"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-white/80">{comparison.metric}</span>
                    <span
                      className={`text-xs font-semibold ${
                        comparison.better ? 'text-green-400' : 'text-red-400'
                      }`}
                    >
                      {comparison.better ? 'Outperforming' : 'Underperforming'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-white/60 mb-1">Your Portfolio</div>
                      <div className="text-lg font-bold text-white">{comparison.yours}%</div>
                    </div>
                    <div>
                      <div className="text-xs text-white/60 mb-1">Market Average</div>
                      <div className="text-lg font-bold text-white/60">{comparison.market}%</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="bg-[#222] rounded-lg p-6 border border-gray-800">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-1.5 bg-blue-500/10 rounded-md">
          <BarChart3 className="w-4 h-4 text-blue-400" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-white">Advanced Analytics</h3>
          <p className="text-sm text-white/60">Deep dive into your portfolio performance</p>
        </div>
      </div>

      {/* Metric Selector */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <button
              key={metric.id}
              onClick={() => setSelectedMetric(metric.id)}
              className={`bg-[#2a2a2a] rounded-md p-4 text-left transition-colors hover:bg-[#333] ${
                selectedMetric === metric.id ? 'ring-1 ring-gray-600' : ''
              }`}
            >
              <Icon className="w-5 h-5 mb-2" />
              <div className="text-xs text-white/60 mb-1">{metric.label}</div>
              <div className="text-xl font-semibold text-white mt-2">{metric.value}</div>
              <div className="text-xs text-gray-400 mt-1">{metric.change}</div>
            </button>
          );
        })}
      </div>

      {/* Chart Area */}
      <div className="bg-[#2a2a2a] rounded-md p-6">
        {renderChart()}
      </div>
    </div>
  );
};
