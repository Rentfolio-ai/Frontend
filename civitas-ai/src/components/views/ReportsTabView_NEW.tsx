import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Trash2, Eye, FileText, TrendingUp, DollarSign } from 'lucide-react';
import { getSavedReports, deleteReport } from '../../services/agentsApi';
import { ReportRenderer } from '../reports/ReportRenderer_PROFESSIONAL';
import { FlowCard } from '../primitives/FlowCard';

interface Report {
  id: string;
  title: string;
  location: string;
  content: string;
  created_at: string;
  file_size_kb?: number;
  property_details?: {
    price?: number;
    roi?: number;
    tier?: string;
  };
}

export const ReportsTabView: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deepDiveReport, setDeepDiveReport] = useState<Report | null>(null);

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchReports();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSavedReports();
      setReports(data.reports || []);
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (reportId: string) => {
    if (!confirm('Are you sure you want to delete this report?')) return;
    
    try {
      await deleteReport(reportId);
      setReports(prev => prev.filter(r => r.id !== reportId));
      if (expandedId === reportId) setExpandedId(null);
      if (deepDiveReport?.id === reportId) setDeepDiveReport(null);
    } catch (err) {
      console.error('Error deleting report:', err);
      alert('Failed to delete report');
    }
  };

  const handleDownloadHTML = (report: Report) => {
    // Create styled HTML
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${report.title}</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 850px;
            margin: 40px auto;
            padding: 40px;
            background: white;
            color: #1a1a1a;
            line-height: 1.6;
          }
          h1 {
            color: #2563eb;
            border-bottom: 3px solid #3b82f6;
            padding-bottom: 12px;
            margin-bottom: 24px;
            font-size: 32px;
          }
          h2 {
            color: #1e40af;
            margin-top: 32px;
            margin-bottom: 16px;
            font-size: 24px;
          }
          .meta {
            color: #6b7280;
            font-size: 14px;
            margin-bottom: 24px;
            padding: 12px;
            background: #f3f4f6;
            border-left: 4px solid #3b82f6;
          }
          .content {
            white-space: pre-wrap;
            font-size: 15px;
          }
          @media print {
            body { margin: 0; padding: 20px; }
          }
        </style>
      </head>
      <body>
        <h1>${report.title}</h1>
        <div class="meta">
          <div>📍 ${report.location}</div>
          <div>📅 ${new Date(report.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
        </div>
        <div class="content">${report.content.replace(/\n/g, '<br>')}</div>
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.title.replace(/\s+/g, '_')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getRelativeTime = (dateStr: string) => {
    const now = new Date();
    const past = new Date(dateStr);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return past.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const extractMetrics = (content: string) => {
    const gradeMatch = content.match(/Investment Grade:\s*([A-D][+-]?)/i);
    const roiMatch = content.match(/ROI:\s*([\d.]+)%/i);
    const priceMatch = content.match(/Price:\s*\$?([\d,]+)/i);
    const revenueMatch = content.match(/Annual.*(?:Revenue|income).*\$([:\d,]+)/i);
    
    return {
      grade: gradeMatch ? gradeMatch[1] : null,
      roi: roiMatch ? roiMatch[1] : null,
      price: priceMatch ? priceMatch[1].replace(/,/g, '') : null,
      revenue: revenueMatch ? revenueMatch[1].replace(/,/g, '') : null,
    };
  };

  const getGradeColor = (grade: string | null) => {
    if (!grade) return 'from-gray-400 to-gray-500';
    const letter = grade[0];
    if (letter === 'A') return 'from-green-400 to-emerald-500';
    if (letter === 'B') return 'from-blue-400 to-cyan-500';
    if (letter === 'C') return 'from-yellow-400 to-orange-500';
    return 'from-red-400 to-pink-500';
  };

  // ============================================================================
  // UNIFIED FLOW CARD - Streamlined, scannable reports
  // ============================================================================
  const renderFlowCard = (report: Report, index: number) => {
    const metrics = extractMetrics(report.content);
    const keyPoints = extractKeyPoints(report.content);

    return (
      <FlowCard
        key={report.id}
        title={report.title}
        subtitle={`${report.location} • ${getRelativeTime(report.created_at)}`}
        icon={<FileText className="w-5 h-5" />}
        badge={
          metrics.grade ? {
            text: metrics.grade,
            variant: metrics.grade[0] === 'A' ? 'success' : metrics.grade[0] === 'B' ? 'info' : 'warning'
          } : undefined
        }
        preview={
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center">
              <div className="text-xs text-white/40 mb-1">ROI</div>
              <div className="text-sm font-semibold text-emerald-400">{metrics.roi ? `${metrics.roi}%` : 'N/A'}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-white/40 mb-1">Price</div>
              <div className="text-sm font-semibold text-blue-400">{metrics.price ? `$${parseInt(metrics.price).toLocaleString()}` : 'N/A'}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-white/40 mb-1">Revenue</div>
              <div className="text-sm font-semibold text-purple-400">{metrics.revenue ? `$${parseInt(metrics.revenue).toLocaleString()}` : 'N/A'}</div>
            </div>
          </div>
        }
        details={
          <div className="space-y-3">
            {/* Key highlights */}
            {keyPoints.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs text-white/50 uppercase tracking-wider font-medium flex items-center gap-1.5">
                  <Eye className="w-3 h-3" />
                  <span>Key Highlights</span>
                </div>
                {keyPoints.map((point, idx) => (
                  <div key={idx} className="flex items-start gap-2 p-2 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                    <span className="text-purple-400 text-xs mt-0.5 flex-shrink-0">▸</span>
                    <span className="text-white/70 text-xs leading-relaxed">{point}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownloadHTML(report);
                }}
                className="py-2 rounded-lg bg-white/5 border border-white/10 text-white/70 text-xs font-medium hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-1.5"
              >
                <Download className="w-3 h-3" />
                <span>Download</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(report.id);
                }}
                className="py-2 rounded-lg bg-red-500/5 border border-red-500/10 text-red-400/70 text-xs font-medium hover:bg-red-500/10 hover:text-red-400 transition-all flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3 h-3" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        }
        onDeepDive={() => setDeepDiveReport(report)}
        className="transition-all duration-300"
      />
    );
  };

  // Extract key points helper
  const extractKeyPoints = (content: string) => {
    const lines = content.split('\n');
    const points: string[] = [];
    
    for (const line of lines) {
      const trimmed = line.trim();
      if ((trimmed.match(/^[-•*▸]\s+/) || trimmed.match(/^\d+\.\s+/)) && points.length < 3) {
        const text = trimmed.replace(/^[-•*▸]\s+/, '').replace(/^\d+\.\s+/, '');
        if (text.length > 20 && text.length < 150) {
          points.push(text);
        }
      }
    }
    return points;
  };


  // ============================================================================
  // LAYER 3: DEEP DIVE - Professional real estate report
  // ============================================================================
  const renderDeepDiveView = (report: Report) => {
    const metrics = extractMetrics(report.content);
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-6xl mx-auto"
      >
        {/* Simple Back Button */}
        <motion.button
          whileHover={{ x: -2 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setDeepDiveReport(null)}
          className="flex items-center gap-2 text-white/60 hover:text-white text-sm font-medium transition-colors mb-4"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Reports
        </motion.button>

        {/* Main Report Document */}
        <motion.article
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.08, duration: 0.25 }}
          className="bg-white rounded-lg overflow-hidden"
          style={{
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 1px 0 rgba(0, 0, 0, 0.05)',
          }}
        >
          {/* Report Header */}
          <div className="relative px-8 py-8 bg-gradient-to-br from-slate-50 to-gray-100 border-b border-gray-200">
            <div className="flex items-start justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Investment Analysis Report
                </div>
                <h1 
                  className="text-4xl font-bold text-gray-900 mb-3 leading-tight"
                  style={{ fontFamily: 'Inter Tight, sans-serif', letterSpacing: '-0.025em' }}
                >
                  {report.title}
                </h1>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <span className="flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    {report.location}
                  </span>
                  <span className="text-gray-400">•</span>
                  <span>
                    {new Date(report.created_at).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {metrics.grade && (
                  <div 
                    className="flex-shrink-0 w-20 h-20 rounded-xl flex items-center justify-center text-3xl font-black shadow-lg"
                    style={{
                      background: metrics.grade[0] === 'A' ? 'linear-gradient(135deg, #10b981, #059669)' : 
                                 metrics.grade[0] === 'B' ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : 
                                 'linear-gradient(135deg, #f59e0b, #d97706)',
                      color: 'white',
                    }}
                  >
                    {metrics.grade}
                  </div>
                )}
                
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleDownloadHTML(report)}
                  className="px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-all shadow-sm"
                  style={{
                    background: 'white',
                    border: '1px solid #e5e7eb',
                    color: '#374151',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#f9fafb';
                    e.currentTarget.style.borderColor = '#d1d5db';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'white';
                    e.currentTarget.style.borderColor = '#e5e7eb';
                  }}
                >
                  <Download className="w-4 h-4" strokeWidth={2} />
                  Export
                </motion.button>
              </div>
            </div>
          </div>

          {/* Key Metrics Dashboard */}
          {(metrics.roi || metrics.price || metrics.revenue) && (
            <div className="grid grid-cols-3 divide-x divide-gray-200 border-b border-gray-200">
              {metrics.roi && (
                <div className="px-8 py-5 bg-gradient-to-br from-emerald-50 to-white">
                  <div className="text-xs font-semibold uppercase tracking-wider text-emerald-700 mb-2">Return on Investment</div>
                  <div className="text-3xl font-bold text-emerald-600">{metrics.roi}%</div>
                </div>
              )}
              {metrics.price && (
                <div className="px-8 py-5 bg-gradient-to-br from-blue-50 to-white">
                  <div className="text-xs font-semibold uppercase tracking-wider text-blue-700 mb-2">Property Price</div>
                  <div className="text-3xl font-bold text-blue-600">${parseInt(metrics.price).toLocaleString()}</div>
                </div>
              )}
              {metrics.revenue && (
                <div className="px-8 py-5 bg-gradient-to-br from-purple-50 to-white">
                  <div className="text-xs font-semibold uppercase tracking-wider text-purple-700 mb-2">Annual Revenue</div>
                  <div className="text-3xl font-bold text-purple-600">${parseInt(metrics.revenue).toLocaleString()}</div>
                </div>
              )}
            </div>
          )}

          {/* Report Content */}
          <div className="px-8 py-8">
            <ReportRenderer 
              content={report.content}
              title={report.title}
              location={report.location}
            />
          </div>
        </motion.article>
      </motion.div>
    );
  };

  // ============================================================================
  // Main Render
  // ============================================================================
  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto relative flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #312e81 50%, #4c1d95 100%)' }}>
        <div className="text-white text-xl">Loading reports...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 overflow-y-auto px-8 py-8"
        style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #312e81 50%, #4c1d95 100%)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="rounded-2xl p-6 bg-red-500/10 border border-red-500/30">
            <p className="text-red-300 mb-4">{error}</p>
            <button
              onClick={fetchReports}
              className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-300 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto relative flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #312e81 50%, #4c1d95 100%)' }}>
        <div className="max-w-2xl mx-auto text-center px-8">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-8xl mb-6">📊</motion.div>
          <h1 className="text-5xl font-bold text-white mb-4">Investment Reports</h1>
          <p className="text-xl text-white/70 mb-6">No reports generated yet</p>
          <div className="text-left space-y-3 text-gray-300">
            <p className="font-semibold text-white">Generate reports by:</p>
            <p>• Searching for properties in chat</p>
            <p>• Clicking "Generate Report" when prompted</p>
            <p>• Your reports will appear here automatically</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-8 py-8"
      style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #312e81 50%, #4c1d95 100%)' }}>
      <div className="max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          {deepDiveReport ? (
            // Full analysis view
            renderDeepDiveView(deepDiveReport)
          ) : (
            // Reports grid view
            <motion.div
              key="reports-grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h1 className="text-5xl font-bold text-white font-['Inter_Tight'] mb-2 flex items-center gap-3">
                    <span className="text-4xl">📊</span>
                    Investment Reports
                  </h1>
                  <p className="text-white/50 text-sm font-medium tracking-wide">
                    Progressive disclosure: Snapshot → Preview → Full Report
                  </p>
                </div>
                <button onClick={fetchReports}
                  className="px-5 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 hover:border-white/40 transition-all duration-300 flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl">
                  <span className="text-lg">🔄</span>
                  <span>Refresh</span>
                </button>
              </div>

              {/* Flow card grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reports.map((report, index) => renderFlowCard(report, index))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
