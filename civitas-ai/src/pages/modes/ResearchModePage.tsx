import React from 'react';
import { ModePageTemplate } from './ModePageTemplate';
import type { ModePageConfig } from './ModePageTemplate';
import { MarketIntelMockup } from '../../components/landing/ProductMockups';

const ResearchIcon: React.FC = () => (
  <svg viewBox="0 0 32 32" className="w-8 h-8" fill="none">
    <rect x="4" y="6" width="24" height="20" rx="3" stroke="#60A5FA" strokeWidth="2.5" />
    <path d="M7 10H25" stroke="#60A5FA" strokeWidth="1.25" strokeLinecap="round" opacity="0.25" />
    <path d="M9 14H23M9 18H18" stroke="#60A5FA" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
    <circle cx="24" cy="24" r="5" stroke="#60A5FA" strokeWidth="2" fill="white" />
    <path d="M24 22V26M22 24H26" stroke="#60A5FA" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const config: ModePageConfig = {
  name: 'Deep Research',
  tagline: 'Comprehensive market intelligence from every angle',
  description: 'Deep Research synthesizes multiple data sources — market statistics, economic indicators, census demographics, policy analysis, and web intelligence — to build a complete, evidence-based picture. Both bull and bear cases, always cited.',
  accentColor: '#60A5FA',
  accentColorLight: '#3B82F6',
  icon: <ResearchIcon />,
  capabilities: [
    {
      title: 'Neighborhood Deep Dives',
      description: 'Get granular data on any neighborhood — median rents, appreciation rates, vacancy, school ratings, crime stats, and demographic trends.',
    },
    {
      title: 'Comparable Analysis',
      description: 'Pull comps for any property in seconds. See recent sales, current listings, and rental comps with side-by-side financial comparisons.',
    },
    {
      title: 'Market Trend Reports',
      description: 'Track rent growth, price appreciation, inventory levels, and demand signals across metros. Spot emerging markets before they peak.',
    },
    {
      title: 'Data Synthesis',
      description: 'Research combines data from MLS, Census, county records, RentCast, and rental platforms into clear, actionable summaries. No tab-switching required.',
    },
  ],
  steps: [
    { num: '01', title: 'Ask a research question', description: 'Ask about any market, neighborhood, or property — "What\'s the rent trend in East Nashville?" or "Compare Austin vs Phoenix for LTR."' },
    { num: '02', title: 'AI aggregates data', description: 'Research pulls from multiple data sources, cross-references trends, and synthesizes findings into a comprehensive analysis.' },
    { num: '03', title: 'Get actionable insights', description: 'Receive structured reports with charts, trends, risk factors, and clear recommendations you can act on immediately.' },
  ],
  mockup: <MarketIntelMockup />,
};

interface ResearchModePageProps {
  onNavigateToSignUp: () => void;
  onNavigateToHome: () => void;
}

export const ResearchModePage: React.FC<ResearchModePageProps> = (props) => (
  <ModePageTemplate config={config} {...props} />
);
