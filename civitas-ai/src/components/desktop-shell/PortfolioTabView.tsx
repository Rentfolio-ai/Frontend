// FILE: src/components/desktop-shell/PortfolioTabView.tsx
import React from 'react';
import { PortfolioDashboard } from '../portfolio/PortfolioDashboard';

interface PortfolioTabViewProps {
  // Add props as needed
}

/**
 * Portfolio view within the desktop shell.
 */
export const PortfolioTabView: React.FC<PortfolioTabViewProps> = () => {
  return (
    <div className="h-full w-full overflow-auto">
      <PortfolioDashboard />
    </div>
  );
};
