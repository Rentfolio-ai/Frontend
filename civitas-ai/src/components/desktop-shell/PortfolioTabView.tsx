// FILE: src/components/desktop-shell/PortfolioTabView.tsx
import React from 'react';
import { PortfolioDashboard } from '../portfolio';

interface PortfolioTabViewProps {
  // Add any props needed for portfolio view
}

export const PortfolioTabView: React.FC<PortfolioTabViewProps> = () => {
  return (
    <div className="h-full w-full overflow-auto p-6">
      <PortfolioDashboard />
    </div>
  );
};

