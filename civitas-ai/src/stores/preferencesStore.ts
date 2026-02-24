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
    accentColor: 'copper' | 'blue' | 'violet' | 'rose' | 'amber' | 'emerald';
    fontSize: 'small' | 'medium' | 'large';
    chatDensity: 'compact' | 'comfortable' | 'spacious';
    reducedMotion: boolean;
    highContrast: boolean;

    // Language & Region
    language: string;       // e.g. 'en-US', 'es-ES', 'fr-FR'
    timezone: string;       // e.g. 'America/New_York'
    currency: string;       // e.g. 'USD', 'EUR'
    dateFormat: string;     // e.g. 'MM/DD/YYYY'
    timeFormat: '12h' | '24h';

    // Agent mode preference
    preferredMode: 'hunter' | 'research' | 'strategist';

    // Start page preference (chosen during onboarding)
    preferredStartPage: 'chat' | 'marketplace';

    // Voice preferences
    voiceEnabled: boolean;
    voiceAutoSend: boolean;
    voicePersona: string; // persona id from voicePersonas.ts (default: 'vasthu')
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
    setAccentColor: (color: UserPreferences['accentColor']) => void;
    setFontSize: (size: UserPreferences['fontSize']) => void;
    setChatDensity: (density: UserPreferences['chatDensity']) => void;
    setReducedMotion: (enabled: boolean) => void;
    setHighContrast: (enabled: boolean) => void;
    setPreferredMode: (mode: UserPreferences['preferredMode']) => void;
    setPreferredStartPage: (page: UserPreferences['preferredStartPage']) => void;

    // Language & Region setters
    setLanguage: (lang: string) => void;
    setTimezone: (tz: string) => void;
    setCurrency: (currency: string) => void;
    setDateFormat: (fmt: string) => void;
    setTimeFormat: (fmt: '12h' | '24h') => void;


    // Voice setters
    setVoiceEnabled: (enabled: boolean) => void;
    setVoiceAutoSend: (auto: boolean) => void;
    setVoicePersona: (persona: string) => void;

    setAllPreferences: (prefs: Partial<UserPreferences>) => void;

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
    accentColor: 'copper',
    fontSize: 'medium',
    chatDensity: 'comfortable',
    reducedMotion: false,
    highContrast: false,
    language: 'en-US',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/New_York',
    currency: 'USD',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    preferredMode: 'hunter',
    preferredStartPage: 'chat',
    inferredPreferences: null,
    clientLocation: null,
    voiceEnabled: true,
    voiceAutoSend: true,
    voicePersona: 'vasthu',
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
            setAccentColor: (color: UserPreferences['accentColor']) => set({ accentColor: color }),
            setFontSize: (size: UserPreferences['fontSize']) => set({ fontSize: size }),
            setChatDensity: (density: UserPreferences['chatDensity']) => set({ chatDensity: density }),
            setReducedMotion: (enabled: boolean) => set({ reducedMotion: enabled }),
            setHighContrast: (enabled: boolean) => set({ highContrast: enabled }),
            setPreferredMode: (mode: UserPreferences['preferredMode']) => set({ preferredMode: mode }),
            setPreferredStartPage: (page: UserPreferences['preferredStartPage']) => set({ preferredStartPage: page }),

            // Language & Region
            setLanguage: (lang: string) => set({ language: lang }),
            setTimezone: (tz: string) => set({ timezone: tz }),
            setCurrency: (currency: string) => set({ currency }),
            setDateFormat: (fmt: string) => set({ dateFormat: fmt }),
            setTimeFormat: (fmt: '12h' | '24h') => set({ timeFormat: fmt }),

            // Voice
            setVoiceEnabled: (enabled: boolean) => set({ voiceEnabled: enabled }),
            setVoiceAutoSend: (auto: boolean) => set({ voiceAutoSend: auto }),
            setVoicePersona: (persona: string) => set({ voicePersona: persona }),

            setAllPreferences: (prefs: Partial<UserPreferences>) => set((state) => ({
                ...state,
                ...prefs
            })),

            resetPreferences: () => set(defaultPreferences),

            // Backend Sync -- pull remote preferences and merge into local state
            sync: async () => {
                const { user_id } = get();
                if (!user_id || user_id === 'default') return;

                try {
                    const api = await import('../services/preferencesApi');
                    const remote = await api.getPreferences(user_id);

                    if (remote) {
                        // Map backend snake_case fields to local store
                        const mapped: Partial<UserPreferences> = {};

                        // Explicitly cast remote to any to avoid strict type checking on optional fields if needed, 
                        // but since we updated the interface, it should be fine. 
                        // However, to be extra safe against "Property does not exist on type 'UserPreferences'" if imports are stale:
                        const r = remote as any;

                        if (r.default_strategy) mapped.defaultStrategy = r.default_strategy;
                        if (r.budget_range) mapped.budgetRange = r.budget_range;
                        if (r.preferred_bedrooms != null) mapped.preferredBedrooms = r.preferred_bedrooms;
                        if (r.preferred_property_types) mapped.preferredPropertyTypes = r.preferred_property_types;
                        if (r.financial_dna) mapped.financialDna = r.financial_dna;
                        if (r.investment_criteria) mapped.investmentCriteria = r.investment_criteria;
                        if (r.interaction_profile) mapped.interactionProfile = r.interaction_profile;
                        if (r.favorite_markets) mapped.favoriteMarkets = r.favorite_markets;
                        if (r.recent_searches) mapped.recentSearches = r.recent_searches;
                        if (r.last_search_city) mapped.lastSearchCity = r.last_search_city;
                        if (r.inferred_preferences) mapped.inferredPreferences = r.inferred_preferences;

                        set((state) => ({ ...state, ...mapped }));
                    }
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
                accentColor: state.accentColor,
                fontSize: state.fontSize,
                chatDensity: state.chatDensity,
                reducedMotion: state.reducedMotion,
                highContrast: state.highContrast,

                // Language & Region
                language: state.language,
                timezone: state.timezone,
                currency: state.currency,
                dateFormat: state.dateFormat,
                timeFormat: state.timeFormat,

                // Start page
                preferredStartPage: state.preferredStartPage,

                // Voice
                voiceEnabled: state.voiceEnabled,
                voiceAutoSend: state.voiceAutoSend,
                voicePersona: state.voicePersona,
            })
        }
    )
);
