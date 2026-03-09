import React, { useState } from 'react';
import { ExternalLink, ChevronDown, ChevronUp, Clock } from 'lucide-react';

interface Reading {
  title: string;
  summary: string;
  url: string;
  source: string;
  readTime: string;
  category: 'strategy' | 'market' | 'beginner';
}

const READINGS: Reading[] = [
  {
    title: '5 Ways to Improve Cash Flow on Rental Properties',
    summary: 'Practical tactics from expense reduction to rent optimization that directly impact your monthly returns.',
    url: 'https://www.biggerpockets.com/blog/increase-rental-property-cash-flow',
    source: 'BiggerPockets',
    readTime: '7 min',
    category: 'strategy',
  },
  {
    title: 'When to Sell vs. Refinance an Investment Property',
    summary: 'A decision framework for evaluating whether to exit, refi, or 1031 exchange based on market conditions.',
    url: 'https://www.investopedia.com/articles/personal-finance/111214/top-10-features-profitable-rental-property.asp',
    source: 'Investopedia',
    readTime: '9 min',
    category: 'strategy',
  },
  {
    title: 'Portfolio Diversification for Real Estate Investors',
    summary: 'Why geographic and asset-class diversification reduces risk and how to structure a balanced RE portfolio.',
    url: 'https://www.investopedia.com/terms/d/diversification.asp',
    source: 'Investopedia',
    readTime: '6 min',
    category: 'strategy',
  },
  {
    title: '2026 Housing Market Outlook: What Investors Should Know',
    summary: 'Key macro trends, rate forecasts, and inventory projections shaping investment decisions this year.',
    url: 'https://www.freddiemac.com/research/forecast',
    source: 'Freddie Mac',
    readTime: '10 min',
    category: 'market',
  },
  {
    title: 'Emerging Markets to Watch for RE Investment',
    summary: 'Data-driven analysis of secondary cities with strong population growth and rental yield potential.',
    url: 'https://www.redfin.com/news/housing-market-predictions/',
    source: 'Redfin',
    readTime: '8 min',
    category: 'market',
  },
  {
    title: 'How Interest Rates Impact Property Values',
    summary: 'Understanding the cap rate / interest rate relationship and its effect on your portfolio valuation.',
    url: 'https://www.investopedia.com/articles/mortgages-real-estate/08/interest-rate-affect-housing.asp',
    source: 'Investopedia',
    readTime: '5 min',
    category: 'market',
  },
  {
    title: 'Real Estate Investing for Beginners: The Complete Guide',
    summary: 'Everything you need to know to get started with your first rental property investment.',
    url: 'https://www.biggerpockets.com/guides/intro-to-real-estate-investing',
    source: 'BiggerPockets',
    readTime: '15 min',
    category: 'beginner',
  },
  {
    title: 'Understanding Cap Rate, CoC Return, and NOI',
    summary: 'The three financial metrics every investor must know before analyzing any deal.',
    url: 'https://www.investopedia.com/terms/c/capitalizationrate.asp',
    source: 'Investopedia',
    readTime: '6 min',
    category: 'beginner',
  },
  {
    title: 'Global Housing Trends and Economic Outlook',
    summary: 'World Bank data on housing affordability, urbanization, and cross-border investment flows.',
    url: 'https://www.worldbank.org/en/topic/urbandevelopment/overview',
    source: 'World Bank',
    readTime: '12 min',
    category: 'beginner',
  },
];

const CATEGORY_LABELS: Record<string, string> = {
  strategy: 'Portfolio Strategy',
  market: 'Market Analysis',
  beginner: 'Beginner Guides',
};

const CATEGORY_ACCENT: Record<string, string> = {
  strategy: 'bg-[#C08B5C]',
  market: 'bg-sky-500',
  beginner: 'bg-emerald-500',
};

const CATEGORY_ORDER: Reading['category'][] = ['strategy', 'market', 'beginner'];
const MAX_PER_CATEGORY = 2;

export const InvestorReadings: React.FC = () => {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded
    ? READINGS
    : CATEGORY_ORDER.flatMap(cat =>
        READINGS.filter(r => r.category === cat).slice(0, MAX_PER_CATEGORY)
      );

  const grouped = CATEGORY_ORDER.map(cat => ({
    category: cat,
    label: CATEGORY_LABELS[cat],
    accent: CATEGORY_ACCENT[cat],
    items: visible.filter(r => r.category === cat),
  })).filter(g => g.items.length > 0);

  return (
    <div>
      {grouped.map((group) => (
        <div key={group.category} className="mb-6 last:mb-0">
          <h3 className="text-[11px] uppercase tracking-wider text-muted-foreground/50 font-medium mb-3">
            {group.label}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {group.items.map((reading) => (
              <a
                key={reading.url}
                href={reading.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex flex-col rounded-lg bg-card border border-black/[0.04] p-4
                  hover:bg-surface hover:border-black/[0.06] transition-colors duration-100 overflow-hidden"
              >
                {/* Category left accent */}
                <div className={`absolute left-0 top-3 bottom-3 w-[2px] rounded-full ${group.accent} opacity-40`} />

                <div className="pl-2.5">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[13px] font-medium text-foreground/75 group-hover:text-foreground leading-snug line-clamp-1 flex-1">
                      {reading.title}
                    </span>
                    <ExternalLink className="w-3 h-3 text-foreground/0 group-hover:text-[#C08B5C] flex-shrink-0 transition-colors duration-150" />
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-1 mb-2.5">
                    {reading.summary}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/[0.05] text-muted-foreground/60">
                      {reading.source}
                    </span>
                    <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground/40">
                      <Clock className="w-3 h-3" />
                      {reading.readTime}
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      ))}

      {(expanded || READINGS.length > visible.length) && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-[12px] text-muted-foreground/50 hover:text-[#C08B5C] mt-3 transition-colors"
        >
          {expanded ? (
            <>Show less <ChevronUp className="w-3.5 h-3.5" /></>
          ) : (
            <>See all {READINGS.length} readings <ChevronDown className="w-3.5 h-3.5" /></>
          )}
        </button>
      )}
    </div>
  );
};

export { InvestorReadings as HomeGuideRail };
