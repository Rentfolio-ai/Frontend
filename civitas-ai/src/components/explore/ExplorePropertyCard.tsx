// FILE: src/components/explore/ExplorePropertyCard.tsx
import React from 'react';
import { Heart, Home } from 'lucide-react';
import { PhotoCarousel } from '../property/PhotoCarousel';
import type { Property } from '../../services/v2PropertyApi';

// ============================================================================
// Helpers
// ============================================================================

const fmtPrice = (n: number | undefined | null): string => {
  if (n == null) return '--';
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toLocaleString()}`;
};

const fmtCurrency = (n: number | undefined | null): string => {
  if (n == null) return '--';
  const sign = n < 0 ? '-' : '';
  return `${sign}$${Math.abs(n).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
};

const fmtPct = (n: number | undefined | null): string => {
  if (n == null) return '--';
  return `${n.toFixed(1)}%`;
};

// ============================================================================
// Component
// ============================================================================

interface ExplorePropertyCardProps {
  property: Property;
  isBookmarked?: boolean;
  onToggleBookmark?: () => void;
  onAnalyze?: () => void;
  onHover?: (id: string | null) => void;
  isHighlighted?: boolean;
}

export const ExplorePropertyCard: React.FC<ExplorePropertyCardProps> = ({
  property,
  isBookmarked = false,
  onToggleBookmark,
  onAnalyze,
  onHover,
  isHighlighted = false,
}) => {
  const photos = [...new Set([
    property.image_url,
    ...(Array.isArray(property.photos) ? property.photos : []),
  ].filter(Boolean))] as string[];

  const metrics = property.calculated_metrics;
  const address = property.address || 'Unknown address';
  const cityState = [property.city, property.state].filter(Boolean).join(', ');

  // Build specs line: "3 bd | 2 ba | 1,850 sqft"
  const specParts: string[] = [];
  if (property.beds != null) specParts.push(`${property.beds} bd`);
  if (property.baths != null) specParts.push(`${property.baths} ba`);
  if (property.sqft != null) specParts.push(`${property.sqft.toLocaleString()} sqft`);
  const specsLine = specParts.join(' | ');

  // Build metrics line: "Cap 5.2% · CF $485/mo · CoC 8.1%"
  const metricParts: string[] = [];
  if (metrics?.cap_rate != null) metricParts.push(`Cap ${fmtPct(metrics.cap_rate)}`);
  if (metrics?.monthly_cash_flow != null) metricParts.push(`CF ${fmtCurrency(metrics.monthly_cash_flow)}/mo`);
  if (metrics?.cash_on_cash_roi != null) metricParts.push(`CoC ${fmtPct(metrics.cash_on_cash_roi)}`);

  return (
    <div
      className={`
        group flex flex-col rounded-xl cursor-pointer
        bg-[#1a1a1f] border transition-all duration-200
        hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/25 hover:bg-[#1e1e24]
        ${isHighlighted
          ? 'border-white/[0.15] shadow-lg shadow-black/20 -translate-y-0.5'
          : 'border-white/[0.06] hover:border-white/[0.10]'
        }
      `}
      onClick={() => onAnalyze?.()}
      onMouseEnter={() => onHover?.(property.id)}
      onMouseLeave={() => onHover?.(null)}
    >
      {/* Photo section -- overflow-hidden scoped here, not on card */}
      <div className="relative overflow-hidden rounded-t-xl">
        {photos.length > 0 ? (
          <PhotoCarousel
            photos={photos}
            alt={address}
            aspectRatio="aspect-[4/3]"
            showDots={photos.length > 1}
            showArrows={photos.length > 1}
          >
            <button
              onClick={(e) => { e.stopPropagation(); onToggleBookmark?.(); }}
              className="absolute top-2.5 right-2.5 z-10 p-1.5 rounded-full bg-black/40
                transition-all duration-150 hover:bg-black/60"
            >
              <Heart
                className={`w-4 h-4 transition-colors duration-150 ${
                  isBookmarked ? 'fill-red-500 text-red-500' : 'text-white/70 hover:text-white'
                }`}
              />
            </button>
          </PhotoCarousel>
        ) : (
          <div className="aspect-[4/3] bg-[#16161a] flex flex-col items-center justify-center gap-2">
            <Home className="w-8 h-8 text-white/10" />
            <span className="text-[10px] text-white/15 font-medium">No photo</span>
            <button
              onClick={(e) => { e.stopPropagation(); onToggleBookmark?.(); }}
              className="absolute top-2.5 right-2.5 z-10 p-1.5 rounded-full bg-black/40
                transition-all duration-150 hover:bg-black/60"
            >
              <Heart
                className={`w-4 h-4 transition-colors duration-150 ${
                  isBookmarked ? 'fill-red-500 text-red-500' : 'text-white/70'
                }`}
              />
            </button>
          </div>
        )}
      </div>

      {/* Content -- flex-shrink-0 ensures this never collapses */}
      <div className="px-3 pt-2.5 pb-3 flex flex-col gap-0.5 flex-shrink-0">
        <span className="text-[16px] font-bold text-white/95 leading-snug">{fmtPrice(property.price)}</span>

        {specsLine && (
          <span className="text-[13px] text-white/55 font-medium leading-snug">{specsLine}</span>
        )}

        <p className="text-[12px] text-white/40 leading-snug truncate mt-0.5" title={address}>
          {address}{cityState ? `, ${cityState}` : ''}
        </p>

        {metricParts.length > 0 && (
          <span className="text-[11px] font-mono text-white/30 mt-1 leading-snug">
            {metricParts.join(' · ')}
          </span>
        )}
      </div>
    </div>
  );
};
