/**
 * DetectionOverlay — SVG detection bounding box overlay
 *
 * Renders rounded-corner bounding boxes with animated dash patterns,
 * floating labels with severity indicators, and confidence arcs.
 * Used on both camera feed and result images.
 */

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ── Types ──────────────────────────────────────────────────

export interface Detection {
  damage_class: string;
  severity: string;
  confidence: number;
  class_confidence?: number;
  severity_confidence?: number;
  bbox: number[]; // [x1, y1, x2, y2] normalised 0–1
}

interface DetectionOverlayProps {
  detections: Detection[];
  /** Container dimensions for label positioning */
  width?: number;
  height?: number;
  /** Currently selected detection index */
  activeIndex?: number | null;
  /** Callback when a detection is tapped */
  onTap?: (index: number) => void;
  /** Whether to animate new detections */
  animate?: boolean;
}

// ── Helpers ────────────────────────────────────────────────

const SEVERITY_COLORS: Record<string, { stroke: string; fill: string; dot: string; text: string }> = {
  critical: { stroke: '#ef4444', fill: 'rgba(239,68,68,0.05)', dot: 'bg-red-500', text: 'text-red-400' },
  high:     { stroke: '#f97316', fill: 'rgba(249,115,22,0.05)', dot: 'bg-orange-500', text: 'text-orange-400' },
  medium:   { stroke: '#eab308', fill: 'rgba(234,179,8,0.05)', dot: 'bg-yellow-500', text: 'text-yellow-400' },
  low:      { stroke: '#22c55e', fill: 'rgba(34,197,94,0.05)', dot: 'bg-green-500', text: 'text-green-400' },
};

function formatDamageClass(cls: string): string {
  return cls.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

// ── Detection Box (SVG) ────────────────────────────────────

const DetectionBox: React.FC<{
  det: Detection;
  index: number;
  isActive: boolean;
  onTap?: (index: number) => void;
  animate?: boolean;
}> = ({ det, index, isActive, onTap, animate = true }) => {
  const colors = SEVERITY_COLORS[det.severity] || SEVERITY_COLORS.medium;
  const [x1, y1, x2, y2] = det.bbox;
  const w = x2 - x1;
  const h = y2 - y1;
  const rx = 0.008; // rounded corners in normalised space

  return (
    <motion.g
      initial={animate ? { opacity: 0, scale: 0.85 } : false}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        delay: index * 0.08,
        type: 'spring',
        stiffness: 300,
        damping: 22,
      }}
      style={{ cursor: onTap ? 'pointer' : 'default' }}
      onClick={() => onTap?.(index)}
    >
      {/* Fill */}
      <rect
        x={x1} y={y1} width={w} height={h} rx={rx}
        fill={colors.fill}
        stroke="none"
      />

      {/* Animated dashed border */}
      <rect
        x={x1} y={y1} width={w} height={h} rx={rx}
        fill="none"
        stroke={colors.stroke}
        strokeWidth={isActive ? 0.004 : 0.003}
        strokeDasharray="0.015 0.008"
        opacity={isActive ? 1 : 0.7}
      >
        <animate
          attributeName="stroke-dashoffset"
          values="0;0.046"
          dur="2s"
          repeatCount="indefinite"
        />
      </rect>

      {/* Active pulse ring */}
      {isActive && (
        <rect
          x={x1 - 0.003} y={y1 - 0.003}
          width={w + 0.006} height={h + 0.006}
          rx={rx + 0.003}
          fill="none"
          stroke={colors.stroke}
          strokeWidth={0.002}
          opacity={0.4}
          className="animate-scan-pulse"
        />
      )}
    </motion.g>
  );
};

// ── Floating Label (HTML positioned over SVG) ──────────────

const FloatingLabel: React.FC<{
  det: Detection;
  index: number;
  isActive: boolean;
  containerWidth: number;
  containerHeight: number;
}> = ({ det, index, isActive, containerWidth, containerHeight }) => {
  const colors = SEVERITY_COLORS[det.severity] || SEVERITY_COLORS.medium;
  const [x1, y1, x2] = det.bbox;
  const midX = ((x1 + x2) / 2) * containerWidth;
  const topY = y1 * containerHeight - 32;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      transition={{ delay: index * 0.08 + 0.15 }}
      className={`absolute pointer-events-none flex items-center gap-1.5 px-2.5 py-1 rounded-full
        bg-black/50 backdrop-blur-xl border border-white/[0.06]
        ${isActive ? 'ring-1 ring-white/10' : ''}
      `}
      style={{
        left: Math.max(4, Math.min(midX - 50, containerWidth - 104)),
        top: Math.max(4, topY),
      }}
    >
      <div className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
      <span className="text-[10px] font-medium text-white/80 whitespace-nowrap">
        {formatDamageClass(det.damage_class)}
      </span>
      <span className={`text-[9px] font-medium ${colors.text}`}>
        {(det.confidence * 100).toFixed(0)}%
      </span>
    </motion.div>
  );
};

// ── Main Component ─────────────────────────────────────────

export const DetectionOverlay: React.FC<DetectionOverlayProps> = ({
  detections,
  width = 0,
  height = 0,
  activeIndex = null,
  onTap,
  animate = true,
}) => {
  // Memoize to avoid re-renders on parent state changes
  const stableDetections = useMemo(() => detections, [JSON.stringify(detections)]);

  if (stableDetections.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* SVG layer — bounding boxes */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-auto"
        viewBox="0 0 1 1"
        preserveAspectRatio="none"
      >
        {stableDetections.map((det, i) => (
          <DetectionBox
            key={`${det.damage_class}-${i}`}
            det={det}
            index={i}
            isActive={activeIndex === i}
            onTap={onTap}
            animate={animate}
          />
        ))}
      </svg>

      {/* HTML layer — floating labels */}
      {width > 0 && height > 0 && (
        <AnimatePresence>
          {stableDetections.map((det, i) => (
            <FloatingLabel
              key={`label-${det.damage_class}-${i}`}
              det={det}
              index={i}
              isActive={activeIndex === i}
              containerWidth={width}
              containerHeight={height}
            />
          ))}
        </AnimatePresence>
      )}
    </div>
  );
};

export default DetectionOverlay;
