// FILE: src/components/portfolio/PropertyGridCard.tsx
/**
 * Property Grid Card - Visual property card with thumbnail and key metrics
 * Professional design matching Stessa/DoorLoop style
 */

import React from 'react';
import { motion } from 'framer-motion';
import {
    Home,
    MapPin,
    Bed,
    Bath,
    Square,
    TrendingUp,
    MoreVertical,
    Edit2,
    Trash2,
    ExternalLink,
} from 'lucide-react';
import type { PortfolioProperty } from '../../types/portfolio';

interface PropertyGridCardProps {
    property: PortfolioProperty;
    onEdit?: () => void;
    onDelete?: () => void;
    onView?: () => void;
    index?: number;
}

// Strategy badge colors
const strategyColors: Record<string, { bg: string; text: string }> = {
    LTR: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
    STR: { bg: 'bg-purple-500/20', text: 'text-purple-400' },
    MTR: { bg: 'bg-amber-500/20', text: 'text-amber-400' },
    default: { bg: 'bg-teal-500/20', text: 'text-teal-400' },
};

// Property type icons/colors
const propertyTypeConfig: Record<string, { icon: string; color: string }> = {
    SFH: { icon: '🏠', color: 'text-green-400' },
    Multi: { icon: '🏢', color: 'text-blue-400' },
    Condo: { icon: '🏙️', color: 'text-purple-400' },
    Townhouse: { icon: '🏘️', color: 'text-amber-400' },
    default: { icon: '🏠', color: 'text-teal-400' },
};

// Generate placeholder gradient for properties without images
const generateGradient = (seed: string): string => {
    const gradients = [
        'from-blue-600/30 to-purple-600/30',
        'from-teal-600/30 to-cyan-600/30',
        'from-amber-600/30 to-orange-600/30',
        'from-green-600/30 to-emerald-600/30',
        'from-rose-600/30 to-pink-600/30',
        'from-indigo-600/30 to-blue-600/30',
    ];
    const index = seed.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % gradients.length;
    return gradients[index];
};

