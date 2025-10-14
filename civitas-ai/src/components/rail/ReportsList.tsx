// FILE: src/components/rail/ReportsList.tsx
import React from 'react';
import { Card } from '../primitives/Card';
import { Button } from '../primitives/Button';
import { Badge } from '../primitives/Badge';
import { ReportType, ReportStatus } from '@/types/enums';
import type { ReportType as ReportTypeType, ReportStatus as ReportStatusType } from '@/types/enums';

interface Report {
  id: string;
  title: string;
  type: ReportTypeType;
  date: string;
  status: ReportStatusType;
  size?: string;
}

const sampleReports: Report[] = [
  {
    id: '1',
    title: 'Q3 Portfolio Performance',
    type: ReportType.PortfolioSummary,
    date: '2 days ago',
    status: ReportStatus.Ready,
    size: '2.3 MB'
  },
  {
    id: '2',
    title: 'Austin Market Analysis',
    type: ReportType.MarketAnalysis,
    date: '1 week ago',
    status: ReportStatus.Ready,
    size: '1.8 MB'
  },
  {
    id: '3',
    title: 'Downtown Properties ROI',
    type: ReportType.ROIAnalysis,
    date: '2 weeks ago',
    status: ReportStatus.Ready,
    size: '950 KB'
  },
  {
    id: '4',
    title: 'Property Comparison Report',
    type: ReportType.ComparativeAnalysis,
    date: 'Just now',
    status: ReportStatus.Generating
  }
];

export const ReportsList: React.FC = () => {
  const getReportIcon = (type: ReportTypeType) => {
    switch (type) {
      case ReportType.MarketAnalysis:
        return (
          <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        );
      case ReportType.PortfolioSummary:
        return (
          <svg className="w-4 h-4 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        );
      case ReportType.ROIAnalysis:
        return (
          <svg className="w-4 h-4 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        );
      case ReportType.ComparativeAnalysis:
        return (
          <svg className="w-4 h-4 text-foreground/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16l-3-3m3 3l3-3" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4 text-foreground/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
    }
  };

  const getStatusBadge = (status: ReportStatusType) => {
    switch (status) {
      case ReportStatus.Ready:
        return <Badge variant="success" size="sm">Ready</Badge>;
      case ReportStatus.Generating:
        return <Badge variant="warning" size="sm">Generating</Badge>;
      case ReportStatus.Draft:
        return <Badge variant="default" size="sm">Draft</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-h2">Reports</h3>
        </div>
        
        <Button variant="outline" size="sm" className="text-xs">
          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New
        </Button>
      </div>

      <div className="space-y-2">
        {sampleReports.map(report => (
          <Card key={report.id} padding="sm" className="hover:shadow-sm transition-shadow">
            <div className="space-y-2">
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  {getReportIcon(report.type)}
                  <h4 className="font-medium text-sm truncate">{report.title}</h4>
                </div>
                {getStatusBadge(report.status)}
              </div>

              {/* Metadata */}
              <div className="flex justify-between items-center text-xs text-foreground/60">
                <span>{report.date}</span>
                {report.size && <span>{report.size}</span>}
              </div>

              {/* Actions */}
              {report.status === 'ready' && (
                <div className="flex gap-1">
                  <Button variant="outline" size="sm" className="flex-1 text-xs">
                    View
                  </Button>
                  <Button variant="ghost" size="sm" className="px-2">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </Button>
                </div>
              )}

              {report.status === 'generating' && (
                <div className="flex items-center gap-2 text-xs text-foreground/60">
                  <div className="w-3 h-3 border border-warning border-t-transparent rounded-full animate-spin"></div>
                  <span>Generating report...</span>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* View All Reports */}
      <Button variant="ghost" className="w-full justify-center text-sm">
        View All Reports
        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </Button>

      {/* Empty State */}
      {sampleReports.length === 0 && (
        <div className="text-center py-8 text-foreground/60">
          <svg
            className="w-12 h-12 mx-auto mb-4 text-foreground/40"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="text-sm">No reports yet</p>
          <p className="text-xs mt-1">Generate your first report from a conversation</p>
        </div>
      )}
    </div>
  );
};