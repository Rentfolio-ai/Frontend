// FILE: src/components/rail/SuggestedNextSteps.tsx
import React from 'react';
import { Card } from '../primitives/Card';
import { 
  TrendingUp, 
  MapPin, 
  DollarSign, 
  BarChart3, 
  Target, 
  Search,
  Calculator,
  FileText,
  Zap
} from 'lucide-react';
import { cn } from '../../lib/utils';
import type { SuggestionCategory, Priority } from '@/types/enums';

interface SuggestedAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  prompt: string;
  category: SuggestionCategory;
  priority: Priority;
}

interface SuggestedNextStepsProps {
  onActionClick?: (prompt: string) => void;
  className?: string;
}

import { SuggestionCategory as SuggestionCategoryEnum, Priority as PriorityEnum } from '@/types/enums';

const suggestedActions: SuggestedAction[] = [
  {
    id: 'compare-la',
    label: 'Compare with Los Angeles',
    icon: MapPin,
    prompt: 'Compare current property market trends between this area and Los Angeles, including price differences, ROI potential, and investment opportunities.',
    category: SuggestionCategoryEnum.Comparison,
    priority: PriorityEnum.High
  },
  {
    id: 'market-trends',
    label: 'Analyze Market Trends',
    icon: TrendingUp,
    prompt: 'Analyze current real estate market trends in this area, including price movements, demand patterns, and future projections.',
    category: SuggestionCategoryEnum.Market,
    priority: PriorityEnum.High
  },
  {
    id: 'roi-calculator',
    label: 'Calculate ROI Scenarios',
    icon: Calculator,
    prompt: 'Calculate detailed ROI scenarios for different investment strategies, including buy-and-hold, fix-and-flip, and rental income analysis.',
    category: SuggestionCategoryEnum.Analysis,
    priority: PriorityEnum.Medium
  },
  {
    id: 'neighborhood-analysis',
    label: 'Neighborhood Deep Dive',
    icon: Search,
    prompt: 'Provide a comprehensive neighborhood analysis including demographics, growth potential, amenities, and investment risks.',
    category: SuggestionCategoryEnum.Analysis,
    priority: PriorityEnum.Medium
  },
  {
    id: 'cash-flow-analysis',
    label: 'Cash Flow Analysis',
    icon: DollarSign,
    prompt: 'Analyze potential cash flow scenarios including rental income, expenses, vacancy rates, and net operating income projections.',
    category: SuggestionCategoryEnum.Analysis,
    priority: PriorityEnum.High
  },
  {
    id: 'competitive-analysis',
    label: 'Competitive Properties',
    icon: BarChart3,
    prompt: 'Find and analyze competitive properties in the area, comparing prices, features, and investment potential.',
    category: SuggestionCategoryEnum.Comparison,
    priority: PriorityEnum.Medium
  },
  {
    id: 'investment-strategy',
    label: 'Investment Strategy',
    icon: Target,
    prompt: 'Develop a customized investment strategy based on my risk tolerance, budget, and investment goals.',
    category: SuggestionCategoryEnum.Analysis,
    priority: PriorityEnum.Medium
  },
  {
    id: 'market-report',
    label: 'Generate Market Report',
    icon: FileText,
    prompt: 'Generate a comprehensive market report with data visualizations, trends analysis, and investment recommendations.',
    category: SuggestionCategoryEnum.Report,
    priority: PriorityEnum.Low
  }
];

const getPriorityIcon = (priority: Priority) => {
  switch (priority) {
    case PriorityEnum.High:
      return '🔥';
    case PriorityEnum.Medium:
      return '⚡';
    case PriorityEnum.Low:
      return '💡';
    default:
      return '⚡';
  }
};

export const SuggestedNextSteps: React.FC<SuggestedNextStepsProps> = ({ 
  onActionClick,
  className 
}) => {
  const handleActionClick = (action: SuggestedAction) => {
    if (onActionClick) {
      onActionClick(action.prompt);
    }
  };

  // Prioritize and limit suggestions
  const prioritizedActions = suggestedActions
    .sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    })
    .slice(0, 6); // Show top 6 suggestions

  return (
    <div className={cn("p-4", className)}>
      <div className="flex items-center space-x-2 mb-4">
        <Zap className="w-4 h-4 text-primary" />
        <h3 className="text-base font-medium">Suggested Next Steps</h3>
      </div>
      
      <div className="space-y-2">
        {prioritizedActions.map((action) => {
          const IconComponent = action.icon;
          return (
            <Card
              key={action.id}
              variant="outlined"
              padding="sm"
              className={cn(
                "cursor-pointer transition-all duration-200 hover:shadow-sm group",
                "border border-border hover:border-primary/30",
                "hover:bg-accent/20"
              )}
              onClick={() => handleActionClick(action)}
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 flex items-center space-x-1">
                  <IconComponent className="w-4 h-4 text-primary" />
                  <span className="text-xs">{getPriorityIcon(action.priority)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                    {action.label}
                  </div>
                  <div className="text-xs text-muted-foreground capitalize">
                    {action.category} • {action.priority} priority
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
        
        {/* Show More Card */}
        <Card
          variant="outlined"
          padding="sm"
          className="cursor-pointer transition-all duration-200 hover:shadow-sm hover:bg-accent/10 border-dashed"
          onClick={() => onActionClick?.('Show me more investment analysis options and suggestions for this property.')}
        >
          <div className="flex items-center justify-center space-x-2 text-muted-foreground hover:text-foreground transition-colors">
            <Search className="w-3 h-3" />
            <span className="text-xs">Show more suggestions...</span>
          </div>
        </Card>
      </div>
    </div>
  );
};