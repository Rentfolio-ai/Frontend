import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, X, ChevronDown, Sparkles, ArrowLeft, Clock } from 'lucide-react';
// import { DealsTable } from './DealsTable'; // view mode removed in redesign
import { DealsGrid } from './DealsGrid';
import { DealsKanban } from './DealsKanban';
import { DealCloseModal, type DealCloseDetails } from './DealCloseModal';
import type { ScoutedProperty } from '../../types/backendTools';
import type { BookmarkedProperty, DealStatus } from '../../types/bookmarks';
import { searchProperties, getBookmarks, getPortfolios, getPortfolioSummary, updateBookmarkStatus } from '../../services/agentsApi';
import type { PropertySearchParams, Portfolio, BookmarkData } from '../../services/agentsApi';
import { useAuth } from '../../contexts/AuthContext';
import { useSubscription } from '../../hooks/useSubscription';
import { usePreferencesStore } from '../../stores/preferencesStore';
type DealTab = 'all' | 'saved' | 'portfolio' | 'recent';
type ViewMode = 'table' | 'grid';
type DealStatusFilter = 'all' | 'active' | 'under_contract' | 'closed' | 'lost';

const TABS: { key: DealTab; label: string }[] = [
  { key: 'all', label: 'All Properties' },
  { key: 'saved', label: 'Saved' },
  { key: 'portfolio', label: 'Portfolio' },
  { key: 'recent', label: 'Recently Viewed' },
];

const STATUS_FILTERS: { key: DealStatusFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'under_contract', label: 'Under Contract' },
  { key: 'closed', label: 'Closed' },
  { key: 'lost', label: 'Lost' },
];

interface ActiveFilter {
  key: string;
  label: string;
}

interface DealsPageProps {
  bookmarks: BookmarkedProperty[];
  onViewProperty: (property: ScoutedProperty) => void;
  onAnalyzeProperty: (property: ScoutedProperty) => void;
  onBookmarkProperty: (property: ScoutedProperty) => void;
  onBack?: () => void;
}

const ITEMS_PER_PAGE = 20;

interface CloseModalState {
  property: ScoutedProperty | null;
  bookmarkId: string;
  currentStatus: DealStatus;
  targetStatus: DealStatus;
}

