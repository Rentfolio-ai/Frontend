// FILE: src/components/market/MarketDeepDiveModal.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Shield, BarChart3, Sparkles, Download, Share2 } from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface MarketDeepDiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  city: string;
  state: string;
  marketData?: any;
}

type TabId = 'overview' | 'trends' | 'demographics' | 'regulations';

export const MarketDeepDiveModal: React.FC<MarketDeepDiveModalProps> = ({
  isOpen,
  onClose,
  city,
  state,
  marketData,
}) => {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchDetailedData();
    }
  }, [isOpen, city, state]);

  const fetchDetailedData = async () => {
    setLoading(true);
    
    // For now, use mock data directly
    // TODO: Uncomment when API is ready
    /*
    try {
      const response = await fetch(`http://localhost:8000/api/market/deep-dive?city=${city}&state=${state}`);
      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
        setLoading(false);
        return;
      }
    } catch (error) {
      console.error('Failed to fetch deep dive data:', error);
    }
    */
    
    // Use mock data
    setTimeout(() => {
      setData(generateMockDeepDiveData());
      setLoading(false);
    }, 500); // Small delay to show loading state
  };

  const generateMockDeepDiveData = () => ({
    location: `${city}, ${state}`,
    summary: {
      overallScore: 85,
      rating: 'Excellent',
      avgPropertyPrice: 425000,
      avgNightlyRate: 195,
      estimatedROI: 12.5,
      estimatedAnnualRevenue: 52000,
      totalListings: 1247,
      avgOccupancy: 74.5,
    },
    occupancyTrends: [
      { month: 'Jan', occupancy: 68, booked: 21, available: 31 },
      { month: 'Feb', occupancy: 71, booked: 20, available: 28 },
      { month: 'Mar', occupancy: 75, booked: 23, available: 31 },
      { month: 'Apr', occupancy: 78, booked: 23, available: 30 },
      { month: 'May', occupancy: 82, booked: 25, available: 31 },
      { month: 'Jun', occupancy: 85, booked: 26, available: 30 },
      { month: 'Jul', occupancy: 88, booked: 27, available: 31 },
      { month: 'Aug', occupancy: 86, booked: 27, available: 31 },
      { month: 'Sep', occupancy: 79, booked: 24, available: 30 },
      { month: 'Oct', occupancy: 76, booked: 24, available: 31 },
      { month: 'Nov', occupancy: 72, booked: 22, available: 30 },
      { month: 'Dec', occupancy: 70, booked: 22, available: 31 },
    ],
    ratesByType: [
      { type: 'Studio', rate: 110, growth: '+12%', count: 145 },
      { type: '1 Bed', rate: 140, growth: '+15%', count: 342 },
      { type: '2 Bed', rate: 185, growth: '+18%', count: 456 },
      { type: '3 Bed', rate: 245, growth: '+14%', count: 234 },
      { type: '4+ Bed', rate: 325, growth: '+20%', count: 70 },
    ],
    supplyGrowth: [
      { month: 'Jan', total: 1100, new: 45, growth: '+4.2%' },
      { month: 'Feb', total: 1133, new: 38, growth: '+3.0%' },
      { month: 'Mar', total: 1165, new: 42, growth: '+2.8%' },
      { month: 'Apr', total: 1189, new: 35, growth: '+2.1%' },
      { month: 'May', total: 1208, new: 28, growth: '+1.6%' },
      { month: 'Jun', total: 1225, new: 22, growth: '+1.4%' },
      { month: 'Jul', total: 1231, new: 18, growth: '+0.5%' },
      { month: 'Aug', total: 1238, new: 15, growth: '+0.6%' },
      { month: 'Sep', total: 1242, new: 12, growth: '+0.3%' },
      { month: 'Oct', total: 1245, new: 8, growth: '+0.2%' },
      { month: 'Nov', total: 1246, new: 5, growth: '+0.1%' },
      { month: 'Dec', total: 1247, new: 4, growth: '+0.1%' },
    ],
    revparTrends: [
      { month: 'Jan', revpar: 133, adr: 195, occupancy: 68 },
      { month: 'Feb', revpar: 138, adr: 195, occupancy: 71 },
      { month: 'Mar', revpar: 146, adr: 195, occupancy: 75 },
      { month: 'Apr', revpar: 152, adr: 195, occupancy: 78 },
      { month: 'May', revpar: 160, adr: 195, occupancy: 82 },
      { month: 'Jun', revpar: 166, adr: 195, occupancy: 85 },
      { month: 'Jul', revpar: 172, adr: 195, occupancy: 88 },
      { month: 'Aug', revpar: 168, adr: 195, occupancy: 86 },
      { month: 'Sep', revpar: 154, adr: 195, occupancy: 79 },
      { month: 'Oct', revpar: 148, adr: 195, occupancy: 76 },
      { month: 'Nov', revpar: 140, adr: 195, occupancy: 72 },
      { month: 'Dec', revpar: 137, adr: 195, occupancy: 70 },
    ],
    demographics: {
      tripPurpose: [
        { name: 'Leisure', value: 65, color: '#06b6d4' },
        { name: 'Business', value: 25, color: '#8b5cf6' },
        { name: 'Events', value: 10, color: '#f59e0b' },
      ],
      groupSize: [
        { name: 'Solo', value: 20 },
        { name: 'Couple', value: 40 },
        { name: 'Family', value: 30 },
        { name: 'Group', value: 10 },
      ],
      lengthOfStay: [
        { range: '1-2', percentage: 28 },
        { range: '3-4', percentage: 35 },
        { range: '5-7', percentage: 25 },
        { range: '8-14', percentage: 8 },
        { range: '15+', percentage: 4 },
      ],
      avgStay: 4.2,
    },
    regulations: {
      strFriendly: true,
      permitRequired: true,
      summary: `${city} requires STR permits with a cap on non-owner-occupied rentals. Registration costs $285/year.`,
      timeline: [
        { date: '2024 Q1', event: 'New permit requirements introduced', impact: 'warning' },
        { date: '2024 Q2', event: 'Cap increased from 3,000 to 3,500', impact: 'positive' },
        { date: '2024 Q3', event: 'Streamlined application process', impact: 'positive' },
      ],
      keyRequirements: [
        'STR permit required ($285/year)',
        'Maximum 3,500 non-owner-occupied permits',
        'Type 1: Homestead (no cap)',
        'Type 2: Non-homestead (capped)',
        'Local contact required',
      ],
    },
    insights: [
      {
        icon: '🔥',
        title: 'Peak Season Performance',
        text: 'Summer months (Jun-Aug) show 88% avg occupancy, 18% above annual average. Consider premium pricing during this period.',
      },
      {
        icon: '📈',
        title: 'Strong ROI Potential',
        text: 'With 12.5% estimated ROI and $52K annual revenue, this market outperforms the national average by 3.2%.',
      },
      {
        icon: '🏘️',
        title: 'Supply Stabilizing',
        text: 'New listing growth has slowed to 0.1% monthly, indicating market maturity and reduced competition.',
      },
      {
        icon: '👥',
        title: 'Leisure-Driven Market',
        text: '65% leisure travelers with 4.2-night average stays suggest family-friendly amenities drive bookings.',
      },
    ],
  });

  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: Sparkles },
    { id: 'trends' as const, label: 'Market Trends', icon: BarChart3 },
    { id: 'demographics' as const, label: 'Demographics', icon: Users },
    { id: 'regulations' as const, label: 'Regulations', icon: Shield },
  ];

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/95 backdrop-blur-sm border border-white/10 rounded-lg p-3 shadow-xl">
          <p className="text-white/90 font-medium mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}{entry.unit || ''}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 flex items-center justify-center p-4"
        style={{ background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(8px)', zIndex: 9999 }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="w-full max-w-7xl max-h-[90vh] rounded-2xl overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.98) 100%)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div>
              <h2 className="text-3xl font-bold text-white mb-1" style={{ fontFamily: 'Inter Tight, sans-serif' }}>
                {city}, {state}
              </h2>
              <p className="text-white/50 text-sm">Deep Market Analysis</p>
            </div>
            
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all">
                <Download className="w-5 h-5" />
              </button>
              <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all">
                <Share2 className="w-5 h-5" />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 px-6 pt-4 border-b border-white/5">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="relative px-4 py-3 rounded-t-lg flex items-center gap-2 font-medium text-sm transition-all"
                  style={{
                    background: activeTab === tab.id 
                      ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.04) 100%)'
                      : 'transparent',
                    color: activeTab === tab.id ? '#fff' : 'rgba(255, 255, 255, 0.5)',
                  }}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500"
                      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Content */}
          <div className="overflow-y-auto p-6" style={{ maxHeight: 'calc(90vh - 200px)' }}>
            {loading || !data ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-white/50">Loading detailed data...</div>
              </div>
            ) : (
              <>
                {activeTab === 'overview' && <OverviewTab data={data} formatCurrency={formatCurrency} />}
                {activeTab === 'trends' && <TrendsTab data={data} CustomTooltip={CustomTooltip} />}
                {activeTab === 'demographics' && <DemographicsTab data={data} CustomTooltip={CustomTooltip} />}
                {activeTab === 'regulations' && <RegulationsTab data={data} />}
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Overview Tab Component
const OverviewTab: React.FC<{ data: any; formatCurrency: (v: number) => string }> = ({ data, formatCurrency }) => (
  <div className="space-y-6">
    {/* Key Metrics */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[
        { label: 'Overall Score', value: data.summary.overallScore, color: 'from-emerald-400 to-green-500', suffix: '/100' },
        { label: 'Avg Property Price', value: formatCurrency(data.summary.avgPropertyPrice), color: 'from-blue-400 to-cyan-500' },
        { label: 'Avg Nightly Rate', value: formatCurrency(data.summary.avgNightlyRate), color: 'from-purple-400 to-pink-500' },
        { label: 'Estimated ROI', value: `${data.summary.estimatedROI}%`, color: 'from-orange-400 to-red-500' },
      ].map((metric, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          className="rounded-xl p-5"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.02) 100%)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <div className="text-xs text-white/50 uppercase tracking-wider font-medium mb-2">{metric.label}</div>
          <div className={`text-3xl font-bold bg-gradient-to-r ${metric.color} bg-clip-text text-transparent`}>
            {metric.value}{metric.suffix || ''}
          </div>
        </motion.div>
      ))}
    </div>

    {/* AI Insights */}
    <div>
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-yellow-400" />
        <span>Key Insights</span>
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.insights.map((insight: any, idx: number) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + idx * 0.1 }}
            className="rounded-xl p-4"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <div className="flex items-start gap-3">
              <div className="text-2xl">{insight.icon}</div>
              <div className="flex-1">
                <h4 className="text-white font-semibold mb-1">{insight.title}</h4>
                <p className="text-white/60 text-sm">{insight.text}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </div>
);

