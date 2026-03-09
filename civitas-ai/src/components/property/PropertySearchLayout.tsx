/**
 * PropertySearchLayout – Stacked property search experience for Civitas AI.
 *
 * Grid (full-width): Top Picks + More Matches
 * Map (collapsible, full-width): Below the grid as a spatial summary
 *
 * No viewport-width hacks. Map stays within parent container.
 * Responsive map height: 320px mobile, 400px desktop.
 */

import React, { useState, useCallback, useMemo } from 'react';
import { MapIcon, ChevronUp, ChevronDown } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { PropertyResultsGrid } from '../chat/tool-cards/PropertyResultsGrid';
import { PropertyMapView } from './PropertyMapView';
import type { PropertyCardData } from '../chat/tool-cards/PropertyGridCard';
import type { ScoutedProperty } from '../../types/backendTools';
import type { BookmarkedProperty } from '../../types/bookmarks';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || '';

/* ── Props ─────────────────────────────────────────────────────────── */

interface PropertySearchLayoutProps {
  topPicks: PropertyCardData[];
  moreMatches: PropertyCardData[];
  totalFound: number;
  marketContext?: any;
  onAction?: (query: string) => void;
  bookmarks?: BookmarkedProperty[];
  onToggleBookmark?: (property: ScoutedProperty) => void;
}

/* ── Main Component ────────────────────────────────────────────────── */

export const PropertySearchLayout: React.FC<PropertySearchLayoutProps> = ({
  topPicks,
  moreMatches,
  totalFound,
  marketContext,
  onAction,
  bookmarks,
  onToggleBookmark,
}) => {
  const [hoveredPropertyId, setHoveredPropertyId] = useState<string | null>(null);
  const [mapExpanded, setMapExpanded] = useState(true);

  const allProperties = useMemo(() => [...topPicks, ...moreMatches], [topPicks, moreMatches]);

  const hasMapData = useMemo(() =>
    !!MAPBOX_TOKEN && allProperties.some(p => p.lat != null && p.lng != null && p.lat !== 0 && p.lng !== 0),
    [allProperties]
  );

  const handleHover = useCallback((id: string | null) => {
    setHoveredPropertyId(id);
  }, []);

  const handleMapSelectProperty = useCallback((id: string) => {
    const property = allProperties.find(p =>
      (p.listing_id || p.id || p.property_id || p.address) === id
    );
    if (property) {
      const address = property.address || property.formattedAddress || '';
      onAction?.(`Tell me more about ${address}${property.city ? `, ${property.city}` : ''}`);
    }
  }, [allProperties, onAction]);

  const mappableCount = allProperties.filter(p => p.lat && p.lng).length;

  return (
    <div className="my-4 w-full">
      {/* ── Property grid ── */}
      <PropertyResultsGrid
        topPicks={topPicks}
        moreMatches={moreMatches}
        totalFound={totalFound}
        marketContext={marketContext}
        onAction={onAction}
        bookmarks={bookmarks}
        onToggleBookmark={onToggleBookmark}
        hoveredPropertyId={hoveredPropertyId}
        onHoverProperty={handleHover}
      />

      {/* ── Map (collapsible, below grid) ── */}
      {hasMapData && (
        <div className="mt-6">
          <button
            onClick={() => setMapExpanded(!mapExpanded)}
            className={cn(
              'flex items-center gap-2.5 w-full px-4 py-2.5 text-[12px] font-medium transition-all',
              'bg-background/50 border border-black/[0.08] hover:bg-background/70',
              mapExpanded ? 'rounded-t-2xl' : 'rounded-2xl',
            )}
          >
            <MapIcon className="w-4 h-4 text-muted-foreground/60" />
            <span className="text-muted-foreground">
              {mapExpanded ? 'Hide Map' : 'View on Map'}
            </span>
            <span className="text-muted-foreground/40 text-[10px]">
              {mappableCount} pins
            </span>
            <div className="flex-1" />
            {mapExpanded
              ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground/50" />
              : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground/50" />
            }
          </button>

          <AnimatePresence initial={false}>
            {mapExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden rounded-b-2xl"
              >
                <PropertyMapView
                  properties={allProperties}
                  hoveredPropertyId={hoveredPropertyId}
                  onHoverProperty={handleHover}
                  onSelectProperty={handleMapSelectProperty}
                  className="w-full h-[450px] sm:h-[550px]"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default PropertySearchLayout;