export const DealsPage: React.FC<DealsPageProps> = ({
  bookmarks, onViewProperty, onAnalyzeProperty, onBookmarkProperty, onBack,
}) => {
  const { user } = useAuth();
  const { isPro } = useSubscription();
  const userId = user?.id || '';

  const [activeTab, setActiveTab] = useState<DealTab>('all');
  const [_viewMode, _setViewMode] = useState<ViewMode>(() =>
    (localStorage.getItem('deals-view-mode') as ViewMode) || 'table'
  );
  const [showTip, setShowTip] = useState(() =>
    !localStorage.getItem('deals-tip-dismissed')
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [properties, setProperties] = useState<ScoutedProperty[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState<ActiveFilter[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const abortRef = useRef<AbortController | null>(null);

  const {
    budgetRange: prefBudget,
    preferredBedrooms: prefBeds,
    preferredPropertyTypes: prefTypes,
    lastSearchCity: prefLastCity,
    clientLocation,
  } = usePreferencesStore();

  const [filterLocation, setFilterLocation] = useState('');
  const [filterMinPrice, setFilterMinPrice] = useState('');
  const [filterMaxPrice, setFilterMaxPrice] = useState('');
  const [filterBeds, setFilterBeds] = useState<number | null>(null);
  const [filterPropertyTypes, setFilterPropertyTypes] = useState<string[]>([]);

  useEffect(() => {
    if (prefBudget?.min) setFilterMinPrice(String(prefBudget.min));
    if (prefBudget?.max) setFilterMaxPrice(String(prefBudget.max));
    if (prefBeds) setFilterBeds(prefBeds);
    if (prefTypes?.length) setFilterPropertyTypes(prefTypes);
  }, []);

  const [savedProperties, setSavedProperties] = useState<ScoutedProperty[]>([]);
  const [savedLoading, setSavedLoading] = useState(false);

  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<string>('');
  const [portfolioProperties, setPortfolioProperties] = useState<ScoutedProperty[]>([]);
  const [portfolioLoading, setPortfolioLoading] = useState(false);

  const [statusFilter, setStatusFilter] = useState<DealStatusFilter>('all');
  const [dealStatuses, setDealStatuses] = useState<Map<string, DealStatus>>(new Map());
  const [bookmarkIdMap, setBookmarkIdMap] = useState<Map<string, string>>(new Map());
  const [closeModal, setCloseModal] = useState<CloseModalState | null>(null);

  const bookmarkedIds = new Set(bookmarks.map(b => b.property?.listing_id).filter(Boolean));

  // viewMode persisted but always grid in redesigned UI

  const getEffectiveLocation = useCallback((query?: string) => {
    return query
      || searchQuery
      || filterLocation
      || prefLastCity
      || clientLocation?.cityName
      || 'Austin, TX';
  }, [searchQuery, filterLocation, prefLastCity, clientLocation]);

  const fetchProperties = useCallback(async (query?: string) => {
    if (activeTab !== 'all') return;
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();
    setLoading(true);
    try {
      const { defaultStrategy, user_id: prefUserId } = usePreferencesStore.getState();

      const minP = filterMinPrice ? parseInt(filterMinPrice, 10) : (prefBudget?.min || undefined);
      const maxP = filterMaxPrice ? parseInt(filterMaxPrice, 10) : (prefBudget?.max || undefined);
      const beds = filterBeds || prefBeds || undefined;
      const types = filterPropertyTypes.length > 0 ? filterPropertyTypes : (prefTypes?.length ? prefTypes : undefined);

      const params: PropertySearchParams = {
        location: getEffectiveLocation(query),
        limit: ITEMS_PER_PAGE,
      };

      if (maxP) params.max_price = maxP;
      if (minP) params.min_price = minP;
      if (beds) params.min_bedrooms = beds;
      if (types) params.property_types = types;
      if (defaultStrategy) params.strategy = defaultStrategy;

      const uid = userId || prefUserId;
      if (uid && uid !== 'default') params.user_id = uid;

      const res = await searchProperties(params, abortRef.current?.signal);
      const mapped: ScoutedProperty[] = (res?.properties || []).map((p: any) => ({
        listing_id: p.listing_id || p.id || String(Math.random()),
        address: p.address || '',
        city: p.city || '',
        state: p.state || '',
        zip_code: p.zip_code || '',
        price: p.price || 0,
        bedrooms: p.bedrooms || 0,
        bathrooms: p.bathrooms || 0,
        sqft: p.sqft || 0,
        year_built: p.year_built,
        property_type: p.property_type,
        photos: p.photos,
        value_score: p.value_score,
        cash_on_cash_roi: p.cash_on_cash_roi,
        financial_snapshot: p.financial_snapshot,
      }));
      setProperties(mapped);
      setTotalCount(res?.total_found || mapped.length);
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        setProperties([]);
      }
    } finally {
      setLoading(false);
    }
  }, [activeTab, searchQuery, userId, filterLocation, filterMinPrice, filterMaxPrice, filterBeds, filterPropertyTypes, prefBudget, prefBeds, prefTypes, getEffectiveLocation]);

  useEffect(() => {
    if (activeTab === 'all') {
      fetchProperties();
    }
  }, [activeTab, currentPage, fetchProperties]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    if (activeTab === 'saved' && userId) {
      setSavedLoading(true);
      getBookmarks(userId, 50)
        .then(res => {
          const statusMap = new Map<string, DealStatus>();
          const bmIdMap = new Map<string, string>();
          const mapped: ScoutedProperty[] = (res.bookmarks || []).map((bm: BookmarkData) => {
            const pd = bm.property_data || {};
            const listingId = pd.listing_id || String(bm.id);
            if (bm.deal_status) statusMap.set(listingId, bm.deal_status);
            bmIdMap.set(listingId, bm.id);
            return {
              listing_id: listingId,
              address: pd.address || bm.display_name || '',
              city: pd.city || '',
              state: pd.state || '',
              zip_code: pd.zip_code || '',
              price: pd.price || 0,
              bedrooms: pd.bedrooms || 0,
              bathrooms: pd.bathrooms || 0,
              sqft: pd.sqft || 0,
              year_built: pd.year_built,
              property_type: pd.property_type,
              photos: pd.photos,
              value_score: pd.value_score,
              cash_on_cash_roi: pd.cash_on_cash_roi,
              financial_snapshot: pd.financial_snapshot,
            };
          });
          setSavedProperties(mapped);
          setDealStatuses(prev => {
            const next = new Map(prev);
            statusMap.forEach((v, k) => next.set(k, v));
            return next;
          });
          setBookmarkIdMap(prev => {
            const next = new Map(prev);
            bmIdMap.forEach((v, k) => next.set(k, v));
            return next;
          });
        })
        .catch(() => setSavedProperties([]))
        .finally(() => setSavedLoading(false));
    }
  }, [activeTab, userId]);

  useEffect(() => {
    if (activeTab === 'portfolio') {
      setPortfolioLoading(true);
      getPortfolios()
        .then(res => {
          setPortfolios(res.portfolios || []);
          if ((res.portfolios || []).length > 0 && !selectedPortfolioId) {
            setSelectedPortfolioId(res.portfolios[0].id);
          }
        })
        .catch(() => setPortfolios([]))
        .finally(() => setPortfolioLoading(false));
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'portfolio' && selectedPortfolioId) {
      setPortfolioLoading(true);
      getPortfolioSummary(selectedPortfolioId)
        .then(res => {
          const props = res.data?.properties || [];
          const mapped: ScoutedProperty[] = props.map((p: any) => ({
            listing_id: p.id || p.listing_id || String(Math.random()),
            address: p.address || '',
            city: p.city || '',
            state: p.state || '',
            zip_code: p.zipCode || p.zip_code || '',
            price: p.currentValue || p.price || p.purchasePrice || 0,
            bedrooms: p.bedrooms || 0,
            bathrooms: p.bathrooms || 0,
            sqft: p.sqft || 0,
            year_built: p.yearBuilt || p.year_built,
            property_type: p.propertyType || p.property_type,
            value_score: p.value_score,
            cash_on_cash_roi: p.cashOnCash || p.cash_on_cash_roi,
            financial_snapshot: p.financial_snapshot,
          }));
          setPortfolioProperties(mapped);
        })
        .catch(() => setPortfolioProperties([]))
        .finally(() => setPortfolioLoading(false));
    }
  }, [activeTab, selectedPortfolioId]);

  const handleSearch = useCallback((value: string) => {
    setSearchQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setCurrentPage(1);
      fetchProperties(value);
    }, 300);
  }, [fetchProperties]);

  const handleStatusChange = (property: ScoutedProperty, bookmarkId: string, targetStatus: DealStatus) => {
    const currentStatus = dealStatuses.get(property.listing_id) || 'active';
    setCloseModal({ property, bookmarkId, currentStatus, targetStatus });
  };

  const confirmStatusChange = async (bookmarkId: string, status: DealStatus, _details?: DealCloseDetails) => {
    if (!userId) return;
    await updateBookmarkStatus(userId, bookmarkId, status);
    setDealStatuses(prev => {
      const next = new Map(prev);
      const listingId = [...bookmarkIdMap.entries()].find(([, bmId]) => bmId === bookmarkId)?.[0];
      if (listingId) next.set(listingId, status);
      return next;
    });
  };

  // Stale under_contract deals for nudge banner
  const staleUnderContractCount = (() => {
    let count = 0;
    dealStatuses.forEach((status) => {
      if (status === 'under_contract') count++;
    });
    return count;
  })();
  const [nudgeDismissed, setNudgeDismissed] = useState(false);

  const displayProperties = (() => {
    let props: ScoutedProperty[] = [];
    if (activeTab === 'saved') props = savedProperties;
    else if (activeTab === 'portfolio') props = portfolioProperties;
    else if (activeTab === 'recent') {
      try {
        const ids: string[] = JSON.parse(localStorage.getItem('deals-recent-views') || '[]');
        props = properties.filter(p => ids.includes(p.listing_id));
      } catch { props = []; }
    } else {
      props = properties;
    }

    if (statusFilter !== 'all') {
      props = props.filter(p => {
        const s = dealStatuses.get(p.listing_id) || 'active';
        return s === statusFilter;
      });
    }

    return props;
  })();

  const isTabLoading = activeTab === 'all' ? loading
    : activeTab === 'saved' ? savedLoading
      : activeTab === 'portfolio' ? portfolioLoading
        : false;

  const totalPages = Math.max(1, Math.ceil((activeTab === 'all' ? totalCount : displayProperties.length) / ITEMS_PER_PAGE));

  const removeFilter = (key: string) => {
    setFilters(prev => prev.filter(f => f.key !== key));
  };

  return (
    <div className="h-full overflow-y-auto bg-background relative overflow-x-hidden" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(0,0,0,0.06) transparent' }}>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 max-w-[900px] mx-auto px-6 py-8"
      >
        <div className="space-y-5">

          {/* Header */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {onBack && (
                <button
                  onClick={onBack}
                  className="w-8 h-8 rounded-lg hover:bg-black/[0.03] flex items-center justify-center transition-all group -ml-1"
                >
                  <ArrowLeft className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </button>
              )}
              <h1 className="text-[26px] font-semibold text-foreground tracking-[-0.02em]">Deals</h1>
            </div>
            <p className="text-[13px] text-muted-foreground/60">Discover investment properties</p>
          </div>

          {/* Smart Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search locations, addresses, or describe what you're looking for..."
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-background border border-black/[0.06]
                         text-[14px] text-foreground/80 placeholder:text-muted-foreground/50
                         focus:outline-none focus:border-[#C08B5C]/30 focus:ring-1 focus:ring-[#C08B5C]/15
                         transition-all duration-150"
              data-wand-id="deals-search"
              data-wand-type="input"
              data-wand-label="Deals search"
            />
          </div>

          {/* Filter Chips */}
          <div className="flex items-center gap-2 flex-wrap">
            {filters.map(f => (
              <span key={f.key} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#C08B5C]/30 bg-[#C08B5C]/[0.06] text-[11px] text-[#C08B5C] font-medium">
                {f.label}
                <button onClick={() => removeFilter(f.key)} className="text-[#C08B5C]/50 hover:text-[#C08B5C]">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-black/[0.08] text-[11px] text-muted-foreground/60 font-medium hover:border-black/[0.12] hover:text-muted-foreground transition-colors"
            >
              <SlidersHorizontal className="w-3 h-3" /> Filter
            </button>
            {filters.length > 0 && (
              <button onClick={() => setFilters([])} className="text-[11px] text-[#C08B5C] hover:text-[#D4A27F] font-semibold">
                Clear all
              </button>
            )}
          </div>

          {showTip && (
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-[#C08B5C]/[0.06] border border-[#C08B5C]/[0.12]">
              <Sparkles className="w-4 h-4 text-[#C08B5C]/60 flex-shrink-0" />
              <p className="text-[11px] text-muted-foreground flex-1">
                Select a property and click <span className="text-[#C08B5C] font-medium">Analyze ✨</span> to analyze any deal.
              </p>
              <button
                onClick={() => { setShowTip(false); localStorage.setItem('deals-tip-dismissed', '1'); }}
                className="p-1 rounded hover:bg-black/[0.03] text-muted-foreground/40 hover:text-muted-foreground/70 flex-shrink-0"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Nudge banner for stale under_contract deals */}
          {staleUnderContractCount > 0 && !nudgeDismissed && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-500/[0.06] border border-amber-500/[0.12]">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                <Clock className="w-4 h-4 text-amber-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-medium text-foreground/80">
                  {staleUnderContractCount} deal{staleUnderContractCount !== 1 ? 's' : ''} under contract
                </p>
                <p className="text-[11px] text-muted-foreground/60">
                  Have any of these closed? Update their status to keep your pipeline accurate.
                </p>
              </div>
              <button
                onClick={() => { setStatusFilter('under_contract'); setNudgeDismissed(true); }}
                className="px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 text-[11px] font-semibold hover:bg-amber-500/15 flex-shrink-0"
              >
                Review
              </button>
              <button
                onClick={() => setNudgeDismissed(true)}
                className="p-1 rounded hover:bg-black/[0.03] text-muted-foreground/40 hover:text-muted-foreground/70 flex-shrink-0"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Tabs — clean underline style */}
          <div className="flex items-center gap-6 border-b border-black/[0.06]">
            {TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => { setActiveTab(tab.key); setCurrentPage(1); }}
                className={`pb-2.5 text-[13px] font-medium border-b-2 transition-colors ${activeTab === tab.key
                  ? 'border-[#C08B5C] text-foreground/85'
                  : 'border-transparent text-muted-foreground/60 hover:text-foreground/55'
                  }`}
              >
                {tab.label}
              </button>
            ))}

            {(activeTab === 'saved' || activeTab === 'portfolio') && (
              <div className="ml-auto flex items-center gap-1 pb-2">
                {STATUS_FILTERS.map(sf => (
                  <button
                    key={sf.key}
                    onClick={() => setStatusFilter(sf.key)}
                    className={`px-2.5 py-1 rounded-md text-[10px] font-semibold ${statusFilter === sf.key
                      ? 'bg-black/[0.06] text-foreground/80'
                      : 'text-muted-foreground/50 hover:bg-black/[0.02]'
                      }`}
                  >
                    {sf.label}
                  </button>
                ))}
              </div>
            )}

            {activeTab === 'portfolio' && portfolios.length > 0 && (
              <div className="relative ml-auto pb-2">
                <select
                  value={selectedPortfolioId}
                  onChange={e => setSelectedPortfolioId(e.target.value)}
                  className="appearance-none px-3 py-1.5 pr-7 rounded-lg bg-black/[0.03] border border-black/[0.06] text-[11px] text-foreground/70 font-medium focus:outline-none focus:border-[#C08B5C]/30"
                >
                  {portfolios.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground/50 pointer-events-none" />
              </div>
            )}
          </div>

          {showFilters && (
            <div className="rounded-lg bg-black/[0.02] border border-black/[0.05] p-4">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 mb-2.5 block">City / State</label>
                  <input
                    type="text"
                    value={filterLocation}
                    onChange={e => setFilterLocation(e.target.value)}
                    placeholder={getEffectiveLocation() || 'e.g. Austin, TX'}
                    className="w-full px-3 py-2.5 rounded-lg bg-black/[0.03] border border-black/[0.06] text-[12px] text-foreground/80 placeholder-white/15 focus:outline-none focus:border-[#C08B5C]/30"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 mb-2.5 block">Price Range</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={filterMinPrice}
                      onChange={e => setFilterMinPrice(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="Min"
                      className="w-full px-3 py-2.5 rounded-lg bg-black/[0.03] border border-black/[0.06] text-[12px] text-foreground/80 placeholder-white/15 focus:outline-none focus:border-[#C08B5C]/30"
                    />
                    <span className="text-muted-foreground/40 text-[11px]">-</span>
                    <input
                      type="text"
                      value={filterMaxPrice}
                      onChange={e => setFilterMaxPrice(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="Max"
                      className="w-full px-3 py-2.5 rounded-lg bg-black/[0.03] border border-black/[0.06] text-[12px] text-foreground/80 placeholder-white/15 focus:outline-none focus:border-[#C08B5C]/30"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 mb-2.5 block">Bedrooms</label>
                  <div className="flex items-center gap-1.5">
                    {[
                      { label: '1+', value: 1 },
                      { label: '2+', value: 2 },
                      { label: '3+', value: 3 },
                      { label: '4+', value: 4 },
                    ].map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => setFilterBeds(filterBeds === opt.value ? null : opt.value)}
                        className={`px-3 py-2 rounded-lg border text-[11px] font-medium transition-colors ${filterBeds === opt.value
                          ? 'bg-[#C08B5C]/[0.12] border-[#C08B5C]/30 text-[#C08B5C]'
                          : 'bg-black/[0.03] border-black/[0.06] text-muted-foreground/70 hover:bg-black/[0.05]'
                          }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 mb-2.5 block">Property Type</label>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {['SFH', 'Condo', 'Multi', 'Town'].map(opt => (
                      <button
                        key={opt}
                        onClick={() => setFilterPropertyTypes(prev =>
                          prev.includes(opt) ? prev.filter(t => t !== opt) : [...prev, opt]
                        )}
                        className={`px-3 py-2 rounded-lg border text-[11px] font-medium transition-colors ${filterPropertyTypes.includes(opt)
                          ? 'bg-[#C08B5C]/[0.12] border-[#C08B5C]/30 text-[#C08B5C]'
                          : 'bg-black/[0.03] border-black/[0.06] text-muted-foreground/70 hover:bg-black/[0.05]'
                          }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-black/[0.04]">
                <button
                  onClick={() => {
                    setFilterLocation('');
                    setFilterMinPrice('');
                    setFilterMaxPrice('');
                    setFilterBeds(null);
                    setFilterPropertyTypes([]);
                    setCurrentPage(1);
                    fetchProperties();
                  }}
                  className="text-[11px] text-[#C08B5C] hover:text-[#D4A27F] font-semibold"
                >
                  Reset
                </button>
                <button
                  onClick={() => { setCurrentPage(1); fetchProperties(); }}
                  className="px-4 py-2 rounded-lg bg-[#C08B5C] text-[#0A0A0C] text-[12px] font-bold hover:bg-[#D4A27F] transition-colors"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground/40 font-medium">
              {isTabLoading ? 'Searching...' : `Showing ${displayProperties.length} of ${activeTab === 'all' ? totalCount : displayProperties.length} results`}
            </span>
          </div>

          {isTabLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="rounded-xl bg-black/[0.02] border border-black/[0.05] aspect-[4/3] animate-pulse" />
              ))}
            </div>
          ) : activeTab === 'saved' || activeTab === 'portfolio' ? (
            <DealsKanban
              properties={displayProperties}
              onViewProperty={onViewProperty}
              onAnalyzeProperty={onAnalyzeProperty}
              dealStatuses={dealStatuses}
              onStatusChange={handleStatusChange}
              bookmarkIdMap={bookmarkIdMap}
            />
          ) : (
            <DealsGrid
              properties={displayProperties}
              onViewProperty={onViewProperty}
              onAnalyzeProperty={onAnalyzeProperty}
              onBookmarkProperty={onBookmarkProperty}
              bookmarkedIds={bookmarkedIds}
              dealStatuses={dealStatuses}
              onStatusChange={handleStatusChange}
              bookmarkIdMap={bookmarkIdMap}
            />
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1 pt-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg text-[12px] font-medium text-muted-foreground/60 hover:text-foreground/70 hover:bg-black/[0.03] disabled:opacity-25 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-lg text-[12px] font-semibold ${currentPage === page
                    ? 'bg-[#C08B5C]/[0.12] text-[#C08B5C] border border-[#C08B5C]/20'
                    : 'text-muted-foreground/60 hover:text-foreground/70 hover:bg-black/[0.03]'
                    }`}
                >
                  {page}
                </button>
              ))}
              {totalPages > 7 && <span className="text-muted-foreground/40 text-[12px] px-1">...</span>}
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-lg text-[12px] font-medium text-muted-foreground/60 hover:text-foreground/70 hover:bg-black/[0.03] disabled:opacity-25 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </motion.div>

      {closeModal && (
        <DealCloseModal
          property={closeModal.property}
          bookmarkId={closeModal.bookmarkId}
          currentStatus={closeModal.currentStatus}
          targetStatus={closeModal.targetStatus}
          isPro={isPro}
          onConfirm={confirmStatusChange}
          onClose={() => setCloseModal(null)}
        />
      )}
    </div>
  );
};
