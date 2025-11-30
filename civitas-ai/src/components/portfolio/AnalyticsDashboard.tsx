// FILE: src/components/portfolio/AnalyticsDashboard.tsx
import React, { useEffect, useState } from 'react';
import { TrendingUp, DollarSign, Home, BarChart3 } from 'lucide-react';
import { usePortfolioStore } from '../../stores/portfolioStore';
import type { PortfolioWithMetrics } from '../../types/portfolio';
import { formatCurrency, formatPercentage } from '../../utils/portfolioHelpers';

interface AnalyticsDashboardProps {
  portfolio: PortfolioWithMetrics;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  portfolio,
}) => {
  const {
    analytics,
    loading,
    fetchAnalytics,
    fetchCashFlow,
    fetchPerformance,
  } = usePortfolioStore();

  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setMonth(new Date().getMonth() - 12))
      .toISOString()
      .split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchAnalytics(portfolio.portfolio_id);
    fetchPerformance(portfolio.portfolio_id);
    fetchCashFlow(portfolio.portfolio_id, dateRange.start, dateRange.end);
  }, [portfolio.portfolio_id, dateRange, fetchAnalytics, fetchPerformance, fetchCashFlow]);

  const metrics = analytics.metrics || portfolio.metrics;
  const performance = analytics.performance;
  const cashflow = analytics.cashflow;

  if (loading.analytics) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Loading analytics...</div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">No analytics data available</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500">Total Portfolio Value</p>
            <DollarSign className="w-5 h-5 text-primary" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(metrics.total_portfolio_value)}
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500">Monthly Cashflow</p>
            <TrendingUp
              className={`w-5 h-5 ${
                metrics.total_monthly_cashflow >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            />
          </div>
          <p
            className={`text-2xl font-bold ${
              metrics.total_monthly_cashflow >= 0 ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {formatCurrency(metrics.total_monthly_cashflow)}
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500">Average Cap Rate</p>
            <BarChart3 className="w-5 h-5 text-primary" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {formatPercentage(metrics.average_cap_rate)}
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500">Total Properties</p>
            <Home className="w-5 h-5 text-primary" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {metrics.total_properties}
          </p>
        </div>
      </div>

      {/* Performance Metrics */}
      {performance && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">ROI</p>
              <p className="text-xl font-semibold text-gray-900">
                {formatPercentage(performance.performance_metrics.roi)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Cash on Cash Return</p>
              <p className="text-xl font-semibold text-gray-900">
                {formatPercentage(performance.performance_metrics.cash_on_cash_return)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Gross Rent Multiplier</p>
              <p className="text-xl font-semibold text-gray-900">
                {performance.performance_metrics.gross_rent_multiplier.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Debt Coverage Ratio</p>
              <p className="text-xl font-semibold text-gray-900">
                {performance.performance_metrics.debt_coverage_ratio.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Equity Build Rate</p>
              <p className="text-xl font-semibold text-gray-900">
                {formatPercentage(performance.performance_metrics.equity_build_rate)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Cash Flow Analysis */}
      {cashflow && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Cash Flow Analysis</h3>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) =>
                  setDateRange({ ...dateRange, start: e.target.value })
                }
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
              />
              <span className="text-gray-500">to</span>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) =>
                  setDateRange({ ...dateRange, end: e.target.value })
                }
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
              />
            </div>
          </div>

          {/* Cash Flow Summary */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Total Rent</p>
              <p className="text-xl font-semibold text-green-700">
                {formatCurrency(cashflow.totals.total_rent)}
              </p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Total Expenses</p>
              <p className="text-xl font-semibold text-red-700">
                {formatCurrency(cashflow.totals.total_expenses)}
              </p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Net Cashflow</p>
              <p
                className={`text-xl font-semibold ${
                  cashflow.totals.total_cashflow >= 0
                    ? 'text-green-700'
                    : 'text-red-700'
                }`}
              >
                {formatCurrency(cashflow.totals.total_cashflow)}
              </p>
            </div>
          </div>

          {/* Monthly Breakdown Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Month
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                    Rent
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                    Expenses
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                    Cashflow
                  </th>
                </tr>
              </thead>
              <tbody>
                {cashflow.monthly_breakdown.map((month, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-3 px-4 text-gray-900">{month.month}</td>
                    <td className="py-3 px-4 text-right text-gray-900">
                      {formatCurrency(month.total_rent)}
                    </td>
                    <td className="py-3 px-4 text-right text-gray-900">
                      {formatCurrency(month.total_expenses)}
                    </td>
                    <td
                      className={`py-3 px-4 text-right font-medium ${
                        month.cashflow >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {formatCurrency(month.cashflow)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Monthly Rent</span>
              <span className="font-semibold text-gray-900">
                {formatCurrency(metrics.total_monthly_rent)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Monthly Expenses</span>
              <span className="font-semibold text-gray-900">
                {formatCurrency(metrics.total_monthly_expenses)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Debt</span>
              <span className="font-semibold text-gray-900">
                {formatCurrency(metrics.total_debt)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Equity</span>
              <span className="font-semibold text-gray-900">
                {formatCurrency(metrics.total_equity)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Returns</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Average Cap Rate</span>
              <span className="font-semibold text-gray-900">
                {formatPercentage(metrics.average_cap_rate)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Average Cash on Cash</span>
              <span className="font-semibold text-gray-900">
                {formatPercentage(metrics.average_cash_on_cash)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total ROI</span>
              <span className="font-semibold text-gray-900">
                {formatPercentage(metrics.total_roi)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

