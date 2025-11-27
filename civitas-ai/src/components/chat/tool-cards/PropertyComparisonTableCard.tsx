// FILE: src/components/chat/tool-cards/PropertyComparisonTableCard.tsx
// Displays property comparison results with markdown table and insights
// Supports both markdown (inline) and HTML (modal) formats

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import type { ComparePropertiesOutput, EnrichedPropertyData } from '@/types/backendTools';
import type { BookmarkedProperty } from '@/types/bookmarks';
import type { ScoutedProperty } from '@/types/backendTools';

// Icons
const BookmarkIcon = ({ filled = false, className }: { filled?: boolean; className?: string }) => (
  <svg
    className={cn('w-4 h-4 transition-colors', className)}
    fill={filled ? 'currentColor' : 'none'}
    stroke="currentColor"
    viewBox="0 0 24 24"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
    />
  </svg>
);

const LightbulbIcon = ({ className }: { className?: string }) => (
  <svg className={cn('w-4 h-4', className)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
  </svg>
);

const DocumentIcon = ({ className }: { className?: string }) => (
  <svg className={cn('w-4 h-4', className)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const CloseIcon = ({ className }: { className?: string }) => (
  <svg className={cn('w-5 h-5', className)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const PrintIcon = ({ className }: { className?: string }) => (
  <svg className={cn('w-4 h-4', className)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
  </svg>
);

const ExternalLinkIcon = ({ className }: { className?: string }) => (
  <svg className={cn('w-4 h-4', className)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
  </svg>
);

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

// Simple markdown table parser
function parseMarkdownTable(markdown: string): { headers: string[]; rows: string[][] } | null {
  const lines = markdown.trim().split('\n').filter(line => line.trim());
  if (lines.length < 2) return null;
  
  const parseRow = (line: string): string[] => {
    return line
      .split('|')
      .map(cell => cell.trim())
      .filter((_, i, arr) => i > 0 && i < arr.length - 1); // Remove empty first/last from | borders
  };
  
  const headers = parseRow(lines[0]);
  // Skip separator line (index 1)
  const rows = lines.slice(2).map(parseRow);
  
  return { headers, rows };
}

// Convert EnrichedPropertyData to ScoutedProperty for bookmark compatibility
function enrichedToScouted(prop: EnrichedPropertyData): ScoutedProperty {
  return {
    listing_id: `compare-${prop._index}-${prop.address}`,
    address: prop.address,
    city: prop.city || '',
    state: prop.state || '',
    zip_code: prop.zip_code || '',
    price: prop.price || 0,
    bedrooms: prop.bedrooms || 0,
    bathrooms: prop.bathrooms || 0,
    sqft: prop.sqft || 0,
    year_built: prop.year_built,
    property_type: prop.property_type,
  };
}

// HTML Report Modal Component
interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  htmlContent: string;
  propertiesCount: number;
}

const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, htmlContent, propertiesCount }) => {
  const iframeRef = React.useRef<HTMLIFrameElement>(null);
  
  const handlePrint = () => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.print();
    }
  };
  
  const handleOpenNewTab = () => {
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(htmlContent);
      newWindow.document.close();
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-4xl max-h-[90vh] mx-4 bg-white dark:bg-slate-900 rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2">
            <DocumentIcon className="w-5 h-5 text-blue-500" />
            <h2 className="font-semibold text-slate-800 dark:text-slate-200">
              Property Comparison Report
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              ({propertiesCount} properties)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-400"
              title="Print report"
            >
              <PrintIcon />
            </button>
            <button
              onClick={handleOpenNewTab}
              className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-400"
              title="Open in new tab"
            >
              <ExternalLinkIcon />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-400"
              title="Close"
            >
              <CloseIcon />
            </button>
          </div>
        </div>
        
        {/* Report Content */}
        <div className="flex-1 overflow-hidden">
          <iframe
            ref={iframeRef}
            srcDoc={htmlContent}
            className="w-full h-full min-h-[500px] border-0"
            title="Property Comparison Report"
            sandbox="allow-same-origin allow-scripts"
          />
        </div>
      </div>
    </div>
  );
};

interface PropertyComparisonTableCardProps {
  data: ComparePropertiesOutput;
  bookmarks?: BookmarkedProperty[];
  onToggleBookmark?: (property: ScoutedProperty) => void;
}

export const PropertyComparisonTableCard: React.FC<PropertyComparisonTableCardProps> = ({
  data,
  bookmarks = [],
  onToggleBookmark,
}) => {
  const { comparison_table, comparison_report, format, properties, summary } = data;
  const [isReportOpen, setIsReportOpen] = useState(false);
  
  const hasHtmlReport = format === 'html' && !!comparison_report;
  
  // Parse the markdown table
  const table = React.useMemo(() => parseMarkdownTable(comparison_table), [comparison_table]);
  
  // Create bookmark lookup
  const bookmarkLookup = React.useMemo(() => {
    const lookup = new Set<string>();
    bookmarks.forEach(bm => {
      lookup.add(bm.property.address.toLowerCase());
      if (bm.property.listing_id) {
        lookup.add(bm.property.listing_id);
      }
    });
    return lookup;
  }, [bookmarks]);
  
  const isPropertyBookmarked = (prop: EnrichedPropertyData): boolean => {
    return bookmarkLookup.has(prop.address.toLowerCase()) || 
           bookmarkLookup.has(`compare-${prop._index}-${prop.address}`);
  };
  
  const handleBookmarkClick = (prop: EnrichedPropertyData) => {
    if (onToggleBookmark) {
      onToggleBookmark(enrichedToScouted(prop));
    }
  };
  
  if (!table) {
    // Fallback: render raw markdown if parsing fails
    return (
      <div className="mt-3 space-y-3">
        <pre className="text-xs bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg overflow-x-auto">
          {comparison_table}
        </pre>
        {summary?.insights && summary.insights.length > 0 && (
          <div className="space-y-1.5">
            {summary.insights.map((insight, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                <LightbulbIcon className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <span>{insight}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
  
  return (
    <>
      <div className="mt-3 space-y-4">
        {/* View Full Report Button (when HTML available) */}
        {hasHtmlReport && (
          <button
            onClick={() => setIsReportOpen(true)}
            className={cn(
              'inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all',
              'bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50',
              'text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
            )}
          >
            <DocumentIcon className="w-4 h-4" />
            View Full Comparison Report
          </button>
        )}
        
        {/* Comparison Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr>
                {table.headers.map((header, i) => (
                  <th 
                    key={i}
                    className={cn(
                      'px-3 py-2 text-left font-semibold text-slate-700 dark:text-slate-300 border-b-2 border-slate-200 dark:border-slate-700',
                      i === 0 ? 'bg-slate-50 dark:bg-slate-800/50' : 'text-center'
                    )}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {table.rows.map((row, rowIndex) => {
                const isPriceRow = row[0]?.toLowerCase().includes('price') && !row[0]?.toLowerCase().includes('sqft');
                
                return (
                  <tr 
                    key={rowIndex}
                    className={cn(
                      'border-b border-slate-100 dark:border-slate-800',
                      rowIndex % 2 === 0 ? 'bg-white dark:bg-slate-900/30' : 'bg-slate-50/50 dark:bg-slate-800/20'
                    )}
                  >
                    {row.map((cell, cellIndex) => {
                      const isMetricLabel = cellIndex === 0;
                      const cleanCell = cell.replace(/\*\*/g, ''); // Remove markdown bold
                      
                      return (
                        <td 
                          key={cellIndex}
                          className={cn(
                            'px-3 py-2',
                            isMetricLabel 
                              ? 'font-medium text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50' 
                              : 'text-center',
                            isPriceRow && !isMetricLabel && 'font-semibold text-slate-900 dark:text-slate-100'
                          )}
                        >
                          {cleanCell}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {/* Bookmark Actions */}
        {properties && properties.length > 0 && onToggleBookmark && (
          <div className="flex flex-wrap gap-2 pt-2">
            <span className="text-xs text-slate-400 mr-1">Save:</span>
            {properties.map((prop) => (
              <button
                key={prop._index}
                onClick={() => handleBookmarkClick(prop)}
                className={cn(
                  'inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-all',
                  'hover:bg-slate-100 dark:hover:bg-slate-800',
                  isPropertyBookmarked(prop) 
                    ? 'text-blue-500 bg-blue-50 dark:bg-blue-900/30' 
                    : 'text-slate-500'
                )}
                title={isPropertyBookmarked(prop) ? 'Remove bookmark' : 'Bookmark property'}
              >
                <BookmarkIcon filled={isPropertyBookmarked(prop)} className="w-3.5 h-3.5" />
                <span>#{prop._index}</span>
              </button>
            ))}
          </div>
        )}
        
        {/* Insights */}
        {summary?.insights && summary.insights.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              Key Insights
            </div>
            <div className="space-y-1.5">
              {summary.insights.map((insight, i) => (
                <div 
                  key={i} 
                  className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400"
                >
                  <LightbulbIcon className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <span>{insight}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Price Range Summary */}
        {summary?.price_range && (
          <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-2">
            <span>
              Range: {formatPrice(summary.price_range.min)} – {formatPrice(summary.price_range.max)}
            </span>
            <span>
              Avg: {formatPrice(summary.price_range.avg)}
            </span>
            <span>
              Spread: {formatPrice(summary.price_range.spread)}
            </span>
          </div>
        )}
      </div>
      
      {/* HTML Report Modal */}
      {hasHtmlReport && comparison_report && (
        <ReportModal
          isOpen={isReportOpen}
          onClose={() => setIsReportOpen(false)}
          htmlContent={comparison_report}
          propertiesCount={properties?.length || 0}
        />
      )}
    </>
  );
};

