import React, { useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { createPortal } from 'react-dom';

interface PricingModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const PricingModal: React.FC<PricingModalProps> = ({ isOpen, onClose }) => {
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            {/* Modal */}
            <div className="relative w-full max-w-4xl bg-[#1a1a1a] rounded-2xl shadow-2xl overflow-hidden">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-5 right-5 p-2 hover:bg-white/10 rounded-lg transition-colors z-10"
                >
                    <X className="w-5 h-5 text-white/60" />
                </button>

                {/* Header */}
                <div className="px-8 pt-10 pb-8 text-center border-b border-white/10">
                    <h2 className="text-3xl font-bold text-white mb-2">
                        Upgrade to Professional
                    </h2>
                    <p className="text-white/60">
                        Get unlimited access to AI-powered real estate insights
                    </p>
                </div>

                {/* Pricing Grid */}
                <div className="p-8">
                    <div className="grid grid-cols-2 gap-6 max-w-3xl mx-auto">
                        {/* Free Tier */}
                        <div className="p-6 rounded-xl border border-white/10 bg-white/[0.02]">
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-white mb-1">Explorer</h3>
                                <div className="flex items-baseline gap-2 mb-1">
                                    <span className="text-4xl font-bold text-white">$0</span>
                                    <span className="text-white/50">/month</span>
                                </div>
                                <p className="text-sm text-white/50">For getting started</p>
                            </div>

                            <ul className="space-y-3 mb-6">
                                <li className="flex items-start gap-2">
                                    <Check className="w-5 h-5 text-white/40 flex-shrink-0 mt-0.5" />
                                    <span className="text-sm text-white/70">1 property query per month</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Check className="w-5 h-5 text-white/40 flex-shrink-0 mt-0.5" />
                                    <span className="text-sm text-white/70">Basic yield report</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Check className="w-5 h-5 text-white/40 flex-shrink-0 mt-0.5" />
                                    <span className="text-sm text-white/70">Community support</span>
                                </li>
                            </ul>

                            <button
                                onClick={onClose}
                                className="w-full py-2.5 border border-white/20 rounded-lg text-white/70 font-medium hover:bg-white/5 transition-colors"
                            >
                                Current plan
                            </button>
                        </div>

                        {/* Pro Tier */}
                        <div className="relative p-6 rounded-xl border-2 border-[#C08B5C]/50 bg-gradient-to-br from-[#C08B5C]/10 to-purple-500/10">
                            {/* Popular Badge */}
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#C08B5C] rounded-full">
                                <span className="text-xs font-semibold text-white">RECOMMENDED</span>
                            </div>

                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-white mb-1">Professional</h3>
                                <div className="flex items-baseline gap-2 mb-2">
                                    <span className="text-4xl font-bold text-white">$50</span>
                                    <span className="text-white/50">/month</span>
                                </div>
                                <div className="inline-block px-2.5 py-1 bg-[#C08B5C]/20 border border-[#C08B5C]/30 rounded text-xs font-medium text-[#D4A27F] mb-1">
                                    First month only • Then $100/month
                                </div>
                                <p className="text-xs text-white/50 mt-1">Cancel anytime</p>
                            </div>

                            <ul className="space-y-3 mb-6">
                                <li className="flex items-start gap-2">
                                    <Check className="w-5 h-5 text-[#D4A27F] flex-shrink-0 mt-0.5" />
                                    <span className="text-sm text-white font-medium">Unlimited property queries</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Check className="w-5 h-5 text-[#D4A27F] flex-shrink-0 mt-0.5" />
                                    <span className="text-sm text-white font-medium">Advanced AI simulation</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Check className="w-5 h-5 text-[#D4A27F] flex-shrink-0 mt-0.5" />
                                    <span className="text-sm text-white font-medium">Investment-grade reports</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Check className="w-5 h-5 text-[#D4A27F] flex-shrink-0 mt-0.5" />
                                    <span className="text-sm text-white font-medium">Priority support</span>
                                </li>
                            </ul>

                            <button className="w-full py-2.5 bg-[#C08B5C] hover:bg-[#A8734A] rounded-lg text-white font-semibold transition-colors">
                                Upgrade now
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};
