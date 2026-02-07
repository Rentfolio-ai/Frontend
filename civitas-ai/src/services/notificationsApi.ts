/**
 * User Notifications API Service
 *
 * Talks to /api/notifications/* endpoints on the DataLayer backend.
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

export type NotificationType =
    | 'price_change'
    | 'market_update'
    | 'report_ready'
    | 'system_update'
    | 'subscription'
    | 'portfolio_alert'
    | 'new_listing'
    | 'general';

export interface UserNotification {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    priority: string;
    is_read: boolean;
    action_url?: string;
    created_at: string;
}

export interface NotificationListResponse {
    notifications: UserNotification[];
    total: number;
    unread_count: number;
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

export const notificationsApi = {
    /**
     * List notifications for the current user
     */
    list: async (
        opts: { unread_only?: boolean; limit?: number; offset?: number } = {},
    ): Promise<NotificationListResponse> => {
        const params = new URLSearchParams();
        if (opts.unread_only) params.set('unread_only', 'true');
        if (opts.limit) params.set('limit', String(opts.limit));
        if (opts.offset) params.set('offset', String(opts.offset));

        const response = await fetch(
            `${API_BASE_URL}/api/notifications/?${params.toString()}`,
            { headers: getAuthHeaders() },
        );

        if (!response.ok) throw new Error('Failed to fetch notifications');
        return response.json();
    },

    /**
     * Get unread count (lightweight — for badge)
     */
    getUnreadCount: async (): Promise<number> => {
        try {
            const response = await fetch(
                `${API_BASE_URL}/api/notifications/unread-count`,
                { headers: getAuthHeaders() },
            );
            if (!response.ok) return 0;
            const data = await response.json();
            return data.unread_count ?? 0;
        } catch {
            return 0;
        }
    },

    /**
     * Mark a single notification as read
     */
    markAsRead: async (notificationId: string): Promise<void> => {
        await fetch(
            `${API_BASE_URL}/api/notifications/${notificationId}/read`,
            { method: 'POST', headers: getAuthHeaders() },
        );
    },

    /**
     * Mark all notifications as read
     */
    markAllRead: async (): Promise<void> => {
        await fetch(`${API_BASE_URL}/api/notifications/mark-all-read`, {
            method: 'POST',
            headers: getAuthHeaders(),
        });
    },

    /**
     * Delete a notification
     */
    delete: async (notificationId: string): Promise<void> => {
        await fetch(`${API_BASE_URL}/api/notifications/${notificationId}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });
    },
};
