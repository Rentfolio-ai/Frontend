import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowRightIcon, MenuIcon, CloseIcon } from '../../components/ui/CustomIcons';
import { Logo } from '../../components/ui/Logo';
import { useAuth } from '../../contexts/AuthContext';
import { Shield, ChevronDown, Lock, Star, Search, BarChart3, Mic, ShoppingBag, Crosshair, BookOpen, TrendingUp, Users, Building2, Briefcase, HelpCircle, Mail, FileQuestion, GitBranch, UsersRound } from 'lucide-react';
import { BrowserFrame } from '../../components/landing/BrowserFrame';
import {
  DealUnderwritingMockup,
  MarketIntelMockup,
  AIChatModesMockup,
  VoiceCommunicationMockup,
  MarketplaceMockup,
  DealPipelineMockup,
  TeamsMockup,
  HeroScreenshot,
} from '../../components/landing/ProductMockups';
import {
  DealUnderwritingIcon,
  MarketIntelIcon,
  AIChatModesIcon,
  VoiceAssistantIcon,
  ProfessionalReportsIcon,
} from '../../components/ui/PremiumIcons';

interface LandingPageProps {
  onNavigateToSignIn: () => void;
  onNavigateToSignUp: () => void;
  onNavigateToFAQ?: () => void;
  onNavigateToMode?: (mode: 'hunter' | 'research' | 'strategist') => void;
}

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

const XTwitterIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
);

const LinkedInIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
);

const YouTubeIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
);

const HEADSHOTS = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&q=80&auto=format&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&q=80&auto=format&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&q=80&auto=format&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=40&q=80&auto=format&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=40&q=80&auto=format&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&q=80&auto=format&fit=crop&crop=face',
];

const FEATURED_QUOTES = [
  {
    quote: 'Vasthu found me a deal in Austin I would have missed on every portal. The AI feels like having an institutional analyst on speed dial.',
    name: 'Marcus Chen',
    title: 'Portfolio Investor, 14 properties',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&q=80&auto=format&fit=crop&crop=face',
    metric: '$2.3M in deals analyzed',
  },
  {
    quote: 'I analyze 50+ properties a week now. Before Vasthu, I could barely do 5. The voice feature is a game changer for multitasking.',
    name: 'James Rodriguez',
    title: 'Real Estate Agent, Keller Williams',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&q=80&auto=format&fit=crop&crop=face',
    metric: '200+ properties analyzed',
  },
  {
    quote: 'The Expert Strategist helped me rebalance my portfolio and identify two underperformers I had been holding too long.',
    name: 'Priya Kapoor',
    title: 'Portfolio Manager, Kapoor Capital',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&q=80&auto=format&fit=crop&crop=face',
    metric: '12 properties in portfolio',
  },
];

const WALL_OF_LOVE = [
  {
    quote: 'The underwriting reports are so detailed that my lender approved the deal on the spot. Saved me weeks of back-and-forth.',
    name: 'Sarah Mitchell',
    role: 'First-Time Investor',
    metric: '3 properties acquired',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&q=80&auto=format&fit=crop&crop=face',
  },
  {
    quote: 'The marketplace connected me with a lender in Miami who offered better rates than anyone else I spoke to. Closed in 21 days.',
    name: 'Robert Kim',
    role: 'Out-of-State Investor',
    metric: '$890K deal closed',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&q=80&auto=format&fit=crop&crop=face',
  },
  {
    quote: 'Finally, a tool that thinks about real estate the way I do. Deep Research is like having a market analyst on staff.',
    name: 'Angela Torres',
    role: 'Commercial RE Broker',
    metric: '30+ markets tracked',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&q=80&auto=format&fit=crop&crop=face',
  },
  {
    quote: 'Went from spending weekends on spreadsheets to closing deals in half the time. The AI verdict feature is incredibly accurate.',
    name: 'David Park',
    role: 'BRRRR Investor',
    metric: '8 flips completed',
    image: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=80&q=80&auto=format&fit=crop&crop=face',
  },
];

const STEPS = [
  { num: '01', title: 'Ask anything about real estate', desc: 'Describe criteria, paste a listing URL, or ask a market question. Vasthu picks the right mode and model automatically.' },
  { num: '02', title: 'AI runs deep analysis', desc: 'Vasthu pulls from 15+ data sources, runs underwriting, checks flood zones, schools, crime, and scores every property — with full transparent reasoning.' },
  { num: '03', title: 'Act on insights together', desc: 'Get ranked properties, PDF reports, deal verdicts, and share everything with your investment partners in real time.' },
];

const DealPipelineIcon: React.FC<{ className?: string; size?: number }> = ({ size = 36 }) => (
  <svg width={size} height={size} viewBox="0 0 36 36" fill="none">
    <rect x="4" y="6" width="28" height="24" rx="4" stroke="#14B8A6" strokeWidth="1.5" fill="#14B8A6" fillOpacity="0.08" />
    <rect x="8" y="12" width="20" height="3" rx="1.5" fill="#14B8A6" fillOpacity="0.25" />
    <rect x="8" y="18" width="14" height="3" rx="1.5" fill="#14B8A6" fillOpacity="0.4" />
    <rect x="8" y="24" width="8" height="3" rx="1.5" fill="#14B8A6" fillOpacity="0.6" />
  </svg>
);

const TeamsIcon: React.FC<{ className?: string; size?: number }> = ({ size = 36 }) => (
  <svg width={size} height={size} viewBox="0 0 36 36" fill="none">
    <circle cx="14" cy="14" r="5" stroke="#7C3AED" strokeWidth="1.5" fill="#7C3AED" fillOpacity="0.08" />
    <circle cx="22" cy="14" r="5" stroke="#7C3AED" strokeWidth="1.5" fill="#7C3AED" fillOpacity="0.08" />
    <path d="M6 30c0-4.4 3.6-8 8-8h8c4.4 0 8 3.6 8 8" stroke="#7C3AED" strokeWidth="1.5" fill="#7C3AED" fillOpacity="0.06" strokeLinecap="round" />
  </svg>
);

const FEATURES: {
  tag: string;
  title: string;
  desc: string;
  Mockup: React.FC;
  Icon: React.FC<{ className?: string; size?: number }>;
  reverse: boolean;
  bg: string;
  tint: string;
}[] = [
  {
    tag: 'UNDERWRITING',
    title: 'Know the numbers before you call the agent',
    desc: 'Cash flow projections, cap rate analysis, CoC ROI, and 30-year return modeling from live market data. Choose from 9+ report types — STR, LTR, ADU, flip analysis, portfolio strategy, and more. Every property gets an AI verdict with a confidence score.',
    Mockup: DealUnderwritingMockup,
    Icon: DealUnderwritingIcon,
    reverse: false,
    bg: 'bg-white',
    tint: 'from-[#C08B5C]/[0.06] to-[#C08B5C]/[0.01]',
  },
  {
    tag: 'AI MODES',
    title: 'Three deep modes, one smart router',
    desc: 'Deep Search runs exhaustive property due diligence with financing scenarios and deal verdicts. Deep Research synthesizes market data, policy, and economic indicators. Expert Strategist models portfolio scenarios with tax optimization. Auto mode picks the best AI model for every query — so you get quality without thinking about it.',
    Mockup: AIChatModesMockup,
    Icon: AIChatModesIcon,
    reverse: true,
    bg: 'bg-[#FAFAF9]',
    tint: 'from-[#8B5CF6]/[0.06] to-[#8B5CF6]/[0.01]',
  },
  {
    tag: 'INTELLIGENCE',
    title: 'Data from 15+ sources, one clear picture',
    desc: 'Rental trends, appreciation heatmaps, and demand signals across 50+ metros. Vasthu pulls from MLS, Census, county records, HUD fair market rents, FEMA flood zones, school ratings, Walk Score, crime statistics, and building permits — so every angle is covered.',
    Mockup: MarketIntelMockup,
    Icon: MarketIntelIcon,
    reverse: false,
    bg: 'bg-white',
    tint: 'from-[#3B82F6]/[0.06] to-[#3B82F6]/[0.01]',
  },
  {
    tag: 'DEAL PIPELINE',
    title: 'Track every deal from sourcing to close',
    desc: 'Manage properties across status stages — Active, Under Contract, Closed — with multiple portfolios and saved lists. Run AI analysis on any property with one click, generate 9+ report types, and let Vasthu score every deal so nothing slips through the cracks.',
    Mockup: DealPipelineMockup,
    Icon: DealPipelineIcon,
    reverse: true,
    bg: 'bg-[#FAFAF9]',
    tint: 'from-[#14B8A6]/[0.06] to-[#14B8A6]/[0.01]',
  },
  {
    tag: 'TEAMS & PARTNERSHIPS',
    title: 'Invest together, move faster',
    desc: 'Partner with other investors on shared properties. Assign roles — Lead Investor, Partner, Advisor — track equity splits, and manage shared deal flow. Chat with partners in real-time, sync emails, and keep everyone aligned from sourcing through close.',
    Mockup: TeamsMockup,
    Icon: TeamsIcon,
    reverse: false,
    bg: 'bg-white',
    tint: 'from-[#7C3AED]/[0.06] to-[#7C3AED]/[0.01]',
  },
  {
    tag: 'VOICE & COMMUNICATION',
    title: 'Talk to your AI analyst',
    desc: 'Use voice to search properties hands-free while driving between showings. Email agents, text contractors, and call lenders — all from a single interface powered by Vasthu\'s AI.',
    Mockup: VoiceCommunicationMockup,
    Icon: VoiceAssistantIcon,
    reverse: true,
    bg: 'bg-[#FAFAF9]',
    tint: 'from-[#EF4444]/[0.06] to-[#EF4444]/[0.01]',
  },
  {
    tag: 'MARKETPLACE',
    title: 'Find the right professionals',
    desc: 'Browse vetted real estate agents, mortgage brokers, contractors, and property managers in your target market. Read reviews, compare ratings, and connect directly through Vasthu\'s chat or voice.',
    Mockup: MarketplaceMockup,
    Icon: ProfessionalReportsIcon,
    reverse: false,
    bg: 'bg-white',
    tint: 'from-[#10B981]/[0.06] to-[#10B981]/[0.01]',
  },
];

