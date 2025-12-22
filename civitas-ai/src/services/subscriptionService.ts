import { auth } from './firebaseAuth';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const getAuthHeaders = async (): Promise<Record<string, string>> => {
    const user = auth.currentUser;
    if (!user) return {};

    const token = await user.getIdToken();
    return {
        'Authorization': `Bearer ${token}`,
        'X-User-ID': user.uid
    };
};

export interface SubscriptionStatus {
    tier: 'free' | 'pro' | 'enterprise';
    status: 'active' | 'past_due' | 'canceled' | 'trialing';
    trial_ends_at?: string;
    limits: {
        analyses_per_month: number;
        reports_per_month: number;
        watchlist_properties: number;
    };
    usage_this_month?: Record<string, number>;
}

export const subscriptionService = {
    /**
     * Get current subscription status and usage
     */
    getSubscription: async (): Promise<SubscriptionStatus> => {
        const headers = {
            'Content-Type': 'application/json',
            ...(await getAuthHeaders())
        };

        const response = await fetch(`${API_BASE_URL}/api/billing/subscription`, {
            method: 'GET',
            headers
        });

        if (!response.ok) {
            throw new Error('Failed to fetch subscription status');
        }

        return response.json();
    },

    /**
     * Create a Stripe Checkout session for upgrading
     */
    createCheckoutSession: async (tier: 'pro' | 'enterprise') => {
        const headers = {
            'Content-Type': 'application/json',
            ...(await getAuthHeaders())
        };

        const response = await fetch(`${API_BASE_URL}/api/billing/create-checkout-session`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                tier,
                success_url: window.location.origin + '?payment=success',
                cancel_url: window.location.origin + '?payment=cancelled'
            })
        });

        if (!response.ok) {
            throw new Error('Failed to create checkout session');
        }

        const data = await response.json();
        // Redirect to Stripe
        if (data.checkout_url) {
            window.location.href = data.checkout_url;
        }
        return data;
    }
};
