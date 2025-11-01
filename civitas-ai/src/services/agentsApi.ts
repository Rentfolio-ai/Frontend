/**
 * API service for Civitas AI agent endpoints
 * Provides typed functions for property search, valuation, and reports
 */

const API_BASE = import.meta.env.VITE_CIVITAS_API_URL || 'http://localhost:8000';

// ============================================================================
// Types
// ============================================================================

export interface PropertySearchParams {
  location: string;
  max_price?: number;
  min_bedrooms?: number;
  min_bathrooms?: number;
  property_type?: string;
  limit?: number;
}

export interface PropertySearchResponse {
  success: boolean;
  location: string;
  total_found: number;
  properties: Property[];
  center_coordinates?: { lat: number; lng: number };
  str_regulations?: {
    summary: string;
    str_friendly: boolean;
    compliance_tips: string[];
  };
  market_seasonality?: any;
  market_demand?: any;
  message?: string;
}

export interface Property {
  listing_id: string;
  address: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  coordinates: { lat: number; lng: number };
  nightly_price?: number;
  monthly_revenue_estimate?: number;
  annual_revenue_estimate?: number;
  cash_on_cash_roi?: number;
  amenities?: string[];
  property_type?: string;
  description?: string;
  [key: string]: any;
}

export interface ValuationParams {
  property_data: {
    price: number;
    bedrooms: number;
    bathrooms: number;
    sqft: number;
    city: string;
    state: string;
  };
  occupancy?: number;
  use_property_manager?: boolean;
}

export interface ValuationResponse {
  success: boolean;
  valuation: {
    cash_on_cash_roi: number;
    cap_rate: number;
    monthly_cash_flow: number;
    annual_revenue: number;
    monthly_revenue: number;
    operating_expenses: number;
    property_tier: 'A' | 'B' | 'C' | 'D';
    adr: number;
    occupancy: number;
    expense_breakdown: {
      cleaning: number;
      platform_fees: number;
      utilities: number;
      maintenance: number;
      property_management: number;
      insurance: number;
      property_tax: number;
    };
    [key: string]: any;
  };
  message?: string;
}

export interface ReportParams {
  valuation: any;
  export_format?: 'text' | 'json';
}

