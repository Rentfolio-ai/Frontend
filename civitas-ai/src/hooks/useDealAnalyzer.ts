// FILE: src/hooks/useDealAnalyzer.ts
/**
 * Hook for managing Deal Analyzer state and calculations
 * Provides debounced recalculation and scenario management
 */
import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import type {
  PnLOutput,
  PnLAssumptions,
  InvestmentStrategy,
  ScenarioPreset,
} from '../types/pnl';
import { DEFAULT_ASSUMPTIONS, SCENARIO_PRESETS } from '../types/pnl';
import { calculatePropertyPnL, explainPnL, mockCalculatePnL, assumptionsToRequest } from '../services/pnlApi';
import { logger } from '../utils/logger';

interface UseDealAnalyzerOptions {
  propertyId?: string | null;
  initialPurchasePrice?: number;
  initialStrategy?: InvestmentStrategy;
  autoCalculate?: boolean;
  debounceMs?: number;
}

interface UseDealAnalyzerReturn {
  // State
  strategy: InvestmentStrategy;
  assumptions: PnLAssumptions;
  pnlOutput: PnLOutput | null;
  isLoading: boolean;
  error: string | null;
  activeScenario: ScenarioPreset | 'custom';
  aiExplanation: string | null;
  isExplaining: boolean;
  aiVerdict: 'Red' | 'Black' | null;

  // Actions
  setStrategy: (strategy: InvestmentStrategy) => void;
  updateAssumption: (path: string, value: number | boolean | string | null) => void;
  updateAssumptions: (updates: Partial<Record<string, number | boolean | string | null>>) => void;
  setScenario: (scenario: ScenarioPreset) => void;
  recalculate: () => Promise<void>;
  askAI: (question: string) => Promise<void>;
  resetToDefaults: () => void;

  // Helpers
  getOverriddenFields: () => string[];
  isFieldOverridden: (field: string) => boolean;
}

/**
 * Convert flat form state to nested assumptions structure
 */
function formStateToAssumptions(
  formState: Record<string, number | boolean | string | null>,
  baseAssumptions: PnLAssumptions
): PnLAssumptions {
  const result = { ...baseAssumptions };

  // Map flat keys to nested structure
  const mappings: Record<string, (a: PnLAssumptions, v: any) => void> = {
    purchasePrice: (a, v) => a.purchase.purchasePrice = v,
    closingCostPct: (a, v) => a.purchase.closingCostPct = v,
    rehabBudget: (a, v) => a.purchase.rehabBudget = v,
    isFinanced: (a, v) => a.financing.isFinanced = v,
    downPaymentPct: (a, v) => a.financing.downPaymentPct = v,
    interestRateAnnual: (a, v) => a.financing.interestRateAnnual = v,
    loanTermYears: (a, v) => a.financing.loanTermYears = v,
    adr: (a, v) => a.income.str.adr = v,
    expectedOccupancyPct: (a, v) => a.income.str.expectedOccupancyPct = v,
    avgCleaningFeePerBooking: (a, v) => a.income.str.avgCleaningFeePerBooking = v,
    platformFeePct: (a, v) => a.income.str.platformFeePct = v,
    monthlyRent: (a, v) => a.income.ltr.monthlyRent = v,
    vacancyRatePct: (a, v) => a.income.ltr.vacancyRatePct = v,
    propertyTaxAnnual: (a, v) => a.expenses.propertyTaxAnnual = v,
    propertyTaxPctOfValue: (a, v) => a.expenses.propertyTaxPctOfValue = v,
    insuranceAnnual: (a, v) => a.expenses.insuranceAnnual = v,
    hoaMonthly: (a, v) => a.expenses.hoaMonthly = v,
    utilitiesMonthly: (a, v) => a.expenses.utilitiesMonthly = v,
    internetMonthly: (a, v) => a.expenses.internetMonthly = v,
    propertyManagementPctOfIncome: (a, v) => a.expenses.propertyManagementPctOfIncome = v,
    maintenancePctOfIncome: (a, v) => a.expenses.maintenancePctOfIncome = v,
    capexReservePctOfIncome: (a, v) => a.expenses.capexReservePctOfIncome = v,
    cleaningCostPerBooking: (a, v) => a.expenses.cleaningCostPerBooking = v,
    otherOperatingMonthly: (a, v) => a.expenses.otherOperatingMonthly = v,
    projectionYears: (a, v) => a.projection.projectionYears = v,
    annualAppreciationPct: (a, v) => a.projection.annualAppreciationPct = v,
    rentGrowthPct: (a, v) => a.projection.rentGrowthPct = v,
    expenseGrowthPct: (a, v) => a.projection.expenseGrowthPct = v,
  };

  for (const [key, value] of Object.entries(formState)) {
    if (value !== undefined && value !== null && mappings[key]) {
      mappings[key](result, value);
    }
  }

  return result;
}

