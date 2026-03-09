import React, { useState } from 'react';
import {
    ArrowLeft, Search, FileText, BarChart3, MessageSquare,
    Check, Cpu, Database, Network, ExternalLink, Zap,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from '../ui/Logo';

interface AboutPageProps {
    onBack: () => void;
}

type TabId = 'platform' | 'trust';

const tabs: { id: TabId; label: string }[] = [
    { id: 'platform', label: 'Platform Intelligence' },
    { id: 'trust', label: 'Trust & Security' },
];

const reveal = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const stagger = {
    visible: { transition: { staggerChildren: 0.08 } },
};

/* -- Shared Components -- */

const InfoCard: React.FC<{
    title: string;
    children: React.ReactNode;
    className?: string;
}> = ({ title, children, className }) => (
    <motion.div
        variants={reveal}
        className={`rounded-2xl bg-black/[0.02] border border-black/[0.06] backdrop-blur-sm p-5 ${className || ''}`}
    >
        <h3 className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-widest mb-4 pb-2 border-b border-black/[0.04] flex justify-between items-center">
            {title}
            <div className="w-1.5 h-1.5 bg-[#C08B5C] rounded-full opacity-50" />
        </h3>
        {children}
    </motion.div>
);

/* -- Main Component -- */

export const AboutPage: React.FC<AboutPageProps> = ({ onBack }) => {
    const [activeTab, setActiveTab] = useState<TabId>('platform');

    const renderPlatform = () => (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="space-y-6"
        >
            {/* Hero Section */}
            <motion.div
                variants={reveal}
                className="relative rounded-2xl border border-black/[0.06] bg-black/[0.02] backdrop-blur-sm p-8 overflow-hidden"
            >
                <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-[#C08B5C]/[0.06] blur-3xl pointer-events-none" />

                <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#C08B5C]/20 to-[#D4A27F]/10 border border-[#C08B5C]/15 flex items-center justify-center">
                                <Logo variant="light" showText={false} className="w-6 h-6 text-[#D4A27F]" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-semibold text-foreground tracking-tight">Vasthu Intelligence</h1>
                                <p className="text-[11px] text-muted-foreground/50 font-mono uppercase tracking-wider">System v2.4.0-RC</p>
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground/70 leading-relaxed max-w-2xl">
                            Vasthu is an advanced real estate intelligence platform designed for institutional-grade analysis. By synthesizing disparate market data with frontier language models, it provides precise, defensible investment insights through a natural language interface.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 w-full md:w-auto min-w-[220px]">
                        {[
                            { label: 'Latency', value: '< 140ms', icon: Zap },
                            { label: 'Data Points', value: '240M+', icon: Database },
                        ].map(stat => (
                            <motion.div
                                key={stat.label}
                                whileHover={{ y: -1 }}
                                className="rounded-xl bg-background border border-black/[0.06] p-3.5"
                            >
                                <div className="flex items-center gap-1.5 mb-1.5">
                                    <stat.icon className="w-3 h-3 text-muted-foreground/40" />
                                    <span className="text-[10px] text-muted-foreground/50 font-mono uppercase tracking-wider">{stat.label}</span>
                                </div>
                                <div className="text-lg font-semibold text-[#D4A27F] font-mono">{stat.value}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* Operational Modes & Architecture */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoCard title="Operational Modes" className="h-full">
                    <div className="space-y-4">
                        {[
                            { icon: MessageSquare, name: 'Deep Research', desc: 'Comprehensive market analysis & data synthesis.' },
                            { icon: Search, name: 'Deep Search', desc: 'In-depth property analysis & due diligence.' },
                            { icon: BarChart3, name: 'Expert Strategist', desc: 'Portfolio strategy & risk-adjusted planning.' },
                        ].map(mode => (
                            <div key={mode.name} className="flex items-start gap-3.5 group">
                                <div className="w-8 h-8 rounded-lg bg-black/[0.03] flex items-center justify-center flex-shrink-0 group-hover:bg-[#C08B5C]/[0.08] transition-colors mt-0.5">
                                    <mode.icon className="w-4 h-4 text-muted-foreground/50 group-hover:text-[#D4A27F] transition-colors" strokeWidth={1.5} />
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-foreground/85 group-hover:text-foreground transition-colors">{mode.name}</div>
                                    <div className="text-[11px] text-muted-foreground/60 mt-0.5">{mode.desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </InfoCard>

                <InfoCard title="Architecture" className="h-full">
                    <div className="space-y-3">
                        {[
                            { icon: Cpu, label: 'Processor', value: 'Multi-Model LLM', accent: true },
                            { icon: Database, label: 'Knowledge Base', value: 'Vector + Graph', accent: false },
                            { icon: Network, label: 'Data Feeds', value: 'Real-time WebSocket', accent: false },
                        ].map(row => (
                            <div key={row.label} className="flex items-center justify-between py-2.5 border-b border-black/[0.04] last:border-0">
                                <span className="text-xs text-muted-foreground flex items-center gap-2">
                                    <row.icon className="w-3.5 h-3.5" /> {row.label}
                                </span>
                                <span className={`text-[11px] font-mono ${row.accent ? 'text-[#D4A27F]' : 'text-muted-foreground/60'}`}>
                                    {row.value}
                                </span>
                            </div>
                        ))}
                    </div>
                    <div className="mt-5 p-3 rounded-lg bg-background border border-black/[0.06] text-[10px] font-mono text-muted-foreground/50 leading-relaxed">
                        Constitutional AI layer verifies all financial projections meet strict accuracy thresholds before presentation.
                    </div>
                </InfoCard>
            </div>

            {/* Core Capabilities */}
            <motion.div variants={reveal}>
                <h2 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 mb-3 px-1">Core Capabilities</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                        { icon: Search, title: 'Acquisition', desc: 'Automated deal sourcing aligned with Buy Box criteria.' },
                        { icon: BarChart3, title: 'Underwriting', desc: 'Institutional-grade financial modeling (DCF, IRR, MOIC).' },
                        { icon: FileText, title: 'Reporting', desc: 'Lender-ready investment memorandums & presentations.' },
                    ].map((cap) => (
                        <motion.div
                            key={cap.title}
                            variants={reveal}
                            whileHover={{ y: -2 }}
                            className="rounded-2xl bg-black/[0.02] border border-black/[0.06] backdrop-blur-sm p-6 hover:border-black/[0.08] transition-all duration-300"
                        >
                            <div className="w-10 h-10 rounded-xl bg-[#C08B5C]/[0.08] flex items-center justify-center mb-4">
                                <cap.icon className="w-5 h-5 text-[#D4A27F]" strokeWidth={1.5} />
                            </div>
                            <h3 className="text-sm font-medium text-foreground mb-1.5">{cap.title}</h3>
                            <p className="text-[12px] text-muted-foreground/70 leading-relaxed">{cap.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Data Sources & Analysis Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoCard title="Data Sources">
                    <ul className="space-y-2.5">
                        {[
                            'MLS Data Aggregators',
                            'Public Records (County Assessor)',
                            'RentCast API (Market Rents)',
                            'Census Bureau (Demographics)',
                            'Bureau of Labor Statistics (Employment)',
                        ].map((source, i) => (
                            <li key={i} className="flex items-center gap-3 text-[12px] text-muted-foreground/70">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#C08B5C]/60 flex-shrink-0" />
                                {source}
                            </li>
                        ))}
                    </ul>
                </InfoCard>

                <InfoCard title="Analysis Metrics">
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { label: 'Yield', value: 'Cap Rate, Cash-on-Cash' },
                            { label: 'Valuation', value: 'ARV, As-Is Value' },
                            { label: 'Expenses', value: 'OpEx Ratio, CapEx Reserves' },
                            { label: 'Action', value: 'Buy/Hold/Sell/Refi' },
                        ].map(metric => (
                            <div key={metric.label} className="p-3 rounded-lg bg-background border border-black/[0.06]">
                                <div className="text-[9px] font-mono text-muted-foreground/50 uppercase tracking-wider mb-1">{metric.label}</div>
                                <div className="text-muted-foreground/80 text-[11px]">{metric.value}</div>
                            </div>
                        ))}
                    </div>
                </InfoCard>
            </div>
        </motion.div>
    );

    const renderTrust = () => (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="max-w-4xl mx-auto space-y-8"
        >
            {/* Security Protocols */}
            <motion.div variants={reveal}>
                <h2 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 mb-3 px-1">Security Protocols</h2>
                <div className="space-y-3">
                    {[
                        { title: 'Data Encryption', desc: 'AES-256 encryption at rest. TLS 1.3 for all data in transit.', status: 'Active' },
                        { title: 'Access Control', desc: 'Role-based access control (RBAC) with MFA enforcement.', status: 'Enforced' },
                        { title: 'AI Governance', desc: 'Constitutional AI guardrails prevent hallucination of financial data.', status: 'Monitored' },
                    ].map((item) => (
                        <motion.div
                            key={item.title}
                            variants={reveal}
                            whileHover={{ x: 2 }}
                            className="flex items-center justify-between p-5 rounded-2xl bg-black/[0.02] border border-black/[0.06] backdrop-blur-sm"
                        >
                            <div>
                                <h3 className="text-sm font-medium text-foreground mb-1">{item.title}</h3>
                                <p className="text-[12px] text-muted-foreground/70">{item.desc}</p>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-background border border-black/[0.06]">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[10px] font-medium text-emerald-400 uppercase tracking-wider">
                                    {item.status}
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Privacy Controls */}
            <InfoCard title="Privacy Controls">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {[
                        { title: 'Zero-Retention Mode', desc: 'Option to process data without persistent storage.' },
                        { title: 'Model Isolation', desc: 'Customer data is never used to train global models.' },
                    ].map(item => (
                        <div key={item.title} className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-[#C08B5C]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <Check className="w-3 h-3 text-[#C08B5C]" />
                            </div>
                            <div>
                                <div className="text-sm text-foreground/85 font-medium">{item.title}</div>
                                <p className="text-[12px] text-muted-foreground/60 mt-1">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </InfoCard>

            {/* System Diagnostics */}
            <motion.div variants={reveal}>
                <h2 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 mb-3 px-1">System Diagnostics</h2>
                <div className="rounded-2xl bg-black/[0.02] border border-black/[0.06] backdrop-blur-sm overflow-hidden">
                    <table className="w-full text-left text-xs">
                        <thead>
                            <tr className="bg-background text-muted-foreground/50 font-mono uppercase text-[10px] tracking-wider">
                                <th className="px-6 py-3.5 font-medium">Service</th>
                                <th className="px-6 py-3.5 font-medium">Region</th>
                                <th className="px-6 py-3.5 font-medium">Uptime (30d)</th>
                                <th className="px-6 py-3.5 font-medium text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-black/[0.04]">
                            {[
                                { name: 'API Gateway', region: 'US-EAST-1', uptime: '99.99%', status: 'Operational' },
                                { name: 'LLM Inference Engine', region: 'Global', uptime: '99.95%', status: 'Operational' },
                                { name: 'Vector Database', region: 'US-WEST-2', uptime: '99.99%', status: 'Operational' },
                                { name: 'Market Data Feed', region: 'Multi', uptime: '99.98%', status: 'Operational' },
                            ].map((row) => (
                                <tr key={row.name} className="hover:bg-black/[0.01] transition-colors">
                                    <td className="px-6 py-4 font-medium text-foreground/75">{row.name}</td>
                                    <td className="px-6 py-4 font-mono text-muted-foreground/70">{row.region}</td>
                                    <td className="px-6 py-4 font-mono text-muted-foreground/70">{row.uptime}</td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="inline-flex items-center gap-1.5 text-emerald-400 font-mono text-[10px]">
                                            {row.status}
                                            <Check className="w-3 h-3" />
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            {/* Footer Links */}
            <motion.div
                variants={reveal}
                className="flex justify-center gap-8 pt-4 border-t border-black/[0.04]"
            >
                {[
                    { label: 'Terms of Service', href: '/terms-of-service' },
                    { label: 'Privacy Policy', href: '/privacy-policy' },
                    { label: 'Support', href: 'mailto:support@vasthu.ai' },
                ].map(link => (
                    <a
                        key={link.label}
                        href={link.href}
                        className="text-[11px] text-muted-foreground/50 hover:text-[#D4A27F] transition-colors flex items-center gap-1 font-medium"
                    >
                        {link.label}
                        <ExternalLink className="w-3 h-3" />
                    </a>
                ))}
            </motion.div>
        </motion.div>
    );

    return (
        <div className="h-full flex flex-col bg-background">
            {/* Header */}
            <header className="flex-shrink-0 flex items-center justify-between px-8 py-5 border-b border-black/[0.06] bg-background/80 backdrop-blur-md sticky top-0 z-20">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="w-8 h-8 rounded-lg hover:bg-black/[0.03] border border-transparent hover:border-black/[0.08] flex items-center justify-center transition-all group -ml-2"
                    >
                        <ArrowLeft className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </button>
                    <h1 className="text-lg font-medium text-foreground tracking-tight">System Information</h1>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[11px] font-medium text-muted-foreground/50">Online</span>
                </div>
            </header>

            {/* Tab Navigation */}
            <nav className="flex-shrink-0 px-8 border-b border-black/[0.06] bg-background">
                <div className="flex gap-1">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`relative py-3.5 px-4 text-[12px] font-medium tracking-wide transition-colors ${
                                activeTab === tab.id
                                    ? 'text-foreground'
                                    : 'text-muted-foreground/60 hover:text-muted-foreground'
                            }`}
                        >
                            {tab.label}
                            {activeTab === tab.id && (
                                <motion.div
                                    layoutId="about-tab-indicator"
                                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#C08B5C] rounded-full"
                                    transition={{ duration: 0.25 }}
                                />
                            )}
                        </button>
                    ))}
                </div>
            </nav>

            {/* Content */}
            <main className="flex-1 overflow-y-auto">
                <div className="max-w-5xl mx-auto p-8">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            {activeTab === 'platform' ? renderPlatform() : renderTrust()}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
};

