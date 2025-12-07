import React, { useEffect, useState } from 'react';
import {
    DollarSign,
    Calculator,
    ChevronLeft,
    Home
} from 'lucide-react';

import { Card } from '../primitives/Card';
import { Button } from '../primitives/Button';

export interface PropertyDetails {
    formattedAddress: string;
    price: number;
    bedrooms: number;
    bathrooms: number;
    squareFootage: number;
    yearBuilt: number;
    description: string;
    images: string[];
    taxAnnualAmount?: number;
    hoaFee?: number;
    history?: any[];
    source?: string;
}

interface PropertyDetailsPageProps {
    address: string;
    initialPropertyData?: any; // Should be ScoutedProperty
    onBack: () => void;
    onAnalyze: (overrides: any) => void;
}

export const PropertyDetailsPage: React.FC<PropertyDetailsPageProps> = ({ address, initialPropertyData, onBack, onAnalyze }) => {

    const [property, setProperty] = useState<PropertyDetails | null>(null);
    const [loading, setLoading] = useState(!initialPropertyData);
    const [imageIndex, setImageIndex] = useState(0);

    useEffect(() => {
        if (initialPropertyData) {
            // Transform ScoutedProperty to PropertyDetails
            setProperty({
                formattedAddress: initialPropertyData.address,
                price: initialPropertyData.price,
                bedrooms: initialPropertyData.bedrooms,
                bathrooms: initialPropertyData.bathrooms,
                squareFootage: initialPropertyData.sqft,
                yearBuilt: initialPropertyData.year_built || 0,
                description: initialPropertyData.description || "No description available.",
                images: initialPropertyData.photos || ["https://images.rentcast.io/s3/photo-placeholder.jpg"],
                taxAnnualAmount: initialPropertyData.property_tax_annual,
                hoaFee: initialPropertyData.hoa_fee,
                history: [], // Not available in ScoutedProperty usually
                source: "search_result"
            });
            setLoading(false);
            return;
        }

        if (!address) return;

        // Mocking for UI development
        setTimeout(() => {
            setProperty({
                formattedAddress: address,
                price: 450000,
                bedrooms: 3,
                bathrooms: 2,
                squareFootage: 1800,
                yearBuilt: 1998,
                description: "Beautiful home in the heart of the city...",
                images: ["https://images.rentcast.io/s3/photo-placeholder.jpg"],
                taxAnnualAmount: 8500,
                hoaFee: 150,
                history: [
                    { date: "2023-01-01", price: 420000, event: "Listed" },
                    { date: "2020-05-15", price: 380000, event: "Sold" }
                ],
                source: "mock"
            });
            setLoading(false);
        }, 800);

    }, [address]);

    const handleAnalyze = () => {
        if (!property) return;

        onAnalyze({
            address: property.formattedAddress,
            price: property.price,
            sqft: property.squareFootage,
            taxes: property.taxAnnualAmount,
            hoa: property.hoaFee,
            override_tax_annual: property.taxAnnualAmount,
            override_hoa_monthly: property.hoaFee
        });
    };

    if (loading) return <div className="p-8 text-center text-gray-400">Loading Property Details...</div>;
    if (!property) return <div className="p-8 text-center text-red-400">Property not found.</div>;

    return (
        <div className="flex flex-col h-full bg-gray-950 overflow-y-auto">
            {/* Header */}
            <header className="flex items-center gap-4 p-4 border-b border-white/10 bg-gray-900/50 sticky top-0 z-10 backdrop-blur-md">
                <button onClick={onBack} className="p-2 hover:bg-white/5 rounded-full text-gray-400">
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <div>
                    <h1 className="text-xl font-semibold text-white">{property.formattedAddress}</h1>
                    <div className="flex gap-4 text-sm text-gray-400">
                        <span className="text-green-400">● For Sale</span>
                    </div>
                </div>
                <div className="ml-auto flex items-center gap-4">
                    <div className="text-right">
                        <div className="text-2xl font-bold text-white">
                            ${property.price?.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">
                            ${Math.round(property.price / property.squareFootage)} / sqft
                        </div>
                    </div>
                    <Button onClick={handleAnalyze} variant="primary" className="gap-2">
                        <Calculator className="w-5 h-5" />
                        Analyze Deal
                    </Button>
                </div>
            </header>

            {/* Content */}
            <div className="flex-1 w-full max-w-7xl mx-auto p-6 space-y-6">

                {/* 1. Main Grid: Photos + Core Info */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Photos (Taking up 2/3) */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="aspect-video bg-gray-900 rounded-xl overflow-hidden border border-white/10 relative">
                            {property.images.length > 0 ? (
                                <img
                                    src={property.images[imageIndex]}
                                    alt="Property"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-600">
                                    <Home className="w-16 h-16 opacity-20" />
                                </div>
                            )}
                        </div>
                        {/* Thumbnails row stub */}
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {property.images.map((img, idx) => (
                                <button key={idx} onClick={() => setImageIndex(idx)} className={`w-24 h-16 rounded-lg overflow-hidden border ${idx === imageIndex ? 'border-indigo-500' : 'border-transparent'}`}>
                                    <img src={img} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Stats Sidebar */}
                    <div className="space-y-6">
                        <Card className="p-5 space-y-4">
                            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Property Details</h3>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-gray-900/50 rounded-lg">
                                    <div className="text-2xl font-bold text-white">{property.bedrooms}</div>
                                    <div className="text-xs text-gray-500">Beds</div>
                                </div>
                                <div className="p-3 bg-gray-900/50 rounded-lg">
                                    <div className="text-2xl font-bold text-white">{property.bathrooms}</div>
                                    <div className="text-xs text-gray-500">Baths</div>
                                </div>
                                <div className="p-3 bg-gray-900/50 rounded-lg">
                                    <div className="text-2xl font-bold text-white">{property.squareFootage?.toLocaleString()}</div>
                                    <div className="text-xs text-gray-500">Sqft</div>
                                </div>
                                <div className="p-3 bg-gray-900/50 rounded-lg">
                                    <div className="text-2xl font-bold text-white">{property.yearBuilt}</div>
                                    <div className="text-xs text-gray-500">Year Built</div>
                                </div>
                            </div>
                        </Card>

                        {/* Financials (Tax/HOA) */}
                        <Card className="p-5 space-y-4 border-indigo-500/20">
                            <h3 className="text-sm font-medium text-indigo-400 uppercase tracking-wider flex items-center gap-2">
                                <DollarSign className="w-4 h-4" />
                                Financial Data
                            </h3>

                            <div className="space-y-3">
                                <div className="flex justify-between items-center py-2 border-b border-white/5">
                                    <span className="text-gray-400">Annual Tax</span>
                                    <span className="text-white font-medium">
                                        {property.taxAnnualAmount ? `$${property.taxAnnualAmount.toLocaleString()}` : 'N/A'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-white/5">
                                    <span className="text-gray-400">Monthly HOA</span>
                                    <span className="text-white font-medium">
                                        {property.hoaFee ? `$${property.hoaFee}` : 'N/A'}
                                    </span>
                                </div>
                            </div>

                            <div className="bg-indigo-900/20 p-3 rounded text-xs text-indigo-300">
                                This data will automatically populate the calculator when you click "Analyze Deal".
                            </div>
                        </Card>
                    </div>
                </div>

                {/* 2. Price History Stub */}
                <Card className="p-6">
                    <h3 className="text-lg font-medium text-white mb-4">Price History</h3>
                    <div className="relative overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-400">
                            <thead className="text-xs uppercase bg-gray-900/50 text-gray-300">
                                <tr>
                                    <th className="px-6 py-3">Date</th>
                                    <th className="px-6 py-3">Event</th>
                                    <th className="px-6 py-3">Price</th>
                                </tr>
                            </thead>
                            <tbody>
                                {property.history && property.history.map((h, i) => (
                                    <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                                        <td className="px-6 py-4">{h.date}</td>
                                        <td className="px-6 py-4">{h.event}</td>
                                        <td className="px-6 py-4">${h.price.toLocaleString()}</td>
                                    </tr>
                                ))}
                                {!property.history && (
                                    <tr><td colSpan={3} className="px-6 py-4 text-center">No history available</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>

                {/* 3. Description */}
                <Card className="p-6">
                    <h3 className="text-lg font-medium text-white mb-4">Description</h3>
                    <p className="text-gray-400 leading-relaxed">
                        {property.description}
                    </p>
                </Card>

            </div>
        </div>
    );
};
