/* eslint-disable */
// @ts-nocheck
// FILE: src/examples/enum-usage-examples.tsx
// This file demonstrates how to use the const object enums in various scenarios
// Note: Functions and variables are intentionally unused as this is a reference file

import { 
  ReportStatus, 
  ReportType, 
  Priority,
  BadgeVariant,
  AvatarSize,
  ToolStatus,
  MessageRole,
  ToolKind
} from '@/types/enums';

// ============================================================================
// EXAMPLE 1: Using enum values in function parameters
// ============================================================================

function getReportStatusColor(status: ReportStatus): string {
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

// Usage:
const color1 = getReportStatusColor(ReportStatus.Ready); // ✅ Type-safe
// const color2 = getReportStatusColor('invalid'); // ❌ TypeScript error


// ============================================================================
// EXAMPLE 2: Using enum values in object/interface definitions
// ============================================================================

interface Report {
  id: string;
  title: string;
  type: ReportType; // Type-safe: only accepts valid report types
  status: ReportStatus; // Type-safe: only accepts valid statuses
  priority: Priority;
}

const myReport: Report = {
  id: '123',
  title: 'Market Analysis',
  type: ReportType.MarketAnalysis, // ✅ Using enum value
  status: ReportStatus.Ready,
  priority: Priority.High
};


// ============================================================================
// EXAMPLE 3: Using enum values in React component props
// ============================================================================

interface BadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
}

function Badge({ variant, children }: BadgeProps) {
  const colors = {
    [BadgeVariant.Default]: 'bg-gray-100 text-gray-800',
    [BadgeVariant.Success]: 'bg-green-100 text-green-800',
    [BadgeVariant.Warning]: 'bg-yellow-100 text-yellow-800',
    [BadgeVariant.Danger]: 'bg-red-100 text-red-800',
    [BadgeVariant.Primary]: 'bg-blue-100 text-blue-800'
  };

  return <span className={colors[variant]}>{children}</span>;
}

// Usage in JSX:
// <Badge variant={BadgeVariant.Success}>Complete</Badge>
// <Badge variant={BadgeVariant.Danger}>Error</Badge>


// ============================================================================
// EXAMPLE 4: Iterating over all enum values
// ============================================================================

// Get all values as an array
const allPriorities = Object.values(Priority);
console.log(allPriorities); // ['high', 'medium', 'low']

// Get all keys and values
const priorityEntries = Object.entries(Priority);
console.log(priorityEntries); // [['High', 'high'], ['Medium', 'medium'], ['Low', 'low']]

// Create dropdown options
const priorityOptions = Object.entries(Priority).map(([key, value]) => ({
  label: key,
  value: value
}));
// Result: [{ label: 'High', value: 'high' }, ...]


// ============================================================================
// EXAMPLE 5: Type guards and validation
// ============================================================================

function isValidReportStatus(value: string): value is ReportStatus {
  return Object.values(ReportStatus).includes(value as ReportStatus);
}

// Usage:
const userInput = 'ready';
if (isValidReportStatus(userInput)) {
  // TypeScript now knows userInput is ReportStatus
  console.log('Valid status:', userInput);
}


// ============================================================================
// EXAMPLE 6: Using with API responses
// ============================================================================

interface ApiResponse {
  id: string;
  status: string; // From API, not typed
  role: string;
}

function processApiResponse(response: ApiResponse) {
  // Validate and convert API string to enum
  if (isValidReportStatus(response.status)) {
    const typedStatus: ReportStatus = response.status;
    // Now you can use it safely with type checking
    getReportStatusColor(typedStatus);
  }
}


// ============================================================================
// EXAMPLE 7: Default values and optional props
// ============================================================================

interface UserAvatarProps {
  name: string;
  size?: AvatarSize; // Optional, will have default
}

function UserAvatar({ name, size = AvatarSize.Medium }: UserAvatarProps) {
  const sizeClasses = {
    [AvatarSize.Small]: 'w-8 h-8',
    [AvatarSize.Medium]: 'w-10 h-10',
    [AvatarSize.Large]: 'w-12 h-12'
  };

  return <div className={sizeClasses[size]}>{name[0]}</div>;
}


// ============================================================================
// EXAMPLE 8: Discriminated unions with enums
// ============================================================================

type ToolResult = 
  | {
      kind: typeof ToolKind.ROIAnalysis;
      data: { roi: number; cashFlow: number };
      status: ToolStatus;
    }
  | {
      kind: typeof ToolKind.MarketData;
      data: { location: string; price: string };
      status: ToolStatus;
    };

function processToolResult(result: ToolResult) {
  switch (result.kind) {
    case ToolKind.ROIAnalysis:
      // TypeScript knows result.data has roi and cashFlow
      console.log('ROI:', result.data.roi);
      break;
    case ToolKind.MarketData:
      // TypeScript knows result.data has location and price
      console.log('Location:', result.data.location);
      break;
  }
}


// ============================================================================
// EXAMPLE 9: Creating helper functions
// ============================================================================

const PriorityConfig = {
  [Priority.High]: { color: 'red', order: 1 },
  [Priority.Medium]: { color: 'yellow', order: 2 },
  [Priority.Low]: { color: 'gray', order: 3 }
} as const;

function getPriorityOrder(priority: Priority): number {
  return PriorityConfig[priority].order;
}

function sortByPriority<T extends { priority: Priority }>(items: T[]): T[] {
  return items.sort((a, b) => 
    getPriorityOrder(a.priority) - getPriorityOrder(b.priority)
  );
}


// ============================================================================
// EXAMPLE 10: Using with React hooks and state
// ============================================================================

import { useState } from 'react';

function ReportGenerator() {
  const [status, setStatus] = useState<ReportStatus>(ReportStatus.Draft);
  const [type, setType] = useState<ReportType>(ReportType.MarketAnalysis);

  const handleGenerate = () => {
    setStatus(ReportStatus.Generating);
    // Simulate generation
    setTimeout(() => {
      setStatus(ReportStatus.Ready);
    }, 2000);
  };

  return (
    <div>
      <select 
        value={type} 
        onChange={(e) => setType(e.target.value as ReportType)}
      >
        {Object.entries(ReportType).map(([key, value]) => (
          <option key={value} value={value}>{key}</option>
        ))}
      </select>
      
      <button onClick={handleGenerate}>Generate</button>
      
      <div>Status: {status}</div>
    </div>
  );
}


// ============================================================================
// BENEFITS OF THIS APPROACH:
// ============================================================================
// 
// 1. Type Safety: TypeScript ensures you only use valid values
// 2. Autocomplete: IDEs can suggest all available enum values
// 3. Refactoring: Rename a value and TypeScript finds all usages
// 4. No Magic Strings: Easy to find all places a value is used
// 5. Documentation: Clear set of valid values in one place
// 6. Runtime Access: Unlike type aliases, you can iterate over values
// 7. Bundle Size: With 'as const', these are fully inlined at compile time
// 8. Works with strict mode: Compatible with erasableSyntaxOnly
//
// ============================================================================

export {};
