// FILE: src/components/portfolio/SmartImportDialog.tsx
/**
 * Smart Import Dialog - Enhanced import with preview and column mapping
 * Multi-step wizard: Upload → Mapping → Preview → Confirm
 */

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    Upload,
    FileSpreadsheet,
    Check,
    AlertTriangle,
    AlertCircle,
    ChevronRight,
    ChevronLeft,
    Sparkles,
    Eye,
    Loader2,
} from 'lucide-react';

interface SmartImportDialogProps {
    isOpen: boolean;
    onClose: () => void;
    portfolioId: string;
    userId: string;
    onImportComplete?: (result: ImportResult) => void;
}

interface ImportResult {
    imported: number;
    skipped: number;
    total_rows: number;
}

interface ColumnMapping {
    source_column: string;
    target_field: string;
    confidence: number;
    is_required: boolean;
}

interface Anomaly {
    field: string;
    type: string;
    message: string;
    severity: string;
    suggestion?: string;
}

interface ImportRow {
    row_index: number;
    original_data: Record<string, string>;
    mapped_data: Record<string, unknown>;
    status: 'valid' | 'warning' | 'error' | 'enriched';
    anomalies: Anomaly[];
    enrichment: Record<string, unknown> | null;
    calculated_metrics: Record<string, number> | null;
}

interface ImportPreview {
    import_job_id: string;
    portfolio_id: string;
    total_rows: number;
    valid_rows: number;
    warning_rows: number;
    error_rows: number;
    column_mappings: ColumnMapping[];
    rows: ImportRow[];
    detected_format: string;
    suggested_strategy: string;
    status: string;
}

// Target field options for column mapping
const TARGET_FIELDS = [
    { value: '', label: '— Skip this column —' },
    { value: 'address', label: 'Address *', required: true },
    { value: 'city', label: 'City' },
    { value: 'state', label: 'State' },
    { value: 'zip_code', label: 'ZIP Code' },
    { value: 'purchase_price', label: 'Purchase Price *', required: true },
    { value: 'purchase_date', label: 'Purchase Date' },
    { value: 'monthly_rent', label: 'Monthly Rent' },
    { value: 'current_value', label: 'Current Value' },
    { value: 'beds', label: 'Bedrooms' },
    { value: 'baths', label: 'Bathrooms' },
    { value: 'sqft', label: 'Square Feet' },
    { value: 'property_type', label: 'Property Type' },
    { value: 'strategy', label: 'Strategy (LTR/STR/MTR)' },
    { value: 'down_payment', label: 'Down Payment' },
    { value: 'loan_amount', label: 'Loan Amount' },
    { value: 'interest_rate', label: 'Interest Rate' },
    { value: 'property_tax', label: 'Property Tax' },
    { value: 'insurance', label: 'Insurance' },
    { value: 'hoa', label: 'HOA' },
    { value: 'notes', label: 'Notes' },
];

const statusColors = {
    valid: 'text-green-400 bg-green-500/20',
    enriched: 'text-teal-400 bg-teal-500/20',
    warning: 'text-yellow-400 bg-yellow-500/20',
    error: 'text-red-400 bg-red-500/20',
};

const statusIcons = {
    valid: <Check className="w-4 h-4" />,
    enriched: <Sparkles className="w-4 h-4" />,
    warning: <AlertTriangle className="w-4 h-4" />,
    error: <AlertCircle className="w-4 h-4" />,
};

