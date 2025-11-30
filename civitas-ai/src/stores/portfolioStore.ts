// FILE: src/stores/portfolioStore.ts
/**
 * Portfolio state management using React hooks pattern
 * (Alternative to Zustand - using React Context + hooks)
 */

import { useState, useCallback } from 'react';
import { portfolioAPI } from '../services/portfolioApi';
import type {
  Portfolio,
  PortfolioWithMetrics,
  PortfolioProperty,
  CreatePortfolioForm,
  AddPropertyForm,
  PaginationParams,
  ImportJob,
  PortfolioMetrics,
  CashFlowAnalysis,
  PerformanceMetrics,
  MarketComparison,
} from '../types/portfolio';

interface PortfolioState {
  // Data
  portfolios: Portfolio[];
  currentPortfolio: PortfolioWithMetrics | null;
  properties: PortfolioProperty[];
  importJobs: ImportJob[];
  analytics: {
    cashflow: CashFlowAnalysis | null;
    performance: PerformanceMetrics | null;
    comparison: MarketComparison | null;
    metrics: PortfolioMetrics | null;
  };

  // Loading states
  loading: {
    portfolios: boolean;
    properties: boolean;
    analytics: boolean;
    import: boolean;
  };

  // Error states
  errors: {
    portfolios: string | null;
    properties: string | null;
    import: string | null;
    analytics: string | null;
  };
}

const initialState: PortfolioState = {
  portfolios: [],
  currentPortfolio: null,
  properties: [],
  importJobs: [],
  analytics: {
    cashflow: null,
    performance: null,
    comparison: null,
    metrics: null,
  },
  loading: {
    portfolios: false,
    properties: false,
    analytics: false,
    import: false,
  },
  errors: {
    portfolios: null,
    properties: null,
    import: null,
    analytics: null,
  },
};

/**
 * Custom hook for portfolio state management
 */
