/**
 * Performance Chart Component
 * Interactive chart showing portfolio value over time
 */

import React, { useState } from 'react';
import { TrendingUp, Calendar } from 'lucide-react';

interface DataPoint {
  date: string;
  value: number;
}

interface PerformanceChartProps {
  data: DataPoint[];
  title?: string;
}

export const PerformanceChart: React.FC<PerformanceChartProps> = ({
  data,
  title = "Portfolio Performance"
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [timeRange, setTimeRange] = useState<'1M' | '3M' | '6M' | '1Y' | 'ALL'>('1Y');

  // Calculate chart dimensions
  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const valueRange = maxValue - minValue;

  // Generate SVG path for line chart
  const generatePath = () => {
    const width = 100; // percentage
    const height = 100; // percentage
    const points = data.map((point, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((point.value - minValue) / valueRange) * height;
      return `${x},${y}`;
    });
    return `M ${points.join(' L ')}`;
  };

  // Generate area fill path
  const generateAreaPath = () => {
    const basePath = generatePath();
    const lastX = 100;
    return `${basePath} L ${lastX},100 L 0,100 Z`;
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    }
    return `$${(value / 1000).toFixed(0)}K`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const currentValue = data[data.length - 1]?.value || 0;
  const startValue = data[0]?.value || 0;
  const change = ((currentValue - startValue) / startValue) * 100;
  const isPositive = change >= 0;

  return (
    <div className="bg-[#222] rounded-lg border border-gray-800 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-semibold text-white mb-1">{title}</h3>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span className="text-xl font-semibold text-white">
              {formatCurrency(currentValue)}
            </span>
            <span className={`text-sm font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
              {isPositive ? '+' : ''}{change.toFixed(2)}%
            </span>
          </div>
        </div>

        {/* Time Range Selector */}
        <div className="flex items-center gap-1 bg-gray-900 rounded-md p-0.5">
          {(['1M', '3M', '6M', '1Y', 'ALL'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                timeRange === range
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="relative h-64 bg-[#1a1a1a] rounded-md p-4">
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="w-full h-full"
          onMouseLeave={() => setHoveredIndex(null)}
        >
          {/* Grid lines */}
          <g className="opacity-20">
            {[0, 25, 50, 75, 100].map((y) => (
              <line
                key={y}
                x1="0"
                y1={y}
                x2="100"
                y2={y}
                stroke="#333"
                strokeWidth="0.2"
              />
            ))}
          </g>

          {/* Area fill */}
          <path
            d={generateAreaPath()}
            fill="url(#areaGradient)"
            opacity="0.2"
          />

          {/* Line */}
          <path
            d={generatePath()}
            fill="none"
            stroke={isPositive ? '#10B981' : '#EF4444'}
            strokeWidth="0.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points */}
          {data.map((point, index) => {
            const x = (index / (data.length - 1)) * 100;
            const y = 100 - ((point.value - minValue) / valueRange) * 100;
            
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r={hoveredIndex === index ? 1.5 : 0.8}
                fill={isPositive ? '#10B981' : '#EF4444'}
                className="cursor-pointer transition-all"
                onMouseEnter={() => setHoveredIndex(index)}
              />
            );
          })}

          {/* Gradient definition */}
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={isPositive ? '#10B981' : '#EF4444'} stopOpacity="0.5" />
              <stop offset="100%" stopColor={isPositive ? '#10B981' : '#EF4444'} stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>

        {/* Tooltip */}
        {hoveredIndex !== null && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-[#2a2a2a] px-3 py-2 rounded-md border border-gray-700 pointer-events-none">
            <div className="text-xs text-gray-400 mb-0.5">
              {formatDate(data[hoveredIndex].date)}
            </div>
            <div className="text-sm font-semibold text-white">
              {formatCurrency(data[hoveredIndex].value)}
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-800">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Calendar className="w-4 h-4" />
          <span>Last updated: {formatDate(data[data.length - 1]?.date || new Date().toISOString())}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <TrendingUp className="w-4 h-4" />
          <span>Historical Performance</span>
        </div>
      </div>
    </div>
  );
};
