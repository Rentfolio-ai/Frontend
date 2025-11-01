// FILE: src/components/chat/tool-cards/ROIAnalysisCard.tsx
import React from 'react';

interface ROIAnalysisData {
  roi: number;
  capRate: number;
  cashFlow: number;
  breakEven: number;
}

interface ROIAnalysisCardProps {
  data: ROIAnalysisData;
}

export const ROIAnalysisCard: React.FC<ROIAnalysisCardProps> = ({ data }) => (
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
