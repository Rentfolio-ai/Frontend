import React from 'react';
import { PropertyFlashcard } from './PropertyFlashcard';
import type { InvestmentStrategy } from '../../../types/pnl';

interface SimplePropertyResultsProps {
  properties: any[];
  location?: string;
  priceRange?: string;
  onOpenDealAnalyzer?: (propertyId: string | null, strategy: InvestmentStrategy, purchasePrice?: number, propertyAddress?: string) => void;
}

export const SimplePropertyResults: React.FC<SimplePropertyResultsProps> = ({ 
  properties, 
  location,
  priceRange,
  onOpenDealAnalyzer
}) => {
  if (!properties || properties.length === 0) {
    return null;
  }

  // Add rank to properties
  const rankedProperties = properties.map((p, index) => ({
    ...p,
    rank: index + 1
  }));

  return (
    <div className="my-4">
      {/* Property Flashcards - Vertical stack */}
      <div className="space-y-4 max-w-[800px]">
        {rankedProperties.map((property, index) => (
          <PropertyFlashcard
            key={property.id || property.zpid || property.property_id || index}
            property={property}
            index={index}
            onOpenDealAnalyzer={onOpenDealAnalyzer}
          />
        ))}
      </div>
    </div>
  );
};
