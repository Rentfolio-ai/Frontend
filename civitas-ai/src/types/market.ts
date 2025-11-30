// FILE: src/types/market.ts
/**
 * Type definitions for Market Data API endpoints
 */

// ============================================================================
// Market Statistics
// ============================================================================

export type MarketDataType = 'All' | 'Sale' | 'Rental';

export type MarketAssessment = 'seller_favored' | 'buyer_favored' | 'neutral';

export interface MarketSaleData {
  median_price?: number;
  average_price?: number;
  price_per_sqft?: number;
  avg_days_on_market?: number;
  total_listings?: number;
  yoy_growth?: number;
}

export interface MarketRentalData {
  median_rent?: number;
  average_rent?: number;
  rent_per_sqft?: number;
  avg_days_on_market?: number;
  total_listings?: number;
}

export interface MarketSummary {
  assessment: MarketAssessment;
  gross_yield: number;
  highlights: string[];
}

export interface MarketStatsResponse {
  // Flat convenience fields (use these!)
  zip_code: string;
  location: string;
  median_price: number | null;
  average_price: number | null;
  median_rent: number | null;
  average_rent: number | null;
  days_on_market: number | null;      // Can be a float (e.g., 120.2)
  price_per_sqft: number | null;
  rent_per_sqft: number | null;
  yoy_growth: number | null;          // Percentage (e.g., 3.5)
  gross_yield: number | null;         // Percentage (e.g., 5.55)
  total_sale_listings: number | null;
  total_rental_listings: number | null;
  
  // Nested detailed data (optional to use)
  sale_data: MarketSaleData | null;
  rental_data: MarketRentalData | null;
  market_summary: MarketSummary | null;
  data_source: string;                // e.g., "rentcast"
}

export interface MarketStatsParams {
  zip_code: string;
  data_type?: MarketDataType;
  history_range?: number; // in months
}

// ============================================================================
// Sale Listings
// ============================================================================

export interface SaleListingParams {
  zip_code?: string;
  city?: string;
  state?: string;
  min_price?: number;
  max_price?: number;
  bedrooms?: number;
  bathrooms?: number;
  property_type?: string;
  limit?: number;
}

export interface SaleListing {
  listing_id: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  year_built?: number;
  property_type?: string;
  days_on_market?: number;
  listing_url?: string;
  photos?: string[];
  hoa_fee?: number;
  description?: string;
  listing_type?: string;
  mls_number?: string;
  lot_size?: number;
}

export interface SaleListingsResponse {
  success: boolean;
  listings: SaleListing[];
  total_count: number;
  filters_applied?: Record<string, unknown>;
}

// ============================================================================
// Rental Listings
// ============================================================================

export interface RentalListingParams {
  zip_code?: string;
  city?: string;
  state?: string;
  min_rent?: number;
  max_rent?: number;
  bedrooms?: number;
  bathrooms?: number;
  property_type?: string;
  limit?: number;
}

export interface RentalListing {
  listing_id: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  rent: number;
  bedrooms: number;
  bathrooms: number;
  sqft?: number;
  property_type?: string;
  days_on_market?: number;
  listing_url?: string;
  photos?: string[];
  description?: string;
  amenities?: string[];
  pets_allowed?: boolean;
  deposit?: number;
}

export interface RentalListingsResponse {
  success: boolean;
  listings: RentalListing[];
  total_count: number;
  filters_applied?: Record<string, unknown>;
}
