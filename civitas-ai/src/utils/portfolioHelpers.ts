// Portfolio Helper Functions

/**
 * Format currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Calculate total value
 */
export function calculateTotalValue(properties: any[]): number {
  return properties.reduce((sum, prop) => sum + (prop.currentValue || prop.purchasePrice || 0), 0);
}

/**
 * Calculate monthly cash flow
 */
export function calculateMonthlyCashFlow(properties: any[]): number {
  const income = properties.reduce((sum, prop) => sum + (prop.monthlyRent || 0), 0);
  const expenses = properties.reduce((sum, prop) => sum + (prop.monthlyExpenses || 0), 0);
  return income - expenses;
}
