/**
 * Checkout Modal — Payment integration for Pro subscription
 * Uses subscriptionService for backend communication.
 */

import React, { useState } from 'react';
import { X, CreditCard, Check, AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { subscriptionService } from '../../services/subscriptionService';

interface CheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    plan: 'pro';
    isFirstMonth?: boolean;
    onSuccess?: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
    isOpen,
    onClose,
    plan,
    isFirstMonth = false,
    onSuccess,
}) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // Pricing
    const regularPrice = 100;
    const firstMonthPrice = 50;
    const price = isFirstMonth ? firstMonthPrice : regularPrice;
    const discount = isFirstMonth ? regularPrice - firstMonthPrice : 0;

    const handleCheckout = async () => {
        setIsProcessing(true);
        setError(null);

        try {
            // This will redirect to Stripe Checkout — the page will navigate away
            await subscriptionService.createCheckoutSession(plan);
            // If we're still here, something unexpected happened
        } catch (err) {
            console.error('Checkout error:', err);
            const message = err instanceof Error ? err.message : 'Payment processing failed. Please try again.';
            setError(message);
            setIsProcessing(false);
        }
    };

    const handleClose = () => {
        if (success && onSuccess) {
            onSuccess();
        }
        setError(null);
        setSuccess(false);
        setIsProcessing(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    onClick={handleClose}
                />

                {/* Modal */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-md rounded-2xl border border-white/[0.1] p-6"
                    style={{ backgroundColor: '#18181c' }}
                >
                    {/* Close Button */}
                    <button
                        onClick={handleClose}
                        className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:bg-white/[0.06] hover:text-white/60 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    {success ? (
                        /* ────── Success State ────── */
                        <div className="text-center py-8">
                            <div className="w-16 h-16 rounded-full bg-[#C08B5C]/20 flex items-center justify-center mx-auto mb-4">
                                <Check className="w-8 h-8 text-[#D4A27F]" />
                            </div>
                            <h2 className="text-2xl font-bold text-white/90 mb-2">
                                Welcome to Pro!
                            </h2>
                            <p className="text-sm text-white/50">
                                Your subscription is now active
                            </p>
                            <button
                                onClick={handleClose}
                                className="mt-6 px-6 py-2.5 rounded-lg font-medium bg-[#C08B5C] text-white hover:bg-[#A8734A] transition-colors"
                            >
                                Get Started
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* ────── Header ────── */}
                            <div className="mb-6">
                                <h2 className="text-xl font-bold text-white/90 mb-1">
                                    Upgrade to Pro
                                </h2>
                                <p className="text-[13px] text-white/40">
                                    Secure payment via Stripe
                                </p>
                            </div>

                            {/* ────── Price Summary ────── */}
                            <div className="p-4 rounded-xl mb-6 bg-[#C08B5C]/8 border border-[#C08B5C]/20">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-white/50">
                                        Pro Plan {isFirstMonth && '(First Month)'}
                                    </span>
                                    <span className="text-lg font-bold text-white/90">
                                        ${price}/month
                                    </span>
                                </div>
                                {isFirstMonth && (
                                    <>
                                        <div className="flex items-center justify-between text-sm mb-1">
                                            <span className="text-white/40">Regular price</span>
                                            <span className="text-white/40 line-through">
                                                ${regularPrice}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-emerald-400">First month discount (50%)</span>
                                            <span className="text-emerald-400">-${discount}</span>
                                        </div>
                                        <div className="mt-3 pt-3 border-t border-[#C08B5C]/20">
                                            <div className="flex items-center justify-between">
                                                <span className="font-semibold text-white/85">
                                                    Due Today
                                                </span>
                                                <span className="text-2xl font-bold text-[#D4A27F]">
                                                    ${firstMonthPrice}
                                                </span>
                                            </div>
                                            <p className="text-[11px] mt-1 text-white/35">
                                                Then ${regularPrice}/month starting next month
                                            </p>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* ────── What you get ────── */}
                            <div className="mb-6 space-y-2">
                                {[
                                    'Unlimited property analyses',
                                    'All reasoning modes (Hunter, Research, Strategist)',
                                    'Advanced market insights & PDF reports',
                                    'Portfolio tracking & priority support',
                                ].map((feature) => (
                                    <div key={feature} className="flex items-start gap-2">
                                        <Check className="w-3.5 h-3.5 text-[#D4A27F] flex-shrink-0 mt-0.5" />
                                        <span className="text-[12px] text-white/55">{feature}</span>
                                    </div>
                                ))}
                            </div>

                            {/* ────── Error Message ────── */}
                            {error && (
                                <div className="p-3 rounded-lg mb-4 flex items-start gap-2 bg-red-500/10 border border-red-500/20">
                                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                                    <p className="text-[12px] text-red-300">{error}</p>
                                </div>
                            )}

                            {/* ────── Checkout Button ────── */}
                            <button
                                onClick={handleCheckout}
                                disabled={isProcessing}
                                className={`w-full py-3 rounded-lg font-semibold text-[14px] transition-all flex items-center justify-center gap-2 ${
                                    isProcessing
                                        ? 'bg-white/[0.1] text-white/40 cursor-not-allowed'
                                        : 'bg-[#C08B5C] text-white hover:bg-[#A8734A]'
                                }`}
                            >
                                {isProcessing ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Redirecting to checkout…
                                    </>
                                ) : (
                                    <>
                                        <CreditCard className="w-4 h-4" />
                                        Continue to Checkout — ${price}
                                    </>
                                )}
                            </button>

                            {/* ────── Terms ────── */}
                            <p className="text-[10px] text-center mt-4 text-white/25">
                                By subscribing you agree to our{' '}
                                <a href="/terms-of-service" target="_blank" rel="noopener noreferrer" className="underline hover:text-white/40">Terms of Service</a>
                                {' '}and{' '}
                                <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="underline hover:text-white/40">Privacy Policy</a>.
                                {' '}Cancel anytime.
                            </p>
                        </>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
