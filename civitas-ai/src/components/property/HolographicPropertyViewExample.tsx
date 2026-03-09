/**
 * Example Usage of Holographic Property View
 * 
 * Shows how to integrate the holographic visualization into your property display
 */

import React from 'react';
import { HolographicPropertyView } from './HolographicPropertyView';

// Example: In your property card or detail view
export const PropertyDisplayExample = () => {
    // Sample property data from your query result
    const propertyData = {
        bedrooms: 3,
        bathrooms: 2,
        sqft: 1850,
        price: 425000,
        address: "123 Main St, San Francisco, CA",
        amenities: ["Parking", "Laundry", "Hardwood Floors", "Central AC", "Dishwasher", "Pet Friendly"],
        yearBuilt: 2018,
        lotSize: 5000
    };

    return (
        <div className="p-8 bg-card">
            <h2 className="text-2xl font-bold text-foreground mb-6">Property Visualization</h2>

            {/* Full view */}
            <HolographicPropertyView
                property={propertyData}
                variant="full"
            />

            {/* Compact view for lists */}
            <div className="mt-8 grid grid-cols-2 gap-4">
                <HolographicPropertyView
                    property={propertyData}
                    variant="compact"
                />
                <HolographicPropertyView
                    property={{ ...propertyData, bedrooms: 2, bathrooms: 1, sqft: 1200 }}
                    variant="compact"
                />
            </div>
        </div>
    );
};

// Or use it in chat results when displaying properties
export const ChatPropertyResult = ({ property }: { property: any }) => {
    return (
        <div className="my-4">
            <HolographicPropertyView
                property={{
                    bedrooms: property.bedrooms,
                    bathrooms: property.bathrooms,
                    sqft: property.square_feet,
                    price: property.price,
                    address: property.full_address,
                    amenities: property.amenities,
                    yearBuilt: property.year_built,
                    lotSize: property.lot_sqft
                }}
                variant="full"
            />
        </div>
    );
};