// Trends Tab Component
const TrendsTab: React.FC<{ data: any; CustomTooltip: any }> = ({ data, CustomTooltip }) => (
  <div className="space-y-8">
    {/* Occupancy Trends */}
    <div>
      <h3 className="text-lg font-bold text-white mb-4">Occupancy Trends (12 Months)</h3>
      <div className="rounded-xl p-4" style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data.occupancyTrends}>
            <defs>
              <linearGradient id="occupancyGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" />
            <YAxis stroke="rgba(255,255,255,0.3)" />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="occupancy" stroke="#06b6d4" fillOpacity={1} fill="url(#occupancyGradient)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>

    {/* Rates by Property Type */}
    <div>
      <h3 className="text-lg font-bold text-white mb-4">Nightly Rates by Property Type</h3>
      <div className="rounded-xl p-4" style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.ratesByType}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="type" stroke="rgba(255,255,255,0.3)" />
            <YAxis stroke="rgba(255,255,255,0.3)" />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="rate" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>

    {/* RevPAR Trends */}
    <div>
      <h3 className="text-lg font-bold text-white mb-4">RevPAR & ADR Trends</h3>
      <div className="rounded-xl p-4" style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data.revparTrends}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" />
            <YAxis stroke="rgba(255,255,255,0.3)" />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line type="monotone" dataKey="revpar" stroke="#10b981" strokeWidth={2} name="RevPAR" />
            <Line type="monotone" dataKey="adr" stroke="#f59e0b" strokeWidth={2} name="ADR" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  </div>
);

