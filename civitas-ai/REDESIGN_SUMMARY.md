# Market Trends & Reports Redesign

## Overview
The Market Trends and Reports pages have been redesigned to be **contextual, live, and portfolio-aware**, transforming from generic data views into personalized investment dashboards.

## Key Improvements

### 1. Portfolio Context System (`PortfolioContext.tsx`)
**Purpose**: Tracks user's properties and creates market contexts automatically

**Features**:
- **Property Tracking**: Tracks owned properties, searched properties, and watchlist
- **Market Contexts**: Auto-generates list of markets user is interested in
- **Persistence**: LocalStorage-based storage for cross-session persistence
- **Smart Scoring**: Calculates relevance scores (owned properties = 3pts, searched = 1pt)

**Usage**:
```typescript
const { marketContexts, getMarketProperties, isTrackingMarket } = usePortfolio();
```

---

### 2. Live Market Widgets (`LiveMarketWidgets.tsx`)
**Purpose**: Real-time market data widgets with live updates

**Features**:
- **Live Updates**: Polls every 30 seconds for fresh data
- **4 Key Metrics**:
  - Occupancy Rate (with trend)
  - Avg Nightly Rate (with trend)
  - New Listings (7-day)
  - Booking Activity
- **Visual Indicators**: Pulsing "LIVE" badge, animated trend arrows
- **Glassmorphic Design**: Translucent cards with hover glows
- **Color-coded Trends**: Green for positive, red for negative

**Props**:
```typescript
<LiveMarketWidgets 
  city="Austin"
  state="TX"
  isLive={true}
/>
```

---

### 3. Contextual Market Trends Page (`MarketTrendsTabView_CONTEXTUAL.tsx`)

#### **Three View Modes**:

1. **My Markets** (Default)
   - Shows only markets where user has properties
   - Sorted by relevance score
   - Displays user's properties inline
   - Auto-selects first market for live data

2. **Trending**
   - Markets with score >= 70
   - High-potential opportunities
   - Independent of user's portfolio

3. **All Markets**
   - Complete market insights feed
   - Chronological order
   - Useful for discovery

#### **Key Features**:

- **Live/Pause Toggle**: Control real-time updates
- **Market Selection**: Click any market to view live widgets
- **Property Association**: Shows "Your Properties in This Market" section
- **Star Indicators**: Visual distinction for tracked markets
- **Relevance Sorting**: Prioritizes markets with user's properties
- **Track Button**: Add new markets to watchlist

#### **User Flow**:
1. User searches for properties in chat → Auto-tracked
2. Market appears in "My Markets" tab
3. User clicks market → Live widgets appear
4. Real-time data updates every 30s
5. User sees their properties' market context

---

### 4. Integration Points

#### **Chat Integration** (TODO):
When user searches for a property via chat:
```typescript
// In chat handler
import { usePortfolio } from '@/contexts/PortfolioContext';

const handlePropertySearch = (address, city, state) => {
  const { addProperty } = usePortfolio();
  
  addProperty({
    address,
    city,
    state,
    zip: extractedZip,
    type: 'searched',
    metadata: {
      price: extractedPrice,
      // ... other data
    }
  });
};
```

#### **Portfolio View** (TODO):
Link portfolio properties to market trends:
```typescript
const marketProps = getMarketProperties(property.city, property.state);
// Show: "View market trends for this area" button
```

---

## Implementation Steps

### Phase 1: Core Infrastructure ✅
- [x] Create PortfolioContext
- [x] Build LiveMarketWidgets
- [x] Redesign Market Trends page with contexts

### Phase 2: Integration (Next)
- [ ] Wrap app in PortfolioProvider
- [ ] Connect chat searches to portfolio tracking
- [ ] Update DesktopShell to use new Market Trends page
- [ ] Add property tracking from chat responses

### Phase 3: Reports Context (Next)
- [ ] Link reports to specific properties
- [ ] Add comparative analysis (property vs market avg)
- [ ] Show portfolio performance dashboard

