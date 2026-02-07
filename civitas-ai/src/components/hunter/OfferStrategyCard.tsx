// FILE: src/components/hunter/OfferStrategyCard.tsx
import React from 'react';
import { DollarSign, FileText, Calculator, BarChart, Clock } from 'lucide-react';
import { ToolResultCard, type ActionButton } from './ToolResultCard';

interface OfferStrategyData {
    address: string;
    list_price: number;
    summary: string;
    offer_strategy: {
        opening_offer: number;
        target_price: number;
        walk_away_price: number;
        offer_timeline: string;
    };
    negotiation_tactics: string[];
    contingencies_to_request: string[];
    timing_recommendation: string;
}

interface OfferStrategyCardProps {
    data: OfferStrategyData;
    onAction?: (query: string) => void;
}

export const OfferStrategyCard: React.FC<OfferStrategyCardProps> = ({ data, onAction }) => {
    const { offer_strategy } = data;

    // Calculate percentages
    const openingPct = ((offer_strategy.opening_offer - data.list_price) / data.list_price) * 100;
    const targetPct = ((offer_strategy.target_price - data.list_price) / data.list_price) * 100;
    const walkawayPct = ((offer_strategy.walk_away_price - data.list_price) / data.list_price) * 100;

    const actions: ActionButton[] = [
        {
            id: 'draft_offer_letter',
            label: 'Draft offer letter',
            icon: <FileText className="w-4 h-4" />,
            variant: 'primary',
            context: {
                address: data.address,
                opening_offer: offer_strategy.opening_offer,
                tactics: data.negotiation_tactics,
            },
        },
        {
            id: 'calculate_financing',
            label: 'Calculate financing',
            icon: <Calculator className="w-4 h-4" />,
            variant: 'secondary',
            context: {
                price: offer_strategy.target_price,
                address: data.address,
            },
        },
        {
            id: 'find_comps',
            label: 'Get comps to support offer',
            icon: <BarChart className="w-4 h-4" />,
            variant: 'outline',
            context: {
                address: data.address,
                target_price: offer_strategy.opening_offer,
            },
        },
        {
            id: 'set_reminder',
            label: 'Set offer deadline',
            icon: <Clock className="w-4 h-4" />,
            variant: 'outline',
            context: {
                timeline: offer_strategy.offer_timeline,
            },
        },
    ];

    const handleAction = (actionId: string, context?: any) => {
        switch (actionId) {
            case 'draft_offer_letter':
                onAction?.(`Draft an offer letter for ${context.address} with opening offer of $${context.opening_offer.toLocaleString()}`);
                break;
            case 'calculate_financing':
                onAction?.(`Calculate financing options for ${context.address} at $${context.price.toLocaleString()}`);
                break;
            case 'find_comps':
                onAction?.(`Find comps to justify an offer of $${context.target_price.toLocaleString()} for ${context.address}`);
                break;
            case 'set_reminder':
                onAction?.(`Remind me to submit offer: ${context.timeline}`);
                break;
        }
    };

    return (
        <ToolResultCard
            title="💰 Offer Strategy & Negotiation Tactics"
            icon={<DollarSign className="w-6 h-6" />}
            status="info"
            summary={data.summary}
            actions={actions}
            onAction={handleAction}
        >
            <div className="space-y-4">
                {/* Offer Range Visualization */}
                <div>
                    <h4 className="font-semibold text-gray-800 text-sm mb-3">
                        Recommended Offer Range
                    </h4>

                    {/* Offer Range Bars */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="w-32 text-sm font-medium text-gray-700">Opening Offer</div>
                            <div className="flex-1 bg-gray-100 rounded-full h-8 relative overflow-hidden">
                                <div
                                    className="absolute inset-y-0 left-0 bg-blue-500 flex items-center justify-end pr-2"
                                    style={{ width: `${Math.min(100, (offer_strategy.opening_offer / data.list_price) * 100)}%` }}
                                >
                                    <span className="text-xs font-semibold text-white">
                                        ${(offer_strategy.opening_offer / 1000).toFixed(0)}k
                                    </span>
                                </div>
                            </div>
                            <div className="w-16 text-sm text-gray-600">
                                {openingPct > 0 ? '+' : ''}{openingPct.toFixed(1)}%
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="w-32 text-sm font-medium text-gray-700">Target Price</div>
                            <div className="flex-1 bg-gray-100 rounded-full h-8 relative overflow-hidden">
                                <div
                                    className="absolute inset-y-0 left-0 bg-green-500 flex items-center justify-end pr-2"
                                    style={{ width: `${Math.min(100, (offer_strategy.target_price / data.list_price) * 100)}%` }}
                                >
                                    <span className="text-xs font-semibold text-white">
                                        ${(offer_strategy.target_price / 1000).toFixed(0)}k
                                    </span>
                                </div>
                            </div>
                            <div className="w-16 text-sm text-gray-600">
                                {targetPct > 0 ? '+' : ''}{targetPct.toFixed(1)}%
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="w-32 text-sm font-medium text-gray-700">Walk-Away</div>
                            <div className="flex-1 bg-gray-100 rounded-full h-8 relative overflow-hidden">
                                <div
                                    className="absolute inset-y-0 left-0 bg-red-500 flex items-center justify-end pr-2"
                                    style={{ width: `${Math.min(100, (offer_strategy.walk_away_price / data.list_price) * 100)}%` }}
                                >
                                    <span className="text-xs font-semibold text-white">
                                        ${(offer_strategy.walk_away_price / 1000).toFixed(0)}k
                                    </span>
                                </div>
                            </div>
                            <div className="w-16 text-sm text-gray-600">
                                {walkawayPct > 0 ? '+' : ''}{walkawayPct.toFixed(1)}%
                            </div>
                        </div>

                        <div className="flex items-center gap-3 pt-1 border-t border-gray-200">
                            <div className="w-32 text-sm font-medium text-gray-500">List Price</div>
                            <div className="flex-1 text-sm text-gray-600">
                                ${data.list_price.toLocaleString()}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Timing */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                        <Clock className="w-4 h-4 text-blue-600 mt-0.5" />
                        <div>
                            <div className="text-sm font-semibold text-blue-900">Timeline</div>
                            <div className="text-sm text-blue-700 mt-0.5">{data.timing_recommendation}</div>
                        </div>
                    </div>
                </div>

                {/* Negotiation Tactics */}
                <div>
                    <h4 className="font-semibold text-gray-800 text-sm mb-2">
                        Negotiation Tactics
                    </h4>
                    <ul className="space-y-1.5">
                        {data.negotiation_tactics.map((tactic, idx) => (
                            <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                                <span className="text-blue-500 mt-0.5">•</span>
                                <span>{tactic}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Contingencies */}
                {data.contingencies_to_request.length > 0 && (
                    <div>
                        <h4 className="font-semibold text-gray-800 text-sm mb-2">
                            Recommended Contingencies
                        </h4>
                        <ul className="space-y-1.5">
                            {data.contingencies_to_request.map((contingency, idx) => (
                                <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                                    <span className="text-green-500 mt-0.5">✓</span>
                                    <span>{contingency}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </ToolResultCard>
    );
};
