# Market Trends Data API Specification

## Overview
This document outlines the data requirements for the Market Trends view and provides a migration strategy from mock data to real API data from your data provider.

---

## Current Data Structure (Mock)

### 1. **Overview Card Data**
Each market insight card needs:
```typescript
{
  id: string;
  location: string;                    // e.g., "Austin, TX"
  created_at: string;                  // ISO date
  overall_score: {
    score: number;                     // 0-100
    rating: string;                    // "Excellent", "Good", "Fair"
  };
  investment_metrics: {
    average_property_price: number;    // $400,000
    average_nightly_rate: number;      // $200
    estimated_roi: number;             // 12.5 (percentage)
    estimated_annual_revenue: number;  // $50,000
  };
  regulations: {
    str_friendly: boolean;             // true/false
    summary: string;                   // "Austin requires permits..."
  };
  demand: {
    demand_level: string;              // "High Demand", "Growing Market"
  };
}
```

### 2. **Detail View Chart Data**
When user clicks a market, they see detailed charts requiring:

#### a) STR Occupancy Trends (12 months)
```typescript
str_occupancy_trends_12mo: [
  {
    month: string;              // "Jan", "Feb", ...
    occupancy_rate: number;     // 65-95 (percentage)
    available_nights: number;   // 30
    booked_nights: number;      // 22
  }
  // ... 12 entries
]
```

#### b) Nightly Rates by Property Type
```typescript
nightly_rate_by_property_type: [
  {
    type: string;              // "Studio", "1 Bedroom", "2 Bedroom", etc.
    avg_nightly: number;       // $150
    growth_yoy: string;        // "+18%"
  }
  // 5 property types
]
```

#### c) STR Supply Growth
```typescript
str_supply_growth: [
  {
    month: string;             // "Jan", "Feb", ...
    total_listings: number;    // 1200
    new_listings: number;      // 50
    growth_rate: string;       // "+4%"
  }
  // ... 12 entries
]
```

#### d) RevPAR Trends (Revenue Per Available Room)
```typescript
revpar_trends: [
  {
    month: string;             // "Jan", "Feb", ...
    revpar: number;            // $120 (ADR × Occupancy)
    adr: number;               // $180 (Average Daily Rate)
    occupancy: number;         // 67 (percentage)
  }
  // ... 12 entries
]
```

#### e) Regulation Timeline
```typescript
regulation_timeline: [
  {
    date: string;              // "2024-Q1"
    event: string;             // "New permit requirements introduced"
    impact: string;            // "positive", "negative", "warning", "neutral"
  }
  // 3-5 key events
]
```

#### f) Booking Window Analysis
```typescript
booking_window_analysis: {
  average_booking_window: number;    // 35 (days in advance)
  breakdown: [
    {
      window: string;                // "Same week", "1-2 weeks", etc.
      percentage: number;            // 25
    }
    // 5 ranges
  ];
  insight: string;                   // "Most bookings occur 3-4 weeks in advance..."
}
```

#### g) Guest Demographics
```typescript
guest_demographics: {
  trip_purpose: [
    {
      purpose: string;               // "Leisure/Vacation", "Business Travel"
      percentage: number;            // 65
    }
    // 4 categories
  ];
  group_size: {
    solo: number;                    // 20
    couple: number;                  // 40
    family: number;                  // 30
    group: number;                   // 10
  };
  top_source_markets: string[];      // ["Domestic (75%)", "International (25%)"]
  peak_booking_days: string[];       // ["Sunday", "Monday", "Tuesday"]
}
```

#### h) Length of Stay Trends
```typescript
length_of_stay_trends: {
  average_los: number;               // 4 (nights)
  distribution: [
    {
      nights: string;                // "1-2", "3-4", "5-7"
      percentage: number;            // 35
    }
    // 5 ranges
  ];
  trend: string;                     // "increasing", "stable", "decreasing"
  insight: string;                   // "Average 4-night stays suggest..."
}
```

---

## Data API Requirements

### What You Need from Your Data Provider:

#### **Core STR Metrics (Required)**
1. ✅ **Market-level occupancy rates** (monthly, 12-month history)
2. ✅ **Average nightly rates** (by property type: Studio, 1BR, 2BR, 3BR, 4BR+)
3. ✅ **Total active STR listings** (current count + monthly growth)
4. ✅ **RevPAR (Revenue Per Available Room)** - or components to calculate it (ADR × Occupancy)
5. ✅ **Average property prices** (for investment calculation)
6. ✅ **Estimated annual revenue** (or average monthly revenue × 12)

