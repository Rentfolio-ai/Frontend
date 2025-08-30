'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { KPICards } from './kpi-cards';
import { ROIChart } from './roi-chart';
import { CapRateChart } from './cap-rate-chart';
import { TopZipsChart } from './top-zips-chart';
import type { AnalyticsKPIs, RoiDataPoint, CapRateDistribution, TopZipData } from '@/types';

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
    <div className="space-y-6">
      {/* KPI Cards */}
      {kpis && <KPICards data={kpis} />}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>AI ROI Predictions</CardTitle>
          </CardHeader>
          <CardContent>
            <ROIChart data={roiData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Smart Cap Rate Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <CapRateChart data={capRateData} />
          </CardContent>
        </Card>
      </div>

      {/* Top ZIPs Chart */}
      <Card>
        <CardHeader>
          <CardTitle>AI-Identified Top Markets by ROI Potential</CardTitle>
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
