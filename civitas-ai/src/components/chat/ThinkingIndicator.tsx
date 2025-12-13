// FILE: src/components/chat/ThinkingIndicator.tsx
/**
 * Thinking indicator component showing AI processing status
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { X, RefreshCw, AlertCircle } from 'lucide-react';
import type { ThinkingState, CompletedTool } from '@/types/stream';

interface ThinkingIndicatorProps {
  thinking: ThinkingState | null;
  completedTools?: CompletedTool[];
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
}) => {
  const { interactionProfile, budgetRange, defaultStrategy, financialDna } = usePreferencesStore();
  const dislikes = interactionProfile?.dislikes || [];
  const riskProfile = interactionProfile?.risk_profile;

  // Elapsed time tracking
  const [elapsedSeconds, setElapsedSeconds] = React.useState(0);
  const startTimeRef = React.useRef<number | null>(null);

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

  // ... (rest of component) ...

  // Helper to format source text
  const getSourceText = (source: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const match = source.match(urlRegex);

    if (match) {
      const url = match[0];
      try {
        const hostname = new URL(url).hostname.replace('www.', '');
        let friendlySource = hostname.charAt(0).toUpperCase() + hostname.slice(1);

        if (hostname.includes('rentcast')) friendlySource = 'Rentcast';
        if (hostname.includes('zillow')) friendlySource = 'Zillow';
        if (hostname.includes('google')) friendlySource = 'Google';
        if (hostname.includes('redfin')) friendlySource = 'Redfin';
        if (hostname.includes('realtor')) friendlySource = 'Realtor.com';

        return `Checking ${friendlySource}...`;
      } catch (e) {
        return source;
      }
    }
    return source;
  };

  // Helper to generate a sequence of thinking steps based on context
  const getThinkingFlow = (query: string, location: string | null, price: string | null, dislikes: string[] = []): string[] => {
    const lowerQuery = query.toLowerCase();

    // Default flow
    let flow = [
      'Processing request...',
      'Analyzing data...',
      'Synthesizing insights...',
      'Finalizing response...'
    ];

    if (lowerQuery.includes('find') || lowerQuery.includes('search') || lowerQuery.includes('scout')) {
      // Context Aware Search Flow
      const filterNote = dislikes.length > 0 ? ` (Filtering ${dislikes[0]}${dislikes.length > 1 ? '+' : ''})` : '';

      if (location && price) {
        flow = [
          `Scouting ${location} for deals under ${price}${filterNote}...`,
          `Filtering for high-yield properties...`,
          `Analyzing price history...`,
          `Ranking best opportunities...`
        ];
      } else if (location) {
        flow = [
          `Scouting ${location} real estate market${filterNote}...`,
          `Identifying active listings...`,
          `Comparing neighborhoods in ${location}...`,
          `Selecting top properties...`
        ];
      } else {
        flow = [
          `Searching property database${filterNote}...`,
          'Filtering by criteria...',
          'Checking market conditions...',
          'Compiling results...'
        ];
      }
    } else if (lowerQuery.includes('analyze') || lowerQuery.includes('roi') || lowerQuery.includes('calculator')) {
      // Context Aware: Show Financial DNA if available
      let dnaNote = '';
      if (riskProfile) {
        dnaNote = ` (Applying ${riskProfile} Profile)`;
      } else if (financialDna?.down_payment_pct != null) {
        dnaNote = ` (Using ${Math.round(financialDna.down_payment_pct * 100)}% Down)`;
      }

      flow = [
        `Parsing property financial data...`,
        `Applying underwriting rules${dnaNote}...`,
        'Estimating rental income potential...',
        'Generating investment report...'
      ];
    } else if (lowerQuery.includes('rule') || lowerQuery.includes('allow') || lowerQuery.includes('permit') || lowerQuery.includes('compliance')) {
      // Compliance check flow
      if (location) {
        flow = [
          `Checking STR regulations in ${location}...`,
          'Reviewing permit requirements...',
          'Checking local zoning laws...',
          'Summarizing compliance status...'
        ];
      } else {
        flow = [
          'Researching short-term rental policies...',
          'Reviewing general requirements...',
          'Summarizing findings...'
        ];
      }
    } else if (lowerQuery.includes('compare')) {
      flow = [
        'Fetching property details...',
        'Aligning metrics side-by-side...',
        'Evaluating differences...',
        'Generating comparison summary...'
      ];
    }

    return flow;
  };

  // Helper to humanize status messages based on query context
  const getFriendlyText = (text: string) => {
    const lowerText = text.toLowerCase();
    const lowerQuery = (userQuery || '').toLowerCase();
    const hasCompletedTools = completedTools.length > 0;

    // If the backend status is already specific (not generic), use it
    if (!lowerText.includes('analyzing') && !lowerText.includes('processing') && !lowerText.includes('generating') && !lowerText.includes('searching')) {
      return text;
    }

    // If we have already completed some tools, we are likely in the analysis/finalization phase
    if (hasCompletedTools) {
      if (lowerText.includes('generating')) return 'Writing response...';
      return 'Analyzing results...';
    }

    // Initial Phase: Context-aware overrides based on user query
    if (lowerQuery) {
      const locationMatch = userQuery?.match(/(?:in|near|at)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/);
      const location = locationMatch ? locationMatch[1] : null;
      const priceMatch = userQuery?.match(/\$?\d+(?:,\d{3})*(?:k|m)?/i);
      const price = priceMatch ? priceMatch[0] : null;

      if (lowerQuery.includes('find') || lowerQuery.includes('search') || lowerQuery.includes('looking for') || lowerQuery.includes('show me')) {
        const filterNote = dislikes.length > 0 ? ` (Filtering ${dislikes[0]}${dislikes.length > 1 ? '+' : ''})` : '';
        if (location && price) return `Scouting ${location} for deals under ${price}${filterNote}...`;
        if (location) return `Scouting ${location} market${filterNote}...`;
        return `Searching for properties${filterNote}...`;
      }

      if (lowerQuery.includes('analyze') || lowerQuery.includes('roi') || lowerQuery.includes('cash flow')) {
        const addressMatch = userQuery?.match(/\d+\s+[A-Z][a-z]+/); // simplistic address match
        if (addressMatch) return `Analyzing financials for ${addressMatch[0]}...`;
        return 'Crunching the numbers...';
      }

      if (lowerQuery.includes('market') || lowerQuery.includes('trend')) {
        // Context Aware: Show strategy filter if applicable
        const strategyNote = dislikes.includes('Condos') ? ' (Excluding Condos)' : '';
        if (location) return `Analyzing ${location} market trends${strategyNote}...`;
        return `Evaluating local market data${strategyNote}...`;
      }

      if (lowerQuery.includes('compare')) {
        return 'Comparing property data...';
      }

      if (lowerQuery.includes('rule') || lowerQuery.includes('allow') || lowerQuery.includes('permit') || lowerQuery.includes('compliance') || lowerQuery.includes('str')) {
        // Compliance check
        if (location) return `Checking STR regulations in ${location}...`;
        return 'Researching short-term rental policies...';
      }
    }

    // Fallbacks
    if (lowerText.includes('analyzing') || lowerText.includes('processing')) return 'Thinking...';
    if (lowerText.includes('searching')) return 'Looking that up...';
    if (lowerText.includes('generating')) return 'Working on it...';
    return text;
  };

  // State for cycling messages
  const [msgIndex, setMsgIndex] = React.useState(0);

  // Reset index when query changes
  React.useEffect(() => {
    setMsgIndex(0);
  }, [userQuery]);

  // Cycle through messages
  React.useEffect(() => {
    if (!thinking) return;
    const interval = setInterval(() => {
      setMsgIndex(prev => prev + 1);
    }, 2500);
    return () => clearInterval(interval);
  }, [thinking]);

  const locationMatch = userQuery?.match(/(?:in|near|at)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/);
  const location = locationMatch ? locationMatch[1] : null;
  const priceMatch = userQuery?.match(/\$?\d+(?:,\d{3})*(?:k|m)?/i);
  const price = priceMatch ? priceMatch[0] : null;

  const flowMessages = getThinkingFlow(userQuery || '', location, price, dislikes);
  const currentFlowMessage = flowMessages[msgIndex % flowMessages.length];

  // BACKEND-FIRST: If backend provides filtersApplied, use that
  const backendFilters = thinking?.filtersApplied || [];
  const backendFilterText = backendFilters.length > 0
    ? ` (${backendFilters.slice(0, 3).join(', ')})`
    : '';

  // Logic: Use backend status if it's specific/meaningful, otherwise use our flow
  const backendStatus = thinking?.title || thinking?.status || '';
  const isGenericStatus = !backendStatus ||
    backendStatus.toLowerCase().includes('processing') ||
    backendStatus.toLowerCase().includes('thinking') ||
    backendStatus === 'searching';

  // If backend has filters, append them to status
  let displayStatus = isGenericStatus ? currentFlowMessage : getFriendlyText(backendStatus);
  if (backendFilters.length > 0 && !displayStatus.includes('(')) {
    displayStatus = displayStatus.replace('...', `${backendFilterText}...`);
  }

  const displayExplanation = thinking?.explanation && !thinking.explanation.toLowerCase().includes('processing')
    ? thinking.explanation
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

  return (
    <div className={cn('space-y-3 max-w-3xl mx-auto py-2', className)}>
      {/* Pipeline Steps - Horizontal */}
      {showPipeline && (
        <div className="flex items-center justify-center gap-1">
          {pipelineSteps.map((step, index) => (
            <React.Fragment key={step.id}>
              {/* Step */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="flex flex-col items-center gap-1"
              >
                {/* Icon/Status */}
                <div className={cn(
                  'w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-300',
                  step.status === 'complete' && 'bg-green-500/20 text-green-400',
                  step.status === 'active' && 'bg-purple-500/20 text-purple-400 animate-pulse',
                  step.status === 'pending' && 'bg-white/5 text-white/30'
                )}>
                  {step.status === 'complete' ? '✓' : step.icon}
                </div>
                {/* Label */}
                <span className={cn(
                  'text-[10px] font-medium transition-colors',
                  step.status === 'complete' && 'text-green-400/70',
                  step.status === 'active' && 'text-purple-300',
                  step.status === 'pending' && 'text-white/20'
                )}>
                  {step.label}
                </span>
              </motion.div>

              {/* Connector */}
              {index < pipelineSteps.length - 1 && (
                <div className={cn(
                  'w-8 h-0.5 mx-1 transition-colors duration-300',
                  step.status === 'complete' ? 'bg-green-500/30' : 'bg-white/10'
                )} />
              )}
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Active Preferences Line - Now Clickable */}
      {showPipeline && preferencesDisplay && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={onOpenPreferences}
          className="text-center text-[11px] text-white/30 font-medium hover:text-white/50 transition-colors cursor-pointer group"
          title="Click to edit preferences"
        >
          <span className="text-white/40 group-hover:text-white/60">Using:</span> {preferencesDisplay}
          {onOpenPreferences && <span className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity">✎</span>}
        </motion.button>
      )}

      {/* Completed Tools - Minimal text lines (below pipeline) */}
      {completedTools.length > 0 && (
        <div className="space-y-0.5">
          {completedTools.slice(-2).map((tool, index) => (
            <motion.div
              key={`${tool.tool}-${index}`}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 text-xs text-white/30 font-medium"
            >
              <span className="text-green-400/60">✓</span>
              <span className="truncate">{tool.summary}</span>
            </motion.div>
          ))}
        </div>
      )}

      {/* Active Thinking State - Streaming Reasoning Text */}
      {thinking && (
        <div className="relative min-h-[60px] py-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={thinking.status + (thinking.explanation || '') + (thinking.source || '')}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex flex-col gap-2"
            >
              {/* System 2 Deep Reasoning - Streaming Text Block */}
              {thinking.source === 'System 2 Reasoning' ? (
                <div className="space-y-2">
                  {/* Header with animated gradient */}
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 animate-pulse shadow-lg shadow-purple-500/50" />
                    <span className="text-xs font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent uppercase tracking-wide animate-gradient bg-[length:200%_auto]">
                      🧠 Deep Reasoning
                    </span>
                  </div>

                  {/* Streaming Reasoning Text with enhanced gradient */}
                  <div className="max-h-[200px] overflow-y-auto scrollbar-thin scrollbar-thumb-purple-500/20 scrollbar-track-transparent">
                    <motion.div
                      initial={{ opacity: 0, y: 2 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="relative text-sm font-mono leading-relaxed whitespace-pre-wrap"
                    >
                      {/* Gradient text with shimmer animation */}
                      <span className="bg-gradient-to-r from-purple-200 via-pink-200 to-purple-200 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto] drop-shadow-[0_0_8px_rgba(168,85,247,0.4)]">
                        {thinking.status}
                      </span>
                      {/* Animated cursor */}
                      <span className="inline-block w-1 h-4 ml-1 bg-gradient-to-b from-purple-400 to-pink-400 animate-pulse shadow-lg shadow-purple-500/50" />
                    </motion.div>
                  </div>
                </div>
              ) : null}

              {/* Source or Explanation - Only for non-System 2 */}
              {(thinking.source && thinking.source !== 'System 2 Reasoning' || displayExplanation) && (
                <div className="text-xs text-white/70 font-normal leading-relaxed pl-0.5">
                  {thinking.source && thinking.source !== 'System 2 Reasoning' ? (
                    <span className="flex items-center gap-1.5 text-blue-300/90">
                      <span className="w-1 h-1 rounded-full bg-blue-400" />
                      {getSourceText(thinking.source)}
                    </span>
                  ) : (
                    displayExplanation
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Timer and Cancel Row */}
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
            {/* Elapsed Timer */}
            <span className="text-[10px] text-white/30 font-mono">
              ~{elapsedSeconds}s
            </span>

            {/* Cancel Button */}
            {onCancel && (
              <button
                onClick={onCancel}
                className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium text-red-400/80 hover:text-red-300 hover:bg-red-500/10 transition-colors"
              >
                <X className="w-3 h-3" />
                Stop
              </button>
            )}
          </div>
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
