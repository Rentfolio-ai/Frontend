# Portfolio Integrations & Connectors - Complete Design

## 🎯 Vision

**Problem**: Asking users to manually enter property data is friction.  
**Solution**: Let them connect existing tools or import data instantly.

**Replace**: 🏠 Home button in composer  
**With**: 🔗 Connectors button (chain link icon)

---

## 🎨 UI Design

### 1. Composer Button (Replaces Portfolio Button)

**Location**: `src/components/chat/Composer.tsx`

```
┌─────────────────────────────────────────────┐
│  [📎 Attach] [🔗 Connect] [⚙️ Preferences]  │  ← Button bar
│                                             │
│  Type your message...                       │
│                                             │
│  [ Send → ]                                 │
└─────────────────────────────────────────────┘
```

**Button Style**: Same as Paperclip
- Icon: `Link` from lucide-react (chain link)
- Tooltip: "Connect Portfolio Data"
- Opens integration modal

---

### 2. Integration Modal

**Triggered by**: Clicking 🔗 Connect button

```
┌────────────────────────────────────────────────────┐
│  Connect Your Portfolio                      [✕]   │
├────────────────────────────────────────────────────┤
│                                                     │
│  Import from your existing tools                   │
│                                                     │
│  ┌────────────────────────────────────────────┐   │
│  │  🔗 INTEGRATIONS                           │   │
│  ├────────────────────────────────────────────┤   │
│  │                                             │   │
│  │  [Stessa Logo]    Stessa                   │   │
│  │  Sync properties, rent rolls, & expenses   │   │
│  │                         [Connect →]        │   │
│  │                                             │   │
│  │  [REIwise Logo]   REIwise                  │   │
│  │  Import portfolio data automatically       │   │
│  │                         [Connect →]        │   │
│  │                                             │   │
│  │  [Buildium Logo]  Buildium                 │   │
│  │  Property management sync                  │   │
│  │                         [Connect →]        │   │
│  │                                             │   │
│  │  [Rentec Logo]    Rentec Direct           │   │
│  │  Tenant & lease tracking                   │   │
│  │                         [Connect →]        │   │
│  └────────────────────────────────────────────┘   │
│                                                     │
│  ┌────────────────────────────────────────────┐   │
│  │  📄 IMPORT FILES                           │   │
│  ├────────────────────────────────────────────┤   │
│  │                                             │   │
│  │  [📊] CSV / Excel                          │   │
│  │  Upload property spreadsheet               │   │
│  │                         [Upload →]         │   │
│  │                                             │   │
│  │  [📄] PDF / Documents                      │   │
│  │  Extract data from PDFs                    │   │
│  │                         [Upload →]         │   │
│  └────────────────────────────────────────────┘   │
│                                                     │
│  ┌────────────────────────────────────────────┐   │
│  │  💬 CHAT ENTRY                             │   │
│  ├────────────────────────────────────────────┤   │
│  │  Tell me about your properties             │   │
│  │                   [Start in Chat →]        │   │
│  └────────────────────────────────────────────┘   │
│                                                     │
└────────────────────────────────────────────────────┘
```

---

### 3. Connected State (After Integration)

**In Composer**: Shows connected integration with icon + name

```
┌─────────────────────────────────────────────────────┐
│  [📎] [🔗 Stessa ●] [⚙️]                            │  ← Icon + Name + Green dot
│                                                      │
│  On hover: "Connected to Stessa (12 properties)"    │
└─────────────────────────────────────────────────────┘
```

**Multiple Connections**:

```
┌─────────────────────────────────────────────────────┐
│  [📎] [🔗 2 ●] [⚙️]                                 │  ← Shows count
│                                                      │
│  On hover: "Connected: Stessa, Buildium"            │
└─────────────────────────────────────────────────────┘
```

**In Modal**: Show connected accounts with branding

