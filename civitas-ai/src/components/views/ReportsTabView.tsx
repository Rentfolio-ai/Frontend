import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Trash2, Eye } from 'lucide-react';
import { getSavedReports, deleteReport } from '../../services/agentsApi';
import { ReportRenderer } from '../reports/ReportRenderer';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface Report {
  id: string;
  title: string;
  content: string;
  location: string;
  created_at?: string;
  property_details?: any;
  type?: string;
  file_size_kb?: number;
}

export const ReportsTabView: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<string | null>(null);

  // Fetch reports on mount, with delayed refetch and visibility change handling
  useEffect(() => {
    console.log('📊 ReportsTabView mounted - fetching reports');
    fetchReports();
    
    // Set a short delay to ensure backend has saved the report
    const timer = setTimeout(() => {
      console.log('⏰ Delayed refetch triggered');
      fetchReports();
    }, 500);
    
    // Fetch reports when tab becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('👁️ Tab visible - refetching reports');
        fetchReports();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const fetchReports = async () => {
    try {
      console.log('🔍 Fetching reports from backend...');
      setLoading(true);
      setError(null);
      const data = await getSavedReports();
      const fetched = data.reports || [];
      console.log('✅ Reports fetched:', fetched.length, 'reports');
      setReports(fetched);
    } catch (err) {
      console.error('❌ Error fetching reports:', err);
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
    } catch (err) {
      console.error('Error deleting report:', err);
      alert('Failed to delete report');
    }
  };

  const handleDownload = async (report: any) => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - 2 * margin;
    let yPos = margin;
    
    // Extract metrics
    const content = report.content;
    const gradeMatch = content.match(/Investment Grade:\s*([A-D][+-]?)/i);
    const roiMatch = content.match(/ROI:\s*([\d.]+)%/i);
    const cashFlowMatch = content.match(/Monthly.*(?:Revenue|Cash Flow).*\$([\d,]+)/i);
    const revenueMatch = content.match(/Annual.*(?:Revenue|income).*\$([\d,]+)/i);
    
    const grade = gradeMatch ? gradeMatch[1] : null;
    const roi = roiMatch ? roiMatch[1] : null;
    const cashFlow = cashFlowMatch ? cashFlowMatch[1] : null;
    const annualRev = revenueMatch ? revenueMatch[1] : null;
    
    // === HEADER ===
    pdf.setFillColor(0, 102, 204);
    pdf.rect(0, 0, pageWidth, 15, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text(report.title, margin, 10);
    
    yPos = 25;
    pdf.setTextColor(100, 100, 100);
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`📍 ${report.location}`, margin, yPos);
    yPos += 6;
    pdf.setFontSize(9);
    pdf.text(`Generated: ${new Date().toLocaleDateString()}`, margin, yPos);
    yPos += 10;
    
    // Grade badge
    if (grade) {
      const gradeColors: { [key: string]: [number, number, number] } = {
        'A': [40, 167, 69],
        'B': [0, 123, 255],
        'C': [255, 193, 7],
        'D': [220, 53, 69]
      };
      const color = gradeColors[grade[0]] || [100, 100, 100];
      pdf.setFillColor(color[0], color[1], color[2]);
      pdf.roundedRect(margin, yPos, 30, 10, 2, 2, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`Grade ${grade}`, margin + 15, yPos + 7, { align: 'center' });
      yPos += 15;
    }
    
    // === METRICS BOXES ===
    if (roi || cashFlow || annualRev) {
      yPos += 5;
      const metrics = [];
      if (roi) metrics.push({ label: 'ROI', value: `${roi}%` });
      if (cashFlow) metrics.push({ label: 'Monthly Cash Flow', value: `$${cashFlow}` });
      if (annualRev) metrics.push({ label: 'Annual Revenue', value: `$${annualRev}` });
      
      const boxWidth = contentWidth / metrics.length - 2;
      metrics.forEach((metric, idx) => {
        const xPos = margin + idx * (boxWidth + 2);
        pdf.setFillColor(248, 249, 250);
        pdf.roundedRect(xPos, yPos, boxWidth, 18, 2, 2, 'F');
        pdf.setTextColor(100, 100, 100);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'bold');
        pdf.text(metric.label.toUpperCase(), xPos + boxWidth/2, yPos + 6, { align: 'center' });
        pdf.setTextColor(0, 102, 204);
        pdf.setFontSize(16);
        pdf.text(metric.value, xPos + boxWidth/2, yPos + 14, { align: 'center' });
      });
      yPos += 25;
    }
    
    // === PARSE CONTENT ===
    pdf.setTextColor(0, 0, 0);
    const lines = content.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      // Skip decorative separators
      if (trimmed.startsWith('===') || !trimmed) continue;
      
      // Section headers (all caps, emoji headers)
      if (trimmed.match(/^[A-Z][A-Z\s]{10,}$/u) || trimmed.match(/^[\p{Emoji}]/u)) {
        if (yPos > pageHeight - 30) {
          pdf.addPage();
          yPos = margin;
        }
        yPos += 8;
        pdf.setFillColor(0, 102, 204);
        pdf.rect(margin - 2, yPos - 5, 4, 8, 'F');
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(0, 0, 0);
        const sectionText = trimmed.replace(/^[\p{Emoji}]\s*/u, '');
        pdf.text(sectionText, margin + 5, yPos);
        yPos += 10;
        continue;
      }
      
      // Property headers
      if (trimmed.startsWith('--- PROPERTY')) {
        if (yPos > pageHeight - 40) {
          pdf.addPage();
          yPos = margin;
        }
        yPos += 5;
        pdf.setFillColor(248, 249, 250);
        pdf.roundedRect(margin, yPos, contentWidth, 8, 2, 2, 'F');
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(0, 102, 204);
        pdf.text(trimmed, margin + 3, yPos + 5);
        yPos += 12;
        continue;
      }
      
      // List items
      if (trimmed.match(/^[•▸*-]\s+/) || trimmed.match(/^\d+\.\s+/)) {
        if (yPos > pageHeight - 20) {
          pdf.addPage();
          yPos = margin;
        }
        const text = trimmed.replace(/^[•▸*-]\s+/, '').replace(/^\d+\.\s+/, '');
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(60, 60, 60);
        const bulletLines = pdf.splitTextToSize(text, contentWidth - 10);
        pdf.text('•', margin + 2, yPos);
        pdf.text(bulletLines, margin + 8, yPos);
        yPos += bulletLines.length * 5 + 2;
        continue;
      }
      
      // Key-value pairs
      if (trimmed.includes(':') && trimmed.split(':').length === 2 && !trimmed.startsWith('http')) {
        const [key, value] = trimmed.split(':');
        if (key.length < 50 && key.length > 2) {
          if (yPos > pageHeight - 15) {
            pdf.addPage();
            yPos = margin;
          }
          pdf.setFillColor(255, 255, 255);
          pdf.roundedRect(margin, yPos - 3, contentWidth, 8, 1, 1, 'FD');
          pdf.setFontSize(9);
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(100, 100, 100);
          pdf.text(key.trim(), margin + 2, yPos + 2);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(0, 0, 0);
          const valueText = pdf.splitTextToSize(value.trim(), contentWidth / 2);
          pdf.text(valueText, pageWidth - margin - 2, yPos + 2, { align: 'right' });
          yPos += 10;
          continue;
        }
      }
      
      // Regular paragraphs
      if (trimmed.length > 0 && !trimmed.startsWith('📍')) {
        if (yPos > pageHeight - 20) {
          pdf.addPage();
          yPos = margin;
        }
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(60, 60, 60);
        const paragraphLines = pdf.splitTextToSize(trimmed, contentWidth);
        pdf.text(paragraphLines, margin, yPos);
        yPos += paragraphLines.length * 5 + 3;
      }
    }
    
    // === FOOTER ===
    const totalPages = pdf.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setFillColor(230, 230, 230);
      pdf.rect(0, pageHeight - 15, pageWidth, 15, 'F');
      pdf.setTextColor(120, 120, 120);
      pdf.setFontSize(8);
      pdf.text(`Civitas AI - STR Investment Research`, pageWidth / 2, pageHeight - 8, { align: 'center' });
      pdf.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 8, { align: 'right' });
    }
    
    // Download PDF
    pdf.save(`${report.title.replace(/\s+/g, '_')}.pdf`);
  };

  const getRelativeTime = (dateStr: string) => {
    const now = new Date();
    const past = new Date(dateStr);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return past.toLocaleDateString();
  };

  return (
    <div 
      className="flex-1 overflow-y-auto relative"
      style={{
        background: 'linear-gradient(135deg, #1B0034 0%, #3B0A72 40%, #00C78C 100%)'
      }}
    >
      <div className="max-w-5xl mx-auto px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white font-['Inter_Tight'] mb-2">
            📊 Investment Reports
          </h1>
          <p className="text-lg text-white/70">
            Generated reports from property searches
          </p>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center py-20"
          >
            <div className="text-white/70 text-lg">Loading reports...</div>
          </motion.div>
        )}

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-2xl p-6 bg-red-500/10 border border-red-500/30"
          >
            <p className="text-red-300">{error}</p>
            <button
              onClick={fetchReports}
              className="mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-300 transition-colors"
            >
              Try Again
            </button>
          </motion.div>
        )}

        {/* Empty State */}
        {!loading && !error && reports.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="rounded-2xl p-12 text-center"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            <div className="text-6xl mb-4">📄</div>
            
            <h2 className="text-2xl font-bold text-white mb-4">
              No reports generated yet
            </h2>
            
            <p className="text-white/70 text-lg mb-6 max-w-md mx-auto">
              Generate investment reports in chat by searching for properties and clicking "Generate Report" when prompted.
            </p>

            <div className="inline-block px-6 py-3 rounded-lg bg-blue-500/20 border border-blue-400/30">
              <p className="text-blue-300 font-medium">
                💡 Search for properties to get started
              </p>
            </div>
          </motion.div>
        )}

        {/* Reports List */}
        {!loading && !error && reports.length > 0 && (
          <div className="space-y-4">
            {reports.map((report, index) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="rounded-2xl p-6"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      {report.title}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-white/60">
                      <span>📍 {report.location}</span>
                      <span>📅 {getRelativeTime(report.created_at || new Date().toISOString())}</span>
                      {report.file_size_kb && (
                        <span>📄 {report.file_size_kb} KB</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedReport(selectedReport === report.id ? null : report.id)}
                      className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                      title="View Report"
                    >
                      <Eye className="w-5 h-5 text-white" />
                    </button>
                    <button
                      onClick={() => handleDownload(report)}
                      className="p-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 transition-colors"
                      title="Download Report"
                    >
                      <Download className="w-5 h-5 text-blue-300" />
                    </button>
                    <button
                      onClick={() => handleDelete(report.id)}
                      className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 transition-colors"
                      title="Delete Report"
                    >
                      <Trash2 className="w-5 h-5 text-red-300" />
                    </button>
                  </div>
                </div>

                {/* Report Content (expandable) */}
                {selectedReport === report.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 pt-4 border-t border-white/10"
                  >
                    <ReportRenderer 
                      content={report.content}
                      title={report.title}
                      location={report.location}
                    />
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
