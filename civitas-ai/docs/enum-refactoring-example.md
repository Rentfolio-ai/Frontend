# Example: Refactoring ReportsList Component to Use ENUMs

## Before (Using String Literals)

```typescript
interface Report {
  id: string;
  title: string;
  type: 'market_analysis' | 'portfolio_summary' | 'roi_analysis' | 'comparative_analysis';
  date: string;
  status: 'ready' | 'generating' | 'draft';
  size?: string;
}

const sampleReports: Report[] = [
  {
    id: '1',
    title: 'Q3 Portfolio Performance',
    type: 'portfolio_summary',  // Easy to mistype!
    date: '2 days ago',
    status: 'ready',
    size: '2.3 MB'
  }
];

function getStatusBadge(status: string) {
  switch (status) {
    case 'ready':  // Magic strings everywhere
      return <Badge variant="success" size="sm">Ready</Badge>;
    case 'generating':
      return <Badge variant="warning" size="sm">Generating</Badge>;
    case 'draft':
      return <Badge variant="default" size="sm">Draft</Badge>;
    default:
      return null;
  }
}
```

## After (Using ENUMs/Const Objects)

```typescript
import { ReportStatus, ReportType, BadgeVariant } from '@/types/enums';
import type { 
  ReportStatus as ReportStatusType, 
  ReportType as ReportTypeType,
  BadgeVariant as BadgeVariantType
} from '@/types/enums';

interface Report {
  id: string;
  title: string;
  type: ReportTypeType;  // Type-safe!
  date: string;
  status: ReportStatusType;  // Type-safe!
  size?: string;
}

const sampleReports: Report[] = [
  {
    id: '1',
    title: 'Q3 Portfolio Performance',
    type: ReportType.PortfolioSummary,  // Autocomplete works!
    date: '2 days ago',
    status: ReportStatus.Ready,
    size: '2.3 MB'
  }
];

// Cleaner configuration
const statusBadgeConfig: Record<ReportStatusType, { variant: BadgeVariantType; label: string }> = {
  [ReportStatus.Ready]: { variant: BadgeVariant.Success, label: 'Ready' },
  [ReportStatus.Generating]: { variant: BadgeVariant.Warning, label: 'Generating' },
  [ReportStatus.Draft]: { variant: BadgeVariant.Default, label: 'Draft' }
};

function getStatusBadge(status: ReportStatusType) {
  const config = statusBadgeConfig[status];
  return <Badge variant={config.variant} size="sm">{config.label}</Badge>;
}
```

## Benefits of the Refactoring

### 1. Type Safety
- **Before:** `type: 'porfolio_summary'` (typo!) - compiles fine, breaks at runtime
- **After:** `type: ReportType.PortfolioSummary` - TypeScript catches typos immediately

### 2. Autocomplete & Discoverability
- **Before:** Need to remember or look up valid strings
- **After:** Press `.` after `ReportType` and see all options

### 3. Refactoring
- **Before:** Search for string `'ready'` - finds unrelated strings too
- **After:** "Find all references" to `ReportStatus.Ready` - exact matches only

### 4. Consistency
- **Before:** Easy to accidentally use `'Ready'` instead of `'ready'`
- **After:** Only one way to reference: `ReportStatus.Ready`

### 5. Documentation
- **Before:** Valid values scattered across codebase
- **After:** All valid values in one central location (`/src/types/enums.ts`)

### 6. Reduced Magic Strings
- **Before:** 
  ```typescript
  if (status === 'ready') {
    // What other values are valid? 🤷
  }
  ```
- **After:**
  ```typescript
  if (status === ReportStatus.Ready) {
    // Crystal clear! Can see all options via autocomplete
  }
  ```

## Real-World Usage Examples

### Example 1: Filtering
```typescript
// Before
const readyReports = reports.filter(r => r.status === 'ready');

// After
const readyReports = reports.filter(r => r.status === ReportStatus.Ready);
```

### Example 2: Conditional Rendering
```typescript
// Before - prone to typos
{status === 'ready' && <DownloadButton />}

// After - type-safe
{status === ReportStatus.Ready && <DownloadButton />}
```

### Example 3: API Integration
```typescript
// Before
async function fetchReports(type: string) {
  return api.get(`/reports?type=${type}`);
}
fetchReports('market_analysis'); // Easy to mistype!

// After
async function fetchReports(type: ReportType) {
  return api.get(`/reports?type=${type}`);
}
fetchReports(ReportType.MarketAnalysis); // Type-safe!
```

### Example 4: Creating Enums from API Data
```typescript
// Validate API response
function parseReportFromAPI(data: any): Report | null {
  // Type guard
  if (!isValidReportStatus(data.status)) {
    console.error('Invalid status:', data.status);
    return null;
  }
  
  return {
    id: data.id,
    title: data.title,
    type: data.type as ReportType,
    status: data.status, // Now type-safe!
    date: data.date
  };
}

function isValidReportStatus(value: string): value is ReportStatus {
  return Object.values(ReportStatus).includes(value as ReportStatus);
}
```

## Migration Strategy

1. **Create central enum file** - ✅ Already done in `/src/types/enums.ts`
2. **Start with new code** - Use enums in all new components/files
3. **Refactor incrementally** - Update existing files as you work on them
4. **High-traffic files first** - Prioritize frequently-edited components
5. **Test thoroughly** - Ensure string values match exactly

## Common Pitfalls to Avoid

### ❌ Don't mix approaches
```typescript
// Bad - inconsistent
if (status === ReportStatus.Ready || status === 'draft') {
  
}

// Good - consistent
if (status === ReportStatus.Ready || status === ReportStatus.Draft) {
  
}
```

### ❌ Don't forget validation
```typescript
// Bad - blindly trusting API
const status = apiResponse.status as ReportStatus;

// Good - validate first
const status = isValidReportStatus(apiResponse.status) 
  ? apiResponse.status 
  : ReportStatus.Draft;
```

### ❌ Don't hardcode the string value
```typescript
// Bad - defeats the purpose
api.post('/reports', { status: 'ready' });

// Good - use the constant
api.post('/reports', { status: ReportStatus.Ready });
```
