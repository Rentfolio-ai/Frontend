// FILE: src/utils/portfolioHelpers.ts
/**
 * Helper functions for Portfolio Management System
 */

import type { AddPropertyForm } from '../types/portfolio';

/**
 * Format currency values
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

/**
 * Format percentage values
 */
export const formatPercentage = (value: number, decimals: number = 2): string => {
  return `${(value * 100).toFixed(decimals)}%`;
};

/**
 * Format date strings
 */
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Format date for input fields (YYYY-MM-DD)
 */
export const formatDateForInput = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
};

/**
 * Validate property form
 */
export const validatePropertyForm = (form: AddPropertyForm): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (!form.address || form.address.trim().length === 0) {
    errors.address = 'Address is required';
  }

  if (form.purchase_price <= 0) {
    errors.purchase_price = 'Purchase price must be greater than 0';
  }

  if (form.monthly_rent <= 0) {
    errors.monthly_rent = 'Monthly rent must be greater than 0';
  }

  if (form.down_payment < 0) {
    errors.down_payment = 'Down payment cannot be negative';
  }

  if (form.loan_amount < 0) {
    errors.loan_amount = 'Loan amount cannot be negative';
  }

  if (form.down_payment + form.loan_amount > form.purchase_price) {
    errors.down_payment = 'Down payment + loan amount cannot exceed purchase price';
    errors.loan_amount = 'Down payment + loan amount cannot exceed purchase price';
  }

  if (form.interest_rate < 0 || form.interest_rate > 100) {
    errors.interest_rate = 'Interest rate must be between 0 and 100';
  }

  if (form.loan_term_years <= 0) {
    errors.loan_term_years = 'Loan term must be greater than 0';
  }

  if (form.monthly_expenses.property_tax < 0) {
    errors['monthly_expenses.property_tax'] = 'Property tax cannot be negative';
  }

  if (form.monthly_expenses.insurance < 0) {
    errors['monthly_expenses.insurance'] = 'Insurance cannot be negative';
  }

  if (form.monthly_expenses.maintenance < 0) {
    errors['monthly_expenses.maintenance'] = 'Maintenance cannot be negative';
  }

  if (form.monthly_expenses.property_management < 0) {
    errors['monthly_expenses.property_management'] = 'Property management cannot be negative';
  }

  if (form.closing_costs < 0) {
    errors.closing_costs = 'Closing costs cannot be negative';
  }

  if (form.renovation_costs < 0) {
    errors.renovation_costs = 'Renovation costs cannot be negative';
  }

  if (form.current_value <= 0) {
    errors.current_value = 'Current value must be greater than 0';
  }

  return errors;
};

/**
 * Calculate total monthly expenses
 */
export const calculateTotalMonthlyExpenses = (expenses: AddPropertyForm['monthly_expenses']): number => {
  return (
    (expenses.property_tax || 0) +
    (expenses.insurance || 0) +
    (expenses.maintenance || 0) +
    (expenses.property_management || 0) +
    (expenses.utilities || 0) +
    (expenses.hoa || 0) +
    (expenses.other || 0)
  );
};

/**
 * Parse address into components
 */
export const parseAddress = (address: string): {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
} => {
  // Simple address parsing - can be enhanced
  const parts = address.split(',').map((p) => p.trim());
  
  if (parts.length >= 3) {
    const zipState = parts[parts.length - 1].split(' ');
    const zip = zipState[zipState.length - 1];
    const state = zipState.slice(0, -1).join(' ');
    
    return {
      street: parts.slice(0, -2).join(', '),
      city: parts[parts.length - 2],
      state,
      zip,
    };
  }
  
  return { street: address };
};

