import React, { useState, useMemo } from 'react';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import { Logo } from '../../components/ui/Logo';

interface FAQPageProps {
  onBackToHome: () => void;
}

type Category = 'all' | 'general' | 'pricing' | 'privacy' | 'ai';

const CATEGORIES: { key: Category; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'general', label: 'General' },
  { key: 'pricing', label: 'Pricing' },
  { key: 'privacy', label: 'Privacy' },
  { key: 'ai', label: 'AI & Data' },
];

const FAQS: { q: string; a: string; category: Category }[] = [
  { q: 'What is Vasthu and how does it work?', a: 'Vasthu is an AI-powered real estate analyst. Describe what you\'re looking for in plain English and it scouts properties, runs financial analysis, pulls market comps, and generates lender-ready reports — all through conversation.', category: 'general' },
  { q: 'What data sources does Vasthu use?', a: 'We aggregate data from RentCast, Census Bureau, Zillow, Redfin, and MLS-connected sources for real-time rental comps, property data, and market statistics. Our AI cross-references multiple sources to ensure accuracy.', category: 'ai' },
  { q: 'How accurate are the valuations and estimates?', a: 'Our AI aggregates data from multiple high-confidence sources including sold comparables, current rental listings, and local market trends. While no automated model is 100% perfect, our Cap Rate and Cash-on-Cash ROI estimates are highly reliable starting points for due diligence.', category: 'ai' },
  { q: 'Is this financial advice?', a: 'No. Vasthu provides data-driven analysis for informational and educational purposes only. It is not a substitute for professional financial, legal, or tax advice. Always consult qualified professionals before making investment decisions.', category: 'general' },
  { q: 'How much does it cost?', a: 'The Free plan gives you 25,000 tokens per month. Pro is $100/month with 100,000 tokens, unlimited analyses, reports, deep reasoning, deal pipeline, and portfolio tracking. Cancel anytime.', category: 'pricing' },
  { q: 'What happens if I exceed my token limit?', a: 'When you reach your monthly token limit, you\'ll be prompted to upgrade to Pro for additional capacity. Your existing data and conversations are preserved — you just won\'t be able to send new queries until the next billing cycle or an upgrade.', category: 'pricing' },
  { q: 'Can I cancel my Pro subscription anytime?', a: 'Yes. You can cancel from your account settings at any time. You\'ll retain Pro access until the end of your current billing period, after which your account reverts to the Free tier.', category: 'pricing' },
  { q: 'Can I use it for commercial properties?', a: 'Currently, Vasthu is optimized for residential investment strategies including Short-Term Rentals (Airbnb), Long-Term Rentals, BRRRR, and Flips. Commercial property support is on our roadmap.', category: 'general' },
  { q: 'How is my data protected?', a: 'All data is encrypted in transit (HTTPS/TLS). We provide granular privacy controls — you can disable chat history, analytics, and opt out of model training. You can export or permanently delete all your data at any time.', category: 'privacy' },
  { q: 'Can I delete my account and data?', a: 'Yes. You can delete your account immediately from Privacy & Security settings. This permanently removes all your data including profile, conversations, reports, usage history, and preferences. The action is irreversible.', category: 'privacy' },
  { q: 'Does Vasthu use my data to train AI models?', a: 'Not by default. You have a "Model Training Opt-Out" toggle in your privacy settings. When enabled, your conversation content is processed ephemerally and discarded after the response is delivered.', category: 'privacy' },
  { q: 'What AI models power Vasthu?', a: 'Vasthu uses frontier AI models including Google Gemini to provide accurate and nuanced analysis. Our system layer ensures all outputs meet our quality and safety standards.', category: 'ai' },
];

const FAQItem: React.FC<{ q: string; a: string }> = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <button onClick={() => setOpen(!open)} className="w-full text-left py-5 group">
      <div className="flex items-start justify-between gap-4">
        <span className="text-[15px] font-medium text-[#1A1A1A] group-hover:text-[#000] leading-snug">{q}</span>
        <ChevronDown className={`w-4 h-4 text-[#ABABAB] flex-shrink-0 mt-1 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </div>
      {open && (
        <p className="text-[14px] text-[#6F6F6F] leading-[1.7] mt-3 pr-8">{a}</p>
      )}
    </button>
  );
};

export const FAQPage: React.FC<FAQPageProps> = ({ onBackToHome }) => {
  const [activeCategory, setActiveCategory] = useState<Category>('all');

  const filteredFaqs = useMemo(
    () => activeCategory === 'all' ? FAQS : FAQS.filter(f => f.category === activeCategory),
    [activeCategory]
  );

  return (
    <div className="min-h-screen bg-white font-sans antialiased selection:bg-[#C08B5C]/20">

      {/* ─── Nav ─── */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-[#EBEBEA]">
        <div className="max-w-[920px] mx-auto px-6 h-[56px] flex items-center justify-between">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={onBackToHome}>
            <Logo variant="dark" showText={false} className="w-7 h-7" />
            <span className="text-[14px] font-semibold text-[#1A1A1A] hidden sm:block">Vasthu</span>
          </div>
          <button
            onClick={onBackToHome}
            className="flex items-center gap-2 text-[13px] text-[#ABABAB] hover:text-[#6F6F6F] transition-colors duration-150"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Home</span>
          </button>
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <section className="pt-20 pb-12 px-6">
        <div className="max-w-[640px] mx-auto text-center">
          <h1 className="text-[clamp(1.75rem,4vw,2.5rem)] font-bold text-[#1A1A1A] tracking-[-0.02em] leading-[1.15] mb-4">
            Frequently asked questions
          </h1>
          <p className="text-[16px] text-[#6F6F6F] leading-relaxed max-w-[460px] mx-auto">
            Everything you need to know about Vasthu, pricing, privacy, and the AI behind the platform.
          </p>
        </div>
      </section>

      {/* ─── Category Tabs ─── */}
      <section className="px-6 pb-2">
        <div className="max-w-[640px] mx-auto flex flex-wrap gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`px-4 py-[6px] rounded-full text-[13px] font-medium transition-colors duration-150 ${
                activeCategory === cat.key
                  ? 'bg-[#1A1A1A] text-white'
                  : 'bg-[#FAFAF9] text-[#6F6F6F] hover:bg-[#F0F0EF] border border-[#EBEBEA]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* ─── FAQ List ─── */}
      <section className="px-6 pt-6 pb-20">
        <div className="max-w-[640px] mx-auto divide-y divide-[#EBEBEA]">
          {filteredFaqs.map(f => <FAQItem key={f.q} q={f.q} a={f.a} />)}
          {filteredFaqs.length === 0 && (
            <p className="py-12 text-center text-[14px] text-[#ABABAB]">No questions in this category yet.</p>
          )}
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-[#EBEBEA] py-8 px-6">
        <div className="max-w-[920px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-[12px] text-[#ABABAB]">&copy; {new Date().getFullYear()} Civitas AI. All rights reserved.</span>
          <div className="flex items-center gap-6 text-[12px] text-[#ABABAB]">
            <a href="/privacy-policy" className="hover:text-[#6F6F6F] transition-colors duration-150">Privacy</a>
            <a href="/terms-of-service" className="hover:text-[#6F6F6F] transition-colors duration-150">Terms</a>
            <a href="/cookie-policy" className="hover:text-[#6F6F6F] transition-colors duration-150">Cookies</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
