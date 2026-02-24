export type ProfessionalCategory =
  | 'real_estate_agent'
  | 'lender'
  | 'contractor'
  | 'inspector'
  | 'property_manager';

export interface Professional {
  id: string;
  name: string;
  category: ProfessionalCategory;
  description: string;
  specialties: string[];
  rating: number;
  reviewCount: number;
  featured: boolean;
  accentColor: string;
  imageUrl?: string;
  phone?: string;
  email?: string;
  website?: string;
  serviceAreas: string[];
}

export const CATEGORY_LABELS: Record<ProfessionalCategory, string> = {
  real_estate_agent: 'Real Estate Agents',
  lender: 'Lenders',
  contractor: 'Contractors',
  inspector: 'Inspectors',
  property_manager: 'Property Managers',
};

export const CATEGORY_ORDER: ProfessionalCategory[] = [
  'real_estate_agent',
  'lender',
  'contractor',
  'inspector',
  'property_manager',
];

export function parseServiceAreaState(area: string): string {
  if (area.toLowerCase() === 'nationwide') return 'Nationwide';
  const parts = area.split(',').map(s => s.trim());
  if (parts.length >= 2) return parts[parts.length - 1];
  return parts[0];
}

export const CATEGORY_ACCENT: Record<ProfessionalCategory, string> = {
  real_estate_agent: 'from-amber-500 to-orange-500',
  lender: 'from-blue-500 to-cyan-500',
  contractor: 'from-orange-500 to-red-500',
  inspector: 'from-cyan-500 to-teal-500',
  property_manager: 'from-purple-500 to-violet-500',
};

