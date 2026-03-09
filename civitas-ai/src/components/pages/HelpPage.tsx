/**
 * Help & Support Page
 *
 * Resources hub with inline sub-pages:
 *   - Documentation (guides & tutorials)
 *   - Video Tutorials (step-by-step walkthroughs)
 *   - Community (discussions & connect)
 *   - API Docs (technical reference)
 *   - FAQ
 *   - Contact Support
 */

import React, { useState } from 'react';
import {
    ArrowLeft,
    Search,
    Book,
    ChevronRight,
    ChevronDown,
    X,
    Mail,
    Zap,
    Shield,
    BookOpen,
    Layers,
    BarChart3,
    Home,
    TrendingUp,
    Settings,
    Sparkles,
} from 'lucide-react';

interface HelpPageProps {
    onBack: () => void;
    onNavigateToContact?: () => void;
}

// ── Types ─────────────────────────────────────────────────────────────────────

type SubPage = null | 'docs';

// ── FAQ Item ──────────────────────────────────────────────────────────────────

const FAQItem: React.FC<{ question: string; answer: string }> = ({ question, answer }) => {
    const [open, setOpen] = useState(false);
    return (
        <button onClick={() => setOpen(!open)} className="w-full text-left px-3.5 py-2.5 transition-colors hover:bg-black/[0.02]">
            <div className="flex items-center justify-between gap-3">
                <h4 className="text-[13px] font-medium text-foreground/75">{question}</h4>
                <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground/50 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
            </div>
            {open && <p className="mt-2 text-[12px] text-muted-foreground/70 leading-relaxed pr-6">{answer}</p>}
        </button>
    );
};

// ── Sub-page header ───────────────────────────────────────────────────────────

const SubPageHeader: React.FC<{
    title: string;
    subtitle: string;
    icon: React.ElementType;
    iconColor: string;
    iconBg: string;
    onBack: () => void;
}> = ({ title, subtitle, icon: Icon, iconColor, iconBg, onBack }) => (
    <div className="flex items-center gap-3 px-5 py-3.5 border-b border-black/[0.08]">
        <button
            onClick={onBack}
            className="w-8 h-8 rounded-lg bg-black/[0.04] hover:bg-black/[0.06] flex items-center justify-center transition-colors"
        >
            <ArrowLeft className="w-4 h-4 text-muted-foreground" />
        </button>
        <div className={`w-8 h-8 rounded-lg ${iconBg} flex items-center justify-center flex-shrink-0`}>
            <Icon className={`w-4 h-4 ${iconColor}`} />
        </div>
        <div>
            <h1 className="text-lg font-semibold text-foreground">{title}</h1>
            <p className="text-[11px] text-muted-foreground/60">{subtitle}</p>
        </div>
    </div>
);

// ── Doc card ──────────────────────────────────────────────────────────────────

