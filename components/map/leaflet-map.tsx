'use client';

import { useEffect, useRef, useState } from 'react';
import { useFilterStore } from '@/stores/filter-store';
import type { Property } from '@/types';

export default function LeafletMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [map, setMap] = useState<any>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const { filters } = useFilterStore();

  useEffect(() => {
    async function initMap() {
      if (!mapRef.current || mapInstanceRef.current) return; // Prevent re-initialization

      // Clear any existing map container content
      if (mapRef.current) {
        mapRef.current.innerHTML = '';
      }

      // Dynamically import Leaflet to avoid SSR issues
      const L = (await import('leaflet')).default;

      // Import default icon fix for webpack
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });

      const mapInstance = L.map(mapRef.current).setView([40.7589, -73.9851], 12);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapInstance);

      mapInstanceRef.current = mapInstance;
      setMap(mapInstance);
    }

    initMap();

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        setMap(null);
      }
    };
  }, []); // Empty dependency array to prevent re-initialization

  useEffect(() => {
    async function fetchProperties() {
      try {
        const response = await fetch('/api/properties/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ...filters, limit: 1000 }),
        });

        const data = await response.json();
        setProperties(data.properties || []);
      } catch (error) {
        console.error('Failed to fetch properties:', error);
      }
    }

    fetchProperties();
  }, [filters]);

  useEffect(() => {
    if (!map || typeof window === 'undefined') return;

    // Clear existing markers
    map.eachLayer((layer: any) => {
      if (layer.options && layer.options.className === 'property-marker') {
        map.removeLayer(layer);
      }
    });

    // Add property markers
    const L = require('leaflet');

    properties.forEach((property) => {
      const marker = L.marker([property.lat, property.lng], {
        className: 'property-marker'
      });

      const popupContent = `
        <div class="p-3 max-w-xs">
          <h3 class="font-semibold text-gray-900 mb-2">${property.title}</h3>
          <div class="text-sm text-gray-600 space-y-1">
            <div><strong>Price:</strong> $${property.price.toLocaleString()}</div>
            <div><strong>Beds/Baths:</strong> ${property.beds}/${property.baths}</div>
            <div><strong>Cap Rate:</strong> ${property.capRate}%</div>
            <div class="mt-2">
              <a href="/properties/${property.id}" class="text-blue-600 hover:text-blue-800">
                View Details →
              </a>
            </div>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);
      marker.addTo(map);
    });

  }, [map, properties]);

  return (
    <>
      <div ref={mapRef} id="leaflet-map-main" className="h-full w-full" />

      {/* Property count indicator */}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
        <div className="text-sm font-medium text-gray-900">
          {properties.length} properties
        </div>
      </div>
    </>
  );
}
