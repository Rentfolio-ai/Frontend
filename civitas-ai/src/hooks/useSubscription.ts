import { useState, useEffect } from 'react';
import type { SubscriptionStatus } from '../services/subscriptionService';

// Default free tier - used as fallback
const DEFAULT_FREE_TIER: SubscriptionStatus = {
    tier: 'free',
    status: 'active',
    limits: {
        analyses_per_month: 5,
        reports_per_month: 2,
        watchlist_properties: 10
    }
};

export function useSubscription() {
    const [subscription, setSubscription] = useState<SubscriptionStatus>(DEFAULT_FREE_TIER);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchSubscription = async () => {
        try {
            setLoading(true);
            setError(null);

            // Dynamically import to avoid crashes if auth isn't set up
            const { subscriptionService } = await import('../services/subscriptionService');
            const data = await subscriptionService.getSubscription();
            setSubscription(data);
        } catch (err) {
            console.warn('Failed to fetch subscription, using free tier:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch subscription');
            // Keep default free tier on error - app still works
            setSubscription(DEFAULT_FREE_TIER);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Don't fetch if we're in development without auth
        if (import.meta.env.VITE_FIREBASE_API_KEY) {
            fetchSubscription().catch(err => {
                console.error('useSubscription mount error:', err);
            });
        } else {
            console.log('Firebase not configured, using free tier');
            setLoading(false);
        }
    }, []);

    return {
        subscription,
        loading,
        error,
        refetch: fetchSubscription
    };
}
