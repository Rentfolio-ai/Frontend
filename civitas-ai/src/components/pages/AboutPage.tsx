/**
 * About / Learn More — Institutional Grade Design
 * Precision, Clarity, and High-Contrast Professional Aesthetic.
 */

import React, { useState } from 'react';
import {
  ArrowLeft,
  Search,
  FileText,
  BarChart3,
  MessageSquare,
  Check,
  Cpu,
  Database,
  Network
} from 'lucide-react';
import { Logo } from '../ui/Logo';

interface AboutPageProps {
  onBack: () => void;
}

// ─── Tab Navigation ──────────────────────────────────────────────────────────

type TabId = 'platform' | 'trust';

const tabs: { id: TabId; label: string }[] = [
  { id: 'platform', label: 'PLATFORM INTELLIGENCE' },
  { id: 'trust', label: 'TRUST & SECURITY' },
];

// ─── Shared Components ───────────────────────────────────────────────────────

const SectionHeader: React.FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => (
  <div className="mb-6 border-b border-white/[0.08] pb-4">
    <h2 className="text-sm font-display font-semibold text-white tracking-wide uppercase">{title}</h2>
    {subtitle && <p className="text-xs font-mono text-white/40 mt-1">{subtitle}</p>}
  </div>
);

const InfoCard: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className }) => (
  <div className={`bg-[#161618] border border-white/[0.08] p-5 ${className}`}>
    <h3 className="text-xs font-mono font-medium text-white/50 uppercase tracking-wider mb-4 border-b border-white/[0.04] pb-2 flex justify-between items-center">
      {title}
      <div className="w-1.5 h-1.5 bg-[#C08B5C] rounded-full opacity-60" />
    </h3>
    {children}
  </div>
);

// ─── Main Component ──────────────────────────────────────────────────────────

