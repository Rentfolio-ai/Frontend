import React from 'react';
import { ModePageTemplate } from './ModePageTemplate';
import type { ModePageConfig } from './ModePageTemplate';
import { DealUnderwritingMockup } from '../../components/landing/ProductMockups';

const HunterIcon: React.FC = () => (
  <svg viewBox="0 0 32 32" className="w-8 h-8" fill="none">
    <circle cx="14" cy="14" r="9" stroke="#C08B5C" strokeWidth="2.5" />
    <circle cx="14" cy="14" r="5.5" stroke="#D4A27F" strokeWidth="1.5" opacity="0.45" />
    <path d="M21 21L28 28" stroke="#C08B5C" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M14 10V18M10 14H18" stroke="#C08B5C" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
  </svg>
);

const config: ModePageConfig = {
  name: 'Deep Search',
  tagline: 'In-depth property analysis that leaves no stone unturned',
  description: 'Deep Search scans thousands of listings, runs exhaustive due diligence on every property — income analysis, risk factors, financing scenarios, neighborhood context, and negotiation intelligence. Every deal gets a thorough verdict.',
  accentColor: '#C08B5C',
  accentColorLight: '#D4A27F',
  icon: <HunterIcon />,
  capabilities: [
    {
      title: 'AI-Powered Property Scouting',
      description: 'Define your criteria once — city, budget, return targets, property type — and Hunter searches across MLS, Zillow, RentCast, and more to find matching deals.',
    },
    {
      title: 'Instant Underwriting & Scoring',
      description: 'Every property gets a 0-100 value score based on cap rate, cash flow projections, rent comps, and market fundamentals. Skip the spreadsheet.',
    },
    {
      title: 'Top 5 Ranked Results',
      description: 'Properties are ranked by investment potential. The top 5 get detailed financial breakdowns; the rest are available for deep-dive if you want to explore further.',
    },
    {
      title: 'Exportable Reports',
      description: 'Generate PDF reports for any property in one click. Share with partners, send to lenders, or keep for your records.',
    },
  ],
  steps: [
    { num: '01', title: 'Tell Hunter what you want', description: 'Describe your ideal deal — location, budget, return targets, and property type. Be as specific or broad as you like.' },
    { num: '02', title: 'AI scans the market', description: 'Hunter searches listings, runs financial analysis, and scores every property against your goals in real time.' },
    { num: '03', title: 'Review ranked results', description: 'Get a ranked list of properties with full financials, AI verdicts, and downloadable reports. Act on the best deals first.' },
  ],
  mockup: <DealUnderwritingMockup />,
};

interface HunterModePageProps {
  onNavigateToSignUp: () => void;
  onNavigateToHome: () => void;
}

export const HunterModePage: React.FC<HunterModePageProps> = (props) => (
  <ModePageTemplate config={config} {...props} />
);
