// FILE: src/components/portfolio/HealthScoreWidget.tsx
/**
 * Health Score Widget - Displays portfolio health grade with breakdown
 * Premium glassmorphism design with animated gauge
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Activity, TrendingUp, MapPin, Layers, Shield, Wallet } from 'lucide-react';
import type { HealthScore, ComponentStatus } from '../../types/portfolio';

interface HealthScoreWidgetProps {
    healthScore: HealthScore | null;
    loading?: boolean;
    onViewDetails?: () => void;
}

const gradeColors: Record<string, { bg: string; text: string; glow: string }> = {
    'A+': { bg: 'from-emerald-500 to-green-400', text: 'text-emerald-400', glow: 'shadow-emerald-500/30' },
    'A': { bg: 'from-emerald-500 to-green-400', text: 'text-emerald-400', glow: 'shadow-emerald-500/30' },
    'A-': { bg: 'from-green-500 to-emerald-400', text: 'text-green-400', glow: 'shadow-green-500/30' },
    'B+': { bg: 'from-teal-500 to-cyan-400', text: 'text-teal-400', glow: 'shadow-teal-500/30' },
    'B': { bg: 'from-cyan-500 to-teal-400', text: 'text-cyan-400', glow: 'shadow-cyan-500/30' },
    'B-': { bg: 'from-blue-500 to-cyan-400', text: 'text-blue-400', glow: 'shadow-blue-500/30' },
    'C+': { bg: 'from-yellow-500 to-amber-400', text: 'text-yellow-400', glow: 'shadow-yellow-500/30' },
    'C': { bg: 'from-amber-500 to-orange-400', text: 'text-amber-400', glow: 'shadow-amber-500/30' },
    'C-': { bg: 'from-orange-500 to-amber-400', text: 'text-orange-400', glow: 'shadow-orange-500/30' },
    'D': { bg: 'from-red-500 to-orange-400', text: 'text-red-400', glow: 'shadow-red-500/30' },
    'F': { bg: 'from-red-600 to-red-500', text: 'text-red-500', glow: 'shadow-red-600/30' },
};

const statusColors: Record<ComponentStatus, string> = {
    excellent: 'text-emerald-400',
    good: 'text-cyan-400',
    warning: 'text-amber-400',
    critical: 'text-red-400',
};

const statusBgColors: Record<ComponentStatus, string> = {
    excellent: 'bg-emerald-500/20',
    good: 'bg-cyan-500/20',
    warning: 'bg-amber-500/20',
    critical: 'bg-red-500/20',
};

const componentIcons: Record<string, React.ReactNode> = {
    'Cash Flow': <Wallet className="w-4 h-4" />,
    'Cap Rate': <TrendingUp className="w-4 h-4" />,
    'Geographic Diversity': <MapPin className="w-4 h-4" />,
    'Strategy Diversity': <Layers className="w-4 h-4" />,
    'DSCR': <Shield className="w-4 h-4" />,
    'Debt-to-Equity': <Activity className="w-4 h-4" />,
};

export const HealthScoreWidget: React.FC<HealthScoreWidgetProps> = ({
    healthScore,
    loading = false,
    onViewDetails,
}) => {
    if (loading) {
        return (
            <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6 animate-pulse">
                <div className="flex items-center gap-4">
                    <div className="w-24 h-24 rounded-full bg-white/10" />
                    <div className="flex-1 space-y-2">
                        <div className="h-4 bg-white/10 rounded w-3/4" />
                        <div className="h-3 bg-white/10 rounded w-1/2" />
                    </div>
                </div>
            </div>
        );
    }

    if (!healthScore) {
        return (
            <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
                <div className="text-center text-slate-400">
                    <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No health score available</p>
                    <p className="text-sm opacity-70">Add properties to see your portfolio health</p>
                </div>
            </div>
        );
    }

    const colors = gradeColors[healthScore.grade] || gradeColors['C'];
    const circumference = 2 * Math.PI * 45;
    const strokeDashoffset = circumference - (healthScore.score / 100) * circumference;

    const breakdownComponents = [
        { key: 'cash_flow', ...healthScore.breakdown.cash_flow },
        { key: 'cap_rate', ...healthScore.breakdown.cap_rate },
        { key: 'geographic_diversity', ...healthScore.breakdown.geographic_diversity },
        { key: 'strategy_diversity', ...healthScore.breakdown.strategy_diversity },
        { key: 'dscr', ...healthScore.breakdown.dscr },
        { key: 'debt_to_equity', ...healthScore.breakdown.debt_to_equity },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm rounded-xl border border-white/10 p-6 shadow-xl ${colors.glow}`}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Activity className="w-5 h-5 text-teal-400" />
                    Portfolio Health
                </h3>
                {onViewDetails && (
                    <button
                        onClick={onViewDetails}
                        className="text-sm text-teal-400 hover:text-teal-300 transition-colors"
                    >
                        View Details
                    </button>
                )}
            </div>

            {/* Main Score */}
            <div className="flex items-center gap-6 mb-6">
                {/* Circular Gauge */}
                <div className="relative w-28 h-28 flex-shrink-0">
                    <svg className="w-full h-full transform -rotate-90">
                        {/* Background circle */}
                        <circle
                            cx="56"
                            cy="56"
                            r="45"
                            fill="none"
                            stroke="rgba(255,255,255,0.1)"
                            strokeWidth="8"
                        />
                        {/* Progress circle */}
                        <motion.circle
                            cx="56"
                            cy="56"
                            r="45"
                            fill="none"
                            stroke="url(#healthGradient)"
                            strokeWidth="8"
                            strokeLinecap="round"
                            initial={{ strokeDashoffset: circumference }}
                            animate={{ strokeDashoffset }}
                            transition={{ duration: 1.5, ease: 'easeOut' }}
                            style={{ strokeDasharray: circumference }}
                        />
                        <defs>
                            <linearGradient id="healthGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#14b8a6" />
                                <stop offset="100%" stopColor="#06b6d4" />
                            </linearGradient>
                        </defs>
                    </svg>
                    {/* Grade in center */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.5, type: 'spring' }}
                            className={`text-3xl font-bold ${colors.text}`}
                        >
                            {healthScore.grade}
                        </motion.span>
                        <span className="text-xs text-slate-400">{healthScore.score.toFixed(0)}/100</span>
                    </div>
                </div>

                {/* Summary */}
                <div className="flex-1">
                    <p className="text-sm text-slate-300 leading-relaxed">{healthScore.summary}</p>
                </div>
            </div>

            {/* Component Breakdown */}
            <div className="grid grid-cols-2 gap-3">
                {breakdownComponents.map((component) => (
                    <motion.div
                        key={component.key}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`flex items-center gap-3 p-3 rounded-lg ${statusBgColors[component.status]}`}
                    >
                        <div className={`${statusColors[component.status]}`}>
                            {componentIcons[component.name] || <Activity className="w-4 h-4" />}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs text-slate-400 truncate">{component.name}</p>
                            <p className={`text-sm font-medium ${statusColors[component.status]}`}>
                                {typeof component.value === 'number'
                                    ? component.value.toFixed(1)
                                    : component.value}
                            </p>
                        </div>
                        <div className="text-right">
                            <span className="text-xs text-slate-500">{component.score.toFixed(0)}%</span>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Action Items */}
            {healthScore.action_items.length > 0 && (
                <div className="mt-4 pt-4 border-t border-white/10">
                    <p className="text-xs text-slate-400 mb-2">Priority Actions</p>
                    <div className="space-y-1">
                        {healthScore.action_items.slice(0, 3).map((action, idx) => (
                            <p key={idx} className="text-sm text-slate-300">
                                {action}
                            </p>
                        ))}
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default HealthScoreWidget;
