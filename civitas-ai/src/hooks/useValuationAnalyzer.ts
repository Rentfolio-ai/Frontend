// FILE: src/hooks/useValuationAnalyzer.ts
/**
 * Hook for real-time valuation analysis with P&L calculator integration.
 * Provides dynamic ROI metrics that update whenever inputs change.
 * No cached copy - always recalculates from the deterministic P&L calculator.
 */
import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import type { PnLOutput, InvestmentStrategy, PnLAssumptions } from '../types/pnl';
import type { ValuationData, AppreciationData, ValuationRiskFactors } from '../components/chat/tool-cards/ValuationCard';
import type { RiskLevel } from '../types/compliance';
import { DEFAULT_ASSUMPTIONS } from '../types/pnl';
import { calculatePropertyPnL, mockCalculatePnL, assumptionsToRequest } from '../services/pnlApi';
import { logger } from '../utils/logger';

/* -------------------------------------------------------------------------- */
/*                              Type Definitions                              */
/* -------------------------------------------------------------------------- */

export interface ValuationInputs {
  // Property basics
  purchasePrice: number;
  bedrooms?: number;
  bathrooms?: number;
  sqft?: number;
  city?: string;
  state?: string;
  propertyAddress?: string;

  // STR-specific
  adr?: number;
  occupancy?: number; // 0-1 decimal
  avgCleaningFeePerBooking?: number;

  // LTR-specific
  monthlyRent?: number;

  // Financing
  isFinanced?: boolean;
  downPaymentPct?: number;
  interestRateAnnual?: number;
  loanTermYears?: number;

  // Operating expenses
  propertyTaxAnnual?: number;
  insuranceAnnual?: number;
  hoaMonthly?: number;
  utilitiesMonthly?: number;
  propertyManagementPct?: number;
  maintenancePct?: number;

  // Flip inputs (optional)
  rehabBudget?: number;
  afterRepairValue?: number;
  holdingMonths?: number;
  sellingCostsPct?: number;
}

export interface ValuationComplianceContext {
  overall_risk_level: RiskLevel;
  key_issues?: string[];
  permits_required?: number;
}

interface UseValuationAnalyzerOptions {
  initialInputs?: Partial<ValuationInputs>;
  strategy?: InvestmentStrategy;
  debounceMs?: number;
  autoCalculate?: boolean;
  complianceContext?: ValuationComplianceContext;
  appreciationData?: AppreciationData;
}

interface UseValuationAnalyzerReturn {
  // State
  inputs: ValuationInputs;
  strategy: InvestmentStrategy;
  valuationData: ValuationData | null;
  pnlOutput: PnLOutput | null;
  isCalculating: boolean;
  error: string | null;

  // Actions
  setInputs: (inputs: Partial<ValuationInputs>) => void;
  setInput: <K extends keyof ValuationInputs>(key: K, value: ValuationInputs[K]) => void;
  setStrategy: (strategy: InvestmentStrategy) => void;
  recalculate: () => Promise<void>;
  setComplianceContext: (ctx: ValuationComplianceContext | undefined) => void;
  setAppreciationData: (data: AppreciationData | undefined) => void;

  // Computed
  riskLevel: RiskLevel;
  riskFactors: ValuationRiskFactors;
}

/* -------------------------------------------------------------------------- */
/*                              Helper Functions                              */
/* -------------------------------------------------------------------------- */

const DEFAULT_INPUTS: ValuationInputs = {
  purchasePrice: 500000,
  bedrooms: 3,
  bathrooms: 2,
  sqft: 1500,
  adr: 200,
  occupancy: 0.7,
  avgCleaningFeePerBooking: 150,
  monthlyRent: 2500,
  isFinanced: true,
  downPaymentPct: 20,
  interestRateAnnual: 7,
  loanTermYears: 30,
  propertyTaxAnnual: 5000,
  insuranceAnnual: 2000,
  hoaMonthly: 0,
  utilitiesMonthly: 200,
  propertyManagementPct: 20,
  maintenancePct: 5,
};

/**
 * Convert ValuationInputs to PnLAssumptions format for the calculator
 */
