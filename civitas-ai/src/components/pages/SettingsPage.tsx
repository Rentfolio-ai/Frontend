/**
 * Settings Page — Redesigned
 * Clean iOS-style grouped settings hub
 */

import React from 'react';
import { ArrowLeft, User, Bell, Shield, Palette, Database, Globe, ChevronRight } from 'lucide-react';

interface SettingsPageProps {
    onBack: () => void;
    onNavigateToProfile?: () => void;
    onNavigateToNotifications?: () => void;
    onNavigateToAppearance?: () => void;
    onNavigateToLanguageRegion?: () => void;
    onNavigateToInvestmentPreferences?: () => void;
    onNavigateToPrivacySecurity?: () => void;
}

interface SettingsRowProps {
    icon: React.ElementType;
    title: string;
    subtitle: string;
    onClick?: () => void;
}

const SettingsRow: React.FC<SettingsRowProps> = ({ icon: Icon, title, subtitle, onClick }) => (
    <button
        onClick={onClick}
        className="w-full flex items-center gap-3 px-3.5 py-3 rounded-lg transition-colors hover:bg-white/[0.05] group"
    >
        <div className="w-8 h-8 rounded-lg bg-[#C08B5C]/10 flex items-center justify-center flex-shrink-0">
            <Icon className="w-4 h-4 text-[#D4A27F]" />
        </div>
        <div className="flex-1 text-left min-w-0">
            <h3 className="text-[13px] font-medium text-white/85">{title}</h3>
            <p className="text-[11px] text-white/40 truncate">{subtitle}</p>
        </div>
        <ChevronRight className="w-3.5 h-3.5 text-white/20 group-hover:text-white/40 transition-colors flex-shrink-0" />
    </button>
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
                <div>
                    <h1 className="text-lg font-semibold text-white/90">Settings</h1>
                    <p className="text-[11px] text-white/35">Manage your account and preferences</p>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
                <div className="max-w-2xl mx-auto space-y-5">
                    {/* Account */}
                    <div>
                        <h2 className="text-[10px] font-semibold uppercase tracking-widest text-white/30 mb-2 px-1">Account</h2>
                        <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] divide-y divide-white/[0.04] overflow-hidden">
                            <SettingsRow icon={User} title="Profile" subtitle="Personal information and avatar" onClick={onNavigateToProfile} />
                            <SettingsRow icon={Shield} title="Privacy & Security" subtitle="Data, privacy, and security settings" onClick={onNavigateToPrivacySecurity} />
                        </div>
                    </div>

                    {/* Preferences */}
                    <div>
                        <h2 className="text-[10px] font-semibold uppercase tracking-widest text-white/30 mb-2 px-1">Preferences</h2>
                        <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] divide-y divide-white/[0.04] overflow-hidden">
                            <SettingsRow icon={Database} title="Investment Preferences" subtitle="Buy box, budget, strategy, criteria" onClick={onNavigateToInvestmentPreferences} />
                            <SettingsRow icon={Bell} title="Notifications" subtitle="Email, push, and in-app alerts" onClick={onNavigateToNotifications} />
                            <SettingsRow icon={Palette} title="Appearance" subtitle="Theme, font size, display options" onClick={onNavigateToAppearance} />
                            <SettingsRow icon={Globe} title="Language & Region" subtitle="Language, timezone, currency" onClick={onNavigateToLanguageRegion} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
