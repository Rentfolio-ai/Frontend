/**
 * ComparisonDock - Persistent bottom bar for property comparison
 * 
 * The centerpiece of Civitas Command Center:
 * - Floating bar at bottom (80px tall, 90% width)
 * - Drag-and-drop target for properties
 * - Max 4 properties, side-by-side comparison
 * - Holographic teal/purple gradient border
 * - Collapsible to reclaim space
 */

import React, { useState } from 'react';
import { cn } from '../../lib/utils';
import { 
  GitCompare, 
  X, 
  ChevronDown, 
  ChevronUp, 
  Trash2,
  Building2,
  Home,
  Maximize2
} from 'lucide-react';
import type { ScoutedProperty } from '../../types/backendTools';

interface ComparisonDockProps {
  properties: ScoutedProperty[];
  onRemoveProperty: (propertyId: string) => void;
  onClearAll: () => void;
  onCompare: () => void;
  onDrop: (e: React.DragEvent) => void;
  className?: string;
}

const MAX_PROPERTIES = 4;

export const ComparisonDock: React.FC<ComparisonDockProps> = ({
  properties,
  onRemoveProperty,
  onClearAll,
  onCompare,
  onDrop,
  className,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const hasProperties = properties.length > 0;
  const canCompare = properties.length >= 2;
  const isFull = properties.length >= MAX_PROPERTIES;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isFull) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (!isFull) {
      onDrop(e);
    }
  };

  if (isCollapsed) {
    return (
      <div className={cn('fixed bottom-4 left-1/2 -translate-x-1/2 z-40', className)}>
        <button
          onClick={() => setIsCollapsed(false)}
          className="px-6 py-3 bg-black/80 backdrop-blur-xl rounded-full border border-teal-500/30 text-white font-medium text-sm shadow-2xl hover:border-teal-500/50 transition-all flex items-center gap-2"
          style={{
            boxShadow: '0 0 40px rgba(20, 184, 166, 0.3)',
          }}
        >
          <ChevronUp className="w-4 h-4" />
          Comparison Dock {hasProperties && `(${properties.length})`}
        </button>
      </div>
    );
  }

  return (
    <div className={cn('fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[90%] max-w-7xl', className)}>
      {/* Floating Dock */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'relative rounded-2xl overflow-hidden shadow-2xl transition-all duration-400',
          'bg-black/80 backdrop-blur-xl',
          isDragOver && !isFull && 'scale-105',
        )}
        style={{
          boxShadow: '0 0 60px rgba(20, 184, 166, 0.4)',
        }}
      >
        {/* Holographic Border (Animated Gradient) */}
        <div className="absolute inset-0 rounded-2xl p-[2px] animate-gradient-border">
          <div
            className="absolute inset-0 rounded-2xl opacity-75"
            style={{
              background: 'linear-gradient(90deg, rgba(20, 184, 166, 0.6) 0%, rgba(168, 85, 247, 0.6) 50%, rgba(20, 184, 166, 0.6) 100%)',
              backgroundSize: '200% 100%',
              animation: 'gradient-shift 3s ease infinite',
            }}
          />
        </div>

        {/* Content */}
        <div className="relative bg-slate-900/95 rounded-2xl p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-teal-500/20 to-purple-500/20 border border-teal-500/30">
                <GitCompare className="w-5 h-5 text-teal-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm">Comparison Dock</h3>
                <p className="text-white/60 text-xs">
                  {properties.length === 0 && 'Drag properties here to compare'}
                  {properties.length === 1 && 'Add 1 more property to compare'}
                  {properties.length >= 2 && `Comparing ${properties.length} properties`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Compare Button */}
              <button
                onClick={onCompare}
                disabled={!canCompare}
                className={cn(
                  'px-4 py-2 rounded-lg font-medium text-sm transition-all',
                  canCompare
                    ? 'bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-600 hover:to-purple-700 text-white shadow-lg shadow-teal-500/20'
                    : 'bg-white/5 text-white/30 cursor-not-allowed'
                )}
              >
                Compare
              </button>

              {/* Clear All */}
              {hasProperties && (
                <button
                  onClick={onClearAll}
                  className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-all"
                  title="Clear all properties"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}

              {/* Collapse */}
              <button
                onClick={() => setIsCollapsed(true)}
                className="p-2 rounded-lg bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/10 transition-all"
                title="Collapse dock"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Property Slots */}
          <div className="grid grid-cols-4 gap-3">
            {/* Filled Slots */}
            {properties.map((property, index) => (
              <PropertySlot
                key={property.listing_id || index}
                property={property}
                onRemove={() => onRemoveProperty(property.listing_id || '')}
              />
            ))}

            {/* Empty Slots */}
            {Array.from({ length: MAX_PROPERTIES - properties.length }).map((_, index) => (
              <EmptySlot
                key={`empty-${index}`}
                isDragOver={isDragOver}
                slotNumber={properties.length + index + 1}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Drag Over Indicator */}
      {isDragOver && !isFull && (
        <div className="absolute inset-0 rounded-2xl border-4 border-dashed border-teal-400 bg-teal-500/10 pointer-events-none flex items-center justify-center">
          <div className="text-teal-400 font-semibold text-lg flex items-center gap-2">
            <GitCompare className="w-6 h-6" />
            Drop to add to comparison
          </div>
        </div>
      )}
    </div>
  );
};

