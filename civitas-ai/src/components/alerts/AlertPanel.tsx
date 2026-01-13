// FILE: src/components/alerts/AlertPanel.tsx
/**
 * Alert Panel Component
 * 
 * Dropdown panel that displays list of alerts with actions.
 */

import React from 'react';
import { X, RefreshCw, CheckCheck, AlertTriangle, Info, Bell } from 'lucide-react';
import type { Alert } from '../../services/alertsApi';

interface AlertPanelProps {
  alerts: Alert[];
  loading: boolean;
  onAlertClick: (alert: Alert) => void;
  onDismissAlert: (alertId: string) => void;
  onMarkAllRead: () => void;
  onRefresh: () => void;
}

export const AlertPanel: React.FC<AlertPanelProps> = ({
  alerts,
  loading,
  onAlertClick,
  onDismissAlert,
  onMarkAllRead,
  onRefresh,
}) => {
  const unreadCount = alerts.filter(a => !a.is_read).length;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'text-red-500 bg-red-500/10';
      case 'medium':
        return 'text-yellow-500 bg-yellow-500/10';
      case 'low':
        return 'text-blue-500 bg-blue-500/10';
      default:
        return 'text-gray-500 bg-gray-500/10';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high':
        return <AlertTriangle className="w-4 h-4" />;
      case 'medium':
        return <Info className="w-4 h-4" />;
      case 'low':
        return <Info className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMins = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMins / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMins < 1) return 'just now';
    if (diffInMins < 60) return `${diffInMins}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="w-[400px] max-h-[600px] bg-[#1a1d24] border border-white/10 rounded-xl shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="sticky top-0 bg-[#1a1d24] border-b border-white/10 px-4 py-3 z-10">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-semibold text-lg">
            Alerts
            {unreadCount > 0 && (
              <span className="ml-2 text-xs font-medium text-white/60">
                ({unreadCount} unread)
              </span>
            )}
          </h3>

          <div className="flex items-center gap-2">
            {/* Refresh Button */}
            <button
              onClick={onRefresh}
              disabled={loading}
              className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-all disabled:opacity-50"
              aria-label="Refresh alerts"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            {/* Mark All Read Button */}
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllRead}
                className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-all"
                aria-label="Mark all as read"
              >
                <CheckCheck className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <div className="overflow-y-auto max-h-[500px] custom-scrollbar">
        {loading && alerts.length === 0 ? (
          // Loading State
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-6 h-6 text-white/40 animate-spin" />
          </div>
        ) : alerts.length === 0 ? (
          // Empty State
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
              <Bell className="w-8 h-8 text-white/40" />
            </div>
            <p className="text-white/60 text-sm">No alerts yet</p>
            <p className="text-white/40 text-xs mt-1">
              We'll notify you about market changes
            </p>
          </div>
        ) : (
          // Alerts List
          <div className="divide-y divide-white/5">
            {alerts.map((alert) => (
              <div
                key={alert.alert_id}
                className={`
                  relative px-4 py-3 hover:bg-white/5 transition-all cursor-pointer group
                  ${!alert.is_read ? 'bg-white/3' : ''}
                `}
                onClick={() => onAlertClick(alert)}
              >
                {/* Unread Indicator */}
                {!alert.is_read && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />
                )}

                <div className="flex items-start gap-3">
                  {/* Severity Icon */}
                  <div className={`flex-shrink-0 p-2 rounded-lg ${getSeverityColor(alert.severity)}`}>
                    {getSeverityIcon(alert.severity)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Title */}
                    <h4 className={`text-sm font-medium mb-1 ${alert.is_read ? 'text-white/80' : 'text-white'}`}>
                      {alert.title}
                    </h4>

                    {/* Summary */}
                    <p className="text-xs text-white/60 mb-2 line-clamp-2">
                      {alert.summary}
                    </p>

                    {/* Property/Market Info */}
                    {alert.property_address && (
                      <div className="text-xs text-white/50 mb-1">
                        📍 {alert.property_address}
                      </div>
                    )}

                    {/* Time */}
                    <div className="text-xs text-white/40">
                      {formatTimeAgo(alert.created_at)}
                    </div>
                  </div>

                  {/* Dismiss Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDismissAlert(alert.alert_id);
                    }}
                    className="flex-shrink-0 p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all opacity-0 group-hover:opacity-100"
                    aria-label="Dismiss alert"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer (optional - for "View All" link) */}
      {alerts.length > 0 && (
        <div className="sticky bottom-0 bg-[#1a1d24] border-t border-white/10 px-4 py-2">
          <button className="w-full text-sm text-blue-400 hover:text-blue-300 font-medium">
            View All Alerts
          </button>
        </div>
      )}
    </div>
  );
};



