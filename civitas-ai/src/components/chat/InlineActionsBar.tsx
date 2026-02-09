// FILE: src/components/chat/InlineActionsBar.tsx
// Cursor-style inline action chips — minimal, flat, monochrome.
// Appear below AI responses as subtle follow-up suggestions.

import React, { useState } from 'react';
import {
  Search, TrendingUp, Calculator, FileText, Shield,
  BarChart3, Zap, Target, MapPin, Scale, Lightbulb,
  ArrowRight, ChevronRight, Settings
} from 'lucide-react';
import type { InlineAction } from '@/types/chat';

interface InlineActionsBarProps {
  actions: InlineAction[];
  onExecute: (action: InlineAction) => void;
  context?: string;
}

// Map tool names to icons
const TOOL_ICON_MAP: Record<string, React.ReactNode> = {
  scan_market: <Search className="w-3.5 h-3.5" />,
  hunt_deals: <Target className="w-3.5 h-3.5" />,
  detect_deal_killers: <Shield className="w-3.5 h-3.5" />,
  find_comps_with_intel: <BarChart3 className="w-3.5 h-3.5" />,
  generate_offer_strategy: <Zap className="w-3.5 h-3.5" />,
  analyze_neighborhood_trajectory: <MapPin className="w-3.5 h-3.5" />,
  get_market_stats: <TrendingUp className="w-3.5 h-3.5" />,
  request_financial_analysis: <Calculator className="w-3.5 h-3.5" />,
  request_metrics_calculation: <Calculator className="w-3.5 h-3.5" />,
  calculate_rental_cash_flow: <Calculator className="w-3.5 h-3.5" />,
  generate_report: <FileText className="w-3.5 h-3.5" />,
  portfolio_analyzer_tool: <Scale className="w-3.5 h-3.5" />,
  simulate_portfolio_scenarios: <BarChart3 className="w-3.5 h-3.5" />,
  web_search: <Search className="w-3.5 h-3.5" />,
  research_new_market: <Lightbulb className="w-3.5 h-3.5" />,
  predict_appreciation: <TrendingUp className="w-3.5 h-3.5" />,
  detect_portfolio_vulnerabilities: <Shield className="w-3.5 h-3.5" />,
  generate_tax_strategy: <FileText className="w-3.5 h-3.5" />,
  ask_clarifying_questions: <Lightbulb className="w-3.5 h-3.5" />,
  analyze_market_trend_depth: <TrendingUp className="w-3.5 h-3.5" />,
  research_economic_drivers: <BarChart3 className="w-3.5 h-3.5" />,
  analyze_rental_demand_depth: <Search className="w-3.5 h-3.5" />,
  forecast_regulatory_changes: <FileText className="w-3.5 h-3.5" />,
  navigate_to_preferences: <Settings className="w-3.5 h-3.5" />,
  navigate_to_upgrade: <Zap className="w-3.5 h-3.5" />,
};

export const InlineActionsBar: React.FC<InlineActionsBarProps> = ({
  actions,
  onExecute,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!actions || actions.length === 0) return null;

  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {actions.map((action, index) => {
        const icon = TOOL_ICON_MAP[action.tool_name] || <ArrowRight className="w-3.5 h-3.5" />;
        const isHovered = hoveredIndex === index;

        return (
          <button
            key={`${action.tool_name}-${index}`}
            onClick={() => onExecute(action)}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            className={`
              group flex items-center gap-2 px-3 py-1.5
              rounded-lg text-[13px]
              border border-white/[0.08]
              bg-white/[0.03]
              text-zinc-400
              hover:bg-white/[0.07] hover:text-zinc-200 hover:border-white/[0.15]
              transition-all duration-150 ease-out
              cursor-pointer
            `}
          >
            <span className="text-zinc-500 group-hover:text-zinc-300 transition-colors duration-150">
              {icon}
            </span>
            <span>{action.label}</span>
            <ChevronRight
              className={`
                w-3 h-3 text-zinc-600 transition-all duration-150
                ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-1'}
              `}
            />
          </button>
        );
      })}
    </div>
  );
};
