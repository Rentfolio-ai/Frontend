/**
 * Help Popup Panel
 *
 * Overlay popup triggered from "Get help" in the profile menu.
 * Internal multi-view navigation: Home, FAQ/Search, Contact Us, Quick Guides, What's New.
 * Replaces the full-page HelpPage and ContactSupportPage.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  X,
  ArrowLeft,
  Search,
  ChevronDown,
  ChevronRight,
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
  ExternalLink,
  ThumbsUp,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supportApi } from '../../services/supportApi';

// ─── Types ───────────────────────────────────────────────────────────────────

type View = 'home' | 'faq' | 'contact' | 'guides' | 'whats-new';

interface HelpPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

// ─── FAQ data (hardcoded fallback) ───────────────────────────────────────────

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
    desc: 'Get up and running in under 5 minutes. Set up your account, configure preferences, and run your first analysis.',
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
    desc: 'Learn how Vasthu evaluates properties using cash flow, cap rate, ROI, and other key metrics.',
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
    desc: 'Configure your buy box, budget, strategy (STR/LTR/Flip), and financial assumptions.',
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
    desc: 'Deep dive into Hunter, Research, and Strategist modes and when to use each.',
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
    desc: 'Talk to Vasthu using your voice for hands-free property research.',
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
// SUB-VIEWS
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Home View ───────────────────────────────────────────────────────────────

const HomeView: React.FC<{
  onNavigate: (view: View) => void;
}> = ({ onNavigate }) => (
  <div className="flex flex-col h-full">
    <div className="px-6 pt-5 pb-4">
      <h2 className="text-[18px] font-semibold text-white/90">How can we help?</h2>
      <p className="text-[12px] text-white/40 mt-1">Search our guides or get in touch</p>
    </div>

    <div className="flex-1 overflow-y-auto px-5 pb-5">
      <div className="space-y-2">
        {/* Search help articles */}
        <button
          onClick={() => onNavigate('faq')}
          className="w-full flex items-center gap-3.5 p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.10] transition-all text-left group"
        >
          <div className="w-9 h-9 rounded-lg bg-[#C08B5C]/10 flex items-center justify-center flex-shrink-0">
            <Search className="w-4.5 h-4.5 text-[#D4A27F]" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-[13px] font-medium text-white/80 group-hover:text-white transition-colors">
              Search help articles
            </h3>
            <p className="text-[11px] text-white/35">Browse FAQs and troubleshooting</p>
          </div>
          <ChevronRight className="w-4 h-4 text-white/15 group-hover:text-white/30 transition-colors flex-shrink-0" />
        </button>

        {/* Contact us */}
        <button
          onClick={() => onNavigate('contact')}
          className="w-full flex items-center gap-3.5 p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.10] transition-all text-left group"
        >
          <div className="w-9 h-9 rounded-lg bg-white/[0.05] flex items-center justify-center flex-shrink-0">
            <MessageSquare className="w-4.5 h-4.5 text-white/60" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-[13px] font-medium text-white/80 group-hover:text-white transition-colors">
              Contact us
            </h3>
            <p className="text-[11px] text-white/35">Send feedback or report an issue</p>
          </div>
          <ChevronRight className="w-4 h-4 text-white/15 group-hover:text-white/30 transition-colors flex-shrink-0" />
        </button>

        {/* Quick start guide */}
        <button
          onClick={() => onNavigate('guides')}
          className="w-full flex items-center gap-3.5 p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.10] transition-all text-left group"
        >
          <div className="w-9 h-9 rounded-lg bg-white/[0.05] flex items-center justify-center flex-shrink-0">
            <Book className="w-4.5 h-4.5 text-white/60" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-[13px] font-medium text-white/80 group-hover:text-white transition-colors">
              Quick guides
            </h3>
            <p className="text-[11px] text-white/35">Get started and learn features</p>
          </div>
          <ChevronRight className="w-4 h-4 text-white/15 group-hover:text-white/30 transition-colors flex-shrink-0" />
        </button>

        {/* What's new */}
        <button
          onClick={() => onNavigate('whats-new')}
          className="w-full flex items-center gap-3.5 p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.10] transition-all text-left group"
        >
          <div className="w-9 h-9 rounded-lg bg-white/[0.05] flex items-center justify-center flex-shrink-0">
            <Rocket className="w-4.5 h-4.5 text-white/60" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-[13px] font-medium text-white/80 group-hover:text-white transition-colors">
              What's new
            </h3>
            <p className="text-[11px] text-white/35">Latest updates and features</p>
          </div>
          <ChevronRight className="w-4 h-4 text-white/15 group-hover:text-white/30 transition-colors flex-shrink-0" />
        </button>
      </div>
    </div>

    {/* Footer */}
    <div className="px-5 py-3 border-t border-white/[0.06] flex items-center justify-center gap-4">
      <a
        href="mailto:support@civitasai.com"
        className="text-[10px] text-white/25 hover:text-white/50 transition-colors flex items-center gap-1"
      >
        <ExternalLink className="w-3 h-3" />
        Email support
      </a>
      <span className="text-white/10">|</span>
      <span className="text-[10px] text-white/20">Terms</span>
      <span className="text-white/10">|</span>
      <span className="text-[10px] text-white/20">Privacy</span>
    </div>
  </div>
);

