// FILE: civitas-ai/src/types/index.ts
// Type definitions for the ProphetAtlas application

export interface Property {
  id: string;
  title: string;
  address: string;
  lat: number;
  lng: number;
  price: number;
  beds: number;
  baths: number;
  sqft: number;
  yearBuilt: number;
  hoa: number;
  taxes: number;
  rentEst: number;
  expensesEst: number;
  monthlyRoiData: number[];
  capRate: number;
  images: string[];
  zip: string;
  city: string;
  state: string;
  propertyType: 'single_family' | 'condo' | 'townhouse' | 'multi_family' | 'land';
  amenities?: string[];
  description?: string;
  // Enhanced fields
  adrRange?: {
    peak: number;
    offSeason: number;
  };
  popularityTag?: 'Hot' | 'Stable' | 'Declining';
  regulationSnippet?: string;
}

export interface PropertySearchFilters {
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  beds?: number;
  baths?: number;
  propertyType?: Property['propertyType'];
  minCapRate?: number;
  maxCapRate?: number;
  minCashOnCash?: number;
  maxCashOnCash?: number;
  minYearBuilt?: number;
  maxYearBuilt?: number;
}

export interface PropertySearchParams extends PropertySearchFilters {
  page?: number;
  limit?: number;
  sortBy?: 'price' | 'capRate' | 'yearBuilt' | 'sqft';
  sortOrder?: 'asc' | 'desc';
}

export interface PropertySearchResponse {
  properties: Property[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
