/**
 * Language & Region Page - Localization preferences
 * Language, timezone, currency, date format
 */

import React, { useState } from 'react';
import { ArrowLeft, Globe, Clock, DollarSign, Calendar } from 'lucide-react';

interface LanguageRegionPageProps {
    onBack: () => void;
}

export const LanguageRegionPage: React.FC<LanguageRegionPageProps> = ({ onBack }) => {
    const [settings, setSettings] = useState({
        language: 'en-US',
        timezone: 'America/New_York',
        currency: 'USD',
        dateFormat: 'MM/DD/YYYY',
        timeFormat: '12h',
    });

    const languages = [
        { value: 'en-US', label: 'English (US)', flag: '🇺🇸' },
        { value: 'en-GB', label: 'English (UK)', flag: '🇬🇧' },
        { value: 'es-ES', label: 'Español', flag: '🇪🇸' },
        { value: 'fr-FR', label: 'Français', flag: '🇫🇷' },
        { value: 'de-DE', label: 'Deutsch', flag: '🇩🇪' },
        { value: 'pt-BR', label: 'Português (Brasil)', flag: '🇧🇷' },
        { value: 'zh-CN', label: '中文', flag: '🇨🇳' },
        { value: 'ja-JP', label: '日本語', flag: '🇯🇵' },
    ];

    const timezones = [
        { value: 'America/New_York', label: 'Eastern Time (ET)' },
        { value: 'America/Chicago', label: 'Central Time (CT)' },
        { value: 'America/Denver', label: 'Mountain Time (MT)' },
        { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
        { value: 'Europe/London', label: 'London (GMT)' },
        { value: 'Europe/Paris', label: 'Paris (CET)' },
        { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
        { value: 'Australia/Sydney', label: 'Sydney (AEDT)' },
    ];

    const currencies = [
        { value: 'USD', label: 'US Dollar ($)', symbol: '$' },
        { value: 'EUR', label: 'Euro (€)', symbol: '€' },
        { value: 'GBP', label: 'British Pound (£)', symbol: '£' },
        { value: 'JPY', label: 'Japanese Yen (¥)', symbol: '¥' },
        { value: 'CAD', label: 'Canadian Dollar ($)', symbol: 'C$' },
        { value: 'AUD', label: 'Australian Dollar ($)', symbol: 'A$' },
    ];

    const dateFormats = [
        { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY', example: '12/31/2024' },
        { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY', example: '31/12/2024' },
        { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD', example: '2024-12-31' },
    ];

    const SelectField: React.FC<{
        icon: React.ElementType;
        title: string;
        description: string;
        value: string;
        options: Array<{ value: string; label: string; flag?: string; symbol?: string; example?: string }>;
        onChange: (value: string) => void;
    }> = ({ icon: Icon, title, description, value, options, onChange }) => (
        <div
            className="p-4 rounded-xl"
            style={{
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(148, 163, 184, 0.12)',
            }}
        >
            <div className="flex items-start gap-3 mb-3">
                <div
                    className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{
                        backgroundColor: 'rgba(20, 184, 166, 0.1)',
                        color: '#14B8A6',
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
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full px-3 py-2 rounded-lg transition-colors"
                style={{
                    backgroundColor: 'rgba(148, 163, 184, 0.1)',
                    border: '1px solid rgba(148, 163, 184, 0.2)',
                    color: '#F1F5F9',
                }}
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value} style={{ backgroundColor: '#1E293B' }}>
                        {option.flag ? `${option.flag} ${option.label}` : option.symbol ? `${option.symbol} ${option.label}` : option.example ? `${option.label} (${option.example})` : option.label}
                    </option>
                ))}
            </select>
        </div>
    );

    const RadioOption: React.FC<{
        label: string;
        value: string;
        selected: boolean;
        onClick: () => void;
    }> = ({ label, value, selected, onClick }) => (
        <button
            onClick={onClick}
            className="flex items-center gap-3 p-3 rounded-lg transition-all w-full"
            style={{
                backgroundColor: selected ? 'rgba(20, 184, 166, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                border: selected ? '2px solid #14B8A6' : '1px solid rgba(148, 163, 184, 0.12)',
            }}
        >
            <div
                className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                    border: '2px solid',
                    borderColor: selected ? '#14B8A6' : '#94A3B8',
                }}
            >
                {selected && (
                    <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: '#14B8A6' }}
                    />
                )}
            </div>
            <span className="text-sm font-medium" style={{ color: '#F1F5F9' }}>
                {label}
            </span>
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
                        Language & Region
                    </h1>
                    <p className="text-sm" style={{ color: '#94A3B8' }}>
                        Set your language, timezone, and regional preferences
                    </p>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-3xl mx-auto space-y-6">
                    {/* Language */}
                    <SelectField
                        icon={Globe}
                        title="Language"
                        description="Choose your preferred language"
                        value={settings.language}
                        options={languages}
                        onChange={(value) => setSettings({ ...settings, language: value })}
                    />

                    {/* Timezone */}
                    <SelectField
                        icon={Clock}
                        title="Timezone"
                        description="Set your local timezone for accurate timestamps"
                        value={settings.timezone}
                        options={timezones}
                        onChange={(value) => setSettings({ ...settings, timezone: value })}
                    />

                    {/* Currency */}
                    <SelectField
                        icon={DollarSign}
                        title="Currency"
                        description="Choose how prices and values are displayed"
                        value={settings.currency}
                        options={currencies}
                        onChange={(value) => setSettings({ ...settings, currency: value })}
                    />

                    {/* Date Format */}
                    <SelectField
                        icon={Calendar}
                        title="Date Format"
                        description="Choose how dates are displayed"
                        value={settings.dateFormat}
                        options={dateFormats}
                        onChange={(value) => setSettings({ ...settings, dateFormat: value })}
                    />

                    {/* Time Format */}
                    <div>
                        <div
                            className="p-4 rounded-xl"
                            style={{
                                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                                border: '1px solid rgba(148, 163, 184, 0.12)',
                            }}
                        >
                            <div className="flex items-start gap-3 mb-3">
                                <div
                                    className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
                                    style={{
                                        backgroundColor: 'rgba(20, 184, 166, 0.1)',
                                        color: '#14B8A6',
                                    }}
                                >
                                    <Clock className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-base font-semibold mb-1" style={{ color: '#F1F5F9' }}>
                                        Time Format
                                    </h4>
                                    <p className="text-sm" style={{ color: '#94A3B8' }}>
                                        Choose between 12-hour and 24-hour time
                                    </p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <RadioOption
                                    label="12-hour (3:00 PM)"
                                    value="12h"
                                    selected={settings.timeFormat === '12h'}
                                    onClick={() => setSettings({ ...settings, timeFormat: '12h' })}
                                />
                                <RadioOption
                                    label="24-hour (15:00)"
                                    value="24h"
                                    selected={settings.timeFormat === '24h'}
                                    onClick={() => setSettings({ ...settings, timeFormat: '24h' })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Preview */}
                    <div>
                        <h2 className="text-lg font-semibold mb-4" style={{ color: '#F1F5F9' }}>
                            Preview
                        </h2>
                        <div
                            className="p-6 rounded-xl space-y-3"
                            style={{
                                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                                border: '1px solid rgba(148, 163, 184, 0.12)',
                            }}
                        >
                            <div className="flex justify-between">
                                <span className="text-sm" style={{ color: '#94A3B8' }}>Date:</span>
                                <span className="text-sm font-medium" style={{ color: '#F1F5F9' }}>
                                    {settings.dateFormat.replace('MM', '12').replace('DD', '31').replace('YYYY', '2024')}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm" style={{ color: '#94A3B8' }}>Time:</span>
                                <span className="text-sm font-medium" style={{ color: '#F1F5F9' }}>
                                    {settings.timeFormat === '12h' ? '3:45 PM' : '15:45'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm" style={{ color: '#94A3B8' }}>Price:</span>
                                <span className="text-sm font-medium" style={{ color: '#F1F5F9' }}>
                                    {currencies.find(c => c.value === settings.currency)?.symbol}250,000
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
