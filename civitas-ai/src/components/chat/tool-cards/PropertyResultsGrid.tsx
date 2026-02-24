/**
 * PropertyResultsGrid – Tiered property results with Top Picks + More Matches.
 *
 * Sections:
 *  1. Results header (market stats bar)
 *  2. Top Picks – 2-column hero grid, always visible, no filters
 *  3. Divider – "More Matches" header
 *  4. Quick filter presets
 *  5. Filter/sort toolbar (beds, baths, type, search, sort)
 *  6. Expandable advanced filters (price, cap rate, cash flow, CoC ROI, sqft sliders)
 *  7. More Matches – responsive 2-column grid with page-based pagination
 *  8. Pagination bar
 *  9. Comparison dock
 */

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, ChevronDown, ChevronLeft, ChevronRight, X, ArrowUpDown,
  Sparkles, SlidersHorizontal, DollarSign, TrendingUp, Home, Clock,
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { PropertyGridCard, type PropertyCardData } from './PropertyGridCard';
import type { ScoutedProperty } from '../../../types/backendTools';
import type { BookmarkedProperty } from '../../../types/bookmarks';

/* ── Props ─────────────────────────────────────────────────────────── */

interface PropertyResultsGridProps {
  topPicks?: PropertyCardData[];
  moreMatches?: PropertyCardData[];
  properties?: PropertyCardData[];
  totalFound?: number;
  marketContext?: {
    location?: string;
    zip_code?: string;
    total_analyzed?: number;
    sale_stats?: {
      median_price?: number;
      avg_price_per_sqft?: number;
      avg_days_on_market?: number;
      listings_count?: number;
    };
    rental_stats?: {
      avg_rent?: number;
      avg_rent_per_sqft?: number;
      listings_count?: number;
    };
    summary?: string;
  };
  onAction?: (query: string) => void;
  bookmarks?: BookmarkedProperty[];
  onToggleBookmark?: (property: ScoutedProperty) => void;
  hoveredPropertyId?: string | null;
  onHoverProperty?: (id: string | null) => void;
}

/* ── Filter Config ─────────────────────────────────────────────────── */

const BED_OPTIONS = ['Any', '1+', '2+', '3+', '4+', '5+'] as const;
const BATH_OPTIONS = ['Any', '1+', '2+', '3+'] as const;
const TYPE_OPTIONS = ['All', 'SFH', 'Condo', 'Townhouse', 'Multi-Family'] as const;
const CASH_FLOW_OPTIONS = ['Any', 'Positive', '$500+', '$1000+'] as const;
type SortKey = 'price' | 'price_desc' | 'cap_rate' | 'cash_flow' | 'ai_score' | 'newest';
const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'ai_score', label: 'AI Score' },
  { key: 'price', label: 'Price: Low' },
  { key: 'price_desc', label: 'Price: High' },
  { key: 'cap_rate', label: 'Cap Rate' },
  { key: 'cash_flow', label: 'Cash Flow' },
  { key: 'newest', label: 'Newest' },
];

const PAGE_SIZE = 12;

/* ── Helpers ───────────────────────────────────────────────────────── */

const fmtCurrency = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);

