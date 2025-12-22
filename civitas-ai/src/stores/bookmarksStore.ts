/**
 * Bookmarks Store
 * 
 * Manages saved/bookmarked properties
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface BookmarkedProperty {
    id: string;
    address: string;
    price: number;
    bedrooms?: number;
    bathrooms?: number;
    sqft?: number;
    thumbnail?: string;
    bookmarkedAt: number; // timestamp
    notes?: string; // User notes
}

interface BookmarksState {
    bookmarked: BookmarkedProperty[];
    addBookmark: (property: BookmarkedProperty) => void;
    removeBookmark: (id: string) => void;
    isBookmarked: (id: string) => boolean;
    updateNotes: (id: string, notes: string) => void;
    clearAll: () => void;
}

export const useBookmarksStore = create<BookmarksState>()(
    persist(
        (set, get) => ({
            bookmarked: [],

            addBookmark: (property) => {
                const current = get().bookmarked;
                if (!current.some(p => p.id === property.id)) {
                    set({ bookmarked: [...current, { ...property, bookmarkedAt: Date.now() }] });
                }
            },

            removeBookmark: (id) => {
                set({ bookmarked: get().bookmarked.filter(p => p.id !== id) });
            },

            isBookmarked: (id) => {
                return get().bookmarked.some(p => p.id === id);
            },

            updateNotes: (id, notes) => {
                set({
                    bookmarked: get().bookmarked.map(p =>
                        p.id === id ? { ...p, notes } : p
                    )
                });
            },

            clearAll: () => {
                set({ bookmarked: [] });
            },
        }),
        {
            name: 'civitas-bookmarks', // localStorage key
        }
    )
);
