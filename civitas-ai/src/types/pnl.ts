// FILE: src/types/pnl.ts
// P&L / Deal Analyzer Types

/**
 * Investment strategy type
 * - STR: Short-Term Rental (Airbnb, VRBO)
 * - LTR: Long-Term Rental (traditional lease)
 * - Flip: Fix and flip
 * - ADU: Accessory Dwelling Unit
 * - MF: Multi-Family
 */
export type InvestmentStrategy = 'STR' | 'LTR' | 'Flip' | 'ADU' | 'MF';

/**
 * Scenario preset type
 */
export type ScenarioPreset = 'conservative' | 'base' | 'aggressive';

export type TrendDirection = 'up' | 'down' | 'flat';
export type Sentiment = 'positive' | 'negative' | 'neutral';

export interface PresentationKPI {
  key: string;
  label: string;
  value: string;
  helperText?: string;
  trend?: TrendDirection;
  sentiment?: Sentiment;
}

export interface PresentationInsight {
  id: string;
  text: string;
  sentiment?: Sentiment;
}

export interface PresentationBundle {
  headline: string;
  markdown: string;
  kpis?: PresentationKPI[];
  insights?: PresentationInsight[];
}

/**
 * Purchase assumptions
 */
export interface PurchaseAssumptions {
  purchasePrice: number;
  closingCostPct: number;
  rehabBudget: number;
}

/**
 * Financing assumptions
 */
export interface FinancingAssumptions {
  isFinanced: boolean;
  downPaymentPct: number;
  interestRateAnnual: number;
  loanTermYears: number;
}

/**
 * STR income assumptions
 */
export interface STRIncomeAssumptions {
  adr: number;
  expectedOccupancyPct: number;
  avgCleaningFeePerBooking: number;
  platformFeePct: number;
}

/**
 * LTR income assumptions
 */
export interface LTRIncomeAssumptions {
  monthlyRent: number;
  vacancyRatePct: number;
}

/**
 * Combined income assumptions (strategy-dependent)
 */
export interface IncomeAssumptions {
  str: STRIncomeAssumptions;
  ltr: LTRIncomeAssumptions;
}

/**
 * Expense assumptions
 */
export interface ExpenseAssumptions {
  propertyTaxAnnual: number | null;
  propertyTaxPctOfValue: number;
  insuranceAnnual: number;
  hoaMonthly: number;
  utilitiesMonthly: number;
  internetMonthly: number;
  propertyManagementPctOfIncome: number;
  maintenancePctOfIncome: number;
  capexReservePctOfIncome: number;
  cleaningCostPerBooking: number;
  otherOperatingMonthly: number;
}

/**
 * Projection/horizon assumptions
 */
export interface ProjectionAssumptions {
  projectionYears: number;
  annualAppreciationPct: number;
  rentGrowthPct: number;
  expenseGrowthPct: number;
}

/**
 * Complete P&L input assumptions
 */
export interface PnLAssumptions {
  strategy: InvestmentStrategy;
  purchase: PurchaseAssumptions;
  financing: FinancingAssumptions;
  income: IncomeAssumptions;
  expenses: ExpenseAssumptions;
  projection: ProjectionAssumptions;
}

/**
 * Year 1 income breakdown
 */
export interface Year1Income {
  grossPotentialIncome: number;
  vacancyLoss: number;
  effectiveGrossIncome: number;
  otherIncome: number;
  totalIncome: number;
}

/**
 * Year 1 expense breakdown (line items)
 */
export interface Year1Expenses {
  propertyTax: number;
  insurance: number;
  hoa: number;
  utilities: number;
  internet: number;
  propertyManagement: number;
  maintenance: number;
  capexReserve: number;
  cleaningCosts: number;
  platformFees: number;
  otherOperating: number;
  totalExpenses: number;
}

/**
 * Year 1 P&L summary
 */
export interface Year1Summary {
  income: Year1Income;
  expenses: Year1Expenses;
  noi: number;
  annualDebtService: number;
  cashflowBeforeTaxes: number;
  monthlyCashflow: number;
  capRate: number;
  cashOnCash: number;
  grossYield: number;
  flip?: {
    afterRepairValue: number;
    rehabBudget: number;
    projectedProfit: number;
    holdRoi: number;
    annualizedRoi: number;
  };
}

/**
 * Financing summary
 */
export interface FinancingSummary {
  totalInvestment: number;
  downPayment: number;
  closingCosts: number;
  rehabBudget: number;
  loanAmount: number;
  monthlyPayment: number;
  annualDebtService: number;
}

/**
 * Projection year data
 */
export interface ProjectionYear {
  year: number;
  grossIncome: number;
  totalExpenses: number;
  noi: number;
  debtService: number;
  cashflow: number;
  propertyValue: number;
  equity: number;
  cumulativeCashflow: number;
}

/**
 * Meta information about the calculation
 */
