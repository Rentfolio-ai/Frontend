// FILE: src/components/chat/tool-cards/PropertyComparisonCard.tsx
import React from 'react';
import { PropertyCard } from '../../primitives/PropertyCard';
import type { Property } from '../../../types';

interface PropertyData {
  address: string;
  price: string;
  beds: number;
  baths: number;
  sqft: number;
  roi: number;
}

interface PropertyComparisonData {
  properties: PropertyData[];
}

interface PropertyComparisonCardProps {
  data: PropertyComparisonData;
}

// Convert PropertyData to Property format for the PropertyCard component
const convertToProperty = (propertyData: PropertyData, index: number): Property => ({
  id: `temp-${index}`,
  title: `Property ${index + 1}`,
  address: propertyData.address,
  lat: 0,
  lng: 0,
  price: typeof propertyData.price === 'string' 
    ? parseInt(propertyData.price.replace(/[^0-9]/g, '')) || 0
    : propertyData.price,
  beds: propertyData.beds,
  baths: propertyData.baths,
  sqft: propertyData.sqft,
  yearBuilt: 2000,
  hoa: 0,
  taxes: 0,
  rentEst: 0,
  expensesEst: 0,
  monthlyRoiData: [propertyData.roi, propertyData.roi, propertyData.roi, propertyData.roi, 
                   propertyData.roi, propertyData.roi, propertyData.roi, propertyData.roi,
                   propertyData.roi, propertyData.roi, propertyData.roi, propertyData.roi],
  capRate: propertyData.roi * 0.8, // Estimate cap rate as 80% of ROI
  images: [],
  zip: '',
  city: '',
  state: '',
  propertyType: 'single_family' as const,
  amenities: [],
  description: '',
  // Enhanced fields with sample data
  adrRange: {
    peak: Math.round(propertyData.roi * 15 + 100),
    offSeason: Math.round(propertyData.roi * 10 + 60)
  },
  popularityTag: propertyData.roi > 10 ? 'Hot' : propertyData.roi > 7 ? 'Stable' : 'Declining',
  regulationSnippet: propertyData.roi > 10 
    ? 'High-demand area with strict rental regulations.'
    : 'Standard local rental regulations apply.'
});

export const PropertyComparisonCard: React.FC<PropertyComparisonCardProps> = ({ data }) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.properties.map((property: PropertyData, index: number) => (
          <PropertyCard 
            key={index} 
            property={convertToProperty(property, index)}
            compact={true}
          />
        ))}
      </div>
    </div>
  );
};
