import React, { useState, useEffect, useCallback, useRef } from 'react';
import { CheckIcon, ArrowRightIcon, MenuIcon, CloseIcon } from '../../components/ui/CustomIcons';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Logo } from '../../components/ui/Logo';
import { useAuth } from '../../contexts/AuthContext';
import {
  Zap, Star, Shield, ArrowUp, Search, ChevronDown, BadgeCheck, Clock, ArrowRight,
  BookOpen, BarChart3, Users,
} from 'lucide-react';
import {
  DealUnderwritingIcon, MarketIntelIcon, AIChatModesIcon,
  VoiceAssistantIcon, PortfolioStrategyIcon, ProfessionalReportsIcon,
} from '../../components/ui/PremiumIcons';
import { DemoVideoEmbed } from '../../components/landing/DemoVideoEmbed';

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

// ─── Shimmer button class ───────────────────────────────────────────────────

const shimmerBtn = 'relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:-translate-x-full hover:before:translate-x-full before:transition-transform before:duration-700';

// ─── Social SVG icons ───────────────────────────────────────────────────────

const XTwitterIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
);

const LinkedInIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
);

// ─── FAQ data ───────────────────────────────────────────────────────────────

const FAQ_DATA = [
  { q: 'How is Vasthu different from Zillow?', a: 'Vasthu is an active analyst, not a passive listing site. We underwrite deals — calculating cash flow, projecting appreciation, and surfacing off-market value that portals miss.', cat: 'General' },
  { q: 'What data sources are used?', a: 'Real-time data from RentCast, county tax records, MLS-connected feeds, and census bureaus. Every analysis uses investment-grade sources.', cat: 'Features' },
  { q: 'Can I export reports for lenders?', a: 'Yes. Pro subscribers can generate white-labeled PDF reports with market comps, renovation estimates, and 30-year projections.', cat: 'Features' },
  { q: 'Is there a limit on property analyses?', a: 'Free plan includes 2 analyses per month. Pro subscribers get unlimited analyses, reports, and access to all AI modes.', cat: 'Billing' },
  { q: 'How does voice mode work?', a: 'Voice mode uses real-time speech recognition to let you interact with Vasthu hands-free. Just speak naturally and get instant analysis, property data, and market insights.', cat: 'Features' },
  { q: 'Can I cancel anytime?', a: 'Yes, cancel from Settings at any time. Pro features remain active through your billing period. No hidden fees or penalties.', cat: 'Billing' },
];

const FAQ_CATS = ['All', 'General', 'Features', 'Billing'] as const;

