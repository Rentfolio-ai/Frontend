'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, AlertTriangle, CheckCircle, Brain, Zap } from 'lucide-react';
import type { Property } from '@/types';

interface AIInsightsProps {
  property: Property;
}

export function AIInsights({ property }: AIInsightsProps) {
  // Mock AI insights - in real app, these would come from ML models
  const insights = [
    {
      type: 'positive',
      icon: TrendingUp,
      title: 'Market Trend Analysis',
      message: `Property values in ${property.zip} have increased 8.5% over the past 12 months`,
      confidence: 94
    },
    {
      type: 'neutral',
      icon: Brain,
      title: 'AI Valuation Model',
      message: `Our ML model suggests fair market value is ${((property.price * 0.95) / 1000).toFixed(0)}K - ${((property.price * 1.05) / 1000).toFixed(0)}K`,
      confidence: 87
    },
    {
      type: 'positive',
      icon: CheckCircle,
      title: 'Investment Opportunity',
      message: `High rental demand detected. Similar properties rent for $${Math.round(property.rentEst * 1.1)}/month`,
      confidence: 91
    },
    {
      type: 'warning',
      icon: AlertTriangle,
      title: 'Risk Assessment',
      message: `Property tax rates in this area may increase by 3-5% next year`,
      confidence: 76
    }
  ];

  const getInsightStyles = (type: string) => {
    switch (type) {
      case 'positive':
        return {
          border: 'border-green-200',
          bg: 'bg-green-50',
          iconColor: 'text-green-600',
          badgeColor: 'bg-green-100 text-green-800'
        };
      case 'warning':
        return {
          border: 'border-yellow-200',
          bg: 'bg-yellow-50',
          iconColor: 'text-yellow-600',
          badgeColor: 'bg-yellow-100 text-yellow-800'
        };
      default:
        return {
          border: 'border-blue-200',
          bg: 'bg-blue-50',
          iconColor: 'text-blue-600',
          badgeColor: 'bg-blue-100 text-blue-800'
        };
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Brain className="h-5 w-5 mr-2 text-purple-600" />
          AI Market Intelligence
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {insights.map((insight, index) => {
          const Icon = insight.icon;
          const styles = getInsightStyles(insight.type);

          return (
            <div
              key={index}
              className={`p-4 rounded-lg border ${styles.border} ${styles.bg}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center">
                  <Icon className={`h-4 w-4 mr-2 ${styles.iconColor}`} />
                  <h4 className="font-medium text-gray-900">{insight.title}</h4>
                </div>
                <Badge variant="outline" className={styles.badgeColor}>
                  {insight.confidence}% confident
                </Badge>
              </div>
              <p className="text-sm text-gray-700">{insight.message}</p>
            </div>
          );
        })}

        {/* AI Processing indicator */}
        <div className="flex items-center justify-center pt-4 border-t">
          <div className="flex items-center text-sm text-gray-500">
            <Zap className="h-4 w-4 mr-2 text-purple-500" />
            Powered by advanced machine learning algorithms
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
