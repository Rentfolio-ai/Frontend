/**
 * IntelligencePane - Right-side detail pane for property analysis
 * 
 * Displays detailed property information without navigation:
 * - Empty state with tips
 * - Property details in tabs (Overview, Financials, AI Insights, 3D View)
 * - Comparison matrix when comparing multiple properties
 * - Pin mode to lock property while browsing
 */

import React, { useState } from 'react';
import { cn } from '../../lib/utils';
import { 
  Building2, 
  TrendingUp, 
  Sparkles, 
  Pin, 
  PinOff, 
  GitCompare,
  Home,
  DollarSign,
  MapPin,
  Calendar,
  Maximize2
} from 'lucide-react';
import type { ScoutedProperty } from '../../types/backendTools';
import type { InvestmentStrategy } from '../../types/pnl';
import { HolographicPropertyView } from '../property/HolographicPropertyView';

interface IntelligencePaneProps {
  selectedProperty: ScoutedProperty | null;
  comparisonProperties?: ScoutedProperty[];
  view: 'details' | 'comparison';
  isPinned: boolean;
  onTogglePin: () => void;
  onAddToComparison: (property: ScoutedProperty) => void;
  onOpenDealAnalyzer?: (propertyId: string | null, strategy: InvestmentStrategy, purchasePrice?: number, propertyAddress?: string) => void;
}

type TabType = 'overview' | 'financials' | 'ai-insights' | '3d-view';

export const IntelligencePane: React.FC<IntelligencePaneProps> = ({
  selectedProperty,
  comparisonProperties = [],
  view,
  isPinned,
  onTogglePin,
  onAddToComparison,
  onOpenDealAnalyzer,
}) => {
  // ALL HOOKS MUST BE AT THE TOP - React Rules of Hooks
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // Keyboard shortcut handler - MUST be before any returns
  React.useEffect(() => {
    // Only add listener if we have a selected property
    if (!selectedProperty) return;
    
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      switch (e.key) {
        case '1':
          setActiveTab('overview');
          break;
        case '2':
          setActiveTab('financials');
          break;
        case '3':
          setActiveTab('ai-insights');
          break;
        case '4':
          setActiveTab('3d-view');
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectedProperty]);

  // NOW conditional renders can happen
  // Empty state
  if (!selectedProperty && view === 'details') {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-teal-500/20 to-purple-500/20 border border-teal-500/30 flex items-center justify-center">
            <Building2 className="w-10 h-10 text-teal-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-3">
            Property Intelligence
          </h3>
          <p className="text-white/60 text-sm mb-6">
            Select a property from the results to view detailed analysis, AI insights, and 3D visualizations
          </p>
          
          {/* Quick Tips */}
          <div className="space-y-2 text-left">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="w-6 h-6 rounded-full bg-teal-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-teal-400 text-xs font-bold">1</span>
              </div>
              <p className="text-white/70 text-sm">
                <span className="font-semibold text-white">Click</span> a property card to view details
              </p>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-purple-400 text-xs font-bold">2</span>
              </div>
              <p className="text-white/70 text-sm">
                <span className="font-semibold text-white">Drag</span> properties to the comparison dock
              </p>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="w-6 h-6 rounded-full bg-teal-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-teal-400 text-xs font-bold">3</span>
              </div>
              <p className="text-white/70 text-sm">
                <span className="font-semibold text-white">Right-click</span> for quick actions
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Comparison view
  if (view === 'comparison' && comparisonProperties.length >= 2) {
    return (
      <div className="h-full overflow-y-auto">
        <ComparisonMatrix properties={comparisonProperties} />
      </div>
    );
  }

  if (!selectedProperty) return null;

  const tabs: Array<{ id: TabType; label: string; icon: React.ReactNode; shortcut: string }> = [
    { id: 'overview', label: 'Overview', icon: <Home className="w-4 h-4" />, shortcut: '1' },
    { id: 'financials', label: 'Financials', icon: <TrendingUp className="w-4 h-4" />, shortcut: '2' },
    { id: 'ai-insights', label: 'AI Insights', icon: <Sparkles className="w-4 h-4" />, shortcut: '3' },
    { id: '3d-view', label: '3D View', icon: <Maximize2 className="w-4 h-4" />, shortcut: '4' },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Sticky Header */}
      <div className="flex-shrink-0 sticky top-0 z-10 bg-slate-900/95 backdrop-blur-xl border-b border-white/10">
        {/* Property Preview */}
        <div className="p-4">
          <div className="flex items-start gap-4">
            {/* Property Image */}
            <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-slate-800">
              <img
                src={selectedProperty.photos?.[0] || 'https://images.rentcast.io/s3/photo-placeholder.jpg'}
                alt={selectedProperty.address}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Property Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="text-lg font-bold text-white truncate">
                  ${selectedProperty.price?.toLocaleString()}
                </h3>
                <div className="flex items-center gap-1">
                  <button
                    onClick={onTogglePin}
                    className={cn(
                      'p-2 rounded-lg transition-all',
                      isPinned
                        ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                        : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/10'
                    )}
                    title={isPinned ? 'Unpin property' : 'Pin property'}
                  >
                    {isPinned ? <Pin className="w-4 h-4" /> : <PinOff className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => onAddToComparison(selectedProperty)}
                    className="p-2 rounded-lg bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/10 transition-all"
                    title="Add to comparison dock"
                  >
                    <GitCompare className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-sm text-white/70 mb-2 line-clamp-2">
                {selectedProperty.address}
              </p>

              <div className="flex items-center gap-4 text-xs text-white/60">
                <span className="flex items-center gap-1">
                  <Building2 className="w-3 h-3" />
                  {selectedProperty.bedrooms} bd
                </span>
                <span className="flex items-center gap-1">
                  <Home className="w-3 h-3" />
                  {selectedProperty.bathrooms} ba
                </span>
                <span className="flex items-center gap-1">
                  <Maximize2 className="w-3 h-3" />
                  {selectedProperty.sqft?.toLocaleString()} sqft
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="px-4 flex items-center gap-1 relative">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'relative px-4 py-3 text-sm font-medium transition-all flex items-center gap-2',
                activeTab === tab.id
                  ? 'text-white'
                  : 'text-white/60 hover:text-white/80'
              )}
            >
              {tab.icon}
              {tab.label}
              <span className="text-[10px] opacity-50">{tab.shortcut}</span>
              
              {/* Holographic Active Indicator */}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-teal-400 to-purple-500 shadow-lg shadow-teal-500/50" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          {activeTab === 'overview' && <OverviewTab property={selectedProperty} onOpenDealAnalyzer={onOpenDealAnalyzer} />}
          {activeTab === 'financials' && <FinancialsTab property={selectedProperty} />}
          {activeTab === 'ai-insights' && <AIInsightsTab property={selectedProperty} />}
          {activeTab === '3d-view' && <ThreeDViewTab property={selectedProperty} />}
        </div>
      </div>
    </div>
  );
};

