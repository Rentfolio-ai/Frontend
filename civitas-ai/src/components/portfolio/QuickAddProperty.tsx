// FILE: src/components/portfolio/QuickAddProperty.tsx
/**
 * Quick Add Property - Simplified property entry for fast data capture
 * Minimal fields with smart defaults and auto-calculations
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    Zap,
    MapPin,
    Sparkles,
    ArrowRight,
    Check,
} from 'lucide-react';
import type { AddPropertyForm } from '../../types/portfolio';

interface QuickAddPropertyProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (property: AddPropertyForm) => Promise<void>;
    onSwitchToFull?: () => void;
}

// Default percentage assumptions for quick calculations
const DEFAULTS = {
    downPaymentPercent: 20,
    interestRate: 7.0,
    loanTermYears: 30,
    propertyTaxPercent: 1.2, // of purchase price annually
    insurancePercent: 0.5,   // of purchase price annually
    maintenancePercent: 1,   // of rent
    pmPercent: 8,            // of rent
    vacancyPercent: 5,       // of rent (built into calculations)
};

// Strategy quick picks
const strategies = [
    { id: 'LTR', label: 'Long-Term', emoji: '🏠', color: 'blue' },
    { id: 'STR', label: 'Short-Term', emoji: '🏨', color: 'purple' },
    { id: 'MTR', label: 'Mid-Term', emoji: '💼', color: 'amber' },
];

export const QuickAddProperty: React.FC<QuickAddPropertyProps> = ({
    isOpen,
    onClose,
    onSubmit,
    onSwitchToFull,
}) => {
    // Simple form state
    const [address, setAddress] = useState('');
    const [purchasePrice, setPurchasePrice] = useState<number | ''>('');
    const [monthlyRent, setMonthlyRent] = useState<number | ''>('');
    const [strategy, setStrategy] = useState('LTR');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);

    // Reset form when opened
    useEffect(() => {
        if (isOpen) {
            setAddress('');
            setPurchasePrice('');
            setMonthlyRent('');
            setStrategy('LTR');
            setError('');
            setShowSuccess(false);
        }
    }, [isOpen]);

    // Auto-calculate metrics based on simple inputs
    const calculations = useMemo(() => {
        const price = typeof purchasePrice === 'number' ? purchasePrice : 0;
        const rent = typeof monthlyRent === 'number' ? monthlyRent : 0;

        if (price <= 0 || rent <= 0) {
            return null;
        }

        // Calculate down payment and loan
        const downPayment = Math.round(price * (DEFAULTS.downPaymentPercent / 100));
        const loanAmount = price - downPayment;

        // Calculate monthly mortgage
        const monthlyRate = DEFAULTS.interestRate / 100 / 12;
        const numPayments = DEFAULTS.loanTermYears * 12;
        const monthlyMortgage = loanAmount > 0
            ? (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
            (Math.pow(1 + monthlyRate, numPayments) - 1)
            : 0;

        // Calculate expenses
        const monthlyPropertyTax = Math.round((price * (DEFAULTS.propertyTaxPercent / 100)) / 12);
        const monthlyInsurance = Math.round((price * (DEFAULTS.insurancePercent / 100)) / 12);
        const monthlyMaintenance = Math.round(rent * (DEFAULTS.maintenancePercent / 100));
        const monthlyPM = Math.round(rent * (DEFAULTS.pmPercent / 100));

        const totalMonthlyExpenses = monthlyPropertyTax + monthlyInsurance + monthlyMaintenance + monthlyPM + Math.round(monthlyMortgage);

        // Cash flow
        const monthlyCashFlow = rent - totalMonthlyExpenses;
        const annualCashFlow = monthlyCashFlow * 12;

        // Cap rate (NOI / Purchase Price)
        const operatingExpenses = monthlyPropertyTax + monthlyInsurance + monthlyMaintenance + monthlyPM;
        const NOI = (rent - operatingExpenses) * 12;
        const capRate = (NOI / price) * 100;

        // Cash on cash return
        const totalInvestment = downPayment; // Simplified - just down payment
        const cashOnCash = totalInvestment > 0 ? (annualCashFlow / totalInvestment) * 100 : 0;

        // 1% rule check (monthly rent / purchase price)
        const onePercentRule = (rent / price) * 100;

        return {
            downPayment,
            loanAmount,
            monthlyMortgage: Math.round(monthlyMortgage),
            monthlyPropertyTax,
            monthlyInsurance,
            monthlyMaintenance,
            monthlyPM,
            totalMonthlyExpenses,
            monthlyCashFlow,
            annualCashFlow,
            capRate,
            cashOnCash,
            onePercentRule,
            totalInvestment,
        };
    }, [purchasePrice, monthlyRent]);

    // Determine if deal looks good
    const dealQuality = useMemo(() => {
        if (!calculations) return null;

        let score = 0;
        const checks = [];

        if (calculations.monthlyCashFlow >= 200) {
            score++;
            checks.push({ label: 'Positive cash flow', good: true });
        } else {
            checks.push({ label: 'Low/negative cash flow', good: false });
        }

        if (calculations.capRate >= 6) {
            score++;
            checks.push({ label: 'Good cap rate (6%+)', good: true });
        } else if (calculations.capRate >= 4) {
            checks.push({ label: 'Moderate cap rate', good: true });
        } else {
            checks.push({ label: 'Low cap rate', good: false });
        }

        if (calculations.onePercentRule >= 1) {
            score++;
            checks.push({ label: 'Passes 1% rule', good: true });
        } else if (calculations.onePercentRule >= 0.8) {
            checks.push({ label: 'Near 1% rule (0.8%+)', good: true });
        } else {
            checks.push({ label: 'Below 1% rule', good: false });
        }

        if (calculations.cashOnCash >= 8) {
            score++;
            checks.push({ label: 'Strong CoC return', good: true });
        }

        return {
            score,
            rating: score >= 3 ? 'Great' : score >= 2 ? 'Good' : score >= 1 ? 'Fair' : 'Needs Work',
            color: score >= 3 ? 'green' : score >= 2 ? 'teal' : score >= 1 ? 'amber' : 'red',
            checks,
        };
    }, [calculations]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!address.trim()) {
            setError('Address is required');
            return;
        }
        if (!purchasePrice || purchasePrice <= 0) {
            setError('Purchase price is required');
            return;
        }
        if (!monthlyRent || monthlyRent <= 0) {
            setError('Monthly rent is required');
            return;
        }

        if (!calculations) return;

        setSubmitting(true);
        try {
            const propertyData: AddPropertyForm = {
                address: address.trim(),
                purchase_price: purchasePrice,
                purchase_date: new Date().toISOString().split('T')[0],
                down_payment: calculations.downPayment,
                loan_amount: calculations.loanAmount,
                interest_rate: DEFAULTS.interestRate,
                loan_term_years: DEFAULTS.loanTermYears,
                monthly_rent: monthlyRent,
                monthly_expenses: {
                    property_tax: calculations.monthlyPropertyTax,
                    insurance: calculations.monthlyInsurance,
                    maintenance: calculations.monthlyMaintenance,
                    property_management: calculations.monthlyPM,
                    utilities: 0,
                    hoa: 0,
                    other: 0,
                },
                closing_costs: 0,
                renovation_costs: 0,
                current_value: purchasePrice,
                notes: `Quick added with ${strategy} strategy`,
                tags: [strategy, 'quick-add'],
            };

            await onSubmit(propertyData);
            setShowSuccess(true);

            // Close after showing success
            setTimeout(() => {
                onClose();
            }, 1500);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to add property');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/70 backdrop-blur-md"
                onClick={onClose}
            />

            {/* Modal */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-md bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
            >
                {/* Success Overlay */}
                <AnimatePresence>
                    {showSuccess && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 z-10 bg-slate-900/95 flex flex-col items-center justify-center"
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', bounce: 0.5 }}
                                className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4"
                            >
                                <Check className="w-8 h-8 text-green-400" />
                            </motion.div>
                            <p className="text-xl font-semibold text-white">Property Added!</p>
                            <p className="text-sm text-slate-400 mt-1">Redirecting...</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Header */}
                <div className="px-6 pt-6 pb-4 border-b border-white/10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-amber-500/20">
                                <Zap className="w-5 h-5 text-amber-400" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-white">Quick Add Property</h2>
                                <p className="text-xs text-slate-400">Just the essentials, we'll calculate the rest</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Address */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300 flex items-center gap-1">
                            <MapPin className="w-4 h-4" /> Address
                        </label>
                        <input
                            type="text"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-white/5 text-white placeholder:text-slate-500 border border-white/10 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
                            placeholder="123 Main St, Austin, TX"
                            autoFocus
                        />
                    </div>

                    {/* Price and Rent */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Purchase Price</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                                <input
                                    type="number"
                                    value={purchasePrice}
                                    onChange={(e) => setPurchasePrice(e.target.value ? parseInt(e.target.value) : '')}
                                    className="w-full pl-7 pr-4 py-3 rounded-xl bg-white/5 text-white placeholder:text-slate-500 border border-white/10 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
                                    placeholder="350,000"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Monthly Rent</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                                <input
                                    type="number"
                                    value={monthlyRent}
                                    onChange={(e) => setMonthlyRent(e.target.value ? parseInt(e.target.value) : '')}
                                    className="w-full pl-7 pr-4 py-3 rounded-xl bg-white/5 text-white placeholder:text-slate-500 border border-white/10 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
                                    placeholder="2,500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Strategy Quick Pick */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Strategy</label>
                        <div className="flex gap-2">
                            {strategies.map((s) => (
                                <button
                                    key={s.id}
                                    type="button"
                                    onClick={() => setStrategy(s.id)}
                                    className={`flex-1 py-2 px-3 rounded-lg border text-center transition-all ${strategy === s.id
                                        ? `bg-${s.color}-500/20 border-${s.color}-500 text-${s.color}-400`
                                        : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20'
                                        }`}
                                >
                                    <span className="mr-1">{s.emoji}</span>
                                    <span className="text-sm">{s.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Quick Calculations Preview */}
                    {calculations && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="space-y-3"
                        >
                            {/* Deal Quality Indicator */}
                            {dealQuality && (
                                <div className={`p-3 rounded-xl bg-${dealQuality.color}-500/10 border border-${dealQuality.color}-500/30`}>
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <Sparkles className={`w-4 h-4 text-${dealQuality.color}-400`} />
                                            <span className={`text-sm font-medium text-${dealQuality.color}-400`}>
                                                {dealQuality.rating} Deal
                                            </span>
                                        </div>
                                        <span className="text-xs text-slate-400">
                                            {dealQuality.score}/4 checks
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {dealQuality.checks.slice(0, 3).map((check, i) => (
                                            <span
                                                key={i}
                                                className={`text-xs px-2 py-0.5 rounded ${check.good
                                                    ? 'bg-green-500/20 text-green-400'
                                                    : 'bg-red-500/20 text-red-400'
                                                    }`}
                                            >
                                                {check.good ? '✓' : '✗'} {check.label}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Key Metrics */}
                            <div className="grid grid-cols-3 gap-2">
                                <div className="p-2 rounded-lg bg-white/5 text-center">
                                    <p className="text-xs text-slate-400">Cash Flow</p>
                                    <p className={`text-sm font-bold ${calculations.monthlyCashFlow >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {calculations.monthlyCashFlow >= 0 ? '+' : ''}${calculations.monthlyCashFlow.toLocaleString()}/mo
                                    </p>
                                </div>
                                <div className="p-2 rounded-lg bg-white/5 text-center">
                                    <p className="text-xs text-slate-400">Cap Rate</p>
                                    <p className="text-sm font-bold text-teal-400">{calculations.capRate.toFixed(1)}%</p>
                                </div>
                                <div className="p-2 rounded-lg bg-white/5 text-center">
                                    <p className="text-xs text-slate-400">CoC Return</p>
                                    <p className="text-sm font-bold text-purple-400">{calculations.cashOnCash.toFixed(1)}%</p>
                                </div>
                            </div>

                            {/* Assumptions Note */}
                            <p className="text-[10px] text-slate-500 text-center">
                                Assuming {DEFAULTS.downPaymentPercent}% down, {DEFAULTS.interestRate}% rate, {DEFAULTS.loanTermYears}yr loan
                            </p>
                        </motion.div>
                    )}

                    {/* Error */}
                    {error && (
                        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
                            {error}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-2">
                        {onSwitchToFull && (
                            <button
                                type="button"
                                onClick={onSwitchToFull}
                                className="flex items-center gap-1 text-sm text-slate-400 hover:text-white transition-all"
                            >
                                <ArrowRight className="w-4 h-4" />
                                Full form
                            </button>
                        )}
                        <div className="flex items-center gap-3 ml-auto">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting || !calculations}
                                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium hover:from-amber-400 hover:to-orange-400 transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50"
                            >
                                {submitting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Adding...
                                    </>
                                ) : (
                                    <>
                                        <Zap className="w-4 h-4" />
                                        Quick Add
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default QuickAddProperty;
