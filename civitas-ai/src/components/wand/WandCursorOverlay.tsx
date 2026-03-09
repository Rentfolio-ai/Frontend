import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { WandStatus } from '../../hooks/useAutopilotWand';

interface WandCursorOverlayProps {
  targetElementId: string | null;
  actionLabel: string;
  status: WandStatus;
  isVisible: boolean;
  confidence: number;
  currentStep: number;
  estimatedTotal: number;
}

interface CursorPosition {
  x: number;
  y: number;
}

const COPPER = '#C08B5C';
const COPPER_LIGHT = 'rgba(192, 139, 92, 0.3)';

export const WandCursorOverlay: React.FC<WandCursorOverlayProps> = ({
  targetElementId,
  actionLabel,
  status,
  isVisible,
  confidence,
  currentStep,
  estimatedTotal,
}) => {
  const [cursorPos, setCursorPos] = useState<CursorPosition>({ x: -100, y: -100 });
  const [showRipple, setShowRipple] = useState(false);
  const [ripplePos, setRipplePos] = useState<CursorPosition>({ x: 0, y: 0 });
  const highlightRef = useRef<HTMLElement | null>(null);

  // Animate cursor to target element
  useEffect(() => {
    if (!targetElementId || !isVisible) return;

    const el = document.querySelector(`[data-wand-id="${targetElementId}"]`) as HTMLElement;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const targetX = rect.left + rect.width / 2;
    const targetY = rect.top + rect.height / 2;

    setCursorPos({ x: targetX, y: targetY });

    // Add highlight ring to target element
    if (highlightRef.current) {
      highlightRef.current.style.outline = '';
      highlightRef.current.style.outlineOffset = '';
    }
    el.style.outline = `2px solid ${COPPER_LIGHT}`;
    el.style.outlineOffset = '3px';
    highlightRef.current = el;

    return () => {
      if (highlightRef.current) {
        highlightRef.current.style.outline = '';
        highlightRef.current.style.outlineOffset = '';
        highlightRef.current = null;
      }
    };
  }, [targetElementId, isVisible]);

  // Trigger ripple on 'acting' status
  useEffect(() => {
    if (status === 'acting' && cursorPos.x > 0) {
      setRipplePos({ ...cursorPos });
      setShowRipple(true);
      const timer = setTimeout(() => setShowRipple(false), 600);
      return () => clearTimeout(timer);
    }
  }, [status, cursorPos]);

  // Clean up highlights on unmount
  useEffect(() => {
    return () => {
      if (highlightRef.current) {
        highlightRef.current.style.outline = '';
        highlightRef.current.style.outlineOffset = '';
      }
    };
  }, []);

  if (!isVisible) return null;

  const confidenceColor =
    confidence >= 0.8 ? '#22c55e' :
    confidence >= 0.5 ? '#eab308' :
    '#ef4444';

  const statusIcon =
    status === 'observing' ? '👁' :
    status === 'deciding' ? '🧠' :
    status === 'acting' ? '⚡' :
    status === 'waiting' ? '⏳' :
    status === 'verifying' ? '✓' :
    status === 'paused' ? '⏸' :
    status === 'done' ? '✨' : '🪄';

  return (
    <div
      className="fixed inset-0 pointer-events-none z-[9999]"
      style={{ isolation: 'isolate' }}
    >
      {/* Wand Cursor */}
      <AnimatePresence>
        {cursorPos.x > 0 && (
          <motion.div
            key="wand-cursor"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{
              x: cursorPos.x - 12,
              y: cursorPos.y - 12,
              opacity: 1,
              scale: 1,
            }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ type: 'spring', stiffness: 200, damping: 25 }}
            className="absolute top-0 left-0"
            style={{ filter: `drop-shadow(0 0 8px ${COPPER})` }}
          >
            {/* Wand SVG */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M3 21L13.5 10.5M13.5 10.5L10 7L17 3L13.5 10.5Z"
                stroke={COPPER}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="17" cy="3" r="1.5" fill={COPPER} opacity="0.6" />
              <circle cx="20" cy="5" r="1" fill={COPPER} opacity="0.4" />
              <circle cx="19" cy="1" r="0.8" fill={COPPER} opacity="0.3" />
            </svg>

            {/* Pulsing glow */}
            <motion.div
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.4, 0.1, 0.4],
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 rounded-full"
              style={{
                background: `radial-gradient(circle, ${COPPER_LIGHT} 0%, transparent 70%)`,
                transform: 'translate(-50%, -50%)',
                width: 40,
                height: 40,
                left: 12,
                top: 12,
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click Ripple */}
      <AnimatePresence>
        {showRipple && (
          <motion.div
            key="ripple"
            initial={{ scale: 0, opacity: 0.6 }}
            animate={{ scale: 3, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="absolute rounded-full"
            style={{
              left: ripplePos.x - 15,
              top: ripplePos.y - 15,
              width: 30,
              height: 30,
              border: `2px solid ${COPPER}`,
            }}
          />
        )}
      </AnimatePresence>

      {/* Action Tooltip — bottom-right floating card */}
      <AnimatePresence>
        {actionLabel && (
          <motion.div
            key="tooltip"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border pointer-events-auto"
            style={{
              background: 'rgba(20, 20, 24, 0.95)',
              borderColor: 'rgba(192, 139, 92, 0.3)',
              backdropFilter: 'blur(12px)',
              maxWidth: 360,
            }}
          >
            {/* Status icon */}
            <span className="text-lg flex-shrink-0">{statusIcon}</span>

            <div className="flex flex-col gap-0.5 min-w-0">
              {/* Action label */}
              <span
                className="text-sm font-medium truncate"
                style={{ color: COPPER }}
              >
                {actionLabel}
              </span>

              {/* Progress */}
              {estimatedTotal > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1 rounded-full bg-white/10 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: COPPER }}
                      initial={{ width: 0 }}
                      animate={{
                        width: `${Math.min(((currentStep + 1) / estimatedTotal) * 100, 100)}%`,
                      }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <span className="text-[10px] text-white/40 flex-shrink-0">
                    {currentStep + 1}/{estimatedTotal}
                  </span>
                  {/* Confidence dot */}
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: confidenceColor }}
                    title={`Confidence: ${Math.round(confidence * 100)}%`}
                  />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
