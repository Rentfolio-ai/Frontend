/**
 * Upgrade Page - Full Page View
 * Beautiful pricing and plan comparison
 */

import React, { useState } from 'react';
import { ArrowLeft, Check, Zap, Star, Crown } from 'lucide-react';
import { CheckoutModal } from '../payments/CheckoutModal';

interface UpgradePageProps {
    onBack: () => void;
}

export const UpgradePage: React.FC<UpgradePageProps> = ({ onBack }) => {
    const [showCheckout, setShowCheckout] = useState(false);
    const [isFirstMonth, setIsFirstMonth] = useState(true);

    const PricingCard: React.FC<{
        name: string;
        price: string;
        period: string;
        description: string;
        features: string[];
        isPopular?: boolean;
        isPremium?: boolean;
        icon: React.ElementType;
    }> = ({ name, price, period, description, features, isPopular, isPremium, icon: Icon }) => (
        <div
            className="relative p-6 rounded-2xl transition-all"
            style={{
                backgroundColor: isPremium ? 'rgba(20, 184, 166, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                border: isPremium ? '2px solid rgba(20, 184, 166, 0.3)' : '1px solid rgba(148, 163, 184, 0.12)',
            }}
        >
            {isPopular && (
                <div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-semibold"
                    style={{
                        backgroundColor: '#14B8A6',
                        color: '#FFFFFF',
                    }}
                >
                    Most Popular
                </div>
            )}

            <div className="flex items-center gap-3 mb-4">
                <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{
                        backgroundColor: isPremium ? 'rgba(20, 184, 166, 0.2)' : 'rgba(148, 163, 184, 0.1)',
                        color: isPremium ? '#14B8A6' : '#94A3B8',
                    }}
                >
                    <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold" style={{ color: '#F1F5F9' }}>
                    {name}
                </h3>
            </div>

            <p className="text-sm mb-6" style={{ color: '#94A3B8' }}>
                {description}
            </p>

            <div className="mb-6">
                <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold" style={{ color: '#F1F5F9' }}>
                        {price}
                    </span>
                    <span className="text-sm" style={{ color: '#94A3B8' }}>
                        {period}
                    </span>
                </div>
            </div>

            <button
                onClick={() => {
                    if (isPremium) {
                        setShowCheckout(true);
                    }
                }}
                className="w-full py-3 rounded-lg text-sm font-semibold transition-all mb-6"
                style={{
                    backgroundColor: isPremium ? '#14B8A6' : 'rgba(148, 163, 184, 0.2)',
                    color: isPremium ? '#FFFFFF' : '#F1F5F9',
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = isPremium ? '#0D9488' : 'rgba(148, 163, 184, 0.3)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = isPremium ? '#14B8A6' : 'rgba(148, 163, 184, 0.2)';
                }}
            >
                {isPremium ? 'Upgrade Now' : 'Current Plan'}
            </button>

            <div className="space-y-3">
                {features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                        <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#14B8A6' }} />
                        <span className="text-sm" style={{ color: '#CBD5E1' }}>
                            {feature}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="h-full flex flex-col" style={{ backgroundColor: '#334155' }}>
            {/* Header */}
            <div
                className="flex items-center gap-4 px-6 py-4 border-b"
                style={{ borderColor: 'rgba(148, 163, 184, 0.15)' }}
            >
                <button
                    onClick={onBack}
                    className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
                    style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        color: '#E2E8F0',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'}
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: '#F1F5F9' }}>
                        Billing & Subscriptions
                    </h1>
                    <p className="text-sm" style={{ color: '#94A3B8' }}>
                        Manage your plan and billing information
                    </p>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-6xl mx-auto">
                    {/* Per-Action Pricing Notice */}
                    <div className="mb-6 max-w-4xl mx-auto">
                        <div className="p-4 rounded-lg border" style={{ 
                            backgroundColor: 'rgba(20, 184, 166, 0.05)',
                            borderColor: 'rgba(20, 184, 166, 0.2)'
                        }}>
                            <div className="flex items-start gap-3">
                                <div className="text-xl">💳</div>
                                <div>
                                    <h3 className="text-sm font-semibold text-white/90 mb-1">Per-Action Charges</h3>
                                    <p className="text-xs text-white/70">
                                        <strong>Report Downloads:</strong> $2.00 each (viewing reports is always free)
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Plans Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 max-w-4xl mx-auto">
                        <PricingCard
                            name="Free"
                            price="$0"
                            period="/month"
                            description="Get started with basic features"
                            icon={Zap}
                            features={[
                                '10 property analyses per month',
                                'Quick reasoning mode',
                                'Basic market insights',
                                'Email support',
                            ]}
                        />

                        <div className="relative">
                            {/* 50% Off Badge */}
                            <div
                                className="absolute -top-3 right-4 px-3 py-1 rounded-full text-xs font-bold z-10"
                                style={{
                                    backgroundColor: '#F59E0B',
                                    color: '#FFFFFF',
                                }}
                            >
                                50% OFF First Month
                            </div>
                            <PricingCard
                                name="Pro"
                                price="$100"
                                period="/month"
                                description="For serious investors"
                                icon={Star}
                                isPopular
                                isPremium
                                features={[
                                    'Unlimited property analyses',
                                    'All reasoning modes (Quick, Smart, Deep)',
                                    'Advanced market insights',
                                    'PDF report generation',
                                    'Portfolio tracking',
                                    'Priority support',
                                    'API access',
                                    'Advanced analytics',
                                ]}
                            />
                        </div>
                    </div>

                    {/* FAQ */}
                    <div
                        className="p-6 rounded-xl"
                        style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid rgba(148, 163, 184, 0.12)',
                        }}
                    >
                        <h2 className="text-lg font-semibold mb-4" style={{ color: '#F1F5F9' }}>
                            Frequently Asked Questions
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <h4 className="text-sm font-medium mb-1" style={{ color: '#F1F5F9' }}>
                                    Can I change plans later?
                                </h4>
                                <p className="text-sm" style={{ color: '#94A3B8' }}>
                                    Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
                                </p>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium mb-1" style={{ color: '#F1F5F9' }}>
                                    What payment methods do you accept?
                                </h4>
                                <p className="text-sm" style={{ color: '#94A3B8' }}>
                                    We accept all major credit cards, debit cards, and PayPal.
                                </p>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium mb-1" style={{ color: '#F1F5F9' }}>
                                    What's the first month discount?
                                </h4>
                                <p className="text-sm" style={{ color: '#94A3B8' }}>
                                    New Pro subscribers get 50% off their first month ($50 instead of $100). Cancel anytime.
                                </p>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium mb-1" style={{ color: '#F1F5F9' }}>
                                    Are there any additional charges?
                                </h4>
                                <p className="text-sm" style={{ color: '#94A3B8' }}>
                                    Report downloads are $2.00 each (viewing is free). All other features are included in your plan.
                                </p>
                            </div>
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
            />
        </div>
    );
};
