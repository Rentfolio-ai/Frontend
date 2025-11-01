/**
 * Portfolio Types
 * Types for portfolio management with support for both mock and real API data
 */

export interface Property {
  id: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  propertyType: 'single_family' | 'multi_family' | 'condo' | 'townhouse' | 'commercial';
  
  // Financial data
  purchasePrice: number;
  purchaseDate: string;
  currentValue: number;
  lastValuationDate: string;
  
  // Income/Expenses
  monthlyRent?: number;
  monthlyExpenses?: number;
  annualPropertyTax?: number;
  annualInsurance?: number;
  
  // Calculated metrics
  roi: number;
  cashFlow: number;
  occupancyRate?: number;
  
  // Property tier (A, B, C, D based on performance)
  tier?: 'A' | 'B' | 'C' | 'D';
  
  // Market data (from ETL pipeline)
  marketTrend?: 'up' | 'down' | 'stable';
  comparableAvgPrice?: number;
  marketAppreciationRate?: number;
  
  // Metadata
  notes?: string;
  images?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Portfolio {
  id: string;
  userId: string;
  name: string;
  description?: string;
  
  // Aggregated metrics
  totalValue: number;
  totalInvestment: number;
  totalROI: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlyCashFlow: number;
  
  // Property counts
  propertyCount: number;
  tierDistribution: {
    A: number;
    B: number;
    C: number;
    D: number;
  };
  
  // Performance tracking
  ytdReturn: number;
  allTimeReturn: number;
  
  createdAt: string;
  updatedAt: string;
}

export interface PortfolioSummary {
  portfolio: Portfolio;
  properties: Property[];
  performanceMetrics: PerformanceMetrics;
  insights: AIInsight[];
}

export interface PerformanceMetrics {
  totalEquity: number;
  debtToEquityRatio: number;
  averageROI: number;
  averageCashFlow: number;
  bestPerformer: Property | null;
  worstPerformer: Property | null;
  monthlyTrend: MonthlyDataPoint[];
}

export interface MonthlyDataPoint {
  month: string;
  value: number;
  income: number;
  expenses: number;
}

export interface AIInsight {
  id: string;
  type: 'opportunity' | 'risk' | 'recommendation' | 'trend';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  propertyId?: string;
  actionable: boolean;
  createdAt: string;
}

// Market data from ETL pipeline
export interface MarketData {
  location: string;
  medianPrice: number;
  priceChange: number;
  daysOnMarket: number;
  inventoryLevel: number;
  rentGrowthRate: number;
  vacancyRate: number;
  forecastedGrowth: number;
  lastUpdated: string;
  dataSource: 'zillow' | 'redfin' | 'realtor' | 'mock';
}

// ETL pipeline data structure
export interface ETLPropertyUpdate {
  propertyId: string;
  currentValue: number;
  marketTrend: 'up' | 'down' | 'stable';
  comparableAvgPrice: number;
  marketAppreciationRate: number;
  occupancyRate?: number;
  dataSource: string;
  timestamp: string;
}
