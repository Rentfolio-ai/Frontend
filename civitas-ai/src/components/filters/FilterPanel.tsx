import React, { useState } from 'react';

// Example filter options
const filterOptions = {
  status: ['Active', 'Sold', 'Pending'],
  type: ['Single Family', 'Multi Family', 'Condo'],
  price: { min: 0, max: 1000000 },
};

export const FilterPanel: React.FC = () => {
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000]);

  // For chips/tags
  const removeChip = (type: 'status' | 'type', value: string) => {
    if (type === 'status') setSelectedStatus(selectedStatus.filter(s => s !== value));
    if (type === 'type') setSelectedType(selectedType.filter(t => t !== value));
  };

  const resetFilters = () => {
    setSelectedStatus([]);
    setSelectedType([]);
    setPriceRange([0, 1000000]);
  };

  const applyFilters = () => {
    // TODO: Connect to property list/map/dashboard
    console.log('Applied filters:', { selectedStatus, selectedType, priceRange });
  };

  return (
    <aside className="sticky top-0 z-30 w-full md:w-72 bg-surface border-r border-border p-4 flex flex-col gap-6 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold">Filters</h2>
        <button
          onClick={resetFilters}
          className="text-xs text-primary hover:underline"
        >
          Reset
        </button>
      </div>

      {/* Status Filter */}
      <div>
        <label className="block text-sm font-medium mb-2">Status</label>
        <div className="flex flex-wrap gap-2">
          {filterOptions.status.map(status => (
            <button
              key={status}
              onClick={() => setSelectedStatus(
                selectedStatus.includes(status)
                  ? selectedStatus.filter(s => s !== status)
                  : [...selectedStatus, status]
              )}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                selectedStatus.includes(status)
                  ? 'bg-primary text-white border-primary'
                  : 'bg-muted text-foreground border-border hover:bg-primary/10'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Type Filter */}
      <div>
        <label className="block text-sm font-medium mb-2">Type</label>
        <div className="flex flex-wrap gap-2">
          {filterOptions.type.map(type => (
            <button
              key={type}
              onClick={() => setSelectedType(
                selectedType.includes(type)
                  ? selectedType.filter(t => t !== type)
                  : [...selectedType, type]
              )}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                selectedType.includes(type)
                  ? 'bg-primary text-white border-primary'
                  : 'bg-muted text-foreground border-border hover:bg-primary/10'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range Filter */}
      <div>
        <label className="block text-sm font-medium mb-2">Price Range</label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={filterOptions.price.min}
            max={filterOptions.price.max}
            value={priceRange[0]}
            onChange={e => {
              const newMinValue = Number(e.target.value);
              // Ensure value is within filterOptions range and not greater than current max
              const clampedValue = Math.max(
                filterOptions.price.min,
                Math.min(newMinValue, priceRange[1], filterOptions.price.max)
              );
              setPriceRange([clampedValue, priceRange[1]]);
            }}
            className="w-20 px-2 py-1 border rounded text-sm"
            aria-label="Min price"
          />
          <span>-</span>
          <input
            type="number"
            min={filterOptions.price.min}
            max={filterOptions.price.max}
            value={priceRange[1]}
            onChange={e => {
              const newMaxValue = Number(e.target.value);
              // Ensure value is within filterOptions range and not less than current min
              const clampedValue = Math.min(
                filterOptions.price.max,
                Math.max(newMaxValue, priceRange[0], filterOptions.price.min)
              );
              setPriceRange([priceRange[0], clampedValue]);
            }}
            className="w-20 px-2 py-1 border rounded text-sm"
            aria-label="Max price"
          />
        </div>
      </div>

      {/* Selected Filters Chips */}
      <div className="flex flex-wrap gap-2 mt-2">
        {selectedStatus.map(status => (
          <span key={status} className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
            {status}
            <button onClick={() => removeChip('status', status)} className="ml-1 text-primary/70">×</button>
          </span>
        ))}
        {selectedType.map(type => (
          <span key={type} className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
            {type}
            <button onClick={() => removeChip('type', type)} className="ml-1 text-primary/70">×</button>
          </span>
        ))}
      </div>

      {/* Apply Button */}
      <button
        onClick={applyFilters}
        className="mt-4 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
      >
        Apply Filters
      </button>
    </aside>
  );
};
