/**
 * Holographic Property Visualization Component
 * 
 * Generates a futuristic 3D visualization of properties based on metadata
 * when actual images aren't available. Creates procedural floor plans and
 * holographic data displays.
 */

import React, { useState } from 'react';
import { Home, Maximize2, Bed, Bath, DollarSign, Zap } from 'lucide-react';

interface PropertyData {
    bedrooms: number;
    bathrooms: number;
    sqft: number;
    price?: number;
    address?: string;
    amenities?: string[];
    yearBuilt?: number;
    lotSize?: number;
}

interface HolographicPropertyViewProps {
    property: PropertyData;
    variant?: 'full' | 'compact';
}

export const HolographicPropertyView: React.FC<HolographicPropertyViewProps> = ({
    property,
    variant = 'full'
}) => {
    const [isScanning, setIsScanning] = useState(true);

    // Generate procedural floor plan layout
    const generateFloorPlan = () => {
        const { bedrooms, bathrooms } = property;

        const rooms = [
            { type: 'living', icon: Home, color: 'teal' },
            { type: 'kitchen', icon: Home, color: 'orange' },
            ...Array(bedrooms).fill(null).map(() => ({ type: 'bedroom', icon: Bed, color: 'blue' })),
            ...Array(bathrooms).fill(null).map(() => ({ type: 'bathroom', icon: Bath, color: 'purple' }))
        ];

        return rooms;
    };

    const rooms = generateFloorPlan();

    // Simulate scanning effect on mount
    React.useEffect(() => {
        const timer = setTimeout(() => setIsScanning(false), 2000);
        return () => clearTimeout(timer);
    }, []);

    if (variant === 'compact') {
        return (
            <div className="relative w-full aspect-video bg-gradient-to-br from-gray-900 to-black rounded-xl overflow-hidden border border-[#C08B5C]/30">
                {/* Holographic Grid */}
                <div className="absolute inset-0" style={{
                    backgroundImage: `
            linear-gradient(rgba(192, 139, 92, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(192, 139, 92, 0.1) 1px, transparent 1px)
          `,
                    backgroundSize: '20px 20px'
                }} />

                {/* Compact Stats */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                        <div className="text-4xl font-bold text-[#D4A27F] mb-2">
                            {property.bedrooms}BD / {property.bathrooms}BA
                        </div>
                        <div className="text-xl text-foreground/70">
                            {property.sqft.toLocaleString()} sqft
                        </div>
                    </div>
                </div>

                {/* Scan Line */}
                {isScanning && (
                    <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C08B5C] to-transparent animate-scan" />
                )}
            </div>
        );
    }

    return (
        <div className="relative w-full bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-2xl overflow-hidden border border-[#C08B5C]/30 shadow-2xl shadow-[#C08B5C]/10">
            {/* Holographic Grid Background */}
            <div className="absolute inset-0 opacity-30" style={{
                backgroundImage: `
          linear-gradient(rgba(192, 139, 92, 0.2) 1px, transparent 1px),
          linear-gradient(90deg, rgba(192, 139, 92, 0.2) 1px, transparent 1px)
        `,
                backgroundSize: '30px 30px',
                transform: 'perspective(500px) rotateX(60deg)',
                transformOrigin: 'center bottom'
            }} />

            {/* Scan Line Effect */}
            {isScanning && (
                <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#D4A27F] to-transparent opacity-80 blur-sm animate-scan" style={{ animationDuration: '3s' }} />
            )}

            {/* Content */}
            <div className="relative  p-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Zap className="w-5 h-5 text-[#D4A27F]" />
                            <span className="text-xs font-semibold text-[#D4A27F] uppercase tracking-wider">
                                AI-Generated Visualization
                            </span>
                        </div>
                        {property.address && (
                            <h3 className="text-xl font-bold text-foreground">{property.address}</h3>
                        )}
                    </div>
                    <div className="px-3 py-1 rounded-lg bg-[#C08B5C]/20 border border-[#C08B5C]/30">
                        <span className="text-sm font-medium text-[#D4A27F]">Procedural Model</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                    {/* Left: Isometric Floor Plan */}
                    <div className="relative aspect-square">
                        <div className="absolute inset-0 flex items-center justify-center">
                            {/* 3D Isometric Container */}
                            <div
                                className="relative w-64 h-64"
                                style={{
                                    transform: 'rotateX(60deg) rotateZ(-45deg)',
                                    transformStyle: 'preserve-3d'
                                }}
                            >
                                {/* Floor base */}
                                <div className="absolute inset-0 bg-gradient-to-br from-gray-700/50 to-gray-800/50 border border-[#C08B5C]/30 rounded-lg backdrop-blur-sm" />

                                {/* Room blocks */}
                                <div className="absolute inset-4 grid grid-cols-3 gap-2">
                                    {rooms.slice(0, 9).map((room, idx) => (
                                        <div
                                            key={idx}
                                            className={`relative bg-gradient-to-br from-${room.color}-500/20 to-${room.color}-600/20 border border-${room.color}-400/40 rounded flex items-center justify-center group hover:scale-110 transition-transform`}
                                            style={{
                                                transform: `translateZ(${20 + idx * 2}px)`,
                                                transformStyle: 'preserve-3d'
                                            }}
                                        >
                                            <room.icon className="w-4 h-4 text-muted-foreground" />
                                        </div>
                                    ))}
                                </div>

                                {/* Holographic particles */}
                                {[...Array(8)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="absolute w-1 h-1 bg-[#D4A27F] rounded-full opacity-60"
                                        style={{
                                            left: `${Math.random() * 100}%`,
                                            top: `${Math.random() * 100}%`,
                                            animation: `float ${3 + Math.random() * 2}s ease-in-out infinite`,
                                            animationDelay: `${Math.random() * 2}s`
                                        }}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Corner Markers */}
                        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#C08B5C]" />
                        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#C08B5C]" />
                        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#C08B5C]" />
                        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#C08B5C]" />
                    </div>

                    {/* Right: Property Stats */}
                    <div className="space-y-4">
                        {/* Primary Stats */}
                        <div className="grid grid-cols-2 gap-4">
                            <StatCard
                                icon={Bed}
                                label="Bedrooms"
                                value={property.bedrooms.toString()}
                                color="blue"
                            />
                            <StatCard
                                icon={Bath}
                                label="Bathrooms"
                                value={property.bathrooms.toString()}
                                color="purple"
                            />
                            <StatCard
                                icon={Maximize2}
                                label="Square Feet"
                                value={property.sqft.toLocaleString()}
                                color="teal"
                            />
                            {property.price && (
                                <StatCard
                                    icon={DollarSign}
                                    label="Price"
                                    value={`$${(property.price / 1000).toFixed(0)}k`}
                                    color="green"
                                />
                            )}
                        </div>

                        {/* Amenities */}
                        {property.amenities && property.amenities.length > 0 && (
                            <div className="p-4 rounded-lg bg-black/5 border border-black/8">
                                <h4 className="text-sm font-semibold text-foreground/80 mb-3">Key Features</h4>
                                <div className="flex flex-wrap gap-2">
                                    {property.amenities.slice(0, 6).map((amenity, idx) => (
                                        <span
                                            key={idx}
                                            className="px-2 py-1 text-xs rounded bg-[#C08B5C]/20 text-[#D4A27F] border border-[#C08B5C]/30"
                                        >
                                            {amenity}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Additional Data */}
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            {property.yearBuilt && (
                                <div className="flex justify-between p-2 rounded bg-black/5">
                                    <span className="text-muted-foreground">Built</span>
                                    <span className="text-foreground font-medium">{property.yearBuilt}</span>
                                </div>
                            )}
                            {property.lotSize && (
                                <div className="flex justify-between p-2 rounded bg-black/5">
                                    <span className="text-muted-foreground">Lot</span>
                                    <span className="text-foreground font-medium">{property.lotSize.toLocaleString()} sqft</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Bottom Status Bar */}
                <div className="mt-6 pt-4 border-t border-black/8 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-muted-foreground/70">
                        <div className="w-2 h-2 bg-[#C08B5C] rounded-full animate-pulse" />
                        <span>Live property data visualization</span>
                    </div>
                    <div className="flex gap-4 text-muted-foreground/70">
                        <span>Confidence: <span className="text-[#D4A27F] font-semibold">94%</span></span>
                        <span>Updated: Just now</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Stat Card Component
interface StatCardProps {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    value: string;
    color: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, label, value, color }) => (
    <div className={`p-4 rounded-lg bg-${color}-500/10 border border-${color}-500/30 hover:bg-${color}-500/15 transition-colors`}>
        <div className="flex items-center gap-2 mb-2">
            <Icon className={`w-4 h-4 text-${color}-400`} />
            <span className={`text-xs text-${color}-300/80 font-medium`}>{label}</span>
        </div>
        <div className={`text-2xl font-bold text-${color}-300`}>{value}</div>
    </div>
);
