// FILE: src/components/portfolio/PortfolioDashboard.tsx
import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { usePortfolioStore } from '../../stores/portfolioStore';
import { PortfolioList } from './PortfolioList';
import { PortfolioForm } from './PortfolioForm';
import { PortfolioDetail } from './PortfolioDetail';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import type { PortfolioWithMetrics, CreatePortfolioForm } from '../../types/portfolio';

interface PortfolioDashboardProps {
  onPortfolioSelect?: (portfolio: PortfolioWithMetrics) => void;
}

export const PortfolioDashboard: React.FC<PortfolioDashboardProps> = ({
  onPortfolioSelect,
}) => {
  const { user } = useAuth();
  const {
    portfolios,
    loading,
    errors,
    fetchPortfolios,
    createPortfolio,
    updatePortfolio,
    deletePortfolio,
    setCurrentPortfolio,
  } = usePortfolioStore();

  const [portfoliosWithMetrics, setPortfoliosWithMetrics] = useState<PortfolioWithMetrics[]>([]);
  const [showPortfolioForm, setShowPortfolioForm] = useState(false);
  const [editingPortfolio, setEditingPortfolio] = useState<PortfolioWithMetrics | null>(null);
  const [selectedPortfolio, setSelectedPortfolio] = useState<PortfolioWithMetrics | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'detail' | 'analytics'>('list');

  useEffect(() => {
    if (user?.id || user?.email) {
      const userId = user.id || user.email || '';
      fetchPortfolios(userId);
    }
  }, [user, fetchPortfolios]);

  // Convert portfolios to PortfolioWithMetrics format
  useEffect(() => {
    setPortfoliosWithMetrics(
      portfolios.map((p) => ({
        ...p,
        property_count: 0,
        total_value: 0,
      }))
    );
  }, [portfolios]);

  const handlePortfolioClick = (portfolio: PortfolioWithMetrics) => {
    setCurrentPortfolio(portfolio);
    setSelectedPortfolio(portfolio);
    setViewMode('detail');
    if (onPortfolioSelect) {
      onPortfolioSelect(portfolio);
    }
  };

  const handleCreatePortfolio = () => {
    setEditingPortfolio(null);
    setShowPortfolioForm(true);
  };

  const handleEditPortfolio = (portfolio: PortfolioWithMetrics) => {
    setEditingPortfolio(portfolio);
    setShowPortfolioForm(true);
  };

  const handleSavePortfolio = async (formData: CreatePortfolioForm) => {
    const dataWithUser = {
      ...formData,
      user_id: user?.id || user?.email || '',
    };

    if (editingPortfolio) {
      await updatePortfolio(editingPortfolio.portfolio_id, dataWithUser);
    } else {
      await createPortfolio(dataWithUser);
    }
    setShowPortfolioForm(false);
    setEditingPortfolio(null);
    if (user?.id || user?.email) {
      const userId = user.id || user.email || '';
      fetchPortfolios(userId);
    }
  };



  const handleViewAnalytics = () => {
    setViewMode('analytics');
  };

  const handleViewProperties = () => {
    setViewMode('detail');
  };

  if (errors.portfolios) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-red-500 mb-2">Error loading portfolios</p>
        <p className="text-sm text-gray-500">{errors.portfolios}</p>
      </div>
    );
  }

  // Show portfolio detail view
  if (selectedPortfolio && viewMode === 'detail') {
    return (
      <>
        <PortfolioDetail
          portfolio={selectedPortfolio}
          onViewAnalytics={handleViewAnalytics}
        />
        <PortfolioForm
          isOpen={showPortfolioForm}
          onClose={() => {
            setShowPortfolioForm(false);
            setEditingPortfolio(null);
          }}
          onSubmit={handleSavePortfolio}
          initialData={editingPortfolio || undefined}
          mode={editingPortfolio ? 'edit' : 'create'}
        />
      </>
    );
  }

  // Show analytics view
  if (selectedPortfolio && viewMode === 'analytics') {
    return (
      <>
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-end mb-6">
            <div className="flex items-center gap-2">
              <button
                onClick={handleViewProperties}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Properties
              </button>
              <button
                onClick={handleViewAnalytics}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                Analytics
              </button>
            </div>
          </div>
          <AnalyticsDashboard portfolio={selectedPortfolio} />
        </div>
        <PortfolioForm
          isOpen={showPortfolioForm}
          onClose={() => {
            setShowPortfolioForm(false);
            setEditingPortfolio(null);
          }}
          onSubmit={handleSavePortfolio}
          initialData={editingPortfolio || undefined}
          mode={editingPortfolio ? 'edit' : 'create'}
        />
      </>
    );
  }

  // Show portfolio list view
  return (
    <>
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Portfolios</h1>
            <p className="text-sm text-gray-500 mt-1">Manage your real estate investment portfolios</p>
          </div>
          <button
            onClick={handleCreatePortfolio}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Portfolio
          </button>
        </div>

        <PortfolioList
          portfolios={portfoliosWithMetrics}
          onPortfolioClick={handlePortfolioClick}
          onEdit={handleEditPortfolio}
          onDelete={deletePortfolio}
          loading={loading.portfolios}
        />
      </div>

      <PortfolioForm
        isOpen={showPortfolioForm}
        onClose={() => {
          setShowPortfolioForm(false);
          setEditingPortfolio(null);
        }}
        onSubmit={handleSavePortfolio}
        initialData={editingPortfolio || undefined}
        mode={editingPortfolio ? 'edit' : 'create'}
      />
    </>
  );
};

