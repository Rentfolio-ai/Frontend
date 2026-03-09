// FILE: src/components/chat/InlineActionsBar.tsx
// Cursor-style inline action chips — minimal, flat, with style differentiation.
// Appear below AI responses as follow-up actions.
// `style: "primary"` chips are visually emphasized; `secondary` are subtle.

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
  search_properties: <Search className="w-3.5 h-3.5" />,
  analyze_portfolio: <Scale className="w-3.5 h-3.5" />,
};

// Style presets for chip appearance
const CHIP_STYLES = {
  primary: {
    base: 'border-[#C08B5C]/30 bg-[#C08B5C]/10 text-[#D4A27F]',
    hover: 'hover:bg-[#C08B5C]/20 hover:text-[#E8C9A0] hover:border-[#C08B5C]/50',
    icon: 'text-[#C08B5C] group-hover:text-[#D4A27F]',
    chevron: 'text-[#C08B5C]/60',
  },
  secondary: {
    base: 'border-black/[0.08] bg-black/[0.02] text-muted-foreground',
    hover: 'hover:bg-black/[0.05] hover:text-foreground/80 hover:border-black/[0.12]',
    icon: 'text-muted-foreground/70 group-hover:text-foreground/70',
    chevron: 'text-muted-foreground',
  },
  danger: {
    base: 'border-red-500/20 bg-red-500/5 text-red-400',
    hover: 'hover:bg-red-500/15 hover:text-red-300 hover:border-red-500/40',
    icon: 'text-red-500/70 group-hover:text-red-400',
    chevron: 'text-red-500/40',
  },
};

export const InlineActionsBar: React.FC<InlineActionsBarProps> = ({
  actions,
  onExecute,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!actions || actions.length === 0) return null;

  // Sort: primary first, then secondary/others
  const sorted = [...actions].sort((a, b) => {
    if (a.style === 'primary' && b.style !== 'primary') return -1;
    if (a.style !== 'primary' && b.style === 'primary') return 1;
    return 0;
  });

  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {sorted.map((action, index) => {
        const icon = TOOL_ICON_MAP[action.tool_name] || <ArrowRight className="w-3.5 h-3.5" />;
        const isHovered = hoveredIndex === index;
        const style = CHIP_STYLES[action.style as keyof typeof CHIP_STYLES] || CHIP_STYLES.secondary;

        return (
          <button
            key={`${action.tool_name}-${index}`}
            onClick={() => onExecute(action)}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            className={`
              group flex items-center gap-2 px-3 py-1.5
              rounded-lg text-[13px] border
              ${style.base} ${style.hover}
              transition-all duration-150 ease-out
              cursor-pointer
            `}
          >
            <span className={`${style.icon} transition-colors duration-150`}>
              {icon}
            </span>
            <span>{action.label}</span>
            <ChevronRight
              className={`
                w-3 h-3 ${style.chevron} transition-all duration-150
                ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-1'}
              `}
            />
          </button>
        );
      })}
    </div>
  );
};
