'use client';

import { Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useFilterStore } from '@/stores/filter-store';

export function FilterToggle() {
  const { filters, toggleFilters } = useFilterStore();

  // Count active filters
  const activeFilterCount = Object.values(filters).filter(
    (value) => value !== undefined && value !== null && value !== ''
  ).length;

  return (
    <div className="flex items-center space-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={toggleFilters}
        className="relative"
      >
        <Filter className="h-4 w-4 mr-2" />
        Filters
        {activeFilterCount > 0 && (
          <Badge
            variant="destructive"
            className="ml-2 px-1.5 py-0.5 text-xs"
          >
            {activeFilterCount}
          </Badge>
        )}
      </Button>
    </div>
  );
}
