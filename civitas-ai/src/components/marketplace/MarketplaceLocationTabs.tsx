import React from 'react';
import { MapPin } from 'lucide-react';

export interface LocationOption {
  key: string;
  label: string;
  count: number;
}

interface MarketplaceLocationTabsProps {
  locations: LocationOption[];
  active: string;
  onChange: (key: string) => void;
}

export const MarketplaceLocationTabs: React.FC<MarketplaceLocationTabsProps> = ({
  locations,
  active,
  onChange,
}) => {
  if (locations.length <= 1) return null;

  const total = locations.reduce((sum, l) => sum + l.count, 0);

  return (
    <div
      className="flex items-center gap-1 overflow-x-auto py-1"
      style={{ scrollbarWidth: 'none' }}
    >
      <MapPin className="w-3 h-3 text-white/20 flex-shrink-0 mr-0.5" />

      <button
        onClick={() => onChange('all')}
        className={`rounded-full px-3 py-1 text-[11px] font-medium transition-colors duration-150 whitespace-nowrap flex items-center gap-1 ${
          active === 'all'
            ? 'bg-white/[0.08] text-white/80'
            : 'text-white/35 hover:text-white/60 hover:bg-white/[0.04]'
        }`}
      >
        All
        <span className={`text-[10px] ${active === 'all' ? 'text-white/35' : 'text-white/15'}`}>
          {total}
        </span>
      </button>

      {locations.map(loc => (
        <button
          key={loc.key}
          onClick={() => onChange(loc.key)}
          className={`rounded-full px-3 py-1 text-[11px] font-medium transition-colors duration-150 whitespace-nowrap flex items-center gap-1 ${
            active === loc.key
              ? 'bg-white/[0.08] text-white/80'
              : 'text-white/35 hover:text-white/60 hover:bg-white/[0.04]'
          }`}
        >
          {loc.label}
          <span className={`text-[10px] ${active === loc.key ? 'text-white/35' : 'text-white/15'}`}>
            {loc.count}
          </span>
        </button>
      ))}
    </div>
  );
};
