/**
 * PropertyGrid - Grid layout for property search results
 * 
 * Replaces horizontal carousel with responsive grid:
 * - 2-column grid layout
 * - Click to select and update Intelligence Pane
 * - Drag to add to Comparison Dock
 * - Right-click for context menu
 * - Multi-select with Cmd/Ctrl+Click
 * - Holographic selection state
 */

import React, { useState } from 'react';
import { cn } from '../../lib/utils';
import { 
  Building2, 
  Home, 
  Maximize2,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import type { ScoutedProperty } from '../../types/backendTools';
import type { InvestmentStrategy } from '../../types/pnl';
import { getWinningHighlights } from '../../utils/dealHighlights';

interface PropertyGridProps {
  properties: ScoutedProperty[];
  selectedPropertyId: string | null;
  onSelectProperty: (property: ScoutedProperty) => void;
  onDragStart: (property: ScoutedProperty) => void;
  onContextMenu: (property: ScoutedProperty, event: React.MouseEvent) => void;
  className?: string;
}

export const PropertyGrid: React.FC<PropertyGridProps> = ({
  properties,
  selectedPropertyId,
  onSelectProperty,
  onDragStart,
  onContextMenu,
  className,
}) => {
  return (
    <div className={cn('p-6', className)}>
      <div className="grid grid-cols-2 gap-4">
        {properties.map((property) => (
          <PropertyGridCard
            key={property.listing_id || property.address}
            property={property}
            isSelected={selectedPropertyId === (property.listing_id || property.address)}
            onSelect={() => onSelectProperty(property)}
            onDragStart={() => onDragStart(property)}
            onContextMenu={(e) => onContextMenu(property, e)}
          />
        ))}
      </div>

      {properties.length === 0 && (
        <div className="flex items-center justify-center h-64 text-white/60">
          <p>No properties found</p>
        </div>
      )}
    </div>
  );
};

// Individual Property Card Component
interface PropertyGridCardProps {
  property: ScoutedProperty;
  isSelected: boolean;
  onSelect: () => void;
  onDragStart: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
}

const PropertyGridCard: React.FC<PropertyGridCardProps> = ({
  property,
  isSelected,
  onSelect,
  onDragStart,
  onContextMenu,
}) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const photos = property.photos && property.photos.length > 0
    ? property.photos
    : ['https://images.rentcast.io/s3/photo-placeholder.jpg'];

  const financial = property.financial_snapshot;
  const isPositive = financial?.status === 'positive';
  const hasMultiplePhotos = photos.length > 1;

  const highlights = getWinningHighlights(property, null);

  const nextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentPhotoIndex((prev) => (prev + 1) % photos.length);
  };

  const prevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('propertyId', property.listing_id || property.address);
    e.dataTransfer.setData('property', JSON.stringify(property));
    
    // Create custom ghost image
    const ghostElement = document.createElement('div');
    ghostElement.className = 'p-3 bg-black/90 backdrop-blur-xl rounded-lg border border-[#C08B5C]/50 shadow-2xl';
    ghostElement.innerHTML = `
      <div class="text-white font-semibold">$${property.price?.toLocaleString()}</div>
      <div class="text-white/60 text-sm truncate max-w-[200px]">${property.address}</div>
    `;
    ghostElement.style.position = 'absolute';
    ghostElement.style.top = '-1000px';
    document.body.appendChild(ghostElement);
    e.dataTransfer.setDragImage(ghostElement, 0, 0);
    setTimeout(() => document.body.removeChild(ghostElement), 0);
    
    onDragStart();
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleClick = (e: React.MouseEvent) => {
    // Allow Cmd/Ctrl+Click for multi-select in future
    onSelect();
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={handleClick}
      onContextMenu={(e) => {
        e.preventDefault();
        onContextMenu(e);
      }}
      className={cn(
        'relative rounded-xl overflow-hidden cursor-pointer transition-all duration-300 group',
        'bg-[#1E1E1E] border-2',
        isSelected
          ? 'border-[#C08B5C] shadow-lg shadow-[#C08B5C]/30 transform scale-[1.02]'
          : 'border-white/10 hover:border-white/20 hover:-translate-y-1 hover:shadow-xl',
        isDragging && 'opacity-50 scale-95'
      )}
      style={{
        height: '200px',
      }}
    >
      {/* Holographic Scan Effect (Selected State) */}
      {isSelected && (
        <div
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(192, 139, 92, 0.3) 50%, transparent 100%)',
            backgroundSize: '200% 100%',
            animation: 'scan 2s ease-in-out infinite',
          }}
        />
      )}

      {/* Image Section (Left) */}
      <div className="absolute inset-0 flex">
        <div className="relative w-[45%] bg-gray-800 group/image">
          <img
            src={photos[currentPhotoIndex]}
            alt={property.address}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#1E1E1E]" />

          {/* Carousel Navigation */}
          {hasMultiplePhotos && (
            <>
              <button
                onClick={prevPhoto}
                className="absolute left-1 top-1/2 -translate-y-1/2 p-1 rounded-full bg-black/40 text-white/80 opacity-0 group-hover/image:opacity-100 hover:bg-black/60 transition-all z-20"
              >
                <ChevronLeft className="w-3 h-3" />
              </button>
              <button
                onClick={nextPhoto}
                className="absolute right-1 top-1/2 -translate-y-1/2 p-1 rounded-full bg-black/40 text-white/80 opacity-0 group-hover/image:opacity-100 hover:bg-black/60 transition-all z-20"
              >
                <ChevronRight className="w-3 h-3" />
              </button>

              {/* Dots */}
              <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1 z-20">
                {photos.slice(0, 4).map((_, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      'w-1 h-1 rounded-full transition-all',
                      idx === currentPhotoIndex ? 'bg-white w-1.5' : 'bg-white/40'
                    )}
                  />
                ))}
              </div>
            </>
          )}

          {/* Status Badge */}
          {financial && (
            <div className={cn(
              'absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1',
              isPositive
                ? 'bg-[#C08B5C]/20 text-[#D4A27F] border border-[#C08B5C]/30'
                : 'bg-red-500/20 text-red-400 border border-red-500/30'
            )}>
              {isPositive ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
              {isPositive ? 'Positive' : 'Negative'}
            </div>
          )}
        </div>

        {/* Info Section (Right) */}
        <div className="flex-1 p-3 flex flex-col justify-between">
          {/* Price & Address */}
          <div>
            <div className="text-xl font-bold text-white mb-1">
              ${property.price?.toLocaleString()}
            </div>
            <div className="text-xs text-white/70 line-clamp-2 mb-2">
              {property.address}
            </div>

            {/* Property Stats */}
            <div className="flex items-center gap-3 text-[11px] text-white/60 mb-2">
              <span className="flex items-center gap-1">
                <Building2 className="w-3 h-3" />
                {property.bedrooms} bd
              </span>
              <span className="flex items-center gap-1">
                <Home className="w-3 h-3" />
                {property.bathrooms} ba
              </span>
              <span className="flex items-center gap-1">
                <Maximize2 className="w-3 h-3" />
                {property.sqft?.toLocaleString()} sf
              </span>
            </div>
          </div>

          {/* Winning Highlights */}
          {highlights.length > 0 && (
            <div className="space-y-1">
              {highlights.slice(0, 2).map((highlight, idx) => (
                <div
                  key={idx}
                  className="text-[10px] px-2 py-0.5 rounded bg-[#C08B5C]/10 text-[#D4A27F] border border-[#C08B5C]/20 truncate"
                >
                  {highlight.label}
                </div>
              ))}
            </div>
          )}

          {/* Financial Preview */}
          {financial && (
            <div className="text-[11px] text-white/60 space-y-0.5">
              {financial.str_monthly_revenue && (
                <div className="flex justify-between">
                  <span>STR Revenue:</span>
                  <span className="text-white/80 font-medium">
                    ${financial.str_monthly_revenue.toLocaleString()}/mo
                  </span>
                </div>
              )}
              {financial.cap_rate && (
                <div className="flex justify-between">
                  <span>Cap Rate:</span>
                  <span className="text-white/80 font-medium">
                    {financial.cap_rate.toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Hover Overlay */}
      <div className={cn(
        'absolute inset-0 bg-gradient-to-t from-[#C08B5C]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none',
        isSelected && 'opacity-100'
      )} />
    </div>
  );
};

// Add CSS for scan animation
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes scan {
      0% {
        background-position: -200% 0;
      }
      100% {
        background-position: 200% 0;
      }
    }
  `;
  if (!document.getElementById('property-grid-animations')) {
    style.id = 'property-grid-animations';
    document.head.appendChild(style);
  }
}

