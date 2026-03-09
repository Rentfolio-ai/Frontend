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
                        className="relative w-full max-w-md bg-popover border border-black/8 rounded-2xl shadow-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-black/8">
                            <h2 className="text-xl font-bold text-foreground">Refer a Friend</h2>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-lg text-muted-foreground/70 hover:text-foreground hover:bg-black/5 transition-all"
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
                                <h3 className="text-2xl font-bold text-foreground mb-2">
                                    Give $20, Get $20
                                </h3>
                                <p className="text-muted-foreground">
                                    When your friend upgrades, you both get $20 in credits
                                </p>
                            </div>

                            {/* How it works */}
                            <div className="bg-black/[0.02] rounded-xl p-4 space-y-3">
                                <h4 className="text-sm font-semibold text-foreground/80">How it works</h4>
                                <ol className="space-y-2 text-sm text-muted-foreground">
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
                                <label className="text-xs text-muted-foreground/70 uppercase tracking-wider">
                                    Your referral link
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        readOnly
                                        value={referralLink}
                                        className="flex-1 bg-black/[0.04] border border-black/8 rounded-lg 
                               px-3 py-2.5 text-foreground text-sm focus:outline-none 
                               focus:border-[#C08B5C]/30 focus:ring-2 focus:ring-[#C08B5C]/20"
                                    />
                                    <button
                                        onClick={handleCopy}
                                        className="px-4 py-2.5 bg-gradient-to-r from-[#C08B5C] to-purple-500 
                               hover:from-[#D4A27F] hover:to-purple-400 
                               rounded-lg text-foreground font-medium text-sm 
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
                                <div className="bg-black/[0.02] rounded-lg p-3 text-center border border-black/5">
                                    <div className="text-2xl font-bold text-foreground">0</div>
                                    <div className="text-xs text-muted-foreground mt-1">Referrals</div>
                                </div>
                                <div className="bg-black/[0.02] rounded-lg p-3 text-center border border-black/5">
                                    <div className="text-2xl font-bold text-[#D4A27F]">$0</div>
                                    <div className="text-xs text-muted-foreground mt-1">Earned</div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
