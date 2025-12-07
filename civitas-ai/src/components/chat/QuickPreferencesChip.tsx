// FILE: src/components/chat/QuickPreferencesChip.tsx
/**
 * Quick Preferences Chip - Shows active preferences with popover for quick edits
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, DollarSign, Target, Home, X, ChevronDown } from 'lucide-react';
import { usePreferencesStore } from '@/stores/preferencesStore';
import { cn } from '@/lib/utils';

interface QuickPreferencesChipProps {
    onOpenFullPreferences?: () => void;
    className?: string;
}

const strategyLabels: Record<string, string> = {
    STR: 'Short-Term',
    LTR: 'Long-Term',
    FLIP: 'Flip',
};

export const QuickPreferencesChip: React.FC<QuickPreferencesChipProps> = ({
    onOpenFullPreferences,
    className,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const {
        budgetRange,
        defaultStrategy,
        favoriteMarkets,
        setBudgetRange,
        setDefaultStrategy,
    } = usePreferencesStore();

    // Format budget display
    const formatBudget = (value: number | undefined) => {
        if (!value) return null;
        if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
        return `$${Math.round(value / 1000)}k`;
    };

    const budgetMax = formatBudget(budgetRange?.max);
    const hasPreferences = budgetMax || defaultStrategy || favoriteMarkets.length > 0;

    // Build display text
    const displayParts: string[] = [];
    if (budgetMax) displayParts.push(`Max ${budgetMax}`);
    if (defaultStrategy) displayParts.push(strategyLabels[defaultStrategy] || defaultStrategy);
    if (favoriteMarkets.length > 0) displayParts.push(favoriteMarkets[0]);

    const displayText = displayParts.length > 0 ? displayParts.join(' • ') : 'Set preferences';

    // Quick budget options
    const budgetOptions = [
        { label: '$200k', value: 200000 },
        { label: '$400k', value: 400000 },
        { label: '$600k', value: 600000 },
        { label: '$1M', value: 1000000 },
        { label: '$2M', value: 2000000 },
    ];

    return (
        <div className={cn('relative', className)}>
            {/* Chip Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all',
                    hasPreferences
                        ? 'bg-primary/10 text-primary-300 hover:bg-primary/20 border border-primary/20'
                        : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/70 border border-white/10'
                )}
            >
                <Settings className="w-3 h-3" />
                <span className="truncate max-w-[180px]">{displayText}</span>
                <ChevronDown className={cn('w-3 h-3 transition-transform', isOpen && 'rotate-180')} />
            </button>

            {/* Popover */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsOpen(false)}
                        />

                        {/* Popover Content */}
                        <motion.div
                            initial={{ opacity: 0, y: 5, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 5, scale: 0.95 }}
                            transition={{ duration: 0.15 }}
                            className="absolute bottom-full mb-2 left-0 z-50 w-72 p-3 rounded-xl bg-slate-900/95 backdrop-blur-md border border-white/10 shadow-2xl"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/10">
                                <span className="text-xs font-semibold text-white/70">Quick Preferences</span>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-1 rounded-md hover:bg-white/10 text-white/40 hover:text-white/70 transition-colors"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>

                            {/* Strategy */}
                            <div className="mb-3">
                                <label className="flex items-center gap-1.5 text-[10px] font-medium text-white/50 uppercase tracking-wider mb-2">
                                    <Target className="w-3 h-3" />
                                    Strategy
                                </label>
                                <div className="flex gap-1.5">
                                    {(['STR', 'LTR', 'FLIP'] as const).map((strategy) => (
                                        <button
                                            key={strategy}
                                            onClick={() => setDefaultStrategy(strategy)}
                                            className={cn(
                                                'flex-1 px-2 py-1.5 rounded-md text-xs font-medium transition-all',
                                                defaultStrategy === strategy
                                                    ? 'bg-primary text-white'
                                                    : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                                            )}
                                        >
                                            {strategyLabels[strategy]}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Budget */}
                            <div className="mb-3">
                                <label className="flex items-center gap-1.5 text-[10px] font-medium text-white/50 uppercase tracking-wider mb-2">
                                    <DollarSign className="w-3 h-3" />
                                    Max Budget
                                </label>
                                <div className="flex flex-wrap gap-1.5">
                                    {budgetOptions.map((opt) => (
                                        <button
                                            key={opt.value}
                                            onClick={() => setBudgetRange(budgetRange?.min || 100000, opt.value)}
                                            className={cn(
                                                'px-2.5 py-1.5 rounded-md text-xs font-medium transition-all',
                                                budgetRange?.max === opt.value
                                                    ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                                                    : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                                            )}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Favorite Markets Preview */}
                            {favoriteMarkets.length > 0 && (
                                <div className="mb-3">
                                    <label className="flex items-center gap-1.5 text-[10px] font-medium text-white/50 uppercase tracking-wider mb-2">
                                        <Home className="w-3 h-3" />
                                        Markets
                                    </label>
                                    <div className="flex flex-wrap gap-1">
                                        {favoriteMarkets.slice(0, 3).map((market) => (
                                            <span
                                                key={market}
                                                className="px-2 py-1 rounded-full bg-white/5 text-white/60 text-[10px] font-medium"
                                            >
                                                {market}
                                            </span>
                                        ))}
                                        {favoriteMarkets.length > 3 && (
                                            <span className="px-2 py-1 text-white/40 text-[10px]">
                                                +{favoriteMarkets.length - 3} more
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Footer */}
                            {onOpenFullPreferences && (
                                <button
                                    onClick={() => {
                                        setIsOpen(false);
                                        onOpenFullPreferences();
                                    }}
                                    className="w-full mt-2 py-2 rounded-lg bg-white/5 text-white/60 text-xs font-medium hover:bg-white/10 hover:text-white transition-colors flex items-center justify-center gap-1.5"
                                >
                                    <Settings className="w-3.5 h-3.5" />
                                    All Preferences
                                </button>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};
