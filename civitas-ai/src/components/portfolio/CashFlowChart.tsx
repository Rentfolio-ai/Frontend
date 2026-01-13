// FILE: src/components/portfolio/CashFlowChart.tsx
/**
 * Net Cash Flow Chart - Time-series visualization of income vs expenses
 * The #1 most important chart in professional portfolio apps (Stessa, Baselane)
 */

import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

interface MonthlyData {
    month: string;
    income: number;
    expenses: number;
    cashFlow: number;
    budget?: number;
}

interface CashFlowChartProps {
    data: MonthlyData[];
    loading?: boolean;
    showBudget?: boolean;
    height?: number;
}

// Generate mock data for demo
const generateMockData = (): MonthlyData[] => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map((month) => {
        const baseIncome = 8000 + Math.random() * 2000;
        const baseExpenses = 4000 + Math.random() * 1500;
        return {
            month,
            income: Math.round(baseIncome),
            expenses: Math.round(baseExpenses),
            cashFlow: Math.round(baseIncome - baseExpenses),
            budget: Math.round(3500 + Math.random() * 500),
        };
    });
};

export const CashFlowChart: React.FC<CashFlowChartProps> = ({
    data = generateMockData(),
    loading = false,
    showBudget = true,
    height = 280,
}) => {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [view, setView] = useState<'cashflow' | 'breakdown'>('cashflow');

    // Calculate chart dimensions and scales
    const chartData = useMemo(() => {
        if (!data.length) return null;

        const maxValue = Math.max(
            ...data.map(d => Math.max(d.income, d.expenses, Math.abs(d.cashFlow), d.budget || 0))
        );
        const minValue = Math.min(...data.map(d => d.cashFlow));
        const range = maxValue - Math.min(0, minValue);

        const chartHeight = height - 60; // Leave room for labels

        return {
            data,
            maxValue,
            minValue,
            range,
            chartHeight,
            zeroLine: minValue < 0 ? (maxValue / range) * 100 : 100,
        };
    }, [data, height]);

    // Summary stats
    const summary = useMemo(() => {
        if (!data.length) return null;

        const totalIncome = data.reduce((sum, d) => sum + d.income, 0);
        const totalExpenses = data.reduce((sum, d) => sum + d.expenses, 0);
        const totalCashFlow = data.reduce((sum, d) => sum + d.cashFlow, 0);
        const avgCashFlow = totalCashFlow / data.length;

        // Calculate trend (last 3 months vs previous 3)
        const recent = data.slice(-3).reduce((s, d) => s + d.cashFlow, 0) / 3;
        const previous = data.slice(-6, -3).reduce((s, d) => s + d.cashFlow, 0) / 3;
        const trend = previous > 0 ? ((recent - previous) / previous) * 100 : 0;

        return { totalIncome, totalExpenses, totalCashFlow, avgCashFlow, trend };
    }, [data]);

    if (loading) {
        return (
            <div
                className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm rounded-xl border border-white/10 p-6"
                style={{ height: height + 120 }}
            >
                <div className="animate-pulse">
                    <div className="h-4 w-48 bg-white/10 rounded mb-6" />
                    <div className="h-64 bg-white/5 rounded-lg" />
                </div>
            </div>
        );
    }

    if (!chartData || !summary) {
        return (
            <div className="bg-white/5 rounded-xl border border-white/10 p-6 text-center text-slate-400">
                <DollarSign className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No cash flow data available</p>
            </div>
        );
    }

    const hoveredData = hoveredIndex !== null ? data[hoveredIndex] : null;

    return (
        <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm rounded-xl border border-white/10 p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-teal-500/20 text-teal-400">
                        <DollarSign className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-white">Net Cash Flow</h3>
                        <p className="text-xs text-slate-400">Monthly income vs expenses</p>
                    </div>
                </div>

                {/* View Toggle */}
                <div className="flex items-center gap-2 bg-white/5 rounded-lg p-1">
                    <button
                        onClick={() => setView('cashflow')}
                        className={`px-3 py-1 text-xs rounded-md transition-all ${view === 'cashflow'
                            ? 'bg-teal-500/20 text-teal-400'
                            : 'text-slate-400 hover:text-white'
                            }`}
                    >
                        Cash Flow
                    </button>
                    <button
                        onClick={() => setView('breakdown')}
                        className={`px-3 py-1 text-xs rounded-md transition-all ${view === 'breakdown'
                            ? 'bg-teal-500/20 text-teal-400'
                            : 'text-slate-400 hover:text-white'
                            }`}
                    >
                        Breakdown
                    </button>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-xs text-slate-400 mb-1">Total Income</p>
                    <p className="text-lg font-semibold text-green-400">
                        ${summary.totalIncome.toLocaleString()}
                    </p>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-xs text-slate-400 mb-1">Total Expenses</p>
                    <p className="text-lg font-semibold text-red-400">
                        ${summary.totalExpenses.toLocaleString()}
                    </p>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-xs text-slate-400 mb-1">Net Cash Flow</p>
                    <p className={`text-lg font-semibold ${summary.totalCashFlow >= 0 ? 'text-teal-400' : 'text-red-400'}`}>
                        ${summary.totalCashFlow.toLocaleString()}
                    </p>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-xs text-slate-400 mb-1">Trend</p>
                    <div className="flex items-center gap-1">
                        {summary.trend >= 0 ? (
                            <TrendingUp className="w-4 h-4 text-green-400" />
                        ) : (
                            <TrendingDown className="w-4 h-4 text-red-400" />
                        )}
                        <span className={`text-lg font-semibold ${summary.trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {summary.trend >= 0 ? '+' : ''}{summary.trend.toFixed(1)}%
                        </span>
                    </div>
                </div>
            </div>

            {/* Chart */}
            <div className="relative" style={{ height }}>
                {/* Hover tooltip */}
                {hoveredData && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute top-0 left-1/2 -translate-x-1/2 z-10 bg-slate-800 border border-white/20 rounded-lg p-3 shadow-xl pointer-events-none"
                    >
                        <p className="text-white font-medium mb-2">{hoveredData.month}</p>
                        <div className="space-y-1 text-sm">
                            <div className="flex items-center justify-between gap-4">
                                <span className="text-green-400">Income:</span>
                                <span className="text-white">${hoveredData.income.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                                <span className="text-red-400">Expenses:</span>
                                <span className="text-white">${hoveredData.expenses.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center justify-between gap-4 border-t border-white/10 pt-1 mt-1">
                                <span className="text-teal-400">Net:</span>
                                <span className={`font-medium ${hoveredData.cashFlow >= 0 ? 'text-teal-400' : 'text-red-400'}`}>
                                    ${hoveredData.cashFlow.toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* SVG Chart */}
                <svg
                    className="w-full h-full"
                    viewBox={`0 0 800 ${height}`}
                    preserveAspectRatio="none"
                >
                    {/* Gradient definitions */}
                    <defs>
                        <linearGradient id="incomeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="rgba(34, 197, 94, 0.3)" />
                            <stop offset="100%" stopColor="rgba(34, 197, 94, 0)" />
                        </linearGradient>
                        <linearGradient id="cashFlowGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="rgba(20, 184, 166, 0.4)" />
                            <stop offset="100%" stopColor="rgba(20, 184, 166, 0)" />
                        </linearGradient>
                    </defs>

                    {/* Grid lines */}
                    {[0, 25, 50, 75, 100].map((pct) => (
                        <line
                            key={pct}
                            x1="40"
                            y1={height * (pct / 100)}
                            x2="780"
                            y2={height * (pct / 100)}
                            stroke="rgba(255,255,255,0.05)"
                            strokeDasharray="4 4"
                        />
                    ))}

                    {view === 'cashflow' ? (
                        <>
                            {/* Cash flow area */}
                            <motion.path
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                d={`
                  M 60 ${height - (data[0].cashFlow / chartData.maxValue) * (height - 40) - 20}
                  ${data.map((d, i) => {
                                    const x = 60 + (i * (720 / (data.length - 1)));
                                    const y = height - (d.cashFlow / chartData.maxValue) * (height - 40) - 20;
                                    return `L ${x} ${y}`;
                                }).join(' ')}
                  L 780 ${height - 20}
                  L 60 ${height - 20}
                  Z
                `}
                                fill="url(#cashFlowGradient)"
                            />

                            {/* Cash flow line */}
                            <motion.path
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ pathLength: 1, opacity: 1 }}
                                transition={{ duration: 1.5, ease: 'easeOut' }}
                                d={`
                  M 60 ${height - (data[0].cashFlow / chartData.maxValue) * (height - 40) - 20}
                  ${data.map((d, i) => {
                                    const x = 60 + (i * (720 / (data.length - 1)));
                                    const y = height - (d.cashFlow / chartData.maxValue) * (height - 40) - 20;
                                    return `L ${x} ${y}`;
                                }).join(' ')}
                `}
                                fill="none"
                                stroke="#14b8a6"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />

                            {/* Budget line (dotted) */}
                            {showBudget && (
                                <motion.path
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 0.6 }}
                                    d={`
                    M 60 ${height - ((data[0].budget || 0) / chartData.maxValue) * (height - 40) - 20}
                    ${data.map((d, i) => {
                                        const x = 60 + (i * (720 / (data.length - 1)));
                                        const y = height - ((d.budget || 0) / chartData.maxValue) * (height - 40) - 20;
                                        return `L ${x} ${y}`;
                                    }).join(' ')}
                  `}
                                    fill="none"
                                    stroke="#f59e0b"
                                    strokeWidth="2"
                                    strokeDasharray="8 4"
                                    strokeLinecap="round"
                                />
                            )}

                            {/* Data points */}
                            {data.map((d, i) => {
                                const x = 60 + (i * (720 / (data.length - 1)));
                                const y = height - (d.cashFlow / chartData.maxValue) * (height - 40) - 20;
                                return (
                                    <g key={i}>
                                        <circle
                                            cx={x}
                                            cy={y}
                                            r={hoveredIndex === i ? 8 : 5}
                                            fill="#14b8a6"
                                            stroke="#0f1419"
                                            strokeWidth="2"
                                            className="cursor-pointer transition-all"
                                            onMouseEnter={() => setHoveredIndex(i)}
                                            onMouseLeave={() => setHoveredIndex(null)}
                                        />
                                    </g>
                                );
                            })}
                        </>
                    ) : (
                        /* Breakdown view - stacked bars */
                        <>
                            {data.map((d, i) => {
                                const x = 60 + (i * (720 / data.length)) + 10;
                                const barWidth = (720 / data.length) - 20;
                                const incomeHeight = (d.income / chartData.maxValue) * (height - 40);
                                const expenseHeight = (d.expenses / chartData.maxValue) * (height - 40);

                                return (
                                    <g
                                        key={i}
                                        onMouseEnter={() => setHoveredIndex(i)}
                                        onMouseLeave={() => setHoveredIndex(null)}
                                        className="cursor-pointer"
                                    >
                                        {/* Income bar */}
                                        <motion.rect
                                            initial={{ height: 0, y: height - 20 }}
                                            animate={{ height: incomeHeight, y: height - incomeHeight - 20 }}
                                            transition={{ delay: i * 0.05, duration: 0.5 }}
                                            x={x}
                                            width={barWidth / 2 - 2}
                                            fill="rgba(34, 197, 94, 0.7)"
                                            rx="4"
                                        />
                                        {/* Expense bar */}
                                        <motion.rect
                                            initial={{ height: 0, y: height - 20 }}
                                            animate={{ height: expenseHeight, y: height - expenseHeight - 20 }}
                                            transition={{ delay: i * 0.05, duration: 0.5 }}
                                            x={x + barWidth / 2 + 2}
                                            width={barWidth / 2 - 2}
                                            fill="rgba(239, 68, 68, 0.7)"
                                            rx="4"
                                        />
                                    </g>
                                );
                            })}
                        </>
                    )}

                    {/* X-axis labels */}
                    {data.map((d, i) => {
                        const x = 60 + (i * (720 / (data.length - 1)));
                        return (
                            <text
                                key={i}
                                x={x}
                                y={height - 2}
                                textAnchor="middle"
                                fill="#64748b"
                                fontSize="11"
                            >
                                {d.month}
                            </text>
                        );
                    })}
                </svg>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 mt-4 text-xs">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-teal-400" />
                    <span className="text-slate-400">Net Cash Flow</span>
                </div>
                {showBudget && (
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-0.5 bg-amber-400" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #f59e0b 0, #f59e0b 8px, transparent 8px, transparent 12px)' }} />
                        <span className="text-slate-400">Budget</span>
                    </div>
                )}
                {view === 'breakdown' && (
                    <>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded bg-green-500" />
                            <span className="text-slate-400">Income</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded bg-red-500" />
                            <span className="text-slate-400">Expenses</span>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default CashFlowChart;
