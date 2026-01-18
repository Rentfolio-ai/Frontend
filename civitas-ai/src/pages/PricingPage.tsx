/**
 * Pricing Page - Full page experience
 * Like Claude and Notion's upgrade pages
 * Minimal, professional, focused
 */

import React from 'react';
import { Check, ArrowLeft } from 'lucide-react';

interface PricingPageProps {
    onBack?: () => void;
}

export const PricingPage: React.FC<PricingPageProps> = ({ onBack }) => {
    return (
        <div className="min-h-screen bg-[#1a1a1a] flex flex-col">
            {/* Header */}
            <div className="border-b border-white/[0.06]">
                <div className="max-w-5xl mx-auto px-8 py-6">
                    <div className="flex items-center justify-between">
                        {onBack && (
                            <button
                                onClick={onBack}
                                className="flex items-center gap-2 text-white/60 hover:text-white/90 transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                <span className="text-sm">Back</span>
                            </button>
                        )}
                        <div className="flex items-center gap-2 ml-auto">
                            <div className="w-6 h-6 rounded flex items-center justify-center">
                                <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
                                    <path d="M12 3L4 9V21H9V14H15V21H20V9L12 3Z" stroke="#fff" strokeWidth="1.5" strokeOpacity="0.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                                </svg>
                            </div>
                            <span className="text-sm font-medium text-white/70">Vasthu</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-5xl mx-auto px-8 py-16">
                    {/* Hero Section */}
                    <div className="text-center mb-16">
                        <h1 className="text-4xl font-semibold text-white mb-4">
                            Choose your plan
                        </h1>
                        <p className="text-lg text-white/50 max-w-2xl mx-auto">
                            Get unlimited access to AI-powered real estate insights
                        </p>
                    </div>

                    {/* Pricing Cards */}
                    <div className="grid grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
                        {/* Explorer Plan */}
                        <div className="p-10 rounded-2xl border border-white/[0.08] hover:border-white/[0.12] transition-colors bg-white/[0.02]">
                            <div className="mb-10">
                                <h3 className="text-xl font-semibold text-white mb-8">Explorer</h3>
                                <div className="mb-8">
                                    <div className="flex items-baseline gap-1 mb-2">
                                        <span className="text-6xl font-semibold text-white">$0</span>
                                        <span className="text-white/40 text-lg">/month</span>
                                    </div>
                                    <p className="text-sm text-white/40">Perfect for getting started</p>
                                </div>
                            </div>

                            <ul className="space-y-4 mb-12">
                                <li className="flex items-start gap-3">
                                    <Check className="w-5 h-5 text-white/30 flex-shrink-0 mt-0.5" />
                                    <span className="text-[15px] text-white/60">1 property query per month</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Check className="w-5 h-5 text-white/30 flex-shrink-0 mt-0.5" />
                                    <span className="text-[15px] text-white/60">Basic yield reports</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Check className="w-5 h-5 text-white/30 flex-shrink-0 mt-0.5" />
                                    <span className="text-[15px] text-white/60">Community support</span>
                                </li>
                            </ul>

                            <button
                                disabled
                                className="w-full py-3 border border-white/[0.12] rounded-lg text-white/50 text-sm font-medium"
                            >
                                Current plan
                            </button>
                        </div>

                        {/* Professional Plan */}
                        <div className="relative p-10 rounded-2xl border border-white/[0.15] hover:border-white/[0.20] transition-colors bg-white/[0.03]">
                            {/* Badge */}
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-white/[0.10] border border-white/[0.15] rounded-full">
                                <span className="text-xs font-medium text-white/80">RECOMMENDED</span>
                            </div>

                            <div className="mb-10">
                                <h3 className="text-xl font-semibold text-white mb-8">Professional</h3>
                                <div className="mb-6">
                                    <div className="flex items-baseline gap-1 mb-3">
                                        <span className="text-6xl font-semibold text-white">$50</span>
                                        <span className="text-white/40 text-lg">/month</span>
                                    </div>
                                    <div className="inline-block px-3 py-1.5 bg-white/[0.05] border border-white/[0.08] rounded-lg mb-2">
                                        <span className="text-xs text-white/50">First month special • Then $100/mo</span>
                                    </div>
                                    <p className="text-xs text-white/30 mt-2">Cancel anytime, no questions asked</p>
                                </div>
                            </div>

                            <ul className="space-y-4 mb-12">
                                <li className="flex items-start gap-3">
                                    <Check className="w-5 h-5 text-white/70 flex-shrink-0 mt-0.5" />
                                    <span className="text-[15px] text-white/90">Unlimited property queries</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Check className="w-5 h-5 text-white/70 flex-shrink-0 mt-0.5" />
                                    <span className="text-[15px] text-white/90">Advanced AI simulation</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Check className="w-5 h-5 text-white/70 flex-shrink-0 mt-0.5" />
                                    <span className="text-[15px] text-white/90">Investment-grade reports</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Check className="w-5 h-5 text-white/70 flex-shrink-0 mt-0.5" />
                                    <span className="text-[15px] text-white/90">Priority support</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Check className="w-5 h-5 text-white/70 flex-shrink-0 mt-0.5" />
                                    <span className="text-[15px] text-white/90">Export to PDF</span>
                                </li>
                            </ul>

                            <button className="w-full py-3 bg-white hover:bg-white/90 rounded-lg text-[#1a1a1a] text-sm font-semibold transition-all">
                                Upgrade now
                            </button>
                        </div>
                    </div>

                    {/* Footer Note */}
                    <p className="text-center text-sm text-white/30 mb-16">
                        All plans include access to our AI assistant and basic analytics
                    </p>

                    {/* FAQ Section */}
                    <div className="max-w-3xl mx-auto">
                        <h2 className="text-2xl font-semibold text-white mb-8 text-center">
                            Frequently asked questions
                        </h2>
                        <div className="space-y-3">
                            {[
                                {
                                    q: 'Can I cancel anytime?',
                                    a: 'Yes, you can cancel your subscription at any time. No questions asked, no penalties.'
                                },
                                {
                                    q: 'What payment methods do you accept?',
                                    a: 'We accept all major credit cards and debit cards through our secure payment processor.'
                                },
                                {
                                    q: 'Do you offer refunds?',
                                    a: 'Yes, we offer a 30-day money-back guarantee. If you\'re not satisfied, we\'ll refund your payment.'
                                }
                            ].map((faq, idx) => (
                                <details
                                    key={idx}
                                    className="group border border-white/[0.08] rounded-lg overflow-hidden hover:border-white/[0.12] transition-colors"
                                >
                                    <summary className="px-6 py-4 cursor-pointer text-sm font-medium text-white/90 hover:bg-white/[0.02] transition-colors">
                                        {faq.q}
                                    </summary>
                                    <div className="px-6 pb-4 border-t border-white/[0.06] pt-4">
                                        <p className="text-sm text-white/60 leading-relaxed">{faq.a}</p>
                                    </div>
                                </details>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
