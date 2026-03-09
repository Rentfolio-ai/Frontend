// FILE: src/components/portfolio/PortfolioDashboard.tsx
import React, { useState, useEffect } from 'react';
import { Plus, Home, TrendingUp, DollarSign, Calendar } from 'lucide-react';
import type { Portfolio, PortfolioSummary } from '../../services/agentsApi';
import { formatCurrency, formatPercentage } from '../../utils/portfolioHelpers';
import { getPortfolios, getPortfolioSummary } from '../../services/agentsApi';

export const PortfolioDashboard: React.FC = () => {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState<string | null>(null);
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load portfolios on mount
  useEffect(() => {
    loadPortfolios();
  }, []);

  // Load summary when portfolio selected
  useEffect(() => {
    if (selectedPortfolio) {
      loadPortfolioSummary(selectedPortfolio);
    }
  }, [selectedPortfolio]);

  const loadPortfolios = async () => {
    try {
      setLoading(true);
      const response = await getPortfolios();
      
      // Safely handle response
      const portfolioList = response?.portfolios || [];
      setPortfolios(portfolioList);
      
      // Auto-select first portfolio if available
      if (portfolioList.length > 0 && !selectedPortfolio) {
        setSelectedPortfolio(portfolioList[0].id);
      }
      
      setError(null);
    } catch (err) {
      console.error('Failed to load portfolios:', err);
      setError('Failed to load portfolios');
      setPortfolios([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const loadPortfolioSummary = async (portfolioId: string) => {
    try {
      const response = await getPortfolioSummary(portfolioId);
      setSummary(response?.data || null);
      setError(null);
    } catch (err) {
      console.error('Failed to load portfolio summary:', err);
      setError('Failed to load portfolio details');
      setSummary(null); // Clear summary on error
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading portfolios...</p>
        </div>
      </div>
    );
  }

  if (error && portfolios.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={loadPortfolios}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (portfolios.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center max-w-lg px-6">
          <Home className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Start Tracking Your Properties</h2>
          <p className="text-muted-foreground mb-6">
            Tell me about your properties in chat. I'll help you track, analyze, and optimize your investments.
          </p>
          
          {/* Single CTA: Go to Chat */}
          <button
            onClick={() => {
              // Navigate to chat tab
              window.dispatchEvent(new CustomEvent('navigate-to-tab', { 
                detail: { tab: 'chat' } 
              }));
            }}
            className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center justify-center gap-2 text-base font-medium"
          >
            Go to Chat to Add Properties
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-card">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-card border-b border-gray-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Portfolio</h1>
            <p className="text-muted-foreground text-sm mt-1">Track and manage your investments</p>
          </div>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Property
          </button>
        </div>

        {/* Portfolio Selector */}
        {portfolios.length > 1 && (
          <div className="mt-4 flex gap-2 overflow-x-auto">
            {portfolios.map((portfolio) => (
              <button
                key={portfolio.id}
                onClick={() => setSelectedPortfolio(portfolio.id)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  selectedPortfolio === portfolio.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-muted text-muted-foreground hover:bg-gray-700'
                }`}
              >
                {portfolio.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {summary ? (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                icon={<Home className="w-5 h-5" />}
                label="Properties"
                value={(summary.properties?.length || 0).toString()}
                color="blue"
              />
              <MetricCard
                icon={<DollarSign className="w-5 h-5" />}
                label="Total Equity"
                value={formatCurrency(summary.performanceMetrics.totalEquity)}
                color="green"
              />
              <MetricCard
                icon={<TrendingUp className="w-5 h-5" />}
                label="Avg Monthly Cash Flow"
                value={formatCurrency(summary.performanceMetrics.averageCashFlow)}
                color={summary.performanceMetrics.averageCashFlow >= 0 ? 'green' : 'red'}
              />
              <MetricCard
                icon={<Calendar className="w-5 h-5" />}
                label="Avg ROI"
                value={formatPercentage(summary.performanceMetrics.averageROI)}
                color="purple"
              />
            </div>

            {/* Properties List */}
            <div className="bg-muted rounded-lg border border-border">
              <div className="px-6 py-4 border-b border-border">
                <h2 className="text-lg font-semibold text-foreground">Properties</h2>
              </div>
              <div className="divide-y divide-gray-700">
                {summary.properties && summary.properties.length > 0 ? (
                  summary.properties.map((property) => (
                    <PropertyRow key={property.id} property={property} />
                  ))
                ) : (
                  <div className="px-6 py-8 text-center text-muted-foreground">
                    No properties yet. Add your first property to get started.
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>
    </div>
  );
};

// Metric Card Component
interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: 'blue' | 'green' | 'red' | 'purple';
}

const MetricCard: React.FC<MetricCardProps> = ({ icon, label, value, color }) => {
  const colorClasses = {
    blue: 'bg-blue-500/10 text-blue-400',
    green: 'bg-green-500/10 text-green-400',
    red: 'bg-red-500/10 text-red-400',
    purple: 'bg-purple-500/10 text-purple-400',
  };

  return (
    <div className="bg-muted rounded-lg border border-border p-4">
      <div className={`inline-flex p-2 rounded-lg ${colorClasses[color]} mb-3`}>
        {icon}
      </div>
      <div className="text-2xl font-bold text-foreground mb-1">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
};

// Property Row Component
interface PropertyRowProps {
  property: any;
}

const PropertyRow: React.FC<PropertyRowProps> = ({ property }) => {
  const cashFlow = (property.monthlyRent || 0) - (property.monthlyExpenses || 0);
  
  return (
    <div className="px-6 py-4 hover:bg-gray-750 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-foreground font-medium">{property.address}</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {property.city && property.state ? `${property.city}, ${property.state}` : 'Location not specified'}
          </p>
        </div>
        <div className="flex items-center gap-6 text-sm">
          <div className="text-right">
            <div className="text-muted-foreground">Purchase Price</div>
            <div className="text-foreground font-medium">{formatCurrency(property.purchasePrice)}</div>
          </div>
          <div className="text-right">
            <div className="text-muted-foreground">Current Value</div>
            <div className="text-foreground font-medium">
              {formatCurrency(property.currentValue || property.purchasePrice)}
            </div>
          </div>
          <div className="text-right">
            <div className="text-muted-foreground">Monthly Cash Flow</div>
            <div className={`font-medium ${cashFlow >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatCurrency(cashFlow)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
