import React, { useState } from 'react';
import {
  ArrowLeft,
  ChevronDown,
  Brain,
  Search,
  FileText,
  BarChart3,
  Shield,
  Zap,
  MessageSquare,
  Target,
  TrendingUp,
  Building,
  Sparkles,
  Lock,
  Globe,
  Clock,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Logo } from '../../components/ui/Logo';

interface FAQPageProps {
  onBackToHome: () => void;
}

// ─── Animations ──────────────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

// ─── FAQ Accordion ───────────────────────────────────────────────────────────

const FAQItem: React.FC<{ q: string; a: string }> = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <button onClick={() => setOpen(!open)} className="w-full text-left py-5 group">
      <div className="flex items-start justify-between gap-4">
        <span className="text-[15px] font-medium text-white/70 group-hover:text-white/90 transition-colors leading-snug">{q}</span>
        <ChevronDown className={`w-4 h-4 text-white/20 flex-shrink-0 mt-1 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </div>
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${open ? 'max-h-96 opacity-100 mt-3' : 'max-h-0 opacity-0'}`}>
        <p className="text-[13px] text-white/35 leading-relaxed pr-8">{a}</p>
      </div>
    </button>
  );
};

// ─── Feature Card ────────────────────────────────────────────────────────────

const FeatureCard: React.FC<{
  icon: React.ElementType;
  title: string;
  description: string;
}> = ({ icon: Icon, title, description }) => (
  <motion.div
    variants={fadeUp}
    className="group rounded-2xl bg-white/[0.02] border border-white/[0.05] p-6 hover:border-white/[0.10] hover:bg-white/[0.03] transition-all duration-300"
  >
    <div className="w-10 h-10 rounded-xl bg-[#C08B5C]/10 flex items-center justify-center mb-4 group-hover:bg-[#C08B5C]/15 transition-colors">
      <Icon className="w-5 h-5 text-[#C08B5C]/70" />
    </div>
    <h3 className="text-[15px] font-semibold text-white/80 mb-2">{title}</h3>
    <p className="text-[13px] text-white/35 leading-relaxed">{description}</p>
  </motion.div>
);

// ─── Capability Row ──────────────────────────────────────────────────────────

