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



export interface InferredPreferences {
    [key: string]: string | string[] | null | undefined; // Flexible for various inferred rules
}

export interface UserPreferences {
    user_id: string;
    // Investment preferences
    defaultStrategy: 'STR' | 'LTR' | 'FLIP' | null;
    budgetRange: {
        min: number;
        max: number;
    } | null;
    preferredBedrooms: number | null;
    preferredPropertyTypes: string[]; // e.g., ['Single Family', 'Multi-Family', 'Condo', 'Townhouse']

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



    // Inferred Learning (Implicit Feedback)
    inferredPreferences: InferredPreferences | null;

    // Location
    clientLocation: { latitude: number; longitude: number; cityName?: string; accuracy?: number } | null;

    // UI preferences
    showKeyboardHints: boolean;
    isWideMode: boolean;
    theme: 'light' | 'dark' | 'system';

    // Voice preferences (like ChatGPT's "Base style and tone")
    voicePersona: 'professional' | 'friendly' | 'expert' | 'concise' | null;
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

    setInferredPreferences: (prefs: InferredPreferences) => void;

    // Favorites
    toggleFavoriteMarket: (market: string) => void;
    togglePropertyType: (propertyType: string) => void;

    // Search History
    addRecentSearch: (query: string) => void;
    setLastSearchCity: (city: string) => void;

    // Location
    updateClientLocation: (location: { latitude: number; longitude: number; cityName?: string; accuracy?: number } | null) => void;

    clearRecentSearches: () => void;

    setShowKeyboardHints: (show: boolean) => void;
    setWideMode: (isWide: boolean) => void;
    setTheme: (theme: UserPreferences['theme']) => void;


    setAllPreferences: (prefs: Partial<UserPreferences>) => void;
    setVoicePersona: (persona: UserPreferences['voicePersona']) => void;

    resetPreferences: () => void;

    sync: () => Promise<void>;
}

const defaultPreferences: UserPreferences = {
    user_id: 'default',
    defaultStrategy: null,
    budgetRange: null,
    preferredBedrooms: null,
    preferredPropertyTypes: [],
    financialDna: null,
    investmentCriteria: null,
    interactionProfile: null,
    favoriteMarkets: [],
    recentSearches: [],
    lastSearchCity: null,
    showKeyboardHints: true,
    isWideMode: false,
    theme: 'dark',
    inferredPreferences: null,
    clientLocation: null,
    voicePersona: null, // User will select on first voice session
};

export const usePreferencesStore = create<PreferencesState>()(
    persist(
        (set, get) => ({
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

            setInferredPreferences: (prefs) => set({ inferredPreferences: prefs }),

            toggleFavoriteMarket: (market: string) => set((state) => {
                const current = state.favoriteMarkets;
                if (current.includes(market)) {
                    return { favoriteMarkets: current.filter(m => m !== market) };
                }
                return { favoriteMarkets: [...current, market] };
            }),

            togglePropertyType: (propertyType: string) => set((state) => {
                const current = state.preferredPropertyTypes;
                if (current.includes(propertyType)) {
                    return { preferredPropertyTypes: current.filter(t => t !== propertyType) };
                }
                return { preferredPropertyTypes: [...current, propertyType] };
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
            setWideMode: (isWide: boolean) => set({ isWideMode: isWide }),
            setTheme: (theme: UserPreferences['theme']) => set({ theme }),



            setAllPreferences: (prefs: Partial<UserPreferences>) => set((state) => ({
                ...state,
                ...prefs
            })),

            setVoicePersona: (persona: UserPreferences['voicePersona']) => set({ voicePersona: persona }),

            resetPreferences: () => set(defaultPreferences),

            // Backend Sync
            sync: async () => {
                const { user_id } = get();
                if (!user_id || user_id === 'default') return;

                try {
                    const api = await import('../services/preferencesApi');
                    await api.getPreferences(user_id);

                    // Note: Preferences are synced to backend but state updates
                    // are handled by the caller to avoid circular dependencies
                    set((state) => ({
                        ...state
                        // State mapping handled by caller
                    }));

                } catch (err) {
                    console.error("Failed to sync preferences:", err);
                }
            }
        }),
        {
            name: 'civitas-preferences',
            // Persist all preferences to localStorage
            // This ensures preferences survive page refreshes
            partialize: (state) => ({
                // User preferences
                user_id: state.user_id,
                defaultStrategy: state.defaultStrategy,
                budgetRange: state.budgetRange,
                preferredBedrooms: state.preferredBedrooms,
                preferredPropertyTypes: state.preferredPropertyTypes,

                // Financial DNA
                financialDna: state.financialDna,

                // Investment Criteria
                investmentCriteria: state.investmentCriteria,

                // Interaction Profile
                interactionProfile: state.interactionProfile,

                // Favorites & History
                favoriteMarkets: state.favoriteMarkets,
                recentSearches: state.recentSearches,
                lastSearchCity: state.lastSearchCity,

                // Inferred Preferences
                inferredPreferences: state.inferredPreferences,

                // Location
                clientLocation: state.clientLocation,

                // UI Preferences
                theme: state.theme,
                isWideMode: state.isWideMode,
                showKeyboardHints: state.showKeyboardHints,

                // Voice Preferences
                voicePersona: state.voicePersona,
            })
        }
    )
);