export const AboutPage: React.FC<AboutPageProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<TabId>('platform');

  // ─── Content Renderers ───────────────────────────────────────────────────

  const renderPlatform = () => (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="bg-[#161618] border border-white/[0.08] p-8 flex flex-col md:flex-row gap-8 items-start">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[#C08B5C] flex items-center justify-center">
              <Logo variant="light" showText={false} className="w-6 h-6 text-[#0C0C0E]" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-semibold text-white tracking-tight">VASTHU INTELLIGENCE</h1>
              <p className="text-xs font-mono text-white/40">SYSTEM VERSION 2.4.0-RC</p>
            </div>
          </div>
          <p className="text-sm font-sans text-white/70 leading-relaxed max-w-2xl">
            Vasthu is an advanced real estate intelligence platform designed for institutional-grade analysis. By synthesizing disparate market data with frontier language models, it provides precise, defensible investment insights through a natural language interface.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 w-full md:w-auto min-w-[240px]">
          <div className="bg-[#0C0C0E] border border-white/[0.08] p-3">
            <div className="text-xs font-mono text-white/40 mb-1">LATENCY</div>
            <div className="text-lg font-mono text-[#C08B5C]">&lt; 140ms</div>
          </div>
          <div className="bg-[#0C0C0E] border border-white/[0.08] p-3">
            <div className="text-xs font-mono text-white/40 mb-1">DATA POINTS</div>
            <div className="text-lg font-mono text-[#C08B5C]">240M+</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InfoCard title="Operational Modes" className="h-full">
          <div className="space-y-4">
            {[
              { icon: MessageSquare, name: 'RESEARCH', desc: 'Market analysis & strategy formulation.' },
              { icon: Search, name: 'HUNTER', desc: 'Property identification & scoring.' },
              { icon: BarChart3, name: 'STRATEGIST', desc: 'Financial modeling & risk assessment.' },
            ].map(mode => (
              <div key={mode.name} className="flex items-start gap-4 group">
                <mode.icon className="w-5 h-5 text-white/30 group-hover:text-[#C08B5C] transition-colors mt-0.5" strokeWidth={1.5} />
                <div>
                  <div className="text-sm font-semibold text-white/90 group-hover:text-white transition-colors">{mode.name}</div>
                  <div className="text-xs text-white/40 font-mono">{mode.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </InfoCard>

        <InfoCard title="Architecture" className="h-full">
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-white/[0.04]">
              <span className="text-xs text-white/60 flex items-center gap-2"><Cpu className="w-3.5 h-3.5" /> Processor</span>
              <span className="text-xs font-mono text-[#C08B5C]">HYBRID (GPT-4o / CLAUDE 3.5)</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-white/[0.04]">
              <span className="text-xs text-white/60 flex items-center gap-2"><Database className="w-3.5 h-3.5" /> Knowledge Base</span>
              <span className="text-xs font-mono text-white/40">VECTOR + GRAPH RELATIONAL</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-xs text-white/60 flex items-center gap-2"><Network className="w-3.5 h-3.5" /> Data Feeds</span>
              <span className="text-xs font-mono text-white/40">REAL-TIME WEBSOCKET</span>
            </div>
          </div>
          <div className="mt-6 p-3 bg-[#0C0C0E] border border-white/[0.08] text-[10px] font-mono text-white/30 leading-relaxed">
            System utilizes a constitutional AI layer for output verification, ensuring all financial projections meet strict accuracy thresholds before presentation.
          </div>
        </InfoCard>
      </div>

      <SectionHeader title="Core Capabilities" subtitle="FUNCTIONAL MODULES" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-white/[0.08] bg-[#161618] divide-y md:divide-y-0 md:divide-x divide-white/[0.08]">
        {[
          { icon: Search, title: 'Acquisition', desc: 'Automated deal sourcing aligned with Buy Box criteria.' },
          { icon: BarChart3, title: 'Underwriting', desc: 'Institutional-grade financial modeling (DCF, IRR, MOIC).' },
          { icon: FileText, title: 'Reporting', desc: 'Lender-ready investment memorandums & presentations.' },
        ].map((cap, i) => (
          <div key={i} className="p-6 hover:bg-white/[0.02] transition-colors">
            <cap.icon className="w-6 h-6 text-[#C08B5C] mb-4" strokeWidth={1.5} />
            <h3 className="text-sm font-bold text-white mb-2">{cap.title}</h3>
            <p className="text-xs text-white/50 leading-relaxed">{cap.desc}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <InfoCard title="Data Sources">
          <ul className="space-y-2">
            {[
              'MLS Data Aggregators',
              'Public Records (County Assessor)',
              'RentCast API (Market Rents)',
              'Census Bureau (Demographics)',
              'Bureau of Labor Statistics (Employment)',
            ].map((source, i) => (
              <li key={i} className="flex items-center gap-3 text-xs text-white/70">
                <div className="w-1 h-1 bg-[#C08B5C]" />
                {source}
              </li>
            ))}
          </ul>
        </InfoCard>
        <InfoCard title="Analysis Metrics">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-[#0C0C0E] border border-white/[0.08]">
              <div className="text-[10px] font-mono text-white/40 mb-1">YIELD</div>
              <div className="text-white/80 text-xs">Cap Rate, Cash-on-Cash</div>
            </div>
            <div className="p-3 bg-[#0C0C0E] border border-white/[0.08]">
              <div className="text-[10px] font-mono text-white/40 mb-1">VALUATION</div>
              <div className="text-white/80 text-xs">ARV, As-Is Value</div>
            </div>
            <div className="p-3 bg-[#0C0C0E] border border-white/[0.08]">
              <div className="text-[10px] font-mono text-white/40 mb-1">EXPENSES</div>
              <div className="text-white/80 text-xs">OpEx Ratio, CapEx Reserves</div>
            </div>
            <div className="p-3 bg-[#0C0C0E] border border-white/[0.08]">
              <div className="text-[10px] font-mono text-white/40 mb-1">ACTION</div>
              <div className="text-white/80 text-xs">Buy/Hold/Sell/Refi</div>
            </div>
          </div>
        </InfoCard>
      </div>
    </div>
  );

  const renderTrust = () => (
    <div className="max-w-4xl mx-auto space-y-8">
      <SectionHeader title="Security Protocols" subtitle="COMPLIANCE & ENCRYPTION" />

      <div className="grid grid-cols-1 gap-4">
        {[
          { title: "DATA ENCRYPTION", desc: "AES-256 encryption at rest. TLS 1.3 for all data in transit.", status: "ACTIVE" },
          { title: "ACCESS CONTROL", desc: "Role-based access control (RBAC) with MFA enforcement.", status: "ENFORCED" },
          { title: "AI GOVERNANCE", desc: "Constitutional AI guardrails prevent hallucination of financial data.", status: "MONITORED" },
        ].map((item, i) => (
          <div key={i} className="flex items-center justify-between p-5 bg-[#161618] border border-white/[0.08]">
            <div>
              <h3 className="text-sm font-bold text-white mb-1">{item.title}</h3>
              <p className="text-xs text-white/50">{item.desc}</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-[#0C0C0E] border border-white/[0.08]">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-mono text-emerald-500 tracking-wider">
                {item.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      <InfoCard title="Privacy Controls">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <Check className="w-4 h-4 text-[#C08B5C] mt-0.5" />
            <div>
              <div className="text-sm text-white/90 font-medium">Zero-Retention Mode</div>
              <p className="text-xs text-white/40 mt-1">Option to process data without persistent storage.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Check className="w-4 h-4 text-[#C08B5C] mt-0.5" />
            <div>
              <div className="text-sm text-white/90 font-medium">Model Isolation</div>
              <p className="text-xs text-white/40 mt-1">Customer data is never used to train global models.</p>
            </div>
          </div>
        </div>
      </InfoCard>

      <SectionHeader title="System Hygiene" subtitle="REAL-TIME DIAGNOSTICS" />
      <div className="bg-[#161618] border border-white/[0.08]">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#0C0C0E] text-white/40 font-mono uppercase">
            <tr>
              <th className="px-6 py-3 font-medium">Service</th>
              <th className="px-6 py-3 font-medium">Region</th>
              <th className="px-6 py-3 font-medium">Uptime (30d)</th>
              <th className="px-6 py-3 font-medium text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {[
              { name: 'API Gateway', region: 'US-EAST-1', uptime: '99.99%', status: 'OPERATIONAL' },
              { name: 'LLM Inference Engine', region: 'GLOBAL', uptime: '99.95%', status: 'OPERATIONAL' },
              { name: 'Vector Database', region: 'US-WEST-2', uptime: '99.99%', status: 'OPERATIONAL' },
              { name: 'Market Data Feed', region: 'MULTI', uptime: '99.98%', status: 'OPERATIONAL' },
            ].map((row, i) => (
              <tr key={i} className="hover:bg-white/[0.02]">
                <td className="px-6 py-4 font-medium text-white/80">{row.name}</td>
                <td className="px-6 py-4 font-mono text-white/50">{row.region}</td>
                <td className="px-6 py-4 font-mono text-white/50">{row.uptime}</td>
                <td className="px-6 py-4 text-right">
                  <span className="inline-flex items-center gap-1.5 text-emerald-500 font-mono text-[10px]">
                    {row.status}
                    <Check className="w-3 h-3" />
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end gap-6 pt-4 border-t border-white/[0.08]">
        <a href="/terms-of-service" className="text-xs text-white/40 hover:text-white transition-colors font-mono uppercase tracking-wider">Terms of Service</a>
        <a href="/privacy-policy" className="text-xs text-white/40 hover:text-white transition-colors font-mono uppercase tracking-wider">Privacy Policy</a>
        <a href="mailto:support@vasthu.ai" className="text-xs text-white/40 hover:text-white transition-colors font-mono uppercase tracking-wider">Support</a>
      </div>
    </div>
  );

  const tabContent: Record<TabId, () => React.ReactNode> = {
    platform: renderPlatform,
    trust: renderTrust,
  };

  return (
    <div className="h-full flex flex-col bg-[#0C0C0E]">
      {/* Header */}
      <header className="flex-shrink-0 px-8 py-6 border-b border-white/[0.08] flex items-center justify-between bg-[#0C0C0E]">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="text-white/40 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" strokeWidth={1.5} />
          </button>
          <div className="h-6 w-px bg-white/[0.08]" />
          <h1 className="text-sm font-display font-semibold text-white tracking-widest uppercase">
            System Information
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-xs font-mono text-white/40">ONLINE</span>
        </div>
      </header>

      {/* Navigation */}
      <nav className="flex-shrink-0 px-8 border-b border-white/[0.08] bg-[#0C0C0E]">
        <div className="flex gap-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 text-xs font-mono font-medium tracking-wider border-b-2 transition-colors ${activeTab === tab.id
                ? 'border-[#C08B5C] text-white'
                : 'border-transparent text-white/40 hover:text-white/70'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Content Area */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto p-8">
          {tabContent[activeTab]()}
        </div>
      </main>
    </div>
  );
};