export const professionals: Professional[] = [
  {
    id: 'agent-1',
    name: 'Reeves & Kato Realty Group',
    category: 'real_estate_agent',
    description: 'Boutique brokerage specializing in off-market multifamily acquisitions across the Sun Belt',
    specialties: ['Multifamily', 'Off-market deals', '1031 exchanges'],
    rating: 4.9,
    reviewCount: 47,
    featured: true,
    accentColor: 'from-amber-500 to-orange-500',
    serviceAreas: ['Austin, TX', 'Dallas, TX', 'Phoenix, AZ'],
  },
  {
    id: 'agent-2',
    name: 'Jade Nakamura — West Coast Luxury',
    category: 'real_estate_agent',
    description: 'High-value residential specialist from Beverly Hills to the Bay Area',
    specialties: ['Luxury homes', 'West Coast markets', 'New construction'],
    rating: 4.8,
    reviewCount: 31,
    featured: false,
    accentColor: 'from-rose-500 to-pink-500',
    serviceAreas: ['Los Angeles, CA', 'San Francisco, CA'],
  },
  {
    id: 'agent-3',
    name: 'FlipStar Advisory',
    category: 'real_estate_agent',
    description: 'Data-driven fix-and-flip matchmaking with a network of 200+ vetted contractors',
    specialties: ['Fix & flip', 'Distressed properties', 'Market analysis'],
    rating: 4.7,
    reviewCount: 22,
    featured: false,
    accentColor: 'from-emerald-500 to-teal-500',
    serviceAreas: ['Atlanta, GA', 'Nashville, TN'],
  },
  {
    id: 'agent-4',
    name: 'Coastal Yield Partners',
    category: 'real_estate_agent',
    description: 'Short-term rental acquisition strategists for vacation and resort markets',
    specialties: ['STR / Airbnb', 'Vacation markets', 'Revenue optimization'],
    rating: 4.8,
    reviewCount: 38,
    featured: false,
    accentColor: 'from-violet-500 to-purple-500',
    serviceAreas: ['Miami, FL', 'Destin, FL', 'Maui, HI'],
  },
  {
    id: 'lender-1',
    name: 'Trident Capital Lending',
    category: 'lender',
    description: 'Nationwide DSCR lender — close in 14 days, no tax returns needed',
    specialties: ['DSCR loans', 'Investment properties', 'Fast closings'],
    rating: 4.8,
    reviewCount: 63,
    featured: true,
    accentColor: 'from-blue-500 to-cyan-500',
    serviceAreas: ['Nationwide'],
  },
  {
    id: 'lender-2',
    name: 'EquityPath Home Finance',
    category: 'lender',
    description: 'Conventional, FHA, and portfolio loans with investor-friendly underwriting',
    specialties: ['Conventional', 'FHA', 'Portfolio loans'],
    rating: 4.6,
    reviewCount: 19,
    featured: false,
    accentColor: 'from-sky-500 to-blue-500',
    serviceAreas: ['Nationwide'],
  },
  {
    id: 'lender-3',
    name: 'IronBridge Capital',
    category: 'lender',
    description: 'Hard money and bridge financing for time-sensitive rehab deals',
    specialties: ['Hard money', 'Bridge loans', 'Rehab financing'],
    rating: 4.5,
    reviewCount: 14,
    featured: false,
    accentColor: 'from-indigo-500 to-blue-600',
    serviceAreas: ['TX', 'FL', 'GA', 'NC'],
  },
  {
    id: 'contractor-1',
    name: 'Vanguard Build Co.',
    category: 'contractor',
    description: 'Full-scope renovation firm for value-add investors — kitchens to complete gut rehabs',
    specialties: ['Kitchen & bath', 'Full gut rehabs', 'ADU construction'],
    rating: 4.7,
    reviewCount: 52,
    featured: true,
    accentColor: 'from-orange-500 to-red-500',
    serviceAreas: ['Austin, TX', 'San Antonio, TX'],
  },
  {
    id: 'contractor-2',
    name: 'EcoFrame Construction',
    category: 'contractor',
    description: 'Energy-efficient retrofits and solar integration for rental portfolios',
    specialties: ['Energy retrofits', 'Solar install', 'Green certifications'],
    rating: 4.6,
    reviewCount: 28,
    featured: false,
    accentColor: 'from-green-500 to-emerald-500',
    serviceAreas: ['Denver, CO', 'Portland, OR'],
  },
  {
    id: 'contractor-3',
    name: 'TurnKey Rehab Crews',
    category: 'contractor',
    description: 'Fast-turnaround cosmetic flips and tenant-turnover refreshes in 7–10 days',
    specialties: ['Cosmetic rehab', 'Tenant turnover', 'Paint & flooring'],
    rating: 4.4,
    reviewCount: 17,
    featured: false,
    accentColor: 'from-yellow-500 to-amber-500',
    serviceAreas: ['Indianapolis, IN', 'Memphis, TN'],
  },
  {
    id: 'contractor-4',
    name: 'CoreStruct Engineering',
    category: 'contractor',
    description: 'Structural engineering, foundation repair, and major systems replacement',
    specialties: ['Foundation', 'Roofing', 'Structural engineering'],
    rating: 4.8,
    reviewCount: 41,
    featured: false,
    accentColor: 'from-stone-500 to-neutral-600',
    serviceAreas: ['Houston, TX', 'Oklahoma City, OK'],
  },
  {
    id: 'inspector-1',
    name: 'Aperture Property Inspections',
    category: 'inspector',
    description: 'Investor-grade inspections with thermal imaging and CapEx forecasting',
    specialties: ['Pre-purchase', 'Investor reports', 'Thermal imaging'],
    rating: 4.9,
    reviewCount: 56,
    featured: true,
    accentColor: 'from-cyan-500 to-teal-500',
    serviceAreas: ['Austin, TX', 'Dallas, TX', 'Houston, TX'],
  },
  {
    id: 'inspector-2',
    name: 'Sentinel Building Sciences',
    category: 'inspector',
    description: 'Multi-unit and commercial inspections — environmental, structural, and MEP',
    specialties: ['Multifamily', 'Commercial', 'Environmental'],
    rating: 4.7,
    reviewCount: 33,
    featured: false,
    accentColor: 'from-teal-500 to-green-500',
    serviceAreas: ['Chicago, IL', 'Detroit, MI'],
  },
  {
    id: 'pm-1',
    name: 'Hearthstone Management Group',
    category: 'property_manager',
    description: 'Full-service PM for SFH and small multifamily — 97% occupancy track record',
    specialties: ['SFH management', 'Tenant screening', 'Maintenance coordination'],
    rating: 4.7,
    reviewCount: 44,
    featured: true,
    accentColor: 'from-purple-500 to-violet-500',
    serviceAreas: ['Austin, TX', 'San Antonio, TX', 'Dallas, TX'],
  },
  {
    id: 'pm-2',
    name: 'NightOwl STR Management',
    category: 'property_manager',
    description: 'Short-term rental ops with dynamic pricing, 24/7 guest support, and cleaning crews',
    specialties: ['STR management', 'Dynamic pricing', 'Guest experience'],
    rating: 4.6,
    reviewCount: 26,
    featured: false,
    accentColor: 'from-fuchsia-500 to-pink-500',
    serviceAreas: ['Nashville, TN', 'Gatlinburg, TN'],
  },
  {
    id: 'pm-3',
    name: 'Nexus Portfolio Services',
    category: 'property_manager',
    description: 'AI-assisted large-portfolio management — automated reporting, vendor dispatch',
    specialties: ['Portfolio scale', 'Automated reporting', 'Vendor management'],
    rating: 4.5,
    reviewCount: 12,
    featured: false,
    accentColor: 'from-slate-500 to-zinc-500',
    serviceAreas: ['Nationwide'],
  },
];