const fmtCompact = (n: number) => {
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `$${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `$${Math.round(abs / 1_000)}K`;
  return `$${abs}`;
};

const getPrice = (p: PropertyCardData) => p.price || 0;
const getBeds = (p: PropertyCardData) => p.bedrooms ?? p.beds ?? 0;
const getBaths = (p: PropertyCardData) => p.bathrooms ?? p.baths ?? 0;
const getSqft = (p: PropertyCardData) => p.sqft || p.squareFootage || 0;
const getType = (p: PropertyCardData) => p.property_type || '';
const getCapRate = (p: PropertyCardData) => p.calculated_metrics?.cap_rate ?? p.analysis?.cap_rate ?? p.analysis?.gross_yield ?? 0;
const getCashFlow = (p: PropertyCardData) => p.financial_snapshot?.estimated_monthly_cash_flow ?? p.calculated_metrics?.monthly_cash_flow ?? 0;
const getCocRoi = (p: PropertyCardData) => p.calculated_metrics?.cash_on_cash_roi ?? p.cash_on_cash_roi ?? 0;
const getAiScore = (p: PropertyCardData) => p.ai_score ?? p.ai_match_score ?? p.value_score ?? 0;
const getId = (p: PropertyCardData) => p.listing_id || p.id || p.property_id || p.address;
const getAddress = (p: PropertyCardData) => p.address || p.formattedAddress || '';
const getDom = (p: PropertyCardData) => p.days_on_market ?? 999;

/* ── Dual-Thumb Range Slider ─────────────────────────────────────── */

const sliderThumbCls = `
  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:pointer-events-auto
  [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full
  [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-grab
  [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#C08B5C]/50
  [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:rounded-full
  [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-grab
  [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#C08B5C]/50
`.trim();

const RangeSlider: React.FC<{
  min: number;
  max: number;
  step: number;
  value: [number, number];
  onChange: (val: [number, number]) => void;
  formatLabel?: (n: number) => string;
  label: string;
}> = ({ min, max, step, value, onChange, formatLabel = String, label }) => {
  const [low, high] = value;
  const range = max - min || 1;
  const leftPct = ((low - min) / range) * 100;
  const widthPct = ((high - low) / range) * 100;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[9px] text-white/20 uppercase tracking-wider font-semibold">{label}</span>
        <span className="text-[10px] text-white/45 font-mono">
          {formatLabel(low)} – {formatLabel(high)}
        </span>
      </div>
      <div className="relative h-5 flex items-center">
        <div className="absolute inset-x-0 h-[3px] rounded-full bg-white/[0.06]" />
        <div
          className="absolute h-[3px] rounded-full bg-gradient-to-r from-[#C08B5C]/60 to-[#D4A27F]/60"
          style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
        />
        <input
          type="range"
          min={min} max={max} step={step} value={low}
          onChange={(e) => { const v = Number(e.target.value); if (v <= high) onChange([v, high]); }}
          className={cn('absolute inset-0 w-full appearance-none bg-transparent pointer-events-none', sliderThumbCls)}
          style={{ zIndex: high >= max ? 5 : 2 }}
        />
        <input
          type="range"
          min={min} max={max} step={step} value={high}
          onChange={(e) => { const v = Number(e.target.value); if (v >= low) onChange([low, v]); }}
          className={cn('absolute inset-0 w-full appearance-none bg-transparent pointer-events-none', sliderThumbCls)}
          style={{ zIndex: 3 }}
        />
      </div>
    </div>
  );
};

/* ── Single-Value Slider ─────────────────────────────────────────── */

const SingleSlider: React.FC<{
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (val: number) => void;
  formatLabel?: (n: number) => string;
  label: string;
}> = ({ min, max, step, value, onChange, formatLabel = String, label }) => {
  const range = max - min || 1;
  const fillPct = ((value - min) / range) * 100;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[9px] text-white/20 uppercase tracking-wider font-semibold">{label}</span>
        <span className="text-[10px] text-white/45 font-mono">{formatLabel(value)}</span>
      </div>
      <div className="relative h-5 flex items-center">
        <div className="absolute inset-x-0 h-[3px] rounded-full bg-white/[0.06]" />
        <div
          className="absolute h-[3px] rounded-full bg-gradient-to-r from-[#C08B5C]/60 to-[#D4A27F]/60"
          style={{ width: `${fillPct}%` }}
        />
        <input
          type="range"
          min={min} max={max} step={step} value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className={cn('absolute inset-0 w-full appearance-none bg-transparent cursor-grab', sliderThumbCls)}
        />
      </div>
    </div>
  );
};

/* ── Market Stats Bar ──────────────────────────────────────────────── */

const MarketStatsBar: React.FC<{ topPicks: PropertyCardData[]; moreMatches: PropertyCardData[]; totalFound: number; marketContext?: PropertyResultsGridProps['marketContext'] }> = ({
  topPicks, moreMatches, totalFound, marketContext,
}) => {
  const allProperties = [...topPicks, ...moreMatches];
  const displayed = allProperties.length;
  const location = marketContext?.location || '';

  const medianPrice = useMemo(() => {
    if (marketContext?.sale_stats?.median_price) return marketContext.sale_stats.median_price;
    if (allProperties.length === 0) return 0;
    const sorted = [...allProperties].sort((a, b) => getPrice(a) - getPrice(b));
    return getPrice(sorted[Math.floor(sorted.length / 2)]);
  }, [allProperties, marketContext]);

  const avgCap = useMemo(() => {
    const caps = allProperties.map(getCapRate).filter(c => c > 0);
    return caps.length > 0 ? caps.reduce((s, c) => s + c, 0) / caps.length : 0;
  }, [allProperties]);

  return (
    <div className="mb-5 px-4 py-3 rounded-xl bg-[#1A1920]/50 border border-white/[0.06]">
      <h2 className="text-[18px] font-bold text-white/90 mb-1.5">
        {displayed} investment properties{location ? ` in ${location}` : ''}
      </h2>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-white/40 font-mono">
        <span>AI analyzed <span className="text-white/55 font-semibold">{totalFound}</span> properties</span>
        <span className="text-white/10">·</span>
        <span>Median <span className="text-white/55 font-semibold">{fmtCurrency(medianPrice)}</span></span>
        {avgCap > 0 && (
          <>
            <span className="text-white/10">·</span>
            <span>Avg Cap <span className="text-white/55 font-semibold">{avgCap.toFixed(1)}%</span></span>
          </>
        )}
      </div>
    </div>
  );
};

/* ── Filter Pill ───────────────────────────────────────────────────── */

const Pill: React.FC<{ label: string; active: boolean; onClick: () => void }> = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={cn(
      'px-2.5 py-1 rounded-md text-[10px] font-medium transition-all',
      active
        ? 'bg-white/[0.08] text-white/70 border border-white/[0.08]'
        : 'text-white/25 hover:text-white/40 hover:bg-white/[0.03] border border-transparent'
    )}
  >
    {label}
  </button>
);

/* ── Sort Dropdown ─────────────────────────────────────────────────── */

const SortDropdown: React.FC<{ value: SortKey; onChange: (key: SortKey) => void }> = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const currentLabel = SORT_OPTIONS.find(s => s.key === value)?.label || 'AI Score';

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 py-1 px-2.5 rounded-md bg-white/[0.03] border border-white/[0.06] text-[10px] text-white/40 hover:text-white/60 transition-colors"
      >
        <ArrowUpDown className="w-3 h-3" />
        {currentLabel}
        <ChevronDown className={cn('w-3 h-3 transition-transform', open && 'rotate-180')} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full right-0 mt-1 z-20 py-1 rounded-lg bg-[#1C1B21] border border-white/[0.08] shadow-xl min-w-[130px] backdrop-blur-xl"
          >
            {SORT_OPTIONS.map(s => (
              <button
                key={s.key}
                onClick={() => { onChange(s.key); setOpen(false); }}
                className={cn(
                  'w-full text-left px-3 py-1.5 text-[10px] font-medium transition-colors',
                  value === s.key ? 'text-[#D4A27F] bg-white/[0.04]' : 'text-white/40 hover:text-white/60 hover:bg-white/[0.03]'
                )}
              >
                {s.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ── Pagination Bar ───────────────────────────────────────────────── */

const PaginationBar: React.FC<{
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}> = ({ currentPage, totalPages, totalItems, pageSize, onPageChange }) => {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const getPageNumbers = (): (number | '...')[] => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (currentPage <= 4) return [1, 2, 3, 4, 5, '...', totalPages];
    if (currentPage >= totalPages - 3) return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  };

  return (
    <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/[0.04]">
      <span className="text-[10px] text-white/25 font-mono">
        {startItem}–{endItem} of {totalItems}
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={cn(
            'p-1.5 rounded-md transition-colors',
            currentPage === 1
              ? 'text-white/10 cursor-not-allowed'
              : 'text-white/30 hover:text-white/50 hover:bg-white/[0.04]'
          )}
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
        {getPageNumbers().map((page, i) =>
          page === '...' ? (
            <span key={`ellipsis-${i}`} className="px-1 text-[10px] text-white/15">...</span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page as number)}
              className={cn(
                'w-7 h-7 rounded-md text-[10px] font-medium transition-all',
                page === currentPage
                  ? 'bg-[#C08B5C]/15 text-[#D4A27F] border border-[#C08B5C]/20'
                  : 'text-white/30 hover:text-white/50 hover:bg-white/[0.04]'
              )}
            >
              {page}
            </button>
          )
        )}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={cn(
            'p-1.5 rounded-md transition-colors',
            currentPage === totalPages
              ? 'text-white/10 cursor-not-allowed'
              : 'text-white/30 hover:text-white/50 hover:bg-white/[0.04]'
          )}
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

/* ── Comparison Dock ───────────────────────────────────────────────── */

const ComparisonDock: React.FC<{
  selectedProperties: PropertyCardData[];
  onRemove: (id: string) => void;
  onClear: () => void;
  onCompare: () => void;
}> = ({ selectedProperties, onRemove, onClear, onCompare }) => (
  <motion.div
    initial={{ y: 20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    exit={{ y: 20, opacity: 0 }}
    className="flex items-center gap-2.5 p-3 rounded-lg bg-white/[0.04] border border-white/[0.08] mt-4"
  >
    <span className="text-[10px] text-white/25 uppercase tracking-wider font-semibold flex-shrink-0">
      Compare ({selectedProperties.length})
    </span>
    <div className="flex-1 flex items-center gap-1.5 overflow-x-auto">
      {selectedProperties.map(p => (
        <div key={getId(p)} className="flex items-center gap-1 px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.05] flex-shrink-0">
          <span className="text-[10px] text-white/45 truncate max-w-[100px]">{getAddress(p)}</span>
          <button onClick={() => onRemove(getId(p))} className="text-white/15 hover:text-white/40">
            <X className="w-2.5 h-2.5" />
          </button>
        </div>
      ))}
    </div>
    <button onClick={onClear} className="px-2 py-1 rounded text-[9px] text-white/20 hover:text-white/40 hover:bg-white/[0.03] font-semibold transition-all">
      Clear
    </button>
    <button
      onClick={onCompare}
      className="px-3 py-1.5 rounded-lg bg-[#C08B5C]/15 hover:bg-[#C08B5C]/25 text-[10px] text-[#D4A27F] font-semibold transition-colors border border-[#C08B5C]/20"
    >
      Compare
    </button>
  </motion.div>
);

/* ── Main Component ────────────────────────────────────────────────── */

export const PropertyResultsGrid: React.FC<PropertyResultsGridProps> = ({
  topPicks: topPicksProp,
  moreMatches: moreMatchesProp,
  properties: propertiesProp,
  totalFound: totalFoundProp,
  marketContext,
  onAction,
  bookmarks,
  onToggleBookmark,
  hoveredPropertyId,
  onHoverProperty,
}) => {
  /* ── Derive tiers ── */
  const topPicks = useMemo(() => {
    if (topPicksProp && topPicksProp.length > 0) return topPicksProp;
    if (propertiesProp) {
      return propertiesProp.filter(p => p.tier === 'top').length > 0
        ? propertiesProp.filter(p => p.tier === 'top')
        : propertiesProp.slice(0, Math.min(10, propertiesProp.length));
    }
    return [];
  }, [topPicksProp, propertiesProp]);

  const moreMatches = useMemo(() => {
    if (moreMatchesProp && moreMatchesProp.length > 0) return moreMatchesProp;
    if (propertiesProp) {
      return propertiesProp.filter(p => p.tier === 'standard').length > 0
        ? propertiesProp.filter(p => p.tier === 'standard')
        : propertiesProp.slice(10);
    }
    return [];
  }, [moreMatchesProp, propertiesProp]);

  const totalFound = totalFoundProp || (topPicks.length + moreMatches.length);
  const allProperties = [...topPicks, ...moreMatches];

  /* ── Compute slider bounds from data ── */
  const priceBounds = useMemo((): [number, number] => {
    const prices = moreMatches.map(getPrice).filter(p => p > 0);
    if (prices.length === 0) return [0, 1_000_000];
    const step = 10_000;
    return [Math.floor(Math.min(...prices) / step) * step, Math.ceil(Math.max(...prices) / step) * step];
  }, [moreMatches]);

  const capRateBounds = useMemo((): [number, number] => {
    const rates = moreMatches.map(getCapRate).filter(r => r > 0);
    if (rates.length === 0) return [0, 15];
    return [0, Math.ceil(Math.max(...rates) * 2) / 2]; // round up to nearest 0.5
  }, [moreMatches]);

  const sqftBounds = useMemo((): [number, number] => {
    const sqfts = moreMatches.map(getSqft).filter(s => s > 0);
    if (sqfts.length === 0) return [0, 5000];
    const step = 100;
    return [Math.floor(Math.min(...sqfts) / step) * step, Math.ceil(Math.max(...sqfts) / step) * step];
  }, [moreMatches]);

  /* ── Filter & pagination state ── */
  const [bedFilter, setBedFilter] = useState<string>('Any');
  const [bathFilter, setBathFilter] = useState<string>('Any');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<SortKey>('ai_score');
  const [searchText, setSearchText] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [cashFlowFilter, setCashFlowFilter] = useState<string>('Any');
  const [cocRoiMin, setCocRoiMin] = useState(0);
  const [priceRange, setPriceRange] = useState<[number, number]>(priceBounds);
  const [capRateRange, setCapRateRange] = useState<[number, number]>(capRateBounds);
  const [sqftRange, setSqftRange] = useState<[number, number]>(sqftBounds);
  const [currentPage, setCurrentPage] = useState(1);
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [compareIds, setCompareIds] = useState<Set<string>>(new Set());

  const moreMatchesRef = useRef<HTMLDivElement>(null);

  /* ── Sync ranges when data changes (new search) ── */
  useEffect(() => {
    setPriceRange(priceBounds);
    setCapRateRange(capRateBounds);
    setSqftRange(sqftBounds);
    setCocRoiMin(0);
    setCashFlowFilter('Any');
    setCurrentPage(1);
  }, [priceBounds, capRateBounds, sqftBounds]);

  /* ── Reset page on any filter change ── */
  useEffect(() => {
    setCurrentPage(1);
  }, [searchText, priceRange, bedFilter, bathFilter, typeFilter, capRateRange, cashFlowFilter, cocRoiMin, sqftRange, sortBy]);

  /* ── Bookmarked IDs ── */
  const bookmarkedIds = useMemo(() => {
    if (!bookmarks) return new Set<string>();
    return new Set(bookmarks.map(b => b.property.listing_id || b.id));
  }, [bookmarks]);

  if (allProperties.length === 0) return null;

  /* ── Filter More Matches ── */
  const filteredMore = useMemo(() => {
    let result = [...moreMatches];

    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      result = result.filter(p => {
        const addr = getAddress(p).toLowerCase();
        const city = (p.city || '').toLowerCase();
        return addr.includes(q) || city.includes(q) || (p.zip_code || '').includes(q);
      });
    }

    if (priceRange[0] > priceBounds[0] || priceRange[1] < priceBounds[1]) {
      result = result.filter(p => {
        const price = getPrice(p);
        return price >= priceRange[0] && price <= priceRange[1];
      });
    }

    if (bedFilter !== 'Any') {
      const min = parseInt(bedFilter);
      result = result.filter(p => getBeds(p) >= min);
    }

    if (bathFilter !== 'Any') {
      const min = parseInt(bathFilter);
      result = result.filter(p => getBaths(p) >= min);
    }

    if (typeFilter !== 'All') {
      const typeMap: Record<string, string> = {
        SFH: 'single_family', Condo: 'condo', Townhouse: 'townhouse', 'Multi-Family': 'multi_family',
      };
      const target = typeMap[typeFilter];
      if (target) result = result.filter(p => getType(p) === target);
    }

    if (capRateRange[0] > capRateBounds[0] || capRateRange[1] < capRateBounds[1]) {
      result = result.filter(p => {
        const rate = getCapRate(p);
        return rate >= capRateRange[0] && rate <= capRateRange[1];
      });
    }

    if (cashFlowFilter !== 'Any') {
      result = result.filter(p => {
        const cf = getCashFlow(p);
        switch (cashFlowFilter) {
          case 'Positive': return cf > 0;
          case '$500+': return cf >= 500;
          case '$1000+': return cf >= 1000;
          default: return true;
        }
      });
    }

    if (cocRoiMin > 0) {
      result = result.filter(p => getCocRoi(p) >= cocRoiMin);
    }

    if (sqftRange[0] > sqftBounds[0] || sqftRange[1] < sqftBounds[1]) {
      result = result.filter(p => {
        const sf = getSqft(p);
        return sf >= sqftRange[0] && sf <= sqftRange[1];
      });
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case 'price': return getPrice(a) - getPrice(b);
        case 'price_desc': return getPrice(b) - getPrice(a);
        case 'cap_rate': return getCapRate(b) - getCapRate(a);
        case 'cash_flow': return getCashFlow(b) - getCashFlow(a);
        case 'ai_score': return getAiScore(b) - getAiScore(a);
        case 'newest': return getDom(a) - getDom(b);
        default: return 0;
      }
    });

    return result;
  }, [moreMatches, searchText, priceRange, priceBounds, bedFilter, bathFilter, typeFilter,
      capRateRange, capRateBounds, cashFlowFilter, cocRoiMin, sqftRange, sqftBounds, sortBy]);

  /* ── Pagination ── */
  const totalPages = Math.max(1, Math.ceil(filteredMore.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const displayedMore = filteredMore.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    moreMatchesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  /* ── Compare logic ── */
  const toggleCompare = useCallback((id: string) => {
    setCompareIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const compareProperties = allProperties.filter(p => compareIds.has(getId(p)));

  const handleCompare = useCallback(() => {
    if (compareProperties.length < 2) return;
    const addresses = compareProperties.map(p => getAddress(p));
    onAction?.(`Compare ${addresses.join(' vs ')}`);
  }, [compareProperties, onAction]);

  /* ── Filter state checks ── */
  const isFiltered = bedFilter !== 'Any' || bathFilter !== 'Any' || typeFilter !== 'All' ||
    searchText.trim() !== '' || cashFlowFilter !== 'Any' || cocRoiMin > 0 ||
    priceRange[0] > priceBounds[0] || priceRange[1] < priceBounds[1] ||
    capRateRange[0] > capRateBounds[0] || capRateRange[1] < capRateBounds[1] ||
    sqftRange[0] > sqftBounds[0] || sqftRange[1] < sqftBounds[1];

  const clearAllFilters = () => {
    setBedFilter('Any');
    setBathFilter('Any');
    setTypeFilter('All');
    setSearchText('');
    setCashFlowFilter('Any');
    setCocRoiMin(0);
    setPriceRange(priceBounds);
    setCapRateRange(capRateBounds);
    setSqftRange(sqftBounds);
    setCurrentPage(1);
  };

  /* ── Quick presets ── */
  const presets = [
    {
      id: 'positive_cf',
      label: 'Positive CF',
      icon: <DollarSign className="w-3 h-3" />,
      active: cashFlowFilter === 'Positive',
      toggle: () => setCashFlowFilter(cashFlowFilter === 'Positive' ? 'Any' : 'Positive'),
    },
    {
      id: 'high_cap',
      label: 'High Cap 5%+',
      icon: <TrendingUp className="w-3 h-3" />,
      active: capRateRange[0] >= 5,
      toggle: () => setCapRateRange(capRateRange[0] >= 5 ? capRateBounds : [5, capRateRange[1]]),
    },
    {
      id: 'under_300k',
      label: 'Under $300K',
      icon: <DollarSign className="w-3 h-3" />,
      active: priceRange[1] <= 300_000 && priceRange[1] < priceBounds[1],
      toggle: () => setPriceRange(
        priceRange[1] <= 300_000 && priceRange[1] < priceBounds[1]
          ? priceBounds
          : [priceBounds[0], Math.min(300_000, priceBounds[1])]
      ),
    },
    {
      id: 'three_beds',
      label: '3+ Beds',
      icon: <Home className="w-3 h-3" />,
      active: bedFilter === '3+',
      toggle: () => setBedFilter(bedFilter === '3+' ? 'Any' : '3+'),
    },
    {
      id: 'new_listings',
      label: 'New Listings',
      icon: <Clock className="w-3 h-3" />,
      active: sortBy === 'newest',
      toggle: () => setSortBy(sortBy === 'newest' ? 'ai_score' : 'newest'),
    },
  ];

  /* ── Render ── */
  return (
    <div className="my-4 w-full">
      {/* ── Results header ── */}
      <MarketStatsBar
        topPicks={topPicks}
        moreMatches={moreMatches}
        totalFound={totalFound}
        marketContext={marketContext}
      />

      {/* ── Top Picks Section ── */}
      {topPicks.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#C08B5C]/12 to-[#D4A27F]/6 border border-[#C08B5C]/15">
              <Sparkles className="w-4 h-4 text-[#D4A27F]" />
              <span className="text-[13px] font-semibold text-[#D4A27F]">Top Picks</span>
            </div>
            <span className="text-[11px] text-white/25">AI's best investment matches</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <AnimatePresence mode="popLayout">
              {topPicks.map((property, i) => (
                <PropertyGridCard
                  key={getId(property)}
                  data={{ ...property, tier: 'top' }}
                  index={i}
                  variant="grid"
                  isCompareSelected={compareIds.has(getId(property))}
                  onToggleCompare={toggleCompare}
                  onAction={onAction}
                  isBookmarked={bookmarkedIds.has(getId(property))}
                  onToggleBookmark={onToggleBookmark}
                  hoveredId={hoveredPropertyId}
                  onHover={onHoverProperty}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* ── More Matches Section ── */}
      {moreMatches.length > 0 && (
        <div ref={moreMatchesRef}>
          {/* Section divider */}
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px flex-1 bg-white/[0.04]" />
            <span className="text-[11px] text-white/25 font-medium">
              More Matches <span className="text-white/12">({moreMatches.length})</span>
            </span>
            <div className="h-px flex-1 bg-white/[0.04]" />
          </div>

          {/* ── Quick Presets ── */}
          <div className="flex items-center gap-1.5 mb-3 flex-wrap">
            <span className="text-[9px] text-white/15 uppercase tracking-wider font-semibold mr-1">Quick</span>
            {presets.map(preset => (
              <button
                key={preset.id}
                onClick={preset.toggle}
                className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-medium transition-all border',
                  preset.active
                    ? 'bg-[#C08B5C]/12 text-[#D4A27F] border-[#C08B5C]/20'
                    : 'text-white/25 hover:text-white/40 border-white/[0.04] hover:border-white/[0.08] hover:bg-white/[0.02]'
                )}
              >
                {preset.icon}
                {preset.label}
              </button>
            ))}
          </div>

          {/* ── Filter toolbar ── */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            {/* Search */}
            <div className="flex items-center">
              {searchOpen ? (
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-md border border-white/[0.08] bg-white/[0.03]">
                  <Search className="w-3 h-3 text-white/20 flex-shrink-0" />
                  <input
                    autoFocus
                    type="text"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    placeholder="Address, city, zip..."
                    className="bg-transparent border-none outline-none text-[10px] text-white/60 placeholder:text-white/15 w-[130px]"
                  />
                  <button onClick={() => { setSearchText(''); setSearchOpen(false); }} className="text-white/15 hover:text-white/30">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setSearchOpen(true)}
                  className="p-1.5 rounded-md text-white/20 hover:text-white/40 hover:bg-white/[0.03] transition-colors border border-transparent"
                  title="Search properties"
                >
                  <Search className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="w-px h-4 bg-white/[0.06]" />

            {/* Beds pills */}
            <div className="flex items-center gap-0.5">
              <span className="text-[9px] text-white/15 uppercase tracking-wider font-semibold mr-1">Beds</span>
              {BED_OPTIONS.map(opt => (
                <Pill key={opt} label={opt} active={bedFilter === opt} onClick={() => setBedFilter(opt)} />
              ))}
            </div>

            <div className="w-px h-4 bg-white/[0.06]" />

            {/* Baths pills */}
            <div className="flex items-center gap-0.5">
              <span className="text-[9px] text-white/15 uppercase tracking-wider font-semibold mr-1">Baths</span>
              {BATH_OPTIONS.map(opt => (
                <Pill key={opt} label={opt} active={bathFilter === opt} onClick={() => setBathFilter(opt)} />
              ))}
            </div>

            <div className="w-px h-4 bg-white/[0.06]" />

            {/* Type pills */}
            <div className="flex items-center gap-0.5">
              <span className="text-[9px] text-white/15 uppercase tracking-wider font-semibold mr-1">Type</span>
              {TYPE_OPTIONS.map(opt => (
                <Pill key={opt} label={opt} active={typeFilter === opt} onClick={() => setTypeFilter(opt)} />
              ))}
            </div>

            <div className="flex-1" />

            {/* Advanced filters toggle */}
            <button
              onClick={() => setFiltersExpanded(!filtersExpanded)}
              className={cn(
                'flex items-center gap-1 px-2 py-1 rounded-md text-[10px] transition-colors border',
                filtersExpanded
                  ? 'bg-white/[0.06] text-white/50 border-white/[0.08]'
                  : 'text-white/25 hover:text-white/40 border-transparent hover:bg-white/[0.03]'
              )}
            >
              <SlidersHorizontal className="w-3 h-3" /> Advanced
            </button>

            {/* Sort */}
            <SortDropdown value={sortBy} onChange={setSortBy} />
          </div>

          {/* ── Expanded Advanced Filters ── */}
          <AnimatePresence>
            {filtersExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden mb-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 p-4 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                  {/* Price range */}
                  <RangeSlider
                    label="Price"
                    min={priceBounds[0]}
                    max={priceBounds[1]}
                    step={10_000}
                    value={priceRange}
                    onChange={setPriceRange}
                    formatLabel={fmtCompact}
                  />

                  {/* Cap Rate range */}
                  <RangeSlider
                    label="Cap Rate"
                    min={capRateBounds[0]}
                    max={capRateBounds[1]}
                    step={0.5}
                    value={capRateRange}
                    onChange={setCapRateRange}
                    formatLabel={(n) => `${n.toFixed(1)}%`}
                  />

                  {/* Cash Flow */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[9px] text-white/20 uppercase tracking-wider font-semibold">Cash Flow</span>
                    <div className="flex items-center gap-1">
                      {CASH_FLOW_OPTIONS.map(opt => (
                        <Pill key={opt} label={opt} active={cashFlowFilter === opt} onClick={() => setCashFlowFilter(opt)} />
                      ))}
                    </div>
                  </div>

                  {/* CoC ROI min */}
                  <SingleSlider
                    label="Min CoC ROI"
                    min={0}
                    max={30}
                    step={1}
                    value={cocRoiMin}
                    onChange={setCocRoiMin}
                    formatLabel={(n) => `${n}%`}
                  />

                  {/* Sqft range */}
                  <RangeSlider
                    label="Sqft"
                    min={sqftBounds[0]}
                    max={sqftBounds[1]}
                    step={100}
                    value={sqftRange}
                    onChange={setSqftRange}
                    formatLabel={(n) => n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n)}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Filter indicator ── */}
          {isFiltered && (
            <div className="flex items-center gap-2 mb-3 text-[10px] text-white/30">
              <span>Showing <span className="text-white/50 font-medium">{filteredMore.length}</span> of {moreMatches.length}</span>
              <button onClick={clearAllFilters} className="text-[#D4A27F] hover:text-[#C08B5C] font-medium">
                Clear filters
              </button>
            </div>
          )}

          {/* ── Empty state ── */}
          {filteredMore.length === 0 && (
            <div className="py-10 text-center">
              <p className="text-[12px] text-white/25 mb-2">No properties match your filters</p>
              <button onClick={clearAllFilters} className="text-[11px] text-[#D4A27F] hover:text-[#C08B5C] font-medium">
                Reset filters
              </button>
            </div>
          )}

          {/* ── More Matches grid ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <AnimatePresence mode="popLayout">
              {displayedMore.map((property, i) => (
                <PropertyGridCard
                  key={getId(property)}
                  data={{ ...property, tier: 'standard' }}
                  index={i}
                  variant="grid"
                  isCompareSelected={compareIds.has(getId(property))}
                  onToggleCompare={toggleCompare}
                  onAction={onAction}
                  isBookmarked={bookmarkedIds.has(getId(property))}
                  onToggleBookmark={onToggleBookmark}
                  hoveredId={hoveredPropertyId}
                  onHover={onHoverProperty}
                />
              ))}
            </AnimatePresence>
          </div>

          {/* ── Pagination ── */}
          <PaginationBar
            currentPage={safePage}
            totalPages={totalPages}
            totalItems={filteredMore.length}
            pageSize={PAGE_SIZE}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {/* ── Comparison dock ── */}
      <AnimatePresence>
        {compareProperties.length >= 2 && (
          <ComparisonDock
            selectedProperties={compareProperties}
            onRemove={(id) => toggleCompare(id)}
            onClear={() => setCompareIds(new Set())}
            onCompare={handleCompare}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default PropertyResultsGrid;