#### **Supplementary Data (Nice-to-Have)**
7. 🔶 **Booking lead time** (how far in advance guests book)
8. 🔶 **Length of stay distribution** (1-2 nights, 3-4 nights, etc.)
9. 🔶 **Guest trip purpose** (leisure vs business)
10. 🔶 **Seasonal patterns** (peak months, off-season)
11. 🔶 **Year-over-year growth rates** (for rates, supply, demand)

#### **Regulatory Data (Manual or Third-Party)**
12. 📋 **STR regulations** (permit requirements, restrictions)
13. 📋 **Recent regulatory changes** (timeline of policy updates)

---

## API Endpoint Structure

### Recommended Endpoint:
```
GET /api/v1/str-market-data?location={city}&state={state}
```

### Expected Response:
```json
{
  "location": "Austin, TX",
  "data_period": {
    "start_date": "2024-01-01",
    "end_date": "2024-12-31"
  },
  "summary_metrics": {
    "total_active_listings": 1200,
    "avg_occupancy_rate": 72.5,
    "avg_nightly_rate": 185,
    "avg_property_price": 425000,
    "estimated_annual_revenue": 48000,
    "estimated_roi": 11.3
  },
  "occupancy_by_month": [
    { "month": "2024-01", "occupancy_rate": 68.5, "total_nights": 930, "booked_nights": 637 },
    { "month": "2024-02", "occupancy_rate": 71.2, "total_nights": 870, "booked_nights": 619 }
    // ... 12 months
  ],
  "rates_by_property_type": [
    { "property_type": "studio", "avg_nightly_rate": 110, "count": 150, "yoy_growth": 12.3 },
    { "property_type": "1_bedroom", "avg_nightly_rate": 140, "count": 300, "yoy_growth": 15.1 }
    // ... all types
  ],
  "supply_growth": [
    { "month": "2024-01", "total_listings": 1100, "new_listings": 45, "removed_listings": 12 },
    { "month": "2024-02", "total_listings": 1133, "new_listings": 38, "removed_listings": 5 }
    // ... 12 months
  ],
  "revpar_by_month": [
    { "month": "2024-01", "revpar": 126.7, "adr": 185, "occupancy": 68.5 }
    // ... 12 months
  ],
  "booking_patterns": {
    "avg_lead_time_days": 35,
    "lead_time_distribution": [
      { "range": "0-7 days", "percentage": 12 },
      { "range": "8-14 days", "percentage": 25 }
      // ...
    ]
  },
  "length_of_stay": {
    "avg_nights": 4.2,
    "distribution": [
      { "range": "1-2", "percentage": 28 },
      { "range": "3-4", "percentage": 35 }
      // ...
    ]
  }
}
```

---

## Migration Strategy: Mock → Real Data

### Phase 1: Create Data Adapter Layer
Create a service that can switch between mock and real data:

```typescript
// src/services/marketDataAdapter.ts

const USE_MOCK_DATA = process.env.REACT_APP_USE_MOCK_DATA === 'true';

interface MarketDataSource {
  fetchMarketInsights(location: string): Promise<MarketInsight>;
}

class MockDataSource implements MarketDataSource {
  async fetchMarketInsights(location: string): Promise<MarketInsight> {
    // Return current mock data structure
    return {
      // ... existing mock data generation
    };
  }
}

class RealDataSource implements MarketDataSource {
  async fetchMarketInsights(location: string): Promise<MarketInsight> {
    const response = await fetch(`https://your-data-api.com/str-market-data?location=${location}`);
    const apiData = await response.json();
    
    // Transform API response to match MarketInsight interface
    return this.transformApiData(apiData);
  }
  
  private transformApiData(apiData: any): MarketInsight {
    return {
      id: apiData.id || `${apiData.location}-${Date.now()}`,
      location: apiData.location,
      created_at: new Date().toISOString(),
      analysis_data: {
        data: {
          overall_score: {
            score: this.calculateOverallScore(apiData),
            rating: this.getRating(apiData)
          },
          investment_metrics: {
            average_property_price: apiData.summary_metrics.avg_property_price,
            average_nightly_rate: apiData.summary_metrics.avg_nightly_rate,
            estimated_roi: apiData.summary_metrics.estimated_roi,
            estimated_annual_revenue: apiData.summary_metrics.estimated_annual_revenue
          },
          regulations: {
            str_friendly: apiData.regulations?.str_friendly || true,
            summary: apiData.regulations?.summary || "Check local regulations"
          },
          demand: {
            demand_level: this.calculateDemandLevel(apiData.summary_metrics.avg_occupancy_rate)
          },
          chart_data: {
            str_occupancy_trends_12mo: this.transformOccupancyData(apiData.occupancy_by_month),
            nightly_rate_by_property_type: this.transformRatesByType(apiData.rates_by_property_type),
            str_supply_growth: this.transformSupplyGrowth(apiData.supply_growth),
            revpar_trends: this.transformRevParData(apiData.revpar_by_month),
            regulation_timeline: apiData.regulation_timeline || [],
            booking_window_analysis: this.transformBookingPatterns(apiData.booking_patterns),
            guest_demographics: apiData.guest_demographics || this.getDefaultGuestDemo(),
            length_of_stay_trends: this.transformLengthOfStay(apiData.length_of_stay)
          }
        }
      }
    };
  }
  
  private transformOccupancyData(apiData: any[]): any[] {
    return apiData.map(item => ({
      month: new Date(item.month).toLocaleString('default', { month: 'short' }),
      occupancy_rate: Math.round(item.occupancy_rate),
      available_nights: item.total_nights,
      booked_nights: item.booked_nights
    }));
  }
  
  // ... other transformation methods
}