export interface ReportResponse {
  success: boolean;
  report: string;
  property_details?: {
    price: number;
    location: string;
    roi: number;
    tier: string;
  };
  message?: string;
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Search for STR investment properties
 */
export async function searchProperties(params: PropertySearchParams): Promise<PropertySearchResponse> {
  const response = await fetch(`${API_BASE}/api/agents/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Search failed' }));
    throw new Error(error.detail || 'Failed to search properties');
  }

  return response.json();
}

/**
 * Calculate valuation for a property
 */
export async function calculateValuation(params: ValuationParams): Promise<ValuationResponse> {
  const response = await fetch(`${API_BASE}/api/agents/valuation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Valuation failed' }));
    throw new Error(error.detail || 'Failed to calculate valuation');
  }

  return response.json();
}

/**
 * Generate investment report
 */
export async function generateReport(params: ReportParams): Promise<ReportResponse> {
  const response = await fetch(`${API_BASE}/api/agents/report`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Report generation failed' }));
    throw new Error(error.detail || 'Failed to generate report');
  }

  return response.json();
}

/**
 * Save a generated report
 */
export async function saveReport(params: {
  title: string;
  location: string;
  property_address?: string;
  report_content: string;
  property_details?: any;
}): Promise<{ success: boolean; report_id: string; report: any }> {
  const response = await fetch(`${API_BASE}/api/agents/reports/save`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to save report' }));
    throw new Error(error.detail || 'Failed to save report');
  }

  return response.json();
}

/**
 * Get all saved reports
 */
export async function getSavedReports(): Promise<{ success: boolean; count: number; reports: any[] }> {
  const response = await fetch(`${API_BASE}/api/agents/reports`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to fetch reports' }));
    throw new Error(error.detail || 'Failed to fetch reports');
  }

  return response.json();
}

/**
 * Get a specific report by ID
 */
export async function getReportById(reportId: string): Promise<{ success: boolean; report: any }> {
  const response = await fetch(`${API_BASE}/api/agents/reports/${reportId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Report not found' }));
    throw new Error(error.detail || 'Failed to fetch report');
  }

  return response.json();
}

/**
 * Update a saved report
 */
export async function updateReport(
  reportId: string,
  updates: {
    title?: string;
    location?: string;
    property_address?: string;
    notes?: string;
  }
): Promise<{ success: boolean; message: string; report: any }> {
  const response = await fetch(`${API_BASE}/api/agents/reports/${reportId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to update report' }));
    throw new Error(error.detail || 'Failed to update report');
  }

  return response.json();
}

/**
 * Delete a saved report
 */
export async function deleteReport(reportId: string): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${API_BASE}/api/agents/reports/${reportId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to delete report' }));
    throw new Error(error.detail || 'Failed to delete report');
  }

  return response.json();
}

/**
 * Cache search results for later retrieval
 */
export async function cacheSearchResults(params: {
  search_query: string;
  location: string;
  filters?: any;
  results: PropertySearchResponse;
}): Promise<{ success: boolean; search_id: string }> {
  const response = await fetch(`${API_BASE}/api/agents/searches/cache`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to cache search' }));
    throw new Error(error.detail || 'Failed to cache search');
  }

  return response.json();
}

/**
 * Get recent cached searches
 */
export async function getRecentSearches(limit: number = 10): Promise<{ success: boolean; count: number; searches: any[] }> {
  const response = await fetch(`${API_BASE}/api/agents/searches/recent?limit=${limit}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to fetch searches' }));
    throw new Error(error.detail || 'Failed to fetch searches');
  }

  return response.json();
}

/**
 * Get a specific cached search by ID
 */
export async function getCachedSearch(searchId: string): Promise<{ success: boolean; search: any }> {
  const response = await fetch(`${API_BASE}/api/agents/searches/${searchId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Search not found' }));
    throw new Error(error.detail || 'Failed to fetch search');
  }

  return response.json();
}

/**
 * Check API health status
 */
export async function checkHealth(): Promise<{
  status: string;
  service: string;
  version: string;
  endpoints: Record<string, string>;
}> {
  const response = await fetch(`${API_BASE}/api/agents/health`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error('Health check failed');
  }

  return response.json();
}

// ============================================================================
// Portfolio Management API
// ============================================================================

export interface Portfolio {
  id: string;
  userId: string;
  name: string;
  description?: string;
  totalValue: number;
  totalInvestment: number;
  totalROI: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlyCashFlow: number;
  propertyCount: number;
  tierDistribution: { A: number; B: number; C: number; D: number };
  ytdReturn: number;
  allTimeReturn: number;
  createdAt: string;
  updatedAt: string;
}

export interface PortfolioProperty {
  id: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  propertyType: 'single_family' | 'multi_family' | 'condo' | 'townhouse' | 'commercial';
  purchasePrice: number;
  purchaseDate: string;
  currentValue: number;
  lastValuationDate: string;
  monthlyRent?: number;
  monthlyExpenses?: number;
  annualPropertyTax?: number;
  annualInsurance?: number;
  roi: number;
  cashFlow: number;
  occupancyRate?: number;
  tier?: 'A' | 'B' | 'C' | 'D';
  marketTrend?: 'up' | 'down' | 'stable';
  comparableAvgPrice?: number;
  marketAppreciationRate?: number;
  notes?: string;
  images?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PortfolioSummary {
  portfolio: Portfolio;
  properties: PortfolioProperty[];
  performanceMetrics: {
    totalEquity: number;
    debtToEquityRatio: number;
    averageROI: number;
    averageCashFlow: number;
    bestPerformer: PortfolioProperty | null;
    worstPerformer: PortfolioProperty | null;
    monthlyTrend: Array<{ month: string; value: number; income: number; expenses: number }>;
  };
  insights: Array<{
    id: string;
    type: 'opportunity' | 'risk' | 'recommendation' | 'trend';
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    propertyId?: string;
    actionable: boolean;
    createdAt: string;
  }>;
}

export interface MarketData {
  location: string;
  medianPrice: number;
  priceChange: number;
  daysOnMarket: number;
  inventoryLevel: number;
  rentGrowthRate: number;
  vacancyRate: number;
  forecastedGrowth: number;
  lastUpdated: string;
  dataSource: 'zillow' | 'redfin' | 'realtor' | 'mock';
}

/**
 * Get all portfolios for current user
 */
export async function getPortfolios(): Promise<{ success: boolean; portfolios: Portfolio[] }> {
  const response = await fetch(`${API_BASE}/api/portfolios`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to fetch portfolios' }));
    throw new Error(error.detail || 'Failed to fetch portfolios');
  }

  return response.json();
}

/**
 * Get portfolio summary with properties and analytics
 */
export async function getPortfolioSummary(portfolioId: string): Promise<{ success: boolean; data: PortfolioSummary }> {
  const response = await fetch(`${API_BASE}/api/portfolios/${portfolioId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to fetch portfolio' }));
    throw new Error(error.detail || 'Failed to fetch portfolio');
  }

  return response.json();
}

/**
 * Create new portfolio
 */
export async function createPortfolio(data: { name: string; description?: string }): Promise<{ success: boolean; portfolio: Portfolio }> {
  const response = await fetch(`${API_BASE}/api/portfolios`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to create portfolio' }));
    throw new Error(error.detail || 'Failed to create portfolio');
  }

  return response.json();
}

/**
 * Update portfolio
 */
export async function updatePortfolio(
  portfolioId: string,
  data: Partial<Portfolio>
): Promise<{ success: boolean; portfolio: Portfolio }> {
  const response = await fetch(`${API_BASE}/api/portfolios/${portfolioId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to update portfolio' }));
    throw new Error(error.detail || 'Failed to update portfolio');
  }

  return response.json();
}

/**
 * Delete portfolio
 */
export async function deletePortfolio(portfolioId: string): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${API_BASE}/api/portfolios/${portfolioId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to delete portfolio' }));
    throw new Error(error.detail || 'Failed to delete portfolio');
  }

  return response.json();
}

/**
 * Refresh portfolio - triggers backend to fetch latest market data from ETL pipeline
 */
export async function refreshPortfolio(portfolioId: string): Promise<{ success: boolean; data: PortfolioSummary }> {
  const response = await fetch(`${API_BASE}/api/portfolios/${portfolioId}/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to refresh portfolio' }));
    throw new Error(error.detail || 'Failed to refresh portfolio');
  }

  return response.json();
}

/**
 * Add property to portfolio
 */
export async function addPropertyToPortfolio(
  portfolioId: string,
  data: Partial<PortfolioProperty>
): Promise<{ success: boolean; property: PortfolioProperty }> {
  const response = await fetch(`${API_BASE}/api/portfolios/${portfolioId}/properties`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to add property' }));
    throw new Error(error.detail || 'Failed to add property');
  }

  return response.json();
}

/**
 * Update property
 */
export async function updateProperty(
  propertyId: string,
  data: Partial<PortfolioProperty>
): Promise<{ success: boolean; property: PortfolioProperty }> {
  const response = await fetch(`${API_BASE}/api/properties/${propertyId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to update property' }));
    throw new Error(error.detail || 'Failed to update property');
  }

  return response.json();
}

/**
 * Delete property
 */
export async function deleteProperty(propertyId: string): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${API_BASE}/api/properties/${propertyId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to delete property' }));
    throw new Error(error.detail || 'Failed to delete property');
  }

  return response.json();
}

/**
 * Get market data for location (from ETL pipeline)
 */
export async function getMarketData(location: string): Promise<{ success: boolean; data: MarketData }> {
  const response = await fetch(`${API_BASE}/api/market-data?location=${encodeURIComponent(location)}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to fetch market data' }));
    throw new Error(error.detail || 'Failed to fetch market data');
  }

  return response.json();
}
