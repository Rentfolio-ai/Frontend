/**
 * Language & Region Page
 * Persists all settings to Zustand preferencesStore (localStorage backed).
 * Language preference is sent to backend so AI responds in the selected language.
 */

import React from 'react';
import { ArrowLeft, Globe, Clock, DollarSign, Calendar, ChevronDown, MessageSquare, Check } from 'lucide-react';
import { usePreferencesStore } from '../../stores/preferencesStore';

interface LanguageRegionPageProps {
    onBack: () => void;
}

// ─── Language Data ───────────────────────────────────────────────────────────

const LANGUAGES = [
    { value: 'en-US', label: 'English (US)', native: 'English', flag: '🇺🇸' },
    { value: 'en-GB', label: 'English (UK)', native: 'English', flag: '🇬🇧' },
    { value: 'es-ES', label: 'Spanish', native: 'Español', flag: '🇪🇸' },
    { value: 'es-MX', label: 'Spanish (Mexico)', native: 'Español (México)', flag: '🇲🇽' },
    { value: 'fr-FR', label: 'French', native: 'Français', flag: '🇫🇷' },
    { value: 'de-DE', label: 'German', native: 'Deutsch', flag: '🇩🇪' },
    { value: 'pt-BR', label: 'Portuguese (Brazil)', native: 'Português', flag: '🇧🇷' },
    { value: 'it-IT', label: 'Italian', native: 'Italiano', flag: '🇮🇹' },
    { value: 'zh-CN', label: 'Chinese (Simplified)', native: '中文（简体）', flag: '🇨🇳' },
    { value: 'zh-TW', label: 'Chinese (Traditional)', native: '中文（繁體）', flag: '🇹🇼' },
    { value: 'ja-JP', label: 'Japanese', native: '日本語', flag: '🇯🇵' },
    { value: 'ko-KR', label: 'Korean', native: '한국어', flag: '🇰🇷' },
    { value: 'ar-SA', label: 'Arabic', native: 'العربية', flag: '🇸🇦' },
    { value: 'hi-IN', label: 'Hindi', native: 'हिन्दी', flag: '🇮🇳' },
    { value: 'ks-IN', label: 'Kashmiri', native: 'کٲشُر', flag: '🇮🇳' },
    { value: 'ru-RU', label: 'Russian', native: 'Русский', flag: '🇷🇺' },
    { value: 'nl-NL', label: 'Dutch', native: 'Nederlands', flag: '🇳🇱' },
    { value: 'sv-SE', label: 'Swedish', native: 'Svenska', flag: '🇸🇪' },
    { value: 'pl-PL', label: 'Polish', native: 'Polski', flag: '🇵🇱' },
    { value: 'tr-TR', label: 'Turkish', native: 'Türkçe', flag: '🇹🇷' },
    { value: 'vi-VN', label: 'Vietnamese', native: 'Tiếng Việt', flag: '🇻🇳' },
    { value: 'th-TH', label: 'Thai', native: 'ไทย', flag: '🇹🇭' },
    { value: 'uk-UA', label: 'Ukrainian', native: 'Українська', flag: '🇺🇦' },
];

const TIMEZONES = [
    { value: 'America/New_York', label: 'Eastern Time (ET)', offset: 'UTC-5' },
    { value: 'America/Chicago', label: 'Central Time (CT)', offset: 'UTC-6' },
    { value: 'America/Denver', label: 'Mountain Time (MT)', offset: 'UTC-7' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)', offset: 'UTC-8' },
    { value: 'America/Anchorage', label: 'Alaska (AKT)', offset: 'UTC-9' },
    { value: 'Pacific/Honolulu', label: 'Hawaii (HST)', offset: 'UTC-10' },
    { value: 'Europe/London', label: 'London (GMT)', offset: 'UTC+0' },
    { value: 'Europe/Paris', label: 'Paris (CET)', offset: 'UTC+1' },
    { value: 'Europe/Berlin', label: 'Berlin (CET)', offset: 'UTC+1' },
    { value: 'Europe/Moscow', label: 'Moscow (MSK)', offset: 'UTC+3' },
    { value: 'Asia/Dubai', label: 'Dubai (GST)', offset: 'UTC+4' },
    { value: 'Asia/Kolkata', label: 'India (IST)', offset: 'UTC+5:30' },
    { value: 'Asia/Shanghai', label: 'China (CST)', offset: 'UTC+8' },
    { value: 'Asia/Tokyo', label: 'Tokyo (JST)', offset: 'UTC+9' },
    { value: 'Asia/Seoul', label: 'Seoul (KST)', offset: 'UTC+9' },
    { value: 'Australia/Sydney', label: 'Sydney (AEDT)', offset: 'UTC+11' },
    { value: 'Pacific/Auckland', label: 'Auckland (NZDT)', offset: 'UTC+13' },
];

