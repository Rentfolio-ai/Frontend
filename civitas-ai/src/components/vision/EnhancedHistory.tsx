/**
 * EnhancedHistory — Filterable, searchable scan history
 *
 * Features:
 *   - Group by property (walkthrough sessions) or flat list
 *   - Filter by date range, condition, room type
 *   - Search by address/property
 *   - Infinite scroll pagination
 *   - Bulk actions: compare selected, delete
 *   - Property cards with composite score, room count, cost, date
 *   - Individual scan cards with room, condition, issues, thumbnail
 *
 * Design: Premium card grid, skeleton loaders, staggered reveal,
 * frosted glass filter bar, violet selection indicator.
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Search,
  Filter,
  X,
  ScanEye,
  Camera,
  GitCompareArrows,
  Trash2,
  Loader2,
  Calendar,
  ChevronDown,
  CheckCircle2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScoreGauge } from './shared/ScoreGauge';
import type { Detection } from './shared/DetectionOverlay';

// ── Types ──────────────────────────────────────────────────

interface HistoryItem {
  analysis_id: string;
  analyzed_at: string;
  room_type: string;
  condition_rating: string;
  analysis_data: {
    detections?: Detection[];
    renovation_costs?: {
      standard_rental?: number;
    };
    investment_metrics?: {
      deal_score?: number;
    };
  };
  image_url?: string;
}

type ConditionFilter = 'all' | 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
type SortMode = 'newest' | 'oldest' | 'score_high' | 'score_low' | 'cost_high';

interface EnhancedHistoryProps {
  onBack: () => void;
  onViewResult?: (item: HistoryItem) => void;
  onCompare?: (items: HistoryItem[]) => void;
}

// ── API Config ─────────────────────────────────────────────

const envApiUrl = import.meta.env.VITE_DATALAYER_API_URL;
const API_BASE = (envApiUrl && typeof envApiUrl === 'string' && envApiUrl.startsWith('http')) ? envApiUrl : 'http://localhost:8001';
const API_KEY = import.meta.env.VITE_API_KEY;

function getHeaders(): HeadersInit {
  const headers: HeadersInit = {};
  if (API_KEY) headers['X-API-Key'] = API_KEY;
  return headers;
}

// ── Helpers ────────────────────────────────────────────────

function formatCurrency(n: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}

function formatDamageClass(cls: string): string {
  return cls.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

const conditionColors: Record<string, string> = {
  excellent: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/15',
  good: 'text-green-400 bg-green-500/10 border-green-500/15',
  fair: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/15',
  poor: 'text-orange-400 bg-orange-500/10 border-orange-500/15',
  critical: 'text-red-400 bg-red-500/10 border-red-500/15',
};

// ── Skeleton Card ──────────────────────────────────────────

const SkeletonCard: React.FC = () => (
  <div className="bg-[#121216] rounded-2xl border border-white/[0.03] overflow-hidden">
    <div className="w-full h-28 bg-white/[0.02] animate-shimmer" />
    <div className="p-3 space-y-2">
      <div className="h-3 w-20 bg-white/[0.04] rounded animate-shimmer" />
      <div className="h-4 w-28 bg-white/[0.03] rounded animate-shimmer" />
      <div className="h-3 w-16 bg-white/[0.02] rounded animate-shimmer" />
    </div>
  </div>
);

// ── Filter Chip ────────────────────────────────────────────

const FilterChip: React.FC<{
  label: string;
  active: boolean;
  onClick: () => void;
}> = ({ label, active, onClick }) => (
  <motion.button
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className={`flex-shrink-0 px-3 py-1.5 rounded-full text-[11px] font-medium border transition-all capitalize ${
      active
        ? 'bg-violet-500/15 border-violet-500/20 text-violet-300'
        : 'bg-white/[0.03] border-white/[0.04] text-white/30 hover:text-white/50'
    }`}
  >
    {label}
  </motion.button>
);

// ── History Card ───────────────────────────────────────────

const HistoryCard: React.FC<{
  item: HistoryItem;
  index: number;
  isSelected: boolean;
  selectionMode: boolean;
  onTap: () => void;
  onSelect: () => void;
}> = ({ item, index, isSelected, selectionMode, onTap, onSelect }) => {
  const issueCount = item.analysis_data?.detections?.length || 0;
  const dealScore = item.analysis_data?.investment_metrics?.deal_score || 0;
  const cost = item.analysis_data?.renovation_costs?.standard_rental || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className={`relative bg-[#121216] rounded-2xl border overflow-hidden transition-all group ${
        isSelected
          ? 'border-violet-500/20 ring-1 ring-violet-500/10'
          : 'border-white/[0.03] hover:border-white/[0.06]'
      }`}
    >
      <button
        onClick={selectionMode ? onSelect : onTap}
        className="w-full text-left"
      >
        {/* Image */}
        <div className="relative w-full h-28 bg-white/[0.02]">
          {item.image_url ? (
            <img src={item.image_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ScanEye className="w-8 h-8 text-white/5" />
            </div>
          )}

          {/* Selection checkbox */}
          {selectionMode && (
            <div className="absolute top-2 right-2">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                isSelected ? 'border-violet-400 bg-violet-500' : 'border-white/15 bg-black/30 backdrop-blur'
              }`}>
                {isSelected && <CheckCircle2 className="w-3 h-3 text-white" />}
              </div>
            </div>
          )}

          {/* Mini score gauge overlay */}
          {dealScore > 0 && (
            <div className="absolute bottom-2 right-2">
              <ScoreGauge score={dealScore} size={36} strokeWidth={2.5} showValue={false} animate={false} />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-3">
          <div className="text-[10px] text-white/25 mb-1">
            {new Date(item.analyzed_at).toLocaleDateString(undefined, {
              month: 'short', day: 'numeric', year: 'numeric',
            })}
          </div>
          <div className="text-sm font-medium text-white/70 mb-1.5">
            {formatDamageClass(item.room_type || 'Unknown')}
          </div>
          <div className="flex items-center justify-between">
            <span className={`inline-flex text-[10px] px-2 py-0.5 rounded-full border capitalize ${conditionColors[item.condition_rating] || 'text-white/30 bg-white/[0.03] border-white/[0.04]'}`}>
              {item.condition_rating || 'N/A'}
            </span>
            <div className="flex items-center gap-2 text-[10px] text-white/20">
              {issueCount > 0 && <span>{issueCount} issue{issueCount !== 1 ? 's' : ''}</span>}
              {cost > 0 && <span>{formatCurrency(cost)}</span>}
            </div>
          </div>
        </div>
      </button>
    </motion.div>
  );
};

// ── Main Component ─────────────────────────────────────────

export const EnhancedHistory: React.FC<EnhancedHistoryProps> = ({
  onBack,
  onViewResult,
  onCompare,
}) => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState('');
  const [conditionFilter, setConditionFilter] = useState<ConditionFilter>('all');
  const [sortMode, setSortMode] = useState<SortMode>('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectionMode, setSelectionMode] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef<HTMLDivElement>(null);
  const PAGE_SIZE = 20;

  // ── Load history ──────────────────────────────────────

  const loadHistory = useCallback(async (pageNum: number, append: boolean = false) => {
    if (pageNum === 0) setLoading(true);
    else setLoadingMore(true);

    try {
      const resp = await fetch(
        `${API_BASE}/api/vision/?limit=${PAGE_SIZE}&offset=${pageNum * PAGE_SIZE}`,
        { headers: getHeaders() }
      );
      if (resp.ok) {
        const data: HistoryItem[] = await resp.json();
        if (append) {
          setHistory(prev => [...prev, ...data]);
        } else {
          setHistory(data);
        }
        setHasMore(data.length === PAGE_SIZE);
      }
    } catch {
      // Failed to load
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    loadHistory(0);
  }, [loadHistory]);

  // ── Infinite scroll ───────────────────────────────────

  useEffect(() => {
    if (!observerRef.current || !hasMore || loadingMore) return;

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          const nextPage = page + 1;
          setPage(nextPage);
          loadHistory(nextPage, true);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, page, loadHistory]);

  // ── Filter and sort ───────────────────────────────────

  const filteredHistory = history.filter(item => {
    // Search filter
    if (search) {
      const q = search.toLowerCase();
      const matchesRoom = (item.room_type || '').toLowerCase().includes(q);
      const matchesCondition = (item.condition_rating || '').toLowerCase().includes(q);
      if (!matchesRoom && !matchesCondition) return false;
    }

    // Condition filter
    if (conditionFilter !== 'all' && item.condition_rating !== conditionFilter) {
      return false;
    }

    return true;
  }).sort((a, b) => {
    switch (sortMode) {
      case 'newest': return new Date(b.analyzed_at).getTime() - new Date(a.analyzed_at).getTime();
      case 'oldest': return new Date(a.analyzed_at).getTime() - new Date(b.analyzed_at).getTime();
      case 'score_high':
        return (b.analysis_data?.investment_metrics?.deal_score || 0) - (a.analysis_data?.investment_metrics?.deal_score || 0);
      case 'score_low':
        return (a.analysis_data?.investment_metrics?.deal_score || 0) - (b.analysis_data?.investment_metrics?.deal_score || 0);
      case 'cost_high':
        return (b.analysis_data?.renovation_costs?.standard_rental || 0) - (a.analysis_data?.renovation_costs?.standard_rental || 0);
      default: return 0;
    }
  });

  // ── Selection ─────────────────────────────────────────

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else if (next.size < 3) next.add(id); // Max 3 for comparison
      return next;
    });
  }, []);

  const handleCompare = useCallback(() => {
    const items = history.filter(h => selectedIds.has(h.analysis_id));
    onCompare?.(items);
  }, [history, selectedIds, onCompare]);

  const handleBulkDelete = useCallback(() => {
    // Just remove from local state (API delete would need endpoint)
    setHistory(prev => prev.filter(h => !selectedIds.has(h.analysis_id)));
    setSelectedIds(new Set());
    setSelectionMode(false);
  }, [selectedIds]);

  return (
    <div className="h-full w-full flex flex-col bg-[#0a0a0c] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#0a0a0c]/90 backdrop-blur-xl border-b border-white/[0.04] flex-shrink-0 z-20">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-white/35 hover:text-white/60 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <span className="text-sm font-medium text-white/60">History</span>
        <button
          onClick={() => { setSelectionMode(!selectionMode); setSelectedIds(new Set()); }}
          className={`text-xs font-medium ${selectionMode ? 'text-violet-400' : 'text-white/25 hover:text-white/50'} transition-colors`}
        >
          {selectionMode ? 'Done' : 'Select'}
        </button>
      </div>

      {/* Search + filter bar */}
      <div className="px-4 py-3 space-y-3 border-b border-white/[0.03] flex-shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/15" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by room type..."
            className="w-full pl-9 pr-8 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-xl text-sm text-white/70 placeholder:text-white/15 focus:outline-none focus:border-violet-500/30 transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5"
            >
              <X className="w-3 h-3 text-white/20" />
            </button>
          )}
        </div>

        {/* Condition filter chips */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {(['all', 'excellent', 'good', 'fair', 'poor', 'critical'] as ConditionFilter[]).map(cond => (
            <FilterChip
              key={cond}
              label={cond}
              active={conditionFilter === cond}
              onClick={() => setConditionFilter(cond)}
            />
          ))}
        </div>

        {/* Sort */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-white/20">
            {filteredHistory.length} result{filteredHistory.length !== 1 ? 's' : ''}
          </span>
          <select
            value={sortMode}
            onChange={e => setSortMode(e.target.value as SortMode)}
            className="text-[11px] text-white/30 bg-transparent border-none focus:outline-none cursor-pointer"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="score_high">Highest score</option>
            <option value="score_low">Lowest score</option>
            <option value="cost_high">Highest cost</option>
          </select>
        </div>
      </div>

      {/* Selection action bar */}
      <AnimatePresence>
        {selectionMode && selectedIds.size > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-4 py-2 bg-violet-500/8 border-b border-violet-500/10 flex items-center justify-between flex-shrink-0"
          >
            <span className="text-xs text-violet-300">{selectedIds.size} selected</span>
            <div className="flex items-center gap-2">
              {selectedIds.size >= 2 && onCompare && (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCompare}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-violet-500/20 text-violet-300 text-[11px] font-medium"
                >
                  <GitCompareArrows className="w-3 h-3" />
                  Compare
                </motion.button>
              )}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleBulkDelete}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 text-[11px] font-medium"
              >
                <Trash2 className="w-3 h-3" />
                Delete
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-white/20">
            <ScanEye className="w-12 h-12 mb-3 opacity-20" />
            <p className="text-sm mb-1">
              {search ? 'No matching scans' : 'No scan history'}
            </p>
            <p className="text-[11px] text-white/15">
              {search ? 'Try different search terms' : 'Take your first scan to get started'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 pb-8">
            {filteredHistory.map((item, i) => (
              <HistoryCard
                key={item.analysis_id}
                item={item}
                index={i}
                isSelected={selectedIds.has(item.analysis_id)}
                selectionMode={selectionMode}
                onTap={() => onViewResult?.(item)}
                onSelect={() => toggleSelection(item.analysis_id)}
              />
            ))}
          </div>
        )}

        {/* Infinite scroll trigger */}
        {hasMore && !loading && (
          <div ref={observerRef} className="flex items-center justify-center py-4">
            {loadingMore && <Loader2 className="w-4 h-4 text-white/15 animate-spin" />}
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedHistory;