export const SmartImportDialog: React.FC<SmartImportDialogProps> = ({
    isOpen,
    onClose,
    portfolioId,
    userId,
    onImportComplete,
}) => {
    // Step state: 'upload' | 'mapping' | 'preview' | 'importing' | 'complete'
    const [step, setStep] = useState<'upload' | 'mapping' | 'preview' | 'importing' | 'complete'>('upload');
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<ImportPreview | null>(null);
    const [mappings, setMappings] = useState<ColumnMapping[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<ImportResult | null>(null);

    // Handle file upload
    const handleFileSelect = useCallback(async (selectedFile: File) => {
        setFile(selectedFile);
        setError(null);
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('file', selectedFile);

            // Call API to get preview
            const response = await fetch(
                `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/portfolios/${portfolioId}/import/preview?user_id=${userId}`,
                {
                    method: 'POST',
                    headers: {
                        'X-API-Key': import.meta.env.VITE_API_KEY || '',
                    },
                    body: formData,
                }
            );

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.detail || 'Failed to process file');
            }

            const data: ImportPreview = await response.json();
            setPreview(data);
            setMappings(data.column_mappings);
            setStep('mapping');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to process file');
        } finally {
            setLoading(false);
        }
    }, [portfolioId, userId]);

    // Handle drag and drop
    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile && (droppedFile.name.endsWith('.csv') || droppedFile.name.endsWith('.xlsx'))) {
            handleFileSelect(droppedFile);
        } else {
            setError('Please upload a CSV or Excel file');
        }
    }, [handleFileSelect]);

    // Handle mapping change
    const handleMappingChange = (sourceColumn: string, targetField: string) => {
        setMappings(prev => prev.map(m =>
            m.source_column === sourceColumn
                ? { ...m, target_field: targetField, confidence: 1.0 }
                : m
        ));
    };

    // Proceed to preview
    const handleProceedToPreview = () => {
        // Check required fields are mapped
        const addressMapped = mappings.some(m => m.target_field === 'address');
        const priceMapped = mappings.some(m => m.target_field === 'purchase_price');

        if (!addressMapped || !priceMapped) {
            setError('Address and Purchase Price are required fields');
            return;
        }

        setStep('preview');
    };

    // Confirm import
    const handleConfirmImport = async () => {
        if (!preview) return;

        setStep('importing');
        setError(null);

        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/portfolios/${portfolioId}/import/${preview.import_job_id}/confirm?user_id=${userId}`,
                {
                    method: 'POST',
                    headers: {
                        'X-API-Key': import.meta.env.VITE_API_KEY || '',
                    },
                }
            );

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.detail || 'Failed to import');
            }

            const data = await response.json();
            setResult({
                imported: data.imported,
                skipped: data.skipped,
                total_rows: data.total_rows,
            });
            setStep('complete');
            onImportComplete?.(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Import failed');
            setStep('preview');
        }
    };

    // Reset dialog
    const handleReset = () => {
        setStep('upload');
        setFile(null);
        setPreview(null);
        setMappings([]);
        setError(null);
        setResult(null);
    };

    // Close dialog
    const handleClose = () => {
        handleReset();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
                onClick={handleClose}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="w-full max-w-4xl max-h-[85vh] bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-teal-500/20 text-teal-400">
                                <FileSpreadsheet className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-white">Smart Import</h2>
                                <p className="text-sm text-slate-400">
                                    {step === 'upload' && 'Upload your property spreadsheet'}
                                    {step === 'mapping' && 'Review column mappings'}
                                    {step === 'preview' && 'Preview import data'}
                                    {step === 'importing' && 'Importing properties...'}
                                    {step === 'complete' && 'Import complete!'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleClose}
                            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Progress Steps */}
                    <div className="px-6 py-3 border-b border-white/10 flex items-center gap-2">
                        {['upload', 'mapping', 'preview', 'complete'].map((s, idx) => (
                            <React.Fragment key={s}>
                                <div className={`flex items-center gap-2 ${step === s
                                    ? 'text-teal-400'
                                    : ['complete', 'importing'].includes(step) && idx < 3
                                        ? 'text-green-400'
                                        : 'text-slate-500'
                                    }`}>
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${step === s
                                        ? 'bg-teal-500/20'
                                        : ['complete', 'importing'].includes(step) && idx < 3
                                            ? 'bg-green-500/20'
                                            : 'bg-white/5'
                                        }`}>
                                        {(['complete', 'importing'].includes(step) && idx < 3) ? (
                                            <Check className="w-3 h-3" />
                                        ) : (
                                            idx + 1
                                        )}
                                    </div>
                                    <span className="text-sm capitalize hidden sm:inline">{s}</span>
                                </div>
                                {idx < 3 && (
                                    <ChevronRight className="w-4 h-4 text-slate-600" />
                                )}
                            </React.Fragment>
                        ))}
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-auto p-6">
                        {/* Upload Step */}
                        {step === 'upload' && (
                            <div
                                onDrop={handleDrop}
                                onDragOver={e => e.preventDefault()}
                                className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${loading
                                    ? 'border-teal-500/50 bg-teal-500/5'
                                    : 'border-white/20 hover:border-teal-500/50 hover:bg-white/5'
                                    }`}
                            >
                                {loading ? (
                                    <div className="flex flex-col items-center gap-4">
                                        <Loader2 className="w-12 h-12 text-teal-400 animate-spin" />
                                        <p className="text-slate-300">Processing file...</p>
                                    </div>
                                ) : (
                                    <>
                                        <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-white mb-2">
                                            Drop your file here
                                        </h3>
                                        <p className="text-slate-400 mb-4">
                                            or click to browse (CSV, Excel)
                                        </p>
                                        <input
                                            type="file"
                                            accept=".csv,.xlsx,.xls"
                                            onChange={e => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                                            className="hidden"
                                            id="file-upload"
                                        />
                                        <label
                                            htmlFor="file-upload"
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-teal-500/20 text-teal-400 rounded-lg hover:bg-teal-500/30 cursor-pointer transition-all"
                                        >
                                            <FileSpreadsheet className="w-4 h-4" />
                                            Choose File
                                        </label>
                                    </>
                                )}
                            </div>
                        )}

                        {/* Mapping Step */}
                        {step === 'mapping' && preview && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <p className="text-slate-400 text-sm">
                                            Found {preview.total_rows} rows in {file?.name}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            Strategy suggestion: <span className="text-teal-400">{preview.suggested_strategy}</span>
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-green-400 bg-green-500/20 px-2 py-1 rounded">
                                            {preview.valid_rows} valid
                                        </span>
                                        {preview.warning_rows > 0 && (
                                            <span className="text-xs text-yellow-400 bg-yellow-500/20 px-2 py-1 rounded">
                                                {preview.warning_rows} warnings
                                            </span>
                                        )}
                                        {preview.error_rows > 0 && (
                                            <span className="text-xs text-red-400 bg-red-500/20 px-2 py-1 rounded">
                                                {preview.error_rows} errors
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-white/5 rounded-lg overflow-hidden">
                                    <div className="grid grid-cols-3 gap-4 p-3 bg-white/5 text-sm text-slate-400 font-medium">
                                        <span>CSV Column</span>
                                        <span>Maps To</span>
                                        <span>Confidence</span>
                                    </div>
                                    <div className="divide-y divide-white/5">
                                        {mappings.map((mapping) => (
                                            <div key={mapping.source_column} className="grid grid-cols-3 gap-4 p-3 items-center">
                                                <span className="text-sm text-white font-mono">
                                                    {mapping.source_column}
                                                </span>
                                                <select
                                                    value={mapping.target_field}
                                                    onChange={e => handleMappingChange(mapping.source_column, e.target.value)}
                                                    className="bg-white/10 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-teal-500"
                                                >
                                                    {TARGET_FIELDS.map(opt => (
                                                        <option key={opt.value} value={opt.value} className="bg-slate-900">
                                                            {opt.label}
                                                        </option>
                                                    ))}
                                                </select>
                                                <div className="flex items-center gap-2">
                                                    {mapping.confidence >= 0.8 ? (
                                                        <span className="text-xs text-green-400">High</span>
                                                    ) : mapping.confidence >= 0.5 ? (
                                                        <span className="text-xs text-yellow-400">Medium</span>
                                                    ) : mapping.target_field ? (
                                                        <span className="text-xs text-slate-500">Manual</span>
                                                    ) : (
                                                        <span className="text-xs text-slate-600">Unmapped</span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Preview Step */}
                        {step === 'preview' && preview && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <Eye className="w-5 h-5 text-teal-400" />
                                        <span className="text-white font-medium">Preview Data</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="text-green-400">{preview.valid_rows} ready</span>
                                        {preview.warning_rows > 0 && (
                                            <span className="text-yellow-400">{preview.warning_rows} warnings</span>
                                        )}
                                        {preview.error_rows > 0 && (
                                            <span className="text-red-400">{preview.error_rows} will skip</span>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-white/5 rounded-lg overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="bg-white/5 text-slate-400">
                                                <th className="px-3 py-2 text-left">Status</th>
                                                <th className="px-3 py-2 text-left">Address</th>
                                                <th className="px-3 py-2 text-right">Price</th>
                                                <th className="px-3 py-2 text-right">Rent</th>
                                                <th className="px-3 py-2 text-right">Cap Rate</th>
                                                <th className="px-3 py-2 text-right">Cash Flow</th>
                                                <th className="px-3 py-2 text-left">Issues</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {preview.rows.slice(0, 10).map((row) => (
                                                <tr key={row.row_index} className="hover:bg-white/5">
                                                    <td className="px-3 py-2">
                                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs ${statusColors[row.status]}`}>
                                                            {statusIcons[row.status]}
                                                            {row.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-3 py-2 text-white">
                                                        {row.mapped_data.address as string || '—'}
                                                    </td>
                                                    <td className="px-3 py-2 text-right text-slate-300">
                                                        ${(row.mapped_data.purchase_price as number || 0).toLocaleString()}
                                                    </td>
                                                    <td className="px-3 py-2 text-right text-slate-300">
                                                        ${(row.mapped_data.monthly_rent as number || 0).toLocaleString()}/mo
                                                        {row.enrichment && (
                                                            <span className="text-xs text-teal-400 ml-1">*</span>
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-2 text-right text-slate-300">
                                                        {row.calculated_metrics?.cap_rate?.toFixed(1) || '—'}%
                                                    </td>
                                                    <td className={`px-3 py-2 text-right font-medium ${(row.calculated_metrics?.monthly_cashflow || 0) >= 0
                                                        ? 'text-green-400'
                                                        : 'text-red-400'
                                                        }`}>
                                                        ${row.calculated_metrics?.monthly_cashflow?.toLocaleString() || '—'}/mo
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        {row.anomalies.length > 0 && (
                                                            <span className={`text-xs ${row.anomalies.some(a => a.severity === 'error')
                                                                ? 'text-red-400'
                                                                : 'text-yellow-400'
                                                                }`}>
                                                                {row.anomalies[0].message}
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {preview.rows.length > 10 && (
                                        <div className="px-3 py-2 text-center text-sm text-slate-500 border-t border-white/5">
                                            +{preview.rows.length - 10} more rows
                                        </div>
                                    )}
                                </div>

                                {preview.rows.some(r => r.enrichment) && (
                                    <p className="text-xs text-teal-400 flex items-center gap-1">
                                        <Sparkles className="w-3 h-3" />
                                        * Values marked with asterisk were auto-enriched
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Importing Step */}
                        {step === 'importing' && (
                            <div className="flex flex-col items-center justify-center py-12">
                                <Loader2 className="w-12 h-12 text-teal-400 animate-spin mb-4" />
                                <p className="text-white font-medium">Importing properties...</p>
                                <p className="text-slate-400 text-sm">This may take a moment</p>
                            </div>
                        )}

                        {/* Complete Step */}
                        {step === 'complete' && result && (
                            <div className="flex flex-col items-center justify-center py-12">
                                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                                    <Check className="w-8 h-8 text-green-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-2">Import Complete!</h3>
                                <p className="text-slate-400 mb-6">
                                    Successfully imported {result.imported} of {result.total_rows} properties
                                </p>
                                <div className="flex items-center gap-4 text-sm">
                                    <span className="text-green-400">✓ {result.imported} imported</span>
                                    {result.skipped > 0 && (
                                        <span className="text-slate-500">⊘ {result.skipped} skipped</span>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Error Display */}
                        {error && (
                            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-red-400 font-medium">Error</p>
                                    <p className="text-red-300 text-sm">{error}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between">
                        <div>
                            {step !== 'upload' && step !== 'complete' && step !== 'importing' && (
                                <button
                                    onClick={() => setStep(step === 'preview' ? 'mapping' : 'upload')}
                                    className="flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-white transition-all"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                    Back
                                </button>
                            )}
                        </div>
                        <div className="flex items-center gap-3">
                            {step === 'complete' ? (
                                <button
                                    onClick={handleClose}
                                    className="px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-400 transition-all"
                                >
                                    Done
                                </button>
                            ) : step === 'mapping' ? (
                                <button
                                    onClick={handleProceedToPreview}
                                    className="flex items-center gap-2 px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-400 transition-all"
                                >
                                    Preview Import
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            ) : step === 'preview' ? (
                                <button
                                    onClick={handleConfirmImport}
                                    className="flex items-center gap-2 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-400 transition-all"
                                >
                                    <Check className="w-4 h-4" />
                                    Import {preview?.valid_rows} Properties
                                </button>
                            ) : null}
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default SmartImportDialog;
