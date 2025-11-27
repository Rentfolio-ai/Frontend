import React, { useState } from 'react';
import { Clock, RefreshCw, ArrowUpRight, List } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ToolResultRecord } from '../../types/toolResults';
import { cn } from '../../lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface ToolMemoryPanelProps {
  threadId?: string | null;
  entries?: ToolResultRecord[];
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onReuse?: (record: ToolResultRecord) => void;
  className?: string;
}

export const ToolMemoryPanel: React.FC<ToolMemoryPanelProps> = ({
  threadId,
  entries = [],
  isLoading = false,
  error,
  onRetry,
  onReuse,
  className,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (!threadId && entries.length === 0 && !isLoading) {
    return null;
  }

  return (
    <div className={cn('hidden lg:flex lg:flex-col w-80 border-l border-border/40 bg-white/70 backdrop-blur-xl', className)}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/30">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <List className="w-4 h-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Recent Calculations</p>
            <p className="text-xs text-foreground/60">
              {threadId ? `Thread ${threadId.slice(-6)}` : 'No thread yet'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="p-2 rounded-lg hover:bg-muted/60 transition"
            onClick={() => onRetry?.()}
            disabled={isLoading}
            aria-label="Refresh"
          >
            <RefreshCw className={cn('w-4 h-4', isLoading && 'animate-spin')} />
          </button>
          <button
            className="p-2 rounded-lg hover:bg-muted/60 transition"
            onClick={() => setIsCollapsed(prev => !prev)}
            aria-label="Toggle"
          >
            <ArrowUpRight className={cn('w-4 h-4 transition-transform', isCollapsed ? '-rotate-90' : 'rotate-90')} />
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {!isCollapsed && (
          <motion.div
            key="panel-body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex-1 overflow-y-auto"
          >
            <div className="p-4 space-y-3">
              {error && (
                <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm">
                  <p>{error}</p>
                  {onRetry && (
                    <button
                      className="mt-2 text-xs font-semibold text-amber-900 underline"
                      onClick={onRetry}
                    >
                      Try again
                    </button>
                  )}
                </div>
              )}

              {isLoading && entries.length === 0 && (
                <div className="text-sm text-foreground/60">Loading tool memory…</div>
              )}

              {entries.length === 0 && !isLoading && !error && (
                <p className="text-sm text-foreground/50">No saved calculations yet.</p>
              )}

              {entries.map(entry => (
                <div
                  key={entry.id}
                  className="p-3 rounded-xl border border-border/40 bg-white shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                      {(entry.title || entry.tool_name).toUpperCase()}
                    </p>
                    <div className="flex items-center gap-1 text-[11px] text-foreground/60">
                      <Clock className="w-3 h-3" />
                      <span>{formatDistanceToNow(new Date(entry.timestamp), { addSuffix: true })}</span>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-foreground mt-1">
                    {entry.summary}
                  </p>

                  {entry.inputs && Object.keys(entry.inputs).length > 0 && (
                    <pre className="mt-2 text-[11px] text-foreground/70 bg-muted/40 rounded-lg p-2 overflow-x-auto">
                      {JSON.stringify(entry.inputs, null, 2)}
                    </pre>
                  )}

                  {onReuse && (
                    <button
                      className="mt-3 w-full text-xs font-semibold text-primary border border-primary/40 rounded-lg py-1.5 hover:bg-primary/5 transition"
                      onClick={() => onReuse(entry)}
                    >
                      Re-use Result
                    </button>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ToolMemoryPanel;
