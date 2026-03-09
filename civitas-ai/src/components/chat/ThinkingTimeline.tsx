// FILE: src/components/chat/ThinkingTimeline.tsx
/**
 * Collapsible timeline showing history of thinking events
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SourceBadge } from './SourceBadge';
import type { ThinkingState } from '@/types/stream';

interface ThinkingTimelineProps {
    events: ThinkingState[];
    className?: string;
}

export const ThinkingTimeline: React.FC<ThinkingTimelineProps> = ({
    events,
    className,
}) => {
    const [expanded, setExpanded] = useState(false);

    if (events.length === 0) return null;

    const latestEvent = events[events.length - 1];
    const previousEvents = events.slice(0, -1);

    return (
        <div className={cn('space-y-2', className)}>
            {/* Latest Event - Always Visible */}
            <div
                className="relative p-3 rounded-lg bg-black/5 border border-black/8"
                role="status"
                aria-live="polite"
                aria-atomic="true"
            >
                <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <motion.div
                                animate={{
                                    scale: [1, 1.2, 1],
                                    opacity: [0.6, 1, 0.6],
                                }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                                className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500"
                                aria-hidden="true"
                            />
                            <SourceBadge source={latestEvent.source || 'Agent Tools'} />
                        </div>
                        <p className="text-sm font-semibold text-foreground dark:text-foreground">
                            {latestEvent.status}
                        </p>
                        {latestEvent.explanation && (
                            <p className="text-xs text-muted-foreground dark:text-muted-foreground mt-1">
                                {latestEvent.explanation}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Collapsible History */}
            {previousEvents.length > 0 && (
                <>
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className={cn(
                            'flex items-center gap-1.5 px-2 py-1 rounded-md',
                            'text-xs font-medium text-muted-foreground hover:text-muted-foreground',
                            'hover:bg-black/5 transition-all duration-200',
                            'focus:outline-none focus:ring-2 focus:ring-purple-500/50'
                        )}
                        aria-expanded={expanded}
                        aria-controls="thinking-history"
                        aria-label={`${expanded ? 'Hide' : 'Show'} ${previousEvents.length} previous thinking steps`}
                    >
                        <ChevronDown
                            className={cn(
                                'w-3 h-3 transition-transform duration-200',
                                expanded && 'rotate-180'
                            )}
                            aria-hidden="true"
                        />
                        {expanded ? 'Hide' : 'Show'} {previousEvents.length} previous step
                        {previousEvents.length !== 1 ? 's' : ''}
                    </button>

                    <AnimatePresence>
                        {expanded && (
                            <motion.div
                                id="thinking-history"
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="space-y-2 pl-4 border-l-2 border-black/8"
                                role="region"
                                aria-label="Thinking history"
                            >
                                {previousEvents.reverse().map((event, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="p-2 rounded-lg bg-black/[0.02] border border-black/5"
                                    >
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className="w-1 h-1 rounded-full bg-gray-600" aria-hidden="true" />
                                            <SourceBadge source={event.source || 'Agent Tools'} />
                                        </div>
                                        <p className="text-xs font-medium text-muted-foreground dark:text-muted-foreground">
                                            {event.status}
                                        </p>
                                        {event.explanation && (
                                            <p className="text-[10px] text-gray-500 dark:text-gray-500 mt-0.5">
                                                {event.explanation}
                                            </p>
                                        )}
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </>
            )}
        </div>
    );
};
