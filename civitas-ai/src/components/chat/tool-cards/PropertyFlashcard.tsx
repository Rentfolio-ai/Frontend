import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bookmark, TrendingUp, TrendingDown, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PropertyCardData } from './PropertyGridCard';

function getPhoto(p: PropertyCardData): string | null {
  if (p.photos?.length) return p.photos[0];
  return p.image_url || p.primaryPhoto || p.photo_url || null;
}

function fmt(n: number | undefined): string {
  if (n == null) return '—';
  return n >= 1000 ? `$${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k` : `$${Math.round(n).toLocaleString()}`;
}

function pct(n: number | undefined): string {
  if (n == null) return '—';
  return `${n.toFixed(1)}%`;
}

interface PropertyFlashcardProps {
  property: PropertyCardData;
  rank: number;
  isBookmarked?: boolean;
  onToggleBookmark?: () => void;
}

export const PropertyFlashcard: React.FC<PropertyFlashcardProps> = ({
  property: p,
  rank,
  isBookmarked = false,
  onToggleBookmark,
}) => {
  const [flipped, setFlipped] = useState(false);

  const photo = getPhoto(p);
  const beds = p.bedrooms ?? p.beds ?? 0;
  const baths = p.bathrooms ?? p.baths ?? 0;
  const sqft = p.sqft ?? p.squareFootage ?? 0;
  const price = p.price ?? 0;
  const address = p.formattedAddress || p.address || 'Unknown';
  const shortAddr = address.length > 28 ? address.slice(0, 26) + '...' : address;
  const score = p.ai_match_score ?? p.ai_score ?? 0;

  const cm = p.calculated_metrics;
  const fs = p.financial_snapshot;
  const cashFlow = cm?.monthly_cash_flow ?? fs?.estimated_monthly_cash_flow ?? 0;
  const capRate = cm?.cap_rate ?? p.analysis?.cap_rate ?? 0;
  const cocRoi = cm?.cash_on_cash_roi ?? p.cash_on_cash_roi ?? 0;
  const rent = p.estimated_rent ?? p.rent_estimate ?? fs?.estimated_rent ?? p.analysis?.estimated_rent ?? 0;
  const mortgage = cm?.monthly_mortgage ?? 0;
  const noi = cm?.annual_noi ?? 0;
  const cfPositive = cashFlow >= 0;

  return (
    <div
      className="flex-shrink-0 w-[210px] h-[270px] cursor-pointer select-none"
      style={{ perspective: '1000px' }}
      onClick={() => setFlipped(!flipped)}
    >
      <motion.div
        className="relative w-full h-full"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      >
        {/* ── Front: Property ─────────────────────────────────── */}
        <div
          className="absolute inset-0 rounded-xl border border-black/[0.08] bg-black/[0.02] backdrop-blur-sm overflow-hidden flex flex-col"
          style={{ backfaceVisibility: 'hidden' }}
        >
          {/* Photo / placeholder */}
          <div className="relative h-[110px] w-full overflow-hidden bg-gradient-to-br from-[#C08B5C]/10 to-[#1a1a20]">
            {photo ? (
              <img src={photo} alt="" className="w-full h-full object-cover" loading="lazy" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground/30 text-3xl font-bold">
                {rank}
              </div>
            )}
            {/* Rank badge */}
            <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#C08B5C]/90 text-white">
              #{rank}
            </span>
            {/* Score badge */}
            {score > 0 && (
              <span className="absolute top-2 right-2 flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-black/60 text-[#C08B5C] backdrop-blur-sm">
                <Sparkles className="w-2.5 h-2.5" />
                {Math.round(score)}
              </span>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 px-3 py-2.5 flex flex-col justify-between">
            <div>
              <p className="text-[13px] font-semibold text-foreground/85 leading-tight truncate">{shortAddr}</p>
              <p className="text-[17px] font-bold text-[#F5E6D0] mt-1">${price.toLocaleString()}</p>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground/70 mt-1.5">
              <span>{beds}bd</span>
              <span className="w-px h-2.5 bg-black/8" />
              <span>{baths}ba</span>
              {sqft > 0 && (
                <>
                  <span className="w-px h-2.5 bg-black/8" />
                  <span>{sqft.toLocaleString()} sqft</span>
                </>
              )}
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className={cn(
                'text-[11px] font-medium px-1.5 py-0.5 rounded',
                cfPositive ? 'text-emerald-400/80 bg-emerald-500/10' : 'text-red-400/80 bg-red-500/10',
              )}>
                {cfPositive ? '+' : ''}{fmt(cashFlow)}/mo
              </span>
              <span className="text-[10px] text-muted-foreground/50 italic">tap to flip</span>
            </div>
          </div>

          {/* Bookmark button */}
          {onToggleBookmark && (
            <button
              onClick={(e) => { e.stopPropagation(); onToggleBookmark(); }}
              className="absolute bottom-2.5 right-2.5 p-1 rounded-md hover:bg-black/8 transition-colors"
            >
              <Bookmark className={cn('w-3.5 h-3.5', isBookmarked ? 'fill-[#C08B5C] text-[#C08B5C]' : 'text-muted-foreground/50')} />
            </button>
          )}
        </div>

        {/* ── Back: P&L Analysis ──────────────────────────────── */}
        <div
          className="absolute inset-0 rounded-xl border border-black/[0.08] bg-card overflow-hidden flex flex-col px-3.5 py-3"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <p className="text-[10px] uppercase tracking-wider text-[#C08B5C]/60 font-semibold mb-2">
            P&L Analysis · #{rank}
          </p>

          {/* Cash flow hero */}
          <div className={cn(
            'rounded-lg px-3 py-2.5 mb-3 border',
            cfPositive ? 'bg-emerald-500/5 border-emerald-500/15' : 'bg-red-500/5 border-red-500/15',
          )}>
            <p className="text-[10px] text-muted-foreground/60 mb-0.5">Monthly Cash Flow</p>
            <div className="flex items-center gap-1.5">
              {cfPositive ? (
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5 text-red-400" />
              )}
              <span className={cn('text-[18px] font-bold', cfPositive ? 'text-emerald-400' : 'text-red-400')}>
                {cfPositive ? '+' : ''}{fmt(cashFlow)}
              </span>
            </div>
          </div>

          {/* Metrics grid */}
          <div className="grid grid-cols-2 gap-x-3 gap-y-2 flex-1">
            <MetricRow label="Cap Rate" value={pct(capRate)} />
            <MetricRow label="CoC ROI" value={pct(cocRoi)} />
            <MetricRow label="Est. Rent" value={fmt(rent)} suffix="/mo" />
            <MetricRow label="Mortgage" value={fmt(mortgage)} suffix="/mo" />
            <MetricRow label="Annual NOI" value={fmt(noi)} />
            <MetricRow label="Price/sqft" value={sqft > 0 ? `$${Math.round(price / sqft)}` : '—'} />
          </div>

          <p className="text-[9px] text-muted-foreground/40 text-center mt-2 italic">tap to flip back</p>
        </div>
      </motion.div>
    </div>
  );
};

const MetricRow: React.FC<{ label: string; value: string; suffix?: string }> = ({ label, value, suffix }) => (
  <div>
    <p className="text-[9px] text-muted-foreground/50 leading-none">{label}</p>
    <p className="text-[13px] font-semibold text-foreground/75 mt-0.5">
      {value}{suffix && <span className="text-[10px] font-normal text-muted-foreground/60">{suffix}</span>}
    </p>
  </div>
);
