// FILE: src/hooks/usePropertyExplore.ts
import { useState, useCallback, useRef, useEffect } from 'react';
import { V2PropertyApi } from '../services/v2PropertyApi';
import type { Property, PropertySearchResponse } from '../services/v2PropertyApi';
import { usePreferencesStore } from '../stores/preferencesStore';

// ============================================================================
// Types
// ============================================================================

export interface ExploreFilters {
  location: string;
  minPrice: number | null;
  maxPrice: number | null;
  minBeds: number | null;
  minBaths: number | null;
  propertyTypes: string[];
  strategy: 'STR' | 'LTR' | 'FLIP' | null;
  minCapRate: number | null;
  maxCapRate: number | null;
  minCashFlow: number | null;
  minCocRoi: number | null;
  minSqft: number | null;
  maxSqft: number | null;
  yearBuiltMin: number | null;
  sortBy: SortOption;
}

export type SortOption =
  | 'price_low'
  | 'price_high'
  | 'newest'
  | 'cap_rate'
  | 'cash_flow'
  | 'sqft';

const DEFAULT_FILTERS: ExploreFilters = {
  location: '',
  minPrice: null,
  maxPrice: null,
  minBeds: null,
  minBaths: null,
  propertyTypes: [],
  strategy: null,
  minCapRate: null,
  maxCapRate: null,
  minCashFlow: null,
  minCocRoi: null,
  minSqft: null,
  maxSqft: null,
  yearBuiltMin: null,
  sortBy: 'price_low',
};

const PAGE_SIZE = 24;

// Metric-only filter keys (client-side only, no API refetch needed)
const METRIC_KEYS: (keyof ExploreFilters)[] = [
  'minCapRate', 'maxCapRate', 'minCashFlow', 'minCocRoi',
  'minSqft', 'maxSqft', 'yearBuiltMin', 'sortBy', 'propertyTypes',
];

// ============================================================================
// Hook
// ============================================================================

