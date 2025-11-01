# How to Use ENUMs in This Project

## Overview

Due to TypeScript's `erasableSyntaxOnly` configuration, we use **const objects with `as const`** instead of traditional enums. This is actually the modern, recommended approach!

## Quick Start

### 1. Define Your Constants (Already done in `/src/types/enums.ts`)

```typescript
export const ReportStatus = {
  Ready: 'ready',
  Generating: 'generating',
  Draft: 'draft'
} as const;

// Export the type as well
export type ReportStatus = typeof ReportStatus[keyof typeof ReportStatus];
```

### 2. Import and Use

```typescript
// Single import works for both type and value!
import { ReportStatus } from '@/types/enums';

// Use in function parameters
function handleReport(status: ReportStatus) {
  if (status === ReportStatus.Ready) {
    console.log('Report is ready!');
  }
}

// Use in interfaces
interface Report {
  id: string;
  status: ReportStatus;  // Used as a type
}

// Use as default value
function MyComponent({ status = ReportStatus.Draft }: { status?: ReportStatus }) {
  // ReportStatus works as both type and value
}
```

## Common Patterns

### Pattern 1: Switch Statements

```typescript
function getStatusColor(status: ReportStatus): string {
  switch (status) {
    case ReportStatus.Ready:
      return 'green';
    case ReportStatus.Generating:
      return 'yellow';
    case ReportStatus.Draft:
      return 'gray';
    default:
      return 'gray';
  }
}
```

### Pattern 2: Object Mapping

```typescript
const statusStyles = {
  [ReportStatus.Ready]: 'bg-green-500',
  [ReportStatus.Generating]: 'bg-yellow-500',
  [ReportStatus.Draft]: 'bg-gray-500'
};

// Usage
<div className={statusStyles[status]}>
```

### Pattern 3: Iterating Over Values

```typescript
// Get all values as array
const allStatuses = Object.values(ReportStatus);

// Create dropdown options
const options = Object.entries(ReportStatus).map(([key, value]) => ({
  label: key,
  value: value
}));

// Result: [{ label: 'Ready', value: 'ready' }, ...]
```

### Pattern 4: Type Guards

```typescript
function isValidStatus(value: string): value is ReportStatus {
  return Object.values(ReportStatus).includes(value as ReportStatus);
}

// Usage with API data
const apiStatus = 'ready';
if (isValidStatus(apiStatus)) {
  // TypeScript knows apiStatus is ReportStatus
  handleReport(apiStatus);
}
```

### Pattern 5: React Component Props

```typescript
interface BadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
}

export function Badge({ variant, children }: BadgeProps) {
  const styles = {
    [BadgeVariant.Success]: 'bg-green-100',
    [BadgeVariant.Warning]: 'bg-yellow-100',
    [BadgeVariant.Danger]: 'bg-red-100'
  };
  
  return <span className={styles[variant]}>{children}</span>;
}

// Usage in JSX
<Badge variant={BadgeVariant.Success}>Complete</Badge>
```

## Available Constants

All constants are defined in `/src/types/enums.ts`:

- `AvatarSize` - Small, Medium, Large
- `ReportStatus` - Ready, Generating, Draft
- `ReportType` - MarketAnalysis, PortfolioSummary, ROIAnalysis, ComparativeAnalysis
- `ToolKind` - ROIAnalysis, MarketData, PropertyComparison, Alert
- `ToolStatus` - Success, Warning, Error
- `MessageRole` - User, Assistant
- `Priority` - High, Medium, Low
- `ActionType` - Analysis, Alert, Opportunity, FollowUp
- `PropertyType` - SingleFamily, Condo, Townhouse, MultiFamily, Land
- `BadgeVariant` - Default, Success, Warning, Danger, Primary
- `ButtonVariant` - Default, Primary, Secondary, Outline, Ghost, Danger
- `KPIFormat` - Currency, Percentage, Number, Text
- `Trend` - Up, Down, Neutral
- `SubscriptionTier` - Free, Pro, Enterprise
- `SuggestionCategory` - Market, Analysis, Comparison, Report

## Benefits

✅ **Type Safety** - TypeScript ensures you only use valid values  
✅ **Autocomplete** - IDE suggests all available values  
✅ **Refactoring** - Easy to rename and find all usages  
✅ **No Magic Strings** - All values defined in one place  
✅ **Runtime Access** - Can iterate over values at runtime  
✅ **Better Bundle Size** - Values are inlined at compile time  
✅ **Works with Strict Mode** - Compatible with `erasableSyntaxOnly`

## Migration Guide

### Before (String Literals)
```typescript
interface Props {
  size?: 'sm' | 'md' | 'lg';
}

function Component({ size = 'md' }: Props) {
  if (size === 'sm') { /* ... */ }
}
```

### After (Const Objects)
```typescript
import { AvatarSize } from '@/types/enums';

interface Props {
  size?: AvatarSize;  // Works as a type
}

function Component({ size = AvatarSize.Medium }: Props) {
  if (size === AvatarSize.Small) { /* ... */ }  // Works as a value
}
```

## Best Practices

1. **Single import is all you need** - Our enums export both value and type with the same name
2. **Use the constant value** (e.g., `ReportStatus.Ready`) instead of the string
3. **Validate external data** with type guards before using
4. **Use object mapping** for conditional rendering instead of if/else chains
5. **Prefer constants over magic strings** everywhere in your code

## Examples

See `/src/examples/enum-usage-examples.tsx` for complete, runnable examples of all patterns.