export const PropertyGridCard: React.FC<PropertyGridCardProps> = ({
    property,
    onEdit,
    onDelete,
    onView,
    index = 0,
}) => {
    const [showMenu, setShowMenu] = React.useState(false);

    // Extract data
    const strategy = (property as any).strategy || 'LTR';
    const propertyType = (property as any).property_type || 'SFH';
    const beds = (property as any).beds || property.financials?.monthly_expenses?.other || 3;
    const baths = (property as any).baths || 2;
    const sqft = (property as any).sqft || 1500;
    const imageUrl = (property as any).image_url;

    const strategyStyle = strategyColors[strategy] || strategyColors.default;
    const typeConfig = propertyTypeConfig[propertyType] || propertyTypeConfig.default;
    const gradient = generateGradient(property.property_id);

    // Calculate metrics
    const monthlyRent = property.financials?.monthly_rent || 0;
    const monthlyExpenses = property.financials?.monthly_expenses?.total || 0;
    const monthlyCashFlow = monthlyRent - monthlyExpenses;
    const currentValue = property.financials?.current_value || property.financials?.purchase_price || 0;
    const capRate = property.metrics?.cap_rate || 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group relative bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden hover:border-teal-500/30 transition-all"
        >
            {/* Image/Gradient Header */}
            <div className={`relative h-36 bg-gradient-to-br ${gradient}`}>
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={property.address}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Home className="w-12 h-12 text-white/20" />
                    </div>
                )}

                {/* Strategy Badge */}
                <div className="absolute top-3 left-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-md ${strategyStyle.bg} ${strategyStyle.text}`}>
                        {strategy}
                    </span>
                </div>

                {/* Property Type */}
                <div className="absolute top-3 right-3">
                    <span className={`text-lg ${typeConfig.color}`}>
                        {typeConfig.icon}
                    </span>
                </div>

                {/* Vacancy Status */}
                <div className="absolute bottom-3 right-3">
                    <span className="px-2 py-1 text-xs font-medium rounded-md bg-green-500/20 text-green-400">
                        Occupied
                    </span>
                </div>

                {/* Quick Actions (on hover) */}
                <div className="absolute top-3 right-12 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowMenu(!showMenu);
                        }}
                        className="p-1.5 bg-black/50 backdrop-blur-sm rounded-lg text-white hover:bg-black/70 transition-all"
                    >
                        <MoreVertical className="w-4 h-4" />
                    </button>

                    {/* Dropdown Menu */}
                    {showMenu && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="absolute right-0 top-8 bg-slate-800 border border-white/10 rounded-lg shadow-xl py-1 min-w-[120px] z-10"
                        >
                            {onView && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); onView(); setShowMenu(false); }}
                                    className="w-full px-3 py-2 text-left text-sm text-slate-300 hover:bg-white/10 flex items-center gap-2"
                                >
                                    <ExternalLink className="w-3 h-3" /> View
                                </button>
                            )}
                            {onEdit && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); onEdit(); setShowMenu(false); }}
                                    className="w-full px-3 py-2 text-left text-sm text-slate-300 hover:bg-white/10 flex items-center gap-2"
                                >
                                    <Edit2 className="w-3 h-3" /> Edit
                                </button>
                            )}
                            {onDelete && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); onDelete(); setShowMenu(false); }}
                                    className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2"
                                >
                                    <Trash2 className="w-3 h-3" /> Delete
                                </button>
                            )}
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="p-4">
                {/* Address */}
                <h3 className="text-base font-semibold text-white mb-1 line-clamp-1" title={property.address}>
                    {property.address}
                </h3>
                <div className="flex items-center gap-1 text-xs text-slate-400 mb-3">
                    <MapPin className="w-3 h-3" />
                    <span>{property.city || 'Unknown'}, {property.state || 'TX'}</span>
                </div>

                {/* Property Features */}
                <div className="flex items-center gap-4 text-xs text-slate-400 mb-4">
                    <div className="flex items-center gap-1">
                        <Bed className="w-3.5 h-3.5" />
                        <span>{beds} bd</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Bath className="w-3.5 h-3.5" />
                        <span>{baths} ba</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Square className="w-3.5 h-3.5" />
                        <span>{sqft.toLocaleString()} sqft</span>
                    </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-3">
                    {/* Value */}
                    <div className="bg-white/5 rounded-lg p-2.5">
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">Value</p>
                        <p className="text-sm font-semibold text-white">
                            ${currentValue.toLocaleString()}
                        </p>
                    </div>

                    {/* Rent */}
                    <div className="bg-white/5 rounded-lg p-2.5">
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">Rent</p>
                        <p className="text-sm font-semibold text-slate-300">
                            ${monthlyRent.toLocaleString()}/mo
                        </p>
                    </div>

                    {/* Cash Flow */}
                    <div className="bg-white/5 rounded-lg p-2.5">
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">Cash Flow</p>
                        <p className={`text-sm font-semibold flex items-center gap-1 ${monthlyCashFlow >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {monthlyCashFlow >= 0 ? <TrendingUp className="w-3 h-3" /> : null}
                            ${Math.abs(monthlyCashFlow).toLocaleString()}/mo
                        </p>
                    </div>

                    {/* Cap Rate */}
                    <div className="bg-white/5 rounded-lg p-2.5">
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">Cap Rate</p>
                        <p className="text-sm font-semibold text-teal-400">
                            {(capRate * 100).toFixed(1)}%
                        </p>
                    </div>
                </div>
            </div>

            {/* Click overlay */}
            <div
                className="absolute inset-0 cursor-pointer"
                onClick={onView}
                style={{ zIndex: showMenu ? -1 : 0 }}
            />
        </motion.div>
    );
};

export default PropertyGridCard;
