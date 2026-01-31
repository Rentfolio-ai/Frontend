/**
 * Settings Page - Full Page View
 * Clean, comprehensive settings interface
 */

import React from 'react';
import { ArrowLeft, User, Bell, Shield, Palette, Database, Key, Globe } from 'lucide-react';

interface SettingsPageProps {
    onBack: () => void;
    onNavigateToProfile?: () => void;
    onNavigateToNotifications?: () => void;
    onNavigateToAppearance?: () => void;
    onNavigateToLanguageRegion?: () => void;
    onNavigateToInvestmentPreferences?: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ 
    onBack, 
    onNavigateToProfile,
    onNavigateToNotifications,
    onNavigateToAppearance,
    onNavigateToLanguageRegion,
    onNavigateToInvestmentPreferences,
}) => {

    const SettingsSection: React.FC<{
        icon: React.ElementType;
        title: string;
        description: string;
        onClick?: () => void;
    }> = ({ icon: Icon, title, description, onClick }) => (
        <button
            onClick={onClick}
            className="w-full flex items-start gap-4 p-4 rounded-xl transition-all"
            style={{
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(148, 163, 184, 0.12)',
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)';
                e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.2)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
                e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.12)';
            }}
        >
            <div
                className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
                style={{
                    backgroundColor: 'rgba(20, 184, 166, 0.1)',
                    color: '#14B8A6',
                }}
            >
                <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1 text-left">
                <h3 className="text-base font-semibold mb-1" style={{ color: '#F1F5F9' }}>
                    {title}
                </h3>
                <p className="text-sm" style={{ color: '#94A3B8' }}>
                    {description}
                </p>
            </div>
        </button>
    );

    return (
        <div className="h-full flex flex-col" style={{ backgroundColor: '#334155' }}>
            {/* Header */}
            <div
                className="flex items-center gap-4 px-6 py-4 border-b"
                style={{ borderColor: 'rgba(148, 163, 184, 0.15)' }}
            >
                <button
                    onClick={onBack}
                    className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
                    style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        color: '#E2E8F0',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                    }}
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: '#F1F5F9' }}>
                        Settings
                    </h1>
                    <p className="text-sm" style={{ color: '#94A3B8' }}>
                        Manage your account and preferences
                    </p>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-4xl mx-auto space-y-8">
                    {/* Account Settings */}
                    <div>
                        <h2 className="text-lg font-semibold mb-4" style={{ color: '#F1F5F9' }}>
                            Account
                        </h2>
                        <div className="space-y-3">
                            <SettingsSection
                                icon={User}
                                title="Profile"
                                description="Manage your personal information and profile details"
                                onClick={onNavigateToProfile}
                            />
                            <SettingsSection
                                icon={Shield}
                                title="Privacy & Security"
                                description="Control your data, privacy settings, and security options"
                            />
                            <SettingsSection
                                icon={Key}
                                title="API Keys"
                                description="Manage API keys and integrations"
                            />
                        </div>
                    </div>

                    {/* Preferences */}
                    <div>
                        <h2 className="text-lg font-semibold mb-4" style={{ color: '#F1F5F9' }}>
                            Preferences
                        </h2>
                        <div className="space-y-3">
                            <SettingsSection
                                icon={Database}
                                title="Investment Preferences"
                                description="Set your buy box, budget, strategy, and investment criteria"
                                onClick={onNavigateToInvestmentPreferences}
                            />
                            <SettingsSection
                                icon={Bell}
                                title="Notifications"
                                description="Configure email, push, and in-app notifications"
                                onClick={onNavigateToNotifications}
                            />
                            <SettingsSection
                                icon={Palette}
                                title="Appearance"
                                description="Customize theme, layout, and display preferences"
                                onClick={onNavigateToAppearance}
                            />
                            <SettingsSection
                                icon={Globe}
                                title="Language & Region"
                                description="Set language, timezone, and currency preferences"
                                onClick={onNavigateToLanguageRegion}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
