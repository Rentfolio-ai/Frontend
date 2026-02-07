/**
 * Saved Searches Store
 * 
 * Manages saved search queries for quick re-execution
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SearchFilters {
    minPrice?: number;
    maxPrice?: number;
    bedrooms?: number;
    propertyType?: string;
    city?: string;
    state?: string;
    strategy?: 'STR' | 'LTR' | 'FLIP';
    [key: string]: any;
}

export interface SavedSearch {
    id: string;
    name: string;
    query: string;
    filters: SearchFilters;
    /** ISO-8601 string for safe JSON serialization */
    createdAt: string;
    /** ISO-8601 string for safe JSON serialization */
    lastRun?: string;
    notificationsEnabled: boolean;
}

interface SavedSearchesState {
    searches: SavedSearch[];

    addSearch: (search: Omit<SavedSearch, 'id' | 'createdAt'>) => void;
    removeSearch: (id: string) => void;
    updateSearch: (id: string, updates: Partial<SavedSearch>) => void;
    getSearch: (id: string) => SavedSearch | undefined;
    markAsRun: (id: string) => void;
    toggleNotifications: (id: string) => void;
}

export const useSavedSearchesStore = create<SavedSearchesState>()(
    persist(
        (set, get) => ({
            searches: [],

            addSearch: (search) => set((state) => ({
                searches: [
                    ...state.searches,
                    {
                        ...search,
                        id: `search_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                        createdAt: new Date().toISOString(),
                    }
                ]
            })),

            removeSearch: (id) => set((state) => ({
                searches: state.searches.filter(s => s.id !== id)
            })),

            updateSearch: (id, updates) => set((state) => ({
                searches: state.searches.map(s =>
                    s.id === id ? { ...s, ...updates } : s
                )
            })),

            getSearch: (id) => {
                return get().searches.find(s => s.id === id);
            },

            markAsRun: (id) => {
                get().updateSearch(id, { lastRun: new Date().toISOString() });
            },

            toggleNotifications: (id) => {
                const search = get().getSearch(id);
                if (search) {
                    get().updateSearch(id, {
                        notificationsEnabled: !search.notificationsEnabled
                    });
                }
            },
        }),
        {
            name: 'saved-searches-storage',
        }
    )
);
