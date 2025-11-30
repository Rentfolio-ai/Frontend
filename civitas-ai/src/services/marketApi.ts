// FILE: src/services/marketApi.ts
/**
 * API client for Market Data endpoints
 */

import type {
  MarketStatsParams,
  MarketStatsResponse,
  SaleListingParams,
  SaleListingsResponse,
  RentalListingParams,
  RentalListingsResponse,
} from '../types/market';

// IMPORTANT: Always use environment variables for API URL
const API_BASE = import.meta.env.VITE_CIVITAS_API_URL || import.meta.env.VITE_API_URL;
if (!API_BASE) {
  console.error('API URL must be configured via environment variable (VITE_CIVITAS_API_URL or VITE_API_URL)');
  if (import.meta.env.DEV) {
    console.warn('Using localhost fallback for development');
  }
}

const CIVITAS_API_KEY = import.meta.env.VITE_API_KEY;

const defaultHeaders: HeadersInit = {
  'Content-Type': 'application/json',
  ...(CIVITAS_API_KEY ? { 'X-API-Key': CIVITAS_API_KEY } : {}),
};

class MarketAPI {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  /**
   * Get market statistics for a zip code
   * GET /api/market/stats
   */
  async getMarketStats(params: MarketStatsParams): Promise<MarketStatsResponse> {
    const queryParams = new URLSearchParams();
    queryParams.append('zip_code', params.zip_code);
    if (params.data_type) queryParams.append('data_type', params.data_type);
    if (params.history_range) queryParams.append('history_range', params.history_range.toString());

    const response = await fetch(
      `${this.baseURL}/api/market/stats?${queryParams}`,
      {
        method: 'GET',
        headers: defaultHeaders,
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to fetch market stats' }));
      throw new Error(error.message || 'Failed to fetch market stats');
    }

    return response.json();
  }

  /**
   * Get sale listings
   * GET /api/v1/market/listings/sale
   */
  async getSaleListings(params: SaleListingParams): Promise<SaleListingsResponse> {
    const queryParams = new URLSearchParams();

    if (params.zip_code) queryParams.append('zip_code', params.zip_code);
    if (params.city) queryParams.append('city', params.city);
    if (params.state) queryParams.append('state', params.state);
    if (params.min_price !== undefined) queryParams.append('min_price', params.min_price.toString());
    if (params.max_price !== undefined) queryParams.append('max_price', params.max_price.toString());
    if (params.bedrooms !== undefined) queryParams.append('bedrooms', params.bedrooms.toString());
    if (params.bathrooms !== undefined) queryParams.append('bathrooms', params.bathrooms.toString());
    if (params.property_type) queryParams.append('property_type', params.property_type);
    if (params.limit !== undefined) queryParams.append('limit', params.limit.toString());

    const response = await fetch(
      `${this.baseURL}/api/v1/market/listings/sale?${queryParams}`,
      {
        method: 'GET',
        headers: defaultHeaders,
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to fetch sale listings' }));
      throw new Error(error.message || 'Failed to fetch sale listings');
    }

    return response.json();
  }

  /**
   * Get rental listings
   * GET /api/v1/market/listings/rental
   */
  async getRentalListings(params: RentalListingParams): Promise<RentalListingsResponse> {
    const queryParams = new URLSearchParams();

    if (params.zip_code) queryParams.append('zip_code', params.zip_code);
    if (params.city) queryParams.append('city', params.city);
    if (params.state) queryParams.append('state', params.state);
    if (params.min_rent !== undefined) queryParams.append('min_rent', params.min_rent.toString());
    if (params.max_rent !== undefined) queryParams.append('max_rent', params.max_rent.toString());
    if (params.bedrooms !== undefined) queryParams.append('bedrooms', params.bedrooms.toString());
    if (params.bathrooms !== undefined) queryParams.append('bathrooms', params.bathrooms.toString());
    if (params.property_type) queryParams.append('property_type', params.property_type);
    if (params.limit !== undefined) queryParams.append('limit', params.limit.toString());

    const response = await fetch(
      `${this.baseURL}/api/v1/market/listings/rental?${queryParams}`,
      {
        method: 'GET',
        headers: defaultHeaders,
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to fetch rental listings' }));
      throw new Error(error.message || 'Failed to fetch rental listings');
    }

    return response.json();
  }
}

// Export singleton instance
const apiBaseUrl = API_BASE || (import.meta.env.DEV ? 'http://localhost:8001' : '');
if (!apiBaseUrl && !import.meta.env.DEV) {
  throw new Error('API URL must be configured via environment variable (VITE_CIVITAS_API_URL or VITE_API_URL)');
}

export const marketAPI = new MarketAPI(apiBaseUrl);
