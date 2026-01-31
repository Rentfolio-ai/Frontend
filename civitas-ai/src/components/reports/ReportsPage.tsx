/**
 * Reports Page - Simplified Investment Reports
 * Notion-inspired table view with user control
 */

import React, { useEffect, useState, useCallback } from 'react';
import { 
    Search, MoreVertical, Download, Printer, ExternalLink, Trash2,
    ChevronDown, ChevronRight, ArrowUp, ArrowDown, X, Loader2,
    FileText
} from 'lucide-react';
import { reportsService, type ReportSummary } from '@/services/reportsApi';
import { cn } from '@/lib/utils';
import type { InvestmentReportFormat } from '@/types/enums';
import { Tooltip } from '@/components/ui/Tooltip';
import { useToast } from '@/hooks/useToast';

type SortField = 'name' | 'property' | 'recommendation' | 'date';
type SortOrder = 'asc' | 'desc';
type FilterType = 'all' | 'str' | 'ltr' | 'adu' | 'flip' | 'full' | 'buy' | 'pass' | 'negotiate';

// Report type icons and labels
const REPORT_CONFIG: Record<InvestmentReportFormat, { icon: string; label: string }> = {
    str: { icon: '🏠', label: 'STR Analysis' },
    ltr: { icon: '🏘️', label: 'LTR Report' },
    adu: { icon: '🏡', label: 'ADU Analysis' },
    flip: { icon: '🔄', label: 'Flip Analysis' },
    full: { icon: '📊', label: 'Full Report' },
};

// Recommendation badge styles
const RECOMMENDATION_STYLES: Record<string, string> = {
    buy: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    pass: 'bg-red-500/10 text-red-400 border-red-500/30',
    negotiate: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
};

// Format currency
const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
};

// Format percentage
const formatPercent = (value: number): string => {
    return `${(value * 100).toFixed(1)}%`;
};

