// FILE: src/components/portfolio/PortfolioDashboardNew.tsx
/**
 * Redesigned Portfolio Dashboard with modern SaaS aesthetic
 * Features: Hero Metrics, AI Insights, Property Cards
 */

import React, { useState } from 'react';
import { HeroMetrics } from './HeroMetrics';
import { AIInsightsRibbon } from './AIInsightsRibbon';
import { PropertyCard } from './PropertyCard';

export const PortfolioDashboardNew: React.FC = () => {
    const [selectedInsight, setSelectedInsight] = useState<string | null>(null);

    // Sample data
    const sampleInsights = [
        { text: 'Austin property #2401 underperforming market average by 15%', severity: 'warning' as const },
        { text: 'Consider refinancing Dallas LTR - could save $420/mo', severity: 'info' as const },
        { text: 'Your STR portfolio outperforming market by 12%', severity: 'success' as const }
    ];

    const sampleProperties = [
        {
            id: '1',
            address: '2401 Rainey St',
            city: 'Austin',
            state: 'TX',
            imageUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400',
            metrics: { cashFlow: 2450, occupancy: 78, roi: 8.2, capRate: 6.1 },
            type: 'STR' as const
        },
        {
            id: '2',
            address: '456 Oak Ave',
            city: 'Dallas',
            state: 'TX',
            imageUrl: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400',
            metrics: { cashFlow: 1800, occupancy: 92, roi: 9.5, capRate: 7.2 },
            type: 'LTR' as const
        },
        {
            id: '3',
            address: '789 Pine Ln',
            city: 'Houston',
            state: 'TX',
            imageUrl: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400',
            metrics: { cashFlow: 3200, occupancy: 85, roi: 10.1, capRate: 8.3 },
            type: 'STR' as const
        },
        {
            id: '4',
            address: '321 Elm Dr',
            city: 'San Antonio',
            state: 'TX',
            imageUrl: 'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=400',
            metrics: { cashFlow: 2100, occupancy: 88, roi: 7.8, capRate: 6.5 },
            type: 'LTR' as const
        }
    ];

    return (
        <div
            className="min-h-screen p-6 lg:p-8"
            style={{
                background: 'var(--color-bg-primary)',
                fontFamily: "'Inter', sans-serif"
            }}
        >
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="mb-8">
                    <h1
                        className="text-3xl font-medium mb-2"
                        style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}
                    >
                        Portfolio Dashboard
                    </h1>
                    <p style={{ color: 'var(--color-text-secondary)' }}>
                        Track performance, analyze metrics, and get AI-powered insights
                    </p>
                </div>

                {/* Hero Metrics */}
                <HeroMetrics
                    portfolioValue={2400000}
                    monthlyIncome={12450}
                    roi={8.2}
                    equity={890000}
                />

                {/* AI Insights */}
                <AIInsightsRibbon
                    insights={sampleInsights}
                    onInsightClick={(insight) => {
                        setSelectedInsight(insight);
                        // In real app, this would open chat with pre-filled query
                        console.log('Open chat with:', insight);
                    }}
                />

                {/* Properties Section */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2
                            className="text-xl font-medium"
                            style={{ color: 'var(--color-text-primary)' }}
                        >
                            Properties
                        </h2>
                        <span style={{ color: 'var(--color-text-tertiary)', fontSize: '14px' }}>
                            {sampleProperties.length} total
                        </span>
                    </div>

                    {/* Property Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {sampleProperties.map((property) => (
                            <PropertyCard
                                key={property.id}
                                {...property}
                                onViewDetails={(id) => console.log('View details:', id)}
                                onAskAI={(id, address) => console.log('Ask AI about:', address)}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Debug: Show selected insight */}
            {selectedInsight && (
                <div
                    className="fixed bottom-4 right-4 p-4 rounded-lg max-w-sm"
                    style={{
                        background: 'var(--color-bg-elevated)',
                        border: '1px solid var(--color-border-emphasis)',
                        color: 'var(--color-text-secondary)'
                    }}
                >
                    <div className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--color-text-tertiary)' }}>
                        Selected Insight
                    </div>
                    <div className="text-sm">{selectedInsight}</div>
                    <button
                        onClick={() => setSelectedInsight(null)}
                        className="mt-2 text-xs"
                        style={{ color: 'var(--color-accent-teal-400)' }}
                    >
                        Close
                    </button>
                </div>
            )}
        </div>
    );
};
