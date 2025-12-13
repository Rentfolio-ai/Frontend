/**
 * FAQ Modal Component
 * 
 * Searchable FAQ with categories, expandable answers, and helpful feedback
 */

import React, { useState, useEffect } from 'react';
import { X, Search, ThumbsUp, ThumbsDown, ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { getFAQs, markFAQHelpful, type FAQ, type FAQCategory } from '../services/faqApi';
import { motion, AnimatePresence } from 'framer-motion';

interface FAQModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const FAQModal: React.FC<FAQModalProps> = ({ isOpen, onClose }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [faqs, setFaqs] = useState<Record<string, FAQ[]>>({});
    const [categories, setCategories] = useState<Record<string, FAQCategory>>({});
    const [expandedFAQs, setExpandedFAQs] = useState<Set<string>>(new Set());
    const [feedbackGiven, setFeedbackGiven] = useState<Set<string>>(new Set());

    // Load FAQs
    useEffect(() => {
        if (isOpen) {
            loadFAQs();
        }
    }, [isOpen, selectedCategory, searchQuery]);

    const loadFAQs = async () => {
        const data = await getFAQs(selectedCategory || undefined, searchQuery || undefined);
        setFaqs(data.faqs);
        setCategories(data.categories);
    };

    const toggleFAQ = (faqId: string) => {
        const newExpanded = new Set(expandedFAQs);
        if (newExpanded.has(faqId)) {
            newExpanded.delete(faqId);
        } else {
            newExpanded.add(faqId);
        }
        setExpandedFAQs(newExpanded);
    };

    const handleFeedback = async (faqId: string, helpful: boolean) => {
        await markFAQHelpful(faqId, helpful);
        setFeedbackGiven(new Set(feedbackGiven).add(faqId));
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
                        className="relative w-full max-w-3xl bg-[#0F1117] border border-transparent rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/[0.02]">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-transparent flex items-center justify-center">
                                    <HelpCircle className="w-5 h-5 text-purple-400" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">Help Center</h2>
                                    <p className="text-sm text-white/50">Find answers and support</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-lg text-white/40 hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.3)] transition-all"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Search */}
                        <div className="p-6 border-b border-white/10 bg-white/[0.01]">
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-blue-400 group-focus-within:drop-shadow-[0_0_6px_rgba(59,130,246,0.6)] transition-all" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search for answers..."
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:border-transparent focus:ring-2 focus:ring-blue-500/30 transition-all"
                                />
                            </div>
                        </div>

                        {/* Categories */}
                        <div className="px-6 pt-6 pb-2">
                            <div className="flex flex-wrap gap-4">
                                <button
                                    onClick={() => setSelectedCategory(null)}
                                    className={`text-sm font-medium transition-all relative ${selectedCategory === null
                                        ? 'text-transparent bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text'
                                        : 'text-white/60 hover:text-white'
                                        }`}
                                >
                                    All
                                    {selectedCategory === null && (
                                        <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full" />
                                    )}
                                </button>
                                {Object.entries(categories).map(([key, category]) => (
                                    <button
                                        key={key}
                                        onClick={() => setSelectedCategory(key)}
                                        className={`text-sm font-medium transition-all flex items-center gap-2 relative ${selectedCategory === key
                                            ? 'text-transparent bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text'
                                            : 'text-white/60 hover:text-white'
                                            }`}
                                    >
                                        <span>{category.icon}</span>
                                        <span>{category.name}</span>
                                        {selectedCategory === key && (
                                            <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* FAQs */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-2 custom-scrollbar">
                            {Object.entries(faqs).map(([categoryKey, categoryFAQs]) => (
                                <div key={categoryKey} className="space-y-2">
                                    {categoryFAQs.map((faq, index) => (
                                        <motion.div
                                            layout
                                            key={faq.id}
                                            className="overflow-hidden hover:bg-white/[0.02] transition-colors rounded-lg"
                                        >
                                            {/* Question */}
                                            <button
                                                onClick={() => toggleFAQ(faq.id)}
                                                className="w-full flex items-center justify-between p-4 text-left group"
                                            >
                                                <span className="font-medium text-white/90 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-300 group-hover:to-purple-300 group-hover:bg-clip-text transition-all">
                                                    {faq.question}
                                                </span>
                                                {expandedFAQs.has(faq.id) ? (
                                                    <ChevronUp className="w-5 h-5 text-white/40 flex-shrink-0 transition-transform" />
                                                ) : (
                                                    <ChevronDown className="w-5 h-5 text-white/40 flex-shrink-0 transition-transform" />
                                                )}
                                            </button>

                                            {/* Answer */}
                                            <AnimatePresence>
                                                {expandedFAQs.has(faq.id) && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        transition={{ duration: 0.2 }}
                                                    >
                                                        <div className="px-4 pb-4 pt-0">
                                                            <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent mb-4" />
                                                            <p className="text-white/70 whitespace-pre-line mb-6 leading-relaxed">
                                                                {faq.answer}
                                                            </p>

                                                            {/* Feedback */}
                                                            <div className="flex items-center justify-between bg-white/[0.02] rounded-lg p-3">
                                                                {!feedbackGiven.has(faq.id) ? (
                                                                    <>
                                                                        <span className="text-sm text-white/50">Was this answer helpful?</span>
                                                                        <div className="flex gap-2">
                                                                            <button
                                                                                onClick={() => handleFeedback(faq.id, true)}
                                                                                className="p-1.5 text-white/40 hover:text-green-400 hover:drop-shadow-[0_0_6px_rgba(34,197,94,0.6)] rounded transition-all"
                                                                                title="Yes, helpful"
                                                                            >
                                                                                <ThumbsUp className="w-4 h-4" />
                                                                            </button>
                                                                            <button
                                                                                onClick={() => handleFeedback(faq.id, false)}
                                                                                className="p-1.5 text-white/40 hover:text-red-400 hover:drop-shadow-[0_0_6px_rgba(239,68,68,0.6)] rounded transition-all"
                                                                                title="No, not helpful"
                                                                            >
                                                                                <ThumbsDown className="w-4 h-4" />
                                                                            </button>
                                                                        </div>
                                                                    </>
                                                                ) : (
                                                                    <div className="flex items-center gap-2 text-sm text-green-400 w-full justify-center">
                                                                        <Check className="w-4 h-4" />
                                                                        <span>Thanks for your feedback!</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>

                                            {/* Subtle divider between FAQs */}
                                            {index < categoryFAQs.length - 1 && (
                                                <div className="h-px bg-gradient-to-r from-transparent via-white/5 to-transparent mx-4" />
                                            )}
                                        </motion.div>
                                    ))}
                                </div>
                            ))}

                            {Object.keys(faqs).length === 0 && (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Search className="w-8 h-8 text-white/20" />
                                    </div>
                                    <h3 className="text-lg font-medium text-white mb-2">No results found</h3>
                                    <p className="text-white/50 mb-6">We couldn't find any answers matching "{searchQuery}"</p>
                                    <button
                                        onClick={() => {
                                            setSearchQuery('');
                                            setSelectedCategory(null);
                                        }}
                                        className="text-purple-400 hover:text-purple-300 font-medium"
                                    >
                                        Clear search filters
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-white/10 bg-white/[0.02]">
                            <p className="text-sm text-white/40 text-center">
                                Still need help?{' '}
                                <a href="mailto:support@prophetatlas.com" className="text-purple-400 hover:text-purple-300 transition-colors">
                                    Contact Support
                                </a>
                            </p>
                        </div>
                    </motion.div>
                </div >
            )}
        </AnimatePresence >
    );
};

function Check({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
        >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
    );
}
