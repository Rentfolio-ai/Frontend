// FILE: src/components/portfolio/PortfolioDetail.tsx
import React, { useEffect, useState } from 'react';
import { ArrowLeft, Plus, Upload, Download, BarChart3 } from 'lucide-react';
import { usePortfolioStore } from '../../stores/portfolioStore';
import { PropertyTable } from './PropertyTable';
import { PropertyForm } from './PropertyForm';
import { ImportDialog } from './ImportDialog';
import type { PortfolioWithMetrics, PortfolioProperty, AddPropertyForm } from '../../types/portfolio';
import { formatCurrency, formatPercentage } from '../../utils/portfolioHelpers';

interface PortfolioDetailProps {
  portfolio: PortfolioWithMetrics;
  onBack: () => void;
  onViewAnalytics?: () => void;
}

export const PortfolioDetail: React.FC<PortfolioDetailProps> = ({
  portfolio,
  onBack,
  onViewAnalytics,
}) => {
  const {
    properties,
    loading,
    fetchProperties,
    addProperty,
    updateProperty,
    removeProperty,
    importProperties,
    fetchImportStatus,
    fetchAnalytics,
    analytics,
  } = usePortfolioStore();

  const [showPropertyForm, setShowPropertyForm] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [editingProperty, setEditingProperty] = useState<PortfolioProperty | null>(null);

  useEffect(() => {
    fetchProperties(portfolio.portfolio_id);
    fetchAnalytics(portfolio.portfolio_id);
  }, [portfolio.portfolio_id, fetchProperties, fetchAnalytics]);

  const handleAddProperty = async (propertyData: AddPropertyForm) => {
    await addProperty(portfolio.portfolio_id, propertyData);
    setShowPropertyForm(false);
    fetchProperties(portfolio.portfolio_id);
    fetchAnalytics(portfolio.portfolio_id);
  };

  const handleEditProperty = async (propertyData: AddPropertyForm) => {
    if (editingProperty) {
      await updateProperty(portfolio.portfolio_id, editingProperty.property_id, propertyData);
      setEditingProperty(null);
      setShowPropertyForm(false);
      fetchProperties(portfolio.portfolio_id);
      fetchAnalytics(portfolio.portfolio_id);
    }
  };

  const handleDeleteProperty = async (propertyId: string) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      await removeProperty(portfolio.portfolio_id, propertyId);
      fetchProperties(portfolio.portfolio_id);
      fetchAnalytics(portfolio.portfolio_id);
    }
  };

  const handleImport = async (file: File) => {
    return await importProperties(portfolio.portfolio_id, file);
  };

  const handlePollStatus = async (jobId: string) => {
    return await fetchImportStatus(portfolio.portfolio_id, jobId);
  };

  const handleImportComplete = () => {
    fetchProperties(portfolio.portfolio_id);
    fetchAnalytics(portfolio.portfolio_id);
  };

  const handleExport = async () => {
    // TODO: Implement export functionality
    console.log('Export portfolio:', portfolio.portfolio_id);
  };

  const metrics = analytics.metrics || portfolio.metrics;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{portfolio.name}</h1>
            {portfolio.description && (
              <p className="text-sm text-gray-500 mt-1">{portfolio.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {onViewAnalytics && (
            <button
              onClick={onViewAnalytics}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <BarChart3 className="w-4 h-4" />
              Analytics
            </button>
          )}
          <button
            onClick={() => setShowImportDialog(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Upload className="w-4 h-4" />
            Import
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={() => {
              setEditingProperty(null);
              setShowPropertyForm(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Property
          </button>
        </div>
      </div>

      {/* Metrics */}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-500 mb-1">Total Value</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(metrics.total_portfolio_value)}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-500 mb-1">Monthly Cashflow</p>
            <p
              className={`text-2xl font-bold ${
                metrics.total_monthly_cashflow >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {formatCurrency(metrics.total_monthly_cashflow)}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-500 mb-1">Average Cap Rate</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatPercentage(metrics.average_cap_rate)}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-500 mb-1">Total ROI</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatPercentage(metrics.total_roi)}
            </p>
          </div>
        </div>
      )}

      {/* Properties Table */}
      <div className="flex-1 bg-white rounded-lg border border-gray-200 p-6 overflow-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Properties</h2>
          <span className="text-sm text-gray-500">
            {properties.length} {properties.length === 1 ? 'property' : 'properties'}
          </span>
        </div>
        <PropertyTable
          properties={properties}
          onEdit={(property) => {
            setEditingProperty(property);
            setShowPropertyForm(true);
          }}
          onDelete={handleDeleteProperty}
          onAdd={() => {
            setEditingProperty(null);
            setShowPropertyForm(true);
          }}
          loading={loading.properties}
        />
      </div>

      {/* Property Form Modal */}
      <PropertyForm
        isOpen={showPropertyForm}
        onClose={() => {
          setShowPropertyForm(false);
          setEditingProperty(null);
        }}
        onSubmit={editingProperty ? handleEditProperty : handleAddProperty}
        initialData={editingProperty || undefined}
        mode={editingProperty ? 'edit' : 'create'}
      />

      {/* Import Dialog */}
      <ImportDialog
        isOpen={showImportDialog}
        onClose={() => setShowImportDialog(false)}
        onImport={handleImport}
        onPollStatus={handlePollStatus}
        portfolioId={portfolio.portfolio_id}
        onImportComplete={handleImportComplete}
      />
    </div>
  );
};

