/**
 * VisionScoreCard — Circular gauge showing composite Vision Score (0-100)
 *
 * Premium animated SVG gauge with score breakdown,
 * count-up animation, and color-coded severity ring.
 */

import React, { useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';

// ── Score color mapping ────────────────────────────────────

function getScoreColor(score: number): string {
  if (score >= 80) return '#34D399'; // emerald-400
  if (score >= 60) return '#4ADE80'; // green-400
  if (score >= 40) return '#FBBF24'; // amber-400
  if (score >= 20) return '#FB923C'; // orange-400
  return '#F87171';                  // red-400
}

function getScoreLabel(score: number): string {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  if (score >= 20) return 'Poor';
  return 'Critical';
}

function getScoreGlow(score: number): string {
  if (score >= 80) return 'rgba(52, 211, 153, 0.3)';
  if (score >= 60) return 'rgba(74, 222, 128, 0.3)';
  if (score >= 40) return 'rgba(251, 191, 36, 0.3)';
  if (score >= 20) return 'rgba(251, 146, 60, 0.3)';
  return 'rgba(248, 113, 113, 0.3)';
}

// ── Sub-score pill component ───────────────────────────────

interface SubScorePillProps {
  label: string;
  value: number;
  delay?: number;
}

const SubScorePill: React.FC<SubScorePillProps> = ({ label, value, delay = 0 }) => {
  const color = getScoreColor(value);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: delay + 0.8 }}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06]"
    >
      <span className="text-[10px] font-medium text-white/40 uppercase tracking-wider">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] min-w-[40px]">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(value, 100)}%` }}
          transition={{ duration: 0.8, delay: delay + 1.0, ease: 'easeOut' }}
        />
      </div>
      <span className="text-[11px] font-mono font-bold text-white/70">{Math.round(value)}</span>
    </motion.div>
  );
};

// ── Animated counter ───────────────────────────────────────

const AnimatedScore: React.FC<{ value: number }> = ({ value }) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v));
  const [display, setDisplay] = React.useState(0);

  useEffect(() => {
    const controls = animate(count, value, {
      duration: 1.2,
      ease: 'easeOut',
    });
    const unsubscribe = rounded.on('change', (v) => setDisplay(v));
    return () => {
      controls.stop();
      unsubscribe();
    };
  }, [value, count, rounded]);

  return <>{display}</>;
};

// ── Main Component ─────────────────────────────────────────

export interface VisionScoreCardProps {
  /** Overall Vision Score (0-100) */
  score: number;
  /** Sub-score components */
  dealScore?: number;
  healthScore?: number;
  vastuScore?: number;
  conditionScore?: number;
  /** Optional compact mode */
  compact?: boolean;
}

export const VisionScoreCard: React.FC<VisionScoreCardProps> = ({
  score,
  dealScore,
  healthScore,
  vastuScore,
  conditionScore,
  compact = false,
}) => {
  const color = getScoreColor(score);
  const label = getScoreLabel(score);
  const glow = getScoreGlow(score);

  // SVG gauge calculations
  const radius = compact ? 36 : 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const size = compact ? 88 : 110;
  const center = size / 2;
  const strokeWidth = compact ? 3 : 4;

  return (
    <div className={`flex flex-col items-center ${compact ? 'gap-2' : 'gap-4'}`}>
      {/* Gauge */}
      <motion.div
        className="relative"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <svg
          width={size}
          height={size}
          className="transform -rotate-90"
          style={{ filter: `drop-shadow(0 0 20px ${glow})` }}
        >
          {/* Background track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={strokeWidth}
          />
          {/* Score arc */}
          <motion.circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
          />
        </svg>

        {/* Center score */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={`font-display font-bold tracking-tight ${compact ? 'text-2xl' : 'text-4xl'}`}
            style={{ color }}
          >
            <AnimatedScore value={score} />
          </span>
          {!compact && (
            <span className="text-[10px] font-medium text-white/40 uppercase tracking-wider mt-0.5">
              {label}
            </span>
          )}
        </div>
      </motion.div>

      {/* Label */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-center"
      >
        <div className="text-[11px] font-medium text-white/40 uppercase tracking-wider">
          Vision Score
        </div>
      </motion.div>

      {/* Sub-scores */}
      {!compact && (dealScore != null || healthScore != null || vastuScore != null || conditionScore != null) && (
        <div className="w-full max-w-xs space-y-1.5 mt-2">
          {dealScore != null && <SubScorePill label="Deal" value={dealScore} delay={0} />}
          {healthScore != null && <SubScorePill label="Health" value={healthScore} delay={0.05} />}
          {vastuScore != null && <SubScorePill label="Vastu" value={vastuScore} delay={0.1} />}
          {conditionScore != null && <SubScorePill label="Condition" value={conditionScore} delay={0.15} />}
        </div>
      )}
    </div>
  );
};

export default VisionScoreCard;
