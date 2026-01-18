/**
 * CSV/Excel Import Dialog for Portfolios
 * Clean, professional import experience
 */

import React, { useState, useCallback } from 'react';
import { X, Upload, FileSpreadsheet, Download, AlertCircle, CheckCircle, Info } from 'lucide-react';

interface CSVImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: any[]) => Promise<void>;
  portfolioId: string;
}

interface ParsedRow {
  address: string;
  purchasePrice?: number;
  purchaseDate?: string;
  currentValue?: number;
  monthlyRent?: number;
  monthlyExpenses?: number;
  propertyType?: string;
  bedrooms?: number;
  bathrooms?: number;
  sqft?: number;
  notes?: string;
  [key: string]: any;
}

interface ValidationError {
  row: number;
  field: string;
  message: string;
}

export const CSVImportDialog: React.FC<CSVImportDialogProps> = ({
  isOpen,
  onClose,
  onImport,
  portfolioId,
}) => {
  const [step, setStep] = useState<'upload' | 'mapping' | 'preview' | 'importing' | 'complete'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [rawData, setRawData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [fieldMapping, setFieldMapping] = useState<Record<string, string>>({});
  const [parsedData, setParsedData] = useState<ParsedRow[]>([]);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [importProgress, setImportProgress] = useState(0);

  const requiredFields = ['address'];
  const optionalFields = [
    'purchasePrice', 'purchaseDate', 'currentValue', 'monthlyRent',
    'monthlyExpenses', 'propertyType', 'bedrooms', 'bathrooms', 'sqft', 'notes'
  ];

  const fieldLabels: Record<string, string> = {
    address: 'Property Address',
    purchasePrice: 'Purchase Price',
    purchaseDate: 'Purchase Date',
    currentValue: 'Current Value',
    monthlyRent: 'Monthly Rent',
    monthlyExpenses: 'Monthly Expenses',
    propertyType: 'Property Type',
    bedrooms: 'Bedrooms',
    bathrooms: 'Bathrooms',
    sqft: 'Square Feet',
    notes: 'Notes',
  };

  // Parse CSV file
  const parseCSV = (text: string): any[] => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length === 0) return [];

    const headers = lines[0].split(',').map(h => h.trim());
    const data = lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim());
      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      return row;
    });

    return data;
  };

  // Handle file selection
  const handleFileChange = useCallback((selectedFile: File) => {
    setFile(selectedFile);
    const reader = new FileReader();

    reader.onload = (e) => {
      const text = e.target?.result as string;
      const data = parseCSV(text);

      if (data.length > 0) {
        const headers = Object.keys(data[0]);
        setHeaders(headers);
        setRawData(data);

        // Auto-detect field mappings
        const autoMapping: Record<string, string> = {};
        headers.forEach(header => {
          const normalized = header.toLowerCase().replace(/[^a-z]/g, '');
          
          // Try to match common column names
          if (normalized.includes('address') || normalized.includes('street') || normalized.includes('property')) {
            autoMapping['address'] = header;
          } else if (normalized.includes('purchase') && (normalized.includes('price') || normalized.includes('cost'))) {
            autoMapping['purchasePrice'] = header;
          } else if (normalized.includes('purchase') && normalized.includes('date')) {
            autoMapping['purchaseDate'] = header;
          } else if (normalized.includes('current') && normalized.includes('value')) {
            autoMapping['currentValue'] = header;
          } else if (normalized.includes('rent') || normalized.includes('income')) {
            autoMapping['monthlyRent'] = header;
          } else if (normalized.includes('expense') || normalized.includes('cost')) {
            autoMapping['monthlyExpenses'] = header;
          } else if (normalized.includes('type')) {
            autoMapping['propertyType'] = header;
          } else if (normalized.includes('bed')) {
            autoMapping['bedrooms'] = header;
          } else if (normalized.includes('bath')) {
            autoMapping['bathrooms'] = header;
          } else if (normalized.includes('sqft') || normalized.includes('square')) {
            autoMapping['sqft'] = header;
          } else if (normalized.includes('note')) {
            autoMapping['notes'] = header;
          }
        });

        setFieldMapping(autoMapping);
        setStep('mapping');
      }
    };

    reader.readAsText(selectedFile);
  }, []);

  // Handle drag and drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  // Validate and parse data with field mapping
  const validateAndParse = () => {
    const parsed: ParsedRow[] = [];
    const validationErrors: ValidationError[] = [];

    rawData.forEach((row, index) => {
      const mappedRow: any = {};
      let hasRequiredFields = true;

      // Check required fields
      requiredFields.forEach(field => {
        const sourceColumn = fieldMapping[field];
        if (sourceColumn && row[sourceColumn]) {
          mappedRow[field] = row[sourceColumn];
        } else {
          hasRequiredFields = false;
          validationErrors.push({
            row: index + 2, // +2 because index 0 = row 2 (after header)
            field,
            message: `Missing required field: ${fieldLabels[field]}`
          });
        }
      });

      // Map optional fields
      optionalFields.forEach(field => {
        const sourceColumn = fieldMapping[field];
        if (sourceColumn && row[sourceColumn]) {
          let value = row[sourceColumn];
          
          // Type conversions
          if (field.includes('Price') || field.includes('Value') || field.includes('Rent') || field.includes('Expenses')) {
            value = parseFloat(value.replace(/[^0-9.-]/g, ''));
            if (isNaN(value)) value = undefined;
          } else if (field === 'bedrooms' || field === 'bathrooms' || field === 'sqft') {
            value = parseInt(value);
            if (isNaN(value)) value = undefined;
          }
          
          mappedRow[field] = value;
        }
      });

      if (hasRequiredFields) {
        parsed.push(mappedRow);
      }
    });

    setParsedData(parsed);
    setErrors(validationErrors);
    setStep('preview');
  };

  // Perform import
  const handleImport = async () => {
    setStep('importing');
    setImportProgress(0);

    try {
      // Simulate progress (in real implementation, this would be actual import progress)
      for (let i = 0; i <= 100; i += 10) {
        setImportProgress(i);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      await onImport(parsedData);
      setStep('complete');
    } catch (error) {
      console.error('Import failed:', error);
      // Handle error
    }
  };

  // Download template
  const downloadTemplate = () => {
    const template = [
      'Property Address,Purchase Price,Purchase Date,Current Value,Monthly Rent,Monthly Expenses,Property Type,Bedrooms,Bathrooms,Square Feet,Notes',
      '123 Main St, Anytown, CA 12345,450000,2020-01-15,500000,2800,1200,Single Family,3,2,1800,Great investment property',
      '456 Oak Ave, Somewhere, TX 67890,325000,2019-06-01,375000,1950,850,Condo,2,2,1200,Near downtown',
    ].join('\n');

    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vasthu-portfolio-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Reset and close
  const handleClose = () => {
    setStep('upload');
    setFile(null);
    setRawData([]);
    setHeaders([]);
    setFieldMapping({});
    setParsedData([]);
    setErrors([]);
    setImportProgress(0);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-4xl bg-[#1a1a1a] rounded-xl border border-white/[0.12] shadow-xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/[0.08]">
          <div>
            <h2 className="text-xl font-semibold text-white mb-1">Import Properties</h2>
            <p className="text-sm text-white/50">
              {step === 'upload' && 'Upload your CSV or Excel file'}
              {step === 'mapping' && 'Map your columns to Vasthu fields'}
              {step === 'preview' && 'Review and confirm import'}
              {step === 'importing' && 'Importing properties...'}
              {step === 'complete' && 'Import complete!'}
            </p>
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-white/[0.05] rounded-lg transition-colors">
            <X className="w-5 h-5 text-white/60" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Step 1: Upload */}
          {step === 'upload' && (
            <div className="space-y-6">
              {/* Download Template */}
              <div className="p-4 rounded-lg bg-white/[0.03] border border-white/[0.08]">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-white/60 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-white/80 mb-2">
                      First time importing? Download our template to see the expected format.
                    </p>
                    <button
                      onClick={downloadTemplate}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm bg-white/[0.08] hover:bg-white/[0.12] text-white rounded-lg transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Download Template
                    </button>
                  </div>
                </div>
              </div>

              {/* Upload Area */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
                  dragActive
                    ? 'border-white/[0.3] bg-white/[0.05]'
                    : 'border-white/[0.12] hover:border-white/[0.2] hover:bg-white/[0.02]'
                }`}
              >
                <FileSpreadsheet className="w-12 h-12 mx-auto mb-4 text-white/40" />
                <p className="text-white/80 mb-2">Drag and drop your CSV or Excel file here</p>
                <p className="text-sm text-white/40 mb-4">or</p>
                <label className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-white/90 text-[#1a1a1a] rounded-lg font-medium transition-all cursor-pointer">
                  <Upload className="w-4 h-4" />
                  Choose File
                  <input
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Supported Formats */}
              <div className="text-center">
                <p className="text-xs text-white/40">
                  Supported formats: CSV, Excel (.xlsx, .xls)
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Field Mapping */}
          {step === 'mapping' && (
            <div className="space-y-6">
              <div className="p-4 rounded-lg bg-white/[0.03] border border-white/[0.08]">
                <p className="text-sm text-white/70">
                  <strong className="text-white/90">{rawData.length}</strong> rows found. 
                  Map your columns to Vasthu fields below.
                </p>
              </div>

              <div className="space-y-3">
                {/* Required Fields */}
                <div>
                  <h3 className="text-sm font-medium text-white/90 mb-3">Required Fields</h3>
                  {requiredFields.map(field => (
                    <div key={field} className="flex items-center gap-3 mb-3">
                      <label className="w-40 text-sm text-white/70">
                        {fieldLabels[field]} <span className="text-red-400">*</span>
                      </label>
                      <select
                        value={fieldMapping[field] || ''}
                        onChange={(e) => setFieldMapping({ ...fieldMapping, [field]: e.target.value })}
                        className="flex-1 px-3 py-2 bg-white/[0.05] border border-white/[0.08] rounded-lg text-white text-sm focus:border-white/[0.2] focus:outline-none"
                      >
                        <option value="">-- Select Column --</option>
                        {headers.map(header => (
                          <option key={header} value={header}>{header}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>

                {/* Optional Fields */}
                <div>
                  <h3 className="text-sm font-medium text-white/90 mb-3 mt-6">Optional Fields</h3>
                  {optionalFields.map(field => (
                    <div key={field} className="flex items-center gap-3 mb-3">
                      <label className="w-40 text-sm text-white/50">
                        {fieldLabels[field]}
                      </label>
                      <select
                        value={fieldMapping[field] || ''}
                        onChange={(e) => setFieldMapping({ ...fieldMapping, [field]: e.target.value })}
                        className="flex-1 px-3 py-2 bg-white/[0.05] border border-white/[0.08] rounded-lg text-white/70 text-sm focus:border-white/[0.2] focus:outline-none"
                      >
                        <option value="">-- Skip This Field --</option>
                        {headers.map(header => (
                          <option key={header} value={header}>{header}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Preview */}
          {step === 'preview' && (
            <div className="space-y-6">
              {/* Errors */}
              {errors.length > 0 && (
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-red-400 mb-2">
                        {errors.length} validation {errors.length === 1 ? 'error' : 'errors'} found
                      </p>
                      <ul className="space-y-1">
                        {errors.slice(0, 5).map((error, i) => (
                          <li key={i} className="text-xs text-red-300">
                            Row {error.row}: {error.message}
                          </li>
                        ))}
                        {errors.length > 5 && (
                          <li className="text-xs text-red-300">
                            ...and {errors.length - 5} more errors
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Success Summary */}
              {parsedData.length > 0 && (
                <div className="p-4 rounded-lg bg-white/[0.03] border border-white/[0.08]">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-white/60 mt-0.5" />
                    <div>
                      <p className="text-sm text-white/90">
                        <strong>{parsedData.length}</strong> {parsedData.length === 1 ? 'property' : 'properties'} ready to import
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Preview Table */}
              <div className="border border-white/[0.08] rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-white/[0.03]">
                      <tr className="border-b border-white/[0.06]">
                        <th className="px-4 py-3 text-left text-xs font-medium text-white/50">Address</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-white/50">Purchase Price</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-white/50">Monthly Rent</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-white/50">Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parsedData.slice(0, 10).map((row, i) => (
                        <tr key={i} className="border-b border-white/[0.06] hover:bg-white/[0.02]">
                          <td className="px-4 py-3 text-white/80">{row.address}</td>
                          <td className="px-4 py-3 text-right text-white/70">
                            {row.purchasePrice ? `$${row.purchasePrice.toLocaleString()}` : '—'}
                          </td>
                          <td className="px-4 py-3 text-right text-white/70">
                            {row.monthlyRent ? `$${row.monthlyRent.toLocaleString()}` : '—'}
                          </td>
                          <td className="px-4 py-3 text-center text-white/70">{row.propertyType || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {parsedData.length > 10 && (
                  <div className="px-4 py-3 bg-white/[0.02] text-center text-xs text-white/40">
                    ...and {parsedData.length - 10} more properties
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 4: Importing */}
          {step === 'importing' && (
            <div className="py-12 text-center">
              <div className="w-16 h-16 mx-auto mb-6 relative">
                <div className="absolute inset-0 border-4 border-white/[0.1] rounded-full"></div>
                <div
                  className="absolute inset-0 border-4 border-white border-t-transparent rounded-full animate-spin"
                  style={{ animationDuration: '1s' }}
                ></div>
              </div>
              <p className="text-white/90 mb-2">Importing properties...</p>
              <p className="text-sm text-white/50">{importProgress}% complete</p>
            </div>
          )}

          {/* Step 5: Complete */}
          {step === 'complete' && (
            <div className="py-12 text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-white/[0.08] flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Import Complete!</h3>
              <p className="text-sm text-white/60 mb-6">
                Successfully imported {parsedData.length} {parsedData.length === 1 ? 'property' : 'properties'} to your portfolio
              </p>
              <button
                onClick={handleClose}
                className="px-6 py-2 bg-white hover:bg-white/90 text-[#1a1a1a] rounded-lg font-medium transition-all"
              >
                Done
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        {(step === 'mapping' || step === 'preview') && (
          <div className="flex items-center justify-between p-6 border-t border-white/[0.08]">
            <button
              onClick={() => setStep(step === 'preview' ? 'mapping' : 'upload')}
              className="px-4 py-2 text-white/70 hover:text-white/90 hover:bg-white/[0.05] rounded-lg transition-colors"
            >
              Back
            </button>
            <button
              onClick={step === 'mapping' ? validateAndParse : handleImport}
              disabled={step === 'mapping' && !fieldMapping.address}
              className="px-6 py-2 bg-white hover:bg-white/90 text-[#1a1a1a] rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {step === 'mapping' ? 'Continue' : 'Import Properties'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
