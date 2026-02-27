import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2, WifiOff, Search, RefreshCw, ArrowLeft } from 'lucide-react';
import { MarketplaceHero } from './MarketplaceHero';
import { MarketplaceCategoryTabs, type CategoryFilter } from './MarketplaceCategoryTabs';
import { ProfessionalCard } from './ProfessionalCard';
import { MarketplacePagination } from './MarketplacePagination';
import { MarketplaceLocationTabs, type LocationOption } from './MarketplaceLocationTabs';
import {
  professionals as localProfessionals,
  CATEGORY_ACCENT,
  CATEGORY_LABELS,
  parseServiceAreaState,
  type Professional,
  type ProfessionalCategory,
} from './marketplaceData';
import {
  fetchProfessionals,
  connectProfessional,
  type ProfessionalDTO,
} from '../../services/marketplaceApi';

const PAGE_SIZE = 8;

function dtoToLocal(dto: ProfessionalDTO): Professional {
  return {
    id: dto.id,
    name: dto.name,
    category: dto.category,
    description: dto.description ?? '',
    specialties: dto.specialties,
    rating: dto.rating,
    reviewCount: dto.review_count ?? 0,
    featured: dto.featured,
    accentColor:
      dto.accent_color ?? CATEGORY_ACCENT[dto.category as ProfessionalCategory] ?? 'from-gray-500 to-gray-600',
    imageUrl: dto.image_url ?? undefined,
    phone: dto.contact_phone ?? undefined,
    email: dto.contact_email ?? undefined,
    website: dto.website_url ?? undefined,
    serviceAreas: dto.service_areas ?? [],
  };
}

interface MarketplacePageProps {
  onStartChat: (context: { name: string; specialty: string; category: string } | null) => void;
  onStartVoice: (context: { name: string; specialty: string; category: string } | null) => void;
  onStartEmail?: (context: { name: string; email: string; category: string; specialty: string }) => void;
  onStartText?: (context: { name: string; phone: string; category: string; specialty: string }) => void;
  onStartCall?: (professional: Professional) => void;
  onBack?: () => void;
}

