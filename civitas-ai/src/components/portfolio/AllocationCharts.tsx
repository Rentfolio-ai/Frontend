// FILE: src/components/portfolio/AllocationCharts.tsx
/**
 * Allocation Charts - Donut charts for strategy and geographic mix
 * Interactive visualization with hover details
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Layers } from 'lucide-react';

interface AllocationData {
    label: string;
    value: number;
    color: string;
}

interface AllocationChartsProps {
    strategyData: AllocationData[];
    marketData: AllocationData[];
    loading?: boolean;
}

// Color palette for charts
const strategyColors = [
    '#14b8a6', // teal
    '#06b6d4', // cyan
    '#8b5cf6', // purple
    '#f59e0b', // amber
    '#ef4444', // red
];

const marketColors = [
    '#3b82f6', // blue
    '#10b981', // emerald
    '#f97316', // orange
    '#8b5cf6', // purple
    '#ec4899', // pink
    '#06b6d4', // cyan
];

const DonutChart: React.FC<{
    data: AllocationData[];
    title: string;
    icon: React.ReactNode;
    size?: number;
}> = ({ data, title, icon, size = 120 }) => {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    const total = data.reduce((sum, item) => sum + item.value, 0);
    const radius = (size - 20) / 2;
    const innerRadius = radius * 0.6;
    const centerX = size / 2;
    const centerY = size / 2;

    // Calculate segments
    let currentAngle = -90; // Start from top
    const segments = data.map((item, idx) => {
        const percentage = (item.value / total) * 100;
        const angle = (percentage / 100) * 360;
        const startAngle = currentAngle;
        const endAngle = currentAngle + angle;
        currentAngle = endAngle;

        // Calculate arc path
        const startRadians = (startAngle * Math.PI) / 180;
        const endRadians = (endAngle * Math.PI) / 180;

        const x1 = centerX + radius * Math.cos(startRadians);
        const y1 = centerY + radius * Math.sin(startRadians);
        const x2 = centerX + radius * Math.cos(endRadians);
        const y2 = centerY + radius * Math.sin(endRadians);

        const x3 = centerX + innerRadius * Math.cos(endRadians);
        const y3 = centerY + innerRadius * Math.sin(endRadians);
        const x4 = centerX + innerRadius * Math.cos(startRadians);
        const y4 = centerY + innerRadius * Math.sin(startRadians);

        const largeArcFlag = angle > 180 ? 1 : 0;

        const path = [
            `M ${x1} ${y1}`,
            `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
            `L ${x3} ${y3}`,
            `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4}`,
            'Z'
        ].join(' ');

        return {
            ...item,
            percentage,
            path,
            idx,
        };
    });

    const hoveredItem = hoveredIndex !== null ? segments[hoveredIndex] : null;

    return (
        <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4">
            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
                <div className="text-teal-400">{icon}</div>
                <h4 className="text-sm font-medium text-white">{title}</h4>
            </div>

            <div className="flex items-center gap-4">
                {/* Chart */}
                <div className="relative flex-shrink-0">
                    <svg width={size} height={size}>
                        {segments.map((segment, idx) => (
                            <motion.path
                                key={segment.label}
                                d={segment.path}
                                fill={segment.color}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{
                                    opacity: hoveredIndex === null || hoveredIndex === idx ? 1 : 0.5,
                                    scale: hoveredIndex === idx ? 1.05 : 1,
                                }}
                                transition={{ duration: 0.2 }}
                                onMouseEnter={() => setHoveredIndex(idx)}
                                onMouseLeave={() => setHoveredIndex(null)}
                                className="cursor-pointer transition-all"
                                style={{ transformOrigin: `${centerX}px ${centerY}px` }}
                            />
                        ))}
                    </svg>

                    {/* Center label */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        {hoveredItem ? (
                            <>
                                <span className="text-lg font-bold text-white">
                                    {hoveredItem.percentage.toFixed(0)}%
                                </span>
                                <span className="text-xs text-slate-400 max-w-[60px] text-center truncate">
                                    {hoveredItem.label}
                                </span>
                            </>
                        ) : (
                            <>
                                <span className="text-lg font-bold text-white">{data.length}</span>
                                <span className="text-xs text-slate-400">items</span>
                            </>
                        )}
                    </div>
                </div>

                {/* Legend */}
                <div className="flex-1 space-y-1.5">
                    {segments.map((segment, idx) => (
                        <motion.div
                            key={segment.label}
                            onMouseEnter={() => setHoveredIndex(idx)}
                            onMouseLeave={() => setHoveredIndex(null)}
                            animate={{
                                opacity: hoveredIndex === null || hoveredIndex === idx ? 1 : 0.5,
                                x: hoveredIndex === idx ? 4 : 0,
                            }}
                            className="flex items-center gap-2 cursor-pointer"
                        >
                            <div
                                className="w-3 h-3 rounded-sm flex-shrink-0"
                                style={{ backgroundColor: segment.color }}
                            />
                            <span className="text-xs text-slate-300 flex-1 truncate">{segment.label}</span>
                            <span className="text-xs text-slate-500">{segment.percentage.toFixed(0)}%</span>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export const AllocationCharts: React.FC<AllocationChartsProps> = ({
    strategyData,
    marketData,
    loading = false,
}) => {
    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2].map((i) => (
                    <div key={i} className="bg-white/5 rounded-xl p-4 animate-pulse">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-5 h-5 bg-white/10 rounded" />
                            <div className="h-4 w-24 bg-white/10 rounded" />
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-28 h-28 rounded-full bg-white/10" />
                            <div className="flex-1 space-y-2">
                                <div className="h-3 bg-white/10 rounded w-full" />
                                <div className="h-3 bg-white/10 rounded w-3/4" />
                                <div className="h-3 bg-white/10 rounded w-1/2" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    // Add colors to data if not provided
    const strategyWithColors = strategyData.map((item, idx) => ({
        ...item,
        color: item.color || strategyColors[idx % strategyColors.length],
    }));

    const marketWithColors = marketData.map((item, idx) => ({
        ...item,
        color: item.color || marketColors[idx % marketColors.length],
    }));

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DonutChart
                data={strategyWithColors}
                title="Strategy Mix"
                icon={<Layers className="w-5 h-5" />}
            />
            <DonutChart
                data={marketWithColors}
                title="Geographic Mix"
                icon={<MapPin className="w-5 h-5" />}
            />
        </div>
    );
};

export default AllocationCharts;
