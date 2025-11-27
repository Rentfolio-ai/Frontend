// FILE: src/components/chat/tool-cards/PropertyBookmarkCard.tsx
// Displays scouted properties with bookmark functionality instead of full property cards

import React from 'react';
import { cn } from '@/lib/utils';
import type { ScoutedProperty } from '@/types/backendTools';
import type { BookmarkedProperty } from '@/types/bookmarks';

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
}

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
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
}) => {
  const cashOnCash = property.cash_on_cash_roi;
  const isHighROI = cashOnCash && cashOnCash > 10;
  
  // Build location string
  const locationParts = [property.city, property.state].filter(Boolean);
  const locationStr = locationParts.length > 0 
    ? locationParts.join(', ') 
    : property.zip_code;
  
  return (
    <div className={cn(
      'group flex items-center gap-2 py-2 px-3 rounded-lg transition-all cursor-pointer',
      'hover:bg-slate-100/80 dark:hover:bg-slate-800/50',
      isBookmarked && 'bg-blue-50/60 dark:bg-blue-900/20'
    )}
    onClick={onToggleBookmark}
    >
      {/* Bookmark Icon */}
      <button
        className={cn(
          'flex-shrink-0 transition-all',
          isBookmarked 
            ? 'text-blue-500' 
            : 'text-slate-300 group-hover:text-slate-400'
        )}
        title={isBookmarked ? 'Remove bookmark' : 'Save property'}
      >
        <BookmarkIcon filled={isBookmarked} className="w-4 h-4" />
      </button>
      
      {/* Property Info - Single Line */}
      <div className="flex-1 min-w-0 flex items-center gap-2">
        <span className="font-medium text-sm text-slate-700 dark:text-slate-200 truncate">
          {property.address}
        </span>
        {locationStr && (
          <span className="text-xs text-slate-400 dark:text-slate-500 flex-shrink-0">
            {locationStr}
          </span>
        )}
      </div>
      
      {/* Metrics */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {/* Property specs */}
        <span className="text-xs text-slate-400 hidden sm:inline">
          {property.bedrooms}bd · {property.bathrooms}ba
        </span>
        
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
      </div>
      
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
  
  return (
    <div className="space-y-2 mt-3">
      {properties.map((property, index) => {
        const bookmarkData = getBookmarkData(property);
        return (
          <PropertyBookmarkItem
            key={property.listing_id || `prop-${index}`}
            property={property}
            isBookmarked={isPropertyBookmarked(property)}
            onToggleBookmark={() => onToggleBookmark?.(property)}
            lastUpdated={bookmarkData?.lastUpdatedAt}
          />
        );
      })}
    </div>
  );
};

