import { useState, useEffect, useCallback, useMemo } from 'react';
import { subscriptionService, type SubscriptionStatus } from '../services/subscriptionService';

// Default free tier — used as fallback when billing isn't reachable
const DEFAULT_FREE_TIER: SubscriptionStatus = {
    tier: 'free',
    status: 'active',
    limits: {
        analyses_per_month: 2,
        reports_per_month: 2,
        watchlist_properties: 10,
    },
};

// Synthetic Pro tier for development — devs are never restricted
const DEV_PRO_TIER: SubscriptionStatus = {
    tier: 'pro',
    status: 'active',
    limits: {
        analyses_per_month: 999,
        reports_per_month: 999,
        watchlist_properties: 999,
    },
};

/**
 * Feature-level usage limits per tier.
 * Maps feature keys to max allowed uses.
 * -1 = unlimited, 0 = blocked.
 */
const FEATURE_LIMITS: Record<string, Record<string, number>> = {
    free: {
        property_searches: 2,
        reports: 2,
        voice_sessions: 0,       // blocked (includes camera-in-voice)
        str_full_analysis: 0,
        advanced_tools: 0,
    },
    pro: {
        property_searches: -1,
        reports: -1,
        voice_sessions: -1,
        str_full_analysis: -1,
        advanced_tools: -1,
    },
    enterprise: {
        property_searches: -1,
        reports: -1,
        voice_sessions: -1,
        str_full_analysis: -1,
        advanced_tools: -1,
    },
};

export function useSubscription() {
    // In dev mode, always use Pro tier so developers are never restricted
    const isDev = import.meta.env.DEV;

    const [subscription, setSubscription] = useState<SubscriptionStatus>(
        isDev ? DEV_PRO_TIER : DEFAULT_FREE_TIER
    );
    const [loading, setLoading] = useState(!isDev);
    const [error, setError] = useState<string | null>(null);

    const fetchSubscription = useCallback(async () => {
        if (isDev) return; // Skip network call in dev

        try {
            setLoading(true);
            setError(null);
            const data = await subscriptionService.getSubscription();
            setSubscription(data);
        } catch (err) {
            console.warn('Failed to fetch subscription, using free tier:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch subscription');
            // Keep free tier fallback so the app still works
            setSubscription(DEFAULT_FREE_TIER);
        } finally {
            setLoading(false);
        }
    }, [isDev]);

    useEffect(() => {
        if (isDev) return; // Dev mode — already set to Pro

        // Only fetch if user is logged in (has a token)
        const token =
            localStorage.getItem('civitas-token') ||
            sessionStorage.getItem('civitas-token');

        if (token) {
            fetchSubscription();
        } else {
            setLoading(false);
        }
    }, [fetchSubscription, isDev]);

    const isPro = subscription.tier === 'pro' || subscription.tier === 'enterprise';
    const isFree = subscription.tier === 'free';

    const featureLimits = useMemo(
        () => FEATURE_LIMITS[subscription.tier] || FEATURE_LIMITS.free,
        [subscription.tier]
    );

    /**
     * Check if the user can use a given feature.
     * For limit-based features (searches, reports), this checks the tier allows it.
     * For boolean features (voice, vision), checks if the limit is > 0 or unlimited.
     */
    const canUse = useCallback(
        (feature: string): boolean => {
            if (isDev) return true;
            const limit = featureLimits[feature];
            if (limit === undefined) return true; // unknown feature → allow
            if (limit === -1) return true;         // unlimited
            return limit > 0;                       // has remaining
        },
        [isDev, featureLimits]
    );

    /**
     * Get remaining uses for a feature (from the static tier definition).
     * For actual usage-aware counts, the backend provides this via the agent prompt.
     */
    const remaining = useCallback(
        (feature: string): number => {
            if (isDev) return 999;
            const limit = featureLimits[feature];
            if (limit === undefined || limit === -1) return 999;
            return limit;
        },
        [isDev, featureLimits]
    );

    return {
        subscription,
        loading,
        error,
        isPro,
        isFree,
        canUse,
        remaining,
        refetch: fetchSubscription,
    };
}
