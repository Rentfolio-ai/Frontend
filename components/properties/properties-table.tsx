'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useFilterStore } from '@/stores/filter-store';
import { formatCurrency, formatPercent } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Grid, List } from 'lucide-react';
import type { Property, PropertySearchResponse } from '@/types';

export function PropertiesTable() {
  const [data, setData] = useState<PropertySearchResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [currentPage, setCurrentPage] = useState(1);
  const { filters } = useFilterStore();

  const limit = 20;

  useEffect(() => {
    async function fetchProperties() {
      setLoading(true);
      try {
        const response = await fetch('/api/properties/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...filters,
            page: currentPage,
            limit,
            sortBy: 'price',
            sortOrder: 'desc',
          }),
        });

        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error('Failed to fetch properties:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchProperties();
  }, [filters, currentPage]);

  if (loading) {
    return <PropertiesTableSkeleton />;
  }

  if (!data || data.properties.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="text-gray-500">
            <div className="text-lg font-medium mb-2">No properties found</div>
            <div className="text-sm">Try adjusting your filters to see more results</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-600">
            Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, data.total)} of {data.total} properties
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === 'table' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('table')}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'table' ? (
        <TableView properties={data.properties} />
      ) : (
        <GridView properties={data.properties} />
      )}

      {/* Pagination */}
      {data.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          <div className="text-sm text-gray-600">
            Page {currentPage} of {data.totalPages}
          </div>

          <Button
            variant="outline"
            onClick={() => setCurrentPage(p => Math.min(data.totalPages, p + 1))}
            disabled={currentPage === data.totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
}

function TableView({ properties }: { properties: Property[] }) {
  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Property
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Beds/Baths
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sqft
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cap Rate
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {properties.map((property) => (
              <tr key={property.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {property.title}
                    </div>
                    <div className="text-sm text-gray-500">
                      {property.address}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {formatCurrency(property.price)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {property.beds}/{property.baths}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {property.sqft.toLocaleString()}
                </td>
                <td className="px-6 py-4">
                  <Badge variant={property.capRate >= 6 ? 'default' : 'secondary'}>
                    {formatPercent(property.capRate)}
                  </Badge>
                </td>
                <td className="px-6 py-4">
                  <Link href={`/properties/${property.id}`}>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function GridView({ properties }: { properties: Property[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {properties.map((property) => (
        <Card key={property.id} className="hover:shadow-lg transition-shadow">
          <div className="aspect-w-16 aspect-h-9">
            <img
              src={property.images[0] || '/placeholder-property.jpg'}
              alt={property.title}
              className="w-full h-48 object-cover rounded-t-lg"
            />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">{property.title}</CardTitle>
            <div className="text-sm text-gray-600">{property.address}</div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold text-gray-900">
                  {formatCurrency(property.price)}
                </span>
                <Badge variant={property.capRate >= 6 ? 'default' : 'secondary'}>
                  {formatPercent(property.capRate)}
                </Badge>
              </div>

              <div className="flex justify-between text-sm text-gray-600">
                <span>{property.beds} beds • {property.baths} baths</span>
                <span>{property.sqft.toLocaleString()} sqft</span>
              </div>

              <Link href={`/properties/${property.id}`}>
                <Button className="w-full">
                  View Details
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function PropertiesTableSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
          <div className="h-8 bg-gray-200 rounded w-24 animate-pulse"></div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4 py-4 border-b border-gray-100">
              <div className="h-16 w-20 bg-gray-200 rounded animate-pulse"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
              </div>
              <div className="text-right space-y-2">
                <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded w-16 animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
