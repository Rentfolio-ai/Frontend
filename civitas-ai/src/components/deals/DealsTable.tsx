import React, { useState } from 'react';
import { ChevronUp, ChevronDown, Bookmark, Star, ExternalLink, CircleDot, Sparkles } from 'lucide-react';
import type { ScoutedProperty } from '../../types/backendTools';
import type { DealStatus } from '../../types/bookmarks';

type SortKey = 'address' | 'city' | 'price' | 'capRate' | 'cashFlow' | 'score' | 'status';
type SortDir = 'asc' | 'desc';

interface DealsTableProps {
  properties: ScoutedProperty[];
  onViewProperty: (property: ScoutedProperty) => void;
  onAnalyzeProperty: (property: ScoutedProperty) => void;
  onBookmarkProperty: (property: ScoutedProperty) => void;
  bookmarkedIds: Set<string>;
  dealStatuses?: Map<string, DealStatus>;
  onStatusChange?: (property: ScoutedProperty, bookmarkId: string, status: DealStatus) => void;
  bookmarkIdMap?: Map<string, string>;
}

const STATUS_BADGE: Record<DealStatus, { label: string; className: string }> = {
  active: { label: 'Active', className: 'text-emerald-400 bg-emerald-500/[0.08] border-emerald-500/10' },
  under_contract: { label: 'Contract', className: 'text-amber-400 bg-amber-500/[0.08] border-amber-500/10' },
  closed: { label: 'Closed', className: 'text-blue-400 bg-blue-500/[0.08] border-blue-500/10' },
  lost: { label: 'Lost', className: 'text-red-400 bg-red-500/[0.08] border-red-500/10' },
};

function getCapRate(p: ScoutedProperty): number {
  if (p.cash_on_cash_roi) return p.cash_on_cash_roi;
  if (p.financial_snapshot?.estimated_rent && p.price) {
    return ((p.financial_snapshot.estimated_rent * 12) / p.price) * 100;
  }
  return 0;
}

function getCashFlow(p: ScoutedProperty): number {
  return p.financial_snapshot?.estimated_monthly_cash_flow || 0;
}

function getScore(p: ScoutedProperty): number {
  return p.value_score || 0;
}

function formatPrice(price: number): string {
  if (price >= 1000000) return `$${(price / 1000000).toFixed(1)}M`;
  return `$${(price / 1000).toFixed(0)}K`;
}

function scoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-400 bg-emerald-500/[0.08] border border-emerald-500/10';
  if (score >= 60) return 'text-amber-400 bg-amber-500/[0.08] border border-amber-500/10';
  return 'text-red-400 bg-red-500/[0.08] border border-red-500/10';
}

const STATUS_ORDER: Record<DealStatus, number> = { active: 0, under_contract: 1, closed: 2, lost: 3 };

const COLUMNS: { key: SortKey; label: string; align?: string }[] = [
  { key: 'address', label: 'Address' },
  { key: 'city', label: 'City / State' },
  { key: 'price', label: 'Price', align: 'text-right' },
  { key: 'capRate', label: 'Cap Rate', align: 'text-right' },
  { key: 'cashFlow', label: 'Cash Flow', align: 'text-right' },
  { key: 'score', label: 'AI Score', align: 'text-center' },
  { key: 'status', label: 'Status', align: 'text-center' },
];

