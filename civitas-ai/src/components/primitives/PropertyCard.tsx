// FILE: src/components/primitives/PropertyCard.tsx
import React from 'react';
import { Card, CardContent } from './Card';
import { Badge } from './Badge';
import { cn } from '../../lib/utils';
import type { Property } from '../../types';

interface PropertyCardProps {
  property: Property;
  className?: string;
  compact?: boolean;
  onAnalyze?: (property: Property) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  className,
  compact = false,
  onAnalyze
}) => {
  // Calculate annualized ROI from monthly % returns (compound over 12 months)
  const calculateAnnualROI = (monthlyRoiData: number[]): number => {
    if (!monthlyRoiData?.length) return 0;
    const factor = monthlyRoiData.reduce((acc, m) => acc * (1 + m / 100), 1);
    return Math.round(((factor - 1) * 100) * 10) / 10; // percent, 1 decimal
  };

  const annualROI = calculateAnnualROI(property.monthlyRoiData);
  const isHighROI = annualROI > 10;

  // Format price with proper commas
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Get popularity tag color
  const getPopularityTagVariant = (tag?: string) => {
    switch (tag) {
      case 'Hot':
        return 'danger'; // Red for hot market
      case 'Stable':
        return 'success'; // Green for stable
      case 'Declining':
        return 'warning'; // Yellow for declining
      default:
        return 'default';
    }
  };

  if (compact) {
    return (
      <Card className={cn('hover:shadow-lg transition-shadow', className)} padding="sm">
        <CardContent className="space-y-3">
          {/* Address */}
          <div className="font-semibold text-foreground text-sm line-clamp-1">
            {property.address}
          </div>

          {/* Price and ROI Row */}
          <div className="flex items-center justify-between">
            <div className="text-lg font-bold text-primary">
              {formatPrice(property.price)}
            </div>
            <div className={cn(
              'text-sm font-semibold px-2 py-1 rounded',
              isHighROI
                ? 'bg-success/20 text-success shadow-lg shadow-success/20 animate-pulse'
                : 'text-success'
            )}>
              {annualROI}% ROI
            </div>
          </div>

          {/* ADR Range */}
          {property.adrRange && (
            <div className="text-xs text-foreground/60">
              ADR: ${property.adrRange.peak} / ${property.adrRange.offSeason}
            </div>
          )}

          {/* Popularity Tag */}
          {property.popularityTag && (
            <Badge variant={getPopularityTagVariant(property.popularityTag)} className="text-xs">
              {property.popularityTag}
            </Badge>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('hover:shadow-lg transition-shadow', className)} padding="md">
      <CardContent className="space-y-4">
        {/* Header with Address and Popularity Tag */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-foreground line-clamp-2">
              {property.address}
            </h3>
            <div className="text-sm text-foreground/60 mt-1">
              {property.city}, {property.state} {property.zip}
            </div>
          </div>
          {property.popularityTag && (
            <Badge variant={getPopularityTagVariant(property.popularityTag)}>
              {property.popularityTag}
            </Badge>
          )}
        </div>

        {/* Price */}
        <div className="text-2xl font-bold text-primary">
          {formatPrice(property.price)}
        </div>

        {/* Property Details */}
        <div className="flex items-center gap-4 text-sm text-foreground/60">
          {property.beds > 0 && <span>{property.beds}bd</span>}
          {property.baths > 0 && <span>{property.baths}ba</span>}
          {property.sqft > 0 && <span>{property.sqft.toLocaleString()} sqft</span>}
        </div>

        {/* ROI Highlight */}
        <div className={cn(
          'p-3 rounded-lg border',
          isHighROI
            ? 'bg-success/10 border-success/30 shadow-lg shadow-success/20'
            : 'bg-muted border-border'
        )}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Annual ROI</span>
            <span className={cn(
              'text-xl font-bold',
              isHighROI ? 'text-success animate-pulse' : 'text-foreground'
            )}>
              {annualROI}%
            </span>
          </div>
          {isHighROI && (
            <div className="text-xs text-success/80 mt-1">🔥 High performing asset</div>
          )}
        </div>

        {/* ADR Range */}
        {property.adrRange && (
          <div className="bg-muted p-3 rounded-lg">
            <div className="text-sm font-medium text-foreground mb-2">
              Average Daily Rate
            </div>
            <div className="flex items-center justify-between text-sm">
              <div>
                <span className="text-foreground/60">Peak:</span>
                <span className="font-semibold ml-1">${property.adrRange.peak}</span>
              </div>
              <div>
                <span className="text-foreground/60">Off-season:</span>
                <span className="font-semibold ml-1">${property.adrRange.offSeason}</span>
              </div>
            </div>
          </div>
        )}

        {/* Regulation Snippet */}
        {property.regulationSnippet && (
          <div className="bg-warning/10 border border-warning/30 p-3 rounded-lg">
            <div className="text-sm font-medium text-warning mb-1">
              📋 Regulation Note
            </div>
            <div className="text-xs text-foreground/80 leading-relaxed">
              {property.regulationSnippet}
            </div>
          </div>
        )}

        {/* Property Type Badge */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {property.propertyType.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
            </Badge>
            <div className="text-xs text-foreground/60">
              Cap Rate: {property.capRate}%
            </div>
          </div>

          {onAnalyze && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAnalyze(property);
              }}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm hover:shadow-md"
            >
              Analyze Deal
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};