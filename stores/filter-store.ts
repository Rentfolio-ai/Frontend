import { create } from 'zustand';
import { PropertySearchFilters } from '@/types';

interface FilterStore {
  filters: PropertySearchFilters;
  isFiltersOpen: boolean;
  setFilters: (filters: Partial<PropertySearchFilters>) => void;
  clearFilters: () => void;
  toggleFilters: () => void;
  setFiltersOpen: (open: boolean) => void;
}

const defaultFilters: PropertySearchFilters = {
  location: '',
  minPrice: undefined,
  maxPrice: undefined,
  beds: undefined,
  baths: undefined,
  propertyType: undefined,
  minCapRate: undefined,
  maxCapRate: undefined,
  minCashOnCash: undefined,
  maxCashOnCash: undefined,
  minYearBuilt: undefined,
  maxYearBuilt: undefined,
};

export const useFilterStore = create<FilterStore>((set) => ({
  filters: defaultFilters,
  isFiltersOpen: false,
  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    })),
  clearFilters: () =>
    set({
      filters: defaultFilters,
    }),
  toggleFilters: () =>
    set((state) => ({
      isFiltersOpen: !state.isFiltersOpen,
    })),
  setFiltersOpen: (open) =>
    set({
      isFiltersOpen: open,
    }),
}));
