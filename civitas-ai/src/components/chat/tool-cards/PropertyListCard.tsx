import React, { useState, useEffect } from 'react';
import { cn } from '../../../lib/utils';
import {
    ChevronLeft, ChevronRight, Sparkles, GitCompare,
    Bed, Bath, Maximize2, TrendingUp, TrendingDown,
    DollarSign, Percent, BarChart3, Calendar, MapPin, ExternalLink, Award
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
    onRecalculate?: (property: any, params: any) => Promise<any>;
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
                    fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={3} />
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
}> = ({ label, value, icon, accent = 'text-white/80', bgTint }) => (
    <div
        className="flex-1 min-w-0 rounded-xl px-3 py-2.5 border border-white/[0.06]"
        style={{ background: bgTint || 'rgba(255,255,255,0.02)' }}
    >
        <div className="flex items-center gap-1.5 mb-1">
            <span className="text-white/25">{icon}</span>
            <span className="text-[8px] uppercase tracking-[0.08em] font-semibold text-white/30">{label}</span>
        </div>
        <div className={cn('text-[15px] font-bold leading-tight', accent)}>{value}</div>
    </div>
);

/* ───────────────────────────── corner ribbon ────────────────────────── */

const Ribbon: React.FC<{ label: string; color: string; icon?: React.ReactNode }> = ({ label, color, icon }) => (
    <div className="absolute top-0 right-0 z-20 overflow-hidden w-24 h-24 pointer-events-none">
        <div
            className={cn(
                "absolute top-4 -right-8 w-32 py-1 rotate-45 flex items-center justify-center gap-1.5 shadow-lg shadow-black/40 border-y border-white/10",
                color
            )}
        >
            {icon && <span className="scale-75 origin-center">{icon}</span>}
            <span className="text-[9px] font-black uppercase tracking-tighter text-white drop-shadow-sm">{label}</span>
        </div>
    </div>
);

/* ───────────────────── single property card (premium) ───────────────── */

