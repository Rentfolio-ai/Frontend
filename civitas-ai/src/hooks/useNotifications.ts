/**
 * Hook for notification badge / bell state.
 *
 * Polls unread count periodically so the sidebar bell stays up-to-date.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { notificationsApi } from '../services/notificationsApi';

const POLL_INTERVAL_MS = 60_000; // 1 minute

export function useNotifications() {
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const fetchCount = useCallback(async () => {
        try {
            const count = await notificationsApi.getUnreadCount();
            setUnreadCount(count);
        } catch {
            // Silently fail — badge is non-critical
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const token =
            localStorage.getItem('civitas-token') ||
            sessionStorage.getItem('civitas-token');

        if (!token) {
            setLoading(false);
            return;
        }

        // Initial fetch
        fetchCount();

        // Poll
        intervalRef.current = setInterval(fetchCount, POLL_INTERVAL_MS);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [fetchCount]);

    return {
        unreadCount,
        loading,
        refetch: fetchCount,
        hasUnread: unreadCount > 0,
    };
}
