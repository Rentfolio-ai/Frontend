import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2, WifiOff, Search, RefreshCw, ArrowLeft } from 'lucide-react';
import { ProfessionalCard } from './ProfessionalCard';
import { MarketplacePagination } from './MarketplacePagination';
import {
  professionals as localProfessionals,
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  parseServiceAreaState,
  type Professional,
  type ProfessionalCategory,
} from './marketplaceData';
import {
  fetchProfessionals,
  connectProfessional,
  type ProfessionalDTO,
} from '../../services/marketplaceApi';

const PAGE_SIZE = 12; // 2-col × 6 rows

function dtoToLocal(dto: ProfessionalDTO): Professional {
  return {
    id: dto.id,
    name: dto.name,
    category: dto.category as ProfessionalCategory,
    description: dto.description || '',
    specialties: dto.specialties || [],
    rating: dto.rating || 4.5,
    reviewCount: dto.review_count || 0,
    featured: dto.featured || false,
    accentColor: 'from-blue-500 to-cyan-500',
    imageUrl: dto.image_url || undefined,
    phone: dto.contact_phone || undefined,
    email: dto.contact_email || undefined,
    website: dto.website_url || undefined,
    serviceAreas: dto.service_areas || [],
  };
}

type CategoryFilter = 'all' | ProfessionalCategory;
type LocationOption = { key: string; label: string; count: number };

