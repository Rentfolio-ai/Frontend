import React, { useState, useEffect } from 'react';
import {
  ArrowRight, Check, ChevronDown, Menu, X as XIcon,
  Search, Calculator, FileText,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from '../../components/ui/Logo';
import { useAuth } from '../../contexts/AuthContext';

// ─── Types ──────────────────────────────────────────────────────────────────

interface LandingPageProps {
  onNavigateToSignIn: () => void;
  onNavigateToSignUp: () => void;
  onNavigateToFAQ?: () => void;
}

// ─── Animations ─────────────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

// ─── Rotating headline hook ─────────────────────────────────────────────────

const useRotatingWords = (pairs: [string, string][], intervalMs = 3000) => {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % pairs.length), intervalMs);
    return () => clearInterval(t);
  }, [pairs.length, intervalMs]);
  return pairs[index];
};

// ─── Recent session hook ────────────────────────────────────────────────────

const useRecentSession = () => {
  const [user, setUser] = useState<{ name: string } | null>(null);
  useEffect(() => {
    try {
      const u = localStorage.getItem('civitas-recent-user');
      const ts = localStorage.getItem('civitas-recent-timestamp');
      if (u && ts && Date.now() - parseInt(ts) < 86400000) setUser(JSON.parse(u));
    } catch { /* ignore */ }
  }, []);
  return user;
};

// ─── FAQ Item ───────────────────────────────────────────────────────────────

