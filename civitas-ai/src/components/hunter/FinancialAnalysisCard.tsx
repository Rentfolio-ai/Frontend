import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    TrendingUp, TrendingDown, Download,
    Settings, ChevronDown, ChevronUp
} from 'lucide-react';
import { useCalculatePnLMutation } from '../../graphql/generated';

/* ─────────────────── types ─────────────────── */

interface Year1Data {
    gross_income: number;
    total_expenses: number;
    noi: number;
    debt_service: number;
    cashflow_before_taxes: number;
    monthly_cashflow: number;
    cap_rate: number;
    cash_on_cash_return: number;
}

interface FinancingSummary {
    total_cash_invested: number;
    down_payment: number;
    closing_costs: number;
    monthly_payment: number;
    loan_amount?: number;
    interest_rate?: number;
    loan_term_years?: number;
}

interface ProjectionYear {
    year: number;
    cashflow: number;
    equity: number;
    property_value: number;
}

interface FinancialAnalysisData {
    address: string;
    strategy: 'STR' | 'LTR' | 'Flip' | 'ADU' | 'MF';
    summary: string;
    year1: Year1Data;
    financing_summary: FinancingSummary;
    filters_applied?: string[];
    projection?: ProjectionYear[];
}

interface FinancialAnalysisCardProps {
    data: FinancialAnalysisData;
    onAction?: (query: string) => void;
}

/* ─────────────────── helpers ─────────────────── */

const fmt = (n: number) => `$${Math.abs(Math.round(n)).toLocaleString()}`;
const pct = (n: number) => `${(n * 100).toFixed(1)}%`;

/* Stat row — clean label/value pair */
const StatRow: React.FC<{
    label: string;
    value: string;
    accent?: string;
    bold?: boolean;
}> = ({ label, value, accent, bold }) => (
    <div className="flex items-center justify-between py-1.5">
        <span className="text-[12px] text-muted-foreground/50">{label}</span>
        <span className={`text-[12px] font-${bold ? 'bold' : 'semibold'} ${accent || 'text-muted-foreground'}`}>
            {value}
        </span>
    </div>
);

/* ─────────────────── main component ─────────────────── */

