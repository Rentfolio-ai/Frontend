/* eslint-disable */
// @ts-nocheck
// Quick Reference: ENUMs in This Project
// Copy-paste these examples as needed!
// Note: This is a reference file with intentionally unused code snippets

import { ReportStatus, ReportType, Priority, BadgeVariant } from '@/types/enums';
import type { 
  ReportStatus as ReportStatusType,
  ReportType as ReportTypeType,
  Priority as PriorityType
} from '@/types/enums';

// ============================================================================
// 1️⃣  BASIC USAGE - In Function Parameters
// ============================================================================

function processReport(status: ReportStatusType) {
  if (status === ReportStatus.Ready) {
    console.log('Process ready report');
  }
}

processReport(ReportStatus.Ready); // ✅ Type-safe


// ============================================================================
// 2️⃣  IN INTERFACES - Type-Safe Properties
// ============================================================================

interface Report {
  id: string;
  title: string;
  type: ReportTypeType;
  status: ReportStatusType;
}

const myReport: Report = {
  id: '1',
  title: 'Market Analysis',
  type: ReportType.MarketAnalysis,
  status: ReportStatus.Ready
};


// ============================================================================
// 3️⃣  SWITCH STATEMENTS - Pattern Matching
// ============================================================================

function getStatusIcon(status: ReportStatusType): string {
  switch (status) {
    case ReportStatus.Ready:
      return '✓';
    case ReportStatus.Generating:
      return '⏳';
    case ReportStatus.Draft:
      return '📝';
    default:
      return '?';
  }
}


// ============================================================================
// 4️⃣  OBJECT MAPPING - Configuration Objects
// ============================================================================

const statusConfig = {
  [ReportStatus.Ready]: { color: 'green', icon: '✓' },
  [ReportStatus.Generating]: { color: 'yellow', icon: '⏳' },
  [ReportStatus.Draft]: { color: 'gray', icon: '📝' }
};

const config = statusConfig[ReportStatus.Ready];


// ============================================================================
// 5️⃣  REACT PROPS - Component Interfaces
// ============================================================================

interface StatusBadgeProps {
  status: ReportStatusType;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const styles = {
    [ReportStatus.Ready]: 'bg-green-100 text-green-800',
    [ReportStatus.Generating]: 'bg-yellow-100 text-yellow-800',
    [ReportStatus.Draft]: 'bg-gray-100 text-gray-800'
  };
  
  return <span className={styles[status]}>{status}</span>;
}

// Usage: <StatusBadge status={ReportStatus.Ready} />


// ============================================================================
// 6️⃣  DEFAULT VALUES - Optional Props
// ============================================================================

interface Props {
  priority?: PriorityType;
}

function Task({ priority = Priority.Medium }: Props) {
  return <div>Priority: {priority}</div>;
}


// ============================================================================
// 7️⃣  ITERATING VALUES - Dropdowns/Lists
// ============================================================================

function StatusDropdown() {
  const options = Object.entries(ReportStatus).map(([key, value]) => (
    <option key={value} value={value}>
      {key}
    </option>
  ));
  
  return <select>{options}</select>;
}


// ============================================================================
// 8️⃣  TYPE GUARDS - Validating External Data
// ============================================================================

function isValidStatus(value: string): value is ReportStatusType {
  return Object.values(ReportStatus).includes(value as ReportStatusType);
}

// Usage with API data:
const apiStatus = 'ready';
if (isValidStatus(apiStatus)) {
  // TypeScript knows apiStatus is ReportStatusType
  processReport(apiStatus);
}


// ============================================================================
// 9️⃣  ARRAY FILTERS - Filtering Collections
// ============================================================================

const reports: Report[] = []; // Initialize with empty array for example

const readyReports = reports.filter(r => r.status === ReportStatus.Ready);
const draftReports = reports.filter(r => r.status === ReportStatus.Draft);


// ============================================================================
// 🔟  CONDITIONAL RENDERING - React JSX
// ============================================================================

function ReportActions({ status }: { status: ReportStatusType }) {
  return (
    <div>
      {status === ReportStatus.Ready && <DownloadButton />}
      {status === ReportStatus.Generating && <ProgressBar />}
      {status === ReportStatus.Draft && <EditButton />}
    </div>
  );
}


// ============================================================================
// 🎯  QUICK TIPS
// ============================================================================

// ✅  DO: Use enum constants
const status = ReportStatus.Ready;

// ❌  DON'T: Use magic strings
const status = 'ready';

// ✅  DO: Import both value and type
import { ReportStatus } from '@/types/enums';
import type { ReportStatus as ReportStatusType } from '@/types/enums';

// ✅  DO: Use in all new code
function newFeature(status: ReportStatusType) { }

// ✅  DO: Validate external data
if (isValidStatus(apiData.status)) {
  processReport(apiData.status);
}

// ❌  DON'T: Mix strings and enums
if (status === ReportStatus.Ready || status === 'draft') { } // Bad!

export {};
