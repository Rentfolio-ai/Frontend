// FILE: src/types/backendTools.ts
// Type definitions for backend tool inputs and outputs
// Maps to the backend agent tool schemas

// ============================================================================
// Investment Strategy Types
// ============================================================================

export type InvestmentType = 'STR' | 'LTR' | 'Flip' | 'ADU' | 'MF' | 'Land';
export type STRLegality = 'allowed' | 'restricted' | 'banned';
export type ComplianceCheckType = 'all' | 'str_legality' | 'adu_feasibility' | 'zoning' | 'permits';
export type PropertyTypeBackend = 'single_family' | 'condo' | 'townhouse' | 'multi_family';
export type ComplianceStrategy = 'STR' | 'MTR' | 'LTR';
export type TransactionType = 'INCOME' | 'EXPENSE';

// ============================================================================
// Scout Properties Tool
// ============================================================================

export interface ScoutPropertiesInput {
  city?: string | null;
  state?: string | null;
  zip_code?: string | null;
  budget?: number | null;
  max_price?: number | null;
  min_price?: number | null;
  min_bedrooms?: number | null;
  max_bedrooms?: number | null;
  min_sqft?: number | null;
  max_sqft?: number | null;
  min_year_built?: number | null;
  max_year_built?: number | null;
  investment_type?: InvestmentType | null;
  str_legality?: STRLegality | null;
  require_adu_permission?: boolean | null;
  limit?: number; // default 20, max 100
  query?: string | null; // Natural language query for semantic ranking
  // ENHANCED: Smart sorting and value scoring (NEW)
  sort_by?: 'price' | 'value' | 'potential' | 'date' | 'cash_flow'; // default: 'price'
  include_value_score?: boolean; // default: false
}

export interface ScoutedProperty {
  listing_id: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  year_built?: number;
  property_type?: PropertyTypeBackend;
  lat?: number;
  lng?: number;
  photos?: string[];
  days_on_market?: number;
  listing_url?: string;
  // Additional listing details
  hoa_fee?: number;          // Monthly HOA fee
  description?: string;      // Listing description
  listing_type?: string;     // "Standard" | "Foreclosure" | "Short Sale" | "New Construction"
  mls_number?: string;       // MLS ID
  lot_size?: number;         // Lot size in sqft
  // Rentcast-derived estimates
  nightly_price?: number;
  monthly_revenue_estimate?: number;
  annual_revenue_estimate?: number;
  cash_on_cash_roi?: number;
  avg_occupancy_rate?: number;
  financial_snapshot?: {
    estimated_monthly_cash_flow: number;
    status: 'positive' | 'negative';
    estimated_rent: number;
    assumptions: {
      rate: number;
      down_payment: number;
      rule: string;
    };
  };
  // ENHANCED: Value scoring (NEW)
  value_score?: number;           // 0-100 value assessment score
  value_grade?: 'A' | 'B' | 'C' | 'D' | 'F';  // Letter grade for quick assessment
}

export interface ScoutPropertiesOutput {
  success: boolean;
  location: string;
  total_found: number;
  returned?: number;
  properties: ScoutedProperty[];
  filters_applied?: Record<string, unknown>;
  center_coordinates?: { lat: number; lng: number };
  str_regulations?: {
    summary: string;
    str_friendly: boolean;
    compliance_tips: string[];
  };
  // Market context - always included when searching by city or zip_code
  market_context?: {
    zip_code: string;
    sale_stats: {
      median_price: number;
      avg_price_per_sqft: number;
      avg_days_on_market?: number;
      listings_count?: number;
    };
    rental_stats: {
      avg_rent: number;
      avg_rent_per_sqft?: number;
      listings_count?: number;
    };
    history_range?: string;         // e.g., "3m", "12m"
    summary: string;                // Human-readable summary with rent-to-price ratio
  };
  market_seasonality?: unknown;
  market_demand?: unknown;
  // ENHANCED: Sorting metadata (NEW)
  sort_method?: string;           // How results were sorted
  value_scoring_enabled?: boolean; // Whether value scores were calculated
  message?: string;
}

// ============================================================================
// Calculate P&L Tool
// ============================================================================