const USE_CASES: {
  persona: string;
  headline: string;
  desc: string;
  metric: string;
  Mockup: React.FC;
  iconColor: string;
}[] = [
  {
    persona: 'Individual Investors',
    headline: 'Deep analysis on your first deal in minutes',
    desc: 'Skip the spreadsheet. Vasthu pulls from 15+ data sources, runs full underwriting, checks flood zones, schools, and crime — then gives you a clear verdict so you can make offers with confidence.',
    metric: '10 min avg to first analysis',
    Mockup: DealUnderwritingMockup,
    iconColor: '#C08B5C',
  },
  {
    persona: 'Portfolio Managers',
    headline: 'Track every deal from sourcing to close',
    desc: 'Manage deal pipeline across statuses, run 9+ report types, and monitor cap rates and cash flow across your entire portfolio. Vasthu scores every property so underperformers never hide.',
    metric: '12% avg portfolio ROI',
    Mockup: DealPipelineMockup,
    iconColor: '#8B5CF6',
  },
  {
    persona: 'Investment Partnerships',
    headline: 'Collaborate with partners in real time',
    desc: 'Invite partners, assign equity splits, and track shared properties together. Chat, sync emails, and make joint decisions — from sourcing through close — all inside Vasthu.',
    metric: '5x faster deal pipeline',
    Mockup: TeamsMockup,
    iconColor: '#10B981',
  },
];

