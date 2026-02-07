/**
 * Language & Region Page — Redesigned
 * Compact dropdowns and radio options
 */

import React, { useState } from 'react';
import { ArrowLeft, Globe, Clock, DollarSign, Calendar, ChevronDown } from 'lucide-react';

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
        { value: 'en-US', label: 'English (US)' }, { value: 'en-GB', label: 'English (UK)' },
        { value: 'es-ES', label: 'Español' }, { value: 'fr-FR', label: 'Français' },
        { value: 'de-DE', label: 'Deutsch' }, { value: 'pt-BR', label: 'Português (Brasil)' },
        { value: 'zh-CN', label: '中文' }, { value: 'ja-JP', label: '日本語' },
    ];

    const timezones = [
        { value: 'America/New_York', label: 'Eastern Time (ET)' }, { value: 'America/Chicago', label: 'Central Time (CT)' },
        { value: 'America/Denver', label: 'Mountain Time (MT)' }, { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
        { value: 'Europe/London', label: 'London (GMT)' }, { value: 'Europe/Paris', label: 'Paris (CET)' },
        { value: 'Asia/Tokyo', label: 'Tokyo (JST)' }, { value: 'Australia/Sydney', label: 'Sydney (AEDT)' },
    ];

    const currencies = [
        { value: 'USD', label: 'US Dollar ($)' }, { value: 'EUR', label: 'Euro (€)' },
        { value: 'GBP', label: 'British Pound (£)' }, { value: 'JPY', label: 'Japanese Yen (¥)' },
        { value: 'CAD', label: 'Canadian Dollar (C$)' }, { value: 'AUD', label: 'Australian Dollar (A$)' },
    ];

    const dateFormats = [
        { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY', example: '12/31/2024' },
        { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY', example: '31/12/2024' },
        { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD', example: '2024-12-31' },
    ];

    const SelectRow: React.FC<{
        icon: React.ElementType;
        label: string;
        subtitle: string;
        value: string;
        options: Array<{ value: string; label: string }>;
        onChange: (v: string) => void;
    }> = ({ icon: Icon, label, subtitle, value, options, onChange }) => (
        <div className="px-3.5 py-3">
            <div className="flex items-center gap-3 mb-2">
                <div className="w-7 h-7 rounded-md bg-[#C08B5C]/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-3.5 h-3.5 text-[#D4A27F]" />
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="text-[13px] font-medium text-white/80">{label}</h4>
                    <p className="text-[11px] text-white/35">{subtitle}</p>
                </div>
            </div>
            <div className="ml-10 relative">
                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white/[0.06] border border-white/[0.08] text-[12px] text-white/80 appearance-none cursor-pointer focus:outline-none focus:border-[#C08B5C]/30 transition-colors"
                >
                    {options.map(o => (
                        <option key={o.value} value={o.value} style={{ backgroundColor: '#1e1e24' }}>{o.label}</option>
                    ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30 pointer-events-none" />
            </div>
        </div>
    );

    return (
        <div className="h-full flex flex-col" style={{ backgroundColor: '#111114' }}>
            <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/[0.08]">
                <button onClick={onBack} className="w-8 h-8 rounded-lg bg-white/[0.05] hover:bg-white/[0.08] flex items-center justify-center transition-colors">
                    <ArrowLeft className="w-4 h-4 text-white/60" />
                </button>
                <div>
                    <h1 className="text-lg font-semibold text-white/90">Language & Region</h1>
                    <p className="text-[11px] text-white/35">Regional preferences</p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
                <div className="max-w-2xl mx-auto space-y-5">
                    {/* Locale Settings */}
                    <div>
                        <h2 className="text-[10px] font-semibold uppercase tracking-widest text-white/30 mb-2 px-1">Locale</h2>
                        <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] divide-y divide-white/[0.04] overflow-hidden">
                            <SelectRow icon={Globe} label="Language" subtitle="Preferred display language" value={settings.language} options={languages} onChange={(v) => setSettings({ ...settings, language: v })} />
                            <SelectRow icon={Clock} label="Timezone" subtitle="Local timezone for timestamps" value={settings.timezone} options={timezones} onChange={(v) => setSettings({ ...settings, timezone: v })} />
                            <SelectRow icon={DollarSign} label="Currency" subtitle="Display currency for values" value={settings.currency} options={currencies} onChange={(v) => setSettings({ ...settings, currency: v })} />
                        </div>
                    </div>

                    {/* Format Settings */}
                    <div>
                        <h2 className="text-[10px] font-semibold uppercase tracking-widest text-white/30 mb-2 px-1">Format</h2>
                        <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] divide-y divide-white/[0.04] overflow-hidden">
                            <SelectRow icon={Calendar} label="Date Format" subtitle="How dates are displayed" value={settings.dateFormat} options={dateFormats} onChange={(v) => setSettings({ ...settings, dateFormat: v })} />

                            {/* Time Format */}
                            <div className="px-3.5 py-3">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-7 h-7 rounded-md bg-[#C08B5C]/10 flex items-center justify-center flex-shrink-0">
                                        <Clock className="w-3.5 h-3.5 text-[#D4A27F]" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-[13px] font-medium text-white/80">Time Format</h4>
                                        <p className="text-[11px] text-white/35">12-hour or 24-hour clock</p>
                                    </div>
                                </div>
                                <div className="ml-10 grid grid-cols-2 gap-2">
                                    {[{ v: '12h', l: '12-hour (3:00 PM)' }, { v: '24h', l: '24-hour (15:00)' }].map(tf => (
                                        <button
                                            key={tf.v}
                                            onClick={() => setSettings({ ...settings, timeFormat: tf.v })}
                                            className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-[12px] font-medium transition-all ${
                                                settings.timeFormat === tf.v
                                                    ? 'border-[#C08B5C] bg-[#C08B5C]/10 text-[#D4A27F]'
                                                    : 'border-white/[0.06] bg-white/[0.02] text-white/50 hover:bg-white/[0.04]'
                                            }`}
                                        >
                                            <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${
                                                settings.timeFormat === tf.v ? 'border-[#C08B5C]' : 'border-white/20'
                                            }`}>
                                                {settings.timeFormat === tf.v && <div className="w-1.5 h-1.5 rounded-full bg-[#C08B5C]" />}
                                            </div>
                                            {tf.l}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Preview */}
                    <div>
                        <h2 className="text-[10px] font-semibold uppercase tracking-widest text-white/30 mb-2 px-1">Preview</h2>
                        <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3.5 space-y-2">
                            {[
                                { l: 'Date', v: settings.dateFormat.replace('MM', '12').replace('DD', '31').replace('YYYY', '2024') },
                                { l: 'Time', v: settings.timeFormat === '12h' ? '3:45 PM' : '15:45' },
                                { l: 'Price', v: `${currencies.find(c => c.value === settings.currency)?.label.match(/\((.)\)/)?.[1] || '$'}250,000` },
                            ].map(p => (
                                <div key={p.l} className="flex items-center justify-between">
                                    <span className="text-[11px] text-white/35">{p.l}</span>
                                    <span className="text-[12px] font-medium text-white/70">{p.v}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
