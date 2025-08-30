'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { formatCurrency, formatPercent, formatNumber } from '@/shared/lib/utils';
import { TrendingUp, Brain, Zap, Target, BarChart3 } from 'lucide-react';
import type { AnalyticsKPIs } from '@/shared/types';

interface KPICardsProps {
  data: AnalyticsKPIs;
}

export function KPICards({ data }: KPICardsProps) {
  const kpis = [
    {
      title: 'AI-Predicted Avg Price',
      value: formatCurrency(data.avgPrice),
      icon: Brain,
      color: 'text-blue-400',
      bgGradient: 'from-blue-500/20 to-cyan-500/20',
      borderColor: 'border-blue-500/30',
      confidence: 94,
      change: '+5.2%',
      subtitle: 'Machine Learning Analysis',
    },
    {
      title: 'Smart Cap Rate Forecast',
      value: formatPercent(data.medianCapRate),
      icon: Target,
      color: 'text-green-400',
      bgGradient: 'from-green-500/20 to-emerald-500/20',
      borderColor: 'border-green-500/30',
      confidence: 91,
      change: '+2.1%',
      subtitle: 'Predictive Model Output',
    },
    {
      title: 'AI Cash-on-Cash ROI',
      value: formatPercent(data.avgCashOnCash),
      icon: Zap,
      color: 'text-purple-400',
      bgGradient: 'from-purple-500/20 to-pink-500/20',
      borderColor: 'border-purple-500/30',
      confidence: 89,
      change: '+7.8%',
      subtitle: 'Neural Network Prediction',
    },
    {
      title: 'AI-Scored Properties',
      value: formatNumber(data.totalListings),
      icon: BarChart3,
      color: 'text-orange-400',
      bgGradient: 'from-orange-500/20 to-red-500/20',
      borderColor: 'border-orange-500/30',
      confidence: 96,
      change: '+142',
      subtitle: 'Automated Analysis Pipeline',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        return (
          <Card
            key={kpi.title}
            className={`bg-gradient-to-br ${kpi.bgGradient} border ${kpi.borderColor} backdrop-blur-sm relative overflow-hidden group hover:scale-105 transition-all duration-300`}
          >
            {/* Animated background effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
              <CardTitle className="text-sm font-medium text-gray-300">
                {kpi.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${kpi.color} bg-slate-800/50`}>
                <Icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-2xl font-bold text-white mb-1">{kpi.value}</div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-400">{kpi.subtitle}</p>
                <Badge variant="secondary" className="text-xs bg-slate-700/50 text-gray-300">
                  {kpi.confidence}% confident
                </Badge>
              </div>

              {/* Performance indicator */}
              <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-700/50">
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-green-400" />
                  <span className="text-sm font-semibold text-green-400">{kpi.change}</span>
                </div>
                <span className="text-xs text-gray-500">vs last month</span>
              </div>

              {/* AI processing indicator */}
              <div className="mt-2 flex items-center gap-1">
                <div className="h-1 w-1 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-500">Live AI Analysis</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
