import React from 'react';
import type { InvestmentStrategy } from '../../../types/pnl';
import type { ScoutedProperty } from '../../../types/backendTools';
import type { BookmarkedProperty } from '../../../types/bookmarks';
import { PropertyActionButtons } from './PropertyActionButtons';

interface SimplePropertyCardProps {
  property: any;
  onOpenDealAnalyzer?: (propertyId: string | null, strategy: InvestmentStrategy, purchasePrice?: number, propertyAddress?: string) => void;
  onToggleBookmark?: (property: ScoutedProperty) => void;
  onViewDetails?: (property: any) => void;
  bookmarks?: BookmarkedProperty[];
}

export const SimplePropertyCard: React.FC<SimplePropertyCardProps> = ({
  property,
  onOpenDealAnalyzer,
  onToggleBookmark,
  onViewDetails,
  bookmarks = []
}) => {
  // Calculate estimated monthly rent and cash flow
  const estimatedRent = property.estimated_rent || (property.price * 0.008);
  const estimatedMortgage = property.price ? (property.price * 0.8 * 0.006) : 0;
  const monthlyCashFlow = estimatedRent - estimatedMortgage - 500;

  const isPositiveCashFlow = monthlyCashFlow > 0;

  // Calculate cap rate if we have data
  const capRate = property.price && estimatedRent
    ? (((estimatedRent * 12) * 0.6) / property.price * 100).toFixed(1)
    : null;

  return (
    <div className="group relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-5 shadow-xl shadow-black/40 hover:shadow-2xl hover:shadow-purple-500/30 transition-all duration-300 transform hover:scale-[1.02] border border-slate-700/50 overflow-hidden w-[320px] min-w-[320px]">
      {/* Floating glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-transparent to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

      {/* Content wrapper */}
      <div className="relative z-10">
        {/* Top badges row */}
        <div className="flex justify-between items-start mb-4">
          {/* Rank Badge */}
          {property.rank && property.rank <= 3 && (
            <div className="bg-gradient-to-r from-yellow-500 to-amber-500 text-slate-900 text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg">
              #{property.rank}
            </div>
          )}

          {/* AI Score Badge */}
          {property.ai_score && (
            <div className="ml-auto bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg">
              ⭐ {property.ai_score.toFixed(0)}/150
            </div>
          )}
        </div>

        {/* Property Image */}
        {property.image_url && (
          <div className="mb-3 rounded-xl overflow-hidden border border-slate-700/50">
            <img
              src={property.image_url}
              alt={property.address}
              className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}

        {/* Price */}
        <div className="mb-3">
          <div className="text-2xl font-bold text-white mb-0.5">
            ${property.price?.toLocaleString() || 'N/A'}
          </div>
          <div className="text-xs text-slate-400">
            ~${Math.round(estimatedMortgage).toLocaleString()}/mo mortgage
          </div>
        </div>

        {/* Address */}
        <div className="mb-3 pb-3 border-b border-slate-700/30">
          <div className="text-white font-medium text-sm mb-0.5">
            {property.address}
          </div>
          <div className="text-slate-400 text-xs">
            {property.city}, {property.state} {property.zip_code || property.zip || ''}
          </div>
        </div>

        {/* Amenities Grid - Compact */}
        <div className="grid grid-cols-3 gap-2 mb-3 pb-3 border-b border-slate-700/30">
          {property.beds && (
            <div className="text-center">
              <div className="text-xs text-slate-500 mb-0.5">Beds</div>
              <div className="text-white font-semibold">{property.beds}</div>
            </div>
          )}
          {property.baths && (
            <div className="text-center">
              <div className="text-xs text-slate-500 mb-0.5">Baths</div>
              <div className="text-white font-semibold">{property.baths}</div>
            </div>
          )}
          {property.sqft && (
            <div className="text-center">
              <div className="text-xs text-slate-500 mb-0.5">SqFt</div>
              <div className="text-white font-semibold text-sm">{property.sqft.toLocaleString()}</div>
            </div>
          )}
        </div>

        {/* Additional Amenities - Compact */}
        <div className="grid grid-cols-2 gap-1.5 mb-3 pb-3 border-b border-slate-700/30 text-xs">
          {property.year_built && (
            <div className="flex items-center gap-1 text-slate-300">
              <span className="text-slate-500">📅</span>
              <span>{property.year_built}</span>
            </div>
          )}
          {property.lot_size && (
            <div className="flex items-center gap-1 text-slate-300">
              <span className="text-slate-500">🏞️</span>
              <span>{property.lot_size.toLocaleString()}ac</span>
            </div>
          )}
          {property.property_type && (
            <div className="flex items-center gap-1 text-slate-300">
              <span className="text-slate-500">🏠</span>
              <span>{property.property_type}</span>
            </div>
          )}
          {property.hoa_monthly && property.hoa_monthly > 0 && (
            <div className="flex items-center gap-1 text-slate-300">
              <span className="text-slate-500">🏘️</span>
              <span>${property.hoa_monthly}/mo</span>
            </div>
          )}
          {property.days_on_market && (
            <div className="flex items-center gap-1 text-slate-300">
              <span className="text-slate-500">⏱️</span>
              <span>{property.days_on_market}d</span>
            </div>
          )}
          {property.listing_status && (
            <div className="flex items-center gap-1 text-slate-300">
              <span className="text-slate-500">📊</span>
              <span>{property.listing_status}</span>
            </div>
          )}
        </div>

        {/* Investment Metrics - Compact */}
        <div className="space-y-1.5 mb-3">
          <div className="flex justify-between items-center bg-slate-800/30 rounded-lg px-2.5 py-1.5">
            <span className="text-slate-400 text-xs">Est. Rent</span>
            <span className="font-bold text-emerald-400 text-xs">
              ${Math.round(estimatedRent).toLocaleString()}/mo
            </span>
          </div>
          <div className="flex justify-between items-center bg-slate-800/30 rounded-lg px-2.5 py-1.5">
            <span className="text-slate-400 text-xs">Cash Flow</span>
            <span className={`font-bold text-xs ${isPositiveCashFlow ? 'text-emerald-400' : 'text-red-400'}`}>
              {isPositiveCashFlow ? '+' : ''}${Math.round(monthlyCashFlow).toLocaleString()}/mo
            </span>
          </div>
          {capRate && (
            <div className="flex justify-between items-center bg-slate-800/30 rounded-lg px-2.5 py-1.5">
              <span className="text-slate-400 text-xs">Cap Rate</span>
              <span className="font-bold text-blue-400 text-xs">{capRate}%</span>
            </div>
          )}
        </div>
        
        {/* Action Buttons Row */}
        <div className="mb-2 flex justify-center">
          <PropertyActionButtons
            property={property}
            bookmarks={bookmarks}
            onToggleBookmark={onToggleBookmark}
            onViewDetails={onViewDetails}
            size="sm"
          />
        </div>

        {/* Analyze Button - Thin and sleek */}
        <button
          onClick={() => onOpenDealAnalyzer?.(
            property.id || property.listing_id || property.zpid || null,
            'LTR',
            property.price,
            property.address
          )}
          className="w-full py-1.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-xs font-medium rounded-lg transition-all duration-200 border border-purple-500/30 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40"
        >
          Analyze Deal →
        </button>
      </div>
    </div>
  );
};
