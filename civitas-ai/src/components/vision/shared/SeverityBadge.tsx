/**
 * SeverityBadge — Visual severity indicator
 *
 * Renders a frosted glass pill badge with a color-coded dot
 * and severity label. Supports sizes and optional confidence %.
 */

import React from 'react';
import { motion } from 'framer-motion';

// ── Types ──────────────────────────────────────────────────

interface SeverityBadgeProps {
  severity: string;
  /** Show as a smaller inline badge */
  size?: 'sm' | 'md' | 'lg';
  /** Show confidence percentage */
  confidence?: number;
  /** Optional class name */
  className?: string;
  /** Animate on mount */
  animate?: boolean;
}

// ── Color Map ──────────────────────────────────────────────

const SEVERITY_STYLES: Record<string, {
  dot: string;
  text: string;
  bg: string;
  border: string;
}> = {
  critical: {
    dot: 'bg-red-500',
    text: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
  },
  high: {
    dot: 'bg-orange-500',
    text: 'text-orange-400',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/20',
  },
  medium: {
    dot: 'bg-yellow-500',
    text: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/20',
  },
  low: {
    dot: 'bg-green-500',
    text: 'text-green-400',
    bg: 'bg-green-500/10',
    border: 'border-green-500/20',
  },
};

const SIZE_MAP = {
  sm: { dot: 'w-1.5 h-1.5', text: 'text-[10px]', pad: 'px-2 py-0.5', gap: 'gap-1' },
  md: { dot: 'w-2 h-2', text: 'text-xs', pad: 'px-2.5 py-1', gap: 'gap-1.5' },
  lg: { dot: 'w-2.5 h-2.5', text: 'text-sm', pad: 'px-3 py-1.5', gap: 'gap-2' },
};

// ── Main Component ─────────────────────────────────────────

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({
  severity,
  size = 'md',
  confidence,
  className = '',
  animate = false,
}) => {
  const styles = SEVERITY_STYLES[severity] || SEVERITY_STYLES.medium;
  const sizeStyles = SIZE_MAP[size];

  const content = (
    <div
      className={`
        inline-flex items-center ${sizeStyles.gap} ${sizeStyles.pad}
        rounded-full border backdrop-blur-xl
        ${styles.bg} ${styles.border}
        ${className}
      `}
    >
      <div className={`${sizeStyles.dot} rounded-full ${styles.dot}`} />
      <span className={`${sizeStyles.text} font-medium capitalize ${styles.text}`}>
        {severity}
      </span>
      {confidence !== undefined && (
        <span className={`${sizeStyles.text} text-white/30 font-medium`}>
          {(confidence * 100).toFixed(0)}%
        </span>
      )}
    </div>
  );

  if (animate) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      >
        {content}
      </motion.div>
    );
  }

  return content;
};

export default SeverityBadge;
