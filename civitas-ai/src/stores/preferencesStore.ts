/**
 * User Preferences Store
 * 
 * Manages user preferences with localStorage persistence
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Financial DNA (Underwriting Settings) - matching backend keys for easy sync
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

// Investment Success Criteria (Goals)
export interface InvestmentCriteria {
    min_cash_flow?: number | null;
    min_coc_pct?: number | null;
    min_cap_rate_pct?: number | null;
    max_rehab_cost?: number | null;
}

// Interaction Memory (The Brain)
export interface InteractionProfile {
    dislikes?: string[];
    liked_areas?: string[];
    risk_profile?: string | null;
}

export interface UserPreferences {
    // Investment preferences
    defaultStrategy: 'STR' | 'LTR' | 'FLIP' | null;
    budgetRange: {
        min: number;
        max: number;
    } | null;
    preferredBedrooms: number | null;

    // Financial DNA
    financialDna: FinancialDNA | null;

    // Investment Criteria
    investmentCriteria: InvestmentCriteria | null;

    // Interaction Memory
    interactionProfile: InteractionProfile | null;

    // Favorite markets
    favoriteMarkets: string[];

    // Recent searches
    recentSearches: string[];
    lastSearchCity: string | null;

    // Location
    clientLocation: { latitude: number; longitude: number } | null;

    // UI preferences
    showKeyboardHints: boolean;
    theme: 'light' | 'dark' | 'system';
}

export interface PreferencesState extends UserPreferences {
    // Actions
    updatePreferences: (prefs: Partial<UserPreferences>) => void;

    // Specific updaters
    setBudgetRange: (min: number, max: number) => void;
    setDefaultStrategy: (strategy: 'STR' | 'LTR' | 'FLIP') => void;
    setPreferredBedrooms: (bedrooms: number | null) => void;
    setFinancialDna: (dna: FinancialDNA) => void;
    setInvestmentCriteria: (criteria: InvestmentCriteria) => void;
    setInteractionProfile: (profile: InteractionProfile) => void;

    // Interaction Memory Actions
    addDislike: (dislike: string) => void;
    removeDislike: (dislike: string) => void;

    // Favorites
    toggleFavoriteMarket: (market: string) => void;

    // Search History
    addRecentSearch: (query: string) => void;
    setLastSearchCity: (city: string) => void;

    // Location
    updateClientLocation: (location: { latitude: number; longitude: number } | null) => void;

    clearRecentSearches: () => void;

    setShowKeyboardHints: (show: boolean) => void;
    setTheme: (theme: UserPreferences['theme']) => void;

    setAllPreferences: (prefs: Partial<UserPreferences>) => void;

    resetPreferences: () => void;
}

const defaultPreferences: UserPreferences = {
    defaultStrategy: null,
    budgetRange: null,
    preferredBedrooms: null,
    financialDna: null,
    investmentCriteria: null,
    interactionProfile: null,
    favoriteMarkets: [],
    recentSearches: [],
    lastSearchCity: null,
    showKeyboardHints: true,
    theme: 'system',
    clientLocation: null
};

export const usePreferencesStore = create<PreferencesState>()(
    persist(
        (set) => ({
            ...defaultPreferences,

            updatePreferences: (prefs) => set((state) => ({ ...state, ...prefs })),

            setDefaultStrategy: (strategy: UserPreferences['defaultStrategy']) => set({ defaultStrategy: strategy }),

            setBudgetRange: (min: number, max: number) => set({ budgetRange: { min, max } }),

            setPreferredBedrooms: (bedrooms: number | null) => set({ preferredBedrooms: bedrooms }),

            setFinancialDna: (dna: FinancialDNA) => set({ financialDna: dna }),

            setInvestmentCriteria: (criteria: InvestmentCriteria) => set({ investmentCriteria: criteria }),

            setInteractionProfile: (profile: InteractionProfile) => set({ interactionProfile: profile }),

            addDislike: (dislike) => set((state) => {
                const currentProfile = state.interactionProfile || { dislikes: [], liked_areas: [], risk_profile: null };
                const currentDislikes = currentProfile.dislikes || [];
                if (currentDislikes.includes(dislike)) return state;

                return {
                    interactionProfile: {
                        ...currentProfile,
                        dislikes: [...currentDislikes, dislike]
                    }
                };
            }),

            removeDislike: (dislike) => set((state) => {
                if (!state.interactionProfile?.dislikes) return state;
                return {
                    interactionProfile: {
                        ...state.interactionProfile,
                        dislikes: state.interactionProfile.dislikes.filter(d => d !== dislike)
                    }
                };
            }),

            toggleFavoriteMarket: (market: string) => set((state) => {
                const current = state.favoriteMarkets;
                if (current.includes(market)) {
                    return { favoriteMarkets: current.filter(m => m !== market) };
                }
                return { favoriteMarkets: [...current, market] };
            }),

            addRecentSearch: (query: string) => set((state) => {
                const current = state.recentSearches;
                const filtered = current.filter(s => s !== query);
                return { recentSearches: [query, ...filtered].slice(0, 5) };
            }),

            clearRecentSearches: () => set({ recentSearches: [] }),

            setLastSearchCity: (city: string) => set({ lastSearchCity: city }),

            updateClientLocation: (location) => set({ clientLocation: location }),

            setShowKeyboardHints: (show: boolean) => set({ showKeyboardHints: show }),

            setTheme: (theme: UserPreferences['theme']) => set({ theme }),

            setAllPreferences: (prefs: Partial<UserPreferences>) => set((state) => ({
                ...state,
                ...prefs
            })),

            resetPreferences: () => set(defaultPreferences)
        }),
        {
            name: 'civitas-preferences'
        }
    )
);