```
┌────────────────────────────────────────────────────┐
│  Connected Accounts                                 │
├────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────────────────────────────────────────┐ │
│  │  [Stessa Logo]  ✅ Stessa                    │ │
│  │                                               │ │
│  │  Last synced: 2 hours ago                    │ │
│  │  12 properties imported                      │ │
│  │  Account: john@email.com                     │ │
│  │                                               │ │
│  │  [🔄 Sync Now]  [⚙️ Settings]  [🗑️ Disconnect]│ │
│  └──────────────────────────────────────────────┘ │
│                                                     │
│  ┌──────────────────────────────────────────────┐ │
│  │  [Buildium Logo]  ✅ Buildium                │ │
│  │                                               │ │
│  │  Last synced: 5 hours ago                    │ │
│  │  8 properties imported                       │ │
│  │  Account: Property Management LLC            │ │
│  │                                               │ │
│  │  [🔄 Sync Now]  [⚙️ Settings]  [🗑️ Disconnect]│ │
│  └──────────────────────────────────────────────┘ │
│                                                     │
│  ┌──────────────────────────────────────────────┐ │
│  │  [📄]  CSV Import                            │ │
│  │                                               │ │
│  │  Uploaded: Jan 15, 2026                      │ │
│  │  25 properties imported                      │ │
│  │  File: portfolio_2026.csv                    │ │
│  │                                               │ │
│  │  [📊 View Details]                           │ │
│  └──────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────┘
```

---

## 🔌 Integration Options

### Tier 1: Property Management Software

| Integration | API Available | Priority | Use Case |
|-------------|---------------|----------|----------|
| **Stessa** | Yes | High | Landlords, real-time sync |
| **Buildium** | Yes | High | PM companies, large portfolios |
| **AppFolio** | Yes | Medium | Enterprise PM |
| **Rentec Direct** | Yes | Medium | DIY landlords |
| **Cozy (Apartments.com)** | Limited | Low | Small landlords |
| **TurboTenant** | No | Low | Basic tracking |

### Tier 2: Accounting/Tax Software

| Integration | API Available | Priority | Use Case |
|-------------|---------------|----------|----------|
| **QuickBooks** | Yes | High | Expense tracking |
| **Wave** | Yes | Medium | Free accounting |
| **FreshBooks** | Yes | Low | Invoicing |

### Tier 3: Real Estate Platforms

| Integration | API Available | Priority | Use Case |
|-------------|---------------|----------|----------|
| **REIwise** | Yes | High | Serious investors |
| **DealMachine** | Yes | Medium | Wholesalers |
| **PropStream** | Limited | Low | Market research |

### Tier 4: File Imports

| Format | Parser | Priority | Use Case |
|--------|--------|----------|----------|
| **CSV** | Custom | High | Universal export |
| **Excel (.xlsx)** | SheetJS | High | Spreadsheets |
| **PDF** | Vision API | Medium | Statements, docs |
| **Google Sheets** | API | Low | Collaboration |

---

## 🏗️ Technical Architecture

### Frontend Components

```
src/components/integrations/
├── IntegrationsModal.tsx          # Main modal
├── IntegrationCard.tsx            # Single integration card
├── ConnectedAccountCard.tsx       # Shows connected account with logo + name
├── FileUploader.tsx               # File upload UI
├── OAuthHandler.tsx               # OAuth flow
├── IntegrationBadge.tsx          # Badge for composer button (logo + name)
└── index.ts

src/assets/integrations/
├── stessa-logo.svg
├── buildium-logo.svg
├── reiwise-logo.svg
├── quickbooks-logo.svg
└── index.ts                      # Export all logos
```

### Backend Services

```
DataLayer/app/services/integrations/
├── stessa_connector.py            # Stessa API
├── buildium_connector.py          # Buildium API
├── csv_parser.py                  # CSV parsing
├── pdf_extractor.py               # PDF data extraction
├── oauth_manager.py               # OAuth tokens
└── sync_scheduler.py              # Background sync
```

### API Endpoints

```python
# Portfolio Integrations
POST   /api/integrations/stessa/connect
POST   /api/integrations/stessa/sync
DELETE /api/integrations/stessa/disconnect
GET    /api/integrations/status

# File Imports
POST   /api/integrations/import/csv
POST   /api/integrations/import/pdf
GET    /api/integrations/import/status/{job_id}
```

---

## 🎬 User Flows

### Flow 1: Stessa Integration (OAuth)

1. User clicks 🔗 Connect in composer
2. Modal opens → "Stessa" → [Connect]
3. Redirects to Stessa OAuth login
4. User authorizes Civitas
5. Callback → Backend fetches properties
6. Frontend shows: "✅ Imported 12 properties from Stessa"
7. Modal closes, properties appear in portfolio

### Flow 2: CSV Upload

1. User clicks 🔗 Connect → [CSV Upload]
2. File picker opens
3. User selects CSV
4. Frontend shows preview:
   ```
   Found 25 properties in your CSV
   
   Preview:
   - 123 Main St, Austin TX ($450k)
   - 456 Oak Ave, Dallas TX ($380k)
   - ...
   
   [Import All] [Review & Edit]
   ```
