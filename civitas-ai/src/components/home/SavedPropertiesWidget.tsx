import React from 'react';
import { Bookmark, ArrowRight } from 'lucide-react';
import type { BookmarkedProperty } from '../../types/bookmarks';
import { HomePanelEmptyState } from '../EmptyStates';

interface SavedPropertiesWidgetProps {
  bookmarks: BookmarkedProperty[];
  onViewAll: () => void;
}

function formatPrice(price?: number): string {
  if (!price) return '--';
  if (price >= 1000000) return `$${(price / 1000000).toFixed(1)}M`;
  return `$${(price / 1000).toFixed(0)}K`;
}

export const SavedPropertiesWidget: React.FC<SavedPropertiesWidgetProps> = ({ bookmarks, onViewAll }) => {
  const visible = bookmarks.slice(0, 4);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/50">Saved Properties</h3>
        <button onClick={onViewAll} className="inline-flex items-center gap-1 text-[11px] text-[#C08B5C] font-medium hover:text-[#D4A27F]">
          View all <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {visible.length === 0 ? (
        <HomePanelEmptyState
          icon={<Bookmark className="w-4 h-4" />}
          title="No saved properties"
          description="Save properties from deals to compare them here."
          actionLabel="Browse deals"
          onAction={onViewAll}
        />
      ) : (
        <div className="rounded-xl bg-black/[0.02] border border-black/[0.04] divide-y divide-black/[0.04]">
          {visible.map((bm) => {
            const prop = bm.property;
            return (
              <div key={bm.id} className="flex items-center gap-3 px-4 py-3 hover:bg-black/[0.02]">
                <Bookmark className="w-4 h-4 text-[#C08B5C]/40 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] text-foreground/80 truncate">
                    {prop?.address || bm.searchQuery || 'Property'}
                  </div>
                  <div className="text-[10px] text-muted-foreground/50">
                    {prop?.city && prop?.state ? `${prop.city}, ${prop.state}` : 'Location unavailable'}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-[14px] font-semibold text-foreground/85 font-mono">
                    {formatPrice(prop?.price)}
                  </span>
                  {prop?.cash_on_cash_roi && (
                    <span className="text-[10px] font-mono text-emerald-400/80 bg-emerald-500/[0.08] px-1.5 py-0.5 rounded-full">
                      {prop.cash_on_cash_roi.toFixed(1)}%
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
