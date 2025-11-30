/**
 * API service for ProphetAtlas agent endpoints
 * Provides typed functions for property search, valuation, and reports
 */
import { apiLogger, logger } from '@/utils/logger';

const envApiUrl = import.meta.env.VITE_DATALAYER_API_URL;
const API_BASE = (envApiUrl && typeof envApiUrl === 'string' && envApiUrl.startsWith('http')) ? envApiUrl : 'http://localhost:8001';
const CIVITAS_API_KEY = import.meta.env.VITE_API_KEY;

const jsonHeaders: HeadersInit = {
  'Content-Type': 'application/json',
  ...(CIVITAS_API_KEY ? { 'X-API-Key': CIVITAS_API_KEY } : {}),
};

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
  valuation?: any;
  report_type?: 'str' | 'ltr' | 'adu' | 'flip' | 'full';
  export_format?: 'text' | 'json';
  property_address?: string;
  // New backend format fields
  property_data?: {
    address?: string | null;
    city?: string | null;
    state?: string | null;
    price?: number | null;
    bedrooms?: number | null;
    bathrooms?: number | null;
    sqft?: number | null;
    property_type?: string;
  };
  financial_inputs?: {
    purchase_price: number;
    down_payment_amount: number;
    interest_rate: number;
    loan_term_years?: number;
    closing_costs?: number;
    renovation_budget?: number;
    monthly_rent_ltr?: number | null;
    nightly_rate_str?: number | null;
    occupancy_rate_str?: number | null;
    property_tax_monthly?: number;
    insurance_monthly?: number;
    utilities_monthly?: number;
    management_fee_percent?: number;
    maintenance_percent?: number;
    capex_reserve_percent?: number;
    hoa_monthly?: number;
  };
  metrics?: {
    strategy: 'STR' | 'MTR' | 'LTR' | 'BRRRR' | 'FLIP';
    gross_annual_income: number;
    total_annual_expenses: number;
    noi: number;
    annual_debt_service: number;
    cash_flow_monthly: number;
    cash_flow_annual: number;
    cap_rate: number;
    cash_on_cash: number;
    dscr: number;
    breakeven_occupancy?: number | null;
    operating_expense_ratio: number;
  };
  pros?: string[];
  cons?: string[];
  risk_factors?: string[];
  recommendation?: 'Buy' | 'Pass' | 'Negotiate';
  narrative_summary?: string;
}

export interface ReportResponse {
  success: boolean;
  report: string;
  report_id?: string;
  report_type?: 'str' | 'ltr' | 'adu' | 'flip' | 'full';
  strategy?: 'STR' | 'MTR' | 'LTR' | 'BRRRR' | 'FLIP';
  recommendation?: 'Buy' | 'Pass' | 'Negotiate';
  generated_at?: string;
  property_details?: {
    price?: number;
    location?: string;
    address?: string;
    roi?: number;
    tier?: string;
    bedrooms?: number;
    bathrooms?: number;
    sqft?: number;
  };
  metrics?: {
    strategy: string;
    gross_annual_income: number;
    total_annual_expenses: number;
    noi: number;
    annual_debt_service: number;
    cash_flow_monthly: number;
    cash_flow_annual: number;
    cap_rate: number;
    cash_on_cash: number;
    dscr: number;
    breakeven_occupancy?: number | null;
    operating_expense_ratio: number;
  };
  sections?: {
    executive_summary?: string;
    property_overview?: string;
    financial_analysis?: string;
    market_analysis?: string;
    risk_assessment?: string;
    recommendation?: string;
  };
  pros?: string[];
  cons?: string[];
  risk_factors?: string[];
  message?: string;
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Search for STR investment properties
 */
export async function searchProperties(params: PropertySearchParams): Promise<PropertySearchResponse> {
  const endpoint = `${API_BASE}/api/agents/search`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => 'Could not read error body');
      logger.error('[agentsApi] ❌ searchProperties failed', {
        status: response.status,
        statusText: response.statusText,
        endpoint,
        errorBody: errorBody.substring(0, 500),
        params: { location: params.location, max_price: params.max_price },
      });

