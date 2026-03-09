/**
 * API service for Vasthu agent endpoints
 * Provides typed functions for property search, valuation, and reports
 */
import { apiLogger, logger } from '@/utils/logger';

const envApiUrl = import.meta.env.VITE_DATALAYER_API_URL;
// Use relative URLs in dev (proxied by Vite), absolute in prod
const API_BASE = (envApiUrl && typeof envApiUrl === 'string' && envApiUrl.startsWith('http'))
  ? envApiUrl
  : (import.meta.env.DEV ? '' : 'http://localhost:8001');
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
  min_price?: number;
  min_bedrooms?: number;
  min_bathrooms?: number;
  property_type?: string;
  property_types?: string[];
  strategy?: string;
  user_id?: string;
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
  view_url?: string;
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
  charge_amount_cents?: number;
}

// ============================================================================
// API Functions
// ============================================================================

// ── Smart Location Parsing ─────────────────────────────────────────────────

export interface ParsedLocation {
  city: string | null;
  state: string | null;
  zip_code: string | null;
  neighborhood: string | null;
  raw_query: string;
  confidence: number;
  suggestions: string[];
}

/**
 * Parse a free-text query into structured location components.
 * E.g. "3 bed in Austin TX" → { city: "Austin", state: "TX", ... }
 */
export async function parseLocation(query: string): Promise<ParsedLocation> {
  const endpoint = `${API_BASE}/v2/property/parse-location`;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify({ query }),
  });

  if (!response.ok) {
    throw new Error('Failed to parse location');
  }

  return response.json();
}

// ── Deal Analysis Redirect ─────────────────────────────────────────────────

export interface DealAnalysisProperty {
  address: string;
  price: number;
  bedrooms: number | string;
  bathrooms: number | string;
  sqft: number;
  property_type: string;
}

/**
 * Build a chat-redirect URL that triggers Deep Hunter mode analysis.
 * Frontend navigates to this URL — the chat page auto-runs the analysis.
 */
export function buildAnalyzeDealMessage(property: DealAnalysisProperty): string {
  return (
    `Analyze this property: ${property.address}, ` +
    `$${Number(property.price).toLocaleString()}, ` +
    `${property.bedrooms}bd/${property.bathrooms}ba, ` +
    `${Number(property.sqft).toLocaleString()}sqft. ` +
    `Run a full P&L analysis.`
  );
}

/**
 * Search for investment properties via the V2 property endpoint.
 */
