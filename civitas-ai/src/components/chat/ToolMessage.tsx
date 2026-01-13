// FILE: src/components/chat/ToolMessage.tsx
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../primitives/Card';
import { Badge } from '../primitives/Badge';
import {
  ROIAnalysisCard,
  MarketDataCard,
  PropertyBookmarkCard,
  AlertCard,
  DealAnalyzerCard,
  ComplianceCard,
  ValuationCard,

} from './tool-cards';
import type { DealAnalyzerData } from './tool-cards';
import type { ValuationData } from './tool-cards';
import type { VisionAnalysisData } from './tool-cards';
import type { InvestmentStrategy } from '../../types/pnl';
import type { ComplianceResult } from '../../types/compliance';
import type { BookmarkedProperty } from '../../types/bookmarks';
import type { ScoutedProperty } from '../../types/backendTools';
import { AppLauncherMessage } from './AppLauncherMessage';

interface ROIAnalysisData {
  roi: number;
  capRate: number;
  cashFlow: number;
  breakEven: number;
}

interface MarketData {
  medianPrice: string;
  priceGrowth: number;
  inventory: number;
  location: string;
  date: string;
}

interface PropertyData {
  address: string;
  price: string;
  beds: number;
  baths: number;
  sqft: number;
  roi: number;
}

interface PropertyComparisonData {
  properties: PropertyData[];
}

interface AlertData {
  title: string;
  message: string;
  action?: string;
}

// Define specific tool result types as discriminated unions
type RoiAnalysisToolResult = {
  kind: 'roi_analysis';
  title: string;
  data: ROIAnalysisData;
  status: 'success' | 'warning' | 'error';
};

type MarketDataToolResult = {
  kind: 'market_data';
  title: string;
  data: MarketData;
  status: 'success' | 'warning' | 'error';
};

type PropertyComparisonToolResult = {
  kind: 'property_comparison';
  title: string;
  data: PropertyComparisonData;
  status: 'success' | 'warning' | 'error';
};

type AlertToolResult = {
  kind: 'alert';
  title: string;
  data: AlertData;
  status: 'success' | 'warning' | 'error';
};

type DealAnalyzerToolResult = {
  kind: 'deal_analyzer';
  title: string;
  data: DealAnalyzerData;
  status: 'success' | 'warning' | 'error';
};

type ComplianceToolResult = {
  kind: 'compliance_check';
  title: string;
  data: ComplianceResult;
  status: 'success' | 'warning' | 'error';
};

type ValuationToolResult = {
  kind: 'valuation';
  title: string;
  data: ValuationData;
  status: 'success' | 'warning' | 'error';
};

type RenovationAnalysisToolResult = {
  kind: 'renovation_analysis';
  title: string;
  data: VisionAnalysisData;
  status: 'success' | 'warning' | 'error';
};

type ScoutPropertiesToolResult = {
  kind: 'scout_properties' | 'Property Scout';
  title: string;
  data: any; // Generic data for now
  status: 'success' | 'warning' | 'error';
};

type AppLauncherToolResult = {
  kind: 'app_launcher';
  title: string;
  data: {
    appId: string;
    context: Record<string, any>;
    reason?: string;
  };
  status: 'success' | 'warning' | 'error';
};

// Create a discriminated union of all tool result types
type ToolResult =
  | RoiAnalysisToolResult
  | MarketDataToolResult
  | PropertyComparisonToolResult
  | AlertToolResult
  | DealAnalyzerToolResult
  | ComplianceToolResult
  | ValuationToolResult
  | RenovationAnalysisToolResult
  | ScoutPropertiesToolResult
  | AppLauncherToolResult;

interface ToolMessageProps {
  tool: ToolResult;
  timestamp: string;
  onOpenDealAnalyzer?: (propertyId: string | null, strategy: InvestmentStrategy) => void;
  // Property bookmark support
  bookmarks?: BookmarkedProperty[];
  onToggleBookmark?: (property: ScoutedProperty) => void;
}

export const ToolMessage: React.FC<ToolMessageProps> = ({
  tool,
  timestamp,
  onOpenDealAnalyzer,
  bookmarks,
  onToggleBookmark,
}) => {
  const getStatusBadge = () => {
    switch (tool.status) {
      case 'success':
        return <Badge variant="success">Success</Badge>;
      case 'warning':
        return <Badge variant="warning">Warning</Badge>;
      case 'error':
        return <Badge variant="danger">Error</Badge>;
      default:
        return null;
    }
  };

  const renderToolContent = () => {
    switch (tool.kind) {
      case 'roi_analysis':
        // TypeScript now knows tool.data is ROIAnalysisData
        return <ROIAnalysisCard data={tool.data} />;
      case 'market_data':
        // TypeScript now knows tool.data is MarketData
        return <MarketDataCard data={tool.data} />;
      case 'property_comparison':
        // Use bookmark card instead of property cards
        return (
          <PropertyBookmarkCard
            data={tool.data}
            bookmarks={bookmarks}
            onToggleBookmark={onToggleBookmark}
          />
        );
      case 'alert':
        // TypeScript now knows tool.data is AlertData
        return <AlertCard data={tool.data} />;
      case 'deal_analyzer':
        // TypeScript now knows tool.data is DealAnalyzerData
        return <DealAnalyzerCard data={tool.data} onOpenAnalyzer={onOpenDealAnalyzer} />;
      case 'compliance_check':
        return <ComplianceCard data={tool.data} />;
      case 'valuation':
        // TypeScript now knows tool.data is ValuationData
        return <ValuationCard data={tool.data} onOpenDealAnalyzer={onOpenDealAnalyzer} />;
      case 'renovation_analysis':
        // This should not reach here - renovation_analysis is handled directly in MessageBubble
        // But we include it for TypeScript exhaustiveness checking
        return null;
      case 'scout_properties':
      case 'Property Scout':
        // Scout properties tool - just show a simple message for now
        return (
          <div className="text-sm text-foreground/80">
            Property search completed. Results are shown in the chat.
          </div>
        );
      case 'app_launcher':
        // Use the new AppLauncherMessage component
        return (
          <AppLauncherMessage
            appId={tool.data.appId}
            appName={tool.title}
            context={tool.data.context}
            reason={tool.data.reason}
          />
        );
      default: {
        return null; // Safe fallback
      }
    }
  };

  // For app launcher, we might want to skip the standard card wrapper if the component handles it well
  // But strictly, ToolMessage wraps everything in a Card. 
  // AppLauncherMessage has its own card styling.
  if (tool.kind === 'app_launcher') {
    return (
      <div className="max-w-chat mx-auto animate-slide-in">
        {renderToolContent()}
      </div>
    );
  }

  return (
    <div className="max-w-chat mx-auto animate-slide-in">
      <Card
        variant="default"
        className="mb-4 bg-white/95 dark:bg-white/10 border border-white/40 dark:border-white/15 shadow-soft backdrop-blur"
      >
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <div className="w-6 h-6 bg-primary/15 text-primary rounded flex items-center justify-center">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                </svg>
              </div>
              {tool.title}
            </CardTitle>
            <div className="flex items-center gap-2">
              {getStatusBadge()}
              <span className="text-xs text-foreground/60">{timestamp}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {renderToolContent()}
        </CardContent>
      </Card>
    </div>
  );
};