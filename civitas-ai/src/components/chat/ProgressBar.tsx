// FILE: src/components/chat/ProgressBar.tsx
/**
 * Animated progress bar component
 */

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
    progress: number; // 0-100
    className?: string;
    label?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
    progress,
    className,
    label = 'Progress',
}) => {
    const clampedProgress = Math.min(Math.max(progress, 0), 100);

    return (
        <div className={cn('w-full mt-3', className)} role="group" aria-label={label}>
            <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-gray-500 dark:text-gray-400">
                    {label}
                </span>
                <span className="text-[10px] font-semibold text-gray-700 dark:text-gray-300" aria-live="polite">
                    {Math.round(clampedProgress)}%
                </span>
            </div>

            <div
                className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden"
                role="progressbar"
                aria-valuenow={Math.round(clampedProgress)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${label}: ${Math.round(clampedProgress)}% complete`}
            >
                <motion.div
                    className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${clampedProgress}%` }}
                    transition={{
                        type: 'spring',
                        stiffness: 100,
                        damping: 15,
                    }}
                />
            </div>
        </div>
    );
};
