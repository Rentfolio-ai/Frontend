import React from 'react';
import { TrendingUp, MapPin } from 'lucide-react';

interface PropertyMetrics {
    cashFlow: number;
    occupancy: number;
    roi: number;
    capRate: number;
}

interface PropertyCardProps {
    id: string;
    address: string;
    city: string;
    state: string;
    imageUrl?: string;
    metrics: PropertyMetrics;
    type: 'STR' | 'LTR';
    onViewDetails?: (id: string) => void;
    onAskAI?: (id: string, address: string) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
    id,
    address,
    city,
    state,
    imageUrl,
    metrics,
    type,
    onViewDetails,
    onAskAI
}) => {
    return (
        <div
            className="relative rounded-lg overflow-hidden transition-all duration-200"
            style={{
                background: 'var(--color-bg-tertiary)',
                border: '1px solid var(--color-border-default)',
                fontFamily: "'Inter', sans-serif"
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-border-emphasis)';
                e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-border-default)';
                e.currentTarget.style.transform = 'translateY(0)';
            }}
        >
            {/* Property Type Badge */}
            <div className="absolute top-3 right-3 z-10">
                <span
                    className="px-2 py-1 rounded text-xs font-medium"
                    style={{
                        background: type === 'STR' ? 'var(--color-accent-teal-500)' : 'var(--color-accent-emerald-500)',
                        color: 'var(--color-bg-primary)'
                    }}
                >
                    {type}
                </span>
            </div>

            {/* Property Image */}
            {imageUrl && (
                <div className="w-full h-48 bg-gradient-to-br from-gray-800 to-gray-900 relative overflow-hidden">
                    <img
                        src={imageUrl}
                        alt={address}
                        className="w-full h-full object-cover"
                    />
                </div>
            )}

            {/* Content */}
            <div className="p-4">
                {/* Address */}
                <div className="flex items-start gap-2 mb-4">
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--color-accent-teal-400)' }} />
                    <div>
                        <h3
                            className="text-base font-medium leading-tight"
                            style={{ color: 'var(--color-text-primary)' }}
                        >
                            {address}
                        </h3>
                        <p
                            className="text-sm mt-0.5"
                            style={{ color: 'var(--color-text-tertiary)' }}
                        >
                            {city}, {state}
                        </p>
                    </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-3 mb-4 pb-4" style={{ borderBottom: '1px solid var(--color-border-default)' }}>
                    <div>
                        <div
                            className="text-xs uppercase tracking-wider mb-1"
                            style={{ color: 'var(--color-text-tertiary)', fontWeight: 500 }}
                        >
                            Cash Flow
                        </div>
                        <div
                            className="text-lg font-medium flex items-center gap-1"
                            style={{ color: metrics.cashFlow >= 0 ? '#10b981' : '#ef4444' }}
                        >
                            {metrics.cashFlow >= 0 && <TrendingUp className="w-3.5 h-3.5" />}
                            ${Math.abs(metrics.cashFlow).toLocaleString()}/mo
                        </div>
                    </div>

                    <div>
                        <div
                            className="text-xs uppercase tracking-wider mb-1"
                            style={{ color: 'var(--color-text-tertiary)', fontWeight: 500 }}
                        >
                            Occupancy
                        </div>
                        <div
                            className="text-lg font-medium"
                            style={{ color: 'var(--color-accent-teal-400)' }}
                        >
                            {metrics.occupancy}%
                        </div>
                    </div>

                    <div>
                        <div
                            className="text-xs uppercase tracking-wider mb-1"
                            style={{ color: 'var(--color-text-tertiary)', fontWeight: 500 }}
                        >
                            ROI
                        </div>
                        <div
                            className="text-lg font-medium"
                            style={{ color: 'var(--color-text-primary)' }}
                        >
                            {metrics.roi.toFixed(1)}%
                        </div>
                    </div>

                    <div>
                        <div
                            className="text-xs uppercase tracking-wider mb-1"
                            style={{ color: 'var(--color-text-tertiary)', fontWeight: 500 }}
                        >
                            Cap Rate
                        </div>
                        <div
                            className="text-lg font-medium"
                            style={{ color: 'var(--color-text-primary)' }}
                        >
                            {metrics.capRate.toFixed(1)}%
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                    <button
                        onClick={() => onViewDetails?.(id)}
                        className="flex-1 px-3 py-2 rounded text-sm font-medium transition-colors"
                        style={{
                            background: 'var(--color-bg-elevated)',
                            border: '1px solid var(--color-border-default)',
                            color: 'var(--color-text-secondary)'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'var(--color-bg-primary)';
                            e.currentTarget.style.borderColor = 'var(--color-border-emphasis)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'var(--color-bg-elevated)';
                            e.currentTarget.style.borderColor = 'var(--color-border-default)';
                        }}
                    >
                        View Details
                    </button>

                    <button
                        onClick={() => onAskAI?.(id, `${address}, ${city}`)}
                        className="flex-1 px-3 py-2 rounded text-sm font-medium transition-colors"
                        style={{
                            background: 'var(--color-accent-teal-500)',
                            border: '1px solid var(--color-accent-teal-500)',
                            color: 'var(--color-bg-primary)'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'var(--color-accent-teal-400)';
                            e.currentTarget.style.borderColor = 'var(--color-accent-teal-400)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'var(--color-accent-teal-500)';
                            e.currentTarget.style.borderColor = 'var(--color-accent-teal-500)';
                        }}
                    >
                        Ask AI About This
                    </button>
                </div>
            </div>
        </div>
    );
};