const FAQItem: React.FC<{ q: string; a: string }> = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <button onClick={() => setOpen(!open)} className="w-full text-left py-5 group">
      <div className="flex items-center justify-between gap-4">
        <h4 className="text-[15px] font-medium text-white/70 group-hover:text-white/90 transition-colors">{q}</h4>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-4 h-4 text-white/20 flex-shrink-0" />
        </motion.div>
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <p className="mt-3 text-[14px] text-white/40 leading-relaxed pr-8">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════════

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigateToSignIn,
  onNavigateToSignUp,
}) => {
  const { resumeSession } = useAuth();
  const recentUser = useRecentSession();
  const [navScrolled, setNavScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const wordPairs: [string, string][] = [
    ['Complex?', 'Simple.'],
    ['Risky?', 'Calculated.'],
    ['Hours?', 'Seconds.'],
    ['Guessing?', 'Knowing.'],
  ];
  const [question, answer] = useRotatingWords(wordPairs);

  useEffect(() => {
    const h = () => setNavScrolled(window.scrollY > 20);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  const handleContinue = async () => {
    const ok = await resumeSession();
    if (!ok) onNavigateToSignIn();
  };

  // ─── Other data ────────────────────────────────────────────────────────

  const faqs = [
    { q: 'What is Vasthu and how does it work?', a: 'Vasthu is an AI-powered real estate analyst. Describe what you\'re looking for in plain English and it scouts properties, runs financial analysis, pulls market comps, and generates lender-ready reports -- all through conversation.' },
    { q: 'What data sources does Vasthu use?', a: 'RentCast, Census Bureau, Zillow, Redfin, and MLS-connected sources for real-time rental comps, property data, and market statistics.' },
    { q: 'How much does it cost?', a: 'Free plan gives you 2 property analyses and 2 reports per month. Pro is $100/month (50% off your first month) with unlimited everything. Cancel anytime, no contracts.' },
  ];

  const freePlan = ['2 property analyses / month', '2 reports / month', 'Quick reasoning mode', 'Basic market insights', 'Email support'];
  const proPlan = ['Unlimited analyses', 'Unlimited reports', 'All reasoning modes', 'Advanced market insights', 'PDF report generation', 'Portfolio tracking', 'Priority support', 'API access'];

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#0C0C0E] text-white font-sans antialiased selection:bg-[#C08B5C]/30">

      {/* ═══════ NAVBAR ═══════ */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navScrolled ? 'bg-[#0C0C0E]/80 backdrop-blur-2xl border-b border-white/[0.04]' : ''}`}>
        <div className="max-w-[1200px] mx-auto px-6 h-[60px] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Logo variant="light" showText={false} className="w-8 h-8" />
            <span className="text-[15px] font-semibold text-white/70 hidden sm:block">Vasthu</span>
          </div>
          <div className="flex items-center gap-3">
            {recentUser ? (
              <>
                <button onClick={handleContinue} className="text-[13px] font-medium text-[#D4A27F] hover:text-white transition-colors hidden sm:block">
                  Continue as {recentUser.name.split(' ')[0]}
                </button>
                <button onClick={onNavigateToSignIn} className="text-[13px] text-white/30 hover:text-white/60 transition-colors">Switch</button>
              </>
            ) : (
              <>
                <button onClick={onNavigateToSignIn} className="text-[13px] text-white/40 hover:text-white/70 transition-colors hidden sm:block">Log in</button>
                <button onClick={onNavigateToSignUp} className="hidden sm:block text-[13px] font-medium text-white bg-white/[0.08] hover:bg-white/[0.12] px-4 py-2 rounded-lg transition-all">
                  Sign up
                </button>
              </>
            )}
            <button onClick={() => setMobileMenuOpen(true)} className="md:hidden p-2 rounded-lg hover:bg-white/[0.04]">
              <Menu className="w-5 h-5 text-white/50" />
            </button>
          </div>
        </div>
      </nav>

      {/* ═══════ MOBILE MENU ═══════ */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-[#0C0C0E] md:hidden">
            <div className="flex flex-col h-full px-6 pt-6">
              <div className="flex items-center justify-between mb-12">
                <Logo variant="light" showText={false} className="w-8 h-8" />
                <button onClick={() => setMobileMenuOpen(false)} className="p-2"><XIcon className="w-5 h-5 text-white/50" /></button>
              </div>
              <div className="mt-auto pb-10 space-y-3">
                <button onClick={() => { setMobileMenuOpen(false); onNavigateToSignUp(); }}
                  className="w-full py-3.5 rounded-xl text-[15px] font-semibold bg-white text-[#0C0C0E] hover:bg-white/90 transition-all">
                  Get Started
                </button>
                <button onClick={() => { setMobileMenuOpen(false); onNavigateToSignIn(); }}
                  className="w-full py-3.5 rounded-xl text-[15px] text-white/50 border border-white/[0.08] hover:border-white/[0.15] transition-all">
                  Log in
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════ HERO ═══════ */}
      <section className="pt-36 pb-12 px-6">
        <motion.div initial="hidden" animate="visible" variants={stagger}
          className="max-w-[520px] mx-auto text-center">

          {/* Rotating aspirational headline */}
          <motion.div variants={fadeUp} className="mb-6 h-[7rem] sm:h-[8.5rem] flex flex-col items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={question}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="text-center"
              >
                <span className="block text-[clamp(2.5rem,7vw,4.5rem)] font-bold tracking-[-0.04em] leading-[1] text-white/30">
                  {question}
                </span>
                <span className="block text-[clamp(2.5rem,7vw,4.5rem)] font-bold tracking-[-0.04em] leading-[1] text-white mt-1">
                  {answer}
                </span>
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* Identity tagline */}
          <motion.p variants={fadeUp}
            className="text-[16px] text-white/40 mb-10">
            The AI for real estate investors
          </motion.p>

          {/* Auth-forward: sign up right in the hero */}
          <motion.div variants={fadeUp} className="space-y-3 mb-6">
            <button onClick={onNavigateToSignUp}
              className="w-full max-w-[360px] mx-auto flex items-center justify-center gap-2 py-3.5 rounded-xl text-[14px] font-semibold bg-white text-[#0C0C0E] hover:bg-white/90 transition-all">
              Get started free
              <ArrowRight className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-3 justify-center">
              <div className="h-px flex-1 max-w-[140px] bg-white/[0.06]" />
              <span className="text-[11px] text-white/15">or</span>
              <div className="h-px flex-1 max-w-[140px] bg-white/[0.06]" />
            </div>
            {recentUser ? (
              <button onClick={handleContinue}
                className="w-full max-w-[360px] mx-auto flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-medium border border-white/[0.08] text-white/50 hover:border-white/[0.15] hover:text-white/70 transition-all">
                Continue as {recentUser.name.split(' ')[0]}
              </button>
            ) : (
              <button onClick={onNavigateToSignIn}
                className="w-full max-w-[360px] mx-auto flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-medium border border-white/[0.08] text-white/50 hover:border-white/[0.15] hover:text-white/70 transition-all">
                Log in
              </button>
            )}
          </motion.div>
        </motion.div>
      </section>

      {/* ═══════ MEET VASTHU ═══════ */}
      <section className="py-20 px-6">
        <div className="max-w-[1000px] mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={fadeUp}
            className="text-center mb-14">
            <h2 className="text-[clamp(1.5rem,3.5vw,2rem)] font-bold tracking-tight text-white mb-3">Meet Vasthu</h2>
            <p className="text-[15px] text-white/35 leading-relaxed max-w-[480px] mx-auto">
              Vasthu is an AI real estate analyst built to help you do your best investing.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-[1.1fr_1fr] gap-8 items-start">

            {/* Left: Realistic product mockup */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-2xl overflow-hidden border border-white/[0.06]"
              style={{ background: '#111114', boxShadow: '0 24px 48px -12px rgba(0,0,0,0.5)' }}>
              {/* Window chrome */}
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/[0.04]">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-white/[0.06]" />
                  <div className="w-2 h-2 rounded-full bg-white/[0.06]" />
                  <div className="w-2 h-2 rounded-full bg-white/[0.06]" />
                </div>
                <span className="flex-1 text-center text-[10px] text-white/10 font-medium">app.vasthu.ai</span>
              </div>

              <div className="flex min-h-[380px]">
                {/* Mini sidebar */}
                <div className="hidden sm:flex flex-col w-[44px] border-r border-white/[0.04] py-3 items-center gap-3">
                  <div className="w-6 h-6 rounded-lg bg-[#C08B5C]/15 flex items-center justify-center">
                    <Logo variant="light" showText={false} className="w-3.5 h-3.5" />
                  </div>
                  <div className="w-5 h-5 rounded bg-white/[0.04]" />
                  <div className="w-5 h-5 rounded bg-white/[0.04]" />
                  <div className="flex-1" />
                  <div className="w-5 h-5 rounded-full bg-white/[0.06]" />
                </div>

                {/* Chat area */}
                <div className="flex-1 flex flex-col">
                  <div className="flex-1 p-3 sm:p-4 space-y-3 overflow-hidden">
                    {/* User message */}
                    <div className="flex justify-end">
                      <div className="bg-white/[0.06] rounded-xl rounded-br-sm px-3 py-2 max-w-[200px]">
                        <p className="text-[10px] text-white/60 leading-relaxed">Find me rental properties in Austin under $400K</p>
                      </div>
                    </div>

                    {/* Thinking indicator */}
                    <div className="flex justify-start">
                      <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl rounded-bl-sm px-3 py-2 max-w-[240px]">
                        <div className="flex items-center gap-2 mb-1.5">
                          <div className="w-3.5 h-3.5 rounded-full border-2 border-[#C08B5C]/30 border-t-[#C08B5C]/70 animate-spin" />
                          <span className="text-[9px] text-[#C08B5C]/50 font-medium">Thinking...</span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <div className="w-1 h-1 rounded-full bg-emerald-400/40" />
                            <span className="text-[8px] text-white/20">Scanning Austin market</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <div className="w-1 h-1 rounded-full bg-emerald-400/40" />
                            <span className="text-[8px] text-white/20">Fetching 847 listings</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <div className="w-1 h-1 rounded-full bg-[#C08B5C]/40 animate-pulse" />
                            <span className="text-[8px] text-white/25">Analyzing cash flow...</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* AI response with properties */}
                    <div className="flex justify-start">
                      <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl rounded-bl-sm px-3 py-2.5 w-full max-w-[280px]">
                        <p className="text-[10px] text-white/45 mb-2">Found 3 properties matching your criteria:</p>
                        {[
                          { addr: '1847 Elm Creek Dr', price: '$385K', specs: '3bd · 2ba · 1,420sf', cap: '6.8%', cf: '+$340/mo', score: 87 },
                          { addr: '2301 Rosewood Ave', price: '$367K', specs: '4bd · 2ba · 1,680sf', cap: '7.2%', cf: '+$520/mo', score: 94 },
                        ].map((p) => (
                          <div key={p.addr} className="rounded-lg bg-white/[0.02] border border-white/[0.04] p-2.5 mb-2 last:mb-0">
                            <div className="flex items-start justify-between mb-1.5">
                              <div>
                                <p className="text-[10px] font-semibold text-white/60">{p.addr}</p>
                                <p className="text-[8px] text-white/20 mt-0.5">{p.specs}</p>
                              </div>
                              <span className="text-[11px] font-bold text-white/65">{p.price}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-[8px] text-white/20">Cap {p.cap}</span>
                              <span className="text-[8px] font-medium text-emerald-400/60">{p.cf}</span>
                              <div className="ml-auto flex items-center gap-1">
                                <div className="w-12 h-1 rounded-full bg-white/[0.06] overflow-hidden">
                                  <div className="h-full rounded-full bg-[#C08B5C]/50" style={{ width: `${p.score}%` }} />
                                </div>
                                <span className="text-[7px] text-[#C08B5C]/40 font-medium">{p.score}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                        <div className="flex gap-1.5 mt-2">
                          <span className="px-2 py-0.5 rounded bg-white/[0.04] text-[8px] text-white/20">Analyze deal</span>
                          <span className="px-2 py-0.5 rounded bg-white/[0.04] text-[8px] text-white/20">Generate report</span>
                          <span className="px-2 py-0.5 rounded bg-white/[0.04] text-[8px] text-white/20">Compare</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Input bar with typing cursor */}
                  <div className="border-t border-white/[0.04] px-3 sm:px-4 py-2.5">
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.04]">
                      <span className="text-[10px] text-white/25 flex-1">
                        Run a P&L on the Rosewood property<span className="animate-pulse text-white/50">|</span>
                      </span>
                      <div className="w-6 h-6 rounded-lg bg-[#C08B5C]/20 flex items-center justify-center shrink-0">
                        <ArrowRight className="w-3 h-3 text-[#C08B5C]/60" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right: Feature cards stacked */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="divide-y divide-white/[0.04]">
              {[
                { icon: Calculator, title: 'Analyze any deal instantly', desc: 'Full P&L projections, cap rates, cash-on-cash ROI, and net operating income for any property.' },
                { icon: Search, title: 'Scout properties for you', desc: 'Describe your criteria and Vasthu searches and ranks matching investment properties.' },
                { icon: FileText, title: 'Generate lender-ready reports', desc: 'One-click PDF reports for STR, LTR, BRRRR, and Flip strategies with market comps.' },
              ].map((card) => {
                const Icon = card.icon;
                return (
                  <div key={card.title} className="py-6 first:pt-0 last:pb-0">
                    <div className="flex items-start gap-3">
                      <Icon className="w-4 h-4 text-[#C08B5C]/40 mt-0.5 shrink-0" />
                      <div>
                        <h3 className="text-[15px] font-semibold text-white/75 mb-1.5">{card.title}</h3>
                        <p className="text-[13px] text-white/30 leading-relaxed">{card.desc}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════ EXPLORE PLANS ═══════ */}
      <section className="py-20 px-6">
        <div className="max-w-[900px] mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={fadeUp}
            className="text-center mb-10">
            <h2 className="text-[clamp(1.5rem,3.5vw,2rem)] font-bold tracking-tight text-white">Explore plans</h2>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={stagger}
            className="grid md:grid-cols-2 gap-4">
            {/* Free */}
            <motion.div variants={fadeUp}
              className="rounded-2xl bg-white/[0.015] border border-white/[0.05] p-8 hover:border-white/[0.08] transition-all">
              <p className="text-[15px] font-semibold text-white/60 mb-1">Free</p>
              <p className="text-[12px] text-white/25 mb-5">Free for everyone</p>
              <div className="flex items-baseline gap-1 mb-7">
                <span className="text-4xl font-bold text-white">$0</span>
              </div>
              <button onClick={onNavigateToSignUp}
                className="w-full py-3 rounded-xl text-[13px] font-semibold bg-white/[0.06] text-white/60 hover:bg-white/[0.1] transition-colors mb-7">
                Try Vasthu
              </button>
              <div className="space-y-3">
                {freePlan.map((f) => (
                  <div key={f} className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-white/15 flex-shrink-0" />
                    <span className="text-[13px] text-white/40">{f}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Pro */}
            <motion.div variants={fadeUp}
              className="relative rounded-2xl border border-[#C08B5C]/20 bg-[#C08B5C]/[0.03] p-8 transition-all">
              <p className="text-[15px] font-semibold text-white/80 mb-1">Pro</p>
              <p className="text-[12px] text-white/30 mb-5">For serious investors</p>
              <div className="flex items-baseline gap-1.5 mb-1">
                <span className="text-4xl font-bold text-white">$100</span>
                <span className="text-[13px] text-white/25">/month</span>
              </div>
              <p className="text-[11px] text-[#D4A27F]/50 mb-6">First month $50 — 50% off</p>
              <button onClick={onNavigateToSignUp}
                className="w-full py-3 rounded-xl text-[13px] font-semibold bg-[#C08B5C] text-white hover:bg-[#A8734A] transition-colors mb-7">
                Try Vasthu
              </button>
              <p className="text-[11px] text-white/25 mb-4">Everything in Free, plus:</p>
              <div className="space-y-3">
                {proPlan.map((f) => (
                  <div key={f} className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#C08B5C]/50 flex-shrink-0" />
                    <span className="text-[13px] text-white/55">{f}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ═══════ FAQ ═══════ */}
      <section className="py-20 px-6">
        <div className="max-w-[640px] mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={fadeUp}
            className="text-center mb-10">
            <h2 className="text-[clamp(1.5rem,3.5vw,2rem)] font-bold tracking-tight text-white">Frequently asked questions</h2>
          </motion.div>
          <div className="divide-y divide-white/[0.04]">
            {faqs.map((f) => <FAQItem key={f.q} q={f.q} a={f.a} />)}
          </div>
        </div>
      </section>

      {/* ═══════ BOTTOM TAGLINE + LINKS ═══════ */}
      <section className="py-14 px-6 border-t border-white/[0.04]">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <Logo variant="light" showText={false} className="w-7 h-7" />
            <span className="text-[14px] font-semibold text-white/40">The AI for real estate investors</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 text-[12px] text-white/25">
            <a href="#" className="hover:text-white/50 transition-colors">Privacy</a>
            <a href="#" className="hover:text-white/50 transition-colors">Terms</a>
            <a href="#" className="hover:text-white/50 transition-colors">Security</a>
            <a href="#" className="hover:text-white/50 transition-colors">Contact</a>
          </div>
        </div>
      </section>
    </div>
  );
};
