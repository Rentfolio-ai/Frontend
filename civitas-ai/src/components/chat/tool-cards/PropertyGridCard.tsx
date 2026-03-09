/**
 * PropertyGridCard – Luxury-minimal property card for Civitas AI.
 *
 * Design: Quick-scan optimized. Dark frosted glass, typography-driven,
 * 2 key metrics (Cap + CF), generous whitespace, gold accents for Top Picks only.
 *
 * Two tiers:
 *   tier="top"      → Gold border, "AI Top Pick" badge, 3 metrics (+ CoC ROI)
 *   tier="standard" → Neutral glass, 2 metrics, subtle styling
 */

import React, { useCallback } from 'react';
import { motion } from 'framer-motion';
import { Heart, Sparkles, Home } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { PhotoCarousel } from '../../property/PhotoCarousel';
import type { ScoutedProperty } from '../../../types/backendTools';

/* ── Types ─────────────────────────────────────────────────────────── */

export interface PropertyCardData {
  listing_id?: string;
  id?: string;
  property_id?: string;
  address: string;
  formattedAddress?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  price: number;
  bedrooms?: number;
  beds?: number;
  bathrooms?: number;
  baths?: number;
  sqft?: number;
  squareFootage?: number;
  year_built?: number;
  property_type?: string;
  photos?: string[];
  image_url?: string;
  images?: string[];
  primaryPhoto?: string;
  photo_url?: string;
  lat?: number;
  lng?: number;
  days_on_market?: number;
  listing_url?: string;
  listing_type?: string;
  description?: string;
  ai_reason?: string;
  ai_score?: number;
  ai_match_score?: number;
  value_score?: number;
  value_grade?: 'A' | 'B' | 'C' | 'D' | 'F';
  financial_snapshot?: {
    estimated_monthly_cash_flow?: number;
    status?: 'positive' | 'negative';
    estimated_rent?: number;
    assumptions?: { rate?: number; down_payment?: number; rule?: string };
  };
  estimated_rent?: number;
  rent_estimate?: number;
  cash_on_cash_roi?: number;
  nightly_price?: number;
  investment_type?: string;
  is_rental?: boolean;
  source?: string;
  url?: string;
  tier?: 'top' | 'standard';
  calculated_metrics?: {
    monthly_cash_flow?: number;
    cap_rate?: number;
    cash_on_cash_roi?: number;
    annual_noi?: number;
    monthly_mortgage?: number;
    monthly_expenses?: number;
    total_roi?: number;
  };
  analysis?: {
    cap_rate?: number;
    gross_yield?: number;
    estimated_rent?: number;
  };
}

interface PropertyGridCardProps {
  data: PropertyCardData;
  index?: number;
  isCompareSelected?: boolean;
  onToggleCompare?: (id: string) => void;
  onAction?: (query: string) => void;
  variant?: 'grid' | 'list';
  isBookmarked?: boolean;
  onToggleBookmark?: (property: ScoutedProperty) => void;
  hoveredId?: string | null;
  onHover?: (id: string | null) => void;
}

/* ── Helpers ───────────────────────────────────────────────────────── */

