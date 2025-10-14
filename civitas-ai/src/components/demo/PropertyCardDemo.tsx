// FILE: src/components/demo/PropertyCardDemo.tsx
import React from 'react';
import { PropertyCard } from '../primitives/PropertyCard';
import type { Property } from '../../types';

export const PropertyCardDemo: React.FC = () => {
  // Sample properties with different ROI levels to showcase features
  const sampleProperties: Property[] = [
    {
      id: 'demo-001',
      title: 'High ROI Manhattan Apartment',
      address: '123 Broadway, New York',
      lat: 40.7589,
      lng: -73.9851,
      price: 850000,
      beds: 2,
      baths: 2,
      sqft: 1200,
      yearBuilt: 2015,
      hoa: 500,
      taxes: 12000,
      rentEst: 4500,
      expensesEst: 2000,
      monthlyRoiData: [12.5, 13.2, 11.8, 12.9, 13.5, 14.1, 13.8, 12.7, 11.9, 12.3, 13.4, 12.8],
      capRate: 6.8,
      images: ['https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800'],
      zip: '10001',
      city: 'New York',
      state: 'NY',
      propertyType: 'condo',
      amenities: ['Doorman', 'Gym', 'Rooftop'],
      description: 'Premium apartment in prime location',
      adrRange: {
        peak: 320,
        offSeason: 220
      },
      popularityTag: 'Hot',
      regulationSnippet: 'NYC requires special licensing for short-term rentals. Max 30 days per year for unhosted stays.'
    },
    {
      id: 'demo-002',
      title: 'Stable Investment Property',
      address: '456 Oak Street, Jersey City',
      lat: 40.7282,
      lng: -74.0776,
      price: 450000,
      beds: 3,
      baths: 2.5,
      sqft: 1500,
      yearBuilt: 2010,
      hoa: 200,
      taxes: 8000,
      rentEst: 2800,
      expensesEst: 1200,
      monthlyRoiData: [8.2, 7.9, 8.5, 8.1, 7.8, 8.3, 8.7, 8.0, 7.6, 8.4, 8.1, 7.9],
      capRate: 5.5,
      images: ['https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800'],
      zip: '07302',
      city: 'Jersey City',
      state: 'NJ',
      propertyType: 'townhouse',
      amenities: ['Garage', 'Backyard', 'Central AC'],
      description: 'Family-friendly townhouse with steady returns',
      adrRange: {
        peak: 185,
        offSeason: 135
      },
      popularityTag: 'Stable',
      regulationSnippet: 'NJ permits short-term rentals with local registration. No minimum stay requirements.'
    },
    {
      id: 'demo-003',
      title: 'Value Investment Opportunity',
      address: '789 Pine Ave, Philadelphia',
      lat: 39.9503,
      lng: -75.1853,
      price: 280000,
      beds: 2,
      baths: 1,
      sqft: 900,
      yearBuilt: 1995,
      hoa: 0,
      taxes: 5000,
      rentEst: 1800,
      expensesEst: 800,
      monthlyRoiData: [5.2, 4.8, 5.5, 5.1, 4.9, 5.3, 5.7, 5.0, 4.6, 5.4, 5.1, 4.8],
      capRate: 4.2,
      images: ['https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800'],
      zip: '19107',
      city: 'Philadelphia',
      state: 'PA',
      propertyType: 'single_family',
      amenities: ['Parking', 'Basement'],
      description: 'Affordable property in emerging neighborhood',
      adrRange: {
        peak: 125,
        offSeason: 85
      },
      popularityTag: 'Declining',
      regulationSnippet: 'Philadelphia requires business license for short-term rentals. 30-day minimum stay in some zones.'
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Property Card Showcase</h2>
        <p className="text-foreground/60">
          Displaying properties with enhanced features: ROI highlighting, ADR ranges, popularity tags, and regulation info.
        </p>
      </div>

      {/* Full-size cards */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Full Property Cards</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {sampleProperties.map((property) => (
            <PropertyCard 
              key={property.id} 
              property={property}
            />
          ))}
        </div>
      </div>

      {/* Compact cards */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Compact Property Cards</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {sampleProperties.map((property) => (
            <PropertyCard 
              key={`compact-${property.id}`} 
              property={property}
              compact={true}
            />
          ))}
        </div>
      </div>
    </div>
  );
};