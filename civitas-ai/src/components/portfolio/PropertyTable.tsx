// FILE: src/components/portfolio/PropertyTable.tsx
import React from 'react';
import { Edit, Trash2, Plus } from 'lucide-react';
import type { PortfolioProperty } from '../../types/portfolio';
import { formatCurrency, formatPercentage, formatDate } from '../../utils/portfolioHelpers';

interface PropertyTableProps {
  properties: PortfolioProperty[];
  onEdit?: (property: PortfolioProperty) => void;
  onDelete?: (propertyId: string) => void;
  onAdd?: () => void;
  loading?: boolean;
}

export const PropertyTable: React.FC<PropertyTableProps> = ({
  properties,
  onEdit,
  onDelete,
  onAdd,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Loading properties...</div>
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-gray-500 mb-4">No properties yet</p>
        {onAdd && (
          <button
            onClick={onAdd}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Property
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Address</th>
            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Purchase Price</th>
            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Monthly Rent</th>
            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Cashflow</th>
            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Cap Rate</th>
            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">ROI</th>
            <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {properties.map((property) => {
            const monthlyCashflow =
              property.financials.monthly_rent - property.financials.monthly_expenses.total;
            const capRate = property.metrics?.cap_rate || 0;
            const roi = property.metrics?.roi || 0;

            return (
              <tr
                key={property.property_id}
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <td className="py-4 px-4">
                  <div>
                    <p className="font-medium text-gray-900">{property.address}</p>
                    {property.city && property.state && (
                      <p className="text-sm text-gray-500">
                        {property.city}, {property.state}
                      </p>
                    )}
                  </div>
                </td>
                <td className="py-4 px-4 text-right text-gray-900">
                  {formatCurrency(property.financials.purchase_price)}
                </td>
                <td className="py-4 px-4 text-right text-gray-900">
                  {formatCurrency(property.financials.monthly_rent)}
                </td>
                <td
                  className={`py-4 px-4 text-right font-medium ${
                    monthlyCashflow >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {formatCurrency(monthlyCashflow)}
                </td>
                <td className="py-4 px-4 text-right text-gray-900">
                  {formatPercentage(capRate)}
                </td>
                <td className="py-4 px-4 text-right text-gray-900">
                  {formatPercentage(roi)}
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center justify-center gap-2">
                    {onEdit && (
                      <button
                        onClick={() => onEdit(property)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Edit property"
                      >
                        <Edit className="w-4 h-4 text-gray-600" />
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(property.property_id)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete property"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

