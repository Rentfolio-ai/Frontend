// FILE: src/hooks/useReportGenerator.ts
/**
 * Hook for managing report generation
 * Handles API calls, state, and default type inference
 */
import { useState, useCallback, useMemo } from 'react';
import { generateReport } from '../services/agentsApi';
import { subscriptionService } from '../services/subscriptionService';
import type { ReportData } from '../components/reports/ReportDrawer';
import type { InvestmentReportFormat } from '../types/enums';
import type { InvestmentStrategy, PnLOutput } from '../types/pnl';
import type { 
  ReportStrategy, 
  ReportDealMetrics,
  ReportPropertyData,
  ReportFinancialInputs,
  ReportRecommendation,
} from '../types/backendTools';
import { logger } from '../utils/logger';

interface UseReportGeneratorOptions {
  /** Latest P&L output for valuation data */
  pnlOutput?: PnLOutput | null;
  /** Latest strategy from P&L run */
  strategy?: InvestmentStrategy;
  /** Property address for report header */
  propertyAddress?: string;
  /** Custom valuation data to pass to API */
  valuationData?: Record<string, unknown>;
  /** Property details */
  propertyData?: ReportPropertyData;
  /** Pre-computed deal recommendation */
  recommendation?: ReportRecommendation;
  /** Narrative summary for the report */
  narrativeSummary?: string;
  /** Pros of the deal */
  pros?: string[];
  /** Cons of the deal */
  cons?: string[];
  /** Risk factors */
  riskFactors?: string[];
}

interface UseReportGeneratorReturn {
  report: ReportData | null;
  isLoading: boolean;
  error: string | null;
  isDrawerOpen: boolean;

  generateReportWithType: (type: InvestmentReportFormat) => Promise<void>;
  requestReport: (type: InvestmentReportFormat) => void;
  confirmPendingReport: () => Promise<void>;
  cancelPendingReport: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  clearReport: () => void;

  pendingReportType: InvestmentReportFormat | null;
  billingCharge: number | null;
  inferredReportType: InvestmentReportFormat;
  inferredStrategy: InvestmentStrategy | undefined;
}

/**
 * Map frontend InvestmentStrategy to backend ReportStrategy
 */
function mapToReportStrategy(strategy?: InvestmentStrategy): ReportStrategy {
  if (!strategy) return 'LTR';
  const normalized = strategy.toUpperCase();
  if (normalized === 'STR') return 'STR';
  if (normalized === 'LTR') return 'LTR';
  if (normalized === 'FLIP') return 'FLIP';
  if (normalized === 'ADU') return 'LTR'; // ADU typically maps to LTR metrics
  if (normalized === 'MF') return 'LTR'; // Multi-family maps to LTR
  return 'LTR';
}

/**
 * Infer report type from investment strategy
 */
function inferReportType(strategy?: InvestmentStrategy): InvestmentReportFormat {
  if (!strategy) return 'full';
  const normalized = strategy.toUpperCase();
  if (normalized === 'STR') return 'str';
  if (normalized === 'LTR') return 'ltr';
  if (normalized === 'FLIP') return 'flip';
  if (normalized === 'ADU') return 'adu';
  return 'full';
}

/**
 * Build financial inputs from P&L output for the backend
 */
function buildFinancialInputsFromPnL(pnlOutput: PnLOutput): ReportFinancialInputs {
  const purchasePrice = pnlOutput.financingSummary.downPayment + pnlOutput.financingSummary.loanAmount;
  
  return {
    purchase_price: purchasePrice,
    down_payment_amount: pnlOutput.financingSummary.downPayment,
    interest_rate: 0.075, // Default, could be extracted if available
    loan_term_years: 30,
    closing_costs: pnlOutput.financingSummary.closingCosts,
    renovation_budget: pnlOutput.financingSummary.rehabBudget,
    monthly_rent_ltr: pnlOutput.meta.strategy === 'LTR' 
      ? pnlOutput.year1.income.grossPotentialIncome / 12 
      : undefined,
    nightly_rate_str: pnlOutput.meta.strategy === 'STR' 
      ? (pnlOutput.year1.income.grossPotentialIncome / 365) * 1.3 // Rough estimate
      : undefined,
    occupancy_rate_str: pnlOutput.meta.strategy === 'STR' ? 0.70 : undefined,
    property_tax_monthly: pnlOutput.year1.expenses.propertyTax / 12,
    insurance_monthly: pnlOutput.year1.expenses.insurance / 12,
    utilities_monthly: pnlOutput.year1.expenses.utilities / 12,
    management_fee_percent: pnlOutput.year1.expenses.propertyManagement / pnlOutput.year1.income.grossPotentialIncome,
    maintenance_percent: 0.05,
    capex_reserve_percent: 0.05,
    hoa_monthly: pnlOutput.year1.expenses.hoa / 12,
  };
}