export interface CalculatePnLInput {
  strategy: 'STR' | 'LTR' | 'ADU' | 'MF' | 'Flip';
  purchase_price: number;
  // STR-specific
  adr?: number | null;
  expected_occupancy_pct?: number | null; // 0-1, default 0.65
  avg_booking_nights?: number | null; // default 3
  // LTR-specific
  monthly_rent?: number | null;
  vacancy_rate_pct?: number | null; // 0-1, default 0.05
  // Financing
  is_financed?: boolean; // default true
  down_payment_pct?: number | null; // 0-1, default 0.25
  interest_rate_annual?: number | null; // 0-0.25, default 0.075
  loan_term_years?: number | null; // 1-40, default 30
  // Operating expenses
  property_tax_annual?: number | null;
  insurance_annual?: number | null;
  hoa_monthly?: number | null; // default 0
  property_management_pct_of_income?: number | null; // 0-0.5
  // Acquisition costs
  closing_cost_pct?: number | null; // 0-0.1, default 0.03
  rehab_budget?: number | null; // default 0
  furnishing_budget?: number | null;
  permit_fees?: number | null;
  // ADU-specific
  adu_monthly_rent?: number | null;
  adu_vacancy_rate_pct?: number | null;
  // Multi-family specific
  mf_unit_rents?: number[] | null;
  mf_vacancy_rate_pct?: number | null;
  // Flip-specific
  arv?: number | null; // After Repair Value
  projected_sales_cost_pct?: number | null;
  hold_time_months?: number | null; // 1-36
  rehab_cost?: number | null;
  // Projections
  projection_years?: number | null; // 1-30, default 5
  // Property reference
  property_id?: string | null;
  address?: string | null;
}

export interface PnLYear1Output {
  gross_scheduled_income: number;
  vacancy_loss: number;
  gross_operating_income: number;
  total_operating_expenses: number;
  noi: number;
  annual_debt_service: number;
  annual_cashflow: number;
  monthly_cashflow: number;
}

export interface PnLFinancingSummary {
  purchase_price: number;
  down_payment: number;
  loan_amount: number;
  closing_costs: number;
  total_cash_invested: number;
  monthly_mortgage: number;
}

export interface PnLExpenseBreakdown {
  property_tax: number;
  insurance: number;
  property_management: number;
  maintenance: number;
  capex_reserves: number;
  utilities?: number;
  internet?: number;
  cleaning?: number;
  platform_fees?: number;
  hoa?: number;
}

export interface PnLMetrics {
  cap_rate: number;
  cash_on_cash: number;
  dscr: number; // Debt Service Coverage Ratio
  gross_rent_multiplier?: number;
  break_even_occupancy?: number;
}

export interface PnLFlipMetrics {
  arv: number;
  total_project_cost: number;
  gross_profit: number;
  net_profit: number;
  roi_pct: number;
  hold_time_months: number;
  annualized_roi?: number;
}

// Legacy format (calculate_pnl_tool)
export interface CalculatePnLOutput {
  success: boolean;
  strategy: 'STR' | 'LTR' | 'ADU' | 'MF' | 'Flip';
  property_address?: string;
  meta: {
    strategy: string;
    propertyId?: string;
    purchasePrice: number;
    downPaymentPct: number;
  };
  year1: PnLYear1Output;
  financingSummary: PnLFinancingSummary;
  expenseBreakdown: PnLExpenseBreakdown;
  metrics: PnLMetrics;
  // Flip-specific
  flipMetrics?: PnLFlipMetrics;
  // Multi-year projections
  projections?: Array<{
    year: number;
    cashflow: number;
    equity: number;
    total_return: number;
  }>;
  // AI insights
  insights?: {
    recommendation: 'BUY' | 'NEGOTIATE' | 'PASS';
    summary: string;
    pros?: string[];
    cons?: string[];
  };
  message?: string;
}

// ============================================================================
// New Validated PNL Calculation (request_pnl_calculation)
// ============================================================================