const FAQ_ITEMS = [
  { q: 'What data sources does Vasthu use?', a: 'Vasthu aggregates 15+ sources: RentCast, Zillow, MLS, US Census, county records, HUD fair market rents, FEMA flood zones, GreatSchools ratings, Walk Score, crime statistics, building permits, and more — delivering comprehensive intelligence across 50+ metros.' },
  { q: 'How accurate is the AI underwriting?', a: 'Our AI-generated verdicts use live market data including comparable rents, recent sales, and local trends. Each analysis includes a confidence score based on data availability and market volatility.' },
  { q: 'What are the three AI modes?', a: 'Deep Search runs exhaustive property analysis with full due diligence, financing scenarios, and deal verdicts. Deep Research synthesizes market data, policy, and economic indicators from multiple sources. Expert Strategist builds portfolio strategy with scenario modeling, tax optimization, and risk-adjusted projections.' },
  { q: 'What is Auto model selection?', a: 'Auto mode classifies your query by type — simple lookup, analytical, research synthesis, or expert reasoning — then routes it to the best AI model (Claude, GPT, Gemini) for that task. You get the highest quality response without choosing a model yourself.' },
  { q: 'Can I collaborate with partners?', a: 'Yes. The Teams feature lets you invite other investors, assign roles (Lead Investor, Partner, Advisor), track equity splits, share properties, and communicate via chat and email — all from within Vasthu.' },
  { q: 'What report types are available?', a: 'Vasthu generates 9+ report types: STR Analysis, LTR Underwriting, ADU Analysis, Flip Analysis, Full Report, Portfolio Strategy, Investment Thesis, Market Research, and Comparative Market Analysis (CMA). Each includes AI verdicts and downloadable PDFs.' },
  { q: 'Can I use my own API keys?', a: 'Yes. Pro users can bring their own API keys for models like GPT-4, Claude, and Gemini. This gives you more control over costs and model selection.' },
  { q: 'Is there a free tier?', a: 'Yes. The Starter plan includes 25,000 AI tokens per month, 2 property analyses, and basic market insights — enough to evaluate your first deals.' },
  { q: 'How does the voice feature work?', a: 'Vasthu uses Gemini Live for real-time voice conversations. Ask about properties, market trends, or portfolio strategy hands-free — perfect for when you\'re on the go.' },
];

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigateToSignIn,
  onNavigateToSignUp,
  onNavigateToFAQ,
  onNavigateToMode,
}) => {
  const { resumeSession } = useAuth();
  const recentUser = useRecentSession();
  const [navScrolled, setNavScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAnnual, setIsAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<'product' | 'ai' | 'solutions' | 'resources' | null>(null);
  const [activeUseCase, setActiveUseCase] = useState(0);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);

  const navigateToMode = (mode: 'hunter' | 'research' | 'strategist') => {
    setActiveDropdown(null);
    setMobileMenuOpen(false);
    if (onNavigateToMode) {
      onNavigateToMode(mode);
    } else {
      window.location.href = `/${mode}`;
    }
  };

  const navigateToFAQ = () => {
    setActiveDropdown(null);
    setMobileMenuOpen(false);
    if (onNavigateToFAQ) {
      onNavigateToFAQ();
    }
  };

  const toggleDropdown = useCallback((key: 'product' | 'ai' | 'solutions' | 'resources') => {
    setActiveDropdown(prev => prev === key ? null : key);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      setNavScrolled(window.scrollY > 20);
      setActiveDropdown(null);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!activeDropdown) return;
    const onClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [activeDropdown]);

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

  return (
    <div className="min-h-screen bg-white text-[#1A1A1A] font-sans antialiased selection:bg-[#C08B5C]/15 overflow-x-hidden">

      {/* ─── Nav ─────────────────────────────────────────────────── */}
      <nav ref={navRef} className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${navScrolled ? 'bg-white/90 backdrop-blur-md border-b border-[#EBEBEA]' : 'bg-transparent'}`}>
        <div className="max-w-[1080px] mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo variant="dark" showText={false} className="w-[22px] h-[22px]" />
            <span className="text-[14px] font-semibold text-[#1A1A1A] tracking-tight">Vasthu</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-[13px] text-[#6F6F6F]">

            {/* ── Product dropdown ── */}
            <div className="relative">
              <button
                onClick={() => toggleDropdown('product')}
                className={`flex items-center gap-1 transition-colors duration-150 ${activeDropdown === 'product' ? 'text-[#1A1A1A]' : 'hover:text-[#1A1A1A]'}`}
              >
                Product <ChevronDown className={`w-3 h-3 transition-transform duration-150 ${activeDropdown === 'product' ? 'rotate-180' : ''}`} />
              </button>
              {activeDropdown === 'product' && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2.5 w-[280px] bg-white border border-[#EBEBEA] rounded-xl shadow-[0_12px_40px_rgba(0,0,0,0.10)] z-50 p-2">
                  {[
                    { icon: Search, label: 'Deal Underwriting', desc: 'Analyze any rental property instantly', action: () => scrollTo('features') },
                    { icon: BarChart3, label: 'Market Intelligence', desc: '15+ data sources, one clear picture', action: () => scrollTo('features') },
                    { icon: GitBranch, label: 'Deal Pipeline', desc: 'Track deals from sourcing to close', action: () => scrollTo('features') },
                    { icon: UsersRound, label: 'Teams', desc: 'Partner collaboration & equity tracking', action: () => scrollTo('features') },
                    { icon: Mic, label: 'Voice Chat', desc: 'Talk to your AI analyst hands-free', action: () => scrollTo('features') },
                    { icon: ShoppingBag, label: 'Marketplace', desc: 'Vetted agents, lenders, contractors', action: () => scrollTo('features') },
                  ].map(item => (
                    <button
                      key={item.label}
                      onClick={item.action}
                      className="w-full flex items-start gap-3 px-3 py-2.5 rounded-lg text-left hover:bg-[#FAFAF9] transition-colors"
                    >
                      <item.icon className="w-4 h-4 text-[#ABABAB] flex-shrink-0 mt-[2px]" />
                      <div>
                        <div className="text-[13px] font-medium text-[#1A1A1A]">{item.label}</div>
                        <div className="text-[11px] text-[#ABABAB] leading-tight">{item.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── AI dropdown ── */}
            <div className="relative">
              <button
                onClick={() => toggleDropdown('ai')}
                className={`flex items-center gap-1 transition-colors duration-150 ${activeDropdown === 'ai' ? 'text-[#1A1A1A]' : 'hover:text-[#1A1A1A]'}`}
              >
                AI <ChevronDown className={`w-3 h-3 transition-transform duration-150 ${activeDropdown === 'ai' ? 'rotate-180' : ''}`} />
              </button>
              {activeDropdown === 'ai' && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2.5 w-[260px] bg-white border border-[#EBEBEA] rounded-xl shadow-[0_12px_40px_rgba(0,0,0,0.10)] z-50 p-2">
                  {[
                    { key: 'hunter' as const, label: 'Deep Search', desc: 'In-depth property analysis & due diligence', color: '#C08B5C', icon: Crosshair },
                    { key: 'research' as const, label: 'Deep Research', desc: 'Multi-source market & policy analysis', color: '#60A5FA', icon: BookOpen },
                    { key: 'strategist' as const, label: 'Expert Strategist', desc: 'Portfolio strategy & scenario modeling', color: '#A78BFA', icon: TrendingUp },
                  ].map(mode => (
                    <button
                      key={mode.key}
                      onClick={() => navigateToMode(mode.key)}
                      className="w-full flex items-start gap-3 px-3 py-2.5 rounded-lg text-left hover:bg-[#FAFAF9] transition-colors"
                    >
                      <mode.icon className="w-4 h-4 flex-shrink-0 mt-[2px]" style={{ color: mode.color }} />
                      <div>
                        <div className="text-[13px] font-medium text-[#1A1A1A]">{mode.label}</div>
                        <div className="text-[11px] text-[#ABABAB] leading-tight">{mode.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── Solutions dropdown ── */}
            <div className="relative">
              <button
                onClick={() => toggleDropdown('solutions')}
                className={`flex items-center gap-1 transition-colors duration-150 ${activeDropdown === 'solutions' ? 'text-[#1A1A1A]' : 'hover:text-[#1A1A1A]'}`}
              >
                Solutions <ChevronDown className={`w-3 h-3 transition-transform duration-150 ${activeDropdown === 'solutions' ? 'rotate-180' : ''}`} />
              </button>
              {activeDropdown === 'solutions' && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2.5 w-[260px] bg-white border border-[#EBEBEA] rounded-xl shadow-[0_12px_40px_rgba(0,0,0,0.10)] z-50 p-2">
                  {[
                    { icon: Users, label: 'Individual Investors', desc: 'Deep analysis on your next deal' },
                    { icon: Building2, label: 'Portfolio Managers', desc: 'Pipeline tracking & multi-property analytics' },
                    { icon: Briefcase, label: 'Investment Partnerships', desc: 'Collaborate with partners on shared deals' },
                  ].map(item => (
                    <button
                      key={item.label}
                      onClick={() => scrollTo('use-cases')}
                      className="w-full flex items-start gap-3 px-3 py-2.5 rounded-lg text-left hover:bg-[#FAFAF9] transition-colors"
                    >
                      <item.icon className="w-4 h-4 text-[#ABABAB] flex-shrink-0 mt-[2px]" />
                      <div>
                        <div className="text-[13px] font-medium text-[#1A1A1A]">{item.label}</div>
                        <div className="text-[11px] text-[#ABABAB] leading-tight">{item.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── Resources dropdown ── */}
            <div className="relative">
              <button
                onClick={() => toggleDropdown('resources')}
                className={`flex items-center gap-1 transition-colors duration-150 ${activeDropdown === 'resources' ? 'text-[#1A1A1A]' : 'hover:text-[#1A1A1A]'}`}
              >
                Resources <ChevronDown className={`w-3 h-3 transition-transform duration-150 ${activeDropdown === 'resources' ? 'rotate-180' : ''}`} />
              </button>
              {activeDropdown === 'resources' && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2.5 w-[240px] bg-white border border-[#EBEBEA] rounded-xl shadow-[0_12px_40px_rgba(0,0,0,0.10)] z-50 p-2">
                  {[
                    { icon: HelpCircle, label: 'FAQ', action: navigateToFAQ },
                    { icon: FileQuestion, label: 'Terms & Privacy', action: () => window.open('/privacy-policy', '_blank') },
                    { icon: Mail, label: 'Contact Us', action: () => window.open('mailto:support@civitasai.com') },
                  ].map(item => (
                    <button
                      key={item.label}
                      onClick={item.action}
                      className="w-full flex items-start gap-3 px-3 py-2.5 rounded-lg text-left hover:bg-[#FAFAF9] transition-colors"
                    >
                      <item.icon className="w-4 h-4 text-[#ABABAB] flex-shrink-0 mt-[2px]" />
                      <div className="text-[13px] font-medium text-[#1A1A1A]">{item.label}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button onClick={() => scrollTo('pricing')} className="hover:text-[#1A1A1A] transition-colors duration-150">Pricing</button>
          </div>
          <div className="flex items-center gap-3">
            {recentUser ? (
              <button onClick={handleContinue} className="text-[13px] text-[#6F6F6F] hover:text-[#1A1A1A] transition-colors duration-150">
                Continue as {recentUser.name.split(' ')[0]}
              </button>
            ) : (
              <>
                <button onClick={onNavigateToSignIn} className="hidden md:block text-[13px] text-[#ABABAB] hover:text-[#6F6F6F] transition-colors duration-150">Sign in</button>
                <button onClick={onNavigateToSignUp} className="text-[13px] bg-[#1A1A1A] text-white px-4 py-[6px] rounded-full font-medium hover:bg-[#333] transition-colors duration-150">
                  Get started
                </button>
              </>
            )}
            <button onClick={() => setMobileMenuOpen(true)} className="md:hidden p-1.5 text-[#ABABAB]">
              <MenuIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* ─── Mobile Menu ─────────────────────────────────────────── */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[60] bg-white md:hidden overflow-y-auto">
          <div className="flex flex-col min-h-full px-6 pt-6">
            <div className="flex items-center justify-between mb-12">
              <span className="text-[14px] font-semibold text-[#1A1A1A]">Vasthu</span>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2"><CloseIcon className="w-5 h-5 text-[#ABABAB]" /></button>
            </div>
            <div className="space-y-1">

              {/* Product section */}
              <div>
                <button
                  onClick={() => setMobileExpanded(mobileExpanded === 'product' ? null : 'product')}
                  className="flex items-center justify-between w-full py-3 text-[22px] font-medium text-[#1A1A1A] tracking-tight"
                >
                  Product
                  <ChevronDown className={`w-4 h-4 text-[#ABABAB] transition-transform duration-150 ${mobileExpanded === 'product' ? 'rotate-180' : ''}`} />
                </button>
                {mobileExpanded === 'product' && (
                  <div className="pb-4 pl-1 space-y-1">
                    {[
                      { label: 'Deal Underwriting', action: () => scrollTo('features') },
                      { label: 'Market Intelligence', action: () => scrollTo('features') },
                      { label: 'Deal Pipeline', action: () => scrollTo('features') },
                      { label: 'Teams', action: () => scrollTo('features') },
                      { label: 'Voice Chat', action: () => scrollTo('features') },
                      { label: 'Marketplace', action: () => scrollTo('features') },
                    ].map(item => (
                      <button key={item.label} onClick={item.action} className="block w-full text-left px-2 py-1.5 text-[15px] text-[#6F6F6F] hover:text-[#1A1A1A] transition-colors">
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* AI section */}
              <div>
                <button
                  onClick={() => setMobileExpanded(mobileExpanded === 'ai' ? null : 'ai')}
                  className="flex items-center justify-between w-full py-3 text-[22px] font-medium text-[#1A1A1A] tracking-tight"
                >
                  AI
                  <ChevronDown className={`w-4 h-4 text-[#ABABAB] transition-transform duration-150 ${mobileExpanded === 'ai' ? 'rotate-180' : ''}`} />
                </button>
                {mobileExpanded === 'ai' && (
                  <div className="pb-4 pl-1 space-y-1">
                    {[
                      { key: 'hunter' as const, label: 'Deep Search', color: '#C08B5C' },
                      { key: 'research' as const, label: 'Deep Research', color: '#60A5FA' },
                      { key: 'strategist' as const, label: 'Expert Strategist', color: '#A78BFA' },
                    ].map(mode => (
                      <button key={mode.key} onClick={() => navigateToMode(mode.key)} className="flex items-center gap-2.5 w-full px-2 py-1.5 text-[15px] text-[#6F6F6F] hover:text-[#1A1A1A] transition-colors">
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: mode.color }} />
                        {mode.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Solutions section */}
              <div>
                <button
                  onClick={() => setMobileExpanded(mobileExpanded === 'solutions' ? null : 'solutions')}
                  className="flex items-center justify-between w-full py-3 text-[22px] font-medium text-[#1A1A1A] tracking-tight"
                >
                  Solutions
                  <ChevronDown className={`w-4 h-4 text-[#ABABAB] transition-transform duration-150 ${mobileExpanded === 'solutions' ? 'rotate-180' : ''}`} />
                </button>
                {mobileExpanded === 'solutions' && (
                  <div className="pb-4 pl-1 space-y-1">
                    {[
                      { label: 'Individual Investors' },
                      { label: 'Portfolio Managers' },
                      { label: 'Investment Partnerships' },
                    ].map(item => (
                      <button key={item.label} onClick={() => scrollTo('use-cases')} className="block w-full text-left px-2 py-1.5 text-[15px] text-[#6F6F6F] hover:text-[#1A1A1A] transition-colors">
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Resources section */}
              <div>
                <button
                  onClick={() => setMobileExpanded(mobileExpanded === 'resources' ? null : 'resources')}
                  className="flex items-center justify-between w-full py-3 text-[22px] font-medium text-[#1A1A1A] tracking-tight"
                >
                  Resources
                  <ChevronDown className={`w-4 h-4 text-[#ABABAB] transition-transform duration-150 ${mobileExpanded === 'resources' ? 'rotate-180' : ''}`} />
                </button>
                {mobileExpanded === 'resources' && (
                  <div className="pb-4 pl-1 space-y-1">
                    <button onClick={navigateToFAQ} className="block w-full text-left px-2 py-1.5 text-[15px] text-[#6F6F6F] hover:text-[#1A1A1A] transition-colors">FAQ</button>
                    <a href="/privacy-policy" className="block w-full text-left px-2 py-1.5 text-[15px] text-[#6F6F6F] hover:text-[#1A1A1A] transition-colors">Terms & Privacy</a>
                    <a href="mailto:support@civitasai.com" className="block w-full text-left px-2 py-1.5 text-[15px] text-[#6F6F6F] hover:text-[#1A1A1A] transition-colors">Contact Us</a>
                  </div>
                )}
              </div>

              <button onClick={() => scrollTo('pricing')} className="w-full text-left py-3 text-[22px] font-medium text-[#1A1A1A] tracking-tight">
                Pricing
              </button>

            </div>
            <div className="mt-auto pb-12 pt-8 space-y-3">
              <button onClick={() => { setMobileMenuOpen(false); onNavigateToSignUp(); }} className="w-full py-3 rounded-full bg-[#1A1A1A] text-white font-medium text-[14px]">Get started</button>
              <button onClick={() => { setMobileMenuOpen(false); onNavigateToSignIn(); }} className="w-full py-3 text-[#ABABAB] text-[14px]">Sign in</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Hero ─────────────────────────────────────────────────── */}
      <section className="pt-28 md:pt-36 pb-8 md:pb-12 px-6">
        <div className="max-w-[1080px] mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#EBEBEA] bg-[#FAFAF9] mb-7">
            <div className="w-2 h-2 rounded-full bg-[#C08B5C] animate-pulse" />
            <span className="text-[12px] font-semibold text-[#6F6F6F] tracking-[0.02em]">Vasthu &mdash; AI-powered real estate intelligence</span>
          </div>
          <h1 className="text-[clamp(2.25rem,5vw,3.75rem)] font-bold text-[#1A1A1A] leading-[1.08] tracking-[-0.03em] mb-5 max-w-[720px] mx-auto">
            Your AI investment analyst, from first deal to full portfolio
          </h1>
          <p className="text-[18px] text-[#6F6F6F] leading-[1.65] mb-8 max-w-[580px] mx-auto">
            Deep property analysis, 15+ data sources, team collaboration, and transparent AI reasoning — everything you need to find, evaluate, and close better deals.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            {recentUser ? (
              <button onClick={handleContinue} className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-[#1A1A1A] text-white font-medium text-[15px] hover:bg-[#333] transition-colors duration-150">
                Continue as {recentUser.name.split(' ')[0]} <ArrowRightIcon className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={onNavigateToSignUp} className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-[#1A1A1A] text-white font-medium text-[15px] hover:bg-[#333] transition-colors duration-150">
                Get Vasthu free <ArrowRightIcon className="w-4 h-4" />
              </button>
            )}
            <button onClick={() => scrollTo('features')} className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-[#EBEBEA] text-[#6F6F6F] font-medium text-[14px] hover:border-[#CFCFCF] hover:text-[#1A1A1A] transition-all duration-150">
              See how it works
            </button>
          </div>
          <div className="flex items-center justify-center gap-4 mb-12">
            <div className="flex -space-x-2">
              {HEADSHOTS.map((src, i) => (
                <img key={i} src={src} alt="" className="w-7 h-7 rounded-full object-cover border-2 border-white" />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 text-[#F59E0B] fill-[#F59E0B]" />
                ))}
              </div>
              <span className="text-[12px] text-[#ABABAB]">4.9 from 1,200+ investors</span>
            </div>
          </div>
          <div className="max-w-[960px] mx-auto">
            <BrowserFrame>
              <HeroScreenshot />
            </BrowserFrame>
          </div>
        </div>
      </section>

      {/* ─── Hero Feature Cards ──────────────────────────────────── */}
      <section className="pb-8 md:pb-12 px-6">
        <div className="max-w-[960px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: 'Deep AI analysis', desc: 'Three specialized modes that leave no stone unturned.', icon: <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none"><rect x="2" y="11" width="4" height="7" rx="1" fill="#C08B5C"/><rect x="8" y="7" width="4" height="11" rx="1" fill="#C08B5C" opacity="0.7"/><rect x="14" y="3" width="4" height="15" rx="1" fill="#C08B5C" opacity="0.5"/></svg> },
            { title: '15+ data sources', desc: 'HUD, FEMA, schools, crime, Walk Score, MLS, and more.', icon: <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none"><path d="M2 15l5-5 3 3 8-10" stroke="#3B82F6" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg> },
            { title: 'Team collaboration', desc: 'Partner with investors. Share deals, chat, and track equity.', icon: <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none"><circle cx="7" cy="7" r="3" stroke="#8B5CF6" strokeWidth="1.3" fill="none"/><circle cx="13" cy="7" r="3" stroke="#8B5CF6" strokeWidth="1.3" fill="none" opacity="0.6"/><path d="M2 17c0-3 2.5-5 5-5s5 2 5 5" stroke="#8B5CF6" strokeWidth="1.3" fill="none" strokeLinecap="round"/></svg> },
            { title: 'Smart model routing', desc: 'Auto mode picks the best AI model for every query.', icon: <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="6" stroke="#10B981" strokeWidth="1.3" fill="none"/><path d="M10 6v4l3 2" stroke="#10B981" strokeWidth="1.3" strokeLinecap="round"/><circle cx="10" cy="10" r="1.5" fill="#10B981"/></svg> },
          ].map(card => (
            <div key={card.title} className="group p-6 rounded-2xl border border-[#E5E5E4] bg-white transition-all duration-200 hover:shadow-[0_0_0_1px_rgba(0,0,0,0.03),0_4px_12px_rgba(0,0,0,0.06),0_12px_28px_rgba(0,0,0,0.05)] hover:border-[#D4D4D3] hover:-translate-y-0.5">
              <div className="mb-3.5 w-10 h-10 rounded-xl bg-[#FAFAF9] border border-[#EBEBEA] flex items-center justify-center text-[#1A1A1A] group-hover:bg-[#C08B5C]/[0.06] group-hover:border-[#C08B5C]/15 transition-colors duration-200">{card.icon}</div>
              <h3 className="text-[15px] font-semibold text-[#1A1A1A] mb-1.5 tracking-tight">{card.title}</h3>
              <p className="text-[13px] text-[#6F6F6F] leading-[1.55]">{card.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Trust Strip ─────────────────────────────────────────── */}
      <section className="py-8 px-6 border-y border-[#EBEBEA]">
        <div className="max-w-[1080px] mx-auto">
          <p className="text-[11px] text-[#ABABAB] uppercase tracking-[0.1em] font-medium text-center mb-5">Powered by 15+ real estate data sources</p>
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
            {[
              { name: 'RentCast', weight: '800' },
              { name: 'Zillow', weight: '700' },
              { name: 'MLS', weight: '900' },
              { name: 'US Census', weight: '600' },
              { name: 'County Records', weight: '600' },
              { name: 'HUD', weight: '800' },
              { name: 'Walk Score', weight: '700' },
              { name: 'FEMA', weight: '800' },
              { name: 'GreatSchools', weight: '600' },
            ].map(logo => (
              <div key={logo.name} className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#FAFAF9] border border-[#EBEBEA]">
                <span
                  className="text-[13px] text-[#3D3D3D] select-none"
                  style={{ fontWeight: parseInt(logo.weight) }}
                >
                  {logo.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How It Works ────────────────────────────────────────── */}
      <section className="py-12 md:py-16 px-6">
        <div className="max-w-[1080px] mx-auto">
          <h2 className="text-[clamp(1.25rem,2.2vw,1.75rem)] font-semibold text-[#1A1A1A] tracking-[-0.02em] mb-8 text-center">
            How it works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {STEPS.map((step) => (
              <div key={step.num}>
                <div className="text-[36px] font-bold text-[#EBEBEA] leading-none mb-3 tracking-tight">{step.num}</div>
                <h3 className="text-[16px] font-semibold text-[#1A1A1A] mb-2">{step.title}</h3>
                <p className="text-[14px] text-[#6F6F6F] leading-[1.65]">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Feature Sections (Alternating, Polished) ─────────────── */}
      <div id="features" className="scroll-mt-20">
        {FEATURES.map((feature) => (
          <section key={feature.tag} className={`py-14 md:py-20 px-6 ${feature.bg}`}>
            <div className={`max-w-[1080px] mx-auto grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-8 lg:gap-14 items-center ${feature.reverse ? 'lg:[direction:rtl]' : ''}`}>
              <div className={feature.reverse ? 'lg:[direction:ltr]' : ''}>
                <div className="flex items-center gap-3 mb-5">
                  <feature.Icon size={36} />
                  <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#ABABAB]">{feature.tag}</span>
                </div>
                <h3 className="text-[clamp(1.4rem,2.5vw,2rem)] font-bold text-[#1A1A1A] tracking-[-0.02em] leading-[1.2] mb-4">
                  {feature.title}
                </h3>
                <p className="text-[15px] text-[#6F6F6F] leading-[1.7] max-w-[440px] mb-5">{feature.desc}</p>
                <button onClick={() => scrollTo('pricing')} className="text-[13px] font-medium text-[#C08B5C] hover:text-[#A8734A] transition-colors inline-flex items-center gap-1.5">
                  Learn more <ArrowRightIcon className="w-3 h-3" />
                </button>
              </div>
              <div className={`relative ${feature.reverse ? 'lg:[direction:ltr]' : ''}`}>
                <div className={`absolute inset-0 -m-3 rounded-2xl bg-gradient-to-br ${feature.tint} pointer-events-none`} />
                <div className="relative rounded-2xl border border-[#E5E5E4] bg-white overflow-hidden shadow-[0_0_0_1px_rgba(0,0,0,0.03),0_2px_4px_rgba(0,0,0,0.04),0_12px_24px_rgba(0,0,0,0.06),0_24px_48px_rgba(0,0,0,0.04)] ring-1 ring-black/[0.02]">
                  <feature.Mockup />
                </div>
              </div>
            </div>
          </section>
        ))}
      </div>

      {/* ─── Stats + Trust Badges ────────────────────────────────── */}
      <section className="py-12 md:py-14 bg-[#FAFAF9] border-y border-[#EBEBEA]">
        <div className="max-w-[1080px] mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
            {[
              { value: '1,200+', label: 'Active investors' },
              { value: '50+', label: 'Markets covered' },
              { value: '15+', label: 'Data sources' },
              { value: '95%', label: 'Analysis accuracy' },
              { value: '9+', label: 'Report types' },
              { value: '4.9/5', label: 'Investor rating' },
            ].map(stat => (
              <div key={stat.label} className="text-center">
                <div className="text-[24px] md:text-[28px] font-bold text-[#1A1A1A] tracking-tight leading-none mb-1">{stat.value}</div>
                <div className="text-[12px] text-[#ABABAB] font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {[
              { icon: Shield, label: 'SOC 2 Compliant' },
              { icon: Lock, label: '256-bit Encryption' },
              { icon: Shield, label: 'GDPR Ready' },
            ].map(badge => (
              <div key={badge.label} className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-white border border-[#EBEBEA]">
                <badge.icon className="w-3.5 h-3.5 text-[#ABABAB]" />
                <span className="text-[11px] font-medium text-[#6F6F6F]">{badge.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Trusted by Investors ─────────────────────────────────── */}
      <section className="py-16 md:py-20 px-6">
        <div className="max-w-[1080px] mx-auto">
          <h2 className="text-[clamp(1.5rem,2.8vw,2.25rem)] font-bold text-[#1A1A1A] tracking-[-0.02em] mb-3 text-center">
            Trusted by investors who close deals.
          </h2>
          <p className="text-[16px] text-[#ABABAB] text-center mb-12 max-w-[520px] mx-auto">
            See how real estate professionals use Vasthu to find, analyze, and close better deals.
          </p>

          {/* Featured large quote */}
          <div className="rounded-2xl bg-gradient-to-b from-[#FAFAF9] to-white border border-[#E5E5E4] p-8 md:p-12 mb-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <div className="max-w-[720px] mx-auto text-center">
              <svg className="w-10 h-10 text-[#C08B5C]/20 mx-auto mb-6" viewBox="0 0 32 32" fill="currentColor">
                <path d="M10 8C5.6 8 2 11.6 2 16v8h8v-8H6c0-2.2 1.8-4 4-4V8zm16 0c-4.4 0-8 3.6-8 8v8h8v-8h-4c0-2.2 1.8-4 4-4V8z" />
              </svg>
              <p className="text-[20px] md:text-[24px] text-[#1A1A1A] leading-[1.5] font-medium mb-8">
                {FEATURED_QUOTES[0].quote}
              </p>
              <div className="flex items-center justify-center gap-4">
                <img src={FEATURED_QUOTES[0].image} alt={FEATURED_QUOTES[0].name} className="w-12 h-12 rounded-full object-cover" />
                <div className="text-left">
                  <div className="text-[15px] font-semibold text-[#1A1A1A]">{FEATURED_QUOTES[0].name}</div>
                  <div className="text-[13px] text-[#ABABAB]">{FEATURED_QUOTES[0].title}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Scrolling quote cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {FEATURED_QUOTES.slice(1).map((q) => (
              <div key={q.name} className="relative p-7 rounded-2xl bg-white border border-[#E5E5E4] shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.07),0_0_0_1px_rgba(0,0,0,0.02)] hover:border-[#D4D4D3] transition-all duration-200">
                <p className="text-[15px] text-[#3D3D3D] leading-[1.7] mb-6">
                  &ldquo;{q.quote}&rdquo;
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={q.image} alt={q.name} className="w-10 h-10 rounded-full object-cover" />
                    <div>
                      <div className="text-[13px] font-semibold text-[#1A1A1A]">{q.name}</div>
                      <div className="text-[12px] text-[#ABABAB]">{q.title}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="text-[10px] font-semibold text-emerald-700">{q.metric}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Use Cases (Interactive Tabs) ─────────────────────────── */}
      <section id="use-cases" className="py-16 md:py-20 px-6 bg-[#FAFAF9] scroll-mt-20">
        <div className="max-w-[1080px] mx-auto">
          <h2 className="text-[clamp(1.5rem,2.8vw,2.25rem)] font-bold text-[#1A1A1A] tracking-[-0.02em] mb-3 text-center">
            Built for every investor
          </h2>
          <p className="text-[16px] text-[#ABABAB] text-center mb-10 max-w-[520px] mx-auto">
            Whether you're analyzing your first deal or managing a portfolio, Vasthu adapts to your workflow.
          </p>

          <div className="flex items-center justify-center gap-2 mb-10">
            {USE_CASES.map((uc, i) => (
              <button
                key={uc.persona}
                onClick={() => setActiveUseCase(i)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-[13px] font-medium transition-all duration-200 ${
                  activeUseCase === i
                    ? 'bg-[#1A1A1A] text-white shadow-[0_2px_8px_rgba(0,0,0,0.15)]'
                    : 'bg-white border border-[#EBEBEA] text-[#6F6F6F] hover:border-[#CFCFCF] hover:text-[#1A1A1A]'
                }`}
              >
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: activeUseCase === i ? 'white' : uc.iconColor }} />
                {uc.persona}
              </button>
            ))}
          </div>

          <div className="rounded-2xl border border-[#EBEBEA] bg-white shadow-[0_4px_24px_rgba(0,0,0,0.06)] overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr]">
              <div className="p-8 lg:p-10 flex flex-col justify-center">
                <span className="text-[10px] font-semibold uppercase tracking-[0.12em] mb-3 block" style={{ color: USE_CASES[activeUseCase].iconColor }}>{USE_CASES[activeUseCase].persona}</span>
                <h3 className="text-[24px] font-bold text-[#1A1A1A] tracking-[-0.02em] leading-[1.2] mb-4">
                  {USE_CASES[activeUseCase].headline}
                </h3>
                <p className="text-[15px] text-[#6F6F6F] leading-[1.7] mb-6">{USE_CASES[activeUseCase].desc}</p>
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: `${USE_CASES[activeUseCase].iconColor}66` }} />
                  <span className="text-[13px] font-medium text-[#6F6F6F]">{USE_CASES[activeUseCase].metric}</span>
                </div>
                <button onClick={onNavigateToSignUp} className="text-[13px] font-medium text-[#C08B5C] hover:text-[#A8734A] transition-colors inline-flex items-center gap-1.5 self-start">
                  Get started free <ArrowRightIcon className="w-3 h-3" />
                </button>
              </div>
              <div className="border-t lg:border-t-0 lg:border-l border-[#EBEBEA] bg-[#FAFAF9]/50">
                {React.createElement(USE_CASES[activeUseCase].Mockup)}
              </div>
            </div>
          </div>

          <div className="text-center mt-8">
            <button onClick={() => scrollTo('features')} className="text-[13px] font-medium text-[#C08B5C] hover:text-[#A8734A] transition-colors inline-flex items-center gap-1.5">
              See all features <ArrowRightIcon className="w-3 h-3" />
            </button>
          </div>
        </div>
      </section>

      {/* ─── Wall of Love ──────────────────────────────────────────── */}
      <section className="py-16 md:py-20 px-6">
        <div className="max-w-[1080px] mx-auto">
          <h2 className="text-[clamp(1.5rem,2.8vw,2.25rem)] font-bold text-[#1A1A1A] tracking-[-0.02em] mb-3 text-center">
            What investors say
          </h2>
          <p className="text-[16px] text-[#ABABAB] text-center mb-10 max-w-[480px] mx-auto">
            Real stories from real estate professionals on Vasthu.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {WALL_OF_LOVE.map((t, i) => (
              <div key={t.name} className={`p-6 rounded-2xl bg-gradient-to-b from-[#FAFAF9] to-white border border-[#E5E5E4] flex flex-col shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.07),0_0_0_1px_rgba(0,0,0,0.02)] hover:border-[#D4D4D3] transition-all duration-200 ${i === 0 ? 'lg:row-span-2' : ''}`}>
                <div className="flex items-center gap-3 mb-4">
                  <img src={t.image} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <div className="text-[13px] font-semibold text-[#1A1A1A]">{t.name}</div>
                    <div className="text-[11px] text-[#ABABAB]">{t.role}</div>
                  </div>
                </div>
                <p className={`text-[#3D3D3D] leading-[1.7] mb-5 flex-1 ${i === 0 ? 'text-[15px]' : 'text-[13px]'}`}>
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-1.5 pt-4 border-t border-[#EBEBEA]">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="text-[11px] font-semibold text-emerald-700">{t.metric}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Pricing ─────────────────────────────────────────────── */}
      <section id="pricing" className="py-16 md:py-20 px-6 bg-[#FAFAF9] scroll-mt-20">
        <div className="max-w-[900px] mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-[clamp(1.5rem,2.8vw,2.25rem)] font-bold text-[#1A1A1A] tracking-[-0.02em] mb-3">
              Simple, transparent pricing
            </h2>
            <p className="text-[#ABABAB] text-[15px]">Start free. Upgrade when you need to.</p>
          </div>

          <div className="flex items-center justify-center gap-3 mb-10">
            <span className={`text-[13px] transition-colors duration-150 ${!isAnnual ? 'text-[#1A1A1A] font-medium' : 'text-[#ABABAB]'}`}>Monthly</span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors duration-150 ${isAnnual ? 'bg-[#C08B5C]' : 'bg-[#EBEBEA]'}`}
            >
              <div
                className="absolute top-[3px] w-[18px] h-[18px] rounded-full bg-white shadow-sm transition-[left] duration-150"
                style={{ left: isAnnual ? 22 : 3 }}
              />
            </button>
            <span className={`text-[13px] transition-colors duration-150 ${isAnnual ? 'text-[#1A1A1A] font-medium' : 'text-[#ABABAB]'}`}>Annual</span>
            {isAnnual && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
                Save 20%
              </span>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {/* Starter */}
            <div className="p-8 rounded-2xl bg-white border border-[#EBEBEA] flex flex-col">
              <div className="mb-8">
                <h3 className="text-[13px] text-[#ABABAB] mb-2 font-medium">Starter</h3>
                <div className="text-[36px] font-bold text-[#1A1A1A] leading-none">Free</div>
                <p className="text-[#ABABAB] text-[13px] mt-3">For getting started with analysis.</p>
              </div>
              <ul className="space-y-3.5 mb-10 flex-1">
                {[
                  { text: '25,000 AI tokens / month', icon: <svg className="w-3.5 h-3.5 text-[#ABABAB]" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="5" stroke="currentColor" strokeWidth="1.3"/><path d="M8 5v3l2 1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg> },
                  { text: '2 property analyses / month', icon: <svg className="w-3.5 h-3.5 text-[#ABABAB]" viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.3"/><path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg> },
                  { text: '2 PDF reports / month', icon: <svg className="w-3.5 h-3.5 text-[#ABABAB]" viewBox="0 0 16 16" fill="none"><rect x="3" y="1" width="10" height="14" rx="2" stroke="currentColor" strokeWidth="1.3"/><line x1="6" y1="5" x2="10" y2="5" stroke="currentColor" strokeWidth="1"/><line x1="6" y1="8" x2="10" y2="8" stroke="currentColor" strokeWidth="1"/></svg> },
                  { text: 'Basic market insights', icon: <svg className="w-3.5 h-3.5 text-[#ABABAB]" viewBox="0 0 16 16" fill="none"><path d="M2 12l4-4 3 2 5-6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg> },
                  { text: 'Single AI mode', icon: <svg className="w-3.5 h-3.5 text-[#ABABAB]" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.3"/></svg> },
                ].map(f => (
                  <li key={f.text} className="flex items-center gap-3 text-[#6F6F6F] text-[13px]">
                    <div className="w-6 h-6 rounded-lg bg-[#F5F5F3] flex items-center justify-center flex-shrink-0">
                      {f.icon}
                    </div>
                    {f.text}
                  </li>
                ))}
              </ul>
              <button onClick={onNavigateToSignUp} className="w-full py-3 rounded-xl border border-[#EBEBEA] text-[#6F6F6F] text-[13px] font-medium hover:bg-[#FAFAF9] transition-colors duration-150">
                Get started
              </button>
            </div>

            {/* Pro */}
            <div className="p-8 rounded-2xl bg-gradient-to-b from-[#C08B5C]/[0.03] to-transparent border border-[#EBEBEA] border-t-[3px] border-t-[#C08B5C] flex flex-col relative overflow-hidden">
              <div className="flex items-center gap-2 mb-6">
                <Star className="w-3.5 h-3.5 text-[#C08B5C] fill-[#C08B5C]" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#C08B5C]">Most Popular</span>
              </div>
              <div className="mb-8">
                <h3 className="text-[13px] text-[#C08B5C] mb-2 font-medium">Pro</h3>
                <div className="flex items-baseline gap-2">
                  <div className="text-[36px] font-bold text-[#1A1A1A] leading-none">
                    ${isAnnual ? '23' : '29'}
                    <span className="text-[14px] font-normal text-[#ABABAB] ml-1">/ mo</span>
                  </div>
                  {isAnnual && (
                    <span className="text-[13px] text-[#ABABAB] line-through">$29</span>
                  )}
                </div>
                <p className="text-[#ABABAB] text-[13px] mt-3">Full access + pay-per-action for reports and deals.</p>
              </div>
              <ul className="space-y-3.5 mb-10 flex-1">
                {[
                  { text: '100,000 AI tokens / month', icon: <svg className="w-3.5 h-3.5 text-[#C08B5C]" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="5" stroke="currentColor" strokeWidth="1.3"/><path d="M8 5v3l2 1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg> },
                  { text: 'Unlimited analyses', icon: <svg className="w-3.5 h-3.5 text-[#C08B5C]" viewBox="0 0 16 16" fill="none"><path d="M2 8h12M8 2v12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg> },
                  { text: 'PDF reports — $5 each', icon: <svg className="w-3.5 h-3.5 text-[#C08B5C]" viewBox="0 0 16 16" fill="none"><rect x="3" y="1" width="10" height="14" rx="2" stroke="currentColor" strokeWidth="1.3"/><line x1="6" y1="5" x2="10" y2="5" stroke="currentColor" strokeWidth="1"/><line x1="6" y1="8" x2="10" y2="8" stroke="currentColor" strokeWidth="1"/></svg> },
                  { text: 'Deal close fee — $15 each', icon: <svg className="w-3.5 h-3.5 text-[#C08B5C]" viewBox="0 0 16 16" fill="none"><path d="M8 2v12M5 5h6M5 11h6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg> },
                  { text: 'All 3 AI modes + Auto routing', icon: <svg className="w-3.5 h-3.5 text-[#C08B5C]" viewBox="0 0 16 16" fill="none"><circle cx="5" cy="8" r="2" stroke="currentColor" strokeWidth="1.2"/><circle cx="8" cy="4" r="2" stroke="currentColor" strokeWidth="1.2"/><circle cx="11" cy="8" r="2" stroke="currentColor" strokeWidth="1.2"/></svg> },
                  { text: 'Team collaboration', icon: <svg className="w-3.5 h-3.5 text-[#C08B5C]" viewBox="0 0 16 16" fill="none"><circle cx="5.5" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.2"/><circle cx="10.5" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.2"/><path d="M2 14c0-2.5 1.5-4 3.5-4h5c2 0 3.5 1.5 3.5 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg> },
                  { text: 'Voice chat with AI', icon: <svg className="w-3.5 h-3.5 text-[#C08B5C]" viewBox="0 0 16 16" fill="none"><rect x="5.5" y="1" width="5" height="8" rx="2.5" stroke="currentColor" strokeWidth="1.2"/><path d="M3.5 7a4.5 4.5 0 009 0" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/><line x1="8" y1="11.5" x2="8" y2="14" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg> },
                ].map(f => (
                  <li key={f.text} className="flex items-center gap-3 text-[#3D3D3D] text-[13px]">
                    <div className="w-6 h-6 rounded-lg bg-[#C08B5C]/10 flex items-center justify-center flex-shrink-0">
                      {f.icon}
                    </div>
                    {f.text}
                  </li>
                ))}
              </ul>
              <button onClick={onNavigateToSignUp} className="w-full py-3 rounded-xl bg-[#C08B5C] text-white text-[13px] font-semibold hover:bg-[#A8734A] transition-colors duration-150">
                Upgrade to Pro
              </button>
            </div>
          </div>

          {/* Enterprise contact */}
          <div className="mt-5 p-6 rounded-2xl bg-white border border-[#EBEBEA] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-[15px] font-semibold text-[#1A1A1A] mb-1">Enterprise</h3>
              <p className="text-[13px] text-[#ABABAB]">Custom limits, SSO, dedicated support, and SLA for large teams.</p>
            </div>
            <a href="mailto:enterprise@civitasai.com" className="px-5 py-2.5 rounded-xl border border-[#EBEBEA] text-[#6F6F6F] text-[13px] font-medium hover:bg-[#FAFAF9] transition-colors whitespace-nowrap">
              Contact sales
            </a>
          </div>

          {/* Guarantee + Comparison table (always visible) */}
          <div className="flex items-center justify-center gap-2 mt-8 mb-6">
            <Shield className="w-4 h-4 text-[#ABABAB]" />
            <span className="text-[12px] text-[#ABABAB]">30-day money-back guarantee. No questions asked.</span>
          </div>

          <div className="rounded-2xl border border-[#EBEBEA] bg-white overflow-hidden">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-[#EBEBEA] bg-[#FAFAF9]/50">
                  <th className="text-left px-5 py-3.5 text-[#ABABAB] font-medium">Feature</th>
                  <th className="text-center px-5 py-3.5 text-[#ABABAB] font-medium">Starter</th>
                  <th className="text-center px-5 py-3.5 text-[#C08B5C] font-medium">Pro</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: 'AI Tokens', starter: '25K / mo', pro: '100K / mo' },
                  { feature: 'Property Analyses', starter: '2 / mo', pro: 'Unlimited' },
                  { feature: 'PDF Reports', starter: '2 / mo', pro: '$5 each' },
                  { feature: 'Deal Close Fee', starter: '—', pro: '$15 each' },
                  { feature: 'AI Modes', starter: '1', pro: 'All 3' },
                  { feature: 'Auto Model Routing', starter: '—', pro: 'check' },
                  { feature: 'Teams & Partnerships', starter: '—', pro: 'check' },
                  { feature: 'Voice Chat', starter: '—', pro: 'check' },
                  { feature: 'Priority Support', starter: '—', pro: 'check' },
                  { feature: 'Marketplace Access', starter: 'Basic', pro: 'Full' },
                ].map(row => (
                  <tr key={row.feature} className="border-b border-[#EBEBEA] last:border-b-0">
                    <td className="px-5 py-3 text-[#3D3D3D]">{row.feature}</td>
                    <td className="px-5 py-3 text-center text-[#6F6F6F]">
                      {row.starter === '—' ? <span className="text-[#CFCFCF]">—</span> : row.starter === 'check' ? (
                        <svg className="w-4 h-4 text-[#ABABAB] mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      ) : row.starter}
                    </td>
                    <td className="px-5 py-3 text-center text-[#3D3D3D] font-medium">
                      {row.pro === 'check' ? (
                        <svg className="w-4 h-4 text-[#C08B5C] mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      ) : row.pro}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ─── FAQ ──────────────────────────────────────────────────── */}
      <section className="py-12 md:py-16 px-6">
        <div className="max-w-[680px] mx-auto">
          <h2 className="text-[clamp(1.25rem,2.2vw,1.75rem)] font-semibold text-[#1A1A1A] tracking-[-0.02em] mb-8 text-center">
            Frequently asked questions
          </h2>
          <div className="space-y-2">
            {FAQ_ITEMS.map((item, i) => (
              <div key={i} className="rounded-xl border border-[#EBEBEA] bg-white overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left"
                >
                  <span className="text-[14px] font-medium text-[#1A1A1A] pr-4">{item.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#ABABAB] flex-shrink-0 transition-transform duration-200 ${openFaq === i ? 'rotate-180' : ''}`}
                  />
                </button>
                <div
                  className="overflow-hidden transition-all duration-200"
                  style={{ maxHeight: openFaq === i ? 300 : 0, opacity: openFaq === i ? 1 : 0 }}
                >
                  <div className="flex px-5 pb-4">
                    <div className="w-[3px] rounded-full bg-[#C08B5C]/30 mr-4 flex-shrink-0" />
                    <p className="text-[14px] text-[#6F6F6F] leading-[1.65]">{item.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <p className="text-[13px] text-[#ABABAB]">
              Still have questions?{' '}
              <a href="mailto:support@civitasai.com" className="text-[#C08B5C] hover:text-[#A8734A] font-medium transition-colors duration-150">
                Contact us
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* ─── Free Trial CTA ─────────────────────────────────────── */}
      <section className="py-20 md:py-28 px-6 bg-white border-t border-[#EBEBEA]">
        <div className="max-w-[680px] mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#C08B5C]/[0.08] border border-[#C08B5C]/15 mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-[#C08B5C]" />
            <span className="text-[11px] font-semibold text-[#C08B5C] tracking-wide uppercase">Free trial</span>
          </div>
          <h2 className="text-[clamp(1.75rem,3.5vw,2.75rem)] font-bold text-[#1A1A1A] tracking-[-0.03em] leading-[1.1] mb-5">
            Start analyzing deals today.
          </h2>
          <p className="text-[16px] text-[#6F6F6F] leading-[1.7] mb-8 max-w-[520px] mx-auto">
            Get full access to all three AI modes, 15+ data sources, deal pipeline, and team collaboration. No credit card required.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            <button onClick={onNavigateToSignUp} className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#1A1A1A] text-white font-medium text-[15px] hover:bg-[#333] transition-colors duration-150">
              Start free trial <ArrowRightIcon className="w-4 h-4" />
            </button>
            <button onClick={() => scrollTo('pricing')} className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full border border-[#EBEBEA] text-[#6F6F6F] font-medium text-[14px] hover:border-[#CFCFCF] hover:text-[#1A1A1A] transition-all duration-150">
              Compare plans
            </button>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
            {[
              '25K AI tokens included',
              '2 property analyses',
              'All AI modes',
              'Deal pipeline access',
            ].map(item => (
              <div key={item} className="flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-[#C08B5C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                <span className="text-[13px] text-[#6F6F6F]">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Footer ──────────────────────────────────────────────── */}
      <footer className="bg-[#1A1A1A] pt-12 pb-8 px-6">
        <div className="max-w-[920px] mx-auto">

          {/* Row 1: Logo + Social + Language */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-8 border-b border-white/[0.08]">
            <div className="flex items-center gap-5">
              <div className="flex items-center gap-2">
                <Logo variant="light" showText={false} className="w-[18px] h-[18px] opacity-50" />
                <span className="text-[13px] font-medium text-white/50">Vasthu</span>
              </div>
              <div className="flex items-center gap-3">
                <a href="#" className="text-white/35 hover:text-white/60 transition-colors duration-150">
                  <XTwitterIcon className="w-4 h-4" />
                </a>
                <a href="#" className="text-white/35 hover:text-white/60 transition-colors duration-150">
                  <LinkedInIcon className="w-4 h-4" />
                </a>
                <a href="#" className="text-white/35 hover:text-white/60 transition-colors duration-150">
                  <YouTubeIcon className="w-4 h-4" />
                </a>
              </div>
            </div>
            <button className="text-[12px] text-white/35 hover:text-white/60 transition-colors duration-150">
              English (US)
            </button>
          </div>

          {/* Row 2: 4-Column Link Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-8 gap-y-8 pt-8 pb-8 border-b border-white/[0.08]">
            <div>
              <p className="text-[11px] text-white/50 font-semibold tracking-wide uppercase mb-4">Product</p>
              <div className="space-y-2.5">
                <button onClick={() => scrollTo('features')} className="block text-[13px] text-white/40 hover:text-white/70 transition-colors duration-150">Features</button>
                <button onClick={() => scrollTo('pricing')} className="block text-[13px] text-white/40 hover:text-white/70 transition-colors duration-150">Pricing</button>
                <button onClick={() => scrollTo('features')} className="block text-[13px] text-white/40 hover:text-white/70 transition-colors duration-150">Deal Pipeline</button>
                <button onClick={() => scrollTo('features')} className="block text-[13px] text-white/40 hover:text-white/70 transition-colors duration-150">Teams</button>
                <button onClick={() => scrollTo('features')} className="block text-[13px] text-white/40 hover:text-white/70 transition-colors duration-150">Marketplace</button>
              </div>
            </div>
            <div>
              <p className="text-[11px] text-white/50 font-semibold tracking-wide uppercase mb-4">Modes</p>
              <div className="space-y-2.5">
                <button onClick={() => navigateToMode('hunter')} className="block text-[13px] text-white/40 hover:text-white/70 transition-colors duration-150">Deep Search</button>
                <button onClick={() => navigateToMode('research')} className="block text-[13px] text-white/40 hover:text-white/70 transition-colors duration-150">Deep Research</button>
                <button onClick={() => navigateToMode('strategist')} className="block text-[13px] text-white/40 hover:text-white/70 transition-colors duration-150">Expert Strategist</button>
              </div>
            </div>
            <div>
              <p className="text-[11px] text-white/50 font-semibold tracking-wide uppercase mb-4">Support</p>
              <div className="space-y-2.5">
                <button onClick={navigateToFAQ} className="block text-[13px] text-white/40 hover:text-white/70 transition-colors duration-150">FAQ</button>
                <a href="mailto:support@civitasai.com" className="block text-[13px] text-white/40 hover:text-white/70 transition-colors duration-150">Contact</a>
                <a href="/privacy-policy" className="block text-[13px] text-white/40 hover:text-white/70 transition-colors duration-150">Terms & Privacy</a>
                <a href="/cookie-policy" className="block text-[13px] text-white/40 hover:text-white/70 transition-colors duration-150">Cookie Policy</a>
              </div>
            </div>
            <div>
              <p className="text-[11px] text-white/50 font-semibold tracking-wide uppercase mb-4">Vasthu for</p>
              <div className="space-y-2.5">
                <button onClick={() => scrollTo('use-cases')} className="block text-[13px] text-white/40 hover:text-white/70 transition-colors duration-150">Individual Investors</button>
                <button onClick={() => scrollTo('use-cases')} className="block text-[13px] text-white/40 hover:text-white/70 transition-colors duration-150">Portfolio Managers</button>
                <button onClick={() => scrollTo('use-cases')} className="block text-[13px] text-white/40 hover:text-white/70 transition-colors duration-150">Investment Partnerships</button>
                <button onClick={() => scrollTo('use-cases')} className="block text-[13px] text-white/40 hover:text-white/70 transition-colors duration-150">First-Time Investors</button>
              </div>
            </div>
          </div>

          {/* Row 3: Copyright Bar */}
          <div className="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <span className="text-white/25 text-[11px]">&copy; {new Date().getFullYear()} Civitas AI. All rights reserved.</span>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-[11px] text-white/25">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/70" />
                All systems operational
              </span>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="text-[11px] text-white/25 hover:text-white/50 transition-colors duration-150"
              >
                Back to top &uarr;
              </button>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};
