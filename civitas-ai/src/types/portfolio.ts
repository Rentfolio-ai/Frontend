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

// ==========================================
// AI Portfolio Types (Health, Optimizer, Rebalancer)
// ==========================================

// Health Score Types
export type HealthGrade = 'A+' | 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'C-' | 'D' | 'F';
export type ComponentStatus = 'excellent' | 'good' | 'warning' | 'critical';

export interface ComponentScore {
  name: string;
  score: number;
  weight: number;
  status: ComponentStatus;
  value: string | number;
  benchmark: string | number;
  insight: string;
}

export interface HealthBreakdown {
  cash_flow: ComponentScore;
  cap_rate: ComponentScore;
  geographic_diversity: ComponentScore;
  strategy_diversity: ComponentScore;
  dscr: ComponentScore;
  debt_to_equity: ComponentScore;
}

export interface HealthScore {
  grade: HealthGrade;
  score: number;
  breakdown: HealthBreakdown;
  action_items: string[];
  summary: string;
}

// Optimizer Types
export type RecommendationType = 'sell' | 'hold' | 'buy' | 'improve' | 'refinance' | 'diversify';
export type RecommendationPriority = 'urgent' | 'high' | 'medium' | 'low';
export type RiskTolerance = 'conservative' | 'moderate' | 'aggressive';

export interface Recommendation {
  type: RecommendationType;
  priority: RecommendationPriority;
  title: string;
  description: string;
  property_id?: string;
  property_address?: string;
  expected_impact?: string;
  reasoning: string;
}

export interface TargetAllocation {
  strategy_targets: Record<string, number>;
  market_targets: Record<string, number>;
  property_count_target: number;
}

export interface PropertySuggestion {
  market: string;
  strategy: string;
  price_range: { min: number; max: number };
  expected_cap_rate: number;
  expected_cash_flow: number;
  reasoning: string;
}

export interface OptimizationPlan {
  recommendations: Recommendation[];
  target_allocation: TargetAllocation;
  next_acquisition: PropertySuggestion | null;
  summary: string;
  generated_at: string;
}

export interface InvestorProfile {
  risk_tolerance: RiskTolerance;
  target_markets: string[];
  preferred_strategies: string[];
  cash_flow_goal_monthly: number;
  portfolio_value_goal: number;
  time_horizon_years: number;
  available_capital: number;
}

// Rebalancer Types
export type DriftSeverity = 'none' | 'minor' | 'moderate' | 'significant' | 'critical';
export type RebalanceActionType = 'sell' | 'buy' | 'hold' | 'reposition';

export interface AllocationDrift {
  dimension: string;
  category: 'market' | 'strategy';
  current_pct: number;
  target_pct: number;
  drift_pct: number;
  severity: DriftSeverity;
}

export interface DriftAnalysis {
  overall_severity: DriftSeverity;
  market_drifts: AllocationDrift[];
  strategy_drifts: AllocationDrift[];
  concentration_warnings: string[];
  underperforming_assets: string[];
  needs_rebalancing: boolean;
}

export interface RebalanceAction {
  action: RebalanceActionType;
  property_id?: string;
  property_address?: string;
  market?: string;
  strategy?: string;
  reason: string;
  priority: number;
  estimated_impact: string;
}

export interface RebalancePlan {
  drift_analysis: DriftAnalysis;
  actions: RebalanceAction[];
  summary: string;
  projected_allocation_after: {
    markets: Record<string, number>;
    strategies: Record<string, number>;
  };
  generated_at: string;
}

// Portfolio Alert Types
export type PortfolioAlertType =
  | 'health_decline'
  | 'health_improvement'
  | 'underperforming_asset'
  | 'concentration_risk'
  | 'market_warning'
  | 'rebalance_needed'
  | 'opportunity'
  | 'milestone'
  | 'refinance_opportunity'
  | 'cashflow_warning';

export type AlertSeverity = 'info' | 'low' | 'medium' | 'high' | 'critical';

export interface PortfolioAlert {
  alert_id: string;
  alert_type: PortfolioAlertType;
  severity: AlertSeverity;
  title: string;
  summary: string;
  portfolio_id?: string;
  property_id?: string;
  property_address?: string;
  data: Record<string, unknown>;
  recommendations: string[];
  created_at: string;
  is_read: boolean;
  is_dismissed: boolean;
}
