// Custom icon: Upward trending line chart with data points
// Represents performance tracking and financial analysis

import React from 'react';

interface AnalyticsChartIconProps {
  className?: string;
  size?: number;
  style?: React.CSSProperties;
}

export const AnalyticsChartIcon: React.FC<AnalyticsChartIconProps> = ({ 
  className = '', 
  size = 24,
  style
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
    >
      {/* Chart frame */}
      <path d="M3 3v16a2 2 0 0 0 2 2h16" />
      
      {/* Upward trending line with data points */}
      <path d="M7 15l3-4 3 2 4-6" strokeWidth="2.5" />
      
      {/* Data point circles */}
      <circle cx="7" cy="15" r="1.5" fill="currentColor" />
      <circle cx="10" cy="11" r="1.5" fill="currentColor" />
      <circle cx="13" cy="13" r="1.5" fill="currentColor" />
      <circle cx="17" cy="7" r="1.5" fill="currentColor" />
      
      {/* Upward arrow accent */}
      <path d="M19 7l-2-2" strokeWidth="2" />
      <path d="M19 7l-2 2" strokeWidth="2" />
    </svg>
  );
};