export interface PnLYear1Validated {
  gross_potential_income: number;
  effective_gross_income: number;
  total_operating_expenses: number;
  noi: number;
  annual_debt_service: number;
  cashflow_before_taxes: number;  // Annual, divide by 12 for monthly
  cap_rate: number;               // Decimal (0.06 = 6%)
  cash_on_cash_return: number;    // Decimal (0.08 = 8%)
  dscr: number;                   // Decimal (1.5 = 1.5x)
  // Additional fields that may be present
  gross_scheduled_income?: number;
  vacancy_loss?: number;
  gross_operating_income?: number;
  annual_cashflow?: number;
  monthly_cashflow?: number;
}

export interface PnLFinancingSummaryValidated {
  purchase_price: number;
  down_payment: number;
  loan_amount: number;
  total_cash_invested: number;
  // Additional fields that may be present
  closing_costs?: number;
  monthly_mortgage?: number;
}

export interface RequestPnLCalculationResult {
  strategy: string;
  year1: PnLYear1Validated;
  financing_summary: PnLFinancingSummaryValidated;
  // Optional additional fields
  expense_breakdown?: PnLExpenseBreakdown;
  projections?: Array<{
    year: number;
    cashflow: number;
    equity: number;
    total_return: number;
  }>;
  insights?: {
    recommendation: 'BUY' | 'NEGOTIATE' | 'PASS';
    summary: string;
    pros?: string[];
    cons?: string[];
  };
  property_address?: string;
}

export interface RequestPnLCalculationResponse {
  success: boolean;

  // If success = true
  result?: RequestPnLCalculationResult;
  message?: string;

  // If success = false
  error?: string;                    // "Missing required inputs" | "Calculation validation failed" | "Calculation error"
  missing_fields?: string[];         // List of missing required fields
  validation_error?: string;         // Mathematical validation error message
}

// ============================================================================
// Request Metrics Calculation Tool (NEW - replaces compute_metrics_tool)
// ============================================================================

export interface RequestMetricsCalculationInput {
  // Required
  strategy: 'STR' | 'LTR';
  purchase_price: number;
  down_payment_amount: number;
  interest_rate: number;              // 0-1, e.g., 0.075 = 7.5%
  loan_term_years: number;            // Default: 30

  // Optional Financing
  closing_costs?: number;             // Default: 0
  renovation_budget?: number;         // Default: 0

  // Income (strategy-specific - REQUIRED)
  // For STR:
  nightly_rate_str?: number;          // REQUIRED if strategy is STR
  occupancy_rate_str?: number;        // REQUIRED if strategy is STR (0-1)

  // For LTR:
  monthly_rent_ltr?: number;          // REQUIRED if strategy is LTR

  // Expenses (Monthly - can be 0 but must be provided)
  property_tax_monthly: number;       // Default: 0
  insurance_monthly: number;          // Default: 0
  utilities_monthly?: number;         // Default: 0
  management_fee_percent: number;     // Default: 0 (0-1, e.g., 0.08 = 8%)
  maintenance_percent: number;        // Default: 0.05 (0-1, e.g., 0.05 = 5%)
  capex_reserve_percent: number;      // Default: 0.05 (0-1, e.g., 0.05 = 5%)
  hoa_monthly?: number;               // Default: 0
}

export interface DealMetrics {
  strategy: 'STR' | 'LTR';
  gross_annual_income: number;
  total_annual_expenses: number;
  noi: number;                        // Net Operating Income
  annual_debt_service: number;
  cash_flow_monthly: number;
  cash_flow_annual: number;
  cap_rate: number;                   // Decimal (0.06 = 6%)
  cash_on_cash: number;               // Decimal (0.08 = 8%)
  dscr: number;                       // Debt Service Coverage Ratio
  breakeven_occupancy?: number;       // For STR only (0-1)
  operating_expense_ratio: number;
}

export interface RequestMetricsCalculationResponse {
  success: boolean;

  // If success = true
  result?: DealMetrics;
  message?: string;

  // If success = false
  error?: string;                    // "Missing required inputs" | "Calculation validation failed" | "Calculation error"
  missing_fields?: string[];         // List of missing required fields
  validation_error?: string;         // Mathematical validation error message
}

// ============================================================================
// Check Compliance Tool
// ============================================================================

