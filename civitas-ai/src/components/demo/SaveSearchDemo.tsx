// FILE: src/components/demo/SaveSearchDemo.tsx
import React, { useState } from 'react';
import { PropertyCard } from '../primitives/PropertyCard';
import { SaveSearchButton } from '../search/SaveSearchButton';
import { Button } from '../primitives/Button';
import { Badge } from '../primitives/Badge';
import { Search, Filter } from 'lucide-react';
import type { Property, PropertySearchFilters } from '../../types';

// Sample search results
const sampleSearchResults: Property[] = [
  {
    id: 'demo-search-1',
    title: 'Modern Downtown Condo',
    address: '123 Market Street, San Francisco',
    lat: 37.7749,
    lng: -122.4194,
    price: 750000,
    beds: 2,
    baths: 2,
    sqft: 1100,
    yearBuilt: 2018,
    hoa: 400,
    taxes: 9000,
    rentEst: 3500,
    expensesEst: 1500,
    monthlyRoiData: [11.2, 10.8, 11.5, 11.0, 10.9, 11.3, 11.7, 11.1, 10.6, 11.4, 11.0, 10.8],
    capRate: 6.8,
    images: ['https://images.unsplash.com/photo-1560184897-ae75f418493e?w=800'],
    zip: '94105',
    city: 'San Francisco',
    state: 'CA',
    propertyType: 'condo',
    amenities: ['Pool', 'Gym', 'Concierge'],
    description: 'Luxury condo in the heart of downtown SF',
    adrRange: { peak: 450, offSeason: 350 },
    popularityTag: 'Hot',
    regulationSnippet: 'Short-term rental restrictions apply in SF'
  },
  {
    id: 'demo-search-2',
    title: 'Investment Townhouse',
    address: '456 Oak Avenue, Oakland',
    lat: 37.8044,
    lng: -122.2712,
    price: 450000,
    beds: 3,
    baths: 2.5,
    sqft: 1400,
    yearBuilt: 2010,
    hoa: 150,
    taxes: 6500,
    rentEst: 2800,
    expensesEst: 1200,
    monthlyRoiData: [8.5, 8.2, 8.8, 8.4, 8.7, 8.6, 8.9, 8.3, 8.1, 8.6, 8.4, 8.5],
    capRate: 5.2,
    images: ['https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800'],
    zip: '94607',
    city: 'Oakland',
    state: 'CA',
    propertyType: 'townhouse',
    amenities: ['Garage', 'Patio', 'Washer/Dryer'],
    description: 'Great investment opportunity in growing Oakland neighborhood',
    adrRange: { peak: 280, offSeason: 220 },
    popularityTag: 'Stable',
    regulationSnippet: 'Oakland rental regulations in effect'
  }
];

export const SaveSearchDemo: React.FC = () => {
  const [currentQuery, setCurrentQuery] = useState('luxury condos downtown');
  const [currentFilters, setCurrentFilters] = useState<PropertySearchFilters>({
    location: 'San Francisco, CA',
    minPrice: 500000,
    maxPrice: 1000000,
    beds: 2,
    propertyType: 'condo'
  });
  
  const [showSaveButton, setShowSaveButton] = useState(true);

  const handleSaveSuccess = () => {
    console.log('Search saved successfully!');
    // In a real app, you might want to show a toast notification or update the UI
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Demo Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Save Search Demo</h1>
        <p className="text-foreground/60">
          Demonstrating the Save Search functionality with sample property results
        </p>
      </div>

      {/* Simulated Search Interface */}
      <div className="bg-surface border border-border rounded-lg p-4 space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={currentQuery}
              onChange={(e) => setCurrentQuery(e.target.value)}
              placeholder="Search properties..."
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg text-sm 
                       focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
                       bg-background text-foreground"
            />
          </div>
          <Button variant="primary" className="flex items-center gap-2">
            <Search className="w-4 h-4" />
            Search
          </Button>
        </div>

        {/* Active Filters Display */}
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Filter className="w-4 h-4" />
            Active filters:
          </div>
          {currentFilters.location && (
            <Badge variant="outline" className="text-xs">
              📍 {currentFilters.location}
            </Badge>
          )}
          {(currentFilters.minPrice || currentFilters.maxPrice) && (
            <Badge variant="outline" className="text-xs">
              💰 {formatPrice(currentFilters.minPrice || 0)} - {formatPrice(currentFilters.maxPrice || 999999999)}
            </Badge>
          )}
          {currentFilters.beds && (
            <Badge variant="outline" className="text-xs">
              🛏️ {currentFilters.beds}+ beds
            </Badge>
          )}
          {currentFilters.propertyType && (
            <Badge variant="outline" className="text-xs">
              🏠 {currentFilters.propertyType}
            </Badge>
          )}
        </div>
      </div>

      {/* Search Results Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Search Results</h2>
          <p className="text-sm text-muted-foreground">
            Found {sampleSearchResults.length} properties matching your criteria
          </p>
        </div>
        
        {/* Save Search Button */}
        {showSaveButton && (
          <SaveSearchButton
            query={currentQuery}
            filters={currentFilters}
            resultsCount={sampleSearchResults.length}
            onSaveSuccess={handleSaveSuccess}
          />
        )}
      </div>

      {/* Property Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {sampleSearchResults.map((property) => (
          <PropertyCard 
            key={property.id} 
            property={property}
          />
        ))}
      </div>

      {/* Demo Controls */}
      <div className="bg-muted/30 border border-border rounded-lg p-4 space-y-3">
        <h3 className="font-medium">Demo Controls</h3>
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSaveButton(!showSaveButton)}
          >
            {showSaveButton ? 'Hide' : 'Show'} Save Button
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setCurrentQuery('waterfront properties');
              setCurrentFilters({
                location: 'Miami, FL',
                minPrice: 300000,
                maxPrice: 800000,
                beds: 3,
                propertyType: 'single_family'
              });
            }}
          >
            Change Search Criteria
          </Button>
        </div>
        
        <div className="text-xs text-muted-foreground">
          💡 The Save Search button allows users to save their current search query and filters.
          Saved searches appear in the "My Alerts" tab in the right panel and persist across browser refreshes.
        </div>
      </div>
    </div>
  );
};