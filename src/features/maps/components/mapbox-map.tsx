'use client';

import { useEffect, useRef, useState } from 'react';
import { useFilterStore } from '@/stores/filter-store';
import type { Property } from '@/types';

export default function MapboxMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const { filters } = useFilterStore();

  useEffect(() => {
    async function initMap() {
      if (!mapRef.current) return;

      const mapboxgl = (await import('mapbox-gl')).default;

      mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

      const mapInstance = new mapboxgl.Map({
        container: mapRef.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [-73.9851, 40.7589],
        zoom: 12
      });

      setMap(mapInstance);

      return () => {
        mapInstance.remove();
      };
    }

    initMap();
  }, []);

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
    if (!map || !map.isStyleLoaded()) return;

    // Add property markers
    properties.forEach((property) => {
      const popup = new (window as any).mapboxgl.Popup({ offset: 25 })
        .setHTML(`
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
        `);

      new (window as any).mapboxgl.Marker()
        .setLngLat([property.lng, property.lat])
        .setPopup(popup)
        .addTo(map);
    });

  }, [map, properties]);

  return (
    <>
      <div ref={mapRef} className="h-full w-full" />

      {/* Property count indicator */}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
        <div className="text-sm font-medium text-gray-900">
          {properties.length} properties
        </div>
      </div>
    </>
  );
}
