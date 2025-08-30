'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

// Dynamically import map components to avoid SSR issues
const MapboxMap = dynamic(() => import('./mapbox-map'), {
  ssr: false,
  loading: () => <MapSkeleton />
});

const LeafletMap = dynamic(() => import('./leaflet-map'), {
  ssr: false,
  loading: () => <MapSkeleton />
});

export function MapView() {
  const [mapProvider, setMapProvider] = useState<'mapbox' | 'leaflet'>('leaflet');

  useEffect(() => {
    // Check for Mapbox token and set provider
    const provider = process.env.NEXT_PUBLIC_MAP_PROVIDER || 'leaflet';
    const hasMapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

    if (provider === 'mapbox' && hasMapboxToken) {
      setMapProvider('mapbox');
    } else {
      setMapProvider('leaflet');
    }
  }, []);

  return (
    <div className="h-full w-full relative">
      {mapProvider === 'mapbox' ? <MapboxMap /> : <LeafletMap />}
    </div>
  );
}

function MapSkeleton() {
  return (
    <div className="h-full w-full bg-gray-200 animate-pulse flex items-center justify-center">
      <div className="text-gray-500">Loading map...</div>
    </div>
  );
}
