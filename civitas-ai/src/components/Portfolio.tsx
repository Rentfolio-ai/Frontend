/**
 * Portfolio Component
 * Displays user's real estate portfolio with live data from backend
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Briefcase, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Home,
  RefreshCw,
  Plus,
  BarChart3,
  AlertCircle,
  Eye
} from 'lucide-react';
import { FlowCard } from './primitives/FlowCard';
import { 
  getPortfolios, 
  getPortfolioSummary, 
  createPortfolio,
  refreshPortfolio,
  type Portfolio,
  type PortfolioSummary 
} from '../services/agentsApi';

export function PortfolioPage() {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null);
  const [portfolioDetails, setPortfolioDetails] = useState<PortfolioSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Load portfolios on mount
  useEffect(() => {
    loadPortfolios();
  }, []);

  // Load portfolio details when one is selected
  useEffect(() => {
    if (selectedPortfolio) {
      loadPortfolioDetails(selectedPortfolio.id);
    }
  }, [selectedPortfolio]);

  async function loadPortfolios() {
    try {
      setLoading(true);
      setError(null);
      const response = await getPortfolios();
      setPortfolios(response.portfolios);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load portfolios');
    } finally {
      setLoading(false);
    }
  }

  async function loadPortfolioDetails(portfolioId: string) {
    try {
      setLoading(true);
      const response = await getPortfolioSummary(portfolioId);
      setPortfolioDetails(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load portfolio details');
    } finally {
      setLoading(false);
    }
  }

  async function handleRefresh() {
    if (!selectedPortfolio) return;
    
    try {
      setRefreshing(true);
      const response = await refreshPortfolio(selectedPortfolio.id);
      setPortfolioDetails(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh portfolio');
    } finally {
      setRefreshing(false);
    }
  }

  async function handleCreatePortfolio(name: string, description?: string) {
    try {
      const response = await createPortfolio({ name, description });
      setPortfolios([...portfolios, response.portfolio]);
      setShowCreateModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create portfolio');
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading && portfolios.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-cyan-500" />
          <p className="text-gray-400">Loading portfolios...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-semibold mb-2">Error</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={loadPortfolios}
            className="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-teal-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Briefcase className="w-8 h-8 text-cyan-400" />
            <h1 className="text-3xl font-bold text-white">Portfolio</h1>
          </div>
          
          {selectedPortfolio && (
            <div className="flex gap-2">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh Data
              </button>
              <button
                onClick={() => setSelectedPortfolio(null)}
                className="px-4 py-2 bg-gray-500/20 hover:bg-gray-500/30 rounded-lg transition-colors"
              >
                Back to Portfolios
              </button>
            </div>
          )}
        </div>

        {/* Portfolio Grid or Details */}
        {!selectedPortfolio ? (
          <>
            {/* Portfolio Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {portfolios.map((portfolio) => (
                <PortfolioCard
                  key={portfolio.id}
                  portfolio={portfolio}
                  onClick={() => setSelectedPortfolio(portfolio)}
                  formatCurrency={formatCurrency}
                />
              ))}
              
              {/* Create Portfolio Card */}
              <button
                onClick={() => setShowCreateModal(true)}
                className="p-6 rounded-xl bg-white/5 backdrop-blur border border-white/10 hover:bg-white/10 transition-all flex flex-col items-center justify-center gap-4 min-h-[200px]"
              >
                <Plus className="w-12 h-12 text-cyan-400" />
                <span className="text-white font-medium">Create Portfolio</span>
              </button>
            </div>

            {portfolios.length === 0 && (
              <div className="text-center py-12">
                <Briefcase className="w-16 h-16 mx-auto mb-4 text-gray-500" />
                <h3 className="text-xl font-semibold mb-2 text-white">No Portfolios Yet</h3>
                <p className="text-gray-400 mb-6">Create your first portfolio to start tracking your properties</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 rounded-lg transition-colors"
                >
                  Create Portfolio
                </button>
              </div>
            )}
          </>
        ) : (
          <PortfolioDetails
            portfolio={selectedPortfolio}
            details={portfolioDetails}
            loading={loading}
            formatCurrency={formatCurrency}
          />
        )}
      </div>

      {/* Create Portfolio Modal */}
      <CreatePortfolioModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreatePortfolio}
      />
    </div>
  );
}