// ─── FAQ / Search View ───────────────────────────────────────────────────────

const FAQView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Auto-focus search on mount
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
      {/* Header */}
      <div className="flex items-center gap-2.5 px-4 pt-4 pb-3">
        <button
          onClick={onBack}
          className="w-7 h-7 rounded-lg bg-white/[0.05] hover:bg-white/[0.08] flex items-center justify-center transition-colors flex-shrink-0"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-white/60" />
        </button>
        <h2 className="text-[15px] font-semibold text-white/90">Help Articles</h2>
      </div>

      {/* Search */}
      <div className="px-4 pb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
          <input
            ref={searchRef}
            type="text"
            placeholder="Search FAQs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-8 bg-white/[0.06] border border-white/[0.08] rounded-lg text-[12px] text-white/80 placeholder-white/25 focus:outline-none focus:border-white/[0.15] transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2"
            >
              <X className="w-3 h-3 text-white/30 hover:text-white/50" />
            </button>
          )}
        </div>
      </div>

      {/* Category pills */}
      <div className="flex gap-1.5 px-4 pb-3 overflow-x-auto no-scrollbar">
        {FAQ_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-[11px] font-medium whitespace-nowrap transition-all ${
              activeCategory === cat
                ? 'bg-[#C08B5C]/20 text-[#D4A27F] border border-[#C08B5C]/30'
                : 'bg-white/[0.04] text-white/40 border border-white/[0.06] hover:bg-white/[0.06]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* FAQ list */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <Search className="w-8 h-8 text-white/10 mb-3" />
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
                  className="w-full text-left px-4 py-3 transition-colors hover:bg-white/[0.02]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <h4 className="text-[12px] font-medium text-white/70">{item.question}</h4>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-white/25 flex-shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <p className="mt-2 text-[11px] text-white/40 leading-relaxed pr-6">
                          {item.answer}
                        </p>
                        <div className="flex items-center gap-3 mt-2.5 pt-2 border-t border-white/[0.04]">
                          <span className="text-[10px] text-white/25">Was this helpful?</span>
                          <button className="p-1 rounded hover:bg-white/[0.05] transition-colors">
                            <ThumbsUp className="w-3 h-3 text-white/30 hover:text-emerald-400" />
                          </button>
                          <button className="p-1 rounded hover:bg-white/[0.05] transition-colors">
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

// ─── Contact Us View ─────────────────────────────────────────────────────────

const ContactView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
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
      {/* Header */}
      <div className="flex items-center gap-2.5 px-4 pt-4 pb-3">
        <button
          onClick={onBack}
          className="w-7 h-7 rounded-lg bg-white/[0.05] hover:bg-white/[0.08] flex items-center justify-center transition-colors flex-shrink-0"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-white/60" />
        </button>
        <h2 className="text-[15px] font-semibold text-white/90">Contact Us</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {/* Success state */}
        <AnimatePresence>
          {submitted && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex items-center gap-3 p-3.5 rounded-xl bg-emerald-500/[0.08] border border-emerald-500/20 mb-4"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-[12px] font-medium text-emerald-300">
                  Thanks for your feedback!
                </h3>
                <p className="text-[10px] text-white/40">
                  Our team has been notified and a ticket has been created.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* What happened? */}
        <div className="mb-4">
          <h3 className="text-[10px] font-semibold uppercase tracking-widest text-white/30 mb-2 px-0.5">
            What happened?
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {REASONS.map((r) => {
              const Icon = r.icon;
              const isActive = reason === r.key;
              return (
                <button
                  key={r.key}
                  onClick={() => setReason(r.key)}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border-2 transition-all text-left ${
                    isActive
                      ? 'border-[#C08B5C]/30 bg-[#C08B5C]/[0.06]'
                      : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="w-7 h-7 rounded-lg bg-white/[0.05] flex items-center justify-center flex-shrink-0">
                    <Icon className="w-3.5 h-3.5 text-white/60" />
                  </div>
                  <span className="text-[11px] font-medium text-white/70 leading-tight">
                    {r.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Message form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <h3 className="text-[10px] font-semibold uppercase tracking-widest text-white/30 mb-1.5 px-0.5">
              Tell us more
            </h3>
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
              rows={4}
              maxLength={5000}
              required
              className="w-full px-3 py-2.5 bg-white/[0.06] border border-white/[0.08] rounded-xl text-[12px] text-white/85 placeholder-white/25 focus:outline-none focus:border-[#C08B5C]/30 transition-colors resize-none leading-relaxed"
            />
            <p className="text-[9px] text-white/20 text-right mt-0.5 px-0.5">
              {message.length}/5000
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 p-2.5 rounded-lg bg-red-500/10 border border-red-500/20">
              <AlertTriangle className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-red-300">{error}</p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting || !message.trim()}
            className={`w-full py-2.5 rounded-xl text-[12px] font-semibold transition-all flex items-center justify-center gap-2 ${
              submitting || !message.trim()
                ? 'bg-white/[0.06] text-white/30 cursor-not-allowed'
                : 'bg-[#C08B5C] text-white hover:bg-[#A8734A]'
            }`}
          >
            {submitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                Send Feedback
              </>
            )}
          </button>

          <p className="text-[10px] text-center text-white/20">
            Or email us at{' '}
            <a
              href="mailto:support@civitasai.com"
              className="text-[#D4A27F] hover:underline"
            >
              support@civitasai.com
            </a>
          </p>
        </form>
      </div>
    </div>
  );
};

// ─── Quick Guides View ───────────────────────────────────────────────────────

const GuidesView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-4 pt-4 pb-3">
        <button
          onClick={onBack}
          className="w-7 h-7 rounded-lg bg-white/[0.05] hover:bg-white/[0.08] flex items-center justify-center transition-colors flex-shrink-0"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-white/60" />
        </button>
        <h2 className="text-[15px] font-semibold text-white/90">Quick Guides</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
        {GUIDES.map((guide) => {
          const Icon = guide.icon;
          const isOpen = expandedId === guide.id;
          return (
            <div
              key={guide.id}
              className="rounded-xl bg-white/[0.02] border border-white/[0.06] overflow-hidden"
            >
              <button
                onClick={() => setExpandedId(isOpen ? null : guide.id)}
                className="w-full flex items-center gap-3 p-3.5 text-left hover:bg-white/[0.02] transition-colors"
              >
                <div className="w-9 h-9 rounded-lg bg-white/[0.05] flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4.5 h-4.5 text-white/60" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-[12px] font-medium text-white/80">{guide.title}</h3>
                    {guide.tag && (
                      <span className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#C08B5C] text-black">
                        {guide.tag}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-white/35 mt-0.5 leading-relaxed">{guide.desc}</p>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-white/20 flex-shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 pt-0">
                      <ol className="space-y-2 ml-1">
                        {guide.content.map((step, i) => (
                          <li key={i} className="flex gap-2.5 items-start">
                            <span className="text-[10px] font-mono font-bold text-[#C08B5C]/60 mt-0.5 flex-shrink-0 w-4 text-right">
                              {i + 1}.
                            </span>
                            <span className="text-[11px] text-white/50 leading-relaxed">
                              {step}
                            </span>
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

// ─── What's New View ─────────────────────────────────────────────────────────

const WhatsNewView: React.FC<{ onBack: () => void }> = ({ onBack }) => (
  <div className="flex flex-col h-full">
    {/* Header */}
    <div className="flex items-center gap-2.5 px-4 pt-4 pb-3">
      <button
        onClick={onBack}
        className="w-7 h-7 rounded-lg bg-white/[0.05] hover:bg-white/[0.08] flex items-center justify-center transition-colors flex-shrink-0"
      >
        <ArrowLeft className="w-3.5 h-3.5 text-white/60" />
      </button>
      <h2 className="text-[15px] font-semibold text-white/90">What's New</h2>
    </div>

    <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-5">
      {WHATS_NEW.map((release) => (
        <div key={release.version}>
          <div className="flex items-center gap-2 mb-2.5">
            <span className="text-[11px] font-semibold text-[#D4A27F]">{release.version}</span>
            <span className="text-[10px] text-white/25">{release.date}</span>
          </div>
          <div className="space-y-1.5 pl-1">
            {release.items.map((item, i) => (
              <div key={i} className="flex gap-2.5 items-start">
                <div className="w-1.5 h-1.5 rounded-full bg-[#C08B5C]/40 mt-1.5 flex-shrink-0" />
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
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export const HelpPopup: React.FC<HelpPopupProps> = ({ isOpen, onClose }) => {
  const [view, setView] = useState<View>('home');
  const panelRef = useRef<HTMLDivElement>(null);

  // Reset view to home every time the popup opens
  useEffect(() => {
    if (isOpen) {
      setView('home');
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  // Close when clicking outside the panel
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    // Delay listener to avoid the triggering click from closing it immediately
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const navigateTo = useCallback((v: View) => setView(v), []);
  const goHome = useCallback(() => setView('home'), []);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={panelRef}
          className="fixed bottom-5 right-5 z-[60] w-[420px] h-[600px] max-h-[calc(100vh-3rem)] bg-[#18181c] border border-white/[0.10] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          initial={{ opacity: 0, y: 20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.96 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
        >
          {/* Top bar with close button */}
          <div className="flex items-center justify-between px-5 pt-4 pb-0">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[#C08B5C] to-[#A8734A] flex items-center justify-center">
                <span className="text-[10px] font-bold text-white">V</span>
              </div>
              <span className="text-[11px] font-medium text-white/40">Vasthu Help</span>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg bg-white/[0.05] hover:bg-white/[0.08] flex items-center justify-center transition-colors"
            >
              <X className="w-3.5 h-3.5 text-white/50" />
            </button>
          </div>

          {/* View content with slide transitions */}
          <div className="flex-1 min-h-0 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={view}
                className="h-full"
                initial={{
                  opacity: 0,
                  x: view === 'home' ? -20 : 20,
                }}
                animate={{ opacity: 1, x: 0 }}
                exit={{
                  opacity: 0,
                  x: view === 'home' ? 20 : -20,
                }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
              >
                {view === 'home' && <HomeView onNavigate={navigateTo} />}
                {view === 'faq' && <FAQView onBack={goHome} />}
                {view === 'contact' && <ContactView onBack={goHome} />}
                {view === 'guides' && <GuidesView onBack={goHome} />}
                {view === 'whats-new' && <WhatsNewView onBack={goHome} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