export async function searchProperties(params: PropertySearchParams, signal?: AbortSignal): Promise<PropertySearchResponse> {
  const endpoint = `${API_BASE}/v2/property/search`;

  const body: Record<string, unknown> = {
    location: params.location,
    include_ai: false,
  };
  if (params.limit) body.limit = params.limit;
  if (params.max_price) body.max_price = params.max_price;
  if (params.min_price) body.min_price = params.min_price;
  if (params.min_bedrooms) body.min_beds = params.min_bedrooms;
  if (params.min_bathrooms) body.min_baths = params.min_bathrooms;
  if (params.property_types?.length) body.property_types = params.property_types;
  if (params.property_type) body.property_types = [params.property_type];
  if (params.strategy) body.strategy = params.strategy;
  if (params.user_id) body.user_id = params.user_id;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify(body),
      signal,
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
  const candidatePaths = ['/api/agents/health', '/api/health', '/health'];
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

// ============================================================================
// Bookmarks API
// ============================================================================

export interface BookmarkData {
  id: string;
  user_id: string;
  property_data: Record<string, any>;
  display_name: string;
  search_query?: string;
  notes?: string;
  tags?: string[];
  bookmarked_at: string;
  updated_at?: string;
  deal_status?: 'active' | 'under_contract' | 'closed' | 'lost';
  deal_closed_at?: string;
}

export async function getBookmarks(
  userId: string,
  limit = 50,
  offset = 0,
): Promise<{ bookmarks: BookmarkData[]; total: number }> {
  const params = new URLSearchParams({ user_id: userId, limit: String(limit), offset: String(offset) });
  const response = await fetch(`${API_BASE}/api/bookmarks?${params}`, {
    method: 'GET',
    headers: jsonHeaders,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to fetch bookmarks' }));
    throw new Error(error.detail || 'Failed to fetch bookmarks');
  }

  return response.json();
}

export async function createBookmark(
  userId: string,
  data: {
    property_data: Record<string, any>;
    display_name: string;
    search_query?: string;
    notes?: string;
    tags?: string[];
  },
): Promise<BookmarkData> {
  const params = new URLSearchParams({ user_id: userId });
  const response = await fetch(`${API_BASE}/api/bookmarks?${params}`, {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to create bookmark' }));
    throw new Error(error.detail || 'Failed to create bookmark');
  }

  return response.json();
}

export async function deleteBookmark(
  userId: string,
  bookmarkId: string,
): Promise<{ success: boolean; message: string }> {
  const params = new URLSearchParams({ user_id: userId });
  const response = await fetch(`${API_BASE}/api/bookmarks/${bookmarkId}?${params}`, {
    method: 'DELETE',
    headers: jsonHeaders,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to delete bookmark' }));
    throw new Error(error.detail || 'Failed to delete bookmark');
  }

  return response.json();
}

export async function updateBookmarkStatus(
  userId: string,
  bookmarkId: string,
  status: 'active' | 'under_contract' | 'closed' | 'lost',
): Promise<BookmarkData> {
  const params = new URLSearchParams({ user_id: userId });
  const response = await fetch(`${API_BASE}/api/bookmarks/${bookmarkId}/status?${params}`, {
    method: 'PUT',
    headers: jsonHeaders,
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to update deal status' }));
    throw new Error(error.detail || 'Failed to update deal status');
  }

  return response.json();
}

// ============================================================================
// Market Trends API
// ============================================================================

export interface MarketTrendsData {
  city: string;
  state: string;
  median_price?: number;
  median_rent?: number;
  months_inventory?: number;
  avg_days_on_market?: number;
  active_listings?: number;
  median_price_per_sqft?: number;
}

export async function getMarketTrends(
  city: string,
  state: string,
  zipCode?: string,
): Promise<{ status: string; data: MarketTrendsData | null }> {
  const params = new URLSearchParams({ city, state });
  if (zipCode) params.set('zip_code', zipCode);

  const response = await fetch(`${API_BASE}/v2/internal/market/stats?${params}`, {
    method: 'GET',
    headers: jsonHeaders,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to fetch market trends' }));
    throw new Error(error.detail || 'Failed to fetch market trends');
  }

  return response.json();
}


// ─── Enrichment / Free Data APIs ───────────────────────────────────────────

export interface SchoolRating {
  name: string;
  rating: number;
  type: string;
  distance_miles?: number;
}

export async function getSchoolRatings(
  latitude: number,
  longitude: number,
  radiusMiles = 2,
): Promise<{ status: string; data: SchoolRating[] | null }> {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    radius_miles: String(radiusMiles),
  });
  const response = await fetch(`${API_BASE}/v2/internal/free-data/school-ratings?${params}`, {
    method: 'GET',
    headers: jsonHeaders,
  });
  if (!response.ok) return { status: 'error', data: null };
  return response.json();
}

export interface WalkScoreData {
  walk_score?: number;
  transit_score?: number;
  bike_score?: number;
  description?: string;
}

export async function getWalkScore(
  address: string,
  latitude: number,
  longitude: number,
): Promise<{ status: string; data: WalkScoreData | null }> {
  const params = new URLSearchParams({
    address,
    latitude: String(latitude),
    longitude: String(longitude),
  });
  const response = await fetch(`${API_BASE}/v2/internal/free-data/walk-score?${params}`, {
    method: 'GET',
    headers: jsonHeaders,
  });
  if (!response.ok) return { status: 'error', data: null };
  return response.json();
}

export interface FloodZoneData {
  flood_zone?: string;
  risk_level?: string;
  description?: string;
}

export async function getFloodZone(
  latitude: number,
  longitude: number,
): Promise<{ status: string; data: FloodZoneData | null }> {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
  });
  const response = await fetch(`${API_BASE}/v2/internal/free-data/flood-zone?${params}`, {
    method: 'GET',
    headers: jsonHeaders,
  });
  if (!response.ok) return { status: 'error', data: null };
  return response.json();
}

export interface CrimeStatsData {
  crime_rate?: string;
  violent_crime_rate?: number;
  property_crime_rate?: number;
  safety_score?: number;
  description?: string;
}

export async function getCrimeStats(
  city: string,
  state: string,
): Promise<{ status: string; data: CrimeStatsData | null }> {
  const params = new URLSearchParams({ city, state });
  const response = await fetch(`${API_BASE}/v2/internal/free-data/crime-stats?${params}`, {
    method: 'GET',
    headers: jsonHeaders,
  });
  if (!response.ok) return { status: 'error', data: null };
  return response.json();
}
