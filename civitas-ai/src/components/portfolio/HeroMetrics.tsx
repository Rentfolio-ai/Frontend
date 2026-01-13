import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface MetricCardProps {
    label: string;
    value: string;
    change: number;
    trend: 'up' | 'down';
    sparklineData?: number[];
}

const MetricCard: React.FC<MetricCardProps> = ({ label, value, change, trend, sparklineData = [] }) => {
    const isPositive = trend === 'up';

    // Generate simple sparkline path
    const generateSparklinePath = (data: number[]): string => {
        if (data.length === 0) return '';

        const width = 140;
        const height = 40;
        const max = Math.max(...data);
        const min = Math.min(...data);
        const range = max - min || 1;

        const points = data.map((value, index) => {
            const x = (index / (data.length - 1)) * width;
            const y = height - ((value - min) / range) * height;
            return `${x},${y}`;
        });

        return `M ${points.join(' L ')}`;
    };

    return (
        <div
            className="relative p-5 rounded-lg transition-all duration-200"
            style={{
                background: 'var(--color-bg-tertiary)',
                border: '1px solid var(--color-border-default)',
                fontFamily: "'Inter', sans-serif"
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-border-emphasis)';
                e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-border-default)';
                e.currentTarget.style.transform = 'translateY(0)';
            }}
        >
            {/* Label */}
            <div
                className="text-xs uppercase tracking-wider mb-2"
                style={{
                    color: 'var(--color-text-tertiary)',
                    fontWeight: 500,
                    letterSpacing: '0.05em'
                }}
            >
                {label}
            </div>

            {/* Value */}
            <div className="flex items-baseline gap-3 mb-2">
                <span
                    className="text-3xl"
                    style={{
                        color: 'var(--color-text-primary)',
                        fontWeight: 200,
                        lineHeight: 1
                    }}
                >
                    {value}
                </span>

                {/* Trend Indicator */}
                <div
                    className="flex items-center gap-1 text-sm"
                    style={{
                        color: isPositive ? '#10b981' : '#ef4444',
                        fontWeight: 500
                    }}
                >
                    {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                    <span>{Math.abs(change)}%</span>
                </div>
            </div>

            {/* Sparkline */}
            {sparklineData.length > 0 && (
                <svg className="w-full h-10 mt-3" viewBox="0 0 140 40" preserveAspectRatio="none">
                    <defs>
                        <linearGradient id={`gradient-${label}`} x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="var(--color-accent-teal-400)" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="var(--color-accent-teal-400)" stopOpacity="0" />
                        </linearGradient>
                    </defs>

                    {/* Gradient fill */}
                    <path
                        d={`${generateSparklinePath(sparklineData)} L 140,40 L 0,40 Z`}
                        fill={`url(#gradient-${label})`}
                    />

                    {/* Line */}
                    <path
                        d={generateSparklinePath(sparklineData)}
                        fill="none"
                        stroke="var(--color-accent-teal-500)"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            )}
        </div>
    );
};

interface HeroMetricsProps {
    portfolioValue: number;
    monthlyIncome: number;
    roi: number;
    equity: number;
}

export const HeroMetrics: React.FC<HeroMetricsProps> = ({
    portfolioValue,
    monthlyIncome,
    roi,
    equity
}) => {
    // Format currency
    const formatCurrency = (value: number): string => {
        if (value >= 1000000) {
            return `$${(value / 1000000).toFixed(1)}M`;
        }
        if (value >= 1000) {
            return `$${Math.round(value / 1000)}K`;
        }
        return `$${value.toLocaleString()}`;
    };

    // Sample sparkline data (12 months)
    const portfolioSparkline = [2.0, 2.05, 2.1, 2.15, 2.2, 2.25, 2.3, 2.25, 2.3, 2.35, 2.38, 2.4];
    const incomeSparkline = [10.5, 11.0, 11.5, 12.0, 12.8, 12.5, 12.2, 12.3, 12.5, 12.7, 12.6, 12.45];
    const roiSparkline = [6.5, 6.8, 7.0, 7.2, 7.5, 7.8, 8.0, 7.9, 8.1, 8.0, 8.15, 8.2];
    const equitySparkline = [750, 770, 790, 810, 830, 845, 860, 865, 875, 880, 885, 890];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
                label="Total Portfolio Value"
                value={formatCurrency(portfolioValue)}
                change={5.2}
                trend="up"
                sparklineData={portfolioSparkline}
            />

            <MetricCard
                label="Monthly Cash Flow"
                value={formatCurrency(monthlyIncome)}
                change={2.1}
                trend="down"
                sparklineData={incomeSparkline}
            />

            <MetricCard
                label="12-Month ROI"
                value={`${roi.toFixed(1)}%`}
                change={3.1}
                trend="up"
                sparklineData={roiSparkline}
            />

            <MetricCard
                label="Total Equity"
                value={formatCurrency(equity)}
                change={12}
                trend="up"
                sparklineData={equitySparkline}
            />
        </div>
    );
};
