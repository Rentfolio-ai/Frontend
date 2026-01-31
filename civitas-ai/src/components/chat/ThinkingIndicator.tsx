// FILE: src/components/chat/ThinkingIndicator.tsx
/**
 * Thinking indicator component showing AI processing status
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { X, RefreshCw, AlertCircle, ChevronDown, ChevronUp, Lightbulb } from 'lucide-react';
import type { ThinkingState, CompletedTool } from '@/types/stream';
import { SourceBadge } from './SourceBadge';

// Define ReasoningStep type inline since we only need it for props
interface ReasoningStep {
  title: string;
  description: string;
  status: 'pending' | 'running' | 'complete' | 'error';
  tool?: string;
}

interface ThinkingIndicatorProps {
  thinking: ThinkingState | null;
  completedTools?: CompletedTool[];
  reasoningSteps?: ReasoningStep[]; // 🚀 NEW: Real-time reasoning steps
  className?: string;
  userQuery?: string;
  onCancel?: () => void;
  error?: string | null;
  onRetry?: () => void;
  onOpenPreferences?: () => void;
}

import { usePreferencesStore } from '@/stores/preferencesStore';

export const ThinkingIndicator: React.FC<ThinkingIndicatorProps> = ({
  thinking,
  completedTools = [],
  className,
  userQuery,
  onCancel,
  error,
  onRetry,
  onOpenPreferences,
  reasoningSteps = [], // NEW: Receive reasoning steps
}) => {
  const { interactionProfile, budgetRange, defaultStrategy, financialDna } = usePreferencesStore();
  const dislikes = interactionProfile?.dislikes || [];
  const riskProfile = interactionProfile?.risk_profile;

  // CRITICAL: Always ensure we have a thinking state to display
  const displayThinking: ThinkingState = thinking || { status: 'Thinking...' };

  // Elapsed time tracking
  const [elapsedSeconds, setElapsedSeconds] = React.useState(0);
  const startTimeRef = React.useRef<number | null>(null);

  // Expandable details section
  const [isDetailsExpanded, setIsDetailsExpanded] = React.useState(false);

  // Helper to extract meaningful preview from tool data
  const getToolDataPreview = React.useCallback((tool: CompletedTool): string | null => {
    if (!tool.data) return null;

    // Handle Deep Dive Web Search
    if (tool.tool === 'web_search') {
      const meta = tool.data.metadata;
      if (meta && meta.deep_dive_count) {
        return `${meta.deep_dive_count} pages read`;
      }
      return `${tool.data.results?.length || 0} findings`;
    }

    // Handle different data structures
    if (Array.isArray(tool.data)) {
      const count = tool.data.length;
      if (count === 0) return null;

      // Try to identify what kind of items
      if (tool.tool?.toLowerCase().includes('property') ||
        tool.tool?.toLowerCase().includes('scout') ||
        tool.tool?.toLowerCase().includes('hunt') ||
        tool.tool?.toLowerCase().includes('search')) {
        return `${count} ${count === 1 ? 'property' : 'properties'}`;
      }
      if (tool.tool?.toLowerCase().includes('market')) {
        return `${count} ${count === 1 ? 'market' : 'markets'}`;
      }
      return `${count} ${count === 1 ? 'result' : 'results'}`;
    }

    // Handle object with count/total
    if (typeof tool.data === 'object') {
      if (tool.data.count !== undefined) return `${tool.data.count} found`;
      if (tool.data.total !== undefined) return `${tool.data.total} total`;
      if (tool.data.properties?.length) return `${tool.data.properties.length} properties`;
      if (tool.data.results?.length) return `${tool.data.results.length} results`;
    }

    return null;
  }, []);

  React.useEffect(() => {
    if (thinking && !startTimeRef.current) {
      startTimeRef.current = Date.now();
      setElapsedSeconds(0);
    } else if (!thinking) {
      startTimeRef.current = null;
      setElapsedSeconds(0);
    }
  }, [thinking]);

  React.useEffect(() => {
    if (!thinking) return;
    const interval = setInterval(() => {
      if (startTimeRef.current) {
        setElapsedSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [thinking]);

  // Format preferences for display
  const preferencesDisplay = React.useMemo(() => {
    const parts: string[] = [];

    // 1. Risk Profile (Highest Level)
    if (riskProfile) {
      parts.push(riskProfile);
    }

    // 2. Financial DNA (Key Constraints)
    if (financialDna) {
      const dnaParts: string[] = [];
      if (financialDna.down_payment_pct != null) {
        dnaParts.push(`${Math.round(financialDna.down_payment_pct * 100)}% Down`);
      }
      // Only show loan info if we have a loan
      if (financialDna.down_payment_pct !== 1) {
        if (financialDna.interest_rate_annual != null) {
          dnaParts.push(`${financialDna.interest_rate_annual}% Rate`);
        }
      }

      if (dnaParts.length > 0) {
        parts.push(dnaParts.join(', '));
      }
    }

    // 3. Budget
    if (budgetRange?.max) {
      const formatted = budgetRange.max >= 1000000
        ? `$${(budgetRange.max / 1000000).toFixed(1)}M`
        : `$${Math.round(budgetRange.max / 1000)}k`;
      parts.push(`Max ${formatted}`);
    }

    // 4. Strategy
    if (defaultStrategy) {
      parts.push(defaultStrategy);
    }

    // 5. Filters
    if (dislikes.length > 0) {
      const dislikeStr = dislikes.slice(0, 2).join(', ');
      parts.push(`No ${dislikeStr}`);
    }

    return parts.length > 0 ? parts.join(' • ') : null;
  }, [budgetRange, defaultStrategy, dislikes, financialDna, riskProfile]);


  // ALWAYS prioritize backend status - NO auto-cycling
  const backendStatus = displayThinking.title || displayThinking.status || '';

  // Debug: Log what we're receiving
  React.useEffect(() => {
    if (thinking) {
      console.log('🎨 [ThinkingIndicator] Received thinking state:', {
        title: thinking.title,
        status: thinking.status,
        backendStatus,
      });
    }
  }, [thinking, backendStatus]);

  // BACKEND-FIRST: If backend provides filtersApplied, use that
  const backendFilters = displayThinking.filtersApplied || [];
  const backendFilterText = backendFilters.length > 0
    ? ` (${backendFilters.slice(0, 3).join(', ')})`
    : '';

  // 🚀 NEW: Use reasoning steps if available, otherwise backend status
  const runningStep = reasoningSteps.find(s => s.status === 'running');
  const currentStep = runningStep || reasoningSteps[reasoningSteps.length - 1];

  let displayStatus = backendStatus || 'Thinking...';

  // Override with current reasoning step if available
  if (currentStep) {
    displayStatus = currentStep.title;
    // Add "..." suffix if still processing
    if (currentStep.status === 'running') {
      displayStatus += '...';
    }
  }

  // Debug: Log what we're displaying
  console.log('🖼️ [ThinkingIndicator] Displaying:', displayStatus, { currentStep, reasoningSteps: reasoningSteps.length });

  // If backend has filters, append them to status (only if not using reasoning steps)
  if (!currentStep && backendFilters.length > 0 && !displayStatus.includes('(')) {
    displayStatus = displayStatus.replace('...', `${backendFilterText}...`);
  }

  const displayExplanation = displayThinking.explanation && !displayThinking.explanation.toLowerCase().includes('processing')
    ? displayThinking.explanation
    : null;

  // Pipeline steps logic
  const pipelineSteps = React.useMemo(() => {
    type StepStatus = 'pending' | 'active' | 'complete';
    const steps: { id: string; label: string; icon: string; status: StepStatus }[] = [
      { id: 'search', label: 'Search', icon: '🔍', status: 'pending' },
      { id: 'analyze', label: 'Analyze', icon: '📊', status: 'pending' },
      { id: 'compile', label: 'Compile', icon: '📝', status: 'pending' },
    ];

    // Map completed tools to pipeline steps
    completedTools.forEach(tool => {
      const toolLower = (tool.tool || '').toLowerCase();
      const summaryLower = (tool.summary || '').toLowerCase();

      // Search step: scan_market, hunt_deals, scout_properties
      if (toolLower.includes('scan') || toolLower.includes('hunt') || toolLower.includes('scout') ||
        summaryLower.includes('properties') || summaryLower.includes('search') ||
        summaryLower.includes('no properties') || summaryLower.includes('found')) {
        steps[0].status = 'complete';
      }
      // Analyze step: valuation, pnl, compliance, metrics
      if (toolLower.includes('valuation') || toolLower.includes('pnl') || toolLower.includes('compliance') ||
        toolLower.includes('metrics') || summaryLower.includes('value') || summaryLower.includes('cash flow')) {
        steps[1].status = 'complete';
      }
    });

    // Check thinking status for "no results" - marks search complete and skips analyze
    const thinkingStatus = (thinking?.status || '').toLowerCase();
    if (thinkingStatus.includes('no properties') || thinkingStatus.includes('not found') ||
      thinkingStatus.includes('no results') || thinkingStatus.includes('no deals')) {
      steps[0].status = 'complete';
      // Skip analyze when no results - go straight to compile
      steps[1].status = 'complete';
    }

    // Mark current step as active if thinking
    if (thinking) {
      const pendingStep = steps.find(s => s.status === 'pending');
      if (pendingStep) {
        pendingStep.status = 'active';
      } else {
        // All complete, mark last as active for "compiling"
        steps[2].status = 'active';
      }
    }

    return steps;
  }, [completedTools, thinking]);

  // Only show pipeline if there are completed tools or actively thinking
  const showPipeline = thinking || completedTools.length > 0;

  // Simple, clean thinking indicator like ChatGPT
  return (
    <div className={cn('max-w-3xl mx-auto', className)}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex items-center gap-2 py-1"
      >
        {/* Simple text with chevron */}
        <span className="text-[15px] text-white/60 font-normal">
          {displayStatus}
        </span>
        <motion.span
          animate={{ x: [0, 3, 0] }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="text-white/60"
        >
          ›
        </motion.span>
      </motion.div>

      {/* Completed Tools - Enhanced with data preview and suggestions */}
      {completedTools.length > 0 && (
        <div className="space-y-1.5">
          {/* Main tool summaries */}
          {completedTools.slice(-3).map((tool, index) => {
            const dataPreview = getToolDataPreview(tool);
            const hasNoResults = tool.reason || (tool.summary?.toLowerCase().includes('no ') && tool.summary?.toLowerCase().includes('found'));

            return (
              <motion.div
                key={`${tool.tool}-${index}`}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="space-y-1"
              >
                {/* Tool completion line */}
                <div className="flex items-center gap-2 text-xs font-medium">
                  <span className={hasNoResults ? 'text-amber-400/60' : 'text-green-400/60'}>
                    {hasNoResults ? '○' : '✓'}
                  </span>
                  <span className={cn(
                    'truncate',
                    hasNoResults ? 'text-amber-300/50' : 'text-white/40'
                  )}>
                    {tool.summary}
                  </span>

                  {/* Data preview badge */}
                  {dataPreview && !hasNoResults && (
                    <span className="px-1.5 py-0.5 text-[10px] font-semibold text-emerald-400/80 bg-emerald-500/10 rounded">
                      {dataPreview}
                    </span>
                  )}
                </div>

                {/* No results reason + suggestion */}
                {hasNoResults && (tool.reason || tool.suggestion) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="ml-4 space-y-1"
                  >
                    {tool.reason && (
                      <div className="text-[11px] text-amber-400/60 italic">
                        {tool.reason}
                      </div>
                    )}
                    {tool.suggestion && (
                      <div className="flex items-center gap-1.5 text-[11px] text-blue-400/70">
                        <Lightbulb className="w-3 h-3" />
                        <span>{tool.suggestion}</span>
                      </div>
                    )}
                  </motion.div>
                )}
              </motion.div>
            );
          })}

          {/* "What's happening" expandable section */}
          {completedTools.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="pt-1"
            >
              <button
                onClick={() => setIsDetailsExpanded(!isDetailsExpanded)}
                className="flex items-center gap-1 text-[10px] text-white/20 hover:text-white/40 transition-colors"
              >
                {isDetailsExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                {isDetailsExpanded ? 'Hide details' : `What's happening (${completedTools.length} tools)`}
              </button>

              <AnimatePresence>
                {isDetailsExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-2 space-y-2 overflow-hidden"
                  >
                    {completedTools.map((tool, index) => (
                      <div key={`detail-${tool.tool}-${index}`} className="pl-3 border-l border-white/10">
                        <div className="flex items-center gap-2 text-[11px]">
                          <span className="text-white/30">{tool.icon || '🔧'}</span>
                          <span className="font-mono text-white/40">{tool.tool}</span>
                          {getToolDataPreview(tool) && (
                            <span className="text-emerald-400/60">→ {getToolDataPreview(tool)}</span>
                          )}
                        </div>
                        {tool.summary && (
                          <div className="text-[10px] text-white/25 mt-0.5 truncate">
                            {tool.summary}
                          </div>
                        )}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      )}

      {/* Cancel Button - Only show when actively thinking */}
      {thinking && (
        <div className="relative py-2">
          {/* Cancel Button Only (no timer) */}
          {onCancel && (
            <div className="flex justify-end mt-2">
              <button
                onClick={onCancel}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                style={{
                  color: '#94A3B8',
                  backgroundColor: 'rgba(148, 163, 184, 0.1)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.15)';
                  e.currentTarget.style.color = '#EF4444';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(148, 163, 184, 0.1)';
                  e.currentTarget.style.color = '#94A3B8';
                }}
              >
                <X className="w-3.5 h-3.5" />
                Stop
              </button>
            </div>
          )}
        </div>
      )}

      {/* Error State */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-lg bg-red-500/10 border border-red-500/20"
        >
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-red-300">Something went wrong</p>
              <p className="text-xs text-red-400/70 mt-0.5 truncate">{error}</p>
            </div>
          </div>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-2 flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-red-500/20 text-red-300 hover:bg-red-500/30 transition-colors w-full justify-center"
            >
              <RefreshCw className="w-3 h-3" />
              Try Again
            </button>
          )}
        </motion.div>
      )}
    </div>
  );
};

// Compact inline version for message list
export const ThinkingIndicatorInline: React.FC<{ status: string; icon?: string }> = ({
  status,
  icon,
}) => {
  return (
    <div className="flex items-center gap-2 text-white/50 text-sm">
      <div className="relative w-4 h-4">
        <div className="absolute inset-0 rounded-full border-2 border-white/10" />
        <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
      {icon && <span>{icon}</span>}
      <span>{status}</span>
    </div>
  );
};
