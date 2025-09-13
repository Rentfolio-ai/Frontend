// FILE: src/components/rail/KpiMiniTiles.tsx
import React from 'react';
import { Card } from '../primitives/Card';

interface KpiData {
  id: string;
  label: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  format?: 'currency' | 'percentage' | 'number' | 'text';
}

const sampleKpis: KpiData[] = [
  {
    id: '1',
    label: 'Portfolio Value',
    value: '2.4M',
    change: '+12.3%',
    trend: 'up',
    format: 'currency'
  },
  {
    id: '2',
    label: 'Monthly Revenue',
    value: '18.5K',
    change: '+5.2%',
    trend: 'up',
    format: 'currency'
  },
  {
    id: '3',
    label: 'Avg Cap Rate',
    value: '6.8',
    change: '+0.3%',
    trend: 'up',
    format: 'percentage'
  },
  {
    id: '4',
    label: 'Occupancy Rate',
    value: '94.2',
    change: '-1.8%',
    trend: 'down',
    format: 'percentage'
  },
  {
    id: '5',
    label: 'Active Properties',
    value: 12,
    format: 'number'
  },
  {
    id: '6',
    label: 'Markets',
    value: 4,
    format: 'number'
  }
];

export const KpiMiniTiles: React.FC = () => {
  const formatValue = (value: string | number, format?: string) => {
    if (format === 'currency') {
      return `$${value}`;
    }
    if (format === 'percentage') {
      return `${value}%`;
    }
    return value;
  };

  const getTrendIcon = (trend?: string) => {
    if (trend === 'up') {
      return (
        <svg className="w-3 h-3 text-success" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
        </svg>
      );
    }
    if (trend === 'down') {
      return (
        <svg className="w-3 h-3 text-danger" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <h3 className="text-h2">Key Metrics</h3>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {sampleKpis.map(kpi => (
          <Card key={kpi.id} padding="sm" className="text-center">
            <div className="space-y-1">
              <div className="text-xs text-foreground/60 font-medium">
                {kpi.label}
              </div>
              <div className="text-lg font-bold text-foreground">
                {formatValue(kpi.value, kpi.format)}
              </div>
              {kpi.change && (
                <div className="flex items-center justify-center gap-1">
                  {getTrendIcon(kpi.trend)}
                  <span className={`text-xs font-medium ${
                    kpi.trend === 'up' ? 'text-success' : 
                    kpi.trend === 'down' ? 'text-danger' : 
                    'text-foreground/60'
                  }`}>
                    {kpi.change}
                  </span>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Summary Card */}
      <Card padding="sm" className="bg-primary/5 border-primary/20">
        <div className="text-center space-y-2">
          <div className="text-sm font-semibold text-primary">
            Portfolio Performance
          </div>
          <div className="text-xs text-foreground/70">
            Strong performance across all metrics. Revenue up 15% this quarter.
          </div>
        </div>
      </Card>
    </div>
  );
};