export interface CheckComplianceInput {
  city: string;
  state: string;
  county?: string | null;
  check_type?: ComplianceCheckType; // default 'all'
  property_type?: PropertyTypeBackend; // default 'single_family'
  is_primary_residence?: boolean; // default false
  strategy?: ComplianceStrategy; // default 'STR'
  hoa_name?: string | null;
  hoa_type?: string | null;
}

export interface ComplianceRule {
  rule_type: string;
  description: string;
  status: 'allowed' | 'restricted' | 'banned' | 'unknown';
  source?: string;
  effective_date?: string;
}

export interface CheckComplianceOutput {
  success: boolean;
  location: {
    city: string;
    state: string;
    county?: string;
  };
  overall_risk_level: 'low' | 'medium' | 'high';
  str_legality?: STRLegality;
  adu_feasibility?: 'allowed' | 'restricted' | 'not_allowed' | 'unknown';
  key_rules: ComplianceRule[];
  permits_required: string[];
  estimated_permit_cost?: number;
  estimated_permit_timeline?: string;
  hoa_restrictions?: {
    has_hoa: boolean;
    hoa_name?: string;
    str_allowed?: boolean;
    min_lease_term?: number;
    notes?: string;
  };
  zoning_info?: {
    zone_code?: string;
    zone_description?: string;
    str_compatible?: boolean;
    adu_compatible?: boolean;
  };
  tips?: string[];
  sources?: string[];
  message?: string;
}

// ============================================================================
// Portfolio Analyzer Tool
// ============================================================================

export interface PortfolioPropertyInput {
  property_id: string;
  property_data: {
    address: string;
    city: string;
    state: string;
    purchase_price: number;
    current_value?: number;
    bedrooms?: number;
    bathrooms?: number;
    sqft?: number;
  };
  metrics: {
    monthly_cashflow: number;
    annual_cashflow: number;
    cap_rate: number;
    cash_on_cash: number;
    occupancy_rate?: number;
    noi?: number;
  };
}

export interface PortfolioAnalyzerInput {
  properties: PortfolioPropertyInput[];
}

export interface PortfolioAnalyzerOutput {
  success: boolean;
  total_properties: number;
  total_value: number;
  total_investment: number;
  total_equity: number;
  aggregate_metrics: {
    total_monthly_cashflow: number;
    total_annual_cashflow: number;
    weighted_avg_cap_rate: number;
    weighted_avg_coc: number;
    avg_occupancy?: number;
    total_noi: number;
  };
  tier_distribution: {
    A: number;
    B: number;
    C: number;
    D: number;
  };
  performance_ranking: Array<{
    property_id: string;
    address: string;
    score: number;
    tier: 'A' | 'B' | 'C' | 'D';
  }>;
  recommendations?: string[];
  message?: string;
}

// ============================================================================
// Cashflow Timeseries Tool
// ============================================================================

export interface CashflowTransaction {
  date: string; // YYYY-MM-DD
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
}

export interface CashflowTimeseriesInput {
  transactions: CashflowTransaction[];
}

export interface CashflowTimeseriesOutput {
  success: boolean;
  period_start: string;
  period_end: string;
  summary: {
    total_income: number;
    total_expenses: number;
    net_cashflow: number;
    avg_monthly_income: number;
    avg_monthly_expenses: number;
  };
  by_category: Record<string, number>;
  monthly_breakdown: Array<{
    month: string;
    income: number;
    expenses: number;
    net: number;
  }>;
  trends?: {
    income_trend: 'increasing' | 'stable' | 'decreasing';
    expense_trend: 'increasing' | 'stable' | 'decreasing';
  };
  message?: string;
}

// ============================================================================
// Analyze Renovation (Vision Tool)
// ============================================================================

export interface AnalyzeRenovationInput {
  image_url: string; // https URL to property photo
}

export interface RenovationItem {
  item: string;
  condition: 'good' | 'fair' | 'poor' | 'needs_replacement';
  estimated_cost_low: number;
  estimated_cost_high: number;
  priority: 'high' | 'medium' | 'low';
  description?: string;
}

