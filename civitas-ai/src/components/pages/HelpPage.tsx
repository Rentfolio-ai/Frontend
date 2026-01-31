/**
 * Help Page - Full Page View
 * Comprehensive help and support interface
 */

import React, { useState } from 'react';
import { ArrowLeft, Search, Book, MessageCircle, Video, FileText, ExternalLink, ChevronRight } from 'lucide-react';

interface HelpPageProps {
    onBack: () => void;
}

export const HelpPage: React.FC<HelpPageProps> = ({ onBack }) => {
    const [searchQuery, setSearchQuery] = useState('');

    const HelpCard: React.FC<{
        icon: React.ElementType;
        title: string;
        description: string;
        link?: string;
    }> = ({ icon: Icon, title, description, link }) => (
        <button
            className="w-full flex items-start gap-4 p-5 rounded-xl transition-all group"
            style={{
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(148, 163, 184, 0.12)',
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)';
                e.currentTarget.style.borderColor = 'rgba(20, 184, 166, 0.3)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
                e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.12)';
            }}
        >
            <div
                className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
                style={{
                    backgroundColor: 'rgba(20, 184, 166, 0.15)',
                    color: '#14B8A6',
                }}
            >
                <Icon className="w-6 h-6" />
            </div>
            <div className="flex-1 text-left">
                <h3 className="text-base font-semibold mb-1.5 flex items-center gap-2" style={{ color: '#F1F5F9' }}>
                    {title}
                    {link && <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: '#94A3B8' }}>
                    {description}
                </p>
            </div>
            <ChevronRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: '#94A3B8' }} />
        </button>
    );

    const FAQItem: React.FC<{ question: string; answer: string }> = ({ question, answer }) => {
        const [isOpen, setIsOpen] = useState(false);
        
        return (
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full text-left p-4 rounded-lg transition-all"
                style={{
                    backgroundColor: isOpen ? 'rgba(255, 255, 255, 0.06)' : 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(148, 163, 184, 0.12)',
                }}
            >
                <div className="flex items-center justify-between gap-4">
                    <h4 className="text-sm font-medium" style={{ color: '#F1F5F9' }}>
                        {question}
                    </h4>
                    <ChevronRight
                        className="w-4 h-4 transition-transform flex-shrink-0"
                        style={{
                            color: '#94A3B8',
                            transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                        }}
                    />
                </div>
                {isOpen && (
                    <p className="mt-3 text-sm leading-relaxed" style={{ color: '#94A3B8' }}>
                        {answer}
                    </p>
                )}
            </button>
        );
    };

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
                        Help & Support
                    </h1>
                    <p className="text-sm" style={{ color: '#94A3B8' }}>
                        Get assistance and learn how to use Vasthu
                    </p>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-4xl mx-auto space-y-8">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#94A3B8' }} />
                        <input
                            type="text"
                            placeholder="Search for help..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 rounded-xl text-sm transition-all"
                            style={{
                                backgroundColor: 'rgba(148, 163, 184, 0.1)',
                                border: '1px solid rgba(148, 163, 184, 0.2)',
                                color: '#F1F5F9',
                            }}
                        />
                    </div>

                    {/* Help Resources */}
                    <div>
                        <h2 className="text-lg font-semibold mb-4" style={{ color: '#F1F5F9' }}>
                            Resources
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <HelpCard
                                icon={Book}
                                title="Documentation"
                                description="Comprehensive guides and tutorials to get you started"
                                link="/docs"
                            />
                            <HelpCard
                                icon={Video}
                                title="Video Tutorials"
                                description="Watch step-by-step video guides and walkthroughs"
                                link="/videos"
                            />
                            <HelpCard
                                icon={MessageCircle}
                                title="Community Forum"
                                description="Connect with other users and share insights"
                                link="/community"
                            />
                            <HelpCard
                                icon={FileText}
                                title="API Documentation"
                                description="Technical documentation for developers"
                                link="/api-docs"
                            />
                        </div>
                    </div>

                    {/* FAQs */}
                    <div>
                        <h2 className="text-lg font-semibold mb-4" style={{ color: '#F1F5F9' }}>
                            Frequently Asked Questions
                        </h2>
                        <div className="space-y-2">
                            <FAQItem
                                question="How do I set my investment preferences?"
                                answer="Go to Settings > Investment Preferences to configure your buy box, budget, strategy, and other criteria. This helps Vasthu provide personalized property recommendations."
                            />
                            <FAQItem
                                question="What are the different reasoning modes?"
                                answer="Vasthu uses three reasoning modes: Quick (instant responses), Smart (standard analysis), and Deep (comprehensive strategic planning). The system automatically selects the best mode based on your query."
                            />
                            <FAQItem
                                question="How do I analyze a property deal?"
                                answer="Simply ask Vasthu about a property or paste a listing URL. The AI will analyze cash flow, ROI, and other metrics based on your investment strategy (STR, LTR, or Flip)."
                            />
                            <FAQItem
                                question="Can I save properties and reports?"
                                answer="Yes! Bookmark properties for later review and generate PDF reports for detailed analysis. All your saved items are accessible from the sidebar."
                            />
                        </div>
                    </div>

                    {/* Contact Support */}
                    <div
                        className="p-6 rounded-xl"
                        style={{
                            backgroundColor: 'rgba(20, 184, 166, 0.1)',
                            border: '1px solid rgba(20, 184, 166, 0.2)',
                        }}
                    >
                        <h3 className="text-lg font-semibold mb-2" style={{ color: '#F1F5F9' }}>
                            Still need help?
                        </h3>
                        <p className="text-sm mb-4" style={{ color: '#94A3B8' }}>
                            Our support team is here to assist you
                        </p>
                        <button
                            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                            style={{
                                backgroundColor: '#14B8A6',
                                color: '#FFFFFF',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0D9488'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#14B8A6'}
                        >
                            Contact Support
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
