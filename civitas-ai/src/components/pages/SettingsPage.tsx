import React from 'react';
import {
    ArrowLeft, User, Bell, Shield, Palette, Database, Globe,
    ChevronRight, Crown, Sparkles,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useSubscription } from '../../hooks/useSubscription';

interface SettingsPageProps {
    onBack: () => void;
    onNavigateToProfile?: () => void;
    onNavigateToNotifications?: () => void;
    onNavigateToAppearance?: () => void;
    onNavigateToLanguageRegion?: () => void;
    onNavigateToInvestmentPreferences?: () => void;
    onNavigateToPrivacySecurity?: () => void;
}

const reveal = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

const stagger = {
    visible: { transition: { staggerChildren: 0.06 } },
};

interface SettingsRowProps {
    icon: React.ElementType;
    title: string;
    subtitle: string;
    onClick?: () => void;
    badge?: string;
    iconColor?: string;
}

const SettingsRow: React.FC<SettingsRowProps> = ({
    icon: Icon, title, subtitle, onClick, badge, iconColor,
}) => (
    <motion.button
        variants={reveal}
        onClick={onClick}
        className="w-full flex items-center gap-3.5 px-4 py-3.5 transition-all duration-200 hover:bg-white/[0.03] group"
        whileHover={{ x: 2 }}
        whileTap={{ scale: 0.995 }}
    >
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors duration-200 ${
            iconColor || 'bg-[#C08B5C]/[0.08]'
        }`}>
            <Icon className="w-[18px] h-[18px] text-[#D4A27F] group-hover:text-[#C08B5C] transition-colors" />
        </div>
        <div className="flex-1 text-left min-w-0">
            <div className="flex items-center gap-2">
                <h3 className="text-[13px] font-medium text-white/85 group-hover:text-white transition-colors">{title}</h3>
                {badge && (
                    <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-[#C08B5C]/10 text-[#C08B5C] border border-[#C08B5C]/15">
                        {badge}
                    </span>
                )}
            </div>
            <p className="text-[11px] text-white/35 truncate mt-0.5">{subtitle}</p>
        </div>
        <ChevronRight className="w-4 h-4 text-white/15 group-hover:text-white/35 transition-colors flex-shrink-0" />
    </motion.button>
);

export const SettingsPage: React.FC<SettingsPageProps> = ({
    onBack,
    onNavigateToProfile,
    onNavigateToNotifications,
    onNavigateToAppearance,
    onNavigateToLanguageRegion,
    onNavigateToInvestmentPreferences,
    onNavigateToPrivacySecurity,
}) => {
    const { user } = useAuth();
    const { isPro } = useSubscription();

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
                    <h1 className="text-lg font-medium text-white tracking-tight">Settings</h1>
                    <p className="text-[11px] text-white/30 mt-0.5">Manage your account and preferences</p>
                </div>
            </header>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={stagger}
                    className="max-w-2xl mx-auto px-8 py-8 space-y-6"
                >
                    {/* Profile Summary Card */}
                    <motion.div
                        variants={reveal}
                        className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-5 flex items-center gap-4 group cursor-pointer hover:border-white/[0.1] transition-all duration-300"
                        onClick={onNavigateToProfile}
                        whileHover={{ y: -1 }}
                    >
                        <div className="relative">
                            {user?.avatar && user.avatar.length > 200 ? (
                                <img
                                    src={user.avatar}
                                    alt="Profile"
                                    className="w-12 h-12 rounded-full object-cover ring-2 ring-[#C08B5C]/20"
                                />
                            ) : (
                                <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold bg-gradient-to-br from-[#C08B5C]/20 to-[#D4A27F]/10 text-[#D4A27F] ring-1 ring-[#C08B5C]/15">
                                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                                </div>
                            )}
                            {isPro && (
                                <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-[#C08B5C] flex items-center justify-center border-2 border-[#161619]">
                                    <Crown className="w-2.5 h-2.5 text-[#0A0A0C]" />
                                </div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h2 className="text-[14px] font-medium text-white truncate">{user?.name || 'User'}</h2>
                            <p className="text-[12px] text-white/35 truncate">{user?.email || 'user@example.com'}</p>
                        </div>
                        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium ${
                            isPro
                                ? 'bg-[#C08B5C]/10 border border-[#C08B5C]/20 text-[#D4A27F]'
                                : 'bg-white/[0.04] border border-white/[0.08] text-white/40'
                        }`}>
                            {isPro ? <Crown className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                            <span>{isPro ? 'Pro' : 'Free'}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-white/15 group-hover:text-white/35 transition-colors flex-shrink-0" />
                    </motion.div>

                    {/* Account Group */}
                    <motion.div variants={reveal}>
                        <h2 className="text-[10px] font-semibold uppercase tracking-widest text-white/25 mb-3 px-1">Account</h2>
                        <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-sm divide-y divide-white/[0.04] overflow-hidden">
                            <SettingsRow icon={User} title="Profile" subtitle="Personal information and avatar" onClick={onNavigateToProfile} />
                            <SettingsRow icon={Shield} title="Privacy & Security" subtitle="Data, privacy, and security settings" onClick={onNavigateToPrivacySecurity} />
                        </div>
                    </motion.div>

                    {/* Preferences Group */}
                    <motion.div variants={reveal}>
                        <h2 className="text-[10px] font-semibold uppercase tracking-widest text-white/25 mb-3 px-1">Preferences</h2>
                        <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-sm divide-y divide-white/[0.04] overflow-hidden">
                            <SettingsRow icon={Database} title="Investment Preferences" subtitle="Buy box, budget, strategy, criteria" onClick={onNavigateToInvestmentPreferences} badge="Key" />
                            <SettingsRow icon={Bell} title="Notifications" subtitle="Email, push, and in-app alerts" onClick={onNavigateToNotifications} />
                            <SettingsRow icon={Palette} title="Appearance" subtitle="Theme, font size, display options" onClick={onNavigateToAppearance} />
                            <SettingsRow icon={Globe} title="Language & Region" subtitle="Language, timezone, currency" onClick={onNavigateToLanguageRegion} />
                        </div>
                    </motion.div>

                    {/* App Info Footer */}
                    <motion.div variants={reveal} className="pt-4 flex items-center justify-center gap-2 text-white/15">
                        <Sparkles className="w-3 h-3" />
                        <span className="text-[11px] font-medium">Vasthu v2.4.0</span>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
};
