/**
 * ScoreGauge — Animated circular score indicator
 *
 * SVG circular gauge with animated stroke-dashoffset, smooth color
 * interpolation (red → yellow → green), inner glow, and animated
 * number counting.
 */

import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';

// ── Types ──────────────────────────────────────────────────

interface ScoreGaugeProps {
  /** Score value 0–100 */
  score: number;
  /** Outer diameter in px */
  size?: number;
  /** Stroke width in px */
  strokeWidth?: number;
  /** Label below the score */
  label?: string;
  /** Whether to animate on mount */
  animate?: boolean;
  /** Animation duration in seconds */
  duration?: number;
  /** Show the numeric value */
  showValue?: boolean;
  /** Optional className for wrapper */
  className?: string;
}

// ── Color interpolation ────────────────────────────────────

function scoreColor(score: number): string {
  if (score >= 70) return '#22c55e';   // green-500
  if (score >= 50) return '#eab308';   // yellow-500
  if (score >= 30) return '#f97316';   // orange-500
  return '#ef4444';                     // red-500
}

function scoreGlowColor(score: number): string {
  if (score >= 70) return 'rgba(34,197,94,0.3)';
  if (score >= 50) return 'rgba(234,179,8,0.25)';
  if (score >= 30) return 'rgba(249,115,22,0.25)';
  return 'rgba(239,68,68,0.25)';
}

// ── Animated Counter Hook ──────────────────────────────────

function useCountUp(target: number, duration: number, animate: boolean): number {
  const [value, setValue] = useState(animate ? 0 : target);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!animate) { setValue(target); return; }

    const start = performance.now();
    const from = 0;

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / (duration * 1000), 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(from + (target - from) * eased));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration, animate]);

  return value;
}

// ── Main Component ─────────────────────────────────────────

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({
  score,
  size = 120,
  strokeWidth = 8,
  label,
  animate = true,
  duration = 1.2,
  showValue = true,
  className = '',
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - score / 100);
  const color = scoreColor(score);
  const glow = scoreGlowColor(score);
  const displayValue = useCountUp(score, duration, animate);

  return (
    <div className={`relative inline-flex flex-col items-center gap-2 ${className}`}>
      <div className="relative" style={{ width: size, height: size }}>
        {/* Inner glow */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            boxShadow: `inset 0 0 ${size * 0.3}px ${glow}`,
          }}
        />

        <svg width={size} height={size} className="transform -rotate-90">
          {/* Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.04)"
            strokeWidth={strokeWidth}
          />

          {/* Progress arc */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={animate ? { strokeDashoffset: circumference } : { strokeDashoffset: offset }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration, ease: [0.33, 1, 0.68, 1] }}
            style={{
              filter: `drop-shadow(0 0 6px ${glow})`,
            }}
          />
        </svg>

        {/* Center text */}
        {showValue && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className="font-display font-bold tracking-tight text-white"
              style={{ fontSize: size * 0.28 }}
            >
              {displayValue}
            </span>
            <span
              className="text-white/30 font-medium"
              style={{ fontSize: size * 0.11 }}
            >
              / 100
            </span>
          </div>
        )}
      </div>

      {/* Label */}
      {label && (
        <span className="text-xs font-medium text-white/40 tracking-wide uppercase">
          {label}
        </span>
      )}
    </div>
  );
};

export default ScoreGauge;