const PropertyCard: React.FC<{
    property: ScoutedProperty;
    onViewDetails?: (property: any) => void;
    onOpenDealAnalyzer?: (propertyId: string | null, strategy: InvestmentStrategy, purchasePrice?: number, propertyAddress?: string) => void;
    criteria?: any;
    enableHolographicView?: boolean;
    isHero?: boolean;
    index?: number;
    onRecalculate?: (property: any, params: any) => Promise<any>;
}> = ({ property, onViewDetails, onOpenDealAnalyzer, criteria, enableHolographicView, isHero, index, onRecalculate }) => {
    const [showHolographic, setShowHolographic] = useState(false);
    const [photoIdx, setPhotoIdx] = useState(0);
    const [imgLoaded, setImgLoaded] = useState(false);
    const { isSelected, toggleComparison } = useComparisonStore();

    const photos = property.photos?.length ? property.photos : [];
    const hasPhotos = photos.length > 0;
    const photoUrl = hasPhotos ? photos[photoIdx] : null;

    // Generate a unique placeholder gradient seed based on listing_id
    const listingSeed = property.listing_id ? Array.from(property.listing_id).reduce((acc, char) => acc + char.charCodeAt(0), 0) : 0;
    const placeholderColors = [
        ['#1E1C24', '#2D2B35'],
        ['#1A191F', '#25242A'],
        ['#201E26', '#302E38'],
        ['#18171C', '#222126'],
    ];
    const colorPair = placeholderColors[listingSeed % placeholderColors.length];
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
                    'snap-center rounded-[20px] overflow-hidden transition-all duration-300 group cursor-pointer relative',
                    isHero ? 'min-w-[420px] w-[420px]' : 'min-w-[330px] w-[330px]',
                    'hover:translate-y-[-4px] hover:shadow-2xl hover:shadow-black/40',
                    selected && 'ring-2 ring-[#C08B5C]/50'
                )}
                style={{
                    background: isHero
                        ? 'linear-gradient(165deg, rgba(35,32,45,0.98) 0%, rgba(192,139,92,0.12) 50%, rgba(18,17,22,1) 100%)'
                        : score && score > 85
                            ? 'linear-gradient(165deg, rgba(30,28,36,0.98) 0%, rgba(192,139,92,0.05) 50%, rgba(18,17,22,1) 100%)'
                            : 'linear-gradient(165deg, rgba(30,28,36,0.95) 0%, rgba(18,17,22,0.98) 100%)',
                    border: isHero
                        ? '1px solid rgba(192,139,92,0.4)'
                        : score && score > 85
                            ? '1px solid rgba(192,139,92,0.3)'
                            : '1px solid rgba(255,255,255,0.06)',
                }}
                onClick={() => onViewDetails?.(property)}
            >
                {/* ──── Corner Ribbons ──── */}
                {score && score >= 90 && (
                    <Ribbon label="Best Match" color="bg-gradient-to-r from-amber-500 to-orange-600" icon={<Award className="w-3 h-3 text-white" />} />
                )}
                {capRate && capRate >= 8 && score && score < 90 && (
                    <Ribbon label="High Yield" color="bg-gradient-to-r from-emerald-500 to-teal-600" icon={<TrendingUp className="w-3 h-3 text-white" />} />
                )}
                {property.days_on_market != null && property.days_on_market <= 3 && !score && (
                    <Ribbon label="New Listing" color="bg-gradient-to-r from-blue-500 to-indigo-600" icon={<Calendar className="w-3 h-3 text-white" />} />
                )}

                {/* ──── Image Section ──── */}
                <div className={cn("relative overflow-hidden group/img", isHero ? 'h-[230px]' : 'h-[195px]')}>
                    {/* Shimmer placeholder */}
                    {!imgLoaded && (
                        <div className="absolute inset-0 bg-gradient-to-r from-white/[0.02] via-white/[0.06] to-white/[0.02] animate-pulse" />
                    )}
                    {hasPhotos ? (
                        <img
                            src={photoUrl!}
                            alt={property.address}
                            onLoad={() => setImgLoaded(true)}
                            className={cn(
                                'w-full h-full object-cover transition-all duration-700',
                                'group-hover:scale-[1.05] group-hover:brightness-110',
                                imgLoaded ? 'opacity-100' : 'opacity-0'
                            )}
                        />
                    ) : (
                        <div
                            className="w-full h-full flex flex-col items-center justify-center gap-3"
                            style={{ background: `linear-gradient(135deg, ${colorPair[0]}, ${colorPair[1]})` }}
                        >
                            <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center">
                                <MapPin className="w-6 h-6 text-white/20" />
                            </div>
                            <span className="text-[10px] font-medium text-white/10 uppercase tracking-widest">No Photos Available</span>
                        </div>
                    )}
                    {/* Deep gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#121116] via-[#121116]/60 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#121116]/20 to-transparent" />

                    {/* Background glow depends on strength */}
                    {score && score > 85 && (
                        <div className="absolute -inset-10 bg-amber-500/10 blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                    )}
                    {capRate && capRate >= 7 && (
                        <div className="absolute -inset-10 bg-emerald-500/10 blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                    )}

                    {/* Multi-tone premium accent line for Hero, unique colors for others */}
                    <div
                        className={cn("absolute bottom-0 left-0 z-10 transition-all duration-500", isHero ? "h-[3.5px] opacity-100" : "h-[2.5px] opacity-70")}
                        style={{
                            width: '100%',
                            background: isHero
                                ? 'linear-gradient(90deg, transparent, #C08B5C, #D4A27F, #F3E5AB, #D4A27F, #C08B5C, transparent)'
                                : `linear-gradient(90deg, transparent, ${['#4B5563', '#60A5FA', '#34D399', '#A855F7'][(index || 0) % 4]}, transparent)`
                        }}
                    />

                    {/* Photo navigation */}
                    {hasMulti && (
                        <>
                            <button onClick={prevPhoto}
                                className="absolute left-2.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 backdrop-blur-md text-white/80 opacity-0 group-hover/img:opacity-100 hover:bg-black/60 transition-all flex items-center justify-center">
                                <ChevronLeft className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={nextPhoto}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 backdrop-blur-md text-white/80 opacity-0 group-hover/img:opacity-100 hover:bg-black/60 transition-all flex items-center justify-center">
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
                        <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-black/40 backdrop-blur-md text-white/80 text-[10px] font-medium">
                            <Bed className="w-3 h-3 text-white/50" />
                            {property.bedrooms}
                        </div>
                        <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-black/40 backdrop-blur-md text-white/80 text-[10px] font-medium">
                            <Bath className="w-3 h-3 text-white/50" />
                            {property.bathrooms}
                        </div>
                        {property.sqft && (
                            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-black/40 backdrop-blur-md text-white/80 text-[10px] font-medium">
                                <Maximize2 className="w-3 h-3 text-white/50" />
                                {property.sqft >= 1000
                                    ? `${(property.sqft / 1000).toFixed(1)}K`
                                    : property.sqft}
                            </div>
                        )}
                    </div>

                    {/* ─── Bottom overlay: Price + Address ─── */}
                    <div className="absolute bottom-0 left-0 right-0 px-4 pb-3.5">
                        {isHero && (
                            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/10 backdrop-blur-md text-white/60 text-[8px] font-bold uppercase tracking-wider mb-1.5 border border-white/5">
                                <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                                Top Recommendation
                            </div>
                        )}
                        {/* Price badge with gradient */}
                        <div className="inline-flex items-center mb-1.5">
                            <span className={cn(
                                "font-extrabold text-white tracking-tight drop-shadow-lg",
                                isHero ? 'text-[28px]' : 'text-[22px]'
                            )}>
                                ${property.price?.toLocaleString()}
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-white/45">
                            <MapPin className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate max-w-[200px]">{property.address}</span>
                        </div>
                    </div>

                    {/* ─── Compare checkbox ─── */}
                    <button
                        onClick={handleToggleComparison}
                        className={cn(
                            'absolute bottom-3 right-3 w-7 h-7 rounded-lg border transition-all flex items-center justify-center text-[11px] font-bold',
                            selected
                                ? 'bg-[#C08B5C] border-[#C08B5C] text-white shadow-lg shadow-[#C08B5C]/20'
                                : 'bg-black/30 backdrop-blur-md border-white/15 text-transparent opacity-0 group-hover:opacity-100 hover:border-[#C08B5C]/40'
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
                                        'border border-white/10'
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
                        <span className="text-white/35 flex items-center gap-1">
                            {property.city}, {property.state}
                            {property.year_built && (
                                <>
                                    <span className="text-white/15 mx-1">·</span>
                                    <Calendar className="w-3 h-3 text-white/20" />
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
                                        : 'text-white/30 bg-white/[0.03]'
                            )}>
                                {property.days_on_market}d on market
                            </span>
                        )}
                    </div>

                    {/* ─── Financial Metrics: 3-column grid ─── */}
                    <div className={cn("grid gap-2", isHero ? "grid-cols-3" : "grid-cols-3")}>
                        <MetricPill
                            label="Rent"
                            value={rent ? `${fmtCurrency(rent)}/mo` : '—'}
                            icon={<DollarSign className={isHero ? "w-4 h-4" : "w-3 h-3"} />}
                            accent="text-white/80"
                            bgTint={isHero ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.025)"}
                        />
                        <MetricPill
                            label="Cap Rate"
                            value={capRate ? `${capRate.toFixed(1)}%` : '—'}
                            icon={<Percent className={isHero ? "w-4 h-4" : "w-3 h-3"} />}
                            accent={capRate && capRate >= 6 ? 'text-emerald-400' : 'text-white/60'}
                            bgTint={capRate && capRate >= 6 ? 'rgba(16,185,129,0.05)' : isHero ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.025)'}
                        />
                        <MetricPill
                            label="Cash Flow"
                            value={cashFlow != null ? `${isPositive ? '+' : '-'}${fmtCurrency(cashFlow)}/mo` : '—'}
                            icon={isPositive ? <TrendingUp className={isHero ? "w-4 h-4" : "w-3 h-3"} /> : <TrendingDown className={isHero ? "w-4 h-4" : "w-3 h-3"} />}
                            accent={isPositive ? 'text-emerald-400' : 'text-rose-400'}
                            bgTint={isPositive ? 'rgba(16,185,129,0.05)' : isHero ? 'rgba(239,68,68,0.06)' : 'rgba(239,68,68,0.04)'}
                        />
                    </div>

                    {/* ─── Action Row ─── */}
                    <div className="flex gap-2 pt-1">
                        {enableHolographicView && (
                            <button
                                onClick={(e) => { e.stopPropagation(); setShowHolographic(true); }}
                                className="w-9 h-9 rounded-xl flex items-center justify-center text-[#D4A27F]/60 hover:text-[#D4A27F] hover:bg-[#C08B5C]/10 transition-all border border-white/[0.04]"
                            >
                                <Sparkles className="w-4 h-4" />
                            </button>
                        )}
                        <button
                            onClick={(e) => { e.stopPropagation(); onViewDetails?.(property); }}
                            className="flex-1 h-9 text-[11px] font-medium text-white/50 rounded-xl transition-all border border-white/[0.05] hover:bg-white/[0.05] hover:text-white/70 hover:border-white/[0.08]"
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
    onRecalculate,
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
                        <span className="text-[12px] text-white/30 font-medium">
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
                <div className="flex overflow-x-auto gap-5 py-2 -mx-4 px-4 scrollbar-hide snap-x snap-mandatory">
                    {properties.map((property, idx) => (
                        <PropertyCard
                            key={property.listing_id}
                            property={property}
                            onViewDetails={onViewDetails}
                            onOpenDealAnalyzer={onOpenDealAnalyzer}
                            criteria={investmentCriteria}
                            enableHolographicView={holographicMode}
                            isHero={idx === 0}
                            index={idx}
                            onRecalculate={onRecalculate}
                        />
                    ))}
                </div>
            </div>

            <PropertyComparisonModal isOpen={showComparison} onClose={() => setShowComparison(false)} />
        </>
    );
};
