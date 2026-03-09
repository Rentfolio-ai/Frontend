import React, { useState, useEffect, useCallback } from 'react';
import { CheckIcon, ArrowRightIcon, ChevronDownIcon, MenuIcon, CloseIcon } from '../../components/ui/CustomIcons';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';

// ─── Types ──────────────────────────────────────────────────────────────────

interface VisionLandingPageProps {
  onNavigateToSignIn: () => void;
  onNavigateToSignUp: () => void;
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
    <button onClick={() => setOpen(!open)} className="w-full text-left py-7 group border-b border-black/[0.04]">
      <div className="flex items-center justify-between gap-6">
        <h4 className="text-[15px] font-sans font-medium text-foreground/70 group-hover:text-foreground transition-colors">{q}</h4>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDownIcon className="w-4 h-4 text-muted-foreground/40 flex-shrink-0" />
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
            <p className="mt-4 text-[14px] text-muted-foreground/50 leading-[1.85] max-w-lg">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
};

// ─── Shimmer button class ───────────────────────────────────────────────────

const shimmerBtn = 'relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:-translate-x-full hover:before:translate-x-full before:transition-transform before:duration-700';

// ═══════════════════════════════════════════════════════════════════════════

export const VisionLandingPage: React.FC<VisionLandingPageProps> = ({
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
    <div className="min-h-screen bg-background text-foreground font-sans antialiased selection:bg-violet-500/20 overflow-x-hidden">

      {/* ─── Nav ─────────────────────────────────────────────────── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${navScrolled ? 'bg-background/70 backdrop-blur-2xl' : ''}`}>
        <div className="max-w-[1080px] mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* <ScanEye className="w-[22px] h-[22px] text-violet-400" /> */}
            <img src="/assets/vasthu-vision-logo.png" alt="Vasthu Vision" className="w-10 h-10 object-contain" />
            <span className="text-[14px] font-display font-semibold text-foreground tracking-tight">Vasthu Vision</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-[13px] text-muted-foreground/50">
            <button onClick={() => scrollTo('features')} className="hover:text-foreground/70 transition-colors duration-300">Features</button>
            <button onClick={() => scrollTo('pricing')} className="hover:text-foreground/70 transition-colors duration-300">Pricing</button>
            <a href="/" className="hover:text-foreground/70 transition-colors duration-300">Vasthu AI</a>
          </div>
          <div className="flex items-center gap-4">
            {recentUser ? (
              <button onClick={handleContinue} className="text-[13px] text-muted-foreground/70 hover:text-foreground/80 transition-colors duration-300">
                Continue as {recentUser.name.split(' ')[0]}
              </button>
            ) : (
              <>
                <button onClick={onNavigateToSignIn} className="hidden md:block text-[13px] text-muted-foreground/50 hover:text-foreground/70 transition-colors duration-300">Sign in</button>
                <button onClick={onNavigateToSignUp} className={`text-[13px] bg-violet-500 text-white px-4 py-[6px] rounded-full font-medium hover:bg-violet-400 transition-colors duration-300 ${shimmerBtn}`}>
                  Get started
                </button>
              </>
            )}
            <button onClick={() => setMobileMenuOpen(true)} className="md:hidden p-1.5 text-muted-foreground/50">
              <MenuIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* ─── Mobile Menu ─────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-background md:hidden">
            <div className="flex flex-col h-full px-6 pt-6">
              <div className="flex items-center justify-between mb-20">
                <span className="text-[14px] font-display font-semibold text-foreground">Vasthu Vision</span>
                <button onClick={() => setMobileMenuOpen(false)} className="p-2"><CloseIcon className="w-5 h-5 text-muted-foreground/50" /></button>
              </div>
              <div className="space-y-8">
                {(['features', 'pricing'] as const).map(id => (
                  <button key={id} onClick={() => scrollTo(id)} className="text-[32px] font-display font-medium text-muted-foreground/50 hover:text-foreground/70 block w-full text-left capitalize tracking-tight transition-colors duration-300">
                    {id}
                  </button>
                ))}
                <a href="/" className="text-[32px] font-display font-medium text-muted-foreground/50 hover:text-foreground/70 block w-full text-left tracking-tight transition-colors duration-300">
                  Vasthu AI
                </a>
              </div>
              <div className="mt-auto pb-12 space-y-3">
                <button onClick={() => { setMobileMenuOpen(false); onNavigateToSignUp(); }} className="w-full py-3 rounded-full bg-violet-500 text-foreground font-medium text-[14px]">Get started</button>
                <button onClick={() => { setMobileMenuOpen(false); onNavigateToSignIn(); }} className="w-full py-3 text-muted-foreground/50 text-[14px]">Sign in</button>
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
          <div className="inline-flex items-center gap-2 mb-6">
            <img src="/assets/vasthu-vision-logo.png" alt="" className="w-8 h-8 object-contain opacity-80" />
            <span className="text-violet-400/50 text-[12px] font-medium tracking-[0.1em] uppercase">Vasthu Vision</span>
          </div>

          <h1 className="text-[clamp(2.25rem,5.2vw,3.75rem)] font-display font-bold text-foreground leading-[1.08] tracking-[-0.025em] mb-6">
            See{'\u00A0'}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-violet-300 to-violet-400 bg-[length:200%_auto] animate-gradient">
              what others miss
            </span>
          </h1>

          {/* Thin rule — animated width + subtle pulse */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: 40 }}
            transition={{ duration: 0.8, delay: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
            className="h-px bg-violet-400/20 mx-auto mb-6 animate-pulse"
            style={{ animationDuration: '3s' }}
          />

          <p className="text-[16px] md:text-[17px] text-muted-foreground/50 leading-[1.75] mb-10 max-w-[440px] mx-auto">
            Point your camera at any room. Instant damage detection, condition assessment, and renovation cost estimates powered by AI.
          </p>
          {recentUser ? (
            <button onClick={handleContinue} className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-violet-500 text-foreground font-medium text-[13px] hover:bg-violet-400 transition-colors duration-300 ${shimmerBtn}`}>
              Continue as {recentUser.name.split(' ')[0]} <ArrowRightIcon className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button onClick={onNavigateToSignUp} className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-violet-500 text-foreground font-medium text-[13px] hover:bg-violet-400 transition-colors duration-300 ${shimmerBtn}`}>
              Get started free <ArrowRightIcon className="w-3.5 h-3.5" />
            </button>
          )}
        </motion.div>

        {/* Hero image — parallax + radial vignette */}
        <div className="max-w-[640px] mx-auto mt-20 overflow-hidden">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            style={{ y: heroY }}
          >
            <div className="rounded-[20px] overflow-hidden aspect-[4/3] relative bg-background shadow-[0_8px_80px_rgba(139,92,246,0.08)] border border-black/[0.05]">
              <img src="/assets/vision-hero-premium.png" alt="Vasthu Vision" className="w-full h-full object-cover" />
              {/* Radial vignette */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,#F3E4D6_100%)] opacity-50" />
              {/* Bottom fade */}
              <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#F3E4D6] to-transparent" />
            </div>
          </motion.div>
        </div>

        {/* Spacer */}
        <div className="h-32 md:h-44" />
      </section>

      {/* ─── Features ────────────────────────────────────────────── */}
      <section id="features" className="scroll-mt-20">

        {/* Damage Detection — text left, image right */}
        <div className="py-24 md:py-32 px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={reveal}
            className="max-w-[1020px] mx-auto grid md:grid-cols-2 gap-14 md:gap-20 items-center"
          >
            <div className="max-w-[400px]">
              <h2 className="text-[clamp(1.5rem,2.6vw,2.25rem)] font-display font-semibold text-foreground leading-[1.15] tracking-[-0.02em] mb-3">
                AI-powered <span className="text-violet-400">damage</span> detection
              </h2>
              <div className="w-6 h-px bg-violet-400/20 mb-5" />
              <p className="text-muted-foreground/50 text-[14px] leading-[1.85] mb-6">
                Automatically identifies water damage, structural cracks, mold, worn flooring, and 15+ other damage categories. Each issue is classified by severity with confidence scores.
              </p>
              <ul className="space-y-2.5">
                {['Water damage & staining', 'Structural cracks & settling', 'Mold & moisture indicators', 'Flooring wear & damage'].map(item => (
                  <li key={item} className="flex items-center gap-2.5 text-muted-foreground/40 text-[13px]">
                    <CheckIcon className="w-3 h-3 text-violet-400/40 shrink-0" /> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="group rounded-[16px] overflow-hidden aspect-[4/3] relative bg-background shadow-[0_4px_40px_rgba(0,0,0,0.35)]">
              <img src="/assets/vision-damage-detection.png" alt="Damage Detection" className="w-full h-full object-cover transition-all duration-700 group-hover:brightness-[1.08]" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,#F3E4D6_100%)] opacity-50" />
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#F3E4D6]/60 to-transparent" />
            </div>
          </motion.div>
        </div>

        {/* Condition Scoring — image left, text right */}
        <div className="py-24 md:py-32 px-6 bg-background">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={reveal}
            className="max-w-[1020px] mx-auto grid md:grid-cols-2 gap-14 md:gap-20 items-center"
          >
            <div className="order-2 md:order-1 group rounded-[16px] overflow-hidden aspect-[4/3] relative bg-background shadow-[0_4px_40px_rgba(0,0,0,0.35)]">
              <img src="/assets/vision-condition-score-v2.png" alt="Condition Assessment" className="w-full h-full object-cover transition-all duration-700 group-hover:brightness-[1.08]" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,#F3E4D6_100%)] opacity-50" />
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#F3E4D6]/60 to-transparent" />
            </div>
            <div className="order-1 md:order-2 max-w-[400px]">
              <h2 className="text-[clamp(1.5rem,2.6vw,2.25rem)] font-display font-semibold text-foreground leading-[1.15] tracking-[-0.02em] mb-3">
                Instant <span className="text-violet-400">condition</span> scoring
              </h2>
              <div className="w-6 h-px bg-violet-400/20 mb-5" />
              <p className="text-muted-foreground/50 text-[14px] leading-[1.85] mb-6">
                Every room gets a 0-10 condition score based on visible wear, damage severity, and overall upkeep. Compare rooms across properties to make informed decisions.
              </p>
              <ul className="space-y-2.5">
                {['Room-by-room scoring', 'Severity-weighted assessment', 'Historical comparison', 'Investment deal scoring'].map(item => (
                  <li key={item} className="flex items-center gap-2.5 text-muted-foreground/40 text-[13px]">
                    <CheckIcon className="w-3 h-3 text-violet-400/40 shrink-0" /> {item}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>

        {/* Cost Estimates — text left, image right */}
        <div className="py-24 md:py-32 px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={reveal}
            className="max-w-[1020px] mx-auto grid md:grid-cols-2 gap-14 md:gap-20 items-center"
          >
            <div className="max-w-[400px]">
              <h2 className="text-[clamp(1.5rem,2.6vw,2.25rem)] font-display font-semibold text-foreground leading-[1.15] tracking-[-0.02em] mb-3">
                Renovation <span className="text-violet-400">cost</span> estimates
              </h2>
              <div className="w-6 h-px bg-violet-400/20 mb-5" />
              <p className="text-muted-foreground/50 text-[14px] leading-[1.85] mb-6">
                Get three-tier repair estimates (basic, standard, premium) for every detected issue. Export branded PDF reports for lenders, partners, or your own records.
              </p>
              <ul className="space-y-2.5">
                {['Three-tier cost breakdown', 'Contractor-grade estimates', 'Branded PDF export', 'Portfolio tracking'].map(item => (
                  <li key={item} className="flex items-center gap-2.5 text-muted-foreground/40 text-[13px]">
                    <CheckIcon className="w-3 h-3 text-violet-400/40 shrink-0" /> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="group rounded-[16px] overflow-hidden aspect-[4/3] relative bg-background shadow-[0_4px_40px_rgba(0,0,0,0.35)]">
              <img src="/assets/vision-cost-breakdown-v2.png" alt="Cost Estimates" className="w-full h-full object-cover transition-all duration-700 group-hover:brightness-[1.08]" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,#F3E4D6_100%)] opacity-50" />
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#F3E4D6]/60 to-transparent" />
            </div>
          </motion.div>
        </div>

      </section>

      {/* ─── Pricing ─────────────────────────────────────────────── */}
      <section id="pricing" className="py-28 md:py-36 px-6 scroll-mt-20 bg-background">
        <div className="max-w-[760px] mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={reveal} className="text-center mb-14">
            <h2 className="text-[clamp(1.5rem,2.6vw,2.25rem)] font-display font-semibold text-foreground tracking-[-0.02em] mb-3">Pricing</h2>
            <p className="text-muted-foreground/40 text-[14px]">Start free. Upgrade when you need to.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 rounded-[16px] overflow-hidden border border-black/[0.05] shadow-[0_2px_30px_rgba(0,0,0,0.25)]">

            {/* Starter */}
            <div className="p-8 md:p-10 flex flex-col h-full border-b md:border-b-0 md:border-r border-black/[0.05] bg-background">
              <div className="mb-8">
                <h3 className="text-[13px] text-muted-foreground/50 mb-2 font-medium">Starter</h3>
                <div className="text-[28px] font-display font-semibold text-foreground leading-none">Free</div>
                <p className="text-muted-foreground/40 text-[13px] mt-3">Try Vision on a few rooms.</p>
              </div>
              <ul className="space-y-3 mb-10 flex-1">
                {['2 Vision scans / month', 'Damage detection', 'Condition scoring', 'Basic cost estimates'].map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-muted-foreground/50 text-[12px]">
                    <CheckIcon className="w-3 h-3 text-muted-foreground/30 shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <button onClick={onNavigateToSignUp} className="w-full py-2.5 rounded-full border border-black/[0.05] text-muted-foreground/70 text-[13px] font-medium hover:bg-black/[0.02] transition-colors duration-300">
                Get started
              </button>
            </div>

            {/* Pro */}
            <div className="p-8 md:p-10 flex flex-col h-full bg-background">
              <div className="mb-8">
                <h3 className="text-[13px] text-violet-400/60 mb-2 font-medium">Pro</h3>
                <div className="text-[28px] font-display font-semibold text-foreground leading-none">$100<span className="text-[14px] font-normal text-muted-foreground/40 ml-1">/ mo</span></div>
                <p className="text-muted-foreground/40 text-[13px] mt-3">Unlimited scans. Full Vasthu suite.</p>
              </div>
              <ul className="space-y-3 mb-10 flex-1">
                {['Unlimited Vision scans', 'Branded PDF reports', 'Portfolio history', 'All Vasthu AI features', 'Voice chat with AI', 'Priority support'].map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-muted-foreground/70 text-[12px]">
                    <CheckIcon className="w-3 h-3 text-violet-400/30 shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <button onClick={onNavigateToSignUp} className="w-full py-2.5 rounded-full bg-violet-500 text-white text-[13px] font-medium hover:bg-violet-400 transition-colors duration-300">
                Upgrade to Pro
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* ─── FAQ ──────────────────────────────────────────────────── */}
      <section className="py-20 md:py-28 px-6">
        <div className="max-w-[560px] mx-auto">
          <h2 className="text-[18px] font-display font-medium text-muted-foreground tracking-tight mb-8 text-center">Questions</h2>
          {[
            { q: 'How does Vision detect damage?', a: 'Vasthu Vision uses a custom-trained computer vision model to identify 15+ damage categories including water stains, structural cracks, mold, and flooring wear. Each detection includes severity classification and confidence scores.' },
            { q: 'How accurate are the cost estimates?', a: 'Estimates are based on national contractor rate databases and adjusted for regional pricing. We provide three tiers (basic, standard, premium) so you can plan for different renovation strategies.' },
            { q: 'Can I use this for property inspections?', a: 'Yes. Vision is designed for investors, property managers, and inspectors. You can scan rooms during walkthroughs and export branded PDF reports for lenders or partners.' },
            { q: 'What is Vasthu AI?', a: 'Vasthu AI is our flagship property analysis platform. It provides deal underwriting, market intelligence, and AI-powered investment analysis. Pro subscribers get access to both products.' },
          ].map((faq, i) => (
            <FAQItem key={i} q={faq.q} a={faq.a} />
          ))}
        </div>
      </section>

      {/* ─── About ───────────────────────────────────────────────── */}
      <section className="py-24 md:py-32 px-6">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={reveal}
          className="max-w-[440px] mx-auto text-center"
        >
          <div className="w-8 h-px bg-violet-400/20 mx-auto mb-8" />
          <h2 className="text-[18px] font-display font-medium text-muted-foreground tracking-tight mb-5">About</h2>
          <p className="text-muted-foreground/40 text-[14px] leading-[1.9]">
            Vasthu Vision is built on a custom computer vision model trained specifically for property analysis. Part of the{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-violet-300">Vasthu</span>
            {' '}ecosystem, it gives investors, inspectors, and property managers an unfair advantage — turning a phone camera into an institutional-grade assessment tool.
          </p>
        </motion.div>
      </section>

      {/* ─── Footer ──────────────────────────────────────────────── */}
      <footer className="pt-16 pb-10 px-6 border-t border-black/[0.04]">
        <div className="max-w-[920px] mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-14">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <img src="/assets/vasthu-vision-logo.png" alt="" className="w-[18px] h-[18px] object-contain opacity-30" />
                <span className="text-[12px] font-display font-medium text-muted-foreground/50">Vasthu Vision</span>
              </div>
              <p className="text-muted-foreground/40 text-[11px] leading-relaxed max-w-[180px]">AI-powered property damage detection.</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground/40 uppercase tracking-[0.1em] mb-3 font-medium">Products</p>
              <div className="space-y-2">
                <a href="/vision" className="block text-[12px] text-muted-foreground/40 hover:text-muted-foreground/70 transition-colors duration-300">Vasthu Vision</a>
                <a href="/" className="block text-[12px] text-muted-foreground/40 hover:text-muted-foreground/70 transition-colors duration-300">Vasthu AI</a>
              </div>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground/40 uppercase tracking-[0.1em] mb-3 font-medium">Company</p>
              <div className="space-y-2">
                <button onClick={() => scrollTo('features')} className="block text-[12px] text-muted-foreground/40 hover:text-muted-foreground/70 transition-colors duration-300">Features</button>
                <button onClick={() => scrollTo('pricing')} className="block text-[12px] text-muted-foreground/40 hover:text-muted-foreground/70 transition-colors duration-300">Pricing</button>
              </div>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground/40 uppercase tracking-[0.1em] mb-3 font-medium">Legal</p>
              <div className="space-y-2">
                <a href="/privacy-policy" className="block text-[12px] text-muted-foreground/40 hover:text-muted-foreground/70 transition-colors duration-300">Privacy</a>
                <a href="/terms-of-service" className="block text-[12px] text-muted-foreground/40 hover:text-muted-foreground/70 transition-colors duration-300">Terms</a>
                <a href="/cookie-policy" className="block text-[12px] text-muted-foreground/40 hover:text-muted-foreground/70 transition-colors duration-300">Cookies</a>
              </div>
            </div>
          </div>
          <div className="pt-6 border-t border-black/[0.04] flex items-center justify-between">
            <span className="text-muted-foreground/30 text-[11px]">&copy; {new Date().getFullYear()} Civitas AI</span>
            <div className="flex gap-5 text-muted-foreground/30 text-[11px]">
              <a href="#" className="hover:text-muted-foreground/50 transition-colors duration-300">Twitter</a>
              <a href="#" className="hover:text-muted-foreground/50 transition-colors duration-300">LinkedIn</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};
