// FILE: src/components/chat/ToolMessage.tsx
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../primitives/Card';
import { Badge } from '../primitives/Badge';
import {
  ROIAnalysisCard,
  MarketDataCard,
  PropertyBookmarkCard,
  AlertCard,
  DealIntelligenceCard,
  ComplianceCard,
  ValuationCard,
  SendEmailCard,
  SendTextCard,
  InboundMessageCard,
} from './tool-cards';
import { Search } from 'lucide-react';
import type { DealAnalyzerData } from './tool-cards';
import type { ValuationData } from './tool-cards';
import type { VisionAnalysisData } from './tool-cards';
import type { InvestmentStrategy } from '../../types/pnl';
import type { ComplianceResult } from '../../types/compliance';
import type { BookmarkedProperty } from '../../types/bookmarks';
import type { ScoutedProperty } from '../../types/backendTools';

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

type SearchRentalsToolResult = {
  kind: 'search_rentals';
  title: string;
  data: any;
  status: 'success' | 'warning' | 'error';
};

type SendEmailToolResult = {
  kind: 'send_email';
  title: string;
  data: {
    professional_name: string;
    professional_id: string;
    to_email: string;
    subject: string;
    body: string;
    subject_variants?: string[];
    tone?: string;
    length?: string;
    tool_type?: string;
  };
  status: 'success' | 'warning' | 'error';
};

type SendTextToolResult = {
  kind: 'send_text';
  title: string;
  data: {
    professional_name: string;
    professional_id: string;
    to_phone: string;
    body: string;
    channel?: 'sms' | 'whatsapp';
    tone?: string;
    tool_type?: string;
  };
  status: 'success' | 'warning' | 'error';
};

type InboundMessageToolResult = {
  kind: 'inbound_message';
  title: string;
  data: {
    conversation_id?: string;
    message_id?: string;
    channel?: 'sms' | 'email' | 'whatsapp';
    from_name?: string;
    subject?: string;
    content?: string;
    body?: string;
    timestamp?: string;
  };
  status: 'success' | 'warning' | 'error';
};

