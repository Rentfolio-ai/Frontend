// FILE: src/components/portfolio/PortfolioStatsCards.tsx
/**
 * Portfolio Stats Cards - Key metrics display cards
 * Animated stat cards with trend indicators
 */

import React from 'react';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, Percent, Home, Wallet, Building2 } from 'lucide-react';
import type { PortfolioMetrics } from '../../types/portfolio';
import { formatCurrency, formatPercentage } from '../../utils/portfolioHelpers';

interface PortfolioStatsCardsProps {
    metrics: PortfolioMetrics | null;
    propertyCount?: number;
    loading?: boolean;
}

interface StatCardProps {
    title: string;
    value: string;
    subtitle?: string;
    icon: React.ReactNode;
    trend?: { value: number; label: string } | null;
    positive?: boolean;
    loading?: boolean;
    index: number;
}

const StatCard: React.FC<StatCardProps> = ({
    title,
    value,
    subtitle,
    icon,
    trend,
    positive = true,
    loading = false,
    index,
}) => {
    if (loading) {
        return (
            <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4 animate-pulse">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/10 rounded-lg" />
                    <div className="flex-1">
                        <div className="h-3 w-20 bg-white/10 rounded mb-2" />
                        <div className="h-6 w-28 bg-white/10 rounded" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm rounded-xl border border-white/10 p-4 hover:border-teal-500/30 transition-all group"
        >
            <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-teal-500/20 text-teal-400 group-hover:bg-teal-500/30 transition-colors">
                    {icon}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-400 mb-0.5">{title}</p>
                    <p className="text-xl font-semibold text-white truncate">{value}</p>
                    {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
                </div>
                {trend && (
                    <div className={`text-right ${positive ? 'text-green-400' : 'text-red-400'}`}>
                        <div className="flex items-center gap-1 text-sm font-medium">
                            <TrendingUp className={`w-3 h-3 ${!positive && 'rotate-180'}`} />
                            {trend.value > 0 ? '+' : ''}{trend.value}%
                        </div>
                        <span className="text-xs text-slate-500">{trend.label}</span>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export const PortfolioStatsCards: React.FC<PortfolioStatsCardsProps> = ({
    metrics,
    propertyCount,
    loading = false,
}) => {
    const stats = [
        {
            title: 'Total Value',
            value: metrics ? formatCurrency(metrics.total_portfolio_value) : '$0',
            icon: <DollarSign className="w-5 h-5" />,
            trend: null, // Could add YoY comparison
        },
        {
            title: 'Monthly Cash Flow',
            value: metrics ? formatCurrency(metrics.total_monthly_cashflow) : '$0',
            subtitle: metrics ? `${formatCurrency(metrics.total_monthly_cashflow * 12)}/year` : undefined,
            icon: <Wallet className="w-5 h-5" />,
            positive: metrics ? metrics.total_monthly_cashflow >= 0 : true,
        },
        {
            title: 'Avg Cap Rate',
            value: metrics ? formatPercentage(metrics.average_cap_rate) : '0%',
            subtitle: 'Market avg: 6%',
            icon: <Percent className="w-5 h-5" />,
        },
        {
            title: 'Cash on Cash',
            value: metrics ? formatPercentage(metrics.average_cash_on_cash) : '0%',
            icon: <TrendingUp className="w-5 h-5" />,
        },
        {
            title: 'Properties',
            value: propertyCount?.toString() || metrics?.total_properties?.toString() || '0',
            subtitle: 'Active units',
            icon: <Home className="w-5 h-5" />,
        },
        {
            title: 'Total Equity',
            value: metrics ? formatCurrency(metrics.total_equity) : '$0',
            subtitle: metrics?.total_debt ? `Debt: ${formatCurrency(metrics.total_debt)}` : undefined,
            icon: <Building2 className="w-5 h-5" />,
        },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {stats.map((stat, idx) => (
                <StatCard
                    key={stat.title}
                    title={stat.title}
                    value={stat.value}
                    subtitle={stat.subtitle}
                    icon={stat.icon}
                    trend={stat.trend}
                    positive={stat.positive}
                    loading={loading}
                    index={idx}
                />
            ))}
        </div>
    );
};

export default PortfolioStatsCards;
