/**
 * Notifications Page — Premium redesign
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

const reveal = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

const stagger = {
    visible: { transition: { staggerChildren: 0.07 } },
};

// ── Toggle ──────────────────────────────────────────────────────────────────

const Toggle: React.FC<{ enabled: boolean; onToggle: () => void }> = ({ enabled, onToggle }) => (
    <button
        onClick={onToggle}
        className={`relative w-10 h-[22px] rounded-full transition-all duration-200 flex-shrink-0 ${
            enabled
                ? 'bg-gradient-to-r from-[#C08B5C] to-[#D4A27F] shadow-[0_0_10px_rgba(192,139,92,0.3)]'
                : 'bg-white/[0.06] border border-white/[0.1] hover:border-white/[0.2]'
        }`}
    >
        <div
            className={`absolute top-[2px] left-[2px] w-[18px] h-[18px] rounded-full bg-white shadow-sm transition-transform duration-200 ${
                enabled ? 'translate-x-[18px]' : 'translate-x-0'
            }`}
        />
    </button>
);

// ── Toggle Row ──────────────────────────────────────────────────────────────

const ToggleRow: React.FC<{
    icon: React.ElementType;
    title: string;
    subtitle: string;
    enabled: boolean;
    onToggle: () => void;
}> = ({ icon: Icon, title, subtitle, enabled, onToggle }) => (
    <div className="flex items-center gap-3.5 px-4 py-3.5 group hover:bg-white/[0.02] transition-colors">
        <div className="w-9 h-9 rounded-xl bg-[#C08B5C]/[0.08] flex items-center justify-center flex-shrink-0 group-hover:bg-[#C08B5C]/[0.12] transition-colors">
            <Icon className={`w-[18px] h-[18px] transition-colors ${enabled ? 'text-[#D4A27F]' : 'text-white/35'}`} />
        </div>
        <div className="flex-1 min-w-0">
            <h4 className="text-[13px] font-medium text-white/85 group-hover:text-white transition-colors">{title}</h4>
            <p className="text-[11px] text-white/35 mt-0.5">{subtitle}</p>
        </div>
        <Toggle enabled={enabled} onToggle={onToggle} />
    </div>
);

// ── Notification type config ────────────────────────────────────────────────

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

// ── Main ────────────────────────────────────────────────────────────────────

export const NotificationsPage: React.FC<NotificationsPageProps> = ({ onBack }) => {
    const [activeTab, setActiveTab] = useState<'feed' | 'settings'>('feed');

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
            // Non-critical
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

    return (
        <div className="h-full flex flex-col bg-[#161619]">
            {/* Header */}
            <header className="flex items-center gap-4 px-8 py-5 border-b border-white/[0.06] bg-[#161619]/80 backdrop-blur-md sticky top-0 z-20">
                <button
                    onClick={onBack}
                    className="w-8 h-8 rounded-lg hover:bg-white/[0.04] border border-transparent hover:border-white/[0.08] flex items-center justify-center transition-all group -ml-2"
                >
                    <ArrowLeft className="w-4 h-4 text-white/50 group-hover:text-white transition-colors" />
                </button>
                <div className="flex-1">
                    <h1 className="text-lg font-medium text-white tracking-tight">Notifications</h1>
                    <p className="text-[11px] text-white/30 mt-0.5">Stay updated on your properties and account</p>
                </div>

                {activeTab === 'feed' && (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => fetchNotifications(false)}
                            disabled={refreshing}
                            className="w-8 h-8 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] flex items-center justify-center transition-colors border border-white/[0.06] hover:border-white/[0.1]"
                            title="Refresh"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 text-white/35 ${refreshing ? 'animate-spin' : ''}`} />
                        </button>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllRead}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all"
                                style={{
                                    background: 'linear-gradient(135deg, rgba(192,139,92,0.12) 0%, rgba(192,139,92,0.05) 100%)',
                                    border: '1px solid rgba(192,139,92,0.2)',
                                    color: '#D4A27F',
                                }}
                            >
                                <CheckCheck className="w-3.5 h-3.5" />
                                <span>Read all</span>
                            </button>
                        )}
                    </div>
                )}
            </header>

            {/* Tab switcher */}
            <div className="flex px-8 border-b border-white/[0.06] bg-[#161619]/60 backdrop-blur-sm">
                {[
                    { id: 'feed' as const, label: 'Feed', icon: Bell },
                    { id: 'settings' as const, label: 'Preferences', icon: Settings },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-3 text-[11px] font-medium transition-all relative ${
                            activeTab === tab.id ? 'text-white' : 'text-white/35 hover:text-white/60'
                        }`}
                    >
                        <tab.icon className="w-3.5 h-3.5" />
                        {tab.label}
                        {tab.id === 'feed' && unreadCount > 0 && (
                            <span className="ml-0.5 min-w-[16px] h-[16px] rounded-full bg-[#C08B5C] flex items-center justify-center text-[9px] font-bold text-[#0A0A0C] px-1 shadow-[0_0_8px_rgba(192,139,92,0.4)]">
                                {unreadCount > 99 ? '99+' : unreadCount}
                            </span>
                        )}
                        {activeTab === tab.id && (
                            <motion.div
                                layoutId="notif-tab"
                                className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full"
                                style={{ background: 'linear-gradient(90deg, #C08B5C, #D4A27F)' }}
                            />
                        )}
                    </button>
                ))}
            </div>

            {/* ── Feed Tab ── */}
            {activeTab === 'feed' && (
                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="flex items-center justify-center h-40">
                            <Loader2 className="w-5 h-5 text-[#C08B5C]/40 animate-spin" />
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 gap-3">
                            <div className="w-14 h-14 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-center">
                                <BellOff className="w-6 h-6 text-white/15" />
                            </div>
                            <p className="text-[13px] text-white/30">No notifications yet</p>
                            <p className="text-[11px] text-white/15">You'll see updates here when things happen</p>
                        </div>
                    ) : (
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={stagger}
                            className="max-w-2xl mx-auto"
                        >
                            <AnimatePresence initial={false}>
                                {notifications.map((n) => {
                                    const cfg = TYPE_CONFIG[n.type as NotificationType] ?? TYPE_CONFIG.general;
                                    const Icon = cfg.icon;

                                    return (
                                        <motion.div
                                            key={n.id}
                                            variants={reveal}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 10, height: 0 }}
                                            className={`flex items-start gap-3.5 px-8 py-4 transition-colors group border-b border-white/[0.04] ${
                                                n.is_read ? 'bg-transparent' : 'bg-[#C08B5C]/[0.02]'
                                            } hover:bg-white/[0.02]`}
                                        >
                                            <div className={`w-9 h-9 rounded-xl ${cfg.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                                                <Icon className={`w-[18px] h-[18px] ${cfg.color}`} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={`text-[9px] font-bold uppercase tracking-wider ${cfg.color} px-1.5 py-0.5 rounded-md border border-white/[0.06] bg-white/[0.02]`}>
                                                        {cfg.label}
                                                    </span>
                                                    <span className="text-[10px] text-white/25">
                                                        {formatDate(n.created_at)}
                                                    </span>
                                                    {!n.is_read && (
                                                        <div className="w-1.5 h-1.5 rounded-full bg-[#C08B5C] shadow-[0_0_6px_rgba(192,139,92,0.5)] ml-auto flex-shrink-0" />
                                                    )}
                                                </div>
                                                <h4 className={`text-[13px] font-medium mb-0.5 ${n.is_read ? 'text-white/55' : 'text-white/90'}`}>
                                                    {n.title}
                                                </h4>
                                                <p className={`text-[11px] leading-relaxed ${n.is_read ? 'text-white/25' : 'text-white/40'}`}>
                                                    {n.message}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-1">
                                                {!n.is_read && (
                                                    <button
                                                        onClick={() => handleMarkRead(n.id)}
                                                        className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/[0.06] transition-colors"
                                                        title="Mark as read"
                                                    >
                                                        <Check className="w-3.5 h-3.5 text-white/25 hover:text-white/60" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(n.id)}
                                                    className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-red-500/[0.08] transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5 text-white/25 hover:text-red-400" />
                                                </button>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </motion.div>
                    )}
                </div>
            )}

            {/* ── Preferences Tab ── */}
            {activeTab === 'settings' && (
                <div className="flex-1 overflow-y-auto">
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={stagger}
                        className="max-w-2xl mx-auto px-8 py-8 space-y-6"
                    >
                        {/* Email Notifications */}
                        <motion.div variants={reveal}>
                            <div className="flex items-center gap-2 mb-3 px-1">
                                <div className="w-5 h-5 rounded-md bg-[#C08B5C]/[0.1] flex items-center justify-center">
                                    <Mail className="w-3 h-3 text-[#D4A27F]" />
                                </div>
                                <h2 className="text-[10px] font-semibold uppercase tracking-widest text-white/25">Email Notifications</h2>
                            </div>
                            <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-sm divide-y divide-white/[0.04] overflow-hidden">
                                <ToggleRow icon={Home} title="Property Updates" subtitle="Changes to properties in your saved list" enabled={prefs.emailPropertyUpdates} onToggle={() => togglePref('emailPropertyUpdates')} />
                                <ToggleRow icon={TrendingUp} title="Market Insights" subtitle="Weekly trends and investment opportunities" enabled={prefs.emailMarketInsights} onToggle={() => togglePref('emailMarketInsights')} />
                                <ToggleRow icon={FileText} title="Report Ready" subtitle="Notified when generated reports are complete" enabled={prefs.emailReportReady} onToggle={() => togglePref('emailReportReady')} />
                                <ToggleRow icon={Info} title="Weekly Summary" subtitle="Digest of your account activity" enabled={prefs.emailWeeklySummary} onToggle={() => togglePref('emailWeeklySummary')} />
                            </div>
                        </motion.div>

                        {/* Push Notifications */}
                        <motion.div variants={reveal}>
                            <div className="flex items-center gap-2 mb-3 px-1">
                                <div className="w-5 h-5 rounded-md bg-[#C08B5C]/[0.1] flex items-center justify-center">
                                    <Bell className="w-3 h-3 text-[#D4A27F]" />
                                </div>
                                <h2 className="text-[10px] font-semibold uppercase tracking-widest text-white/25">Push Notifications</h2>
                            </div>
                            <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-sm divide-y divide-white/[0.04] overflow-hidden">
                                <ToggleRow icon={AlertCircle} title="Real-time Alerts" subtitle="Price drops and new listings" enabled={prefs.pushNewListings} onToggle={() => togglePref('pushNewListings')} />
                                <ToggleRow icon={Briefcase} title="Portfolio Updates" subtitle="Important changes to your portfolio value" enabled={prefs.pushPortfolioAlerts} onToggle={() => togglePref('pushPortfolioAlerts')} />
                                <ToggleRow icon={MessageSquare} title="Messages" subtitle="New messages and replies" enabled={prefs.inAppMessages} onToggle={() => togglePref('inAppMessages')} />
                            </div>
                        </motion.div>

                        <div className="h-4" />
                    </motion.div>
                </div>
            )}
        </div>
    );
};