// Legacy output format for analyze_renovation_from_image
export interface AnalyzeRenovationOutput {
  success: boolean;
  room_type?: string;
  overall_condition: 'excellent' | 'good' | 'fair' | 'poor';
  renovation_items: RenovationItem[];
  total_estimated_cost: {
    low: number;
    high: number;
  };
  roi_impact?: {
    estimated_value_add_low: number;
    estimated_value_add_high: number;
    roi_percentage?: number;
  };
  recommendations?: string[];
  message?: string;
}

// ============================================================================
// Enhanced Vision Tool (analyze_property_image)
// ============================================================================

export type VisionAnalysisType = 'renovation' | 'condition' | 'valuation' | 'comprehensive';
export type VisionRoomType = 'kitchen' | 'bathroom' | 'bedroom' | 'living_room' | 'exterior' | 'interior' | 'auto';

export interface AnalyzePropertyImageInput {
  // Image input (one of these required)
  image_url?: string;              // HTTPS URL to property photo
  image_base64?: string;           // Base64 encoded image (with or without data URL prefix)
  image_mime_type?: string;        // MIME type (required if base64, e.g., "image/jpeg")

  // Analysis configuration
  analysis_type?: VisionAnalysisType;  // Default: "renovation"
  room_type?: VisionRoomType;          // Default: "auto"
  property_address?: string;           // Property address to link analysis
  context?: string;                    // Additional context for analysis
  thread_id?: string;                  // Conversation thread ID for caching
}

export interface VisionConditionIssue {
  issue: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  location?: string;
  description: string;
  estimated_cost?: number;
}

export interface VisionCosmeticIssue {
  issue: string;
  severity: 'high' | 'medium' | 'low';
  description: string;
}

export interface VisionSafetyConcern {
  concern: string;
  severity: 'critical' | 'high' | 'medium';
  description: string;
}

export interface VisionCostBreakdownItem {
  category: string;
  cost: number;
  description: string;
}

export interface VisionCostBreakdown {
  total: number;
  breakdown: VisionCostBreakdownItem[];
}

export interface VisionRecommendation {
  priority: 'critical' | 'high' | 'medium' | 'low';
  action: string;
  estimated_cost: number;
  roi_impact?: string;
}

export interface AnalyzePropertyImageOutput {
  success: boolean;
  analysis_type: string;
  room_type: string;
  timestamp: string;

  // Condition Assessment
  condition?: {
    overall: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
    structural_issues: VisionConditionIssue[];
    cosmetic_issues: VisionCosmeticIssue[];
    safety_concerns: VisionSafetyConcern[];
  };

  // Renovation Costs (for renovation/comprehensive analysis)
  renovation_costs?: {
    basic_refresh: VisionCostBreakdown;
    standard_rental: VisionCostBreakdown;
    premium_upgrade: VisionCostBreakdown;
  };

  // Priorities
  priorities?: {
    critical: string[];
    high_impact: string[];
    nice_to_have: string[];
  };

  // Recommendations
  recommendations?: VisionRecommendation[];

  // Narrative Summary
  summary: string;

  // Image metadata
  image_metadata?: {
    format?: string;
    width?: number;
    height?: number;
    mode?: string;
    quality_warning?: string;
  };

  // Error handling
  error?: string;
  validation_errors?: string[];
}

// ============================================================================
// Tool Result Wrapper (Backend Response Format)
// ============================================================================

export type BackendToolName =
  | 'scout_properties'
  | 'request_pnl_calculation'       // New validated PNL tool
  | 'calculate_pnl_tool'            // Legacy PNL tool (backward compatibility)
  | 'request_metrics_calculation'   // New validated metrics tool
  | 'compute_metrics_tool'          // Legacy metrics tool (backward compatibility)
  | 'check_compliance'
  | 'get_market_stats'
  | 'portfolio_analyzer_tool'
  | 'cashflow_timeseries_tool'
  | 'analyze_property_image'        // New enhanced vision tool
  | 'analyze_renovation_from_image' // Legacy vision tool (backward compatibility)
  | 'generate_report'
  | 'compare_properties';

