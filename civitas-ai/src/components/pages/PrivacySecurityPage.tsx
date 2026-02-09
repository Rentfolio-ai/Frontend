/**
 * Privacy & Security Page
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

// ── Shared Toggle ────────────────────────────────────────────────────────────

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

// ── Section Header ───────────────────────────────────────────────────────────

const SectionHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <h2 className="text-xs font-medium font-sans text-white/40 mb-3 px-1 tracking-wide uppercase">
        {children}
    </h2>
);

// ── Info Banner ──────────────────────────────────────────────────────────────

const InfoBanner: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="flex items-start gap-3 p-4 rounded bg-[#161618] border border-white/[0.08]">
        <ShieldCheck className="w-4 h-4 text-white/60 flex-shrink-0 mt-0.5" />
        <p className="text-xs font-sans text-white/50 leading-relaxed">{children}</p>
    </div>
);

// ── Row Components ───────────────────────────────────────────────────────────

interface ToggleRowProps {
    icon: React.ElementType;
    title: string;
    subtitle: string;
    enabled: boolean;
    onToggle: () => void;
}

const ToggleRow: React.FC<ToggleRowProps> = ({ icon: Icon, title, subtitle, enabled, onToggle }) => (
    <div className="flex items-center gap-4 px-5 py-4 group hover:bg-white/[0.02] transition-colors">
        <div className="w-8 h-8 rounded bg-white/[0.03] flex items-center justify-center flex-shrink-0 group-hover:bg-white/[0.05] transition-colors">
            <Icon className="w-4 h-4 text-white/50 group-hover:text-white/70" />
        </div>
        <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium font-sans text-white/90">{title}</h3>
            <p className="text-xs font-sans text-white/40 mt-0.5">{subtitle}</p>
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
        className="w-full flex items-center gap-4 px-5 py-4 transition-colors hover:bg-white/[0.02] group text-left"
    >
        <div className={`w-8 h-8 rounded flex items-center justify-center flex-shrink-0 transition-colors ${danger ? 'bg-red-500/10 group-hover:bg-red-500/20' : 'bg-white/[0.03] group-hover:bg-white/[0.05]'
            }`}>
            <Icon className={`w-4 h-4 ${danger ? 'text-red-400' : 'text-white/50 group-hover:text-white/70'}`} />
        </div>
        <div className="flex-1 min-w-0">
            <h3 className={`text-sm font-medium font-sans ${danger ? 'text-red-400' : 'text-white/90'}`}>{title}</h3>
            <p className="text-xs font-sans text-white/40 mt-0.5">{subtitle}</p>
        </div>
        {external ? (
            <ExternalLink className="w-3.5 h-3.5 text-white/20 group-hover:text-white/40 transition-colors flex-shrink-0" />
        ) : (
            <ChevronRight className="w-3.5 h-3.5 text-white/20 group-hover:text-white/40 transition-colors flex-shrink-0" />
        )}
    </button>
);

// ── Session Row ──────────────────────────────────────────────────────────────

interface SessionRowProps {
    device: string;
    location: string;
    lastActive: string;
    isCurrent: boolean;
    deviceType: 'desktop' | 'mobile';
    onRevoke?: () => void;
}

const SessionRow: React.FC<SessionRowProps> = ({ device, location, lastActive, isCurrent, deviceType, onRevoke }) => (
    <div className="flex items-center gap-4 px-5 py-4 group hover:bg-white/[0.02] transition-colors">
        <div className="w-8 h-8 rounded bg-white/[0.03] flex items-center justify-center flex-shrink-0 group-hover:bg-white/[0.05]">
            {deviceType === 'desktop' ? (
                <Monitor className="w-4 h-4 text-white/40" />
            ) : (
                <Smartphone className="w-4 h-4 text-white/40" />
            )}
        </div>
        <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
                <h3 className="text-sm font-medium font-sans text-white/90">{device}</h3>
                {isCurrent && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Current
                    </span>
                )}
            </div>
            <p className="text-xs font-sans text-white/40 mt-0.5">{location} • {lastActive}</p>
        </div>
        {!isCurrent && onRevoke && (
            <button
                onClick={onRevoke}
                className="px-3 py-1.5 rounded text-xs font-medium text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            >
                Revoke
            </button>
        )}
    </div>
);

// ── Expandable Section ───────────────────────────────────────────────────────

const ExpandableSection: React.FC<{
    title: string;
    icon: React.ElementType;
    children: React.ReactNode;
    defaultOpen?: boolean;
}> = ({ title, icon: Icon, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="rounded bg-[#161618] border border-white/[0.08] overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors group"
            >
                <div className="w-8 h-8 rounded bg-white/[0.03] flex items-center justify-center flex-shrink-0 group-hover:bg-white/[0.05]">
                    <Icon className="w-4 h-4 text-white/50 group-hover:text-white/70" />
                </div>
                <span className="flex-1 text-left text-sm font-medium font-sans text-white/90">{title}</span>
                <ChevronDown
                    className={`w-3.5 h-3.5 text-white/25 transition-transform ${isOpen ? 'rotate-180' : ''}`}
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
                        <div className="px-5 pb-5 pt-1 border-t border-white/[0.04]">{children}</div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// ── Confirm Dialog ───────────────────────────────────────────────────────────

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
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative w-full max-w-sm rounded-xl border border-white/[0.08] p-6 shadow-2xl bg-[#161618]"
            >
                <div className="flex items-start gap-4 mb-6">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${danger ? 'bg-red-500/10' : 'bg-[#C08B5C]/10'
                        }`}>
                        <AlertTriangle className={`w-5 h-5 ${danger ? 'text-red-400' : 'text-[#C08B5C]'}`} />
                    </div>
                    <div>
                        <h3 className="text-base font-semibold font-sans text-white mb-1">{title}</h3>
                        <p className="text-sm font-sans text-white/50 leading-relaxed">{message}</p>
                    </div>
                </div>
                <div className="flex gap-3 justify-end">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 rounded text-xs font-medium text-white/50 hover:bg-white/[0.06] hover:text-white transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`px-4 py-2 rounded text-xs font-semibold text-white transition-all shadow-sm ${danger
                            ? 'bg-red-500 hover:bg-red-600 border border-red-400/20'
                            : 'bg-[#C08B5C] hover:bg-[#A8734A] border border-[#C08B5C]/20'
                            }`}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

// ══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════════

export const PrivacySecurityPage: React.FC<PrivacySecurityPageProps> = ({ onBack }) => {
    const { signOut } = useAuth();

    // ── Loading / feedback ───────────────────────────────────────────────────
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    // ── Privacy toggles ──────────────────────────────────────────────────────
    const [chatHistoryEnabled, setChatHistoryEnabled] = useState(true);
    const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
    const [modelTrainingOptOut, setModelTrainingOptOut] = useState(false);
    const [showOnlineStatus, setShowOnlineStatus] = useState(true);

    // ── Security ─────────────────────────────────────────────────────────────
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

    // ── Sessions ─────────────────────────────────────────────────────────────
    const [sessions, setSessions] = useState<SessionData[]>([]);

    // ── Confirm dialogs ──────────────────────────────────────────────────────
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showClearHistoryConfirm, setShowClearHistoryConfirm] = useState(false);

    // ── Toast helper ─────────────────────────────────────────────────────────
    const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    }, []);

    // ── Load preferences + sessions on mount ─────────────────────────────────
    useEffect(() => {
        const loadData = async () => {
            try {
                // Mock data loading if services fail or for preview
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

    // ── Toggle handler (persists to backend) ─────────────────────────────────
    const handleToggle = useCallback(async (
        key: 'chat_history_enabled' | 'analytics_enabled' | 'model_training_opt_out' | 'show_online_status',
        currentValue: boolean,
        setter: React.Dispatch<React.SetStateAction<boolean>>,
    ) => {
        const newValue = !currentValue;
        setter(newValue);  // Optimistic update

        try {
            await privacyService.updatePreferences({ [key]: newValue });
        } catch {
            setter(currentValue);  // Revert on failure
            showToast('Failed to update setting', 'error');
        }
    }, [showToast]);

    // ── 2FA toggle ───────────────────────────────────────────────────────────
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

    // ── Password reset ───────────────────────────────────────────────────────
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

    // ── Export data ──────────────────────────────────────────────────────────
    const handleExportData = useCallback(async () => {
        setActionLoading('export');
        try {
            const result = await privacyService.exportData();
            if (result.data) {
                // Download as JSON file
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

    // ── Clear chat history ───────────────────────────────────────────────────
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

    // ── Delete account ───────────────────────────────────────────────────────
    const handleDeleteAccount = () => setShowDeleteConfirm(true);

    const confirmDeleteAccount = useCallback(async () => {
        setShowDeleteConfirm(false);
        setActionLoading('deleteAccount');
        try {
            const result = await privacyService.deleteAccount();
            showToast(result.message);
            // Sign out and redirect to landing page after account deletion
            await signOut();
        } catch {
            showToast('Failed to request account deletion', 'error');
        } finally {
            setActionLoading(null);
        }
    }, [showToast, signOut]);

    // ── Session management ───────────────────────────────────────────────────
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

    // ── Render ───────────────────────────────────────────────────────────────

    return (
        <div className="h-full flex flex-col bg-[#0C0C0E]">
            {/* Toast notification */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-xl border ${toast.type === 'success'
                            ? 'bg-[#161618] border-emerald-500/20 text-emerald-400'
                            : 'bg-[#161618] border-red-500/20 text-red-400'
                            }`}
                    >
                        {toast.type === 'success' ? (
                            <CheckCircle2 className="w-4 h-4" />
                        ) : (
                            <AlertTriangle className="w-4 h-4" />
                        )}
                        <span className="text-sm font-medium font-sans">{toast.message}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header - Minimal & Professional */}
            <header className="flex items-center gap-4 px-8 py-6 border-b border-white/[0.08] bg-[#0C0C0E]/80 backdrop-blur-md sticky top-0 z-20">
                <button
                    onClick={onBack}
                    className="w-8 h-8 rounded bg-transparent hover:bg-white/[0.04] border border-transparent hover:border-white/[0.08] flex items-center justify-center transition-all group -ml-2"
                >
                    <ArrowLeft className="w-4 h-4 text-white/50 group-hover:text-white transition-colors" />
                </button>
                <div className="flex-1">
                    <h1 className="text-xl font-display font-semibold text-white tracking-tight">Privacy & Security</h1>
                </div>
                {loading && <Loader2 className="w-4 h-4 text-white/20 animate-spin ml-auto" />}
            </header>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-3xl mx-auto px-8 py-10 space-y-10">

                    {/* Trust banner - Refined */}
                    <div className="flex items-start gap-4 p-5 rounded bg-[#161618] border border-white/[0.08]">
                        <ShieldCheck className="w-5 h-5 text-white/40 flex-shrink-0 mt-0.5" />
                        <p className="text-sm font-sans text-white/60 leading-relaxed">
                            Your data is encrypted in transit and at rest. We strictly adhere to privacy standards and never sell your personal data to third parties. You maintain full control over your data retention.
                        </p>
                    </div>

                    {/* ── DATA PRIVACY ── */}
                    <div>
                        <div className="flex items-center justify-between mb-4 px-1">
                            <SectionHeader>Data Privacy Controls</SectionHeader>
                        </div>
                        <div className="rounded bg-[#161618] border border-white/[0.08] divide-y divide-white/[0.04] overflow-hidden">
                            <ToggleRow
                                icon={History}
                                title="Chat History"
                                subtitle="Save your conversations for future reference"
                                enabled={chatHistoryEnabled}
                                onToggle={() => handleToggle('chat_history_enabled', chatHistoryEnabled, setChatHistoryEnabled)}
                            />
                            <ToggleRow
                                icon={BarChart3}
                                title="Usage Analytics"
                                subtitle="Share anonymized usage data to help us improve"
                                enabled={analyticsEnabled}
                                onToggle={() => handleToggle('analytics_enabled', analyticsEnabled, setAnalyticsEnabled)}
                            />
                            <ToggleRow
                                icon={Eye}
                                title="Model Training Opt-Out"
                                subtitle="Prevent your data from being used to train AI models"
                                enabled={modelTrainingOptOut}
                                onToggle={() => handleToggle('model_training_opt_out', modelTrainingOptOut, setModelTrainingOptOut)}
                            />
                            <ToggleRow
                                icon={showOnlineStatus ? Eye : EyeOff}
                                title="Show Online Status"
                                subtitle="Let team members see when you're active"
                                enabled={showOnlineStatus}
                                onToggle={() => handleToggle('show_online_status', showOnlineStatus, setShowOnlineStatus)}
                            />
                        </div>
                    </div>

                    {/* ── SECURITY ── */}
                    <div>
                        <div className="flex items-center justify-between mb-4 px-1">
                            <SectionHeader>Account Security</SectionHeader>
                        </div>
                        <div className="rounded bg-[#161618] border border-white/[0.08] divide-y divide-white/[0.04] overflow-hidden">
                            <ActionRow
                                icon={Lock}
                                title={actionLoading === 'password' ? 'Sending reset email...' : 'Change Password'}
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
                    </div>

                    {/* ── ACTIVE SESSIONS ── */}
                    <div>
                        <div className="flex items-center justify-between mb-4 px-1">
                            <SectionHeader>Active Sessions</SectionHeader>
                        </div>
                        <div className="rounded bg-[#161618] border border-white/[0.08] divide-y divide-white/[0.04] overflow-hidden">
                            {sessions.length === 0 && !loading && (
                                <div className="px-5 py-6 text-center text-sm text-white/30 font-sans">
                                    No active sessions found
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
                                    className="w-full flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors border-t border-white/[0.04] group"
                                >
                                    <div className="w-8 h-8 rounded bg-red-500/10 flex items-center justify-center flex-shrink-0 group-hover:bg-red-500/20 transition-colors">
                                        <LogOut className="w-4 h-4 text-red-400" />
                                    </div>
                                    <span className="text-sm font-medium font-sans text-red-400">Sign out all other sessions</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* ── YOUR DATA & LEGAL ── */}
                    <div>
                        <div className="flex items-center justify-between mb-4 px-1">
                            <SectionHeader>Data & Legal</SectionHeader>
                        </div>
                        <div className="rounded bg-[#161618] border border-white/[0.08] divide-y divide-white/[0.04] overflow-hidden">
                            <ActionRow
                                icon={Download}
                                title={actionLoading === 'export' ? 'Preparing export...' : 'Export My Data'}
                                subtitle="Download a copy of all your data (JSON)"
                                onClick={handleExportData}
                            />

                            {/* Expandable Data Handling Info */}
                            <ExpandableSection title="How We Handle Data" icon={Info}>
                                <div className="space-y-4 py-2">
                                    <div className="flex items-start gap-3">
                                        <div className="w-4 h-4 mt-0.5 flex-shrink-0 flex items-center justify-center">
                                            <Shield className="w-3.5 h-3.5 text-white/30" />
                                        </div>
                                        <p className="text-xs font-sans text-white/50 leading-relaxed">
                                            <strong className="text-white/80 font-medium">Encryption:</strong> All data is encrypted using AES-256 at rest and TLS 1.3 in transit.
                                        </p>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-4 h-4 mt-0.5 flex-shrink-0 flex items-center justify-center">
                                            <Lock className="w-3.5 h-3.5 text-white/30" />
                                        </div>
                                        <p className="text-xs font-sans text-white/50 leading-relaxed">
                                            <strong className="text-white/80 font-medium">Access:</strong> Only you have access to your private data keys. Our support team cannot view your decrypted content.
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
                    </div>

                    {/* ── DANGER ZONE ── */}
                    <div>
                        <div className="flex items-center justify-between mb-4 px-1">
                            <SectionHeader>Danger Zone</SectionHeader>
                        </div>
                        <div className="rounded bg-red-500/[0.02] border border-red-500/10 divide-y divide-red-500/10 overflow-hidden">
                            <ActionRow
                                icon={Trash2}
                                title={actionLoading === 'clearHistory' ? 'Clearing...' : 'Clear Chat History'}
                                subtitle="Permanently delete all your conversation history"
                                onClick={handleClearAllHistory}
                                danger
                            />
                            <ActionRow
                                icon={UserX}
                                title="Delete Account"
                                subtitle="Permanently delete your account and all associated data"
                                onClick={handleDeleteAccount}
                                danger
                            />
                        </div>
                    </div>

                    {/* Bottom spacer */}
                    <div className="h-4" />
                </div>
            </div>

            {/* ── Confirm Dialogs ── */}
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
