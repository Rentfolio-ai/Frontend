// FILE: src/components/chat/tool-cards/MarketDataCard.tsx
import React from 'react';

interface MarketData {
  medianPrice: string;
  priceGrowth: number;
  inventory: number;
  location: string;
  date: string;
}

interface MarketDataCardProps {
  data: MarketData;
}

export const MarketDataCard: React.FC<MarketDataCardProps> = ({ data }) => (
  <div className="space-y-4">
    <div className="grid grid-cols-3 gap-4">
      <div className="text-center">
        <div className="text-2xl font-bold">${data.medianPrice}</div>
        <div className="text-sm text-foreground/60">Median Price</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-success">+{data.priceGrowth}%</div>
        <div className="text-sm text-foreground/60">YoY Growth</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold">{data.inventory}</div>
        <div className="text-sm text-foreground/60">Days on Market</div>
      </div>
    </div>
    <div className="text-sm text-foreground/60">
      Data for {data.location} as of {data.date}
    </div>
  </div>
);