export interface BackendToolResult<T = unknown> {
  id?: string;
  tool_name: BackendToolName;
  title?: string;
  summary?: string;
  status?: 'success' | 'warning' | 'error';
  timestamp?: string;
  inputs?: Record<string, unknown>;
  data: T;
}

// Type-safe tool result variants
export type ScoutPropertiesToolResult = BackendToolResult<ScoutPropertiesOutput>;
export type CalculatePnLToolResult = BackendToolResult<CalculatePnLOutput>;
export type RequestPnLCalculationToolResult = BackendToolResult<RequestPnLCalculationResponse>;
export type CheckComplianceToolResult = BackendToolResult<CheckComplianceOutput>;
export type PortfolioAnalyzerToolResult = BackendToolResult<PortfolioAnalyzerOutput>;
export type CashflowTimeseriesToolResult = BackendToolResult<CashflowTimeseriesOutput>;
export type AnalyzeRenovationToolResult = BackendToolResult<AnalyzeRenovationOutput>;

// ============================================================================
// Generate Report Tool
// ============================================================================

export interface ReportPropertyData {
  address?: string | null;
  city?: string | null;
  state?: string | null;
  price?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  sqft?: number | null;
  property_type?: string; // default: 'single_family'
}

export interface ReportFinancialInputs {
  purchase_price: number;
  down_payment_amount: number;
  interest_rate: number; // decimal e.g. 0.07
  loan_term_years?: number; // default: 30
  closing_costs?: number; // default: 0
  renovation_budget?: number; // default: 0
  monthly_rent_ltr?: number | null;
  nightly_rate_str?: number | null;
  occupancy_rate_str?: number | null; // decimal e.g. 0.70
  property_tax_monthly?: number; // default: 0
  insurance_monthly?: number; // default: 0
  utilities_monthly?: number; // default: 0
  management_fee_percent?: number; // default: 0
  maintenance_percent?: number; // default: 0.05
  capex_reserve_percent?: number; // default: 0.05
  hoa_monthly?: number; // default: 0
}

export type ReportStrategy = 'STR' | 'MTR' | 'LTR' | 'BRRRR' | 'FLIP';
export type ReportRecommendation = 'Buy' | 'Pass' | 'Negotiate';
export type ReportTypeValue = 'str' | 'ltr' | 'adu' | 'flip' | 'full';

export interface ReportDealMetrics {
  strategy: ReportStrategy;
  gross_annual_income: number;
  total_annual_expenses: number;
  noi: number;
  annual_debt_service: number;
  cash_flow_monthly: number;
  cash_flow_annual: number;
  cap_rate: number; // decimal
  cash_on_cash: number; // decimal
  dscr: number;
  breakeven_occupancy?: number | null; // decimal
  operating_expense_ratio: number; // decimal
}

export interface GenerateReportInput {
  property_data: ReportPropertyData;
  financial_inputs: ReportFinancialInputs;
  metrics: ReportDealMetrics;
  pros: string[];
  risk_factors: string[];
  cons: string[];
  recommendation: ReportRecommendation;
  narrative_summary: string;
  report_type?: ReportTypeValue;
}

export interface GenerateReportOutput {
  // Report identifier for fetching from Reports API
  report_id: string;
  // Report type label (e.g., "STR Report", "LTR Underwriting")
  report_type: string;
  // Property address
  property_address: string;
  // Investment recommendation
  recommendation: string;
  // Key metrics summary
  key_metrics: {
    monthly_cash_flow: number;
    cap_rate: number;
    cash_on_cash: number;
    dscr: number;
  };
  // URL to view/fetch the full HTML report
  view_url: string;
  // Optional embedded HTML content
  html_content?: string;
  // ISO timestamp when report was created
  created_at: string;
  // Message from the AI about the report
  message: string;

  // ─────────────────────────────────────────────────────────────────────────────
  // Legacy fields for backward compatibility
  // ─────────────────────────────────────────────────────────────────────────────
  success?: boolean;
  format?: 'html' | 'text';
  report?: string;
  generated_at?: string;
  strategy?: ReportStrategy;
  report_content?: string;
  sections?: {
    executive_summary?: string;
    property_overview?: string;
    financial_analysis?: string;
    market_analysis?: string;
    risk_assessment?: string;
    recommendation?: string;
  };
  metadata?: {
    generated_at?: string;
    version?: string;
    model?: string;
  };
}

