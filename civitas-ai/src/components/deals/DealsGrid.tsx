import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Star, Sparkles, X, Building2, MapPin } from 'lucide-react';
import type { ScoutedProperty } from '../../types/backendTools';
import type { DealStatus } from '../../types/bookmarks';
import { getSchoolRatings, getFloodZone, getCrimeStats } from '../../services/agentsApi';
import type { SchoolRating, FloodZoneData, CrimeStatsData } from '../../services/agentsApi';

interface DealsGridProps {
  properties: ScoutedProperty[];
  loading?: boolean;
  onViewProperty: (property: ScoutedProperty) => void;
  onAnalyzeProperty: (property: ScoutedProperty) => void;
  onBookmarkProperty: (property: ScoutedProperty) => void;
  onPropertyHover?: (id: string | null) => void;
  bookmarkedIds: Set<string>;
  dealStatuses?: Map<string, DealStatus>;
  onStatusChange?: (property: ScoutedProperty, bookmarkId: string, status: DealStatus) => void;
  bookmarkIdMap?: Map<string, string>;
}

function formatPrice(price: number): string {
  if (price >= 1000000) return `$${(price / 1000000).toFixed(1)}M`;
  return `$${(price / 1000).toFixed(0)}K`;
}

export const DealsGrid: React.FC<DealsGridProps> = ({
  properties, loading, onViewProperty, onAnalyzeProperty, onBookmarkProperty, onPropertyHover, bookmarkedIds,
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
          .catch(() => { }),
        getFloodZone(lat, lng)
          .then(r => { if (r.status === 'ok' && r.data) setFloodData(r.data); })
          .catch(() => { }),
      );
    }

    if (city && state) {
      promises.push(
        getCrimeStats(city, state)
          .then(r => { if (r.status === 'ok' && r.data) setCrimeData(r.data); })
          .catch(() => { }),
      );
    }

    Promise.allSettled(promises).finally(() => setEnrichLoading(false));
  }, [selectedProperty?.listing_id]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-12">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="rounded-xl bg-background border border-black/[0.04] aspect-[4/3] animate-pulse" />
        ))}
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="w-12 h-12 rounded-xl bg-black/[0.02] border border-black/[0.06] flex items-center justify-center mb-3">
          <Star className="w-5 h-5 text-muted-foreground/40" />
        </div>
        <div className="text-[13px] font-medium text-muted-foreground/60">No properties found</div>
        <div className="text-[11px] text-muted-foreground/40 mt-1">Try adjusting your search or filters</div>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-12">
        {properties.map((property) => {
          const isBookmarked = bookmarkedIds.has(property.listing_id);

          return (
            <div
              key={property.listing_id}
              onClick={() => setSelectedProperty(property)}
              onMouseEnter={() => onPropertyHover?.(property.listing_id)}
              onMouseLeave={() => onPropertyHover?.(null)}
              className="group relative rounded-xl bg-background border border-black/[0.05] cursor-pointer hover:border-[#C08B5C]/25 transition-all duration-300 overflow-hidden"
            >
              {/* Photo */}
              <div
                className="relative aspect-[16/10] bg-background overflow-hidden"
                onClick={(e) => { e.stopPropagation(); onViewProperty(property); }}
              >
                <img
                  src={property.photos?.[0] || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80'}
                  alt={property.address}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Bookmark heart */}
                <button
                  onClick={(e) => { e.stopPropagation(); onBookmarkProperty(property); }}
                  className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-black/40 backdrop-blur-sm border border-black/8 hover:bg-black/60 transition-colors z-10"
                >
                  {isBookmarked ? (
                    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-[#C08B5C] stroke-[#C08B5C]"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
                  ) : (
                    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-transparent stroke-foreground/80 stroke-[2.5px]"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
                  )}
                </button>

                {/* Property type pill */}
                <span className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/50 backdrop-blur-sm text-[9px] font-semibold text-foreground/80 uppercase tracking-wide">
                  {property.property_type?.replace('_', ' ') || 'Property'}
                </span>
              </div>

              {/* Content */}
              <div className="p-4">
                {/* Price */}
                <div className="text-[20px] font-semibold text-foreground tabular-nums mb-1">
                  {formatPrice(property.price)}
                </div>

                {/* Address */}
                <p className="text-[13px] text-muted-foreground/70 truncate mb-0.5">
                  {property.address}
                </p>
                <p className="text-[11px] text-muted-foreground/50 flex items-center gap-1 mb-3">
                  <MapPin className="w-3 h-3" />
                  {property.city}, {property.state} {property.zip_code}
                </p>

                {/* Specs row */}
                <div className="flex items-center gap-3 text-[12px] text-muted-foreground mb-4">
                  <span className="font-medium text-foreground/70">{property.bedrooms}</span>
                  <span className="text-muted-foreground/40">Beds</span>
                  <span className="text-muted-foreground/40">•</span>
                  <span className="font-medium text-foreground/70">{property.bathrooms}</span>
                  <span className="text-muted-foreground/40">Baths</span>
                  <span className="text-muted-foreground/40">•</span>
                  <span className="font-medium text-foreground/70">{property.sqft ? property.sqft.toLocaleString() : '—'}</span>
                  <span className="text-muted-foreground/40">Sqft</span>
                </div>

                {/* Analyze button */}
                <button
                  onClick={(e) => { e.stopPropagation(); onAnalyzeProperty(property); }}
                  className="w-full py-2 rounded-lg bg-[#C08B5C]/[0.08] border border-[#C08B5C]/20 text-[#C08B5C] text-[12px] font-semibold hover:bg-[#C08B5C]/[0.15] hover:border-[#C08B5C]/30 transition-all flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3 h-3" /> Analyze ✨
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Enrichment sidebar — preserved */}
      <AnimatePresence>
        {selectedProperty && (
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            className="fixed top-0 right-0 w-80 h-full bg-background border-l border-black/[0.06] z-40 overflow-y-auto"
          >
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-[14px] font-semibold text-foreground/80 truncate flex-1 mr-2">{selectedProperty.address}</h3>
                <button onClick={() => setSelectedProperty(null)} className="p-1.5 rounded-lg hover:bg-black/[0.05] text-muted-foreground/50">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Price + location */}
              <div>
                <div className="text-[22px] font-semibold text-foreground tabular-nums">{formatPrice(selectedProperty.price)}</div>
                <div className="text-[12px] text-muted-foreground/60 mt-0.5">{selectedProperty.city}, {selectedProperty.state}</div>
              </div>

              {/* Tabs */}
              <div className="flex gap-1 border-b border-black/[0.06] pb-1">
                {(['overview', 'neighborhood', 'risk'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setSidebarTab(tab)}
                    className={`px-2.5 py-1 rounded text-[10px] font-medium transition-colors ${sidebarTab === tab ? 'bg-black/[0.05] text-foreground/70' : 'text-muted-foreground/50 hover:text-muted-foreground'
                      }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              {sidebarTab === 'overview' && (
                <div className="space-y-3">
                  <SidebarRow icon={<Building2 className="w-3 h-3" />} label="Price" value={formatPrice(selectedProperty.price)} />
                  <SidebarRow icon={<Building2 className="w-3 h-3" />} label="Beds / Baths" value={`${selectedProperty.bedrooms}bd / ${selectedProperty.bathrooms}ba`} />
                  <SidebarRow icon={<Building2 className="w-3 h-3" />} label="Sqft" value={selectedProperty.sqft ? selectedProperty.sqft.toLocaleString() : '—'} />
                  <SidebarRow icon={<Building2 className="w-3 h-3" />} label="Type" value={selectedProperty.property_type?.replace('_', ' ') || 'Property'} />
                </div>
              )}

              {sidebarTab === 'neighborhood' && (
                <div className="space-y-2">
                  <SidebarRow icon={<MapPin className="w-3 h-3" />} label="City" value={`${selectedProperty.city}, ${selectedProperty.state}`} />
                  {enrichLoading ? (
                    <div className="animate-pulse space-y-2 mt-2">
                      <div className="h-4 rounded bg-black/[0.03]" />
                      <div className="h-4 rounded bg-black/[0.03]" />
                    </div>
                  ) : (
                    <>
                      {schools && schools.length > 0 ? (
                        <>
                          <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40 mt-3 mb-1">Nearby Schools</div>
                          {schools.slice(0, 3).map((s, i) => (
                            <SidebarRow
                              key={i}
                              icon={<Building2 className="w-3 h-3" />}
                              label={s.name.length > 20 ? s.name.slice(0, 20) + '…' : s.name}
                              value={s.rating ? `${s.rating}/10` : '—'}
                            />
                          ))}
                        </>
                      ) : (
                        <p className="text-[10px] text-muted-foreground/40 mt-2">School data not available.</p>
                      )}
                    </>
                  )}
                </div>
              )}

              {sidebarTab === 'risk' && (
                <div className="space-y-2">
                  {enrichLoading ? (
                    <div className="animate-pulse space-y-2">
                      <div className="h-4 rounded bg-black/[0.03]" />
                      <div className="h-4 rounded bg-black/[0.03]" />
                    </div>
                  ) : (
                    <>
                      <SidebarRow
                        icon={<Building2 className="w-3 h-3" />}
                        label="Flood Zone"
                        value={floodData?.flood_zone || 'Not available'}
                      />
                      {floodData?.risk_level && (
                        <SidebarRow icon={<Building2 className="w-3 h-3" />} label="Flood Risk" value={floodData.risk_level} />
                      )}
                      <SidebarRow
                        icon={<Building2 className="w-3 h-3" />}
                        label="Crime Level"
                        value={crimeData?.crime_rate || 'Not available'}
                      />
                      {crimeData?.safety_score != null && (
                        <SidebarRow icon={<Building2 className="w-3 h-3" />} label="Safety Score" value={`${crimeData.safety_score}/100`} />
                      )}
                    </>
                  )}
                </div>
              )}

              <button
                onClick={() => { onAnalyzeProperty(selectedProperty); setSelectedProperty(null); }}
                className="w-full mt-4 py-2.5 rounded-lg text-[12px] font-semibold bg-[#C08B5C]/[0.1] hover:bg-[#C08B5C]/[0.18] text-[#D4A27F] border border-[#C08B5C]/15 flex items-center justify-center gap-1.5 transition-colors"
              >
                <Sparkles className="w-3 h-3" /> Analyze ✨
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const SidebarRow: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
  <div className="flex items-center justify-between py-1.5 border-b border-black/[0.05]">
    <div className="flex items-center gap-2 text-muted-foreground/50">
      {icon}
      <span className="text-[10px]">{label}</span>
    </div>
    <span className="text-[11px] font-medium text-muted-foreground">{value}</span>
  </div>
);
