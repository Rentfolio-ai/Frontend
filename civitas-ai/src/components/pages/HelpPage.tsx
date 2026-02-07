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
    MessageCircle,
    Video,
    FileText,
    ChevronRight,
    ChevronDown,
    X,
    Mail,
    Play,
    Clock,
    Users,
    Github,
    Hash,
    Trophy,
    Code,
    Zap,
    Shield,
    Database,
    Webhook,
    Terminal,
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

type SubPage = null | 'docs' | 'videos' | 'community' | 'api';

// ── FAQ Item ──────────────────────────────────────────────────────────────────

const FAQItem: React.FC<{ question: string; answer: string }> = ({ question, answer }) => {
    const [open, setOpen] = useState(false);
    return (
        <button onClick={() => setOpen(!open)} className="w-full text-left px-3.5 py-2.5 transition-colors hover:bg-white/[0.02]">
            <div className="flex items-center justify-between gap-3">
                <h4 className="text-[13px] font-medium text-white/75">{question}</h4>
                <ChevronDown className={`w-3.5 h-3.5 text-white/25 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
            </div>
            {open && <p className="mt-2 text-[12px] text-white/40 leading-relaxed pr-6">{answer}</p>}
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
    <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/[0.08]">
        <button
            onClick={onBack}
            className="w-8 h-8 rounded-lg bg-white/[0.05] hover:bg-white/[0.08] flex items-center justify-center transition-colors"
        >
            <ArrowLeft className="w-4 h-4 text-white/60" />
        </button>
        <div className={`w-8 h-8 rounded-lg ${iconBg} flex items-center justify-center flex-shrink-0`}>
            <Icon className={`w-4 h-4 ${iconColor}`} />
        </div>
        <div>
            <h1 className="text-lg font-semibold text-white/90">{title}</h1>
            <p className="text-[11px] text-white/35">{subtitle}</p>
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
    <button className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] hover:border-white/[0.1] transition-all text-left group w-full">
        <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
            <Icon className={`w-4 h-4 ${color}`} />
        </div>
        <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
                <h3 className="text-[12px] font-medium text-white/80">{title}</h3>
                {tag && (
                    <span className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-[#C08B5C]/15 text-[#D4A27F]">
                        {tag}
                    </span>
                )}
            </div>
            <p className="text-[10px] text-white/35 mt-0.5 leading-relaxed">{desc}</p>
        </div>
        <ChevronRight className="w-3 h-3 text-white/15 group-hover:text-white/30 transition-colors flex-shrink-0 mt-1" />
    </button>
);

// ── Video card ────────────────────────────────────────────────────────────────

const VideoCard: React.FC<{
    title: string;
    duration: string;
    desc: string;
    thumbnail: string;
    tag?: string;
}> = ({ title, duration, desc, thumbnail, tag }) => (
    <button className="rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] hover:border-white/[0.1] transition-all text-left group overflow-hidden w-full">
        {/* Thumbnail */}
        <div className={`h-24 ${thumbnail} relative flex items-center justify-center`}>
            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/30 transition-colors">
                <Play className="w-4 h-4 text-white ml-0.5" />
            </div>
            <div className="absolute bottom-1.5 right-1.5 flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/60 text-[9px] text-white/80">
                <Clock className="w-2.5 h-2.5" />
                {duration}
            </div>
            {tag && (
                <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-[#C08B5C] text-white">
                    {tag}
                </div>
            )}
        </div>
        {/* Info */}
        <div className="p-2.5">
            <h3 className="text-[12px] font-medium text-white/80 mb-0.5">{title}</h3>
            <p className="text-[10px] text-white/35 leading-relaxed">{desc}</p>
        </div>
    </button>
);

// ══════════════════════════════════════════════════════════════════════════════
// DOCUMENTATION SUB-PAGE
// ══════════════════════════════════════════════════════════════════════════════

const DocumentationPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const gettingStarted = [
        { icon: Sparkles, title: 'Quick Start Guide', desc: 'Get up and running in under 5 minutes. Set up your account, configure preferences, and run your first analysis.', color: 'text-[#D4A27F]', bg: 'bg-[#C08B5C]/10', tag: 'Start here' },
        { icon: Home, title: 'Understanding Property Analysis', desc: 'Learn how Vasthu evaluates properties using cash flow, cap rate, ROI, and other key metrics.', color: 'text-blue-400', bg: 'bg-blue-500/10' },
        { icon: Settings, title: 'Setting Up Investment Preferences', desc: 'Configure your buy box, budget, strategy (STR/LTR/Flip), and financial assumptions.', color: 'text-violet-400', bg: 'bg-violet-500/10' },
    ];

    const features = [
        { icon: TrendingUp, title: 'Agent Modes: Hunter, Research, Strategist', desc: 'Deep dive into each reasoning mode, when to use them, and how they differ.', color: 'text-amber-400', bg: 'bg-amber-500/10' },
        { icon: BarChart3, title: 'Reports & Deal Analysis', desc: 'Generate PDF reports, compare properties side-by-side, and run P&L scenarios.', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
        { icon: Layers, title: 'Portfolio Tracking', desc: 'Add properties to your portfolio, track performance, and get rebalancing suggestions.', color: 'text-rose-400', bg: 'bg-rose-500/10' },
        { icon: BookOpen, title: 'Market Research', desc: 'Analyze market trends, compare neighborhoods, and identify emerging investment areas.', color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    ];

    const advanced = [
        { icon: Zap, title: 'Inline Actions & Smart Suggestions', desc: 'How Vasthu suggests next steps and actions you can take directly from the chat.', color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
        { icon: Shield, title: 'Data Privacy & Security', desc: 'How we handle your data, encryption practices, and compliance standards.', color: 'text-slate-400', bg: 'bg-slate-500/10' },
    ];

    return (
        <div className="h-full flex flex-col" style={{ backgroundColor: '#111114' }}>
            <SubPageHeader title="Documentation" subtitle="Guides, tutorials, and references" icon={Book} iconColor="text-blue-400" iconBg="bg-blue-500/10" onBack={onBack} />
            <div className="flex-1 overflow-y-auto px-5 py-4">
                <div className="max-w-2xl mx-auto space-y-5">
                    <div>
                        <h2 className="text-[10px] font-semibold uppercase tracking-widest text-white/30 mb-2 px-1">Getting Started</h2>
                        <div className="space-y-2">{gettingStarted.map((d) => <DocCard key={d.title} {...d} />)}</div>
                    </div>
                    <div>
                        <h2 className="text-[10px] font-semibold uppercase tracking-widest text-white/30 mb-2 px-1">Features</h2>
                        <div className="space-y-2">{features.map((d) => <DocCard key={d.title} {...d} />)}</div>
                    </div>
                    <div>
                        <h2 className="text-[10px] font-semibold uppercase tracking-widest text-white/30 mb-2 px-1">Advanced</h2>
                        <div className="space-y-2">{advanced.map((d) => <DocCard key={d.title} {...d} />)}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ══════════════════════════════════════════════════════════════════════════════
// VIDEO TUTORIALS SUB-PAGE
// ══════════════════════════════════════════════════════════════════════════════

const VideoTutorialsPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const beginner = [
        { title: 'Getting Started with Vasthu', duration: '4:32', desc: 'Account setup, preferences, and your first property analysis.', thumbnail: 'bg-gradient-to-br from-[#A8734A] to-cyan-700', tag: 'New' },
        { title: 'Understanding Your Dashboard', duration: '3:18', desc: 'Navigate the sidebar, chat, reports, and settings.', thumbnail: 'bg-gradient-to-br from-blue-600 to-indigo-700' },
        { title: 'Setting Investment Preferences', duration: '5:45', desc: 'Configure your buy box, strategy, and financial DNA.', thumbnail: 'bg-gradient-to-br from-violet-600 to-purple-700' },
    ];

    const intermediate = [
        { title: 'Deep Dive: STR Analysis', duration: '8:12', desc: 'Analyze short-term rental deals with AirDNA-grade insights.', thumbnail: 'bg-gradient-to-br from-amber-600 to-orange-700' },
        { title: 'Comparing Properties Side-by-Side', duration: '6:30', desc: 'Use the comparison dock to evaluate multiple deals at once.', thumbnail: 'bg-gradient-to-br from-emerald-600 to-green-700' },
        { title: 'Generating PDF Reports', duration: '4:15', desc: 'Create professional reports for partners and lenders.', thumbnail: 'bg-gradient-to-br from-rose-600 to-pink-700' },
    ];

    const advanced = [
        { title: 'Agent Modes Masterclass', duration: '12:00', desc: 'Hunter vs Research vs Strategist — when and why to use each.', thumbnail: 'bg-gradient-to-br from-slate-600 to-slate-800' },
        { title: 'Portfolio Strategy & Tracking', duration: '9:45', desc: 'Build and monitor a diversified real estate portfolio.', thumbnail: 'bg-gradient-to-br from-cyan-600 to-blue-800' },
    ];

    return (
        <div className="h-full flex flex-col" style={{ backgroundColor: '#111114' }}>
            <SubPageHeader title="Video Tutorials" subtitle="Step-by-step walkthroughs" icon={Video} iconColor="text-purple-400" iconBg="bg-purple-500/10" onBack={onBack} />
            <div className="flex-1 overflow-y-auto px-5 py-4">
                <div className="max-w-2xl mx-auto space-y-5">
                    <div>
                        <h2 className="text-[10px] font-semibold uppercase tracking-widest text-white/30 mb-2 px-1">Beginner</h2>
                        <div className="grid grid-cols-2 gap-2.5">{beginner.map((v) => <VideoCard key={v.title} {...v} />)}</div>
                    </div>
                    <div>
                        <h2 className="text-[10px] font-semibold uppercase tracking-widest text-white/30 mb-2 px-1">Intermediate</h2>
                        <div className="grid grid-cols-2 gap-2.5">{intermediate.map((v) => <VideoCard key={v.title} {...v} />)}</div>
                    </div>
                    <div>
                        <h2 className="text-[10px] font-semibold uppercase tracking-widest text-white/30 mb-2 px-1">Advanced</h2>
                        <div className="grid grid-cols-2 gap-2.5">{advanced.map((v) => <VideoCard key={v.title} {...v} />)}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ══════════════════════════════════════════════════════════════════════════════
// COMMUNITY SUB-PAGE
// ══════════════════════════════════════════════════════════════════════════════

const CommunityPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const channels = [
        { icon: Hash, title: 'General Discussion', desc: 'Chat about real estate investing, market trends, and Vasthu tips.', members: '2.4K', color: 'text-blue-400', bg: 'bg-blue-500/10' },
        { icon: TrendingUp, title: 'Deal Analysis', desc: 'Share deals you\'re evaluating and get feedback from the community.', members: '1.8K', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
        { icon: Home, title: 'Market Watch', desc: 'Discuss hot markets, emerging trends, and local insights.', members: '1.2K', color: 'text-amber-400', bg: 'bg-amber-500/10' },
        { icon: Sparkles, title: 'Feature Requests', desc: 'Vote on upcoming features and suggest improvements.', members: '890', color: 'text-violet-400', bg: 'bg-violet-500/10' },
    ];

    const topContributors = [
        { name: 'Sarah K.', badge: 'Gold Investor', deals: 47 },
        { name: 'Marcus T.', badge: 'Market Expert', deals: 32 },
        { name: 'Priya R.', badge: 'Rising Star', deals: 18 },
    ];

    return (
        <div className="h-full flex flex-col" style={{ backgroundColor: '#111114' }}>
            <SubPageHeader title="Community" subtitle="Connect with fellow investors" icon={MessageCircle} iconColor="text-emerald-400" iconBg="bg-emerald-500/10" onBack={onBack} />
            <div className="flex-1 overflow-y-auto px-5 py-4">
                <div className="max-w-2xl mx-auto space-y-5">
                    {/* Stats banner */}
                    <div className="grid grid-cols-3 gap-2">
                        {[
                            { label: 'Members', value: '5.2K' },
                            { label: 'Discussions', value: '12K' },
                            { label: 'Deals Shared', value: '3.4K' },
                        ].map((s) => (
                            <div key={s.label} className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3 text-center">
                                <p className="text-[16px] font-bold text-white/80">{s.value}</p>
                                <p className="text-[9px] text-white/30 uppercase tracking-wider mt-0.5">{s.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Channels */}
                    <div>
                        <h2 className="text-[10px] font-semibold uppercase tracking-widest text-white/30 mb-2 px-1">Channels</h2>
                        <div className="space-y-2">
                            {channels.map((ch) => {
                                const Icon = ch.icon;
                                return (
                                    <button key={ch.title} className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] transition-all text-left group">
                                        <div className={`w-8 h-8 rounded-lg ${ch.bg} flex items-center justify-center flex-shrink-0`}>
                                            <Icon className={`w-4 h-4 ${ch.color}`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-[12px] font-medium text-white/80">{ch.title}</h3>
                                            <p className="text-[10px] text-white/35">{ch.desc}</p>
                                        </div>
                                        <div className="flex items-center gap-1 text-[10px] text-white/25 flex-shrink-0">
                                            <Users className="w-3 h-3" />
                                            {ch.members}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Top contributors */}
                    <div>
                        <h2 className="text-[10px] font-semibold uppercase tracking-widest text-white/30 mb-2 px-1">Top Contributors</h2>
                        <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] divide-y divide-white/[0.04] overflow-hidden">
                            {topContributors.map((c, i) => (
                                <div key={c.name} className="flex items-center gap-3 px-3.5 py-2.5">
                                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#C08B5C] to-cyan-600 flex items-center justify-center flex-shrink-0">
                                        <span className="text-[10px] font-bold text-white">{i + 1}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-[12px] font-medium text-white/75">{c.name}</h4>
                                        <p className="text-[10px] text-white/30">{c.badge}</p>
                                    </div>
                                    <div className="flex items-center gap-1 text-[10px] text-[#D4A27F]">
                                        <Trophy className="w-3 h-3" />
                                        {c.deals} deals
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Join CTA */}
                    <div className="rounded-xl bg-emerald-500/[0.06] border border-emerald-500/15 p-4 text-center">
                        <h3 className="text-[13px] font-semibold text-white/80 mb-1">Join the conversation</h3>
                        <p className="text-[11px] text-white/35 mb-3">Connect with investors, share deals, and learn strategies.</p>
                        <button className="px-4 py-2 rounded-lg bg-emerald-500 text-white text-[12px] font-medium hover:bg-emerald-600 transition-colors">
                            Join Community
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ══════════════════════════════════════════════════════════════════════════════
// API DOCS SUB-PAGE
// ══════════════════════════════════════════════════════════════════════════════

const ApiDocsPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const endpoints = [
        { icon: Terminal, title: 'Authentication', desc: 'Sign in, sign up, token refresh, and session management.', method: 'POST', path: '/api/auth/*', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
        { icon: Home, title: 'Property Analysis', desc: 'Analyze properties, get valuations, and run deal scenarios.', method: 'POST', path: '/api/chat', color: 'text-blue-400', bg: 'bg-blue-500/10' },
        { icon: FileText, title: 'Reports', desc: 'Generate, list, and download investment reports.', method: 'GET/POST', path: '/api/reports/*', color: 'text-amber-400', bg: 'bg-amber-500/10' },
        { icon: Database, title: 'Preferences', desc: 'Get and update user investment preferences and settings.', method: 'GET/PUT', path: '/api/preferences/*', color: 'text-violet-400', bg: 'bg-violet-500/10' },
        { icon: Webhook, title: 'Billing & Webhooks', desc: 'Subscription management, Stripe checkout, and webhooks.', method: 'POST', path: '/api/billing/*', color: 'text-rose-400', bg: 'bg-rose-500/10' },
        { icon: BarChart3, title: 'Analytics', desc: 'Portfolio performance, market data, and usage statistics.', method: 'GET', path: '/api/analytics/*', color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    ];

    return (
        <div className="h-full flex flex-col" style={{ backgroundColor: '#111114' }}>
            <SubPageHeader title="API Documentation" subtitle="Technical reference for developers" icon={Code} iconColor="text-amber-400" iconBg="bg-amber-500/10" onBack={onBack} />
            <div className="flex-1 overflow-y-auto px-5 py-4">
                <div className="max-w-2xl mx-auto space-y-5">
                    {/* Base URL */}
                    <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3">
                        <p className="text-[10px] text-white/30 uppercase tracking-wider font-semibold mb-1.5">Base URL</p>
                        <div className="flex items-center gap-2 bg-white/[0.04] rounded-lg px-3 py-2">
                            <Terminal className="w-3.5 h-3.5 text-[#D4A27F] flex-shrink-0" />
                            <code className="text-[12px] text-[#D4A27F] font-mono">https://api.vasthu.ai/v1</code>
                        </div>
                        <p className="text-[10px] text-white/25 mt-2">
                            All endpoints require an API key via <code className="text-white/40 bg-white/[0.06] px-1 py-0.5 rounded text-[10px]">X-API-Key</code> header. Pro plan required.
                        </p>
                    </div>

                    {/* Endpoints */}
                    <div>
                        <h2 className="text-[10px] font-semibold uppercase tracking-widest text-white/30 mb-2 px-1">Endpoints</h2>
                        <div className="space-y-2">
                            {endpoints.map((ep) => {
                                const Icon = ep.icon;
                                return (
                                    <button key={ep.title} className="w-full flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] transition-all text-left group">
                                        <div className={`w-8 h-8 rounded-lg ${ep.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                                            <Icon className={`w-4 h-4 ${ep.color}`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <h3 className="text-[12px] font-medium text-white/80">{ep.title}</h3>
                                                <span className="text-[8px] font-bold font-mono px-1.5 py-0.5 rounded bg-white/[0.06] text-white/40">
                                                    {ep.method}
                                                </span>
                                            </div>
                                            <p className="text-[10px] text-white/35">{ep.desc}</p>
                                            <code className="text-[10px] text-[#D4A27F]/60 font-mono mt-1 block">{ep.path}</code>
                                        </div>
                                        <ChevronRight className="w-3 h-3 text-white/15 group-hover:text-white/30 transition-colors flex-shrink-0 mt-1" />
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* SDKs */}
                    <div>
                        <h2 className="text-[10px] font-semibold uppercase tracking-widest text-white/30 mb-2 px-1">SDKs & Tools</h2>
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { icon: Code, label: 'Python SDK', desc: 'pip install vasthu', color: 'text-blue-400', bg: 'bg-blue-500/10' },
                                { icon: Terminal, label: 'Node.js SDK', desc: 'npm i @vasthu/sdk', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                                { icon: Github, label: 'GitHub Repo', desc: 'Open source examples', color: 'text-white/50', bg: 'bg-white/[0.06]' },
                                { icon: Webhook, label: 'Postman Collection', desc: 'Ready-to-use requests', color: 'text-amber-400', bg: 'bg-amber-500/10' },
                            ].map((sdk) => {
                                const Icon = sdk.icon;
                                return (
                                    <button key={sdk.label} className="flex items-center gap-2.5 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] transition-all text-left group">
                                        <div className={`w-7 h-7 rounded-md ${sdk.bg} flex items-center justify-center flex-shrink-0`}>
                                            <Icon className={`w-3.5 h-3.5 ${sdk.color}`} />
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="text-[11px] font-medium text-white/75">{sdk.label}</h3>
                                            <p className="text-[9px] text-white/30 font-mono">{sdk.desc}</p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Rate limits */}
                    <div className="rounded-xl bg-amber-500/[0.06] border border-amber-500/15 p-3">
                        <h3 className="text-[11px] font-semibold text-amber-300 mb-1">Rate Limits</h3>
                        <div className="space-y-1">
                            <p className="text-[10px] text-white/40"><span className="text-white/60 font-medium">Free:</span> 100 requests/hour</p>
                            <p className="text-[10px] text-white/40"><span className="text-white/60 font-medium">Pro:</span> 1,000 requests/hour</p>
                        </div>
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
        { key: 'docs' as const, icon: Book, title: 'Documentation', subtitle: 'Guides and tutorials', color: 'text-blue-400', bg: 'bg-blue-500/10' },
        { key: 'videos' as const, icon: Video, title: 'Video Tutorials', subtitle: 'Step-by-step walkthroughs', color: 'text-purple-400', bg: 'bg-purple-500/10' },
        { key: 'community' as const, icon: MessageCircle, title: 'Community', subtitle: 'Connect with other users', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
        { key: 'api' as const, icon: FileText, title: 'API Docs', subtitle: 'Technical documentation', color: 'text-amber-400', bg: 'bg-amber-500/10' },
    ];

    const faqs = [
        { q: 'How do I set my investment preferences?', a: 'Go to Settings > Investment Preferences to configure your buy box, budget, strategy, and other criteria. This helps Vasthu provide personalized property recommendations.' },
        { q: 'What are the different reasoning modes?', a: 'Vasthu has three modes: Hunter (fast deal scouting), Research (deep market analysis), and Strategist (portfolio-level planning). Switch modes from the chat input area.' },
        { q: 'How do I analyze a property deal?', a: 'Simply ask Vasthu about a property or paste a listing URL. The AI will analyze cash flow, ROI, cap rate, and other metrics based on your investment strategy.' },
        { q: 'Can I save properties and reports?', a: 'Yes! Bookmark properties for later review and generate reports for detailed analysis. All saved items are accessible from the sidebar.' },
        { q: 'How does billing work?', a: 'Free plan includes 2 analyses/month and 2 reports. Pro plan ($100/mo, 50% off first month) gives unlimited access to all features. Report downloads are $2 each.' },
    ];

    // ── Sub-page routing ──────────────────────────────────────────────────────
    if (subPage === 'docs') return <DocumentationPage onBack={() => setSubPage(null)} />;
    if (subPage === 'videos') return <VideoTutorialsPage onBack={() => setSubPage(null)} />;
    if (subPage === 'community') return <CommunityPage onBack={() => setSubPage(null)} />;
    if (subPage === 'api') return <ApiDocsPage onBack={() => setSubPage(null)} />;

    // ── Main help page ────────────────────────────────────────────────────────
    return (
        <div className="h-full flex flex-col" style={{ backgroundColor: '#111114' }}>
            <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/[0.08]">
                <button onClick={onBack} className="w-8 h-8 rounded-lg bg-white/[0.05] hover:bg-white/[0.08] flex items-center justify-center transition-colors">
                    <ArrowLeft className="w-4 h-4 text-white/60" />
                </button>
                <div>
                    <h1 className="text-lg font-semibold text-white/90">Help & Support</h1>
                    <p className="text-[11px] text-white/35">Get assistance with Vasthu</p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
                <div className="max-w-2xl mx-auto space-y-5">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
                        <input
                            type="text"
                            placeholder="Search for help..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full h-9 pl-9 pr-8 bg-white/[0.06] border border-white/[0.08] rounded-lg text-[12px] text-white/80 placeholder-white/25 focus:outline-none focus:border-white/[0.15] transition-all"
                        />
                        {search && (
                            <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2">
                                <X className="w-3 h-3 text-white/30" />
                            </button>
                        )}
                    </div>

                    {/* Resources */}
                    <div>
                        <h2 className="text-[10px] font-semibold uppercase tracking-widest text-white/30 mb-2 px-1">Resources</h2>
                        <div className="grid grid-cols-2 gap-2.5">
                            {resources.map((r) => {
                                const Icon = r.icon;
                                return (
                                    <button
                                        key={r.key}
                                        onClick={() => setSubPage(r.key)}
                                        className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] hover:border-white/[0.08] transition-all group text-left"
                                    >
                                        <div className={`w-8 h-8 rounded-lg ${r.bg} flex items-center justify-center flex-shrink-0`}>
                                            <Icon className={`w-4 h-4 ${r.color}`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-[12px] font-medium text-white/75">{r.title}</h3>
                                            <p className="text-[10px] text-white/30">{r.subtitle}</p>
                                        </div>
                                        <ChevronRight className="w-3 h-3 text-white/15 group-hover:text-white/30 transition-colors flex-shrink-0" />
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* FAQ */}
                    <div>
                        <h2 className="text-[10px] font-semibold uppercase tracking-widest text-white/30 mb-2 px-1">FAQ</h2>
                        <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] divide-y divide-white/[0.04] overflow-hidden">
                            {faqs.map((f) => <FAQItem key={f.q} question={f.q} answer={f.a} />)}
                        </div>
                    </div>

                    {/* Contact */}
                    <div className="rounded-xl bg-[#C08B5C]/[0.06] border border-[#C08B5C]/15 p-4 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-[#C08B5C]/15 flex items-center justify-center flex-shrink-0">
                            <Mail className="w-4 h-4 text-[#D4A27F]" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-[13px] font-medium text-white/80">Still need help?</h3>
                            <p className="text-[11px] text-white/35">Our support team is here to assist you</p>
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