// Tab Components
const OverviewTab: React.FC<{ property: ScoutedProperty; onOpenDealAnalyzer?: any }> = ({ property, onOpenDealAnalyzer }) => (
  <div className="space-y-6">
    <InfoSection title="Property Details" icon={<Building2 className="w-5 h-5" />}>
      <InfoRow label="Address" value={property.address} icon={<MapPin className="w-4 h-4" />} />
      <InfoRow label="Property Type" value={property.property_type || 'Single Family'} icon={<Home className="w-4 h-4" />} />
      <InfoRow label="Year Built" value={property.year_built?.toString() || 'N/A'} icon={<Calendar className="w-4 h-4" />} />
      <InfoRow label="Square Feet" value={property.sqft?.toLocaleString() || 'N/A'} icon={<Maximize2 className="w-4 h-4" />} />
      <InfoRow label="Lot Size" value={property.lot_sqft ? `${property.lot_sqft.toLocaleString()} sqft` : 'N/A'} />
    </InfoSection>

    {onOpenDealAnalyzer && (
      <button
        onClick={() => onOpenDealAnalyzer(property.listing_id, 'STR', property.price, property.address)}
        className="w-full py-3 px-4 bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-600 hover:to-purple-700 text-white font-semibold rounded-lg transition-all shadow-lg shadow-teal-500/20"
      >
        Open Deal Analyzer
      </button>
    )}
  </div>
);

const FinancialsTab: React.FC<{ property: ScoutedProperty }> = ({ property }) => (
  <div className="space-y-6">
    <InfoSection title="Financial Snapshot" icon={<DollarSign className="w-5 h-5" />}>
      <InfoRow label="List Price" value={`$${property.price?.toLocaleString()}`} highlight />
      <InfoRow label="Price per sqft" value={property.sqft ? `$${Math.round(property.price / property.sqft)}` : 'N/A'} />
      {property.financial_snapshot && (
        <>
          <InfoRow
            label="Monthly Revenue (STR)"
            value={property.financial_snapshot.str_monthly_revenue ? `$${property.financial_snapshot.str_monthly_revenue.toLocaleString()}` : 'N/A'}
          />
          <InfoRow
            label="Monthly Revenue (LTR)"
            value={property.financial_snapshot.ltr_monthly_revenue ? `$${property.financial_snapshot.ltr_monthly_revenue.toLocaleString()}` : 'N/A'}
          />
          <InfoRow
            label="Cap Rate"
            value={property.financial_snapshot.cap_rate ? `${property.financial_snapshot.cap_rate.toFixed(2)}%` : 'N/A'}
          />
        </>
      )}
    </InfoSection>
  </div>
);

