/**
 * Privacy & Security Page — Premium redesign
 *
 * Covers data privacy controls, security settings, active sessions,
 * and legal/policy links.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
    ArrowLeft,
    Shield,
    Eye,
    EyeOff,
    Lock,
    KeyRound,
    Trash2,
    Download,
    ExternalLink,
    ChevronRight,
    ChevronDown,
    Monitor,
    Smartphone,
    LogOut,
    AlertTriangle,
    Info,
    FileText,
    Cookie,
    BarChart3,
    UserX,
    ShieldCheck,
    History,
    Loader2,
    CheckCircle2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    privacyService,
    securityService,
    type SessionInfo as SessionData,
} from '../../services/privacySecurityService';
import { useAuth } from '../../contexts/AuthContext';

interface PrivacySecurityPageProps {
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
                : 'bg-black/[0.05] border border-black/[0.08] hover:border-black/[0.12]'
        }`}
    >
        <div
            className={`absolute top-[2px] left-[2px] w-[18px] h-[18px] rounded-full bg-white shadow-sm transition-transform duration-200 ${
                enabled ? 'translate-x-[18px]' : 'translate-x-0'
            }`}
        />
    </button>
);

// ── Row Components ──────────────────────────────────────────────────────────

interface ToggleRowProps {
    icon: React.ElementType;
    title: string;
    subtitle: string;
    enabled: boolean;
    onToggle: () => void;
}

const ToggleRow: React.FC<ToggleRowProps> = ({ icon: Icon, title, subtitle, enabled, onToggle }) => (
    <div className="flex items-center gap-3.5 px-4 py-3.5 group hover:bg-black/[0.02] transition-colors">
        <div className="w-9 h-9 rounded-xl bg-[#C08B5C]/[0.08] flex items-center justify-center flex-shrink-0 group-hover:bg-[#C08B5C]/[0.12] transition-colors">
            <Icon className="w-[18px] h-[18px] text-[#D4A27F] group-hover:text-[#C08B5C] transition-colors" />
        </div>
        <div className="flex-1 min-w-0">
            <h3 className="text-[13px] font-medium text-foreground/85 group-hover:text-foreground transition-colors">{title}</h3>
            <p className="text-[11px] text-muted-foreground/60 mt-0.5">{subtitle}</p>
        </div>
        <Toggle enabled={enabled} onToggle={onToggle} />
    </div>
);

interface ActionRowProps {
    icon: React.ElementType;
    title: string;
    subtitle: string;
    onClick?: () => void;
    danger?: boolean;
    external?: boolean;
}

const ActionRow: React.FC<ActionRowProps> = ({ icon: Icon, title, subtitle, onClick, danger, external }) => (
    <button
        onClick={onClick}
        className="w-full flex items-center gap-3.5 px-4 py-3.5 transition-colors hover:bg-black/[0.02] group text-left"
    >
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
            danger
                ? 'bg-red-500/[0.08] group-hover:bg-red-500/[0.14]'
                : 'bg-[#C08B5C]/[0.08] group-hover:bg-[#C08B5C]/[0.12]'
        }`}>
            <Icon className={`w-[18px] h-[18px] transition-colors ${
                danger ? 'text-red-400' : 'text-[#D4A27F] group-hover:text-[#C08B5C]'
            }`} />
        </div>
        <div className="flex-1 min-w-0">
            <h3 className={`text-[13px] font-medium ${danger ? 'text-red-400' : 'text-foreground/85 group-hover:text-foreground'} transition-colors`}>{title}</h3>
            <p className="text-[11px] text-muted-foreground/60 mt-0.5">{subtitle}</p>
        </div>
        {external ? (
            <ExternalLink className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-muted-foreground/60 transition-colors flex-shrink-0" />
        ) : (
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-muted-foreground/60 transition-colors flex-shrink-0" />
        )}
    </button>
);

// ── Session Row ─────────────────────────────────────────────────────────────

interface SessionRowProps {
    device: string;
    location: string;
    lastActive: string;
    isCurrent: boolean;
    deviceType: 'desktop' | 'mobile';
    onRevoke?: () => void;
}

const SessionRow: React.FC<SessionRowProps> = ({ device, location, lastActive, isCurrent, deviceType, onRevoke }) => (
    <div className="flex items-center gap-3.5 px-4 py-3.5 group hover:bg-black/[0.02] transition-colors">
        <div className="w-9 h-9 rounded-xl bg-[#C08B5C]/[0.08] flex items-center justify-center flex-shrink-0">
            {deviceType === 'desktop' ? (
                <Monitor className="w-[18px] h-[18px] text-[#D4A27F]" />
            ) : (
                <Smartphone className="w-[18px] h-[18px] text-[#D4A27F]" />
            )}
        </div>
        <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
                <h3 className="text-[13px] font-medium text-foreground/85">{device}</h3>
                {isCurrent && (
                    <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Current
                    </span>
                )}
            </div>
            <p className="text-[11px] text-muted-foreground/60 mt-0.5">{location} · {lastActive}</p>
        </div>
        {!isCurrent && onRevoke && (
            <button
                onClick={onRevoke}
                className="px-3 py-1.5 rounded-lg text-[11px] font-medium text-red-400/60 hover:text-red-400 hover:bg-red-500/[0.08] transition-colors border border-transparent hover:border-red-500/15"
            >
                Revoke
            </button>
        )}
    </div>
);

// ── Expandable Section ──────────────────────────────────────────────────────

const ExpandableSection: React.FC<{
    title: string;
    icon: React.ElementType;
    children: React.ReactNode;
    defaultOpen?: boolean;
}> = ({ title, icon: Icon, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center gap-3.5 px-4 py-3.5 hover:bg-black/[0.02] transition-colors group"
            >
                <div className="w-9 h-9 rounded-xl bg-[#C08B5C]/[0.08] flex items-center justify-center flex-shrink-0 group-hover:bg-[#C08B5C]/[0.12] transition-colors">
                    <Icon className="w-[18px] h-[18px] text-[#D4A27F] group-hover:text-[#C08B5C] transition-colors" />
                </div>
                <span className="flex-1 text-left text-[13px] font-medium text-foreground/85 group-hover:text-foreground transition-colors">{title}</span>
                <ChevronDown
                    className={`w-3.5 h-3.5 text-muted-foreground/40 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="px-4 pb-4 pt-1 border-t border-black/[0.04]">{children}</div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// ── Confirm Dialog ──────────────────────────────────────────────────────────

const ConfirmDialog: React.FC<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel: string;
    onConfirm: () => void;
    onCancel: () => void;
    danger?: boolean;
}> = ({ isOpen, title, message, confirmLabel, onConfirm, onCancel, danger }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onCancel}
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="relative w-full max-w-sm rounded-2xl border border-black/[0.08] p-6 shadow-2xl bg-background"
            >
                <div
                    className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl"
                    style={{
                        background: danger
                            ? 'linear-gradient(90deg, #EF4444 0%, #F87171 50%, #EF4444 100%)'
                            : 'linear-gradient(90deg, #C08B5C 0%, #D4A27F 50%, #C08B5C 100%)',
                    }}
                />
                <div className="flex items-start gap-4 mb-6">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        danger ? 'bg-red-500/10' : 'bg-[#C08B5C]/10'
                    }`}>
                        <AlertTriangle className={`w-5 h-5 ${danger ? 'text-red-400' : 'text-[#C08B5C]'}`} />
                    </div>
                    <div>
                        <h3 className="text-base font-semibold text-foreground mb-1">{title}</h3>
                        <p className="text-[13px] text-muted-foreground/70 leading-relaxed">{message}</p>
                    </div>
                </div>
                <div className="flex gap-3 justify-end">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 rounded-lg text-[12px] font-medium text-muted-foreground hover:bg-black/[0.05] hover:text-foreground transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`px-4 py-2 rounded-lg text-[12px] font-semibold text-white transition-all ${
                            danger
                                ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/20'
                                : 'bg-[#C08B5C] hover:bg-[#A8734A] shadow-lg shadow-[#C08B5C]/20'
                        }`}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════════

export const PrivacySecurityPage: React.FC<PrivacySecurityPageProps> = ({ onBack }) => {
    const { signOut } = useAuth();

    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const [chatHistoryEnabled, setChatHistoryEnabled] = useState(true);
    const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
    const [modelTrainingOptOut, setModelTrainingOptOut] = useState(false);
    const [showOnlineStatus, setShowOnlineStatus] = useState(true);

    const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
    const [sessions, setSessions] = useState<SessionData[]>([]);

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showClearHistoryConfirm, setShowClearHistoryConfirm] = useState(false);

    const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    }, []);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [prefs, sessionsData] = await Promise.allSettled([
                    privacyService.getPreferences(),
                    securityService.getSessions(),
                ]);

                if (prefs.status === 'fulfilled') {
                    setChatHistoryEnabled(prefs.value.chat_history_enabled);
                    setAnalyticsEnabled(prefs.value.analytics_enabled);
                    setModelTrainingOptOut(prefs.value.model_training_opt_out);
                    setShowOnlineStatus(prefs.value.show_online_status);
                }

                if (sessionsData.status === 'fulfilled') {
                    setSessions(sessionsData.value);
                }
            } catch (err) {
                console.warn('Failed to load privacy settings:', err);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    const handleToggle = useCallback(async (
        key: 'chat_history_enabled' | 'analytics_enabled' | 'model_training_opt_out' | 'show_online_status',
        currentValue: boolean,
        setter: React.Dispatch<React.SetStateAction<boolean>>,
    ) => {
        const newValue = !currentValue;
        setter(newValue);
        try {
            await privacyService.updatePreferences({ [key]: newValue });
        } catch {
            setter(currentValue);
            showToast('Failed to update setting', 'error');
        }
    }, [showToast]);

    const handleToggle2FA = useCallback(async () => {
        const newValue = !twoFactorEnabled;
        setTwoFactorEnabled(newValue);
        try {
            await securityService.updateTwoFactor(newValue);
            showToast(`Two-factor authentication ${newValue ? 'enabled' : 'disabled'}`);
        } catch {
            setTwoFactorEnabled(!newValue);
            showToast('Failed to update 2FA', 'error');
        }
    }, [twoFactorEnabled, showToast]);

    const handlePasswordReset = useCallback(async () => {
        setActionLoading('password');
        try {
            const result = await securityService.requestPasswordReset();
            showToast(result.message);
        } catch {
            showToast('Failed to send password reset email', 'error');
        } finally {
            setActionLoading(null);
        }
    }, [showToast]);

    const handleExportData = useCallback(async () => {
        setActionLoading('export');
        try {
            const result = await privacyService.exportData();
            if (result.data) {
                const blob = new Blob([JSON.stringify(result.data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `vasthu-data-export-${new Date().toISOString().slice(0, 10)}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                showToast('Data exported successfully');
            } else {
                showToast(result.message);
            }
        } catch {
            showToast('Failed to export data', 'error');
        } finally {
            setActionLoading(null);
        }
    }, [showToast]);

    const handleClearAllHistory = () => setShowClearHistoryConfirm(true);

    const confirmClearHistory = useCallback(async () => {
        setShowClearHistoryConfirm(false);
        setActionLoading('clearHistory');
        try {
            const result = await privacyService.clearChatHistory();
            showToast(result.message);
        } catch {
            showToast('Failed to clear chat history', 'error');
        } finally {
            setActionLoading(null);
        }
    }, [showToast]);

    const handleDeleteAccount = () => setShowDeleteConfirm(true);

    const confirmDeleteAccount = useCallback(async () => {
        setShowDeleteConfirm(false);
        setActionLoading('deleteAccount');
        try {
            const result = await privacyService.deleteAccount();
            showToast(result.message);
            await signOut();
        } catch {
            showToast('Failed to request account deletion', 'error');
        } finally {
            setActionLoading(null);
        }
    }, [showToast, signOut]);

    const handleRevokeSession = useCallback(async (sessionId: string) => {
        try {
            await securityService.revokeSession(sessionId);
            setSessions(prev => prev.filter(s => s.id !== sessionId));
            showToast('Session revoked');
        } catch {
            showToast('Failed to revoke session', 'error');
        }
    }, [showToast]);

    const handleRevokeAllOther = useCallback(async () => {
        try {
            await securityService.revokeAllOtherSessions();
            setSessions(prev => prev.filter(s => s.is_current));
            showToast('All other sessions signed out');
        } catch {
            showToast('Failed to sign out sessions', 'error');
        }
    }, [showToast]);

    return (
        <div className="h-full flex flex-col bg-background">
            {/* Toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border backdrop-blur-xl ${
                            toast.type === 'success'
                                ? 'bg-background/90 border-emerald-500/20 text-emerald-400'
                                : 'bg-background/90 border-red-500/20 text-red-400'
                        }`}
                    >
                        {toast.type === 'success' ? (
                            <CheckCircle2 className="w-4 h-4" />
                        ) : (
                            <AlertTriangle className="w-4 h-4" />
                        )}
                        <span className="text-[13px] font-medium">{toast.message}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <header className="flex items-center gap-4 px-8 py-5 border-b border-black/[0.06] bg-background/80 backdrop-blur-md sticky top-0 z-20">
                <button
                    onClick={onBack}
                    className="w-8 h-8 rounded-lg hover:bg-black/[0.03] border border-transparent hover:border-black/[0.08] flex items-center justify-center transition-all group -ml-2"
                >
                    <ArrowLeft className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </button>
                <div className="flex-1">
                    <h1 className="text-lg font-medium text-foreground tracking-tight">Privacy & Security</h1>
                    <p className="text-[11px] text-muted-foreground/50 mt-0.5">Control your data, sessions, and account safety</p>
                </div>
                {loading && <Loader2 className="w-4 h-4 text-[#C08B5C]/40 animate-spin" />}
            </header>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={stagger}
                    className="max-w-2xl mx-auto px-8 py-8 space-y-6"
                >
                    {/* Trust Banner */}
                    <motion.div
                        variants={reveal}
                        className="rounded-2xl border border-[#C08B5C]/10 bg-gradient-to-br from-[#C08B5C]/[0.04] to-transparent backdrop-blur-sm p-5 flex items-start gap-4"
                    >
                        <div className="w-10 h-10 rounded-xl bg-[#C08B5C]/[0.1] flex items-center justify-center flex-shrink-0">
                            <ShieldCheck className="w-5 h-5 text-[#D4A27F]" />
                        </div>
                        <div>
                            <h3 className="text-[13px] font-semibold text-foreground mb-1">Your data is protected</h3>
                            <p className="text-[12px] text-muted-foreground/70 leading-relaxed">
                                Encrypted in transit and at rest. We never sell your personal data to third parties. You maintain full control over your data retention.
                            </p>
                        </div>
                    </motion.div>

                    {/* Data Privacy Controls */}
                    <motion.div variants={reveal}>
                        <h2 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 mb-3 px-1">Data Privacy</h2>
                        <div className="rounded-2xl bg-black/[0.02] border border-black/[0.06] backdrop-blur-sm divide-y divide-black/[0.04] overflow-hidden">
                            <ToggleRow
                                icon={History}
                                title="Chat History"
                                subtitle="Save conversations for future reference"
                                enabled={chatHistoryEnabled}
                                onToggle={() => handleToggle('chat_history_enabled', chatHistoryEnabled, setChatHistoryEnabled)}
                            />
                            <ToggleRow
                                icon={BarChart3}
                                title="Usage Analytics"
                                subtitle="Share anonymized data to help us improve"
                                enabled={analyticsEnabled}
                                onToggle={() => handleToggle('analytics_enabled', analyticsEnabled, setAnalyticsEnabled)}
                            />
                            <ToggleRow
                                icon={Eye}
                                title="Model Training Opt-Out"
                                subtitle="Prevent your data from training AI models"
                                enabled={modelTrainingOptOut}
                                onToggle={() => handleToggle('model_training_opt_out', modelTrainingOptOut, setModelTrainingOptOut)}
                            />
                            <ToggleRow
                                icon={showOnlineStatus ? Eye : EyeOff}
                                title="Online Status"
                                subtitle="Let team members see when you're active"
                                enabled={showOnlineStatus}
                                onToggle={() => handleToggle('show_online_status', showOnlineStatus, setShowOnlineStatus)}
                            />
                        </div>
                    </motion.div>

                    {/* Account Security */}
                    <motion.div variants={reveal}>
                        <h2 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 mb-3 px-1">Account Security</h2>
                        <div className="rounded-2xl bg-black/[0.02] border border-black/[0.06] backdrop-blur-sm divide-y divide-black/[0.04] overflow-hidden">
                            <ActionRow
                                icon={Lock}
                                title={actionLoading === 'password' ? 'Sending reset email…' : 'Change Password'}
                                subtitle="We'll send a password reset link to your email"
                                onClick={handlePasswordReset}
                            />
                            <ToggleRow
                                icon={KeyRound}
                                title="Two-Factor Authentication"
                                subtitle={twoFactorEnabled ? 'Active — your account is secured' : 'Add an extra layer of protection'}
                                enabled={twoFactorEnabled}
                                onToggle={handleToggle2FA}
                            />
                        </div>
                    </motion.div>

                    {/* Active Sessions */}
                    <motion.div variants={reveal}>
                        <h2 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 mb-3 px-1">Active Sessions</h2>
                        <div className="rounded-2xl bg-black/[0.02] border border-black/[0.06] backdrop-blur-sm divide-y divide-black/[0.04] overflow-hidden">
                            {sessions.length === 0 && !loading && (
                                <div className="px-4 py-8 text-center">
                                    <Monitor className="w-5 h-5 text-muted-foreground/40 mx-auto mb-2" />
                                    <p className="text-[12px] text-muted-foreground/50">No active sessions found</p>
                                </div>
                            )}
                            {sessions.map((session) => (
                                <SessionRow
                                    key={session.id}
                                    device={session.device_info}
                                    location={session.location || 'Unknown location'}
                                    lastActive={session.is_current ? 'Now' : (session.last_active_at ? new Date(session.last_active_at).toLocaleDateString() : 'Unknown')}
                                    isCurrent={session.is_current}
                                    deviceType={session.device_type as 'desktop' | 'mobile'}
                                    onRevoke={session.is_current ? undefined : () => handleRevokeSession(session.id)}
                                />
                            ))}
                            {sessions.length > 1 && (
                                <button
                                    onClick={handleRevokeAllOther}
                                    className="w-full flex items-center gap-3.5 px-4 py-3.5 hover:bg-black/[0.02] transition-colors group"
                                >
                                    <div className="w-9 h-9 rounded-xl bg-red-500/[0.08] flex items-center justify-center flex-shrink-0 group-hover:bg-red-500/[0.14] transition-colors">
                                        <LogOut className="w-[18px] h-[18px] text-red-400" />
                                    </div>
                                    <span className="text-[13px] font-medium text-red-400">Sign out all other sessions</span>
                                </button>
                            )}
                        </div>
                    </motion.div>

                    {/* Data & Legal */}
                    <motion.div variants={reveal}>
                        <h2 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 mb-3 px-1">Data & Legal</h2>
                        <div className="rounded-2xl bg-black/[0.02] border border-black/[0.06] backdrop-blur-sm divide-y divide-black/[0.04] overflow-hidden">
                            <ActionRow
                                icon={Download}
                                title={actionLoading === 'export' ? 'Preparing export…' : 'Export My Data'}
                                subtitle="Download a copy of all your data (JSON)"
                                onClick={handleExportData}
                            />
                            <ExpandableSection title="How We Handle Data" icon={Info}>
                                <div className="space-y-4 py-2">
                                    <div className="flex items-start gap-3">
                                        <div className="w-7 h-7 rounded-lg bg-[#C08B5C]/[0.06] flex items-center justify-center flex-shrink-0">
                                            <Shield className="w-3.5 h-3.5 text-[#D4A27F]/60" />
                                        </div>
                                        <p className="text-[12px] text-muted-foreground/70 leading-relaxed">
                                            <strong className="text-foreground/70 font-medium">Encryption:</strong> All data is encrypted using AES-256 at rest and TLS 1.3 in transit.
                                        </p>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-7 h-7 rounded-lg bg-[#C08B5C]/[0.06] flex items-center justify-center flex-shrink-0">
                                            <Lock className="w-3.5 h-3.5 text-[#D4A27F]/60" />
                                        </div>
                                        <p className="text-[12px] text-muted-foreground/70 leading-relaxed">
                                            <strong className="text-foreground/70 font-medium">Access:</strong> Only you have access to your private data keys. Support cannot view decrypted content.
                                        </p>
                                    </div>
                                </div>
                            </ExpandableSection>
                            <ActionRow
                                icon={FileText}
                                title="Privacy Policy"
                                subtitle="Read our full privacy statement"
                                onClick={() => window.open('/privacy-policy', '_blank')}
                                external
                            />
                            <ActionRow
                                icon={FileText}
                                title="Terms of Service"
                                subtitle="Read our terms of service"
                                onClick={() => window.open('/terms-of-service', '_blank')}
                                external
                            />
                            <ActionRow
                                icon={Cookie}
                                title="Cookie Policy"
                                subtitle="Read our cookie policy"
                                onClick={() => window.open('/cookie-policy', '_blank')}
                                external
                            />
                        </div>
                    </motion.div>

                    {/* Danger Zone */}
                    <motion.div variants={reveal}>
                        <h2 className="text-[10px] font-semibold uppercase tracking-widest text-red-400/30 mb-3 px-1">Danger Zone</h2>
                        <div className="rounded-2xl bg-red-500/[0.02] border border-red-500/[0.08] divide-y divide-red-500/[0.06] overflow-hidden">
                            <ActionRow
                                icon={Trash2}
                                title={actionLoading === 'clearHistory' ? 'Clearing…' : 'Clear Chat History'}
                                subtitle="Permanently delete all conversation history"
                                onClick={handleClearAllHistory}
                                danger
                            />
                            <ActionRow
                                icon={UserX}
                                title="Delete Account"
                                subtitle="Permanently delete your account and all data"
                                onClick={handleDeleteAccount}
                                danger
                            />
                        </div>
                    </motion.div>

                    <div className="h-4" />
                </motion.div>
            </div>

            {/* Confirm Dialogs */}
            <ConfirmDialog
                isOpen={showDeleteConfirm}
                title="Delete Account?"
                message="This action is permanent and cannot be undone. All your data, conversations, reports, and preferences will be permanently deleted."
                confirmLabel="Delete Account"
                onConfirm={confirmDeleteAccount}
                onCancel={() => setShowDeleteConfirm(false)}
                danger
            />
            <ConfirmDialog
                isOpen={showClearHistoryConfirm}
                title="Clear Chat History?"
                message="This will permanently delete all your saved conversations. This action cannot be undone."
                confirmLabel="Clear History"
                onConfirm={confirmClearHistory}
                onCancel={() => setShowClearHistoryConfirm(false)}
                danger
            />
        </div>
    );
};
