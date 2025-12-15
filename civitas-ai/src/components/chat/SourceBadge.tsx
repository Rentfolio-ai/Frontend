// FILE: src/components/chat/SourceBadge.tsx
/**
 * Source badge component with icon and color coding
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { getSourceConfig } from '@/utils/thinkingHelpers';

interface SourceBadgeProps {
    source: string;
    className?: string;
}

export const SourceBadge: React.FC<SourceBadgeProps> = ({ source, className }) => {
    const config = getSourceConfig(source);
    const Icon = config.icon;

    return (
        <div
            className={cn(
                'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full',
                'text-[10px] font-medium uppercase tracking-wider',
                'transition-all duration-200 hover:scale-105',
                config.bgLight,
                `dark:${config.bgDark}`,
                config.textLight,
                `dark:${config.textDark}`,
                className
            )}
            role="status"
            aria-label={`Source: ${config.label}`}
        >
            <Icon className="w-3 h-3" aria-hidden="true" />
            <span>{config.label}</span>
        </div>
    );
};
