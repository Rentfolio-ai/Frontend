/**
 * InlineContextBanner
 *
 * A compact, frosted-glass banner that appears between the message list and
 * the composer to suggest contextual next actions (mode switch, report
 * generation, deeper analysis, etc.).
 *
 * Inspired by Cursor's inline action prompts.
 */

import React, { useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export interface BannerAction {
  label: string;
  onClick: () => void;
  primary?: boolean;
}

export interface InlineContextBannerProps {
  message: string;
  actions: BannerAction[];
  onDismiss: () => void;
  /** Auto-dismiss after this many milliseconds (default 15 000). Set 0 to disable. */
  autoHideMs?: number;
}

export const InlineContextBanner: React.FC<InlineContextBannerProps> = ({
  message,
  actions,
  onDismiss,
  autoHideMs = 15_000,
}) => {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
  }, []);

  useEffect(() => {
    if (autoHideMs > 0) {
      clearTimer();
      timerRef.current = setTimeout(onDismiss, autoHideMs);
    }
    return clearTimer;
  }, [autoHideMs, onDismiss, clearTimer]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="mx-4 mb-2"
      >
        <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-white/[0.03] backdrop-blur-md border border-white/[0.07] shadow-lg shadow-black/10">
          {/* Reason text */}
          <span className="flex-1 text-[12px] text-white/50 leading-snug">{message}</span>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {actions.map((action, i) => (
              <button
                key={i}
                onClick={() => { clearTimer(); action.onClick(); }}
                className={
                  action.primary
                    ? 'px-3 py-1 rounded-lg text-[11px] font-medium bg-white/[0.08] hover:bg-white/[0.14] text-white/80 hover:text-white transition-colors'
                    : 'px-2.5 py-1 rounded-lg text-[11px] font-medium text-white/35 hover:text-white/60 hover:bg-white/[0.04] transition-colors'
                }
              >
                {action.label}
              </button>
            ))}

            {/* Dismiss */}
            <button
              onClick={() => { clearTimer(); onDismiss(); }}
              className="p-1 rounded-md text-white/20 hover:text-white/50 hover:bg-white/[0.04] transition-colors ml-0.5"
              aria-label="Dismiss"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
