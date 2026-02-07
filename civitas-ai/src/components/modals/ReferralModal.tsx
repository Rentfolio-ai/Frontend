/**
 * Referral Modal Component
 * 
 * Displays referral program information and share link
 */

import React, { useState } from 'react';
import { X, Gift, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ReferralModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ReferralModal: React.FC<ReferralModalProps> = ({ isOpen, onClose }) => {
    const [copied, setCopied] = useState(false);

    // TODO: Get actual referral code from user profile
    const referralLink = "https://civitasai.com/ref/ABC123";

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(referralLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-md bg-[#0F1117] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-white/10">
                            <h2 className="text-xl font-bold text-white">Refer a Friend</h2>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-all"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-6">
                            {/* Icon & Title */}
                            <div className="text-center">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl 
                                bg-gradient-to-br from-purple-500/20 to-pink-500/20 
                                border border-purple-500/30
                                flex items-center justify-center">
                                    <Gift className="w-8 h-8 text-purple-400" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">
                                    Give $20, Get $20
                                </h3>
                                <p className="text-white/60">
                                    When your friend upgrades, you both get $20 in credits
                                </p>
                            </div>

                            {/* How it works */}
                            <div className="bg-white/[0.02] rounded-xl p-4 space-y-3">
                                <h4 className="text-sm font-semibold text-white/80">How it works</h4>
                                <ol className="space-y-2 text-sm text-white/60">
                                    <li className="flex gap-3">
                                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#C08B5C]/20 
                                     text-[#D4A27F] text-xs flex items-center justify-center font-bold">
                                            1
                                        </span>
                                        <span>Share your unique referral link</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#C08B5C]/20 
                                     text-[#D4A27F] text-xs flex items-center justify-center font-bold">
                                            2
                                        </span>
                                        <span>Your friend signs up and upgrades to Pro</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#C08B5C]/20 
                                     text-[#D4A27F] text-xs flex items-center justify-center font-bold">
                                            3
                                        </span>
                                        <span>You both receive $20 in account credits</span>
                                    </li>
                                </ol>
                            </div>

                            {/* Referral Link */}
                            <div className="space-y-2">
                                <label className="text-xs text-white/40 uppercase tracking-wider">
                                    Your referral link
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        readOnly
                                        value={referralLink}
                                        className="flex-1 bg-white/[0.05] border border-white/10 rounded-lg 
                               px-3 py-2.5 text-white text-sm focus:outline-none 
                               focus:border-[#C08B5C]/30 focus:ring-2 focus:ring-[#C08B5C]/20"
                                    />
                                    <button
                                        onClick={handleCopy}
                                        className="px-4 py-2.5 bg-gradient-to-r from-[#C08B5C] to-purple-500 
                               hover:from-[#D4A27F] hover:to-purple-400 
                               rounded-lg text-white font-medium text-sm 
                               transition-all shadow-lg shadow-[#C08B5C]/20
                               flex items-center gap-2"
                                    >
                                        {copied ? (
                                            <>
                                                <Check className="w-4 h-4" />
                                                Copied
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="w-4 h-4" />
                                                Copy
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Stats (optional - could be dynamic) */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white/[0.02] rounded-lg p-3 text-center border border-white/5">
                                    <div className="text-2xl font-bold text-white">0</div>
                                    <div className="text-xs text-white/50 mt-1">Referrals</div>
                                </div>
                                <div className="bg-white/[0.02] rounded-lg p-3 text-center border border-white/5">
                                    <div className="text-2xl font-bold text-[#D4A27F]">$0</div>
                                    <div className="text-xs text-white/50 mt-1">Earned</div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
