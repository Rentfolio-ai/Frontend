// FILE: src/services/pnlApi.ts
/**
 * API service for P&L / Deal Analyzer endpoints
 * Handles communication with the backend P&L calculator
 */
import type { PnLOutput, PnLRequest, InvestmentStrategy } from '../types/pnl';
import { apiLogger } from '../utils/logger';

const envApiUrl = import.meta.env.VITE_DATALAYER_API_URL;
const API_BASE = (envApiUrl && typeof envApiUrl === 'string' && envApiUrl.startsWith('http')) ? envApiUrl : 'http://localhost:8001';
const CIVITAS_API_KEY = import.meta.env.VITE_API_KEY;

const jsonHeaders: HeadersInit = {
  'Content-Type': 'application/json',
  ...(CIVITAS_API_KEY ? { 'X-API-Key': CIVITAS_API_KEY } : {}),
};

/**
 * API response wrapper
 */
export interface PnLApiResponse {
  success: boolean;
  data: PnLOutput;
  message?: string;
  error?: string;
}

/**
 * Convert camelCase object to snake_case for backend API
 */
function convertToSnakeCase(obj: any): any {
  const result: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined && value !== null) {
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      result[snakeKey] = value;
    }
  }
  return result;
}

/**
 * Calculate P&L for a property
 * @param propertyId - The property ID (can be null for ad-hoc calculations)
 * @param request - The P&L calculation request with overrides
 */
export async function calculatePropertyPnL(
  propertyId: string | null,
  request: PnLRequest
): Promise<PnLApiResponse> {
  const endpoint = propertyId
    ? `${API_BASE}/api/properties/${propertyId}/pnl`
    : `${API_BASE}/api/calculate/pnl`;

  // Calculate derived values if missing (Backend requires absolute values)
  const purchasePrice = request.purchasePrice || 0;

  if (!request.propertyTaxAnnual && request.propertyTaxPctOfValue && purchasePrice > 0) {
    request.propertyTaxAnnual = (purchasePrice * request.propertyTaxPctOfValue) / 100;
  }

  // Ensure insurance has a fallback if not provided (though usually has default)
  if (!request.insuranceAnnual && purchasePrice > 0) {
    // Fallback estimate: 0.5% of value if absolutely nothing provided
    request.insuranceAnnual = (purchasePrice * 0.005);
  }

  // Convert camelCase to snake_case for backend
  const snakeCaseRequest = convertToSnakeCase(request);

  // Normalize percentages to decimals (Backend expects 0.25 for 25%)
  const percentageFields = [
    'closing_cost_pct',
    'down_payment_pct',
    'interest_rate_annual',
    'expected_occupancy_pct',
    'platform_fee_pct',
    'vacancy_rate_pct',
    'property_tax_pct_of_value',
    'property_management_pct_of_income',
    'maintenance_pct_of_income',
    'capex_reserve_pct_of_income',
    'annual_appreciation_pct',
    'rent_growth_pct',
    'expense_growth_pct',
    'projected_sales_cost_pct'
  ];

  for (const field of percentageFields) {
    if (typeof snakeCaseRequest[field] === 'number') {
      snakeCaseRequest[field] = snakeCaseRequest[field] / 100;
    }
  }

  // Extract top-level fields
  const { strategy, include_ai_analysis, ...rest } = snakeCaseRequest;

  // Construct payload matching PnLCalculateRequest
  const payload = {
    strategy,
    include_ai_analysis: !!include_ai_analysis,
    property_id: propertyId,
    inputs: rest
  };

  const startTime = performance.now();

  apiLogger.request({
    method: 'POST',
    url: endpoint,
    service: 'P&L Calculator',
    payloadPreview: `strategy=${request.strategy}, price=$${request.purchasePrice || 'N/A'}`,
  });

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify(payload),
  });

  const duration = Math.round(performance.now() - startTime);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'P&L calculation failed' }));
    apiLogger.error({
      method: 'POST',
      url: endpoint,
      service: 'P&L Calculator',
      status: response.status,
      durationMs: duration,
      error: error,
    });
    throw new Error(error.detail || error.message || 'Failed to calculate P&L');
  }

  const data = await response.json();

  apiLogger.response({
    method: 'POST',
    url: endpoint,
    service: 'P&L Calculator',
    status: response.status,
    durationMs: duration,
    payloadPreview: `cashflow=$${data.year1?.cashflow_before_taxes || 'N/A'}`,
  });

  return data;
}

