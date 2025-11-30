// FILE: src/components/portfolio/PortfolioList.tsx
import React from 'react';
import type { PortfolioWithMetrics } from '../../types/portfolio';
import { PortfolioCard } from './PortfolioCard';

interface PortfolioListProps {
  portfolios: PortfolioWithMetrics[];
  onPortfolioClick: (portfolio: PortfolioWithMetrics) => void;
  onEdit?: (portfolio: PortfolioWithMetrics) => void;
  onDelete?: (portfolioId: string) => void;
  loading?: boolean;
}

export const PortfolioList: React.FC<PortfolioListProps> = ({
  portfolios,
  onPortfolioClick,
  onEdit,
  onDelete,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Loading portfolios...</div>
      </div>
    );
  }

  if (portfolios.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-gray-500 mb-4">No portfolios yet</p>
        <p className="text-sm text-gray-400">Create your first portfolio to get started</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {portfolios.map((portfolio) => (
        <PortfolioCard
          key={portfolio.portfolio_id}
          portfolio={portfolio}
          onClick={() => onPortfolioClick(portfolio)}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

