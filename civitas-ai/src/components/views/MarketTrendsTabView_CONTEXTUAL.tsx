// FILE: src/components/views/MarketTrendsTabView_CONTEXTUAL.tsx
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, TrendingUp, RefreshCw, Star, Eye, Filter } from 'lucide-react';
import { usePortfolio } from '../../contexts/PortfolioContext';
import { LiveMarketWidgets } from '../market/LiveMarketWidgets';
import { FlowCard } from '../primitives/FlowCard';
import { MarketDeepDiveModal } from '../market/MarketDeepDiveModal';

interface MarketInsight {
  id: string;
  location: string;
  city: string;
  state: string;
  query: string;
  created_at: string;
  isTracked: boolean;
  relevanceScore: number; // Based on portfolio
  analysis_data: {
    data: {
      overall_score?: { score: number; rating: string };
      investment_metrics?: {
        average_property_price: number;
        average_nightly_rate: number;
        estimated_roi: number;
        estimated_annual_revenue: number;
      };
      regulations?: { str_friendly: boolean; summary: string };
      demand?: { demand_level: string };
      chart_data?: {
        str_occupancy_trends_12mo?: any[];
        nightly_rate_by_property_type?: any[];
      };
    };
  };
}

type ViewMode = 'my-markets' | 'all-markets' | 'trending';

