/**
 * Recent Properties Store
 * 
 * Tracks recently analyzed properties for quick access
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface RecentProperty {
    id: string;
    address: string;
    city?: string;
    state?: string;
    thumbnail?: string;
    /** ISO-8601 string for safe JSON serialization */
    analyzedAt: string;
    chatId: string;
    price?: number;
}

interface RecentPropertiesState {
    properties: RecentProperty[];
    addProperty: (property: RecentProperty) => void;
    removeProperty: (id: string) => void;
    clearAll: () => void;
    getRecent: (limit?: number) => RecentProperty[];
}

export const useRecentPropertiesStore = create<RecentPropertiesState>()(
    persist(
        (set, get) => ({
            properties: [],

            addProperty: (property) => set((state) => {
                // Remove if already exists
                const filtered = state.properties.filter(p => p.id !== property.id);

                // Add to front, limit to 10
                const updated = [property, ...filtered].slice(0, 10);

                return { properties: updated };
            }),

            removeProperty: (id) => set((state) => ({
                properties: state.properties.filter(p => p.id !== id)
            })),

            clearAll: () => set({ properties: [] }),

            getRecent: (limit = 5) => {
                return get().properties.slice(0, limit);
            },
        }),
        {
            name: 'recent-properties-storage',
        }
    )
);
