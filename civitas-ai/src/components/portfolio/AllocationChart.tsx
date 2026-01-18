/**
 * Allocation Chart Component
 * Donut chart showing portfolio allocation by property type/location
 */

import React, { useState } from 'react';
import { PieChart } from 'lucide-react';

interface AllocationData {
  label: string;
  value: number;
  color: string;
  percentage: number;
}

interface AllocationChartProps {
  data: AllocationData[];
  title?: string;
  centerLabel?: string;
}

export const AllocationChart: React.FC<AllocationChartProps> = ({
  data,
  title = "Asset Allocation",
  centerLabel = "Total"
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const total = data.reduce((sum, item) => sum + item.value, 0);
  const radius = 40;
  const strokeWidth = 12;
  const centerX = 50;
  const centerY = 50;

  // Calculate donut segments
  let currentAngle = -90; // Start from top
  const segments = data.map((item) => {
    const calculatedPercentage = (item.value / total) * 100;
    const angle = (calculatedPercentage / 100) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    
    currentAngle = endAngle;

    // Calculate arc path
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    
    const x1 = centerX + radius * Math.cos(startRad);
    const y1 = centerY + radius * Math.sin(startRad);
    const x2 = centerX + radius * Math.cos(endRad);
    const y2 = centerY + radius * Math.sin(endRad);
    
    const largeArc = angle > 180 ? 1 : 0;
    
    return {
      path: `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`,
      percentage: calculatedPercentage,
      label: item.label,
      value: item.value,
      color: item.color
    };
  });

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    }
    return `$${(value / 1000).toFixed(0)}K`;
  };

  return (
    <div className="bg-[#222] rounded-lg border border-gray-800 p-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <div className="p-1.5 bg-gray-900 rounded-md">
          <PieChart className="w-4 h-4 text-gray-400" />
        </div>
        <h3 className="text-base font-semibold text-white">Asset Allocation</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
        {/* Donut Chart */}
        <div className="relative">
          <svg viewBox="0 0 100 100" className="w-full h-full max-w-[240px] mx-auto">
            {/* Background circle */}
            <circle
              cx={centerX}
              cy={centerY}
              r={radius}
              fill="none"
              stroke="rgba(255,255,255,0.05)"
              strokeWidth={strokeWidth}
            />

            {/* Donut segments */}
            {segments.map((segment, index) => (
              <path
                key={index}
                d={segment.path}
                fill={segment.color}
                opacity={hoveredIndex === null || hoveredIndex === index ? 1 : 0.3}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="cursor-pointer transition-opacity"
              />
            ))}

            {/* Center text */}
            <text
              x={centerX}
              y={centerY - 5}
              textAnchor="middle"
              className="text-[6px] fill-gray-400"
            >
              {centerLabel}
            </text>
            <text
              x={centerX}
              y={centerY + 5}
              textAnchor="middle"
              className="text-[10px] font-semibold fill-white"
            >
              {formatCurrency(total)}
            </text>
          </svg>

          {/* Hovered segment info */}
          {hoveredIndex !== null && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none z-10">
              <div className="bg-gray-950 px-4 py-2 rounded-lg border border-gray-700">
                <div className="text-xs text-gray-400 mb-1">
                  {segments[hoveredIndex].label}
                </div>
                <div className="text-sm font-semibold text-white">
                  {segments[hoveredIndex].percentage.toFixed(1)}%
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="space-y-3">
          {segments.map((segment, index) => (
            <div
              key={index}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className={`flex items-center justify-between p-3 rounded-md cursor-pointer transition-colors ${
                hoveredIndex === index
                  ? 'bg-[#333]'
                  : 'bg-[#2a2a2a] hover:bg-[#333]'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: segment.color }}
                />
                <span className="text-sm text-gray-300">{segment.label}</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-white">
                  {formatCurrency(segment.value)}
                </div>
                <div className="text-xs text-gray-500">
                  {segment.percentage.toFixed(1)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