const fmtCompact = (n: number) => {
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `$${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `$${(abs / 1_000).toFixed(1)}K`;
  return `$${abs}`;
};

const fmtPct = (n: number) => `${n.toFixed(1)}%`;

const GRADE_COLORS: Record<string, string> = {
  A: 'text-emerald-400',
  B: 'text-sky-400',
  C: 'text-amber-400',
  D: 'text-rose-400',
  F: 'text-red-400',
};

const toScoutedProperty = (data: PropertyCardData): ScoutedProperty => ({
  listing_id: data.listing_id || data.id || data.property_id || '',
  address: data.address || data.formattedAddress || '',
  city: data.city || '',
  state: data.state || '',
  zip_code: data.zip_code || '',
  price: data.price || 0,
  bedrooms: data.bedrooms ?? data.beds ?? 0,
  bathrooms: data.bathrooms ?? data.baths ?? 0,
  sqft: data.sqft || data.squareFootage || 0,
  year_built: data.year_built,
  property_type: data.property_type as ScoutedProperty['property_type'],
  photos: data.photos || (data.image_url ? [data.image_url] : data.images),
  days_on_market: data.days_on_market,
  listing_url: data.listing_url,
  description: data.description,
  listing_type: data.listing_type,
  value_score: data.value_score,
  value_grade: data.value_grade,
  financial_snapshot: data.financial_snapshot as ScoutedProperty['financial_snapshot'],
  cash_on_cash_roi: data.cash_on_cash_roi,
  nightly_price: data.nightly_price,
});

/* ── Confidence Bar ────────────────────────────────────────────────── */

const ConfidenceBar: React.FC<{ score: number; max?: number; isTop?: boolean }> = ({ score, max = 100, isTop }) => {
  const pct = Math.min((score / max) * 100, 100);
  const color = isTop ? '#D4A27F' : pct >= 80 ? '#D4A27F' : pct >= 55 ? '#8B7355' : '#4A4458';
  return (
    <div className="w-full h-[2px] rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.03)' }}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
        className="h-full rounded-full"
        style={{ background: color }}
      />
    </div>
  );
};

/* ── Main Card ─────────────────────────────────────────────────────── */

export const PropertyGridCard: React.FC<PropertyGridCardProps> = ({
  data,
  index = 0,
  onAction,
  variant = 'grid',
  isBookmarked = false,
  onToggleBookmark,
  hoveredId,
  onHover,
}) => {
  const tier = data.tier || 'standard';
  const isTop = tier === 'top';

  const id = data.listing_id || data.id || data.property_id || data.address;
  const address = data.address || data.formattedAddress || '';
  const city = data.city || '';
  const state = data.state || '';
  const price = data.price || 0;
  const beds = data.bedrooms ?? data.beds;
  const baths = data.bathrooms ?? data.baths;
  const sqft = data.sqft || data.squareFootage;
  const aiScore = data.ai_score ?? data.ai_match_score ?? data.value_score;
  const valueGrade = data.value_grade;
  const isRental = data.is_rental || data.listing_type === 'rental';

  const photos: string[] = (
    data.photos && data.photos.length > 0
      ? data.photos
      : [data.photo_url, data.image_url, ...(data.images || []), data.primaryPhoto].filter(Boolean) as string[]
  );

  const metrics = data.calculated_metrics;
  const capRate = metrics?.cap_rate ?? data.analysis?.cap_rate ?? data.analysis?.gross_yield;
  const cashFlow = data.financial_snapshot?.estimated_monthly_cash_flow ?? metrics?.monthly_cash_flow;
  const cocRoi = metrics?.cash_on_cash_roi ?? data.cash_on_cash_roi;
  const isPositiveCF = (cashFlow ?? 0) >= 0;

  const fullAddress = `${address}${city ? `, ${city}` : ''}${state ? `, ${state}` : ''}`;
  const specsText = [
    beds != null ? `${beds} bd` : null,
    baths != null ? `${baths} ba` : null,
    sqft != null && sqft > 0 ? `${sqft.toLocaleString()} sqft` : null,
  ].filter(Boolean).join('  ·  ');

  const scoreMax = (aiScore ?? 0) > 100 ? 150 : 100;
  const isHovered = hoveredId === id;

  const handleCardClick = useCallback(() => {
    onAction?.(`Tell me more about ${address}${city ? `, ${city}` : ''}`);
  }, [onAction, address, city]);

  const handleBookmarkClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleBookmark?.(toScoutedProperty(data));
  }, [onToggleBookmark, data]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
      onClick={handleCardClick}
      onMouseEnter={() => onHover?.(id)}
      onMouseLeave={() => onHover?.(null)}
      className={cn(
        'group rounded-2xl overflow-hidden border transition-all duration-200 cursor-pointer',
        'shadow-[inset_0_1px_0_0_rgba(0,0,0,0.03)]',
        isTop
          ? 'bg-card/80 backdrop-blur-md border-[#C08B5C]/20 hover:border-[#C08B5C]/35 hover:shadow-[0_0_24px_rgba(192,139,92,0.06)]'
          : 'bg-background/75 backdrop-blur-md border-black/[0.06] hover:border-black/[0.10] hover:bg-background/85',
        isHovered && 'ring-1 ring-[#C08B5C]/30 bg-background/85',
        variant === 'list' && 'flex flex-row',
      )}
    >
      {/* ── Photo ── */}
      <div className={cn(
        'relative overflow-hidden',
        variant === 'grid' ? 'aspect-[16/10]' : 'w-[220px] flex-shrink-0'
      )}>
        {(photos.length > 1 || isTop) ? (
          <PhotoCarousel
            photos={photos.length > 0 ? photos : []}
            alt={address}
            aspectRatio=""
            className="w-full h-full"
            showDots={true}
            showArrows={true}
          >
            {_renderBadges()}
          </PhotoCarousel>
        ) : photos.length === 1 ? (
          <>
            <img
              src={photos[0]}
              alt={address}
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/5 pointer-events-none" />
            {_renderBadges()}
          </>
        ) : (
          <>
            <div className="w-full h-full bg-card flex items-center justify-center">
              <Home className="w-10 h-10 text-muted-foreground/30" />
            </div>
            {_renderBadges()}
          </>
        )}
      </div>

      {/* ── Content ── */}
      <div className={cn('flex-1 min-w-0 flex flex-col', variant === 'grid' ? 'px-5 pt-3 pb-4' : 'p-4')}>
        {/* Confidence bar */}
        {aiScore != null && aiScore > 0 && variant === 'grid' && (
          <div className="mb-3">
            <ConfidenceBar score={aiScore} max={scoreMax} isTop={isTop} />
          </div>
        )}

        {/* Price */}
        <div className="flex items-baseline justify-between gap-3 mb-1.5">
          <span className="text-[22px] font-extrabold text-foreground tracking-tight">
            ${price.toLocaleString()}
            {isRental && <span className="text-[12px] text-muted-foreground/60 font-normal ml-0.5">/mo</span>}
          </span>
          {valueGrade && !isRental && (
            <span className={cn('text-[11px] font-bold flex-shrink-0', GRADE_COLORS[valueGrade])}>
              {valueGrade}
            </span>
          )}
        </div>

        {/* Address */}
        <p
          className="text-[13px] text-muted-foreground/70 mb-1 truncate"
          title={fullAddress}
        >
          {fullAddress}
        </p>

        {/* Specs */}
        {specsText && (
          <p className="text-[11px] text-muted-foreground/50 tracking-wide mb-4">
            {specsText}
          </p>
        )}

        {/* ── Metrics strip ── */}
        <div className="flex items-center py-3 border-t border-black/[0.06] gap-0">
          {isRental ? (
            <>
              <MetricBlock label="TYPE" value={data.property_type || 'Rental'} />
              <MetricDivider />
              <MetricBlock label="RENT" value={`$${price.toLocaleString()}`} />
            </>
          ) : (
            <>
              <MetricBlock
                label="CAP"
                value={capRate != null ? fmtPct(capRate) : '—'}
              />
              <MetricDivider />
              <MetricBlock
                label="CF"
                value={cashFlow != null ? `${isPositiveCF ? '+' : '-'}${fmtCompact(cashFlow)}` : '—'}
                color={cashFlow != null ? (isPositiveCF ? 'text-emerald-400' : 'text-rose-400') : undefined}
              />
              {isTop && cocRoi != null && (
                <>
                  <MetricDivider />
                  <MetricBlock label="CoC" value={fmtPct(cocRoi)} />
                </>
              )}
            </>
          )}
        </div>

        {/* ── Enrichment badges ── */}
        {(data as any).enrichment && (
          <div className="flex flex-wrap gap-1.5 pt-2 border-t border-black/[0.04]">
            {(data as any).enrichment?.school_rating != null && (
              <EnrichmentBadge
                label={`Schools: ${_schoolGrade((data as any).enrichment.school_rating)}`}
                color={_schoolColor((data as any).enrichment.school_rating)}
              />
            )}
            {(data as any).enrichment?.walk_score != null && (
              <EnrichmentBadge
                label={`Walk ${(data as any).enrichment.walk_score}`}
                color={_walkScoreColor((data as any).enrichment.walk_score)}
              />
            )}
            {(data as any).enrichment?.flood_zone && (data as any).enrichment.flood_risk === 'high' && (
              <EnrichmentBadge label="Flood Risk" color="text-red-400 bg-red-500/15" />
            )}
            {(data as any).enrichment?.crime_level && (
              <EnrichmentBadge
                label={`Crime: ${(data as any).enrichment.crime_level}`}
                color={(data as any).enrichment.crime_level === 'Low' ? 'text-green-400 bg-green-500/15' : (data as any).enrichment.crime_level === 'High' ? 'text-red-400 bg-red-500/15' : 'text-yellow-400 bg-yellow-500/15'}
              />
            )}
            {(data as any).enrichment?.data_freshness && (
              <span className="text-[9px] text-muted-foreground/50 self-center ml-auto">
                {(data as any).enrichment.data_freshness}
              </span>
            )}
          </div>
        )}

        {/* ── CTA ── */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAction?.(isTop ? `Analyze ${address}` : `Tell me more about ${address}`);
          }}
          className={cn(
            'w-full mt-3 py-2.5 rounded-xl text-[12px] font-semibold transition-colors',
            isTop
              ? 'bg-[#C08B5C]/12 hover:bg-[#C08B5C]/20 text-[#D4A27F] border border-[#C08B5C]/15'
              : 'bg-black/[0.03] hover:bg-black/[0.05] text-muted-foreground hover:text-foreground/65 border border-black/[0.06]',
          )}
        >
          {isTop ? 'Analyze Deal' : 'View Details'}
        </button>
      </div>
    </motion.div>
  );

  /* ── Photo overlay badges ── */
  function _renderBadges() {
    return (
      <>
        {/* AI Top Pick — top-left */}
        {isTop && (
          <span className="absolute top-3 left-3 flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold shadow-lg bg-gradient-to-r from-[#C08B5C] to-[#D4A27F] text-white z-10">
            <Sparkles className="w-2.5 h-2.5" /> Top Pick
          </span>
        )}

        {/* AI Score — top-right */}
        {aiScore != null && aiScore > 0 && (
          <div
            className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold z-10"
            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(12px)', color: isTop ? '#D4A27F' : 'rgba(255,255,255,0.7)' }}
          >
            <Sparkles className="w-2.5 h-2.5" />
            {Math.round(aiScore)}<span className="text-muted-foreground/50 font-normal">/{scoreMax}</span>
          </div>
        )}

        {/* Bookmark — bottom-right */}
        <button
          onClick={handleBookmarkClick}
          className={cn(
            'absolute bottom-3 right-3 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all z-10',
            isBookmarked ? 'bg-rose-500/80 text-white' : 'bg-black/30 text-muted-foreground hover:bg-black/50 hover:text-foreground'
          )}
        >
          <Heart className={cn('w-4 h-4', isBookmarked && 'fill-current')} />
        </button>
      </>
    );
  }
};

/* ── Metric sub-components ── */

const MetricBlock: React.FC<{ label: string; value: string; color?: string }> = ({ label, value, color }) => (
  <div className="flex-1 min-w-0">
    <p className="text-[10px] text-muted-foreground/50 uppercase tracking-wider mb-0.5">{label}</p>
    <p className={cn('text-[14px] font-semibold font-mono leading-tight whitespace-nowrap', color || 'text-foreground/75')}>
      {value}
    </p>
  </div>
);

const MetricDivider = () => <div className="w-px h-8 bg-black/[0.05] mx-2 flex-shrink-0" />;

const EnrichmentBadge: React.FC<{ label: string; color: string }> = ({ label, color }) => (
  <span className={cn('inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium', color)}>
    {label}
  </span>
);

function _schoolGrade(rating: number): string {
  if (rating >= 9) return 'A';
  if (rating >= 7) return 'B';
  if (rating >= 5) return 'C';
  if (rating >= 3) return 'D';
  return 'F';
}

function _schoolColor(rating: number): string {
  if (rating >= 7) return 'text-green-400 bg-green-500/15';
  if (rating >= 5) return 'text-yellow-400 bg-yellow-500/15';
  return 'text-red-400 bg-red-500/15';
}

function _walkScoreColor(score: number): string {
  if (score >= 70) return 'text-green-400 bg-green-500/15';
  if (score >= 50) return 'text-yellow-400 bg-yellow-500/15';
  return 'text-red-400 bg-red-500/15';
}

export default PropertyGridCard;