/**
 * Get market defaults for a property or location
 * @param propertyId - The property ID
 * @param location - Optional location string for market data
 */
export async function getMarketDefaults(
  propertyId?: string,
  location?: string
): Promise<{
  success: boolean;
  defaults: Partial<PnLRequest>;
  source: 'property' | 'market' | 'system';
}> {
  const params = new URLSearchParams();
  if (propertyId) params.append('property_id', propertyId);
  if (location) params.append('location', location);

  const response = await fetch(`${API_BASE}/api/calculate/defaults?${params.toString()}`, {
    method: 'GET',
    headers: jsonHeaders,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to fetch defaults' }));
    throw new Error(error.detail || 'Failed to fetch market defaults');
  }

  return response.json();
}

/**
 * Ask AI to explain P&L results
 * @param pnlOutput - The calculated P&L output
 * @param question - User's question about the deal
 * @param assumptions - Current assumptions used
 */
export async function explainPnL(
  pnlOutput: PnLOutput,
  question: string,
  assumptions?: Partial<PnLRequest>
): Promise<{
  success: boolean;
  explanation: string;
  highlights?: string[];
}> {
  const response = await fetch(`${API_BASE}/api/calculate/explain`, {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify({
      pnl_output: pnlOutput,
      question,
      assumptions,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Explanation failed' }));
    throw new Error(error.detail || 'Failed to get AI explanation');
  }

  return response.json();
}

/**
 * Build a P&L request object from partial overrides
 */
export function buildPnLRequest(
  strategy: InvestmentStrategy,
  overrides: Partial<PnLRequest> = {}
): PnLRequest {
  return {
    strategy,
    ...overrides,
  };
}

/**
 * Compare STR vs LTR strategies
 * @param request - P&L request with both adr and monthly_rent filled in
 */
export async function compareStrategies(
  request: PnLRequest
): Promise<{
  success: boolean;
  comparison: any;
}> {
  const response = await fetch(`${API_BASE}/api/calculate/compare`, {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify(convertToSnakeCase(request)),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Strategy comparison failed' }));
    throw new Error(error.detail || 'Failed to compare strategies');
  }

  return response.json();
}

/**
 * Convert assumptions form state to API request
 */
export function assumptionsToRequest(
  strategy: InvestmentStrategy,
  formState: Record<string, number | boolean | string | null | undefined>
): PnLRequest {
  const request: PnLRequest = { strategy };

  // Map form field names to API field names
  const fieldMap: Record<string, keyof PnLRequest> = {
    purchasePrice: 'purchasePrice',
    closingCostPct: 'closingCostPct',
    rehabBudget: 'rehabBudget',
    isFinanced: 'isFinanced',
    downPaymentPct: 'downPaymentPct',
    interestRateAnnual: 'interestRateAnnual',
    loanTermYears: 'loanTermYears',
    adr: 'adr',
    expectedOccupancyPct: 'expectedOccupancyPct',
    avgCleaningFeePerBooking: 'avgCleaningFeePerBooking',
    platformFeePct: 'platformFeePct',
    monthlyRent: 'monthlyRent',
    vacancyRatePct: 'vacancyRatePct',
    propertyTaxAnnual: 'propertyTaxAnnual',
    propertyTaxPctOfValue: 'propertyTaxPctOfValue',
    insuranceAnnual: 'insuranceAnnual',
    hoaMonthly: 'hoaMonthly',
    utilitiesMonthly: 'utilitiesMonthly',
    internetMonthly: 'internetMonthly',
    propertyManagementPctOfIncome: 'propertyManagementPctOfIncome',
    maintenancePctOfIncome: 'maintenancePctOfIncome',
    capexReservePctOfIncome: 'capexReservePctOfIncome',
    cleaningCostPerBooking: 'cleaningCostPerBooking',
    otherOperatingMonthly: 'otherOperatingMonthly',
    projectionYears: 'projectionYears',
    annualAppreciationPct: 'annualAppreciationPct',
    rentGrowthPct: 'rentGrowthPct',
    expenseGrowthPct: 'expenseGrowthPct',
  };

  for (const [formKey, apiKey] of Object.entries(fieldMap)) {
    if (formKey in formState && formState[formKey] !== undefined && formState[formKey] !== null) {
      (request as any)[apiKey] = formState[formKey];
    }
  }

  return request;
}

/**
 * Mock P&L calculation for development/testing when backend is unavailable
 */
export function mockCalculatePnL(request: PnLRequest): PnLOutput {
  const purchasePrice = request.purchasePrice || 500000;
  const downPaymentPct = request.downPaymentPct || 25;
  const interestRate = request.interestRateAnnual || 7.5;
  const loanTermYears = request.loanTermYears || 30;
  const isFinanced = request.isFinanced !== false;

  // Calculate financing
  const downPayment = purchasePrice * (downPaymentPct / 100);
  const closingCosts = purchasePrice * ((request.closingCostPct || 3) / 100);
  const rehabBudget = request.rehabBudget || 0;
  const totalInvestment = downPayment + closingCosts + rehabBudget;
  const loanAmount = isFinanced ? purchasePrice - downPayment : 0;

  // Monthly mortgage payment (P&I)
  const monthlyRate = interestRate / 100 / 12;
  const numPayments = loanTermYears * 12;
  const monthlyPayment = isFinanced && loanAmount > 0
    ? loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1)
    : 0;
  const annualDebtService = monthlyPayment * 12;

  // Calculate income based on strategy
  let grossIncome: number;
  let vacancyLoss: number;

  if (request.strategy === 'STR') {
    const adr = request.adr || 200;
    const occupancy = (request.expectedOccupancyPct || 65) / 100;
    const cleaningFee = request.avgCleaningFeePerBooking || 100;
    const platformFeePct = (request.platformFeePct || 3) / 100;
    const avgStayDays = 3;
    const nightsBooked = 365 * occupancy;
    const numBookings = Math.ceil(nightsBooked / avgStayDays);

    grossIncome = (adr * nightsBooked) + (cleaningFee * numBookings);
    vacancyLoss = grossIncome * platformFeePct; // Platform fees as "vacancy" equivalent
  } else {
    const monthlyRent = request.monthlyRent || 2500;
    const vacancyRate = (request.vacancyRatePct || 5) / 100;
    grossIncome = monthlyRent * 12;
    vacancyLoss = grossIncome * vacancyRate;
  }

  const effectiveGrossIncome = grossIncome - vacancyLoss;

  // Calculate expenses
  const propertyTax = request.propertyTaxAnnual || purchasePrice * ((request.propertyTaxPctOfValue || 1.2) / 100);
  const insurance = request.insuranceAnnual || 2400;
  const hoa = (request.hoaMonthly || 0) * 12;
  const utilities = (request.utilitiesMonthly || 200) * 12;
  const internet = (request.internetMonthly || 80) * 12;
  const pmFee = effectiveGrossIncome * ((request.propertyManagementPctOfIncome || 10) / 100);
  const maintenance = effectiveGrossIncome * ((request.maintenancePctOfIncome || 7) / 100);
  const capex = effectiveGrossIncome * ((request.capexReservePctOfIncome || 5) / 100);
  const otherOpex = (request.otherOperatingMonthly || 0) * 12;

  // STR-specific expenses
  let cleaningCosts = 0;
  let platformFees = 0;
  if (request.strategy === 'STR') {
    const occupancy = (request.expectedOccupancyPct || 65) / 100;
    const avgStayDays = 3;
    const nightsBooked = 365 * occupancy;
    const numBookings = Math.ceil(nightsBooked / avgStayDays);
    cleaningCosts = (request.cleaningCostPerBooking || 75) * numBookings;
    platformFees = grossIncome * ((request.platformFeePct || 3) / 100);
  }

  const totalExpenses = propertyTax + insurance + hoa + utilities + internet + pmFee + maintenance + capex + cleaningCosts + platformFees + otherOpex;

  // Calculate key metrics
  const noi = effectiveGrossIncome - totalExpenses;
  const cashflow = noi - annualDebtService;
  const monthlyCashflow = cashflow / 12;
  const capRate = (noi / purchasePrice) * 100;
  const cashOnCash = isFinanced ? (cashflow / totalInvestment) * 100 : capRate;
  const grossYield = (grossIncome / purchasePrice) * 100;
  const afterRepairValue = purchasePrice * 1.1;
  const projectedProfit = afterRepairValue - (purchasePrice + rehabBudget + closingCosts);
  const holdRoi = totalInvestment > 0 ? (projectedProfit / totalInvestment) * 100 : 0;
  const holdingPeriodMonths = 6;
  const annualizedRoi = holdRoi * (12 / holdingPeriodMonths);

  // Generate projection
  const projectionYears = request.projectionYears || 5;
  const appreciationRate = (request.annualAppreciationPct || 3) / 100;
  const rentGrowthRate = (request.rentGrowthPct || 3) / 100;
  const expenseGrowthRate = (request.expenseGrowthPct || 2) / 100;

  const projection: PnLOutput['projection'] = [];
  let cumulativeCashflow = 0;
  let currentPropertyValue = purchasePrice;
  let currentIncome = effectiveGrossIncome;
  let currentExpenses = totalExpenses;

  for (let year = 1; year <= projectionYears; year++) {
    if (year > 1) {
      currentPropertyValue *= (1 + appreciationRate);
      currentIncome *= (1 + rentGrowthRate);
      currentExpenses *= (1 + expenseGrowthRate);
    }

    const yearNoi = currentIncome - currentExpenses;
    const yearCashflow = yearNoi - annualDebtService;
    cumulativeCashflow += yearCashflow;

    // Simple equity calculation (doesn't account for loan amortization precisely)
    const equity = currentPropertyValue - loanAmount * Math.pow(1 - (1 / loanTermYears), year);

    projection.push({
      year,
      grossIncome: Math.round(currentIncome),
      totalExpenses: Math.round(currentExpenses),
      noi: Math.round(yearNoi),
      debtService: Math.round(annualDebtService),
      cashflow: Math.round(yearCashflow),
      propertyValue: Math.round(currentPropertyValue),
      equity: Math.round(equity),
      cumulativeCashflow: Math.round(cumulativeCashflow),
    });
  }

  return {
    meta: {
      propertyId: null,
      strategy: request.strategy,
      calculatedAt: new Date().toISOString(),
      scenarioPreset: 'custom',
      assumptionsOverridden: [],
    },
    year1: {
      income: {
        grossPotentialIncome: Math.round(grossIncome),
        vacancyLoss: Math.round(vacancyLoss),
        effectiveGrossIncome: Math.round(effectiveGrossIncome),
        otherIncome: 0,
        totalIncome: Math.round(effectiveGrossIncome),
      },
      expenses: {
        propertyTax: Math.round(propertyTax),
        insurance: Math.round(insurance),
        hoa: Math.round(hoa),
        utilities: Math.round(utilities),
        internet: Math.round(internet),
        propertyManagement: Math.round(pmFee),
        maintenance: Math.round(maintenance),
        capexReserve: Math.round(capex),
        cleaningCosts: Math.round(cleaningCosts),
        platformFees: Math.round(platformFees),
        otherOperating: Math.round(otherOpex),
        totalExpenses: Math.round(totalExpenses),
      },
      noi: Math.round(noi),
      annualDebtService: Math.round(annualDebtService),
      cashflowBeforeTaxes: Math.round(cashflow),
      monthlyCashflow: Math.round(monthlyCashflow),
      capRate: Math.round(capRate * 10) / 10,
      cashOnCash: Math.round(cashOnCash * 10) / 10,
      grossYield: Math.round(grossYield * 10) / 10,
      flip: projectedProfit > 0 ? {
        afterRepairValue: Math.round(afterRepairValue),
        rehabBudget: Math.round(rehabBudget),
        projectedProfit: Math.round(projectedProfit),
        holdRoi: Math.round(holdRoi * 10) / 10,
        annualizedRoi: Math.round(annualizedRoi * 10) / 10,
      } : undefined,
    },
    projection,
    financingSummary: {
      totalInvestment: Math.round(totalInvestment),
      downPayment: Math.round(downPayment),
      closingCosts: Math.round(closingCosts),
      rehabBudget: Math.round(rehabBudget),
      loanAmount: Math.round(loanAmount),
      monthlyPayment: Math.round(monthlyPayment),
      annualDebtService: Math.round(annualDebtService),
    },
  };
}
