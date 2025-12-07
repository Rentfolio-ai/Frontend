// FILE: src/components/portfolio/ImportDialog.tsx
import React, { useState, useRef, useEffect } from 'react';
import { X, Upload, FileSpreadsheet, AlertCircle, CheckCircle } from 'lucide-react';
import type { ImportJob } from '../../types/portfolio';

interface ImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (file: File) => Promise<ImportJob>;
  onPollStatus: (jobId: string) => Promise<ImportJob>;
  portfolioId: string;
  onImportComplete: () => void;
}

export const ImportDialog: React.FC<ImportDialogProps> = ({
  isOpen,
  onClose,
  onImport,
  onPollStatus,

  onImportComplete,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [importJob, setImportJob] = useState<ImportJob | null>(null);
  const [polling, setPolling] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (importJob && (importJob.status === 'pending' || importJob.status === 'processing')) {
      startPolling(importJob.import_job_id);
    }

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [importJob]);

  const startPolling = (jobId: string) => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    setPolling(true);
    pollingIntervalRef.current = setInterval(async () => {
      try {
        const status = await onPollStatus(jobId);
        setImportJob(status);

        if (status.status === 'completed' || status.status === 'failed') {
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
          }
          setPolling(false);
          if (status.status === 'completed') {
            setTimeout(() => {
              onImportComplete();
              handleClose();
            }, 2000);
          }
        }
      } catch (error) {
        console.error('Failed to poll import status:', error);
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
        }
        setPolling(false);
      }
    }, 2000);
  };

  const handleClose = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }
    setFile(null);
    setImportJob(null);
    setPolling(false);
    setDragActive(false);
    onClose();
  };

  const handleFileSelect = (selectedFile: File) => {
    const validExtensions = ['.csv', '.xlsx', '.xls'];
    const fileExtension = selectedFile.name
      .substring(selectedFile.name.lastIndexOf('.'))
      .toLowerCase();

    if (!validExtensions.includes(fileExtension)) {
      alert('Please select a CSV or Excel file');
      return;
    }

    setFile(selectedFile);
  };

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
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    try {
      const job = await onImport(file);
      setImportJob(job);
    } catch (error) {
      console.error('Import failed:', error);
      alert(error instanceof Error ? error.message : 'Failed to start import');
    }
  };

  if (!isOpen) return null;

  const progress =
    importJob && importJob.total_rows > 0
      ? (importJob.processed_rows / importJob.total_rows) * 100
      : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={!polling ? handleClose : undefined}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Import Properties</h2>
          {!polling && (
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {!importJob ? (
            <>
              {/* File Upload */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-300 hover:border-gray-400'
                  }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileSelect(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />

                {file ? (
                  <div className="flex flex-col items-center">
                    <FileSpreadsheet className="w-12 h-12 text-primary mb-4" />
                    <p className="font-medium text-gray-900 mb-1">{file.name}</p>
                    <p className="text-sm text-gray-500">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                    <button
                      onClick={() => setFile(null)}
                      className="mt-4 text-sm text-red-600 hover:text-red-700"
                    >
                      Remove file
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <Upload className="w-12 h-12 text-gray-400 mb-4" />
                    <p className="text-gray-600 mb-2">
                      Drag and drop your CSV or Excel file here
                    </p>
                    <p className="text-sm text-gray-500 mb-4">or</p>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      Browse Files
                    </button>
                    <p className="text-xs text-gray-500 mt-4">
                      Supported formats: CSV, XLSX, XLS
                    </p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 mt-6">
                <button
                  onClick={handleClose}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleImport}
                  disabled={!file}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Start Import
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Import Progress */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Import Progress</h3>
                  {importJob.status === 'completed' && (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  )}
                  {importJob.status === 'failed' && (
                    <AlertCircle className="w-6 h-6 text-red-600" />
                  )}
                  {importJob.status === 'processing' && (
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">
                      {importJob.status === 'completed'
                        ? 'Import completed'
                        : importJob.status === 'failed'
                          ? 'Import failed'
                          : 'Processing...'}
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {importJob.processed_rows} / {importJob.total_rows} rows
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Successful</p>
                    <p className="text-lg font-semibold text-green-600">
                      {importJob.successful_rows}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Failed</p>
                    <p className="text-lg font-semibold text-red-600">
                      {importJob.failed_rows}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Total</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {importJob.total_rows}
                    </p>
                  </div>
                </div>

                {/* Errors */}
                {importJob.errors && importJob.errors.length > 0 && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg max-h-48 overflow-y-auto">
                    <p className="text-sm font-medium text-red-900 mb-2">Import Errors:</p>
                    <ul className="space-y-1">
                      {importJob.errors.slice(0, 10).map((error, index) => (
                        <li key={index} className="text-xs text-red-700">
                          Row {error.row}, {error.field}: {error.error}
                        </li>
                      ))}
                      {importJob.errors.length > 10 && (
                        <li className="text-xs text-red-600">
                          ... and {importJob.errors.length - 10} more errors
                        </li>
                      )}
                    </ul>
                  </div>
                )}

                {/* Actions */}
                {importJob.status === 'completed' || importJob.status === 'failed' ? (
                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={handleClose}
                      className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={handleClose}
                      disabled={polling}
                      className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel Import
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