export const MarketTrendsTabView = () => {
  const {
    marketContexts,
    getMarketProperties,
    isTrackingMarket,
    properties
  } = usePortfolio();

  const [insights, setInsights] = useState<MarketInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('my-markets');
  const [selectedMarket, setSelectedMarket] = useState<{city: string; state: string} | null>(null);
  const [isLive, setIsLive] = useState(true);
  const [deepDiveMarket, setDeepDiveMarket] = useState<{city: string; state: string} | null>(null);

  // Auto-select first market context if available
  useEffect(() => {
    if (marketContexts.length > 0 && !selectedMarket) {
      setSelectedMarket({
        city: marketContexts[0].city,
        state: marketContexts[0].state,
      });
    }
  }, [marketContexts]);

  useEffect(() => {
    fetchInsights();
    
    if (isLive) {
      const interval = setInterval(fetchInsights, 30000); // Refresh every 30s
      return () => clearInterval(interval);
    }
  }, [viewMode, isLive]);

  const fetchInsights = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/agents/market-insights/recent?limit=50');
      const data = await response.json();
      
      if (data.success && data.insights) {
        const enrichedInsights = data.insights.map((insight: any) => ({
          ...insight,
          isTracked: isTrackingMarket(insight.city || extractCity(insight.location), insight.state || extractState(insight.location)),
          relevanceScore: calculateRelevance(insight),
        }));

        setInsights(enrichedInsights);
      }
    } catch (error) {
      console.error('Failed to fetch market insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const extractCity = (location: string) => location.split(',')[0]?.trim() || '';
  const extractState = (location: string) => location.split(',')[1]?.trim() || '';

  const calculateRelevance = (insight: any): number => {
    const city = insight.city || extractCity(insight.location);
    const state = insight.state || extractState(insight.location);
    const marketProps = getMarketProperties(city, state);
    
    // Score based on: owned properties (3pts each), searched properties (1pt each)
    let score = 0;
    marketProps.forEach(prop => {
      score += prop.type === 'owned' ? 3 : 1;
    });
    return score;
  };

  const filteredInsights = insights.filter(insight => {
    if (viewMode === 'my-markets') {
      return insight.relevanceScore > 0;
    } else if (viewMode === 'trending') {
      return (insight.analysis_data?.data?.overall_score?.score || 0) >= 70;
    }
    return true; // all-markets
  }).sort((a, b) => {
    if (viewMode === 'my-markets') {
      return b.relevanceScore - a.relevanceScore;
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const renderMarketCard = (insight: MarketInsight, index: number) => {
    const data = insight.analysis_data?.data;
    const score = data?.overall_score?.score || 0;
    const metrics = data?.investment_metrics;
    const marketProps = getMarketProperties(
      insight.city || extractCity(insight.location),
      insight.state || extractState(insight.location)
    );

    return (
      <FlowCard
        key={insight.id}
        title={insight.location}
        subtitle={`${new Date(insight.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}${insight.isTracked ? ` • ${marketProps.length} ${marketProps.length === 1 ? 'property' : 'properties'}` : ''}`}
        icon={
          insight.isTracked ? (
            <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
          ) : (
            <MapPin className="w-5 h-5" />
          )
        }
        badge={{
          text: score.toString(),
          variant: score >= 80 ? 'success' : score >= 60 ? 'warning' : 'info'
        }}
        preview={
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center">
              <div className="text-xs text-white/40 mb-1">Nightly</div>
              <div className="text-sm font-semibold text-cyan-400">{formatCurrency(metrics?.average_nightly_rate || 0)}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-white/40 mb-1">ROI</div>
              <div className="text-sm font-semibold text-emerald-400">{metrics?.estimated_roi || 0}%</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-white/40 mb-1">Friendly</div>
              <div className="text-lg">{data?.regulations?.str_friendly ? '✅' : '⚠️'}</div>
            </div>
          </div>
        }
        details={
          <div className="space-y-3">
            {/* Show tracked properties if any */}
            {marketProps.length > 0 && (
              <div className="rounded-lg p-3 bg-cyan-500/10 border border-cyan-400/20">
                <div className="text-xs text-cyan-400 font-medium mb-2 flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  <span>Your Properties in This Market</span>
                </div>
                <div className="space-y-1">
                  {marketProps.slice(0, 3).map(prop => (
                    <div key={prop.id} className="text-xs text-white/70 flex items-center gap-2">
                      <span className={prop.type === 'owned' ? 'text-emerald-400' : 'text-cyan-400'}>
                        {prop.type === 'owned' ? '🏠' : '👁️'}
                      </span>
                      <span className="flex-1 truncate">{prop.address}</span>
                    </div>
                  ))}
                  {marketProps.length > 3 && (
                    <div className="text-xs text-white/50 mt-1">+{marketProps.length - 3} more</div>
                  )}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg p-3 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-400/10">
                <div className="text-[10px] text-white/50 uppercase tracking-wider mb-1">Property Price</div>
                <div className="text-lg font-bold text-white">{formatCurrency(metrics?.average_property_price || 0)}</div>
              </div>
              <div className="rounded-lg p-3 bg-gradient-to-br from-emerald-500/10 to-green-500/10 border border-emerald-400/10">
                <div className="text-[10px] text-white/50 uppercase tracking-wider mb-1">Annual Revenue</div>
                <div className="text-lg font-bold text-white">{formatCurrency(metrics?.estimated_annual_revenue || 0)}</div>
              </div>
            </div>

            {/* Quick action: Track this market */}
            {!insight.isTracked && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // In real app, add to watch list
                  alert('Market tracking coming soon!');
                }}
                className="w-full py-2 rounded-lg bg-white/5 border border-white/10 text-white/70 text-xs font-medium hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-1.5"
              >
                <Eye className="w-3 h-3" />
                <span>Track This Market</span>
              </button>
            )}
          </div>
        }
        onDeepDive={() => {
          setDeepDiveMarket({
            city: insight.city || extractCity(insight.location),
            state: insight.state || extractState(insight.location),
          });
        }}
      />
    );
  };

  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto relative flex items-center justify-center">
        <div className="text-white text-xl">Loading market data...</div>
      </div>
    );
  }

  const hasTrackedMarkets = marketContexts.length > 0;

  return (
    <div className="flex-1 overflow-y-auto px-8 py-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl font-bold mb-3"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 255, 255, 0.85) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.15))',
                fontFamily: 'Inter Tight, sans-serif'
              }}
            >
              {hasTrackedMarkets ? 'Your Markets' : 'Market Trends'}
            </motion.h1>
            <p className="text-white/50 text-sm font-medium">
              {hasTrackedMarkets ? `Tracking ${marketContexts.length} markets with ${properties.length} properties` : 'Explore STR market trends and opportunities'}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsLive(!isLive)}
              className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all ${
                isLive ? 'bg-emerald-500/20 border border-emerald-400/40 text-emerald-300' : 'bg-white/10 border border-white/20 text-white/70'
              }`}
            >
              {isLive && (
                <motion.div
                  className="w-2 h-2 rounded-full bg-emerald-400"
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
              <span className="text-xs font-medium">{isLive ? 'LIVE' : 'PAUSED'}</span>
            </button>
            
            <button
              onClick={fetchInsights}
              className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="text-sm font-medium">Refresh</span>
            </button>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex gap-2 p-1.5 rounded-xl" style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.08) 100%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
        }}>
          {[
            { id: 'my-markets' as const, label: 'My Markets', icon: Star, count: marketContexts.length },
            { id: 'trending' as const, label: 'Trending', icon: TrendingUp },
            { id: 'all-markets' as const, label: 'All Markets', icon: Filter },
          ].map((mode) => {
            const Icon = mode.icon;
            return (
              <button
                key={mode.id}
                onClick={() => setViewMode(mode.id)}
                className="flex-1 px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 font-medium text-sm transition-all relative"
                style={{
                  background: viewMode === mode.id 
                    ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%)'
                    : 'transparent',
                  color: viewMode === mode.id ? '#1e293b' : 'rgba(255, 255, 255, 0.8)',
                  boxShadow: viewMode === mode.id ? '0 4px 16px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)' : 'none',
                }}
              >
                <Icon className="w-4 h-4" />
                <span>{mode.label}</span>
                {mode.count !== undefined && mode.count > 0 && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    viewMode === mode.id ? 'bg-cyan-500 text-white' : 'bg-white/20 text-white/70'
                  }`}>
                    {mode.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Live Market Widgets for selected market */}
        {selectedMarket && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-cyan-400" />
                {selectedMarket.city}, {selectedMarket.state}
              </h2>
              <button
                onClick={() => setSelectedMarket(null)}
                className="text-xs text-white/50 hover:text-white/80 transition-colors"
              >
                Hide Live Data
              </button>
            </div>
            <LiveMarketWidgets 
              city={selectedMarket.city}
              state={selectedMarket.state}
              isLive={isLive}
            />
          </div>
        )}

        {/* Market Insights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredInsights.length > 0 ? (
              filteredInsights.map((insight, index) => renderMarketCard(insight, index))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-2 text-center py-12"
              >
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  {viewMode === 'my-markets' ? 'No Markets Tracked Yet' : 'No Results Found'}
                </h3>
                <p className="text-white/60">
                  {viewMode === 'my-markets' 
                    ? 'Start searching for properties in chat to track markets automatically'
                    : 'Try adjusting your filters or check back later'}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Deep Dive Modal */}
      {deepDiveMarket && (
        <MarketDeepDiveModal
          isOpen={!!deepDiveMarket}
          onClose={() => setDeepDiveMarket(null)}
          city={deepDiveMarket.city}
          state={deepDiveMarket.state}
        />
      )}
    </div>
  );
};
