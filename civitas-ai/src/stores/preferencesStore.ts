/**
 * User Preferences Store
 * 
 * Manages user preferences with localStorage persistence
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface UserPreferences {
    // Investment preferences
    defaultStrategy: 'STR' | 'LTR' | 'FLIP' | null;
    budgetRange: {
        min: number;
        max: number;
    } | null;
    preferredBedrooms: number | null;

    // Favorite markets
    favoriteMarkets: string[];

    // Recent searches
    recentSearches: string[];
    lastSearchCity: string | null;

    // UI preferences
    showKeyboardHints: boolean;
    theme: 'light' | 'dark' | 'system';
}

interface PreferencesStore extends UserPreferences {
    // Actions
    setDefaultStrategy: (strategy: UserPreferences['defaultStrategy']) => void;
    setBudgetRange: (min: number, max: number) => void;
    setPreferredBedrooms: (bedrooms: number | null) => void;

    addFavoriteMarket: (market: string) => void;
    removeFavoriteMarket: (market: string) => void;

    addRecentSearch: (query: string) => void;
    clearRecentSearches: () => void;
    setLastSearchCity: (city: string) => void;

    setShowKeyboardHints: (show: boolean) => void;
    setTheme: (theme: UserPreferences['theme']) => void;

    resetPreferences: () => void;
}

const defaultPreferences: UserPreferences = {
    defaultStrategy: null,
    budgetRange: null,
    preferredBedrooms: null,
    favoriteMarkets: [],
    recentSearches: [],
    lastSearchCity: null,
    showKeyboardHints: true,
    theme: 'system'
};

export const usePreferencesStore = create<PreferencesStore>()(
    persist(
        (set) => ({
            ...defaultPreferences,

            setDefaultStrategy: (strategy: UserPreferences['defaultStrategy']) => set({ defaultStrategy: strategy }),

            setBudgetRange: (min: number, max: number) => set({ budgetRange: { min, max } }),

            setPreferredBedrooms: (bedrooms: number | null) => set({ preferredBedrooms: bedrooms }),

            addFavoriteMarket: (market: string) => set((state) => ({
                favoriteMarkets: state.favoriteMarkets.includes(market)
                    ? state.favoriteMarkets
                    : [...state.favoriteMarkets, market]
            })),

            removeFavoriteMarket: (market: string) => set((state) => ({
                favoriteMarkets: state.favoriteMarkets.filter((m: string) => m !== market)
            })),

            addRecentSearch: (query: string) => set((state) => ({
                recentSearches: [
                    query,
                    ...state.recentSearches.filter((q: string) => q !== query)
                ].slice(0, 10) // Keep last 10
            })),

            clearRecentSearches: () => set({ recentSearches: [] }),

            setLastSearchCity: (city: string) => set({ lastSearchCity: city }),

            setShowKeyboardHints: (show: boolean) => set({ showKeyboardHints: show }),

            setTheme: (theme: UserPreferences['theme']) => set({ theme }),

            resetPreferences: () => set(defaultPreferences)
        }),
        {
            name: 'civitas-preferences'
        }
    )
);
