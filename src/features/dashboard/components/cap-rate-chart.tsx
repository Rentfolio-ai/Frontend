'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { CapRateDistribution } from '@/types';

interface CapRateChartProps {
  data: CapRateDistribution[];
}

export function CapRateChart({ data }: CapRateChartProps) {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis
            dataKey="range"
            tick={{ fontSize: 12 }}
            className="text-gray-600"
          />
          <YAxis
            tick={{ fontSize: 12 }}
            className="text-gray-600"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              fontSize: '12px',
            }}
            formatter={(value: number) => [value, 'Properties']}
          />
          <Bar
            dataKey="count"
            fill="#10b981"
            radius={[2, 2, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