/**
 * Convert assumptions to flat form state
 */
function assumptionsToFormState(assumptions: PnLAssumptions): Record<string, number | boolean | string | null> {
  return {
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
    propertyTaxPctOfValue: assumptions.expenses.propertyTaxPctOfValue,
    insuranceAnnual: assumptions.expenses.insuranceAnnual,
    hoaMonthly: assumptions.expenses.hoaMonthly,
    utilitiesMonthly: assumptions.expenses.utilitiesMonthly,
    internetMonthly: assumptions.expenses.internetMonthly,
    propertyManagementPctOfIncome: assumptions.expenses.propertyManagementPctOfIncome,
    maintenancePctOfIncome: assumptions.expenses.maintenancePctOfIncome,
    capexReservePctOfIncome: assumptions.expenses.capexReservePctOfIncome,
    cleaningCostPerBooking: assumptions.expenses.cleaningCostPerBooking,
    otherOperatingMonthly: assumptions.expenses.otherOperatingMonthly,
    projectionYears: assumptions.projection.projectionYears,
    annualAppreciationPct: assumptions.projection.annualAppreciationPct,
    rentGrowthPct: assumptions.projection.rentGrowthPct,
    expenseGrowthPct: assumptions.projection.expenseGrowthPct,
  };
}

export function useDealAnalyzer(options: UseDealAnalyzerOptions = {}): UseDealAnalyzerReturn {
  const {
    propertyId = null,
    initialPurchasePrice = 0,
    initialStrategy = 'STR',
    autoCalculate = true,
    debounceMs = 400,
  } = options;

  // State
  const [strategy, setStrategyState] = useState<InvestmentStrategy>(initialStrategy);
  const [formState, setFormState] = useState<Record<string, number | boolean | string | null>>(() => {
    const defaults = assumptionsToFormState(DEFAULT_ASSUMPTIONS);
    return {
      ...defaults,
      purchasePrice: initialPurchasePrice || defaults.purchasePrice,
    };
  });
  const [pnlOutput, setPnlOutput] = useState<PnLOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeScenario, setActiveScenario] = useState<ScenarioPreset | 'custom'>('base');
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [isExplaining, setIsExplaining] = useState(false);

  const [aiVerdict, setAiVerdict] = useState<'Red' | 'Black' | null>(null);

  // Refs for debouncing
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastCalculationRef = useRef<number>(0);

  // Compute full assumptions from form state
  const assumptions = useMemo(() => {
    const base = { ...DEFAULT_ASSUMPTIONS, strategy };
    return formStateToAssumptions(formState, base);
  }, [formState, strategy]);

  // Calculate P&L
  const recalculate = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setAiVerdict(null);

    logger.info('P&L calculation started', {
      strategy,
      purchasePrice: formState.purchasePrice,
      propertyId,
    });

    try {
      const request = assumptionsToRequest(strategy, formState);
      // Request AI analysis automatically
      request.includeAiAnalysis = true;

      // Try API first, fall back to mock
      try {
        const response = await calculatePropertyPnL(propertyId, request);
        if (response.success) {
          setPnlOutput(response.data);

          // Handle AI Analysis
          if (response.data.aiAnalysis) {
            setAiExplanation(response.data.aiAnalysis.content);
            setAiVerdict(response.data.aiAnalysis.verdict);
          }

          logger.info('P&L calculation successful (API)', {
            strategy,
            cashflow: response.data.year1?.cashflowBeforeTaxes,
            capRate: response.data.year1?.capRate,
            verdict: response.data.aiAnalysis?.verdict
          });
        } else {
          throw new Error(response.error || 'Calculation failed');
        }
      } catch (apiError) {
        logger.warn('API unavailable, using mock calculation', { error: apiError });
        // Use mock calculation when API is unavailable
        const mockResult = mockCalculatePnL(request);
        setPnlOutput(mockResult);
        logger.info('P&L calculation successful (Mock)', {
          strategy,
          cashflow: mockResult.year1?.cashflowBeforeTaxes,
        });
      }

      lastCalculationRef.current = Date.now();
    } catch (err) {
      console.error('P&L calculation error:', err);
      setError(err instanceof Error ? err.message : 'Calculation failed');
    } finally {
      setIsLoading(false);
    }
  }, [strategy, formState, propertyId]);

  // Debounced recalculation
  const debouncedRecalculate = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      recalculate();
    }, debounceMs);
  }, [recalculate, debounceMs]);

  // Update single assumption
  const updateAssumption = useCallback((path: string, value: number | boolean | string | null) => {
    setFormState(prev => ({
      ...prev,
      [path]: value,
    }));
    setActiveScenario('custom');

    if (autoCalculate) {
      debouncedRecalculate();
    }
  }, [autoCalculate, debouncedRecalculate]);

  // Batch update assumptions
  const updateAssumptions = useCallback((updates: Partial<Record<string, number | boolean | string | null>>) => {
    setFormState(prev => {
      const filtered = Object.fromEntries(
        Object.entries(updates).filter(([, v]) => v !== undefined)
      ) as Record<string, number | boolean | string | null>;
      return {
        ...prev,
        ...filtered,
      };
    });
    setActiveScenario('custom');

    if (autoCalculate) {
      debouncedRecalculate();
    }
  }, [autoCalculate, debouncedRecalculate]);

  // Set strategy
  const setStrategy = useCallback((newStrategy: InvestmentStrategy) => {
    setStrategyState(newStrategy);

    if (autoCalculate) {
      debouncedRecalculate();
    }
  }, [autoCalculate, debouncedRecalculate]);

  // Apply scenario preset
  const setScenario = useCallback((scenario: ScenarioPreset) => {
    const preset = SCENARIO_PRESETS[scenario];
    if (!preset) return;

    // Apply preset overrides
    setFormState(prev => ({
      ...prev,
      ...preset.overrides,
    }));
    setActiveScenario(scenario);

    if (autoCalculate) {
      debouncedRecalculate();
    }
  }, [autoCalculate, debouncedRecalculate]);

  // Reset to defaults
  const resetToDefaults = useCallback(() => {
    const defaults = assumptionsToFormState(DEFAULT_ASSUMPTIONS);
    setFormState({
      ...defaults,
      purchasePrice: initialPurchasePrice || defaults.purchasePrice,
    });
    setActiveScenario('base');

    if (autoCalculate) {
      debouncedRecalculate();
    }
  }, [initialPurchasePrice, autoCalculate, debouncedRecalculate]);

  // Ask AI for explanation
  const askAI = useCallback(async (question: string) => {
    if (!pnlOutput) {
      setAiExplanation('Please calculate P&L first before asking questions.');
      return;
    }

    setIsExplaining(true);
    setAiExplanation(null);

    try {
      const request = assumptionsToRequest(strategy, formState);
      const response = await explainPnL(pnlOutput, question, request);

      if (response.success) {
        setAiExplanation(response.explanation);
      } else {
        setAiExplanation('Unable to generate explanation. Please try again.');
      }
    } catch (err) {
      console.error('AI explanation error:', err);
      // Provide a basic fallback explanation
      const { year1, financingSummary } = pnlOutput;
      const fallback = `Based on the current analysis:\n\n` +
        `• Monthly Cashflow: $${year1.monthlyCashflow.toLocaleString()}\n` +
        `• Cash-on-Cash Return: ${year1.cashOnCash.toFixed(1)}%\n` +
        `• Cap Rate: ${year1.capRate.toFixed(1)}%\n` +
        `• Total Investment: $${financingSummary.totalInvestment.toLocaleString()}\n\n` +
        `A positive cash flow indicates the property generates income after all expenses. ` +
        `The cash-on-cash return measures your return on the cash invested.`;
      setAiExplanation(fallback);
    } finally {
      setIsExplaining(false);
    }
  }, [pnlOutput, strategy, formState]);

  // Get list of overridden fields
  const getOverriddenFields = useCallback((): string[] => {
    const defaults = assumptionsToFormState(DEFAULT_ASSUMPTIONS);
    const overridden: string[] = [];

    for (const [key, value] of Object.entries(formState)) {
      if (value !== defaults[key] && key !== 'purchasePrice') {
        overridden.push(key);
      }
    }

    return overridden;
  }, [formState]);

  // Check if specific field is overridden
  const isFieldOverridden = useCallback((field: string): boolean => {
    const defaults = assumptionsToFormState(DEFAULT_ASSUMPTIONS);
    return formState[field] !== defaults[field] && field !== 'purchasePrice';
  }, [formState]);

  // Initial calculation
  useEffect(() => {
    const price = formState.purchasePrice;
    if (autoCalculate && typeof price === 'number' && price > 0) {
      recalculate();
    }
  }, []); // Only run on mount

  // Cleanup
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return {
    // State
    strategy,
    assumptions,
    pnlOutput,
    isLoading,
    error,
    activeScenario,
    aiExplanation,
    isExplaining,

    // Actions
    setStrategy,
    updateAssumption,
    updateAssumptions,
    setScenario,
    recalculate,
    askAI,
    resetToDefaults,

    // Helpers
    getOverriddenFields,
    isFieldOverridden,
    aiVerdict,
  };
}

export type { UseDealAnalyzerReturn };
