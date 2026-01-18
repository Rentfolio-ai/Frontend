/**
 * Feature Gate Hook - Check if user can access premium features
 * Shows upgrade modal automatically when needed
 */

import { useCallback } from 'react';
import { useSubscription } from './useSubscription';

export type FeatureName = 
    | 'unlimited_queries'
    | 'advanced_reports'
    | 'portfolio_analysis'
    | 'export_pdf'
    | 'priority_support'
    | 'ai_simulation';

interface FeatureGateReturn {
    /** Check if user has access to a feature */
    hasFeature: (feature: FeatureName) => boolean;
    
    /** Check feature and show upgrade modal if needed */
    checkFeature: (feature: FeatureName, onUpgrade: () => void) => boolean;
    
    /** Check if user has reached query limit */
    isAtQueryLimit: () => boolean;
    
    /** Get remaining queries */
    getRemainingQueries: () => number;
}

export const useFeatureGate = (): FeatureGateReturn => {
    const { subscription, usage } = useSubscription();

    const isPremium = subscription?.tier === 'pro' || subscription?.tier === 'enterprise';

    const hasFeature = useCallback((feature: FeatureName): boolean => {
        // Premium users have all features
        if (isPremium) return true;

        // Free users have limited features
        switch (feature) {
            case 'unlimited_queries':
            case 'advanced_reports':
            case 'portfolio_analysis':
            case 'export_pdf':
            case 'priority_support':
            case 'ai_simulation':
                return false;
            default:
                return true;
        }
    }, [isPremium]);

    const checkFeature = useCallback((feature: FeatureName, onUpgrade: () => void): boolean => {
        if (hasFeature(feature)) {
            return true;
        }

        // Show upgrade modal
        onUpgrade();
        return false;
    }, [hasFeature]);

    const isAtQueryLimit = useCallback((): boolean => {
        if (isPremium) return false;

        const queriesUsed = usage?.queries || 0;
        const queriesLimit = subscription?.limits?.queries || 1;

        return queriesUsed >= queriesLimit;
    }, [isPremium, usage, subscription]);

    const getRemainingQueries = useCallback((): number => {
        if (isPremium) return Infinity;

        const queriesUsed = usage?.queries || 0;
        const queriesLimit = subscription?.limits?.queries || 1;

        return Math.max(0, queriesLimit - queriesUsed);
    }, [isPremium, usage, subscription]);

    return {
        hasFeature,
        checkFeature,
        isAtQueryLimit,
        getRemainingQueries,
    };
};
