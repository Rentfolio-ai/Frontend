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
    ExternalLink,
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
            desc: 'Essential tools to get started',
            icon: Zap,
            premium: false,
            features: [
                '2 property analyses / month',
                '2 reports / month',
                'Quick reasoning mode',
                'Basic market metrics',
                'Standard email support',
            ],
        },
        {
            key: 'pro' as const,
            name: 'Pro',
            price: '$100',
            period: '/mo',
            desc: 'Professional-grade investment suite',
            icon: Star,
            premium: true,
            features: [
                'Unlimited property analyses',
                'Unlimited reports',
                'Deep reasoning modes',
                'Advanced market intelligence',
                'Voice mode with AI advisors (Beta)',
                'PDF report exports',
                'ROI & Cap Rate forecasting',
                'Priority execution queue',
                'API access',
            ],
        },
    ];

    const faqs = [
        {
            q: 'Can I change my plan at any time?',
            a: 'Yes, you can upgrade or downgrade your plan at any time. Changes to your subscription will take effect immediately.',
        },
        {
            q: 'What payment methods are accepted?',
            a: 'We accept all major credit cards (Visa, Mastercard, Amex) and debit cards via Stripe. Apple Pay is also supported.',
        },
        {
            q: "How does the first month discount work?",
            a: 'New Pro subscribers automatically receive 50% off their first month. You will be billed $50 for the first month, then $100/month thereafter.',
        },
        {
            q: 'Are there any hidden fees?',
            a: 'No monthly hidden fees. Report downloads (PDFs) are charged separately at $2.00 each, but viewing reports within the app is always included.',
        },
        {
            q: 'How do cancellations work?',
            a: 'You can cancel your subscription at any time. You will retain access to Pro features until the end of your current billing cycle.',
        },
    ];

    // ── Render ─────────────────────────────────────────────────────────────────

    const currentTier = subscription.tier;

    return (
        <div className="h-full flex flex-col bg-[#0C0C0E]">
            {/* Header - Minimal & Clean */}
            <header className="flex items-center gap-4 px-8 py-6 border-b border-white/[0.08] bg-[#0C0C0E]/80 backdrop-blur-md sticky top-0 z-20">
                <button
                    onClick={onBack}
                    className="w-8 h-8 rounded-lg bg-transparent hover:bg-white/[0.04] border border-transparent hover:border-white/[0.08] flex items-center justify-center transition-all group -ml-2"
                >
                    <ArrowLeft className="w-4 h-4 text-white/50 group-hover:text-white transition-colors" />
                </button>
                <div className="flex-1 flex items-center justify-between">
                    <h1 className="text-xl font-medium font-sans text-white tracking-tight">Billing & Plans</h1>

                    {/* Status Indicator */}
                    {!subLoading && (
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-sans text-white/40 uppercase tracking-widest font-medium">Current Plan</span>
                            <div className={`flex items-center gap-2 px-3 py-1 rounded border text-xs font-medium ${isPro
                                    ? 'bg-[#C08B5C]/10 border-[#C08B5C]/20 text-[#D4A27F]'
                                    : 'bg-white/[0.05] border-white/[0.1] text-white/60'
                                }`}>
                                {isPro ? <Crown className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                                <span>{currentTier === 'pro' ? 'Pro' : 'Free'}</span>
                            </div>
                        </div>
                    )}
                </div>
            </header>

            <div className="flex-1 overflow-y-auto">
                <div className="max-w-5xl mx-auto px-8 py-10 space-y-12">

                    {/* ── Additional Charges Notice (Subtle) ── */}
                    <div className="border-b border-white/[0.08] pb-10">
                        <div className="flex items-center gap-4 p-4 rounded bg-[#161618] border border-white/[0.08]">
                            <div className="w-10 h-10 rounded bg-white/[0.03] flex items-center justify-center flex-shrink-0">
                                <CreditCard className="w-4 h-4 text-white/60" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-sm font-medium font-sans text-white mb-0.5">Usage-Based Charges</h3>
                                <p className="text-sm font-sans text-white/50">
                                    Report downloads are billed at <span className="text-white/80 font-medium">$2.00 per download</span>.
                                    Viewing reports within the platform is always included in your subscription.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* ── Plans Grid ── */}
                    <div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {plans.map((plan) => {
                                const Icon = plan.icon;
                                const isCurrent = currentTier === plan.key;

                                return (
                                    <div
                                        key={plan.key}
                                        className={`relative rounded-xl p-8 flex flex-col transition-all duration-200 ${plan.premium
                                                ? 'bg-[#161618] border border-[#C08B5C]/30 hover:border-[#C08B5C]/50 shadow-sm'
                                                : 'bg-[#161618] border border-white/[0.08] hover:border-white/[0.12]'
                                            }`}
                                    >
                                        {/* Pro Badge - Refined */}
                                        {plan.premium && !isCurrent && (
                                            <div className="absolute top-0 right-0 transform translate-x-px -translate-y-px">
                                                <div className="bg-[#C08B5C] text-[#0C0C0E] text-[10px] font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg tracking-wide uppercase">
                                                    Recommended
                                                </div>
                                            </div>
                                        )}
                                        {plan.premium && isFirstMonth && !isCurrent && (
                                            <div className="absolute top-4 right-4 text-xs font-medium text-green-400 bg-green-500/10 px-2 py-1 rounded border border-green-500/20">
                                                50% off first month
                                            </div>
                                        )}

                                        {/* Plan Header */}
                                        <div className="mb-8">
                                            <div className="flex items-center justify-between mb-4">
                                                <h2 className="text-2xl font-medium font-sans text-white">{plan.name}</h2>
                                                <Icon className={`w-5 h-5 ${plan.premium ? 'text-[#C08B5C]' : 'text-white/40'}`} />
                                            </div>
                                            <div className="flex items-baseline gap-1 mb-2">
                                                <span className="text-4xl font-semibold font-sans text-white tracking-tight">{plan.price}</span>
                                                <span className="text-sm font-sans text-white/40 font-medium">{plan.period}</span>
                                            </div>
                                            <p className="text-sm font-sans text-white/50">{plan.desc}</p>
                                        </div>

                                        {/* Divider */}
                                        <div className="w-full h-px bg-white/[0.08] mb-8" />

                                        {/* Features List */}
                                        <div className="space-y-4 mb-8 flex-1">
                                            {plan.features.map((f) => {
                                                const isBeta = f.includes('(Beta)');
                                                const label = isBeta ? f.replace(' (Beta)', '') : f;
                                                return (
                                                    <div key={f} className="flex items-start gap-3">
                                                        <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${plan.premium ? 'text-[#C08B5C]' : 'text-white/30'
                                                            }`} />
                                                        <span className="text-sm font-sans text-white/70 leading-relaxed font-normal">
                                                            {label}
                                                            {isBeta && (
                                                                <span className="ml-1.5 text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#C08B5C]/10 text-[#C08B5C] border border-[#C08B5C]/20">
                                                                    Beta
                                                                </span>
                                                            )}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Action Button */}
                                        <div className="mt-auto">
                                            {subLoading ? (
                                                <div className="w-full h-12 rounded bg-white/[0.05] flex items-center justify-center">
                                                    <Loader2 className="w-5 h-5 text-white/20 animate-spin" />
                                                </div>
                                            ) : isCurrent ? (
                                                plan.premium ? (
                                                    <button
                                                        onClick={handleCancelSubscription}
                                                        disabled={cancelling}
                                                        className="w-full h-12 rounded font-sans text-sm font-medium transition-all bg-transparent border border-white/[0.1] text-white/40 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/[0.05]"
                                                    >
                                                        {cancelling ? 'Cancelling Subscription...' : 'Cancel Subscription'}
                                                    </button>
                                                ) : (
                                                    <div className="w-full h-12 rounded bg-white/[0.05] border border-white/[0.05] flex items-center justify-center text-sm font-medium text-white/30 cursor-default">
                                                        Current Plan
                                                    </div>
                                                )
                                            ) : plan.premium ? (
                                                <button
                                                    onClick={() => setShowCheckout(true)}
                                                    className="w-full h-12 rounded font-sans text-sm font-medium transition-all bg-[#C08B5C] text-[#0C0C0E] hover:bg-[#D4A27F] active:transform active:scale-[0.98]"
                                                >
                                                    Upgrade to Pro
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={handleSelectFree}
                                                    disabled={selectingFree}
                                                    className="w-full h-12 rounded font-sans text-sm font-medium transition-all bg-transparent border border-white/[0.1] text-white/60 hover:text-white hover:border-white/[0.2] hover:bg-white/[0.02]"
                                                >
                                                    {selectingFree ? 'Downgrading...' : 'Downgrade to Free'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* ── FAQ Section ── */}
                    <div className="pt-8 border-t border-white/[0.08]">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-lg font-medium font-sans text-white">
                                Frequently Asked Questions
                            </h2>
                            <a href="#" className="text-sm font-sans text-[#C08B5C] hover:text-[#D4A27F] flex items-center gap-1 transition-colors">
                                Visit Help Center <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                            {faqs.map((f, i) => (
                                <div key={i} className="group">
                                    <h4 className="text-sm font-medium font-sans text-white/90 mb-2 group-hover:text-white transition-colors">
                                        {f.q}
                                    </h4>
                                    <p className="text-sm font-sans text-white/50 leading-relaxed">
                                        {f.a}
                                    </p>
                                </div>
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
