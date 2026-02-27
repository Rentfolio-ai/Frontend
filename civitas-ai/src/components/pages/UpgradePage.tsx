import React, { useState, useEffect } from 'react';
import {
    ArrowLeft,
    Check,
    ChevronDown,
    Loader2,
    Shield,
    Crown,
    ExternalLink,
    Lock,
    Infinity,
    BarChart3,
    FileText,
    AlertCircle,
    DollarSign,
    TrendingUp,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckoutModal } from '../payments/CheckoutModal';
import { useSubscription } from '../../hooks/useSubscription';
import { subscriptionService, type CurrentUsage } from '../../services/subscriptionService';

interface UpgradePageProps {
    onBack: () => void;
}

const reveal = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const stagger = {
    visible: { transition: { staggerChildren: 0.08 } },
};

const PLANS = [
    {
        key: 'free' as const,
        name: 'Starter',
        monthlyPrice: 0,
        annualPrice: 0,
        desc: 'For getting started with analysis.',
        premium: false,
        features: [
            { label: '25,000 AI tokens / month', group: 'core' },
            { label: '2 property analyses / month', group: 'core' },
            { label: '2 PDF reports / month', group: 'core' },
            { label: 'Basic market insights', group: 'core' },
            { label: 'Single AI mode', group: 'core' },
            { label: 'Standard email support', group: 'support' },
        ],
    },
    {
        key: 'pro' as const,
        name: 'Pro',
        monthlyPrice: 29,
        annualPrice: 23,
        desc: 'Full access + pay-per-action for reports and deals.',
        premium: true,
        features: [
            { label: '100,000 AI tokens / month', group: 'core' },
            { label: 'Unlimited property analyses', group: 'core' },
            { label: 'PDF reports at $5 each', group: 'core' },
            { label: 'Deal close tracking at $15 each', group: 'core' },
            { label: 'Advanced market intelligence', group: 'advanced' },
            { label: 'All 3 AI modes', group: 'advanced' },
            { label: 'Voice mode with AI advisors', group: 'advanced', badge: 'Beta' },
            { label: 'ROI & Cap Rate forecasting', group: 'advanced' },
            { label: 'Priority execution queue', group: 'support' },
        ],
    },
] as const;

const FAQS = [
    {
        q: 'How does usage-based billing work?',
        a: 'Your Pro subscription is $29/month for full platform access. PDF report generation ($5 each) and deal close fees ($15 each) are metered — they accumulate during your billing period and appear on your next invoice.',
    },
    {
        q: 'What payment methods are accepted?',
        a: 'We accept all major credit cards (Visa, Mastercard, Amex) and debit cards via Stripe. Apple Pay and Google Pay are also supported.',
    },
    {
        q: 'Are there any hidden fees?',
        a: 'No. Your base subscription is $29/month. You only pay extra when you generate reports or mark deals as closed. All other features are included.',
    },
    {
        q: 'How do cancellations work?',
        a: 'You can cancel your subscription at any time. You will retain access to Pro features until the end of your current billing cycle. Outstanding metered charges are settled in your final invoice.',
    },
    {
        q: 'What counts as a "deal close"?',
        a: 'A deal close is self-reported. When you mark a property as "Closed" in your Deals page, a $15 fee is added to your billing period. This only happens when you explicitly change the status.',
    },
];