export const usePortfolioStore = () => {
  const [state, setState] = useState<PortfolioState>(initialState);

  // Portfolio Management
  const fetchPortfolios = useCallback(async (userId: string) => {
    setState((prev) => ({
      ...prev,
      loading: { ...prev.loading, portfolios: true },
      errors: { ...prev.errors, portfolios: null },
    }));

    try {
      const portfolios = await portfolioAPI.getPortfolios(userId);
      setState((prev) => ({
        ...prev,
        portfolios,
        loading: { ...prev.loading, portfolios: false },
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        errors: {
          ...prev.errors,
          portfolios: error instanceof Error ? error.message : 'Failed to fetch portfolios',
        },
        loading: { ...prev.loading, portfolios: false },
      }));
    }
  }, []);

  const fetchPortfolio = useCallback(async (portfolioId: string) => {
    setState((prev) => ({
      ...prev,
      loading: { ...prev.loading, portfolios: true },
      errors: { ...prev.errors, portfolios: null },
    }));

    try {
      const portfolio = await portfolioAPI.getPortfolio(portfolioId);
      setState((prev) => ({
        ...prev,
        currentPortfolio: portfolio,
        loading: { ...prev.loading, portfolios: false },
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        errors: {
          ...prev.errors,
          portfolios: error instanceof Error ? error.message : 'Failed to fetch portfolio',
        },
        loading: { ...prev.loading, portfolios: false },
      }));
    }
  }, []);

  const createPortfolio = useCallback(async (portfolio: CreatePortfolioForm) => {
    setState((prev) => ({
      ...prev,
      loading: { ...prev.loading, portfolios: true },
      errors: { ...prev.errors, portfolios: null },
    }));

    try {
      const newPortfolio = await portfolioAPI.createPortfolio(portfolio);
      setState((prev) => ({
        ...prev,
        portfolios: [...prev.portfolios, newPortfolio],
        loading: { ...prev.loading, portfolios: false },
      }));
      return newPortfolio;
    } catch (error) {
      setState((prev) => ({
        ...prev,
        errors: {
          ...prev.errors,
          portfolios: error instanceof Error ? error.message : 'Failed to create portfolio',
        },
        loading: { ...prev.loading, portfolios: false },
      }));
      throw error;
    }
  }, []);

  const updatePortfolio = useCallback(
    async (portfolioId: string, updates: Partial<CreatePortfolioForm>) => {
      setState((prev) => ({
        ...prev,
        loading: { ...prev.loading, portfolios: true },
        errors: { ...prev.errors, portfolios: null },
      }));

      try {
        const updated = await portfolioAPI.updatePortfolio(portfolioId, updates);
        setState((prev) => ({
          ...prev,
          portfolios: prev.portfolios.map((p) =>
            p.portfolio_id === portfolioId ? updated : p
          ),
          currentPortfolio:
            prev.currentPortfolio?.portfolio_id === portfolioId
              ? { ...prev.currentPortfolio, ...updated }
              : prev.currentPortfolio,
          loading: { ...prev.loading, portfolios: false },
        }));
        return updated;
      } catch (error) {
        setState((prev) => ({
          ...prev,
          errors: {
            ...prev.errors,
            portfolios: error instanceof Error ? error.message : 'Failed to update portfolio',
          },
          loading: { ...prev.loading, portfolios: false },
        }));
        throw error;
      }
    },
    []
  );

  const deletePortfolio = useCallback(async (portfolioId: string) => {
    setState((prev) => ({
      ...prev,
      loading: { ...prev.loading, portfolios: true },
      errors: { ...prev.errors, portfolios: null },
    }));

    try {
      await portfolioAPI.deletePortfolio(portfolioId);
      setState((prev) => ({
        ...prev,
        portfolios: prev.portfolios.filter((p) => p.portfolio_id !== portfolioId),
        currentPortfolio:
          prev.currentPortfolio?.portfolio_id === portfolioId ? null : prev.currentPortfolio,
        loading: { ...prev.loading, portfolios: false },
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        errors: {
          ...prev.errors,
          portfolios: error instanceof Error ? error.message : 'Failed to delete portfolio',
        },
        loading: { ...prev.loading, portfolios: false },
      }));
      throw error;
    }
  }, []);

  // Property Management
  const fetchProperties = useCallback(
    async (portfolioId: string, params?: PaginationParams) => {
      setState((prev) => ({
        ...prev,
        loading: { ...prev.loading, properties: true },
        errors: { ...prev.errors, properties: null },
      }));

      try {
        const response = await portfolioAPI.getProperties(portfolioId, params);
        setState((prev) => ({
          ...prev,
          properties: response.data,
          loading: { ...prev.loading, properties: false },
        }));
      } catch (error) {
        setState((prev) => ({
          ...prev,
          errors: {
            ...prev.errors,
            properties: error instanceof Error ? error.message : 'Failed to fetch properties',
          },
          loading: { ...prev.loading, properties: false },
        }));
      }
    },
    []
  );

  const addProperty = useCallback(async (portfolioId: string, property: AddPropertyForm) => {
    setState((prev) => ({
      ...prev,
      loading: { ...prev.loading, properties: true },
      errors: { ...prev.errors, properties: null },
    }));

    try {
      const newProperty = await portfolioAPI.addProperty(portfolioId, property);
      setState((prev) => ({
        ...prev,
        properties: [...prev.properties, newProperty],
        loading: { ...prev.loading, properties: false },
      }));
      return newProperty;
    } catch (error) {
      setState((prev) => ({
        ...prev,
        errors: {
          ...prev.errors,
          properties: error instanceof Error ? error.message : 'Failed to add property',
        },
        loading: { ...prev.loading, properties: false },
      }));
      throw error;
    }
  }, []);

  const updateProperty = useCallback(
    async (
      portfolioId: string,
      propertyId: string,
      updates: Partial<AddPropertyForm>
    ) => {
      setState((prev) => ({
        ...prev,
        loading: { ...prev.loading, properties: true },
        errors: { ...prev.errors, properties: null },
      }));

      try {
        const updated = await portfolioAPI.updateProperty(portfolioId, propertyId, updates);
        setState((prev) => ({
          ...prev,
          properties: prev.properties.map((p) =>
            p.property_id === propertyId ? updated : p
          ),
          loading: { ...prev.loading, properties: false },
        }));
        return updated;
      } catch (error) {
        setState((prev) => ({
          ...prev,
          errors: {
            ...prev.errors,
            properties: error instanceof Error ? error.message : 'Failed to update property',
          },
          loading: { ...prev.loading, properties: false },
        }));
        throw error;
      }
    },
    []
  );

  const removeProperty = useCallback(async (portfolioId: string, propertyId: string) => {
    setState((prev) => ({
      ...prev,
      loading: { ...prev.loading, properties: true },
      errors: { ...prev.errors, properties: null },
    }));

    try {
      await portfolioAPI.removeProperty(portfolioId, propertyId);
      setState((prev) => ({
        ...prev,
        properties: prev.properties.filter((p) => p.property_id !== propertyId),
        loading: { ...prev.loading, properties: false },
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        errors: {
          ...prev.errors,
          properties: error instanceof Error ? error.message : 'Failed to remove property',
        },
        loading: { ...prev.loading, properties: false },
      }));
      throw error;
    }
  }, []);

  // Import/Export
  const importProperties = useCallback(async (portfolioId: string, file: File) => {
    setState((prev) => ({
      ...prev,
      loading: { ...prev.loading, import: true },
      errors: { ...prev.errors, import: null },
    }));

    try {
      const job = await portfolioAPI.importProperties(portfolioId, file);
      setState((prev) => ({
        ...prev,
        importJobs: [...prev.importJobs, job],
        loading: { ...prev.loading, import: false },
      }));
      return job;
    } catch (error) {
      setState((prev) => ({
        ...prev,
        errors: {
          ...prev.errors,
          import: error instanceof Error ? error.message : 'Failed to import properties',
        },
        loading: { ...prev.loading, import: false },
      }));
      throw error;
    }
  }, []);

  const fetchImportStatus = useCallback(
    async (portfolioId: string, jobId: string) => {
      try {
        const status = await portfolioAPI.getImportStatus(portfolioId, jobId);
        setState((prev) => ({
          ...prev,
          importJobs: prev.importJobs.map((job) =>
            job.import_job_id === jobId ? status : job
          ),
        }));
        return status;
      } catch (error) {
        console.error('Failed to fetch import status:', error);
        throw error;
      }
    },
    []
  );

  // Analytics
  const fetchAnalytics = useCallback(async (portfolioId: string) => {
    setState((prev) => ({
      ...prev,
      loading: { ...prev.loading, analytics: true },
      errors: { ...prev.errors, analytics: null },
    }));

    try {
      const metrics = await portfolioAPI.getAnalytics(portfolioId);
      setState((prev) => ({
        ...prev,
        analytics: { ...prev.analytics, metrics },
        loading: { ...prev.loading, analytics: false },
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        errors: {
          ...prev.errors,
          analytics: error instanceof Error ? error.message : 'Failed to fetch analytics',
        },
        loading: { ...prev.loading, analytics: false },
      }));
    }
  }, []);

  const fetchCashFlow = useCallback(
    async (portfolioId: string, startDate: string, endDate: string) => {
      setState((prev) => ({
        ...prev,
        loading: { ...prev.loading, analytics: true },
        errors: { ...prev.errors, analytics: null },
      }));

      try {
        const cashflow = await portfolioAPI.getCashFlowAnalysis(portfolioId, startDate, endDate);
        setState((prev) => ({
          ...prev,
          analytics: { ...prev.analytics, cashflow },
          loading: { ...prev.loading, analytics: false },
        }));
      } catch (error) {
        setState((prev) => ({
          ...prev,
          errors: {
            ...prev.errors,
            analytics: error instanceof Error ? error.message : 'Failed to fetch cash flow',
          },
          loading: { ...prev.loading, analytics: false },
        }));
      }
    },
    []
  );

  const fetchPerformance = useCallback(async (portfolioId: string) => {
    setState((prev) => ({
      ...prev,
      loading: { ...prev.loading, analytics: true },
      errors: { ...prev.errors, analytics: null },
    }));

    try {
      const performance = await portfolioAPI.getPerformanceMetrics(portfolioId);
      setState((prev) => ({
        ...prev,
        analytics: { ...prev.analytics, performance },
        loading: { ...prev.loading, analytics: false },
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        errors: {
          ...prev.errors,
          analytics: error instanceof Error ? error.message : 'Failed to fetch performance',
        },
        loading: { ...prev.loading, analytics: false },
      }));
    }
  }, []);

  const comparePortfolio = useCallback(
    async (
      portfolioId: string,
      type: 'market' | 'benchmark' | 'custom',
      marketArea: { city: string; state: string; zip_codes?: string[] }
    ) => {
      setState((prev) => ({
        ...prev,
        loading: { ...prev.loading, analytics: true },
        errors: { ...prev.errors, analytics: null },
      }));

      try {
        const comparison = await portfolioAPI.comparePortfolio(portfolioId, type, marketArea);
        setState((prev) => ({
          ...prev,
          analytics: { ...prev.analytics, comparison },
          loading: { ...prev.loading, analytics: false },
        }));
      } catch (error) {
        setState((prev) => ({
          ...prev,
          errors: {
            ...prev.errors,
            analytics: error instanceof Error ? error.message : 'Failed to compare portfolio',
          },
          loading: { ...prev.loading, analytics: false },
        }));
      }
    },
    []
  );

  // Utility functions
  const setCurrentPortfolio = useCallback((portfolio: PortfolioWithMetrics | null) => {
    setState((prev) => ({ ...prev, currentPortfolio: portfolio }));
  }, []);

  const clearErrors = useCallback(() => {
    setState((prev) => ({
      ...prev,
      errors: {
        portfolios: null,
        properties: null,
        import: null,
        analytics: null,
      },
    }));
  }, []);

  return {
    // State
    ...state,
    // Actions
    fetchPortfolios,
    fetchPortfolio,
    createPortfolio,
    updatePortfolio,
    deletePortfolio,
    fetchProperties,
    addProperty,
    updateProperty,
    removeProperty,
    importProperties,
    fetchImportStatus,
    fetchAnalytics,
    fetchCashFlow,
    fetchPerformance,
    comparePortfolio,
    setCurrentPortfolio,
    clearErrors,
  };
};

