// Custom icon: 3 overlapping house silhouettes (like stacked cards)
// Represents multiple properties in portfolio

import React from 'react';

interface PropertyStackIconProps {
  className?: string;
  size?: number;
  style?: React.CSSProperties;
}

export const PropertyStackIcon: React.FC<PropertyStackIconProps> = ({ 
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
      {/* Back house (most faded) - offset top-left */}
      <g opacity="0.3">
        <path d="M3 11l4-4 4 4v7H3v-7z" />
        <path d="M5 9v7" />
        <path d="M9 9v7" />
      </g>
      
      {/* Middle house - offset middle */}
      <g opacity="0.6">
        <path d="M7 9l4-4 4 4v9H7v-9z" />
        <path d="M9 7v9" />
        <path d="M13 7v9" />
      </g>
      
      {/* Front house (fully visible) */}
      <g>
        <path d="M11 7l5-4 5 4v11h-10V7z" />
        <path d="M13 5v11" />
        <path d="M19 5v11" />
        {/* Door on front house */}
        <rect x="14.5" y="13" width="2" height="5" fill="currentColor" />
      </g>
    </svg>
  );
};