export const FinancialAnalysisCard: React.FC<FinancialAnalysisCardProps> = ({ data: initialData, onAction }) => {
    const [data, setData] = useState<FinancialAnalysisData>(initialData);
    const [showBreakdown, setShowBreakdown] = useState(false);
    const [calculatePnL, { loading: isRecalculating }] = useCalculatePnLMutation();

    const { year1, financing_summary } = data;
    const isPositive = year1.monthly_cashflow > 0;

    const handleRecalculate = async () => {
        const newStrategy = data.strategy === 'LTR' ? 'STR' : 'LTR';
        try {
            const result = await calculatePnL({
                variables: { address: data.address, strategy: newStrategy, downPaymentPct: 20 }
            });
            if (result.data?.calculatePnl) {
                const g = result.data.calculatePnl;
                setData({
                    ...data,
                    strategy: g.strategy as any,
                    summary: `Updated for ${g.strategy}`,
                    filters_applied: ['GraphQL Live Update'],
                    year1: {
                        gross_income: g.grossIncome, total_expenses: g.totalExpenses,
                        noi: g.noi, debt_service: (g.mortgagePayment || 0) * 12,
                        cashflow_before_taxes: g.annualCashflow, monthly_cashflow: g.monthlyCashflow,
                        cap_rate: g.capRate, cash_on_cash_return: g.cashOnCash
                    },
                    financing_summary: {
                        ...data.financing_summary,
                        total_cash_invested: g.totalInvestment,
                        monthly_payment: g.mortgagePayment
                    }
                });
            }
        } catch (e) {
            console.error("GraphQL Error:", e);
            onAction?.(`Recalculate P&L for ${data.address} with different assumptions`);
        }
    };

    const exportToCSV = () => {
        const rows = [
            ['Metric', 'Value'],
            ['Address', data.address], ['Strategy', data.strategy],
            ['Monthly Cashflow', fmt(year1.monthly_cashflow)],
            ['Cap Rate', pct(year1.cap_rate)],
            ['Cash-on-Cash', pct(year1.cash_on_cash_return)],
            ['Gross Income', fmt(year1.gross_income)],
            ['Total Expenses', fmt(year1.total_expenses)],
            ['NOI', fmt(year1.noi)],
            ['Total Investment', fmt(financing_summary.total_cash_invested)],
        ];
        const csv = rows.map(r => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `pnl_${data.address.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
    };

    return (
        <div className="space-y-5">
            {/* Strategy + source tag */}
            <div className="flex items-center gap-3">
                <span className="text-[10px] uppercase tracking-[0.12em] font-semibold px-2.5 py-1 rounded-md text-[#D4A27F]/80"
                    style={{ background: 'rgba(192,139,92,0.08)' }}>
                    {data.strategy}
                </span>
                {data.summary && (
                    <span className="text-[10px] text-muted-foreground/40 font-medium">{data.summary}</span>
                )}
            </div>

            {/* ── Hero KPIs: 2×2 grid ── */}
            <div className="grid grid-cols-2 gap-px rounded-xl overflow-hidden" style={{ background: 'rgba(0,0,0,0.03)' }}>
                {/* Monthly Cashflow */}
                <div className="p-4" style={{ background: 'hsl(var(--card))' }}>
                    <div className="text-[9px] uppercase tracking-[0.1em] text-muted-foreground/40 font-semibold mb-2">Monthly Cashflow</div>
                    <div className={`text-xl font-bold tracking-tight flex items-center gap-1.5 ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isPositive
                            ? <TrendingUp className="w-4 h-4 opacity-60" />
                            : <TrendingDown className="w-4 h-4 opacity-60" />
                        }
                        {isPositive ? '+' : ''}{fmt(year1.monthly_cashflow)}
                    </div>
                </div>

                {/* Cap Rate */}
                <div className="p-4" style={{ background: 'hsl(var(--card))' }}>
                    <div className="text-[9px] uppercase tracking-[0.1em] text-muted-foreground/40 font-semibold mb-2">Cap Rate</div>
                    <div className="text-xl font-bold text-foreground/70 tracking-tight">
                        {pct(year1.cap_rate)}
                    </div>
                </div>

                {/* Cash-on-Cash */}
                <div className="p-4" style={{ background: 'hsl(var(--card))' }}>
                    <div className="text-[9px] uppercase tracking-[0.1em] text-muted-foreground/40 font-semibold mb-2">Cash-on-Cash</div>
                    <div className="text-xl font-bold text-foreground/70 tracking-tight">
                        {pct(year1.cash_on_cash_return)}
                    </div>
                </div>

                {/* Total Investment */}
                <div className="p-4" style={{ background: 'hsl(var(--card))' }}>
                    <div className="text-[9px] uppercase tracking-[0.1em] text-muted-foreground/40 font-semibold mb-2">Investment</div>
                    <div className="text-xl font-bold text-[#D4A27F]/80 tracking-tight">
                        {fmt(financing_summary.total_cash_invested)}
                    </div>
                </div>
            </div>

            {/* ── Detailed Breakdown ── */}
            <button
                onClick={() => setShowBreakdown(!showBreakdown)}
                className="w-full flex items-center justify-between py-2 text-[11px] font-medium text-muted-foreground/50 hover:text-muted-foreground/70 transition-colors"
            >
                <span>Detailed Breakdown</span>
                {showBreakdown
                    ? <ChevronUp className="w-3.5 h-3.5" />
                    : <ChevronDown className="w-3.5 h-3.5" />
                }
            </button>

            <AnimatePresence>
                {showBreakdown && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden space-y-4"
                    >
                        {/* Income & Expenses */}
                        <div className="rounded-xl px-4 py-3" style={{ background: 'rgba(255,255,255,0.015)' }}>
                            <StatRow label="Gross Income" value={fmt(year1.gross_income)} accent="text-emerald-400/70" />
                            <div className="h-px my-1" style={{ background: 'rgba(0,0,0,0.03)' }} />
                            <StatRow label="Operating Expenses" value={`-${fmt(year1.total_expenses)}`} accent="text-rose-400/60" />
                            {year1.debt_service > 0 && (
                                <>
                                    <div className="h-px my-1" style={{ background: 'rgba(0,0,0,0.03)' }} />
                                    <StatRow label="Debt Service" value={`-${fmt(year1.debt_service)}`} accent="text-rose-400/60" />
                                </>
                            )}
                            <div className="h-px my-1" style={{ background: 'rgba(192,139,92,0.12)' }} />
                            <StatRow label="Net Operating Income" value={fmt(year1.noi)} accent="text-[#D4A27F]" bold />
                        </div>

                        {/* Financing */}
                        {financing_summary.loan_amount != null && financing_summary.loan_amount > 0 && (
                            <div className="rounded-xl px-4 py-3" style={{ background: 'rgba(255,255,255,0.015)' }}>
                                <div className="text-[9px] uppercase tracking-[0.1em] text-muted-foreground/40 font-semibold mb-2">Financing</div>
                                <StatRow label="Down Payment" value={fmt(financing_summary.down_payment)} />
                                <StatRow label="Loan Amount" value={fmt(financing_summary.loan_amount)} />
                                <StatRow label="Interest Rate" value={`${((financing_summary.interest_rate || 0) * 100).toFixed(2)}%`} />
                                <StatRow label="Monthly Payment" value={fmt(financing_summary.monthly_payment)} />
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Actions ── */}
            <div className="flex gap-2 pt-1">
                <button
                    onClick={handleRecalculate}
                    disabled={isRecalculating}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-[11px] font-semibold
                               text-muted-foreground/60 hover:text-foreground/55 transition-all disabled:opacity-30"
                    style={{ background: 'rgba(0,0,0,0.03)' }}
                >
                    <Settings className={`w-3 h-3 ${isRecalculating ? 'animate-spin' : ''}`} />
                    {isRecalculating ? 'Updating...' : `Try ${data.strategy === 'LTR' ? 'STR' : 'LTR'}`}
                </button>
                <button
                    onClick={exportToCSV}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-[11px] font-semibold
                               text-muted-foreground/60 hover:text-foreground/55 transition-all"
                    style={{ background: 'rgba(0,0,0,0.03)' }}
                >
                    <Download className="w-3 h-3" />
                    Export CSV
                </button>
            </div>

            {/* Filters applied */}
            {data.filters_applied && data.filters_applied.length > 0 && (
                <div className="text-[10px] text-muted-foreground/30 text-center">
                    {data.filters_applied.join(' · ')}
                </div>
            )}
        </div>
    );
};
