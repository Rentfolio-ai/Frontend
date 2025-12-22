/**
 * Holographic Property Modal
 * 
 * Displays property in holographic view when user requests it
 */

import React from 'react';
import { X, Sparkles } from 'lucide-react';
import { HolographicPropertyView } from '../../property/HolographicPropertyView';
import type { ScoutedProperty } from '../../../types/backendTools';

interface HolographicModalProps {
    isOpen: boolean;
    onClose: () => void;
    property: ScoutedProperty;
}

export const HolographicPropertyModal: React.FC<HolographicModalProps> = ({
    isOpen,
    onClose,
    property
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                onClick={onClose}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />

            {/* Modal */}
            <div className="relative w-full max-w-5xl">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute -top-12 right-0 p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors flex items-center gap-2"
                >
                    <span className="text-sm">Close</span>
                    <X className="w-5 h-5" />
                </button>

                {/* Header */}
                <div className="mb-4 flex items-center gap-2 text-teal-400">
                    <Sparkles className="w-5 h-5" />
                    <span className="text-sm font-semibold uppercase tracking-wider">
                        Holographic Property Visualization
                    </span>
                </div>

                {/* Holographic View */}
                <HolographicPropertyView
                    property={{
                        bedrooms: property.bedrooms || 0,
                        bathrooms: property.bathrooms || 0,
                        sqft: property.sqft || 0,
                        price: property.price,
                        address: property.address,
                        amenities: property.amenities || [],
                        yearBuilt: property.year_built,
                        lotSize: property.lot_sqft
                    }}
                    variant="full"
                />
            </div>
        </div>
    );
};
