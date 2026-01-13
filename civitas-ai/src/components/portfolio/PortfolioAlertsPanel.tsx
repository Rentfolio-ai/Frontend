// FILE: src/components/portfolio/PortfolioAlertsPanel.tsx
/**
 * Portfolio Alerts Panel - Displays AI-generated portfolio alerts
 * Categorized alerts with severity indicators
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    AlertTriangle,
    TrendingDown,
    TrendingUp,
    MapPin,
    RefreshCw,
    Lightbulb,
    Trophy,
    DollarSign,
    Bell,
    X,
    ChevronRight,
} from 'lucide-react';
import type { PortfolioAlert, PortfolioAlertType, AlertSeverity } from '../../types/portfolio';

interface PortfolioAlertsPanelProps {
    alerts: PortfolioAlert[];
    loading?: boolean;
    onDismiss?: (alertId: string) => void;
    onAlertClick?: (alert: PortfolioAlert) => void;
    maxVisible?: number;
}

const alertTypeConfig: Record<PortfolioAlertType, { icon: React.ReactNode; label: string }> = {
    health_decline: { icon: <TrendingDown className="w-4 h-4" />, label: 'Health Decline' },
    health_improvement: { icon: <TrendingUp className="w-4 h-4" />, label: 'Health Improved' },
    underperforming_asset: { icon: <AlertTriangle className="w-4 h-4" />, label: 'Underperforming' },
    concentration_risk: { icon: <MapPin className="w-4 h-4" />, label: 'Concentration Risk' },
    market_warning: { icon: <AlertTriangle className="w-4 h-4" />, label: 'Market Warning' },
    rebalance_needed: { icon: <RefreshCw className="w-4 h-4" />, label: 'Rebalance' },
    opportunity: { icon: <Lightbulb className="w-4 h-4" />, label: 'Opportunity' },
    milestone: { icon: <Trophy className="w-4 h-4" />, label: 'Milestone' },
    refinance_opportunity: { icon: <DollarSign className="w-4 h-4" />, label: 'Refinance' },
    cashflow_warning: { icon: <DollarSign className="w-4 h-4" />, label: 'Cash Flow' },
};

const severityConfig: Record<AlertSeverity, { bg: string; border: string; text: string; dot: string }> = {
    critical: {
        bg: 'bg-red-500/10',
        border: 'border-red-500/30',
        text: 'text-red-400',
        dot: 'bg-red-500',
    },
    high: {
        bg: 'bg-orange-500/10',
        border: 'border-orange-500/30',
        text: 'text-orange-400',
        dot: 'bg-orange-500',
    },
    medium: {
        bg: 'bg-yellow-500/10',
        border: 'border-yellow-500/30',
        text: 'text-yellow-400',
        dot: 'bg-yellow-500',
    },
    low: {
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/30',
        text: 'text-blue-400',
        dot: 'bg-blue-500',
    },
    info: {
        bg: 'bg-teal-500/10',
        border: 'border-teal-500/30',
        text: 'text-teal-400',
        dot: 'bg-teal-500',
    },
};

const AlertCard: React.FC<{
    alert: PortfolioAlert;
    onDismiss?: () => void;
    onClick?: () => void;
    index: number;
}> = ({ alert, onDismiss, onClick, index }) => {
    const typeInfo = alertTypeConfig[alert.alert_type];
    const severityInfo = severityConfig[alert.severity];

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20, height: 0 }}
            transition={{ delay: index * 0.05 }}
            layout
            className={`${severityInfo.bg} border ${severityInfo.border} rounded-lg p-3 group cursor-pointer hover:bg-white/5 transition-all`}
            onClick={onClick}
        >
            <div className="flex items-start gap-3">
                {/* Icon */}
                <div className={`p-1.5 rounded-lg ${severityInfo.bg} ${severityInfo.text}`}>
                    {typeInfo.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs px-1.5 py-0.5 rounded ${severityInfo.bg} ${severityInfo.text}`}>
                            {typeInfo.label}
                        </span>
                        <span className={`w-1.5 h-1.5 rounded-full ${severityInfo.dot} animate-pulse`} />
                        <span className="text-xs text-slate-500 capitalize">{alert.severity}</span>
                    </div>

                    {/* Title */}
                    <h4 className="text-sm font-medium text-white mb-0.5 line-clamp-1">
                        {alert.title}
                    </h4>

                    {/* Summary */}
                    <p className="text-xs text-slate-400 line-clamp-2">
                        {alert.summary}
                    </p>

                    {/* Property Address */}
                    {alert.property_address && (
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {alert.property_address}
                        </p>
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                    {onDismiss && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDismiss();
                            }}
                            className="p-1 text-slate-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-teal-400 transition-colors" />
                </div>
            </div>

            {/* Recommendations */}
            {alert.recommendations.length > 0 && (
                <div className="mt-2 pt-2 border-t border-white/5">
                    <p className="text-xs text-slate-500 mb-1">Recommended:</p>
                    <p className="text-xs text-slate-300 line-clamp-1">{alert.recommendations[0]}</p>
                </div>
            )}
        </motion.div>
    );
};

export const PortfolioAlertsPanel: React.FC<PortfolioAlertsPanelProps> = ({
    alerts,
    loading = false,
    onDismiss,
    onAlertClick,
    maxVisible = 5,
}) => {
    // Filter out dismissed alerts and sort by severity
    const visibleAlerts = alerts
        .filter((a) => !a.is_dismissed)
        .sort((a, b) => {
            const severityOrder: Record<AlertSeverity, number> = {
                critical: 0,
                high: 1,
                medium: 2,
                low: 3,
                info: 4,
            };
            return severityOrder[a.severity] - severityOrder[b.severity];
        })
        .slice(0, maxVisible);

    if (loading) {
        return (
            <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4">
                <div className="flex items-center gap-2 mb-4">
                    <Bell className="w-5 h-5 text-teal-400 animate-pulse" />
                    <span className="text-white font-medium">Loading alerts...</span>
                </div>
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-16 bg-white/5 rounded-lg animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    const criticalCount = alerts.filter((a) => a.severity === 'critical' && !a.is_dismissed).length;
    const highCount = alerts.filter((a) => a.severity === 'high' && !a.is_dismissed).length;

    return (
        <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm rounded-xl border border-white/10 p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-teal-400" />
                    <h3 className="text-base font-semibold text-white">Portfolio Alerts</h3>
                    {criticalCount > 0 && (
                        <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400">
                            {criticalCount} critical
                        </span>
                    )}
                    {highCount > 0 && !criticalCount && (
                        <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400">
                            {highCount} high
                        </span>
                    )}
                </div>
                <span className="text-xs text-slate-500">{alerts.filter((a) => !a.is_dismissed).length} total</span>
            </div>

            {/* Alerts List */}
            {visibleAlerts.length === 0 ? (
                <div className="text-center py-6 text-slate-400">
                    <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No active alerts</p>
                    <p className="text-sm opacity-70">Your portfolio is looking healthy!</p>
                </div>
            ) : (
                <AnimatePresence>
                    <div className="space-y-2">
                        {visibleAlerts.map((alert, idx) => (
                            <AlertCard
                                key={alert.alert_id}
                                alert={alert}
                                index={idx}
                                onDismiss={onDismiss ? () => onDismiss(alert.alert_id) : undefined}
                                onClick={onAlertClick ? () => onAlertClick(alert) : undefined}
                            />
                        ))}
                    </div>
                </AnimatePresence>
            )}

            {/* Show more */}
            {alerts.filter((a) => !a.is_dismissed).length > maxVisible && (
                <button className="w-full mt-3 py-2 text-sm text-teal-400 hover:text-teal-300 transition-colors">
                    View all {alerts.filter((a) => !a.is_dismissed).length} alerts
                </button>
            )}
        </div>
    );
};

export default PortfolioAlertsPanel;