// Export singleton instance
export const marketDataService: MarketDataSource = USE_MOCK_DATA 
  ? new MockDataSource() 
  : new RealDataSource();
```

### Phase 2: Update Market Trends Component

```typescript
// src/components/views/MarketTrendsTabView.tsx

import { marketDataService } from '../../services/marketDataAdapter';

const fetchInsights = async () => {
  try {
    // This automatically uses mock or real data based on env variable
    const insights = await marketDataService.fetchMarketInsights(location);
    setInsights([insights]);
  } catch (error) {
    console.error('Failed to fetch market insights:', error);
  }
};
```

### Phase 3: Environment Configuration

```bash
# .env.development
REACT_APP_USE_MOCK_DATA=true
REACT_APP_DATA_API_URL=http://localhost:8000

# .env.production
REACT_APP_USE_MOCK_DATA=false
REACT_APP_DATA_API_URL=https://api.your-data-provider.com
```

---

## Testing Checklist

### Before switching to real API:
- [ ] Confirm API provides all **required** fields
- [ ] Verify date formats match (ISO 8601 recommended)
- [ ] Test with multiple cities (Austin, Miami, Denver, etc.)
- [ ] Handle missing/null data gracefully
- [ ] Validate numeric ranges (occupancy 0-100, prices > 0)
- [ ] Check API rate limits
- [ ] Implement error handling and retries
- [ ] Add loading states for slow API responses
- [ ] Cache data to reduce API calls (optional)

### Fallback Strategy:
If API doesn't provide certain fields:
1. Use reasonable defaults (e.g., if no guest demographics, show "Data not available")
2. Hide sections without data (use conditional rendering)
3. Display "Coming soon" placeholders
4. Continue using mock data for missing fields

---

## Questions for Your Data API Provider

1. **What is the geographic coverage?** (Cities, states, zip codes?)
2. **Historical data depth?** (How many months back?)
3. **Update frequency?** (Daily, weekly, monthly?)
4. **API rate limits?** (Requests per minute/hour?)
5. **Authentication method?** (API key, OAuth, etc.)
6. **Data freshness?** (Real-time vs delayed?)
7. **Cost structure?** (Per request, monthly subscription?)
8. **Do you provide regulatory data?** (Or should we maintain manually?)
9. **Can you segment by property type?** (Studio, 1BR, 2BR, etc.)
10. **Do you track booking lead times and length of stay?**

---

## Next Steps

1. ✅ **Review this spec** with your data provider
2. ✅ **Create data adapter service** (src/services/marketDataAdapter.ts)
3. ✅ **Add transformation logic** for API → UI data mapping
4. ✅ **Set up environment variables** for easy switching
5. ✅ **Test with mock data** first (current state)
6. ✅ **Integrate real API** once available
7. ✅ **Monitor and iterate** based on data quality

---

## File Structure
```
src/
├── services/
│   ├── marketDataAdapter.ts       # NEW: Data adapter layer
│   ├── mockMarketData.ts          # NEW: Mock data generator
│   └── agentsApi.ts               # Existing API service
├── types/
│   └── marketInsights.ts          # NEW: TypeScript interfaces
└── components/
    └── views/
        └── MarketTrendsTabView.tsx # Updated to use adapter
```
