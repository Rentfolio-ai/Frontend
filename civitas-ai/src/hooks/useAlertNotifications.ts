// FILE: src/hooks/useAlertNotifications.ts
/**
 * Hook for auto-popup alert notifications.
 * 
 * Polls for new alerts and shows toast notifications automatically.
 * Like Slack/Discord - alerts pop up without user clicking.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { alertsApi, type Alert } from '../services/alertsApi';

interface UseAlertNotificationsOptions {
  userId: string;
  enabled?: boolean;
  pollInterval?: number; // milliseconds
}

interface AlertNotificationState {
  toastAlerts: Alert[];
  unreadCount: number;
  lastChecked: Date | null;
}

export function useAlertNotifications({
  userId,
  enabled = true,
  pollInterval = 60000, // 60 seconds default (less aggressive)
}: UseAlertNotificationsOptions) {
  const [state, setState] = useState<AlertNotificationState>({
    toastAlerts: [],
    unreadCount: 0,
    lastChecked: null,
  });

  // Track which alerts we've already shown as toasts
  const shownAlertIds = useRef<Set<string>>(new Set());
  const lastPollTime = useRef<Date | null>(null);

  /**
   * Check for new alerts and show toasts for any we haven't seen
   */
  const checkForNewAlerts = useCallback(async () => {
    if (!enabled || !userId) return;

    try {
      // Get unread alerts
      const response = await alertsApi.getAlerts(userId, true, 20);

      // Update unread count
      setState(prev => ({
        ...prev,
        unreadCount: response.unread_count,
        lastChecked: new Date(),
      }));

      // Find alerts we haven't shown yet
      const newAlerts = response.alerts.filter(
        alert => !shownAlertIds.current.has(alert.alert_id)
      );

      if (newAlerts.length > 0) {
        console.log(`[AlertNotifications] Found ${newAlerts.length} new alerts`);

        // Show toasts for new alerts (limit to 5 at once for visibility without spam)
        const alertsToShow = newAlerts.slice(0, 5);

        // Add to shown set
        alertsToShow.forEach(alert => {
          shownAlertIds.current.add(alert.alert_id);
        });

        // Show toasts with staggered delay for smooth appearance
        alertsToShow.forEach((alert, index) => {
          setTimeout(() => {
            setState(prev => ({
              ...prev,
              toastAlerts: [...prev.toastAlerts, alert],
            }));
          }, index * 400); // 400ms stagger for smoother animation
        });
      }

      lastPollTime.current = new Date();
    } catch (error) {
      console.error('[AlertNotifications] Failed to check for alerts:', error);
    }
  }, [enabled, userId]);

  /**
   * Remove a toast alert
   */
  const dismissToast = useCallback((alertId: string) => {
    setState(prev => ({
      ...prev,
      toastAlerts: prev.toastAlerts.filter(alert => alert.alert_id !== alertId),
    }));
  }, []);

  /**
   * Handle when user clicks a toast
   */
  const handleToastClick = useCallback(async (alert: Alert) => {
    // Mark as read
    try {
      await alertsApi.markAlertsRead(userId, [alert.alert_id]);

      // Update unread count
      setState(prev => ({
        ...prev,
        unreadCount: Math.max(0, prev.unreadCount - 1),
      }));
    } catch (error) {
      console.error('[AlertNotifications] Failed to mark alert as read:', error);
    }

    // Dismiss toast
    dismissToast(alert.alert_id);
  }, [userId, dismissToast]);

  /**
   * Manually trigger a check (useful for testing)
   */
  const checkNow = useCallback(() => {
    checkForNewAlerts();
  }, [checkForNewAlerts]);

  /**
   * Clear all shown toast IDs (for testing/debugging)
   */
  const resetShownAlerts = useCallback(() => {
    shownAlertIds.current.clear();
    console.log('[AlertNotifications] Cleared shown alerts history');
  }, []);

  // Initial check on mount
  useEffect(() => {
    if (enabled && userId) {
      checkForNewAlerts();
    }
  }, [enabled, userId, checkForNewAlerts]);

  // Poll for new alerts
  useEffect(() => {
    if (!enabled || !userId) return;

    const interval = setInterval(() => {
      checkForNewAlerts();
    }, pollInterval);

    return () => clearInterval(interval);
  }, [enabled, userId, pollInterval, checkForNewAlerts]);

  return {
    toastAlerts: state.toastAlerts,
    unreadCount: state.unreadCount,
    lastChecked: state.lastChecked,
    dismissToast,
    handleToastClick,
    checkNow,
    resetShownAlerts,
  };
}

