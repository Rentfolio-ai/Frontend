// FILE: src/components/chat/ThinkingIndicator.tsx
/**
 * Thinking indicator component showing AI processing status.
 * Simple, clean style — single status line with animated chevron,
 * accumulated reasoning steps, completed tools, and cancel button.
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { X, RefreshCw, AlertCircle, ChevronDown, ChevronUp, Lightbulb } from 'lucide-react';
import type { ThinkingState, CompletedTool } from '@/types/stream';

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
  reasoningSteps?: ReasoningStep[];
  partialContent?: string;
  className?: string;
  userQuery?: string;
  onCancel?: () => void;
  error?: string | null;
  onRetry?: () => void;
  onOpenPreferences?: () => void;
}

export const ThinkingIndicator: React.FC<ThinkingIndicatorProps> = ({
  thinking,
  completedTools = [],
  className,
  userQuery: _userQuery,
  onCancel,
  error,
  onRetry,
  onOpenPreferences: _onOpenPreferences,
  reasoningSteps = [],
  partialContent = '',
}) => {
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
    if (tool.tool === 'web_search') {
      const meta = tool.data.metadata;
      if (meta && meta.deep_dive_count) return `${meta.deep_dive_count} pages read`;
      return `${tool.data.results?.length || 0} findings`;
    }
    if (Array.isArray(tool.data)) {
      const count = tool.data.length;
      if (count === 0) return null;
      if (tool.tool?.toLowerCase().includes('property') ||
        tool.tool?.toLowerCase().includes('scout') ||
        tool.tool?.toLowerCase().includes('hunt') ||
        tool.tool?.toLowerCase().includes('search'))
        return `${count} ${count === 1 ? 'property' : 'properties'}`;
      if (tool.tool?.toLowerCase().includes('market'))
        return `${count} ${count === 1 ? 'market' : 'markets'}`;
      return `${count} ${count === 1 ? 'result' : 'results'}`;
    }
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

  // ALWAYS prioritize backend status - NO auto-cycling
  const backendStatus = displayThinking.title || displayThinking.status || '';

  // BACKEND-FIRST: If backend provides filtersApplied, use that
  const backendFilters = displayThinking.filtersApplied || [];
  const backendFilterText = backendFilters.length > 0
    ? ` (${backendFilters.slice(0, 3).join(', ')})`
    : '';

  // V2 reasoning steps
  const runningStep = reasoningSteps.find(s => s.status === 'running');
  const currentStep = runningStep || reasoningSteps[reasoningSteps.length - 1];

  // Extract thinking steps from status (V1 numbered steps + V2 progress messages)
  const thinkingLines = React.useMemo(() => {
    const status = backendStatus || '';
    const lines = status.split('\n').filter(line => line.trim());
    if (lines.length > 1) return lines;
    return [];
  }, [backendStatus]);

  let displayStatus = 'Thinking...';

  // Override with current reasoning step if available
  if (currentStep) {
    displayStatus = currentStep.title;
    if (currentStep.status === 'running') displayStatus += '...';
  } else if (thinkingLines.length > 0) {
    const lastLine = thinkingLines[thinkingLines.length - 1];
    displayStatus = lastLine.replace(/^\d+\.\s*/, '');
  } else if (backendStatus) {
    displayStatus = backendStatus;
  }

  // If backend has filters, append them
  if (!currentStep && backendFilters.length > 0 && !displayStatus.includes('(')) {
    displayStatus = displayStatus.replace('...', `${backendFilterText}...`);
  }

  // Format elapsed time
  const elapsedText = elapsedSeconds > 0
    ? elapsedSeconds < 60 ? `${elapsedSeconds}s` : `${Math.floor(elapsedSeconds / 60)}:${String(elapsedSeconds % 60).padStart(2, '0')}`
    : null;

  // Simple, clean thinking indicator (original style with enhancements)
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
          transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
          className="text-white/60"
        >
          ›
        </motion.span>

        {/* Elapsed time badge */}
        {elapsedText && (
          <span className="text-[10px] font-mono text-white/20 ml-1">
            {elapsedText}
          </span>
        )}
      </motion.div>

      {/* Show accumulated thinking steps (numbered reasoning lines) */}
      {thinkingLines.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 space-y-1 pl-2 border-l-2 border-[#C08B5C]/30"
        >
          {thinkingLines.slice(-5).map((line, idx) => {
            const stepNumber = line.match(/^(\d+)\./)?.[1];
            const stepText = stepNumber ? line.replace(/^\d+\.\s*/, '') : line;
            return (
              <motion.div
                key={`${idx}-${line.slice(0, 20)}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-start gap-2 text-[12px]"
              >
                <span className="flex-shrink-0 w-4 h-4 rounded-full bg-[#C08B5C]/20 text-[#D4A27F] text-[10px] flex items-center justify-center font-bold">
                  {stepNumber || (idx + 1)}
                </span>
                <span className="text-white/50 flex-1">{stepText}</span>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Partial Content Preview - Show first 80 chars of streaming response */}
      {partialContent && partialContent.length > 0 && partialContent.length < 100 && !thinkingLines.length && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[13px] text-white/40 italic pl-1 mt-1"
        >
          &ldquo;{partialContent.slice(0, 80)}{partialContent.length > 80 ? '...' : ''}&rdquo;
        </motion.div>
      )}

      {/* Completed Tools - Enhanced with data preview and suggestions */}
      {completedTools.length > 0 && (
        <div className="space-y-1.5">
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
        <div className="absolute inset-0 rounded-full border-2 border-[#C08B5C] border-t-transparent animate-spin" />
      </div>
      {icon && <span>{icon}</span>}
      <span>{status}</span>
    </div>
  );
};