      const error = JSON.parse(errorBody).detail || 'Search failed';
      throw new Error(error);
    }

    const data = await response.json();
    logger.info('[agentsApi] ✅ searchProperties success', {
      location: params.location,
      totalFound: data.total_found,
      propertiesReturned: data.properties?.length || 0,
    });
    return data;
  } catch (error) {
    const err = error as Error;
    logger.error('[agentsApi] ❌ searchProperties exception', {
      name: err.name,
      message: err.message,
      endpoint,
      params: { location: params.location },
    });
    throw error;
  }
}

/**
 * Calculate valuation for a property
 */
export async function calculateValuation(params: ValuationParams): Promise<ValuationResponse> {
  const endpoint = `${API_BASE}/api/agents/valuation`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => 'Could not read error body');
      logger.error('[agentsApi] ❌ calculateValuation failed', {
        status: response.status,
        statusText: response.statusText,
        endpoint,
        errorBody: errorBody.substring(0, 500),
        params: { city: params.property_data?.city, price: params.property_data?.price },
      });

      const error = JSON.parse(errorBody).detail || 'Valuation failed';
      throw new Error(error);
    }

    const data = await response.json();
    logger.info('[agentsApi] ✅ calculateValuation success', {
      capRate: data.valuation?.cap_rate,
      cashOnCash: data.valuation?.cash_on_cash_roi,
      tier: data.valuation?.property_tier,
    });
    return data;
  } catch (error) {
    const err = error as Error;
    logger.error('[agentsApi] ❌ calculateValuation exception', {
      name: err.name,
      message: err.message,
      endpoint,
    });
    throw error;
  }
}

/**
 * Generate investment report
 */
export async function generateReport(params: ReportParams): Promise<ReportResponse> {
  const endpoint = `${API_BASE}/api/agents/report`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => 'Could not read error body');
      logger.error('[agentsApi] ❌ generateReport failed', {
        status: response.status,
        statusText: response.statusText,
        endpoint,
        errorBody: errorBody.substring(0, 500),
        params: {
          reportType: params.report_type,
          address: params.property_address || params.property_data?.address,
        },
      });

      const error = JSON.parse(errorBody).detail || 'Report generation failed';
      throw new Error(error);
    }

    const data = await response.json();
    logger.info('[agentsApi] ✅ generateReport success', {
      reportType: params.report_type,
      reportId: data.report_id,
      strategy: data.strategy,
      recommendation: data.recommendation,
      hasMetrics: !!data.metrics,
    });
    return data;
  } catch (error) {
    const err = error as Error;
    logger.error('[agentsApi] ❌ generateReport exception', {
      name: err.name,
      message: err.message,
      endpoint,
      reportType: params.report_type,
    });
    throw error;
  }
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
  const endpoint = `${API_BASE}/api/agents/reports/save`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => 'Could not read error body');
      logger.error('[agentsApi] ❌ saveReport failed', {
        status: response.status,
        statusText: response.statusText,
        endpoint,
        errorBody: errorBody.substring(0, 500),
        params: { title: params.title, location: params.location },
      });

      const error = JSON.parse(errorBody).detail || 'Failed to save report';
      throw new Error(error);
    }

    const data = await response.json();
    logger.info('[agentsApi] ✅ saveReport success', {
      reportId: data.report_id,
      title: params.title,
    });
    return data;
  } catch (error) {
    const err = error as Error;
    logger.error('[agentsApi] ❌ saveReport exception', {
      name: err.name,
      message: err.message,
      endpoint,
    });
    throw error;
  }
}

/**
 * Get all saved reports
 */