export type GenerateReportToolResult = BackendToolResult<GenerateReportOutput>;

// ============================================================================
// Get Market Stats Tool (NEW)
// ============================================================================

export interface GetMarketStatsInput {
  zip_code?: string;                  // Optional, 5-digit ZIP
  city?: string;                      // Optional city name
  state?: string;                     // Optional state abbreviation  
  data_type?: 'Sale' | 'Rental' | 'All';  // Default: 'All'
  history_range?: number;             // 1-24 months, default 12
  include_trends?: boolean;           // Include trend analysis (default: true)
  include_projections?: boolean;      // Include price projections (default: false)
}

export interface MarketHistoryEntry {
  median_price?: number;
  average_price?: number;
  median_rent?: number;
  average_rent?: number;
  total_listings?: number;
  avg_days_on_market?: number;
}

export interface GetMarketStatsOutput {
  success: boolean;
  location?: string;                  // Location string (city, state or ZIP)
  zip_code?: string;
  data_type: string;

  sale_data?: {
    average_price: number;
    median_price: number;
    price_per_sqft: number;
    avg_days_on_market: number;
    total_listings: number;
    history: Record<string, MarketHistoryEntry>;  // Key: "YYYY-MM"
  };

  rental_data?: {
    average_rent: number;
    median_rent: number;
    rent_per_sqft: number;
    avg_days_on_market: number;
    total_listings: number;
    history: Record<string, MarketHistoryEntry>;
  };

  // ENHANCED: Trend analysis (NEW)
  trends?: {
    price_trend_yoy?: number;         // Year-over-year price change (decimal, e.g., 0.0856 = 8.56%)
    price_trend_mom?: number;         // Month-over-month price change  
    rent_trend_yoy?: number;          // Year-over-year rent change
    inventory_trend?: number;         // Inventory level change
  };

  // ENHANCED: Market temperature assessment (NEW) 
  market_temperature?: 'hot' | 'warm' | 'neutral' | 'cool' | 'cold';

  // ENHANCED: Price projections (NEW)
  projections?: {
    predicted_price_6m: number;       // 6-month price forecast
    change_6m_pct: number;            // 6-month change percentage
    predicted_price_12m: number;      // 12-month price forecast
    change_12m_pct: number;           // 12-month change percentage
    confidence: 'high' | 'medium' | 'low';  // Projection confidence
    based_on_months: number;          // Number of historical months used
  };

  market_summary: {
    zip_code: string;
    assessment: 'seller_favored' | 'buyer_favored' | 'neutral';
    highlights: string[];
    median_sale_price?: number;
    median_rent?: number;
    gross_yield?: number;          // Percentage
    active_sale_listings?: number;
    active_rental_listings?: number;
  };

  message?: string;
}

export type GetMarketStatsToolResult = BackendToolResult<GetMarketStatsOutput>;

// ============================================================================
// Market Context (for contextualizing deals)
// ============================================================================

export interface MarketContext {
  zip_code: string;

  sale_data?: {
    average_price: number;
    median_price: number;
    price_per_sqft: number;
    avg_days_on_market: number;
    total_listings: number;
  };

  rental_data?: {
    average_rent: number;
    median_rent: number;
    rent_per_sqft: number;
    avg_days_on_market: number;
    total_listings: number;
  };

  market_summary: {
    assessment: 'seller_favored' | 'buyer_favored' | 'neutral';
    highlights: string[];
    gross_yield?: number;         // Annual rent / price (percentage)
  };
}

// ============================================================================
// Compare Properties Tool
// ============================================================================

export interface ComparePropertiesInput {
  properties: Array<{
    address: string;
    city?: string;
    state?: string;
    zip_code?: string;
    price?: number;
    bedrooms?: number;
    bathrooms?: number;
    sqft?: number;
    year_built?: number;
    property_type?: PropertyTypeBackend;
  }>;
  metrics?: string[]; // Optional: specific metrics to compare
}