export interface PnLMeta {
  propertyId: string | null;
  strategy: InvestmentStrategy;
  calculatedAt: string;
  scenarioPreset: ScenarioPreset | 'custom';
  assumptionsOverridden: string[];
}

/**
 * Complete P&L Output from API
 */
export interface PnLOutput {
  meta: PnLMeta;
  year1: Year1Summary;
  projection: ProjectionYear[];
  financingSummary: FinancingSummary;
  presentation?: PresentationBundle;
}

/**
 * API request body for P&L calculation
 */
export interface PnLRequest {
  strategy: InvestmentStrategy;
  // Purchase overrides
  purchasePrice?: number;
  closingCostPct?: number;
  rehabBudget?: number;
  // Financing overrides
  isFinanced?: boolean;
  downPaymentPct?: number;
  interestRateAnnual?: number;
  loanTermYears?: number;
  // STR income overrides
  adr?: number;
  expectedOccupancyPct?: number;
  avgCleaningFeePerBooking?: number;
  platformFeePct?: number;
  // LTR income overrides
  monthlyRent?: number;
  vacancyRatePct?: number;
  // Expense overrides
  propertyTaxAnnual?: number;
  propertyTaxPctOfValue?: number;
  insuranceAnnual?: number;
  hoaMonthly?: number;
  utilitiesMonthly?: number;
  internetMonthly?: number;
  propertyManagementPctOfIncome?: number;
  maintenancePctOfIncome?: number;
  capexReservePctOfIncome?: number;
  cleaningCostPerBooking?: number;
  otherOperatingMonthly?: number;
  // Projection overrides
  projectionYears?: number;
  annualAppreciationPct?: number;
  rentGrowthPct?: number;
  expenseGrowthPct?: number;
}

/**
 * Scenario preset configurations
 */
export interface ScenarioPresetConfig {
  name: string;
  description: string;
  overrides: Partial<PnLRequest>;
}

export const SCENARIO_PRESETS: Record<ScenarioPreset, ScenarioPresetConfig> = {
  conservative: {
    name: 'Conservative',
    description: 'Lower occupancy, higher expenses - safer assumptions',
    overrides: {
      expectedOccupancyPct: 55,
      vacancyRatePct: 10,
      maintenancePctOfIncome: 10,
      capexReservePctOfIncome: 8,
      propertyManagementPctOfIncome: 12,
    },
  },
  base: {
    name: 'Base',
    description: 'Market average assumptions',
    overrides: {
      expectedOccupancyPct: 65,
      vacancyRatePct: 5,
      maintenancePctOfIncome: 7,
      capexReservePctOfIncome: 5,
      propertyManagementPctOfIncome: 10,
    },
  },
  aggressive: {
    name: 'Aggressive',
    description: 'Higher occupancy, lower expenses - optimistic assumptions',
    overrides: {
      expectedOccupancyPct: 75,
      vacancyRatePct: 3,
      maintenancePctOfIncome: 5,
      capexReservePctOfIncome: 3,
      propertyManagementPctOfIncome: 8,
    },
  },
};

/**
 * Default assumptions (market defaults)
 */
export const DEFAULT_ASSUMPTIONS: PnLAssumptions = {
  strategy: 'STR',
  purchase: {
    purchasePrice: 0,
    closingCostPct: 3,
    rehabBudget: 0,
  },
  financing: {
    isFinanced: true,
    downPaymentPct: 25,
    interestRateAnnual: 7.5,
    loanTermYears: 30,
  },
  income: {
    str: {
      adr: 200,
      expectedOccupancyPct: 65,
      avgCleaningFeePerBooking: 100,
      platformFeePct: 3,
    },
    ltr: {
      monthlyRent: 2500,
      vacancyRatePct: 5,
    },
  },
  expenses: {
    propertyTaxAnnual: null,
    propertyTaxPctOfValue: 1.2,
    insuranceAnnual: 2400,
    hoaMonthly: 0,
    utilitiesMonthly: 200,
    internetMonthly: 80,
    propertyManagementPctOfIncome: 10,
    maintenancePctOfIncome: 7,
    capexReservePctOfIncome: 5,
    cleaningCostPerBooking: 75,
    otherOperatingMonthly: 0,
  },
  projection: {
    projectionYears: 5,
    annualAppreciationPct: 3,
    rentGrowthPct: 3,
    expenseGrowthPct: 2,
  },
};

/**
 * Format currency value
 */
export function formatCurrency(value: number, compact = false): string {
  if (compact && Math.abs(value) >= 1000) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value);
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Format percentage value
 */
export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Check if a value differs from default
 */
export function isOverridden(
  key: string,
  value: number | boolean | string | null | undefined,
  defaults: PnLAssumptions
): boolean {
  // Navigate nested defaults
  const parts = key.split('.');
  let defaultValue: any = defaults;
  for (const part of parts) {
    if (defaultValue && typeof defaultValue === 'object' && part in defaultValue) {
      defaultValue = defaultValue[part];
    } else {
      return false;
    }
  }
  return value !== defaultValue;
}
