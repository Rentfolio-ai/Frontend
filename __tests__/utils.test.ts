import { describe, it, expect } from 'vitest';
import { formatCurrency, formatPercent, formatNumber } from '@/lib/utils';

describe('Utils', () => {
  describe('formatCurrency', () => {
    it('formats currency correctly', () => {
      expect(formatCurrency(123456)).toBe('$123,456');
      expect(formatCurrency(1000)).toBe('$1,000');
      expect(formatCurrency(0)).toBe('$0');
    });
  });

  describe('formatPercent', () => {
    it('formats percentage correctly', () => {
      expect(formatPercent(5.5)).toBe('5.5%');
      expect(formatPercent(10)).toBe('10.0%');
      expect(formatPercent(0)).toBe('0.0%');
    });
  });

  describe('formatNumber', () => {
    it('formats numbers with commas', () => {
      expect(formatNumber(1234567)).toBe('1,234,567');
      expect(formatNumber(1000)).toBe('1,000');
      expect(formatNumber(123)).toBe('123');
    });
  });
});
