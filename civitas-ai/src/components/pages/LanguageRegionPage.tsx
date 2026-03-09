/**
 * Language & Region Page
 * Persists all settings to Zustand preferencesStore (localStorage backed).
 * Language preference is sent to backend so AI responds in the selected language.
 */

import React from 'react';
import { ArrowLeft, Globe, Clock, DollarSign, Calendar, ChevronDown, MessageSquare, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { usePreferencesStore } from '../../stores/preferencesStore';

interface LanguageRegionPageProps {
    onBack: () => void;
}

// ─── Animation Variants ──────────────────────────────────────────────────────

const reveal = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const stagger = {
    visible: { transition: { staggerChildren: 0.08 } },
};

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

// ─── Reusable Components ─────────────────────────────────────────────────────

const SelectRow: React.FC<{
    icon: React.ElementType;
    label: string;
    subtitle: string;
    value: string;
    options: Array<{ value: string; label: string; [key: string]: any }>;
    onChange: (v: string) => void;
    renderOption?: (opt: any) => string;
}> = ({ icon: Icon, label, subtitle, value, options, onChange, renderOption }) => (
    <div className="px-5 py-4">
        <div className="flex items-center gap-3.5 mb-3">
            <div className="w-9 h-9 rounded-xl bg-[#C08B5C]/[0.08] flex items-center justify-center flex-shrink-0">
                <Icon className="w-[18px] h-[18px] text-[#D4A27F]" />
            </div>
            <div className="flex-1 min-w-0">
                <h4 className="text-[13px] font-medium text-foreground/85">{label}</h4>
                <p className="text-[11px] text-muted-foreground/60 mt-0.5">{subtitle}</p>
            </div>
        </div>
        <div className="ml-[52px] relative">
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-background border border-black/[0.08] text-[12px] text-foreground/80 appearance-none cursor-pointer focus:outline-none focus:border-[#C08B5C]/40 focus:ring-1 focus:ring-[#C08B5C]/20 transition-all"
            >
                {options.map(o => (
                    <option key={o.value} value={o.value} style={{ backgroundColor: 'hsl(var(--surface-elevated))' }}>
                        {renderOption ? renderOption(o) : o.label}
                    </option>
                ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50 pointer-events-none" />
        </div>
    </div>
);

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

    return (
        <div className="h-full flex flex-col bg-background">
            {/* Header */}
            <header className="flex items-center gap-4 px-8 py-5 border-b border-black/[0.06] bg-background/80 backdrop-blur-md sticky top-0 z-20">
                <button
                    onClick={onBack}
                    className="w-8 h-8 rounded-lg hover:bg-black/[0.03] border border-transparent hover:border-black/[0.08] flex items-center justify-center transition-all group -ml-2"
                >
                    <ArrowLeft className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </button>
                <div className="flex-1">
                    <h1 className="text-lg font-medium text-foreground tracking-tight">Language & Region</h1>
                    <p className="text-[11px] text-muted-foreground/50 mt-0.5">Language, timezone, and display formats</p>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto">
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={stagger}
                    className="max-w-2xl mx-auto px-8 py-8 space-y-6"
                >
                    {/* ── AI Response Language ── */}
                    <motion.div variants={reveal}>
                        <h2 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 mb-3 px-1">Language</h2>
                        <div className="rounded-2xl bg-black/[0.02] border border-black/[0.06] backdrop-blur-sm overflow-hidden">
                            <div className="p-6 border-b border-black/[0.04]">
                                <div className="flex items-center gap-3.5 mb-5">
                                    <div className="w-9 h-9 rounded-xl bg-[#C08B5C]/[0.08] flex items-center justify-center flex-shrink-0">
                                        <Globe className="w-[18px] h-[18px] text-[#D4A27F]" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-medium text-foreground">Display & AI Language</h4>
                                        <p className="text-[11px] text-muted-foreground/60 mt-0.5">Vasthu will respond in your selected language</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2 max-h-[260px] overflow-y-auto pr-1 scrollbar-hide">
                                    {LANGUAGES.map((lang) => {
                                        const selected = language === lang.value;
                                        return (
                                            <motion.button
                                                key={lang.value}
                                                onClick={() => setLanguage(lang.value)}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.97 }}
                                                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all ${
                                                    selected
                                                        ? 'bg-[#C08B5C]/15 border border-[#C08B5C]/30 shadow-sm shadow-[#C08B5C]/5'
                                                        : 'bg-background border border-black/[0.06] hover:border-black/[0.10]'
                                                }`}
                                            >
                                                <span className="text-[15px] flex-shrink-0">{lang.flag}</span>
                                                <div className="flex-1 min-w-0">
                                                    <span className={`text-[11px] font-medium block truncate ${selected ? 'text-[#D4A27F]' : 'text-muted-foreground/80'}`}>
                                                        {lang.native}
                                                    </span>
                                                    <span className="text-[9px] text-muted-foreground/50 block truncate">{lang.label}</span>
                                                </div>
                                                {selected && <Check className="w-3.5 h-3.5 text-[#C08B5C] flex-shrink-0" />}
                                            </motion.button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="px-6 py-3.5 flex items-center gap-2.5">
                                <MessageSquare className="w-3.5 h-3.5 text-muted-foreground/40 flex-shrink-0" />
                                <p className="text-[10px] text-muted-foreground/50 leading-relaxed">
                                    Vasthu will understand messages in any language, but will reply in <span className="text-muted-foreground/70 font-medium">{getLanguageDisplayName(language)}</span>.
                                    You can also quickly switch languages from the{' '}
                                    <span className="text-muted-foreground/70 font-medium">
                                        <Globe className="w-3 h-3 inline-block -mt-0.5 mx-0.5" />
                                        globe icon
                                    </span>{' '}
                                    in the chat input bar.
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* ── Region Settings ── */}
                    <motion.div variants={reveal}>
                        <h2 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 mb-3 px-1">Region</h2>
                        <div className="rounded-2xl bg-black/[0.02] border border-black/[0.06] backdrop-blur-sm divide-y divide-black/[0.04] overflow-hidden">
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
                    </motion.div>

                    {/* ── Format Settings ── */}
                    <motion.div variants={reveal}>
                        <h2 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 mb-3 px-1">Format</h2>
                        <div className="rounded-2xl bg-black/[0.02] border border-black/[0.06] backdrop-blur-sm divide-y divide-black/[0.04] overflow-hidden">
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
                            <div className="px-5 py-4">
                                <div className="flex items-center gap-3.5 mb-3">
                                    <div className="w-9 h-9 rounded-xl bg-[#C08B5C]/[0.08] flex items-center justify-center flex-shrink-0">
                                        <Clock className="w-[18px] h-[18px] text-[#D4A27F]" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-[13px] font-medium text-foreground/85">Time Format</h4>
                                        <p className="text-[11px] text-muted-foreground/60 mt-0.5">12-hour or 24-hour clock</p>
                                    </div>
                                </div>
                                <div className="ml-[52px] grid grid-cols-2 gap-2.5">
                                    {[
                                        { v: '12h' as const, l: '12-hour', example: '3:00 PM' },
                                        { v: '24h' as const, l: '24-hour', example: '15:00' },
                                    ].map(tf => (
                                        <motion.button
                                            key={tf.v}
                                            onClick={() => setTimeFormat(tf.v)}
                                            whileHover={{ scale: 1.03 }}
                                            whileTap={{ scale: 0.97 }}
                                            className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border text-[12px] font-medium transition-all ${
                                                timeFormat === tf.v
                                                    ? 'border-[#C08B5C] bg-[#C08B5C]/10 text-[#D4A27F] shadow-sm shadow-[#C08B5C]/10'
                                                    : 'border-black/[0.08] bg-background text-muted-foreground hover:border-black/[0.12] hover:text-foreground/70'
                                            }`}
                                        >
                                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                                timeFormat === tf.v ? 'border-[#C08B5C]' : 'border-black/12'
                                            }`}>
                                                {timeFormat === tf.v && <div className="w-2 h-2 rounded-full bg-[#C08B5C]" />}
                                            </div>
                                            <div>
                                                <span>{tf.l}</span>
                                                <span className="text-[10px] text-muted-foreground/50 ml-1.5">({tf.example})</span>
                                            </div>
                                        </motion.button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* ── Preview ── */}
                    <motion.div variants={reveal}>
                        <h2 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 mb-3 px-1">Preview</h2>
                        <div className="rounded-2xl bg-black/[0.02] border border-black/[0.06] backdrop-blur-sm p-5 space-y-3">
                            {[
                                { l: 'Language', v: currentLang ? `${currentLang.flag} ${currentLang.native}` : language },
                                { l: 'Date', v: dateFormat.replace('MM', '02').replace('DD', '07').replace('YYYY', '2026') },
                                { l: 'Time', v: timeFormat === '12h' ? '3:45 PM' : '15:45' },
                                { l: 'Price', v: `${currentCurrency?.symbol || '$'}250,000` },
                            ].map(p => (
                                <div key={p.l} className="flex items-center justify-between">
                                    <span className="text-[11px] text-muted-foreground/60">{p.l}</span>
                                    <span className="text-[12px] font-medium text-foreground/75">{p.v}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    <div className="h-4" />
                </motion.div>
            </div>
        </div>
    );
};