5. User clicks [Import All]
6. Backend parses, validates, creates properties
7. Success message: "✅ Imported 25 properties"

### Flow 3: PDF Extraction

1. User uploads property statement PDF
2. Vision API extracts text
3. LLM parses structured data:
   ```json
   {
     "address": "123 Main St",
     "purchase_price": 450000,
     "monthly_rent": 2500,
     "expenses": {...}
   }
   ```
4. Shows preview: "Found 1 property in document"
5. User confirms → property added

---

## 🎨 Empty State Redesign (With Integrations)

**New Portfolio Empty State**:

```
┌─────────────────────────────────────────────────┐
│                                                  │
│           Import Your Portfolio                  │
│                                                  │
│  Connect your existing tools to get started     │
│                                                  │
│  ┌─────────────────────────────────────────┐   │
│  │  🔗 [Connect Stessa]                    │   │
│  │  🔗 [Connect Buildium]                  │   │
│  │  🔗 [Connect REIwise]                   │   │
│  │                                          │   │
│  │  📄 [Upload CSV]                        │   │
│  │  💬 [Tell me in Chat]                   │   │
│  └─────────────────────────────────────────┘   │
│                                                  │
│  Or start from scratch →                        │
│                                                  │
└─────────────────────────────────────────────────┘
```

---

## 🔧 Implementation Plan

### Phase 1: Foundation (Week 1)
- [ ] Create IntegrationsModal component
- [ ] Add 🔗 Connect button to Composer
- [ ] Design modal UI/UX
- [ ] Create integration cards

### Phase 2: File Imports (Week 2)
- [ ] CSV parser (backend)
- [ ] Excel parser (backend)
- [ ] File upload UI (frontend)
- [ ] Preview & validation flow
- [ ] Test with sample CSVs

### Phase 3: OAuth Infrastructure (Week 3)
- [ ] OAuth manager service
- [ ] Token storage (encrypted)
- [ ] Callback handler
- [ ] Error handling

### Phase 4: Stessa Integration (Week 4)
- [ ] Stessa API client
- [ ] Property sync logic
- [ ] OAuth flow (Stessa-specific)
- [ ] Background sync scheduler
- [ ] Test with real Stessa account

### Phase 5: Additional Integrations (Ongoing)
- [ ] Buildium
- [ ] REIwise
- [ ] QuickBooks
- [ ] PDF extraction (Vision API)

---

## 💾 Data Models

### Integration Connection (With States)

```typescript
interface IntegrationConnection {
  id: string;
  user_id: string;
  integration_type: 'stessa' | 'buildium' | 'reiwise' | 'csv' | 'pdf';
  
  // Connection State Machine
  connection_status: 
    | 'not_connected'    // Initial state
    | 'connecting'       // OAuth flow in progress
    | 'connected'        // Active connection
    | 'error'           // Connection failed
    | 'reconnecting'    // Attempting to reconnect
    | 'disconnecting'   // Removal in progress
    | 'disconnected';   // Removed
  
  connection_error?: string;
  connection_error_code?: string;
  
  // Sync State Machine
  sync_status:
    | 'idle'           // Ready for sync
    | 'syncing'        // Sync in progress
    | 'completed'      // Sync finished
    | 'error'          // Sync failed
    | 'retrying';      // Retry in progress
  
  last_sync_started_at?: string;
  last_sync_completed_at?: string;
  last_sync_error?: string;
  
  // OAuth (encrypted)
  access_token?: string;
  refresh_token?: string;
  token_expires_at?: string;
  
  // Account Info
  external_account_id?: string;
  account_name?: string;
  account_display_name?: string;
  
  // Stats
  properties_imported: number;
  properties_updated: number;
  last_successful_import_at?: string;
  
  // Settings
  auto_sync: boolean;
  sync_frequency: 'realtime' | 'hourly' | 'daily' | 'manual';
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

// Import Job (for CSV/PDF uploads)
interface ImportJob {
  id: string;
  user_id: string;
  job_type: 'csv' | 'excel' | 'pdf';
  file_name: string;
  file_size: number;
  
  // Job State Machine
  status:
    | 'pending'       // Queued for processing
    | 'processing'    // Currently processing
    | 'completed'     // Successfully finished
    | 'failed'        // Failed with errors
    | 'retrying'      // Retry attempt
    | 'cancelled';    // User cancelled
  
  progress_percentage: number;  // 0-100
  
  // Results
  total_rows?: number;
  processed_rows: number;
  successful_imports: number;
  failed_imports: number;
  skipped_rows: number;
  
  // Errors
  errors: Array<{
    row: number;
    field?: string;
    error: string;
  }>;
  warnings: Array<{
    row: number;
    message: string;
  }>;
  
  // Portfolio
  portfolio_id?: string;
  
  // Timing
  created_at: string;
  started_at?: string;
  completed_at?: string;
  retry_count: number;
}
```