### Phase 4: Real-time Enhancements
- [ ] WebSocket connection for instant updates
- [ ] Push notifications for market alerts
- [ ] Real-time booking activity tracking

---

## Usage Guide

### 1. Add PortfolioProvider to App

```typescript
// In your main App or DesktopShell
import { PortfolioProvider } from '@/contexts/PortfolioContext';

function App() {
  return (
    <PortfolioProvider>
      {/* Your app content */}
    </PortfolioProvider>
  );
}
```

### 2. Track Properties from Chat

```typescript
import { usePortfolio } from '@/contexts/PortfolioContext';

const ChatInterface = () => {
  const { addProperty } = usePortfolio();
  
  const handleToolResult = (result) => {
    if (result.toolName === 'property_search') {
      // Extract property details from result
      addProperty({
        address: result.data.address,
        city: result.data.city,
        state: result.data.state,
        zip: result.data.zip,
        type: 'searched',
        metadata: {
          price: result.data.price,
          bedrooms: result.data.beds,
          bathrooms: result.data.baths,
          sqft: result.data.sqft,
        }
      });
    }
  };
};
```

### 3. Switch to New Market Trends Page

```typescript
// In DesktopShell.tsx
import { MarketTrendsTabView } from '@/components/views/MarketTrendsTabView_CONTEXTUAL';

// Replace old import with new one
{activeTab === 'market' && <MarketTrendsTabView />}
```

---

## Design System Alignment

All new components follow the established glassmorphic design:

- **Translucent backgrounds**: `rgba(255, 255, 255, 0.10)` with blur
- **Borders**: `rgba(255, 255, 255, 0.15)`
- **Inset highlights**: `inset 0 1px 0 rgba(255, 255, 255, 0.15)`
- **Hover glows**: Color-specific radial gradients
- **Smooth animations**: Framer Motion for all transitions
- **Live indicators**: Pulsing green dots with glow effects

---

## Benefits

### For Users:
- **Personalized Experience**: See only relevant markets
- **Context-Aware**: Markets linked to their property searches
- **Live Data**: Real-time updates on markets they care about
- **Progressive Disclosure**: Start simple, dive deep when needed
- **Portfolio Intelligence**: Understand market position of their properties

### For Product:
- **Sticky Engagement**: Users return to check their markets
- **Data Collection**: Learn user intent from tracked properties
- **Upsell Opportunities**: Premium alerts for tracked markets
- **Network Effects**: Market data improves with usage
- **Retention**: Users invested in their tracked markets

---

## Next Steps

1. **Wrap app in PortfolioProvider**
2. **Connect chat to portfolio tracking**
3. **Replace old Market Trends with new version**
4. **Add Reports context (link to properties)**
5. **Implement WebSocket for real-time updates**
6. **Add market alerts system**

---

## API Requirements

The new system expects these API endpoints:

### Live Market Data
```
GET /api/market/live?city={city}&state={state}
Response: {
  success: boolean,
  market: {
    location: string,
    occupancyRate: { value, change, trend, lastUpdated },
    avgNightlyRate: { value, change, trend, lastUpdated },
    newListings: { value, change, trend, lastUpdated },
    bookingActivity: { value, change, trend, lastUpdated }
  }
}
```

### Market Insights (existing, enhanced)
```
GET /api/agents/market-insights/recent?limit=50
Response: {
  success: boolean,
  insights: Array<{
    id, location, city, state, created_at,
    analysis_data: { ... }
  }>
}
```

---

## Performance Considerations

- **Polling Interval**: 30 seconds (configurable)
- **LocalStorage**: ~5KB per user (100 properties)
- **Memory**: Minimal overhead with proper cleanup
- **API Load**: 1 request per 30s per selected market
- **Bundle Size**: +~15KB (gzipped) for new components

---

This redesign transforms Market Trends and Reports from static pages into **living, contextual dashboards** that grow with the user's STR investment journey.
