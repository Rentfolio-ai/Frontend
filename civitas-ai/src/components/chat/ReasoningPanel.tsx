import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Lightbulb, Activity } from 'lucide-react';

interface ReasoningPanelProps {
  reasoningSummary?: {
    bullets: string[];
    approach: string;
    assumptions?: string[];
    confidence?: number;
  };
  toolActivities?: Array<{
    id?: string;
    action: string;
    target: string;
    result_summary?: string;
    timestamp: number;
  }>;
  sources?: string[];
}

export const ReasoningPanel: React.FC<ReasoningPanelProps> = ({
  reasoningSummary,
  toolActivities,
  sources
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [announced, setAnnounced] = useState(false);

  // Announce to screen readers when reasoning summary is ready
  React.useEffect(() => {
    if (reasoningSummary && !announced) {
      setAnnounced(true);
    }
  }, [reasoningSummary, announced]);

  // Don't render if no data
  if (!reasoningSummary && (!toolActivities || toolActivities.length === 0)) {
    return null;
  }

  return (
    <div className="mt-3 border-t border-white/[0.06] pt-3">
      {/* Screen reader announcement for new reasoning */}
      {reasoningSummary && (
        <div className="sr-only" role="status" aria-live="polite">
          Reasoning summary available. {reasoningSummary.bullets.length} points generated.
        </div>
      )}
      {/* Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] transition-all text-sm font-medium text-white/70 hover:text-white/90 group"
        aria-expanded={isExpanded}
        aria-controls="reasoning-panel-content"
        aria-label={isExpanded ? 'Hide reasoning details' : 'Show reasoning details'}
      >
        <Lightbulb className="w-4 h-4" aria-hidden="true" />
        <span>Show reasoning</span>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 ml-auto" aria-hidden="true" />
        ) : (
          <ChevronDown className="w-4 h-4 ml-auto" aria-hidden="true" />
        )}
      </button>

      {/* Expandable Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            id="reasoning-panel-content"
            role="region"
            aria-label="Reasoning details"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="mt-3 space-y-4 px-3 py-3 rounded-lg bg-white/[0.02] border border-white/[0.06]">
              
              {/* Tool Activity Timeline */}
              {toolActivities && toolActivities.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-white/50 uppercase tracking-wide">
                    <Activity className="w-3.5 h-3.5" />
                    Activity
                  </div>
                  <div className="space-y-2 pl-2 border-l-2 border-white/[0.08]">
                    {toolActivities.map((activity, idx) => (
                      <motion.div
                        key={activity.id || idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="text-sm text-white/70"
                      >
                        <span className="font-medium text-white/90">{activity.action}</span>
                        {' '}
                        <span className="text-white/60">{activity.target}</span>
                        {activity.result_summary && (
                          <span className="ml-2 text-xs text-emerald-400/70">
                            → {activity.result_summary}
                          </span>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reasoning Summary */}
              {reasoningSummary && reasoningSummary.bullets && reasoningSummary.bullets.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-white/50 uppercase tracking-wide">
                    <Lightbulb className="w-3.5 h-3.5" />
                    Reasoning
                  </div>
                  <div className="space-y-1.5">
                    {reasoningSummary.bullets.map((bullet, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="flex gap-2 text-sm text-white/80"
                      >
                        <span className="text-purple-400 flex-shrink-0">•</span>
                        <span>{bullet}</span>
                      </motion.div>
                    ))}
                  </div>
                  
                  {/* Confidence (optional) */}
                  {reasoningSummary.confidence && (
                    <div className="text-xs text-white/40 mt-2">
                      Confidence: {Math.round(reasoningSummary.confidence * 100)}%
                    </div>
                  )}
                </div>
              )}

              {/* Sources (if available) */}
              {sources && sources.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-white/50 uppercase tracking-wide">
                    Sources
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {sources.map((source, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2 py-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20"
                      >
                        {source}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
