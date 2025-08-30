'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { RoiDataPoint } from '@/types';

interface ROIChartProps {
  data: RoiDataPoint[];
}

export function ROIChart({ data }: ROIChartProps) {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 12 }}
            className="text-gray-600"
          />
          <YAxis
            tick={{ fontSize: 12 }}
            className="text-gray-600"
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              fontSize: '12px',
            }}
            formatter={(value: number) => [`${value.toFixed(1)}%`, 'ROI']}
          />
          <Line
            type="monotone"
            dataKey="roi"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ r: 4, fill: '#3b82f6' }}
            activeDot={{ r: 6, fill: '#1d4ed8' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