### CSV Template

Provide downloadable CSV template:

```csv
address,city,state,zip,purchase_price,purchase_date,monthly_rent,bedrooms,bathrooms,property_type
123 Main St,Austin,TX,78701,450000,2024-01-15,2500,3,2,Single Family
456 Oak Ave,Dallas,TX,75201,380000,2023-12-01,2200,2,2,Condo
```

---

## 🎯 Success Metrics

**Adoption**:
- % of users who connect integrations
- % of users who upload files
- % of users who use chat entry

**Volume**:
- Avg properties imported per integration
- Time saved vs manual entry

**Engagement**:
- Users who sync > once
- Return rate after import

---

## 🔐 Security Considerations

1. **OAuth Tokens**: Encrypted at rest, never logged
2. **File Uploads**: Scanned for malware, size limits
3. **API Keys**: Stored in secrets manager
4. **Data Privacy**: Clear consent for data access
5. **Sync Permissions**: User controls what syncs

---

## 🎨 Component Spec: Connect Button

### Composer Changes

```tsx
// src/components/chat/Composer.tsx

import { Link } from 'lucide-react'; // Chain link icon
import { IntegrationBadge } from '../integrations/IntegrationBadge';

interface ComposerProps {
  // ... existing props
  onOpenConnectors?: () => void; // NEW
  connectedIntegrations?: ConnectedIntegration[]; // NEW
}

interface ConnectedIntegration {
  type: 'stessa' | 'buildium' | 'reiwise' | 'csv';
  name: string;
  icon: string; // URL or component
  propertyCount: number;
}

// In button bar (replace portfolio button):

// NO CONNECTIONS:
<button
  type="button"
  onClick={onOpenConnectors}
  className="p-2 rounded-lg text-white/60 hover:text-white/90 hover:bg-white/[0.08] transition-all duration-150 group relative"
  title="Connect portfolio data"
  disabled={isLoading}
>
  <Link className="w-[18px] h-[18px]" />
  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
    Connect Data
  </div>
</button>

// SINGLE CONNECTION:
<button
  type="button"
  onClick={onOpenConnectors}
  className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-white/90 hover:text-white hover:bg-white/[0.08] transition-all duration-150 group relative"
  title="Connected to Stessa"
  disabled={isLoading}
>
  <img src={stessaLogo} className="w-4 h-4" alt="Stessa" />
  <span className="text-xs font-medium">Stessa</span>
  <div className="w-2 h-2 bg-green-500 rounded-full" />
  
  {/* Tooltip on hover */}
  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
    Connected: 12 properties
  </div>
</button>

// MULTIPLE CONNECTIONS:
<button
  type="button"
  onClick={onOpenConnectors}
  className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-white/90 hover:text-white hover:bg-white/[0.08] transition-all duration-150 group relative"
  disabled={isLoading}
>
  <Link className="w-[18px] h-[18px]" />
  <span className="text-xs font-medium">2 Connected</span>
  <div className="w-2 h-2 bg-green-500 rounded-full" />
  
  {/* Tooltip shows all connections */}
  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
    <div className="flex items-center gap-2 mb-1">
      <img src={stessaLogo} className="w-3 h-3" />
      <span>Stessa (12 properties)</span>
    </div>
    <div className="flex items-center gap-2">
      <img src={buildiumLogo} className="w-3 h-3" />
      <span>Buildium (8 properties)</span>
    </div>
  </div>
</button>
```

---

### IntegrationBadge Component

```tsx
// src/components/integrations/IntegrationBadge.tsx

interface IntegrationBadgeProps {
  integration: ConnectedIntegration;
  onClick: () => void;
}

export const IntegrationBadge = ({ integration, onClick }: IntegrationBadgeProps) => {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.08] transition-all duration-150 group relative"
    >
      {/* Company Logo */}
      <img 
        src={integration.icon} 
        className="w-4 h-4" 
        alt={integration.name}
      />
      
      {/* Company Name */}
      <span className="text-xs font-medium text-white/90">
        {integration.name}
      </span>
      
      {/* Status Indicator */}
      <div className="w-2 h-2 bg-green-500 rounded-full" />
      
      {/* Hover Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
        {integration.propertyCount} properties synced
      </div>
    </button>
  );
};
```

