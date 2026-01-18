/**
 * AI Timeline: Calm vertical timeline of observable system work.
 * 
 * Replaces ThinkingIndicator and ThinkingTimeline with a single,
 * focused component that shows user-safe work labels only.
 * 
 * No chain-of-thought leakage, no tool names, no internal state.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { WorkState } from '@/stores/eventStore';

interface AITimelineProps {
  currentWork: WorkState | null;
  className?: string;
}

export const AITimeline: React.FC<AITimelineProps> = ({
  currentWork,
  className,
}) => {
  if (!currentWork) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn('flex items-center gap-3 py-3 px-4 rounded-lg bg-slate-900/50 backdrop-blur-sm border border-white/10', className)}
    >
      {/* Spinner */}
      <Loader2 className="w-4 h-4 text-violet-400 animate-spin flex-shrink-0" />
      
      {/* Work label */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-200">
          {currentWork.label}
        </p>
        {currentWork.detail && (
          <p className="text-xs text-gray-400 mt-0.5">
            {currentWork.detail}
          </p>
        )}
      </div>
      
      {/* Progress indicator */}
      {currentWork.progress > 0 && (
        <div className="flex-shrink-0">
          <div className="w-12 h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-violet-500 to-indigo-500"
              initial={{ width: 0 }}
              animate={{ width: `${currentWork.progress * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      )}
    </motion.div>
  );
};
