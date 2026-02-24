// FILE: src/components/explore/ExploreFilterBar.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
  Search, ChevronDown, SlidersHorizontal, X, RotateCcw,
} from 'lucide-react';
import type { ExploreFilters, SortOption } from '../../hooks/usePropertyExplore';

// ============================================================================
// Sub-components
// ============================================================================

interface DropdownProps {
  label: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  hasValue?: boolean;
}

const FilterDropdown: React.FC<DropdownProps> = ({ label, isOpen, onToggle, children, hasValue }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (isOpen && ref.current && !ref.current.contains(e.target as Node)) onToggle();
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [isOpen, onToggle]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={onToggle}
        className={`
          flex items-center gap-1.5 px-3 py-2 rounded-lg text-[13px] font-medium
          transition-all duration-150 border
          ${hasValue
            ? 'bg-white/[0.10] text-white/80 border-white/[0.10]'
            : 'bg-transparent text-white/50 border-white/[0.06] hover:bg-white/[0.04] hover:text-white/70'
          }
        `}
      >
        <span>{label}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1.5 z-50 min-w-[220px] rounded-xl bg-[#1E1D24] border border-white/[0.08] shadow-xl shadow-black/40 p-3">
          {children}
        </div>
      )}
    </div>
  );
};

interface PillProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

const Pill: React.FC<PillProps> = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`
      px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all duration-150
      ${active
        ? 'bg-white/[0.10] text-white/80'
        : 'bg-white/[0.03] text-white/40 hover:bg-white/[0.06] hover:text-white/60'
      }
    `}
  >
    {label}
  </button>
);

interface SliderInputProps {
  label: string;
  value: number | null;
  onChange: (v: number | null) => void;
  min: number;
  max: number;
  step: number;
  format?: (v: number) => string;
  suffix?: string;
}