---

### ConnectedAccountCard Component

```tsx
// src/components/integrations/ConnectedAccountCard.tsx

interface ConnectedAccountCardProps {
  integration: {
    type: string;
    name: string;
    logo: string;
    accountName?: string;
    propertyCount: number;
    lastSynced: string;
  };
  onSync: () => void;
  onDisconnect: () => void;
  onSettings?: () => void;
}

export const ConnectedAccountCard = ({ 
  integration, 
  onSync, 
  onDisconnect, 
  onSettings 
}: ConnectedAccountCardProps) => {
  return (
    <div className="p-4 bg-gray-800 border border-gray-700 rounded-lg">
      {/* Header: Logo + Name + Status */}
      <div className="flex items-center gap-3 mb-3">
        <img 
          src={integration.logo} 
          className="w-10 h-10 rounded" 
          alt={integration.name}
        />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-white font-semibold">{integration.name}</h3>
            <span className="flex items-center gap-1 text-xs text-green-400">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              Connected
            </span>
          </div>
          {integration.accountName && (
            <p className="text-xs text-gray-400 mt-0.5">
              {integration.accountName}
            </p>
          )}
        </div>
      </div>
      
      {/* Stats */}
      <div className="space-y-1 text-sm text-gray-300 mb-4">
        <div className="flex justify-between">
          <span className="text-gray-400">Properties imported:</span>
          <span className="font-medium">{integration.propertyCount}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Last synced:</span>
          <span>{integration.lastSynced}</span>
        </div>
      </div>
      
      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={onSync}
          className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
        >
          <svg className="w-4 h-4" /* sync icon */ />
          Sync Now
        </button>
        
        {onSettings && (
          <button
            onClick={onSettings}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            title="Settings"
          >
            <svg className="w-4 h-4" /* settings icon */ />
          </button>
        )}
        
        <button
          onClick={onDisconnect}
          className="ml-auto p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
          title="Disconnect"
        >
          <svg className="w-4 h-4" /* trash icon */ />
        </button>
      </div>
    </div>
  );
};
```

---

## 📋 Integration Partner Requirements

To add a new integration, you need:

1. **API Documentation**: RESTful API or SDK
2. **OAuth Support**: OAuth 2.0 preferred
3. **Data Access**: Read access to properties, financials
4. **Rate Limits**: Understand API quotas
5. **Webhooks**: For real-time sync (optional)

### Example: Stessa API

**Endpoints needed**:
- `GET /properties` - List all properties
- `GET /properties/{id}` - Property details
- `GET /properties/{id}/transactions` - Income/expenses
- `GET /properties/{id}/documents` - Leases, statements

**OAuth Scopes**:
- `properties:read`
- `transactions:read`

---

## 🚀 Quick Start (This Week)

### Minimal Viable Integration (MVI)

**Goal**: Ship CSV import in 2 days

1. **Day 1: Frontend**
   - Replace 🏠 with 🔗 button
   - Create simple modal with file upload
   - Show "Upload CSV" option

2. **Day 2: Backend**
   - CSV parser endpoint
   - Property creation from CSV
   - Return success/errors

**Then iterate**: Add more integrations incrementally

---

## 🎁 User Benefits

| Feature | User Benefit |
|---------|--------------|
| **Stessa Sync** | No manual entry, always up-to-date |
| **CSV Import** | Bulk import 100s of properties |
| **Auto-Sync** | Set it and forget it |
| **Multi-Source** | Combine data from multiple tools |
| **PDF Extract** | Upload statements, we parse them |

---

## 💡 Future Enhancements

1. **Two-Way Sync**: Update Stessa when you edit in Civitas
2. **Smart Suggestions**: "Your Stessa rent is outdated, update?"
3. **Conflict Resolution**: Merge duplicate properties
4. **Bulk Actions**: Sync multiple accounts at once
5. **Integration Marketplace**: User-requested connectors

---

## Summary

**Replace**: Static portfolio button  
**With**: Dynamic connectors system  

**Result**:
- ✅ Instant portfolio import (0 manual entry)
- ✅ Professional appearance (shows sophistication)
- ✅ Scalable (add integrations over time)
- ✅ User choice (connect what they use)
- ✅ AI-first (chat still an option)

**This transforms portfolio from a burden into a superpower.**

Ready to build this? Let's start with CSV import as MVP! 🚀
