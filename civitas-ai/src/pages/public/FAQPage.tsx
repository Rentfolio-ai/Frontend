import React from 'react';
import { ArrowLeft, Plus, Minus } from 'lucide-react';
import { Logo } from '../../components/ui/Logo';

interface FAQPageProps {
  onBackToHome: () => void;
}

const faqs = [
  {
    question: "What makes Vasthu different from other real estate tools?",
    answer: "Vasthu uses advanced AI agents to not just search for properties, but to deeply analyze them. We provide instant valuation, operating expense breakdowns, and comprehensive investment reports that you'd typically pay an analyst thousands for."
  },
  {
    question: "How accurate are the valuation estimates?",
    answer: "Our AI aggregates data from multiple high-confidence sources including sold comparables, current rental listings, and local market trends. While no automated model is 100% perfect, our users find our Cap Rate and Cash-on-Cash ROI estimates to be highly reliable starting points for due diligence."
  },
  {
    question: "Can I use Vasthu for commercial properties?",
    answer: "Currently, Vasthu is optimized for residential investment strategies including Short-Term Rentals (Airbnb), Long-Term Rentals, BRRRR, and Flips. Commercial property support is on our roadmap."
  },
  {
    question: "Is there a free trial?",
    answer: "Yes! You can search for properties and view basic data for free. Deep valuation reports and advanced export features are available with our premium plans, but you get 3 free detailed reports when you sign up."
  },
  {
    question: "Where does the data come from?",
    answer: "We source our data from a blend of public records, active MLS listings, rental platforms (like Airbnb and VRBO for STR data), and proprietary market intelligence feeds."
  }
];

const FAQItem = ({ question, answer }: { question: string, answer: string }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="border-b border-slate-200 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-6 flex items-center justify-between text-left group"
      >
        <span className="text-lg font-medium text-slate-900 group-hover:text-[#A8734A] transition-colors">
          {question}
        </span>
        <span className={`ml-6 flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
          {isOpen ? <Minus className="w-5 h-5 text-[#A8734A]" /> : <Plus className="w-5 h-5 text-slate-400" />}
        </span>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100 mb-6' : 'max-h-0 opacity-0'}`}
      >
        <p className="text-slate-600 leading-relaxed pr-12">
          {answer}
        </p>
      </div>
    </div>
  );
};

export const FAQPage: React.FC<FAQPageProps> = ({ onBackToHome }) => {
  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans selection:bg-[#C08B5C]/20 selection:text-[#8A5D3B]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#FDFBF7]/80 backdrop-blur-md border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={onBackToHome}
          >
            <Logo />
          </div>

          <button
            onClick={onBackToHome}
            className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-[#A8734A] transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </button>
        </div>
      </nav>

      {/* Content */}
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-6">
              Frequently Asked Questions
            </h1>
            <p className="text-lg text-slate-600 max-w-xl mx-auto">
              Everything you need to know about Vasthu's data, billing, and capabilities.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100">
            {faqs.map((faq, index) => (
              <FAQItem key={index} {...faq} />
            ))}
          </div>

          <div className="mt-16 text-center">
            <p className="text-slate-600 mb-6">Still have questions?</p>
            <a
              href="mailto:support@vasthu.ai"
              className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-slate-900 text-white font-medium hover:bg-slate-800 transition-colors"
            >
              Contact Support
            </a>
          </div>
        </div>
      </main>
    </div>
  );
};
