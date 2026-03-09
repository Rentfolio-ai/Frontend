/**
 * Appearance Page — Refined
 *
 * Persists to preferencesStore. Organized into:
 *   1. Theme — visual mini-previews of light / dark / system
 *   2. Accent Color — pick the UI accent
 *   3. Font Size — segmented control with live preview
 *   4. Chat Display — density & bubble style
 *   5. Accessibility — reduced motion, high contrast, keyboard hints
 */

import React from 'react';
import {
    ArrowLeft,
    Sun,
    Layout,
    Eye,
    Keyboard,
    Type,
    MessageSquare,
    Sparkles,
    Check,
    Minus,
    AlignLeft,
    AlignJustify,
} from 'lucide-react';
import { usePreferencesStore } from '../../stores/preferencesStore';

interface AppearancePageProps {
    onBack: () => void;
}

// ── Toggle ────────────────────────────────────────────────────────────────────

const Toggle: React.FC<{ enabled: boolean; onToggle: () => void }> = ({ enabled, onToggle }) => (
    <button
        onClick={onToggle}
        className={`relative w-10 h-[22px] rounded-full transition-colors flex-shrink-0 ${enabled ? 'bg-[#C08B5C]' : 'bg-black/[0.08]'}`}
    >
        <div className={`absolute top-[2px] w-[18px] h-[18px] rounded-full bg-white shadow-sm transition-transform ${enabled ? 'translate-x-[22px]' : 'translate-x-[2px]'}`} />
    </button>
);

// ── Accent colors ─────────────────────────────────────────────────────────────

const ACCENT_COLORS = [
    { id: 'copper', label: 'Copper', swatch: 'bg-[#C08B5C]', ring: 'ring-[#C08B5C]' },
    { id: 'blue', label: 'Blue', swatch: 'bg-blue-500', ring: 'ring-blue-500' },
    { id: 'violet', label: 'Violet', swatch: 'bg-violet-500', ring: 'ring-violet-500' },
    { id: 'rose', label: 'Rose', swatch: 'bg-rose-500', ring: 'ring-rose-500' },
    { id: 'amber', label: 'Amber', swatch: 'bg-amber-500', ring: 'ring-amber-500' },
    { id: 'emerald', label: 'Emerald', swatch: 'bg-emerald-500', ring: 'ring-emerald-500' },
] as const;

// ── Component ─────────────────────────────────────────────────────────────────

