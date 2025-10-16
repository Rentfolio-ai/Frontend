// FILE: src/components/chat/ToolMessage.tsx
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../primitives/Card';
import { Badge } from '../primitives/Badge';
import { 
  ROIAnalysisCard, 
  MarketDataCard, 
  PropertyComparisonCard, 
  AlertCard 
} from './tool-cards';

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

// Create a discriminated union of all tool result types
type ToolResult = 
  | RoiAnalysisToolResult
  | MarketDataToolResult
  | PropertyComparisonToolResult
  | AlertToolResult;

interface ToolMessageProps {
  tool: ToolResult;
  timestamp: string;
}

export const ToolMessage: React.FC<ToolMessageProps> = ({ tool, timestamp }) => {
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
        // TypeScript now knows tool.data is PropertyComparisonData
        return <PropertyComparisonCard data={tool.data} />;
      case 'alert':
        // TypeScript now knows tool.data is AlertData
        return <AlertCard data={tool.data} />;
      default: {
        // This ensures exhaustiveness checking at compile time, properly scoped in a block
        const exhaustiveCheck = (x: never): never => {
          throw new Error(`Unhandled tool kind: ${(x as any).kind}`);
        };
        return exhaustiveCheck(tool);
      }
    }
  };

  return (
    <div className="max-w-chat mx-auto animate-slide-in">
      <Card variant="elevated" className="mb-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                <svg className="w-3 h-3 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
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