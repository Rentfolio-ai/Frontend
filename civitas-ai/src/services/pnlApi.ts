// FILE: src/services/pnlApi.ts
import type {
    PnLOutput,
    PnLRequest,
    InvestmentStrategy
} from '../types/pnl';
import { logger } from '../utils/logger';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface PnLApiResponse<T> {
    success: boolean;
    data: T;
    error?: string;
}

interface ExplanationResponse {
    success: boolean;
    explanation: string;
    error?: string;
}

/**
 * Convert snake_case backend response to camelCase frontend type
 */
function toCamelCase(obj: any): any {
    if (obj === null || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(toCamelCase);

    const result: any = {};
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            const camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
            result[camelKey] = toCamelCase(obj[key]);
        }
    }
    return result;
}

/**
 * Calculate Property P&L via API
 */
export async function calculatePropertyPnL(
    propertyId: string | null,
    request: PnLRequest
): Promise<PnLApiResponse<PnLOutput>> {
    try {
        const endpoint = propertyId
            ? `${API_BASE_URL}/api/calculate/${propertyId}`
            : `${API_BASE_URL}/api/calculate`;

        // Convert camelCase request to snake_case for backend
        const snakeCaseRequest: any = {};
        for (const [key, value] of Object.entries(request)) {
            const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
            snakeCaseRequest[snakeKey] = value;
        }

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(snakeCaseRequest),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ detail: 'Network response was not ok' }));
            throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        // Transform snake_case response to camelCase PnLOutput
        const camelData = toCamelCase(data);

        return {
            success: true,
            data: camelData as PnLOutput,
        };
    } catch (err) {
        logger.error('P&L API Error:', { error: err });
        return {
            success: false,
            data: {} as PnLOutput, // Fallback
            error: err instanceof Error ? err.message : 'Unknown error occurred',
        };
    }
}

/**
 * Explain P&L results via AI
 */
export async function explainPnL(
    pnlOutput: PnLOutput,
    question: string,
    context?: PnLRequest
): Promise<ExplanationResponse> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/explain`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                pnl_data: pnlOutput, // Backend expects snake_case but we'll send what we have, robust backend should handle or we adapt
                question,
                context
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to get explanation');
        }

        const data = await response.json();
        return {
            success: true,
            explanation: data.explanation,
        };
    } catch (err) {
        logger.error('Explain API Error:', { error: err });
        return {
            success: false,
            explanation: '',
            error: err instanceof Error ? err.message : 'Unknown error',
        };
    }
}

/**
 * Map full assumptions to sparse API request
 */
export function assumptionsToRequest(
    strategy: InvestmentStrategy,
    formState: Record<string, any>
): PnLRequest {
    // Only include defined values
    const request: PnLRequest = {
        strategy,
        // Purchase
        purchasePrice: formState.purchasePrice,
        closingCostPct: formState.closingCostPct / 100, // Convert % to decimal
        rehabBudget: formState.rehabBudget,
        furnishingBudget: formState.furnishingBudget,

        // Financing
        isFinanced: formState.isFinanced,
        downPaymentPct: formState.downPaymentPct / 100,
        interestRateAnnual: formState.interestRateAnnual / 100,
        loanTermYears: formState.loanTermYears,

        // Expenses (Universal)
        propertyTaxAnnual: formState.propertyTaxAnnual,
        propertyTaxPctOfValue: formState.propertyTaxPctOfValue / 100,
        insuranceAnnual: formState.insuranceAnnual,
        hoaMonthly: formState.hoaMonthly,
        utilitiesMonthly: formState.utilitiesMonthly,
        internetMonthly: formState.internetMonthly,
        propertyManagementPctOfIncome: formState.propertyManagementPctOfIncome / 100,
        maintenancePctOfIncome: formState.maintenancePctOfIncome / 100,
        capexReservePctOfIncome: formState.capexReservePctOfIncome / 100,
        otherOperatingMonthly: formState.otherOperatingMonthly,

        // Projection
        projectionYears: formState.projectionYears,
        annualAppreciationPct: formState.annualAppreciationPct / 100,
        rentGrowthPct: formState.rentGrowthPct / 100,
        expenseGrowthPct: formState.expenseGrowthPct / 100,
    };

    // Strategy specific
    if (strategy === 'STR') {
        request.adr = formState.adr;
        request.expectedOccupancyPct = formState.expectedOccupancyPct / 100;
        request.avgCleaningFeePerBooking = formState.avgCleaningFeePerBooking;
        request.platformFeePct = formState.platformFeePct / 100;
        request.cleaningCostPerBooking = formState.cleaningCostPerBooking;
    } else {
        request.monthlyRent = formState.monthlyRent;
        request.vacancyRatePct = formState.vacancyRatePct / 100;
    }

    return request;
}

/**
 * Mock calculation for development/fallback
 */
export function mockCalculatePnL(request: PnLRequest): PnLOutput {
    // Basic mock implementation to prevent crashes if API is down
    const price = request.purchasePrice || 500000;
    const grossIncome = (request.adr || 0) * 365 * (request.expectedOccupancyPct || 0.65);
    const expenses = grossIncome * 0.4;
    const noi = grossIncome - expenses;

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
                grossPotentialIncome: grossIncome,
                vacancyLoss: 0,
                effectiveGrossIncome: grossIncome,
                otherIncome: 0,
                totalIncome: grossIncome,
            },
            expenses: {
                propertyTax: 5000,
                insurance: 2000,
                hoa: 0,
                utilities: 2400,
                internet: 960,
                propertyManagement: grossIncome * 0.1,
                maintenance: grossIncome * 0.05,
                capexReserve: grossIncome * 0.05,
                cleaningCosts: 5000,
                platformFees: grossIncome * 0.03,
                otherOperating: 0,
                totalExpenses: expenses,
            },
            noi,
            annualDebtService: 30000,
            cashflowBeforeTaxes: noi - 30000,
            monthlyCashflow: (noi - 30000) / 12,
            capRate: noi / price,
            cashOnCash: (noi - 30000) / (price * 0.25),
            grossYield: grossIncome / price,
        },
        projection: [],
        financingSummary: {
            totalInvestment: price * 0.25,
            downPayment: price * 0.25,
            closingCosts: price * 0.03,
            rehabBudget: request.rehabBudget || 0,
            furnishingBudget: request.furnishingBudget || 0,
            loanAmount: price * 0.75,
            monthlyPayment: 2500,
            annualDebtService: 30000,
        }
    };
}
