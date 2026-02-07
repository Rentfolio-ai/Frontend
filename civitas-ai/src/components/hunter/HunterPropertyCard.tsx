import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGetPropertyCompleteQuery } from '../../graphql/generated';
import { FinancialAnalysisCard } from './FinancialAnalysisCard';
import {
    Home, TrendingUp, TrendingDown,
    Sparkles, ArrowUpRight, X, BarChart3
} from 'lucide-react';

/* ─────────────────── types ─────────────────── */

interface ToolPropertyData {
    address: string;
    price: number;
    estimated_rent?: number;
    city?: string;
    state?: string;
    zip_code?: string;
    beds?: number;
    baths?: number;
    sqft?: number;
    year_built?: number;
    image_url?: string;
    ai_score?: number;
    summary?: string;
    analysis?: { gross_yield?: number; cap_rate?: number; estimated_rent?: number };
    financial_snapshot?: { estimated_monthly_cash_flow?: number };
    calculated_metrics?: {
        monthly_mortgage?: number; monthly_expenses?: number;
        monthly_cash_flow?: number; annual_noi?: number;
        cap_rate?: number; cash_on_cash_roi?: number; total_roi?: number;
    };
}

interface HunterPropertyCardProps {
    data: ToolPropertyData;
    index?: number;
    onAction?: (query: string) => void;
}

/* ─────────────────── helpers ─────────────────── */

const fmt = (n?: number) => n != null ? `$${Math.abs(n).toLocaleString()}` : '—';

/* Score confidence bar — thin, elegant, color-graded */
const ConfidenceBar: React.FC<{ score: number; max?: number }> = ({ score, max = 150 }) => {
    const pct = Math.min((score / max) * 100, 100);
    const color = pct >= 80 ? '#D4A27F' : pct >= 55 ? '#8B7355' : '#4A4458';
    return (
        <div className="w-full h-[3px] rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
                className="h-full rounded-full"
                style={{ background: color }}
            />
        </div>
    );
};

/* ─────────────────── main card ─────────────────── */

