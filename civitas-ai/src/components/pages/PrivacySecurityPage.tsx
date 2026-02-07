/**
 * Privacy & Security Page
 *
 * Covers data privacy controls, security settings, active sessions,
 * and legal/policy links — modeled after best practices from apps
 * like ChatGPT, Notion, and Linear.
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

interface PrivacySecurityPageProps {
    onBack: () => void;
}

// ── Shared Toggle ────────────────────────────────────────────────────────────

const Toggle: React.FC<{ enabled: boolean; onToggle: () => void }> = ({ enabled, onToggle }) => (
    <button
        onClick={onToggle}
        className={`relative w-10 h-[22px] rounded-full transition-colors flex-shrink-0 ${enabled ? 'bg-[#C08B5C]' : 'bg-white/[0.12]'}`}
    >
        <div
            className={`absolute top-[2px] w-[18px] h-[18px] rounded-full bg-white shadow-sm transition-transform ${
                enabled ? 'translate-x-[22px]' : 'translate-x-[2px]'
            }`}
        />
    </button>
);

// ── Section Header ───────────────────────────────────────────────────────────

const SectionHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <h2 className="text-[10px] font-semibold uppercase tracking-widest text-white/30 mb-2 px-1">
        {children}
    </h2>
);

// ── Info Banner ──────────────────────────────────────────────────────────────

const InfoBanner: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#C08B5C]/[0.06] border border-[#C08B5C]/15">
        <ShieldCheck className="w-4 h-4 text-[#D4A27F] flex-shrink-0 mt-0.5" />
        <p className="text-[11px] text-white/50 leading-relaxed">{children}</p>
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
    <div className="flex items-center gap-3 px-3.5 py-3">
        <div className="w-8 h-8 rounded-lg bg-[#C08B5C]/10 flex items-center justify-center flex-shrink-0">
            <Icon className="w-4 h-4 text-[#D4A27F]" />
        </div>
        <div className="flex-1 min-w-0">
            <h3 className="text-[13px] font-medium text-white/85">{title}</h3>
            <p className="text-[11px] text-white/40">{subtitle}</p>
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
        className="w-full flex items-center gap-3 px-3.5 py-3 rounded-lg transition-colors hover:bg-white/[0.05] group"
    >
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
            danger ? 'bg-red-500/10' : 'bg-[#C08B5C]/10'
        }`}>
            <Icon className={`w-4 h-4 ${danger ? 'text-red-400' : 'text-[#D4A27F]'}`} />
        </div>
        <div className="flex-1 text-left min-w-0">
            <h3 className={`text-[13px] font-medium ${danger ? 'text-red-400/85' : 'text-white/85'}`}>{title}</h3>
            <p className="text-[11px] text-white/40">{subtitle}</p>
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
    <div className="flex items-center gap-3 px-3.5 py-3">
        <div className="w-8 h-8 rounded-lg bg-white/[0.05] flex items-center justify-center flex-shrink-0">
            {deviceType === 'desktop' ? (
                <Monitor className="w-4 h-4 text-white/40" />
            ) : (
                <Smartphone className="w-4 h-4 text-white/40" />
            )}
        </div>
        <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
                <h3 className="text-[13px] font-medium text-white/85">{device}</h3>
                {isCurrent && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                        Current
                    </span>
                )}
            </div>
            <p className="text-[11px] text-white/40">{location} · {lastActive}</p>
        </div>
        {!isCurrent && onRevoke && (
            <button
                onClick={onRevoke}
                className="px-2.5 py-1 rounded-md text-[11px] font-medium text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-colors"
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
        <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center gap-3 px-3.5 py-3 hover:bg-white/[0.03] transition-colors"
            >
                <div className="w-8 h-8 rounded-lg bg-[#C08B5C]/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-[#D4A27F]" />
                </div>
                <span className="flex-1 text-left text-[13px] font-medium text-white/85">{title}</span>
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
                        <div className="px-3.5 pb-3.5 pt-1">{children}</div>
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
                className="relative w-full max-w-sm rounded-2xl border border-white/[0.1] p-5"
                style={{ backgroundColor: '#1c1c20' }}
            >
                <div className="flex items-start gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        danger ? 'bg-red-500/15' : 'bg-amber-500/15'
                    }`}>
                        <AlertTriangle className={`w-5 h-5 ${danger ? 'text-red-400' : 'text-amber-400'}`} />
                    </div>
                    <div>
                        <h3 className="text-[15px] font-semibold text-white/90">{title}</h3>
                        <p className="text-[12px] text-white/45 mt-1 leading-relaxed">{message}</p>
                    </div>
                </div>
                <div className="flex gap-2 justify-end">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 rounded-lg text-[12px] font-medium text-white/50 hover:bg-white/[0.06] transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`px-4 py-2 rounded-lg text-[12px] font-semibold text-white transition-colors ${
                            danger
                                ? 'bg-red-500/80 hover:bg-red-500'
                                : 'bg-[#C08B5C] hover:bg-[#A8734A]'
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
        } catch {
            showToast('Failed to request account deletion', 'error');
        } finally {
            setActionLoading(null);
        }
    }, [showToast]);

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
        <div className="h-full flex flex-col" style={{ backgroundColor: '#111114' }}>
            {/* Toast notification */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl shadow-lg border ${
                            toast.type === 'success'
                                ? 'bg-emerald-500/15 border-emerald-500/25 text-emerald-300'
                                : 'bg-red-500/15 border-red-500/25 text-red-300'
                        }`}
                        style={{ backgroundColor: toast.type === 'success' ? '#111814' : '#181114' }}
                    >
                        {toast.type === 'success' ? (
                            <CheckCircle2 className="w-4 h-4" />
                        ) : (
                            <AlertTriangle className="w-4 h-4" />
                        )}
                        <span className="text-[12px] font-medium">{toast.message}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/[0.08]">
                <button
                    onClick={onBack}
                    className="w-8 h-8 rounded-lg bg-white/[0.05] hover:bg-white/[0.08] flex items-center justify-center transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 text-white/60" />
                </button>
                <div>
                    <h1 className="text-lg font-semibold text-white/90">Privacy & Security</h1>
                    <p className="text-[11px] text-white/35">Control your data, privacy, and security settings</p>
                </div>
                {loading && <Loader2 className="w-4 h-4 text-white/20 animate-spin ml-auto" />}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
                <div className="max-w-2xl mx-auto space-y-5">

                    {/* Trust banner */}
                    <InfoBanner>
                        Your data is encrypted in transit and at rest. We never sell your personal data
                        to third parties. You have full control over what is stored and can delete it at any time.
                    </InfoBanner>

                    {/* ── DATA PRIVACY ── */}
                    <div>
                        <SectionHeader>Data Privacy</SectionHeader>
                        <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] divide-y divide-white/[0.04] overflow-hidden">
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
                                subtitle="Help us improve by sharing anonymized usage data"
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
                        <SectionHeader>Security</SectionHeader>
                        <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] divide-y divide-white/[0.04] overflow-hidden">
                            <ActionRow
                                icon={Lock}
                                title={actionLoading === 'password' ? 'Sending reset email…' : 'Change Password'}
                                subtitle="We'll send a password reset link to your email"
                                onClick={handlePasswordReset}
                            />
                            <ToggleRow
                                icon={KeyRound}
                                title="Two-Factor Authentication"
                                subtitle={twoFactorEnabled ? 'Enabled — your account is extra secure' : 'Add an extra layer of protection'}
                                enabled={twoFactorEnabled}
                                onToggle={handleToggle2FA}
                            />
                        </div>
                    </div>

                    {/* ── ACTIVE SESSIONS ── */}
                    <div>
                        <SectionHeader>Active Sessions</SectionHeader>
                        <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] divide-y divide-white/[0.04] overflow-hidden">
                            {sessions.length === 0 && !loading && (
                                <div className="px-3.5 py-4 text-center text-[12px] text-white/30">
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
                                    className="w-full flex items-center gap-3 px-3.5 py-3 hover:bg-white/[0.05] transition-colors"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
                                        <LogOut className="w-4 h-4 text-red-400" />
                                    </div>
                                    <span className="text-[13px] font-medium text-red-400/70">Sign out all other sessions</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* ── YOUR DATA ── */}
                    <div>
                        <SectionHeader>Your Data</SectionHeader>
                        <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] divide-y divide-white/[0.04] overflow-hidden">
                            <ActionRow
                                icon={Download}
                                title={actionLoading === 'export' ? 'Preparing export…' : 'Export My Data'}
                                subtitle="Download a copy of all your data (JSON)"
                                onClick={handleExportData}
                            />
                            <ActionRow
                                icon={Trash2}
                                title={actionLoading === 'clearHistory' ? 'Clearing…' : 'Clear Chat History'}
                                subtitle="Delete all saved conversations"
                                onClick={handleClearAllHistory}
                                danger
                            />
                        </div>
                    </div>

                    {/* ── DATA HANDLING — expandable ── */}
                    <ExpandableSection title="How We Handle Your Data" icon={Info} defaultOpen={false}>
                        <div className="space-y-3 text-[11px] text-white/45 leading-relaxed">
                            <div className="flex items-start gap-2">
                                <Shield className="w-3.5 h-3.5 text-[#D4A27F] flex-shrink-0 mt-0.5" />
                                <p><strong className="text-white/60">Encryption:</strong> All data is encrypted using AES-256 at rest and TLS 1.3 in transit.</p>
                            </div>
                            <div className="flex items-start gap-2">
                                <Lock className="w-3.5 h-3.5 text-[#D4A27F] flex-shrink-0 mt-0.5" />
                                <p><strong className="text-white/60">Access Control:</strong> Only you can access your conversations and analyses. Our support team cannot view your chat content.</p>
                            </div>
                            <div className="flex items-start gap-2">
                                <Trash2 className="w-3.5 h-3.5 text-[#D4A27F] flex-shrink-0 mt-0.5" />
                                <p><strong className="text-white/60">Deletion:</strong> When you delete data, it is permanently removed from our servers within 30 days.</p>
                            </div>
                            <div className="flex items-start gap-2">
                                <BarChart3 className="w-3.5 h-3.5 text-[#D4A27F] flex-shrink-0 mt-0.5" />
                                <p><strong className="text-white/60">Analytics:</strong> If enabled, we collect anonymized usage metrics (no personal data) to improve the product.</p>
                            </div>
                        </div>
                    </ExpandableSection>

                    {/* ── LEGAL ── */}
                    <div>
                        <SectionHeader>Legal</SectionHeader>
                        <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] divide-y divide-white/[0.04] overflow-hidden">
                            <ActionRow
                                icon={FileText}
                                title="Privacy Policy"
                                subtitle="How we collect, use, and protect your data"
                                onClick={() => window.open('/privacy-policy', '_blank')}
                                external
                            />
                            <ActionRow
                                icon={FileText}
                                title="Terms of Service"
                                subtitle="Rules and conditions for using Vasthu AI"
                                onClick={() => window.open('/terms-of-service', '_blank')}
                                external
                            />
                            <ActionRow
                                icon={Cookie}
                                title="Cookie Policy"
                                subtitle="How we use cookies and similar technologies"
                                onClick={() => window.open('/cookie-policy', '_blank')}
                                external
                            />
                        </div>
                    </div>

                    {/* ── DANGER ZONE ── */}
                    <div>
                        <SectionHeader>Danger Zone</SectionHeader>
                        <div className="rounded-xl bg-red-500/[0.03] border border-red-500/[0.12] overflow-hidden">
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
                confirmLabel="Delete My Account"
                onConfirm={confirmDeleteAccount}
                onCancel={() => setShowDeleteConfirm(false)}
                danger
            />
            <ConfirmDialog
                isOpen={showClearHistoryConfirm}
                title="Clear All Chat History?"
                message="This will permanently delete all your saved conversations. This action cannot be undone."
                confirmLabel="Clear History"
                onConfirm={confirmClearHistory}
                onCancel={() => setShowClearHistoryConfirm(false)}
                danger
            />
        </div>
    );
};
