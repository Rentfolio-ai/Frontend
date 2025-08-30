'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PropertySearchSchema } from '@/lib/validations';
import { useFilterStore } from '@/stores/filter-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, X } from 'lucide-react';
import type { PropertySearchFilters } from '@/types';

export function FilterPanel() {
  const { filters, setFilters, clearFilters, isFiltersOpen, setFiltersOpen } = useFilterStore();

  const { register, handleSubmit, reset } = useForm<PropertySearchFilters>({
    resolver: zodResolver(PropertySearchSchema.omit({ page: true, limit: true, sortBy: true, sortOrder: true })),
    defaultValues: filters,
  });

  const onSubmit = (data: PropertySearchFilters) => {
    setFilters(data);
  };

  const handleClear = () => {
    clearFilters();
    reset();
  };

  const activeFilterCount = Object.values(filters).filter(
    (value) => value !== undefined && value !== null && value !== ''
  ).length;

  if (!isFiltersOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={() => setFiltersOpen(false)}>
      <div
        className="fixed left-0 top-0 h-full w-full max-w-md bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <Card className="h-full rounded-none border-0">
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-lg font-semibold">AI Smart Filters</CardTitle>
            <div className="flex items-center space-x-2">
              {activeFilterCount > 0 && (
                <Badge variant="outline" className="text-xs">
                  {activeFilterCount} active
                </Badge>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setFiltersOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

              {/* Location */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Location
                </label>
                <Input
                  {...register('location')}
                  placeholder="City, state, or ZIP code"
                  className="w-full"
                />
              </div>

              {/* Price Range */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700">
                  Price Range
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    {...register('minPrice', { valueAsNumber: true })}
                    type="number"
                    placeholder="Min price"
                  />
                  <Input
                    {...register('maxPrice', { valueAsNumber: true })}
                    type="number"
                    placeholder="Max price"
                  />
                </div>
              </div>

              {/* Beds & Baths */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Beds
                  </label>
                  <Input
                    {...register('beds', { valueAsNumber: true })}
                    type="number"
                    min="0"
                    placeholder="Any"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Baths
                  </label>
                  <Input
                    {...register('baths', { valueAsNumber: true })}
                    type="number"
                    min="0"
                    step="0.5"
                    placeholder="Any"
                  />
                </div>
              </div>

              {/* Property Type */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Property Type
                </label>
                <select
                  {...register('propertyType')}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">Any</option>
                  <option value="single-family">Single Family</option>
                  <option value="condo">Condo</option>
                  <option value="townhouse">Townhouse</option>
                  <option value="multi-family">Multi Family</option>
                  <option value="land">Land</option>
                </select>
              </div>

              {/* Cap Rate Range */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700">
                  Cap Rate (%)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    {...register('minCapRate', { valueAsNumber: true })}
                    type="number"
                    step="0.1"
                    placeholder="Min %"
                  />
                  <Input
                    {...register('maxCapRate', { valueAsNumber: true })}
                    type="number"
                    step="0.1"
                    placeholder="Max %"
                  />
                </div>
              </div>

              {/* Cash-on-Cash Range */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700">
                  Cash-on-Cash Return (%)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    {...register('minCashOnCash', { valueAsNumber: true })}
                    type="number"
                    step="0.1"
                    placeholder="Min %"
                  />
                  <Input
                    {...register('maxCashOnCash', { valueAsNumber: true })}
                    type="number"
                    step="0.1"
                    placeholder="Max %"
                  />
                </div>
              </div>

              {/* Year Built Range */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700">
                  Year Built
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    {...register('minYearBuilt', { valueAsNumber: true })}
                    type="number"
                    placeholder="From year"
                  />
                  <Input
                    {...register('maxYearBuilt', { valueAsNumber: true })}
                    type="number"
                    placeholder="To year"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4">
                <Button type="submit" className="flex-1">
                  <Search className="h-4 w-4 mr-2" />
                  Apply Filters
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClear}
                >
                  Clear
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