export const AppearancePage: React.FC<AppearancePageProps> = ({ onBack }) => {
    // All preferences persisted via Zustand + localStorage
    const {
        theme, setTheme,
        isWideMode, setWideMode,
        showKeyboardHints, setShowKeyboardHints,
        accentColor, setAccentColor,
        fontSize, setFontSize,
        chatDensity, setChatDensity,
        reducedMotion, setReducedMotion,
        highContrast, setHighContrast,
    } = usePreferencesStore();

    // ── Theme data ────────────────────────────────────────────────────────────

    const themes = [
        {
            id: 'light' as const,
            label: 'Peach Cream',
            icon: Sun,
            sidebar: 'bg-[#F7ECE2]',
            bg: 'bg-[#F3E4D6]',
            text: 'bg-[#DDD1C6]',
            accent: 'bg-[#C08B5C]',
            bubble: 'bg-[#EBDDD0]',
        },
    ];

    const fontSizes = [
        { id: 'small' as const, label: 'S', desc: 'Small', px: '12px' },
        { id: 'medium' as const, label: 'M', desc: 'Default', px: '14px' },
        { id: 'large' as const, label: 'L', desc: 'Large', px: '16px' },
    ];

    const densities = [
        { id: 'compact' as const, label: 'Compact', icon: AlignJustify, gap: 'gap-0.5' },
        { id: 'comfortable' as const, label: 'Comfortable', icon: AlignLeft, gap: 'gap-1' },
        { id: 'spacious' as const, label: 'Spacious', icon: Minus, gap: 'gap-2' },
    ];

    // ── Render ────────────────────────────────────────────────────────────────

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
                <div>
                    <h1 className="text-lg font-medium text-foreground tracking-tight">Appearance</h1>
                    <p className="text-[11px] text-muted-foreground/50 mt-0.5">Customize how Vasthu looks and feels</p>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto">
                <div className="max-w-2xl mx-auto px-8 py-8 space-y-6">

                    {/* ── Theme ── */}
                    <div>
                        <h2 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 mb-3 px-1">
                            Theme
                        </h2>
                        <div className="grid grid-cols-3 gap-2.5">
                            {themes.map((t) => {
                                const Icon = t.icon;
                                const selected = theme === t.id;
                                return (
                                    <button
                                        key={t.id}
                                        onClick={() => setTheme(t.id)}
                                        className={`relative rounded-xl border-2 transition-all overflow-hidden ${
                                            selected
                                                ? 'border-[#C08B5C] shadow-lg shadow-[#C08B5C]/10'
                                                : 'border-black/[0.06] hover:border-black/[0.10]'
                                        }`}
                                    >
                                        {/* Mini app preview */}
                                        <div className="p-2 pb-0">
                                            <div className="rounded-t-lg overflow-hidden flex h-[52px]">
                                                {/* Mini sidebar */}
                                                <div className={`w-[18px] ${t.sidebar} flex flex-col items-center pt-1.5 gap-1`}>
                                                    <div className="w-2 h-2 rounded-sm bg-black/12" />
                                                    <div className="w-2 h-2 rounded-sm bg-black/8" />
                                                    <div className="w-2 h-2 rounded-sm bg-black/8" />
                                                </div>
                                                {/* Mini main area */}
                                                <div className={`flex-1 ${t.bg} p-1.5 flex flex-col gap-1`}>
                                                    <div className={`h-1.5 w-8 rounded-full ${t.text} opacity-60`} />
                                                    <div className={`h-3 w-full rounded ${t.bubble} opacity-50`} />
                                                    <div className={`h-2 w-10 rounded-full ${t.accent} opacity-70 self-end`} />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Label */}
                                        <div className={`px-2 py-2 flex items-center justify-center gap-1.5 ${
                                            selected ? 'bg-[#C08B5C]/10' : 'bg-black/[0.02]'
                                        }`}>
                                            <Icon className={`w-3 h-3 ${selected ? 'text-[#D4A27F]' : 'text-muted-foreground/60'}`} />
                                            <span className={`text-[11px] font-medium ${selected ? 'text-[#D4A27F]' : 'text-muted-foreground'}`}>
                                                {t.label}
                                            </span>
                                        </div>

                                        {/* Check badge */}
                                        {selected && (
                                            <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#C08B5C] flex items-center justify-center">
                                                <Check className="w-2.5 h-2.5 text-white" />
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* ── Accent Color ── */}
                    <div>
                        <h2 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 mb-3 px-1">
                            Accent Color
                        </h2>
                        <div className="rounded-2xl bg-black/[0.02] border border-black/[0.06] backdrop-blur-sm p-4">
                            <div className="flex items-center gap-3">
                                {ACCENT_COLORS.map((c) => {
                                    const selected = accentColor === c.id;
                                    return (
                                        <button
                                            key={c.id}
                                            onClick={() => setAccentColor(c.id)}
                                            className="flex flex-col items-center gap-1.5 group"
                                            title={c.label}
                                        >
                                            <div className={`w-7 h-7 rounded-full ${c.swatch} transition-all flex items-center justify-center ${
                                                selected ? `ring-2 ${c.ring} ring-offset-2 ring-offset-background scale-110` : 'opacity-60 group-hover:opacity-90'
                                            }`}>
                                                {selected && <Check className="w-3 h-3 text-white" />}
                                            </div>
                                            <span className={`text-[9px] font-medium ${selected ? 'text-foreground/70' : 'text-muted-foreground/50'}`}>
                                                {c.label}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* ── Font Size ── */}
                    <div>
                        <h2 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 mb-3 px-1">
                            Font Size
                        </h2>
                        <div className="rounded-2xl bg-black/[0.02] border border-black/[0.06] backdrop-blur-sm p-4 space-y-3">
                            {/* Segmented control */}
                            <div className="flex gap-1.5 p-1 rounded-lg bg-black/[0.03]">
                                {fontSizes.map((f) => {
                                    const selected = fontSize === f.id;
                                    return (
                                        <button
                                            key={f.id}
                                            onClick={() => setFontSize(f.id)}
                                            className={`flex-1 py-2 rounded-md text-center transition-all ${
                                                selected
                                                    ? 'bg-[#C08B5C] text-white shadow-sm'
                                                    : 'text-muted-foreground/70 hover:text-muted-foreground hover:bg-black/[0.03]'
                                            }`}
                                        >
                                            <span className="text-[13px] font-bold">{f.label}</span>
                                            <span className={`block text-[9px] mt-0.5 ${selected ? 'text-foreground/70' : 'text-muted-foreground/50'}`}>
                                                {f.desc}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Live preview */}
                            <div className="rounded-lg bg-black/[0.03] border border-black/[0.04] p-3">
                                <div className="flex items-center gap-2 mb-1.5">
                                    <Type className="w-3 h-3 text-muted-foreground/50" />
                                    <span className="text-[9px] uppercase tracking-wider text-muted-foreground/50 font-semibold">Preview</span>
                                </div>
                                <p style={{ fontSize: fontSizes.find((f) => f.id === fontSize)?.px }} className="text-foreground/70 leading-relaxed">
                                    This property at 123 Main St has a projected cash flow of $450/mo with a 7.2% cap rate.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* ── Chat Display ── */}
                    <div>
                        <div className="flex items-center gap-2 mb-2.5 px-1">
                            <MessageSquare className="w-3 h-3 text-muted-foreground/50" />
                            <h2 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
                                Chat Display
                            </h2>
                        </div>
                        <div className="rounded-2xl bg-black/[0.02] border border-black/[0.06] backdrop-blur-sm p-4 space-y-3">
                            {/* Message density */}
                            <div>
                                <p className="text-[11px] text-muted-foreground/70 mb-2">Message spacing</p>
                                <div className="flex gap-1.5">
                                    {densities.map((d) => {
                                        const _Icon = d.icon;
                                        const selected = chatDensity === d.id;
                                        return (
                                            <button
                                                key={d.id}
                                                onClick={() => setChatDensity(d.id)}
                                                className={`flex-1 flex flex-col items-center gap-1.5 py-2.5 rounded-lg border transition-all ${
                                                    selected
                                                        ? 'border-[#C08B5C]/30 bg-[#C08B5C]/[0.06]'
                                                        : 'border-black/[0.06] bg-black/[0.02] hover:bg-black/[0.03]'
                                                }`}
                                            >
                                                {/* Mini density preview */}
                                                <div className={`flex flex-col ${d.gap} w-8`}>
                                                    <div className="h-1 w-full rounded-full bg-black/10" />
                                                    <div className="h-1 w-5 rounded-full bg-[#C08B5C]/40 self-end" />
                                                    <div className="h-1 w-full rounded-full bg-black/10" />
                                                </div>
                                                <span className={`text-[10px] font-medium ${selected ? 'text-[#D4A27F]' : 'text-muted-foreground/70'}`}>
                                                    {d.label}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Wide mode toggle */}
                            <div className="flex items-center gap-3 pt-2 border-t border-black/[0.04]">
                                <div className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 ${isWideMode ? 'bg-[#C08B5C]/10' : 'bg-black/[0.03]'}`}>
                                    <Layout className={`w-3.5 h-3.5 ${isWideMode ? 'text-[#D4A27F]' : 'text-muted-foreground/50'}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-[12px] font-medium text-foreground/75">Wide Mode</h4>
                                    <p className="text-[10px] text-muted-foreground/50">Expand chat to full width</p>
                                </div>
                                <Toggle enabled={isWideMode} onToggle={() => setWideMode(!isWideMode)} />
                            </div>
                        </div>
                    </div>

                    {/* ── Accessibility ── */}
                    <div>
                        <div className="flex items-center gap-2 mb-2.5 px-1">
                            <Sparkles className="w-3 h-3 text-muted-foreground/50" />
                            <h2 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
                                Accessibility
                            </h2>
                        </div>
                        <div className="rounded-2xl bg-black/[0.02] border border-black/[0.06] backdrop-blur-sm divide-y divide-black/[0.04] overflow-hidden">
                            {/* Reduced Motion */}
                            <div className="flex items-center gap-3 px-3.5 py-2.5">
                                <div className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 ${reducedMotion ? 'bg-[#C08B5C]/10' : 'bg-black/[0.03]'}`}>
                                    <Eye className={`w-3.5 h-3.5 ${reducedMotion ? 'text-[#D4A27F]' : 'text-muted-foreground/50'}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-[12px] font-medium text-foreground/75">Reduced Motion</h4>
                                    <p className="text-[10px] text-muted-foreground/50">Minimize animations and transitions</p>
                                </div>
                                <Toggle enabled={reducedMotion} onToggle={() => setReducedMotion(!reducedMotion)} />
                            </div>

                            {/* High Contrast */}
                            <div className="flex items-center gap-3 px-3.5 py-2.5">
                                <div className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 ${highContrast ? 'bg-[#C08B5C]/10' : 'bg-black/[0.03]'}`}>
                                    <Sun className={`w-3.5 h-3.5 ${highContrast ? 'text-[#D4A27F]' : 'text-muted-foreground/50'}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-[12px] font-medium text-foreground/75">High Contrast</h4>
                                    <p className="text-[10px] text-muted-foreground/50">Increase text and border contrast</p>
                                </div>
                                <Toggle enabled={highContrast} onToggle={() => setHighContrast(!highContrast)} />
                            </div>

                            {/* Keyboard Hints */}
                            <div className="flex items-center gap-3 px-3.5 py-2.5">
                                <div className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 ${showKeyboardHints ? 'bg-[#C08B5C]/10' : 'bg-black/[0.03]'}`}>
                                    <Keyboard className={`w-3.5 h-3.5 ${showKeyboardHints ? 'text-[#D4A27F]' : 'text-muted-foreground/50'}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-[12px] font-medium text-foreground/75">Keyboard Shortcuts</h4>
                                    <p className="text-[10px] text-muted-foreground/50">Show shortcut hints in the UI</p>
                                </div>
                                <Toggle enabled={showKeyboardHints} onToggle={() => setShowKeyboardHints(!showKeyboardHints)} />
                            </div>
                        </div>
                    </div>

                    {/* Bottom spacer */}
                    <div className="h-4" />
                </div>
            </div>
        </div>
    );
};
