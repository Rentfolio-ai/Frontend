// FILE: src/services/portfolioApi.ts
/**
 * API client for Portfolio Management System
 */

import type {
  Portfolio,
  PortfolioWithMetrics,
  PortfolioProperty,
  CreatePortfolioForm,
  AddPropertyForm,
  PaginationParams,
  PaginatedResponse,
  ImportJob,
  PortfolioMetrics,
  CashFlowAnalysis,
  PerformanceMetrics,
  MarketComparison,
} from '../types/portfolio';

// IMPORTANT: Always use environment variables for API URL
// Never hardcode URLs or use empty string fallback in production
const envApiUrl = import.meta.env.VITE_DATALAYER_API_URL;
const API_BASE = (envApiUrl && typeof envApiUrl === 'string' && envApiUrl.startsWith('http')) ? envApiUrl : 'http://localhost:8001';
if (!API_BASE) {
  console.error('API URL must be configured via environment variable (VITE_DATALAYER_API_URL)');
  // In development, allow localhost fallback; in production this should throw
  if (import.meta.env.DEV) {
    console.warn('Using localhost fallback for development');
  }
}

const CIVITAS_API_KEY = import.meta.env.VITE_API_KEY;

const defaultHeaders: HeadersInit = {
  'Content-Type': 'application/json',
  ...(CIVITAS_API_KEY ? { 'X-API-Key': CIVITAS_API_KEY } : {}),
};

class PortfolioAPI {
  private baseURL: string;

  constructor(baseURL: string) {
    // Ensure baseURL doesn't end with /api to avoid double prefixing
    this.baseURL = baseURL.replace(/\/api\/?$/, '');
  }

