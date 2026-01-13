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
        financialDna,
        investmentCriteria,
        setBudgetRange,
        setDefaultStrategy,
    } = usePreferencesStore();

    // Calculate completion percentage
    const calculateCompletion = () => {
        let completed = 0;
        let total = 5;

        // 1. Budget Range
        if (budgetRange?.max) completed++;

        // 2. Default Strategy
        if (defaultStrategy) completed++;

        // 3. Favorite Markets
        if (favoriteMarkets.length > 0) completed++;

        // 4. Financial DNA (check if any field is set)
        if (financialDna && Object.values(financialDna).some(v => v != null)) completed++;

        // 5. Investment Criteria (check if any field is set)
        if (investmentCriteria && Object.values(investmentCriteria).some(v => v != null)) completed++;

        return Math.round((completed / total) * 100);
    };

    const completionPercent = calculateCompletion();

    // Determine status level
    const getStatusLevel = () => {
        if (completionPercent === 0) return 'empty';
        if (completionPercent < 40) return 'low';
        if (completionPercent < 80) return 'medium';
        return 'complete';
    };

    const statusLevel = getStatusLevel();

    // Status configurations
    const statusConfig = {
        empty: {
            color: 'text-white/50',
            bgColor: 'bg-white/5 hover:bg-white/10',
            borderColor: 'border-white/10',
            ringColor: 'stroke-white/10',
            text: 'Set preferences'
        },
        low: {
            color: 'text-red-300',
            bgColor: 'bg-red-500/10 hover:bg-red-500/20',
            borderColor: 'border-red-500/30',
            ringColor: 'stroke-red-500',
            text: 'Complete your profile'
        },
        medium: {
            color: 'text-yellow-300',
            bgColor: 'bg-yellow-500/10 hover:bg-yellow-500/20',
            borderColor: 'border-yellow-500/30',
            ringColor: 'stroke-yellow-500',
            text: `${Math.round(completionPercent)}% complete`
        },
        complete: {
            color: 'text-green-300',
            bgColor: 'bg-green-500/10 hover:bg-green-500/20',
            borderColor: 'border-green-500/30',
            ringColor: 'stroke-green-500',
            text: null // Will show active prefs instead
        }
    };

    const config = statusConfig[statusLevel];

    // Format budget display
    const formatBudget = (value: number | undefined) => {
        if (!value) return null;
        if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
        return `$${Math.round(value / 1000)}k`;
    };

    const budgetMax = formatBudget(budgetRange?.max);

    // Build compact display text for complete state
    const buildCompactDisplay = () => {
        const parts: string[] = [];

        // Add budget (most important)
        if (budgetMax) {
            parts.push(budgetMax);
        }

        // Add strategy abbreviation
        if (defaultStrategy) {
            parts.push(defaultStrategy);
        }

        return parts.length > 0 ? parts.join(' • ') : config.text;
    };

    const displayText = statusLevel === 'complete' ? buildCompactDisplay() : config.text;

    // Quick budget options
    const budgetOptions = [
        { label: '$200k', value: 200000 },
        { label: '$400k', value: 400000 },
        { label: '$600k', value: 600000 },
        { label: '$1M', value: 1000000 },
        { label: '$2M', value: 2000000 },
    ];

    // Calculate circle progress (SVG)
    const radius = 6;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (completionPercent / 100) * circumference;

    return (
        <div className={cn('relative', className)}>
            {/* Chip Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    'flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-medium transition-all border group',
                    config.bgColor,
                    config.borderColor,
                    config.color
                )}
            >
                {/* Progress Ring */}
                <div className="relative w-3 h-3 flex-shrink-0">
                    <svg className="w-3 h-3 -rotate-90" viewBox="0 0 14 14">
                        {/* Background circle */}
                        <circle
                            cx="7"
                            cy="7"
                            r={radius}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            className="opacity-10"
                        />
                        {/* Progress circle */}
                        <circle
                            cx="7"
                            cy="7"
                            r={radius}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                            className={cn('transition-all duration-500', config.ringColor)}
                        />
                    </svg>
                    {/* Checkmark for complete state */}
                    {statusLevel === 'complete' && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <svg className="w-2 h-2 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                    )}
                </div>

                <span className="truncate max-w-[120px]">{displayText}</span>
                <ChevronDown className={cn('w-2.5 h-2.5 transition-transform flex-shrink-0 opacity-60 group-hover:opacity-100', isOpen && 'rotate-180')} />
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
                            className="absolute bottom-full mb-1.5 left-0 z-50 w-60 p-2.5 rounded-lg bg-slate-900/95 backdrop-blur-md border border-white/10 shadow-2xl"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-white/10">
                                <span className="text-[10px] font-semibold text-white/70">Quick Preferences</span>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-0.5 rounded-md hover:bg-white/10 text-white/40 hover:text-white/70 transition-colors"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>

                            {/* Strategy */}
                            <div className="mb-2">
                                <label className="flex items-center gap-1 text-[9px] font-medium text-white/50 uppercase tracking-wider mb-1.5">
                                    <Target className="w-2.5 h-2.5" />
                                    Strategy
                                </label>
                                <div className="flex gap-1">
                                    {(['STR', 'LTR', 'FLIP'] as const).map((strategy) => (
                                        <button
                                            key={strategy}
                                            onClick={() => setDefaultStrategy(strategy)}
                                            className={cn(
                                                'flex-1 px-1.5 py-1 rounded-md text-[10px] font-medium transition-all',
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
                            <div className="mb-2">
                                <label className="flex items-center gap-1 text-[9px] font-medium text-white/50 uppercase tracking-wider mb-1.5">
                                    <DollarSign className="w-2.5 h-2.5" />
                                    Max Budget
                                </label>
                                <div className="flex flex-wrap gap-1">
                                    {budgetOptions.map((opt) => (
                                        <button
                                            key={opt.value}
                                            onClick={() => setBudgetRange(budgetRange?.min || 100000, opt.value)}
                                            className={cn(
                                                'px-2 py-1 rounded-md text-[10px] font-medium transition-all',
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
                                <div className="mb-2">
                                    <label className="flex items-center gap-1 text-[9px] font-medium text-white/50 uppercase tracking-wider mb-1.5">
                                        <Home className="w-2.5 h-2.5" />
                                        Markets
                                    </label>
                                    <div className="flex flex-wrap gap-1">
                                        {favoriteMarkets.slice(0, 3).map((market) => (
                                            <span
                                                key={market}
                                                className="px-1.5 py-0.5 rounded-full bg-white/5 text-white/60 text-[9px] font-medium"
                                            >
                                                {market}
                                            </span>
                                        ))}
                                        {favoriteMarkets.length > 3 && (
                                            <span className="px-1.5 py-0.5 text-white/40 text-[9px]">
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
                                    className="w-full mt-1.5 py-1.5 rounded-md bg-white/5 text-white/60 text-[10px] font-medium hover:bg-white/10 hover:text-white transition-colors flex items-center justify-center gap-1"
                                >
                                    <Settings className="w-3 h-3" />
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