export const DealsTable: React.FC<DealsTableProps> = ({
  properties, onViewProperty, onAnalyzeProperty, onBookmarkProperty, bookmarkedIds,
  dealStatuses, onStatusChange, bookmarkIdMap,
}) => {
  const [sortKey, setSortKey] = useState<SortKey>('score');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const sorted = [...properties].sort((a, b) => {
    let aVal: number | string = 0;
    let bVal: number | string = 0;
    switch (sortKey) {
      case 'address': aVal = a.address; bVal = b.address; break;
      case 'city': aVal = `${a.city} ${a.state}`; bVal = `${b.city} ${b.state}`; break;
      case 'price': aVal = a.price; bVal = b.price; break;
      case 'capRate': aVal = getCapRate(a); bVal = getCapRate(b); break;
      case 'cashFlow': aVal = getCashFlow(a); bVal = getCashFlow(b); break;
      case 'score': aVal = getScore(a); bVal = getScore(b); break;
      case 'status': {
        const sa = dealStatuses?.get(a.listing_id) || 'active';
        const sb = dealStatuses?.get(b.listing_id) || 'active';
        aVal = STATUS_ORDER[sa]; bVal = STATUS_ORDER[sb]; break;
      }
    }
    const cmp = typeof aVal === 'string' ? aVal.localeCompare(bVal as string) : (aVal as number) - (bVal as number);
    return sortDir === 'asc' ? cmp : -cmp;
  });

  return (
    <div className="rounded-lg bg-white/[0.03] border border-white/[0.05] overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="bg-white/[0.02]">
            {COLUMNS.map(col => (
              <th
                key={col.key}
                onClick={() => handleSort(col.key)}
                className={`px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest cursor-pointer select-none ${
                  sortKey === col.key ? 'text-white/50' : 'text-white/20'
                } ${col.align || 'text-left'}`}
              >
                <span className="inline-flex items-center gap-1">
                  {col.label}
                  {sortKey === col.key && (
                    sortDir === 'asc' ? <ChevronUp className="w-2.5 h-2.5" /> : <ChevronDown className="w-2.5 h-2.5" />
                  )}
                </span>
              </th>
            ))}
            <th className="px-3 py-2.5 w-24" />
          </tr>
        </thead>
        <tbody>
          {sorted.map((property) => {
            const isBookmarked = bookmarkedIds.has(property.listing_id);
            const score = getScore(property);
            const status: DealStatus = dealStatuses?.get(property.listing_id) || 'active';
            const badge = STATUS_BADGE[status];
            const bmId = bookmarkIdMap?.get(property.listing_id);

            return (
              <tr
                key={property.listing_id}
                onClick={() => onViewProperty(property)}
                className="border-b border-white/[0.04] hover:bg-white/[0.02] cursor-pointer last:border-b-0"
              >
                <td className="px-3 py-2.5">
                  <div className="text-[12px] text-white/65 font-medium truncate max-w-[200px]">
                    {property.address}
                  </div>
                </td>
                <td className="px-3 py-2.5">
                  <div className="text-[11px] text-white/40 font-medium">{property.city}, {property.state}</div>
                </td>
                <td className="px-3 py-2.5 text-right">
                  <div className="text-[12px] font-mono font-semibold text-white/85">{formatPrice(property.price)}</div>
                </td>
                <td className="px-3 py-2.5 text-right">
                  <div className="text-[11px] font-mono text-white/45">{getCapRate(property).toFixed(1)}%</div>
                </td>
                <td className="px-3 py-2.5 text-right">
                  <div className="text-[11px] font-mono text-white/45">${getCashFlow(property).toLocaleString()}</div>
                </td>
                <td className="px-3 py-2.5 text-center">
                  {score > 0 ? (
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold ${scoreColor(score)}`}>
                      {score}
                    </span>
                  ) : (
                    <span className="text-[9px] text-white/15">--</span>
                  )}
                </td>
                <td className="px-3 py-2.5 text-center">
                  {bmId ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onStatusChange && bmId) {
                          const nextStatus: DealStatus =
                            status === 'active' ? 'under_contract'
                            : status === 'under_contract' ? 'closed'
                            : status;
                          if (nextStatus !== status) onStatusChange(property, bmId, nextStatus);
                        }
                      }}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[9px] font-bold hover:brightness-125 ${badge.className}`}
                      title={status === 'closed' || status === 'lost' ? badge.label : `Click to advance status`}
                    >
                      <CircleDot className="w-2.5 h-2.5" />
                      {badge.label}
                    </button>
                  ) : (
                    <span className="text-[9px] text-white/10">—</span>
                  )}
                </td>
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-0.5">
                    <button
                      onClick={(e) => { e.stopPropagation(); onBookmarkProperty(property); }}
                      className="p-1 rounded hover:bg-white/[0.06]"
                      title={isBookmarked ? 'Remove bookmark' : 'Bookmark'}
                    >
                      {isBookmarked ? (
                        <Star className="w-3 h-3 text-[#C08B5C] fill-[#C08B5C]" />
                      ) : (
                        <Bookmark className="w-3 h-3 text-white/25" />
                      )}
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onAnalyzeProperty(property); }}
                      className="flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-semibold text-[#C08B5C] hover:bg-[#C08B5C]/[0.08]"
                      title="Run through Hunter AI deal pipeline"
                    >
                      <Sparkles className="w-3 h-3" />
                      Analyze with AI
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onViewProperty(property); }}
                      className="p-1 rounded hover:bg-white/[0.06]"
                      title="View details"
                    >
                      <ExternalLink className="w-3 h-3 text-white/25" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {sorted.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-10 h-10 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-2.5">
            <Star className="w-4 h-4 text-white/15" />
          </div>
          <div className="text-[12px] font-medium text-white/35">No properties found</div>
          <div className="text-[10px] text-white/20 mt-0.5">Try adjusting your search or filters</div>
        </div>
      )}
    </div>
  );
};