// Format date
const formatDate = (isoString: string): string => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export const ReportsPage: React.FC = () => {
    const [reports, setReports] = useState<ReportSummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState<FilterType>('all');
    const [sortField, setSortField] = useState<SortField>('date');
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
    const [expandedRow, setExpandedRow] = useState<string | null>(null);
    const [selectedReport, setSelectedReport] = useState<string | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
    const [showDownloadConfirm, setShowDownloadConfirm] = useState<string | null>(null);
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const { success, error: showError } = useToast();

    // Fetch reports
    useEffect(() => {
        const loadReports = async () => {
            try {
                const data = await reportsService.list();
                setReports(data.reports);
            } catch (err) {
                console.error('[ReportsPage] Failed to load reports:', err);
                setError('Failed to load reports');
            } finally {
                setIsLoading(false);
            }
        };

        loadReports();

        // Refresh every 30s
        const interval = setInterval(loadReports, 30000);
        return () => clearInterval(interval);
    }, []);

    // Filter reports
    const filteredReports = reports.filter(report => {
        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const reportName = REPORT_CONFIG[report.report_type]?.label.toLowerCase() || '';
            const property = report.property_address.toLowerCase();
            if (!reportName.includes(query) && !property.includes(query)) {
                return false;
            }
        }
        
        // Type/recommendation filter
        if (filter !== 'all') {
            if (['str', 'ltr', 'adu', 'flip', 'full'].includes(filter)) {
                if (report.report_type !== filter) return false;
            } else if (['buy', 'pass', 'negotiate'].includes(filter)) {
                if (report.recommendation.toLowerCase() !== filter) return false;
            }
        }
        
        return true;
    });

    // Sort reports
    const sortedReports = [...filteredReports].sort((a, b) => {
        let comparison = 0;
        
        switch (sortField) {
            case 'name':
                const aName = REPORT_CONFIG[a.report_type]?.label || '';
                const bName = REPORT_CONFIG[b.report_type]?.label || '';
                comparison = aName.localeCompare(bName);
                break;
            case 'property':
                comparison = a.property_address.localeCompare(b.property_address);
                break;
            case 'recommendation':
                comparison = a.recommendation.localeCompare(b.recommendation);
                break;
            case 'date':
                comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
                break;
        }
        
        return sortOrder === 'asc' ? comparison : -comparison;
    });

    // Handle sort
    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('desc');
        }
    };

    // Handle delete
    const handleDelete = async (reportId: string) => {
        try {
            await reportsService.delete(reportId);
            setReports(reports.filter(r => r.report_id !== reportId));
            setShowDeleteConfirm(null);
            setSelectedReport(null);
            if (expandedRow === reportId) {
                setExpandedRow(null);
            }
            success('Report deleted successfully');
        } catch (err) {
            console.error('[ReportsPage] Failed to delete report:', err);
            showError('Failed to delete report. Please try again.');
        }
    };

    // Handle view report (free)
    const handleViewReport = (reportId: string) => {
        const htmlUrl = reportsService.getHtmlUrl(reportId);
        window.open(htmlUrl, '_blank');
        setSelectedReport(null);
    };

    // Handle download with payment
    const handleDownload = async (reportId: string) => {
        setIsProcessingPayment(true);
        try {
            // Call billing API to process $2 charge
            const response = await fetch('/api/billing/charge', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-User-ID': localStorage.getItem('civitas-user') || ''
                },
                body: JSON.stringify({
                    action_type: 'report_download',
                    resource_id: reportId,
                    amount: 200  // $2.00 in cents
                })
            });

            if (!response.ok) {
                throw new Error('Payment failed');
            }

            // Payment successful, proceed with download
            const htmlUrl = reportsService.getHtmlUrl(reportId);
            window.open(htmlUrl, '_blank');
            
            success('Payment processed. Report downloading...');
            setShowDownloadConfirm(null);
            setSelectedReport(null);
        } catch (error) {
            console.error('Download payment error:', error);
            showError('Payment failed. Please try again or contact support.');
        } finally {
            setIsProcessingPayment(false);
        }
    };

    // Handle print
    const handlePrint = (reportId: string) => {
        const htmlUrl = reportsService.getHtmlUrl(reportId);
        const printWindow = window.open(htmlUrl, '_blank');
        if (printWindow) {
            printWindow.onload = () => {
                printWindow.print();
            };
        }
        setSelectedReport(null);
    };

    return (
        <div className="h-full flex flex-col p-6" style={{ backgroundColor: '#334155' }}>
            {/* Header */}
            <div className="mb-6">
                <div className="mb-2">
                    <h1 className="text-2xl font-semibold text-white/95">Your Reports</h1>
                    <p className="text-sm text-white/50 mt-1">All your investment reports in one place</p>
                </div>
            </div>

            {/* Search & Filter */}
            <div className="flex items-center gap-3 mb-4">
                <Tooltip content="Search by report name or property">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                        <input
                            type="text"
                            placeholder="Search reports..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-10 pl-10 pr-10 bg-white/[0.05] border border-white/[0.10] rounded-lg text-sm text-white/90 placeholder-white/40 focus:outline-none focus:border-white/[0.20] focus:ring-2 focus:ring-white/[0.10] transition-all"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-white/[0.05] rounded transition-colors"
                            >
                                <X className="w-3 h-3 text-white/40" />
                            </button>
                        )}
                    </div>
                </Tooltip>
                
                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value as FilterType)}
                    className="h-10 px-3 bg-white/[0.05] border border-white/[0.10] rounded-lg text-sm text-white/90 focus:outline-none focus:border-white/[0.20] transition-all cursor-pointer"
                >
                    <option value="all">All Reports</option>
                    <optgroup label="By Type">
                        <option value="str">STR Analysis</option>
                        <option value="ltr">LTR Report</option>
                        <option value="adu">ADU Analysis</option>
                        <option value="flip">Flip Analysis</option>
                        <option value="full">Full Report</option>
                    </optgroup>
                    <optgroup label="By Recommendation">
                        <option value="buy">Buy</option>
                        <option value="pass">Pass</option>
                        <option value="negotiate">Negotiate</option>
                    </optgroup>
                </select>
            </div>

            {/* Table */}
            {isLoading ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-3">
                    <Loader2 className="w-8 h-8 text-white/40 animate-spin" />
                    <p className="text-sm text-white/60">Loading reports...</p>
                </div>
            ) : error ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
                    <span className="text-red-500 text-2xl mb-4">⚠️</span>
                    <h3 className="text-lg font-medium text-white/60 mb-2">Failed to load reports</h3>
                    <p className="text-sm text-white/40 mb-4 max-w-sm">
                        {error.includes('network') ? 
                            'Network error. Please check your internet connection.' :
                        error.includes('401') || error.includes('403') ?
                            'Authentication required. Please log in again.' :
                            'An error occurred. Please try refreshing the page.'}
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-white/[0.05] text-white/70 rounded-lg hover:bg-white/[0.10] transition-colors text-sm"
                    >
                        Refresh Page
                    </button>
                </div>
            ) : sortedReports.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                    {searchQuery || filter !== 'all' ? (
                        <>
                            <Search className="w-12 h-12 text-white/20 mb-4" />
                            <h3 className="text-lg font-medium text-white/70 mb-2">No reports found</h3>
                            <p className="text-sm text-white/50 mb-3">Try adjusting your search or filters</p>
                            <button
                                onClick={() => {
                                    setSearchQuery('');
                                    setFilter('all');
                                }}
                                className="px-4 py-2 bg-white/[0.05] text-white/70 rounded-lg hover:bg-white/[0.10] transition-colors text-sm"
                            >
                                Clear filters
                            </button>
                        </>
                    ) : (
                        <>
                            <FileText className="w-16 h-16 text-white/20 mb-4" />
                            <h3 className="text-lg font-medium text-white/70 mb-2">No reports yet</h3>
                            <p className="text-sm text-white/50 mb-4 max-w-sm text-center">
                                Generate investment reports in chat and they'll automatically appear here
                            </p>
                            <div className="flex flex-col gap-2 text-xs text-white/40">
                                <p>💬 Chat with Vasthu about a property</p>
                                <p>📊 Request a report analysis</p>
                                <p>✨ Your reports will appear here</p>
                            </div>
                        </>
                    )}
                </div>
            ) : (
                <div className="flex-1 overflow-hidden flex flex-col">
                    {/* Table Header */}
                    <div className="grid grid-cols-[2fr_1.5fr_1fr_1fr_auto] gap-4 px-4 py-3 border-b border-white/[0.05]">
                        <button
                            onClick={() => handleSort('name')}
                            className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-white/50 hover:text-white/70 transition-colors text-left"
                        >
                            Name
                            {sortField === 'name' && (
                                sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                            )}
                        </button>
                        <button
                            onClick={() => handleSort('property')}
                            className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-white/50 hover:text-white/70 transition-colors text-left"
                        >
                            Property
                            {sortField === 'property' && (
                                sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                            )}
                        </button>
                        <button
                            onClick={() => handleSort('recommendation')}
                            className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-white/50 hover:text-white/70 transition-colors text-left"
                        >
                            Rec
                            {sortField === 'recommendation' && (
                                sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                            )}
                        </button>
                        <button
                            onClick={() => handleSort('date')}
                            className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-white/50 hover:text-white/70 transition-colors text-left"
                        >
                            Date
                            {sortField === 'date' && (
                                sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                            )}
                        </button>
                        <span className="text-xs font-medium uppercase tracking-wider text-white/50 text-right">Actions</span>
                    </div>

                    {/* Table Body */}
                    <div className="flex-1 overflow-y-auto">
                        {sortedReports.map((report) => {
                            const isExpanded = expandedRow === report.report_id;
                            const config = REPORT_CONFIG[report.report_type] || { icon: '📄', label: report.report_type };
                            
                            return (
                                <div key={report.report_id}>
                                    {/* Main Row */}
                                    <div
                                        className={cn(
                                            'grid grid-cols-[2fr_1.5fr_1fr_1fr_auto] gap-4 px-4 py-3 border-b border-white/[0.05] transition-colors',
                                            'hover:bg-white/[0.03] cursor-pointer'
                                        )}
                                        onClick={() => setExpandedRow(isExpanded ? null : report.report_id)}
                                    >
                        {/* Name */}
                        <div className="flex items-center gap-3 min-w-0">
                            <Tooltip content={isExpanded ? "Collapse details" : "Expand details"}>
                                {isExpanded ? (
                                    <ChevronDown className="w-4 h-4 text-white/40 flex-shrink-0" />
                                ) : (
                                    <ChevronRight className="w-4 h-4 text-white/40 flex-shrink-0" />
                                )}
                            </Tooltip>
                            <span className="text-lg flex-shrink-0">{config.icon}</span>
                            <span className="text-sm text-white/90 truncate hover:text-white transition-colors">
                                {config.label}
                            </span>
                        </div>

                        {/* Property */}
                        <div className="text-sm text-white/70 truncate flex items-center">
                            <Tooltip content={report.property_address}>
                                <span className="truncate">{report.property_address}</span>
                            </Tooltip>
                        </div>

                                        {/* Recommendation */}
                                        <div className="flex items-center">
                                            <span className={cn(
                                                'px-2 py-0.5 rounded-full text-xs font-medium border',
                                                RECOMMENDATION_STYLES[report.recommendation.toLowerCase()] || 'bg-white/5 text-white/70 border-white/20'
                                            )}>
                                                {report.recommendation}
                                            </span>
                                        </div>

                                        {/* Date */}
                                        <div className="text-sm text-white/60 flex items-center">
                                            {formatDate(report.created_at)}
                                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end">
                            <div className="relative">
                                <Tooltip content="More actions">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedReport(selectedReport === report.report_id ? null : report.report_id);
                                        }}
                                        className="p-1.5 hover:bg-white/[0.05] rounded transition-colors"
                                    >
                                        <MoreVertical className="w-4 h-4 text-white/60" />
                                    </button>
                                </Tooltip>

                                                {/* Context Menu */}
                                                {selectedReport === report.report_id && (
                                                    <>
                                                        <div
                                                            className="fixed inset-0 z-10"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setSelectedReport(null);
                                                            }}
                                                        />
                                                        <div className="absolute right-0 top-full mt-1 w-48 bg-[#1a1a1a] border border-white/[0.10] rounded-lg shadow-2xl z-20 overflow-hidden">
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleViewReport(report.report_id);
                                                                }}
                                                                className="w-full px-4 py-2.5 text-left text-sm text-white/80 hover:bg-white/[0.05] transition-colors flex items-center gap-3"
                                                            >
                                                                <ExternalLink className="w-4 h-4" />
                                                                View Report
                                                            </button>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handlePrint(report.report_id);
                                                                }}
                                                                className="w-full px-4 py-2.5 text-left text-sm text-white/80 hover:bg-white/[0.05] transition-colors flex items-center gap-3"
                                                            >
                                                                <Printer className="w-4 h-4" />
                                                                Print
                                                            </button>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setShowDownloadConfirm(report.report_id);
                                                                    setSelectedReport(null);
                                                                }}
                                                                className="w-full px-4 py-2.5 text-left text-sm text-white/80 hover:bg-white/[0.05] transition-colors flex items-center justify-between"
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <Download className="w-4 h-4" />
                                                                    Download
                                                                </div>
                                                                <span className="text-xs text-white/50">$2.00</span>
                                                            </button>
                                                            <div className="border-t border-white/[0.05]" />
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setShowDeleteConfirm(report.report_id);
                                                                    setSelectedReport(null);
                                                                }}
                                                                className="w-full px-4 py-2.5 text-left text-sm text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-3"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Expanded Metrics */}
                                    {isExpanded && report.key_metrics && (
                                        <div className="px-4 py-4 bg-white/[0.02] border-b border-white/[0.05]">
                                            <div className="ml-7">
                                                <h4 className="text-xs font-medium uppercase tracking-wider text-white/50 mb-3">Key Metrics</h4>
                                                <div className="grid grid-cols-4 gap-4 mb-4">
                                                    <div>
                                                        <div className="text-xs text-white/50 mb-1">Monthly Cash Flow</div>
                                                        <div className={cn(
                                                            'text-lg font-semibold',
                                                            report.key_metrics.monthly_cash_flow > 0 ? 'text-emerald-400' : 'text-red-400'
                                                        )}>
                                                            {formatCurrency(report.key_metrics.monthly_cash_flow)}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="text-xs text-white/50 mb-1">Cap Rate</div>
                                                        <div className="text-lg font-semibold text-white/90">
                                                            {formatPercent(report.key_metrics.cap_rate)}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="text-xs text-white/50 mb-1">Cash-on-Cash</div>
                                                        <div className="text-lg font-semibold text-white/90">
                                                            {formatPercent(report.key_metrics.cash_on_cash)}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="text-xs text-white/50 mb-1">DSCR</div>
                                                        <div className="text-lg font-semibold text-white/90">
                                                            {report.key_metrics.dscr.toFixed(2)}
                                                        </div>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleViewReport(report.report_id);
                                                    }}
                                                    className="px-4 py-2 bg-white/[0.05] text-white/70 rounded-lg hover:bg-white/[0.10] transition-colors text-sm font-medium"
                                                >
                                                    View Full Report →
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Footer Stats */}
            {!isLoading && sortedReports.length > 0 && (
                <div className="mt-4 pt-4 border-t border-white/[0.05]">
                    <p className="text-sm text-white/50">
                        {sortedReports.length} {sortedReports.length === 1 ? 'report' : 'reports'}
                        {filteredReports.length !== reports.length && ` (filtered from ${reports.length})`}
                    </p>
                </div>
            )}

            {/* Delete Confirmation */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-[#1a1a1a] border border-white/[0.10] rounded-xl p-6 max-w-sm w-full">
                        <h3 className="text-lg font-semibold text-white mb-2">Delete Report?</h3>
                        <p className="text-sm text-white/60 mb-6">
                            This action cannot be undone. The report will be permanently deleted.
                        </p>
                        <div className="flex items-center gap-3 justify-end">
                            <button
                                onClick={() => setShowDeleteConfirm(null)}
                                className="px-4 py-2 text-sm text-white/70 hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDelete(showDeleteConfirm)}
                                className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Download Confirmation with Payment */}
            {showDownloadConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-[#1a1a1a] border border-white/[0.10] rounded-xl p-6 max-w-sm w-full">
                        <div className="flex items-start gap-3 mb-4">
                            <div className="w-10 h-10 rounded-lg bg-teal-500/10 flex items-center justify-center flex-shrink-0">
                                <Download className="w-5 h-5 text-teal-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-1">Download Report</h3>
                                <p className="text-sm text-white/60">
                                    Download full report as PDF/HTML
                                </p>
                            </div>
                        </div>
                        
                        <div className="bg-white/[0.03] border border-white/[0.08] rounded-lg p-4 mb-6">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-white/70">Report Download</span>
                                <span className="text-lg font-semibold text-white">$2.00</span>
                            </div>
                            <p className="text-xs text-white/50">
                                One-time charge • Instant download • Full access
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setShowDownloadConfirm(null)}
                                disabled={isProcessingPayment}
                                className="flex-1 px-4 py-2.5 text-sm text-white/70 hover:text-white transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDownload(showDownloadConfirm)}
                                disabled={isProcessingPayment}
                                className="flex-1 px-4 py-2.5 text-sm bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isProcessingPayment ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <Download className="w-4 h-4" />
                                        Pay & Download
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