const DocCard: React.FC<{
    icon: React.ElementType;
    title: string;
    desc: string;
    color: string;
    bg: string;
    tag?: string;
}> = ({ icon: Icon, title, desc, color, bg, tag }) => (
    <button className="flex items-start gap-4 p-4 rounded-lg bg-black/[0.02] border border-black/[0.06] hover:bg-black/[0.04] hover:border-[#C08B5C]/20 transition-all text-left group w-full group">
        <div className={`w-10 h-10 rounded-md ${bg} flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-[#C08B5C]/10 transition-colors`}>
            <Icon className={`w-5 h-5 ${color} group-hover:text-[#D4A27F] transition-colors`} />
        </div>
        <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5">
                <h3 className="text-[13px] font-medium text-foreground group-hover:text-foreground transition-colors">{title}</h3>
                {tag && (
                    <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#C08B5C] text-black">
                        {tag}
                    </span>
                )}
            </div>
            <p className="text-[11px] text-muted-foreground/70 mt-1 leading-relaxed group-hover:text-muted-foreground transition-colors">{desc}</p>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-[#C08B5C]/50 transition-colors flex-shrink-0 mt-2" />
    </button>
);



// ══════════════════════════════════════════════════════════════════════════════
// DOCUMENTATION SUB-PAGE
// ══════════════════════════════════════════════════════════════════════════════

const DocumentationPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const gettingStarted = [
        { icon: Sparkles, title: 'Quick Start Guide', desc: 'Get up and running in under 5 minutes. Set up your account, configure preferences, and run your first analysis.', color: 'text-[#D4A27F]', bg: 'bg-[#C08B5C]/10', tag: 'Start here' },
        { icon: Home, title: 'Understanding Property Analysis', desc: 'Learn how Vasthu evaluates properties using cash flow, cap rate, ROI, and other key metrics.', color: 'text-foreground/70', bg: 'bg-black/[0.04]' },
        { icon: Settings, title: 'Setting Up Investment Preferences', desc: 'Configure your buy box, budget, strategy (STR/LTR/Flip), and financial assumptions.', color: 'text-foreground/70', bg: 'bg-black/[0.04]' },
    ];

    const features = [
        { icon: TrendingUp, title: 'Agent Modes: Deep Search, Deep Research, Expert Strategist', desc: 'Deep dive into each reasoning mode, when to use them, and how they differ.', color: 'text-foreground/70', bg: 'bg-black/[0.04]' },
        { icon: BarChart3, title: 'Reports & Deal Analysis', desc: 'Generate PDF reports, compare properties side-by-side, and run P&L scenarios.', color: 'text-foreground/70', bg: 'bg-black/[0.04]' },
        { icon: Layers, title: 'Portfolio Tracking', desc: 'Add properties to your portfolio, track performance, and get rebalancing suggestions.', color: 'text-foreground/70', bg: 'bg-black/[0.04]' },
        { icon: BookOpen, title: 'Market Research', desc: 'Analyze market trends, compare neighborhoods, and identify emerging investment areas.', color: 'text-foreground/70', bg: 'bg-black/[0.04]' },
    ];

    const advanced = [
        { icon: Zap, title: 'Inline Actions & Smart Suggestions', desc: 'How Vasthu suggests next steps and actions you can take directly from the chat.', color: 'text-foreground/70', bg: 'bg-black/[0.04]' },
        { icon: Shield, title: 'Data Privacy & Security', desc: 'How we handle your data, encryption practices, and compliance standards.', color: 'text-foreground/70', bg: 'bg-black/[0.04]' },
    ];

    return (
        <div className="h-full flex flex-col bg-background">
            <SubPageHeader title="Documentation" subtitle="Guides, tutorials, and references" icon={Book} iconColor="text-[#D4A27F]" iconBg="bg-[#C08B5C]/15" onBack={onBack} />
            <div className="flex-1 overflow-y-auto px-6 py-5">
                <div className="max-w-3xl mx-auto space-y-8">
                    <div>
                        <h2 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70 mb-3 px-1 font-mono">Getting Started</h2>
                        <div className="space-y-3">{gettingStarted.map((d) => <DocCard key={d.title} {...d} color="text-muted-foreground" bg="bg-black/[0.03]" />)}</div>
                    </div>
                    <div>
                        <h2 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70 mb-3 px-1 font-mono">Features</h2>
                        <div className="space-y-3">{features.map((d) => <DocCard key={d.title} {...d} color="text-muted-foreground" bg="bg-black/[0.03]" />)}</div>
                    </div>
                    <div>
                        <h2 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70 mb-3 px-1 font-mono">Advanced</h2>
                        <div className="space-y-3">{advanced.map((d) => <DocCard key={d.title} {...d} color="text-muted-foreground" bg="bg-black/[0.03]" />)}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};







// ══════════════════════════════════════════════════════════════════════════════
// MAIN HELP PAGE
// ══════════════════════════════════════════════════════════════════════════════

export const HelpPage: React.FC<HelpPageProps> = ({ onBack, onNavigateToContact }) => {
    const [search, setSearch] = useState('');
    const [subPage, setSubPage] = useState<SubPage>(null);

    const resources = [
        { key: 'docs' as const, icon: Book, title: 'Documentation', subtitle: 'Guides and tutorials', color: 'text-foreground/70', bg: 'bg-black/[0.04]' },
    ];

    const faqs = [
        { q: 'How do I set my investment preferences?', a: 'Go to Settings > Investment Preferences to configure your buy box, budget, strategy, and other criteria. This helps Vasthu provide personalized property recommendations.' },
        { q: 'What are the different reasoning modes?', a: 'Vasthu has three modes: Deep Search (in-depth property analysis), Deep Research (comprehensive market research), and Expert Strategist (portfolio strategy and wealth planning). Switch modes from the chat input area.' },
        { q: 'How do I analyze a property deal?', a: 'Simply ask Vasthu about a property or paste a listing URL. The AI will analyze cash flow, ROI, cap rate, and other metrics based on your investment strategy.' },
        { q: 'Can I save properties and reports?', a: 'Yes! Bookmark properties for later review and generate reports for detailed analysis. All saved items are accessible from the sidebar.' },
        { q: 'How does billing work?', a: 'Free plan includes 2 analyses/month and 2 reports. Pro plan ($100/mo, 50% off first month) gives unlimited access to all features. Report downloads are $2 each.' },
    ];

    // ── Sub-page routing ──────────────────────────────────────────────────────
    if (subPage === 'docs') return <DocumentationPage onBack={() => setSubPage(null)} />;


    // ── Main help page ────────────────────────────────────────────────────────
    return (
        <div className="h-full flex flex-col bg-background">
            <div className="flex items-center gap-3 px-5 py-3.5 border-b border-black/[0.08]">
                <button onClick={onBack} className="w-8 h-8 rounded-lg bg-black/[0.04] hover:bg-black/[0.06] flex items-center justify-center transition-colors">
                    <ArrowLeft className="w-4 h-4 text-muted-foreground" />
                </button>
                <div>
                    <h1 className="text-lg font-semibold text-foreground">Help & Support</h1>
                    <p className="text-[11px] text-muted-foreground/60">Get assistance with Vasthu</p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
                <div className="max-w-2xl mx-auto space-y-5">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50" />
                        <input
                            type="text"
                            placeholder="Search for help..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full h-9 pl-9 pr-8 bg-black/[0.05] border border-black/[0.08] rounded-lg text-[12px] text-foreground/80 placeholder:text-muted-foreground/50 focus:outline-none focus:border-black/[0.12] transition-all"
                        />
                        {search && (
                            <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2">
                                <X className="w-3 h-3 text-muted-foreground/50" />
                            </button>
                        )}
                    </div>

                    {/* Resources */}
                    <div>
                        <h2 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 mb-2 px-1 font-mono">Resources</h2>
                        <div className="grid grid-cols-2 gap-2.5">
                            {resources.map((r) => {
                                const Icon = r.icon;
                                return (
                                    <button
                                        key={r.key}
                                        onClick={() => setSubPage(r.key)}
                                        className="flex items-center gap-3 p-3 rounded-xl bg-black/[0.02] border border-black/[0.06] hover:bg-black/[0.04] hover:border-black/[0.08] transition-all group text-left"
                                    >
                                        <div className={`w-8 h-8 rounded-lg ${r.bg} flex items-center justify-center flex-shrink-0`}>
                                            <Icon className={`w-4 h-4 ${r.color}`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-[12px] font-medium text-foreground/75 font-sans">{r.title}</h3>
                                            <p className="text-[10px] text-muted-foreground/50 font-sans">{r.subtitle}</p>
                                        </div>
                                        <ChevronRight className="w-3 h-3 text-muted-foreground/40 group-hover:text-muted-foreground/50 transition-colors flex-shrink-0" />
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* FAQ */}
                    <div>
                        <h2 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 mb-2 px-1 font-mono">FAQ</h2>
                        <div className="rounded-xl bg-black/[0.02] border border-black/[0.06] divide-y divide-black/[0.04] overflow-hidden">
                            {faqs.map((f) => <FAQItem key={f.q} question={f.q} answer={f.a} />)}
                        </div>
                    </div>

                    {/* Contact */}
                    <div className="rounded-xl bg-[#C08B5C]/[0.06] border border-[#C08B5C]/15 p-4 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-[#C08B5C]/15 flex items-center justify-center flex-shrink-0">
                            <Mail className="w-4 h-4 text-[#D4A27F]" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-[13px] font-medium text-foreground/80">Still need help?</h3>
                            <p className="text-[11px] text-muted-foreground/60">Our support team is here to assist you</p>
                        </div>
                        <button
                            onClick={onNavigateToContact}
                            className="px-3 py-1.5 rounded-lg bg-[#C08B5C] text-white text-[11px] font-medium hover:bg-[#A8734A] transition-colors"
                        >
                            Contact
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
