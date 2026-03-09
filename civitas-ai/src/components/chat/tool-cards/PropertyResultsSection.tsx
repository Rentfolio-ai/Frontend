/**
 * PropertyResultsSection – Enforces top-5 tier split with collapsible secondary results.
 *
 * Wraps PropertyResultsGrid, overriding its default tier slicing:
 *   - Top 5 scored properties → tier="top" (always visible)
 *   - Remaining properties → tier="standard" behind a collapsible accordion
 */

import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, RefreshCw } from 'lucide-react';
import { PropertyResultsGrid } from './PropertyResultsGrid';
import type { PropertyCardData } from './PropertyGridCard';
import type { BookmarkedProperty } from '../../../types/bookmarks';
import type { ScoutedProperty } from '../../../types/backendTools';

const TOP_PICK_COUNT = 5;

interface PropertyResultsSectionProps {
  properties: PropertyCardData[];
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
}

export const PropertyResultsSection: React.FC<PropertyResultsSectionProps> = ({
  properties,
  totalFound,
  marketContext,
  onAction,
  bookmarks,
  onToggleBookmark,
}) => {
  const [showMore, setShowMore] = useState(false);

  const { topPicks, rest } = useMemo(() => {
    const sorted = [...properties];
    return {
      topPicks: sorted.slice(0, TOP_PICK_COUNT).map(p => ({ ...p, tier: 'top' as const })),
      rest: sorted.slice(TOP_PICK_COUNT).map(p => ({ ...p, tier: 'standard' as const })),
    };
  }, [properties]);

  if (properties.length === 0) return null;

  return (
    <div className="w-full">
      <PropertyResultsGrid
        topPicks={topPicks}
        moreMatches={showMore ? rest : []}
        totalFound={totalFound}
        marketContext={marketContext}
        onAction={onAction}
        bookmarks={bookmarks}
        onToggleBookmark={onToggleBookmark}
      />

      {rest.length > 0 && !showMore && (
        <button
          onClick={() => setShowMore(true)}
          className="w-full flex items-center justify-center gap-2 py-3 mt-2 rounded-xl
                     bg-black/[0.02] border border-black/[0.04] hover:bg-black/[0.03]
                     hover:border-black/[0.06] transition-all text-[13px] text-muted-foreground/70
                     hover:text-muted-foreground group"
        >
          <span>Show {rest.length} more properties</span>
          <ChevronDown className="w-4 h-4 transition-transform group-hover:translate-y-0.5" />
        </button>
      )}

      <AnimatePresence>
        {showMore && rest.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <button
              onClick={() => setShowMore(false)}
              className="w-full flex items-center justify-center gap-2 py-2 mt-4 mb-2
                         text-[12px] text-muted-foreground/50 hover:text-muted-foreground transition-colors"
            >
              <span>Hide additional properties</span>
              <ChevronDown className="w-3.5 h-3.5 rotate-180" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {onAction && (
        <button
          onClick={() => onAction('Search again with different criteria')}
          className="flex items-center gap-2 mt-4 px-4 py-2.5 rounded-xl
                     bg-black/[0.02] border border-black/[0.06] hover:bg-black/[0.04]
                     hover:border-black/[0.08] transition-all text-[13px] text-muted-foreground/70
                     hover:text-muted-foreground"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Re-scan with different criteria</span>
        </button>
      )}
    </div>
  );
};

export default PropertyResultsSection;