function inputsToAssumptions(
  inputs: ValuationInputs,
  _strategy: InvestmentStrategy
): PnLAssumptions {
  const base = { ...DEFAULT_ASSUMPTIONS };

  // Purchase
  base.purchase.purchasePrice = inputs.purchasePrice;
  if (inputs.rehabBudget !== undefined) {
    base.purchase.rehabBudget = inputs.rehabBudget;
  }

  // Financing
  if (inputs.isFinanced !== undefined) {
    base.financing.isFinanced = inputs.isFinanced;
  }
  if (inputs.downPaymentPct !== undefined) {
    base.financing.downPaymentPct = inputs.downPaymentPct;
  }
  if (inputs.interestRateAnnual !== undefined) {
    base.financing.interestRateAnnual = inputs.interestRateAnnual;
  }
  if (inputs.loanTermYears !== undefined) {
    base.financing.loanTermYears = inputs.loanTermYears;
  }

  // Income - STR
  if (inputs.adr !== undefined) {
    base.income.str.adr = inputs.adr;
  }
  if (inputs.occupancy !== undefined) {
    // Convert from 0-1 decimal to percentage
    base.income.str.expectedOccupancyPct = inputs.occupancy * 100;
  }
  if (inputs.avgCleaningFeePerBooking !== undefined) {
    base.income.str.avgCleaningFeePerBooking = inputs.avgCleaningFeePerBooking;
  }

  // Income - LTR
  if (inputs.monthlyRent !== undefined) {
    base.income.ltr.monthlyRent = inputs.monthlyRent;
  }

  // Expenses
  if (inputs.propertyTaxAnnual !== undefined) {
    base.expenses.propertyTaxAnnual = inputs.propertyTaxAnnual;
  }
  if (inputs.insuranceAnnual !== undefined) {
    base.expenses.insuranceAnnual = inputs.insuranceAnnual;
  }
  if (inputs.hoaMonthly !== undefined) {
    base.expenses.hoaMonthly = inputs.hoaMonthly;
  }
  if (inputs.utilitiesMonthly !== undefined) {
    base.expenses.utilitiesMonthly = inputs.utilitiesMonthly;
  }
  if (inputs.propertyManagementPct !== undefined) {
    base.expenses.propertyManagementPctOfIncome = inputs.propertyManagementPct;
  }
  if (inputs.maintenancePct !== undefined) {
    base.expenses.maintenancePctOfIncome = inputs.maintenancePct;
  }

  return base;
}

/**
 * Derive risk factors from P&L output
 */
function deriveRiskFactors(
  output: PnLOutput | null,
  complianceContext?: ValuationComplianceContext
): ValuationRiskFactors {
  const factors: ValuationRiskFactors = {};

  if (!output) return factors;

  // Check for negative cashflow
  if (output.year1.monthlyCashflow < 0) {
    factors.negative_cashflow = true;
  }

  // Check DSCR (Debt Service Coverage Ratio)
  const monthlyNOI = output.year1.noi / 12;
  const monthlyDebtService = output.financingSummary.monthlyPayment;
  if (monthlyDebtService > 0) {
    const dscr = monthlyNOI / monthlyDebtService;
    if (dscr < 1.1) {
      factors.low_dscr = true;
    }
  }

  // Check expense ratio
  const totalExpenses = output.year1.expenses.totalExpenses;
  const grossIncome = output.year1.income.totalIncome;
  if (grossIncome > 0) {
    const expenseRatio = totalExpenses / grossIncome;
    if (expenseRatio > 0.45) {
      factors.high_expense_ratio = true;
    }
  }

  // Add regulatory risk from compliance context
  if (complianceContext?.overall_risk_level === 'high') {
    factors.regulatory_risk = true;
  }

  return factors;
}

/**
 * Compute overall risk level from factors
 */
function computeRiskLevel(factors: ValuationRiskFactors): RiskLevel {
  const flagCount = [
    factors.negative_cashflow,
    factors.low_dscr,
    factors.regulatory_risk,
    factors.high_expense_ratio,
  ].filter(Boolean).length;

  if (flagCount >= 2 || factors.negative_cashflow) return 'high';
  if (flagCount === 1) return 'medium';
  return 'low';
}

