import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import type { PortfolioWithMetrics } from '../../types/portfolio';
import { formatCurrency, formatPercentage } from '../../utils/portfolioHelpers';

interface PortfolioCardProps {
  portfolio: PortfolioWithMetrics;
  onClick: () => void;
  onEdit?: (portfolio: PortfolioWithMetrics) => void;
  onDelete?: (portfolioId: string) => void;
}

export const PortfolioCard: React.FC<PortfolioCardProps> = ({
  portfolio,
  onClick,
  onEdit,
  onDelete,
}) => {
  return (
    <div
      onClick={onClick}
      className="cursor-pointer rounded-xl border border-primary/25 bg-white/50 backdrop-blur-sm p-6 shadow-lg transition-all hover:shadow-xl hover:scale-[1.02] group relative"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 mr-4">
          <h3 className="text-xl font-semibold text-gray-900 mb-1">{portfolio.name}</h3>
          {portfolio.description && (
            <p className="text-sm text-gray-600 line-clamp-2">{portfolio.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {portfolio.is_active ? (
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
              Active
            </span>
          ) : (
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
              Inactive
            </span>
          )}
          {(onEdit || onDelete) && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {onEdit && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(portfolio);
                  }}
                  className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-primary transition-colors"
                  title="Edit Portfolio"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(portfolio.portfolio_id);
                  }}
                  className="p-1.5 hover:bg-red-50 rounded-lg text-gray-500 hover:text-red-600 transition-colors"
                  title="Delete Portfolio"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {portfolio.metrics && (
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <p className="text-xs text-gray-500 mb-1">Total Value</p>
            <p className="text-lg font-semibold text-gray-900">
              {formatCurrency(portfolio.metrics.total_portfolio_value)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Monthly Cashflow</p>
            <p
              className={`text-lg font-semibold ${portfolio.metrics.total_monthly_cashflow >= 0
                ? 'text-green-600'
                : 'text-red-600'
                }`}
            >
              {formatCurrency(portfolio.metrics.total_monthly_cashflow)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">ROI</p>
            <p className="text-lg font-semibold text-gray-900">
              {formatPercentage(portfolio.metrics.total_roi)}
            </p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {portfolio.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 text-xs font-medium rounded bg-primary/10 text-primary"
            >
              {tag}
            </span>
          ))}
        </div>
        {portfolio.property_count !== undefined && (
          <p className="text-sm text-gray-500">
            {portfolio.property_count} {portfolio.property_count === 1 ? 'property' : 'properties'}
          </p>
        )}
      </div>
    </div>
  );
};

