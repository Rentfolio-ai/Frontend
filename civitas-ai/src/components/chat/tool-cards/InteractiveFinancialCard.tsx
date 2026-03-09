import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calculator,
    DollarSign,
    Percent,
    TrendingUp,
    TrendingDown,
    ChevronDown,
    ChevronUp,
    Settings,
    RefreshCw
} from 'lucide-react';
import { cn } from '../../../lib/utils';

interface FinancialMetrics {
    monthly_mortgage: number;
    monthly_expenses: number;
    monthly_cash_flow: number;
    annual_noi: number;
    annual_debt_service: number;
    cap_rate: number;
    cash_on_cash_roi: number;
    total_roi: number;
    monthly_property_tax: number;
    monthly_insurance: number;
    monthly_hoa: number;
    monthly_management: number;
    monthly_maintenance: number;
    total_investment: number;
    closing_costs: number;
    renovation_budget: number;
}

interface InteractiveFinancialCardProps {
    initialData: FinancialMetrics;
    initialParams?: {
        price: number;
        down_payment_pct: number;
        interest_rate: number;
        renovation_budget: number;
        estimated_rent?: number;
    };
    onRecalculate?: (params: any) => Promise<FinancialMetrics>;
    compact?: boolean;
}

const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

const formatPercent = (val: number) =>
    `${(val * 100).toFixed(2)}%`;

