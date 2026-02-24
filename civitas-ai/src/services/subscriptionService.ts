/**
 * Subscription & Billing Service
 *
 * Talks to /api/billing/* endpoints on the DataLayer backend.
 */

import { API_BASE_URL, API_KEY as CIVITAS_API_KEY } from './apiConfig';

const getAuthHeaders = (): Record<string, string> => {
    const token =
        localStorage.getItem('civitas-token') ||
        sessionStorage.getItem('civitas-token');

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (CIVITAS_API_KEY) headers['X-API-Key'] = CIVITAS_API_KEY;

    // Include user_id from stored user (used by billing endpoints)
    try {
        const userStr = localStorage.getItem('civitas-user');
        if (userStr) {
            const user = JSON.parse(userStr);
            if (user.id) headers['X-User-ID'] = user.id;
        }
    } catch { /* ignore */ }

    return headers;
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SubscriptionStatus {
    tier: 'free' | 'pro' | 'enterprise';
    status: 'active' | 'past_due' | 'canceled' | 'cancelled' | 'trialing' | 'inactive';
    trial_ends_at?: string;
    limits: {
        analyses_per_month: number;
        reports_per_month: number;
        watchlist_properties: number;
    };
    usage_this_month?: Record<string, number>;
    /** True if the user has never had a Pro subscription — eligible for 50% first-month coupon */
    first_month_eligible?: boolean;
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

export const subscriptionService = {
    /**
     * Get current subscription status and usage
     */
    getSubscription: async (): Promise<SubscriptionStatus> => {
        const response = await fetch(`${API_BASE_URL}/api/billing/subscription`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            throw new Error('Failed to fetch subscription status');
        }

        return response.json();
    },

    /**
     * Select the Free plan explicitly (e.g. during onboarding)
     */
    selectFreePlan: async (): Promise<{ success: boolean; tier: string }> => {
        const response = await fetch(`${API_BASE_URL}/api/billing/select-free`, {
            method: 'POST',
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            throw new Error('Failed to select free plan');
        }

        return response.json();
    },

    /**
     * Create a Stripe Checkout session for upgrading to Pro
     */
    createCheckoutSession: async (
        tier: 'pro' | 'enterprise' = 'pro'
    ): Promise<{ checkout_url?: string }> => {
        const response = await fetch(`${API_BASE_URL}/api/billing/create-checkout-session`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
                tier,
                success_url: window.location.origin + '?payment=success',
                cancel_url: window.location.origin + '?payment=cancelled',
            }),
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({ detail: 'Unknown error' }));
            throw new Error(err.detail || 'Failed to create checkout session');
        }

        const data = await response.json();
        // Redirect to Stripe hosted checkout
        if (data.checkout_url) {
            window.location.href = data.checkout_url;
        }
        return data;
    },

    /**
     * Purchase a one-time token pack (25K tokens for $10). Pro users only.
     */
    purchaseTokenPack: async (): Promise<{ checkout_url?: string }> => {
        const response = await fetch(`${API_BASE_URL}/api/billing/purchase-token-pack`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
                success_url: window.location.origin + '?payment=token_pack_success',
                cancel_url: window.location.origin + '?payment=cancelled',
            }),
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({ detail: 'Unknown error' }));
            throw new Error(err.detail || 'Failed to create token pack session');
        }

        const data = await response.json();
        if (data.checkout_url) {
            window.location.href = data.checkout_url;
        }
        return data;
    },

    /**
     * Cancel the current subscription
     */
    cancelSubscription: async (): Promise<{ status: string; message: string }> => {
        const response = await fetch(`${API_BASE_URL}/api/billing/cancel-subscription`, {
            method: 'POST',
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            throw new Error('Failed to cancel subscription');
        }

        return response.json();
    },
};