/**
 * Convert PnLOutput to ValuationData for the card
 */
function pnlOutputToValuationData(
  output: PnLOutput,
  inputs: ValuationInputs,
  options?: {
    complianceContext?: ValuationComplianceContext;
    appreciationData?: AppreciationData;
    riskFactors?: ValuationRiskFactors;
    riskLevel?: RiskLevel;
  }
): ValuationData {
  // Build property address from inputs
  const address = inputs.propertyAddress
    || (inputs.city && inputs.state ? `${inputs.city}, ${inputs.state}` : undefined);

  return {
    property_address: address,
    strategy: output.meta.strategy,
    property_tier: undefined, // Would come from backend

    // Core ROI metrics
    cash_on_cash_roi: output.year1.cashOnCash,
    cap_rate: output.year1.capRate,
    monthly_cash_flow: output.year1.monthlyCashflow,
    flip_roi: output.year1.flip?.holdRoi,

    // Additional metrics
    annual_revenue: output.year1.income.totalIncome,
    monthly_revenue: output.year1.income.totalIncome / 12,
    operating_expenses: output.year1.expenses.totalExpenses,
    noi: output.year1.noi,
    total_investment: output.financingSummary.totalInvestment,
    purchase_price: output.financingSummary.downPayment + output.financingSummary.loanAmount,

    // STR-specific
    adr: output.meta.strategy === 'STR' ? inputs.adr : undefined,
    occupancy: output.meta.strategy === 'STR' ? inputs.occupancy : undefined,

    // Expense breakdown from output
    expense_breakdown: {
      cleaning: output.year1.expenses.cleaningCosts,
      platform_fees: output.year1.expenses.platformFees,
      utilities: output.year1.expenses.utilities,
      maintenance: output.year1.expenses.maintenance,
      property_management: output.year1.expenses.propertyManagement,
      insurance: output.year1.expenses.insurance,
      property_tax: output.year1.expenses.propertyTax,
    },

    // Context data
    appreciation: options?.appreciationData,
    risk_factors: options?.riskFactors,
    overall_risk_level: options?.riskLevel,
    compliance_summary: options?.complianceContext,
  };
}

/* -------------------------------------------------------------------------- */
/*                                 Main Hook                                  */
/* -------------------------------------------------------------------------- */

