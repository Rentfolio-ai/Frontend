import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { FlowCard } from '../primitives/FlowCard';
import { Eye, TrendingUp, Home, DollarSign, RefreshCw, Activity } from 'lucide-react';
import { MarketDeepDiveModal } from '../market/MarketDeepDiveModal';

interface MarketInsight {
  id: string;
  location: string;
  query: string;
  created_at: string;
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
        str_supply_growth?: any[];
        revpar_trends?: any[];
        regulation_timeline?: any[];
        booking_window_analysis?: any;
        guest_demographics?: any;
        length_of_stay_trends?: any;
      };
    };
  };
}

type ViewLayer = 'snapshot' | 'explorer' | 'deepdive';

export const MarketTrendsTabView = () => {
  const [insights, setInsights] = useState<MarketInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deepDiveInsight, setDeepDiveInsight] = useState<MarketInsight | null>(null);
  const [deepDiveMarket, setDeepDiveMarket] = useState<{city: string; state: string} | null>(null);
  const [isLive, setIsLive] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    fetchInsights();
    if (isLive) {
      const interval = setInterval(() => {
        fetchInsights();
      }, 30000); // Update every 30 seconds when live
      return () => clearInterval(interval);
    }
  }, [isLive]);

  const fetchInsights = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/agents/market-insights/recent?limit=20');
      const data = await response.json();
      if (data.success && data.insights) {
        setInsights(data.insights);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Failed to fetch market insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'from-green-400 to-emerald-500';
    if (score >= 60) return 'from-yellow-400 to-orange-500';
    return 'from-red-400 to-pink-500';
  };

  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto relative flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #2D1B69 0%, #4A5568 50%, #2C7A7B 100%)' }}>
        <div className="text-white text-xl">Loading STR insights...</div>
      </div>
    );
  }

  if (insights.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto relative flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #2D1B69 0%, #4A5568 50%, #2C7A7B 100%)' }}>
        <div className="max-w-2xl mx-auto text-center px-8">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-8xl mb-6">🏠</motion.div>
          <h1 className="text-5xl font-bold text-white mb-4">STR Market Insights</h1>
          <p className="text-xl text-white/70 mb-6">Analyze short-term rental markets via chat</p>
          <div className="text-left space-y-3 text-gray-300">
            <p className="font-semibold text-white">Try asking:</p>
            <p>• "What's the STR occupancy rate in Austin?"</p>
            <p>• "Show me nightly rates by property type in Miami"</p>
            <p>• "How many STR listings are in Denver?"</p>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // UNIFIED FLOW CARD - Breathable, progressive disclosure
  // ============================================================================
  const renderFlowCard = (insight: MarketInsight, index: number) => {
    const data = insight.analysis_data?.data;
    const score = data?.overall_score?.score || 0;
    const metrics = data?.investment_metrics;
    const chartData = data?.chart_data || {};
    const occupancyTrends = chartData.str_occupancy_trends_12mo || [];
    const ratesByType = chartData.nightly_rate_by_property_type || [];

    return (
      <FlowCard
        key={insight.id}
        title={insight.location}
        subtitle={new Date(insight.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        icon={<Home className="w-5 h-5" />}
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
            {/* Extended metrics */}
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

            {/* Mini chart preview */}
            {occupancyTrends.length > 0 && (
              <div className="rounded-lg p-3 bg-white/[0.02] border border-white/[0.05]">
                <div className="text-xs text-white/60 mb-2 flex items-center gap-2">
                  <TrendingUp className="w-3 h-3" />
                  <span>12-Month Occupancy</span>
                </div>
                <div className="flex items-end justify-between gap-0.5 h-12">
                  {occupancyTrends.slice(0, 12).map((trend: any, idx: number) => (
                    <div key={idx} className="flex-1 bg-white/5 rounded-sm relative overflow-hidden">
                      <div
                        className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-cyan-500/80 to-cyan-400/80"
                        style={{ height: `${trend.occupancy_rate}%` }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Top property types */}
            {ratesByType.length > 0 && (
              <div className="space-y-1.5">
                {ratesByType.slice(0, 3).map((rate: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center p-2 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                    <span className="text-xs text-white/70">{rate.type}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-cyan-300">{formatCurrency(rate.avg_nightly)}</span>
                      <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">{rate.growth_yoy}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        }
        onDeepDive={() => {
          const [city, state] = insight.location.split(', ');
          setDeepDiveMarket({ city: city.trim(), state: state?.trim() || '' });
        }}
        className="transition-all duration-300"
      />
    );
  };


  // ============================================================================
  // LAYER 3: DEEP DIVE - Full modal with all charts
  // ============================================================================
  const renderDeepDiveModal = (insight: MarketInsight) => {
    const data = insight.analysis_data?.data;
    const metrics = data?.investment_metrics;
    const chartData = data?.chart_data || {};

    const occupancyTrends = chartData.str_occupancy_trends_12mo || [];
    const ratesByType = chartData.nightly_rate_by_property_type || [];

    const supplyGrowth = chartData.str_supply_growth || [];
    const revparTrends = chartData.revpar_trends || [];
    const regTimeline = chartData.regulation_timeline || [];
    const bookingWindow = chartData.booking_window_analysis || {};
    const guestDemo = chartData.guest_demographics || {};
    const losTrends = chartData.length_of_stay_trends || {};

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setDeepDiveInsight(null)}>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gradient-to-br from-slate-800/98 to-slate-900/98 rounded-3xl border border-white/20 max-w-6xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 z-10 bg-gradient-to-b from-slate-800 to-transparent backdrop-blur-lg p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-white font-['Inter_Tight']">{insight.location} Deep Dive</h2>
                <p className="text-white/60 mt-1">Complete STR Market Analysis</p>
              </div>
              <button
                onClick={() => setDeepDiveInsight(null)}
                className="px-6 py-3 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all"
              >
                ✕ Close
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="rounded-xl p-5 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-white/20">
                <p className="text-white/70 text-sm">Avg Nightly Rate</p>
                <p className="text-3xl font-bold text-white">{formatCurrency(metrics?.average_nightly_rate || 0)}</p>
              </div>
              <div className="rounded-xl p-5 bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-white/20">
                <p className="text-white/70 text-sm">Est. Annual Revenue</p>
                <p className="text-3xl font-bold text-white">{formatCurrency(metrics?.estimated_annual_revenue || 0)}</p>
              </div>
              <div className="rounded-xl p-5 bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-white/20">
                <p className="text-white/70 text-sm">Est. ROI</p>
                <p className="text-3xl font-bold text-white">{metrics?.estimated_roi || 0}%</p>
              </div>
              <div className="rounded-xl p-5 bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-white/20">
                <p className="text-white/70 text-sm">STR Friendly</p>
                <p className="text-3xl font-bold text-white">{data?.regulations?.str_friendly ? '✅' : '⚠️'}</p>
              </div>
            </div>

            {/* All remaining charts from original deep dive */}
            {occupancyTrends.length > 0 && (
              <div className="rounded-2xl p-6 bg-white/10 border border-white/20">
                <h3 className="text-2xl font-bold text-white mb-4">📈 STR Occupancy Trends (12 Months)</h3>
                <div className="grid grid-cols-12 gap-2">
                  {occupancyTrends.map((trend: any, idx: number) => (
                    <div key={idx} className="text-center">
                      <div className="h-32 bg-white/5 rounded-lg relative overflow-hidden">
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-teal-500 to-cyan-500"
                          style={{ height: `${trend.occupancy_rate}%` }}></div>
                      </div>
                      <p className="text-white/60 text-xs mt-2">{trend.month}</p>
                      <p className="text-white font-bold text-sm">{trend.occupancy_rate}%</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {ratesByType.length > 0 && (
              <div className="rounded-2xl p-6 bg-white/10 border border-white/20">
                <h3 className="text-2xl font-bold text-white mb-4">💰 Nightly Rates by Property Type</h3>
                <div className="space-y-3">
                  {ratesByType.map((rate: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-4 rounded-lg bg-white/5">
                      <div>
                        <p className="text-white font-semibold">{rate.type}</p>
                        <p className="text-teal-300 text-sm">{rate.growth_yoy} YoY</p>
                      </div>
                      <p className="text-2xl font-bold text-white">{formatCurrency(rate.avg_nightly)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {supplyGrowth.length > 0 && (
              <div className="rounded-2xl p-6 bg-white/10 border border-white/20">
                <h3 className="text-2xl font-bold text-white mb-4">🏘️ STR Supply Growth</h3>
                <div className="grid grid-cols-12 gap-2">
                  {supplyGrowth.map((supply: any, idx: number) => (
                    <div key={idx} className="text-center">
                      <p className="text-white/60 text-xs mb-1">{supply.month}</p>
                      <p className="text-white font-bold text-sm">{supply.total_listings}</p>
                      <p className="text-green-400 text-xs">{supply.growth_rate}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {revparTrends.length > 0 && (
              <div className="rounded-2xl p-6 bg-white/10 border border-white/20">
                <h3 className="text-2xl font-bold text-white mb-4">📊 RevPAR Trends</h3>
                <div className="grid grid-cols-6 md:grid-cols-12 gap-2">
                  {revparTrends.map((revpar: any, idx: number) => (
                    <div key={idx} className="text-center p-3 rounded-lg bg-white/5">
                      <p className="text-white/60 text-xs">{revpar.month}</p>
                      <p className="text-white font-bold">{formatCurrency(revpar.revpar)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {regTimeline.length > 0 && (
              <div className="rounded-2xl p-6 bg-white/10 border border-white/20">
                <h3 className="text-2xl font-bold text-white mb-4">⚖️ Regulatory Timeline</h3>
                <div className="space-y-3">
                  {regTimeline.map((reg: any, idx: number) => (
                    <div key={idx} className={`p-4 rounded-lg border ${
                      reg.impact === 'positive' ? 'bg-green-500/10 border-green-500/30' :
                      reg.impact === 'warning' ? 'bg-yellow-500/10 border-yellow-500/30' :
                      reg.impact === 'negative' ? 'bg-red-500/10 border-red-500/30' :
                      'bg-white/5 border-white/10'
                    }`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-white font-semibold">{reg.event}</p>
                          <p className="text-white/60 text-sm mt-1">{reg.date}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          reg.impact === 'positive' ? 'bg-green-500 text-white' :
                          reg.impact === 'warning' ? 'bg-yellow-500 text-black' :
                          reg.impact === 'negative' ? 'bg-red-500 text-white' :
                          'bg-gray-500 text-white'
                        }`}>{reg.impact}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {bookingWindow.breakdown && (
                <div className="rounded-2xl p-6 bg-white/10 border border-white/20">
                  <h3 className="text-xl font-bold text-white mb-3">🗓️ Booking Window</h3>
                  <p className="text-3xl font-bold text-teal-300 mb-4">{bookingWindow.average_booking_window} days</p>
                  <div className="space-y-2">
                    {bookingWindow.breakdown.map((window: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center">
                        <span className="text-white/70 text-sm">{window.window}</span>
                        <span className="text-white font-semibold">{window.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {guestDemo.trip_purpose && (
                <div className="rounded-2xl p-6 bg-white/10 border border-white/20">
                  <h3 className="text-xl font-bold text-white mb-3">👥 Guest Demographics</h3>
                  <div className="space-y-3">
                    {guestDemo.trip_purpose.map((purpose: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center">
                        <span className="text-white text-sm">{purpose.purpose}</span>
                        <span className="text-teal-300 font-semibold">{purpose.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {losTrends.distribution && (
              <div className="rounded-2xl p-6 bg-white/10 border border-white/20">
                <h3 className="text-2xl font-bold text-white mb-4">🛏️ Length of Stay Trends</h3>
                <p className="text-3xl font-bold text-teal-300 mb-4">Avg: {losTrends.average_los} nights</p>
                <div className="grid grid-cols-5 gap-3">
                  {losTrends.distribution.map((dist: any, idx: number) => (
                    <div key={idx} className="text-center p-4 rounded-lg bg-white/5">
                      <p className="text-white/60 text-xs mb-2">{dist.nights} nights</p>
                      <p className="text-2xl font-bold text-white">{dist.percentage}%</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto px-8 py-8"
      style={{ background: 'linear-gradient(135deg, #2D1B69 0%, #4A5568 50%, #2C7A7B 100%)' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
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
              📊 Market Trends
            </motion.h1>
            <p className="text-white/50 text-sm font-medium">
              Real-time STR market insights • Updated {lastUpdated.toLocaleTimeString()}
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

        {/* Flow card grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {insights.map((insight, index) => renderFlowCard(insight, index))}
        </div>
      </div>

      {/* Deep Dive Modal (Layer 3) */}
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
