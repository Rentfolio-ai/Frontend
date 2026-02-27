import React from 'react';
import { Plus, Search, FileText, Mic } from 'lucide-react';

interface QuickActionsBarProps {
  onNewAnalysis: () => void;
  onSearchDeals: () => void;
  onGenerateReport: () => void;
  onVoiceChat: () => void;
}

const ACTIONS = [
  { key: 'analyze', label: 'New Analysis', icon: Plus, accent: true },
  { key: 'deals', label: 'Search Deals', icon: Search, accent: false },
  { key: 'report', label: 'Generate Report', icon: FileText, accent: false },
  { key: 'voice', label: 'Voice Chat', icon: Mic, accent: false },
] as const;

export const QuickActionsBar: React.FC<QuickActionsBarProps> = ({
  onNewAnalysis, onSearchDeals, onGenerateReport, onVoiceChat,
}) => {
  const handlers: Record<string, () => void> = {
    analyze: onNewAnalysis,
    deals: onSearchDeals,
    report: onGenerateReport,
    voice: onVoiceChat,
  };

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {ACTIONS.map(({ key, label, icon: Icon, accent }) => (
        <button
          key={key}
          onClick={handlers[key]}
          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-[13px] font-medium ${
            accent
              ? 'text-[#C08B5C] hover:bg-white/[0.04]'
              : 'text-white/45 hover:bg-white/[0.04] hover:text-white/65'
          }`}
        >
          <Icon className="w-4 h-4" />
          {label}
        </button>
      ))}
    </div>
  );
};