export const UpgradePage: React.FC<UpgradePageProps> = ({ onBack }) => {
    const { subscription, loading: subLoading, isPro, refetch } = useSubscription();
    const [showCheckout, setShowCheckout] = useState(false);
    const [faqOpen, setFaqOpen] = useState<number | null>(null);
    const [isAnnual, setIsAnnual] = useState(false);
    const [currentUsage, setCurrentUsage] = useState<CurrentUsage | null>(null);
    const [migrating, setMigrating] = useState(false);

    const [selectingFree, setSelectingFree] = useState(false);
    const [cancelling, setCancelling] = useState(false);

    const currentTier = subscription.tier;
    const usage = subscription.usage_this_month ?? {};
    const limits = subscription.limits;
    const needsMigration = subscription.needs_plan_migration ?? false;

    useEffect(() => {
        if (isPro) {
            subscriptionService.getCurrentUsage()
                .then(setCurrentUsage)
                .catch(() => {});
        }
    }, [isPro]);

    const handleMigrate = async () => {
        setMigrating(true);
        try {
            const result = await subscriptionService.migrateSubscription();
            if (result.success) {
                await refetch();
                alert(`Plan updated! New pricing takes effect ${result.effective_date ? `on ${new Date(result.effective_date).toLocaleDateString()}` : 'at your next billing cycle'}.`);
            }
        } catch (err) {
            console.error('Migration failed:', err);
        } finally {
            setMigrating(false);
        }
    };

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

    return (
        <div className="h-full flex flex-col bg-[#161619]">
            {/* ── Header ── */}
            <header className="flex items-center gap-4 px-8 py-5 border-b border-white/[0.06] bg-[#161619]/80 backdrop-blur-md sticky top-0 z-20">
                <button
                    onClick={onBack}
                    className="w-8 h-8 rounded-lg hover:bg-white/[0.04] border border-transparent hover:border-white/[0.08] flex items-center justify-center transition-all group -ml-2"
                >
                    <ArrowLeft className="w-4 h-4 text-white/50 group-hover:text-white transition-colors" />
                </button>
                <div className="flex-1 flex items-center justify-between">
                    <h1 className="text-lg font-medium text-white tracking-tight">Billing & Plans</h1>
                    {!subLoading && (
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                            isPro
                                ? 'bg-[#C08B5C]/10 border border-[#C08B5C]/20 text-[#D4A27F] shadow-[0_0_12px_rgba(192,139,92,0.15)]'
                                : 'bg-white/[0.04] border border-white/[0.08] text-white/50'
                        }`}>
                            {isPro ? <Crown className="w-3.5 h-3.5" /> : <Shield className="w-3.5 h-3.5" />}
                            <span>{currentTier === 'pro' ? 'Pro' : 'Free'}</span>
                        </div>
                    )}
                </div>
            </header>

            <div className="flex-1 overflow-y-auto">
                <div className="max-w-4xl mx-auto px-8 py-10 space-y-14">

                    {/* ── Plan Summary with Usage Meters ── */}
                    <motion.section initial="hidden" animate="visible" variants={reveal}>
                        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-6 md:p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                    isPro
                                        ? 'bg-gradient-to-br from-[#C08B5C]/20 to-[#D4A27F]/10 border border-[#C08B5C]/20'
                                        : 'bg-white/[0.04] border border-white/[0.08]'
                                }`}>
                                    {isPro ? <Crown className="w-5 h-5 text-[#D4A27F]" /> : <Shield className="w-5 h-5 text-white/40" />}
                                </div>
                                <div>
                                    <h2 className="text-base font-medium text-white">
                                        {isPro ? 'Pro Plan' : 'Free Plan'}
                                    </h2>
                                    <p className="text-xs text-white/35">
                                        {isPro ? 'Full access to all features' : 'Basic access with limited usage'}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <UsageMeter
                                    icon={<BarChart3 className="w-4 h-4" />}
                                    label="Property Analyses"
                                    used={usage.analyses ?? 0}
                                    limit={limits.analyses_per_month}
                                    unlimited={isPro}
                                />
                                <UsageMeter
                                    icon={<FileText className="w-4 h-4" />}
                                    label="Reports"
                                    used={usage.reports ?? 0}
                                    limit={limits.reports_per_month}
                                    unlimited={isPro}
                                />
                            </div>
                        </div>
                    </motion.section>

                    {/* ── Migration Banner (for old $100/mo users) ── */}
                    {needsMigration && (
                        <motion.section initial="hidden" animate="visible" variants={reveal}>
                            <div className="rounded-2xl border border-[#C08B5C]/25 bg-[#C08B5C]/[0.04] p-6 md:p-8">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-[#C08B5C]/15 flex items-center justify-center flex-shrink-0">
                                        <AlertCircle className="w-5 h-5 text-[#C08B5C]" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-[15px] font-semibold text-white mb-1">We've updated our pricing</h3>
                                        <p className="text-[13px] text-white/50 leading-relaxed mb-4">
                                            Your current $100/month plan will transition to $29/month + pay-per-action.
                                            You'll save on your base subscription and only pay for reports ($5 each) and deal closings ($15 each) as you use them.
                                        </p>
                                        <button
                                            onClick={handleMigrate}
                                            disabled={migrating}
                                            className="px-5 py-2.5 rounded-xl bg-[#C08B5C] text-[#0A0A0C] text-[13px] font-semibold hover:bg-[#D4A27F] transition-colors disabled:opacity-50"
                                        >
                                            {migrating ? 'Switching...' : 'Switch to New Plan'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.section>
                    )}

                    {/* ── Add-on Pricing ── */}
                    {isPro && (
                        <motion.section initial="hidden" animate="visible" variants={reveal}>
                            <h2 className="text-base font-medium text-white mb-4">Add-on Pricing</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-5 flex items-center gap-4">
                                    <div className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
                                        <FileText className="w-4 h-4 text-white/40" />
                                    </div>
                                    <div>
                                        <div className="text-[13px] font-medium text-white/70">PDF Report</div>
                                        <div className="text-[12px] text-white/30">$5.00 per report generated</div>
                                    </div>
                                </div>
                                <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-5 flex items-center gap-4">
                                    <div className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
                                        <DollarSign className="w-4 h-4 text-white/40" />
                                    </div>
                                    <div>
                                        <div className="text-[13px] font-medium text-white/70">Deal Close</div>
                                        <div className="text-[12px] text-white/30">$15.00 per closed deal</div>
                                    </div>
                                </div>
                            </div>
                        </motion.section>
                    )}

                    {/* ── Current Period Charges ── */}
                    {isPro && currentUsage && (
                        <motion.section initial="hidden" animate="visible" variants={reveal}>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-base font-medium text-white">Current Billing Period</h2>
                                <span className="text-[11px] text-white/25 font-mono">
                                    {new Date(new Date().getFullYear(), new Date().getMonth(), 1).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    {' — '}
                                    {new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                            </div>
                            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
                                <div className="space-y-3">
                                    <BillingLine label="Base subscription" amount={2900} />
                                    <BillingLine
                                        label={`Reports generated (${currentUsage.report_generation?.count ?? 0})`}
                                        amount={currentUsage.report_generation?.total_cents ?? 0}
                                    />
                                    <BillingLine
                                        label={`Deals closed (${currentUsage.deal_close?.count ?? 0})`}
                                        amount={currentUsage.deal_close?.total_cents ?? 0}
                                    />
                                    <div className="border-t border-white/[0.06] pt-3 flex items-center justify-between">
                                        <span className="text-[13px] font-medium text-white/70">Estimated next invoice</span>
                                        <span className="text-[15px] font-semibold text-white">
                                            ${((2900 + (currentUsage.period_total_cents ?? 0)) / 100).toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </motion.section>
                    )}

                    {/* ── Annual / Monthly Toggle ── */}
                    <motion.section initial="hidden" animate="visible" variants={reveal} className="flex flex-col items-center gap-3">
                        <h2 className="text-xl font-semibold text-white tracking-tight">Choose your plan</h2>
                        <p className="text-sm text-white/30 mb-2">Start free. Upgrade when you need to.</p>
                        <div className="flex items-center gap-3">
                            <span className={`text-[13px] transition-colors duration-300 ${!isAnnual ? 'text-white/70' : 'text-white/30'}`}>Monthly</span>
                            <button
                                onClick={() => setIsAnnual(!isAnnual)}
                                className="w-12 h-[26px] rounded-full bg-white/[0.08] border border-white/[0.1] relative cursor-pointer transition-colors duration-300 hover:bg-white/[0.12]"
                            >
                                <motion.div
                                    className="absolute top-[3px] w-5 h-5 rounded-full bg-gradient-to-br from-[#C08B5C] to-[#D4A27F]"
                                    animate={{ left: isAnnual ? 24 : 3 }}
                                    transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                                />
                            </button>
                            <span className={`text-[13px] transition-colors duration-300 ${isAnnual ? 'text-white/70' : 'text-white/30'}`}>Annual</span>
                            <AnimatePresence>
                                {isAnnual && (
                                    <motion.span
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                                    >
                                        Save 20%
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.section>

                    {/* ── Plan Cards ── */}
                    <motion.section initial="hidden" animate="visible" variants={stagger}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {PLANS.map((plan, idx) => {
                                const isCurrent = currentTier === plan.key;
                                const price = isAnnual ? plan.annualPrice : plan.monthlyPrice;

                                return (
                                    <motion.div
                                        key={plan.key}
                                        variants={reveal}
                                        className={`relative rounded-2xl p-8 md:p-10 flex flex-col transition-all duration-300 hover:translate-y-[-2px] overflow-hidden ${
                                            plan.premium
                                                ? 'border border-[#C08B5C]/25 bg-gradient-to-b from-[#C08B5C]/[0.04] to-transparent'
                                                : 'border border-white/[0.06] bg-[#0E0E10]'
                                        }`}
                                    >
                                        {/* Copper glow orb for Pro */}
                                        {plan.premium && (
                                            <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-[#C08B5C]/[0.08] blur-3xl pointer-events-none" />
                                        )}

                                        {/* Badges */}
                                        {plan.premium && !isCurrent && (
                                            <div className="flex items-center gap-2 mb-6 relative z-10">
                                                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-gradient-to-r from-[#C08B5C] to-[#D4A27F] text-[#0A0A0C]">
                                                    Recommended
                                                </span>
                                            </div>
                                        )}
                                        {isCurrent && (
                                            <div className="flex items-center gap-2 mb-6 relative z-10">
                                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                                                    plan.premium
                                                        ? 'bg-[#C08B5C]/15 text-[#D4A27F] border border-[#C08B5C]/20'
                                                        : 'bg-white/[0.06] text-white/50 border border-white/[0.08]'
                                                }`}>
                                                    Current plan
                                                </span>
                                            </div>
                                        )}

                                        {/* Plan name + Price */}
                                        <div className="mb-8 relative z-10">
                                            <h3 className={`text-[13px] mb-2 font-medium ${plan.premium ? 'text-[#C08B5C]/60' : 'text-white/30'}`}>
                                                {plan.name}
                                            </h3>
                                            <div className="flex items-baseline gap-2">
                                                <AnimatePresence mode="wait">
                                                    <motion.div
                                                        key={`${plan.key}-${isAnnual}`}
                                                        initial={{ opacity: 0, y: -10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: 10 }}
                                                        transition={{ duration: 0.2 }}
                                                        className="text-[32px] font-bold text-white leading-none tracking-tight"
                                                    >
                                                        {price === 0 ? 'Free' : `$${price}`}
                                                        {price > 0 && <span className="text-[14px] font-normal text-white/15 ml-1">/ mo</span>}
                                                    </motion.div>
                                                </AnimatePresence>
                                                {plan.premium && isAnnual && (
                                                    <span className="text-[13px] text-white/20 line-through">${plan.monthlyPrice}</span>
                                                )}
                                            </div>
                                            <p className="text-white/25 text-[13px] mt-3">{plan.desc}</p>
                                        </div>

                                        {/* Features */}
                                        <div className="space-y-3 mb-10 flex-1 relative z-10">
                                            {plan.features.map((f) => (
                                                <div key={f.label} className="flex items-center gap-2.5">
                                                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                                                        plan.premium ? 'bg-[#C08B5C]/15' : 'bg-white/[0.06]'
                                                    }`}>
                                                        <Check className={`w-3 h-3 ${plan.premium ? 'text-[#C08B5C]' : 'text-white/25'}`} />
                                                    </div>
                                                    <span className={`text-[13px] ${plan.premium ? 'text-white/55' : 'text-white/35'}`}>
                                                        {f.label}
                                                    </span>
                                                    {f.badge && (
                                                        <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#C08B5C]/10 text-[#C08B5C] border border-[#C08B5C]/15">
                                                            {f.badge}
                                                        </span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>

                                        {/* Action Button */}
                                        <div className="mt-auto relative z-10">
                                            {subLoading ? (
                                                <div className="w-full h-12 rounded-xl bg-white/[0.04] flex items-center justify-center">
                                                    <Loader2 className="w-5 h-5 text-white/20 animate-spin" />
                                                </div>
                                            ) : isCurrent ? (
                                                plan.premium ? (
                                                    <button
                                                        onClick={handleCancelSubscription}
                                                        disabled={cancelling}
                                                        className="w-full py-3 rounded-xl text-[13px] font-medium transition-all border border-white/[0.08] text-white/35 hover:text-red-400 hover:border-red-500/25 hover:bg-red-500/[0.04]"
                                                    >
                                                        {cancelling ? 'Cancelling...' : 'Cancel Subscription'}
                                                    </button>
                                                ) : (
                                                    <div className="w-full py-3 rounded-xl bg-white/[0.04] border border-white/[0.04] flex items-center justify-center text-[13px] font-medium text-white/25 cursor-default">
                                                        Current Plan
                                                    </div>
                                                )
                                            ) : plan.premium ? (
                                                <button
                                                    onClick={() => setShowCheckout(true)}
                                                    className="w-full py-3 rounded-xl bg-[#C08B5C] text-[#0A0A0C] text-[13px] font-semibold hover:bg-[#D4A27F] transition-colors duration-300 active:scale-[0.98]"
                                                >
                                                    Upgrade to Pro
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={handleSelectFree}
                                                    disabled={selectingFree}
                                                    className="w-full py-3 rounded-xl border border-white/[0.08] text-white/50 text-[13px] font-medium hover:bg-white/[0.03] hover:border-white/[0.12] transition-all duration-300"
                                                >
                                                    {selectingFree ? 'Downgrading...' : 'Downgrade to Free'}
                                                </button>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </motion.section>

                    {/* ── FAQ Accordion ── */}
                    <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={reveal}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-base font-medium text-white">Frequently Asked Questions</h2>
                            <a href="#" className="text-[13px] text-[#C08B5C] hover:text-[#D4A27F] flex items-center gap-1 transition-colors">
                                Help Center <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                        </div>
                        <div className="space-y-1">
                            {FAQS.map((faq, i) => {
                                const isOpen = faqOpen === i;
                                return (
                                    <div
                                        key={i}
                                        className={`rounded-xl border transition-colors duration-200 ${
                                            isOpen ? 'border-[#C08B5C]/15 bg-white/[0.02]' : 'border-transparent hover:bg-white/[0.015]'
                                        }`}
                                    >
                                        <button
                                            onClick={() => setFaqOpen(isOpen ? null : i)}
                                            className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                                        >
                                            <span className={`text-[13px] font-medium transition-colors ${isOpen ? 'text-white' : 'text-white/60'}`}>
                                                {faq.q}
                                            </span>
                                            <motion.div
                                                animate={{ rotate: isOpen ? 180 : 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="flex-shrink-0"
                                            >
                                                <ChevronDown className={`w-4 h-4 transition-colors ${isOpen ? 'text-[#C08B5C]' : 'text-white/25'}`} />
                                            </motion.div>
                                        </button>
                                        <AnimatePresence initial={false}>
                                            {isOpen && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                                                    className="overflow-hidden"
                                                >
                                                    <p className="px-5 pb-4 text-[13px] text-white/40 leading-relaxed">
                                                        {faq.a}
                                                    </p>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.section>

                    {/* ── Trust Footer ── */}
                    <motion.section
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={reveal}
                        className="flex items-center justify-center gap-8 py-6 border-t border-white/[0.04]"
                    >
                        <TrustBadge icon={<StripeMark />} label="Secured by Stripe" />
                        <TrustBadge icon={<Lock className="w-3.5 h-3.5 text-white/20" />} label="256-bit encryption" />
                        <TrustBadge icon={<Check className="w-3.5 h-3.5 text-white/20" />} label="Cancel anytime" />
                    </motion.section>

                </div>
            </div>

            <CheckoutModal
                isOpen={showCheckout}
                onClose={() => setShowCheckout(false)}
                plan="pro"
                onSuccess={handleCheckoutSuccess}
            />
        </div>
    );
};

/* ── Usage Meter sub-component ── */

function UsageMeter({ icon, label, used, limit, unlimited }: {
    icon: React.ReactNode;
    label: string;
    used: number;
    limit: number;
    unlimited: boolean;
}) {
    const pct = unlimited ? 0 : limit > 0 ? Math.min((used / limit) * 100, 100) : 0;
    const nearLimit = !unlimited && limit > 0 && pct >= 80;

    return (
        <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-4">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-white/50">
                    {icon}
                    <span className="text-[13px] font-medium">{label}</span>
                </div>
                {unlimited ? (
                    <div className="flex items-center gap-1 text-[#D4A27F]">
                        <Infinity className="w-4 h-4" />
                        <span className="text-[12px] font-medium">Unlimited</span>
                    </div>
                ) : (
                    <span className={`text-[12px] font-medium ${nearLimit ? 'text-amber-400' : 'text-white/40'}`}>
                        {used} / {limit}
                    </span>
                )}
            </div>
            {!unlimited && (
                <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                    <motion.div
                        className={`h-full rounded-full ${nearLimit ? 'bg-amber-500' : 'bg-[#C08B5C]'}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                    />
                </div>
            )}
        </div>
    );
}

/* ── Trust Badge sub-component ── */

function TrustBadge({ icon, label }: { icon: React.ReactNode; label: string }) {
    return (
        <div className="flex items-center gap-2 text-white/25">
            {icon}
            <span className="text-[11px] font-medium">{label}</span>
        </div>
    );
}

/* ── Billing Line sub-component ── */

function BillingLine({ label, amount }: { label: string; amount: number }) {
    return (
        <div className="flex items-center justify-between">
            <span className="text-[13px] text-white/40">{label}</span>
            <span className="text-[13px] font-mono text-white/60">${(amount / 100).toFixed(2)}</span>
        </div>
    );
}

/* ── Stripe wordmark (simple SVG) ── */

function StripeMark() {
    return (
        <svg width="36" height="15" viewBox="0 0 60 25" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-25">
            <path
                d="M5 11.2c0-.7.6-1 1.5-1 1.4 0 3.1.4 4.5 1.2V7.1C9.5 6.5 8 6.2 6.5 6.2 2.6 6.2 0 8.2 0 11.4c0 5 6.8 4.2 6.8 6.3 0 .8-.7 1.1-1.7 1.1-1.5 0-3.4-.6-4.9-1.5v4.4C1.8 22.4 3.4 23 5.1 23c4 0 6.7-2 6.7-5.2C11.8 12.3 5 13.2 5 11.2zm13.4-5h-3v3.5h3V6.2zm0 4.6h-3v12h3v-12zm4.9 0l-.2-1h-2.8v12h3V14c.7-1 1.9-1.3 2.6-1.3.3 0 .6.1.8.1V10c-.2-.1-.6-.1-1-.1-1 0-2 .5-2.4 1.3v-.4zm7.2-4.5c-1 0-1.7.4-2.1 1l-.2-.9h-2.7v16.5l3-.6v-4c.4.3 1 .7 2 .7 2 0 3.9-1.6 3.9-5.2 0-3.3-1.9-5.2-3.9-5.5zm-.7 8c-.7 0-1.1-.2-1.4-.6V13c.3-.4.7-.7 1.4-.7 1 0 1.8 1.2 1.8 2.5s-.7 2.5-1.8 2.5zm12.2-2.5c0-2.9-1.4-5.2-4.2-5.2s-4.4 2.3-4.4 5.2c0 3.4 2 5.1 4.8 5.1 1.4 0 2.4-.3 3.2-.8v-2.3c-.8.4-1.7.6-2.8.6-1.1 0-2.1-.4-2.2-1.7h5.6v-1zm-5.6-.8c0-1.3.8-1.8 1.5-1.8s1.4.5 1.4 1.8h-2.9zm11.7-4.7c-1.1 0-1.8.5-2.2 1l-.1-.8h-2.8v12h3v-8.2c.5-.6 1.2-.8 1.7-.8.3 0 .5 0 .7.1v-3.1c-.2-.1-.6-.2-1.3-.2z"
                fill="currentColor"
            />
        </svg>
    );
}
