// FILE: src/components/chat/tool-cards/VisionAnalysisCard.tsx
import React from 'react';
import { AlertCircle, DollarSign } from 'lucide-react';
import type { AnalyzePropertyImageOutput } from '../../../types/backendTools';

export interface VisionAnalysisData extends Partial<AnalyzePropertyImageOutput> {
  summary?: string;
  analysis_type?: string;
  room_type?: string;
}

interface VisionAnalysisCardProps {
  data: VisionAnalysisData;
}

export const VisionAnalysisCard: React.FC<VisionAnalysisCardProps> = ({ data }) => {
  // Handle error case
  if (data.success === false) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-3">
        <div className="flex items-center gap-2 text-red-700">
          <AlertCircle className="w-4 h-4" />
          <span className="font-medium text-sm">Analysis Failed</span>
        </div>
        {data.error && <p className="mt-1 text-xs text-red-600">{data.error}</p>}
      </div>
    );
  }

  const costs = data.renovation_costs;
  
  // Only show if we have costs with non-zero values
  const hasValidCosts = costs && (
    (costs.basic_refresh?.total && costs.basic_refresh.total > 0) ||
    (costs.standard_rental?.total && costs.standard_rental.total > 0) ||
    (costs.premium_upgrade?.total && costs.premium_upgrade.total > 0)
  );

  if (!hasValidCosts) {
    return null; // Don't render anything if no valid costs
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
        <DollarSign className="w-3.5 h-3.5" />
        Estimated Renovation Costs
      </div>
      <div className="grid grid-cols-3 gap-2">
        {costs.basic_refresh?.total > 0 && (
          <div className="p-2 bg-green-50 rounded-lg border border-green-100 text-center">
            <p className="text-[10px] text-green-600 font-medium">Basic</p>
            <p className="text-base font-bold text-green-700">
              ${costs.basic_refresh.total.toLocaleString()}
            </p>
          </div>
        )}
        {costs.standard_rental?.total > 0 && (
          <div className="p-2 bg-amber-50 rounded-lg border border-amber-100 text-center">
            <p className="text-[10px] text-amber-600 font-medium">Standard</p>
            <p className="text-base font-bold text-amber-700">
              ${costs.standard_rental.total.toLocaleString()}
            </p>
          </div>
        )}
        {costs.premium_upgrade?.total > 0 && (
          <div className="p-2 bg-violet-50 rounded-lg border border-violet-100 text-center">
            <p className="text-[10px] text-violet-600 font-medium">Premium</p>
            <p className="text-base font-bold text-violet-700">
              ${costs.premium_upgrade.total.toLocaleString()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
