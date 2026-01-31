// FILE: src/components/pages/DealAnalyzerPage.tsx
/**
 * Full-page Deal Analyzer
 * Replaces modal drawer with dedicated page
 */
import React from 'react';
import { ArrowLeft, X } from 'lucide-react';
import { DealAnalyzer } from '../analysis/DealAnalyzer';
import type { InvestmentStrategy } from '../../types/pnl';

interface DealAnalyzerPageProps {
  propertyId?: string | null;
  initialPurchasePrice?: number;
  initialStrategy?: InvestmentStrategy;
  propertyAddress?: string;
  onBack: () => void;
  onClose: () => void;
}

export const DealAnalyzerPage: React.FC<DealAnalyzerPageProps> = ({
  propertyId,
  initialPurchasePrice = 500000,
  initialStrategy = 'LTR',
  propertyAddress,
  onBack,
  onClose,
}) => {
  return (
    <div className="h-full w-full flex flex-col bg-background">
      {/* Header with back button */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-background/95 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white/80 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Chat
          </button>
          <div className="h-6 w-px bg-white/10" />
          <div>
            <h1 className="text-lg font-semibold text-white">Deal Analyzer</h1>
            {propertyAddress && (
              <p className="text-sm text-white/60 mt-0.5">{propertyAddress}</p>
            )}
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Deal Analyzer Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-[1600px] mx-auto p-6">
          <DealAnalyzer
            propertyId={propertyId}
            initialPurchasePrice={initialPurchasePrice}
            initialStrategy={initialStrategy}
          />
        </div>
      </div>

      {/* Footer with action buttons */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 bg-background/95 backdrop-blur-sm">
        <div className="text-sm text-white/60">
          Changes are auto-saved
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="px-4 py-2 text-sm font-medium text-white/80 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onBack}
            className="px-4 py-2 text-sm font-medium bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors shadow-lg shadow-purple-500/25"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