// Portfolio Card Component - Now using FlowCard
function PortfolioCard({ 
  portfolio, 
  onClick, 
  formatCurrency 
}: { 
  portfolio: Portfolio; 
  onClick: () => void; 
  formatCurrency: (n: number) => string;
}) {
  const isPositive = portfolio.totalROI >= 0;

  return (
    <div onClick={onClick}>
      <FlowCard
        title={portfolio.name}
        subtitle={portfolio.description}
        icon={<Briefcase className="w-5 h-5" />}
        metric={{
          value: formatCurrency(portfolio.totalValue),
          label: 'Total Value',
          color: 'blue'
        }}
        preview={
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-2 rounded-lg bg-white/[0.02]">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Home className="w-3 h-3 text-white/40" />
                <span className="text-sm font-semibold text-white">{portfolio.propertyCount}</span>
              </div>
              <div className="text-[10px] text-white/40 uppercase tracking-wider">Properties</div>
            </div>
            <div className="text-center p-2 rounded-lg bg-white/[0.02]">
              <div className={`flex items-center justify-center gap-1 mb-1 ${
                isPositive ? 'text-emerald-400' : 'text-red-400'
              }`}>
                {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                <span className="text-sm font-semibold">{portfolio.totalROI.toFixed(1)}%</span>
              </div>
              <div className="text-[10px] text-white/40 uppercase tracking-wider">ROI</div>
            </div>
          </div>
        }
        className="cursor-pointer hover-lift"
      />
    </div>
  );
}

// Portfolio Details Component
function PortfolioDetails({ 
  portfolio, 
  details, 
  loading,
  formatCurrency 
}: { 
  portfolio: Portfolio;
  details: PortfolioSummary | null;
  loading: boolean;
  formatCurrency: (n: number) => string;
}) {
  if (loading || !details) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-8 h-8 animate-spin text-cyan-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          icon={<DollarSign className="w-6 h-6" />}
          label="Total Value"
          value={formatCurrency(portfolio.totalValue)}
          color="cyan"
        />
        <MetricCard
          icon={<Home className="w-6 h-6" />}
          label="Properties"
          value={portfolio.propertyCount.toString()}
          color="blue"
        />
        <MetricCard
          icon={<TrendingUp className="w-6 h-6" />}
          label="Monthly Cash Flow"
          value={formatCurrency(portfolio.monthlyCashFlow)}
          color="green"
        />
        <MetricCard
          icon={<BarChart3 className="w-6 h-6" />}
          label="Total ROI"
          value={`${portfolio.totalROI.toFixed(1)}%`}
          color="purple"
        />
      </div>

      {/* Properties List */}
      <div className="bg-white/5 backdrop-blur rounded-xl border border-white/10 p-6">
        <h2 className="text-xl font-semibold mb-4 text-white">Properties</h2>
        <div className="space-y-3">
          {details.properties.map((property) => (
            <PropertyCard key={property.id} property={property} formatCurrency={formatCurrency} />
          ))}
        </div>
      </div>

      {/* AI Insights */}
      {details.insights.length > 0 && (
        <div className="bg-white/5 backdrop-blur rounded-xl border border-white/10 p-6">
          <h2 className="text-xl font-semibold mb-4 text-white">AI Insights</h2>
          <div className="space-y-3">
            {details.insights.map((insight) => (
              <InsightCard key={insight.id} insight={insight} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Metric Card Component
function MetricCard({ icon, label, value, color }: { 
  icon: React.ReactNode; 
  label: string; 
  value: string;
  color: string;
}) {
  const colorClasses = {
    cyan: 'text-cyan-400',
    blue: 'text-blue-400',
    green: 'text-green-400',
    purple: 'text-purple-400',
  }[color];

  return (
    <div className="p-4 rounded-lg bg-white/5 backdrop-blur border border-white/10">
      <div className={`${colorClasses} mb-2`}>{icon}</div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      <div className="text-sm text-gray-400">{label}</div>
    </div>
  );
}

// Property Card Component
function PropertyCard({ property, formatCurrency }: any) {
  return (
    <div className="p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-white">{property.address}</h3>
          <p className="text-sm text-gray-400">{property.city}, {property.state}</p>
        </div>
        <div className="text-right">
          <div className="text-lg font-semibold text-cyan-400">{formatCurrency(property.currentValue)}</div>
          <div className={`text-sm ${property.roi > 0 ? 'text-green-400' : 'text-red-400'}`}>
            ROI: {property.roi.toFixed(1)}%
          </div>
        </div>
      </div>
    </div>
  );
}

// Insight Card Component
function InsightCard({ insight }: any) {
  const priorityColors = {
    high: 'border-red-500/50 bg-red-500/10',
    medium: 'border-yellow-500/50 bg-yellow-500/10',
    low: 'border-blue-500/50 bg-blue-500/10',
  };

  return (
    <div className={`p-4 rounded-lg border ${priorityColors[insight.priority]}`}>
      <h4 className="font-semibold text-white mb-1">{insight.title}</h4>
      <p className="text-sm text-gray-300">{insight.description}</p>
    </div>
  );
}

// Create Portfolio Modal
function CreatePortfolioModal({ isOpen, onClose, onCreate }: any) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate(name, description);
    setName('');
    setDescription('');
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-900 rounded-xl p-6 max-w-md w-full mx-4 border border-white/10"
      >
        <h2 className="text-2xl font-bold mb-4 text-white">Create Portfolio</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">Description (Optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white"
              rows={3}
            />
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-500/20 hover:bg-gray-500/30 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 rounded-lg transition-colors"
            >
              Create
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
