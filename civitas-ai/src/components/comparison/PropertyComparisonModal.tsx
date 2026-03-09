/**
 * Property Comparison Modal
 * 
 * Side-by-side comparison of up to 3 properties
 */

import React from 'react';
import { X, TrendingUp, TrendingDown, Minus, Download } from 'lucide-react';
import { useComparisonStore } from '../../stores/comparisonStore';
import { exportComparisonToPDF } from '../../utils/pdfExport';
import { cn } from '../../lib/utils';

interface PropertyComparisonModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const PropertyComparisonModal: React.FC<PropertyComparisonModalProps> = ({
    isOpen,
    onClose
}) => {
    const { selectedProperties, clearComparison, removeFromComparison } = useComparisonStore();

    if (!isOpen || selectedProperties.length === 0) return null;

    // Comparison metrics
    const metrics = [
        { key: 'price', label: 'Price', format: (v: number) => `$${v.toLocaleString()}`, higher: false },
        { key: 'bedrooms', label: 'Bedrooms', format: (v: number) => v.toString(), higher: true },
        { key: 'bathrooms', label: 'Bathrooms', format: (v: number) => v.toString(), higher: true },
        { key: 'sqft', label: 'Square Feet', format: (v: number) => v.toLocaleString(), higher: true },
        { key: 'yearBuilt', label: 'Year Built', format: (v: number) => v.toString(), higher: true },
        { key: 'monthlyRent', label: 'Monthly Rent', format: (v: number) => `$${v.toLocaleString()}`, higher: true },
        { key: 'cashFlow', label: 'Monthly Cash Flow', format: (v: number) => `${v >= 0 ? '+' : ''}$${v.toLocaleString()}`, higher: true },
        { key: 'cocReturn', label: 'CoC Return', format: (v: number) => `${v.toFixed(2)}%`, higher: true },
        { key: 'capRate', label: 'Cap Rate', format: (v: number) => `${v.toFixed(2)}%`, higher: true },
    ];

    // Find best value for each metric
    const getBestValue = (key: string, higherIsBetter: boolean) => {
        const values = selectedProperties
            .map(p => (p as any)[key])
            .filter(v => v !== undefined && v !== null);

        if (values.length === 0) return null;

        return higherIsBetter ? Math.max(...values) : Math.min(...values);
    };

    const handleExportPDF = async () => {
        try {
            await exportComparisonToPDF(selectedProperties);
        } catch (error) {
            console.error('PDF export failed:', error);
            alert('Failed to export PDF. Please try again.');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

            {/* Modal */}
            <div className="relative w-full max-w-6xl max-h-[90vh] bg-popover border border-black/8 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
                {/* Header */}
                <div className="px-6 py-4 border-b border-black/8 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-foreground">Property Comparison</h2>
                        <p className="text-sm text-muted-foreground mt-1">
                            Comparing {selectedProperties.length} {selectedProperties.length === 1 ? 'property' : 'properties'}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleExportPDF}
                            className="px-4 py-2 bg-[#C08B5C]/20 hover:bg-[#C08B5C]/30 border border-[#C08B5C]/30 text-[#D4A27F] rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                        >
                            <Download className="w-4 h-4" />
                            Export PDF
                        </button>
                        <button
                            onClick={clearComparison}
                            className="px-4 py-2 bg-black/5 hover:bg-black/8 text-foreground/70 rounded-lg text-sm font-medium transition-colors"
                        >
                            Clear All
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-black/8 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5 text-muted-foreground" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto">
                    <table className="w-full">
                        <thead className="sticky top-0 bg-popover z-10">
                            <tr className="border-b border-black/8">
                                <th className="text-left p-4 text-sm font-semibold text-foreground/80 w-48">
                                    Metric
                                </th>
                                {selectedProperties.map((property) => (
                                    <th key={property.id} className="p-4 text-center relative group">
                                        <button
                                            onClick={() => removeFromComparison(property.id)}
                                            className="absolute top-2 right-2 p-1 bg-red-500/20 hover:bg-red-500/30 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="w-3 h-3 text-red-400" />
                                        </button>
                                        <div className="text-sm font-semibold text-foreground truncate">
                                            {property.address}
                                        </div>
                                        {property.city && property.state && (
                                            <div className="text-xs text-muted-foreground mt-1">
                                                {property.city}, {property.state}
                                            </div>
                                        )}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {metrics.map((metric, idx) => {
                                const bestValue = getBestValue(metric.key, metric.higher);

                                // Skip row if all values are undefined
                                const hasValues = selectedProperties.some(p => (p as any)[metric.key] !== undefined && (p as any)[metric.key] !== null);
                                if (!hasValues) return null;

                                return (
                                    <tr key={metric.key} className={cn(
                                        "border-b border-black/5",
                                        idx % 2 === 0 ? 'bg-black/[0.02]' : ''
                                    )}>
                                        <td className="p-4 text-sm text-foreground/70 font-medium">
                                            {metric.label}
                                        </td>
                                        {selectedProperties.map((property) => {
                                            const value = (property as any)[metric.key];
                                            const isBest = value !== undefined && value !== null && value === bestValue;
                                            const hasValue = value !== undefined && value !== null;

                                            return (
                                                <td key={property.id} className="p-4 text-center">
                                                    {hasValue ? (
                                                        <div className={cn(
                                                            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-sm",
                                                            isBest
                                                                ? "bg-[#C08B5C]/20 text-[#D4A27F] border border-[#C08B5C]/30"
                                                                : "bg-black/5 text-foreground"
                                                        )}>
                                                            {isBest && (
                                                                metric.higher ?
                                                                    <TrendingUp className="w-3.5 h-3.5" /> :
                                                                    <TrendingDown className="w-3.5 h-3.5" />
                                                            )}
                                                            {metric.format(value)}
                                                        </div>
                                                    ) : (
                                                        <div className="text-muted-foreground/50 text-sm flex items-center justify-center gap-1">
                                                            <Minus className="w-3 h-3" />
                                                            <span>N/A</span>
                                                        </div>
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div className="px-6 py-3 border-t border-black/8 bg-black/[0.02] flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                            <TrendingUp className="w-3.5 h-3.5 text-[#D4A27F]" />
                            <span>= Best value</span>
                        </div>
                    </div>
                    <div className="text-xs text-muted-foreground/70">
                        Tip: Click the X on any property to remove it from comparison
                    </div>
                </div>
            </div>
        </div>
    );
};
