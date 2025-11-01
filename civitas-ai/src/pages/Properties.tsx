import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GradientBackground } from '../components/GradientBackground';

interface Property {
  id: string;
  address: string;
  city: string;
  state: string;
  price: number;
  roi: number;
  occupancy: number;
  nightlyRate: number;
  bedrooms: number;
}

interface Filters {
  location: string;
  minPrice: number;
  maxPrice: number;
  bedrooms: number;
}

// Mock property data
const PROPERTIES: Property[] = [
  {
    id: '1',
    address: '1234 Sunset Boulevard',
    city: 'Los Angeles',
    state: 'CA',
    price: 875000,
    roi: 12.4,
    occupancy: 95,
    nightlyRate: 285,
    bedrooms: 3
  },
  {
    id: '2',
    address: '5678 Park Avenue',
    city: 'New York',
    state: 'NY',
    price: 1250000,
    roi: 8.7,
    occupancy: 100,
    nightlyRate: 420,
    bedrooms: 2
  },
  {
    id: '3',
    address: '910 Ocean Drive',
    city: 'Miami',
    state: 'FL',
    price: 620000,
    roi: 15.2,
    occupancy: 88,
    nightlyRate: 315,
    bedrooms: 4
  },
  {
    id: '4',
    address: '2468 Market Street',
    city: 'San Francisco',
    state: 'CA',
    price: 950000,
    roi: 10.1,
    occupancy: 92,
    nightlyRate: 380,
    bedrooms: 2
  },
  {
    id: '5',
    address: '1357 Broadway',
    city: 'Nashville',
    state: 'TN',
    price: 485000,
    roi: 14.6,
    occupancy: 97,
    nightlyRate: 245,
    bedrooms: 3
  },
  {
    id: '6',
    address: '7890 Elm Street',
    city: 'Austin',
    state: 'TX',
    price: 725000,
    roi: 11.8,
    occupancy: 90,
    nightlyRate: 295,
    bedrooms: 3
  },
  {
    id: '7',
    address: '456 Desert View',
    city: 'Phoenix',
    state: 'AZ',
    price: 550000,
    roi: 13.2,
    occupancy: 86,
    nightlyRate: 220,
    bedrooms: 4
  },
  {
    id: '8',
    address: '789 Mountain Road',
    city: 'Denver',
    state: 'CO',
    price: 680000,
    roi: 11.5,
    occupancy: 89,
    nightlyRate: 265,
    bedrooms: 3
  }
];

const DriftingOrb: React.FC<{ delay: number; x: string; y: string }> = ({ delay, x, y }) => {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: '300px',
        height: '300px',
        background: 'radial-gradient(circle, rgba(0, 199, 140, 0.15) 0%, transparent 70%)',
        filter: 'blur(40px)',
        left: x,
        top: y
      }}
      animate={{
        x: [0, 50, -30, 0],
        y: [0, -40, 30, 0],
        scale: [1, 1.2, 0.9, 1]
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: 'easeInOut',
        delay
      }}
    />
  );
};