export function usePropertyExplore() {
  const lastSearchCity = usePreferencesStore(s => s.lastSearchCity);
  const favoriteMarkets = usePreferencesStore(s => s.favoriteMarkets);
  const setLastSearchCity = usePreferencesStore(s => s.setLastSearchCity);

  // Resolve initial location
  const initialLocation = lastSearchCity || (favoriteMarkets.length > 0 ? favoriteMarkets[0] : 'Austin, TX');

  const [filters, setFilters] = useState<ExploreFilters>({
    ...DEFAULT_FILTERS,
    location: initialLocation,
  });
  const [rawProperties, setRawProperties] = useState<Property[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [totalFound, setTotalFound] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hoveredPropertyId, setHoveredPropertyId] = useState<string | null>(null);

  const apiRef = useRef(new V2PropertyApi());
  const abortRef = useRef<AbortController | null>(null);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(false);
  const lastSearchParamsRef = useRef<string>('');

  // Derived: paginated slice
  const totalPages = Math.max(1, Math.ceil(properties.length / PAGE_SIZE));
  const paginatedProperties = properties.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  // Client-side sort
  const sortProperties = useCallback((props: Property[], sort: SortOption): Property[] => {
    const sorted = [...props];
    switch (sort) {
      case 'price_low':
        return sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
      case 'price_high':
        return sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
      case 'cap_rate':
        return sorted.sort((a, b) =>
          (b.calculated_metrics?.cap_rate || 0) - (a.calculated_metrics?.cap_rate || 0)
        );
      case 'cash_flow':
        return sorted.sort((a, b) =>
          (b.calculated_metrics?.monthly_cash_flow || 0) - (a.calculated_metrics?.monthly_cash_flow || 0)
        );
      case 'sqft':
        return sorted.sort((a, b) => (b.sqft || 0) - (a.sqft || 0));
      case 'newest':
      default:
        return sorted;
    }
  }, []);

  // Client-side metric filtering
  const applyMetricFilters = useCallback((props: Property[], f: ExploreFilters): Property[] => {
    return props.filter(p => {
      const m = p.calculated_metrics;
      if (f.minCapRate != null && (m?.cap_rate || 0) < f.minCapRate) return false;
      if (f.maxCapRate != null && (m?.cap_rate || 0) > f.maxCapRate) return false;
      if (f.minCashFlow != null && (m?.monthly_cash_flow || 0) < f.minCashFlow) return false;
      if (f.minCocRoi != null && (m?.cash_on_cash_roi || 0) < f.minCocRoi) return false;
      if (f.minSqft != null && (p.sqft || 0) < f.minSqft) return false;
      if (f.maxSqft != null && (p.sqft || 0) > f.maxSqft) return false;
      if (f.yearBuiltMin != null && (p.year_built || 0) < f.yearBuiltMin) return false;
      if (f.propertyTypes.length > 0) {
        const types = f.propertyTypes.map(t => t.toLowerCase());
        const pType = (p.property_type || '').toLowerCase();
        if (!types.some(t => pType.includes(t) || pType === t)) return false;
      }
      return true;
    });
  }, []);

  // Apply client-side filters + sort to raw results
  const applyLocalFilters = useCallback((raw: Property[], f: ExploreFilters) => {
    let results = applyMetricFilters(raw, f);
    results = sortProperties(results, f.sortBy);
    setProperties(results);
    setTotalFound(results.length);
    setCurrentPage(1);
  }, [applyMetricFilters, sortProperties]);

  // Search properties from API
  const search = useCallback(async (overrideFilters?: Partial<ExploreFilters>) => {
    const f = { ...filters, ...overrideFilters };

    if (!f.location.trim()) {
      setError('Enter a location to search');
      return;
    }

    // Cancel in-flight request
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    setIsLoading(true);
    setError(null);
    setCurrentPage(1);

    try {
      const response: PropertySearchResponse = await apiRef.current.searchProperties({
        location: f.location,
        min_price: f.minPrice ?? undefined,
        max_price: f.maxPrice ?? undefined,
        min_beds: f.minBeds ?? undefined,
        min_baths: f.minBaths ?? undefined,
        property_type: f.propertyTypes.length === 1 ? f.propertyTypes[0] : undefined,
        limit: 100,
        include_ai: false,
      });

      const raw = response.properties || [];
      setRawProperties(raw);

      // Save last search city
      if (f.location.trim()) {
        setLastSearchCity(f.location.trim());
      }

      // Build search params fingerprint to detect if API-level filters changed
      lastSearchParamsRef.current = JSON.stringify({
        location: f.location, minPrice: f.minPrice, maxPrice: f.maxPrice,
        minBeds: f.minBeds, minBaths: f.minBaths, propertyTypes: f.propertyTypes,
      });

      // Apply client-side filters
      applyLocalFilters(raw, f);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'Failed to search properties');
      }
    } finally {
      setIsLoading(false);
    }
  }, [filters, applyLocalFilters, setLastSearchCity]);

  // Update a single filter field
  const updateFilter = useCallback(<K extends keyof ExploreFilters>(
    key: K,
    value: ExploreFilters[K]
  ) => {
    setFilters(prev => {
      const next = { ...prev, [key]: value };

      // If only a metric/sort filter changed, apply locally from cached raw results
      if (METRIC_KEYS.includes(key) && rawProperties.length > 0) {
        applyLocalFilters(rawProperties, next);
        return next;
      }

      // For API-level filter changes, debounce and re-search
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);

      const delay = key === 'location' ? 600 : 400;
      searchTimerRef.current = setTimeout(() => {
        // Only trigger search if location is non-empty
        if (next.location.trim()) {
          // Check if API params actually changed
          const newParams = JSON.stringify({
            location: next.location, minPrice: next.minPrice, maxPrice: next.maxPrice,
            minBeds: next.minBeds, minBaths: next.minBaths, propertyTypes: next.propertyTypes,
          });
          if (newParams !== lastSearchParamsRef.current) {
            search(next);
          }
        }
      }, delay);

      return next;
    });
  }, [rawProperties, applyLocalFilters, search]);

  // Reset all filters
  const resetFilters = useCallback(() => {
    setFilters({ ...DEFAULT_FILTERS, location: initialLocation });
    setRawProperties([]);
    setProperties([]);
    setTotalFound(0);
    setCurrentPage(1);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
  }, [initialLocation]);

  // Auto-search on mount
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      if (filters.location.trim()) {
        search();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortRef.current) abortRef.current.abort();
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    };
  }, []);

  return {
    // State
    filters,
    properties: paginatedProperties,
    allProperties: properties,
    totalFound,
    totalPages,
    currentPage,
    isLoading,
    error,
    hoveredPropertyId,

    // Actions
    search,
    updateFilter,
    setFilters,
    resetFilters,
    setCurrentPage,
    setHoveredPropertyId,
  };
}
