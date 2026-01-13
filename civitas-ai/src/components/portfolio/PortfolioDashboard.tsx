// FILE: src/components/portfolio/PortfolioDashboard.tsx
/**
 * Redesigned Portfolio Dashboard with modern SaaS aesthetic
 * Integrates HeroMetrics, AIInsightsRibbon, PropertyCard components
 */

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  Plus,
  RefreshCw,
  Upload,
  Building2,
  ChevronDown,
  Search,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { usePortfolioStore } from '../../stores/portfolioStore';
import { portfolioAPI } from '../../services/portfolioApi';

// New redesigned components
import { HeroMetrics } from './HeroMetrics';
import { AIInsightsRibbon } from './AIInsightsRibbon';
import { PropertyCard } from './PropertyCard';

// Existing components
import { PortfolioForm } from './PortfolioForm';
import { PropertyForm } from './PropertyForm';
import { SmartImportDialog } from './SmartImportDialog';
import { QuickAddProperty } from './QuickAddProperty';

import type {
  PortfolioWithMetrics,
  OptimizationPlan,
  PortfolioAlert,
  InvestorProfile,
  PortfolioProperty,
} from '../../types/portfolio';

export const PortfolioDashboard: React.FC = () => {
  const { user } = useAuth();
  const { fetchPortfolios, createPortfolio, portfolios, fetchProperties, properties } = usePortfolioStore();

  // UI State
  const [showPortfolioForm, setShowPortfolioForm] = useState(false);
  const [showPropertyForm, setShowPropertyForm] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showPortfolioDropdown, setShowPortfolioDropdown] = useState(false);

  // AI Data State
  const [optimizationPlan, setOptimizationPlan] = useState<OptimizationPlan | null>(null);
  const [portfolioAlerts, setPortfolioAlerts] = useState<PortfolioAlert[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const userId = user?.id || user?.email || '';

  // Fetch portfolios on mount
  useEffect(() => {
    if (userId) {
      fetchPortfolios(userId);
    }
  }, [userId, fetchPortfolios]);

  // Select first portfolio by default
  useEffect(() => {
    if (portfolios.length > 0 && !selectedPortfolioId) {
      setSelectedPortfolioId(portfolios[0].portfolio_id);
    }
  }, [portfolios, selectedPortfolioId]);

  // Fetch properties when portfolio selected
  useEffect(() => {
    if (selectedPortfolioId) {
      fetchProperties(selectedPortfolioId);
    }
  }, [selectedPortfolioId, fetchProperties]);

  // Fetch AI data when portfolio selected
  const fetchAIData = useCallback(async () => {
    if (!selectedPortfolioId || !userId) return;

    // Fetch Optimization
    try {
      const profile: InvestorProfile = {
        risk_tolerance: 'moderate',
        target_markets: [],
        preferred_strategies: [],
        cash_flow_goal_monthly: 5000,
        portfolio_value_goal: 1000000,
        time_horizon_years: 10,
        available_capital: 0,
      };
      const plan = await portfolioAPI.getOptimizationPlan(selectedPortfolioId, userId, profile);
      setOptimizationPlan(plan);
    } catch (error) {
      console.error('Failed to fetch optimization:', error);
    }

    // Fetch Alerts
    try {
      const alertsResponse = await portfolioAPI.getPortfolioAlerts(selectedPortfolioId, userId);
      setPortfolioAlerts(alertsResponse.alerts);
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
    }
  }, [selectedPortfolioId, userId]);

  useEffect(() => {
    fetchAIData();
  }, [fetchAIData]);

  // Filter properties by search
  const filteredProperties = useMemo(() => {
    if (!searchQuery) return properties;
    const q = searchQuery.toLowerCase();
    return properties.filter((p: PortfolioProperty) =>
      p.address.toLowerCase().includes(q) ||
      (p.city || '').toLowerCase().includes(q)
    );
  }, [properties, searchQuery]);

  // Get selected portfolio
  const selectedPortfolio = portfolios.find(
    (p) => p.portfolio_id === selectedPortfolioId
  ) as PortfolioWithMetrics | undefined;

  // Calculate portfolio metrics
  const portfolioMetrics = useMemo(() => {
    if (!properties || properties.length === 0 || !selectedPortfolio) {
      return {
        totalValue: 0,
        monthlyIncome: 0,
        roi: 0,
        equity: 0
      };
    }

    const totalValue = properties.reduce((sum, p) =>
      sum + (p.financials?.current_value || p.financials?.purchase_price || 0), 0
    );

    const monthlyIncome = properties.reduce((sum, p) =>
      sum + ((p.financials?.monthly_rent || 0) - (p.financials?.monthly_expenses?.total || 0)), 0
    );

    const equity = properties.reduce((sum, p) => {
      const value = p.financials?.current_value || p.financials?.purchase_price || 0;
      const loanBalance = (p.financials as any)?.loan_balance || 0;
      return sum + (value - loanBalance);
    }, 0);

    const avgROI = (selectedPortfolio.metrics as any)?.roi_12_month || 8.2;

    return {
      totalValue,
      monthlyIncome,
      roi: avgROI * 100,
      equity
    };
  }, [properties, selectedPortfolio]);

  // Convert alerts/recommendations to AI insights
  const aiInsightsData = useMemo(() => {
    const insights: Array<{ text: string; severity: 'info' | 'warning' | 'success' }> = [];

    // Add alerts as warnings
    portfolioAlerts.slice(0, 2).forEach(alert => {
      insights.push({
        text: (alert as any).message || 'Portfolio alert',
        severity: (alert as any).severity === 'critical' ? 'warning' : 'info'
      });
    });

    // Add optimization recommendations
    if (optimizationPlan?.recommendations) {
      optimizationPlan.recommendations.slice(0, 3 - insights.length).forEach(rec => {
        insights.push({
          text: rec.description,
          severity: rec.priority === 'high' ? 'warning' : 'info'
        });
      });
    }

    return insights;
  }, [portfolioAlerts, optimizationPlan]);

  const handleCreatePortfolio = () => setShowPortfolioForm(true);

  const handleSavePortfolio = async (formData: any) => {
    const dataWithUser = { ...formData, user_id: userId };
    await createPortfolio(dataWithUser);
    setShowPortfolioForm(false);
    fetchPortfolios(userId);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    if (selectedPortfolioId) {
      await fetchProperties(selectedPortfolioId);
      await fetchAIData();
    }
    setRefreshing(false);
  };

  const handleImportComplete = () => {
    if (selectedPortfolioId) {
      fetchProperties(selectedPortfolioId);
    }
  };

  const handleAskAI = (_propertyId: string, address: string) => {
    // TODO: Integrate with chat - open chat with pre-filled query
    console.log(`Ask AI about property: ${address}`);
  };

  // Empty state
  if (portfolios.length === 0) {
    return (
      <div
        className="h-full min-h-screen w-full flex flex-col"
        style={{
          background: 'var(--color-bg-primary)',
          fontFamily: "'Inter', sans-serif"
        }}
      >
        {/* Subtle gradient overlay */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: 'radial-gradient(circle at 50% 30%, rgba(20, 184, 166, 0.15), transparent 50%)'
          }}
        />

        {/* Content */}
        <div className="relative flex-1 flex items-center justify-center px-6">
          <div className="text-center max-w-md">
            {/* Icon */}
            <div
              className="w-16 h-16 mx-auto mb-6 rounded-xl flex items-center justify-center"
              style={{
                background: 'var(--color-accent-teal-500)',
                boxShadow: '0 4px 16px rgba(20, 184, 166, 0.3)'
              }}
            >
              <Building2 className="w-8 h-8" style={{ color: 'var(--color-bg-primary)' }} />
            </div>

            {/* Title */}
            <h2
              className="text-2xl font-medium mb-3"
              style={{
                color: 'var(--color-text-primary)',
                fontWeight: 500
              }}
            >
              Start Your Portfolio
            </h2>

            {/* Description */}
            <p
              className="mb-8 leading-relaxed"
              style={{
                color: 'var(--color-text-secondary)',
                fontSize: '15px'
              }}
            >
              Create your first portfolio to track properties, analyze performance, and get AI-powered insights.
            </p>

            {/* CTA Button */}
            <button
              onClick={handleCreatePortfolio}
              className="px-6 py-3 rounded-lg font-medium transition-all inline-flex items-center gap-2"
              style={{
                background: 'var(--color-accent-teal-500)',
                color: 'var(--color-bg-primary)',
                fontSize: '15px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--color-accent-teal-400)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--color-accent-teal-500)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <Plus className="w-5 h-5" />
              Create Portfolio
            </button>
          </div>
        </div>

        {/* Modal */}
        {showPortfolioForm && (
          <PortfolioForm
            isOpen={showPortfolioForm}
            onClose={() => setShowPortfolioForm(false)}
            onSubmit={handleSavePortfolio}
          />
        )}
      </div>
    );
  }

  return (
    <div
      className="h-full min-h-screen w-full overflow-x-hidden"
      style={{
        background: 'var(--color-bg-primary)',
        fontFamily: "'Inter', sans-serif"
      }}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-30 backdrop-blur-xl"
        style={{
          background: 'rgba(10, 14, 26, 0.8)',
          borderBottom: '1px solid var(--color-border-default)'
        }}
      >
        <div className="px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Portfolio Selector */}
            <div className="flex items-center gap-4">
              <h1
                className="text-xl font-medium"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Portfolio
              </h1>

              {/* Portfolio Selector */}
              <div className="relative">
                <button
                  onClick={() => setShowPortfolioDropdown(!showPortfolioDropdown)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all"
                  style={{
                    background: 'var(--color-bg-elevated)',
                    border: '1px solid var(--color-border-default)'
                  }}
                >
                  <Building2 className="w-4 h-4" style={{ color: 'var(--color-accent-teal-400)' }} />
                  <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
                    {selectedPortfolio?.name || 'Select Portfolio'}
                  </span>
                  <ChevronDown className="w-4 h-4" style={{ color: 'var(--color-text-tertiary)' }} />
                </button>

                {showPortfolioDropdown && (
                  <div
                    className="absolute top-full left-0 mt-2 w-64 rounded-xl py-2 z-50"
                    style={{
                      background: 'var(--color-bg-elevated)',
                      border: '1px solid var(--color-border-default)'
                    }}
                  >
                    {portfolios.map((p) => (
                      <button
                        key={p.portfolio_id}
                        onClick={() => {
                          setSelectedPortfolioId(p.portfolio_id);
                          setShowPortfolioDropdown(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm transition-all"
                        style={{
                          color: p.portfolio_id === selectedPortfolioId
                            ? 'var(--color-accent-teal-400)'
                            : 'var(--color-text-secondary)',
                          background: p.portfolio_id === selectedPortfolioId
                            ? 'rgba(20, 184, 166, 0.1)'
                            : 'transparent'
                        }}
                      >
                        <div className="font-medium">{p.name}</div>
                        <div className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                          {properties.length} properties
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                className={`p-2 rounded-lg transition-all ${refreshing ? 'animate-spin' : ''}`}
                style={{
                  color: 'var(--color-text-tertiary)',
                  background: 'var(--color-bg-elevated)',
                  border: '1px solid var(--color-border-default)'
                }}
                title="Refresh data"
              >
                <RefreshCw className="w-5 h-5" />
              </button>

              <button
                onClick={() => setShowImportDialog(true)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all"
                style={{
                  color: 'var(--color-text-secondary)',
                  background: 'var(--color-bg-elevated)',
                  border: '1px solid var(--color-border-default)'
                }}
              >
                <Upload className="w-4 h-4" />
                <span className="hidden sm:inline text-sm">Import</span>
              </button>

              <button
                onClick={() => setShowQuickAdd(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all"
                style={{
                  background: 'var(--gradient-brand)',
                  color: 'var(--color-bg-primary)'
                }}
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add Property</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 lg:px-8 py-6 space-y-6 pb-20">
        {/* Hero Metrics */}
        <HeroMetrics
          portfolioValue={portfolioMetrics.totalValue}
          monthlyIncome={portfolioMetrics.monthlyIncome}
          roi={portfolioMetrics.roi}
          equity={portfolioMetrics.equity}
        />

        {/* AI Insights */}
        {aiInsightsData.length > 0 && (
          <AIInsightsRibbon
            insights={aiInsightsData}
            onInsightClick={(insight) => {
              // TODO: Open chat with insight as context
              console.log('Open chat with insight:', insight);
            }}
          />
        )}

        {/* Properties Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2
              className="text-xl font-medium"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Properties
            </h2>
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                  style={{ color: 'var(--color-text-tertiary)' }}
                />
                <input
                  type="text"
                  placeholder="Search properties..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 rounded-lg text-sm w-48"
                  style={{
                    background: 'var(--color-bg-elevated)',
                    border: '1px solid var(--color-border-default)',
                    color: 'var(--color-text-primary)'
                  }}
                />
              </div>
              <span className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                {filteredProperties.length} total
              </span>
            </div>
          </div>

          {/* Property Grid */}
          {filteredProperties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProperties.map((property: PortfolioProperty) => {
                const cashFlow = (property.financials?.monthly_rent || 0) - (property.financials?.monthly_expenses?.total || 0);
                const occupancy = 85; // TODO: Get from property data
                const roi = (property.metrics?.roi || 0) * 100;
                const capRate = (property.metrics?.cap_rate || 0) * 100;

                return (
                  <PropertyCard
                    key={property.property_id}
                    id={property.property_id}
                    address={property.address}
                    city={property.city || 'Unknown'}
                    state={property.state || ''}
                    imageUrl={undefined} // TODO: Add property images
                    metrics={{ cashFlow, occupancy, roi, capRate }}
                    type={(property as any).strategy === 'STR' ? 'STR' : 'LTR'}
                    onViewDetails={(id) => console.log('View:', id)}
                    onAskAI={handleAskAI}
                  />
                );
              })}
            </div>
          ) : (
            <div
              className="text-center py-24 rounded-lg"
              style={{ background: 'var(--color-bg-tertiary)' }}
            >
              <Building2 className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--color-text-tertiary)' }} />
              <h3
                className="text-lg font-medium mb-2"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {searchQuery ? 'No properties found' : 'No properties yet'}
              </h3>
              <p
                className="text-sm mb-4"
                style={{ color: 'var(--color-text-tertiary)' }}
              >
                {searchQuery ? 'Try a different search term' : 'Add your first property to start tracking'}
              </p>
              {!searchQuery && (
                <button
                  onClick={() => setShowQuickAdd(true)}
                  className="px-4 py-2 rounded-lg font-medium transition-all"
                  style={{
                    background: 'var(--gradient-brand)',
                    color: 'var(--color-bg-primary)'
                  }}
                >
                  <Plus className="w-4 h-4 inline-block mr-2" />
                  Add Property
                </button>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      {showPortfolioForm && (
        <PortfolioForm
          isOpen={showPortfolioForm}
          onClose={() => setShowPortfolioForm(false)}
          onSubmit={handleSavePortfolio}
        />
      )}

      {showPropertyForm && (
        <PropertyForm
          isOpen={showPropertyForm}
          onClose={() => setShowPropertyForm(false)}
          onSubmit={async (propertyData) => {
            console.log('Add property:', propertyData);
            if (selectedPortfolioId) {
              await fetchProperties(selectedPortfolioId);
            }
          }}
        />
      )}

      <QuickAddProperty
        isOpen={showQuickAdd}
        onClose={() => setShowQuickAdd(false)}
        onSubmit={async (propertyData) => {
          console.log('Quick add property:', propertyData);
          if (selectedPortfolioId) {
            await fetchProperties(selectedPortfolioId);
          }
        }}
        onSwitchToFull={() => {
          setShowQuickAdd(false);
          setShowPropertyForm(true);
        }}
      />

      {selectedPortfolioId && (
        <SmartImportDialog
          isOpen={showImportDialog}
          onClose={() => setShowImportDialog(false)}
          portfolioId={selectedPortfolioId}
          userId={userId}
          onImportComplete={handleImportComplete}
        />
      )}
    </div>
  );
};

export default PortfolioDashboard;