// ═══════════════════════════════════════════════════════════════════════════

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigateToSignIn,
  onNavigateToSignUp,
}) => {
  const { resumeSession } = useAuth();
  const recentUser = useRecentSession();
  const [navScrolled, setNavScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAnnual, setIsAnnual] = useState(false);
  const [faqCat, setFaqCat] = useState<string>('All');
  const [faqSearch, setFaqSearch] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showMoreTestimonials, setShowMoreTestimonials] = useState(false);

  const demoRef = useRef<HTMLDivElement>(null);

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

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const filteredFaqs = FAQ_DATA.filter((f) => {
    const matchesCat = faqCat === 'All' || f.cat === faqCat;
    const matchesSearch = !faqSearch || f.q.toLowerCase().includes(faqSearch.toLowerCase()) || f.a.toLowerCase().includes(faqSearch.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-white font-sans antialiased selection:bg-[#C08B5C]/20 overflow-x-hidden">

      {/* ─── Nav ─────────────────────────────────────────────────── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${navScrolled ? 'bg-[#0A0A0C]/70 backdrop-blur-2xl border-b border-white/[0.04]' : ''}`}>
        <div className="max-w-[1080px] mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo variant="light" showText={false} className="w-[22px] h-[22px]" />
            <span className="text-[14px] font-display font-semibold text-white/90 tracking-tight">Vasthu</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-[13px] text-white/40">
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
      <section className="pt-40 md:pt-48 px-6 relative overflow-hidden">
        <motion.div
          className="absolute -top-20 -right-20 w-[500px] h-[500px] rounded-full opacity-[0.07] pointer-events-none"
          style={{ background: 'radial-gradient(circle, #C08B5C, transparent 70%)' }}
          animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-32 -left-20 w-[400px] h-[400px] rounded-full opacity-[0.05] pointer-events-none"
          style={{ background: 'radial-gradient(circle, #4F46E5, transparent 70%)' }}
          animate={{ x: [0, -20, 0], y: [0, 30, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
        />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
          className="max-w-[640px] mx-auto text-center relative z-10"
        >
          <h1 className="text-[clamp(2.25rem,5.2vw,3.75rem)] font-display font-bold text-white leading-[1.08] tracking-[-0.025em] mb-6">
            Analyze any rental{'\u00A0'}property{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C08B5C] via-[#D4A27F] to-[#C08B5C] bg-[length:200%_auto] animate-gradient">
              in seconds
            </span>
          </h1>

          <motion.div
            initial={{ width: 0 }}
            animate={{ width: 40 }}
            transition={{ duration: 0.8, delay: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
            className="h-px bg-white/[0.08] mx-auto mb-6"
          />

          <p className="text-[16px] md:text-[17px] text-white/35 leading-[1.75] mb-10 max-w-[420px] mx-auto">
            AI-powered underwriting and market intelligence for rental property investors.
          </p>

          <div className="flex items-center justify-center gap-3 mb-8">
            {recentUser ? (
              <button onClick={handleContinue} className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#C08B5C] text-[#0A0A0C] font-medium text-[13px] hover:bg-[#D4A27F] transition-colors duration-300 ${shimmerBtn}`}>
                Continue as {recentUser.name.split(' ')[0]} <ArrowRightIcon className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button onClick={onNavigateToSignUp} className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#C08B5C] text-[#0A0A0C] font-medium text-[13px] hover:bg-[#D4A27F] transition-colors duration-300 ${shimmerBtn}`}>
                Get started free <ArrowRightIcon className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={() => demoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/[0.08] text-white/50 text-[13px] font-medium hover:text-white/80 hover:border-white/[0.15] transition-all duration-300"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
              Watch demo
            </button>
          </div>

          <div className="flex items-center justify-center gap-3">
            <div className="flex -space-x-2">
              {['from-[#C08B5C] to-[#A8734A]', 'from-[#4F46E5] to-[#6366F1]', 'from-[#10B981] to-[#059669]', 'from-[#F59E0B] to-[#D97706]', 'from-[#8B5CF6] to-[#7C3AED]'].map((gradient, i) => (
                <div key={i} className={`w-7 h-7 rounded-full bg-gradient-to-br ${gradient} border-2 border-[#0A0A0C]`} />
              ))}
            </div>
            <span className="text-[12px] text-white/30">Trusted by 1,200+ investors</span>
          </div>
        </motion.div>

        <div ref={demoRef} className="max-w-[1020px] mx-auto mt-20 overflow-hidden">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            style={{ y: heroY }}
          >
            <DemoVideoEmbed />
          </motion.div>
        </div>

        <div className="h-32 md:h-44" />
      </section>

      {/* ─── Products — Bento Grid (upgraded icons) ───────────────── */}
      <section id="products" className="py-28 md:py-36 px-6 scroll-mt-20">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={reveal} className="text-center mb-16">
          <h2 className="text-[clamp(1.5rem,2.6vw,2.25rem)] font-display font-semibold text-white/90 tracking-[-0.02em] mb-3">
            Everything you <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C08B5C] to-[#D4A27F]">need</span>
          </h2>
          <div className="w-8 h-px bg-white/[0.06] mx-auto mb-4" />
          <p className="text-white/30 text-[14px] max-w-[400px] mx-auto">Institutional-grade tools built for individual investors.</p>
        </motion.div>

        <div className="max-w-[1020px] mx-auto grid grid-cols-1 md:grid-cols-3 md:grid-rows-[280px_200px_240px] gap-4">
          {([
            { IconComp: DealUnderwritingIcon, title: 'Deal Underwriting', desc: 'Cash flow, cap rate, ROI, and 30-year projections from live market data.', img: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&q=80&auto=format&fit=crop', span: 'md:row-span-2 md:col-span-1', h: 'h-[280px] md:h-full', shadow: '0 4px 24px rgba(192,139,92,0.4)' },
            { IconComp: MarketIntelIcon, title: 'Market Intelligence', desc: 'Rental trends, off-market opportunities, and appreciation heatmaps from live feeds.', img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80&auto=format&fit=crop', span: 'md:col-span-2', h: 'h-[220px] md:h-full', shadow: '0 4px 24px rgba(59,130,246,0.4)' },
            { IconComp: AIChatModesIcon, title: 'AI Chat Modes', desc: 'Hunter, Research, and Strategist — three specialized AI modes.', img: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&q=80&auto=format&fit=crop', span: '', h: 'h-[220px] md:h-full', shadow: '0 4px 24px rgba(168,85,247,0.4)' },
            { IconComp: VoiceAssistantIcon, title: 'Voice Assistant', desc: 'Talk to Vasthu hands-free with real-time voice interaction.', img: 'https://images.unsplash.com/photo-1589903308904-1010c2294adc?w=800&q=80&auto=format&fit=crop', span: '', h: 'h-[220px] md:h-full', shadow: '0 4px 24px rgba(16,185,129,0.4)' },
            { IconComp: PortfolioStrategyIcon, title: 'Portfolio Strategy', desc: 'Portfolio-level planning with risk analysis and diversification insights.', img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80&auto=format&fit=crop', span: 'md:col-span-2', h: 'h-[220px] md:h-full', shadow: '0 4px 24px rgba(245,158,11,0.4)' },
            { IconComp: ProfessionalReportsIcon, title: 'Professional Reports', desc: 'White-labeled PDF reports with comps and projections — ready for lenders.', img: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80&auto=format&fit=crop', span: '', h: 'h-[220px] md:h-full', shadow: '0 4px 24px rgba(139,92,246,0.4)' },
          ] as const).map((feature, i) => {
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.08 }}
                className={`group relative rounded-2xl overflow-hidden cursor-pointer border border-white/[0.06] hover:border-white/[0.14] transition-all duration-500 ${feature.span} ${feature.h}`}
              >
                <img
                  src={feature.img}
                  alt={feature.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/10" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                <div className="absolute bottom-0 left-0 p-6 z-10">
                  <div className="mb-4 group-hover:scale-105 transition-transform duration-500" style={{ filter: `drop-shadow(${feature.shadow})` }}>
                    <feature.IconComp size={48} />
                  </div>
                  <h3 className="text-[16px] font-display font-semibold text-white mb-1.5">{feature.title}</h3>
                  <p className="text-[13px] text-white/55 leading-relaxed max-w-[280px]">{feature.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ─── Pricing (redesigned) ────────────────────────────────── */}
      <section id="pricing" className="py-28 md:py-36 px-6 scroll-mt-20">
        <div className="max-w-[860px] mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={reveal} className="text-center mb-10">
            <h2 className="text-[clamp(1.5rem,2.6vw,2.25rem)] font-display font-semibold text-white/90 tracking-[-0.02em] mb-3">
              Simple, transparent pricing
            </h2>
            <p className="text-white/25 text-[14px]">Start free. Upgrade when you need to.</p>
          </motion.div>

          {/* Animated toggle */}
          <div className="flex items-center justify-center gap-3 mb-12">
            <span className={`text-[13px] transition-colors duration-300 ${!isAnnual ? 'text-white/70' : 'text-white/30'}`}>Monthly</span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className="w-12 h-[26px] rounded-full bg-white/[0.08] border border-white/[0.12] relative cursor-pointer transition-colors duration-300 hover:bg-white/[0.12]"
            >
              <motion.div
                className="absolute top-[3px] w-5 h-5 rounded-full bg-gradient-to-br from-[#C08B5C] to-[#D4A27F]"
                animate={{ left: isAnnual ? 24 : 3 }}
                transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              />
            </button>
            <span className={`text-[13px] transition-colors duration-300 ${isAnnual ? 'text-white/70' : 'text-white/30'}`}>Annual</span>
            <AnimatePresence>
              {isAnnual && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/25"
                >
                  Save 20%
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          {/* Pricing cards — separate */}
          <div className="grid md:grid-cols-2 gap-5">
            {/* Starter */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="p-8 md:p-10 rounded-2xl border border-white/[0.06] bg-[#0A0A0C] flex flex-col"
            >
              <div className="mb-8">
                <h3 className="text-[13px] text-white/30 mb-2 font-medium">Starter</h3>
                <div className="text-[32px] font-display font-bold text-white leading-none">Free</div>
                <p className="text-white/20 text-[13px] mt-3">For getting started with analysis.</p>
              </div>
              <ul className="space-y-3.5 mb-10 flex-1">
                {['2 property analyses / month', '2 PDF reports / month', 'Basic market insights', 'Single AI mode'].map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-white/35 text-[13px]">
                    <div className="w-5 h-5 rounded-full bg-white/[0.06] flex items-center justify-center flex-shrink-0">
                      <CheckIcon className="w-3 h-3 text-white/20" />
                    </div>
                    {f}
                  </li>
                ))}
              </ul>
              <button onClick={onNavigateToSignUp} className="w-full py-3 rounded-xl border border-white/[0.08] text-white/50 text-[13px] font-medium hover:bg-white/[0.03] hover:border-white/[0.12] transition-all duration-300">
                Get started
              </button>
            </motion.div>

            {/* Pro */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="p-8 md:p-10 rounded-2xl border border-[#C08B5C]/20 bg-gradient-to-b from-[#C08B5C]/[0.04] to-transparent flex flex-col relative overflow-hidden"
            >
              {/* Copper glow */}
              <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-[#C08B5C]/10 blur-3xl pointer-events-none" />

              <div className="flex items-center gap-2 mb-6 relative z-10">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-gradient-to-r from-[#C08B5C] to-[#D4A27F] text-[#0A0A0C]">Recommended</span>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full border border-[#C08B5C]/25 text-[#D4A27F]">50% off first month</span>
              </div>
              <div className="mb-8 relative z-10">
                <h3 className="text-[13px] text-[#C08B5C]/60 mb-2 font-medium">Pro</h3>
                <div className="flex items-baseline gap-2">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={isAnnual ? 'annual' : 'monthly'}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className="text-[32px] font-display font-bold text-white leading-none"
                    >
                      ${isAnnual ? '80' : '100'}
                      <span className="text-[14px] font-normal text-white/15 ml-1">/ mo</span>
                    </motion.div>
                  </AnimatePresence>
                  {isAnnual && (
                    <span className="text-[13px] text-white/20 line-through">$100</span>
                  )}
                </div>
                <p className="text-white/20 text-[13px] mt-3">Unlimited access to everything.</p>
              </div>
              <ul className="space-y-3.5 mb-10 flex-1 relative z-10">
                {['Unlimited analyses', 'Unlimited PDF reports', 'Market mapping & portfolio', 'All 3 AI modes', 'Voice chat with AI', 'Priority support'].map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-white/50 text-[13px]">
                    <div className="w-5 h-5 rounded-full bg-[#C08B5C]/15 flex items-center justify-center flex-shrink-0">
                      <CheckIcon className="w-3 h-3 text-[#C08B5C]" />
                    </div>
                    {f}
                  </li>
                ))}
              </ul>
              <button onClick={onNavigateToSignUp} className={`w-full py-3 rounded-xl bg-[#C08B5C] text-[#0A0A0C] text-[13px] font-semibold hover:bg-[#D4A27F] transition-colors duration-300 relative z-10 ${shimmerBtn}`}>
                Upgrade to Pro
              </button>
            </motion.div>
          </div>

          {/* Money-back guarantee */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex items-center justify-center gap-2 mt-8"
          >
            <Shield className="w-4 h-4 text-[#C08B5C]/40" />
            <span className="text-[12px] text-white/25">30-day money-back guarantee. No questions asked.</span>
          </motion.div>

          {/* Enterprise row */}
          <div className="mt-6 text-center">
            <p className="text-[13px] text-white/20">
              Need more? <a href="mailto:enterprise@civitasai.com" className="text-[#D4A27F]/60 hover:text-[#D4A27F] transition-colors underline underline-offset-2">Contact us for enterprise pricing</a>
            </p>
          </div>
        </div>
      </section>

      {/* ─── Testimonials (premium) ──────────────────────────────── */}
      <section className="py-24 md:py-32 px-6 relative">
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={reveal} className="text-center mb-14 relative z-10">
          <h2 className="text-[clamp(1.5rem,2.6vw,2.25rem)] font-display font-semibold text-white/90 tracking-[-0.02em] mb-3">
            What investors are saying
          </h2>
          <div className="w-8 h-px bg-white/[0.06] mx-auto mb-4" />
          <p className="text-white/25 text-[14px] max-w-[400px] mx-auto">Real results from real investors using Vasthu every day.</p>
        </motion.div>

        <div className="max-w-[1020px] mx-auto relative z-10">
          <div className="grid md:grid-cols-5 gap-4">
            {/* Featured testimonial */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="md:col-span-3 p-8 rounded-2xl bg-white/[0.03] border border-white/[0.06] relative overflow-hidden hover:border-white/[0.12] hover:bg-white/[0.05] hover:-translate-y-0.5 transition-all duration-500"
            >
              <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-[#C08B5C]/[0.06] blur-3xl pointer-events-none" />
              <div className="absolute top-4 right-6 text-[80px] font-serif leading-none select-none">
                <span className="text-transparent bg-clip-text bg-gradient-to-b from-[#C08B5C]/15 to-transparent">&ldquo;</span>
              </div>
              <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-full" style={{ background: 'linear-gradient(to bottom, #C08B5C, #A8734A, transparent)' }} />
              <div className="flex items-center gap-3.5 mb-6 relative z-10">
                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&q=80&auto=format&fit=crop&crop=face" alt="Marcus Chen" className="w-12 h-12 rounded-full object-cover ring-2 ring-[#C08B5C]/20" />
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-[14px] font-medium text-white/85">Marcus Chen</p>
                    <BadgeCheck className="w-4 h-4 text-[#C08B5C]" />
                    <div className="flex gap-0.5 ml-1">
                      {Array.from({ length: 5 }).map((_, s) => (
                        <Star key={s} className="w-3 h-3 fill-[#C08B5C] text-[#C08B5C]" />
                      ))}
                    </div>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/[0.05] text-white/30 inline-block mt-1">Portfolio Investor</span>
                </div>
              </div>
              <p className="text-[15px] text-white/55 leading-[1.85] mb-6 relative z-10">
                &ldquo;Vasthu found me a deal in Austin that I would have missed on every portal. The cap rate analysis was spot on — closed in 3 weeks. The AI feels like having an institutional analyst on speed dial.&rdquo;
              </p>
              <div className="flex items-center gap-3 relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#C08B5C]/[0.08] border border-[#C08B5C]/15">
                  <span className="text-[11px] font-semibold text-[#D4A27F]">$2.3M</span>
                  <span className="text-[10px] text-white/30">deals closed</span>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06]">
                  <span className="text-[11px] font-semibold text-white/50">12</span>
                  <span className="text-[10px] text-white/25">properties analyzed</span>
                </div>
              </div>
            </motion.div>

            {/* Two smaller cards stacked */}
            <div className="md:col-span-2 flex flex-col gap-4">
              {[
                { name: 'Sarah Mitchell', role: 'Real Estate Agent', quote: 'The voice mode is a game-changer. I run property analysis while driving between showings. Saves me hours every week.', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&q=80&auto=format&fit=crop&crop=face' },
                { name: 'David Park', role: 'First-time Investor', quote: 'Institutional-grade analysis without the institutional price tag. The PDF reports helped me secure better lending terms.', img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&q=80&auto=format&fit=crop&crop=face' },
              ].map((t, i) => (
                <motion.div
                  key={t.name}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: (i + 1) * 0.1 }}
                  className="flex-1 p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06] relative overflow-hidden hover:border-white/[0.12] hover:bg-white/[0.05] hover:-translate-y-0.5 transition-all duration-500"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-[2px] rounded-full" style={{ background: 'linear-gradient(to bottom, #C08B5C/40, transparent)' }} />
                  <div className="flex items-center gap-3 mb-4">
                    <img src={t.img} alt={t.name} className="w-10 h-10 rounded-full object-cover ring-1 ring-white/10" />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="text-[13px] font-medium text-white/75">{t.name}</p>
                        <BadgeCheck className="w-3.5 h-3.5 text-[#C08B5C]/60" />
                        <div className="flex gap-0.5 ml-1">
                          {Array.from({ length: 5 }).map((_, s) => (
                            <Star key={s} className="w-2.5 h-2.5 fill-[#C08B5C] text-[#C08B5C]" />
                          ))}
                        </div>
                      </div>
                      <span className="text-[10px] text-white/25">{t.role}</span>
                    </div>
                  </div>
                  <p className="text-[12px] text-white/40 leading-[1.75]">&ldquo;{t.quote}&rdquo;</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* More testimonials (collapsed) */}
          <AnimatePresence>
            {showMoreTestimonials && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  {[
                    { name: 'James Rodriguez', role: 'Property Manager', quote: 'Managing a 40-unit portfolio is so much easier now. The market intelligence helps me time rent adjustments perfectly.', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&q=80&auto=format&fit=crop&crop=face' },
                    { name: 'Aisha Khan', role: 'Commercial Investor', quote: 'The Strategist mode helped me diversify from residential into mixed-use. ROI projections were within 2% of actuals.', img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&q=80&auto=format&fit=crop&crop=face' },
                  ].map((t, i) => (
                    <motion.div
                      key={t.name}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: i * 0.1 }}
                      className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06] relative overflow-hidden hover:border-white/[0.12] hover:bg-white/[0.05] hover:-translate-y-0.5 transition-all duration-500"
                    >
                      <div className="absolute left-0 top-0 bottom-0 w-[2px] rounded-full" style={{ background: 'linear-gradient(to bottom, #C08B5C/40, transparent)' }} />
                      <div className="flex items-center gap-3 mb-4">
                        <img src={t.img} alt={t.name} className="w-10 h-10 rounded-full object-cover ring-1 ring-white/10" />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <p className="text-[13px] font-medium text-white/75">{t.name}</p>
                            <BadgeCheck className="w-3.5 h-3.5 text-[#C08B5C]/60" />
                            <div className="flex gap-0.5 ml-1">
                              {Array.from({ length: 5 }).map((_, s) => (
                                <Star key={s} className="w-2.5 h-2.5 fill-[#C08B5C] text-[#C08B5C]" />
                              ))}
                            </div>
                          </div>
                          <span className="text-[10px] text-white/25">{t.role}</span>
                        </div>
                      </div>
                      <p className="text-[12px] text-white/40 leading-[1.75]">&ldquo;{t.quote}&rdquo;</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="text-center mt-6">
            <button
              onClick={() => setShowMoreTestimonials(!showMoreTestimonials)}
              className="text-[12px] text-[#D4A27F]/60 hover:text-[#D4A27F] transition-colors duration-300"
            >
              {showMoreTestimonials ? 'Show less' : 'See more testimonials'} &rarr;
            </button>
          </div>
        </div>
      </section>

      {/* ─── Investor Resources (content marketing) ────────────────── */}
      <section className="py-24 md:py-32 px-6">
        <div className="max-w-[1020px] mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={reveal} className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-[clamp(1.5rem,2.6vw,2.25rem)] font-display font-semibold text-white/90 tracking-[-0.02em] mb-3">
                Investor Resources
              </h2>
              <div className="w-8 h-px bg-white/[0.06] mb-4" />
              <p className="text-white/30 text-[14px] max-w-[400px]">Guides, market reports, and case studies to sharpen your edge.</p>
            </div>
            <a href="#" className="hidden md:inline-flex items-center gap-1.5 text-[12px] text-[#D4A27F]/60 hover:text-[#D4A27F] transition-colors duration-300 flex-shrink-0">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-5">
            {([
              {
                img: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80&auto=format&fit=crop',
                cat: 'Guide',
                catIcon: BookOpen,
                title: 'How to Analyze a Rental Property in 5 Minutes',
                excerpt: 'Learn the cash flow, cap rate, and ROI framework that professional investors use — now powered by AI.',
                time: '5 min read',
                catColor: 'from-[#C08B5C] to-[#A8734A]',
              },
              {
                img: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&q=80&auto=format&fit=crop',
                cat: 'Market Report',
                catIcon: BarChart3,
                title: 'Austin vs. Dallas: 2026 Market Comparison',
                excerpt: 'A data-driven breakdown of rental yields, appreciation trends, and vacancy rates across Texas\u2019 hottest markets.',
                time: '8 min read',
                catColor: 'from-[#3B82F6] to-[#2563EB]',
              },
              {
                img: 'https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?w=800&q=80&auto=format&fit=crop',
                cat: 'Case Study',
                catIcon: Users,
                title: 'Case Study: $2.3M Portfolio Built with AI',
                excerpt: 'How Marcus Chen used Vasthu to identify undervalued properties and build a 12-unit portfolio in under a year.',
                time: '6 min read',
                catColor: 'from-[#10B981] to-[#059669]',
              },
            ] as const).map((article, i) => {
              const CatIcon = article.catIcon;
              return (
                <motion.a
                  key={article.title}
                  href="#"
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="group rounded-2xl overflow-hidden border border-white/[0.06] hover:border-white/[0.14] bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-500 hover:-translate-y-1 flex flex-col"
                >
                  <div className="relative h-[200px] overflow-hidden">
                    <img
                      src={article.img}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0C] via-transparent to-transparent" />
                    <div className="absolute top-3 left-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-gradient-to-r ${article.catColor} text-white`}>
                        <CatIcon className="w-3 h-3" />
                        {article.cat}
                      </span>
                    </div>
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="text-[15px] font-display font-semibold text-white/80 group-hover:text-white/95 transition-colors mb-2 leading-snug">{article.title}</h3>
                    <p className="text-[12px] text-white/30 leading-[1.75] mb-4 flex-1">{article.excerpt}</p>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-[11px] text-white/20">
                        <Clock className="w-3 h-3" />
                        {article.time}
                      </span>
                      <span className="text-[11px] text-[#D4A27F]/50 group-hover:text-[#D4A27F] transition-colors">
                        Read more &rarr;
                      </span>
                    </div>
                  </div>
                </motion.a>
              );
            })}
          </div>

          <div className="md:hidden text-center mt-8">
            <a href="#" className="inline-flex items-center gap-1.5 text-[12px] text-[#D4A27F]/60 hover:text-[#D4A27F] transition-colors duration-300">
              View all resources <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </section>

      {/* ─── FAQ (premium) ─────────────────────────────────────────── */}
      <section className="py-20 md:py-28 px-6">
        <div className="max-w-[860px] mx-auto">
          <div className="grid md:grid-cols-5 gap-10">
            {/* Left column — title, description, accent image */}
            <div className="md:col-span-2 md:sticky md:top-24 md:self-start">
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={reveal}>
                <h2 className="text-[clamp(1.5rem,2.6vw,2rem)] font-display font-semibold text-white/90 tracking-[-0.02em] mb-4">
                  Frequently asked questions
                </h2>
                <p className="text-white/25 text-[14px] leading-[1.8] mb-6">
                  Everything you need to know about Vasthu. Can&apos;t find what you&apos;re looking for? Reach out to our team.
                </p>

                {/* Category pills */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {FAQ_CATS.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setFaqCat(cat)}
                      className={`px-3 py-1.5 rounded-full text-[11px] font-medium transition-all duration-200 ${
                        faqCat === cat
                          ? 'bg-[#C08B5C]/20 text-[#D4A27F] border border-[#C08B5C]/30'
                          : 'border border-white/[0.06] bg-white/[0.03] text-white/35 hover:bg-white/[0.06]'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Accent image */}
                <div className="hidden md:block mt-4 rounded-2xl overflow-hidden relative h-[180px]">
                  <img
                    src="https://images.unsplash.com/photo-1553877522-43269d4ea984?w=600&q=80&auto=format&fit=crop"
                    alt="Investor using Vasthu"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(192,139,92,0.25) 0%, rgba(10,10,12,0.7) 100%)' }} />
                  <div className="absolute bottom-3 left-3 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#C08B5C]/20 backdrop-blur-md flex items-center justify-center border border-[#C08B5C]/20">
                      <Zap className="w-4 h-4 text-[#C08B5C]" />
                    </div>
                    <span className="text-[11px] text-white/50 font-medium">Answers in seconds</span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right column — search + accordion */}
            <div className="md:col-span-3">
              {/* Search */}
              <div className="relative mb-6">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <input
                  type="text"
                  placeholder="Search questions..."
                  value={faqSearch}
                  onChange={(e) => setFaqSearch(e.target.value)}
                  className="w-full h-10 pl-10 pr-4 bg-white/[0.03] border border-white/[0.06] rounded-xl text-[13px] text-white/70 placeholder-white/20 focus:outline-none focus:border-[#C08B5C]/30 transition-all duration-300"
                />
              </div>

              {/* FAQ items */}
              <div className="space-y-2">
                {filteredFaqs.map((faq, i) => {
                  const globalIdx = FAQ_DATA.indexOf(faq);
                  const isOpen = openFaq === globalIdx;
                  const num = String(i + 1).padStart(2, '0');
                  return (
                    <motion.button
                      key={globalIdx}
                      initial={{ opacity: 0, y: 12 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: i * 0.05 }}
                      onClick={() => setOpenFaq(isOpen ? null : globalIdx)}
                      className={`w-full text-left p-4 rounded-xl group transition-all duration-300 ${
                        isOpen
                          ? 'bg-[#C08B5C]/[0.03] border border-[#C08B5C]/15'
                          : 'bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] hover:border-white/[0.08]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <span className={`text-[11px] font-mono mt-0.5 flex-shrink-0 ${isOpen ? 'text-[#C08B5C]/50' : 'text-[#C08B5C]/25'}`}>{num}</span>
                          <h4 className={`text-[14px] font-medium transition-colors ${isOpen ? 'text-white/85' : 'text-white/65 group-hover:text-white/80'}`}>{faq.q}</h4>
                        </div>
                        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                          <ChevronDown className={`w-4 h-4 flex-shrink-0 mt-0.5 ${isOpen ? 'text-[#C08B5C]/40' : 'text-white/15'}`} />
                        </motion.div>
                      </div>
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                            className="overflow-hidden"
                          >
                            <p className="mt-3 ml-7 text-[13px] text-white/35 leading-[1.85] max-w-lg">{faq.a}</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  );
                })}
              </div>

              {filteredFaqs.length === 0 && (
                <div className="text-center py-10">
                  <p className="text-[13px] text-white/30">No questions match your search.</p>
                </div>
              )}

              {/* Still have questions CTA */}
              <div className="mt-8 p-6 rounded-2xl relative overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(192,139,92,0.08) 0%, rgba(168,115,74,0.04) 100%)' }}>
                <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-[#C08B5C]/[0.08] blur-2xl pointer-events-none" />
                <p className="text-[14px] font-medium text-white/60 mb-1.5 relative z-10">Still have questions?</p>
                <p className="text-[12px] text-white/30 mb-4 relative z-10">
                  Our team typically responds within 24 hours.
                </p>
                <a
                  href="mailto:support@civitasai.com"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#C08B5C]/15 border border-[#C08B5C]/20 text-[12px] font-medium text-[#D4A27F] hover:bg-[#C08B5C]/25 transition-all duration-300 relative z-10"
                >
                  Contact support <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── About (premium) ──────────────────────────────────────── */}
      <section id="about" className="py-24 md:py-32 px-6 scroll-mt-20">
        <div className="max-w-[920px] mx-auto">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={reveal}
            className="rounded-2xl overflow-hidden relative"
          >
            <img
              src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80&auto=format&fit=crop"
              alt="Modern workspace"
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0C]/95 via-[#0A0A0C]/80 to-[#0A0A0C]/50" />

            <div className="relative z-10 grid md:grid-cols-2 gap-8 p-10 md:p-14">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#C08B5C] to-[#A8734A] flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(192,139,92,0.2)]">
                  <span className="text-[18px] font-bold text-white">V</span>
                </div>
                <h2 className="text-[clamp(1.5rem,2.6vw,2rem)] font-display font-semibold text-white/90 tracking-[-0.02em] mb-4">
                  Built by investors,<br />for investors
                </h2>
                <p className="text-white/35 text-[14px] leading-[1.9] mb-8">
                  Vasthu exists because everyone deserves{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C08B5C] to-[#D4A27F]">institutional-grade</span>
                  {' '}analysis — whether you&apos;re buying your first duplex or managing a thousand doors.
                </p>
                <a
                  href="#"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.08] text-[13px] font-medium text-white/60 hover:text-white/90 hover:bg-white/[0.1] transition-all duration-300"
                >
                  Meet the team <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
              <div className="flex flex-col justify-end">
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { value: '1,200+', label: 'Investors' },
                    { value: '50+', label: 'Markets' },
                    { value: '10M+', label: 'Data Points' },
                  ].map((stat) => (
                    <div key={stat.label} className="text-center p-4 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                      <div className="text-[20px] font-display font-bold text-transparent bg-clip-text bg-gradient-to-b from-[#D4A27F] to-[#C08B5C]">{stat.value}</div>
                      <div className="text-[11px] text-white/30 mt-1">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── Footer CTA banner ───────────────────────────────────── */}
      <section className="px-6 pb-16">
        <div className="max-w-[920px] mx-auto">
          <div
            className="relative rounded-2xl overflow-hidden p-10 md:p-14 text-center"
            style={{ background: 'linear-gradient(135deg, #C08B5C 0%, #A8734A 50%, #8B5D3A 100%)' }}
          >
            <div
              className="absolute inset-0 pointer-events-none opacity-[0.05]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
                backgroundSize: '128px 128px',
              }}
            />
            <h3 className="text-[clamp(1.25rem,2.5vw,1.75rem)] font-display font-bold text-white mb-3 relative z-10">
              Ready to find your next deal?
            </h3>
            <p className="text-white/60 text-[14px] mb-8 max-w-[400px] mx-auto relative z-10">
              Join 1,200+ investors using Vasthu to analyze properties and close deals faster.
            </p>
            <button
              onClick={onNavigateToSignUp}
              className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-white text-[#0A0A0C] font-semibold text-[14px] hover:bg-white/90 transition-colors duration-300 relative z-10 shadow-[0_4px_20px_rgba(0,0,0,0.2)]"
            >
              Get started free <ArrowRightIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ─── Footer (redesigned) ─────────────────────────────────── */}
      <footer className="pt-16 pb-10 px-6 border-t border-white/[0.025]">
        <div className="max-w-[920px] mx-auto">

          {/* Newsletter with privacy note */}
          <div className="flex flex-col sm:flex-row items-center gap-3 mb-14 pb-10 border-b border-white/[0.025]">
            <div className="flex-1">
              <h3 className="text-[14px] font-display font-medium text-white/60 mb-1">Stay in the loop</h3>
              <p className="text-[12px] text-white/25">Market insights and product updates. No spam, unsubscribe anytime.</p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <input
                type="email"
                placeholder="you@email.com"
                className="flex-1 sm:w-[220px] h-9 px-3.5 bg-white/[0.04] border border-white/[0.08] rounded-lg text-[12px] text-white/70 placeholder-white/20 focus:outline-none focus:border-[#C08B5C]/30 transition-all"
              />
              <button className="h-9 px-4 rounded-lg bg-[#C08B5C] text-[#0A0A0C] text-[12px] font-medium hover:bg-[#D4A27F] transition-colors duration-300 flex-shrink-0">
                Subscribe
              </button>
            </div>
          </div>

          {/* Link columns — reorganized */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-14">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <Logo variant="light" showText={false} className="w-[18px] h-[18px] opacity-30" />
                <span className="text-[12px] font-display font-medium text-white/30">Vasthu</span>
              </div>
              <p className="text-white/15 text-[11px] leading-relaxed max-w-[180px]">AI-powered rental property intelligence.</p>
            </div>
            <div>
              <p className="text-[10px] text-white/20 uppercase tracking-[0.1em] mb-3 font-medium">Product</p>
              <div className="space-y-2">
                <button onClick={() => scrollTo('products')} className="block text-[12px] text-white/30 hover:text-white/55 transition-colors duration-300">Features</button>
                <button onClick={() => scrollTo('pricing')} className="block text-[12px] text-white/30 hover:text-white/55 transition-colors duration-300">Pricing</button>
                <a href="#" className="block text-[12px] text-white/30 hover:text-white/55 transition-colors duration-300">Integrations</a>
              </div>
            </div>
            <div>
              <p className="text-[10px] text-white/20 uppercase tracking-[0.1em] mb-3 font-medium">Resources</p>
              <div className="space-y-2">
                <a href="#" className="block text-[12px] text-white/30 hover:text-white/55 transition-colors duration-300">Guides</a>
                <a href="#" className="block text-[12px] text-white/30 hover:text-white/55 transition-colors duration-300">FAQ</a>
                <a href="#" className="block text-[12px] text-white/30 hover:text-white/55 transition-colors duration-300">Changelog</a>
              </div>
            </div>
            <div>
              <p className="text-[10px] text-white/20 uppercase tracking-[0.1em] mb-3 font-medium">Company</p>
              <div className="space-y-2">
                <button onClick={() => scrollTo('about')} className="block text-[12px] text-white/30 hover:text-white/55 transition-colors duration-300">About</button>
                <a href="#" className="block text-[12px] text-white/30 hover:text-white/55 transition-colors duration-300">Careers</a>
                <a href="#" className="block text-[12px] text-white/30 hover:text-white/55 transition-colors duration-300">Blog</a>
              </div>
            </div>
            <div>
              <p className="text-[10px] text-white/20 uppercase tracking-[0.1em] mb-3 font-medium">Legal</p>
              <div className="space-y-2">
                <a href="/privacy-policy" className="block text-[12px] text-white/30 hover:text-white/55 transition-colors duration-300">Privacy</a>
                <a href="/terms-of-service" className="block text-[12px] text-white/30 hover:text-white/55 transition-colors duration-300">Terms</a>
                <a href="/cookie-policy" className="block text-[12px] text-white/30 hover:text-white/55 transition-colors duration-300">Cookies</a>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="pt-6 border-t border-white/[0.025] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-white/15 text-[11px]">&copy; {new Date().getFullYear()} Civitas AI</span>
              <span className="text-white/10 text-[11px]">&middot;</span>
              <span className="text-white/15 text-[11px]">Made with <span className="text-[#C08B5C]/40">&hearts;</span> for investors</span>
            </div>
            <div className="flex items-center gap-4">
              <a href="#" className="text-white/15 hover:text-white/40 transition-colors duration-300">
                <XTwitterIcon className="w-4 h-4" />
              </a>
              <a href="#" className="text-white/15 hover:text-white/40 transition-colors duration-300">
                <LinkedInIcon className="w-4 h-4" />
              </a>
              <button
                onClick={scrollToTop}
                className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center hover:bg-white/[0.08] transition-colors duration-300"
                aria-label="Back to top"
              >
                <ArrowUp className="w-3.5 h-3.5 text-white/30" />
              </button>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};
