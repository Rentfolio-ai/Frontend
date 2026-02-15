import React, { useState, useEffect, useCallback } from 'react';
import { CheckIcon, ArrowRightIcon, ChevronDownIcon, MenuIcon, CloseIcon } from '../../components/ui/CustomIcons';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Logo } from '../../components/ui/Logo';
import { useAuth } from '../../contexts/AuthContext';

// ─── Types ──────────────────────────────────────────────────────────────────

interface LandingPageProps {
  onNavigateToSignIn: () => void;
  onNavigateToSignUp: () => void;
  onNavigateToFAQ?: () => void;
}

// ─── Animation ──────────────────────────────────────────────────────────────

const reveal = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] } },
};

// ─── Hooks ──────────────────────────────────────────────────────────────────

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

// ─── Components ─────────────────────────────────────────────────────────────

const FAQItem: React.FC<{ q: string; a: string }> = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <button onClick={() => setOpen(!open)} className="w-full text-left py-7 group border-b border-white/[0.04]">
      <div className="flex items-center justify-between gap-6">
        <h4 className="text-[15px] font-sans font-medium text-white/70 group-hover:text-white/90 transition-colors">{q}</h4>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDownIcon className="w-4 h-4 text-white/15 flex-shrink-0" />
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
            <p className="mt-4 text-[14px] text-white/30 leading-[1.85] max-w-lg">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
};

// ─── Shimmer button class ───────────────────────────────────────────────────

const shimmerBtn = 'relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:-translate-x-full hover:before:translate-x-full before:transition-transform before:duration-700';

