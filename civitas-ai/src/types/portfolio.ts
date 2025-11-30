// FILE: src/types/portfolio.ts
/**
 * TypeScript types for Portfolio Management System
 */

// Portfolio Types
export interface Portfolio {
  portfolio_id: string;
  user_id: string;
  name: string;
  description?: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  is_active: boolean;
  metadata?: Record<string, any>;
}

export interface PortfolioWithMetrics extends Portfolio {
  metrics?: PortfolioMetrics;
  property_count?: number;
  total_value?: number;
}

export interface PortfolioMetrics {
  total_properties: number;
  total_portfolio_value: number;
  total_monthly_rent: number;
  total_monthly_expenses: number;
  total_monthly_cashflow: number;
  average_cap_rate: number;
  average_cash_on_cash: number;
  total_roi: number;
  total_debt: number;
  total_equity: number;
  calculated_at: string;
}

// Property Types
export interface PropertyFinancials {
  purchase_price: number;
  purchase_date: string;
  down_payment: number;
  loan_amount: number;
  interest_rate: number;
  loan_term_years: number;
  monthly_rent: number;
  monthly_expenses: MonthlyExpenses;
  closing_costs: number;
  renovation_costs: number;
  current_value: number;
  effective_date: string;
}

export interface MonthlyExpenses {
  property_tax: number;
  insurance: number;
  maintenance: number;
  property_management: number;
  utilities?: number;
  hoa?: number;
  other?: number;
  total: number;
}

export interface PortfolioProperty {
  property_id: string;
  portfolio_id: string;
  address: string;
  city?: string;
  state?: string;
  zip_code?: string;
  financials: PropertyFinancials;
  metrics?: PropertyMetrics;
  added_at: string;
  added_by?: string;
  notes?: string;
  tags: string[];
  custom_data?: Record<string, any>;
}

export interface PropertyMetrics {
  cap_rate: number;
  cash_on_cash: number;
  roi: number;
  debt_to_equity: number;
  gross_rent_multiplier?: number;
}

// Import Types
export interface ImportJob {
  import_job_id: string;
  portfolio_id: string;
  user_id: string;
  file_name: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  total_rows: number;
  processed_rows: number;
  successful_rows: number;
  failed_rows: number;
  errors: ImportError[];
  started_at?: string;
  completed_at?: string;
  created_at: string;
}

export interface ImportError {
  row: number;
  field: string;
  error: string;
}

export interface ImportProgress {
  total_rows: number;
  processed_rows: number;
  successful_rows: number;
  failed_rows: number;
  percentage: number;
}

// Analytics Types
export interface CashFlowAnalysis {
  portfolio_id: string;
  period: {
    start_date: string;
    end_date: string;
  };
  monthly_breakdown: MonthlyCashFlow[];
  totals: {
    total_rent: number;
    total_expenses: number;
    total_cashflow: number;
  };
}

export interface MonthlyCashFlow {
  month: string;
  total_rent: number;
  total_expenses: number;
  cashflow: number;
  properties: PropertyCashFlow[];
}

export interface PropertyCashFlow {
  property_id: string;
  rent: number;
  expenses: number;
  cashflow: number;
}

export interface PerformanceMetrics {
  portfolio_id: string;
  performance_metrics: {
    roi: number;
    cash_on_cash_return: number;
    cap_rate: number;
    gross_rent_multiplier: number;
    debt_coverage_ratio: number;
    equity_build_rate: number;
  };
  property_level: PropertyPerformance[];
  calculated_at: string;
}

export interface PropertyPerformance {
  property_id: string;
  roi: number;
  cap_rate: number;
  cash_on_cash: number;
}

export interface MarketComparison {
  portfolio_id: string;
  comparison_type: 'market' | 'benchmark' | 'custom';
  market_area: {
    city: string;
    state: string;
    zip_codes?: string[];
  };
  comparison: {
    portfolio_cap_rate: number;
    market_cap_rate: number;
    cap_rate_difference: number;
    portfolio_avg_rent: number;
    market_avg_rent: number;
    rent_difference: number;
    portfolio_occupancy: number;
    market_occupancy: number;
    occupancy_difference: number;
  };
  insights: string[];
}

// Form Types
export interface CreatePortfolioForm {
  name: string;
  description?: string;
  tags: string[];
  user_id?: string;
}

export interface AddPropertyForm {
  address: string;
  purchase_price: number;
  purchase_date: string;
  down_payment: number;
  loan_amount: number;
  interest_rate: number;
  loan_term_years: number;
  monthly_rent: number;
  monthly_expenses: {
    property_tax: number;
    insurance: number;
    maintenance: number;
    property_management: number;
    utilities?: number;
    hoa?: number;
    other?: number;
  };
  closing_costs: number;
  renovation_costs: number;
  current_value: number;
  notes?: string;
  tags: string[];
}

// Pagination Types
export interface PaginationParams {
  page: number;
  limit: number;
  sort_by?: string;
  order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

// API Error Types
export interface APIError {
  error: string;
  message: string;
  field?: string;
  errors?: Array<{ field: string; message: string }>;
}

