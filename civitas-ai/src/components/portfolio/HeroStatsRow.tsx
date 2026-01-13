// FILE: src/components/portfolio/HeroStatsRow.tsx
/**
 * Hero Stats Row - Professional at-a-glance portfolio metrics
 * Based on Stessa/Baselane design patterns with glassmorphism
 */

import React from 'react';
import { motion } from 'framer-motion';
import {
    DollarSign,
    TrendingUp,
    TrendingDown,
    Percent,
    Building2,
    Target,
    AlertCircle,
} from 'lucide-react';
import type { PortfolioWithMetrics, HealthScore } from '../../types/portfolio';

interface HeroStatsRowProps {
    portfolio: PortfolioWithMetrics;
    healthScore?: HealthScore | null;
    loading?: boolean;
    propertyCount?: number;
}

interface StatCardProps {
    label: string;
    value: string | number;
    subValue?: string;
    icon: React.ReactNode;
    trend?: number;
    trendLabel?: string;
    color?: 'default' | 'green' | 'red' | 'amber' | 'teal';
    loading?: boolean;
    index?: number;
}

const colorClasses = {
    default: 'text-white',
    green: 'text-green-400',
    red: 'text-red-400',
    amber: 'text-amber-400',
    teal: 'text-teal-400',
};

const iconBgClasses = {
    default: 'bg-white/10 text-white',
    green: 'bg-green-500/20 text-green-400',
    red: 'bg-red-500/20 text-red-400',
    amber: 'bg-amber-500/20 text-amber-400',
    teal: 'bg-teal-500/20 text-teal-400',
};