export interface EnrichedPropertyData {
  address: string;
  city?: string;
  state?: string;
  zip_code?: string;
  price?: number;
  bedrooms?: number;
  bathrooms?: number;
  sqft?: number;
  year_built?: number;
  property_type?: PropertyTypeBackend;
  // Additional listing details
  hoa_fee?: number;          // Monthly HOA fee
  description?: string;      // Listing description
  listing_type?: string;     // "Standard" | "Foreclosure" | "Short Sale" | "New Construction"
  mls_number?: string;       // MLS ID
  lot_size?: number;         // Lot size in sqft
  // Enriched fields
  _index: number;                   // Display index (1-based)
  price_per_sqft?: number;          // Calculated: price / sqft
  location: string;                 // Combined city, state, zip
  short_address: string;            // Truncated address for table display
}

export interface ComparisonSummary {
  total_properties: number;
  insights: string[];               // Key findings
  price_range?: {
    min: number;
    max: number;
    avg: number;
    spread: number;                 // max - min
  };
}

export interface ComparePropertiesOutput {
  success: boolean;
  // Output format used ("html" or "markdown")
  format: 'html' | 'markdown';
  // Markdown-formatted comparison table (always provided)
  comparison_table: string;
  // Full HTML comparison report (only when format="html")
  comparison_report?: string;
  // Property data used in comparison (enriched with calculated fields)
  properties: EnrichedPropertyData[];
  // Number of properties compared
  properties_compared: number;
  // Metrics included in comparison
  metrics_compared: string[];
  // Insights and analysis
  summary: ComparisonSummary;
  message?: string;
}

export type ComparePropertiesToolResult = BackendToolResult<ComparePropertiesOutput>;

// ============================================================================
// RentCast API Response Types
// ============================================================================

export interface RentCastPropertyRecord {
  id: string;
  formattedAddress: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  county: string;

  bedrooms: number;
  bathrooms: number;
  squareFootage: number;
  lotSize: number;
  yearBuilt: number;
  propertyType: 'Single Family' | 'Condo' | 'Townhouse' | 'Manufactured' | 'Multi-Family' | 'Apartment' | 'Land';

  assessedValue?: number;
  taxAssessedValue?: number;
  taxAnnualAmount?: number;

  lastSalePrice?: number;
  lastSaleDate?: string;

  latitude: number;
  longitude: number;

  features?: {
    pool?: boolean;
    garage?: boolean;
    garageSpaces?: number;
    fireplace?: boolean;
    airConditioning?: boolean;
    heating?: boolean;
    view?: string;
  };
}

export interface RentCastListing {
  id: string;
  formattedAddress: string;
  city: string;
  state: string;
  zipCode: string;
  county: string;

  price: number;                  // Sale price or monthly rent
  status: 'Active' | 'Inactive';
  listingType: 'Standard' | 'New Construction' | 'Foreclosure' | 'Short Sale';
  daysOnMarket: number;

  bedrooms: number;
  bathrooms: number;
  squareFootage: number;
  lotSize: number;
  yearBuilt: number;
  propertyType: string;

  latitude: number;
  longitude: number;

  listedDate: string;
  removedDate?: string;
  createdDate: string;

  listingAgentName?: string;
  listingAgentPhone?: string;
  listingAgentEmail?: string;
}

export interface RentCastValueEstimate {
  price: number;
  priceRangeLow: number;
  priceRangeHigh: number;
  confidence?: 'high' | 'medium' | 'low';

  comparables?: Array<{
    id: string;
    formattedAddress: string;
    price: number;
    squareFootage: number;
    bedrooms: number;
    bathrooms: number;
    distance: number;             // Miles
    correlation: number;          // 0-1 similarity score
  }>;
}

export interface RentCastRentEstimate {
  rent: number;
  rentRangeLow: number;
  rentRangeHigh: number;
  confidence?: 'high' | 'medium' | 'low';

  comparables?: Array<{
    id: string;
    formattedAddress: string;
    price: number;                // Monthly rent
    squareFootage: number;
    bedrooms: number;
    bathrooms: number;
    distance: number;
    correlation: number;
  }>;
}
