// FILE: src/utils/csvTemplate.ts
/**
 * CSV Template Generation Utilities
 * Provides downloadable CSV templates for bulk property import
 */

export interface CsvTemplateColumn {
  field: string;
  label: string;
  required: boolean;
  example: string;
  description: string;
}

export const PROPERTY_IMPORT_TEMPLATE: CsvTemplateColumn[] = [
  {
    field: 'address',
    label: 'Address',
    required: true,
    example: '123 Main St, Apt 4B',
    description: 'Full property address',
  },
  {
    field: 'city',
    label: 'City',
    required: false,
    example: 'New York',
    description: 'City name',
  },
  {
    field: 'state',
    label: 'State',
    required: false,
    example: 'NY',
    description: 'State abbreviation',
  },
  {
    field: 'zip_code',
    label: 'ZIP Code',
    required: false,
    example: '10001',
    description: 'Postal code',
  },
  {
    field: 'purchase_price',
    label: 'Purchase Price',
    required: true,
    example: '250000',
    description: 'Property purchase price (no commas or $)',
  },
  {
    field: 'purchase_date',
    label: 'Purchase Date',
    required: true,
    example: '2024-01-15',
    description: 'Date in YYYY-MM-DD format',
  },
  {
    field: 'down_payment',
    label: 'Down Payment',
    required: true,
    example: '50000',
    description: 'Down payment amount',
  },
  {
    field: 'loan_amount',
    label: 'Loan Amount',
    required: true,
    example: '200000',
    description: 'Mortgage loan amount',
  },
  {
    field: 'interest_rate',
    label: 'Interest Rate',
    required: true,
    example: '6.5',
    description: 'Interest rate percentage (e.g., 6.5 for 6.5%)',
  },
  {
    field: 'loan_term_years',
    label: 'Loan Term (Years)',
    required: true,
    example: '30',
    description: 'Mortgage term in years',
  },
  {
    field: 'monthly_rent',
    label: 'Monthly Rent',
    required: true,
    example: '2500',
    description: 'Expected monthly rental income',
  },
  {
    field: 'property_tax',
    label: 'Monthly Property Tax',
    required: true,
    example: '400',
    description: 'Monthly property tax',
  },
  {
    field: 'insurance',
    label: 'Monthly Insurance',
    required: true,
    example: '150',
    description: 'Monthly insurance premium',
  },
  {
    field: 'maintenance',
    label: 'Monthly Maintenance',
    required: true,
    example: '200',
    description: 'Monthly maintenance budget',
  },
  {
    field: 'property_management',
    label: 'Monthly Management Fee',
    required: true,
    example: '250',
    description: 'Monthly property management fee',
  },
  {
    field: 'utilities',
    label: 'Monthly Utilities',
    required: false,
    example: '100',
    description: 'Monthly utilities (if paid by owner)',
  },
  {
    field: 'hoa',
    label: 'Monthly HOA',
    required: false,
    example: '300',
    description: 'Monthly HOA fee',
  },
  {
    field: 'closing_costs',
    label: 'Closing Costs',
    required: true,
    example: '5000',
    description: 'Total closing costs',
  },
  {
    field: 'renovation_costs',
    label: 'Renovation Costs',
    required: true,
    example: '15000',
    description: 'Total renovation/repair costs',
  },
  {
    field: 'current_value',
    label: 'Current Value',
    required: true,
    example: '275000',
    description: 'Current estimated property value',
  },
  {
    field: 'notes',
    label: 'Notes',
    required: false,
    example: 'Recently renovated kitchen',
    description: 'Additional notes or comments',
  },
  {
    field: 'tags',
    label: 'Tags',
    required: false,
    example: 'LTR,Renovated,City Center',
    description: 'Comma-separated tags',
  },
];

/**
 * Generate CSV template content as a string
 */
export function generateCsvTemplate(): string {
  // Header row (field names)
  const headers = PROPERTY_IMPORT_TEMPLATE.map(col => col.field).join(',');
  
  // Example row
  const exampleRow = PROPERTY_IMPORT_TEMPLATE.map(col => {
    // Escape values that contain commas
    const value = col.example;
    if (value.includes(',')) {
      return `"${value}"`;
    }
    return value;
  }).join(',');

  return `${headers}\n${exampleRow}`;
}

/**
 * Download CSV template file
 */
export function downloadCsvTemplate(filename: string = 'property_import_template.csv'): void {
  const csvContent = generateCsvTemplate();
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

/**
 * Get CSV template information for UI display
 */
export function getCsvTemplateInfo() {
  const requiredFields = PROPERTY_IMPORT_TEMPLATE.filter(col => col.required).length;
  const totalFields = PROPERTY_IMPORT_TEMPLATE.length;
  
  return {
    requiredFields,
    totalFields,
    optionalFields: totalFields - requiredFields,
    columns: PROPERTY_IMPORT_TEMPLATE,
  };
}