export const MarketplacePage: React.FC<MarketplacePageProps> = ({
  onStartChat,
  onStartVoice,
  onStartEmail,
  onStartText,
  onStartCall,
  onBack,
}) => {
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('featured');
  const [activeLocation, setActiveLocation] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [isTabsSticky, setIsTabsSticky] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const tabsSentinelRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const [allProfessionals, setAllProfessionals] = useState<Professional[]>(localProfessionals);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [usingFallback, setUsingFallback] = useState(false);

  const loadProfessionals = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const res = await fetchProfessionals({ page_size: 200 });
      if (res.professionals.length > 0) {
        setAllProfessionals(res.professionals.map(dtoToLocal));
        setUsingFallback(false);
      } else {
        setUsingFallback(true);
      }
    } catch {
      if (!isRefresh) setUsingFallback(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadProfessionals();
  }, [loadProfessionals]);

  const featured = useMemo(
    () => allProfessionals.filter(p => p.featured),
    [allProfessionals],
  );

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Partial<Record<CategoryFilter, number>> = {
      featured: allProfessionals.filter(p => p.featured).length,
    };
    for (const p of allProfessionals) {
      counts[p.category] = (counts[p.category] ?? 0) + 1;
    }
    return counts;
  }, [allProfessionals]);

  // Search filtering
  const isSearching = searchQuery.trim().length > 0;
  const searchResults = useMemo(() => {
    if (!isSearching) return [];
    const q = searchQuery.toLowerCase();
    return allProfessionals.filter(
      p =>
        p.name.toLowerCase().includes(q) ||
        p.specialties.some(s => s.toLowerCase().includes(q)) ||
        p.description.toLowerCase().includes(q),
    );
  }, [searchQuery, allProfessionals, isSearching]);

  const categoryFiltered = useMemo(() => {
    if (isSearching) return searchResults;
    if (activeCategory === 'featured') return allProfessionals.filter(p => p.featured);
    return allProfessionals.filter(p => p.category === activeCategory);
  }, [activeCategory, allProfessionals, isSearching, searchResults]);

  const locationPills = useMemo<LocationOption[]>(() => {
    if (isSearching) return [];
    const counts = new Map<string, number>();
    for (const p of categoryFiltered) {
      const seen = new Set<string>();
      for (const area of p.serviceAreas) {
        const state = parseServiceAreaState(area);
        if (!seen.has(state)) {
          seen.add(state);
          counts.set(state, (counts.get(state) ?? 0) + 1);
        }
      }
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([key, count]) => ({ key, label: key, count }));
  }, [categoryFiltered, isSearching]);

  const filtered = useMemo(() => {
    if (activeLocation === 'all') return categoryFiltered;
    return categoryFiltered.filter(p =>
      p.serviceAreas.some(a => parseServiceAreaState(a) === activeLocation),
    );
  }, [categoryFiltered, activeLocation]);

  useEffect(() => {
    setActiveLocation('all');
  }, [activeCategory, searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, activeLocation, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const rankOffset = (safePage - 1) * PAGE_SIZE;

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const handleScroll = useCallback(() => {
    if (!tabsSentinelRef.current || !scrollRef.current) return;
    const sentinelRect = tabsSentinelRef.current.getBoundingClientRect();
    const containerRect = scrollRef.current.getBoundingClientRect();
    setIsTabsSticky(sentinelRect.top <= containerRect.top);
  }, []);

  const makeContext = (p: Professional) => ({
    name: p.name,
    specialty: p.specialties[0] || p.description,
    category: p.category,
  });

  const handleChat = useCallback((p: Professional) => {
    connectProfessional(p.id, 'chat').catch(() => {});
    onStartChat(makeContext(p));
  }, [onStartChat]);

  const handleVoice = useCallback((p: Professional) => {
    connectProfessional(p.id, 'voice').catch(() => {});
    onStartVoice(makeContext(p));
  }, [onStartVoice]);

  const handleEmail = useCallback((p: Professional) => {
    if (!p.email) return;
    connectProfessional(p.id, 'email').catch(() => {});
    onStartEmail?.({
      name: p.name,
      email: p.email,
      category: p.category,
      specialty: p.specialties[0] || p.description,
    });
  }, [onStartEmail]);

  const handleText = useCallback((p: Professional) => {
    if (!p.phone) return;
    connectProfessional(p.id, 'text').catch(() => {});
    onStartText?.({
      name: p.name,
      phone: p.phone,
      category: p.category,
      specialty: p.specialties[0] || p.description,
    });
  }, [onStartText]);

  const handleCall = useCallback((p: Professional) => {
    if (!p.phone) return;
    onStartCall?.(p);
  }, [onStartCall]);

  const handleHeroSelect = useCallback((p: Professional) => {
    connectProfessional(p.id, 'chat').catch(() => {});
    onStartChat(makeContext(p));
  }, [onStartChat]);

  // Section label
  const locationSuffix = activeLocation !== 'all' ? ` in ${activeLocation}` : '';
  const sectionLabel = isSearching
    ? `${filtered.length} result${filtered.length !== 1 ? 's' : ''} for "${searchQuery}"`
    : activeCategory === 'featured'
      ? `${filtered.length} Featured${locationSuffix}`
      : `${filtered.length} ${CATEGORY_LABELS[activeCategory as ProfessionalCategory] ?? ''}${locationSuffix}`;

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-white/30 animate-spin" />
      </div>
    );
  }

  return (
    <div
      ref={scrollRef}
      onScroll={handleScroll}
      className="h-full overflow-y-auto"
      style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.06) transparent' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-3xl mx-auto px-6 py-6 space-y-5"
      >
        {/* Page header + inline search + refresh */}
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-shrink-0">
              {onBack && (
                <button
                  onClick={onBack}
                  className="w-8 h-8 rounded-lg hover:bg-white/[0.04] border border-transparent hover:border-white/[0.08] flex items-center justify-center transition-all group -ml-1"
                  title="Back to Home"
                >
                  <ArrowLeft className="w-4 h-4 text-white/50 group-hover:text-white transition-colors" />
                </button>
              )}
              <h1 className="text-lg font-bold gradient-text">Marketplace</h1>
            </div>
            <div className="flex items-center gap-2 flex-1 max-w-[320px]">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06]
                             text-[12px] text-white/80 placeholder:text-white/20
                             focus:outline-none focus:border-[#C08B5C]/30 focus:ring-1 focus:ring-[#C08B5C]/20
                             transition-all duration-150"
                />
                {isSearching && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-white/30 hover:text-white/50 transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>
              <button
                onClick={() => loadProfessionals(true)}
                disabled={refreshing}
                className="w-7 h-7 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center
                           text-white/30 hover:text-[#D4A27F]/70 hover:border-[#C08B5C]/20 transition-all
                           disabled:opacity-40 flex-shrink-0"
                title="Refresh marketplace"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-[12px] text-white/35">
              Connect with vetted professionals for your next deal
            </p>
            <span className="text-[10px] text-white/20 font-mono">
              {allProfessionals.length} professionals
            </span>
          </div>
        </div>

        {/* Fallback indicator */}
        {usingFallback && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-[12px] text-white/40">
            <WifiOff className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Showing sample data — connect the backend to see live professionals</span>
          </div>
        )}

        {/* Hero carousel — hidden when searching */}
        {!isSearching && (
          <MarketplaceHero
            featured={featured}
            onSelect={handleHeroSelect}
            onEmail={handleEmail}
            onText={handleText}
            onCall={handleCall}
          />
        )}

        {/* Sticky sentinel */}
        <div ref={tabsSentinelRef} />

        {/* Category tabs — hidden when searching */}
        {!isSearching && (
          <div className={isTabsSticky ? 'sticky top-0 z-20' : ''}>
            <MarketplaceCategoryTabs
              active={activeCategory}
              onChange={setActiveCategory}
              counts={categoryCounts}
              isSticky={isTabsSticky}
            />
          </div>
        )}

        {/* Location pills — hidden when searching */}
        {!isSearching && locationPills.length > 1 && (
          <MarketplaceLocationTabs
            locations={locationPills}
            active={activeLocation}
            onChange={setActiveLocation}
          />
        )}

        {/* Section header */}
        <div className="flex items-center justify-between">
          <span className="text-[12px] text-white/30 font-medium">{sectionLabel}</span>
        </div>

        {/* Professional cards */}
        <div ref={gridRef}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0.5">
            {paginated.map((professional, i) => (
              <ProfessionalCard
                key={professional.id}
                professional={professional}
                index={i}
                rank={rankOffset + i + 1}
                onChat={handleChat}
                onVoice={handleVoice}
                onEmail={handleEmail}
                onText={handleText}
              />
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="py-16 text-center">
              <p className="text-[14px] text-white/30">
                {isSearching
                  ? `No professionals match "${searchQuery}"`
                  : 'No professionals in this category yet.'}
              </p>
            </div>
          )}

          <MarketplacePagination
            currentPage={safePage}
            totalPages={totalPages}
            totalItems={filtered.length}
            pageSize={PAGE_SIZE}
            onPageChange={handlePageChange}
          />
        </div>

        <div className="h-8" />
      </motion.div>
    </div>
  );
};
