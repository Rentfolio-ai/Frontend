import React, { useMemo, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';

interface GuideItem {
  id: string;
  title: string;
  tag: string;
  readMins: number;
  url: string;
}

interface MarketReadItem {
  id: string;
  title: string;
  category: string;
  source: string;
  url: string;
}

const LAST_GUIDE_KEY = 'home_last_opened_guide';

const INTRO_GUIDES: GuideItem[] = [
  {
    id: 'guide-beginner-basics',
    title: 'Real estate investing fundamentals',
    tag: 'Beginner',
    readMins: 8,
    url: 'https://www.investopedia.com/articles/mortgages-real-estate/08/buy-rental-property.asp',
  },
  {
    id: 'guide-emerging-markets',
    title: 'Emerging markets playbook',
    tag: 'Markets',
    readMins: 7,
    url: 'https://www.worldbank.org/en/publication/global-economic-prospects',
  },
  {
    id: 'guide-risk-basics',
    title: 'Risk management for investors',
    tag: 'Risk',
    readMins: 6,
    url: 'https://www.freddiemac.com/research',
  },
  {
    id: 'guide-due-diligence',
    title: 'Due diligence before close',
    tag: 'Checklist',
    readMins: 5,
    url: 'https://www.biggerpockets.com/blog/real-estate-due-diligence-checklist',
  },
];

const DAILY_MARKET_READS: MarketReadItem[] = [
  {
    id: 'read-redfin-trends',
    title: 'Housing demand trends',
    category: 'Demand',
    source: 'Redfin',
    url: 'https://www.redfin.com/news/data-center/',
  },
  {
    id: 'read-freddie-insights',
    title: 'Mortgage rates outlook',
    category: 'Rates',
    source: 'Freddie Mac',
    url: 'https://www.freddiemac.com/pmms',
  },
];

function openExternal(url: string) {
  if (typeof window === 'undefined') return;
  window.open(url, '_blank', 'noopener,noreferrer');
}

export const HomeGuideRail: React.FC = () => {
  const [lastGuideId, setLastGuideId] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      return window.localStorage.getItem(LAST_GUIDE_KEY);
    } catch {
      return null;
    }
  });

  const continueGuide = useMemo(
    () => INTRO_GUIDES.find((g) => g.id === lastGuideId) || null,
    [lastGuideId],
  );

  const onOpenGuide = (guide: GuideItem) => {
    setLastGuideId(guide.id);
    try {
      window.localStorage.setItem(LAST_GUIDE_KEY, guide.id);
    } catch { /* ignore */ }
    openExternal(guide.url);
  };

  return (
    <div className="space-y-6">
      {/* Learn */}
      <div>
        <h2 className="text-[14px] font-medium text-white/50 mb-3">Learn</h2>

        {continueGuide && (
          <button
            onClick={() => onOpenGuide(continueGuide)}
            className="w-full text-left mb-3 px-3 py-2 rounded-md bg-[#C08B5C]/10 hover:bg-[#C08B5C]/16"
          >
            <span className="text-[10px] uppercase tracking-widest text-[#D4A27F]">
              Continue learning
            </span>
            <span className="block text-[13px] text-white/85 mt-0.5">
              {continueGuide.title}
            </span>
          </button>
        )}

        <div className="space-y-0">
          {INTRO_GUIDES.map((guide) => (
            <button
              key={guide.id}
              onClick={() => onOpenGuide(guide)}
              className="w-full text-left flex items-center justify-between gap-4 py-2 hover:bg-white/[0.02] rounded-md px-1 -mx-1 group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-[11px] font-medium text-white/30 w-16 flex-shrink-0">
                  {guide.tag}
                </span>
                <span className="text-[13px] text-white/70 truncate">
                  {guide.title}
                </span>
              </div>
              <span className="text-[11px] text-white/25 flex-shrink-0">
                {guide.readMins} min
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Market reads */}
      <div>
        <h3 className="text-[13px] font-medium text-white/40 mb-3">Market reads</h3>
        <div className="space-y-0">
          {DAILY_MARKET_READS.map((read) => (
            <button
              key={read.id}
              onClick={() => openExternal(read.url)}
              className="w-full text-left flex items-center justify-between gap-4 py-2 hover:bg-white/[0.02] rounded-md px-1 -mx-1 group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-[11px] font-medium text-white/30 w-16 flex-shrink-0">
                  {read.category}
                </span>
                <span className="text-[13px] text-white/70 truncate">
                  {read.title}
                </span>
              </div>
              <span className="text-[11px] text-white/25 flex-shrink-0">
                {read.source}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
