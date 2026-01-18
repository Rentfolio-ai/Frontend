/**
 * StreamPhaseIndicator Component
 * 
 * Type-safe streaming phase indicator inspired by Claude/GPT
 * Shows current AI state with time awareness and expandable details
 * 
 * Based on:
 * - Boris Cherny: Type-safe state machine, no flicker
 * - Sam Altman: Transparent AI work, user trust
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, AlertCircle } from 'lucide-react';
import type { StreamPhase, ThinkingStep } from '../../types/stream';

interface StreamPhaseIndicatorProps {
  phase: StreamPhase;
  onToggleExpanded?: () => void;
}

export const StreamPhaseIndicator: React.FC<StreamPhaseIndicatorProps> = ({ 
  phase, 
  onToggleExpanded 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Don't show anything for idle or complete states
  if (phase.type === 'idle' || phase.type === 'complete') {
    return null;
  }

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
    onToggleExpanded?.();
  };

  // Determine if we can expand (only thinking phase with steps)
  const canExpand = phase.type === 'thinking' && phase.steps && phase.steps.length > 0;

  // Check if taking longer than usual
  const takingLonger = (phase.type === 'thinking' || phase.type === 'tool') && phase.elapsed > 5;
  const takingVeryLong = (phase.type === 'thinking' || phase.type === 'tool') && phase.elapsed > 10;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="mb-3 rounded-2xl bg-white/[0.02] border border-white/[0.06] overflow-hidden backdrop-blur-sm"
    >
      {/* Header */}
      <button
        onClick={canExpand ? handleToggle : undefined}
        disabled={!canExpand}
        className={`w-full px-4 py-3 flex items-center justify-between ${
          canExpand ? 'hover:bg-white/[0.02] cursor-pointer' : 'cursor-default'
        } transition-colors`}
      >
        <div className="flex items-center gap-3">
          {/* Phase Icon */}
          {phase.type === 'thinking' && (
            <div className="relative w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
            </div>
          )}
          {phase.type === 'tool' && (
            <div className="text-lg">🔍</div>
          )}
          {phase.type === 'composing' && (
            <div className="text-lg">✏️</div>
          )}

          {/* Phase Label & Details */}
          <div className="flex items-center gap-2.5">
            <span className="text-sm font-medium text-white/70">
              {phase.type === 'thinking' && 'Thinking'}
              {phase.type === 'tool' && phase.label}
              {phase.type === 'composing' && 'Writing'}
            </span>

            {/* Elapsed Time */}
            {(phase.type === 'thinking' || phase.type === 'tool') && (
              <span className="text-xs text-white/40 tabular-nums">
                {phase.elapsed.toFixed(1)}s
              </span>
            )}

            {/* Taking Longer Warning */}
            {takingLonger && !takingVeryLong && (
              <div className="flex items-center gap-1 text-xs text-amber-400/80">
                <AlertCircle className="w-3 h-3" />
                <span>Taking longer...</span>
              </div>
            )}

            {/* Taking Very Long Warning */}
            {takingVeryLong && (
              <div className="flex items-center gap-1 text-xs text-orange-400/90">
                <AlertCircle className="w-3 h-3" />
                <span>Still working...</span>
              </div>
            )}
          </div>
        </div>

        {/* Expand/Collapse Icon */}
        {canExpand && (
          <div className="text-white/40 transition-transform">
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </div>
        )}
      </button>

      {/* Expanded Steps (Thinking only, Claude-style) */}
      <AnimatePresence>
        {isExpanded && phase.type === 'thinking' && phase.steps && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-white/[0.06]"
          >
            <div className="px-4 py-3 space-y-2">
              {phase.steps.map((step: ThinkingStep) => (
                <div
                  key={step.id}
                  className={`flex items-center gap-2.5 text-xs transition-colors ${
                    step.complete ? 'text-white/50' : 'text-white/70'
                  }`}
                >
                  <span className={`text-sm ${step.complete ? 'text-green-400' : 'text-indigo-400'}`}>
                    {step.complete ? '✓' : '→'}
                  </span>
                  <span className="flex-1">{step.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
