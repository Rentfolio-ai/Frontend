import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Building2, MoreHorizontal, ChevronRight } from 'lucide-react';
import type { ScoutedProperty } from '../../types/backendTools';
import type { DealStatus } from '../../types/bookmarks';

interface DealsKanbanProps {
    properties: ScoutedProperty[];
    loading?: boolean;
    onViewProperty: (property: ScoutedProperty) => void;
    onAnalyzeProperty: (property: ScoutedProperty) => void;
    dealStatuses: Map<string, DealStatus>;
    onStatusChange?: (property: ScoutedProperty, bookmarkId: string, status: DealStatus) => void;
    bookmarkIdMap: Map<string, string>;
}

// Ensure the columns match the DealStatus types with a visually flat Notion aesthetic
const KANBAN_COLUMNS: { id: DealStatus; label: string; colorClass: string; dotClass: string }[] = [
    { id: 'active', label: 'Active', colorClass: 'text-sky-400', dotClass: 'bg-sky-400' },
    { id: 'under_contract', label: 'Under Contract', colorClass: 'text-amber-400', dotClass: 'bg-amber-400' },
    { id: 'closed', label: 'Closed', colorClass: 'text-emerald-400', dotClass: 'bg-emerald-400' },
    { id: 'lost', label: 'Lost', colorClass: 'text-rose-400', dotClass: 'bg-rose-400' },
];

function formatPrice(price: number): string {
    if (price >= 1000000) return `$${(price / 1000000).toFixed(1)}M`;
    return `$${(price / 1000).toFixed(0)}K`;
}

export const DealsKanban: React.FC<DealsKanbanProps> = ({
    properties,
    loading,
    onViewProperty,
    onAnalyzeProperty,
    dealStatuses,
    onStatusChange,
    bookmarkIdMap,
}) => {
    if (loading) {
        return (
            <div className="flex gap-4 overflow-x-auto pb-8 snap-x">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="min-w-[280px] w-[280px] flex-shrink-0 animate-pulse">
                        <div className="h-6 w-24 bg-black/[0.03] rounded mb-4" />
                        <div className="space-y-3">
                            {[...Array(3)].map((_, j) => (
                                <div key={j} className="h-32 rounded-lg bg-muted border border-black/[0.04]" />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    // Group properties by status
    const grouped = KANBAN_COLUMNS.reduce((acc, col) => {
        acc[col.id] = properties.filter(p => (dealStatuses.get(p.listing_id) || 'active') === col.id);
        return acc;
    }, {} as Record<DealStatus, ScoutedProperty[]>);

    return (
        <div className="flex gap-5 overflow-x-auto pb-8 custom-scrollbar items-start h-full">
            {KANBAN_COLUMNS.map(column => {
                const columnProps = grouped[column.id] || [];

                return (
                    <div key={column.id} className="w-[300px] flex-shrink-0 flex flex-col gap-3">
                        {/* Column Header (Notion Style) */}
                        <div className="flex items-center justify-between px-1 mb-1">
                            <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${column.dotClass}`} />
                                <h3 className="text-[13px] font-semibold text-foreground/80 tracking-wide">{column.label}</h3>
                                <span className="text-[11px] font-mono text-muted-foreground/70">{columnProps.length}</span>
                            </div>
                            <button className="p-1 rounded hover:bg-black/[0.05] text-muted-foreground/50 transition-colors">
                                <MoreHorizontal className="w-3.5 h-3.5" />
                            </button>
                        </div>

                        {/* Column Cards */}
                        <div className="flex flex-col gap-2.5">
                            <AnimatePresence>
                                {columnProps.map(property => {
                                    const bookmarkId = bookmarkIdMap.get(property.listing_id) || '';

                                    return (
                                        <motion.div
                                            layout
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            key={property.listing_id}
                                            onClick={() => onViewProperty(property)}
                                            onMouseEnter={() => {
                                                window.dispatchEvent(new CustomEvent('set-focus-item', { detail: { id: property.listing_id } }));
                                            }}
                                            onMouseLeave={() => {
                                                window.dispatchEvent(new CustomEvent('set-focus-item', { detail: { id: null } }));
                                            }}
                                            className="group relative bg-muted hover:bg-muted border border-transparent hover:border-black/[0.06] rounded-lg p-3 cursor-pointer transition-all duration-200 shadow-sm"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-[14px] font-bold text-foreground tabular-nums">
                                                    {formatPrice(property.price)}
                                                </span>

                                                {/* Quick Status Change Dropdown */}
                                                <div className="relative group/menu">
                                                    <button className="p-1 rounded bg-black/20 text-muted-foreground hover:text-foreground/80 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                                                        <MoreHorizontal className="w-3.5 h-3.5" />
                                                    </button>
                                                    <div className="absolute right-0 top-full mt-1 w-32 bg-background border border-black/[0.08] rounded-md shadow-xl py-1 opacity-0 pointer-events-none group-hover/menu:opacity-100 group-hover/menu:pointer-events-auto transition-opacity z-10">
                                                        {KANBAN_COLUMNS.map(c => (
                                                            <button
                                                                key={c.id}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    if (onStatusChange && bookmarkId) {
                                                                        onStatusChange(property, bookmarkId, c.id);
                                                                    }
                                                                }}
                                                                className="w-full text-left px-3 py-1.5 text-[11px] text-foreground/70 hover:bg-black/[0.05] hover:text-foreground flex items-center gap-2"
                                                            >
                                                                <span className={`w-1.5 h-1.5 rounded-full ${c.dotClass}`} />
                                                                {c.label}
                                                                {column.id === c.id && <ChevronRight className="w-3 h-3 ml-auto text-muted-foreground/50" />}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            <h4 className="text-[12px] font-medium text-foreground/80 mb-1 leading-snug truncate">
                                                {property.address}
                                            </h4>
                                            <p className="text-[11px] text-muted-foreground/70 flex items-center gap-1 mb-3">
                                                {property.city}, {property.state}
                                            </p>

                                            <div className="flex items-center gap-3 text-[10px] text-muted-foreground mb-3">
                                                <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> {property.bedrooms}b {property.bathrooms}ba</span>
                                                <span className="text-muted-foreground/40">•</span>
                                                <span>{property.sqft ? property.sqft.toLocaleString() : '—'} sqft</span>
                                            </div>

                                            {/* Tags row */}
                                            <div className="flex items-center gap-1.5 flex-wrap mt-auto">
                                                <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-black/[0.05] text-muted-foreground">
                                                    {property.property_type?.replace('_', ' ') || 'Property'}
                                                </span>
                                                {property.cash_on_cash_roi != null && property.cash_on_cash_roi > 0 && (
                                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-emerald-500/10 text-emerald-400">
                                                        {(property.cash_on_cash_roi * 100).toFixed(1)}% CoC
                                                    </span>
                                                )}
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); onAnalyzeProperty(property); }}
                                                    className="ml-auto flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-[#C08B5C]/10 text-[#C08B5C] hover:bg-[#C08B5C]/20 transition-colors"
                                                >
                                                    <Sparkles className="w-2.5 h-2.5" /> Analyze
                                                </button>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
