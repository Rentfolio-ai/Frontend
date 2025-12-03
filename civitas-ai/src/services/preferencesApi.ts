// FILE: src/services/preferencesApi.ts
/**
 * API service for user preferences
 */

const envApiUrl = import.meta.env.VITE_DATALAYER_API_URL;
const API_BASE = (envApiUrl && typeof envApiUrl === 'string' && envApiUrl.startsWith('http')) ? envApiUrl : 'http://localhost:8001';
const CIVITAS_API_KEY = import.meta.env.VITE_API_KEY;

const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...(CIVITAS_API_KEY ? { 'X-API-Key': CIVITAS_API_KEY } : {}),
};

export interface BudgetRange {
    min: number;
    max: number;
}

export interface UserPreferences {
    user_id: string;
    default_strategy?: 'STR' | 'LTR' | 'FLIP' | null;
    budget_range?: BudgetRange | null;
    preferred_bedrooms?: number | null;
    favorite_markets: string[];
    recent_searches: string[];
    last_search_city?: string | null;
    show_keyboard_hints: boolean;
    theme: 'light' | 'dark' | 'system';
}

/**
 * Get user preferences from backend
 */
export const getPreferences = async (userId: string = 'default'): Promise<UserPreferences> => {
    try {
        const response = await fetch(`${API_BASE}/api/preferences?user_id=${userId}`, {
            method: 'GET',
            headers: defaultHeaders,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Failed to fetch preferences:', error);
        // Return default preferences
        return {
            user_id: userId,
            default_strategy: null,
            budget_range: null,
            preferred_bedrooms: null,
            favorite_markets: [],
            recent_searches: [],
            last_search_city: null,
            show_keyboard_hints: true,
            theme: 'system'
        };
    }
};

/**
 * Save user preferences to backend
 */
export const savePreferences = async (preferences: UserPreferences): Promise<boolean> => {
    try {
        const response = await fetch(`${API_BASE}/api/preferences`, {
            method: 'POST',
            headers: defaultHeaders,
            body: JSON.stringify(preferences),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.success === true;
    } catch (error) {
        console.error('Failed to save preferences:', error);
        return false;
    }
};

/**
 * Add a favorite market
 */
export const addFavoriteMarket = async (userId: string, market: string): Promise<string[]> => {
    try {
        const response = await fetch(`${API_BASE}/api/preferences/favorite-market?user_id=${userId}&market=${encodeURIComponent(market)}`, {
            method: 'POST',
            headers: defaultHeaders,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.favorite_markets || [];
    } catch (error) {
        console.error('Failed to add favorite market:', error);
        return [];
    }
};

/**
 * Remove a favorite market
 */
export const removeFavoriteMarket = async (userId: string, market: string): Promise<string[]> => {
    try {
        const response = await fetch(`${API_BASE}/api/preferences/favorite-market?user_id=${userId}&market=${encodeURIComponent(market)}`, {
            method: 'DELETE',
            headers: defaultHeaders,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.favorite_markets || [];
    } catch (error) {
        console.error('Failed to remove favorite market:', error);
        return [];
    }
};

/**
 * Add a recent search
 */
export const addRecentSearch = async (userId: string, query: string): Promise<string[]> => {
    try {
        const response = await fetch(`${API_BASE}/api/preferences/recent-search?user_id=${userId}&query=${encodeURIComponent(query)}`, {
            method: 'POST',
            headers: defaultHeaders,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.recent_searches || [];
    } catch (error) {
        console.error('Failed to add recent search:', error);
        return [];
    }
};
