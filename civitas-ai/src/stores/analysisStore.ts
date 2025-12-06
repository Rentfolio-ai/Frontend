import { create } from 'zustand';
import type { Property } from '../types';

interface AnalysisState {
    isOpen: boolean;
    selectedProperty: Property | null;
    openAnalysis: (property?: Property | null) => void;
    closeAnalysis: () => void;
}

export const useAnalysisStore = create<AnalysisState>((set) => ({
    isOpen: false,
    selectedProperty: null,
    openAnalysis: (property = null) => set({ isOpen: true, selectedProperty: property }),
    closeAnalysis: () => set({ isOpen: false, selectedProperty: null }),
}));
