import React from 'react';
import { ModePageTemplate } from './ModePageTemplate';
import type { ModePageConfig } from './ModePageTemplate';
import { PortfolioStrategyMockup } from '../../components/landing/ProductMockups';

const StrategistIcon: React.FC = () => (
  <svg viewBox="0 0 32 32" className="w-8 h-8" fill="none">
    <path d="M6 26L12 16L18 20L26 6" stroke="#A78BFA" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M6 26L12 16L18 20L26 6" stroke="#7C3AED" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" opacity="0.35" />
    <circle cx="26" cy="6" r="3" stroke="#A78BFA" strokeWidth="2" fill="white" />
    <path d="M6 22V28H28" stroke="#A78BFA" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
  </svg>
);

const config: ModePageConfig = {
  name: 'Expert Strategist',
  tagline: 'Institutional-grade portfolio strategy',
  description: 'Expert Strategist delivers scenario modeling, tax optimization, risk-adjusted return analysis, and multi-decade wealth planning. Every recommendation is stress-tested with best/base/worst case projections.',
  accentColor: '#A78BFA',
  accentColorLight: '#7C3AED',
  icon: <StrategistIcon />,
  capabilities: [
    {
      title: 'Portfolio Performance Tracking',
      description: 'Monitor property-level ROI, cash flow, and appreciation across your entire portfolio. Identify underperformers and rebalancing opportunities.',
    },
    {
      title: 'Acquisition Modeling',
      description: 'Model the impact of adding a new property to your portfolio. See how it affects overall returns, risk exposure, and geographic diversification.',
    },
    {
      title: 'Risk Assessment',
      description: 'Analyze market concentration, vacancy risk, interest rate sensitivity, and cash reserve adequacy. Get alerts before problems become costly.',
    },
    {
      title: 'Long-Term Projections',
      description: 'Generate 5, 10, and 30-year return projections for individual properties or your entire portfolio. Factor in appreciation, rent growth, and debt paydown.',
    },
  ],
  steps: [
    { num: '01', title: 'Connect your portfolio', description: 'Add your properties with purchase price, current rents, and expenses. Strategist builds a comprehensive view of your holdings.' },
    { num: '02', title: 'AI analyzes performance', description: 'Strategist evaluates each property and your portfolio as a whole — identifying strengths, weaknesses, and opportunities.' },
    { num: '03', title: 'Plan your next move', description: 'Get recommendations for rebalancing, new acquisitions, or exits. Model scenarios and see projected impact before committing.' },
  ],
  mockup: <PortfolioStrategyMockup />,
};

interface StrategistModePageProps {
  onNavigateToSignUp: () => void;
  onNavigateToHome: () => void;
}

export const StrategistModePage: React.FC<StrategistModePageProps> = (props) => (
  <ModePageTemplate config={config} {...props} />
);