export async function getSavedReports(): Promise<{ success: boolean; count: number; reports: any[] }> {
  const endpoint = `${API_BASE}/api/agents/reports`;

  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: jsonHeaders,
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => 'Could not read error body');
      logger.error('[agentsApi] ❌ getSavedReports failed', {
        status: response.status,
        statusText: response.statusText,
        endpoint,
        errorBody: errorBody.substring(0, 500),
      });

      const error = JSON.parse(errorBody).detail || 'Failed to fetch reports';
      throw new Error(error);
    }

    const data = await response.json();
    logger.info('[agentsApi] ✅ getSavedReports success', {
      count: data.count,
      reportsReturned: data.reports?.length || 0,
    });
    return data;
  } catch (error) {
    const err = error as Error;
    logger.error('[agentsApi] ❌ getSavedReports exception', {
      name: err.name,
      message: err.message,
      endpoint,
    });
    throw error;
  }
}

/**
 * Get a specific report by ID
 */
export async function getReportById(reportId: string): Promise<{ success: boolean; report: any }> {
  const endpoint = `${API_BASE}/api/agents/reports/${reportId}`;

  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: jsonHeaders,
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => 'Could not read error body');
      logger.error('[agentsApi] ❌ getReportById failed', {
        status: response.status,
        statusText: response.statusText,
        endpoint,
        reportId,
        errorBody: errorBody.substring(0, 500),
      });

      const error = JSON.parse(errorBody).detail || 'Report not found';
      throw new Error(error);
    }

    const data = await response.json();
    logger.info('[agentsApi] ✅ getReportById success', { reportId });
    return data;
  } catch (error) {
    const err = error as Error;
    logger.error('[agentsApi] ❌ getReportById exception', {
      name: err.name,
      message: err.message,
      endpoint,
      reportId,
    });
    throw error;
  }
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
    headers: jsonHeaders,
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
    headers: jsonHeaders,
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
    headers: jsonHeaders,
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
    headers: jsonHeaders,
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
    headers: jsonHeaders,
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
  service?: string;
  version?: string;
  endpoints?: Record<string, string>;
}> {
  const candidatePaths = ['/api/agents/health', '/health', '/api/health'];
  let lastError: unknown = null;

  for (const path of candidatePaths) {
    try {
      const endpoint = `${API_BASE}${path}`;
      const startedAt = performance.now();
      apiLogger.request({ method: 'GET', url: endpoint, service: 'agents' });
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: jsonHeaders,
      });

      if (!response.ok) {
        if (response.status === 404) {
          // Try the next candidate path if the endpoint doesn't exist
          continue;
        }
        const errorText = await response.text().catch(() => '');
        apiLogger.error({ method: 'GET', url: endpoint, service: 'agents', status: response.status, durationMs: performance.now() - startedAt, error: errorText || `HTTP ${response.status}` });
        throw new Error(errorText || `Health check failed (${response.status})`);
      }

      const data = await response.json().catch(() => ({}));
      apiLogger.response({ method: 'GET', url: endpoint, service: 'agents', status: response.status, durationMs: performance.now() - startedAt });
      return {
        status: data.status ?? 'ok',
        service: data.service,
        version: data.version,
        endpoints: data.endpoints,
      };
    } catch (error) {
      apiLogger.error({ method: 'GET', url: `${API_BASE}${path}`, service: 'agents', error });
      lastError = error;
    }
  }

  if (lastError instanceof Error) {
    throw lastError;
  }
  throw new Error('Health check failed');
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
    headers: jsonHeaders,
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
    headers: jsonHeaders,
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
    headers: jsonHeaders,
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
    headers: jsonHeaders,
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
    headers: jsonHeaders,
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
    headers: jsonHeaders,
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
    headers: jsonHeaders,
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
    headers: jsonHeaders,
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
    headers: jsonHeaders,
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
    headers: jsonHeaders,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to fetch market data' }));
    throw new Error(error.detail || 'Failed to fetch market data');
  }

  return response.json();
}
