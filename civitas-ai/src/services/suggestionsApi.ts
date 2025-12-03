// FILE: src/services/suggestionsApi.ts
/**
 * API service for query suggestions
 */

const envApiUrl = import.meta.env.VITE_DATALAYER_API_URL;
const API_BASE = (envApiUrl && typeof envApiUrl === 'string' && envApiUrl.startsWith('http')) ? envApiUrl : 'http://localhost:8001';
const CIVITAS_API_KEY = import.meta.env.VITE_API_KEY;

const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...(CIVITAS_API_KEY ? { 'X-API-Key': CIVITAS_API_KEY } : {}),
};

export interface QuerySuggestion {
    query: string;
    category: string;
    icon: string;
}

export interface SuggestionsResponse {
    suggestions: QuerySuggestion[];
    user_preferences: {
        favorite_markets: string[];
        last_search_city: string | null;
    };
}

/**
 * Get query suggestions from backend
 */
export const getSuggestions = async (
    query: string,
    userId: string = 'default',
    limit: number = 5
): Promise<QuerySuggestion[]> => {
    try {
        const url = new URL(`${API_BASE}/api/suggestions`);
        url.searchParams.append('query', query);
        url.searchParams.append('user_id', userId);
        url.searchParams.append('limit', limit.toString());

        const response = await fetch(url.toString(), {
            method: 'GET',
            headers: defaultHeaders,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: SuggestionsResponse = await response.json();
        return data.suggestions;
    } catch (error) {
        console.error('Failed to fetch suggestions:', error);
        return [];
    }
};

/**
 * Get popular query suggestions
 */
export const getPopularSuggestions = async (
    category?: string,
    userId: string = 'default'
): Promise<QuerySuggestion[]> => {
    try {
        const url = new URL(`${API_BASE}/api/suggestions/popular`);
        if (category) {
            url.searchParams.append('category', category);
        }
        url.searchParams.append('user_id', userId);

        const response = await fetch(url.toString(), {
            method: 'GET',
            headers: defaultHeaders,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.suggestions;
    } catch (error) {
        console.error('Failed to fetch popular suggestions:', error);
        return [];
    }
};
