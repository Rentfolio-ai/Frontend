/**
 * Property Map View Component
 * Interactive map showing geographic distribution of portfolio properties
 */

import React, { useState } from 'react';
import { MapPin, DollarSign, TrendingUp, Home, X } from 'lucide-react';

interface Property {
  id: string;
  address: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
  value: number;
  roi: number;
  type: string;
  image?: string;
}

interface PropertyMapViewProps {
  properties: Property[];
}

export const PropertyMapView: React.FC<PropertyMapViewProps> = ({ properties }) => {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [hoveredProperty, setHoveredProperty] = useState<string | null>(null);

  // Calculate map bounds
  const bounds = properties.reduce(
    (acc, prop) => ({
      minLat: Math.min(acc.minLat, prop.lat),
      maxLat: Math.max(acc.maxLat, prop.lat),
      minLng: Math.min(acc.minLng, prop.lng),
      maxLng: Math.max(acc.maxLng, prop.lng),
    }),
    { minLat: Infinity, maxLat: -Infinity, minLng: Infinity, maxLng: -Infinity }
  );

  // Convert lat/lng to SVG coordinates
  const latLngToXY = (lat: number, lng: number) => {
    const padding = 10;
    const width = 100 - 2 * padding;
    const height = 100 - 2 * padding;

    const x = padding + ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * width;
    const y = padding + ((bounds.maxLat - lat) / (bounds.maxLat - bounds.minLat)) * height;

    return { x, y };
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    }
    return `$${(value / 1000).toFixed(0)}K`;
  };

  return (
    <div className="bg-[#222] rounded-lg p-6 border border-gray-800 h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-semibold text-white">Property Locations</h3>
          <p className="text-sm text-white/60">{properties.length} properties across the US</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-xs text-gray-400 rounded-lg border border-white/10">
            <div className="w-2 h-2 rounded-full bg-blue-400"></div>
            <span className="text-xs text-white/60">Your Properties</span>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative h-96 bg-[#1a1a1a] rounded-md overflow-hidden border border-gray-800">
        {/* Simplified US Map Background */}
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Grid lines */}
          <g className="opacity-10">
            {[0, 20, 40, 60, 80, 100].map((pos) => (
              <React.Fragment key={pos}>
                <line x1={pos} y1="0" x2={pos} y2="100" stroke="white" strokeWidth="0.2" />
                <line x1="0" y1={pos} x2="100" y2={pos} stroke="white" strokeWidth="0.2" />
              </React.Fragment>
            ))}
          </g>

          {/* Connection lines between properties */}
          {properties.length > 1 && (
            <g className="opacity-20">
              {properties.slice(0, -1).map((prop, i) => {
                const start = latLngToXY(prop.lat, prop.lng);
                const end = latLngToXY(properties[i + 1].lat, properties[i + 1].lng);
                return (
                  <line
                    key={`line-${prop.id}`}
                    x1={start.x}
                    y1={start.y}
                    x2={end.x}
                    y2={end.y}
                    stroke="url(#lineGradient)"
                    strokeWidth="0.2"
                    strokeDasharray="1,1"
                  />
                );
              })}
            </g>
          )}

          {/* Property markers */}
          {properties.map((property, index) => {
            const { x, y } = latLngToXY(property.lat, property.lng);
            const isHovered = hoveredProperty === property.id;
            const isSelected = selectedProperty?.id === property.id;

            return (
              <g key={property.id}>
                {/* Pulse effect for selected/hovered */}
                {(isHovered || isSelected) && (
                  <circle
                    cx={x}
                    cy={y}
                    r="3"
                    fill="none"
                    stroke="#3B82F6"
                    strokeWidth="0.3"
                    opacity="0.5"
                  />
                )}

                {/* Marker */}
                <circle
                  cx={x}
                  cy={y}
                  r={isHovered || isSelected ? 2.5 : 2}
                  fill={isSelected ? '#3B82F6' : '#10B981'}
                  className="cursor-pointer transition-all"
                  onMouseEnter={() => setHoveredProperty(property.id)}
                  onMouseLeave={() => setHoveredProperty(null)}
                  onClick={() => setSelectedProperty(property)}
                />

                {/* Property value label on hover */}
                {isHovered && (
                  <g>
                    <rect
                      x={x - 8}
                      y={y - 8}
                      width="16"
                      height="5"
                      fill="rgba(0,0,0,0.9)"
                      rx="1"
                    />
                    <text
                      x={x}
                      y={y - 5}
                      textAnchor="middle"
                      className="text-[2px] fill-white font-semibold"
                    >
                      {formatCurrency(property.value)}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Gradients */}
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0.5" />
            </linearGradient>
          </defs>
        </svg>

        {/* Property Detail Card */}
        {selectedProperty && (
          <div className="absolute top-4 right-4 w-80 bg-[#1a1a1a] rounded-md overflow-hidden">
            {/* Close button */}
            <button
              onClick={() => setSelectedProperty(null)}
              className="absolute top-3 right-3 p-1.5 bg-gray-800 hover:bg-gray-700 rounded-md transition-colors z-10"
            >
              <X className="w-4 h-4 text-white" />
            </button>

            {/* Property image */}
            {selectedProperty.image && (
              <div className="p-1.5 bg-green-500/10 rounded-md">
                <img
                  src={selectedProperty.image}
                  alt={selectedProperty.address}
                  className="w-full h-full object-cover opacity-80"
                />
              </div>
            )}

            {/* Property details */}
            <div className="p-4">
              <div className="flex items-start gap-2 mb-3">
                <div className="p-4 space-y-3 bg-[#2a2a2a] rounded-lg border border-blue-500/30">
                  <Home className="w-4 h-4 text-blue-400" />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-gray-400 mb-1">{selectedProperty.type}</div>
                  <div className="text-sm text-gray-300">
                    {selectedProperty.city}, {selectedProperty.state}
                  </div>
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign className="w-3 h-3 text-white/60" />
                    <span className="text-xs text-white/60">Value</span>
                  </div>
                  <div className="text-sm font-semibold text-white">
                    {formatCurrency(selectedProperty.value)}
                  </div>
                </div>

                <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-3 h-3 text-green-400" />
                    <span className="text-xs text-white/60">ROI</span>
                  </div>
                  <div className="text-sm font-semibold text-green-400">
                    +{selectedProperty.roi}%
                  </div>
                </div>
              </div>

              {/* Property type */}
              <div className="mt-3 pt-3 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Property Type</span>
                  <span className="text-xs font-medium">+{selectedProperty.roi}%</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-[#1a1a1a] rounded-md p-3 border border-gray-800">
          <div className="text-xs text-gray-400 mb-1">Total Portfolio Value</div>
          <div className="text-base font-semibold text-white">
            {formatCurrency(properties.reduce((sum, p) => sum + p.value, 0))}
          </div>
        </div>
      </div>

      {/* Property List */}
      <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
        {properties.map((property) => (
          <div
            key={property.id}
            className={`flex items-center justify-between p-3 rounded-md cursor-pointer transition-colors ${
              selectedProperty?.id === property.id
                ? 'bg-[#333] border border-gray-600'
                : 'bg-[#2a2a2a] border border-gray-800 hover:bg-[#333]'
            }`}
            onClick={() => setSelectedProperty(property)}
            onMouseEnter={() => setHoveredProperty(property.id)}
            onMouseLeave={() => setHoveredProperty(null)}
          >
            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-green-400" />
              <div>
                <div className="text-sm font-medium text-white">{property.address}</div>
                <div className="text-xs text-gray-400">
                  {property.city}, {property.state}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-white">
                {formatCurrency(property.value)}
              </div>
              <div className="text-xs text-green-400">+{property.roi}%</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
