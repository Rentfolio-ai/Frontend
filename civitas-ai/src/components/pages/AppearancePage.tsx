/**
 * Appearance Page - Theme and display preferences
 * Theme, font size, layout customization
 */

import React, { useState } from 'react';
import { ArrowLeft, Palette, Sun, Moon, Monitor, Type, Layout, Eye } from 'lucide-react';

interface AppearancePageProps {
    onBack: () => void;
}

export const AppearancePage: React.FC<AppearancePageProps> = ({ onBack }) => {
    const [appearance, setAppearance] = useState({
        theme: 'dark', // 'light' | 'dark' | 'system'
        fontSize: 'medium', // 'small' | 'medium' | 'large'
        compactMode: false,
        reducedMotion: false,
        highContrast: false,
    });

    const ThemeOption: React.FC<{
        icon: React.ElementType;
        title: string;
        description: string;
        value: string;
        selected: boolean;
        onClick: () => void;
    }> = ({ icon: Icon, title, description, value, selected, onClick }) => (
        <button
            onClick={onClick}
            className="p-4 rounded-xl text-left transition-all w-full"
            style={{
                backgroundColor: selected ? 'rgba(20, 184, 166, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                border: selected ? '2px solid #14B8A6' : '1px solid rgba(148, 163, 184, 0.12)',
            }}
        >
            <div className="flex items-start gap-3">
                <div
                    className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{
                        backgroundColor: selected ? 'rgba(20, 184, 166, 0.2)' : 'rgba(148, 163, 184, 0.1)',
                        color: selected ? '#14B8A6' : '#94A3B8',
                    }}
                >
                    <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                    <h4 className="text-base font-semibold mb-1" style={{ color: '#F1F5F9' }}>
                        {title}
                    </h4>
                    <p className="text-sm" style={{ color: '#94A3B8' }}>
                        {description}
                    </p>
                </div>
            </div>
        </button>
    );

    const ToggleOption: React.FC<{
        icon: React.ElementType;
        title: string;
        description: string;
        enabled: boolean;
        onToggle: () => void;
    }> = ({ icon: Icon, title, description, enabled, onToggle }) => (
        <div
            className="p-4 rounded-xl flex items-start gap-4"
            style={{
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(148, 163, 184, 0.12)',
            }}
        >
            <div
                className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
                style={{
                    backgroundColor: enabled ? 'rgba(20, 184, 166, 0.1)' : 'rgba(148, 163, 184, 0.1)',
                    color: enabled ? '#14B8A6' : '#94A3B8',
                }}
            >
                <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1">
                <h4 className="text-base font-semibold mb-1" style={{ color: '#F1F5F9' }}>
                    {title}
                </h4>
                <p className="text-sm" style={{ color: '#94A3B8' }}>
                    {description}
                </p>
            </div>
            <button
                onClick={onToggle}
                className="flex-shrink-0 relative w-12 h-6 rounded-full transition-colors"
                style={{
                    backgroundColor: enabled ? '#14B8A6' : 'rgba(148, 163, 184, 0.3)',
                }}
            >
                <div
                    className="absolute top-0.5 w-5 h-5 rounded-full transition-transform"
                    style={{
                        backgroundColor: '#FFFFFF',
                        transform: enabled ? 'translateX(26px)' : 'translateX(2px)',
                    }}
                />
            </button>
        </div>
    );

    const FontSizeOption: React.FC<{
        size: string;
        label: string;
        selected: boolean;
        onClick: () => void;
    }> = ({ size, label, selected, onClick }) => (
        <button
            onClick={onClick}
            className="px-6 py-3 rounded-lg transition-all font-semibold"
            style={{
                backgroundColor: selected ? '#14B8A6' : 'rgba(148, 163, 184, 0.1)',
                color: selected ? '#FFFFFF' : '#CBD5E1',
                fontSize: size === 'small' ? '14px' : size === 'large' ? '18px' : '16px',
            }}
        >
            {label}
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
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'}
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: '#F1F5F9' }}>
                        Appearance
                    </h1>
                    <p className="text-sm" style={{ color: '#94A3B8' }}>
                        Customize how the app looks and feels
                    </p>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-3xl mx-auto space-y-8">
                    {/* Theme Selection */}
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <Palette className="w-5 h-5" style={{ color: '#14B8A6' }} />
                            <h2 className="text-lg font-semibold" style={{ color: '#F1F5F9' }}>
                                Theme
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <ThemeOption
                                icon={Sun}
                                title="Light"
                                description="Light color scheme"
                                value="light"
                                selected={appearance.theme === 'light'}
                                onClick={() => setAppearance({ ...appearance, theme: 'light' })}
                            />
                            <ThemeOption
                                icon={Moon}
                                title="Dark"
                                description="Dark color scheme"
                                value="dark"
                                selected={appearance.theme === 'dark'}
                                onClick={() => setAppearance({ ...appearance, theme: 'dark' })}
                            />
                            <ThemeOption
                                icon={Monitor}
                                title="System"
                                description="Match system theme"
                                value="system"
                                selected={appearance.theme === 'system'}
                                onClick={() => setAppearance({ ...appearance, theme: 'system' })}
                            />
                        </div>
                    </div>

                    {/* Font Size */}
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <Type className="w-5 h-5" style={{ color: '#14B8A6' }} />
                            <h2 className="text-lg font-semibold" style={{ color: '#F1F5F9' }}>
                                Font Size
                            </h2>
                        </div>
                        <div className="flex gap-3">
                            <FontSizeOption
                                size="small"
                                label="Small"
                                selected={appearance.fontSize === 'small'}
                                onClick={() => setAppearance({ ...appearance, fontSize: 'small' })}
                            />
                            <FontSizeOption
                                size="medium"
                                label="Medium"
                                selected={appearance.fontSize === 'medium'}
                                onClick={() => setAppearance({ ...appearance, fontSize: 'medium' })}
                            />
                            <FontSizeOption
                                size="large"
                                label="Large"
                                selected={appearance.fontSize === 'large'}
                                onClick={() => setAppearance({ ...appearance, fontSize: 'large' })}
                            />
                        </div>
                    </div>

                    {/* Display Options */}
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <Eye className="w-5 h-5" style={{ color: '#14B8A6' }} />
                            <h2 className="text-lg font-semibold" style={{ color: '#F1F5F9' }}>
                                Display Options
                            </h2>
                        </div>
                        <div className="space-y-3">
                            <ToggleOption
                                icon={Layout}
                                title="Compact Mode"
                                description="Show more content with tighter spacing"
                                enabled={appearance.compactMode}
                                onToggle={() => setAppearance({ ...appearance, compactMode: !appearance.compactMode })}
                            />
                            <ToggleOption
                                icon={Eye}
                                title="Reduced Motion"
                                description="Minimize animations and transitions"
                                enabled={appearance.reducedMotion}
                                onToggle={() => setAppearance({ ...appearance, reducedMotion: !appearance.reducedMotion })}
                            />
                            <ToggleOption
                                icon={Palette}
                                title="High Contrast"
                                description="Increase contrast for better readability"
                                enabled={appearance.highContrast}
                                onToggle={() => setAppearance({ ...appearance, highContrast: !appearance.highContrast })}
                            />
                        </div>
                    </div>

                    {/* Preview */}
                    <div>
                        <h2 className="text-lg font-semibold mb-4" style={{ color: '#F1F5F9' }}>
                            Preview
                        </h2>
                        <div
                            className="p-6 rounded-xl"
                            style={{
                                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                                border: '1px solid rgba(148, 163, 184, 0.12)',
                            }}
                        >
                            <h3 className="text-xl font-bold mb-2" style={{ color: '#F1F5F9' }}>
                                Sample Heading
                            </h3>
                            <p className="text-base mb-4" style={{ color: '#CBD5E1' }}>
                                This is how text will appear with your current settings. Adjust the options above to see changes in real-time.
                            </p>
                            <button
                                className="px-4 py-2 rounded-lg"
                                style={{
                                    backgroundColor: '#14B8A6',
                                    color: '#FFFFFF',
                                }}
                            >
                                Sample Button
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
