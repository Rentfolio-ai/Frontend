// FILE: src/components/hunter/CompsIntelCard.tsx
import React, { useState } from 'react';
import { DollarSign, BarChart, TrendingUp, Download, ChevronDown, ChevronUp } from 'lucide-react';
import { ToolResultCard, type ActionButton } from './ToolResultCard';

interface Comp {
    address: string;
    price: number;
    price_per_sqft: number;
    bedrooms: number;
    bathrooms: number;
    square_feet: number;
    days_on_market: number;
    sale_date: string;
    price_reduction?: number;
    seller_motivation?: string;
}

interface MarketIntelligence {
    average_days_on_market: number;
    market_velocity: string;
    negotiation_leverage: string;
    price_trend: string;
}

interface PricingRecommendation {
    avg_price_per_sqft: number;
    recommended_offer_multiplier: number;
    strategy: string;
}

interface CompsIntelData {
    address: string;
    summary: string;
    comps: Comp[];
    market_intelligence: MarketIntelligence;
    pricing_recommendation: PricingRecommendation;
    negotiation_insights: string[];
}

interface CompsIntelCardProps {
    data: CompsIntelData;
    onAction?: (query: string) => void;
}

export const CompsIntelCard: React.FC<CompsIntelCardProps> = ({ data, onAction }) => {
    const [showAllComps, setShowAllComps] = useState(false);
    const displayedComps = showAllComps ? data.comps : data.comps.slice(0, 3);

    const actions: ActionButton[] = [
        {
            id: 'generate_offer',
            label: 'Generate offer strategy',
            icon: <DollarSign className="w-4 h-4" />,
            variant: 'primary',
            context: {
                address: data.address,
                pricing: data.pricing_recommendation,
            },
        },
        {
            id: 'check_neighborhood',
            label: 'Analyze neighborhood',
            icon: <TrendingUp className="w-4 h-4" />,
            variant: 'secondary',
            context: { address: data.address },
        },
        {
            id: 'view_details',
            label: 'View detailed analysis',
            icon: <BarChart className="w-4 h-4" />,
            variant: 'outline',
            context: { comps: data.comps },
        },
        {
            id: 'export_comps',
            label: 'Export to CSV',
            icon: <Download className="w-4 h-4" />,
            variant: 'outline',
            context: { comps: data.comps },
        },
    ];

    const handleAction = (actionId: string, context?: any) => {
        switch (actionId) {
            case 'generate_offer':
                onAction?.(`Generate offer strategy for ${context.address} based on these comps`);
                break;
            case 'check_neighborhood':
                onAction?.(`Analyze neighborhood trajectory for ${context.address}`);
                break;
            case 'view_details':
                setShowAllComps(true);
                break;
            case 'export_comps':
                exportToCSV(context.comps);
                break;
        }
    };

    const exportToCSV = (comps: Comp[]) => {
        const headers = ['Address', 'Price', 'Price/SqFt', 'Beds', 'Baths', 'SqFt', 'DOM', 'Sale Date'];
        const rows = comps.map(c => [
            c.address,
            c.price,
            c.price_per_sqft,
            c.bedrooms,
            c.bathrooms,
            c.square_feet,
            c.days_on_market,
            c.sale_date,
        ]);

        const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `comps_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
    };

    const velocityColor = {
        'Fast': 'text-red-600',
        'Moderate': 'text-yellow-600',
        'Slow': 'text-green-600',
    }[data.market_intelligence.market_velocity] || 'text-gray-600';

    return (
        <ToolResultCard
            title="📊 Comparable Sales with Market Intelligence"
            icon={<BarChart className="w-6 h-6" />}
            status="info"
            summary={data.summary}
            actions={actions}
            onAction={handleAction}
        >
            <div className="space-y-4">
                {/* Market Intelligence Summary */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="text-xs text-blue-600 font-medium">Market Velocity</div>
                        <div className={`text-lg font-bold ${velocityColor}`}>
                            {data.market_intelligence.market_velocity}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                            Avg DOM: {data.market_intelligence.average_days_on_market} days
                        </div>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="text-xs text-green-600 font-medium">Negotiation Leverage</div>
                        <div className="text-lg font-bold text-green-700">
                            {data.market_intelligence.negotiation_leverage}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                            {data.market_intelligence.price_trend}
                        </div>
                    </div>
                </div>

                {/* Pricing Recommendation */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                        <DollarSign className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div className="flex-1">
                            <div className="font-semibold text-gray-900 text-sm">Pricing Recommendation</div>
                            <div className="text-sm text-gray-700 mt-1">
                                Avg: ${data.pricing_recommendation.avg_price_per_sqft}/sqft •
                                Offer: {(data.pricing_recommendation.recommended_offer_multiplier * 100).toFixed(0)}% of asking
                            </div>
                            <div className="text-sm text-gray-600 mt-1 italic">
                                {data.pricing_recommendation.strategy}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Comparable Properties Table */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-800 text-sm">
                            Comparable Properties ({data.comps.length})
                        </h4>
                        {data.comps.length > 3 && (
                            <button
                                onClick={() => setShowAllComps(!showAllComps)}
                                className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                            >
                                {showAllComps ? (
                                    <>Show Less <ChevronUp className="w-3 h-3" /></>
                                ) : (
                                    <>Show All <ChevronDown className="w-3 h-3" /></>
                                )}
                            </button>
                        )}
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-100 border-b border-gray-200">
                                <tr>
                                    <th className="text-left p-2 font-medium text-gray-700">Address</th>
                                    <th className="text-right p-2 font-medium text-gray-700">Price</th>
                                    <th className="text-right p-2 font-medium text-gray-700">$/SqFt</th>
                                    <th className="text-center p-2 font-medium text-gray-700">Beds/Baths</th>
                                    <th className="text-right p-2 font-medium text-gray-700">DOM</th>
                                    <th className="text-center p-2 font-medium text-gray-700">Intel</th>
                                </tr>
                            </thead>
                            <tbody>
                                {displayedComps.map((comp, idx) => (
                                    <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="p-2 text-gray-900">{comp.address}</td>
                                        <td className="p-2 text-right font-medium text-gray-900">
                                            ${(comp.price / 1000).toFixed(0)}k
                                            {comp.price_reduction && (
                                                <span className="text-xs text-red-600 ml-1">
                                                    (-${(comp.price_reduction / 1000).toFixed(0)}k)
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-2 text-right text-gray-700">
                                            ${comp.price_per_sqft}
                                        </td>
                                        <td className="p-2 text-center text-gray-700">
                                            {comp.bedrooms}/{comp.bathrooms}
                                        </td>
                                        <td className="p-2 text-right text-gray-700">
                                            {comp.days_on_market}
                                        </td>
                                        <td className="p-2 text-center">
                                            {comp.seller_motivation && (
                                                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                                                    {comp.seller_motivation}
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Negotiation Insights */}
                {data.negotiation_insights.length > 0 && (
                    <div>
                        <h4 className="font-semibold text-gray-800 text-sm mb-2">
                            💡 Negotiation Insights
                        </h4>
                        <ul className="space-y-1.5">
                            {data.negotiation_insights.map((insight, idx) => (
                                <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                                    <span className="text-blue-500 mt-0.5">•</span>
                                    <span>{insight}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </ToolResultCard>
    );
};
