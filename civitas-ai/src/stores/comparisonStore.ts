/**
 * Property Comparison Store
 * 
 * Manages selected properties for side-by-side comparison
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ComparisonProperty {
    id: string;
    address: string;
    price: number;
    bedrooms?: number;
    bathrooms?: number;
    sqft?: number;
    yearBuilt?: number;
    // Financial metrics
    monthlyRent?: number;
    cashFlow?: number;
    cocReturn?: number;
    capRate?: number;
    // Additional data
    thumbnail?: string;
    city?: string;
    state?: string;
}

interface ComparisonState {
    selectedProperties: ComparisonProperty[];
    isComparing: boolean;
    maxProperties: number;

    addToComparison: (property: ComparisonProperty) => void;
    removeFromComparison: (id: string) => void;
    clearComparison: () => void;
    toggleComparison: (property: ComparisonProperty) => void;
    isSelected: (id: string) => boolean;
    canAddMore: () => boolean;
    startComparing: () => void;
    stopComparing: () => void;
}

export const useComparisonStore = create<ComparisonState>()(
    persist(
        (set, get) => ({
            selectedProperties: [],
            isComparing: false,
            maxProperties: 3,

            addToComparison: (property) => set((state) => {
                if (state.selectedProperties.length >= state.maxProperties) {
                    return state;
                }
                if (state.selectedProperties.some(p => p.id === property.id)) {
                    return state;
                }
                return {
                    selectedProperties: [...state.selectedProperties, property]
                };
            }),

            removeFromComparison: (id) => set((state) => ({
                selectedProperties: state.selectedProperties.filter(p => p.id !== id)
            })),

            clearComparison: () => set({
                selectedProperties: [],
                isComparing: false
            }),

            toggleComparison: (property) => {
                const state = get();
                if (state.isSelected(property.id)) {
                    state.removeFromComparison(property.id);
                } else {
                    state.addToComparison(property);
                }
            },

            isSelected: (id) => {
                return get().selectedProperties.some(p => p.id === id);
            },

            canAddMore: () => {
                const state = get();
                return state.selectedProperties.length < state.maxProperties;
            },

            startComparing: () => set({ isComparing: true }),

            stopComparing: () => set({ isComparing: false }),
        }),
        {
            name: 'civitas-comparison',
            partialize: (state) => ({
                selectedProperties: state.selectedProperties,
            }),
        }
    )
);
