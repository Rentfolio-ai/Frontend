import { useState, useEffect, useCallback } from 'react';
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

export function useSubscription() {
    const [subscription, setSubscription] = useState<SubscriptionStatus>(DEFAULT_FREE_TIER);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSubscription = useCallback(async () => {
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
    }, []);

    useEffect(() => {
        // Only fetch if user is logged in (has a token)
        const token =
            localStorage.getItem('civitas-token') ||
            sessionStorage.getItem('civitas-token');

        if (token) {
            fetchSubscription();
        } else {
            setLoading(false);
        }
    }, [fetchSubscription]);

    return {
        subscription,
        loading,
        error,
        isPro: subscription.tier === 'pro' || subscription.tier === 'enterprise',
        isFree: subscription.tier === 'free',
        refetch: fetchSubscription,
    };
}