export const InteractiveFinancialCard: React.FC<InteractiveFinancialCardProps> = ({
    initialData,
    initialParams = {
        price: 0,
        down_payment_pct: 0.20,
        interest_rate: 0.07,
        renovation_budget: 0,
        estimated_rent: 0
    },
    onRecalculate,
    compact = false
}) => {
    const [metrics, setMetrics] = useState<FinancialMetrics>(initialData);
    const [params, setParams] = useState({
        ...initialParams,
        estimated_rent: initialParams.estimated_rent || (initialData as any).input_estimated_rent || 0
    });
    const [isExpanded, setIsExpanded] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleParamChange = (key: string, value: number) => {
        setParams(prev => ({ ...prev, [key]: value }));
    };

    const handleUpdate = async () => {
        if (!onRecalculate) return;
        setIsLoading(true);
        try {
            const newMetrics = await onRecalculate(params);
            setMetrics(newMetrics);
        } catch (err) {
            console.error("Failed to recalculate metrics", err);
        } finally {
            setIsLoading(false);
        }
    };

    const isPositiveCashFlow = metrics.monthly_cash_flow > 0;

    return (
        <div className={cn(
            "w-full font-sans antialiased",
            compact ? "my-2" : "max-w-md mx-auto my-4"
        )}>
            <div className={cn(
                "bg-card overflow-hidden",
                compact ? "border-t border-black/[0.06]" : "border border-black/[0.06] rounded-xl shadow-xl shadow-black/80"
            )}>

                {/* ── Header ── */}
                {!compact && (
                    <div className="px-5 py-4 border-b border-black/[0.06] flex items-center justify-between bg-black/[0.02]">
                        <div className="flex items-center gap-2.5">
                            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                <Calculator className="w-4 h-4" />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-foreground tracking-tight">Financial Analysis</h3>
                                <div className="text-[10px] text-muted-foreground/70 font-medium tracking-wide uppercase">
                                    Projected Returns
                                </div>
                            </div>
                        </div>
                        {/* Estimated Value Badge (Optional) */}
                        {params.price > 0 && (
                            <div className="px-2.5 py-1 rounded-md bg-black/[0.03] border border-black/[0.04] text-[11px] font-mono text-muted-foreground">
                                {formatCurrency(params.price)}
                            </div>
                        )}
                    </div>
                )}

                {/* ── KPI Grid ── */}
                <div className="grid grid-cols-2 gap-px bg-black/[0.05]">
                    {/* Cash Flow */}
                    <div className={cn("bg-card hover:bg-black/[0.01] transition-colors relative group", compact ? "p-3" : "p-4")}>
                        <div className="text-[9px] uppercase tracking-wider text-muted-foreground/50 font-semibold mb-1">Monthly Cash Flow</div>
                        <div className={cn("font-bold tracking-tight flex items-center gap-1.5",
                            compact ? "text-lg" : "text-xl",
                            isPositiveCashFlow ? 'text-emerald-400' : 'text-rose-400'
                        )}>
                            {isPositiveCashFlow ? <TrendingUp className="w-3.5 h-3.5 opacity-75" /> : <TrendingDown className="w-3.5 h-3.5 opacity-75" />}
                            {formatCurrency(metrics.monthly_cash_flow)}
                        </div>
                    </div>

                    {/* Cash on Cash */}
                    <div className={cn("bg-card hover:bg-black/[0.01] transition-colors", compact ? "p-3" : "p-4")}>
                        <div className="text-[9px] uppercase tracking-wider text-muted-foreground/50 font-semibold mb-1">Cash on Cash</div>
                        <div className={cn("font-bold text-foreground tracking-tight", compact ? "text-lg" : "text-xl")}>
                            {formatPercent(metrics.cash_on_cash_roi)}
                        </div>
                    </div>

                    {/* Cap Rate */}
                    <div className={cn("bg-card hover:bg-black/[0.01] transition-colors", compact ? "p-3" : "p-4")}>
                        <div className="text-[9px] uppercase tracking-wider text-muted-foreground/50 font-semibold mb-1">Cap Rate</div>
                        <div className={cn("font-bold text-blue-400/90 tracking-tight", compact ? "text-lg" : "text-xl")}>
                            {formatPercent(metrics.cap_rate)}
                        </div>
                    </div>

                    {/* Total Cash Needed */}
                    <div className={cn("bg-card hover:bg-black/[0.01] transition-colors", compact ? "p-3" : "p-4")}>
                        <div className="text-[9px] uppercase tracking-wider text-muted-foreground/50 font-semibold mb-1">Total Cash Needed</div>
                        <div className={cn("font-bold text-amber-400/90 tracking-tight", compact ? "text-lg" : "text-xl")}>
                            {formatCurrency(metrics.total_investment)}
                        </div>
                    </div>
                </div>

                {/* ── Assumptions Toggle ── */}
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="w-full flex items-center justify-between px-5 py-3 text-[11px] font-medium text-muted-foreground/70 hover:text-muted-foreground hover:bg-black/[0.02] transition-colors border-t border-black/[0.06]"
                >
                    <span className="flex items-center gap-2">
                        <Settings className="w-3 h-3" />
                        Edit Assumptions
                    </span>
                    {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>

                {/* ── Expandable Editor ── */}
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="bg-black/20 border-t border-black/[0.06] overflow-hidden"
                        >
                            <div className={cn("space-y-4", compact ? "p-4" : "p-5")}>
                                {/* Purchase Price */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] uppercase tracking-wide text-muted-foreground/50 font-semibold">Purchase Price</label>
                                    <div className="relative group">
                                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/40 group-focus-within:text-indigo-400 transition-colors" />
                                        <input
                                            type="number"
                                            value={params.price}
                                            onChange={(e) => handleParamChange('price', parseFloat(e.target.value) || 0)}
                                            className="w-full bg-black/[0.02] border border-black/[0.08] rounded-lg py-1.5 pl-9 pr-3 text-xs text-foreground focus:outline-none focus:border-indigo-500/50 focus:bg-black/[0.04] transition-all font-mono"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    {/* Down Payment */}
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] uppercase tracking-wide text-muted-foreground/50 font-semibold">Down Payment %</label>
                                        <div className="relative group">
                                            <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/40 group-focus-within:text-indigo-400 transition-colors" />
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={params.down_payment_pct * 100}
                                                onChange={(e) => handleParamChange('down_payment_pct', (parseFloat(e.target.value) || 0) / 100)}
                                                className="w-full bg-black/[0.02] border border-black/[0.08] rounded-lg py-1.5 pl-9 pr-3 text-xs text-foreground focus:outline-none focus:border-indigo-500/50 focus:bg-black/[0.04] transition-all font-mono"
                                            />
                                        </div>
                                    </div>

                                    {/* Interest Rate */}
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] uppercase tracking-wide text-muted-foreground/50 font-semibold">Interest Rate %</label>
                                        <div className="relative group">
                                            <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/40 group-focus-within:text-indigo-400 transition-colors" />
                                            <input
                                                type="number"
                                                step="0.1"
                                                value={params.interest_rate * 100}
                                                onChange={(e) => handleParamChange('interest_rate', (parseFloat(e.target.value) || 0) / 100)}
                                                className="w-full bg-black/[0.02] border border-black/[0.08] rounded-lg py-1.5 pl-9 pr-3 text-xs text-foreground focus:outline-none focus:border-indigo-500/50 focus:bg-black/[0.04] transition-all font-mono"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    {/* Renovation Budget */}
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] uppercase tracking-wide text-muted-foreground/50 font-semibold">Renovation</label>
                                        <div className="relative group">
                                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/40 group-focus-within:text-indigo-400 transition-colors" />
                                            <input
                                                type="number"
                                                value={params.renovation_budget}
                                                onChange={(e) => handleParamChange('renovation_budget', parseFloat(e.target.value) || 0)}
                                                className="w-full bg-black/[0.02] border border-black/[0.08] rounded-lg py-1.5 pl-9 pr-3 text-xs text-foreground focus:outline-none focus:border-indigo-500/50 focus:bg-black/[0.04] transition-all font-mono"
                                            />
                                        </div>
                                    </div>

                                    {/* Estimated Rent */}
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] uppercase tracking-wide text-muted-foreground/50 font-semibold">Est. Rent</label>
                                        <div className="relative group">
                                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/40 group-focus-within:text-indigo-400 transition-colors" />
                                            <input
                                                type="number"
                                                value={params.estimated_rent}
                                                onChange={(e) => handleParamChange('estimated_rent', parseFloat(e.target.value) || 0)}
                                                className="w-full bg-black/[0.02] border border-black/[0.08] rounded-lg py-1.5 pl-9 pr-3 text-xs text-foreground focus:outline-none focus:border-indigo-500/50 focus:bg-black/[0.04] transition-all font-mono"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Update Button */}
                                <button
                                    onClick={handleUpdate}
                                    disabled={isLoading}
                                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 hover:text-indigo-300 border border-indigo-500/20 hover:border-indigo-500/30 transition-all text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                                    {isLoading ? 'Updating...' : 'Update Analysis'}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};
