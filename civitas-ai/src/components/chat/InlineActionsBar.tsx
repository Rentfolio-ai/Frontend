// FILE: src/components/chat/InlineActionsBar.tsx
// Renders structured inline actions returned by the suggest_actions tool.
// Each action is a button that, when clicked, sends a tool call or message.

import React from 'react';
import { motion } from 'framer-motion';
import {
  Search, TrendingUp, Calculator, FileText, Shield,
  BarChart3, Zap, Target, MapPin, Scale, Lightbulb,
  ArrowRight
} from 'lucide-react';
import type { InlineAction } from '@/types/chat';

interface InlineActionsBarProps {
  actions: InlineAction[];
  onExecute: (action: InlineAction) => void;
  context?: string;
}

// Map tool names to icons for visual recognition
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
  generate_offer_strategy: <Zap className="w-3.5 h-3.5" />,
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
};

// Style variants mapped from backend style field
const STYLE_CLASSES: Record<string, string> = {
  primary: 'bg-gradient-to-r from-[#C08B5C] to-[#A8734A] text-white shadow-lg shadow-[#C08B5C]/15 hover:from-[#D4A27F] hover:to-[#C08B5C] border-transparent',
  secondary: 'bg-white/[0.06] text-white/70 border-white/[0.1] hover:bg-white/[0.1] hover:text-white/90',
  danger: 'bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/15 hover:text-rose-300',
};

export const InlineActionsBar: React.FC<InlineActionsBarProps> = ({
  actions,
  onExecute,
  context,
}) => {
  if (!actions || actions.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: 0.1 }}
      className="mt-3"
    >
      {/* Context label if provided */}
      {context && (
        <p className="text-[11px] text-white/30 font-medium mb-2 flex items-center gap-1.5">
          <Zap className="w-3 h-3 text-[#C08B5C]/50" />
          {context}
        </p>
      )}

      {/* Action buttons */}
      <div className="flex flex-wrap gap-1.5">
        {actions.map((action, index) => {
          const icon = TOOL_ICON_MAP[action.tool_name] || <ArrowRight className="w-3.5 h-3.5" />;
          const styleClass = STYLE_CLASSES[action.style || 'secondary'] || STYLE_CLASSES.secondary;

          return (
            <motion.button
              key={`${action.tool_name}-${index}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, delay: 0.15 + index * 0.06 }}
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onExecute(action)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium
                          border transition-all duration-200 ${styleClass}`}
            >
              {icon}
              <span>{action.label}</span>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
};