// Demographics Tab Component
const DemographicsTab: React.FC<{ data: any; CustomTooltip: any }> = ({ data, CustomTooltip }) => (
  <div className="space-y-8">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Trip Purpose */}
      <div>
        <h3 className="text-lg font-bold text-white mb-4">Trip Purpose</h3>
        <div className="rounded-xl p-4" style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={data.demographics.tripPurpose}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name} ${value}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.demographics.tripPurpose.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Group Size */}
      <div>
        <h3 className="text-lg font-bold text-white mb-4">Group Size Distribution</h3>
        <div className="rounded-xl p-4" style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.demographics.groupSize}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" />
              <YAxis stroke="rgba(255,255,255,0.3)" />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" fill="#06b6d4" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>

    {/* Length of Stay */}
    <div>
      <h3 className="text-lg font-bold text-white mb-4">Length of Stay (Avg: {data.demographics.avgStay} nights)</h3>
      <div className="rounded-xl p-4" style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data.demographics.lengthOfStay}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="range" stroke="rgba(255,255,255,0.3)" />
            <YAxis stroke="rgba(255,255,255,0.3)" />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="percentage" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  </div>
);

// Regulations Tab Component
const RegulationsTab: React.FC<{ data: any }> = ({ data }) => (
  <div className="space-y-6">
    {/* Status Banner */}
    <div
      className="rounded-xl p-6"
      style={{
        background: data.regulations.strFriendly 
          ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)'
          : 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%)',
        border: `1px solid ${data.regulations.strFriendly ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
      }}
    >
      <div className="flex items-start gap-4">
        <div className={`text-3xl ${data.regulations.strFriendly ? 'text-emerald-400' : 'text-red-400'}`}>
          {data.regulations.strFriendly ? '✅' : '⚠️'}
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-white mb-2">
            {data.regulations.strFriendly ? 'STR-Friendly Market' : 'Regulated Market'}
          </h3>
          <p className="text-white/70">{data.regulations.summary}</p>
        </div>
      </div>
    </div>

    {/* Key Requirements */}
    <div>
      <h3 className="text-lg font-bold text-white mb-4">Key Requirements</h3>
      <div className="space-y-2">
        {data.regulations.keyRequirements.map((req: string, idx: number) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="rounded-lg p-4 flex items-center gap-3"
            style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.05)' }}
          >
            <div className="w-2 h-2 rounded-full bg-cyan-400" />
            <span className="text-white/80">{req}</span>
          </motion.div>
        ))}
      </div>
    </div>

    {/* Timeline */}
    <div>
      <h3 className="text-lg font-bold text-white mb-4">Recent Regulatory Changes</h3>
      <div className="space-y-3">
        {data.regulations.timeline.map((event: any, idx: number) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="rounded-lg p-4"
            style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.05)' }}
          >
            <div className="flex items-center gap-3">
              <div className={`px-2 py-1 rounded text-xs font-medium ${
                event.impact === 'positive' ? 'bg-emerald-500/20 text-emerald-400' :
                event.impact === 'warning' ? 'bg-amber-500/20 text-amber-400' :
                'bg-red-500/20 text-red-400'
              }`}>
                {event.date}
              </div>
              <div className="flex-1 text-white/80">{event.event}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </div>
);