const SliderInput: React.FC<SliderInputProps> = ({ label, value, onChange, min, max, step, format, suffix }) => (
  <div className="flex flex-col gap-1.5">
    <div className="flex items-center justify-between">
      <span className="text-[11px] text-white/40 font-medium">{label}</span>
      <span className="text-[11px] text-white/60 font-mono">
        {value != null ? (format ? format(value) : `${value}${suffix || ''}`) : 'Any'}
      </span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value ?? min}
      onChange={e => {
        const v = Number(e.target.value);
        onChange(v === min ? null : v);
      }}
      className="w-full h-1 appearance-none rounded-full bg-white/[0.08] cursor-pointer
        [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5
        [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white/70 [&::-webkit-slider-thumb]:border-2
        [&::-webkit-slider-thumb]:border-[#1E1D24] [&::-webkit-slider-thumb]:shadow-md
        [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:rounded-full
        [&::-moz-range-thumb]:bg-white/70 [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#1E1D24]"
    />
  </div>
);

// ============================================================================
// Presets
// ============================================================================

const PRICE_PRESETS = [
  { label: 'Any', min: null, max: null },
  { label: 'Under $200K', min: null, max: 200000 },
  { label: '$200K–$400K', min: 200000, max: 400000 },
  { label: '$400K–$600K', min: 400000, max: 600000 },
  { label: '$600K–$1M', min: 600000, max: 1000000 },
  { label: '$1M+', min: 1000000, max: null },
];

const BEDS_OPTIONS = ['Any', '1+', '2+', '3+', '4+', '5+'];
const BATHS_OPTIONS = ['Any', '1+', '2+', '3+'];
const TYPE_OPTIONS = ['All', 'SFH', 'Condo', 'Townhouse', 'Multi-Family'];

const SORT_OPTIONS: Array<{ label: string; value: SortOption }> = [
  { label: 'Price: Low → High', value: 'price_low' },
  { label: 'Price: High → Low', value: 'price_high' },
  { label: 'Cap Rate', value: 'cap_rate' },
  { label: 'Cash Flow', value: 'cash_flow' },
  { label: 'Largest', value: 'sqft' },
  { label: 'Newest', value: 'newest' },
];

// ============================================================================
// Main Component
// ============================================================================

interface ExploreFilterBarProps {
  filters: ExploreFilters;
  onUpdateFilter: <K extends keyof ExploreFilters>(key: K, value: ExploreFilters[K]) => void;
  onSearch: () => void;
  onReset: () => void;
  isLoading: boolean;
  totalFound: number;
}

export const ExploreFilterBar: React.FC<ExploreFilterBarProps> = ({
  filters,
  onUpdateFilter,
  onSearch,
  onReset,
  isLoading,
  totalFound,
}) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const toggle = (name: string) => setOpenDropdown(prev => (prev === name ? null : name));

  const handleLocationKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSearch();
    }
  };

  const getActivePrice = () => {
    if (filters.minPrice == null && filters.maxPrice == null) return 'Price';
    const min = filters.minPrice ? `$${(filters.minPrice / 1000).toFixed(0)}K` : '';
    const max = filters.maxPrice ? `$${(filters.maxPrice / 1000).toFixed(0)}K` : '';
    if (min && max) return `${min}–${max}`;
    if (min) return `${min}+`;
    return `Up to ${max}`;
  };

  const getActiveBeds = () => (filters.minBeds ? `${filters.minBeds}+ Beds` : 'Beds');
  const getActiveBaths = () => (filters.minBaths ? `${filters.minBaths}+ Baths` : 'Baths');
  const getActiveType = () => (filters.propertyTypes.length === 1 ? filters.propertyTypes[0] : filters.propertyTypes.length > 1 ? `${filters.propertyTypes.length} Types` : 'Type');

  const hasActiveFilters = filters.minPrice != null || filters.maxPrice != null
    || filters.minBeds != null || filters.minBaths != null
    || filters.propertyTypes.length > 0
    || filters.minCapRate != null || filters.minCashFlow != null
    || filters.minCocRoi != null || filters.minSqft != null;

  return (
    <div className="flex-shrink-0 bg-[#171719] border-b border-white/[0.06] shadow-[0_2px_8px_rgba(0,0,0,0.3)] relative z-10">
      {/* Main filter row */}
      <div className="flex items-center gap-2 px-4 py-3">
        {/* Location search */}
        <div className="relative flex-shrink-0 w-[260px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
          <input
            type="text"
            value={filters.location}
            onChange={e => onUpdateFilter('location', e.target.value)}
            onKeyDown={handleLocationKeyDown}
            placeholder="City, state, or zip code..."
            className="w-full pl-10 pr-3 py-2 rounded-lg text-[13px] text-white/90 placeholder-white/25
              bg-white/[0.04] border border-white/[0.06] focus:border-white/[0.12] focus:outline-none
              transition-colors duration-150"
          />
          {isLoading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-white/[0.06] mx-0.5" />

        {/* Quick filter dropdowns */}
        <FilterDropdown
          label={getActivePrice()}
          isOpen={openDropdown === 'price'}
          onToggle={() => toggle('price')}
          hasValue={filters.minPrice != null || filters.maxPrice != null}
        >
          <div className="flex flex-col gap-1">
            {PRICE_PRESETS.map(p => (
              <button
                key={p.label}
                onClick={() => {
                  onUpdateFilter('minPrice', p.min);
                  onUpdateFilter('maxPrice', p.max);
                  setOpenDropdown(null);
                }}
                className={`px-3 py-2 rounded-lg text-[12px] text-left transition-colors duration-150
                  ${filters.minPrice === p.min && filters.maxPrice === p.max
                    ? 'bg-white/[0.10] text-white/80'
                    : 'text-white/50 hover:bg-white/[0.05] hover:text-white/70'
                  }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </FilterDropdown>

        <FilterDropdown
          label={getActiveBeds()}
          isOpen={openDropdown === 'beds'}
          onToggle={() => toggle('beds')}
          hasValue={filters.minBeds != null}
        >
          <div className="flex flex-wrap gap-1.5">
            {BEDS_OPTIONS.map(b => (
              <Pill
                key={b}
                label={b}
                active={b === 'Any' ? filters.minBeds == null : filters.minBeds === parseInt(b)}
                onClick={() => {
                  onUpdateFilter('minBeds', b === 'Any' ? null : parseInt(b));
                  setOpenDropdown(null);
                }}
              />
            ))}
          </div>
        </FilterDropdown>

        <FilterDropdown
          label={getActiveBaths()}
          isOpen={openDropdown === 'baths'}
          onToggle={() => toggle('baths')}
          hasValue={filters.minBaths != null}
        >
          <div className="flex flex-wrap gap-1.5">
            {BATHS_OPTIONS.map(b => (
              <Pill
                key={b}
                label={b}
                active={b === 'Any' ? filters.minBaths == null : filters.minBaths === parseInt(b)}
                onClick={() => {
                  onUpdateFilter('minBaths', b === 'Any' ? null : parseInt(b));
                  setOpenDropdown(null);
                }}
              />
            ))}
          </div>
        </FilterDropdown>

        <FilterDropdown
          label={getActiveType()}
          isOpen={openDropdown === 'type'}
          onToggle={() => toggle('type')}
          hasValue={filters.propertyTypes.length > 0}
        >
          <div className="flex flex-wrap gap-1.5">
            {TYPE_OPTIONS.map(t => {
              const isAll = t === 'All';
              const active = isAll ? filters.propertyTypes.length === 0 : filters.propertyTypes.includes(t);
              return (
                <Pill
                  key={t}
                  label={t}
                  active={active}
                  onClick={() => {
                    if (isAll) {
                      onUpdateFilter('propertyTypes', []);
                    } else {
                      const current = filters.propertyTypes;
                      if (current.includes(t)) {
                        onUpdateFilter('propertyTypes', current.filter(x => x !== t));
                      } else {
                        onUpdateFilter('propertyTypes', [...current, t]);
                      }
                    }
                  }}
                />
              );
            })}
          </div>
        </FilterDropdown>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Result count */}
        <span className="text-[12px] text-white/30 mr-1">
          {isLoading ? 'Searching...' : `${totalFound.toLocaleString()} results`}
        </span>

        {/* Sort */}
        <FilterDropdown
          label={SORT_OPTIONS.find(s => s.value === filters.sortBy)?.label || 'Sort'}
          isOpen={openDropdown === 'sort'}
          onToggle={() => toggle('sort')}
        >
          <div className="flex flex-col gap-1">
            {SORT_OPTIONS.map(s => (
              <button
                key={s.value}
                onClick={() => {
                  onUpdateFilter('sortBy', s.value);
                  setOpenDropdown(null);
                }}
                className={`px-3 py-2 rounded-lg text-[12px] text-left transition-colors duration-150
                  ${filters.sortBy === s.value
                    ? 'bg-white/[0.10] text-white/80'
                    : 'text-white/50 hover:bg-white/[0.05] hover:text-white/70'
                  }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </FilterDropdown>

        {/* Advanced toggle */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 border
            ${showAdvanced
              ? 'bg-white/[0.10] text-white/80 border-white/[0.10]'
              : 'bg-transparent text-white/40 border-white/[0.06] hover:bg-white/[0.04] hover:text-white/60'
            }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>More</span>
        </button>

        {/* Reset */}
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="flex items-center gap-1 px-2.5 py-2 rounded-lg text-[12px] text-white/30 hover:text-white/60 hover:bg-white/[0.04] transition-all duration-150"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Advanced filters panel */}
      {showAdvanced && (
        <div className="px-4 pb-3 pt-0 border-t border-white/[0.04]">
          <div className="grid grid-cols-4 gap-6 pt-3">
            <SliderInput
              label="Min Cap Rate"
              value={filters.minCapRate}
              onChange={v => onUpdateFilter('minCapRate', v)}
              min={0}
              max={15}
              step={0.5}
              suffix="%"
            />
            <SliderInput
              label="Min Cash Flow"
              value={filters.minCashFlow}
              onChange={v => onUpdateFilter('minCashFlow', v)}
              min={0}
              max={3000}
              step={100}
              format={v => `$${v.toLocaleString()}/mo`}
            />
            <SliderInput
              label="Min CoC ROI"
              value={filters.minCocRoi}
              onChange={v => onUpdateFilter('minCocRoi', v)}
              min={0}
              max={30}
              step={1}
              suffix="%"
            />
            <SliderInput
              label="Min Sqft"
              value={filters.minSqft}
              onChange={v => onUpdateFilter('minSqft', v)}
              min={0}
              max={5000}
              step={100}
              format={v => v.toLocaleString()}
            />
          </div>
        </div>
      )}

      {/* Active filter tags */}
      {hasActiveFilters && (
        <div className="flex items-center gap-1.5 px-4 py-2 border-t border-white/[0.04]">
          {(filters.minPrice != null || filters.maxPrice != null) && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/[0.06] text-[10px] text-white/50 font-medium">
              {getActivePrice()}
              <X className="w-2.5 h-2.5 cursor-pointer opacity-60 hover:opacity-100" onClick={() => { onUpdateFilter('minPrice', null); onUpdateFilter('maxPrice', null); }} />
            </span>
          )}
          {filters.minBeds != null && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/[0.06] text-[10px] text-white/50 font-medium">
              {filters.minBeds}+ Beds
              <X className="w-2.5 h-2.5 cursor-pointer opacity-60 hover:opacity-100" onClick={() => onUpdateFilter('minBeds', null)} />
            </span>
          )}
          {filters.minBaths != null && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/[0.06] text-[10px] text-white/50 font-medium">
              {filters.minBaths}+ Baths
              <X className="w-2.5 h-2.5 cursor-pointer opacity-60 hover:opacity-100" onClick={() => onUpdateFilter('minBaths', null)} />
            </span>
          )}
          {filters.propertyTypes.length > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/[0.06] text-[10px] text-white/50 font-medium">
              {getActiveType()}
              <X className="w-2.5 h-2.5 cursor-pointer opacity-60 hover:opacity-100" onClick={() => onUpdateFilter('propertyTypes', [])} />
            </span>
          )}
        </div>
      )}
    </div>
  );
};
