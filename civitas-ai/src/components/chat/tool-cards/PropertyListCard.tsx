import React, { useState, useEffect } from 'react';
import { cn } from '../../../lib/utils';
import {
    ChevronLeft, ChevronRight, Sparkles, GitCompare,
    Bed, Bath, Maximize2, TrendingUp, TrendingDown,
    DollarSign, Percent, BarChart3, Calendar, MapPin, ExternalLink
} from 'lucide-react';
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
    enableHolographicView?: boolean;
}

/* ─────────────────────────────── helpers ─────────────────────────────── */

const fmtPrice = (n?: number) => {
    if (!n) return '—';
    if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`;
    if (n >= 1_000) return `$${Math.round(n / 1_000)}K`;
    return `$${n.toLocaleString()}`;
};

const fmtCurrency = (n?: number) => {
    if (n == null) return '—';
    return `$${Math.abs(n).toLocaleString()}`;
};

/* ───────────────────────────── score ring ────────────────────────────── */

const ScoreRing: React.FC<{ score: number; max?: number; size?: number }> = ({
    score, max = 100, size = 40
}) => {
    const pct = Math.min(score / max, 1);
    const r = (size - 6) / 2;
    const circ = 2 * Math.PI * r;
    const offset = circ * (1 - pct);
    const color = pct >= 0.8 ? '#34D399' : pct >= 0.6 ? '#FBBF24' : '#F87171';

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="rotate-[-90deg]">
                <circle cx={size / 2} cy={size / 2} r={r}
                    fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth={3} />
                <circle cx={size / 2} cy={size / 2} r={r}
                    fill="none" stroke={color} strokeWidth={3}
                    strokeDasharray={circ} strokeDashoffset={offset}
                    strokeLinecap="round" className="transition-all duration-700" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[11px] font-bold text-white leading-none">{Math.round(score)}</span>
            </div>
        </div>
    );
};

/* ──────────────────────── metric pill component ─────────────────────── */

const MetricPill: React.FC<{
    label: string;
    value: string;
    icon: React.ReactNode;
    accent?: string;       // tailwind text color for value
    bgTint?: string;       // rgba background
}> = ({ label, value, icon, accent = 'text-foreground/80', bgTint }) => (
    <div
        className="flex-1 min-w-0 rounded-xl px-3 py-2.5 border border-black/[0.06]"
        style={{ background: bgTint || 'rgba(0,0,0,0.02)' }}
    >
        <div className="flex items-center gap-1.5 mb-1">
            <span className="text-muted-foreground/50">{icon}</span>
            <span className="text-[8px] uppercase tracking-[0.08em] font-semibold text-muted-foreground/50">{label}</span>
        </div>
        <div className={cn('text-[15px] font-bold leading-tight', accent)}>{value}</div>
    </div>
);

/* ───────────────────── single property card (premium) ───────────────── */

const PropertyCard: React.FC<{
    property: ScoutedProperty;
    onViewDetails?: (property: any) => void;
    onOpenDealAnalyzer?: (propertyId: string | null, strategy: InvestmentStrategy, purchasePrice?: number, propertyAddress?: string) => void;
    criteria?: any;
    enableHolographicView?: boolean;
}> = ({ property, onViewDetails, onOpenDealAnalyzer, criteria, enableHolographicView }) => {
    const [showHolographic, setShowHolographic] = useState(false);
    const [photoIdx, setPhotoIdx] = useState(0);
    const [imgLoaded, setImgLoaded] = useState(false);
    const { isSelected, toggleComparison } = useComparisonStore();

    const photos = property.photos?.length ? property.photos : ['https://images.rentcast.io/s3/photo-placeholder.jpg'];
    const financial = property.financial_snapshot;
    const isPositive = financial?.status === 'positive';
    const hasMulti = photos.length > 1;
    const highlights = getWinningHighlights(property, criteria);

    const cashFlow = financial?.estimated_monthly_cash_flow;
    const rent = financial?.estimated_rent;
    const capRate = rent && property.price ? ((rent * 12 * 0.6) / property.price * 100) : null;
    const score = property.value_score || (property as any).ai_score || (property as any).ai_match_score || null;
    const selected = isSelected(property.listing_id || '');

    const nextPhoto = (e: React.MouseEvent) => { e.stopPropagation(); setPhotoIdx(i => (i + 1) % photos.length); };
    const prevPhoto = (e: React.MouseEvent) => { e.stopPropagation(); setPhotoIdx(i => (i - 1 + photos.length) % photos.length); };

    const handleToggleComparison = (e: React.MouseEvent) => {
        e.stopPropagation();
        toggleComparison({
            id: property.listing_id || '',
            address: property.address || '',
            price: property.price || 0,
            bedrooms: property.bedrooms,
            bathrooms: property.bathrooms,
            sqft: property.sqft,
            yearBuilt: property.year_built,
            monthlyRent: financial?.estimated_rent,
            cashFlow: financial?.estimated_monthly_cash_flow,
            cocReturn: undefined,
            capRate: capRate ?? undefined,
            thumbnail: photos[0],
            city: property.city,
            state: property.state,
        });
    };

    return (
        <>
            <div
                className={cn(
                    'min-w-[330px] w-[330px] snap-center rounded-[20px] overflow-hidden transition-all duration-300 group cursor-pointer',
                    'hover:translate-y-[-4px] hover:shadow-2xl hover:shadow-black/10',
                    selected && 'ring-2 ring-[#C08B5C]/50'
                )}
                style={{
                    background: 'linear-gradient(165deg, rgba(30,28,36,0.95) 0%, rgba(18,17,22,0.98) 100%)',
                    border: '1px solid rgba(0,0,0,0.06)',
                }}
                onClick={() => onViewDetails?.(property)}
            >
                {/* ──── Image Section ──── */}
                <div className="relative h-[195px] overflow-hidden group/img">
                    {/* Shimmer placeholder */}
                    {!imgLoaded && (
                        <div className="absolute inset-0 bg-gradient-to-r from-black/[0.02] via-white/[0.06] to-black/[0.02] animate-pulse" />
                    )}
                    <img
                        src={photos[photoIdx]}
                        alt={property.address}
                        onLoad={() => setImgLoaded(true)}
                        className={cn(
                            'w-full h-full object-cover transition-all duration-700',
                            'group-hover:scale-[1.05] group-hover:brightness-110',
                            imgLoaded ? 'opacity-100' : 'opacity-0'
                        )}
                    />
                    {/* Deep gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#121116] via-[#121116]/40 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#121116]/20 to-transparent" />

                    {/* Photo navigation */}
                    {hasMulti && (
                        <>
                            <button onClick={prevPhoto}
                                className="absolute left-2.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 backdrop-blur-md text-foreground/80 opacity-0 group-hover/img:opacity-100 hover:bg-black/60 transition-all flex items-center justify-center">
                                <ChevronLeft className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={nextPhoto}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 backdrop-blur-md text-foreground/80 opacity-0 group-hover/img:opacity-100 hover:bg-black/60 transition-all flex items-center justify-center">
                                <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                            {/* Dot indicators */}
                            <div className="absolute bottom-[72px] left-0 right-0 flex justify-center gap-1.5">
                                {photos.slice(0, 6).map((_, i) => (
                                    <div key={i} className={cn(
                                        'rounded-full transition-all duration-300',
                                        i === photoIdx ? 'bg-white w-4 h-[3px]' : 'bg-white/30 w-[5px] h-[3px]'
                                    )} />
                                ))}
                            </div>
                        </>
                    )}

                    {/* ─── Top-left: AI Score ring ─── */}
                    {score != null && score > 0 && (
                        <div className="absolute top-3 left-3">
                            <ScoreRing score={score} max={score > 100 ? 150 : 100} size={42} />
                        </div>
                    )}

                    {/* ─── Top-right: Spec pills ─── */}
                    <div className="absolute top-3 right-3 flex items-center gap-1.5">
                        <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-black/40 backdrop-blur-md text-foreground/80 text-[10px] font-medium">
                            <Bed className="w-3 h-3 text-muted-foreground" />
                            {property.bedrooms}
                        </div>
                        <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-black/40 backdrop-blur-md text-foreground/80 text-[10px] font-medium">
                            <Bath className="w-3 h-3 text-muted-foreground" />
                            {property.bathrooms}
                        </div>
                        {property.sqft && (
                            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-black/40 backdrop-blur-md text-foreground/80 text-[10px] font-medium">
                                <Maximize2 className="w-3 h-3 text-muted-foreground" />
                                {property.sqft >= 1000
                                    ? `${(property.sqft / 1000).toFixed(1)}K`
                                    : property.sqft}
                            </div>
                        )}
                    </div>

                    {/* ─── Bottom overlay: Price + Address ─── */}
                    <div className="absolute bottom-0 left-0 right-0 px-4 pb-3.5">
                        {/* Price badge with gradient */}
                        <div className="inline-flex items-center mb-1.5">
                            <span className="text-[22px] font-extrabold text-foreground tracking-tight drop-shadow-lg">
                                ${property.price?.toLocaleString()}
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/70">
                            <MapPin className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{property.address}</span>
                        </div>
                    </div>

                    {/* ─── Compare checkbox ─── */}
                    <button
                        onClick={handleToggleComparison}
                        className={cn(
                            'absolute bottom-3 right-3 w-7 h-7 rounded-lg border transition-all flex items-center justify-center text-[11px] font-bold',
                            selected
                                ? 'bg-[#C08B5C] border-[#C08B5C] text-white shadow-lg shadow-[#C08B5C]/20'
                                : 'bg-black/30 backdrop-blur-md border-black/10 text-transparent opacity-0 group-hover:opacity-100 hover:border-[#C08B5C]/40'
                        )}
                        title="Add to compare"
                    >
                        ✓
                    </button>

                    {/* ─── Highlight badges ─── */}
                    {highlights.length > 0 && (
                        <div className="absolute top-3 left-[52px] flex items-center gap-1">
                            {highlights.slice(0, 2).map((badge) => (
                                <div key={badge.id}
                                    className={cn(
                                        'px-2 py-0.5 rounded-md text-[8px] font-bold uppercase tracking-wider backdrop-blur-md flex items-center gap-1',
                                        badge.bgColor, badge.color,
                                        'border border-black/8'
                                    )}>
                                    <badge.icon className="w-2.5 h-2.5" />
                                    {badge.label}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* ──── Content Section ──── */}
                <div className="px-4 pt-3.5 pb-4 space-y-3">
                    {/* Location & Year */}
                    <div className="flex items-center justify-between text-[11px]">
                        <span className="text-muted-foreground/60 flex items-center gap-1">
                            {property.city}, {property.state}
                            {property.year_built && (
                                <>
                                    <span className="text-muted-foreground/40 mx-1">·</span>
                                    <Calendar className="w-3 h-3 text-muted-foreground/40" />
                                    Built {property.year_built}
                                </>
                            )}
                        </span>
                        {property.days_on_market != null && (
                            <span className={cn(
                                'text-[10px] font-medium px-2 py-0.5 rounded-md',
                                property.days_on_market <= 7
                                    ? 'text-emerald-400/80 bg-emerald-500/10'
                                    : property.days_on_market <= 30
                                        ? 'text-amber-400/80 bg-amber-500/10'
                                        : 'text-muted-foreground/50 bg-black/[0.02]'
                            )}>
                                {property.days_on_market}d on market
                            </span>
                        )}
                    </div>

                    {/* ─── Financial Metrics: 3-column grid ─── */}
                    <div className="grid grid-cols-3 gap-2">
                        <MetricPill
                            label="Rent"
                            value={rent ? `${fmtCurrency(rent)}/mo` : '—'}
                            icon={<DollarSign className="w-3 h-3" />}
                            accent="text-foreground/80"
                            bgTint="rgba(255,255,255,0.025)"
                        />
                        <MetricPill
                            label="Cap Rate"
                            value={capRate ? `${capRate.toFixed(1)}%` : '—'}
                            icon={<Percent className="w-3 h-3" />}
                            accent={capRate && capRate >= 6 ? 'text-emerald-400' : 'text-muted-foreground'}
                            bgTint={capRate && capRate >= 6 ? 'rgba(16,185,129,0.05)' : 'rgba(255,255,255,0.025)'}
                        />
                        <MetricPill
                            label="Cash Flow"
                            value={cashFlow != null ? `${isPositive ? '+' : '-'}${fmtCurrency(cashFlow)}/mo` : '—'}
                            icon={isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            accent={isPositive ? 'text-emerald-400' : 'text-rose-400'}
                            bgTint={isPositive ? 'rgba(16,185,129,0.05)' : 'rgba(239,68,68,0.04)'}
                        />
                    </div>

                    {/* ─── Action Row ─── */}
                    <div className="flex gap-2 pt-1">
                        {enableHolographicView && (
                            <button
                                onClick={(e) => { e.stopPropagation(); setShowHolographic(true); }}
                                className="w-9 h-9 rounded-xl flex items-center justify-center text-[#D4A27F]/60 hover:text-[#D4A27F] hover:bg-[#C08B5C]/10 transition-all border border-black/[0.04]"
                            >
                                <Sparkles className="w-4 h-4" />
                            </button>
                        )}
                        <button
                            onClick={(e) => { e.stopPropagation(); onViewDetails?.(property); }}
                            className="flex-1 h-9 text-[11px] font-medium text-muted-foreground rounded-xl transition-all border border-black/[0.05] hover:bg-black/[0.04] hover:text-foreground/70 hover:border-black/[0.08]"
                        >
                            View Details
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); onOpenDealAnalyzer?.(property.listing_id || null, 'LTR', property.price, property.address); }}
                            className="flex-1 h-9 text-[11px] font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5"
                            style={{
                                background: 'linear-gradient(135deg, rgba(192,139,92,0.15), rgba(212,162,127,0.08))',
                                color: '#D4A27F',
                                border: '1px solid rgba(192,139,92,0.2)',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(192,139,92,0.25), rgba(212,162,127,0.15))';
                                e.currentTarget.style.borderColor = 'rgba(192,139,92,0.35)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(192,139,92,0.15), rgba(212,162,127,0.08))';
                                e.currentTarget.style.borderColor = 'rgba(192,139,92,0.2)';
                            }}
                        >
                            <BarChart3 className="w-3.5 h-3.5" />
                            Analyze Deal
                        </button>
                    </div>
                </div>
            </div>

            {showHolographic && (
                <HolographicPropertyModal isOpen={showHolographic} onClose={() => setShowHolographic(false)} property={property} />
            )}
        </>
    );
};

/* ─────────────────────────── main list card ──────────────────────────── */

export const PropertyListCard: React.FC<PropertyListCardProps> = ({
    properties,
    onOpenDealAnalyzer,
    onViewDetails,
    enableHolographicView: enableHolographicViewProp = false,
}) => {
    const { investmentCriteria } = usePreferencesStore();
    const { selectedProperties, startComparing } = useComparisonStore();
    const [holographicMode, setHolographicMode] = useState(enableHolographicViewProp);
    const [showComparison, setShowComparison] = useState(false);

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
            <div className="space-y-3">
                {/* Toolbar */}
                <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                        <span className="text-[12px] text-muted-foreground/50 font-medium">
                            {properties.length} {properties.length === 1 ? 'property' : 'properties'} found
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        {selectedProperties.length > 0 && (
                            <button
                                onClick={handleCompare}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-medium transition-all hover:scale-[1.02]"
                                style={{
                                    background: 'linear-gradient(135deg, rgba(192,139,92,0.15), rgba(212,162,127,0.08))',
                                    color: '#D4A27F',
                                    border: '1px solid rgba(192,139,92,0.25)'
                                }}
                            >
                                <GitCompare className="w-3.5 h-3.5" />
                                Compare ({selectedProperties.length})
                            </button>
                        )}
                    </div>
                </div>

                {/* Card carousel */}
                <div className="flex overflow-x-auto gap-4 py-1 -mx-4 px-4 scrollbar-hide snap-x snap-mandatory">
                    {properties.map((property) => (
                        <PropertyCard
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

            <PropertyComparisonModal isOpen={showComparison} onClose={() => setShowComparison(false)} />
        </>
    );
};
