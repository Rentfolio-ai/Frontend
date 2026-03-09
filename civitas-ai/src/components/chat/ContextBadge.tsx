// FILE: src/components/chat/ContextBadge.tsx
import React from 'react';
import { cn } from '../../lib/utils';
import { Eye, Briefcase, History } from 'lucide-react';

interface ContextBadgeProps {
    source: string;
}

const getSourceConfig = (source: string) => {
    const normalized = source.toLowerCase();
    if (normalized.includes('visual')) {
        return { icon: Eye, label: 'Visual Memory', color: 'text-purple-400 bg-purple-400/10 border-purple-400/20' };
    }
    if (normalized.includes('portfolio')) {
        return { icon: Briefcase, label: 'Portfolio Data', color: 'text-blue-400 bg-blue-400/10 border-blue-400/20' };
    }
    if (normalized.includes('history')) {
        return { icon: History, label: 'Past Chat', color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' };
    }
    return { icon: null, label: source, color: 'text-muted-foreground bg-black/5 border-black/8' };
};

export const ContextBadge: React.FC<ContextBadgeProps> = ({ source }) => {
    const config = getSourceConfig(source);
    const Icon = config.icon;

    return (
        <div className={cn(
            "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border transition-colors",
            config.color
        )}>
            {Icon && <Icon className="w-3 h-3" />}
            <span>{config.label}</span>
        </div>
    );
};
