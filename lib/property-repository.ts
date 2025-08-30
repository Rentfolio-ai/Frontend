import { Property, PropertySearchFilters } from '@/types';
import propertiesData from '@/seed/properties.json';

export class PropertyRepository {
  private properties: Property[] = propertiesData as Property[];

  async search(filters: PropertySearchFilters & {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc'
  }) {
    let filteredProperties = [...this.properties];

    // Apply filters
    if (filters.location) {
      const location = filters.location.toLowerCase();
      filteredProperties = filteredProperties.filter(p =>
        p.city.toLowerCase().includes(location) ||
        p.state.toLowerCase().includes(location) ||
        p.zip.includes(location) ||
        p.address.toLowerCase().includes(location)
      );
    }

    if (filters.minPrice) {
      filteredProperties = filteredProperties.filter(p => p.price >= filters.minPrice!);
    }

    if (filters.maxPrice) {
      filteredProperties = filteredProperties.filter(p => p.price <= filters.maxPrice!);
    }

    if (filters.beds !== undefined) {
      filteredProperties = filteredProperties.filter(p => p.beds >= filters.beds!);
    }

    if (filters.baths !== undefined) {
      filteredProperties = filteredProperties.filter(p => p.baths >= filters.baths!);
    }

    if (filters.propertyType) {
      filteredProperties = filteredProperties.filter(p => p.propertyType === filters.propertyType);
    }

    if (filters.minCapRate) {
      filteredProperties = filteredProperties.filter(p => p.capRate >= filters.minCapRate!);
    }

    if (filters.maxCapRate) {
      filteredProperties = filteredProperties.filter(p => p.capRate <= filters.maxCapRate!);
    }

    if (filters.minYearBuilt) {
      filteredProperties = filteredProperties.filter(p => p.yearBuilt >= filters.minYearBuilt!);
    }

    if (filters.maxYearBuilt) {
      filteredProperties = filteredProperties.filter(p => p.yearBuilt <= filters.maxYearBuilt!);
    }

    // Apply sorting
    if (filters.sortBy) {
      filteredProperties.sort((a, b) => {
        const aVal = a[filters.sortBy as keyof Property] as number;
        const bVal = b[filters.sortBy as keyof Property] as number;

        if (filters.sortOrder === 'desc') {
          return bVal - aVal;
        }
        return aVal - bVal;
      });
    }

    // Apply pagination
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const paginatedProperties = filteredProperties.slice(startIndex, endIndex);

    return {
      properties: paginatedProperties,
      total: filteredProperties.length,
      page,
      limit,
      totalPages: Math.ceil(filteredProperties.length / limit),
    };
  }

  async findById(id: string): Promise<Property | null> {
    return this.properties.find(p => p.id === id) || null;
  }

  async findNearby(lat: number, lng: number, radius: number = 0.01): Promise<Property[]> {
    return this.properties.filter(p => {
      const distance = Math.sqrt(
        Math.pow(p.lat - lat, 2) + Math.pow(p.lng - lng, 2)
      );
      return distance <= radius;
    });
  }

  async getAll(): Promise<Property[]> {
    return this.properties;
  }

  async getAnalytics(filters?: PropertySearchFilters) {
    const { properties } = await this.search(filters || {});

    if (properties.length === 0) {
      return {
        avgPrice: 0,
        medianCapRate: 0,
        avgCashOnCash: 0,
        totalListings: 0,
      };
    }

    const avgPrice = properties.reduce((sum, p) => sum + p.price, 0) / properties.length;

    const sortedCapRates = properties.map(p => p.capRate).sort((a, b) => a - b);
    const medianCapRate = sortedCapRates[Math.floor(sortedCapRates.length / 2)];

    // Calculate average cash-on-cash (assuming 25% down payment)
    const avgCashOnCash = properties.reduce((sum, p) => {
      const downPayment = p.price * 0.25;
      const annualCashFlow = (p.rentEst * 12) - p.expensesEst;
      return sum + (annualCashFlow / downPayment) * 100;
    }, 0) / properties.length;

    return {
      avgPrice: Math.round(avgPrice),
      medianCapRate: Math.round(medianCapRate * 10) / 10,
      avgCashOnCash: Math.round(avgCashOnCash * 10) / 10,
      totalListings: properties.length,
    };
  }

  async getRoiByMonth(filters?: PropertySearchFilters) {
    const { properties } = await this.search(filters || {});

    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    return monthNames.map((month, index) => ({
      month,
      roi: properties.reduce((sum, p) => sum + (p.roiMonthly[index] || 0), 0) / properties.length || 0,
    }));
  }

  async getCapRateDistribution(filters?: PropertySearchFilters) {
    const { properties } = await this.search(filters || {});

    const ranges = [
      { min: 0, max: 3, label: '0-3%' },
      { min: 3, max: 5, label: '3-5%' },
      { min: 5, max: 7, label: '5-7%' },
      { min: 7, max: 9, label: '7-9%' },
      { min: 9, max: Infinity, label: '9%+' },
    ];

    return ranges.map(range => ({
      range: range.label,
      count: properties.filter(p => p.capRate >= range.min && p.capRate < range.max).length,
    }));
  }

  async getTopZipsByRoi(filters?: PropertySearchFilters, limit: number = 10) {
    const { properties } = await this.search(filters || {});

    const zipGroups: Record<string, { total: number; count: number }> = {};

    properties.forEach(p => {
      if (!zipGroups[p.zip]) {
        zipGroups[p.zip] = { total: 0, count: 0 };
      }

      const avgMonthlyRoi = p.roiMonthly.reduce((sum, roi) => sum + roi, 0) / 12;
      zipGroups[p.zip].total += avgMonthlyRoi;
      zipGroups[p.zip].count += 1;
    });

    return Object.entries(zipGroups)
      .map(([zip, data]) => ({
        zip,
        avgRoi: Math.round((data.total / data.count) * 10) / 10,
        count: data.count,
      }))
      .sort((a, b) => b.avgRoi - a.avgRoi)
      .slice(0, limit);
  }
}

// Singleton instance
export const propertyRepository = new PropertyRepository();
