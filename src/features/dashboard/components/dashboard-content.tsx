'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { KPICards } from './kpi-cards';
import { ROIChart } from './roi-chart';
import { CapRateChart } from './cap-rate-chart';
import { TopZipsChart } from './top-zips-chart';
import { AIInsightsPanel } from './ai-insights-panel';
import { AIModelPerformance } from './ai-model-performance';
import { AIPredictionTrends } from './ai-prediction-trends';
import type { AnalyticsKPIs, RoiDataPoint, CapRateDistribution, TopZipData } from '@/shared/types';

export function DashboardContent() {
  const [kpis, setKpis] = useState<AnalyticsKPIs | null>(null);
  const [roiData, setRoiData] = useState<RoiDataPoint[]>([]);
  const [capRateData, setCapRateData] = useState<CapRateDistribution[]>([]);
  const [topZipsData, setTopZipsData] = useState<TopZipData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [kpisRes, roiRes, capRes, zipsRes] = await Promise.all([
          fetch('/api/analytics/kpis'),
          fetch('/api/analytics/roi-by-month'),
          fetch('/api/analytics/cap-histogram'),
          fetch('/api/analytics/top-zips'),
        ]);

        const [kpisData, roiData, capData, zipsData] = await Promise.all([
          kpisRes.json(),
          roiRes.json(),
          capRes.json(),
          zipsRes.json(),
        ]);

        setKpis(kpisData);
        setRoiData(roiData);
        setCapRateData(capData);
        setTopZipsData(zipsData);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      {kpis && <KPICards data={kpis} />}

      {/* AI Insights Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AIInsightsPanel />
        </div>
        <div>
          <AIModelPerformance />
        </div>
      </div>

      {/* AI Prediction Trends */}
      <AIPredictionTrends />

      {/* Enhanced Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              AI ROI Predictions
              <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full">
                Neural Network
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ROIChart data={roiData} />
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              Smart Cap Rate Analysis
              <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full">
                ML Algorithm
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CapRateChart data={capRateData} />
          </CardContent>
        </Card>
      </div>

      {/* AI Market Intelligence */}
      <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            AI-Identified Top Markets by ROI Potential
            <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded-full">
              Predictive Analysis
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TopZipsChart data={topZipsData} />
        </CardContent>
      </Card>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Top ZIPs Skeleton */}
      <Card>
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded w-1/2"></div>
        </CardHeader>
        <CardContent>
          <div className="h-80 bg-gray-200 rounded animate-pulse"></div>
        </CardContent>
      </Card>
    </div>
  );
}
