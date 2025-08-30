'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Brain, TrendingUp, AlertTriangle, Zap, Target, BarChart3 } from 'lucide-react';

interface AIInsight {
  id: string;
  type: 'prediction' | 'recommendation' | 'alert' | 'opportunity';
  title: string;
  description: string;
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  timestamp: string;
}

export function AIInsightsPanel() {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUsingLLM, setIsUsingLLM] = useState(false);

  const generateMockInsights = (): AIInsight[] => [
    {
      id: '1',
      type: 'prediction',
      title: 'Market Opportunity Detected',
      description: 'Austin, TX market shows 23% growth potential in Q1 2026 based on employment trends and housing supply analysis.',
      confidence: 87,
      impact: 'high',
      timestamp: new Date().toISOString(),
    },
    {
      id: '2',
      type: 'recommendation',
      title: 'Portfolio Optimization',
      description: 'Consider diversifying into suburban markets. Current urban concentration poses 15% risk exposure.',
      confidence: 92,
      impact: 'medium',
      timestamp: new Date().toISOString(),
    },
    {
      id: '3',
      type: 'alert',
      title: 'Interest Rate Impact',
      description: 'Rising rates may affect luxury segment by 8-12%. Recommend accelerating acquisition timeline.',
      confidence: 78,
      impact: 'high',
      timestamp: new Date().toISOString(),
    },
    {
      id: '4',
      type: 'opportunity',
      title: 'Undervalued Properties',
      description: '14 properties in your watchlist show 20%+ below market value. AI scoring confidence: 89%',
      confidence: 89,
      impact: 'high',
      timestamp: new Date().toISOString(),
    },
  ];

  useEffect(() => {
    const fetchAIInsights = async () => {
      try {
        setLoading(true);

        // Try to fetch insights from your LLM
        const response = await fetch('/api/ai/insights', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            marketData: {
              location: 'New York, NY',
              timeframe: '2024 Q4',
              metrics: {
                avgPrice: 850000,
                medianCapRate: 4.2,
                totalListings: 1247,
                priceGrowth: 3.8,
              },
            },
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setIsUsingLLM(!data.fallback);

          if (data.success && data.insights) {
            // Parse LLM response (assuming JSON format)
            let parsedInsights;
            try {
              parsedInsights = JSON.parse(data.insights);
            } catch {
              // If not JSON, treat as plain text
              parsedInsights = { key_insights: [data.insights] };
            }

            const llmInsights = convertLLMToInsights(parsedInsights, data.confidence);
            setInsights(llmInsights);
            setLoading(false);
            return;
          }
        }

        // Fallback to mock data if LLM fails
        setIsUsingLLM(false);
        const mockInsights = generateMockInsights();
        setInsights(mockInsights);
      } catch (error) {
        console.error('Failed to fetch AI insights:', error);
        setIsUsingLLM(false);
        const mockInsights = generateMockInsights();
        setInsights(mockInsights);
      } finally {
        setLoading(false);
      }
    };

    fetchAIInsights();

    // Refresh insights every 5 minutes
    const interval = setInterval(fetchAIInsights, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const convertLLMToInsights = (llmData: any, confidence: number): AIInsight[] => {
    const insights: AIInsight[] = [];

    // Convert market sentiment to insight
    if (llmData.market_sentiment) {
      insights.push({
        id: '1',
        type: 'prediction',
        title: `Market Sentiment: ${llmData.market_sentiment.charAt(0).toUpperCase() + llmData.market_sentiment.slice(1)}`,
        description: llmData.investment_recommendation || 'Market conditions analyzed by AI',
        confidence: Math.round(confidence * 100),
        impact: llmData.market_sentiment === 'bullish' ? 'high' : 'medium',
        timestamp: new Date().toISOString(),
      });
    }

    // Convert key insights
    if (llmData.key_insights && Array.isArray(llmData.key_insights)) {
      llmData.key_insights.slice(0, 2).forEach((insight: string, index: number) => {
        insights.push({
          id: `insight-${index + 2}`,
          type: 'recommendation',
          title: 'AI Market Analysis',
          description: insight,
          confidence: Math.round(confidence * 100),
          impact: 'medium',
          timestamp: new Date().toISOString(),
        });
      });
    }

    // Convert opportunities
    if (llmData.opportunities && Array.isArray(llmData.opportunities)) {
      llmData.opportunities.slice(0, 1).forEach((opportunity: string, index: number) => {
        insights.push({
          id: `opportunity-${index + 1}`,
          type: 'opportunity',
          title: 'Investment Opportunity',
          description: opportunity,
          confidence: Math.round(confidence * 100),
          impact: 'high',
          timestamp: new Date().toISOString(),
        });
      });
    }

    // Convert risk factors
    if (llmData.risk_factors && Array.isArray(llmData.risk_factors)) {
      llmData.risk_factors.slice(0, 1).forEach((risk: string, index: number) => {
        insights.push({
          id: `risk-${index + 1}`,
          type: 'alert',
          title: 'Risk Alert',
          description: risk,
          confidence: Math.round(confidence * 100),
          impact: 'high',
          timestamp: new Date().toISOString(),
        });
      });
    }

    return insights.slice(0, 4); // Limit to 4 insights
  };

  const getInsightIcon = (type: AIInsight['type']) => {
    switch (type) {
      case 'prediction':
        return <BarChart3 className="h-4 w-4" />;
      case 'recommendation':
        return <Target className="h-4 w-4" />;
      case 'alert':
        return <AlertTriangle className="h-4 w-4" />;
      case 'opportunity':
        return <TrendingUp className="h-4 w-4" />;
    }
  };

  const getInsightColor = (type: AIInsight['type']) => {
    switch (type) {
      case 'prediction':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'recommendation':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'alert':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'opportunity':
        return 'bg-green-500/10 text-green-400 border-green-500/20';
    }
  };

  const getImpactColor = (impact: AIInsight['impact']) => {
    switch (impact) {
      case 'high':
        return 'bg-red-500/20 text-red-400';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'low':
        return 'bg-green-500/20 text-green-400';
    }
  };

  if (loading) {
    return (
      <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Brain className="h-5 w-5 text-purple-400" />
            AI Insights
            <Zap className="h-4 w-4 text-yellow-400 animate-pulse" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-slate-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-slate-700 rounded w-full"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Brain className="h-5 w-5 text-purple-400" />
          AI Insights
          <Zap className="h-4 w-4 text-yellow-400 animate-pulse" />
          <Badge variant="secondary" className="ml-auto bg-purple-500/20 text-purple-300">
            {isUsingLLM ? 'Live LLM' : 'Demo Mode'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {insights.map((insight) => (
          <div
            key={insight.id}
            className={`p-4 rounded-lg border ${getInsightColor(insight.type)} relative overflow-hidden`}
          >
            {/* Animated background gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />

            <div className="relative">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getInsightIcon(insight.type)}
                  <h4 className="font-semibold text-sm">{insight.title}</h4>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={`text-xs ${getImpactColor(insight.impact)}`}>
                    {insight.impact.toUpperCase()}
                  </Badge>
                  <span className="text-xs text-gray-400">{insight.confidence}% confident</span>
                </div>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed">{insight.description}</p>

              {/* Confidence bar */}
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                  <span>AI Confidence</span>
                  <span>{insight.confidence}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-1">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-1 rounded-full transition-all duration-1000"
                    style={{ width: `${insight.confidence}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