const CURRENCIES = [
    { value: 'USD', label: 'US Dollar', symbol: '$' },
    { value: 'EUR', label: 'Euro', symbol: '€' },
    { value: 'GBP', label: 'British Pound', symbol: '£' },
    { value: 'CAD', label: 'Canadian Dollar', symbol: 'C$' },
    { value: 'AUD', label: 'Australian Dollar', symbol: 'A$' },
    { value: 'JPY', label: 'Japanese Yen', symbol: '¥' },
    { value: 'CNY', label: 'Chinese Yuan', symbol: '¥' },
    { value: 'INR', label: 'Indian Rupee', symbol: '₹' },
    { value: 'MXN', label: 'Mexican Peso', symbol: '$' },
    { value: 'BRL', label: 'Brazilian Real', symbol: 'R$' },
    { value: 'KRW', label: 'South Korean Won', symbol: '₩' },
    { value: 'CHF', label: 'Swiss Franc', symbol: 'CHF' },
];

const DATE_FORMATS = [
    { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY', example: '02/07/2026' },
    { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY', example: '07/02/2026' },
    { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD', example: '2026-02-07' },
    { value: 'DD.MM.YYYY', label: 'DD.MM.YYYY', example: '07.02.2026' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getLanguageDisplayName(code: string): string {
    const lang = LANGUAGES.find(l => l.value === code);
    return lang ? lang.native : code;
}

// ─── Component ───────────────────────────────────────────────────────────────

export const LanguageRegionPage: React.FC<LanguageRegionPageProps> = ({ onBack }) => {
    const {
        language, setLanguage,
        timezone, setTimezone,
        currency, setCurrency,
        dateFormat, setDateFormat,
        timeFormat, setTimeFormat,
    } = usePreferencesStore();

    const currentLang = LANGUAGES.find(l => l.value === language);
    const currentCurrency = CURRENCIES.find(c => c.value === currency);

    // ── Select Row ─────────────────────────────────────────────────────────

    const SelectRow: React.FC<{
        icon: React.ElementType;
        label: string;
        subtitle: string;
        value: string;
        options: Array<{ value: string; label: string; [key: string]: any }>;
        onChange: (v: string) => void;
        renderOption?: (opt: any) => string;
    }> = ({ icon: Icon, label, subtitle, value, options, onChange, renderOption }) => (
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
                        <option key={o.value} value={o.value} style={{ backgroundColor: '#1e1e24' }}>
                            {renderOption ? renderOption(o) : o.label}
                        </option>
                    ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30 pointer-events-none" />
            </div>
        </div>
    );

    return (
        <div className="h-full flex flex-col" style={{ backgroundColor: '#111114' }}>
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/[0.08]">
                <button onClick={onBack} className="w-8 h-8 rounded-lg bg-white/[0.05] hover:bg-white/[0.08] flex items-center justify-center transition-colors">
                    <ArrowLeft className="w-4 h-4 text-white/60" />
                </button>
                <div>
                    <h1 className="text-lg font-semibold text-white/90">Language & Region</h1>
                    <p className="text-[11px] text-white/35">Language, timezone, and display formats</p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
                <div className="max-w-2xl mx-auto space-y-5">

                    {/* ── AI Response Language ── */}
                    <div>
                        <h2 className="text-[10px] font-semibold uppercase tracking-widest text-white/30 mb-2 px-1">Language</h2>
                        <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] overflow-hidden">
                            {/* Current language highlight */}
                            <div className="px-3.5 py-3 border-b border-white/[0.04]">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-7 h-7 rounded-md bg-[#C08B5C]/10 flex items-center justify-center flex-shrink-0">
                                        <Globe className="w-3.5 h-3.5 text-[#D4A27F]" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-[13px] font-medium text-white/80">Display & AI Language</h4>
                                        <p className="text-[11px] text-white/35">Vasthu will respond in your selected language</p>
                                    </div>
                                </div>
                                <div className="ml-10">
                                    {/* Language grid */}
                                    <div className="grid grid-cols-2 gap-1.5 max-h-[240px] overflow-y-auto pr-1 scrollbar-hide">
                                        {LANGUAGES.map((lang) => {
                                            const selected = language === lang.value;
                                            return (
                                                <button
                                                    key={lang.value}
                                                    onClick={() => setLanguage(lang.value)}
                                                    className={`flex items-center gap-2 px-2.5 py-2 rounded-lg text-left transition-all ${
                                                        selected
                                                            ? 'bg-[#C08B5C]/15 border border-[#C08B5C]/30'
                                                            : 'bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] hover:border-white/[0.08]'
                                                    }`}
                                                >
                                                    <span className="text-[14px] flex-shrink-0">{lang.flag}</span>
                                                    <div className="flex-1 min-w-0">
                                                        <span className={`text-[11px] font-medium block truncate ${selected ? 'text-[#D4A27F]' : 'text-white/60'}`}>
                                                            {lang.native}
                                                        </span>
                                                        <span className="text-[9px] text-white/25 block truncate">{lang.label}</span>
                                                    </div>
                                                    {selected && <Check className="w-3 h-3 text-[#C08B5C] flex-shrink-0" />}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* AI language note */}
                            <div className="px-3.5 py-2.5 flex items-center gap-2.5">
                                <MessageSquare className="w-3.5 h-3.5 text-white/20 flex-shrink-0" />
                                <p className="text-[10px] text-white/25 leading-relaxed">
                                    Vasthu will understand messages in any language, but will reply in <span className="text-white/45 font-medium">{getLanguageDisplayName(language)}</span>.
                                    You can also quickly switch languages from the <span className="text-white/40 font-medium">
                                    <Globe className="w-3 h-3 inline-block -mt-0.5 mx-0.5" />
                                    globe icon</span> in the chat input bar.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* ── Region Settings ── */}
                    <div>
                        <h2 className="text-[10px] font-semibold uppercase tracking-widest text-white/30 mb-2 px-1">Region</h2>
                        <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] divide-y divide-white/[0.04] overflow-hidden">
                            <SelectRow
                                icon={Clock}
                                label="Timezone"
                                subtitle="Local timezone for timestamps"
                                value={timezone}
                                options={TIMEZONES}
                                onChange={setTimezone}
                                renderOption={(o) => `${o.label} (${o.offset})`}
                            />
                            <SelectRow
                                icon={DollarSign}
                                label="Currency"
                                subtitle="Display currency for property values"
                                value={currency}
                                options={CURRENCIES}
                                onChange={setCurrency}
                                renderOption={(o) => `${o.symbol} ${o.label}`}
                            />
                        </div>
                    </div>

                    {/* ── Format Settings ── */}
                    <div>
                        <h2 className="text-[10px] font-semibold uppercase tracking-widest text-white/30 mb-2 px-1">Format</h2>
                        <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] divide-y divide-white/[0.04] overflow-hidden">
                            <SelectRow
                                icon={Calendar}
                                label="Date Format"
                                subtitle="How dates are displayed"
                                value={dateFormat}
                                options={DATE_FORMATS}
                                onChange={setDateFormat}
                                renderOption={(o) => `${o.label} (${o.example})`}
                            />

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
                                    {[
                                        { v: '12h' as const, l: '12-hour', example: '3:00 PM' },
                                        { v: '24h' as const, l: '24-hour', example: '15:00' },
                                    ].map(tf => (
                                        <button
                                            key={tf.v}
                                            onClick={() => setTimeFormat(tf.v)}
                                            className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-[12px] font-medium transition-all ${
                                                timeFormat === tf.v
                                                    ? 'border-[#C08B5C] bg-[#C08B5C]/10 text-[#D4A27F]'
                                                    : 'border-white/[0.06] bg-white/[0.02] text-white/50 hover:bg-white/[0.04]'
                                            }`}
                                        >
                                            <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${
                                                timeFormat === tf.v ? 'border-[#C08B5C]' : 'border-white/20'
                                            }`}>
                                                {timeFormat === tf.v && <div className="w-1.5 h-1.5 rounded-full bg-[#C08B5C]" />}
                                            </div>
                                            <div>
                                                <span>{tf.l}</span>
                                                <span className="text-[10px] text-white/25 ml-1.5">({tf.example})</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Preview ── */}
                    <div>
                        <h2 className="text-[10px] font-semibold uppercase tracking-widest text-white/30 mb-2 px-1">Preview</h2>
                        <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3.5 space-y-2">
                            {[
                                { l: 'Language', v: currentLang ? `${currentLang.flag} ${currentLang.native}` : language },
                                { l: 'Date', v: dateFormat.replace('MM', '02').replace('DD', '07').replace('YYYY', '2026') },
                                { l: 'Time', v: timeFormat === '12h' ? '3:45 PM' : '15:45' },
                                { l: 'Price', v: `${currentCurrency?.symbol || '$'}250,000` },
                            ].map(p => (
                                <div key={p.l} className="flex items-center justify-between">
                                    <span className="text-[11px] text-white/35">{p.l}</span>
                                    <span className="text-[12px] font-medium text-white/70">{p.v}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="h-4" />
                </div>
            </div>
        </div>
    );
};
