// FILE: src/components/chat/tool-cards/PropertyBookmarkCard.tsx
// Displays scouted properties with bookmark functionality instead of full property cards

import React from 'react';
import { cn } from '@/lib/utils';
import type { ScoutedProperty } from '@/types/backendTools';
import type { BookmarkedProperty } from '@/types/bookmarks';
import type { InvestmentStrategy } from '@/types/pnl';
import { PropertyResultsGrid } from './PropertyResultsGrid';

// Icons
const BookmarkIcon = ({ filled = false, className }: { filled?: boolean; className?: string }) => (
  <svg
    className={cn('w-5 h-5 transition-colors', className)}
    fill={filled ? 'currentColor' : 'none'}
    stroke="currentColor"
    viewBox="0 0 24 24"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
    />
  </svg>
);

const ExternalLinkIcon = ({ className }: { className?: string }) => (
  <svg className={cn('w-4 h-4', className)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
  </svg>
);

interface PropertyBookmarkItemProps {
  property: ScoutedProperty;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  lastUpdated?: string;
  onOpenDealAnalyzer?: (propertyId: string | null, strategy: InvestmentStrategy, purchasePrice?: number, propertyAddress?: string) => void;
}

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

const formatSqft = (sqft: number): string => {
  return new Intl.NumberFormat('en-US').format(sqft);
};

const formatHoaFee = (fee: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(fee) + '/mo';
};

// Badge colors for listing types
const getListingTypeBadge = (type: string): { bg: string; text: string } => {
  switch (type.toLowerCase()) {
    case 'foreclosure':
      return { bg: 'bg-red-100 dark:bg-red-900/40', text: 'text-red-700 dark:text-red-400' };
    case 'short sale':
      return { bg: 'bg-orange-100 dark:bg-orange-900/40', text: 'text-orange-700 dark:text-orange-400' };
    case 'new construction':
      return { bg: 'bg-blue-100 dark:bg-blue-900/40', text: 'text-blue-700 dark:text-blue-400' };
    default:
      return { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-600 dark:text-slate-400' };
  }
};

const formatRelativeTime = (isoString?: string): string => {
  if (!isoString) return '';

  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
};

const PropertyBookmarkItem: React.FC<PropertyBookmarkItemProps> = ({
  property,
  isBookmarked,
  onToggleBookmark,
  lastUpdated,
  onOpenDealAnalyzer,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const cashOnCash = property.cash_on_cash_roi;
  const isHighROI = cashOnCash && cashOnCash > 10;

  // Build location string
  const locationParts = [property.city, property.state].filter(Boolean);
  const locationStr = locationParts.length > 0
    ? locationParts.join(', ')
    : property.zip_code;

  // Check for special listing type (non-standard)
  const hasSpecialListingType = property.listing_type &&
    property.listing_type.toLowerCase() !== 'standard';
  const listingTypeBadge = property.listing_type ? getListingTypeBadge(property.listing_type) : null;

  // Check if there's additional info to show
  const hasAdditionalInfo = property.description || property.hoa_fee || property.lot_size || property.mls_number;

  return (
    <div className={cn(
      'group rounded-lg transition-all',
      'hover:bg-slate-100/80 dark:hover:bg-slate-800/50',
      isBookmarked && 'bg-blue-50/60 dark:bg-blue-900/20'
    )}>
      {/* Main Row */}
      <div className="flex items-center gap-2 py-2 px-3">
        {/* Bookmark Button - More Prominent */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('[PropertyBookmarkItem] Bookmark button clicked', { isBookmarked, property: property.address });
            onToggleBookmark();
          }}
          className={cn(
            'flex-shrink-0 transition-all hover:scale-110 p-1.5 rounded-md',
            'flex items-center justify-center relative z-10',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
            isBookmarked
              ? 'text-blue-500 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/40'
              : 'text-slate-400 hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700'
          )}
          title={isBookmarked ? 'Remove bookmark' : 'Bookmark property'}
          aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark property'}
        >
          <BookmarkIcon filled={isBookmarked} className="w-5 h-5" />
        </button>

        {/* Property Info - Single Line */}
        <div
          className="flex-1 min-w-0 flex items-center gap-2 cursor-pointer"
          onClick={(e) => {
            // Don't trigger if clicking on a button or link
            const target = e.target as HTMLElement;
            if (target.tagName === 'BUTTON' || target.tagName === 'A' || target.closest('button') || target.closest('a')) {
              return;
            }
            console.log('[PropertyBookmarkItem] Property row clicked');
            onToggleBookmark();
          }}
        >
          <span className="font-medium text-sm text-slate-700 dark:text-slate-200 truncate">
            {property.address}
          </span>
          {locationStr && (
            <span className="text-xs text-slate-400 dark:text-slate-500 flex-shrink-0">
              {locationStr}
            </span>
          )}
          {/* Listing Type Badge */}
          {hasSpecialListingType && listingTypeBadge && (
            <span className={cn(
              'text-[10px] font-medium px-1.5 py-0.5 rounded flex-shrink-0',
              listingTypeBadge.bg,
              listingTypeBadge.text
            )}>
              {property.listing_type}
            </span>
          )}
        </div>

        {/* Metrics */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Property specs */}
          <span className="text-xs text-slate-400 hidden sm:inline">
            {property.bedrooms}bd · {property.bathrooms}ba
          </span>

          {/* HOA Fee indicator */}
          {property.hoa_fee !== undefined && property.hoa_fee > 0 && (
            <span className="text-[10px] text-slate-400 hidden md:inline" title="Monthly HOA">
              HOA {formatHoaFee(property.hoa_fee)}
            </span>
          )}

          {/* ROI Badge */}
          {cashOnCash !== undefined && (
            <span className={cn(
              'text-xs font-medium px-1.5 py-0.5 rounded',
              isHighROI
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
                : 'text-slate-500'
            )}>
              {cashOnCash.toFixed(1)}%
            </span>
          )}

          {/* Price */}
          <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">
            {formatPrice(property.price)}
          </span>

          {/* Analyze Button */}
          {onOpenDealAnalyzer && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenDealAnalyzer(property.listing_id || null, 'LTR', property.price, property.address);
              }}
              className="ml-2 px-2 py-1 rounded bg-primary/10 hover:bg-primary/20 text-primary text-xs font-medium transition-colors"
              title="Analyze Deal"
            >
              Analyze
            </button>
          )}
        </div>

        {/* Expand button for additional info */}
        {hasAdditionalInfo && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className={cn(
              'flex-shrink-0 p-1 rounded transition-all',
              'text-slate-300 hover:text-slate-500',
              isExpanded && 'text-slate-500'
            )}
            title={isExpanded ? 'Show less' : 'Show more'}
          >
            <svg
              className={cn('w-3.5 h-3.5 transition-transform', isExpanded && 'rotate-180')}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        )}

        {/* External Link */}
        {property.listing_url && (
          <a
            href={property.listing_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className={cn(
              'flex-shrink-0 p-1 rounded transition-all',
              'text-slate-300 hover:text-slate-500',
              'opacity-0 group-hover:opacity-100'
            )}
            title="View listing"
          >
            <ExternalLinkIcon className="w-3.5 h-3.5" />
          </a>
        )}

        {/* Updated indicator for bookmarked items */}
        {isBookmarked && lastUpdated && (
          <span className="text-[10px] text-slate-400 flex-shrink-0 hidden lg:inline">
            {formatRelativeTime(lastUpdated)}
          </span>
        )}
      </div>

      {/* Expanded Details */}
      {isExpanded && hasAdditionalInfo && (
        <div className="px-3 pb-2 pt-0 ml-6 space-y-2 border-t border-slate-100 dark:border-slate-800 mt-1">
          {/* MLS & Lot Size Row */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            {property.mls_number && (
              <span className="text-xs text-slate-500 dark:text-slate-400">
                <span className="font-medium">MLS#</span> {property.mls_number}
              </span>
            )}
            {property.lot_size && (
              <span className="text-xs text-slate-500 dark:text-slate-400">
                <span className="font-medium">Lot:</span> {formatSqft(property.lot_size)} sqft
              </span>
            )}
            {property.sqft && (
              <span className="text-xs text-slate-500 dark:text-slate-400">
                <span className="font-medium">Living:</span> {formatSqft(property.sqft)} sqft
              </span>
            )}
            {property.year_built && (
              <span className="text-xs text-slate-500 dark:text-slate-400">
                <span className="font-medium">Built:</span> {property.year_built}
              </span>
            )}
          </div>

          {/* Description */}
          {property.description && (
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">
              {property.description}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

// Data format coming from scout_properties tool
interface ScoutPropertiesData {
  properties?: ScoutedProperty[];
  total_found?: number;
  location?: string;
  success?: boolean;
}

// Legacy format from PropertyComparisonCard
interface LegacyPropertyData {
  address: string;
  price: string | number;
  beds: number;
  baths: number;
  sqft: number;
  roi: number;
}

interface LegacyPropertyComparisonData {
  properties: LegacyPropertyData[];
}

export interface PropertyBookmarkCardProps {
  data: ScoutPropertiesData | LegacyPropertyComparisonData;
  bookmarks?: BookmarkedProperty[];
  onToggleBookmark?: (property: ScoutedProperty) => void;
  onOpenDealAnalyzer?: (propertyId: string | null, strategy: InvestmentStrategy, purchasePrice?: number, propertyAddress?: string) => void;
}

// Convert legacy format to ScoutedProperty
function convertLegacyProperty(legacy: LegacyPropertyData, index: number): ScoutedProperty {
  return {
    listing_id: `legacy-${index}-${Date.now()}`,
    address: legacy.address,
    city: '',
    state: '',
    zip_code: '',
    price: typeof legacy.price === 'string'
      ? parseInt(legacy.price.replace(/[^0-9]/g, '')) || 0
      : legacy.price,
    bedrooms: legacy.beds,
    bathrooms: legacy.baths,
    sqft: legacy.sqft,
    cash_on_cash_roi: legacy.roi,
  };
}

// Type guard for scout data
function isScoutPropertiesData(data: unknown): data is ScoutPropertiesData {
  if (!data || typeof data !== 'object') return false;
  const d = data as Record<string, unknown>;
  return 'success' in d || ('properties' in d && Array.isArray(d.properties) && d.properties.length > 0 && 'listing_id' in (d.properties[0] || {}));
}

export const PropertyBookmarkCard: React.FC<PropertyBookmarkCardProps> = ({
  data,
  bookmarks = [],
  onToggleBookmark,
  onOpenDealAnalyzer,
}) => {
  // Normalize properties to ScoutedProperty format
  const properties: ScoutedProperty[] = React.useMemo(() => {
    if (isScoutPropertiesData(data)) {
      return data.properties || [];
    }

    // Legacy format
    const legacyData = data as LegacyPropertyComparisonData;
    if (Array.isArray(legacyData.properties)) {
      return legacyData.properties.map(convertLegacyProperty);
    }

    return [];
  }, [data]);

  // Create lookup for bookmarked properties
  const bookmarkLookup = React.useMemo(() => {
    const lookup = new Map<string, BookmarkedProperty>();
    bookmarks.forEach(bm => {
      if (bm.property.listing_id) {
        lookup.set(bm.property.listing_id, bm);
      }
      lookup.set(bm.property.address.toLowerCase(), bm);
    });
    return lookup;
  }, [bookmarks]);

  const isPropertyBookmarked = (property: ScoutedProperty): boolean => {
    if (property.listing_id && bookmarkLookup.has(property.listing_id)) {
      return true;
    }
    return bookmarkLookup.has(property.address.toLowerCase());
  };

  const getBookmarkData = (property: ScoutedProperty): BookmarkedProperty | undefined => {
    if (property.listing_id && bookmarkLookup.has(property.listing_id)) {
      return bookmarkLookup.get(property.listing_id);
    }
    return bookmarkLookup.get(property.address.toLowerCase());
  };

  if (properties.length === 0) {
    return null; // Don't render anything if no properties
  }

  // Check if properties have AI enhancements (V2 format)
  const hasAIEnhancements = properties.some(p => 
    'ai_match_score' in p || 'ai_badge' in p || 'ai_reason' in p
  );
  
  console.log('[PropertyBookmarkCard] hasAIEnhancements:', hasAIEnhancements);
  
  // Use simple property grid for V2 results with AI enhancements
  if (hasAIEnhancements) {
    console.log('[PropertyBookmarkCard] ✅ Using SIMPLE V2 cards!');
    return <PropertyResultsGrid properties={properties} bookmarks={bookmarks} onToggleBookmark={onToggleBookmark} />;
  }

  // Use standard bookmark list for V1 results
  return (
    <div className="space-y-2 mt-3">
      {properties.map((property, index) => {
        const bookmarkData = getBookmarkData(property);
        return (
          <PropertyBookmarkItem
            key={property.listing_id || `prop-${index}`}
            property={property}
            isBookmarked={isPropertyBookmarked(property)}
            onToggleBookmark={() => {
              console.log('[PropertyBookmarkCard] Toggle bookmark clicked', { property, hasHandler: !!onToggleBookmark });
              if (onToggleBookmark) {
                try {
                  onToggleBookmark(property);
                  console.log('[PropertyBookmarkCard] Bookmark handler called successfully');
                } catch (error) {
                  console.error('[PropertyBookmarkCard] Error calling bookmark handler:', error);
                }
              } else {
                console.warn('[PropertyBookmarkCard] onToggleBookmark handler not provided');
              }
            }}
            lastUpdated={bookmarkData?.lastUpdatedAt}
            onOpenDealAnalyzer={onOpenDealAnalyzer}
          />
        );
      })}
    </div>
  );
};

