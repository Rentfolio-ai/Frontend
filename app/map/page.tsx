import { Suspense } from 'react';
import { Navbar, FilterPanel } from '@/shared/components';
import { MapView } from '@/features/maps';

export const metadata = {
  title: 'AI Smart Map - Intelligent Property Discovery',
  description: 'AI-powered interactive map with intelligent property clustering, market heatmaps, and predictive analytics.',
};

export default function MapPage() {
  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Navbar />

      <div className="flex-1 relative">
        <Suspense fallback={<MapSkeleton />}>
          <MapView />
        </Suspense>

        <FilterPanel />
      </div>
    </div>
  );
}

function MapSkeleton() {
  return (
    <div className="h-full w-full bg-gray-200 animate-pulse flex items-center justify-center">
      <div className="text-gray-500">Loading AI-powered map intelligence...</div>
    </div>
  );
}