const StatCard: React.FC<StatCardProps> = ({
    label,
    value,
    subValue,
    icon,
    trend,
    trendLabel,
    color = 'default',
    loading = false,
    index = 0,
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="relative bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm rounded-xl border border-white/10 p-4 hover:border-white/20 transition-all group"
        >
            {/* Subtle glow on hover */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-teal-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="relative flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">{label}</p>

                    {loading ? (
                        <div className="animate-pulse">
                            <div className="h-7 w-24 bg-white/10 rounded" />
                        </div>
                    ) : (
                        <p className={`text-2xl font-bold ${colorClasses[color]} tracking-tight`}>
                            {value}
                        </p>
                    )}

                    {/* Trend or sub-value */}
                    {trend !== undefined && !loading && (
                        <div className={`flex items-center gap-1 mt-1 text-xs ${trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            <span>{trend >= 0 ? '+' : ''}{trend.toFixed(1)}%</span>
                            {trendLabel && <span className="text-slate-500">{trendLabel}</span>}
                        </div>
                    )}

                    {subValue && !trend && !loading && (
                        <p className="text-xs text-slate-500 mt-1">{subValue}</p>
                    )}
                </div>

                <div className={`p-2 rounded-lg ${iconBgClasses[color]}`}>
                    {icon}
                </div>
            </div>
        </motion.div>
    );
};

// Health Score Mini Widget
const HealthScoreMini: React.FC<{ healthScore: HealthScore | null | undefined; loading?: boolean; index?: number }> = ({
    healthScore,
    loading,
    index = 0,
}) => {
    const gradeColors: Record<string, { bg: string; text: string; glow: string }> = {
        A: { bg: 'bg-green-500/20', text: 'text-green-400', glow: 'shadow-green-500/20' },
        B: { bg: 'bg-teal-500/20', text: 'text-teal-400', glow: 'shadow-teal-500/20' },
        C: { bg: 'bg-amber-500/20', text: 'text-amber-400', glow: 'shadow-amber-500/20' },
        D: { bg: 'bg-orange-500/20', text: 'text-orange-400', glow: 'shadow-orange-500/20' },
        F: { bg: 'bg-red-500/20', text: 'text-red-400', glow: 'shadow-red-500/20' },
    };

    const grade = healthScore?.grade?.charAt(0) || 'B';
    const colors = gradeColors[grade] || gradeColors.C;
    const score = healthScore?.score || 75;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`relative bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm rounded-xl border border-white/10 p-4 hover:border-white/20 transition-all group ${colors.glow} shadow-lg`}
        >
            <div className="relative flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Health Score</p>

                    {loading ? (
                        <div className="animate-pulse">
                            <div className="h-7 w-16 bg-white/10 rounded" />
                        </div>
                    ) : (
                        <div className="flex items-baseline gap-2">
                            <span className={`text-3xl font-bold ${colors.text}`}>
                                {healthScore?.grade || 'B+'}
                            </span>
                            <span className="text-sm text-slate-400">{score}/100</span>
                        </div>
                    )}
                </div>

                {/* Mini gauge */}
                <div className="relative w-12 h-12">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                        <circle
                            cx="18"
                            cy="18"
                            r="15"
                            fill="none"
                            stroke="rgba(255,255,255,0.1)"
                            strokeWidth="3"
                        />
                        <motion.circle
                            cx="18"
                            cy="18"
                            r="15"
                            fill="none"
                            stroke={colors.text.replace('text-', '#').includes('#') ? colors.text : 'currentColor'}
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeDasharray={`${(score / 100) * 94} 94`}
                            initial={{ strokeDasharray: '0 94' }}
                            animate={{ strokeDasharray: `${(score / 100) * 94} 94` }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                            className={colors.text}
                        />
                    </svg>
                </div>
            </div>

            {/* Action items count */}
            {healthScore?.action_items && healthScore.action_items.length > 0 && !loading && (
                <div className="flex items-center gap-1 mt-2 text-xs text-amber-400">
                    <AlertCircle className="w-3 h-3" />
                    <span>{healthScore.action_items.length} action items</span>
                </div>
            )}
        </motion.div>
    );
};

export const HeroStatsRow: React.FC<HeroStatsRowProps> = ({
    portfolio,
    healthScore,
    loading = false,
    propertyCount: propCount = 0,
}) => {
    // Calculate metrics - use any for now since metrics shape varies
    const metrics: any = portfolio.metrics || {};
    const totalValue = portfolio.total_value || 0;
    const monthlyIncome = metrics.total_monthly_rent || 0;
    const monthlyExpenses = metrics.total_monthly_expenses || 0;
    const monthlyCashFlow = monthlyIncome - monthlyExpenses;
    const capRate = metrics.average_cap_rate || 0;
    const cashOnCash = metrics.average_cash_on_cash || 0;
    const propertyCount = propCount || 1; // Avoid division by zero

    // Mock trends (would come from historical data in production)
    const valueTrend = 8.5;
    const cashFlowTrend = 4.2;

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {/* Total Value */}
            <StatCard
                label="Portfolio Value"
                value={`$${(totalValue / 1000000).toFixed(2)}M`}
                icon={<DollarSign className="w-4 h-4" />}
                trend={valueTrend}
                trendLabel="YoY"
                color="default"
                loading={loading}
                index={0}
            />

            {/* Monthly Cash Flow */}
            <StatCard
                label="Monthly Cash Flow"
                value={`${monthlyCashFlow >= 0 ? '+' : ''}$${Math.abs(monthlyCashFlow).toLocaleString()}`}
                icon={<TrendingUp className="w-4 h-4" />}
                trend={cashFlowTrend}
                trendLabel="MoM"
                color={monthlyCashFlow >= 0 ? 'green' : 'red'}
                loading={loading}
                index={1}
            />

            {/* Average Cap Rate */}
            <StatCard
                label="Avg Cap Rate"
                value={`${(capRate * 100).toFixed(1)}%`}
                icon={<Percent className="w-4 h-4" />}
                subValue="vs 6.2% market"
                color={capRate >= 0.06 ? 'teal' : 'amber'}
                loading={loading}
                index={2}
            />

            {/* Cash on Cash */}
            <StatCard
                label="Cash on Cash"
                value={`${(cashOnCash * 100).toFixed(1)}%`}
                icon={<Target className="w-4 h-4" />}
                subValue="annual return"
                color={cashOnCash >= 0.08 ? 'green' : 'default'}
                loading={loading}
                index={3}
            />

            {/* Properties */}
            <StatCard
                label="Properties"
                value={propertyCount}
                icon={<Building2 className="w-4 h-4" />}
                subValue={`$${(totalValue / propertyCount / 1000).toFixed(0)}K avg`}
                color="default"
                loading={loading}
                index={4}
            />

            {/* Health Score */}
            <HealthScoreMini
                healthScore={healthScore}
                loading={loading}
                index={5}
            />
        </div>
    );
};

export default HeroStatsRow;
