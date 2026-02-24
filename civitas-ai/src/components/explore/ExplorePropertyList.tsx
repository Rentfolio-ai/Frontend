// FILE: src/components/explore/ExplorePropertyList.tsx
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ExplorePropertyCard } from './ExplorePropertyCard';
import type { Property } from '../../services/v2PropertyApi';
import type { BookmarkedProperty } from '../../types/bookmarks';

// ============================================================================
// Skeleton Card
// ============================================================================

const SkeletonCard: React.FC = () => (
  <div className="flex flex-col rounded-xl bg-[#1a1a1f] border border-white/[0.04]">
    <div className="aspect-[4/3] bg-white/[0.03] animate-pulse rounded-t-xl" />
    <div className="px-3 pt-2.5 pb-3 flex flex-col gap-2 flex-shrink-0">
      <div className="h-5 w-24 bg-white/[0.04] rounded animate-pulse" />
      <div className="h-3.5 w-32 bg-white/[0.03] rounded animate-pulse" />
      <div className="h-3 w-40 bg-white/[0.02] rounded animate-pulse" />
      <div className="h-3 w-36 bg-white/[0.02] rounded animate-pulse" />
    </div>
  </div>
);

// ============================================================================
// Component
// ============================================================================

interface ExplorePropertyListProps {
  properties: Property[];
  totalFound: number;
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
  hoveredPropertyId: string | null;
  bookmarks?: BookmarkedProperty[];
  onPageChange: (page: number) => void;
  onHoverProperty: (id: string | null) => void;
  onToggleBookmark?: (property: Property) => void;
  onAnalyzeProperty?: (property: Property) => void;
}

export const ExplorePropertyList: React.FC<ExplorePropertyListProps> = ({
  properties,
  totalFound,
  currentPage,
  totalPages,
  isLoading,
  hoveredPropertyId,
  bookmarks = [],
  onPageChange,
  onHoverProperty,
  onToggleBookmark,
  onAnalyzeProperty,
}) => {
  const isBookmarked = (property: Property): boolean => {
    return bookmarks.some(
      b => b.address === property.address || b.listing_id === property.id
    );
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Scroll container */}
      <div
        className="flex-1 overflow-y-auto p-4"
        style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.06) transparent' }}
      >
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : properties.length === 0 ? (
          <div className="flex items-center justify-center py-16">
            <p className="text-[13px] text-white/25">No properties found. Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {properties.map(property => (
              <ExplorePropertyCard
                key={property.id}
                property={property}
                isBookmarked={isBookmarked(property)}
                isHighlighted={hoveredPropertyId === property.id}
                onToggleBookmark={() => onToggleBookmark?.(property)}
                onAnalyze={() => onAnalyzeProperty?.(property)}
                onHover={onHoverProperty}
              />
            ))}
          </div>
        )}
      </div>

      {/* Pagination bar */}
      {totalPages > 1 && !isLoading && (
        <div className="flex-shrink-0 flex items-center justify-between px-4 py-2.5 border-t border-white/[0.06] bg-[#171719]">
          <span className="text-[11px] text-white/25">
            Page {currentPage} of {totalPages}
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="p-1.5 rounded-lg text-white/40 hover:text-white/70 hover:bg-white/[0.04]
                disabled:opacity-25 disabled:cursor-not-allowed transition-all duration-150"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Page pills */}
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              let page: number;
              if (totalPages <= 7) {
                page = i + 1;
              } else if (currentPage <= 4) {
                page = i + 1;
              } else if (currentPage >= totalPages - 3) {
                page = totalPages - 6 + i;
              } else {
                page = currentPage - 3 + i;
              }
              return (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  className={`w-7 h-7 rounded-lg text-[11px] font-medium transition-all duration-150
                    ${page === currentPage
                      ? 'bg-white/[0.10] text-white/80'
                      : 'text-white/30 hover:text-white/60 hover:bg-white/[0.04]'
                    }`}
                >
                  {page}
                </button>
              );
            })}

            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="p-1.5 rounded-lg text-white/40 hover:text-white/70 hover:bg-white/[0.04]
                disabled:opacity-25 disabled:cursor-not-allowed transition-all duration-150"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <span className="text-[11px] text-white/25">
            {totalFound.toLocaleString()} total
          </span>
        </div>
      )}
    </div>
  );
};