// ═══════════════════════════════════════════════════════════════════════════

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigateToSignIn,
  onNavigateToSignUp,
}) => {
  const { resumeSession } = useAuth();
  const recentUser = useRecentSession();
  const [navScrolled, setNavScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Parallax for hero image
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 600], [0, -50]);

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

  const scrollTo = useCallback((id: string) => {
    setMobileMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-white font-sans antialiased selection:bg-[#C08B5C]/20 overflow-x-hidden">

      {/* ─── Nav ─────────────────────────────────────────────────── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${navScrolled ? 'bg-[#0A0A0C]/70 backdrop-blur-2xl' : ''}`}>
        <div className="max-w-[1080px] mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo variant="light" showText={false} className="w-[22px] h-[22px]" />
            <span className="text-[14px] font-display font-semibold text-white/90 tracking-tight">Vasthu</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-[13px] text-white/30">
            <button onClick={() => scrollTo('products')} className="hover:text-white/70 transition-colors duration-300">Products</button>
            <button onClick={() => scrollTo('pricing')} className="hover:text-white/70 transition-colors duration-300">Pricing</button>
            <button onClick={() => scrollTo('about')} className="hover:text-white/70 transition-colors duration-300">About</button>
          </div>
          <div className="flex items-center gap-4">
            {recentUser ? (
              <button onClick={handleContinue} className="text-[13px] text-white/40 hover:text-white/80 transition-colors duration-300">
                Continue as {recentUser.name.split(' ')[0]}
              </button>
            ) : (
              <>
                <button onClick={onNavigateToSignIn} className="hidden md:block text-[13px] text-white/30 hover:text-white/70 transition-colors duration-300">Sign in</button>
                <button onClick={onNavigateToSignUp} className={`text-[13px] bg-white/90 text-[#0A0A0C] px-4 py-[6px] rounded-full font-medium hover:bg-white transition-colors duration-300 ${shimmerBtn}`}>
                  Get started
                </button>
              </>
            )}
            <button onClick={() => setMobileMenuOpen(true)} className="md:hidden p-1.5 text-white/30">
              <MenuIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* ─── Mobile Menu ─────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-[#0A0A0C] md:hidden">
            <div className="flex flex-col h-full px-6 pt-6">
              <div className="flex items-center justify-between mb-20">
                <span className="text-[14px] font-display font-semibold text-white/90">Vasthu</span>
                <button onClick={() => setMobileMenuOpen(false)} className="p-2"><CloseIcon className="w-5 h-5 text-white/30" /></button>
              </div>
              <div className="space-y-8">
                {(['products', 'pricing', 'about'] as const).map(id => (
                  <button key={id} onClick={() => scrollTo(id)} className="text-[32px] font-display font-medium text-white/25 hover:text-white/70 block w-full text-left capitalize tracking-tight transition-colors duration-300">
                    {id}
                  </button>
                ))}
              </div>
              <div className="mt-auto pb-12 space-y-3">
                <button onClick={() => { setMobileMenuOpen(false); onNavigateToSignUp(); }} className="w-full py-3 rounded-full bg-white text-[#0A0A0C] font-medium text-[14px]">Get started</button>
                <button onClick={() => { setMobileMenuOpen(false); onNavigateToSignIn(); }} className="w-full py-3 text-white/30 text-[14px]">Sign in</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Hero ────────────────────────────────────────────────── */}
      <section className="pt-40 md:pt-48 px-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
          className="max-w-[640px] mx-auto text-center"
        >
          <h1 className="text-[clamp(2.25rem,5.2vw,3.75rem)] font-display font-bold text-white leading-[1.08] tracking-[-0.025em] mb-6">
            Analyze any rental{'\u00A0'}property{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C08B5C] via-[#D4A27F] to-[#C08B5C] bg-[length:200%_auto] animate-gradient">
              in seconds
            </span>
          </h1>

          {/* Thin rule — animated width on load */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: 40 }}
            transition={{ duration: 0.8, delay: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
            className="h-px bg-white/[0.08] mx-auto mb-6"
          />

          <p className="text-[16px] md:text-[17px] text-white/25 leading-[1.75] mb-10 max-w-[420px] mx-auto">
            AI-powered underwriting and market intelligence for rental property investors.
          </p>
          {recentUser ? (
            <button onClick={handleContinue} className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#C08B5C] text-[#0A0A0C] font-medium text-[13px] hover:bg-[#D4A27F] transition-colors duration-300 ${shimmerBtn}`}>
              Continue as {recentUser.name.split(' ')[0]} <ArrowRightIcon className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button onClick={onNavigateToSignUp} className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#C08B5C] text-[#0A0A0C] font-medium text-[13px] hover:bg-[#D4A27F] transition-colors duration-300 ${shimmerBtn}`}>
              Get started free <ArrowRightIcon className="w-3.5 h-3.5" />
            </button>
          )}
        </motion.div>

        {/* Hero image — parallax + radial vignette */}
        <div className="max-w-[1020px] mx-auto mt-20 overflow-hidden">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            style={{ y: heroY }}
          >
            <div className="rounded-[20px] overflow-hidden aspect-[16/9] relative bg-[#111] shadow-[0_8px_80px_rgba(0,0,0,0.5)] border border-white/[0.03]">
              <img src="/assets/hero-dashboard-v4.png" alt="Vasthu" className="w-full h-full object-cover" />
              {/* Radial vignette */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,#0A0A0C_100%)] opacity-50" />
              {/* Bottom fade */}
              <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#0A0A0C] to-transparent" />
            </div>
          </motion.div>
        </div>

        {/* Spacer — lets the image gradient melt into the next section */}
        <div className="h-32 md:h-44" />
      </section>

      {/* ─── Products ────────────────────────────────────────────── */}
      <section id="products" className="scroll-mt-20">

        {/* Financial Analysis */}
        <div className="py-24 md:py-32 px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={reveal}
            className="max-w-[1020px] mx-auto grid md:grid-cols-2 gap-14 md:gap-20 items-center"
          >
            <div className="max-w-[400px]">
              <h2 className="text-[clamp(1.5rem,2.6vw,2.25rem)] font-display font-semibold text-white/90 leading-[1.15] tracking-[-0.02em] mb-3">
                Deep <span className="text-[#C08B5C]">financial</span> analysis
              </h2>
              <div className="w-6 h-px bg-white/[0.06] mb-5" />
              <p className="text-white/25 text-[14px] leading-[1.85]">
                Cap rate, cash-on-cash returns, and 30-year projections from live market data. Every property underwritten in under a second.
              </p>
            </div>
            <div className="group rounded-[16px] overflow-hidden aspect-[4/3] relative bg-[#111] shadow-[0_4px_40px_rgba(0,0,0,0.35)]">
              <img src="/assets/financial-analysis.png" alt="Financial Analysis" className="w-full h-full object-cover transition-all duration-700 group-hover:brightness-[1.08]" />
              {/* Radial vignette */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,#0A0A0C_100%)] opacity-50" />
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0A0A0C]/60 to-transparent" />
            </div>
          </motion.div>
        </div>

        {/* Market Intelligence */}
        <div className="py-24 md:py-32 px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={reveal}
            className="max-w-[1020px] mx-auto grid md:grid-cols-2 gap-14 md:gap-20 items-center"
          >
            <div className="order-2 md:order-1 group rounded-[16px] overflow-hidden aspect-[4/3] relative bg-[#111] shadow-[0_4px_40px_rgba(0,0,0,0.35)]">
              <img src="/assets/market-intelligence.png" alt="Market Intelligence" className="w-full h-full object-cover transition-all duration-700 group-hover:brightness-[1.08]" />
              {/* Radial vignette */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,#0A0A0C_100%)] opacity-50" />
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0A0A0C]/60 to-transparent" />
            </div>
            <div className="order-1 md:order-2 max-w-[400px]">
              <h2 className="text-[clamp(1.5rem,2.6vw,2.25rem)] font-display font-semibold text-white/90 leading-[1.15] tracking-[-0.02em] mb-3">
                Live <span className="text-[#C08B5C]">market</span> intelligence
              </h2>
              <div className="w-6 h-px bg-white/[0.06] mb-5" />
              <p className="text-white/25 text-[14px] leading-[1.85] mb-6">
                Rental trends and off-market opportunities from MLS, county records, and private listings. Before they hit the portals.
              </p>
              <ul className="space-y-2.5">
                {['STR and LTR comparables', 'Appreciation heatmaps', 'Live rental estimates'].map(item => (
                  <li key={item} className="flex items-center gap-2.5 text-white/20 text-[13px]">
                    <CheckIcon className="w-3 h-3 text-[#C08B5C]/40 shrink-0" /> {item}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>

        {/* ─── Vision — visual chapter break ─────────────────────── */}
        <div className="py-28 md:py-36 px-6 bg-[#09090B]">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={reveal}
            className="max-w-[500px] mx-auto text-center"
          >
            {/* Accent line with subtle pulse */}
            <div className="w-8 h-px bg-violet-400/25 mx-auto mb-8 animate-pulse" style={{ animationDuration: '3s' }} />

            <p className="text-violet-400/50 text-[12px] font-medium tracking-[0.1em] uppercase mb-5">Vasthu Vision</p>
            <h2 className="text-[clamp(1.625rem,3vw,2.5rem)] font-display font-semibold text-white/90 leading-[1.12] tracking-[-0.02em] mb-5">
              See{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-violet-300">
                what others miss
              </span>
            </h2>
            <p className="text-white/25 text-[14px] leading-[1.85] mb-10">
              Point your camera at any room. Instant damage detection, condition assessment, and renovation cost estimates.
            </p>

            {/* Vision product image */}
            <div className="group rounded-[16px] overflow-hidden aspect-[4/3] relative bg-[#111] shadow-[0_4px_40px_rgba(0,0,0,0.35)] mb-10 max-w-[520px] mx-auto">
              <img src="/assets/vision-scan.png" alt="Vasthu Vision — AI property damage detection" className="w-full h-full object-cover transition-all duration-700 group-hover:brightness-[1.08]" />
              {/* Radial vignette */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,#09090B_100%)] opacity-50" />
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#09090B]/60 to-transparent" />
            </div>

            <a href="/vision" className="inline-flex items-center gap-1.5 text-violet-400/60 text-[13px] font-medium hover:text-violet-400/90 transition-colors duration-300">
              Try Vasthu Vision <ArrowRightIcon className="w-3.5 h-3.5" />
            </a>
          </motion.div>
        </div>

      </section>

      {/* ─── Pricing ─────────────────────────────────────────────── */}
      <section id="pricing" className="py-28 md:py-36 px-6 scroll-mt-20">
        <div className="max-w-[760px] mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={reveal} className="text-center mb-14">
            <h2 className="text-[clamp(1.5rem,2.6vw,2.25rem)] font-display font-semibold text-white/90 tracking-[-0.02em] mb-3">Pricing</h2>
            <p className="text-white/20 text-[14px]">Start free. Upgrade when you need to.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 rounded-[16px] overflow-hidden border border-white/[0.03] shadow-[0_2px_30px_rgba(0,0,0,0.25)]">

            {/* Starter */}
            <div className="p-8 md:p-10 flex flex-col h-full border-b md:border-b-0 md:border-r border-white/[0.03] bg-[#0A0A0C]">
              <div className="mb-8">
                <h3 className="text-[13px] text-white/30 mb-2 font-medium">Starter</h3>
                <div className="text-[28px] font-display font-semibold text-white leading-none">Free</div>
                <p className="text-white/15 text-[13px] mt-3">For getting started with analysis.</p>
              </div>
              <ul className="space-y-3 mb-10 flex-1">
                {['2 property analyses / month', '2 PDF reports / month', 'Basic market insights', '2 Vision scans / month'].map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-white/30 text-[12px]">
                    <CheckIcon className="w-3 h-3 text-white/10 shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <button onClick={onNavigateToSignUp} className="w-full py-2.5 rounded-full border border-white/[0.05] text-white/40 text-[13px] font-medium hover:bg-white/[0.02] transition-colors duration-300">
                Get started
              </button>
            </div>

            {/* Pro */}
            <div className="p-8 md:p-10 flex flex-col h-full bg-[#0C0C0E]">
              <div className="mb-8">
                <h3 className="text-[13px] text-[#C08B5C]/60 mb-2 font-medium">Pro</h3>
                <div className="text-[28px] font-display font-semibold text-white leading-none">$100<span className="text-[14px] font-normal text-white/15 ml-1">/ mo</span></div>
                <p className="text-white/15 text-[13px] mt-3">Unlimited access to everything.</p>
              </div>
              <ul className="space-y-3 mb-10 flex-1">
                {['Unlimited analyses', 'Unlimited PDF reports', 'Market mapping & portfolio', 'Unlimited Vision scans', 'Voice chat with AI', 'Priority support'].map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-white/40 text-[12px]">
                    <CheckIcon className="w-3 h-3 text-[#C08B5C]/30 shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <button onClick={onNavigateToSignUp} className="w-full py-2.5 rounded-full bg-[#C08B5C] text-[#0A0A0C] text-[13px] font-medium hover:bg-[#D4A27F] transition-colors duration-300">
                Upgrade to Pro
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* ─── FAQ ──────────────────────────────────────────────────── */}
      <section className="py-20 md:py-28 px-6">
        <div className="max-w-[560px] mx-auto">
          <h2 className="text-[18px] font-display font-medium text-white/60 tracking-tight mb-8 text-center">Questions</h2>
          {[
            { q: 'How is Vasthu different from Zillow?', a: 'Vasthu is an active analyst, not a passive listing site. We underwrite deals — calculating cash flow, projecting appreciation, and surfacing off-market value that portals miss.' },
            { q: 'What data sources are used?', a: 'Real-time data from RentCast, county tax records, MLS-connected feeds, and census bureaus. Every analysis uses investment-grade sources.' },
            { q: 'What is Vasthu Vision?', a: 'A standalone property analysis product. Point your camera at any room for instant damage detection, condition assessment, and renovation cost estimates.' },
            { q: 'Can I export reports for lenders?', a: 'Yes. Pro subscribers can generate white-labeled PDF reports with market comps, renovation estimates, and 30-year projections.' },
          ].map((faq, i) => (
            <FAQItem key={i} q={faq.q} a={faq.a} />
          ))}
        </div>
      </section>

      {/* ─── About ───────────────────────────────────────────────── */}
      <section id="about" className="py-24 md:py-32 px-6 scroll-mt-20">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={reveal}
          className="max-w-[440px] mx-auto text-center"
        >
          <div className="w-8 h-px bg-white/[0.06] mx-auto mb-8" />
          <h2 className="text-[18px] font-display font-medium text-white/60 tracking-tight mb-5">About</h2>
          <p className="text-white/20 text-[14px] leading-[1.9]">
            Built by investors, for investors. Vasthu exists because everyone deserves{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C08B5C] to-[#D4A27F]">institutional-grade</span>
            {' '}analysis — whether you're buying your first duplex or managing a thousand doors.
          </p>
        </motion.div>
      </section>

      {/* ─── Footer ──────────────────────────────────────────────── */}
      <footer className="pt-16 pb-10 px-6 border-t border-white/[0.025]">
        <div className="max-w-[920px] mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-14">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <Logo variant="light" showText={false} className="w-[18px] h-[18px] opacity-30" />
                <span className="text-[12px] font-display font-medium text-white/25">Vasthu</span>
              </div>
              <p className="text-white/12 text-[11px] leading-relaxed max-w-[180px]">AI-powered real estate analysis.</p>
            </div>
            <div>
              <p className="text-[10px] text-white/15 uppercase tracking-[0.1em] mb-3 font-medium">Products</p>
              <div className="space-y-2">
                <button onClick={() => scrollTo('products')} className="block text-[12px] text-white/20 hover:text-white/45 transition-colors duration-300">Vasthu AI</button>
                <a href="/vision" className="block text-[12px] text-white/20 hover:text-white/45 transition-colors duration-300">Vasthu Vision</a>
              </div>
            </div>
            <div>
              <p className="text-[10px] text-white/15 uppercase tracking-[0.1em] mb-3 font-medium">Company</p>
              <div className="space-y-2">
                <button onClick={() => scrollTo('about')} className="block text-[12px] text-white/20 hover:text-white/45 transition-colors duration-300">About</button>
                <button onClick={() => scrollTo('pricing')} className="block text-[12px] text-white/20 hover:text-white/45 transition-colors duration-300">Pricing</button>
              </div>
            </div>
            <div>
              <p className="text-[10px] text-white/15 uppercase tracking-[0.1em] mb-3 font-medium">Legal</p>
              <div className="space-y-2">
                <a href="/privacy-policy" className="block text-[12px] text-white/20 hover:text-white/45 transition-colors duration-300">Privacy</a>
                <a href="/terms-of-service" className="block text-[12px] text-white/20 hover:text-white/45 transition-colors duration-300">Terms</a>
                <a href="/cookie-policy" className="block text-[12px] text-white/20 hover:text-white/45 transition-colors duration-300">Cookies</a>
              </div>
            </div>
          </div>
          <div className="pt-6 border-t border-white/[0.025] flex items-center justify-between">
            <span className="text-white/10 text-[11px]">&copy; {new Date().getFullYear()} Civitas AI</span>
            <div className="flex gap-5 text-white/10 text-[11px]">
              <a href="#" className="hover:text-white/25 transition-colors duration-300">Twitter</a>
              <a href="#" className="hover:text-white/25 transition-colors duration-300">LinkedIn</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};
