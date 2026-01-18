/**
 * Usage Indicator - Shows remaining queries with upgrade CTA
 * Notion-inspired minimal design
 */

import React from 'react';
import { Zap, TrendingUp } from 'lucide-react';
import { useSubscription } from '../../hooks/useSubscription';

interface UsageIndicatorProps {
    onUpgradeClick: () => void;
    className?: string;
}

export const UsageIndicator: React.FC<UsageIndicatorProps> = ({ onUpgradeClick, className = '' }) => {
    const { subscription, usage } = useSubscription();
    
    const isPremium = subscription?.tier === 'pro' || subscription?.tier === 'enterprise';
    const queriesUsed = usage?.queries || 0;
    const queriesLimit = subscription?.limits?.queries || 1;
    const queriesRemaining = Math.max(0, queriesLimit - queriesUsed);
    const isAtLimit = queriesUsed >= queriesLimit;

    // Don't show for premium users
    if (isPremium) return null;

    return (
        <button
            onClick={onUpgradeClick}
            className={`w-full px-3 py-2.5 rounded-lg border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.12] transition-all group ${className}`}
        >
            <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="w-4 h-4 text-white/40" />
                        <span className="text-xs font-medium text-white/60">Free Plan</span>
                    </div>
                    <div className="text-[13px] text-white/90 font-medium">
                        {isAtLimit ? (
                            <span className="text-orange-400">Limit reached this month</span>
                        ) : (
                            <>
                                <span className={queriesRemaining === 0 ? 'text-orange-400' : 'text-white'}>
                                    {queriesRemaining}
                                </span>
                                <span className="text-white/50"> / {queriesLimit} queries left</span>
                            </>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gradient-to-r from-teal-500/10 to-purple-500/10 border border-teal-500/20 rounded-md">
                    <Zap className="w-3.5 h-3.5 text-teal-400" />
                    <span className="text-[11px] font-semibold text-teal-400">Upgrade</span>
                </div>
            </div>
        </button>
    );
};

/**
 * Compact Usage Badge - For composer/toolbar
 */
export const UsageBadge: React.FC<{ onUpgradeClick: () => void }> = ({ onUpgradeClick }) => {
    const { subscription, usage } = useSubscription();
    
    const isPremium = subscription?.tier === 'pro' || subscription?.tier === 'enterprise';
    const queriesUsed = usage?.queries || 0;
    const queriesLimit = subscription?.limits?.queries || 1;
    const queriesRemaining = Math.max(0, queriesLimit - queriesUsed);
    const isLow = queriesRemaining <= 0 && !isPremium;

    // Don't show for premium users
    if (isPremium) return null;

    // Don't show if not low
    if (!isLow) return null;

    return (
        <button
            onClick={onUpgradeClick}
            className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-orange-500/10 border border-orange-500/20 hover:bg-orange-500/15 transition-all"
            title="You've reached your query limit"
        >
            <Zap className="w-3 h-3 text-orange-400" />
            <span className="text-[11px] font-medium text-orange-400">Limit reached</span>
        </button>
    );
};
