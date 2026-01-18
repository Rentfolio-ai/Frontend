/**
 * Decision Bar: Persistent bottom bar showing progress and next action.
 * 
 * Always visible, shows:
 * - Number of shortlisted properties
 * - Best property (if multiple shortlisted)
 * - Primary CTA based on state
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Star, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Property } from '@/stores/eventStore';

interface DecisionBarProps {
  shortlistedCount: number;
  bestProperty?: Property | null;
  nextAction: { action: string; label: string } | null;
  onActionClick: () => void;
  className?: string;
}

export const DecisionBar: React.FC<DecisionBarProps> = ({
  shortlistedCount,
  bestProperty,
  nextAction,
  onActionClick,
  className,
}) => {
  // Determine primary CTA based on state
  const getPrimaryCTA = () => {
    if (shortlistedCount === 0) {
      return { label: 'Keep searching', variant: 'secondary' as const };
    }
    if (shortlistedCount === 1) {
      return { label: 'This one', variant: 'primary' as const };
    }
    if (shortlistedCount >= 2) {
      return { label: 'Compare', variant: 'primary' as const };
    }
    return { label: 'Continue', variant: 'secondary' as const };
  };

  const cta = getPrimaryCTA();

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={cn(
        'fixed bottom-0 left-0 right-0 h-14 z-50',
        'bg-slate-900/80 backdrop-blur-lg border-t border-white/10',
        'shadow-2xl',
        className
      )}
    >
      <div className="max-w-7xl mx-auto h-full px-4 flex items-center justify-between gap-4">
        {/* Left: Progress */}
        <div className="flex items-center gap-3 text-sm">
          {shortlistedCount > 0 ? (
            <>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-violet-400" />
                <span className="text-gray-300">
                  <span className="font-semibold text-white">{shortlistedCount}</span> shortlisted
                </span>
              </div>
              
              {bestProperty && shortlistedCount > 1 && (
                <>
                  <span className="text-gray-600">•</span>
                  <span className="text-gray-300">
                    Best: <span className="font-medium text-white">{bestProperty.address}</span>
                  </span>
                </>
              )}
            </>
          ) : (
            <span className="text-gray-400">No properties shortlisted yet</span>
          )}
        </div>

        {/* Right: Primary CTA */}
        <button
          onClick={onActionClick}
          className={cn(
            'px-6 py-2 rounded-lg font-medium text-sm transition-all',
            'flex items-center gap-2',
            cta.variant === 'primary'
              ? 'bg-violet-500 text-white hover:bg-violet-600 shadow-lg shadow-violet-500/20'
              : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
          )}
        >
          <span>{nextAction?.label || cta.label}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};
