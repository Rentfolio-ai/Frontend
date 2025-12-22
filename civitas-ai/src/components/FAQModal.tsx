/**
 * FAQ Modal Component - Dark Mode Professional Design
 */

import React, { useState, useEffect } from 'react';
import { X, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { getFAQs, type FAQ, type FAQCategory } from '../services/faqApi';

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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            {/* Modal */}
            <div className="relative w-full max-w-3xl bg-[#1a1a1a] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
                    <div>
                        <h2 className="text-xl font-semibold text-white">Help & support</h2>
                        <p className="text-sm text-white/60 mt-0.5">Find answers to common questions</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-white/60" />
                    </button>
                </div>

                {/* Search */}
                <div className="px-6 py-4 border-b border-white/10">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search help articles..."
                            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Categories */}
                <div className="px-6 py-3 border-b border-white/10">
                    <div className="flex gap-2 overflow-x-auto">
                        <button
                            onClick={() => setSelectedCategory(null)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${selectedCategory === null
                                ? 'bg-teal-500 text-white'
                                : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                                }`}
                        >
                            All
                        </button>
                        {Object.entries(categories).map(([id, category]) => (
                            <button
                                key={id}
                                onClick={() => setSelectedCategory(id)}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${selectedCategory === id
                                    ? 'bg-teal-500 text-white'
                                    : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                                    }`}
                            >
                                {category.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* FAQ List */}
                <div className="flex-1 overflow-y-auto px-6 py-4">
                    <div className="space-y-2">
                        {Object.entries(faqs).flatMap(([_, categoryFAQs]) =>
                            categoryFAQs.map((faq) => (
                                <div key={faq.id} className="border border-white/10 rounded-lg overflow-hidden bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                                    <button
                                        onClick={() => toggleFAQ(faq.id)}
                                        className="w-full flex items-center justify-between px-4 py-3.5 text-left"
                                    >
                                        <span className="font-medium text-white pr-4">{faq.question}</span>
                                        {expandedFAQs.has(faq.id) ? (
                                            <ChevronUp className="w-5 h-5 text-white/40 flex-shrink-0" />
                                        ) : (
                                            <ChevronDown className="w-5 h-5 text-white/40 flex-shrink-0" />
                                        )}
                                    </button>
                                    {expandedFAQs.has(faq.id) && (
                                        <div className="px-4 py-3 border-t border-white/10">
                                            <p className="text-sm text-white/70 leading-relaxed">
                                                {faq.answer}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-white/10 bg-white/[0.02]">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-white/60">
                            Can't find what you're looking for?
                        </p>
                        <a
                            href="mailto:support@civitasai.com"
                            className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                            Contact support
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};
