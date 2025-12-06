import React from 'react';
import {
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    MapPin,
    DollarSign,
    Activity,
    CheckCircle2,
    Info
} from 'lucide-react';
import { cn } from '../../lib/utils';
import type { AIInsights } from '../../types/pnl';

interface AIInsightsPanelProps {
    insights: AIInsights;
    className?: string;
}

export const AIInsightsPanel: React.FC<AIInsightsPanelProps> = ({ insights, className }) => {
    if (!insights) return null;

    return (
        <div className={cn("space-y-6", className)}>

            {/* 1. Property Summary */}
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-5 border border-slate-200 dark:border-slate-800">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2">
                    <Info className="w-4 h-4 text-blue-500" />
                    Property Summary
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {insights.propertySummary}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* 2. STR vs LTR Comparison */}
                <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-indigo-500" />
                        STR vs LTR
                    </h3>
                    <div className="flex items-center gap-3 mb-3">
                        <span className={cn(
                            "text-xs font-bold px-2 py-1 rounded-md uppercase",
                            insights.strVsLtr.advantage === 'STR' ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300" :
                                insights.strVsLtr.advantage === 'LTR' ? "bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-300" :
                                    "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        )}>
                            {insights.strVsLtr.advantage} Advantage
                        </span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        {insights.strVsLtr.text}
                    </p>
                </div>

                {/* 3. Neighborhood Demand */}
                <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex justify-between items-start mb-3">
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-emerald-500" />
                            Neighborhood Demand
                        </h3>
                        <div className="flex flex-col items-end">
                            <span className={cn(
                                "text-2xl font-bold",
                                insights.neighborhoodDemand.score >= 80 ? "text-emerald-500" :
                                    insights.neighborhoodDemand.score >= 60 ? "text-amber-500" : "text-rose-500"
                            )}>
                                {insights.neighborhoodDemand.score}
                            </span>
                            <span className="text-[10px] text-slate-400 uppercase tracking-wider">Demand Score</span>
                        </div>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                        {insights.neighborhoodDemand.summary}
                    </p>
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                        <span>Trend:</span>
                        <span className={cn(
                            "flex items-center gap-1",
                            insights.neighborhoodDemand.trend === 'Up' ? "text-emerald-500" :
                                insights.neighborhoodDemand.trend === 'Down' ? "text-rose-500" : "text-slate-500"
                        )}>
                            {insights.neighborhoodDemand.trend === 'Up' && <TrendingUp className="w-3 h-3" />}
                            {insights.neighborhoodDemand.trend === 'Down' && <TrendingDown className="w-3 h-3" />}
                            {insights.neighborhoodDemand.trend}
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* 4. Risk Factors */}
                <div className="bg-rose-50/50 dark:bg-rose-900/10 rounded-xl p-5 border border-rose-100 dark:border-rose-900/30">
                    <h3 className="text-sm font-semibold text-rose-700 dark:text-rose-300 mb-3 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        Risk Factors
                    </h3>
                    <ul className="space-y-2">
                        {insights.riskFactors.map((risk, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-rose-600 dark:text-rose-400/90">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-rose-400 flex-shrink-0" />
                                {risk}
                            </li>
                        ))}
                        {insights.riskFactors.length === 0 && (
                            <li className="text-sm text-slate-400 italic">No significant risks identified.</li>
                        )}
                    </ul>
                </div>

                {/* 5. Expense Red Flags */}
                <div className="bg-slate-50 dark:bg-slate-900/30 rounded-xl p-5 border border-slate-200 dark:border-slate-800">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-amber-500" />
                        Expense Analysis
                    </h3>
                    {insights.expenseRedFlags.length > 0 ? (
                        <div className="space-y-3">
                            <div className="text-xs font-medium text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1">Red Flags Detected</div>
                            <ul className="space-y-2">
                                {insights.expenseRedFlags.map((flag, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
                                        {flag}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>No expense anomalies detected.</span>
                        </div>
                    )}
                </div>
            </div>

            {/* 6. Cash Flow Sensitivity */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-purple-500" />
                    Cash Flow Sensitivity
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    {insights.cashFlowSensitivity.summary}
                </p>
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                        <div className="text-xs text-slate-500 mb-1">Low Occupancy (-15%)</div>
                        <div className={cn(
                            "text-sm font-bold",
                            insights.cashFlowSensitivity.lowOccupancyCashflow > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                        )}>
                            ${insights.cashFlowSensitivity.lowOccupancyCashflow.toLocaleString()} /mo
                        </div>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                        <div className="text-xs text-slate-500 mb-1">High Rates (+2%)</div>
                        <div className={cn(
                            "text-sm font-bold",
                            insights.cashFlowSensitivity.highRateCashflow > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                        )}>
                            ${insights.cashFlowSensitivity.highRateCashflow.toLocaleString()} /mo
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};
