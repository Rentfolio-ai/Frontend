import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

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

export const MarketTrendsTabView = () => {
  const [insights, setInsights] = useState<MarketInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedInsight, setSelectedInsight] = useState<MarketInsight | null>(null);

  useEffect(() => {
    fetchInsights();
    const interval = setInterval(fetchInsights, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchInsights = async () => {
    try {
      setError(null);
      const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
      const response = await fetch(`${BACKEND_URL}/api/agents/market-insights/recent?limit=20`);
      const data = await response.json();
      if (data.success && data.insights) {
        setInsights(data.insights);
      }
    } catch (err) {
      console.error('Failed to fetch market insights:', err);
      setError('Failed to load market insights. Please try again.');
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
        style={{ background: 'linear-gradient(135deg, #1B0034 0%, #3B0A72 40%, #00C78C 100%)' }}>
        <div className="text-white text-xl">Loading STR insights...</div>
      </div>
    );
  }

  if (insights.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto relative flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #1B0034 0%, #3B0A72 40%, #00C78C 100%)' }}>
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

  const renderDetailView = (insight: MarketInsight) => {
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-4xl font-bold text-white font-['Inter_Tight']">{insight.location} STR Market</h2>
            <p className="text-white/60 mt-1">Short-Term Rental Trends & Insights</p>
          </div>
          <button onClick={() => setSelectedInsight(null)}
            className="px-6 py-3 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/20">
            ← Overview
          </button>
        </div>

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

        {/* STR Occupancy Trends */}
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
            <p className="text-white/70 text-sm mt-4">Peak occupancy months show strongest booking demand</p>
          </div>
        )}

        {/* Nightly Rates by Property Type */}
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
            <p className="text-white/70 text-sm mt-4">Larger properties command premium nightly rates</p>
          </div>
        )}

        {/* STR Supply Growth */}
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
            <p className="text-white/70 text-sm mt-4">Market supply is growing - consider competitive positioning</p>
          </div>
        )}

        {/* RevPAR Trends */}
        {revparTrends.length > 0 && (
          <div className="rounded-2xl p-6 bg-white/10 border border-white/20">
            <h3 className="text-2xl font-bold text-white mb-4">📊 RevPAR Trends (Revenue Per Available Room)</h3>
            <div className="grid grid-cols-6 md:grid-cols-12 gap-2">
              {revparTrends.map((revpar: any, idx: number) => (
                <div key={idx} className="text-center p-3 rounded-lg bg-white/5">
                  <p className="text-white/60 text-xs">{revpar.month}</p>
                  <p className="text-white font-bold">{formatCurrency(revpar.revpar)}</p>
                  <p className="text-white/50 text-xs">{revpar.occupancy}%</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Regulation Timeline */}
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

        {/* Booking Window & Guest Insights */}
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
              <p className="text-white/60 text-xs mt-4 italic">{bookingWindow.insight}</p>
            </div>
          )}

          {guestDemo.trip_purpose && (
            <div className="rounded-2xl p-6 bg-white/10 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-3">👥 Guest Demographics</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-white/70 text-sm mb-2">Trip Purpose</p>
                  {guestDemo.trip_purpose.map((purpose: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center mb-1">
                      <span className="text-white text-sm">{purpose.purpose}</span>
                      <span className="text-teal-300 font-semibold">{purpose.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Length of Stay */}
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
            <p className="text-white/60 text-sm mt-4 italic">{losTrends.insight}</p>
          </div>
        )}
      </div>
    );
  };

  const renderOverviewCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {insights.map((insight, index) => {
        const data = insight.analysis_data?.data;
        const score = data?.overall_score?.score || 0;
        const metrics = data?.investment_metrics;
        
        return (
          <motion.div key={insight.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="rounded-2xl p-6 cursor-pointer hover:scale-[1.02] transition-transform bg-white/10 border border-white/20"
            onClick={() => setSelectedInsight(insight)}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-2xl font-bold text-white">📍 {insight.location}</h3>
                <p className="text-sm text-white/60 mt-1">{new Date(insight.created_at).toLocaleDateString()}</p>
              </div>
              <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${getScoreColor(score)} text-white font-bold`}>
                {score}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-white/60 text-sm">Nightly Rate</p>
                <p className="text-xl font-bold text-teal-300">{formatCurrency(metrics?.average_nightly_rate || 0)}</p>
              </div>
              <div>
                <p className="text-white/60 text-sm">Est. ROI</p>
                <p className="text-xl font-bold text-white">{metrics?.estimated_roi || 0}%</p>
              </div>
            </div>

            <div className="flex items-center justify-between text-white/80 text-sm">
              <span>{data?.regulations?.str_friendly ? '✅ STR-Friendly' : '⚠️ Permit Required'}</span>
              <span>{data?.demand?.demand_level || 'N/A'}</span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto px-8 py-6"
      style={{ background: 'linear-gradient(135deg, #1B0034 0%, #3B0A72 40%, #00C78C 100%)' }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold text-white font-['Inter_Tight']">📊 STR Market Insights</h1>
          <div className="flex gap-2">
            <button 
              type="button"
              onClick={fetchInsights}
              aria-label="Refresh insights"
              className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white hover:bg-white/20"
            >
              🔄 Refresh
            </button>
            {selectedInsight && (
              <button onClick={() => setSelectedInsight(null)}
                className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white hover:bg-white/20">
                Overview
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300">
            {error}
          </div>
        )}

        <AnimatePresence mode="wait">
          {selectedInsight ? (
            <motion.div key="detail" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {renderDetailView(selectedInsight)}
            </motion.div>
          ) : (
            <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {renderOverviewCards()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