/**
 * Build deal metrics from P&L output for the backend
 */
function buildDealMetricsFromPnL(pnlOutput: PnLOutput): ReportDealMetrics {
  const strategy = mapToReportStrategy(pnlOutput.meta.strategy);
  
  return {
    strategy,
    gross_annual_income: pnlOutput.year1.income.grossPotentialIncome,
    total_annual_expenses: pnlOutput.year1.expenses.totalExpenses,
    noi: pnlOutput.year1.noi,
    annual_debt_service: pnlOutput.year1.annualDebtService,
    cash_flow_monthly: pnlOutput.year1.monthlyCashflow,
    cash_flow_annual: pnlOutput.year1.monthlyCashflow * 12,
    cap_rate: pnlOutput.year1.capRate / 100, // Convert to decimal
    cash_on_cash: pnlOutput.year1.cashOnCash / 100, // Convert to decimal
    dscr: pnlOutput.year1.noi / pnlOutput.year1.annualDebtService || 0,
    breakeven_occupancy: null, // Could calculate if needed
    operating_expense_ratio: pnlOutput.year1.expenses.totalExpenses / pnlOutput.year1.income.grossPotentialIncome,
  };
}

/**
 * Build legacy valuation payload for backward compatibility
 */
function buildValuationFromPnL(pnlOutput: PnLOutput): Record<string, unknown> {
  return {
    strategy: pnlOutput.meta.strategy,
    purchase_price: pnlOutput.financingSummary.downPayment + pnlOutput.financingSummary.loanAmount,
    total_investment: pnlOutput.financingSummary.totalInvestment,
    monthly_cashflow: pnlOutput.year1.monthlyCashflow,
    noi: pnlOutput.year1.noi,
    cap_rate: pnlOutput.year1.capRate,
    cash_on_cash: pnlOutput.year1.cashOnCash,
    gross_yield: pnlOutput.year1.grossYield,
    annual_debt_service: pnlOutput.year1.annualDebtService,
    income: {
      gross_potential: pnlOutput.year1.income.grossPotentialIncome,
      vacancy_loss: pnlOutput.year1.income.vacancyLoss,
      effective_gross: pnlOutput.year1.income.effectiveGrossIncome,
      total: pnlOutput.year1.income.totalIncome,
    },
    expenses: {
      property_tax: pnlOutput.year1.expenses.propertyTax,
      insurance: pnlOutput.year1.expenses.insurance,
      hoa: pnlOutput.year1.expenses.hoa,
      utilities: pnlOutput.year1.expenses.utilities,
      property_management: pnlOutput.year1.expenses.propertyManagement,
      maintenance: pnlOutput.year1.expenses.maintenance,
      total: pnlOutput.year1.expenses.totalExpenses,
    },
    financing: {
      down_payment: pnlOutput.financingSummary.downPayment,
      closing_costs: pnlOutput.financingSummary.closingCosts,
      rehab_budget: pnlOutput.financingSummary.rehabBudget,
      loan_amount: pnlOutput.financingSummary.loanAmount,
      monthly_payment: pnlOutput.financingSummary.monthlyPayment,
    },
    flip: pnlOutput.year1.flip
      ? {
          after_repair_value: pnlOutput.year1.flip.afterRepairValue,
          rehab_budget: pnlOutput.year1.flip.rehabBudget,
          projected_profit: pnlOutput.year1.flip.projectedProfit,
          hold_roi: pnlOutput.year1.flip.holdRoi,
          annualized_roi: pnlOutput.year1.flip.annualizedRoi,
        }
      : undefined,
  };
}

