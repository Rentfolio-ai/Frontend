import React, { useState, useEffect } from 'react';
import { cn } from '../../../lib/utils';
import { ChevronLeft, ChevronRight, Sparkles, GitCompare } from 'lucide-react';
import type { InvestmentStrategy } from '../../../types/pnl';
import type { ScoutedProperty } from '../../../types/backendTools';
import { getWinningHighlights } from '../../../utils/dealHighlights';
import { usePreferencesStore } from '../../../stores/preferencesStore';
import { useComparisonStore } from '../../../stores/comparisonStore';
import { HolographicPropertyModal } from './HolographicPropertyModal';
import { PropertyComparisonModal } from '../../comparison/PropertyComparisonModal';

interface PropertyListCardProps {
    properties: ScoutedProperty[];
    onOpenDealAnalyzer?: (propertyId: string | null, strategy: InvestmentStrategy, purchasePrice?: number, propertyAddress?: string) => void;
    onViewDetails?: (property: any) => void;
    enableHolographicView?: boolean;  // New prop to enable holographic view
}

const PropertyCardItemWithHolo: React.FC<{
    property: ScoutedProperty;
    onViewDetails?: (property: any) => void;
    onOpenDealAnalyzer?: (propertyId: string | null, strategy: InvestmentStrategy, purchasePrice?: number, propertyAddress?: string) => void;
    criteria?: any;
    enableHolographicView?: boolean;
}> = ({ property, onViewDetails, onOpenDealAnalyzer, criteria, enableHolographicView }) => {
    const [showHolographic, setShowHolographic] = useState(false);
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

    // Comparison store
    // const { isSelected } = useComparisonStore(); // Unused

    const photos = property.photos && property.photos.length > 0
        ? property.photos
        : ["https://images.rentcast.io/s3/photo-placeholder.jpg"];

    const financial = property.financial_snapshot;
    const isPositive = financial?.status === 'positive';
    const hasMultiplePhotos = photos.length > 1;

    const highlights = getWinningHighlights(property, criteria);

    const nextPhoto = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentPhotoIndex((prev) => (prev + 1) % photos.length);
    };

    const prevPhoto = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
    };



    return (
        <>
            <div className="min-w-[280px] w-[280px] snap-center bg-[#1E1E1E] rounded-xl border border-white/10 overflow-hidden hover:border-white/20 transition-all group">
                {/* Image & Price Overlay */}
                <div className="relative h-40 bg-gray-800 group/image">
                    <img
                        src={photos[currentPhotoIndex]}
                        alt={property.address}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    {/* Carousel Navigation */}
                    {hasMultiplePhotos && (
                        <>
                            <button
                                onClick={prevPhoto}
                                className="absolute left-2 top-1/2 -translate-y-1/2 p-1 rounded-full bg-black/40 text-white/80 opacity-0 group-hover/image:opacity-100 hover:bg-black/60 transition-all"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                                onClick={nextPhoto}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full bg-black/40 text-white/80 opacity-0 group-hover/image:opacity-100 hover:bg-black/60 transition-all"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>

                            {/* Dots Indicator */}
                            <div className="absolute bottom-16 left-0 right-0 flex justify-center gap-1">
                                {photos.slice(0, 5).map((_, idx) => (
                                    <div
                                        key={idx}
                                        className={cn(
                                            "w-1 h-1 rounded-full transition-all",
                                            idx === currentPhotoIndex ? "bg-white w-2" : "bg-white/40"
                                        )}
                                    />
                                ))}
                            </div>
                        </>
                    )}

                    <div className="absolute bottom-3 left-3 right-3 text-white">
                        <div className="text-lg font-bold">
                            ${property.price?.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-300 truncate">
                            {property.address}
                        </div>
                    </div>

                    {/* Badges */}
                    <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5">
                        {highlights.map((badge) => (
                            <div
                                key={badge.id}
                                className={cn(
                                    "px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider backdrop-blur-md flex items-center gap-1.5 shadow-lg",
                                    badge.bgColor,
                                    badge.color,
                                    "border border-white/10"
                                )}
                            >
                                <badge.icon className="w-3 h-3" />
                                {badge.label}
                            </div>
                        ))}

                        {property.value_score && (
                            <div className={cn(
                                "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider backdrop-blur-md",
                                property.value_grade === 'A' ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" :
                                    property.value_grade === 'B' ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" :
                                        "bg-gray-500/20 text-gray-400 border border-gray-500/30"
                            )}>
                                Details
                            </div>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="p-3 space-y-3">
                    {/* Key Stats */}
                    <div className="flex items-center justify-between text-xs text-gray-400">
                        <div className="flex gap-3">
                            <span>{property.bedrooms} bd</span>
                            <span>{property.bathrooms} ba</span>
                            <span>{property.sqft?.toLocaleString()} sqft</span>
                        </div>
                    </div>

                    {/* Financial Snapshot */}
                    <div className="grid grid-cols-2 gap-2">
                        <div className="p-2 bg-white/5 rounded border border-white/5">
                            <div className="text-[10px] text-gray-500 uppercase">Est. Rent</div>
                            <div className="text-sm font-medium text-white">
                                ${financial?.estimated_rent?.toLocaleString()}/mo
                            </div>
                        </div>
                        <div className={cn(
                            "p-2 rounded border border-white/5",
                            isPositive ? "bg-emerald-500/10" : "bg-red-500/10"
                        )}>
                            <div className="text-[10px] text-gray-500 uppercase">Cash Flow</div>
                            <div className={cn(
                                "text-sm font-medium",
                                isPositive ? "text-emerald-400" : "text-red-400"
                            )}>
                                {isPositive ? '+' : ''}${financial?.estimated_monthly_cash_flow?.toLocaleString()}
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                        {enableHolographicView && (
                            <button
                                onClick={() => setShowHolographic(true)}
                                className="flex-1 py-2 px-2 bg-gradient-to-r from-teal-500/20 to-purple-500/20 hover:from-teal-500/30 hover:to-purple-500/30 border border-teal-500/30 text-teal-300 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1.5"
                            >
                                <Sparkles className="w-3.5 h-3.5" />
                                3D View
                            </button>
                        )}
                        <button
                            onClick={() => onViewDetails?.(property)}
                            className="flex-1 py-2 px-3 bg-white/[0.06] hover:bg-white/[0.12] text-white/90 text-xs font-medium rounded-lg transition-colors"
                        >
                            Details
                        </button>
                        <button
                            onClick={() => onOpenDealAnalyzer?.(property.listing_id || null, 'LTR', property.price, property.address)}
                            className="flex-1 py-2 px-3 bg-white/[0.06] hover:bg-white/[0.12] text-white/90 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            Analyze
                        </button>
                    </div>
                </div>
            </div>

            {/* Holographic Modal */}
            {showHolographic && (
                <HolographicPropertyModal
                    isOpen={showHolographic}
                    onClose={() => setShowHolographic(false)}
                    property={property}
                />
            )}
        </>
    );
};

export const PropertyListCard: React.FC<PropertyListCardProps> = ({
    properties,
    onOpenDealAnalyzer,
    onViewDetails,
    enableHolographicView: enableHolographicViewProp = false,
}) => {
    // Access Stores
    const { investmentCriteria } = usePreferencesStore();
    const { selectedProperties, startComparing } = useComparisonStore();

    // Local state for holographic toggle
    const [holographicMode, setHolographicMode] = useState(enableHolographicViewProp);
    const [showComparison, setShowComparison] = useState(false);

    // Update when prop changes
    useEffect(() => {
        setHolographicMode(enableHolographicViewProp);
    }, [enableHolographicViewProp]);

    const handleCompare = () => {
        startComparing();
        setShowComparison(true);
    };

    if (!properties || properties.length === 0) return null;

    return (
        <>
            <div className="space-y-4">
                {/* Toolbar: Holographic View & Compare */}
                <div className="flex items-center justify-between px-4">
                    <div className="text-sm text-white/60">
                        {properties.length} {properties.length === 1 ? 'property' : 'properties'} found
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Compare Button */}
                        {selectedProperties.length > 0 && (
                            <button
                                onClick={handleCompare}
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 hover:from-blue-500/30 hover:to-indigo-500/30 border border-blue-500/40 text-blue-300 rounded-lg font-medium text-sm transition-all shadow-lg shadow-blue-500/10"
                            >
                                <GitCompare className="w-4 h-4" />
                                Compare ({selectedProperties.length})
                            </button>
                        )}

                        {/* Holographic Toggle */}
                        <button
                            onClick={() => setHolographicMode(!holographicMode)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${holographicMode
                                ? 'bg-gradient-to-r from-teal-500/20 to-purple-500/20 border border-teal-500/40 text-teal-300 shadow-lg shadow-teal-500/20'
                                : 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white'
                                }`}
                        >
                            <Sparkles className={`w-4 h-4 ${holographicMode ? 'animate-pulse' : ''}`} />
                            {holographicMode ? 'Holographic View Active' : 'Enable Holographic View'}
                        </button>
                    </div>
                </div>

                {/* Property Cards */}
                <div className="flex overflow-x-auto gap-4 py-4 -mx-4 px-4 scrollbar-hide snap-x">
                    {properties.map((property) => (
                        <PropertyCardItemWithHolo
                            key={property.listing_id}
                            property={property}
                            onViewDetails={onViewDetails}
                            onOpenDealAnalyzer={onOpenDealAnalyzer}
                            criteria={investmentCriteria}
                            enableHolographicView={holographicMode}
                        />
                    ))}
                </div>
            </div>

            {/* Comparison Modal */}
            <PropertyComparisonModal
                isOpen={showComparison}
                onClose={() => setShowComparison(false)}
            />
        </>
    );
};
