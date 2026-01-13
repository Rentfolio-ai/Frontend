// FILE: civitas-ai/src/types/index.ts
// Type definitions for the Vasthu application

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
  
  // Investment metrics (Beat Redfin!)
  monthly_cash_flow?: number;        // Monthly cash flow
  roi?: number;                       // Cash-on-cash return (%)
  cap_rate?: number;                  // Capitalization rate (%)
  estimated_rent?: number;            // Estimated monthly rent
  
  // Deal quality scoring (Beat Redfin!)
  deal_grade?: string;                // A+, A, A-, B+, B, etc.
  deal_grade_score?: number;          // 0-100
  deal_category?: string;             // "Excellent Deal", "Good Deal", etc.
  deal_reasons?: string[];            // Why it's a good/bad deal
  deal_warnings?: string[];           // Red flags
  deal_strengths?: string[];          // What's great about it
  
  // Full investment metrics (optional, for detailed view)
  investment_metrics?: {
    monthly_cash_flow: number;
    annual_cash_flow: number;
    cash_on_cash_return: number;
    cap_rate: number;
    gross_yield: number;
    is_cash_flow_positive: boolean;
    monthly_mortgage: number;
    total_monthly_expenses: number;
    estimated_monthly_rent: number;
    breakeven_rent: number;
    down_payment: number;
    loan_amount: number;
  };
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
