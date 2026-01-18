/**
 * Scenario Planner Component
 * "What-if" analysis tool for portfolio decisions
 */

import React, { useState } from 'react';
import { Calculator, TrendingUp, DollarSign, Home, Percent } from 'lucide-react';

interface Scenario {
  id: string;
  name: string;
  description: string;
  impact: {
    portfolioValue: number;
    monthlyIncome: number;
    roi: number;
    cashFlow: number;
  };
}

export const ScenarioPlanner: React.FC = () => {
  const [selectedScenario, setSelectedScenario] = useState<string>('sell');

  const scenarios: Scenario[] = [
    {
      id: 'sell',
      name: 'Sell 123 Main St',
      description: 'Sell underperforming property and reinvest proceeds',
      impact: {
        portfolioValue: -450000,
        monthlyIncome: -1800,
        roi: 1.2,
        cashFlow: 2400,
      },
    },
    {
      id: 'refinance',
      name: 'Refinance All Properties',
      description: 'Refinance at current market rates (5.5% → 4.3%)',
      impact: {
        portfolioValue: 0,
        monthlyIncome: 2400,
        roi: 2.8,
        cashFlow: 2400,
      },
    },
    {
      id: 'acquire',
      name: 'Acquire Multi-Family',
      description: 'Purchase 12-unit apartment building in Austin',
      impact: {
        portfolioValue: 1200000,
        monthlyIncome: 8500,
        roi: -1.5,
        cashFlow: 3200,
      },
    },
    {
      id: '1031',
      name: '1031 Exchange',
      description: 'Exchange Denver property for higher-yielding asset',
      impact: {
        portfolioValue: 100000,
        monthlyIncome: 1200,
        roi: 3.5,
        cashFlow: 1800,
      },
    },
  ];

  const currentPortfolio = {
    value: 2400000,
    monthlyIncome: 18500,
    roi: 12.5,
    cashFlow: 6200,
  };

  const selectedScenarioData = scenarios.find((s) => s.id === selectedScenario);
  const projectedPortfolio = selectedScenarioData
    ? {
        value: currentPortfolio.value + selectedScenarioData.impact.portfolioValue,
        monthlyIncome: currentPortfolio.monthlyIncome + selectedScenarioData.impact.monthlyIncome,
        roi: currentPortfolio.roi + selectedScenarioData.impact.roi,
        cashFlow: currentPortfolio.cashFlow + selectedScenarioData.impact.cashFlow,
      }
    : currentPortfolio;

  const formatCurrency = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    if (Math.abs(value) >= 1000000) {
      return `${sign}$${(value / 1000000).toFixed(2)}M`;
    }
    return `${sign}$${value.toLocaleString()}`;
  };

  const formatPercent = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  return (
    <div className="bg-[#222] rounded-lg p-6 border border-gray-800">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-1.5 bg-orange-500/10 rounded-md">
          <Calculator className="w-4 h-4 text-orange-400" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-white">Scenario Planner</h3>
          <p className="text-xs text-gray-400">Model potential portfolio decisions</p>
        </div>
      </div>

      {/* Scenario Selector */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
        {scenarios.map((scenario) => (
          <button
            key={scenario.id}
            onClick={() => setSelectedScenario(scenario.id)}
            className={`text-left p-4 rounded-md transition-colors ${
              selectedScenario === scenario.id
                ? 'bg-[#333] border-gray-600 ring-1 ring-gray-600'
                : 'bg-[#2a2a2a] border-gray-800 hover:bg-[#333]'
            }`}
          >
            <h4 className="text-white font-medium text-sm mb-1">{scenario.name}</h4>
            <p className="text-xs text-gray-400">{scenario.description}</p>
          </button>
        ))}
      </div>

      {/* Comparison View */}
      {selectedScenarioData && (
        <div className="space-y-4">
          {/* Impact Summary */}
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <h4 className="text-white font-medium mb-4">Impact Analysis</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                {
                  label: 'Portfolio Value',
                  current: currentPortfolio.value,
                  projected: projectedPortfolio.value,
                  change: selectedScenarioData.impact.portfolioValue,
                  icon: Home,
                  format: (v: number) => `$${(v / 1000000).toFixed(2)}M`,
                },
                {
                  label: 'Monthly Income',
                  current: currentPortfolio.monthlyIncome,
                  projected: projectedPortfolio.monthlyIncome,
                  change: selectedScenarioData.impact.monthlyIncome,
                  icon: DollarSign,
                  format: (v: number) => `$${v.toLocaleString()}`,
                },
                {
                  label: 'ROI',
                  current: currentPortfolio.roi,
                  projected: projectedPortfolio.roi,
                  change: selectedScenarioData.impact.roi,
                  icon: TrendingUp,
                  format: (v: number) => `${v.toFixed(1)}%`,
                },
                {
                  label: 'Cash Flow',
                  current: currentPortfolio.cashFlow,
                  projected: projectedPortfolio.cashFlow,
                  change: selectedScenarioData.impact.cashFlow,
                  icon: Percent,
                  format: (v: number) => `$${v.toLocaleString()}`,
                },
              ].map((metric, index) => {
                const Icon = metric.icon;
                const isPositive = metric.change >= 0;

                return (
                  <div
                    key={metric.label}
                    className="bg-[#1a1a1a] rounded-md p-3"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="w-4 h-4 text-white/60" />
                      <span className="text-xs text-gray-400">{metric.label}</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm text-gray-300">Purchase Price</span>
                        <span className="text-sm font-medium text-white">
                          {metric.format(metric.current)}
                        </span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm text-gray-300">Projected Value</span>
                        <span className="text-sm font-semibold text-white">
                          {metric.format(metric.projected)}
                        </span>
                      </div>
                      <div
                        className={`text-xs font-semibold ${
                          isPositive ? 'text-green-400' : 'text-red-400'
                        }`}
                      >
                        {metric.label === 'Portfolio Value' || metric.label === 'Monthly Income' || metric.label === 'Cash Flow'
                          ? formatCurrency(metric.change)
                          : formatPercent(metric.change)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detailed Breakdown */}
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <h4 className="text-white font-medium mb-4">Detailed Breakdown</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <span className="text-sm text-white/80">Annual Income Change</span>
                <span className="text-sm font-semibold text-green-400">
                  {formatCurrency(selectedScenarioData.impact.monthlyIncome * 12)}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <span className="text-sm text-white/80">5-Year Projected Gain</span>
                <span className="text-sm font-semibold text-green-400">
                  {formatCurrency(selectedScenarioData.impact.monthlyIncome * 12 * 5)}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <span className="text-sm text-white/80">ROI Impact</span>
                <span
                  className={`text-sm font-semibold ${
                    selectedScenarioData.impact.roi >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {formatPercent(selectedScenarioData.impact.roi)}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button className="flex-1 px-4 py-2 bg-white hover:bg-gray-100 rounded-md font-medium text-gray-900 text-sm transition-colors">
              Run Full Analysis
            </button>
            <button className="px-4 py-2 bg-[#2a2a2a] hover:bg-[#333] rounded-md font-medium text-white text-sm transition-colors">
              Save Scenario
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
