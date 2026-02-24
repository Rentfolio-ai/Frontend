// FILE: src/components/pages/PropertyExplorePage.tsx
import React, { useMemo, useCallback, useState, useEffect, useRef } from 'react';
import { ExploreFilterBar } from '../explore/ExploreFilterBar';
import { ExplorePropertyList } from '../explore/ExplorePropertyList';
import { PropertyMapView } from '../property/PropertyMapView';
import { usePropertyExplore } from '../../hooks/usePropertyExplore';
import type { Property } from '../../services/v2PropertyApi';
import type { PropertyCardData } from '../chat/tool-cards/PropertyGridCard';
import type { BookmarkedProperty } from '../../types/bookmarks';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || '';

// ============================================================================
// Geocoding helper
// ============================================================================

interface GeoCoord { lat: number; lng: number }

async function geocodeAddress(address: string, city: string, state: string, zip?: string): Promise<GeoCoord | null> {
  if (!MAPBOX_TOKEN) return null;
  const parts = [address, city, state, zip].filter(Boolean).join(', ');
  if (!parts) return null;
  try {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(parts)}.json?access_token=${MAPBOX_TOKEN}&limit=1`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const feature = data.features?.[0];
    if (!feature?.center) return null;
    return { lng: feature.center[0], lat: feature.center[1] };
  } catch {
    return null;
  }
}

// ============================================================================
// Adapter
// ============================================================================

function toMapProperty(p: Property, geocoded?: Record<string, GeoCoord>): PropertyCardData {
  const geo = geocoded?.[p.id];
  return {
    id: p.id,
    address: p.address,
    city: p.city,
    state: p.state,
    zip_code: p.zip_code,
    price: p.price,
    beds: p.beds,
    baths: p.baths,
    sqft: p.sqft,
    year_built: p.year_built,
    property_type: p.property_type,
    image_url: p.image_url,
    lat: p.latitude ?? geo?.lat,
    lng: p.longitude ?? geo?.lng,
    estimated_rent: p.estimated_rent,
    calculated_metrics: p.calculated_metrics
      ? {
          monthly_cash_flow: p.calculated_metrics.monthly_cash_flow,
          cap_rate: p.calculated_metrics.cap_rate,
          cash_on_cash_roi: p.calculated_metrics.cash_on_cash_roi,
          annual_noi: p.calculated_metrics.annual_noi,
          monthly_mortgage: p.calculated_metrics.monthly_mortgage,
          monthly_expenses: p.calculated_metrics.monthly_expenses,
          total_roi: p.calculated_metrics.total_roi,
        }
      : undefined,
  };
}

// ============================================================================
// Page Component
// ============================================================================

interface PropertyExplorePageProps {
  bookmarks?: BookmarkedProperty[];
  onToggleBookmark?: (property: Property) => void;
  onAnalyzeProperty?: (property: Property) => void;
  onBack?: () => void;
}

export const PropertyExplorePage: React.FC<PropertyExplorePageProps> = ({
  bookmarks = [],
  onToggleBookmark,
  onAnalyzeProperty,
  onBack: _onBack,
}) => {
  const {
    filters,
    properties,
    allProperties,
    totalFound,
    totalPages,
    currentPage,
    isLoading,
    error,
    hoveredPropertyId,
    search,
    updateFilter,
    resetFilters,
    setCurrentPage,
    setHoveredPropertyId,
  } = usePropertyExplore();

  // Geocoded coordinates cache + batch advancement counter
  const [geocodedCoords, setGeocodedCoords] = useState<Record<string, GeoCoord>>({});
  const [geocodeBatchKey, setGeocodeBatchKey] = useState(0);
  const geocodedIds = useRef<Set<string>>(new Set());

  // Geocode properties missing lat/lng in parallel batches of 10
  useEffect(() => {
    if (!MAPBOX_TOKEN || allProperties.length === 0) return;

    const needsGeocoding = allProperties.filter(
      p => (p.latitude == null || p.latitude === 0) &&
           (p.longitude == null || p.longitude === 0) &&
           !geocodedIds.current.has(p.id)
    );

    if (needsGeocoding.length === 0) return;

    const batch = needsGeocoding.slice(0, 10);
    batch.forEach(p => geocodedIds.current.add(p.id));

    const runBatch = async () => {
      const results: Record<string, GeoCoord> = {};
      const promises = batch.map(async (p) => {
        const coord = await geocodeAddress(p.address, p.city, p.state, p.zip_code);
        if (coord) results[p.id] = coord;
      });
      await Promise.allSettled(promises);

      if (Object.keys(results).length > 0) {
        setGeocodedCoords(prev => ({ ...prev, ...results }));
      }
      // Always advance to trigger next batch even if zero results
      setGeocodeBatchKey(k => k + 1);
    };

    runBatch();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allProperties, geocodeBatchKey]);

  const mapProperties = useMemo(
    () => allProperties.map(p => toMapProperty(p, geocodedCoords)),
    [allProperties, geocodedCoords]
  );

  const handleSearch = useCallback(() => {
    search();
  }, [search]);

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ backgroundColor: '#111114' }}>
      <ExploreFilterBar
        filters={filters}
        onUpdateFilter={updateFilter}
        onSearch={handleSearch}
        onReset={resetFilters}
        isLoading={isLoading}
        totalFound={totalFound}
      />

      {error && (
        <div className="px-4 py-2 bg-red-500/10 border-b border-red-500/20">
          <span className="text-[12px] text-red-400">{error}</span>
        </div>
      )}

      {/* Always show 60/40 split */}
      <div className="flex-1 flex overflow-hidden">
        <div className="w-[60%] min-w-0 flex flex-col overflow-hidden bg-[#111114]">
          <ExplorePropertyList
            properties={properties}
            totalFound={totalFound}
            currentPage={currentPage}
            totalPages={totalPages}
            isLoading={isLoading}
            hoveredPropertyId={hoveredPropertyId}
            bookmarks={bookmarks}
            onPageChange={setCurrentPage}
            onHoverProperty={setHoveredPropertyId}
            onToggleBookmark={onToggleBookmark}
            onAnalyzeProperty={onAnalyzeProperty}
          />
        </div>

        <div className="w-[40%] min-w-0 relative shadow-[-4px_0_12px_rgba(0,0,0,0.3)]">
          <PropertyMapView
            properties={mapProperties}
            hoveredPropertyId={hoveredPropertyId}
            onHoverProperty={setHoveredPropertyId}
            className="w-full h-full"
          />
        </div>
      </div>
    </div>
  );
};
