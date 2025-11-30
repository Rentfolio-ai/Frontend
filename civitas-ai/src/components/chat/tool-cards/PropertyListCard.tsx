import React from 'react';
import { cn } from '../../../lib/utils';
import type { InvestmentStrategy } from '../../../types/pnl';
import type { ScoutedProperty } from '../../../types/backendTools';

interface PropertyListCardProps {
    properties: ScoutedProperty[];
    onOpenDealAnalyzer?: (propertyId: string | null, strategy: InvestmentStrategy, purchasePrice?: number, propertyAddress?: string) => void;
}

export const PropertyListCard: React.FC<PropertyListCardProps> = ({
    properties,
    onOpenDealAnalyzer,
}) => {
    if (!properties || properties.length === 0) return null;

    return (
        <div className="flex overflow-x-auto gap-4 py-4 -mx-4 px-4 scrollbar-hide snap-x">
            {properties.map((property, index) => {
                const snapshot = property.financial_snapshot;
                const isPositive = snapshot?.status === 'positive';
                const cashFlow = snapshot?.estimated_monthly_cash_flow;

                return (
                    <div
                        key={property.listing_id || index}
                        className="flex-shrink-0 w-72 bg-white/[0.03] border border-white/[0.08] rounded-xl overflow-hidden snap-center hover:bg-white/[0.05] transition-colors group"
                    >
                        {/* Image Placeholder */}
                        <div className="h-40 bg-white/5 relative">
                            <div className="absolute inset-0 flex items-center justify-center text-white/20">
                                <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                            </div>

                            {/* Price Badge */}
                            <div className="absolute top-3 left-3 px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg text-xs font-medium text-white border border-white/10">
                                ${property.price?.toLocaleString() ?? 'N/A'}
                            </div>

                            {/* Cash Flow Badge */}
                            {snapshot && (
                                <div className={cn(
                                    "absolute top-3 right-3 px-2 py-1 backdrop-blur-md rounded-lg text-xs font-medium border",
                                    isPositive
                                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                                        : "bg-rose-500/20 text-rose-300 border-rose-500/30"
                                )}>
                                    {isPositive ? '+' : ''}${cashFlow?.toLocaleString()}/mo
                                </div>
                            )}
                        </div>

                        {/* Content */}
                        <div className="p-4 space-y-3">
                            <div>
                                <h3 className="text-sm font-medium text-white/90 truncate" title={property.address}>
                                    {property.address}
                                </h3>
                                <div className="text-xs text-white/50 mt-1 flex items-center gap-2">
                                    <span>{property.bedrooms} bds</span>
                                    <span>•</span>
                                    <span>{property.bathrooms} ba</span>
                                    <span>•</span>
                                    <span>{property.sqft?.toLocaleString()} sqft</span>
                                </div>
                            </div>

                            {/* Action Button */}
                            <button
                                onClick={() => onOpenDealAnalyzer?.(property.listing_id || null, 'LTR', property.price, property.address)}
                                className="w-full py-2 px-3 bg-white/[0.06] hover:bg-white/[0.12] text-white/90 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-2 group-hover:bg-primary/20 group-hover:text-primary-foreground"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                                Analyze Deal
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