  // Portfolio Management
  async getPortfolios(userId: string): Promise<Portfolio[]> {
    const response = await fetch(`${this.baseURL}/api/portfolios?user_id=${userId}`, {
      method: 'GET',
      headers: defaultHeaders,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to fetch portfolios' }));
      throw new Error(error.message || 'Failed to fetch portfolios');
    }

    const data = await response.json();
    return data.portfolios || [];
  }

  async getPortfolio(portfolioId: string): Promise<PortfolioWithMetrics> {
    const response = await fetch(`${this.baseURL}/api/portfolios/${portfolioId}`, {
      method: 'GET',
      headers: defaultHeaders,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to fetch portfolio' }));
      throw new Error(error.message || 'Failed to fetch portfolio');
    }

    return response.json();
  }

  async createPortfolio(portfolio: CreatePortfolioForm): Promise<Portfolio> {
    const response = await fetch(`${this.baseURL}/api/portfolios`, {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify(portfolio),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to create portfolio' }));
      throw new Error(error.message || 'Failed to create portfolio');
    }

    return response.json();
  }

  async updatePortfolio(
    portfolioId: string,
    updates: Partial<CreatePortfolioForm>
  ): Promise<Portfolio> {
    const response = await fetch(`${this.baseURL}/api/portfolios/${portfolioId}`, {
      method: 'PUT',
      headers: defaultHeaders,
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to update portfolio' }));
      throw new Error(error.message || 'Failed to update portfolio');
    }

    return response.json();
  }

  async deletePortfolio(portfolioId: string): Promise<void> {
    const response = await fetch(`${this.baseURL}/api/portfolios/${portfolioId}`, {
      method: 'DELETE',
      headers: defaultHeaders,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to delete portfolio' }));
      throw new Error(error.message || 'Failed to delete portfolio');
    }
  }

  // Property Management
  async getProperties(
    portfolioId: string,
    params?: PaginationParams
  ): Promise<PaginatedResponse<PortfolioProperty>> {
    const queryParams = new URLSearchParams();
    if (params) {
      queryParams.append('page', params.page.toString());
      queryParams.append('limit', params.limit.toString());
      if (params.sort_by) queryParams.append('sort_by', params.sort_by);
      if (params.order) queryParams.append('order', params.order);
    }

    const response = await fetch(
      `${this.baseURL}/api/portfolios/${portfolioId}/properties?${queryParams}`,
      {
        method: 'GET',
        headers: defaultHeaders,
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to fetch properties' }));
      throw new Error(error.message || 'Failed to fetch properties');
    }

    return response.json();
  }

  async getProperty(portfolioId: string, propertyId: string): Promise<PortfolioProperty> {
    const response = await fetch(
      `${this.baseURL}/api/portfolios/${portfolioId}/properties/${propertyId}`,
      {
        method: 'GET',
        headers: defaultHeaders,
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to fetch property' }));
      throw new Error(error.message || 'Failed to fetch property');
    }

    return response.json();
  }

  async addProperty(portfolioId: string, property: AddPropertyForm): Promise<PortfolioProperty> {
    const response = await fetch(`${this.baseURL}/api/portfolios/${portfolioId}/properties`, {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify(property),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to add property' }));
      throw new Error(error.message || 'Failed to add property');
    }

    return response.json();
  }

  async updateProperty(
    portfolioId: string,
    propertyId: string,
    updates: Partial<AddPropertyForm>
  ): Promise<PortfolioProperty> {
    const response = await fetch(
      `${this.baseURL}/api/portfolios/${portfolioId}/properties/${propertyId}`,
      {
        method: 'PUT',
        headers: defaultHeaders,
        body: JSON.stringify(updates),
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to update property' }));
      throw new Error(error.message || 'Failed to update property');
    }

    return response.json();
  }

  async removeProperty(portfolioId: string, propertyId: string): Promise<void> {
    const response = await fetch(
      `${this.baseURL}/api/portfolios/${portfolioId}/properties/${propertyId}`,
      {
        method: 'DELETE',
        headers: defaultHeaders,
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to remove property' }));
      throw new Error(error.message || 'Failed to remove property');
    }
  }

  // Import/Export
  async importProperties(portfolioId: string, file: File): Promise<ImportJob> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('format', file.name.endsWith('.xlsx') ? 'xlsx' : 'csv');

    const headers: HeadersInit = {
      ...(CIVITAS_API_KEY ? { 'X-API-Key': CIVITAS_API_KEY } : {}),
    };

    const response = await fetch(`${this.baseURL}/api/portfolios/${portfolioId}/import`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to import properties' }));
      throw new Error(error.message || 'Failed to import properties');
    }

    return response.json();
  }

  async getImportStatus(portfolioId: string, importJobId: string): Promise<ImportJob> {
    const response = await fetch(
      `${this.baseURL}/api/portfolios/${portfolioId}/import/${importJobId}`,
      {
        method: 'GET',
        headers: defaultHeaders,
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to fetch import status' }));
      throw new Error(error.message || 'Failed to fetch import status');
    }

    return response.json();
  }

  async exportPortfolio(
    portfolioId: string,
    format: 'csv' | 'xlsx' = 'csv'
  ): Promise<{ download_url: string; expires_at: string }> {
    const response = await fetch(
      `${this.baseURL}/api/portfolios/${portfolioId}/export?format=${format}`,
      {
        method: 'GET',
        headers: defaultHeaders,
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to export portfolio' }));
      throw new Error(error.message || 'Failed to export portfolio');
    }

    return response.json();
  }

  // Analytics
  async getAnalytics(portfolioId: string): Promise<PortfolioMetrics> {
    const response = await fetch(`${this.baseURL}/api/portfolios/${portfolioId}/analytics`, {
      method: 'GET',
      headers: defaultHeaders,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to fetch analytics' }));
      throw new Error(error.message || 'Failed to fetch analytics');
    }

    return response.json();
  }

  async getCashFlowAnalysis(
    portfolioId: string,
    startDate: string,
    endDate: string
  ): Promise<CashFlowAnalysis> {
    const response = await fetch(
      `${this.baseURL}/api/portfolios/${portfolioId}/analytics/cashflow?start_date=${startDate}&end_date=${endDate}`,
      {
        method: 'GET',
        headers: defaultHeaders,
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to fetch cash flow analysis' }));
      throw new Error(error.message || 'Failed to fetch cash flow analysis');
    }

    return response.json();
  }

  async getPerformanceMetrics(portfolioId: string): Promise<PerformanceMetrics> {
    const response = await fetch(
      `${this.baseURL}/api/portfolios/${portfolioId}/analytics/performance`,
      {
        method: 'GET',
        headers: defaultHeaders,
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to fetch performance metrics' }));
      throw new Error(error.message || 'Failed to fetch performance metrics');
    }

    return response.json();
  }

  async comparePortfolio(
    portfolioId: string,
    comparisonType: 'market' | 'benchmark' | 'custom',
    marketArea: { city: string; state: string; zip_codes?: string[] }
  ): Promise<MarketComparison> {
    const response = await fetch(`${this.baseURL}/api/portfolios/${portfolioId}/analytics/compare`, {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify({
        comparison_type: comparisonType,
        market_area: marketArea,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to compare portfolio' }));
      throw new Error(error.message || 'Failed to compare portfolio');
    }

    return response.json();
  }
}

// Export singleton instance
// Use configured API URL or fallback to localhost in development only
const apiBaseUrl = API_BASE || (import.meta.env.DEV ? 'http://localhost:8000' : '');
if (!apiBaseUrl && !import.meta.env.DEV) {
  throw new Error('API URL must be configured via environment variable (VITE_CIVITAS_API_URL or VITE_API_URL)');
}

export const portfolioAPI = new PortfolioAPI(apiBaseUrl);

