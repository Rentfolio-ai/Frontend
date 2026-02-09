import React, { useState, useEffect } from 'react';
import { AnalysisIcon, MarketIcon, CheckIcon, ArrowRightIcon, ChevronDownIcon, MenuIcon, CloseIcon } from '../../components/ui/CustomIcons';
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
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
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
    <button onClick={() => setOpen(!open)} className="w-full text-left py-6 group border-b border-white/[0.06]">
      <div className="flex items-center justify-between gap-4">
        <h4 className="text-[17px] font-sans font-medium text-[#FBF9F7]/90 group-hover:text-white transition-colors tracking-tight">{q}</h4>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDownIcon className="w-4 h-4 text-white/30 flex-shrink-0" />
        </motion.div>
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <p className="mt-4 text-[15px] text-white/50 leading-relaxed max-w-2xl">{a}</p>
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
  onNavigateToFAQ,
}) => {
  const { resumeSession } = useAuth();
  const recentUser = useRecentSession();
  const [navScrolled, setNavScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const h = () => setNavScrolled(window.scrollY > 20);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  // ─── Interaction Logic ─────────────────────────────────────────────────────

  const handleContinue = async () => {
    const ok = await resumeSession();
    if (!ok) onNavigateToSignIn();
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigateToSignUp();
  };

  // ─── Data ──────────────────────────────────────────────────────────────────

  const faqs = [
    { q: 'How is Vasthu different from Zillow or Redfin?', a: 'Vasthu is an active analyst, not a passive search engine. While Zillow lists homes, Vasthu underwrites them—calculating cash flow, projecting appreciation, and identifying off-market value that standard portals miss.' },
    { q: 'What data sources does Vasthu use?', a: 'We aggregate real-time data from RentCast, county tax records, MLS-connected feeds, and census bureaus to provide investment-grade accuracy on every calculation.' },
    { q: 'Can I generate reports for my lenders?', a: 'Yes. The Pro plan allows you to export comprehensive, white-labeled PDF reports that include market comps, renovation estimates, and 30-year pro formas.' },
  ];

  const freePlan = ['2 property analyses / month', '2 reports / month', 'Basic market insights', 'Email support'];
  const proPlan = ['Unlimited analyses', 'Unlimited reports', 'Advanced market mapping', 'PDF report generation', 'Portfolio tracking', 'Priority support'];


  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#0C0C0E] text-white font-sans antialiased selection:bg-[#C08B5C]/30">

      {/* ═══════ NAVBAR ═══════ */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 border-b border-transparent ${navScrolled ? 'bg-[#0C0C0E]/90 backdrop-blur-md border-white/[0.04]' : ''}`}>
        <div className="max-w-[1400px] mx-auto px-6 h-[72px] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo variant="light" showText={false} className="w-7 h-7" />
            <span className="text-[18px] font-display font-semibold text-[#FBF9F7] tracking-tight">Vasthu</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-white/60">
              <button onClick={onNavigateToFAQ} className="hover:text-white transition-colors">About</button>
              <button onClick={onNavigateToFAQ} className="hover:text-white transition-colors">Pricing</button>
            </div>
            <div className="h-4 w-px bg-white/[0.1] hidden md:block" />
            {recentUser ? (
              <button onClick={handleContinue} className="text-sm font-medium text-[#FBF9F7] hover:text-white/80 transition-colors">
                Continue as {recentUser.name.split(' ')[0]}
              </button>
            ) : (
              <div className="flex items-center gap-4">
                <button onClick={onNavigateToSignIn} className="text-sm font-medium text-white/60 hover:text-white transition-colors">Sign in</button>
                <button onClick={onNavigateToSignUp} className="bg-[#FBF9F7] text-[#0C0C0E] px-4 py-2 rounded-lg text-sm font-medium hover:bg-white transition-colors">
                  Get Started
                </button>
              </div>
            )}
            <button onClick={() => setMobileMenuOpen(true)} className="md:hidden p-2 text-white/60">
              <MenuIcon className="w-5 h-5" />
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
                <span className="text-xl font-display font-bold text-[#FBF9F7] tracking-tight">Vasthu</span>
                <button onClick={() => setMobileMenuOpen(false)} className="p-2"><CloseIcon className="w-6 h-6 text-white/60" /></button>
              </div>
              <div className="space-y-6">
                <button onClick={() => { setMobileMenuOpen(false); onNavigateToSignUp(); }} className="text-2xl font-display font-medium text-[#FBF9F7] block w-full text-left tracking-tight">Get Started</button>
                <button onClick={() => { setMobileMenuOpen(false); onNavigateToSignIn(); }} className="text-2xl font-display font-medium text-white/50 block w-full text-left tracking-tight">Sign in</button>
                <div className="h-px bg-white/[0.1] w-full my-6" />
                <button className="text-lg text-white/50 block w-full text-left">About</button>
                <button className="text-lg text-white/50 block w-full text-left">Pricing</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════ HERO ═══════ */}
      <section className="relative pt-32 pb-20 px-6 min-h-[92vh] flex items-center overflow-hidden">
        <div className="max-w-[1300px] mx-auto w-full grid lg:grid-cols-2 gap-20 items-center">

          {/* Left: Content */}
          <div className="relative z-10 max-w-[580px]">
            <motion.div initial="hidden" animate="visible" variants={stagger}>
              <motion.div variants={fadeUp} className="mb-10">
                <h1 className="text-5xl md:text-[72px] font-display font-bold tracking-tight text-[#FBF9F7] mb-8 leading-[1.05]">
                  Analyze <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FBF9F7] via-[#C08B5C] to-[#FBF9F7] animate-gradient">Rental Properties</span> in Seconds.
                </h1>
                <p className="text-[19px] text-white/50 font-light leading-relaxed mb-10 max-w-[480px] font-sans">
                  Instant cash flow analysis, rental estimates, and market heatmaps for STR & LTR investors. Stop guessing and start underwriting with precision.
                </p>
              </motion.div>

              {/* Email Input / CTA */}
              <motion.div variants={fadeUp} className="max-w-[420px]">
                {recentUser ? (
                  <button onClick={handleContinue} className="w-full py-4 rounded-xl bg-[#C08B5C] text-[#0C0C0E] text-[15px] font-semibold hover:bg-[#D4A27F] transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(192,139,92,0.15)] font-sans">
                    Continue as {recentUser.name} <ArrowRightIcon className="w-4 h-4" />
                  </button>
                ) : (
                  <form onSubmit={handleEmailSubmit} className="space-y-4">
                    <div className="relative group">
                      <input type="email" placeholder="name@work-email.com" className="w-full bg-[#161618] border border-white/[0.08] rounded-xl px-4 py-3.5 text-white placeholder:text-white/20 focus:outline-none focus:border-[#C08B5C]/50 transition-all shadow-inner font-sans" />
                      <button type="submit" className="absolute right-1.5 top-1.5 bottom-1.5 px-4 rounded-lg bg-[#FBF9F7] text-[#0C0C0E] font-bold text-sm hover:bg-white transition-colors shadow-lg font-sans">
                        Get Started
                      </button>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-bold text-white/20 uppercase tracking-widest my-6 font-sans">
                      <div className="h-px flex-1 bg-white/[0.05]" />
                      <span>OR</span>
                      <div className="h-px flex-1 bg-white/[0.05]" />
                    </div>
                    <button type="button" onClick={onNavigateToSignUp} className="w-full py-3.5 rounded-xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04] text-white/80 font-medium transition-all flex items-center justify-center gap-2.5 text-[14px] font-sans">
                      <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5 opacity-90" alt="Google" />
                      Continue with Google
                    </button>
                  </form>
                )}
              </motion.div>
            </motion.div>
          </div>

          {/* Right: Visual */}
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
            className="relative h-[680px] hidden lg:block rounded-[24px] overflow-hidden border border-white/[0.05] shadow-2xl bg-[#111]">
            <img src="/assets/hero-user-typing.png" alt="Vasthu Interface" className="w-full h-full object-cover opacity-90 transition-transform duration-[2s]" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0C0C0E] via-transparent to-transparent opacity-60" />

            {/* Floating 'Chat' Artifact Cards */}
            {/* Floating 'Deal Card' Artifacts */}
            <div className="absolute bottom-12 left-12 right-12 space-y-4 shadow-2xl">
              <div className="bg-[#1A1A1C]/90 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 shadow-2xl transform translate-y-0 hover:-translate-y-1 transition-transform duration-500">
                <div className="flex gap-4 mb-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-white/10">
                    <img src="/assets/feature-deal-card.png" className="w-full h-full object-cover" alt="Deal Card" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-[#FBF9F7] font-medium font-sans text-lg">7504 Highland Ave</h4>
                    <div className="flex gap-4 mt-1 text-sm">
                      <div>
                        <span className="text-white/40 block text-xs">Cap Rate</span>
                        <span className="text-[#C08B5C] font-mono">7.2%</span>
                      </div>
                      <div>
                        <span className="text-white/40 block text-xs">Cash on Cash</span>
                        <span className="text-emerald-400 font-mono">12.4%</span>
                      </div>
                      <div>
                        <span className="text-white/40 block text-xs">Net Cash Flow</span>
                        <span className="text-emerald-400 font-mono">+$950/mo</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════ MEET VASTHU ═══════ */}
      <section className="py-32 px-6 bg-[#0C0C0E]">
        <div className="max-w-[1200px] mx-auto space-y-32">

          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-[#FBF9F7] mb-6 tracking-tight">The Rental Analyst</h2>
            <p className="text-white/50 text-xl font-light font-sans max-w-2xl mx-auto leading-relaxed">
              Built solely for rental property investors. Whether you're analyzing a short-term rental in Austin or a multi-family in Ohio, Vasthu runs the numbers instantly.
            </p>
          </div>

          {/* Feature 1: Analysis */}
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeUp}
            className="grid md:grid-cols-2 gap-20 items-center"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-white/[0.05] flex items-center justify-center mb-8 border border-white/[0.05]">
                <AnalysisIcon className="w-6 h-6 text-[#C08B5C]" />
              </div>
              <h3 className="text-3xl font-display font-semibold text-[#FBF9F7] mb-4 tracking-tight">Deep Financial Analysis</h3>
              <p className="text-white/60 text-lg leading-relaxed mb-8 font-light font-sans">
                Vasthu underwrites deals using live RentCast & MLS data, calculating NOI, Cap Rate, and Cash-on-Cash returns with <span className="text-[#C08B5C] font-mono font-medium">institutional precision</span>.
              </p>
              <div className="flex gap-4">
                <div className="px-4 py-3 rounded-lg bg-[#161618] border border-white/[0.05] text-sm text-white/70 font-sans">
                  <span className="block text-xs text-white/30 uppercase tracking-wider mb-1 font-sans">Processing time</span>
                  <span className="font-mono text-emerald-400">0.4s</span>
                </div>
                <div className="px-4 py-3 rounded-lg bg-[#161618] border border-white/[0.05] text-sm text-white/70 font-sans">
                  <span className="block text-xs text-white/30 uppercase tracking-wider mb-1 font-sans">Data points</span>
                  <span className="font-mono text-[#C08B5C]">14,000+</span>
                </div>
              </div>
            </div>
            <div className="relative rounded-2xl overflow-hidden border border-white/[0.08] shadow-2xl group cursor-pointer aspect-[4/3]">
              <img src="/assets/hero-rental-overlay.png" alt="Cash Flow Analysis Overlay" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0C0C0E]/50 to-transparent" />
            </div>
          </motion.div>

          {/* Feature 2: Market Intelligence */}
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeUp}
            className="grid md:grid-cols-2 gap-20 items-center md:flex-row-reverse"
          >
            <div className="order-2 md:order-1 relative rounded-2xl overflow-hidden border border-white/[0.08] shadow-2xl group cursor-pointer aspect-[4/3]">
              <img src="/assets/comps-map-ui.png" alt="Rental Comps Map" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0C0C0E]/50 to-transparent" />
            </div>

            <div className="order-1 md:order-2">
              <div className="w-12 h-12 rounded-xl bg-white/[0.05] flex items-center justify-center mb-8 border border-white/[0.05]">
                <MarketIcon className="w-6 h-6 text-[#C08B5C]" />
              </div>
              <h3 className="text-3xl font-display font-semibold text-[#FBF9F7] mb-4 tracking-tight">Complete Market Vision</h3>
              <p className="text-white/60 text-lg leading-relaxed mb-8 font-light font-sans">
                See off-market opportunities and rental trends before they hit Zillow. Vasthu aggregates data from MLS, county records, and private listings into one seamless map.
              </p>
              <ul className="space-y-4">
                {['Live RentCast estimates', 'Short-term vs. Long-term comparables', 'Neighborhood appreciation heatmaps'].map(item => (
                  <li key={item} className="flex items-start gap-3 text-white/70 text-[15px] font-sans">
                    <CheckIcon className="w-4 h-4 text-[#C08B5C]" /> {item}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

        </div>
      </section>

      {/* ═══════ PRICING MODAL STYLE ═══════ */}
      <section className="py-32 px-6 border-t border-white/[0.04]">
        <div className="max-w-[900px] mx-auto">

          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold font-display text-white mb-4 tracking-tight">Transparent Pricing</h2>
            <p className="text-white/40 text-lg font-sans">Choose the plan that fits your portfolio scale.</p>
          </div>

          <div className="bg-[#161618] border border-white/[0.08] rounded-2xl overflow-hidden shadow-2xl">
            <div className="grid md:grid-cols-2">

              {/* Free Plan */}
              <div className="p-8 md:p-10 flex flex-col h-full border-b md:border-b-0 md:border-r border-white/[0.04] hover:bg-white/[0.02] transition-colors relative">
                <div className="mb-6">
                  <h3 className="text-lg font-display font-medium text-white mb-1">Starter</h3>
                  <div className="text-3xl font-bold font-mono text-white">$0 <span className="text-base text-white/30 font-normal">/mo</span></div>
                  <p className="text-white/40 text-sm mt-3 leading-relaxed font-sans">Essential tools to analyze individual deals and learn the market.</p>
                </div>
                <ul className="space-y-4 mb-8 flex-1">
                  {freePlan.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-white/70 text-sm font-sans">
                      <CheckIcon className="w-4 h-4 text-white/20 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <button onClick={onNavigateToSignUp} className="w-full py-3 rounded-lg border border-white/[0.1] text-white font-medium hover:bg-white/[0.05] transition-all text-sm font-sans">
                  Get Started
                </button>
              </div>

              {/* Pro Plan */}
              <div className="p-8 md:p-10 flex flex-col h-full bg-gradient-to-b from-[#1A1A1C] to-[#161618] relative relative group">
                <div className="absolute top-0 right-0 bg-[#C08B5C] text-[#0C0C0E] text-[10px] font-bold font-mono px-3 py-1 rounded-bl-lg uppercase tracking-wider">
                  Recommended
                </div>
                <div className="mb-6">
                  <h3 className="text-lg font-display font-medium text-[#C08B5C] mb-1">Pro Investor</h3>
                  <div className="text-4xl font-bold font-mono text-white tracking-tight">$100 <span className="text-base text-white/30 font-sans font-normal">/mo</span></div>
                  <p className="text-[#C08B5C]/80 text-sm mt-3 leading-relaxed font-medium font-sans">Includes 50% off your first month.</p>
                </div>
                <ul className="space-y-4 mb-8 flex-1">
                  {proPlan.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-white/90 text-sm font-sans">
                      <CheckIcon className="w-4 h-4 text-[#C08B5C] shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <button onClick={onNavigateToSignUp} className="w-full py-3 rounded-lg bg-[#C08B5C] text-[#0C0C0E] font-semibold hover:bg-[#D4A27F] transition-all shadow-[0_0_15px_rgba(192,139,92,0.15)] text-sm">
                  Upgrade to Pro
                </button>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ═══════ FAQ ═══════ */}
      <section className="py-24 px-6 border-t border-white/[0.04] bg-[#0C0C0E]">
        <div className="max-w-[700px] mx-auto">
          <h2 className="text-3xl font-display font-medium text-white mb-12 text-center tracking-tight">Frequently asked questions</h2>
          <div>
            {faqs.map((faq, i) => (
              <FAQItem key={i} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ FOOTER ═══════ */}
      <footer className="py-12 px-6 border-t border-white/[0.04]">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Logo variant="light" showText={false} className="w-6 h-6 opacity-40 grayscale" />
            <span className="text-white/30 text-sm">© 2024 Civitas AI</span>
          </div>
          <div className="flex gap-8 text-sm text-white/40 font-medium">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Twitter</a>
            <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
          </div>
        </div>
      </footer>

    </div>
  );
};
