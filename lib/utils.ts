import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPercent(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  }).format(value / 100);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}

export function calculateCashOnCash(
  property: { price: number; rentEst: number; expensesEst: number },
  downPayment: number = 0.25
): number {
  const downPaymentAmount = property.price * downPayment;
  const annualCashFlow = (property.rentEst * 12) - property.expensesEst;
  return (annualCashFlow / downPaymentAmount) * 100;
}

export function generateRandomId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

export function createUrlWithParams(
  baseUrl: string,
  params: Record<string, any>
): string {
  const url = new URL(baseUrl, window.location.origin);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  });
  return url.toString();
}

export function parseUrlParams(searchParams: URLSearchParams) {
  const params: Record<string, any> = {};
  searchParams.forEach((value, key) => {
    // Parse numbers
    if (!isNaN(Number(value)) && value !== '') {
      params[key] = Number(value);
    } else {
      params[key] = value;
    }
  });
  return params;
}
