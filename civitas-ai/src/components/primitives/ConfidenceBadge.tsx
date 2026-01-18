/**
 * Confidence Badge
 * 
 * Visual indicator for AI confidence levels
 * - High: 85%+ (green)
 * - Medium: 60-84% (amber)
 * - Low: <60% (red)
 */

import React from 'react';
import { cn } from '@/lib/utils';

type ConfidenceLevel = 'high' | 'medium' | 'low';

interface ConfidenceBadgeProps {
  level: ConfidenceLevel;
  className?: string;
}

export const ConfidenceBadge: React.FC<ConfidenceBadgeProps> = ({
  level,
  className,
}) => {
  const config = {
    high: {
      bg: 'rgba(16, 185, 129, 0.12)',
      border: 'rgba(16, 185, 129, 0.3)',
      text: '#10b981',
      label: 'High',
      dot: '#10b981',
    },
    medium: {
      bg: 'rgba(245, 158, 11, 0.12)',
      border: 'rgba(245, 158, 11, 0.3)',
      text: '#fbbf24',
      label: 'Medium',
      dot: '#fbbf24',
    },
    low: {
      bg: 'rgba(239, 68, 68, 0.12)',
      border: 'rgba(239, 68, 68, 0.3)',
      text: '#ef4444',
      label: 'Low',
      dot: '#ef4444',
    },
  };

  const { bg, border, text, label, dot } = config[level];

  return (
    <span
      className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium', className)}
      style={{
        background: bg,
        border: `1px solid ${border}`,
        color: text,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ background: dot }}
      />
      {label}
    </span>
  );
};
