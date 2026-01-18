/**
 * AI Insights Component
 * Displays AI-powered recommendations and insights for portfolio
 */

import React, { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, AlertTriangle, Lightbulb, DollarSign, X } from 'lucide-react';

interface Insight {
  id: string;
  type: 'opportunity' | 'warning' | 'recommendation' | 'market';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  actionable: boolean;
  estimatedValue?: number;
}

interface AIInsightsProps {
  portfolioId: string;
}

export const AIInsights: React.FC<AIInsightsProps> = ({ portfolioId }) => {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [selectedInsight, setSelectedInsight] = useState<Insight | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock AI insights - replace with real API call
    const mockInsights: Insight[] = [
      {
        id: '1',
        type: 'opportunity',
        title: 'Refinancing Opportunity Detected',
        description: 'Current market rates are 1.2% lower than your average mortgage rate. Refinancing could save you $2,400/year across 3 properties.',
        impact: 'high',
        actionable: true,
        estimatedValue: 2400,
      },
      {
        id: '2',
        type: 'market',
        title: 'Austin Market Outperforming',
        description: 'Your Austin properties have appreciated 18% YoY, outperforming the market average of 12%. Consider increasing allocation.',
        impact: 'high',
        actionable: true,
        estimatedValue: 45000,
      },
      {
        id: '3',
        type: 'warning',
        title: 'Vacancy Risk in Denver Property',
        description: 'Market data shows increasing vacancy rates in the Capitol Hill area. Consider adjusting rent or improving amenities.',
        impact: 'medium',
        actionable: true,
      },
      {
        id: '4',
        type: 'recommendation',
        title: 'Tax Optimization Available',
        description: 'You could benefit from a 1031 exchange on 123 Main St. Estimated tax savings: $18,000.',
        impact: 'high',
        actionable: true,
        estimatedValue: 18000,
      },
      {
        id: '5',
        type: 'opportunity',
        title: 'Portfolio Diversification',
        description: '75% of your portfolio is in single-family homes. Consider adding multi-family properties for better cash flow stability.',
        impact: 'medium',
        actionable: true,
      },
      {
        id: '6',
        type: 'market',
        title: 'Interest Rate Forecast',
        description: 'Fed signals suggest rates may decrease by 0.5% in Q2. Good time to lock in fixed-rate financing.',
        impact: 'medium',
        actionable: false,
      },
    ];

    setTimeout(() => {
      setInsights(mockInsights);
      setLoading(false);
    }, 1000);
  }, [portfolioId]);

  const getIcon = (type: Insight['type']) => {
    switch (type) {
      case 'opportunity':
        return <TrendingUp className="w-5 h-5" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />;
      case 'recommendation':
        return <Lightbulb className="w-5 h-5" />;
      case 'market':
        return <Sparkles className="w-5 h-5" />;
    }
  };

  const getColor = (type: Insight['type']) => {
    switch (type) {
      case 'opportunity':
        return 'from-green-500/20 to-emerald-500/20 border-green-500/30 text-green-400';
      case 'warning':
        return 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30 text-yellow-400';
      case 'recommendation':
        return 'from-blue-500/20 to-purple-500/20 border-blue-500/30 text-blue-400';
      case 'market':
        return 'from-purple-500/20 to-pink-500/20 border-purple-500/30 text-purple-400';
    }
  };

  const getImpactBadge = (impact: Insight['impact']) => {
    const colors = {
      high: 'bg-red-500/20 text-red-400 border-red-500/30',
      medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      low: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    };

    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${colors[impact]}`}>
        {impact.toUpperCase()} IMPACT
      </span>
    );
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-[#1E2749] to-[#141B3D] rounded-2xl p-6 border border-white/10">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg border border-purple-500/30">
            <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">AI Insights</h3>
            <p className="text-sm text-white/60">Analyzing your portfolio...</p>
          </div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const totalPotentialValue = insights
    .filter((i) => i.estimatedValue)
    .reduce((sum, i) => sum + (i.estimatedValue || 0), 0);

  return (
    <div className="bg-[#222] rounded-lg p-6 border border-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#2a2a2a] rounded-lg border border-gray-800">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">AI Insights</h3>
            <p className="text-sm text-white">{insights.length} recommendations found</p>
          </div>
        </div>

        {totalPotentialValue > 0 && (
          <div className="text-right">
            <div className="text-xs text-gray-400 mb-1">Potential Value</div>
            <div className="text-lg font-bold text-green-400">
              {formatCurrency(totalPotentialValue)}
            </div>
          </div>
        )}
      </div>

      {/* Insights Grid */}
      <div className="space-y-3">
        {insights.map((insight) => (
          <div
            key={insight.id}
            onClick={() => setSelectedInsight(insight)}
            className="bg-[#2a2a2a] rounded-md p-4 hover:bg-[#333] transition-colors cursor-pointer border border-gray-800"
          >
            <div className="flex items-start gap-3">
              <div className={`p-2 bg-[#2a2a2a] rounded-lg ${getColor(insight.type)}`}>
                {getIcon(insight.type)}
              </div>

              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-white font-semibold group-hover:text-white/90">
                    {insight.title}
                  </h4>
                  {getImpactBadge(insight.impact)}
                </div>

                <div className="text-xs text-gray-400 mt-2">{insight.description}</div>

                <div className="flex items-center justify-between">
                  {insight.estimatedValue && (
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <DollarSign className="w-4 h-4 text-green-400" />
                      <span className="font-semibold text-green-400">
                        {formatCurrency(insight.estimatedValue)}
                      </span>
                      <span className="text-white/60">potential savings</span>
                    </div>
                  )}

                  {insight.actionable && (
                    <button className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-medium text-white transition-colors">
                      Take Action
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Insight Modal */}
      {selectedInsight && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedInsight(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-700 max-w-2xl w-full"
          >
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className={`p-3 bg-[#2a2a2a] rounded-xl border`}>
                  {getIcon(selectedInsight.type)}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">{selectedInsight.title}</h3>
                  {getImpactBadge(selectedInsight.impact)}
                </div>
              </div>
              <button
                onClick={() => setSelectedInsight(null)}
                className="p-2 hover:bg-gray-800 rounded-md transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <p className="text-white/80 mb-6 leading-relaxed">{selectedInsight.description}</p>

            {selectedInsight.estimatedValue && (
              <div className="bg-[#2a2a2a] rounded-md p-4 border border-gray-800 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-white/60">Estimated Value</span>
                  <span className="text-2xl font-bold text-green-400">
                    {formatCurrency(selectedInsight.estimatedValue)}
                  </span>
                </div>
              </div>
            )}

            {selectedInsight.actionable && (
              <div className="flex gap-3">
                <button className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-xl font-semibold text-white transition-all">
                  Take Action
                </button>
                <button className="px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-semibold text-white transition-colors">
                  Learn More
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
