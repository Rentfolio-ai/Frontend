/**
 * Notifications Page — Unified
 *
 * Two tabs:
 *   1. Feed  — in-app notification feed (price changes, market updates, etc.)
 *   2. Settings — toggle notification preferences (email, push, in-app)
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
    ArrowLeft,
    Mail,
    Bell,
    BellOff,
    MessageSquare,
    TrendingUp,
    TrendingDown,
    FileText,
    AlertCircle,
    Check,
    CheckCheck,
    Trash2,
    Zap,
    CreditCard,
    Briefcase,
    Home,
    Info,
    Loader2,
    RefreshCw,
    Settings,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    notificationsApi,
    type UserNotification,
    type NotificationType,
} from '../../services/notificationsApi';

interface NotificationsPageProps {
    onBack: () => void;
}

// ── Shared Toggle component ───────────────────────────────────────────────────

const Toggle: React.FC<{ enabled: boolean; onToggle: () => void }> = ({ enabled, onToggle }) => (
    <button
        onClick={onToggle}
        className={`relative w-10 h-[22px] rounded-full transition-colors flex-shrink-0 ${enabled ? 'bg-[#C08B5C]' : 'bg-white/[0.12]'}`}
    >
        <div className={`absolute top-[2px] w-[18px] h-[18px] rounded-full bg-white shadow-sm transition-transform ${enabled ? 'translate-x-[22px]' : 'translate-x-[2px]'}`} />
    </button>
);

const ToggleRow: React.FC<{
    icon: React.ElementType;
    title: string;
    subtitle: string;
    enabled: boolean;
    onToggle: () => void;
}> = ({ icon: Icon, title, subtitle, enabled, onToggle }) => (
    <div className="flex items-center gap-3 px-3.5 py-2.5">
        <div className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 ${enabled ? 'bg-[#C08B5C]/10' : 'bg-white/[0.04]'}`}>
            <Icon className={`w-3.5 h-3.5 ${enabled ? 'text-[#D4A27F]' : 'text-white/30'}`} />
        </div>
        <div className="flex-1 min-w-0">
            <h4 className="text-[13px] font-medium text-white/80">{title}</h4>
            <p className="text-[11px] text-white/35 truncate">{subtitle}</p>
        </div>
        <Toggle enabled={enabled} onToggle={onToggle} />
    </div>
);

// ── Notification type config ──────────────────────────────────────────────────

const TYPE_CONFIG: Record<
    NotificationType,
    { icon: React.ElementType; color: string; bg: string; label: string }
> = {
    price_change: { icon: TrendingDown, color: 'text-amber-400', bg: 'bg-amber-500/10', label: 'Price Change' },
    market_update: { icon: TrendingUp, color: 'text-blue-400', bg: 'bg-blue-500/10', label: 'Market Update' },
    report_ready: { icon: FileText, color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Report Ready' },
    system_update: { icon: Zap, color: 'text-purple-400', bg: 'bg-purple-500/10', label: 'System Update' },
    subscription: { icon: CreditCard, color: 'text-[#D4A27F]', bg: 'bg-[#C08B5C]/10', label: 'Subscription' },
    portfolio_alert: { icon: Briefcase, color: 'text-orange-400', bg: 'bg-orange-500/10', label: 'Portfolio' },
    new_listing: { icon: Home, color: 'text-cyan-400', bg: 'bg-cyan-500/10', label: 'New Listing' },
    general: { icon: Info, color: 'text-white/50', bg: 'bg-white/[0.06]', label: 'General' },
};

// ── Main component ────────────────────────────────────────────────────────────

export const NotificationsPage: React.FC<NotificationsPageProps> = ({ onBack }) => {
    const [activeTab, setActiveTab] = useState<'feed' | 'settings'>('feed');

    // ── Feed state ────────────────────────────────────────────────────────────
    const [notifications, setNotifications] = useState<UserNotification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchNotifications = useCallback(async (showLoader = true) => {
        if (showLoader) setLoading(true);
        else setRefreshing(true);
        try {
            const data = await notificationsApi.list({ limit: 50 });
            setNotifications(data.notifications);
            setUnreadCount(data.unread_count);
        } catch {
            // Silently fail — feed is non-critical
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        if (activeTab === 'feed') fetchNotifications();
    }, [activeTab, fetchNotifications]);

    const handleMarkRead = async (id: string) => {
        await notificationsApi.markAsRead(id);
        setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
        setUnreadCount((c) => Math.max(0, c - 1));
    };

    const handleMarkAllRead = async () => {
        await notificationsApi.markAllRead();
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
        setUnreadCount(0);
    };

    const handleDelete = async (id: string) => {
        await notificationsApi.delete(id);
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    };

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - d.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        const diffHrs = Math.floor(diffMins / 60);
        if (diffHrs < 24) return `${diffHrs}h ago`;
        const diffDays = Math.floor(diffHrs / 24);
        if (diffDays < 7) return `${diffDays}d ago`;
        return d.toLocaleDateString();
    };

    // ── Preferences state ─────────────────────────────────────────────────────
    const [prefs, setPrefs] = useState({
        emailPropertyUpdates: true,
        emailMarketInsights: true,
        emailReportReady: true,
        emailWeeklySummary: false,
        emailPromotional: false,
        pushNewListings: true,
        pushPriceChanges: true,
        pushPortfolioAlerts: true,
        inAppMessages: true,
        inAppUpdates: true,
    });

    const togglePref = (key: keyof typeof prefs) => setPrefs({ ...prefs, [key]: !prefs[key] });

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <div className="h-full flex flex-col" style={{ backgroundColor: '#111114' }}>
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/[0.08]">
                <button
                    onClick={onBack}
                    className="w-8 h-8 rounded-lg bg-white/[0.05] hover:bg-white/[0.08] flex items-center justify-center transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 text-white/60" />
                </button>
                <div className="flex-1">
                    <h1 className="text-lg font-semibold text-white/90">Notifications</h1>
                    <p className="text-[11px] text-white/35">
                        {activeTab === 'feed'
                            ? unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'
                            : 'Manage how you receive updates'}
                    </p>
                </div>

                {/* Tab-specific actions */}
                {activeTab === 'feed' && (
                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={() => fetchNotifications(false)}
                            disabled={refreshing}
                            className="w-8 h-8 rounded-lg bg-white/[0.05] hover:bg-white/[0.08] flex items-center justify-center transition-colors"
                            title="Refresh"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 text-white/40 ${refreshing ? 'animate-spin' : ''}`} />
                        </button>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllRead}
                                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#C08B5C]/10 text-[#D4A27F] text-[10px] font-medium hover:bg-[#C08B5C]/20 transition-colors"
                            >
                                <CheckCheck className="w-3 h-3" />
                                Read all
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Tab switcher */}
            <div className="flex px-5 pt-2 pb-0 gap-1">
                <button
                    onClick={() => setActiveTab('feed')}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-t-lg text-[12px] font-medium transition-colors ${
                        activeTab === 'feed'
                            ? 'bg-white/[0.06] text-white/80 border-b-2 border-[#C08B5C]'
                            : 'text-white/40 hover:text-white/60'
                    }`}
                >
                    <Bell className="w-3.5 h-3.5" />
                    Feed
                    {unreadCount > 0 && (
                        <span className="ml-0.5 min-w-[16px] h-[16px] rounded-full bg-[#C08B5C] flex items-center justify-center text-[9px] font-bold text-white px-1">
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('settings')}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-t-lg text-[12px] font-medium transition-colors ${
                        activeTab === 'settings'
                            ? 'bg-white/[0.06] text-white/80 border-b-2 border-[#C08B5C]'
                            : 'text-white/40 hover:text-white/60'
                    }`}
                >
                    <Settings className="w-3.5 h-3.5" />
                    Preferences
                </button>
            </div>

            {/* ── Feed Tab ── */}
            {activeTab === 'feed' && (
                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="flex items-center justify-center h-40">
                            <Loader2 className="w-5 h-5 text-white/30 animate-spin" />
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 gap-2">
                            <div className="w-12 h-12 rounded-xl bg-white/[0.04] flex items-center justify-center">
                                <BellOff className="w-5 h-5 text-white/20" />
                            </div>
                            <p className="text-[12px] text-white/30">No notifications yet</p>
                            <p className="text-[10px] text-white/20 max-w-[200px] text-center">
                                You'll see price changes, market updates, and system alerts here.
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-white/[0.04]">
                            <AnimatePresence initial={false}>
                                {notifications.map((n) => {
                                    const cfg = TYPE_CONFIG[n.type as NotificationType] ?? TYPE_CONFIG.general;
                                    const Icon = cfg.icon;

                                    return (
                                        <motion.div
                                            key={n.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 10, height: 0 }}
                                            className={`flex items-start gap-3 px-5 py-3 transition-colors group ${
                                                n.is_read ? 'bg-transparent' : 'bg-[#C08B5C]/[0.03]'
                                            } hover:bg-white/[0.03]`}
                                        >
                                            <div className={`w-8 h-8 rounded-lg ${cfg.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                                                <Icon className={`w-4 h-4 ${cfg.color}`} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <h4 className={`text-[12px] font-medium truncate ${n.is_read ? 'text-white/60' : 'text-white/85'}`}>
                                                        {n.title}
                                                    </h4>
                                                    {!n.is_read && (
                                                        <div className="w-1.5 h-1.5 rounded-full bg-[#D4A27F] flex-shrink-0" />
                                                    )}
                                                </div>
                                                <p className={`text-[11px] leading-relaxed ${n.is_read ? 'text-white/30' : 'text-white/45'}`}>
                                                    {n.message}
                                                </p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className={`text-[9px] font-medium uppercase tracking-wider ${cfg.color}`}>
                                                        {cfg.label}
                                                    </span>
                                                    <span className="text-[9px] text-white/20">
                                                        {formatDate(n.created_at)}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                                {!n.is_read && (
                                                    <button
                                                        onClick={() => handleMarkRead(n.id)}
                                                        className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-white/[0.06] transition-colors"
                                                        title="Mark as read"
                                                    >
                                                        <Check className="w-3 h-3 text-white/40" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(n.id)}
                                                    className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-red-500/10 transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-3 h-3 text-white/30 hover:text-red-400" />
                                                </button>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            )}

            {/* ── Settings Tab ── */}
            {activeTab === 'settings' && (
                <div className="flex-1 overflow-y-auto px-5 py-4">
                    <div className="max-w-2xl mx-auto space-y-5">
                        {/* Email */}
                        <div>
                            <div className="flex items-center gap-2 mb-2 px-1">
                                <Mail className="w-3.5 h-3.5 text-[#D4A27F]" />
                                <h2 className="text-[10px] font-semibold uppercase tracking-widest text-white/30">Email</h2>
                            </div>
                            <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] divide-y divide-white/[0.04] overflow-hidden">
                                <ToggleRow icon={TrendingUp} title="Property Updates" subtitle="Changes to saved search properties" enabled={prefs.emailPropertyUpdates} onToggle={() => togglePref('emailPropertyUpdates')} />
                                <ToggleRow icon={AlertCircle} title="Market Insights" subtitle="Trends and investment opportunities" enabled={prefs.emailMarketInsights} onToggle={() => togglePref('emailMarketInsights')} />
                                <ToggleRow icon={FileText} title="Report Ready" subtitle="When generated reports are complete" enabled={prefs.emailReportReady} onToggle={() => togglePref('emailReportReady')} />
                                <ToggleRow icon={Mail} title="Weekly Summary" subtitle="Weekly activity and insights digest" enabled={prefs.emailWeeklySummary} onToggle={() => togglePref('emailWeeklySummary')} />
                                <ToggleRow icon={MessageSquare} title="Promotional" subtitle="News, tips, and special offers" enabled={prefs.emailPromotional} onToggle={() => togglePref('emailPromotional')} />
                            </div>
                        </div>

                        {/* Push */}
                        <div>
                            <div className="flex items-center gap-2 mb-2 px-1">
                                <Bell className="w-3.5 h-3.5 text-[#D4A27F]" />
                                <h2 className="text-[10px] font-semibold uppercase tracking-widest text-white/30">Push</h2>
                            </div>
                            <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] divide-y divide-white/[0.04] overflow-hidden">
                                <ToggleRow icon={TrendingUp} title="New Listings" subtitle="Properties matching your criteria" enabled={prefs.pushNewListings} onToggle={() => togglePref('pushNewListings')} />
                                <ToggleRow icon={AlertCircle} title="Price Changes" subtitle="Saved properties price updates" enabled={prefs.pushPriceChanges} onToggle={() => togglePref('pushPriceChanges')} />
                                <ToggleRow icon={FileText} title="Portfolio Alerts" subtitle="Important portfolio updates" enabled={prefs.pushPortfolioAlerts} onToggle={() => togglePref('pushPortfolioAlerts')} />
                            </div>
                        </div>

                        {/* In-App */}
                        <div>
                            <div className="flex items-center gap-2 mb-2 px-1">
                                <MessageSquare className="w-3.5 h-3.5 text-[#D4A27F]" />
                                <h2 className="text-[10px] font-semibold uppercase tracking-widest text-white/30">In-App</h2>
                            </div>
                            <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] divide-y divide-white/[0.04] overflow-hidden">
                                <ToggleRow icon={MessageSquare} title="Messages" subtitle="New messages and replies" enabled={prefs.inAppMessages} onToggle={() => togglePref('inAppMessages')} />
                                <ToggleRow icon={AlertCircle} title="System Updates" subtitle="New features and improvements" enabled={prefs.inAppUpdates} onToggle={() => togglePref('inAppUpdates')} />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
