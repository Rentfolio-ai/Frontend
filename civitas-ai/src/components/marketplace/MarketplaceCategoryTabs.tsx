import React from 'react';
import type { ProfessionalCategory } from './marketplaceData';
import { CATEGORY_LABELS } from './marketplaceData';

export type CategoryFilter = 'featured' | ProfessionalCategory;

const TABS: { key: CategoryFilter; label: string }[] = [
  { key: 'featured', label: 'Featured' },
  { key: 'real_estate_agent', label: CATEGORY_LABELS.real_estate_agent },
  { key: 'lender', label: CATEGORY_LABELS.lender },
  { key: 'contractor', label: CATEGORY_LABELS.contractor },
  { key: 'inspector', label: CATEGORY_LABELS.inspector },
  { key: 'property_manager', label: CATEGORY_LABELS.property_manager },
];

interface MarketplaceCategoryTabsProps {
  active: CategoryFilter;
  onChange: (tab: CategoryFilter) => void;
  counts?: Partial<Record<CategoryFilter, number>>;
  isSticky?: boolean;
}

export const MarketplaceCategoryTabs: React.FC<MarketplaceCategoryTabsProps> = ({
  active,
  onChange,
  counts,
  isSticky = false,
}) => (
  <div
    className={`flex gap-1.5 px-1 py-2 overflow-x-auto transition-colors ${
      isSticky ? 'bg-background/80 backdrop-blur-md' : ''
    }`}
    style={{ scrollbarWidth: 'none' }}
  >
    {TABS.map(tab => {
      const count = counts?.[tab.key];
      return (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={`rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors duration-150 whitespace-nowrap flex items-center gap-1.5 ${
            active === tab.key
              ? 'bg-black/[0.06] text-foreground'
              : 'text-muted-foreground/70 hover:text-foreground/70 hover:bg-black/[0.03]'
          }`}
        >
          {tab.label}
          {count != null && count > 0 && (
            <span className={`text-[11px] ${
              active === tab.key ? 'text-muted-foreground/70' : 'text-muted-foreground/40'
            }`}>
              {count}
            </span>
          )}
        </button>
      );
    })}
  </div>
);
