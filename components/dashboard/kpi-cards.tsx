'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatPercent, formatNumber } from '@/lib/utils';
import { DollarSign, TrendingUp, Percent, Building } from 'lucide-react';
import type { AnalyticsKPIs } from '@/types';

interface KPICardsProps {
  data: AnalyticsKPIs;
}

export function KPICards({ data }: KPICardsProps) {
  const kpis = [
    {
      title: 'AI Avg Price',
      value: formatCurrency(data.avgPrice),
      icon: DollarSign,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Predicted Cap Rate',
      value: formatPercent(data.medianCapRate),
      icon: Percent,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'AI Cash-on-Cash',
      value: formatPercent(data.avgCashOnCash),
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Smart Listings',
      value: formatNumber(data.totalListings),
      icon: Building,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        return (
          <Card key={kpi.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {kpi.title}
              </CardTitle>
              <div className={`rounded-full p-2 ${kpi.bgColor}`}>
                <Icon className={`h-4 w-4 ${kpi.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {kpi.value}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