const AIInsightsTab: React.FC<{ property: ScoutedProperty }> = ({ property }) => (
  <div className="space-y-6">
    <InfoSection title="AI Analysis" icon={<Sparkles className="w-5 h-5" />}>
      <div className="space-y-4">
        {property.financial_snapshot?.status && (
          <div className={cn(
            'p-4 rounded-lg border',
            property.financial_snapshot.status === 'positive'
              ? 'bg-teal-500/10 border-teal-500/30 text-teal-400'
              : 'bg-red-500/10 border-red-500/30 text-red-400'
          )}>
            <p className="text-sm font-medium">
              {property.financial_snapshot.status === 'positive'
                ? '✓ This property shows positive cash flow potential'
                : '⚠ This property may have cash flow challenges'
              }
            </p>
          </div>
        )}
        
        <p className="text-white/70 text-sm">
          AI-powered insights for this property are being generated. For detailed analysis including cash flow projections, ROI calculations, and risk assessment, use the Deal Analyzer.
        </p>
      </div>
    </InfoSection>
  </div>
);

const ThreeDViewTab: React.FC<{ property: ScoutedProperty }> = ({ property }) => (
  <div className="space-y-6">
    <div className="rounded-xl overflow-hidden bg-slate-950/50 border border-teal-500/20">
      <HolographicPropertyView
        property={{
          bedrooms: property.bedrooms || 0,
          bathrooms: property.bathrooms || 0,
          sqft: property.sqft || 0,
          price: property.price,
          address: property.address,
          amenities: property.amenities || [],
          yearBuilt: property.year_built,
          lotSize: property.lot_sqft,
        }}
        variant="full"
      />
    </div>
  </div>
);

// Helper Components
const InfoSection: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
  <div className="space-y-4">
    <div className="flex items-center gap-2 text-white font-semibold">
      <div className="text-teal-400">{icon}</div>
      {title}
    </div>
    <div className="space-y-3 pl-7">
      {children}
    </div>
  </div>
);

const InfoRow: React.FC<{ label: string; value: string; icon?: React.ReactNode; highlight?: boolean }> = ({ label, value, icon, highlight }) => (
  <div className="flex items-center justify-between py-2 border-b border-white/5">
    <span className="text-sm text-white/60 flex items-center gap-2">
      {icon && <span className="text-white/40">{icon}</span>}
      {label}
    </span>
    <span className={cn(
      'text-sm font-medium',
      highlight ? 'text-teal-400' : 'text-white/90'
    )}>
      {value}
    </span>
  </div>
);

// Comparison Matrix Component
const ComparisonMatrix: React.FC<{ properties: ScoutedProperty[] }> = ({ properties }) => (
  <div className="p-6">
    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
      <GitCompare className="w-6 h-6 text-teal-400" />
      Property Comparison
    </h2>
    
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/10">
            <th className="text-left py-3 px-4 text-sm font-semibold text-white/60">Metric</th>
            {properties.map((prop, idx) => (
              <th key={idx} className="text-left py-3 px-4">
                <div className="text-sm font-semibold text-white truncate max-w-[200px]">
                  ${prop.price?.toLocaleString()}
                </div>
                <div className="text-xs text-white/60 truncate max-w-[200px]">
                  {prop.address}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <ComparisonRow label="Bedrooms" values={properties.map(p => p.bedrooms?.toString() || 'N/A')} />
          <ComparisonRow label="Bathrooms" values={properties.map(p => p.bathrooms?.toString() || 'N/A')} />
          <ComparisonRow label="Square Feet" values={properties.map(p => p.sqft?.toLocaleString() || 'N/A')} />
          <ComparisonRow label="Price/sqft" values={properties.map(p => p.sqft ? `$${Math.round(p.price / p.sqft)}` : 'N/A')} />
          <ComparisonRow label="Year Built" values={properties.map(p => p.year_built?.toString() || 'N/A')} />
        </tbody>
      </table>
    </div>
  </div>
);

const ComparisonRow: React.FC<{ label: string; values: string[] }> = ({ label, values }) => (
  <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
    <td className="py-3 px-4 text-sm text-white/60">{label}</td>
    {values.map((value, idx) => (
      <td key={idx} className="py-3 px-4 text-sm text-white font-medium">{value}</td>
    ))}
  </tr>
);

