/**
 * Help Drawer Panel
 *
 * Bottom-sliding drawer triggered from "Get help" in the profile menu.
 * Tab-based navigation: Home, FAQ, Contact, Guides, Changelog.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  X,
  Search,
  ChevronDown,
  Book,
  MessageSquare,
  Sparkles,
  Rocket,
  Bug,
  ThumbsDown,
  Frown,
  HelpCircle,
  Send,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Home,
  TrendingUp,
  Settings,
  Mic,
  ThumbsUp,
  Zap,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { designTokens } from '../../styles/design-tokens';
import { supportApi } from '../../services/supportApi';

// ─── Types ───────────────────────────────────────────────────────────────────

type View = 'home' | 'faq' | 'contact' | 'guides' | 'whats-new';

interface HelpPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

// ─── Tab definitions ─────────────────────────────────────────────────────────

const TABS: { key: View; label: string; icon: React.ElementType }[] = [
  { key: 'home', label: 'Home', icon: Home },
  { key: 'faq', label: 'FAQ', icon: Search },
  { key: 'contact', label: 'Contact', icon: MessageSquare },
  { key: 'guides', label: 'Guides', icon: Book },
  { key: 'whats-new', label: 'Changelog', icon: Rocket },
];

// ─── FAQ data ────────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    id: 'faq-1',
    category: 'General',
    question: 'How do I set my investment preferences?',
    answer:
      'Go to Settings > Investment Preferences to configure your buy box, budget, strategy, and other criteria. This helps Vasthu provide personalized property recommendations.',
  },
  {
    id: 'faq-2',
    category: 'Features',
    question: 'What are the different reasoning modes?',
    answer:
      'Vasthu has three modes: Hunter (fast deal scouting), Research (deep market analysis), and Strategist (portfolio-level planning). Switch modes from the chat input area.',
  },
  {
    id: 'faq-3',
    category: 'Features',
    question: 'How do I analyze a property deal?',
    answer:
      'Simply ask Vasthu about a property or paste a listing URL. The AI will analyze cash flow, ROI, cap rate, and other metrics based on your investment strategy.',
  },
  {
    id: 'faq-4',
    category: 'Features',
    question: 'Can I save properties and reports?',
    answer:
      'Yes! Bookmark properties for later review and generate reports for detailed analysis. All saved items are accessible from the sidebar.',
  },
  {
    id: 'faq-5',
    category: 'Billing',
    question: 'How does billing work?',
    answer:
      'Free plan includes 2 property searches/month and basic insights. Pro plan ($100/mo, 50% off first month) gives unlimited searches, reports, and advanced analysis.',
  },
  {
    id: 'faq-6',
    category: 'Troubleshooting',
    question: 'Why is voice mode not working?',
    answer:
      'Voice mode requires microphone permissions and a stable internet connection. Make sure your browser has granted mic access. Voice mode is currently in Beta, so occasional issues may occur.',
  },
  {
    id: 'faq-7',
    category: 'Billing',
    question: 'Can I cancel my subscription?',
    answer:
      'Yes, you can cancel anytime from Settings > Billing & Subscriptions. Your Pro features will remain active until the end of your current billing period.',
  },
  {
    id: 'faq-8',
    category: 'General',
    question: 'What data sources does Vasthu use?',
    answer:
      'Vasthu pulls data from multiple sources including RentCast for property listings and rental estimates, combined with our proprietary analysis algorithms for investment insights.',
  },
];

const FAQ_CATEGORIES = ['All', 'General', 'Features', 'Billing', 'Troubleshooting'] as const;

// ─── Contact form reasons ────────────────────────────────────────────────────

const REASONS = [
  { key: 'broken' as const, label: 'Something is broken', icon: Bug },
  { key: 'bad_response' as const, label: 'Bad AI response', icon: ThumbsDown },
  { key: 'confusing' as const, label: 'Confusing / hard to use', icon: Frown },
  { key: 'other' as const, label: 'Other feedback', icon: HelpCircle },
];

type ReasonKey = (typeof REASONS)[number]['key'];

const REASON_TO_CATEGORY: Record<ReasonKey, 'bug' | 'general' | 'feature'> = {
  broken: 'bug',
  bad_response: 'bug',
  confusing: 'feature',
  other: 'general',
};

const REASON_TO_PRIORITY: Record<ReasonKey, 'high' | 'medium' | 'low'> = {
  broken: 'high',
  bad_response: 'medium',
  confusing: 'low',
  other: 'low',
};

// ─── Quick Guides data ───────────────────────────────────────────────────────

const GUIDES = [
  {
    id: 'getting-started',
    icon: Sparkles,
    title: 'Quick Start Guide',
    desc: 'Get up and running in under 5 minutes.',
    tag: 'Start here',
    content: [
      'Create your account and verify your email.',
      'Set up your Investment Preferences (budget, target markets, strategy).',
      'Start a chat with Vasthu and ask about any property or market.',
      'Review AI-generated analysis with cash flow, ROI, and cap rate metrics.',
      'Save interesting properties and generate detailed reports.',
    ],
  },
  {
    id: 'property-analysis',
    icon: Home,
    title: 'Property Analysis',
    desc: 'How Vasthu evaluates properties with key metrics.',
    content: [
      'Ask Vasthu to search for properties in any US market.',
      'Get instant analysis with key investment metrics.',
      'Compare multiple properties side-by-side.',
      'Run custom P&L scenarios with the Deal Analyzer.',
      'Generate professional PDF reports for any property.',
    ],
  },
  {
    id: 'investment-prefs',
    icon: Settings,
    title: 'Investment Preferences',
    desc: 'Configure your buy box, budget, and strategy.',
    content: [
      'Navigate to Settings > Investment Preferences.',
      'Set your budget range and target markets.',
      'Choose your investment strategy (Long-term rental, Short-term rental, or Flip).',
      'Configure financial assumptions like down payment, interest rate, etc.',
      'Your preferences inform all AI recommendations automatically.',
    ],
  },
  {
    id: 'agent-modes',
    icon: TrendingUp,
    title: 'Agent Modes',
    desc: 'Hunter, Research, and Strategist deep dive.',
    content: [
      'Hunter Mode: Fast deal scouting — finds properties matching your criteria quickly.',
      'Research Mode: Deep market analysis — comprehensive data on neighborhoods and trends.',
      'Strategist Mode: Portfolio-level planning — helps optimize your overall investment strategy.',
      'Switch modes from the persona selector in the chat input area.',
    ],
  },
  {
    id: 'voice-mode',
    icon: Mic,
    title: 'Voice Mode (Beta)',
    desc: 'Talk to Vasthu hands-free with your voice.',
    content: [
      'Click the waveform icon in the chat input to activate voice mode.',
      'Speak naturally — Vasthu transcribes and responds in real-time.',
      'Voice mode can search properties, analyze deals, and answer questions.',
      'Grant microphone permissions when prompted by your browser.',
      'Note: Voice mode is in Beta. Some features may be limited.',
    ],
  },
];

// ─── What's New data ─────────────────────────────────────────────────────────

const WHATS_NEW = [
  {
    version: 'v1.4',
    date: 'Feb 2026',
    items: [
      'Voice Mode (Beta) — talk to Vasthu hands-free with real-time streaming',
      'Inline voice chat — stream directly in the chat view',
      'Custom waveform voice activation icon',
      'Feature gating with clear upgrade prompts for free-tier users',
    ],
  },
  {
    version: 'v1.3',
    date: 'Jan 2026',
    items: [
      'Agent personas — switch between specialized AI personalities',
      'Investment Preferences — configure your buy box for personalized results',
      'Compact chat layout with improved readability',
      'Camera integration in voice mode for property scanning',
    ],
  },
  {
    version: 'v1.2',
    date: 'Dec 2025',
    items: [
      'Deal Analyzer with P&L scenarios',
      'PDF report generation and downloads',
      'Portfolio tracking dashboard',
      'Pre-market radar for off-market opportunities',
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// SUB-VIEWS (no back buttons — tabs handle navigation)
// ═══════════════════════════════════════════════════════════════════════════════

const QUICK_CARDS = [
  { icon: Sparkles, title: 'Getting Started', desc: 'Set up your account and run your first analysis', gradient: 'from-amber-500/20 to-orange-500/20', view: 'guides' as View },
  { icon: Zap, title: 'Analyze a Deal', desc: 'Underwrite any property with AI-powered metrics', gradient: 'from-blue-500/20 to-cyan-500/20', view: 'faq' as View },
  { icon: TrendingUp, title: 'AI Modes', desc: 'Hunter, Research, and Strategist explained', gradient: 'from-violet-500/20 to-purple-500/20', view: 'guides' as View },
  { icon: Mic, title: 'Voice Mode', desc: 'Hands-free property research with voice', gradient: 'from-emerald-500/20 to-teal-500/20', view: 'guides' as View },
];

const HomeView: React.FC<{ onNavigate: (view: View) => void }> = ({ onNavigate }) => (
  <div className="flex flex-col h-full">
    {/* Search pill */}
    <div className="px-6 pt-4 pb-4">
      <button
        onClick={() => onNavigate('faq')}
        className="w-full h-10 flex items-center gap-3 pl-4 pr-5 rounded-xl text-[13px] text-white/25 hover:text-white/35 transition-all duration-300 text-left backdrop-blur-md"
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'rgba(192,139,92,0.25)';
          e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
          e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
        }}
      >
        <Search className="w-3.5 h-3.5 text-copper-400/40 flex-shrink-0" />
        Search help articles...
      </button>
    </div>

    {/* Quick-start card grid */}
    <div className="flex-1 overflow-y-auto px-6 pb-4">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-white/20 mb-3">Quick start</p>
      <div className="grid grid-cols-2 gap-3">
        {QUICK_CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.title}
              onClick={() => onNavigate(card.view)}
              className="group text-left p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.12] transition-all duration-300"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center mb-3 group-hover:scale-105 transition-transform duration-300`}>
                <Icon className="w-4.5 h-4.5 text-white/80" strokeWidth={1.5} />
              </div>
              <h4 className="text-[12px] font-medium text-white/70 group-hover:text-white/90 transition-colors mb-1">{card.title}</h4>
              <p className="text-[10px] text-white/30 leading-relaxed">{card.desc}</p>
            </button>
          );
        })}
      </div>
    </div>

    {/* Footer */}
    <div className="px-6 py-3 border-t border-white/[0.06] flex items-center justify-between flex-shrink-0">
      <div className="flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-50" style={{ animationDuration: '2s' }} />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
        </span>
        <span className="text-[10px] text-white/25">All systems operational</span>
      </div>
      <kbd className="text-[9px] text-white/25 px-1.5 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.08] font-mono">Esc</kbd>
    </div>
  </div>
);

// ─── FAQ View ────────────────────────────────────────────────────────────────

const FAQView: React.FC = () => {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTimeout(() => searchRef.current?.focus(), 150);
  }, []);

  const filtered = FAQ_ITEMS.filter((item) => {
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    const matchesSearch =
      !search ||
      item.question.toLowerCase().includes(search.toLowerCase()) ||
      item.answer.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="px-6 pt-4 pb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
          <input
            ref={searchRef}
            type="text"
            placeholder="Search FAQs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-8 bg-white/[0.04] border border-white/[0.08] rounded-xl text-[12px] text-white/80 placeholder-white/25 focus:outline-none focus:border-copper-500/40 transition-all duration-200"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2">
              <X className="w-3 h-3 text-white/30 hover:text-white/50" />
            </button>
          )}
        </div>
      </div>

      {/* Category pills */}
      <div className="flex gap-1.5 px-6 pb-3 overflow-x-auto no-scrollbar">
        {FAQ_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-[11px] font-medium whitespace-nowrap transition-all duration-200 ${
              activeCategory === cat
                ? 'bg-copper-500/20 text-copper-400 border border-copper-500/30'
                : 'bg-white/[0.04] text-white/40 border border-white/[0.06] hover:bg-white/[0.06]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* FAQ list */}
      <div className="flex-1 overflow-y-auto px-6 pb-4">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-12 h-12 rounded-xl bg-copper-500/10 flex items-center justify-center mb-3">
              <Search className="w-5 h-5 text-copper-400/50" />
            </div>
            <p className="text-[13px] text-white/40">No matching articles</p>
            <p className="text-[11px] text-white/25 mt-1">Try a different search term</p>
          </div>
        ) : (
          <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] divide-y divide-white/[0.04] overflow-hidden">
            {filtered.map((item) => {
              const isOpen = expandedId === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setExpandedId(isOpen ? null : item.id)}
                  className={`w-full text-left px-4 py-3 transition-all duration-200 hover:bg-white/[0.02] relative ${isOpen ? 'border-l-2 border-l-copper-500' : 'border-l-2 border-l-transparent'}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <h4 className="text-[12px] font-medium text-white/70">{item.question}</h4>
                    <ChevronDown className={`w-3.5 h-3.5 text-white/25 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                  </div>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
                        className="overflow-hidden"
                      >
                        <p className="mt-2 text-[11px] text-white/40 leading-relaxed pr-6">{item.answer}</p>
                        <div className="flex items-center gap-3 mt-2.5 pt-2 border-t border-white/[0.04]">
                          <span className="text-[10px] text-white/25">Was this helpful?</span>
                          <button className="p-1 rounded hover:bg-white/[0.05] transition-colors duration-200">
                            <ThumbsUp className="w-3 h-3 text-white/30 hover:text-emerald-400" />
                          </button>
                          <button className="p-1 rounded hover:bg-white/[0.05] transition-colors duration-200">
                            <ThumbsDown className="w-3 h-3 text-white/30 hover:text-red-400" />
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Contact View ────────────────────────────────────────────────────────────

const ContactView: React.FC = () => {
  const [reason, setReason] = useState<ReasonKey>('broken');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      const reasonObj = REASONS.find((r) => r.key === reason);
      await supportApi.createTicket({
        category: REASON_TO_CATEGORY[reason],
        subject: `[${reasonObj?.label}] User feedback`,
        description: message.trim(),
        priority: REASON_TO_PRIORITY[reason],
      });
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setMessage('');
        setReason('broken');
      }, 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-6 pt-4 pb-4">
        <AnimatePresence>
          {submitted && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="flex items-center gap-3 p-3.5 rounded-xl bg-emerald-500/[0.08] border border-emerald-500/20 mb-4"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-[12px] font-medium text-emerald-300">Thanks for your feedback!</h3>
                <p className="text-[10px] text-white/40">Our team has been notified and a ticket has been created.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mb-4">
          <h3 className="text-[10px] font-semibold uppercase tracking-widest text-white/30 mb-2.5 px-0.5">What happened?</h3>
          <div className="grid grid-cols-2 gap-2">
            {REASONS.map((r) => {
              const Icon = r.icon;
              const isActive = reason === r.key;
              return (
                <button
                  key={r.key}
                  onClick={() => setReason(r.key)}
                  className={`flex items-center gap-2.5 p-3 rounded-xl transition-all duration-200 text-left ${
                    isActive
                      ? 'bg-copper-500/[0.08] border-2 border-copper-500/40'
                      : 'bg-white/[0.02] border-2 border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.10]'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${isActive ? 'bg-copper-500/20' : 'bg-white/[0.06]'}`}>
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-copper-400' : 'text-white/40'}`} />
                  </div>
                  <span className={`text-[11px] font-medium leading-tight ${isActive ? 'text-white/80' : 'text-white/60'}`}>{r.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <h3 className="text-[10px] font-semibold uppercase tracking-widest text-white/30 mb-2 px-0.5">Tell us more</h3>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={
                reason === 'broken'
                  ? 'What happened? What were you trying to do?'
                  : reason === 'bad_response'
                    ? 'What was wrong with the response?'
                    : reason === 'confusing'
                      ? 'What part was confusing?'
                      : 'Share any feedback or suggestions...'
              }
              rows={3}
              maxLength={5000}
              required
              className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-[12px] text-white/85 placeholder-white/25 focus:outline-none focus:border-copper-500/40 transition-all duration-200 resize-none leading-relaxed"
            />
            <p className="text-[9px] text-white/20 text-right mt-0.5 px-0.5">{message.length}/5000</p>
          </div>

          {error && (
            <div className="flex items-start gap-2 p-2.5 rounded-xl bg-red-500/10 border border-red-500/20">
              <AlertTriangle className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-red-300">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || !message.trim()}
            className={`w-full py-2.5 rounded-xl text-[12px] font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
              submitting || !message.trim()
                ? 'bg-white/[0.06] text-white/30 cursor-not-allowed'
                : 'bg-copper-500 text-white hover:bg-copper-600 shadow-[0_2px_8px_rgba(192,139,92,0.25)]'
            }`}
          >
            {submitting ? (
              <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Sending...</>
            ) : (
              <><Send className="w-3.5 h-3.5" /> Send Feedback</>
            )}
          </button>

          <p className="text-[10px] text-center text-white/20">
            Or email us at{' '}
            <a href="mailto:support@civitasai.com" className="text-copper-400 hover:underline">support@civitasai.com</a>
          </p>
        </form>
      </div>
    </div>
  );
};

// ─── Guides View ─────────────────────────────────────────────────────────────

const GuidesView: React.FC = () => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-6 pt-4 pb-4 space-y-2">
        {GUIDES.map((guide) => {
          const Icon = guide.icon;
          const isOpen = expandedId === guide.id;
          return (
            <div
              key={guide.id}
              className={`rounded-xl bg-white/[0.02] border overflow-hidden transition-all duration-200 ${isOpen ? 'border-copper-500/20 bg-white/[0.03]' : 'border-white/[0.06]'}`}
            >
              <button
                onClick={() => setExpandedId(isOpen ? null : guide.id)}
                className="w-full flex items-center gap-3 p-3.5 text-left hover:bg-white/[0.02] transition-colors duration-200"
              >
                <div className="w-9 h-9 rounded-lg bg-copper-500/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-copper-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-[12px] font-medium text-white/80">{guide.title}</h3>
                    {guide.tag && (
                      <span className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-copper-500/20 text-copper-400">{guide.tag}</span>
                    )}
                  </div>
                  <p className="text-[10px] text-white/35 mt-0.5 leading-relaxed">{guide.desc}</p>
                </div>
                <ChevronDown className={`w-4 h-4 text-white/20 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 pt-0">
                      <ol className="space-y-2.5 ml-1">
                        {guide.content.map((step, i) => (
                          <li key={i} className="flex gap-2.5 items-start">
                            <span className="text-[10px] font-mono font-bold text-copper-500/50 mt-0.5 flex-shrink-0 w-4 text-right">{i + 1}.</span>
                            <span className="text-[11px] text-white/50 leading-relaxed">{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── Changelog View ──────────────────────────────────────────────────────────

const WhatsNewView: React.FC = () => (
  <div className="flex flex-col h-full">
    <div className="flex-1 overflow-y-auto px-6 pt-4 pb-4 space-y-5">
      {WHATS_NEW.map((release, ri) => (
        <div key={release.version} className={`${ri > 0 ? 'pt-4 border-t border-white/[0.04]' : ''}`}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-copper-500/15 text-copper-400">{release.version}</span>
            <span className="text-[10px] text-white/30">{release.date}</span>
          </div>
          <div className="space-y-2 pl-1">
            {release.items.map((item, i) => (
              <div key={i} className="flex gap-2.5 items-start">
                <div className="w-1.5 h-1.5 rounded-full bg-copper-500/40 mt-1.5 flex-shrink-0" />
                <span className="text-[11px] text-white/50 leading-relaxed">{item}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT — Bottom Drawer
// ═══════════════════════════════════════════════════════════════════════════════

export const HelpPopup: React.FC<HelpPopupProps> = ({ isOpen, onClose }) => {
  const [view, setView] = useState<View>('home');
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) setView('home');
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  const navigateTo = useCallback((v: View) => setView(v), []);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[59] bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            ref={drawerRef}
            className="fixed bottom-0 left-1/2 z-[60] w-full max-w-[700px] h-[540px] max-h-[calc(100vh-2rem)] overflow-hidden flex flex-col"
            style={{
              background: designTokens.colors.help.bgDeep,
              borderRadius: '24px 24px 0 0',
              border: `1px solid ${designTokens.colors.help.border}`,
              borderBottom: 'none',
              boxShadow: '0 -8px 40px rgba(192,139,92,0.08), 0 -4px 80px rgba(0,0,0,0.4)',
              x: '-50%',
            }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            {/* Copper orb gradient */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse 300px 200px at 80% 5%, rgba(192,139,92,0.10), transparent 70%)',
                borderRadius: 'inherit',
              }}
            />
            {/* Noise texture */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                opacity: designTokens.colors.help.noiseOpacity,
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
                backgroundSize: '128px 128px',
                borderRadius: 'inherit',
              }}
            />

            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1 relative z-10 flex-shrink-0">
              <div className="w-9 h-1 rounded-full bg-white/15" />
            </div>

            {/* Copper accent bar */}
            <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-copper-500/50 to-transparent flex-shrink-0 relative z-10" />

            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-3 pb-2 relative z-10 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div
                    className="w-8 h-8 rounded-xl bg-gradient-to-br from-copper-500 to-copper-600 flex items-center justify-center"
                    style={{ boxShadow: '0 0 20px rgba(192,139,92,0.25), inset 0 1px 0 rgba(255,255,255,0.15)' }}
                  >
                    <span className="text-[12px] font-bold text-white">V</span>
                  </div>
                  <div className="absolute -inset-[3px] rounded-[14px] border border-copper-500/30 animate-pulse" style={{ animationDuration: '3s' }} />
                </div>
                <div>
                  <h2 className="text-[14px] font-display font-semibold leading-tight">
                    <span className="bg-gradient-to-r from-[#D4A27F] via-white/90 to-[#C08B5C] bg-clip-text text-transparent bg-[length:200%_100%] animate-[shimmer_4s_ease-in-out_infinite]">Vasthu</span>
                    <span className="text-white/90"> Help</span>
                  </h2>
                  <p className="text-[11px] text-white/35 leading-tight mt-0.5">How can we help you today?</p>
                </div>
              </div>
              <button onClick={onClose} className="text-white/30 hover:text-white/60 transition-colors duration-200 p-1.5 rounded-lg hover:bg-white/[0.05]">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tab bar */}
            <div className="flex items-center gap-1 px-6 relative z-10 flex-shrink-0 border-b border-white/[0.06]">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = view === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setView(tab.key)}
                    className={`relative flex items-center gap-1.5 px-3 py-2.5 text-[11px] font-medium transition-colors duration-200 ${
                      isActive ? 'text-copper-400' : 'text-white/35 hover:text-white/60'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" strokeWidth={1.5} />
                    {tab.label}
                    {isActive && (
                      <motion.div
                        className="absolute bottom-0 left-1 right-1 h-[2px] rounded-full bg-copper-500"
                        layoutId="help-tab-indicator"
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* View content */}
            <div className="flex-1 min-h-0 overflow-hidden relative z-10">
              <AnimatePresence mode="wait">
                <motion.div
                  key={view}
                  className="h-full"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
                >
                  {view === 'home' && <HomeView onNavigate={navigateTo} />}
                  {view === 'faq' && <FAQView />}
                  {view === 'contact' && <ContactView />}
                  {view === 'guides' && <GuidesView />}
                  {view === 'whats-new' && <WhatsNewView />}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
