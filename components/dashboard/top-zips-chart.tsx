'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { TopZipData } from '@/types';

interface TopZipsChartProps {
  data: TopZipData[];
}

export function TopZipsChart({ data }: TopZipsChartProps) {
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="horizontal"
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis
            type="number"
            tick={{ fontSize: 12 }}
            className="text-gray-600"
            tickFormatter={(value) => `${value}%`}
          />
          <YAxis
            type="category"
            dataKey="zip"
            tick={{ fontSize: 12 }}
            className="text-gray-600"
            width={60}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              fontSize: '12px',
            }}
            formatter={(value: number, name, props) => [
              `${value.toFixed(1)}%`,
              'Avg ROI',
              `(${props.payload.count} properties)`
            ]}
          />
          <Bar
            dataKey="avgRoi"
            fill="#8b5cf6"
            radius={[0, 2, 2, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