const CapabilityRow: React.FC<{
  icon: React.ElementType;
  title: string;
  description: string;
  details: string[];
}> = ({ icon: Icon, title, description, details }) => (
  <motion.div variants={fadeUp} className="py-8 first:pt-0 last:pb-0">
    <div className="flex items-start gap-4">
      <div className="w-9 h-9 rounded-lg bg-white/[0.04] flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon className="w-4.5 h-4.5 text-[#C08B5C]/60" />
      </div>
      <div className="flex-1">
        <h3 className="text-[16px] font-semibold text-white/85 mb-1.5">{title}</h3>
        <p className="text-[13px] text-white/40 leading-relaxed mb-3">{description}</p>
        <div className="flex flex-wrap gap-2">
          {details.map((d) => (
            <span key={d} className="px-2.5 py-1 rounded-md bg-white/[0.03] border border-white/[0.05] text-[11px] text-white/30">
              {d}
            </span>
          ))}
        </div>
      </div>
    </div>
  </motion.div>
);

// ─── Main Component ──────────────────────────────────────────────────────────

export const FAQPage: React.FC<FAQPageProps> = ({ onBackToHome }) => {
  const capabilities = [
    {
      icon: Search,
      title: 'Property Scout',
      description: 'Describe what you\'re looking for in plain English. Vasthu searches the market, filters by your criteria, and ranks properties by investment potential.',
      details: ['Natural language search', 'Multi-market support', 'Investment scoring', 'Comp analysis'],
    },
    {
      icon: BarChart3,
      title: 'Deal Analyzer',
      description: 'Full financial projections for any property. Cap rate, cash-on-cash ROI, net operating income, and monthly cash flow — broken down by strategy.',
      details: ['P&L projections', 'STR / LTR / BRRRR / Flip', 'Operating expenses', 'Financing scenarios'],
    },
    {
      icon: FileText,
      title: 'Report Generator',
      description: 'One-click investment reports with market comps, financial analysis, and strategy recommendations. Ready for lenders, partners, or your own records.',
      details: ['PDF export', 'Market comparables', 'Strategy briefs', 'Lender-ready format'],
    },
    {
      icon: Brain,
      title: 'Deep Reasoning',
      description: 'For complex investment questions, Vasthu uses multi-step reasoning — breaking down your question, gathering data, analyzing it, and synthesizing insights.',
      details: ['Multi-step analysis', 'Source verification', 'Confidence scoring', 'Pro plan'],
    },
    {
      icon: Target,
      title: 'Deal Pipeline',
      description: 'Automate your deal flow. Set criteria once and Vasthu continuously monitors new listings, scores them, and alerts you to opportunities.',
      details: ['Automated monitoring', 'Custom criteria', 'Instant alerts', 'Pro plan'],
    },
    {
      icon: TrendingUp,
      title: 'Portfolio Tracking',
      description: 'Track your existing investments. Monitor performance metrics, market changes, and get proactive recommendations for your portfolio.',
      details: ['Performance metrics', 'Market alerts', 'Proactive insights', 'Pro plan'],
    },
  ];

  const faqs = [
    { q: 'What is Vasthu and how does it work?', a: 'Vasthu is an AI-powered real estate analyst. Describe what you\'re looking for in plain English and it scouts properties, runs financial analysis, pulls market comps, and generates lender-ready reports — all through conversation.' },
    { q: 'What data sources does Vasthu use?', a: 'We aggregate data from RentCast, Census Bureau, Zillow, Redfin, and MLS-connected sources for real-time rental comps, property data, and market statistics. Our AI cross-references multiple sources to ensure accuracy.' },
    { q: 'How accurate are the valuations and estimates?', a: 'Our AI aggregates data from multiple high-confidence sources including sold comparables, current rental listings, and local market trends. While no automated model is 100% perfect, our Cap Rate and Cash-on-Cash ROI estimates are highly reliable starting points for due diligence.' },
    { q: 'Is this financial advice?', a: 'No. Vasthu provides data-driven analysis for informational and educational purposes only. It is not a substitute for professional financial, legal, or tax advice. Always consult qualified professionals before making investment decisions.' },
    { q: 'How much does it cost?', a: 'The Free plan gives you 2 property analyses and 2 reports per month. Pro is $100/month (50% off your first month) with unlimited analyses, reports, deep reasoning, deal pipeline, and portfolio tracking. Cancel anytime.' },
    { q: 'Can I use it for commercial properties?', a: 'Currently, Vasthu is optimized for residential investment strategies including Short-Term Rentals (Airbnb), Long-Term Rentals, BRRRR, and Flips. Commercial property support is on our roadmap.' },
    { q: 'How is my data protected?', a: 'All data is encrypted in transit (HTTPS/TLS). We provide granular privacy controls — you can disable chat history, analytics, and opt out of model training. You can export or permanently delete all your data at any time.' },
    { q: 'What AI models power Vasthu?', a: 'Vasthu uses a blend of frontier AI models from Anthropic (Claude) and OpenAI (GPT) to provide the most accurate and nuanced analysis. Our constitutional AI layer ensures all outputs meet our quality and safety standards.' },
  ];

  return (
    <div className="min-h-screen bg-[#0C0C0E] text-white font-sans antialiased selection:bg-[#C08B5C]/30">

      {/* ═══════ NAVBAR ═══════ */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0C0C0E]/80 backdrop-blur-2xl border-b border-white/[0.04]">
        <div className="max-w-[1200px] mx-auto px-6 h-[60px] flex items-center justify-between">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={onBackToHome}>
            <Logo variant="light" showText={false} className="w-8 h-8" />
            <span className="text-[15px] font-semibold text-white/70 hidden sm:block">Vasthu</span>
          </div>
          <button
            onClick={onBackToHome}
            className="flex items-center gap-2 text-[13px] text-white/40 hover:text-white/70 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Home</span>
          </button>
        </div>
      </nav>

      {/* ═══════ HERO ═══════ */}
      <section className="pt-36 pb-20 px-6">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="max-w-[640px] mx-auto text-center"
        >
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#C08B5C]/10 border border-[#C08B5C]/15 mb-8">
            <Sparkles className="w-3.5 h-3.5 text-[#C08B5C]/60" />
            <span className="text-[11px] font-medium text-[#C08B5C]/60 tracking-wide">AI-POWERED REAL ESTATE INTELLIGENCE</span>
          </motion.div>

          <motion.h1 variants={fadeUp} className="text-[clamp(2rem,5vw,3.25rem)] font-bold tracking-[-0.03em] leading-[1.1] text-white mb-6">
            Your AI real estate analyst, available 24/7
          </motion.h1>

          <motion.p variants={fadeUp} className="text-[16px] text-white/40 leading-relaxed max-w-[480px] mx-auto mb-10">
            Vasthu combines frontier AI models with comprehensive market data to deliver institutional-grade investment analysis — through simple conversation.
          </motion.p>

          <motion.div variants={fadeUp} className="flex items-center justify-center gap-8 text-[13px] text-white/25">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              <span>US-wide coverage</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Analysis in seconds</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              <span>Enterprise security</span>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ═══════ WHAT VASTHU CAN DO ═══════ */}
      <section className="py-20 px-6 border-t border-white/[0.04]">
        <div className="max-w-[1000px] mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeUp}
            className="text-center mb-14"
          >
            <h2 className="text-[clamp(1.5rem,3.5vw,2rem)] font-bold tracking-tight text-white mb-3">
              What Vasthu can do
            </h2>
            <p className="text-[15px] text-white/35 leading-relaxed max-w-[520px] mx-auto">
              Six core capabilities that replace hours of manual research with instant, AI-driven analysis.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={stagger}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {capabilities.slice(0, 6).map((c) => (
              <FeatureCard key={c.title} icon={c.icon} title={c.title} description={c.description} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════ HOW IT WORKS ═══════ */}
      <section className="py-20 px-6 border-t border-white/[0.04]">
        <div className="max-w-[700px] mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeUp}
            className="text-center mb-14"
          >
            <h2 className="text-[clamp(1.5rem,3.5vw,2rem)] font-bold tracking-tight text-white mb-3">
              How it works
            </h2>
            <p className="text-[15px] text-white/35 leading-relaxed max-w-[460px] mx-auto">
              Three modes, one conversation. Switch between research, analysis, and property search seamlessly.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={stagger}
            className="space-y-6"
          >
            {[
              {
                step: '01',
                icon: MessageSquare,
                title: 'Research Mode',
                desc: 'Ask anything about real estate markets, strategies, regulations, or investment concepts. Vasthu draws on comprehensive market data and AI reasoning to give you expert-level answers.',
              },
              {
                step: '02',
                icon: Search,
                title: 'Hunter Mode',
                desc: 'Describe your investment criteria — budget, location, strategy, desired returns. Vasthu searches the market, scores properties, and presents ranked results with key metrics.',
              },
              {
                step: '03',
                icon: BarChart3,
                title: 'Strategist Mode',
                desc: 'Dive deep into any property or market. Get full financial projections, strategy comparisons, risk analysis, and actionable recommendations tailored to your goals.',
              },
            ].map((item) => (
              <motion.div
                key={item.step}
                variants={fadeUp}
                className="flex items-start gap-5 p-6 rounded-2xl bg-white/[0.015] border border-white/[0.05] hover:border-white/[0.08] transition-all"
              >
                <div className="flex flex-col items-center gap-2">
                  <span className="text-[11px] font-bold text-[#C08B5C]/40 tracking-wider">{item.step}</span>
                  <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-white/30" />
                  </div>
                </div>
                <div>
                  <h3 className="text-[15px] font-semibold text-white/80 mb-1.5">{item.title}</h3>
                  <p className="text-[13px] text-white/35 leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════ DEEP DIVE: CAPABILITIES ═══════ */}
      <section className="py-20 px-6 border-t border-white/[0.04]">
        <div className="max-w-[700px] mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeUp}
            className="text-center mb-14"
          >
            <h2 className="text-[clamp(1.5rem,3.5vw,2rem)] font-bold tracking-tight text-white mb-3">
              Built for serious investors
            </h2>
            <p className="text-[15px] text-white/35 leading-relaxed max-w-[480px] mx-auto">
              Every feature is designed to give you an edge — from initial research to closing a deal.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={stagger}
            className="divide-y divide-white/[0.04]"
          >
            {capabilities.map((c) => (
              <CapabilityRow key={c.title} {...c} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════ SAFETY & PRIVACY ═══════ */}
      <section className="py-20 px-6 border-t border-white/[0.04]">
        <div className="max-w-[700px] mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeUp}
            className="text-center mb-14"
          >
            <h2 className="text-[clamp(1.5rem,3.5vw,2rem)] font-bold tracking-tight text-white mb-3">
              Safety &amp; privacy
            </h2>
            <p className="text-[15px] text-white/35 leading-relaxed max-w-[480px] mx-auto">
              Your data is yours. We give you full control over what's stored, shared, and analyzed.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={stagger}
            className="grid sm:grid-cols-2 gap-4"
          >
            {[
              { icon: Shield, title: 'Privacy controls', desc: 'Toggle chat history, analytics, and model training opt-out independently. Your preferences are enforced server-side.' },
              { icon: Lock, title: 'Encryption', desc: 'All data encrypted in transit via TLS. Payments processed by Stripe (PCI-DSS compliant). No card numbers stored.' },
              { icon: FileText, title: 'Data portability', desc: 'Export all your data anytime. GDPR and CCPA compliant with right to access, rectification, and erasure.' },
              { icon: Zap, title: 'Instant deletion', desc: 'Delete your entire account and all associated data immediately. No 30-day wait required.' },
            ].map((item) => (
              <motion.div key={item.title} variants={fadeUp}
                className="p-5 rounded-xl bg-white/[0.015] border border-white/[0.05]">
                <item.icon className="w-5 h-5 text-[#C08B5C]/50 mb-3" />
                <h3 className="text-[14px] font-semibold text-white/75 mb-1.5">{item.title}</h3>
                <p className="text-[12px] text-white/30 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════ FAQ ═══════ */}
      <section className="py-20 px-6 border-t border-white/[0.04]">
        <div className="max-w-[640px] mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeUp}
            className="text-center mb-10"
          >
            <h2 className="text-[clamp(1.5rem,3.5vw,2rem)] font-bold tracking-tight text-white mb-3">
              Frequently asked questions
            </h2>
          </motion.div>
          <div className="divide-y divide-white/[0.04]">
            {faqs.map((f) => <FAQItem key={f.q} q={f.q} a={f.a} />)}
          </div>
        </div>
      </section>

      {/* ═══════ CTA ═══════ */}
      <section className="py-20 px-6 border-t border-white/[0.04]">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
          className="max-w-[480px] mx-auto text-center"
        >
          <Building className="w-8 h-8 text-[#C08B5C]/30 mx-auto mb-6" />
          <h2 className="text-[clamp(1.25rem,3vw,1.75rem)] font-bold tracking-tight text-white mb-3">
            Ready to find your next deal?
          </h2>
          <p className="text-[14px] text-white/35 mb-8">
            Join investors who use Vasthu to analyze markets, scout properties, and make smarter investment decisions.
          </p>
          <button
            onClick={onBackToHome}
            className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl text-[14px] font-semibold bg-white text-[#0C0C0E] hover:bg-white/90 transition-all"
          >
            Get started free
          </button>
        </motion.div>
      </section>

      {/* ═══════ FOOTER ═══════ */}
      <section className="py-10 px-6 border-t border-white/[0.04]">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[12px] text-white/20">&copy; {new Date().getFullYear()} Civitas AI. All rights reserved.</p>
          <div className="flex items-center gap-6 text-[12px] text-white/20">
            <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="hover:text-white/40 transition-colors">Privacy</a>
            <a href="/terms-of-service" target="_blank" rel="noopener noreferrer" className="hover:text-white/40 transition-colors">Terms</a>
            <a href="/cookie-policy" target="_blank" rel="noopener noreferrer" className="hover:text-white/40 transition-colors">Cookies</a>
          </div>
        </div>
      </section>
    </div>
  );
};
