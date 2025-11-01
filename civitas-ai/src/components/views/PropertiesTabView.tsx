import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Home, Search, MapPin, Bed, Bath, Maximize, DollarSign, TrendingUp, Calendar } from 'lucide-react';
import { getRecentSearches } from '../../services/agentsApi';

// TODO: Update this interface when real Mashvisor/AirDNA API is integrated
interface Property {
  address: string;
  city?: string;
  state?: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  sqft?: number;
  image_url?: string; // TODO: Get from Mashvisor/AirDNA
  nightly_price?: number;
  monthly_revenue_estimate?: number;
  cash_on_cash_roi?: number;
  avg_occupancy_rate?: number;
  property_tier?: string;
}

export const PropertiesTabView: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // TODO: Fetch properties from cached searches or Mashvisor/AirDNA
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call when Mashvisor/AirDNA is integrated
      // const data = await getRecentSearches(10);
      // setProperties(data.searches[0]?.results?.properties || []);
      setProperties([]);
    } catch (err) {
      console.error('Error fetching properties:', err);
    } finally {
      setLoading(false);
    }
  };

  // TODO: Replace placeholder with actual image from Mashvisor/AirDNA
  const getPropertyImage = (property: Property) => {
    return property.image_url || 'https://placehold.co/400x300/1e293b/white?text=Property';
  };

  // TODO: Remove this when real data is available
  const showComingSoon = properties.length === 0;
  return (
    <div 
      className="flex-1 overflow-y-auto relative"
      style={{
        background: 'linear-gradient(135deg, #1B0034 0%, #3B0A72 40%, #00C78C 100%)'
      }}
    >
      <div className="max-w-5xl mx-auto px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <Home className="w-8 h-8 text-emerald-400" />
            <h1 className="text-4xl font-bold text-white font-['Inter_Tight']">
              Properties
            </h1>
          </div>
          <p className="text-lg text-white/70">
            Property search and management
          </p>
        </motion.div>

        {/* Coming Soon State - TODO: Remove when Mashvisor/AirDNA is integrated */}
        {showComingSoon && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="rounded-2xl p-12 text-center"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/10 mb-6">
              <Search className="w-10 h-10 text-white/60" />
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-4">
              Coming Soon
            </h2>
            
            <p className="text-white/70 text-lg mb-6 max-w-md mx-auto">
              Property cards with images will appear here when Mashvisor or AirDNA API is integrated.
            </p>

            <div className="inline-block px-6 py-3 rounded-lg bg-blue-500/20 border border-blue-400/30">
              <p className="text-blue-300 font-medium">
                🚧 Awaiting Mashvisor/AirDNA API
              </p>
            </div>
          </motion.div>
        )}

        {/* TODO: Property Cards Grid - Uncomment and implement when API is ready
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              className="rounded-2xl overflow-hidden"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              <div className="relative h-48 bg-gray-800">
                <img
                  src={getPropertyImage(property)}
                  alt={property.address}
                  className="w-full h-full object-cover"
                />
                {property.property_tier && (
                  <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-blue-500/80">
                    <span className="text-white text-sm font-medium">Tier {property.property_tier}</span>
                  </div>
                )}
              </div>

              <div className="p-4">
                <div className="flex items-start gap-2 mb-3">
                  <MapPin className="w-4 h-4 text-emerald-400 mt-1" />
                  <div>
                    <h3 className="text-white font-semibold text-sm">{property.address}</h3>
                    <p className="text-white/60 text-xs">{property.city}, {property.state}</p>
                  </div>
                </div>

                <div className="text-2xl font-bold text-white mb-3">
                  ${property.price.toLocaleString()}
                </div>

                <div className="flex items-center gap-4 text-white/70 text-sm mb-3">
                  <div className="flex items-center gap-1">
                    <Bed className="w-4 h-4" />
                    <span>{property.bedrooms}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Bath className="w-4 h-4" />
                    <span>{property.bathrooms}</span>
                  </div>
                  {property.sqft && (
                    <div className="flex items-center gap-1">
                      <Maximize className="w-4 h-4" />
                      <span>{property.sqft.toLocaleString()} sqft</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2 pt-3 border-t border-white/10">
                  {property.nightly_price && (
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Nightly Rate</span>
                      <span className="text-white">${property.nightly_price}</span>
                    </div>
                  )}
                  {property.monthly_revenue_estimate && (
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Monthly Revenue</span>
                      <span className="text-emerald-400">${property.monthly_revenue_estimate.toLocaleString()}</span>
                    </div>
                  )}
                  {property.cash_on_cash_roi && (
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">ROI</span>
                      <span className="text-blue-400">{property.cash_on_cash_roi.toFixed(1)}%</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        */}
      </div>
    </div>
  );
};
