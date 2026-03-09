// FILE: src/components/chat/EstimatedTimeChip.tsx
/**
 * Circular progress indicator with estimated time countdown
 */

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface EstimatedTimeChipProps {
    estimatedMs: number; // Estimated time in milliseconds
    className?: string;
}

export const EstimatedTimeChip: React.FC<EstimatedTimeChipProps> = ({
    estimatedMs,
    className,
}) => {
    const [elapsed, setElapsed] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setElapsed((e) => e + 100);
        }, 100);

        return () => clearInterval(interval);
    }, []);

    const progress = Math.min((elapsed / estimatedMs) * 100, 100);
    const isOvertime = elapsed > estimatedMs;
    const displaySeconds = Math.ceil(estimatedMs / 1000);

    // Circle properties
    const radius = 12;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference * (1 - progress / 100);

    return (
        <div
            className={cn('relative', className)}
            role="timer"
            aria-label={`Estimated completion time: ${displaySeconds} seconds`}
            aria-live="polite"
        >
            {/* Circular progress */}
            <svg className="w-8 h-8 transform -rotate-90" aria-hidden="true">
                {/* Background circle */}
                <circle
                    cx="16"
                    cy="16"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    className="text-foreground/80 dark:text-gray-700"
                />
                {/* Progress circle */}
                <circle
                    cx="16"
                    cy="16"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    className={cn(
                        'transition-all duration-100',
                        isOvertime ? 'text-amber-500' : 'text-purple-500'
                    )}
                />
            </svg>

            {/* Time text */}
            <div className="absolute inset-0 flex items-center justify-center">
                <span
                    className={cn(
                        'text-[9px] font-semibold',
                        isOvertime ? 'text-amber-600 dark:text-amber-400' : 'text-gray-600 dark:text-muted-foreground'
                    )}
                    aria-hidden="true"
                >
                    {displaySeconds}s
                </span>
            </div>

            {/* Screen reader only text */}
            <span className="sr-only">
                {isOvertime
                    ? `Task is taking longer than expected. Estimated ${displaySeconds} seconds.`
                    : `Estimated ${displaySeconds} seconds remaining`}
            </span>
        </div>
    );
};