export function useValuationAnalyzer(
  options: UseValuationAnalyzerOptions = {}
): UseValuationAnalyzerReturn {
  const {
    initialInputs,
    strategy: initialStrategy = 'STR',
    debounceMs = 300,
    autoCalculate = true,
    complianceContext: initialCompliance,
    appreciationData: initialAppreciation,
  } = options;

  // State
  const [inputs, setInputsState] = useState<ValuationInputs>(() => ({
    ...DEFAULT_INPUTS,
    ...initialInputs,
  }));
  const [strategy, setStrategy] = useState<InvestmentStrategy>(initialStrategy);
  const [pnlOutput, setPnlOutput] = useState<PnLOutput | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [complianceContext, setComplianceContext] = useState<ValuationComplianceContext | undefined>(
    initialCompliance
  );
  const [appreciationData, setAppreciationData] = useState<AppreciationData | undefined>(
    initialAppreciation
  );

  // Refs for debouncing
  const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastCalculationRef = useRef<number>(0);

  // Calculate derived values
  const riskFactors = useMemo(
    () => deriveRiskFactors(pnlOutput, complianceContext),
    [pnlOutput, complianceContext]
  );

  const riskLevel = useMemo(
    () => computeRiskLevel(riskFactors),
    [riskFactors]
  );

  const valuationData = useMemo<ValuationData | null>(() => {
    if (!pnlOutput) return null;
    return pnlOutputToValuationData(pnlOutput, inputs, {
      complianceContext,
      appreciationData,
      riskFactors,
      riskLevel,
    });
  }, [pnlOutput, inputs, complianceContext, appreciationData, riskFactors, riskLevel]);

  // Core calculation function
  const recalculate = useCallback(async () => {
    const calculationId = Date.now();
    lastCalculationRef.current = calculationId;

    setIsCalculating(true);
    setError(null);

    try {
      const assumptions = inputsToAssumptions(inputs, strategy);
      // Convert assumptions to flat form state for the API
      const formState: Record<string, number | boolean | string | null | undefined> = {
        purchasePrice: assumptions.purchase.purchasePrice,
        closingCostPct: assumptions.purchase.closingCostPct,
        rehabBudget: assumptions.purchase.rehabBudget,
        isFinanced: assumptions.financing.isFinanced,
        downPaymentPct: assumptions.financing.downPaymentPct,
        interestRateAnnual: assumptions.financing.interestRateAnnual,
        loanTermYears: assumptions.financing.loanTermYears,
        adr: assumptions.income.str.adr,
        expectedOccupancyPct: assumptions.income.str.expectedOccupancyPct,
        avgCleaningFeePerBooking: assumptions.income.str.avgCleaningFeePerBooking,
        platformFeePct: assumptions.income.str.platformFeePct,
        monthlyRent: assumptions.income.ltr.monthlyRent,
        vacancyRatePct: assumptions.income.ltr.vacancyRatePct,
        propertyTaxAnnual: assumptions.expenses.propertyTaxAnnual,
        insuranceAnnual: assumptions.expenses.insuranceAnnual,
        hoaMonthly: assumptions.expenses.hoaMonthly,
        utilitiesMonthly: assumptions.expenses.utilitiesMonthly,
        propertyManagementPctOfIncome: assumptions.expenses.propertyManagementPctOfIncome,
        maintenancePctOfIncome: assumptions.expenses.maintenancePctOfIncome,
      };
      const request = assumptionsToRequest(strategy, formState);

      logger.info('[useValuationAnalyzer] Calculating P&L', { purchasePrice: inputs.purchasePrice, strategy });

      let output: PnLOutput;
      try {
        const response = await calculatePropertyPnL(null, request);
        output = response.data;
      } catch (apiError) {
        logger.warn('[useValuationAnalyzer] API failed, using mock calculator', { error: String(apiError) });
        output = mockCalculatePnL(request);
      }

      // Only update if this is still the latest calculation
      if (lastCalculationRef.current === calculationId) {
        setPnlOutput(output);
        logger.info('[useValuationAnalyzer] Calculation complete', {
          cashOnCash: output.year1.cashOnCash,
          capRate: output.year1.capRate,
          monthlyCashflow: output.year1.monthlyCashflow,
        });
      }
    } catch (err) {
      if (lastCalculationRef.current === calculationId) {
        const message = err instanceof Error ? err.message : 'Calculation failed';
        setError(message);
        logger.error('[useValuationAnalyzer] Calculation error', { error: String(err) });
      }
    } finally {
      if (lastCalculationRef.current === calculationId) {
        setIsCalculating(false);
      }
    }
  }, [inputs, strategy]);

  // Debounced recalculation
  const debouncedRecalculate = useCallback(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    debounceTimeoutRef.current = setTimeout(() => {
      recalculate();
    }, debounceMs);
  }, [recalculate, debounceMs]);

  // Auto-calculate on input changes
  useEffect(() => {
    if (autoCalculate) {
      debouncedRecalculate();
    }
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [inputs, strategy, autoCalculate, debouncedRecalculate]);

  // Initial calculation
  useEffect(() => {
    if (autoCalculate && !pnlOutput) {
      recalculate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Actions
  const setInputs = useCallback((updates: Partial<ValuationInputs>) => {
    setInputsState((prev) => ({ ...prev, ...updates }));
  }, []);

  const setInput = useCallback(
    <K extends keyof ValuationInputs>(key: K, value: ValuationInputs[K]) => {
      setInputsState((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  return {
    // State
    inputs,
    strategy,
    valuationData,
    pnlOutput,
    isCalculating,
    error,

    // Actions
    setInputs,
    setInput,
    setStrategy,
    recalculate,
    setComplianceContext,
    setAppreciationData,

    // Computed
    riskLevel,
    riskFactors,
  };
}

export default useValuationAnalyzer;
