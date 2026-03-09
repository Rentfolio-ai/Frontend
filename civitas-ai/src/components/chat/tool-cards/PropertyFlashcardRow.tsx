import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ChevronDown, Sparkles, Bookmark } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PropertyFlashcard } from './PropertyFlashcard';
import type { PropertyCardData } from './PropertyGridCard';
import type { BookmarkedProperty } from '@/types/bookmarks';
import type { ScoutedProperty } from '@/types/backendTools';

interface PropertyFlashcardRowProps {
  topPicks?: PropertyCardData[];
  moreMatches?: PropertyCardData[];
  properties?: PropertyCardData[];
  totalFound?: number;
  marketContext?: { location?: string };
  bookmarks?: BookmarkedProperty[];
  onToggleBookmark?: (property: ScoutedProperty) => void;
}

export const PropertyFlashcardRow: React.FC<PropertyFlashcardRowProps> = ({
  topPicks = [],
  moreMatches = [],
  properties = [],
  totalFound,
  marketContext,
  bookmarks = [],
  onToggleBookmark,
}) => {
  const [moreOpen, setMoreOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const top5 = topPicks.length > 0 ? topPicks.slice(0, 5) : properties.slice(0, 5);
  const rest = moreMatches.length > 0
    ? moreMatches
    : (topPicks.length > 0 ? [] : properties.slice(5));

  const total = totalFound ?? (top5.length + rest.length);
  const location = marketContext?.location || '';

  const isBookmarked = (p: PropertyCardData) =>
    bookmarks.some(b =>
      (b.listing_id && b.listing_id === (p.listing_id || p.id)) ||
      (b.address && b.address === p.address)
    );

  const scroll = (dir: 'left' | 'right') => {
    scrollRef.current?.scrollBy({ left: dir === 'left' ? -230 : 230, behavior: 'smooth' });
  };

  if (top5.length === 0) return null;

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-3.5 h-3.5 text-[#C08B5C]/60" />
        <span className="text-[13px] font-medium text-muted-foreground">
          {total} {total === 1 ? 'property' : 'properties'} found{location ? ` in ${location}` : ''}
        </span>
        <span className="text-[10px] text-muted-foreground/50 bg-black/[0.03] px-1.5 py-0.5 rounded">AI-ranked</span>
      </div>

      {/* Carousel */}
      <div className="relative group/carousel">
        {/* Left arrow */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-black/60 backdrop-blur-sm border border-black/8 flex items-center justify-center text-muted-foreground hover:text-foreground/80 hover:bg-black/80 transition-all opacity-0 group-hover/carousel:opacity-100"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Scroll container */}
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory scroll-smooth"
          style={{ scrollbarWidth: 'none' }}
        >
          {top5.map((p, i) => (
            <PropertyFlashcard
              key={p.listing_id || p.id || `top-${i}`}
              property={p}
              rank={i + 1}
              isBookmarked={isBookmarked(p)}
              onToggleBookmark={onToggleBookmark ? () => onToggleBookmark(p as unknown as ScoutedProperty) : undefined}
            />
          ))}
        </div>

        {/* Right arrow */}
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-black/60 backdrop-blur-sm border border-black/8 flex items-center justify-center text-muted-foreground hover:text-foreground/80 hover:bg-black/80 transition-all opacity-0 group-hover/carousel:opacity-100"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* More matches collapsible */}
      {rest.length > 0 && (
        <div className="mt-3">
          <button
            onClick={() => setMoreOpen(!moreOpen)}
            className="flex items-center gap-1.5 text-[12px] text-muted-foreground/60 hover:text-foreground/55 transition-colors"
          >
            <motion.div animate={{ rotate: moreOpen ? 180 : 0 }} transition={{ duration: 0.15 }}>
              <ChevronDown className="w-3.5 h-3.5" />
            </motion.div>
            {moreOpen ? 'Hide' : 'Show'} {rest.length} more {rest.length === 1 ? 'match' : 'matches'}
          </button>

          <AnimatePresence>
            {moreOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="mt-2 space-y-0.5 max-h-[280px] overflow-y-auto scrollbar-thin scrollbar-thumb-black/10 scrollbar-track-transparent">
                  {rest.map((p, i) => {
                    const addr = (p.formattedAddress || p.address || 'Unknown');
                    const short = addr.length > 35 ? addr.slice(0, 33) + '...' : addr;
                    const beds = p.bedrooms ?? p.beds ?? 0;
                    const baths = p.bathrooms ?? p.baths ?? 0;
                    const price = p.price ?? 0;
                    const bookmarked = isBookmarked(p);

                    return (
                      <div
                        key={p.listing_id || p.id || `more-${i}`}
                        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-black/[0.02] transition-colors"
                      >
                        <span className="text-[10px] text-muted-foreground/40 w-4 text-right flex-shrink-0">{i + top5.length + 1}</span>
                        <span className="text-[12px] text-muted-foreground/70 flex-1 min-w-0 truncate">{short}</span>
                        <span className="text-[10px] text-muted-foreground/50 flex-shrink-0">{beds}bd · {baths}ba</span>
                        <span className="text-[12px] font-semibold text-[#F5E6D0]/70 flex-shrink-0">${price.toLocaleString()}</span>
                        {onToggleBookmark && (
                          <button
                            onClick={() => onToggleBookmark(p as unknown as ScoutedProperty)}
                            className="p-0.5 flex-shrink-0"
                          >
                            <Bookmark className={cn('w-3 h-3', bookmarked ? 'fill-[#C08B5C] text-[#C08B5C]' : 'text-muted-foreground/40 hover:text-muted-foreground/70')} />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