export const HunterPropertyCard: React.FC<HunterPropertyCardProps> = ({ data, index = 0, onAction }) => {
    const [isFlipped, setIsFlipped] = useState(false);

    /* GraphQL hydration */
    const { data: graphData, loading: isLoadingGraph } = useGetPropertyCompleteQuery({
        variables: { address: data.address, strategy: "LTR", downPaymentPct: 20 },
        fetchPolicy: 'cache-first',
    });

    const property = graphData?.property;
    const pnl = property?.pnlAnalysis;
    const displayData = { ...data, price: property?.price || data.price };

    /* Fallback P&L */
    const metrics = data.calculated_metrics;
    const rent = data.estimated_rent || 0;
    const price = data.price || 0;
    const fallbackPnl = metrics ? {
        monthlyRent: rent, grossIncome: rent * 12,
        totalExpenses: (metrics.monthly_expenses || 0) * 12,
        noi: metrics.annual_noi || 0, mortgagePayment: metrics.monthly_mortgage || 0,
        monthlyCashflow: metrics.monthly_cash_flow || 0,
        annualCashflow: (metrics.monthly_cash_flow || 0) * 12,
        capRate: (metrics.cap_rate || 0) / 100,
        cashOnCash: (metrics.cash_on_cash_roi || 0) / 100,
        totalInvestment: price * 0.25, downPayment: price * 0.20,
        loanAmount: price * 0.80, closingCosts: price * 0.05, strategy: 'LTR',
    } : null;

    const effectivePnl = pnl || fallbackPnl;

    /* Derived values */
    const capRateNum = effectivePnl?.capRate
        ? effectivePnl.capRate * 100
        : metrics?.cap_rate ?? (displayData.analysis?.gross_yield ?? null);
    const capRateDisplay = capRateNum != null ? `${capRateNum.toFixed(1)}%` : '—';

    const cashFlowValue = effectivePnl?.monthlyCashflow != null
        ? Math.round(effectivePnl.monthlyCashflow)
        : metrics?.monthly_cash_flow != null
            ? Math.round(metrics.monthly_cash_flow)
            : displayData.financial_snapshot?.estimated_monthly_cash_flow ?? null;

    const isPositive = (cashFlowValue ?? 0) >= 0;
    const rentValue = effectivePnl?.monthlyRent || displayData.estimated_rent || 0;
    const aiScore = data.ai_score;

    /* Specs text */
    const specs = [
        displayData.beds != null && `${displayData.beds} bd`,
        displayData.baths != null && `${displayData.baths} ba`,
        displayData.sqft != null && displayData.sqft > 0 && `${displayData.sqft.toLocaleString()} sqft`,
    ].filter(Boolean).join('  ·  ');

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full min-w-[380px] max-w-[580px]"
            style={{ perspective: '1200px' }}
        >
            <motion.div
                className="relative w-full"
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.65, type: 'spring', stiffness: 80, damping: 16 }}
                style={{ transformStyle: 'preserve-3d' }}
            >
                {/* ═══════ FRONT ═══════ */}
                <div
                    className="relative w-full rounded-2xl overflow-hidden cursor-pointer group"
                    style={{
                        backfaceVisibility: 'hidden',
                        background: '#17161B',
                        boxShadow: '0 1px 0 0 rgba(255,255,255,0.03) inset, 0 24px 48px -12px rgba(0,0,0,0.45)',
                    }}
                    onClick={() => setIsFlipped(true)}
                >
                    {/* ── Image ── */}
                    <div className="relative aspect-[16/9] overflow-hidden">
                        {displayData.image_url ? (
                            <img
                                src={displayData.image_url}
                                alt={displayData.address}
                                className="w-full h-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-[1.03]"
                            />
                        ) : (
                            <div className="w-full h-full bg-[#1C1B21] flex items-center justify-center">
                                <Home className="w-14 h-14 text-white/[0.04]" />
                            </div>
                        )}

                        {/* Vignette */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#17161B] via-transparent to-[#17161B]/20" />

                        {/* Price — floating frosted */}
                        <div className="absolute bottom-4 left-4">
                            <span className="text-[26px] font-extrabold text-white tracking-[-0.02em] drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)]">
                                ${displayData.price?.toLocaleString()}
                            </span>
                        </div>

                        {/* P&L hint — appears on hover */}
                        <div className="absolute bottom-4 right-4 opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium text-white/70"
                                style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(12px)' }}>
                                View P&L <ArrowUpRight className="w-3 h-3" />
                            </div>
                        </div>

                        {/* AI Score label — top-right, minimal */}
                        {aiScore != null && aiScore > 0 && (
                            <div className="absolute top-3.5 right-3.5 flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold"
                                style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(12px)', color: '#D4A27F' }}>
                                <Sparkles className="w-3 h-3" />
                                {Math.round(aiScore)}<span className="text-white/25 font-normal">/{aiScore > 100 ? 150 : 100}</span>
                            </div>
                        )}
                    </div>

                    {/* ── AI confidence bar ── */}
                    {aiScore != null && aiScore > 0 && (
                        <div className="px-5">
                            <ConfidenceBar score={aiScore} max={aiScore > 100 ? 150 : 100} />
                        </div>
                    )}

                    {/* ── Content ── */}
                    <div className="px-5 pt-4 pb-5">
                        {/* Address */}
                        <h3 className="text-[15px] font-semibold text-white/90 truncate leading-snug tracking-[-0.01em]">
                            {displayData.address}
                        </h3>
                        <p className="text-[12px] text-white/30 mt-0.5 truncate">
                            {displayData.city}{displayData.state ? `, ${displayData.state}` : ''}
                            {displayData.year_built ? `  ·  Built ${displayData.year_built}` : ''}
                        </p>

                        {/* Specs */}
                        {specs && (
                            <p className="text-[11px] text-white/20 mt-2 tracking-wide font-medium uppercase">
                                {specs}
                            </p>
                        )}

                        {/* Divider */}
                        <div className="h-px my-4" style={{ background: 'rgba(255,255,255,0.04)' }} />

                        {/* Metrics row — clean inline layout */}
                        <div className="flex items-end justify-between gap-4">
                            {/* Rent */}
                            <div className="flex-1 min-w-0">
                                <div className="text-[9px] uppercase tracking-[0.1em] text-white/20 font-semibold mb-1">Est. Rent</div>
                                <div className="text-[17px] font-bold text-white/70 leading-none tracking-tight">
                                    {rentValue > 0 ? fmt(rentValue) : '—'}
                                    {rentValue > 0 && <span className="text-[11px] text-white/20 font-normal">/mo</span>}
                                </div>
                            </div>

                            {/* Cap Rate */}
                            <div className="flex-1 min-w-0">
                                <div className="text-[9px] uppercase tracking-[0.1em] text-white/20 font-semibold mb-1">Cap Rate</div>
                                <div className="text-[17px] font-bold text-white/70 leading-none tracking-tight">
                                    {capRateDisplay}
                                </div>
                            </div>

                            {/* Cash Flow — highlighted */}
                            <div className="flex-1 min-w-0">
                                <div className="text-[9px] uppercase tracking-[0.1em] text-white/20 font-semibold mb-1">Cash Flow</div>
                                <div className={`text-[17px] font-bold leading-none tracking-tight flex items-center gap-1 ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    {isPositive
                                        ? <TrendingUp className="w-3.5 h-3.5 flex-shrink-0" />
                                        : <TrendingDown className="w-3.5 h-3.5 flex-shrink-0" />
                                    }
                                    {cashFlowValue != null
                                        ? `${isPositive ? '+' : '-'}${fmt(cashFlowValue)}`
                                        : '—'
                                    }
                                    {cashFlowValue != null && <span className="text-[11px] font-normal opacity-50">/mo</span>}
                                </div>
                            </div>
                        </div>

                        {/* Hydrating indicator */}
                        {isLoadingGraph && (
                            <div className="flex items-center gap-1.5 mt-3">
                                <div className="w-1 h-1 rounded-full bg-[#C08B5C]/60 animate-pulse" />
                                <span className="text-[10px] text-white/15 font-medium">Hydrating live data</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* ═══════ BACK (Financial Analysis) ═══════ */}
                <div
                    className="absolute inset-0 w-full rounded-2xl overflow-y-auto"
                    style={{
                        backfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)',
                        background: '#17161B',
                        boxShadow: '0 1px 0 0 rgba(255,255,255,0.03) inset, 0 24px 48px -12px rgba(0,0,0,0.45)',
                    }}
                >
                    {/* Header */}
                    <div className="sticky top-0 z-10" style={{ background: 'rgba(23,22,27,0.92)', backdropFilter: 'blur(16px)' }}>
                        <div className="flex items-center justify-between px-5 py-3.5">
                            <div className="flex items-center gap-2.5">
                                <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: 'rgba(192,139,92,0.15)' }}>
                                    <BarChart3 className="w-3.5 h-3.5 text-[#D4A27F]" />
                                </div>
                                <div>
                                    <span className="text-[13px] font-semibold text-white/90">Financial Analysis</span>
                                </div>
                            </div>
                            <button
                                onClick={(e) => { e.stopPropagation(); setIsFlipped(false); }}
                                className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-white/[0.06]"
                            >
                                <X className="w-3.5 h-3.5 text-white/35" />
                            </button>
                        </div>
                        <div className="h-px" style={{ background: 'rgba(255,255,255,0.04)' }} />
                    </div>

                    {/* Body */}
                    <div className="p-5">
                        {isLoadingGraph && !effectivePnl ? (
                            <div className="flex flex-col items-center justify-center h-[200px] gap-3">
                                <div className="w-8 h-8 rounded-full border-2 border-[#C08B5C]/20 border-t-[#C08B5C]/60 animate-spin" />
                                <span className="text-[12px] text-white/20 font-medium">Loading analysis...</span>
                            </div>
                        ) : effectivePnl ? (
                            <FinancialAnalysisCard
                                data={{
                                    address: displayData.address,
                                    strategy: ((effectivePnl as any).strategy as any) || 'LTR',
                                    summary: displayData.summary || (pnl ? "Live Data" : "Estimated"),
                                    year1: {
                                        gross_income: effectivePnl.grossIncome,
                                        total_expenses: effectivePnl.totalExpenses,
                                        noi: effectivePnl.noi,
                                        debt_service: (effectivePnl.mortgagePayment || 0) * 12,
                                        monthly_cashflow: effectivePnl.monthlyCashflow,
                                        cashflow_before_taxes: effectivePnl.annualCashflow,
                                        cap_rate: effectivePnl.capRate,
                                        cash_on_cash_return: effectivePnl.cashOnCash
                                    },
                                    financing_summary: {
                                        down_payment: effectivePnl.downPayment || 0,
                                        loan_amount: effectivePnl.loanAmount || 0,
                                        closing_costs: effectivePnl.closingCosts || 0,
                                        total_cash_invested: effectivePnl.totalInvestment,
                                        monthly_payment: effectivePnl.mortgagePayment || 0,
                                        interest_rate: 0.065
                                    }
                                }}
                                onAction={onAction}
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center h-[200px] gap-4">
                                <div className="w-10 h-10 rounded-full bg-white/[0.02] flex items-center justify-center">
                                    <TrendingUp className="w-5 h-5 text-white/10" />
                                </div>
                                <p className="text-[12px] text-white/20">No analysis available yet</p>
                                <button
                                    onClick={() => onAction?.(`Analyze ${displayData.address}`)}
                                    className="px-4 py-2 rounded-lg text-[12px] font-semibold text-[#D4A27F] transition-colors"
                                    style={{ background: 'rgba(192,139,92,0.1)' }}
                                >
                                    Run Analysis
                                </button>
                            </div>
                        )}

                        {/* AI note */}
                        <AnimatePresence>
                            {displayData.summary && !pnl && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="mt-4 flex items-start gap-2 px-3 py-2.5 rounded-lg"
                                    style={{ background: 'rgba(192,139,92,0.04)' }}
                                >
                                    <Sparkles className="w-3 h-3 text-[#C08B5C]/40 mt-0.5 flex-shrink-0" />
                                    <p className="text-[11px] text-white/25 leading-relaxed">{displayData.summary}</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};
