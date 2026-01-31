/**
 * Checkout Modal - Payment integration for Pro subscription
 * Supports: Stripe, Apple Pay, PayPal
 */

import React, { useState } from 'react';
import { X, CreditCard, Smartphone, Check, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    plan: 'pro';
    isFirstMonth?: boolean;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
    isOpen,
    onClose,
    plan,
    isFirstMonth = false,
}) => {
    const [selectedMethod, setSelectedMethod] = useState<'stripe' | 'apple' | 'paypal'>('stripe');
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
            // Call your backend to create checkout session
            const response = await fetch('/api/billing/create-checkout-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-User-ID': localStorage.getItem('user_id') || '',
                },
                body: JSON.stringify({
                    tier: plan,
                    payment_method: selectedMethod,
                    is_first_month: isFirstMonth,
                    success_url: window.location.origin + '/success',
                    cancel_url: window.location.origin + '/upgrade',
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to create checkout session');
            }

            const data = await response.json();

            if (selectedMethod === 'stripe' || selectedMethod === 'apple') {
                // Redirect to Stripe checkout
                window.location.href = data.checkout_url;
            } else if (selectedMethod === 'paypal') {
                // Redirect to PayPal
                window.location.href = data.paypal_url;
            }
        } catch (err) {
            console.error('Checkout error:', err);
            setError('Payment processing failed. Please try again.');
            setIsProcessing(false);
        }
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
                    onClick={onClose}
                />

                {/* Modal */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-md rounded-2xl p-6"
                    style={{
                        backgroundColor: '#1E293B',
                        border: '1px solid rgba(148, 163, 184, 0.2)',
                    }}
                >
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                        style={{ color: '#94A3B8' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(148, 163, 184, 0.1)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                        <X className="w-5 h-5" />
                    </button>

                    {success ? (
                        // Success State
                        <div className="text-center py-8">
                            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                                <Check className="w-8 h-8 text-green-400" />
                            </div>
                            <h2 className="text-2xl font-bold mb-2" style={{ color: '#F1F5F9' }}>
                                Welcome to Pro!
                            </h2>
                            <p className="text-sm" style={{ color: '#94A3B8' }}>
                                Your subscription is now active
                            </p>
                            <button
                                onClick={onClose}
                                className="mt-6 px-6 py-2 rounded-lg font-medium"
                                style={{ backgroundColor: '#14B8A6', color: '#FFFFFF' }}
                            >
                                Get Started
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Header */}
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold mb-2" style={{ color: '#F1F5F9' }}>
                                    Upgrade to Pro
                                </h2>
                                <p className="text-sm" style={{ color: '#94A3B8' }}>
                                    Choose your payment method
                                </p>
                            </div>

                            {/* Price Summary */}
                            <div
                                className="p-4 rounded-xl mb-6"
                                style={{
                                    backgroundColor: 'rgba(20, 184, 166, 0.1)',
                                    border: '1px solid rgba(20, 184, 166, 0.3)',
                                }}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm" style={{ color: '#94A3B8' }}>
                                        Pro Plan {isFirstMonth && '(First Month)'}
                                    </span>
                                    <span className="text-lg font-bold" style={{ color: '#F1F5F9' }}>
                                        ${price}/month
                                    </span>
                                </div>
                                {isFirstMonth && (
                                    <>
                                        <div className="flex items-center justify-between text-sm mb-1">
                                            <span style={{ color: '#94A3B8' }}>Regular price</span>
                                            <span style={{ color: '#94A3B8', textDecoration: 'line-through' }}>
                                                ${regularPrice}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span style={{ color: '#10B981' }}>First month discount (50%)</span>
                                            <span style={{ color: '#10B981' }}>-${discount}</span>
                                        </div>
                                        <div className="mt-3 pt-3 border-t" style={{ borderColor: 'rgba(20, 184, 166, 0.3)' }}>
                                            <div className="flex items-center justify-between">
                                                <span className="font-semibold" style={{ color: '#F1F5F9' }}>
                                                    Due Today
                                                </span>
                                                <span className="text-2xl font-bold" style={{ color: '#14B8A6' }}>
                                                    ${firstMonthPrice}
                                                </span>
                                            </div>
                                            <p className="text-xs mt-1" style={{ color: '#94A3B8' }}>
                                                Then ${regularPrice}/month starting next month
                                            </p>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Payment Methods */}
                            <div className="space-y-3 mb-6">
                                {/* Stripe / Credit Card */}
                                <button
                                    onClick={() => setSelectedMethod('stripe')}
                                    className="w-full p-4 rounded-xl text-left transition-all"
                                    style={{
                                        backgroundColor: selectedMethod === 'stripe' ? 'rgba(20, 184, 166, 0.1)' : 'rgba(148, 163, 184, 0.05)',
                                        border: selectedMethod === 'stripe' ? '2px solid #14B8A6' : '1px solid rgba(148, 163, 184, 0.1)',
                                    }}
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                                            style={{
                                                backgroundColor: selectedMethod === 'stripe' ? 'rgba(20, 184, 166, 0.2)' : 'rgba(148, 163, 184, 0.1)',
                                            }}
                                        >
                                            <CreditCard className="w-5 h-5" style={{ color: selectedMethod === 'stripe' ? '#14B8A6' : '#94A3B8' }} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-semibold text-sm" style={{ color: '#F1F5F9' }}>
                                                Credit / Debit Card
                                            </div>
                                            <div className="text-xs" style={{ color: '#94A3B8' }}>
                                                Visa, Mastercard, Amex, Discover
                                            </div>
                                        </div>
                                        {selectedMethod === 'stripe' && (
                                            <div className="w-5 h-5 rounded-full bg-teal-500 flex items-center justify-center">
                                                <Check className="w-3 h-3 text-white" />
                                            </div>
                                        )}
                                    </div>
                                </button>

                                {/* Apple Pay */}
                                <button
                                    onClick={() => setSelectedMethod('apple')}
                                    className="w-full p-4 rounded-xl text-left transition-all"
                                    style={{
                                        backgroundColor: selectedMethod === 'apple' ? 'rgba(20, 184, 166, 0.1)' : 'rgba(148, 163, 184, 0.05)',
                                        border: selectedMethod === 'apple' ? '2px solid #14B8A6' : '1px solid rgba(148, 163, 184, 0.1)',
                                    }}
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                                            style={{
                                                backgroundColor: selectedMethod === 'apple' ? 'rgba(20, 184, 166, 0.2)' : 'rgba(148, 163, 184, 0.1)',
                                            }}
                                        >
                                            <Smartphone className="w-5 h-5" style={{ color: selectedMethod === 'apple' ? '#14B8A6' : '#94A3B8' }} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-semibold text-sm" style={{ color: '#F1F5F9' }}>
                                                Apple Pay
                                            </div>
                                            <div className="text-xs" style={{ color: '#94A3B8' }}>
                                                Fast & secure with Touch ID
                                            </div>
                                        </div>
                                        {selectedMethod === 'apple' && (
                                            <div className="w-5 h-5 rounded-full bg-teal-500 flex items-center justify-center">
                                                <Check className="w-3 h-3 text-white" />
                                            </div>
                                        )}
                                    </div>
                                </button>

                                {/* PayPal */}
                                <button
                                    onClick={() => setSelectedMethod('paypal')}
                                    className="w-full p-4 rounded-xl text-left transition-all"
                                    style={{
                                        backgroundColor: selectedMethod === 'paypal' ? 'rgba(20, 184, 166, 0.1)' : 'rgba(148, 163, 184, 0.05)',
                                        border: selectedMethod === 'paypal' ? '2px solid #14B8A6' : '1px solid rgba(148, 163, 184, 0.1)',
                                    }}
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                                            style={{
                                                backgroundColor: selectedMethod === 'paypal' ? 'rgba(20, 184, 166, 0.2)' : 'rgba(148, 163, 184, 0.1)',
                                            }}
                                        >
                                            {/* PayPal Logo (simplified) */}
                                            <div className="text-lg font-bold" style={{ color: selectedMethod === 'paypal' ? '#14B8A6' : '#94A3B8' }}>
                                                P
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-semibold text-sm" style={{ color: '#F1F5F9' }}>
                                                PayPal
                                            </div>
                                            <div className="text-xs" style={{ color: '#94A3B8' }}>
                                                Pay with your PayPal account
                                            </div>
                                        </div>
                                        {selectedMethod === 'paypal' && (
                                            <div className="w-5 h-5 rounded-full bg-teal-500 flex items-center justify-center">
                                                <Check className="w-3 h-3 text-white" />
                                            </div>
                                        )}
                                    </div>
                                </button>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div
                                    className="p-3 rounded-lg mb-4 flex items-start gap-2"
                                    style={{
                                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                        border: '1px solid rgba(239, 68, 68, 0.3)',
                                    }}
                                >
                                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                                    <p className="text-sm text-red-300">{error}</p>
                                </div>
                            )}

                            {/* Checkout Button */}
                            <button
                                onClick={handleCheckout}
                                disabled={isProcessing}
                                className="w-full py-3 rounded-lg font-semibold transition-all"
                                style={{
                                    backgroundColor: isProcessing ? 'rgba(148, 163, 184, 0.3)' : '#14B8A6',
                                    color: '#FFFFFF',
                                }}
                                onMouseEnter={(e) => {
                                    if (!isProcessing) e.currentTarget.style.backgroundColor = '#0D9488';
                                }}
                                onMouseLeave={(e) => {
                                    if (!isProcessing) e.currentTarget.style.backgroundColor = '#14B8A6';
                                }}
                            >
                                {isProcessing ? 'Processing...' : `Continue to Checkout - $${price}`}
                            </button>

                            {/* Terms */}
                            <p className="text-xs text-center mt-4" style={{ color: '#64748B' }}>
                                By subscribing, you agree to our Terms of Service and Privacy Policy.
                                You can cancel anytime.
                            </p>
                        </>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
