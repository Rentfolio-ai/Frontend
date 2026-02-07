/**
 * Upgrade / Billing Page — Subscription-aware
 *
 * Shows current plan status, lets users choose Free or upgrade to Pro,
 * and provides an FAQ section.
 */

import React, { useState } from 'react';
import {
    ArrowLeft,
    Check,
    Zap,
    Star,
    ChevronDown,
    CreditCard,
    Loader2,
    Shield,
    Crown,
} from 'lucide-react';
import { CheckoutModal } from '../payments/CheckoutModal';
import { useSubscription } from '../../hooks/useSubscription';
import { subscriptionService } from '../../services/subscriptionService';

interface UpgradePageProps {
    onBack: () => void;
}

export const UpgradePage: React.FC<UpgradePageProps> = ({ onBack }) => {
    const { subscription, loading: subLoading, isPro, refetch } = useSubscription();
    const [showCheckout, setShowCheckout] = useState(false);
    const [faqOpen, setFaqOpen] = useState<number | null>(null);

    // First-month 50% discount — only for users who have never been on Pro
    const isFirstMonth = subscription.first_month_eligible ?? true;
    const [selectingFree, setSelectingFree] = useState(false);
    const [cancelling, setCancelling] = useState(false);

    // ── Handlers ──────────────────────────────────────────────────────────────

    const handleSelectFree = async () => {
        setSelectingFree(true);
        try {
            await subscriptionService.selectFreePlan();
            await refetch();
        } catch (err) {
            console.error('Failed to select free plan:', err);
        } finally {
            setSelectingFree(false);
        }
    };

    const handleCancelSubscription = async () => {
        if (!window.confirm('Are you sure you want to cancel your Pro subscription? You will keep access until the end of your billing period.')) return;
        setCancelling(true);
        try {
            await subscriptionService.cancelSubscription();
            await refetch();
        } catch (err) {
            console.error('Failed to cancel subscription:', err);
        } finally {
            setCancelling(false);
        }
    };

    const handleCheckoutSuccess = async () => {
        await refetch();
    };

    // ── Plan Data ─────────────────────────────────────────────────────────────

    const plans = [
        {
            key: 'free' as const,
            name: 'Free',
            price: '$0',
            period: '/mo',
            desc: 'Get started with basic features',
            icon: Zap,
            premium: false,
            features: [
                '2 property analyses / month',
                '2 reports / month',
                'Quick reasoning mode',
                'Basic market insights',
                'Email support',
            ],
        },
        {
            key: 'pro' as const,
            name: 'Pro',
            price: '$100',
            period: '/mo',
            desc: 'For serious investors',
            icon: Star,
            premium: true,
            features: [
                'Unlimited property analyses',
                'Unlimited reports',
                'All reasoning modes',
                'Advanced market insights',
                'PDF report generation',
                'Portfolio tracking',
                'Priority support',
                'API access',
            ],
        },
    ];

    const faqs = [
        {
            q: 'Can I change plans later?',
            a: 'Yes, upgrade or downgrade at any time. Changes take effect immediately.',
        },
        {
            q: 'What payment methods do you accept?',
            a: 'All major credit cards and debit cards via Stripe. Apple Pay is supported where available.',
        },
        {
            q: "What's the first month discount?",
            a: 'New Pro subscribers get 50% off their first month ($50 instead of $100). Cancel anytime.',
        },
        {
            q: 'Are there additional charges?',
            a: 'Report downloads are $2.00 each (viewing is free). All other features are included in your plan.',
        },
        {
            q: 'How do I cancel?',
            a: 'Click "Cancel Subscription" on the billing page. You\'ll keep Pro access until the end of your current billing period.',
        },
    ];

    // ── Render ─────────────────────────────────────────────────────────────────

    const currentTier = subscription.tier;

    return (
        <div className="h-full flex flex-col" style={{ backgroundColor: '#111114' }}>
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/[0.08]">
                <button
                    onClick={onBack}
                    className="w-8 h-8 rounded-lg bg-white/[0.05] hover:bg-white/[0.08] flex items-center justify-center transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 text-white/60" />
                </button>
                <div className="flex-1">
                    <h1 className="text-lg font-semibold text-white/90">Billing & Plans</h1>
                    <p className="text-[11px] text-white/35">Manage your subscription</p>
                </div>

                {/* Current plan badge */}
                {!subLoading && (
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold ${
                        isPro
                            ? 'bg-[#C08B5C]/15 text-[#D4A27F] border border-[#C08B5C]/20'
                            : 'bg-white/[0.05] text-white/50 border border-white/[0.06]'
                    }`}>
                        {isPro ? <Crown className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                        {currentTier === 'pro' ? 'Pro Plan' : 'Free Plan'}
                    </div>
                )}
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
                <div className="max-w-3xl mx-auto space-y-5">

                    {/* ── Per-action notice ── */}
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-[#C08B5C]/[0.06] border border-[#C08B5C]/15">
                        <div className="w-8 h-8 rounded-lg bg-[#C08B5C]/15 flex items-center justify-center flex-shrink-0">
                            <CreditCard className="w-4 h-4 text-[#D4A27F]" />
                        </div>
                        <div>
                            <h3 className="text-[12px] font-medium text-white/80">Per-Action Charges</h3>
                            <p className="text-[11px] text-white/40">
                                <strong className="text-white/60">Report Downloads:</strong> $2.00 each
                                (viewing is always free)
                            </p>
                        </div>
                    </div>

                    {/* ── Usage Stats (for free tier) ── */}
                    {!subLoading && currentTier === 'free' && subscription.usage_this_month && (
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                {
                                    label: 'Analyses',
                                    used: subscription.usage_this_month['property_analysis'] ?? 0,
                                    limit: subscription.limits.analyses_per_month,
                                },
                                {
                                    label: 'Reports',
                                    used: subscription.usage_this_month['report_generated'] ?? 0,
                                    limit: subscription.limits.reports_per_month,
                                },
                                {
                                    label: 'Watchlist',
                                    used: 0, // TODO: wire up
                                    limit: subscription.limits.watchlist_properties,
                                },
                            ].map((stat) => (
                                <div
                                    key={stat.label}
                                    className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3 text-center"
                                >
                                    <p className="text-[10px] text-white/35 uppercase tracking-wider mb-1">{stat.label}</p>
                                    <p className="text-[16px] font-bold text-white/80">
                                        {stat.used}
                                        <span className="text-[11px] font-normal text-white/30">
                                            /{stat.limit === -1 ? '∞' : stat.limit}
                                        </span>
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* ── Plans ── */}
                    <div className="grid grid-cols-2 gap-3">
                        {plans.map((plan) => {
                            const Icon = plan.icon;
                            const isCurrent = currentTier === plan.key;

                            return (
                                <div
                                    key={plan.key}
                                    className={`relative rounded-xl border-2 p-4 transition-all ${
                                        isCurrent
                                            ? plan.premium
                                                ? 'border-[#C08B5C]/40 bg-[#C08B5C]/[0.06] ring-1 ring-[#C08B5C]/20'
                                                : 'border-white/[0.12] bg-white/[0.04] ring-1 ring-white/[0.08]'
                                            : plan.premium
                                                ? 'border-[#C08B5C]/20 bg-[#C08B5C]/[0.03]'
                                                : 'border-white/[0.06] bg-white/[0.02]'
                                    }`}
                                >
                                    {/* Badges */}
                                    {plan.premium && !isCurrent && (
                                        <>
                                            <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#C08B5C] text-white">
                                                Most Popular
                                            </div>
                                            {isFirstMonth && (
                                                <div className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white">
                                                    50% OFF
                                                </div>
                                            )}
                                        </>
                                    )}
                                    {isCurrent && (
                                        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-white/80 border border-white/10">
                                            Current Plan
                                        </div>
                                    )}

                                    {/* Plan header */}
                                    <div className="flex items-center gap-2 mb-3 mt-1">
                                        <div
                                            className={`w-7 h-7 rounded-md flex items-center justify-center ${
                                                plan.premium ? 'bg-[#C08B5C]/15' : 'bg-white/[0.06]'
                                            }`}
                                        >
                                            <Icon
                                                className={`w-3.5 h-3.5 ${
                                                    plan.premium ? 'text-[#D4A27F]' : 'text-white/40'
                                                }`}
                                            />
                                        </div>
                                        <span className="text-[14px] font-bold text-white/85">{plan.name}</span>
                                    </div>

                                    <p className="text-[11px] text-white/40 mb-3">{plan.desc}</p>

                                    <div className="flex items-baseline gap-1 mb-4">
                                        <span className="text-2xl font-bold text-white/90">{plan.price}</span>
                                        <span className="text-[11px] text-white/35">{plan.period}</span>
                                    </div>

                                    {/* CTA Button */}
                                    {subLoading ? (
                                        <div className="w-full py-2 rounded-lg bg-white/[0.04] flex items-center justify-center mb-4">
                                            <Loader2 className="w-4 h-4 text-white/30 animate-spin" />
                                        </div>
                                    ) : isCurrent ? (
                                        plan.premium ? (
                                            // User is on Pro — show cancel option
                                            <button
                                                onClick={handleCancelSubscription}
                                                disabled={cancelling}
                                                className="w-full py-2 rounded-lg text-[12px] font-semibold transition-all mb-4 bg-white/[0.06] text-white/50 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20"
                                            >
                                                {cancelling ? 'Cancelling…' : 'Cancel Subscription'}
                                            </button>
                                        ) : (
                                            // User is on Free — show "Current"
                                            <div className="w-full py-2 rounded-lg text-[12px] font-semibold text-center mb-4 bg-white/[0.06] text-white/40">
                                                Active
                                            </div>
                                        )
                                    ) : plan.premium ? (
                                        // User is on Free → show "Upgrade"
                                        <button
                                            onClick={() => setShowCheckout(true)}
                                            className="w-full py-2 rounded-lg text-[12px] font-semibold transition-all mb-4 bg-[#C08B5C] text-white hover:bg-[#A8734A]"
                                        >
                                            Upgrade Now
                                        </button>
                                    ) : (
                                        // User is on Pro → show "Downgrade to Free"
                                        <button
                                            onClick={handleSelectFree}
                                            disabled={selectingFree}
                                            className="w-full py-2 rounded-lg text-[12px] font-semibold transition-all mb-4 bg-white/[0.06] text-white/50 hover:bg-white/[0.08]"
                                        >
                                            {selectingFree ? 'Switching…' : 'Switch to Free'}
                                        </button>
                                    )}

                                    {/* Features */}
                                    <div className="space-y-2">
                                        {plan.features.map((f) => (
                                            <div key={f} className="flex items-start gap-2">
                                                <Check className="w-3.5 h-3.5 text-[#D4A27F] flex-shrink-0 mt-0.5" />
                                                <span className="text-[11px] text-white/55">{f}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* ── FAQ ── */}
                    <div>
                        <h2 className="text-[10px] font-semibold uppercase tracking-widest text-white/30 mb-2 px-1">
                            FAQ
                        </h2>
                        <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] divide-y divide-white/[0.04] overflow-hidden">
                            {faqs.map((f, i) => (
                                <button
                                    key={i}
                                    onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                                    className="w-full text-left px-3.5 py-2.5 hover:bg-white/[0.02] transition-colors"
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <h4 className="text-[12px] font-medium text-white/70">{f.q}</h4>
                                        <ChevronDown
                                            className={`w-3 h-3 text-white/25 flex-shrink-0 transition-transform ${
                                                faqOpen === i ? 'rotate-180' : ''
                                            }`}
                                        />
                                    </div>
                                    {faqOpen === i && (
                                        <p className="mt-2 text-[11px] text-white/40 leading-relaxed">{f.a}</p>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Checkout Modal */}
            <CheckoutModal
                isOpen={showCheckout}
                onClose={() => setShowCheckout(false)}
                plan="pro"
                isFirstMonth={isFirstMonth}
                onSuccess={handleCheckoutSuccess}
            />
        </div>
    );
};
