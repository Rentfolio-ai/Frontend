// FILE: src/components/market/LiveMarketWidgets.tsx
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Home, DollarSign, Users, Activity } from 'lucide-react';

interface LiveMetric {
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'neutral';
  lastUpdated: string;
}

interface MarketData {
  location: string;
  occupancyRate: LiveMetric;
  avgNightlyRate: LiveMetric;
  newListings: LiveMetric;
  bookingActivity: LiveMetric;
}

interface LiveMarketWidgetsProps {
  city: string;
  state: string;
  isLive?: boolean;
}

export const LiveMarketWidgets: React.FC<LiveMarketWidgetsProps> = ({ 
  city, 
  state,
  isLive = true 
}) => {
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (!isLive) return;

    // Initial fetch
    fetchMarketData();

    // Poll every 30 seconds for live data
    const interval = setInterval(() => {
      fetchMarketData(true);
    }, 30000);

    return () => clearInterval(interval);
  }, [city, state, isLive]);

  const fetchMarketData = async (isUpdate = false) => {
    if (isUpdate) setIsUpdating(true);
    
    try {
      // In production, replace with real API call
      const response = await fetch(`http://localhost:8000/api/market/live?city=${city}&state=${state}`);
      const data = await response.json();
      
      if (data.success) {
        setMarketData(data.market);
      }
    } catch (error) {
      console.error('Failed to fetch live market data:', error);
      // Use mock data for development
      setMarketData(generateMockData());
    } finally {
      if (isUpdate) {
        setTimeout(() => setIsUpdating(false), 500);
      }
    }
  };

  const generateMockData = (): MarketData => ({
    location: `${city}, ${state}`,
    occupancyRate: {
      value: `${(65 + Math.random() * 20).toFixed(1)}%`,
      change: Math.random() > 0.5 ? Number((Math.random() * 5).toFixed(1)) : -Number((Math.random() * 3).toFixed(1)),
      trend: Math.random() > 0.4 ? 'up' : 'down',
      lastUpdated: new Date().toISOString(),
    },
    avgNightlyRate: {
      value: Math.floor(180 + Math.random() * 120),
      change: Math.random() > 0.5 ? Number((Math.random() * 15).toFixed(1)) : -Number((Math.random() * 10).toFixed(1)),
      trend: Math.random() > 0.5 ? 'up' : 'down',
      lastUpdated: new Date().toISOString(),
    },
    newListings: {
      value: Math.floor(5 + Math.random() * 25),
      change: Math.random() > 0.5 ? Number((Math.random() * 20).toFixed(1)) : -Number((Math.random() * 15).toFixed(1)),
      trend: Math.random() > 0.6 ? 'up' : 'down',
      lastUpdated: new Date().toISOString(),
    },
    bookingActivity: {
      value: Math.floor(40 + Math.random() * 60),
      change: Math.random() > 0.5 ? Number((Math.random() * 10).toFixed(1)) : -Number((Math.random() * 8).toFixed(1)),
      trend: Math.random() > 0.5 ? 'up' : 'down',
      lastUpdated: new Date().toISOString(),
    },
  });

  if (!marketData) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-2xl p-4 animate-pulse"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.04) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
            }}
          >
            <div className="h-24" />
          </div>
        ))}
      </div>
    );
  }

  const widgets = [
    {
      icon: Activity,
      label: 'Occupancy Rate',
      metric: marketData.occupancyRate,
      color: 'from-emerald-400 to-green-500',
      bgGlow: 'rgba(16, 185, 129, 0.15)',
    },
    {
      icon: DollarSign,
      label: 'Avg Nightly Rate',
      metric: marketData.avgNightlyRate,
      color: 'from-cyan-400 to-blue-500',
      bgGlow: 'rgba(6, 182, 212, 0.15)',
      prefix: '$',
    },
    {
      icon: Home,
      label: 'New Listings (7d)',
      metric: marketData.newListings,
      color: 'from-purple-400 to-pink-500',
      bgGlow: 'rgba(168, 85, 247, 0.15)',
    },
    {
      icon: Users,
      label: 'Booking Activity',
      metric: marketData.bookingActivity,
      color: 'from-orange-400 to-red-500',
      bgGlow: 'rgba(251, 146, 60, 0.15)',
      suffix: ' bookings',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <AnimatePresence mode="popLayout">
        {widgets.map((widget, index) => {
          const Icon = widget.icon;
          const isPositive = widget.metric.trend === 'up';
          const TrendIcon = isPositive ? TrendingUp : TrendingDown;

          return (
            <motion.div
              key={widget.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group rounded-2xl p-5 relative overflow-hidden cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.10) 0%, rgba(255, 255, 255, 0.05) 100%)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                boxShadow: `0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.15)`,
              }}
              whileHover={{ 
                scale: 1.02,
                boxShadow: `0 12px 40px ${widget.bgGlow}, inset 0 1px 0 rgba(255, 255, 255, 0.2)`,
              }}
            >
              {/* Live indicator */}
              {isLive && (
                <motion.div
                  className="absolute top-3 right-3 flex items-center gap-1"
                  animate={isUpdating ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 0.5 }}
                >
                  <motion.div
                    className="w-2 h-2 rounded-full bg-emerald-400"
                    animate={{ 
                      opacity: [1, 0.5, 1],
                      boxShadow: ['0 0 8px rgba(16, 185, 129, 0.8)', '0 0 4px rgba(16, 185, 129, 0.4)', '0 0 8px rgba(16, 185, 129, 0.8)']
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <span className="text-[10px] text-emerald-400 font-medium">LIVE</span>
                </motion.div>
              )}

              {/* Background glow */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: `radial-gradient(circle at 50% 50%, ${widget.bgGlow} 0%, transparent 70%)`,
                }}
              />

              {/* Icon */}
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-3 relative z-10"
                style={{
                  background: `linear-gradient(135deg, ${widget.bgGlow}, rgba(255, 255, 255, 0.05))`,
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <Icon className="w-6 h-6 text-white" />
              </div>

              {/* Label */}
              <div className="text-xs text-white/50 uppercase tracking-wider font-medium mb-2 relative z-10">
                {widget.label}
              </div>

              {/* Value */}
              <div className="flex items-end justify-between relative z-10">
                <motion.div
                  key={String(widget.metric.value)}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-3xl font-bold text-white"
                  style={{ fontFamily: 'Inter Tight, sans-serif' }}
                >
                  {widget.prefix}{widget.metric.value}{widget.suffix}
                </motion.div>

                {/* Trend indicator */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`flex items-center gap-1 px-2 py-1 rounded-lg ${
                    isPositive ? 'bg-emerald-500/20' : 'bg-red-500/20'
                  }`}
                >
                  <TrendIcon className={`w-3 h-3 ${
                    isPositive ? 'text-emerald-400' : 'text-red-400'
                  }`} />
                  <span className={`text-xs font-semibold ${
                    isPositive ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {Math.abs(widget.metric.change)}%
                  </span>
                </motion.div>
              </div>

              {/* Last updated */}
              <div className="mt-3 text-[10px] text-white/30 relative z-10">
                Updated {new Date(widget.metric.lastUpdated).toLocaleTimeString()}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
