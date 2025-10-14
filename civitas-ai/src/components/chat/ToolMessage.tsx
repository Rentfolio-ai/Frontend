// FILE: src/components/chat/ToolMessage.tsx
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../primitives/Card';
import { Badge } from '../primitives/Badge';
import { Button } from '../primitives/Button';
import { PropertyCard } from '../primitives/PropertyCard';
import type { Property } from '../../types';

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

const ROIAnalysisCard: React.FC<{ data: ROIAnalysisData }> = ({ data }) => (
  <div className="grid grid-cols-2 gap-4">
    <div className="space-y-2">
      <div className="text-sm text-foreground/60">Annual ROI</div>
      <div className="text-2xl font-bold text-success">{data.roi}%</div>
    </div>
    <div className="space-y-2">
      <div className="text-sm text-foreground/60">Cap Rate</div>
      <div className="text-2xl font-bold">{data.capRate}%</div>
    </div>
    <div className="space-y-2">
      <div className="text-sm text-foreground/60">Cash Flow</div>
      <div className="text-lg font-semibold text-success">${data.cashFlow}/mo</div>
    </div>
    <div className="space-y-2">
      <div className="text-sm text-foreground/60">Break Even</div>
      <div className="text-lg font-semibold">{data.breakEven} years</div>
    </div>
  </div>
);

const MarketDataCard: React.FC<{ data: MarketData }> = ({ data }) => (
  <div className="space-y-4">
    <div className="grid grid-cols-3 gap-4">
      <div className="text-center">
        <div className="text-2xl font-bold">${data.medianPrice}</div>
        <div className="text-sm text-foreground/60">Median Price</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-success">+{data.priceGrowth}%</div>
        <div className="text-sm text-foreground/60">YoY Growth</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold">{data.inventory}</div>
        <div className="text-sm text-foreground/60">Days on Market</div>
      </div>
    </div>
    <div className="text-sm text-foreground/60">
      Data for {data.location} as of {data.date}
    </div>
  </div>
);

const PropertyComparisonCard: React.FC<{ data: PropertyComparisonData }> = ({ data }) => {
  // Convert PropertyData to Property format for the PropertyCard component
  const convertToProperty = (propertyData: PropertyData, index: number): Property => ({
    id: `temp-${index}`,
    title: `Property ${index + 1}`,
    address: propertyData.address,
    lat: 0,
    lng: 0,
    price: typeof propertyData.price === 'string' 
      ? parseInt(propertyData.price.replace(/[^0-9]/g, '')) || 0
      : propertyData.price,
    beds: propertyData.beds,
    baths: propertyData.baths,
    sqft: propertyData.sqft,
    yearBuilt: 2000,
    hoa: 0,
    taxes: 0,
    rentEst: 0,
    expensesEst: 0,
    monthlyRoiData: [propertyData.roi, propertyData.roi, propertyData.roi, propertyData.roi, 
                     propertyData.roi, propertyData.roi, propertyData.roi, propertyData.roi,
                     propertyData.roi, propertyData.roi, propertyData.roi, propertyData.roi],
    capRate: propertyData.roi * 0.8, // Estimate cap rate as 80% of ROI
    images: [],
    zip: '',
    city: '',
    state: '',
    propertyType: 'single_family' as const,
    amenities: [],
    description: '',
    // Enhanced fields with sample data
    adrRange: {
      peak: Math.round(propertyData.roi * 15 + 100),
      offSeason: Math.round(propertyData.roi * 10 + 60)
    },
    popularityTag: propertyData.roi > 10 ? 'Hot' : propertyData.roi > 7 ? 'Stable' : 'Declining',
    regulationSnippet: propertyData.roi > 10 
      ? 'High-demand area with strict rental regulations.'
      : 'Standard local rental regulations apply.'
  });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.properties.map((property: PropertyData, index: number) => (
          <PropertyCard 
            key={index} 
            property={convertToProperty(property, index)}
            compact={true}
          />
        ))}
      </div>
    </div>
  );
};

const AlertCard: React.FC<{ data: AlertData }> = ({ data }) => (
  <div className="flex items-start gap-3">
    <div className="w-8 h-8 rounded-full bg-warning/20 flex items-center justify-center flex-shrink-0">
      <svg className="w-4 h-4 text-warning" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
    </div>
    <div>
      <div className="font-semibold">{data.title}</div>
      <div className="text-sm text-foreground/60 mt-1">{data.message}</div>
      {data.action && (
        <Button variant="outline" size="sm" className="mt-2">
          {data.action}
        </Button>
      )}
    </div>
  </div>
);

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