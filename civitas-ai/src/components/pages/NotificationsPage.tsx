/**
 * Notifications Page — Redesigned
 * Professional notification feed and preference management.
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
        className={`relative w-9 h-5 rounded-full transition-all duration-200 flex-shrink-0 border ${enabled
                ? 'bg-[#C08B5C] border-[#C08B5C]'
                : 'bg-white/[0.05] border-white/[0.1] hover:border-white/[0.2]'
            }`}
    >
        <div
            className={`absolute top-[1px] left-[1px] w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${enabled ? 'translate-x-4' : 'translate-x-0'
                }`}
        />
    </button>
);

const SectionHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <h2 className="text-xs font-medium font-sans text-white/40 mb-3 px-1 tracking-wide uppercase">
        {children}
    </h2>
);

const ToggleRow: React.FC<{
    icon: React.ElementType;
    title: string;
    subtitle: string;
    enabled: boolean;
    onToggle: () => void;
}> = ({ icon: Icon, title, subtitle, enabled, onToggle }) => (
    <div className="flex items-center gap-4 px-5 py-4 group hover:bg-white/[0.02] transition-colors">
        <div className={`w-8 h-8 rounded bg-white/[0.03] flex items-center justify-center flex-shrink-0 group-hover:bg-white/[0.05] transition-colors`}>
            <Icon className={`w-4 h-4 ${enabled ? 'text-[#D4A27F]' : 'text-white/40'}`} />
        </div>
        <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium font-sans text-white/90">{title}</h4>
            <p className="text-xs font-sans text-white/40 mt-0.5">{subtitle}</p>
        </div>
        <Toggle enabled={enabled} onToggle={onToggle} />
    </div>
);

// ── Notification type config ──────────────────────────────────────────────────

const TYPE_CONFIG: Record<
    NotificationType,
    { icon: React.ElementType; color: string; bg: string; label: string }
> = {
    price_change: { icon: TrendingDown, color: 'text-amber-400', bg: 'bg-amber-500/10', label: 'Price Drop' },
    market_update: { icon: TrendingUp, color: 'text-blue-400', bg: 'bg-blue-500/10', label: 'Market Update' },
    report_ready: { icon: FileText, color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Report Ready' },
    system_update: { icon: Zap, color: 'text-purple-400', bg: 'bg-purple-500/10', label: 'System Update' },
    subscription: { icon: CreditCard, color: 'text-[#D4A27F]', bg: 'bg-[#C08B5C]/10', label: 'Billing' },
    portfolio_alert: { icon: Briefcase, color: 'text-orange-400', bg: 'bg-orange-500/10', label: 'Portfolio' },
    new_listing: { icon: Home, color: 'text-cyan-400', bg: 'bg-cyan-500/10', label: 'New Listing' },
    general: { icon: Info, color: 'text-white/50', bg: 'bg-white/[0.05]', label: 'General' },
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
        <div className="h-full flex flex-col bg-[#0C0C0E]">
            {/* Header */}
            <div className="flex items-center gap-4 px-8 py-6 border-b border-white/[0.08] bg-[#0C0C0E]/80 backdrop-blur-md sticky top-0 z-20">
                <button
                    onClick={onBack}
                    className="w-8 h-8 rounded bg-transparent hover:bg-white/[0.04] border border-transparent hover:border-white/[0.08] flex items-center justify-center transition-all group -ml-2"
                >
                    <ArrowLeft className="w-4 h-4 text-white/50 group-hover:text-white transition-colors" />
                </button>
                <div className="flex-1">
                    <h1 className="text-xl font-display font-semibold text-white tracking-tight">Notifications</h1>
                </div>

                {/* Tab-specific actions */}
                {activeTab === 'feed' && (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => fetchNotifications(false)}
                            disabled={refreshing}
                            className="w-8 h-8 rounded bg-white/[0.03] hover:bg-white/[0.06] flex items-center justify-center transition-colors border border-white/[0.05]"
                            title="Refresh"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 text-white/40 ${refreshing ? 'animate-spin' : ''}`} />
                        </button>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllRead}
                                className="flex items-center gap-2 px-3 py-1.5 rounded bg-[#C08B5C]/10 text-[#D4A27F] text-xs font-medium hover:bg-[#C08B5C]/20 transition-colors border border-[#C08B5C]/20"
                            >
                                <CheckCheck className="w-3.5 h-3.5" />
                                <span>Read all</span>
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Tab switcher */}
            <div className="flex px-8 border-b border-white/[0.08]">
                <button
                    onClick={() => setActiveTab('feed')}
                    className={`flex items-center gap-2 px-4 py-3 text-xs font-medium transition-all relative ${activeTab === 'feed'
                            ? 'text-white'
                            : 'text-white/40 hover:text-white/70'
                        }`}
                >
                    <Bell className="w-3.5 h-3.5" />
                    Feed
                    {unreadCount > 0 && (
                        <span className="ml-0.5 min-w-[16px] h-[16px] rounded-full bg-[#C08B5C] flex items-center justify-center text-[9px] font-bold text-[#0C0C0E] px-1">
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                    )}
                    {activeTab === 'feed' && (
                        <motion.div layoutId="notif-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C08B5C]" />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('settings')}
                    className={`flex items-center gap-2 px-4 py-3 text-xs font-medium transition-all relative ${activeTab === 'settings'
                            ? 'text-white'
                            : 'text-white/40 hover:text-white/70'
                        }`}
                >
                    <Settings className="w-3.5 h-3.5" />
                    Preferences
                    {activeTab === 'settings' && (
                        <motion.div layoutId="notif-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C08B5C]" />
                    )}
                </button>
            </div>

            {/* ── Feed Tab ── */}
            {activeTab === 'feed' && (
                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="flex items-center justify-center h-40">
                            <Loader2 className="w-5 h-5 text-white/20 animate-spin" />
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 gap-3">
                            <div className="w-12 h-12 rounded bg-white/[0.03] flex items-center justify-center border border-white/[0.05]">
                                <BellOff className="w-5 h-5 text-white/20" />
                            </div>
                            <p className="text-sm font-sans text-white/40">No notifications yet</p>
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
                                            className={`flex items-start gap-4 px-8 py-5 transition-colors group ${n.is_read ? 'bg-transparent' : 'bg-[#C08B5C]/[0.02]'
                                                } hover:bg-white/[0.02]`}
                                        >
                                            <div className={`w-8 h-8 rounded ${cfg.bg} flex items-center justify-center flex-shrink-0 mt-0.5 ring-1 ring-inset ring-white/[0.05]`}>
                                                <Icon className={`w-4 h-4 ${cfg.color}`} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`text-[10px] font-bold uppercase tracking-wider ${cfg.color} bg-white/[0.02] px-1.5 py-0.5 rounded border border-white/[0.05]`}>
                                                            {cfg.label}
                                                        </span>
                                                        <span className="text-[10px] text-white/30 font-sans">
                                                            {formatDate(n.created_at)}
                                                        </span>
                                                    </div>
                                                    {!n.is_read && (
                                                        <div className="w-2 h-2 rounded-full bg-[#C08B5C] shadow-[0_0_8px_rgba(192,139,92,0.4)]" />
                                                    )}
                                                </div>
                                                <h4 className={`text-sm font-medium font-sans mb-1 ${n.is_read ? 'text-white/60' : 'text-white/90'}`}>
                                                    {n.title}
                                                </h4>
                                                <p className={`text-xs font-sans leading-relaxed ${n.is_read ? 'text-white/30' : 'text-white/50'}`}>
                                                    {n.message}
                                                </p>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2">
                                                {!n.is_read && (
                                                    <button
                                                        onClick={() => handleMarkRead(n.id)}
                                                        className="w-8 h-8 rounded flex items-center justify-center hover:bg-white/[0.05] transition-colors group/btn"
                                                        title="Mark as read"
                                                    >
                                                        <Check className="w-4 h-4 text-white/30 group-hover/btn:text-white/60" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(n.id)}
                                                    className="w-8 h-8 rounded flex items-center justify-center hover:bg-red-500/10 transition-colors group/btn"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4 text-white/30 group-hover/btn:text-red-400" />
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
                <div className="flex-1 overflow-y-auto px-8 py-10">
                    <div className="max-w-2xl mx-auto space-y-8">
                        {/* Email */}
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <Mail className="w-4 h-4 text-[#C08B5C]" />
                                <SectionHeader>Email Notifications</SectionHeader>
                            </div>
                            <div className="rounded bg-[#161618] border border-white/[0.08] divide-y divide-white/[0.04] overflow-hidden">
                                <ToggleRow icon={Home} title="Property Updates" subtitle="Changes to properties in your Saved list" enabled={prefs.emailPropertyUpdates} onToggle={() => togglePref('emailPropertyUpdates')} />
                                <ToggleRow icon={TrendingUp} title="Market Insights" subtitle="Weekly trends and investment opportunities" enabled={prefs.emailMarketInsights} onToggle={() => togglePref('emailMarketInsights')} />
                                <ToggleRow icon={FileText} title="Report Ready" subtitle="Get notified when generated reports are complete" enabled={prefs.emailReportReady} onToggle={() => togglePref('emailReportReady')} />
                                <ToggleRow icon={Info} title="Weekly Summary" subtitle="Digest of your account activity" enabled={prefs.emailWeeklySummary} onToggle={() => togglePref('emailWeeklySummary')} />
                            </div>
                        </div>

                        {/* Push - Unified block */}
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <Bell className="w-4 h-4 text-[#C08B5C]" />
                                <SectionHeader>Push Notifications</SectionHeader>
                            </div>
                            <div className="rounded bg-[#161618] border border-white/[0.08] divide-y divide-white/[0.04] overflow-hidden">
                                <ToggleRow icon={AlertCircle} title="Real-time Alerts" subtitle="Price drops and new listings" enabled={prefs.pushNewListings} onToggle={() => togglePref('pushNewListings')} />
                                <ToggleRow icon={Briefcase} title="Portfolio Updates" subtitle="Important changes to your portfolio value" enabled={prefs.pushPortfolioAlerts} onToggle={() => togglePref('pushPortfolioAlerts')} />
                                <ToggleRow icon={MessageSquare} title="Messages" subtitle="New messages and replies" enabled={prefs.inAppMessages} onToggle={() => togglePref('inAppMessages')} />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
