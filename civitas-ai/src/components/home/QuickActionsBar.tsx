import React from 'react';
import { Search, BarChart3, Globe, FileText, TrendingUp, ArrowUpRight } from 'lucide-react';

interface PromptCard {
  icon: React.FC<{ className?: string }>;
  title: string;
  description: string;
  query: string;
}

const DEFAULT_PROMPTS: PromptCard[] = [
  {
    icon: Search,
    title: 'Find STR deals',
    description: 'Search for short-term rental deals under $500K in Austin',
    query: 'Find STR deals in Austin under $500K',
  },
  {
    icon: BarChart3,
    title: 'Analyze a property',
    description: 'Run a full investment analysis on any address',
    query: 'Analyze a property as an investment',
  },
  {
    icon: Globe,
    title: 'Compare markets',
    description: 'Side-by-side comparison of two real estate markets',
    query: 'Compare Austin vs Tampa real estate markets',
  },
  {
    icon: FileText,
    title: 'Market report',
    description: 'Generate a detailed market intelligence report',
    query: 'Generate a market report for Austin TX',
  },
];

const PORTFOLIO_PROMPTS: PromptCard[] = [
  {
    icon: TrendingUp,
    title: 'Portfolio performance',
    description: 'Review how your portfolio is performing this quarter',
    query: 'How is my portfolio performing?',
  },
  {
    icon: ArrowUpRight,
    title: 'Optimize holdings',
    description: 'Identify which property to sell or refinance first',
    query: 'Which property should I sell first?',
  },
  {
    icon: Search,
    title: 'Similar deals',
    description: 'Find new deals similar to your best performer',
    query: 'Find deals similar to my best performing property',
  },
  {
    icon: FileText,
    title: 'Portfolio report',
    description: 'Generate a comprehensive portfolio summary report',
    query: 'Generate a portfolio report',
  },
];

interface SuggestedPromptsProps {
  onSendPrompt: (query: string) => void;
  hasPortfolio?: boolean;
}

export const SuggestedPrompts: React.FC<SuggestedPromptsProps> = ({
  onSendPrompt,
  hasPortfolio,
}) => {
  const prompts = hasPortfolio ? PORTFOLIO_PROMPTS : DEFAULT_PROMPTS;

  return (
    <div className="grid grid-cols-2 gap-4">
      {prompts.map((card) => (
        <button
          key={card.title}
          onClick={() => onSendPrompt(card.query)}
          className="group relative flex items-start gap-4 rounded-xl p-6 min-h-[100px] text-left overflow-hidden
            bg-card border border-black/[0.06]
            shadow-[0_2px_8px_rgba(0,0,0,0.4)]
            hover:bg-surface hover:shadow-[0_4px_20px_rgba(192,139,92,0.06),0_4px_16px_rgba(0,0,0,0.5)] hover:border-black/[0.07]
            hover:-translate-y-px transition-all duration-150"
        >
          <div
            className="absolute left-0 top-2 bottom-2 w-[2px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-150"
            style={{ background: 'linear-gradient(180deg, #C08B5C, transparent)' }}
          />

          <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-[#C08B5C]/[0.08] flex items-center justify-center">
            <card.icon className="w-[18px] h-[18px] text-muted-foreground/50 group-hover:text-[#C08B5C]/80 transition-colors duration-150" />
          </div>

          <div className="min-w-0">
            <span className="block text-[15px] font-medium text-foreground/85 group-hover:text-foreground/95 leading-snug">
              {card.title}
            </span>
            <span className="block text-[13px] text-muted-foreground/50 leading-relaxed mt-1">
              {card.description}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
};

export { SuggestedPrompts as QuickActionsBar };