interface MarketplacePageProps {
  onStartChat: (context: { name: string; specialty: string; category: string } | null) => void;
  onStartVoice: (context: { name: string; specialty: string; category: string }) => void;
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
  onStartCall: _onStartCall,
  onBack,
}) => {
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('all');
  const [activeLocation, setActiveLocation] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const gridRef = useRef<HTMLDivElement>(null);

  const [allProfessionals, setAllProfessionals] = useState<Professional[]>(localProfessionals);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [usingFallback, setUsingFallback] = useState(false);

  const loadProfessionals = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      // When refreshing, trigger backend data generation first
      if (isRefresh) {
        const { refreshMarketplace } = await import('../../services/marketplaceApi');
        await refreshMarketplace();
      }

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
    if (activeCategory === 'all') return allProfessionals;
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

  // Extract Top Picks for the featured section
  const topPicks = useMemo(() => {
    if (isSearching || activeCategory !== 'all') return [];
    return allProfessionals.filter(p => p.featured).slice(0, 4);
  }, [allProfessionals, isSearching, activeCategory]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const rankOffset = (safePage - 1) * PAGE_SIZE;

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const makeContext = (p: Professional) => ({
    name: p.name,
    specialty: p.specialties[0] || p.description,
    category: p.category,
  });

  const handleChat = useCallback((p: Professional) => {
    connectProfessional(p.id, 'chat').catch(() => { });
    onStartChat(makeContext(p));
  }, [onStartChat]);

  const handleVoice = useCallback((p: Professional) => {
    connectProfessional(p.id, 'voice').catch(() => { });
    onStartVoice(makeContext(p));
  }, [onStartVoice]);

  const handleEmail = useCallback((p: Professional) => {
    if (!p.email) return;
    connectProfessional(p.id, 'email').catch(() => { });
    onStartEmail?.({
      name: p.name,
      email: p.email,
      category: p.category,
      specialty: p.specialties[0] || p.description,
    });
  }, [onStartEmail]);

  const handleText = useCallback((p: Professional) => {
    if (!p.phone) return;
    connectProfessional(p.id, 'text').catch(() => { });
    onStartText?.({
      name: p.name,
      phone: p.phone,
      category: p.category,
      specialty: p.specialties[0] || p.description,
    });
  }, [onStartText]);



  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 text-muted-foreground/50 animate-spin" />
      </div>
    );
  }

  return (
    <div
      className="h-full overflow-y-auto bg-background"
      style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(0,0,0,0.06) transparent' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-[1000px] mx-auto px-6 py-10 space-y-8"
      >
        {/* ━━ Hero — Search First ━━ */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              {onBack && (
                <button
                  onClick={onBack}
                  className="w-8 h-8 rounded-lg hover:bg-black/[0.03] flex items-center justify-center transition-all group -ml-1"
                >
                  <ArrowLeft className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </button>
              )}
            </div>
            <button
              onClick={() => loadProfessionals(true)}
              disabled={refreshing}
              className="w-8 h-8 rounded-full bg-black/[0.02] flex items-center justify-center
                         text-muted-foreground/50 hover:text-foreground/70 hover:bg-black/[0.06] transition-all disabled:opacity-40"
              title="Refresh Marketplace"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <h1 className="text-[32px] font-medium text-foreground mb-6">
            Professional Marketplace
          </h1>

          {/* Search Bar - Flat Pill Style */}
          <div className="relative max-w-[640px] mx-auto mb-8">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search for real estate professionals..."
              className="w-full pl-12 pr-4 py-3.5 rounded-full bg-muted border border-transparent
                         text-[15px] text-foreground placeholder:text-muted-foreground/50
                         focus:outline-none focus:bg-muted focus:border-black/8
                         transition-all duration-150"
            />
            {isSearching && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[12px] text-muted-foreground/70 hover:text-foreground/80 transition-colors px-2 py-1 rounded-full hover:bg-black/[0.03]"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Fallback indicator */}
        {usingFallback && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-black/[0.02] border border-black/[0.06] text-[12px] text-muted-foreground/70">
            <WifiOff className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Showing sample data — connect the backend for live professionals</span>
          </div>
        )}

        {/* ━━ Category Tabs — Flat Text Style ━━ */}
        {!isSearching && (
          <div className="flex items-center justify-center gap-6 flex-wrap pb-2">
            <button
              onClick={() => setActiveCategory('all')}
              className={`text-[14px] font-medium transition-colors ${activeCategory === 'all'
                ? 'text-foreground'
                : 'text-muted-foreground/70 hover:text-foreground/70'
                }`}
            >
              Top Picks
            </button>
            {CATEGORY_ORDER.slice(0, 5).map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`text-[14px] font-medium transition-colors ${activeCategory === cat
                  ? 'text-foreground'
                  : 'text-muted-foreground/70 hover:text-foreground/70'
                  }`}
              >
                {CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>
        )}

        {/* ━━ Location pills  ━━ */}
        {!isSearching && locationPills.length > 1 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] text-muted-foreground/40 uppercase tracking-wider mr-1">Location</span>
            <button
              onClick={() => setActiveLocation('all')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${activeLocation === 'all'
                ? 'bg-black/[0.06] text-foreground/70'
                : 'text-muted-foreground/50 hover:text-muted-foreground'
                }`}
            >
              All
            </button>
            {locationPills.slice(0, 8).map(loc => (
              <button
                key={loc.key}
                onClick={() => setActiveLocation(loc.key)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${activeLocation === loc.key
                  ? 'bg-black/[0.06] text-foreground/70'
                  : 'text-muted-foreground/50 hover:text-muted-foreground'
                  }`}
              >
                {loc.label} ({loc.count})
              </button>
            ))}
          </div>
        )}

        {/* ━━ Featured / Top Picks Section ━━ */}
        {!isSearching && activeCategory === 'all' && topPicks.length > 0 && currentPage === 1 && (
          <div className="mb-10">
            <div className="flex items-center justify-between pb-4">
              <span className="text-[12px] uppercase tracking-widest text-muted-foreground/70 font-medium font-mono">Top Picks</span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {topPicks.map((professional, i) => (
                <div key={professional.id} className="relative group/banner">
                  {/* Banner styling wrap for featured cards to make them slightly richer */}
                  <div className="absolute inset-0 bg-gradient-to-br from-black/[0.03] to-transparent rounded-2xl pointer-events-none opacity-0 group-hover/banner:opacity-100 transition-opacity" />
                  <ProfessionalCard
                    professional={professional}
                    index={i}
                    rank={i + 1}
                    onChat={handleChat}
                    onVoice={handleVoice}
                    onEmail={handleEmail}
                    onText={handleText}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ━━ Section header ━━ */}
        <div ref={gridRef} className="flex items-center justify-between pb-4">
          <span className="text-[12px] uppercase tracking-widest text-muted-foreground/70 font-medium font-mono">
            {isSearching ? 'Search Results' : 'Trending Professionals'}
          </span>
          <span className="text-[11px] text-muted-foreground/40">{filtered.length} total</span>
        </div>

        {/* ━━ Professional cards — 2-col grid ━━ */}
        <div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
              <p className="text-[14px] text-muted-foreground/50">
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