const StickySearchBar: React.FC<{
  filters: Filters;
  onFilterChange: (filters: Filters) => void;
  isLoading: boolean;
}> = ({ filters, onFilterChange, isLoading }) => {
  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, type: 'spring' }}
      className="sticky top-0 z-50 mb-8"
    >
      <div
        className="rounded-2xl p-4"
        style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
        }}
      >
        {/* Loading shimmer */}
        {isLoading && (
          <motion.div
            className="absolute inset-0 pointer-events-none rounded-2xl"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.2) 50%, transparent 100%)',
              backgroundSize: '200% 100%'
            }}
            animate={{
              backgroundPosition: ['200% 0', '-200% 0']
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'linear'
            }}
          />
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Location */}
          <div>
            <label className="text-xs text-white/60 mb-1 block font-['Inter_Tight']">Location</label>
            <input
              type="text"
              placeholder="City or State"
              value={filters.location}
              onChange={(e) => onFilterChange({ ...filters, location: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-teal-400 font-['Inter_Tight']"
            />
          </div>

          {/* Min Price */}
          <div>
            <label className="text-xs text-white/60 mb-1 block font-['Inter_Tight']">Min Price</label>
            <input
              type="number"
              placeholder="$0"
              value={filters.minPrice || ''}
              onChange={(e) => onFilterChange({ ...filters, minPrice: Number(e.target.value) })}
              className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-teal-400 font-['Inter_Tight']"
            />
          </div>

          {/* Max Price */}
          <div>
            <label className="text-xs text-white/60 mb-1 block font-['Inter_Tight']">Max Price</label>
            <input
              type="number"
              placeholder="Any"
              value={filters.maxPrice || ''}
              onChange={(e) => onFilterChange({ ...filters, maxPrice: Number(e.target.value) })}
              className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-teal-400 font-['Inter_Tight']"
            />
          </div>

          {/* Bedrooms */}
          <div>
            <label className="text-xs text-white/60 mb-1 block font-['Inter_Tight']">Bedrooms</label>
            <select
              value={filters.bedrooms || ''}
              onChange={(e) => onFilterChange({ ...filters, bedrooms: Number(e.target.value) })}
              className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-teal-400 font-['Inter_Tight']"
            >
              <option value="">Any</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
            </select>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const PropertyCard: React.FC<{ property: Property; index: number; isLoading: boolean }> = ({ property, index, isLoading }) => {
  const formatPrice = (price: number) => {
    return `$${(price / 1000).toFixed(0)}k`;
  };

  const getRoiBadgeColor = (roi: number) => {
    if (roi >= 14) return 'from-emerald-400 to-green-500';
    if (roi >= 10) return 'from-teal-400 to-cyan-500';
    return 'from-blue-400 to-indigo-500';
  };

  return (
    <motion.div
      layoutId={`property-${property.id}`}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{
        delay: index * 0.08,
        duration: 0.5,
        type: 'spring',
        stiffness: 120
      }}
      whileHover={{
        y: -12,
        rotateX: 5,
        rotateY: 3,
        scale: 1.03,
        transition: { type: 'spring', stiffness: 300, damping: 20 }
      }}
      className="relative group"
      style={{ perspective: 1000 }}
    >
      {/* Card with glassmorphism */}
      <div
        className="relative rounded-2xl p-6 overflow-hidden"
        style={{
          background: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
        }}
      >
        {/* Shimmer overlay - data scan effect */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: 1,
                backgroundPosition: ['200% 0', '-200% 0']
              }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%)',
                backgroundSize: '200% 100%'
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: 'linear'
              }}
            />
          )}
        </AnimatePresence>

        {/* Hover glow effect */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"
          style={{
            background: 'radial-gradient(circle at 50% 50%, rgba(0, 199, 140, 0.15) 0%, transparent 70%)',
            filter: 'blur(20px)'
          }}
        />

        {/* Content */}
        <div className="relative z-10 space-y-4">
          {/* Address */}
          <div>
            <h3 className="text-xl font-semibold text-white font-['Inter_Tight']">
              {property.address}
            </h3>
            <p className="text-sm text-gray-300 mt-1 font-['Inter_Tight']">
              {property.city}, {property.state} • {property.bedrooms} bed
            </p>
          </div>

          {/* Nightly Rate + ROI */}
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-white font-['Inter_Tight']">
                ${property.nightlyRate}
              </span>
              <span className="text-sm text-gray-400 font-['Inter_Tight']">/ night</span>
            </div>
            <div
              className={`inline-flex px-3 py-1 rounded-full bg-gradient-to-r ${getRoiBadgeColor(property.roi)}`}
            >
              <span className="text-sm font-bold text-white font-['Inter_Tight']">
                {property.roi}% ROI
              </span>
            </div>
          </div>

          {/* Metrics */}
          <div className="pt-4 border-t border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 mb-1 font-['Inter_Tight']">Occupancy</p>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${property.occupancy}%` }}
                      transition={{ delay: index * 0.08 + 0.3, duration: 1, ease: 'easeOut' }}
                      className="h-full bg-gradient-to-r from-teal-400 to-cyan-500 rounded-full"
                    />
                  </div>
                  <span className="text-sm font-semibold text-white font-['Inter_Tight']">
                    {property.occupancy}%
                  </span>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1 font-['Inter_Tight']">Price</p>
                <span className="text-sm font-semibold text-white font-['Inter_Tight']">
                  {formatPrice(property.price)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export const Properties: React.FC = () => {
  const [filters, setFilters] = useState<Filters>({
    location: '',
    minPrice: 0,
    maxPrice: 0,
    bedrooms: 0
  });
  const [isLoading, setIsLoading] = useState(false);

  // Filter properties
  const filteredProperties = PROPERTIES.filter(property => {
    const matchesLocation = !filters.location || 
      property.city.toLowerCase().includes(filters.location.toLowerCase()) ||
      property.state.toLowerCase().includes(filters.location.toLowerCase());
    const matchesMinPrice = !filters.minPrice || property.price >= filters.minPrice;
    const matchesMaxPrice = !filters.maxPrice || property.price <= filters.maxPrice;
    const matchesBedrooms = !filters.bedrooms || property.bedrooms >= filters.bedrooms;
    
    return matchesLocation && matchesMinPrice && matchesMaxPrice && matchesBedrooms;
  });

  // Simulate AI prefetch when filters change
  const handleFilterChange = (newFilters: Filters) => {
    setFilters(newFilters);
    setIsLoading(true);
    
    // Simulate prefetch delay
    setTimeout(() => {
      setIsLoading(false);
      // TODO: Prefetch portfolio data with React Query
      console.log('Prefetching portfolio data...');
    }, 800);
  };

  return (
    <motion.div
      layoutId="page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div
        className="min-h-screen w-full relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #1B0034 0%, #3B0A72 40%, #00C78C 100%)'
        }}
      >
        {/* Drifting Light Orbs */}
        <DriftingOrb delay={0} x="10%" y="20%" />
        <DriftingOrb delay={2} x="70%" y="10%" />
        <DriftingOrb delay={4} x="40%" y="60%" />
        <DriftingOrb delay={6} x="80%" y="70%" />

        <div className="relative z-10 min-h-screen px-8 py-12">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              <h1 className="text-5xl font-bold text-white mb-2 font-['Inter_Tight']">
                Discover STR Properties
              </h1>
              <p className="text-lg text-gray-300 font-['Inter_Tight']">
                AI-powered property discovery tailored to your investment goals
              </p>
            </motion.div>

            {/* Sticky Search Bar */}
            <StickySearchBar
              filters={filters}
              onFilterChange={handleFilterChange}
              isLoading={isLoading}
            />

            {/* Property Cards Grid */}
            <AnimatePresence mode="wait">
              <motion.div 
                key={JSON.stringify(filters)}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
              >
                {filteredProperties.map((property, index) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    index={index}
                    isLoading={isLoading}
                  />
                ))}
              </motion.div>
            </AnimatePresence>

            {/* No Results */}
            {filteredProperties.length === 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-16"
              >
                <p className="text-2xl text-white/60 font-['Inter_Tight']">No properties match your filters</p>
                <p className="text-lg text-white/40 mt-2 font-['Inter_Tight']">Try adjusting your search criteria</p>
              </motion.div>
            )}

            {/* Bottom AI Callout */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="mt-8 mb-8"
            >
              <div
                className="rounded-2xl p-6 text-center"
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
                }}
              >
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  className="text-4xl mb-3"
                >
                  💡
                </motion.div>
                <h3 className="text-xl font-semibold text-white mb-2 font-['Inter_Tight']">
                  Try asking:
                </h3>
                <div className="flex flex-wrap justify-center gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 rounded-full bg-gradient-to-r from-teal-400 to-cyan-500 text-white font-['Inter_Tight'] text-sm font-semibold"
                  >
                    Show properties with ROI above 10%
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 text-white font-['Inter_Tight'] text-sm font-semibold"
                  >
                    Find 3+ bedroom properties under $700k
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 rounded-full bg-gradient-to-r from-emerald-400 to-green-500 text-white font-['Inter_Tight'] text-sm font-semibold"
                  >
                    Best occupancy rates in Florida
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Properties;
