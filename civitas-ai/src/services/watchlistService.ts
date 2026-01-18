// FILE: src/services/watchlistService.ts
/**
 * Market Watchlist Service - API client for tracking favorite markets
 */

const API_BASE = import.meta.env.VITE_DATALAYER_API_URL || 'http://localhost:8001';
const API_KEY = import.meta.env.VITE_API_KEY;

export interface MarketData {
  market_id: string;
  city: string;
  state: string;
  median_price: number;
  price_change_30d: number;
  price_change_90d: number;
  inventory_count: number;
  inventory_change_30d: number;
  days_on_market: number;
  absorption_rate: number;
  market_temperature: 'hot' | 'warm' | 'balanced' | 'cool' | 'cold';
  health_score: number;
  cached: boolean;
  fetched_at: string;
}

export interface WatchlistResponse {
  markets: MarketData[];
  count: number;
  max_markets: number;
}

export interface CompareMarketsResponse {
  markets: Array<{
    market_id: string;
    city: string;
    state: string;
    median_price: number;
    price_change_30d: number;
    health_score: number;
    market_temperature: string;
    days_on_market: number;
  }>;
  winner: string;
  comparison_date: string;
}

/**
 * Add market to watchlist
 */
export async function addMarketToWatchlist(
  userId: string,
  city: string,
  state: string
): Promise<{ market_id: string; city: string; state: string; added: boolean }> {
  const response = await fetch(`${API_BASE}/api/watchlist/add?user_id=${userId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Api-Key': API_KEY,
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({ city, state }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to add market');
  }

  return response.json();
}

/**
 * Remove market from watchlist
 */
export async function removeMarketFromWatchlist(
  userId: string,
  marketId: string
): Promise<{ success: boolean; market_id: string }> {
  const response = await fetch(`${API_BASE}/api/watchlist/${marketId}?user_id=${userId}`, {
    method: 'DELETE',
    headers: {
      'X-Api-Key': API_KEY,
      'Authorization': `Bearer ${API_KEY}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to remove market');
  }

  return response.json();
}

/**
 * Get user's watchlist
 */
export async function getWatchlist(
  userId: string,
  refresh: boolean = false
): Promise<WatchlistResponse> {
  const params = new URLSearchParams();
  params.append('user_id', userId);
  if (refresh) params.append('refresh', 'true');

  const response = await fetch(`${API_BASE}/api/watchlist/list?${params}`, {
    headers: {
      'X-Api-Key': API_KEY,
      'Authorization': `Bearer ${API_KEY}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch watchlist');
  }

  return response.json();
}

/**
 * Compare multiple markets
 */
export async function compareMarkets(
  marketIds: string[]
): Promise<CompareMarketsResponse> {
  const response = await fetch(`${API_BASE}/api/watchlist/compare`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Api-Key': API_KEY,
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({ market_ids: marketIds }),
  });

  if (!response.ok) {
    throw new Error('Failed to compare markets');
  }

  return response.json();
}

/**
 * Get market data (preview before adding)
 */
export async function getMarketData(
  city: string,
  state: string
): Promise<MarketData> {
  const response = await fetch(`${API_BASE}/api/watchlist/market/${city}/${state}`, {
    headers: {
      'X-Api-Key': API_KEY,
      'Authorization': `Bearer ${API_KEY}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch market data');
  }

  return response.json();
}
