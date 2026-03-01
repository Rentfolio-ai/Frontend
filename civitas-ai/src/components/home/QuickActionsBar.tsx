import React from 'react';
import { Plus, Search, FileText, Mic } from 'lucide-react';

interface QuickActionsBarProps {
  onNewAnalysis: () => void;
  onSearchDeals: () => void;
  onGenerateReport: () => void;
  onVoiceChat: () => void;
}

const PILLS = [
  { key: 'analyze', label: 'New analysis', icon: Plus, accent: true },
  { key: 'deals', label: 'Deals', icon: Search, accent: false },
  { key: 'report', label: 'Reports', icon: FileText, accent: false },
  { key: 'voice', label: 'Voice', icon: Mic, accent: false },
] as const;

export const QuickActionsBar: React.FC<QuickActionsBarProps> = ({
  onNewAnalysis,
  onSearchDeals,
  onGenerateReport,
  onVoiceChat,
}) => {
  const handlers: Record<string, () => void> = {
    analyze: onNewAnalysis,
    deals: onSearchDeals,
    report: onGenerateReport,
    voice: onVoiceChat,
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {PILLS.map(({ key, label, icon: Icon, accent }) => (
        <button
          key={key}
          onClick={handlers[key]}
          className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12px] font-medium ${
            accent
              ? 'bg-[#C08B5C]/15 text-[#D4A27F] hover:bg-[#C08B5C]/22'
              : 'bg-white/[0.04] text-white/55 hover:bg-white/[0.07] hover:text-white/70'
          }`}
        >
          <Icon className="w-3.5 h-3.5" />
          {label}
        </button>
      ))}
    </div>
  );
};