// Property Slot Component
const PropertySlot: React.FC<{
  property: ScoutedProperty;
  onRemove: () => void;
}> = ({ property, onRemove }) => {
  const photo = property.photos?.[0] || 'https://images.rentcast.io/s3/photo-placeholder.jpg';

  return (
    <div className="relative group">
      <div className="bg-slate-800/50 rounded-lg overflow-hidden border border-white/10 hover:border-teal-500/30 transition-all">
        {/* Image */}
        <div className="relative h-24 bg-slate-900">
          <img
            src={photo}
            alt={property.address}
            className="w-full h-full object-cover"
          />
          
          {/* Remove Button */}
          <button
            onClick={onRemove}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-black/80 text-red-400 opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all"
          >
            <X className="w-3 h-3" />
          </button>
        </div>

        {/* Info */}
        <div className="p-2">
          <div className="text-white font-semibold text-sm mb-1">
            ${property.price?.toLocaleString()}
          </div>
          <div className="text-white/60 text-xs truncate mb-2">
            {property.address}
          </div>
          <div className="flex items-center gap-2 text-[10px] text-white/50">
            <span className="flex items-center gap-0.5">
              <Building2 className="w-2.5 h-2.5" />
              {property.bedrooms}
            </span>
            <span className="flex items-center gap-0.5">
              <Home className="w-2.5 h-2.5" />
              {property.bathrooms}
            </span>
            <span className="flex items-center gap-0.5">
              <Maximize2 className="w-2.5 h-2.5" />
              {property.sqft?.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Empty Slot Component
const EmptySlot: React.FC<{
  isDragOver: boolean;
  slotNumber: number;
}> = ({ isDragOver, slotNumber }) => {
  return (
    <div
      className={cn(
        'rounded-lg border-2 border-dashed transition-all flex items-center justify-center',
        isDragOver
          ? 'border-teal-500/50 bg-teal-500/10'
          : 'border-white/10 bg-white/5'
      )}
    >
      <div className="text-center py-8">
        <div className={cn(
          'w-10 h-10 mx-auto mb-2 rounded-full flex items-center justify-center text-sm font-bold',
          isDragOver
            ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
            : 'bg-white/10 text-white/40 border border-white/10'
        )}>
          {slotNumber}
        </div>
        <p className={cn(
          'text-xs',
          isDragOver ? 'text-teal-400' : 'text-white/40'
        )}>
          {isDragOver ? 'Drop here' : 'Empty'}
        </p>
      </div>
    </div>
  );
};

// Add CSS for gradient animation
const style = document.createElement('style');
style.textContent = `
  @keyframes gradient-shift {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }
`;
document.head.appendChild(style);

