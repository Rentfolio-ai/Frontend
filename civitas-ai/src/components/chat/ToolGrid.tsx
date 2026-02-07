// FILE: src/components/chat/ToolGrid.tsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import type { ToolBatchItem } from '../../types/stream';
import { Check, Clock, Loader2, Sparkles } from 'lucide-react';

interface ToolGridProps {
    tools: ToolBatchItem[];
    collapsed?: boolean;
}

export const ToolGrid: React.FC<ToolGridProps> = ({ tools, collapsed = false }) => {
    if (!tools || tools.length === 0) return null;

    // Group by priority or just list? Grid is cleaner.
    // We'll Sort by priority: high -> medium -> low
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    const sortedTools = [...tools].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    // If all complete, we might want to collapse or show summary?
    // For now, keep visible but subtle.

    return (
        <div className={cn("w-full mb-4", collapsed ? "hidden" : "block")}>
            <div className="flex items-center gap-2 mb-2 px-1">
                <Sparkles className="w-3 h-3 text-purple-400" />
                <span className="text-[10px] uppercase tracking-wider font-semibold text-white/40">
                    Active Agents & Tools
                </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                <AnimatePresence>
                    {sortedTools.map((tool) => (
                        <ToolGridItem key={tool.id} tool={tool} />
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
};

const ToolGridItem: React.FC<{ tool: ToolBatchItem }> = ({ tool }) => {
    const isRunning = tool.status === 'running';
    const isComplete = tool.status === 'complete';
    const isPending = tool.status === 'pending';

    const priorityColor = {
        high: 'border-purple-500/30 bg-purple-500/5',
        medium: 'border-blue-500/20 bg-blue-500/5',
        low: 'border-white/10 bg-white/5'
    }[tool.priority];

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={cn(
                "relative rounded-lg border p-2 flex items-center gap-2 transition-all overflow-hidden",
                priorityColor,
                isComplete && "opacity-60 border-emerald-500/20 bg-emerald-500/5", // Dim completed
                isRunning && "ring-1 ring-purple-500/30"
            )}
        >
            {/* Background Pulse for Running */}
            {isRunning && (
                <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                />
            )}

            {/* Icon */}
            <div className={cn(
                "w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 text-xs",
                isComplete ? "bg-emerald-500/20 text-emerald-400" :
                    isRunning ? "bg-purple-500/20 text-purple-400" : "bg-white/10 text-white/40"
            )}>
                {isComplete ? <Check className="w-3.5 h-3.5" /> :
                    isRunning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> :
                        <Clock className="w-3.5 h-3.5" />}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-white/90 truncate">
                    {tool.name}
                </div>
                <div className="text-[10px] text-white/50 truncate flex items-center gap-1">
                    {tool.priority === 'high' && <span className="text-purple-400">●</span>}
                    {isPending ? 'Waiting...' :
                        isRunning ? 'Working...' : 'Done'}
                </div>
            </div>
        </motion.div>
    );
};
