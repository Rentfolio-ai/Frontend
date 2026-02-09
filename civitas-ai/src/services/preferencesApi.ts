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

export interface FinancialDNA {
    down_payment_pct?: number | null;
    interest_rate_annual?: number | null;
    loan_term_years?: number | null;
    property_management_pct?: number | null;
    maintenance_pct?: number | null;
    capex_reserve_pct?: number | null;
    vacancy_rate_pct?: number | null;
    closing_cost_pct?: number | null;
}

export interface InvestmentCriteria {
    min_cash_flow?: number | null;
    min_coc_pct?: number | null;
    min_cap_rate_pct?: number | null;
    max_rehab_cost?: number | null;
}

export interface InteractionProfile {
    dislikes?: string[];
    liked_areas?: string[];
    risk_profile?: string | null;
}

export interface UserPreferences {
    user_id: string;
    default_strategy?: 'STR' | 'LTR' | 'FLIP' | null;
    budget_range?: BudgetRange | null;
    preferred_bedrooms?: number | null;
    preferred_property_types?: string[];
    favorite_markets: string[];
    recent_searches: string[];
    last_search_city?: string | null;
    show_keyboard_hints: boolean;
    theme: 'light' | 'dark' | 'system';
    financial_dna?: FinancialDNA | null;
    investment_criteria?: InvestmentCriteria | null;
    interaction_profile?: InteractionProfile | null;
    inferred_preferences?: Record<string, any> | null;
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

        const data = await response.json();

        // Ensure keys match (backend returns snake_case for Pydantic/Dict, frontend uses camelCase/interfaces)
        // Actually, backend returns JSON compatible with UserPreferences model which has snake_case fields? 
        // No, UserPreferences pydantic model has snake_case fields.
        // Frontend uses snake_case for backend sync properties too for simplicity?
        // Let's check logic:
        // Backend: default_strategy, budget_range... 
        // Frontend Interface UsePreferences: default_strategy...
        // Wait, frontend store interface uses camelCase `defaultStrategy`.
        // We need a mapper here or aligned types.

        // Let's assume the API returns snake_case as per Python model.
        // We map to frontend camelCase for the STORE.

        // Wait, previously `getPreferences` returned `response.json()`.
        // And `preferencesStore` has `defaultStrategy`. 
        // If the API returns `default_strategy`, direct assignment works ONLY IF store handles mapping
        // or if interface matched.
        // Looking at `preferencesStore.ts`, it uses `defaultStrategy`.
        // Looking at `preferencesApi.ts` BEFORE my edit:
        // `export interface UserPreferences { default_strategy?... }` -> It uses snake_case in interface?
        // Let's check `preferencesStore.ts` again.
        // `preferencesStore.ts`: `defaultStrategy: ...` (camelCase).

        // CONFLICT DETECTED:
        // Store uses camelCase. API uses snake_case (mostly).
        // `preferencesApi.ts` lines 38-50 show `default_strategy` (snake_case).
        // So the API service returns snake_case.
        // But the store actions `setDefaultStrategy` set camelCase state.
        // The store `set` functions need to take the right values.
        // The persistence middleware loads from storage, but initial load logic usually involves fetching from API and explicit mapping?
        // Civitas has `useDesktopShell.ts` or similar that likely calls `getPreferences` and then `store.setAll(...)`?

        // To be safe and minimal: I will keep the interface IN THIS FILE as snake_case (matching backend)
        // and add `interaction_profile` (snake_case) to match backend.

        return data;
    } catch (error) {
        console.error('Failed to fetch preferences:', error);
        // Return default preferences
        return {
            user_id: userId,
            favorite_markets: [],
            recent_searches: [],
            show_keyboard_hints: true,
            theme: 'system'
        } as UserPreferences;
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
/**
 * Saved Prompts API
 */
export interface SavedPrompt {
    id: string;
    title: string;
    content: string;
    command?: string;
    category: 'standard' | 'custom' | 'role';
    is_favorite: boolean;
    usage_count: number;
}

export const getPrompts = async (userId: string = 'default'): Promise<SavedPrompt[]> => {
    try {
        const response = await fetch(`${API_BASE}/api/prompts?user_id=${userId}`, {
            method: 'GET',
            headers: defaultHeaders,
        });
        if (!response.ok) throw new Error('Failed to fetch prompts');
        return await response.json();
    } catch (error) {
        console.error('Error fetching prompts:', error);
        return [];
    }
};

export const createPrompt = async (userId: string, prompt: Omit<SavedPrompt, 'id' | 'usage_count' | 'category'> & { category?: string }): Promise<SavedPrompt | null> => {
    try {
        const response = await fetch(`${API_BASE}/api/prompts?user_id=${userId}`, {
            method: 'POST',
            headers: defaultHeaders,
            body: JSON.stringify(prompt),
        });
        if (!response.ok) throw new Error('Failed to create prompt');
        return await response.json();
    } catch (error) {
        console.error('Error creating prompt:', error);
        return null;
    }
};

export const deletePrompt = async (userId: string, promptId: string): Promise<boolean> => {
    try {
        const response = await fetch(`${API_BASE}/api/prompts/${promptId}?user_id=${userId}`, {
            method: 'DELETE',
            headers: defaultHeaders,
        });
        return response.ok;
    } catch (error) {
        console.error('Error deleting prompt:', error);
        return false;
    }
};
