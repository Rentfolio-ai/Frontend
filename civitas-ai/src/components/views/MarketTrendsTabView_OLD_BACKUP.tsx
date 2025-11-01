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
      regulations?: { str_friendly: boolean; summary: string; compliance_requirements: string[] };
      demand?: { demand_level: string; analysis: any; insights: string[] };
      seasonality?: { summary: string; data: any; insights: string[]; peak_months: string[]; off_season: string[] };
      recommendations?: { action_items: string[]; risk_level: string; investment_rating: string };
      market_comparison?: { ranking: string; similar_markets: string[]; competitive_advantage: string[] };
      sample_properties?: any[];
      chart_data?: {
        market_narrative?: any;
        investment_scenarios?: any[];
        risk_heatmap?: any[];
        smart_alerts?: any[];
        competitive_intelligence?: any;
        investment_journey?: any[];
        price_prediction_6mo?: any[];
        momentum_indicators?: any;
      };
    };
  };
}

export const MarketTrendsTabView = () => {
  const [insights, setInsights] = useState<MarketInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInsight, setSelectedInsight] = useState<MarketInsight | null>(null);

  useEffect(() => {
    fetchInsights();
    // Auto-refresh every 10 seconds
    const interval = setInterval(fetchInsights, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchInsights = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/agents/market-insights/recent?limit=20');
      const data = await response.json();
      if (data.success && data.insights) {
        setInsights(data.insights);
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
        style={{ background: 'linear-gradient(135deg, #1B0034 0%, #3B0A72 40%, #00C78C 100%)' }}>
        <div className="text-white text-xl">Loading insights...</div>
      </div>
    );
  }

  if (insights.length === 0) {
    return (
      <div 
        className="flex-1 overflow-y-auto relative flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #1B0034 0%, #3B0A72 40%, #00C78C 100%)' }}
      >
        <div className="max-w-2xl mx-auto text-center px-8">
          <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, type: 'spring', stiffness: 100 }} className="text-8xl mb-6">
            🌎
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }}>
            <h1 className="text-5xl font-bold text-white mb-4 font-['Inter_Tight']">Market Insights</h1>
            <p className="text-xl text-white/70 font-['Inter_Tight'] mb-6">Available via Chat</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.6 }}
            className="rounded-2xl p-8" style={{ background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
            <p className="text-lg text-white/80 font-['Inter_Tight'] leading-relaxed mb-6">
              Get AI-powered market insights by asking Civitas in the main chat! Market analysis is powered by our intelligent assistant.
            </p>
            <div className="text-left space-y-3 text-gray-300 font-['Inter_Tight']">
              <p className="font-semibold text-white">Try asking:</p>
              <p>• "What's the STR market like in Austin?"</p>
              <p>• "Should I invest in Miami for Airbnb?"</p>
              <p>• "Tell me about Denver's STR regulations"</p>
              <p>• "What's the best time to rent in Nashville?"</p>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.7 }}
            className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-teal-400 to-cyan-500">
            <span className="text-white font-['Inter_Tight'] font-semibold">
              💬 Use the Chat Interface for Market Insights
            </span>
          </motion.div>
        </div>
      </div>
    );
  }

  const renderOverviewCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {insights.map((insight, index) => {
        const data = insight.analysis_data?.data;
        const score = data?.overall_score?.score || 0;
        const metrics = data?.investment_metrics;
        
        return (
          <motion.div key={insight.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }} className="rounded-2xl p-6 cursor-pointer hover:scale-[1.01] transition-transform"
            style={{ background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.2)' }}
            onClick={() => setSelectedInsight(insight)}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-2xl font-bold text-white font-['Inter_Tight']">📍 {insight.location}</h3>
                <p className="text-sm text-white/60 font-['Inter_Tight'] mt-1">{new Date(insight.created_at).toLocaleDateString()}</p>
              </div>
              <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${getScoreColor(score)} text-white font-bold text-sm`}>
                {score}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-white/60 text-sm font-['Inter_Tight']">Avg Price</p>
                <p className="text-2xl font-bold text-white font-['Inter_Tight']">{formatCurrency(metrics?.average_property_price || 0)}</p>
              </div>
              <div>
                <p className="text-white/60 text-sm font-['Inter_Tight']">Nightly Rate</p>
                <p className="text-2xl font-bold text-teal-300 font-['Inter_Tight']">{formatCurrency(metrics?.average_nightly_rate || 0)}</p>
              </div>
            </div>

            <div className="flex items-center justify-between text-white/80 text-sm">
              <span>{data?.regulations?.str_friendly ? '✅ STR-Friendly' : '⚠️ Permit Required'}</span>
              <span>Demand: {data?.demand?.demand_level || 'N/A'}</span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );

  const renderDetailView = (insight: MarketInsight) => {
    const data = insight.analysis_data?.data;
    const metrics = data?.investment_metrics;
    const score = data?.overall_score?.score || 0;
    const chartData = data?.chart_data || {};

    const narrative = chartData.market_narrative || {};
    const scenarios = chartData.investment_scenarios || [];
    const alerts = chartData.smart_alerts || [];
    const riskHeatmap = chartData.risk_heatmap || [];
    const competitiveIntel = chartData.competitive_intelligence || {};
    const journey = chartData.investment_journey || [];
    const momentum = chartData.momentum_indicators || {};

    return (
      <div className="space-y-8">
        {/* Header with Back Button */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between">
          <div>
            <h2 className="text-4xl font-bold text-white font-['Inter_Tight']">{insight.location}</h2>
            <p className="text-white/60 mt-1">AI-Powered Market Intelligence</p>
          </div>
          <button onClick={() => setSelectedInsight(null)}
            className="px-6 py-3 rounded-xl bg-white/10 backdrop-blur-lg border border-white/20 text-white hover:bg-white/20 transition-all">
            ← Overview
          </button>
        </motion.div>

        {/* Market Narrative Section */}
        {narrative.story && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
            className="rounded-2xl p-8 bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-lg border border-white/20">
            <div className="flex items-start gap-4">
              <div className="text-5xl">{narrative.phase?.includes('🚀') ? '🚀' : narrative.phase?.includes('📈') ? '📈' : '⚖️'}</div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-white mb-2">{narrative.phase}</h3>
                <p className="text-lg text-white/90 leading-relaxed mb-4">{narrative.story}</p>
                <div className="flex gap-2 flex-wrap">
                  {narrative.key_drivers?.map((driver: string, idx: number) => (
                    <span key={idx} className="px-3 py-1 rounded-full bg-white/10 text-white/80 text-sm">{driver}</span>
                  ))}
                </div>
              </div>
            </div>
            {/* Timeline */}
            {narrative.timeline && (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                {narrative.timeline.map((item: any, idx: number) => (
                  <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + idx * 0.1 }}
                    className="rounded-lg p-4 bg-white/10 border border-white/20">
                    <p className="text-teal-300 font-semibold text-sm">{item.period}</p>
                    <p className="text-white/90 text-sm mt-2">{item.event}</p>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Smart Alerts Banner */}
        {alerts.length > 0 && (
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {alerts.map((alert: any, idx: number) => (
              <div key={idx}
                className={`rounded-xl p-4 border ${
                  alert.type === 'opportunity' ? 'bg-green-500/20 border-green-400/40' :
                  alert.type === 'warning' ? 'bg-yellow-500/20 border-yellow-400/40' :
                  alert.type === 'positive' ? 'bg-blue-500/20 border-blue-400/40' :
                  'bg-purple-500/20 border-purple-400/40'
                }`}>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{alert.icon}</span>
                  <div className="flex-1">
                    <h4 className="text-white font-semibold text-sm">{alert.title}</h4>
                    <p className="text-white/80 text-sm mt-1">{alert.message}</p>
                    <p className="text-white/60 text-xs mt-2">→ {alert.action}</p>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* Investment Scenarios */}
        {scenarios.length > 0 && (
          <div>
            <h3 className="text-2xl font-bold text-white mb-4">Investment Strategy Scenarios</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {scenarios.map((scenario: any, idx: number) => (
                <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + idx * 0.1 }}
                  className="rounded-2xl p-6 bg-white/10 backdrop-blur-lg border border-white/20 hover:bg-white/15 transition-all cursor-pointer group">
                  <div className="text-4xl mb-3">{scenario.icon}</div>
                  <h4 className="text-xl font-bold text-white mb-2">{scenario.name}</h4>
                  <p className="text-white/70 text-sm mb-4">{scenario.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                      <span className="text-white/60 text-sm">Investment</span>
                      <span className="text-white font-semibold">{formatCurrency(scenario.investment)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60 text-sm">Projected ROI</span>
                      <span className="text-teal-300 font-bold">{scenario.projected_roi}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60 text-sm">Risk Level</span>
                      <span className={`font-semibold ${
                        scenario.risk_level === 'Low' ? 'text-green-400' :
                        scenario.risk_level === 'Medium' ? 'text-yellow-400' :
                        'text-red-400'
                      }`}>{scenario.risk_level}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60 text-sm">Timeline</span>
                      <span className="text-white/80">{scenario.timeline}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/10">
                    <p className="text-xs text-white/60 italic">{scenario.recommendation}</p>
                  </div>
                  
                  <button className="mt-4 w-full py-2 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                    Select Strategy
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Risk Heatmap */}
        {riskHeatmap.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <h3 className="text-2xl font-bold text-white mb-4">Multi-Dimensional Risk Assessment</h3>
            <div className="rounded-2xl p-6 bg-white/10 backdrop-blur-lg border border-white/20">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {riskHeatmap.map((risk: any, idx: number) => (
                  <div key={idx} className="rounded-lg p-4 bg-white/5 border border-white/10">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-white font-semibold">{risk.category}</h4>
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        risk.severity === 'low' ? 'bg-green-500/30 text-green-200' :
                        risk.severity === 'medium' ? 'bg-yellow-500/30 text-yellow-200' :
                        'bg-red-500/30 text-red-200'
                      }`}>{risk.severity}</span>
                    </div>
                    <div className="mb-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-white/60">Risk Score</span>
                        <span className="text-white font-semibold">{risk.risk_score}</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div className={`h-2 rounded-full ${
                          risk.risk_score < 40 ? 'bg-green-500' :
                          risk.risk_score < 60 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`} style={{ width: `${risk.risk_score}%` }}></div>
                      </div>
                    </div>
                    <p className="text-white/60 text-xs">💡 {risk.mitigation}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Competitive Intelligence */}
        {competitiveIntel.competitor_tiers && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <h3 className="text-2xl font-bold text-white mb-4">Competitive Intelligence</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-2xl p-6 bg-white/10 backdrop-blur-lg border border-white/20">
                <h4 className="text-white font-semibold mb-4">Market Tiers</h4>
                {competitiveIntel.competitor_tiers.map((tier: any, idx: number) => (
                  <div key={idx} className="mb-4 pb-4 border-b border-white/10 last:border-0">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white font-semibold">{tier.name}</span>
                      <span className="text-teal-300 text-sm">{tier.count} listings</span>
                    </div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-white/60">Avg Nightly</span>
                      <span className="text-white">{formatCurrency(tier.avg_nightly)}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-white/60">Occupancy</span>
                      <span className="text-white">{tier.occupancy}%</span>
                    </div>
                    <p className="text-white/60 text-xs italic">{tier.strength}</p>
                  </div>
                ))}
              </div>
              
              <div className="rounded-2xl p-6 bg-white/10 backdrop-blur-lg border border-white/20">
                <h4 className="text-white font-semibold mb-4">Market Gaps & Opportunities</h4>
                {competitiveIntel.market_gaps?.map((gap: any, idx: number) => (
                  <div key={idx} className="mb-4 p-3 rounded-lg bg-gradient-to-r from-teal-500/20 to-cyan-500/20 border border-teal-400/30">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-white font-semibold text-sm">{gap.opportunity}</span>
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        gap.potential === 'High' ? 'bg-green-500/30 text-green-200' : 'bg-yellow-500/30 text-yellow-200'
                      }`}>{gap.potential}</span>
                    </div>
                    <p className="text-white/70 text-xs">{gap.reason}</p>
                  </div>
                ))}
                <div className="mt-4 pt-4 border-t border-white/10">
                  <h5 className="text-white/90 font-semibold text-sm mb-2">Differentiation Strategy</h5>
                  <ul className="text-white/70 text-xs space-y-1">
                    {competitiveIntel.differentiation_strategy?.map((strategy: string, idx: number) => (
                      <li key={idx}>✓ {strategy}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Investment Journey */}
        {journey.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
            <h3 className="text-2xl font-bold text-white mb-4">Your Investment Journey</h3>
            <div className="space-y-4">
              {journey.map((step: any, idx: number) => (
                <div key={idx} className="rounded-xl p-5 bg-white/10 backdrop-blur-lg border border-white/20 hover:bg-white/15 transition-all">
                  <div className="flex items-start gap-4">
                    <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl ${
                      step.status === 'ready' ? 'bg-green-500 text-white' : 'bg-white/20 text-white/60'
                    }`}>
                      {step.step}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-white font-bold text-lg">{step.phase}</h4>
                        <span className="text-teal-300 text-sm">{step.duration}</span>
                      </div>
                      <ul className="text-white/70 text-sm space-y-1">
                        {step.tasks?.map((task: string, taskIdx: number) => (
                          <li key={taskIdx} className="flex items-start gap-2">
                            <span className="text-teal-400 mt-0.5">▸</span>
                            <span>{task}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Market Momentum */}
        {momentum.indicators && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
            className="rounded-2xl p-6 bg-gradient-to-br from-cyan-600/20 to-blue-600/20 backdrop-blur-lg border border-white/20">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-white">Market Momentum</h3>
              <div className={`px-4 py-2 rounded-full font-bold ${
                momentum.signal === 'bullish' ? 'bg-green-500 text-white' :
                momentum.signal === 'bearish' ? 'bg-red-500 text-white' :
                'bg-yellow-500 text-white'
              }`}>
                {momentum.signal?.toUpperCase()}
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {momentum.indicators.map((indicator: any, idx: number) => (
                <div key={idx} className="rounded-lg p-4 bg-white/10">
                  <p className="text-white/70 text-sm mb-2">{indicator.name}</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-white">{indicator.value}</span>
                    <span className={`text-lg ${
                      indicator.trend === 'up' ? 'text-green-400' :
                      indicator.trend === 'down' ? 'text-red-400' :
                      'text-yellow-400'
                    }`}>
                      {indicator.trend === 'up' ? '↗' : indicator.trend === 'down' ? '↘' : '→'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto px-8 py-6"
      style={{ background: 'linear-gradient(135deg, #1B0034 0%, #3B0A72 40%, #00C78C 100%)' }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold text-white font-['Inter_Tight']">📊 Market Insights</h1>
          <div className="flex gap-2">
            <button onClick={fetchInsights}
              className="px-4 py-2 rounded-lg bg-white/10 backdrop-blur-lg border border-white/20 text-white hover:bg-white/20 transition-colors">
              🔄 Refresh
            </button>
            {selectedInsight && (
              <button onClick={() => setSelectedInsight(null)} className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white hover:bg-white/20">
                Overview
              </button>
            )}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {selectedInsight ? (
            <motion.div key="detail" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}>
              {renderDetailView(selectedInsight)}
            </motion.div>
          ) : (
            <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}>
              {renderOverviewCards()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
