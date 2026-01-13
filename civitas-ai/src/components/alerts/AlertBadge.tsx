// FILE: src/components/alerts/AlertBadge.tsx
/**
 * Alert Badge Component
 * 
 * Displays alert count badge with dropdown panel for viewing alerts.
 * Similar to notification systems in Slack, Discord, LinkedIn, etc.
 */

import React, { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { alertsApi, type Alert } from '../../services/alertsApi';
import { AlertPanel } from './AlertPanel';

interface AlertBadgeProps {
  userId: string;
  onAlertClick?: (alert: Alert) => void;
}

export const AlertBadge: React.FC<AlertBadgeProps> = ({ userId, onAlertClick }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch unread count on mount and periodically
  useEffect(() => {
    fetchUnreadCount();
    
    // Poll every 30 seconds for new alerts
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, [userId]);

  // Fetch alerts when dropdown opens
  useEffect(() => {
    if (isOpen && alerts.length === 0) {
      fetchAlerts();
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const fetchUnreadCount = async () => {
    try {
      const count = await alertsApi.getUnreadCount(userId);
      setUnreadCount(count);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const response = await alertsApi.getAlerts(userId, false, 20);
      setAlerts(response.alerts);
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      fetchAlerts(); // Refresh alerts when opening
    }
  };

  const handleAlertRead = async (alertId: string) => {
    try {
      await alertsApi.markAlertsRead(userId, [alertId]);
      
      // Update local state
      setAlerts(prev => 
        prev.map(alert => 
          alert.alert_id === alertId ? { ...alert, is_read: true } : alert
        )
      );
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark alert as read:', error);
    }
  };

  const handleDismissAlert = async (alertId: string) => {
    try {
      await alertsApi.dismissAlert(userId, alertId);
      
      // Remove from local state
      setAlerts(prev => prev.filter(alert => alert.alert_id !== alertId));
      
      // Update unread count if it was unread
      const alert = alerts.find(a => a.alert_id === alertId);
      if (alert && !alert.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Failed to dismiss alert:', error);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon with Badge */}
      <button
        onClick={handleToggle}
        className={`
          relative p-2 rounded-lg transition-all duration-200
          ${isOpen 
            ? 'bg-white/10 text-white' 
            : 'text-white/70 hover:text-white hover:bg-white/5'
          }
        `}
        aria-label={`Alerts${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
      >
        <Bell className="w-5 h-5" />
        
        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-red-500 rounded-full animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 z-50">
          <AlertPanel
            alerts={alerts}
            loading={loading}
            onAlertClick={(alert) => {
              handleAlertRead(alert.alert_id);
              onAlertClick?.(alert);
            }}
            onDismissAlert={handleDismissAlert}
            onMarkAllRead={() => {
              const unreadIds = alerts.filter(a => !a.is_read).map(a => a.alert_id);
              if (unreadIds.length > 0) {
                alertsApi.markAlertsRead(userId, unreadIds).then(() => {
                  setAlerts(prev => prev.map(a => ({ ...a, is_read: true })));
                  setUnreadCount(0);
                });
              }
            }}
            onRefresh={fetchAlerts}
          />
        </div>
      )}
    </div>
  );
};

