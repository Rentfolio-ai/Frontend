import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bookmark, Star, CircleDot, Sparkles, X, Building2, AlertTriangle, TrendingUp, MapPin, GraduationCap, Footprints } from 'lucide-react';
import type { ScoutedProperty } from '../../types/backendTools';
import type { DealStatus } from '../../types/bookmarks';
import { getSchoolRatings, getFloodZone, getCrimeStats } from '../../services/agentsApi';
import type { SchoolRating, FloodZoneData, CrimeStatsData } from '../../services/agentsApi';

interface DealsGridProps {
  properties: ScoutedProperty[];
  onViewProperty: (property: ScoutedProperty) => void;
  onAnalyzeProperty: (property: ScoutedProperty) => void;
  onBookmarkProperty: (property: ScoutedProperty) => void;
  bookmarkedIds: Set<string>;
  dealStatuses?: Map<string, DealStatus>;
  onStatusChange?: (property: ScoutedProperty, bookmarkId: string, status: DealStatus) => void;
  bookmarkIdMap?: Map<string, string>;
}

const STATUS_BADGE: Record<DealStatus, { label: string; className: string }> = {
  active: { label: 'Active', className: 'text-emerald-400 bg-emerald-500/[0.08] border-emerald-500/10' },
  under_contract: { label: 'Contract', className: 'text-amber-400 bg-amber-500/[0.08] border-amber-500/10' },
  closed: { label: 'Closed', className: 'text-blue-400 bg-blue-500/[0.08] border-blue-500/10' },
  lost: { label: 'Lost', className: 'text-red-400 bg-red-500/[0.08] border-red-500/10' },
};

function formatPrice(price: number): string {
  if (price >= 1000000) return `$${(price / 1000000).toFixed(1)}M`;
  return `$${(price / 1000).toFixed(0)}K`;
}

function getCapRate(p: ScoutedProperty): number {
  if (p.cash_on_cash_roi) return p.cash_on_cash_roi;
  if (p.financial_snapshot?.estimated_rent && p.price) {
    return ((p.financial_snapshot.estimated_rent * 12) / p.price) * 100;
  }
  return 0;
}

function getCashFlow(p: ScoutedProperty): number {
  return p.financial_snapshot?.estimated_monthly_cash_flow || 0;
}

function scoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-400 bg-emerald-500/[0.08]';
  if (score >= 60) return 'text-amber-400 bg-amber-500/[0.08]';
  return 'text-red-400 bg-red-500/[0.08]';
}