type GenericToolResult = {
  kind: 'generic' | 'property_comparison_table' | 'generated_report' | 'portfolio_analysis' | 'cashflow_timeseries' | 'report';
  title: string;
  data: any;
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
  | SearchRentalsToolResult
  | SendEmailToolResult
  | SendTextToolResult
  | InboundMessageToolResult
  | GenericToolResult;

interface ToolMessageProps {
  tool: ToolResult;
  timestamp: string;
  onOpenDealAnalyzer?: (propertyId: string | null, strategy: InvestmentStrategy, purchasePrice?: number, propertyAddress?: string) => void;
  bookmarks?: BookmarkedProperty[];
  onToggleBookmark?: (property: ScoutedProperty) => void;
  onAction?: (query: string) => void;
  onRefine?: (instruction: string) => void;
  onGoToIntegrations?: () => void;
  onSendComplete?: (summary: string) => void;
}

export const ToolMessage: React.FC<ToolMessageProps> = ({
  tool,
  timestamp,
  onOpenDealAnalyzer,
  bookmarks,
  onToggleBookmark,
  onAction: _onAction,
  onRefine,
  onGoToIntegrations,
  onSendComplete,
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
        // Route to DealIntelligenceCard, mapping DealAnalyzerData to its expected shape
        return (
          <DealIntelligenceCard
            data={{
              propertyId: tool.data.propertyId,
              propertyAddress: tool.data.propertyAddress,
              strategy: tool.data.strategy,
              fullOutput: tool.data.fullOutput,
              pnlSummary: tool.data.pnlSummary,
            }}
            onOpenAnalyzer={onOpenDealAnalyzer}
          />
        );
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
      case 'Property Scout': {
        const topPicks = tool.data?.top_picks || [];
        const moreMatches = tool.data?.more_matches || [];
        const allProperties = tool.data?.properties || [...topPicks, ...moreMatches];
        const count = tool.data?.total_found || allProperties.length;
        const location = tool.data?.market_context?.location || '';

        if (count === 0) return null;

        return (
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-black/[0.03] border border-black/[0.08]">
            <div className="w-7 h-7 rounded-md bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
              <Search className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[13px] font-medium text-foreground/80">
                {count} {count === 1 ? 'property' : 'properties'} found{location ? ` in ${location}` : ''}
              </span>
              {topPicks.length > 0 && (
                <span className="text-[11px] text-muted-foreground/70">
                  {topPicks.length} AI top {topPicks.length === 1 ? 'pick' : 'picks'}
                </span>
              )}
            </div>
          </div>
        );
      }
      case 'search_rentals': {
        const rentals = tool.data?.properties || [];
        const rentalCount = rentals.length;
        const rentalLocation = tool.data?.market_context?.location || '';

        if (rentalCount === 0) return null;

        return (
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-black/[0.03] border border-black/[0.08]">
            <div className="w-7 h-7 rounded-md bg-blue-500/10 flex items-center justify-center flex-shrink-0">
              <Search className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <span className="text-[13px] font-medium text-foreground/80">
              {rentalCount} {rentalCount === 1 ? 'rental' : 'rentals'} found{rentalLocation ? ` in ${rentalLocation}` : ''}
            </span>
          </div>
        );
      }
      case 'send_email':
        return (
          <SendEmailCard
            professionalId={tool.data.professional_id || 'manual'}
            professionalName={tool.data.professional_name || 'Recipient'}
            toEmail={tool.data.to_email || ''}
            subject={tool.data.subject || ''}
            body={tool.data.body || ''}
            subjectVariants={tool.data.subject_variants}
            tone={tool.data.tone}
            onRefine={onRefine}
            onGoToIntegrations={onGoToIntegrations}
            onSendComplete={onSendComplete}
          />
        );
      case 'send_text':
        return (
          <SendTextCard
            professionalId={tool.data.professional_id || 'manual'}
            professionalName={tool.data.professional_name || 'Recipient'}
            toPhone={tool.data.to_phone || ''}
            body={tool.data.body || ''}
            defaultChannel={tool.data.channel || 'sms'}
            tone={tool.data.tone}
            onRefine={onRefine}
            onSendComplete={onSendComplete}
          />
        );
      case 'inbound_message':
        return (
          <InboundMessageCard
            message={{
              conversationId: tool.data.conversation_id || '',
              messageId: tool.data.message_id,
              channel: tool.data.channel || 'sms',
              fromName: tool.data.from_name || 'Unknown',
              subject: tool.data.subject,
              content: tool.data.content || tool.data.body || '',
              timestamp: tool.data.timestamp,
            }}
            onReply={onRefine ? (_convId, name, ch, content) => {
              onRefine(`Reply to ${name}'s ${ch} message: "${content}"`);
            } : undefined}
          />
        );
      case 'generic':
      case 'property_comparison_table':
      case 'generated_report':
      case 'portfolio_analysis':
      case 'cashflow_timeseries':
      case 'report':
        return null;
      default: {
        // This ensures exhaustiveness checking at compile time, properly scoped in a block
        const exhaustiveCheck = (x: never): never => {
          throw new Error(`Unhandled tool kind: ${(x as any).kind}`);
        };
        return exhaustiveCheck(tool);
      }
    }
  };

  // Communication and property/rental tools render their own styled cards directly
  if (tool.kind === 'send_email' || tool.kind === 'send_text' || tool.kind === 'inbound_message') {
    return (
      <div className="relative w-[calc(100%+100px)] -ml-[50px] max-w-[680px] mx-auto animate-slide-in mb-2">
        {renderToolContent()}
      </div>
    );
  }

  if (tool.kind === 'scout_properties' || tool.kind === 'Property Scout' || tool.kind === 'search_rentals') {
    return (
      <div className="max-w-chat mx-auto animate-slide-in mb-2">
        {renderToolContent()}
      </div>
    );
  }

  return (
    <div className="max-w-chat mx-auto animate-slide-in">
      <Card
        variant="default"
        className="mb-4 bg-white/95 dark:bg-black/8 border border-white/40 dark:border-black/10 shadow-soft backdrop-blur"
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