export interface Property {
  id: string;
  title: string;
  address: string;
  lat: number;
  lng: number;
  coordinates?: {
    lat: number;
    lng: number;
  };
  price: number;
  beds: number;
  baths: number;
  sqft: number;
  yearBuilt: number;
  hoa: number;
  taxes: number;
  rentEst: number;
  expensesEst: number;
  roiMonthly: number[];
  capRate: number;
  images: string[];
  zip: string;
  city: string;
  state: string;
  propertyType: 'single-family' | 'condo' | 'townhouse' | 'multi-family' | 'land';
  amenities?: string[];
  description?: string;
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

export interface AnalyticsKPIs {
  avgPrice: number;
  medianCapRate: number;
  avgCashOnCash: number;
  totalListings: number;
}

export interface RoiDataPoint {
  month: string;
  roi: number;
}

export interface CapRateDistribution {
  range: string;
  count: number;
}

export interface TopZipData {
  zip: string;
  avgRoi: number;
  count: number;
}

export interface User {
  id: string;
  name?: string;
  email?: string;
  image?: string;
}

export interface FilterPreset {
  id: string;
  name: string;
  filters: PropertySearchFilters;
  userId: string;
  createdAt: Date;
}

export interface ReportData {
  id: string;
  title: string;
  filters: PropertySearchFilters;
  kpis: AnalyticsKPIs;
  properties: Property[];
  createdAt: Date;
  token?: string;
}