export const DealsGrid: React.FC<DealsGridProps> = ({
  properties, onViewProperty, onAnalyzeProperty, onBookmarkProperty, bookmarkedIds,
  dealStatuses, onStatusChange, bookmarkIdMap,
}) => {
  const [selectedProperty, setSelectedProperty] = useState<ScoutedProperty | null>(null);
  const [sidebarTab, setSidebarTab] = useState<'overview' | 'neighborhood' | 'risk'>('overview');

  const [enrichLoading, setEnrichLoading] = useState(false);
  const [schools, setSchools] = useState<SchoolRating[] | null>(null);
  const [floodData, setFloodData] = useState<FloodZoneData | null>(null);
  const [crimeData, setCrimeData] = useState<CrimeStatsData | null>(null);

  useEffect(() => {
    if (!selectedProperty) {
      setSchools(null);
      setFloodData(null);
      setCrimeData(null);
      return;
    }

    setEnrichLoading(true);
    const city = selectedProperty.city;
    const state = selectedProperty.state;
    const lat = (selectedProperty as any).latitude;
    const lng = (selectedProperty as any).longitude;

    const promises: Promise<void>[] = [];

    if (lat && lng) {
      promises.push(
        getSchoolRatings(lat, lng)
          .then(r => { if (r.status === 'ok' && r.data) setSchools(r.data); })
          .catch(() => {}),
        getFloodZone(lat, lng)
          .then(r => { if (r.status === 'ok' && r.data) setFloodData(r.data); })
          .catch(() => {}),
      );
    }

    if (city && state) {
      promises.push(
        getCrimeStats(city, state)
          .then(r => { if (r.status === 'ok' && r.data) setCrimeData(r.data); })
          .catch(() => {}),
      );
    }

    Promise.allSettled(promises).finally(() => setEnrichLoading(false));
  }, [selectedProperty?.listing_id]);

  if (properties.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-10 h-10 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-2.5">
          <Star className="w-4 h-4 text-white/15" />
        </div>
        <div className="text-[12px] font-medium text-white/35">No properties found</div>
        <div className="text-[10px] text-white/20 mt-0.5">Try adjusting your search or filters</div>
      </div>
    );
  }

  return (
    <>
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2.5">
      {properties.map((property) => {
        const isBookmarked = bookmarkedIds.has(property.listing_id);
        const score = property.value_score || 0;
        const status: DealStatus | undefined = dealStatuses?.get(property.listing_id);
        const bmId = bookmarkIdMap?.get(property.listing_id);

        return (
          <div
            key={property.listing_id}
            onClick={() => setSelectedProperty(property)}
            className="rounded-lg bg-white/[0.03] border border-white/[0.05] cursor-pointer hover:bg-white/[0.04] px-3.5 py-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="text-[12px] font-medium text-white/80 truncate">{property.address}</div>
                <div className="text-[10px] text-white/25 font-medium">{property.city}, {property.state} {property.zip_code}</div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {status && bmId && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onStatusChange && bmId) {
                        const nextStatus: DealStatus =
                          status === 'active' ? 'under_contract'
                          : status === 'under_contract' ? 'closed'
                          : status;
                        if (nextStatus !== status) onStatusChange(property, bmId, nextStatus);
                      }
                    }}
                    className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded border text-[8px] font-bold hover:brightness-125 ${STATUS_BADGE[status].className}`}
                    title={status === 'closed' || status === 'lost' ? STATUS_BADGE[status].label : 'Click to advance status'}
                  >
                    <CircleDot className="w-2 h-2" />
                    {STATUS_BADGE[status].label}
                  </button>
                )}
                {score > 0 && (
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${scoreColor(score)}`}>
                    {score}
                  </span>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); onBookmarkProperty(property); }}
                  className="p-1 rounded hover:bg-white/[0.06]"
                >
                  {isBookmarked ? (
                    <Star className="w-3 h-3 text-[#C08B5C] fill-[#C08B5C]" />
                  ) : (
                    <Bookmark className="w-3 h-3 text-white/25" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-2">
              <span className="text-[14px] font-bold text-white/90 font-mono tracking-tight">{formatPrice(property.price)}</span>
              <span className="text-[10px] font-mono text-white/35">
                Cap {getCapRate(property).toFixed(1)}%
              </span>
              <span className="text-[10px] font-mono text-white/35">
                ${getCashFlow(property).toLocaleString()}/mo
              </span>
              {property.bedrooms && (
                <span className="text-[10px] text-white/20 font-medium ml-auto">
                  {property.bedrooms}bd/{property.bathrooms}ba
                </span>
              )}
            </div>

            <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/[0.04]">
              <button
                onClick={(e) => { e.stopPropagation(); onAnalyzeProperty(property); }}
                className="flex items-center gap-1 text-[10px] font-semibold text-[#C08B5C] hover:text-[#D4A27F] px-2 py-0.5 rounded border border-transparent hover:border-[#C08B5C]/20"
                title="Run through Hunter AI deal pipeline"
              >
                <Sparkles className="w-3 h-3" />
                Analyze with AI
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onViewProperty(property); }}
                className="text-[10px] font-medium text-white/25 hover:text-white/55"
              >
                Details
              </button>
            </div>
          </div>
        );
      })}
    </div>

    {/* Enrichment sidebar */}
    <AnimatePresence>
      {selectedProperty && (
        <motion.div
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 250 }}
          className="fixed top-0 right-0 w-80 h-full bg-[#0a0a0b] border-l border-white/[0.06] z-40 overflow-y-auto"
        >
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[13px] font-semibold text-white/70 truncate flex-1 mr-2">{selectedProperty.address}</h3>
              <button onClick={() => setSelectedProperty(null)} className="p-1 rounded hover:bg-white/[0.06] text-white/30">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 border-b border-white/[0.06] pb-1">
              {(['overview', 'neighborhood', 'risk'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSidebarTab(tab)}
                  className={`px-2.5 py-1 rounded text-[10px] font-medium transition-colors ${
                    sidebarTab === tab ? 'bg-white/[0.06] text-white/70' : 'text-white/30 hover:text-white/50'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {sidebarTab === 'overview' && (
              <div className="space-y-3">
                <SidebarRow icon={<Building2 className="w-3 h-3" />} label="Price" value={formatPrice(selectedProperty.price)} />
                <SidebarRow icon={<TrendingUp className="w-3 h-3" />} label="Cap Rate" value={`${getCapRate(selectedProperty).toFixed(1)}%`} />
                <SidebarRow icon={<TrendingUp className="w-3 h-3" />} label="Cash Flow" value={`$${getCashFlow(selectedProperty).toLocaleString()}/mo`} />
                {selectedProperty.bedrooms && (
                  <SidebarRow icon={<Building2 className="w-3 h-3" />} label="Layout" value={`${selectedProperty.bedrooms}bd / ${selectedProperty.bathrooms}ba`} />
                )}
              </div>
            )}

            {sidebarTab === 'neighborhood' && (
              <div className="space-y-2">
                <SidebarRow icon={<MapPin className="w-3 h-3" />} label="City" value={`${selectedProperty.city}, ${selectedProperty.state}`} />
                {enrichLoading ? (
                  <div className="animate-pulse space-y-2 mt-2">
                    <div className="h-4 rounded bg-white/[0.04]" />
                    <div className="h-4 rounded bg-white/[0.04]" />
                  </div>
                ) : (
                  <>
                    {schools && schools.length > 0 ? (
                      <>
                        <div className="text-[9px] font-bold uppercase tracking-widest text-white/20 mt-3 mb-1">Nearby Schools</div>
                        {schools.slice(0, 3).map((s, i) => (
                          <SidebarRow
                            key={i}
                            icon={<GraduationCap className="w-3 h-3" />}
                            label={s.name.length > 20 ? s.name.slice(0, 20) + '…' : s.name}
                            value={s.rating ? `${s.rating}/10` : '—'}
                          />
                        ))}
                      </>
                    ) : (
                      <p className="text-[10px] text-white/20 mt-2">School data not available for this location.</p>
                    )}
                  </>
                )}
              </div>
            )}

            {sidebarTab === 'risk' && (
              <div className="space-y-2">
                {enrichLoading ? (
                  <div className="animate-pulse space-y-2">
                    <div className="h-4 rounded bg-white/[0.04]" />
                    <div className="h-4 rounded bg-white/[0.04]" />
                  </div>
                ) : (
                  <>
                    <SidebarRow
                      icon={<AlertTriangle className="w-3 h-3" />}
                      label="Flood Zone"
                      value={floodData?.flood_zone || 'Not available'}
                    />
                    {floodData?.risk_level && (
                      <SidebarRow icon={<AlertTriangle className="w-3 h-3" />} label="Flood Risk" value={floodData.risk_level} />
                    )}
                    <SidebarRow
                      icon={<Footprints className="w-3 h-3" />}
                      label="Crime Level"
                      value={crimeData?.crime_rate || 'Not available'}
                    />
                    {crimeData?.safety_score != null && (
                      <SidebarRow icon={<Footprints className="w-3 h-3" />} label="Safety Score" value={`${crimeData.safety_score}/100`} />
                    )}
                  </>
                )}
              </div>
            )}

            <button
              onClick={() => { onAnalyzeProperty(selectedProperty); setSelectedProperty(null); }}
              className="w-full mt-4 py-2 rounded-lg text-[11px] font-semibold bg-[#C08B5C]/12 hover:bg-[#C08B5C]/20 text-[#D4A27F] border border-[#C08B5C]/15 flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3 h-3" /> Deep Analyze
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
};

const SidebarRow: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
  <div className="flex items-center justify-between py-1.5 border-b border-white/[0.03]">
    <div className="flex items-center gap-2 text-white/30">
      {icon}
      <span className="text-[10px]">{label}</span>
    </div>
    <span className="text-[11px] font-medium text-white/60">{value}</span>
  </div>
);
