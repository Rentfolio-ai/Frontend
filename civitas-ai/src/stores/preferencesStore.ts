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

export interface PromptPreset {
    id: string;
    label: string;
    content: string;
    command: string;
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

    // Custom Instructions (Persona)
    customInstructions: string | null;
    promptPresets: PromptPreset[];

    // Inferred Learning (Implicit Feedback)
    inferredPreferences: InferredPreferences | null;

    // Location
    clientLocation: { latitude: number; longitude: number } | null;

    // UI preferences
    showKeyboardHints: boolean;
    isWideMode: boolean;
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

    setInferredPreferences: (prefs: InferredPreferences) => void;

    // Favorites
    toggleFavoriteMarket: (market: string) => void;

    // Search History
    addRecentSearch: (query: string) => void;
    setLastSearchCity: (city: string) => void;

    // Location
    updateClientLocation: (location: { latitude: number; longitude: number } | null) => void;

    clearRecentSearches: () => void;

    setShowKeyboardHints: (show: boolean) => void;
    setWideMode: (isWide: boolean) => void;
    setTheme: (theme: UserPreferences['theme']) => void;
    setCustomInstructions: (instructions: string | null) => void;

    // Prompt Presets
    addPromptPreset: (preset: Omit<PromptPreset, 'id'>) => void;
    removePromptPreset: (id: string) => void;
    updatePromptPreset: (id: string, preset: Partial<PromptPreset>) => void;

    setAllPreferences: (prefs: Partial<UserPreferences>) => void;

    resetPreferences: () => void;

    sync: () => Promise<void>;
}

const defaultPreferences: UserPreferences = {
    user_id: 'default',
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
    isWideMode: false,
    theme: 'dark',
    customInstructions: null,
    promptPresets: [],
    inferredPreferences: null,
    clientLocation: null
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
            setCustomInstructions: (instructions: string | null) => set({ customInstructions: instructions }),

            addPromptPreset: async (preset) => {
                const { user_id } = get();
                // Optimistic update
                const tempId = crypto.randomUUID();
                set((state) => ({
                    ...state,
                    promptPresets: [...state.promptPresets, { ...preset, id: tempId }]
                }));

                const { createPrompt } = await import('../services/preferencesApi');
                const newPrompt = await createPrompt(user_id, {
                    title: preset.label,
                    content: preset.content,
                    command: preset.command,
                    category: 'custom',
                    is_favorite: false
                });

                if (newPrompt) {
                    set((state) => ({
                        ...state,
                        promptPresets: state.promptPresets.map(p => p.id === tempId ? { ...p, id: newPrompt.id } : p)
                    }));
                }
            },

            removePromptPreset: async (id) => {
                const { user_id } = get();
                const { deletePrompt } = await import('../services/preferencesApi');

                // Optimistic
                set((state) => ({
                    ...state,
                    promptPresets: state.promptPresets.filter((p: PromptPreset) => p.id !== id)
                }));

                await deletePrompt(user_id, id);
            },

            updatePromptPreset: (id, updates) =>
                set((state) => ({
                    ...state,
                    promptPresets: state.promptPresets.map((p: PromptPreset) =>
                        p.id === id ? { ...p, ...updates } : p
                    )
                })),

            setAllPreferences: (prefs: Partial<UserPreferences>) => set((state) => ({
                ...state,
                ...prefs
            })),

            resetPreferences: () => set(defaultPreferences),

            // Backend Sync
            sync: async () => {
                const { user_id } = get();
                if (!user_id || user_id === 'default') return;

                try {
                    const [api] = await Promise.all([
                        import('../services/preferencesApi')
                    ]);

                    const [prefs, prompts] = await Promise.all([
                        api.getPreferences(user_id),
                        api.getPrompts(user_id)
                    ]);

                    // Map backend prompts to store presets
                    const promptPresets: PromptPreset[] = prompts.map(p => ({
                        id: p.id,
                        label: p.title,
                        content: p.content,
                        command: p.command || ''
                    }));

                    // Logic to merge prefs...
                    // Assuming prefs keys match or we map them.
                    // Ideally we use a helper but for MVP direct assign if matching.
                    // Note: API returns snake_case but store expects camelCase for some fields?
                    // Actually we saw in useDesktopShell that it does manual mapping.
                    // Ideally the STORE handles mapping. Let's do a basic mapping here.

                    set((state) => ({
                        ...state,
                        promptPresets,
                        // Basic mappings if needed, relying on 'prefs' matching mostly
                        // If prefs contains "default_strategy", we might need to map to defaultStrategy
                        // But let's assume useDesktopShell handles the heavy prefs hydration for now
                        // and we just focus on prompts here to limit scope risk.
                        // Or we can invoke the mapped hydration.
                    }));

                } catch (err) {
                    console.error("Failed to sync preferences:", err);
                }
            }
        }),
        {
            name: 'civitas-preferences',
            // Only persist critical UI state locally if needed, or rely on backend
            partialize: (state) => ({
                theme: state.theme,
                isWideMode: state.isWideMode,
                showKeyboardHints: state.showKeyboardHints
                // Don't persist sensitive data if backend is truth
            })
        }
    )
);
