// FILE: src/components/chat/PreferenceSuggestionToast.tsx
/**
 * Context-Aware Preference Suggestion Toast
 * 
 * Shows a toast when the AI response mentions budget/strategy, offering to save it as a preference.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, Target, X, Check, Sparkles } from 'lucide-react';
import { usePreferencesStore } from '@/stores/preferencesStore';
import { cn } from '@/lib/utils';

export interface PreferenceSuggestion {
    type: 'budget' | 'strategy' | 'market';
    value: string | number;
    label: string;
}

interface PreferenceSuggestionToastProps {
    suggestion: PreferenceSuggestion | null;
    onDismiss: () => void;
    className?: string;
}

const strategyLabels: Record<string, string> = {
    STR: 'Short-Term Rental',
    LTR: 'Long-Term Rental',
    FLIP: 'Fix & Flip',
};

export const PreferenceSuggestionToast: React.FC<PreferenceSuggestionToastProps> = ({
    suggestion,
    onDismiss,
    className,
}) => {
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const { setBudgetRange, setDefaultStrategy, toggleFavoriteMarket, budgetRange } = usePreferencesStore();

    // Auto-dismiss after save
    useEffect(() => {
        if (saved) {
            const timer = setTimeout(onDismiss, 1500);
            return () => clearTimeout(timer);
        }
    }, [saved, onDismiss]);

    if (!suggestion) return null;

    const handleSave = async () => {
        setIsSaving(true);

        try {
            switch (suggestion.type) {
                case 'budget':
                    const budgetValue = typeof suggestion.value === 'number'
                        ? suggestion.value
                        : parseInt(suggestion.value.toString().replace(/[^0-9]/g, ''), 10);
                    setBudgetRange(budgetRange?.min || 100000, budgetValue);
                    break;
                case 'strategy':
                    setDefaultStrategy(suggestion.value as 'STR' | 'LTR' | 'FLIP');
                    break;
                case 'market':
                    toggleFavoriteMarket(suggestion.value.toString());
                    break;
            }
            setSaved(true);
        } finally {
            setIsSaving(false);
        }
    };

    const getIcon = () => {
        switch (suggestion.type) {
            case 'budget':
                return <DollarSign className="w-4 h-4" />;
            case 'strategy':
                return <Target className="w-4 h-4" />;
            default:
                return <Sparkles className="w-4 h-4" />;
        }
    };

    const getTitle = () => {
        switch (suggestion.type) {
            case 'budget':
                return 'Save as default budget?';
            case 'strategy':
                return 'Set as preferred strategy?';
            case 'market':
                return 'Add to favorite markets?';
            default:
                return 'Save preference?';
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                className={cn(
                    'fixed bottom-24 right-6 z-50 max-w-xs',
                    className
                )}
            >
                <div className="bg-slate-900/95 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl p-4">
                    {/* Header */}
                    <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-primary/20 text-primary-300">
                            {getIcon()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white/90">{getTitle()}</p>
                            <p className="text-xs text-white/50 mt-0.5 truncate">
                                {suggestion.label}
                            </p>
                        </div>
                        <button
                            onClick={onDismiss}
                            className="p-1 rounded-md hover:bg-white/10 text-white/40 hover:text-white/70 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-3">
                        <button
                            onClick={onDismiss}
                            className="flex-1 px-3 py-2 rounded-lg text-xs font-medium bg-white/5 text-white/60 hover:bg-white/10 hover:text-white transition-colors"
                        >
                            Not now
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving || saved}
                            className={cn(
                                'flex-1 px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all',
                                saved
                                    ? 'bg-green-500/20 text-green-300'
                                    : 'bg-primary text-white hover:bg-primary/80'
                            )}
                        >
                            {saved ? (
                                <>
                                    <Check className="w-3.5 h-3.5" />
                                    Saved
                                </>
                            ) : isSaving ? (
                                'Saving...'
                            ) : (
                                <>
                                    <Check className="w-3.5 h-3.5" />
                                    Save
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

/**
 * Utility to detect preference suggestions from AI response content
 */
export function detectPreferenceSuggestion(content: string, userQuery: string): PreferenceSuggestion | null {
    const lowerContent = content.toLowerCase();
    const lowerQuery = userQuery.toLowerCase();

    // Don't suggest if user already has this as context (e.g., "under $500k")
    const userBudgetMatch = lowerQuery.match(/\$?\s*([\d,]+)\s*(k|m|million|thousand)?/i);

    // Detect budget mentions in response
    const budgetPatterns = [
        /budget\s+(?:of\s+)?\$?([\d,]+)\s*(k|m)?/i,
        /(?:around|approximately|about)\s+\$?([\d,]+)\s*(k|m)?/i,
        /max(?:imum)?\s+(?:budget\s+(?:of\s+)?)?\$?([\d,]+)\s*(k|m)?/i,
    ];

    for (const pattern of budgetPatterns) {
        const match = content.match(pattern);
        if (match && !userBudgetMatch) {
            let value = parseInt(match[1].replace(/,/g, ''), 10);
            const suffix = match[2]?.toLowerCase();
            if (suffix === 'k') value *= 1000;
            if (suffix === 'm' || suffix === 'million') value *= 1000000;

            if (value >= 100000 && value <= 10000000) {
                const formatted = value >= 1000000
                    ? `$${(value / 1000000).toFixed(1)}M`
                    : `$${Math.round(value / 1000)}k`;
                return {
                    type: 'budget',
                    value,
                    label: `${formatted} max budget`,
                };
            }
        }
    }

    // Detect strategy mentions
    const strategyPatterns: [RegExp, 'STR' | 'LTR' | 'FLIP'][] = [
        [/short[- ]?term\s+rental/i, 'STR'],
        [/str\s+(?:strategy|investment|properties)/i, 'STR'],
        [/long[- ]?term\s+rental/i, 'LTR'],
        [/ltr\s+(?:strategy|investment|properties)/i, 'LTR'],
        [/fix\s*(?:and|&)\s*flip/i, 'FLIP'],
        [/flip(?:ping)?\s+(?:strategy|properties)/i, 'FLIP'],
    ];

    // Only suggest if the AI is recommending or discussing a specific strategy
    if (lowerContent.includes('recommend') || lowerContent.includes('consider') || lowerContent.includes('suggest')) {
        for (const [pattern, strategy] of strategyPatterns) {
            if (pattern.test(content)) {
                return {
                    type: 'strategy',
                    value: strategy,
                    label: strategyLabels[strategy],
                };
            }
        }
    }

    return null;
}