export function useReportGenerator(
  options: UseReportGeneratorOptions = {}
): UseReportGeneratorReturn {
  const { 
    pnlOutput, 
    strategy, 
    propertyAddress, 
    valuationData,
    propertyData,
    recommendation,
    narrativeSummary,
    pros,
    cons,
    riskFactors,
  } = options;

  const [report, setReport] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [pendingReportType, setPendingReportType] = useState<InvestmentReportFormat | null>(null);
  const [billingCharge, setBillingCharge] = useState<number | null>(null);

  // Computed values
  const inferredReportType = useMemo(
    () => inferReportType(strategy || pnlOutput?.meta.strategy),
    [strategy, pnlOutput?.meta.strategy]
  );

  const inferredStrategy = useMemo(
    () => strategy || pnlOutput?.meta.strategy,
    [strategy, pnlOutput?.meta.strategy]
  );

  // Build valuation data for API (legacy format)
  const effectiveValuationData = useMemo(() => {
    if (valuationData) return valuationData;
    if (pnlOutput) return buildValuationFromPnL(pnlOutput);
    return {};
  }, [valuationData, pnlOutput]);

  // Build property data for new backend format
  const effectivePropertyData = useMemo((): ReportPropertyData => {
    if (propertyData) return propertyData;
    return {
      address: propertyAddress,
      city: null,
      state: null,
      price: pnlOutput ? pnlOutput.financingSummary.downPayment + pnlOutput.financingSummary.loanAmount : null,
      bedrooms: null,
      bathrooms: null,
      sqft: null,
      property_type: 'single_family',
    };
  }, [propertyData, propertyAddress, pnlOutput]);

  // Build financial inputs for new backend format
  const effectiveFinancialInputs = useMemo((): ReportFinancialInputs | null => {
    if (pnlOutput) return buildFinancialInputsFromPnL(pnlOutput);
    return null;
  }, [pnlOutput]);

  // Build deal metrics for new backend format
  const effectiveDealMetrics = useMemo((): ReportDealMetrics | null => {
    if (pnlOutput) return buildDealMetricsFromPnL(pnlOutput);
    return null;
  }, [pnlOutput]);

  // Actions
  const generateReportWithType = useCallback(
    async (type: InvestmentReportFormat) => {
      setIsLoading(true);
      setError(null);

      logger.info('[useReportGenerator] Generating report', { type, propertyAddress });

      try {
        // Build request payload - support both legacy and new formats
        const requestPayload: Record<string, unknown> = {
          valuation: effectiveValuationData,
          report_type: type,
          export_format: 'text',
          property_address: propertyAddress,
        };

        // Add new backend format fields if available
        if (effectiveFinancialInputs && effectiveDealMetrics) {
          requestPayload.property_data = effectivePropertyData;
          requestPayload.financial_inputs = effectiveFinancialInputs;
          requestPayload.metrics = effectiveDealMetrics;
          requestPayload.recommendation = recommendation || 'Negotiate';
          requestPayload.narrative_summary = narrativeSummary || 'Investment analysis report';
          requestPayload.pros = pros || [];
          requestPayload.cons = cons || [];
          requestPayload.risk_factors = riskFactors || [];
        }

        const response = await generateReport(requestPayload as any);

        if (!response.success) {
          throw new Error(response.message || 'Report generation failed');
        }

        const reportData: ReportData = {
          content: response.report,
          report_type: response.report_type || type,
          generated_at: response.generated_at || new Date().toISOString(),
          property_address: response.property_details?.address || propertyAddress,
          strategy: response.strategy,
          recommendation: response.recommendation,
          property_details: response.property_details,
          metrics: response.metrics as ReportDealMetrics | undefined,
          sections: response.sections,
          pros: response.pros || pros,
          cons: response.cons || cons,
          risk_factors: response.risk_factors || riskFactors,
        };

        setReport(reportData);
        logger.info('[useReportGenerator] Report generated successfully', { type });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to generate report';
        setError(message);
        logger.error('[useReportGenerator] Report generation failed', { error: message });
      } finally {
        setIsLoading(false);
      }
    },
    [
      effectiveValuationData, 
      effectivePropertyData, 
      effectiveFinancialInputs, 
      effectiveDealMetrics,
      propertyAddress,
      recommendation,
      narrativeSummary,
      pros,
      cons,
      riskFactors,
    ]
  );

  const requestReport = useCallback((type: InvestmentReportFormat) => {
    setPendingReportType(type);
  }, []);

  const confirmPendingReport = useCallback(async () => {
    if (!pendingReportType) return;
    const type = pendingReportType;
    setPendingReportType(null);
    await generateReportWithType(type);

    try {
      const result = await subscriptionService.recordAction('report', {
        report_type: type,
        property_address: propertyAddress || '',
      });
      if (result?.success) {
        setBillingCharge(result.amount_cents / 100);
        setTimeout(() => setBillingCharge(null), 5000);
      }
    } catch {
      // billing recording is best-effort; report still delivered
    }
  }, [pendingReportType, generateReportWithType, propertyAddress]);

  const cancelPendingReport = useCallback(() => {
    setPendingReportType(null);
  }, []);

  const openDrawer = useCallback(() => {
    setIsDrawerOpen(true);
  }, []);

  const closeDrawer = useCallback(() => {
    setIsDrawerOpen(false);
  }, []);

  const clearReport = useCallback(() => {
    setReport(null);
    setError(null);
  }, []);

  return {
    report,
    isLoading,
    error,
    isDrawerOpen,

    generateReportWithType,
    requestReport,
    confirmPendingReport,
    cancelPendingReport,
    openDrawer,
    closeDrawer,
    clearReport,

    pendingReportType,
    billingCharge,
    inferredReportType,
    inferredStrategy,
  };
}

export default useReportGenerator;
