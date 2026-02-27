import React, { useEffect, useState } from 'react';
import { MessageSquare, FileText, BarChart3, Bookmark, Phone } from 'lucide-react';
import { getSavedReports } from '../../services/agentsApi';
import { activityService, type ActivityItem as ApiActivityItem } from '../../services/activityApi';
import { useAuth } from '../../contexts/AuthContext';
import type { ChatSession } from '../../hooks/useDesktopShell';
import type { BookmarkedProperty } from '../../types/bookmarks';
import { HomePanelEmptyState } from '../EmptyStates';

interface ActivityItem {
  id: string;
  type: 'chat' | 'report' | 'analysis' | 'bookmark' | 'communication';
  title: string;
  timestamp: string;
}

const TYPE_META: Record<string, { icon: React.FC<{ className?: string }>; color: string; bg: string; badge: string }> = {
  chat: { icon: MessageSquare, color: 'text-blue-400', bg: 'bg-blue-500/[0.08]', badge: 'Chat' },
  report: { icon: FileText, color: 'text-emerald-400', bg: 'bg-emerald-500/[0.08]', badge: 'Report' },
  analysis: { icon: BarChart3, color: 'text-[#D4A27F]', bg: 'bg-[#C08B5C]/[0.08]', badge: 'Analysis' },
  bookmark: { icon: Bookmark, color: 'text-violet-400', bg: 'bg-violet-500/[0.08]', badge: 'Saved' },
  communication: { icon: Phone, color: 'text-cyan-400', bg: 'bg-cyan-500/[0.08]', badge: 'Comm' },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function mapApiType(type: string): ActivityItem['type'] {
  if (type === 'bookmark') return 'bookmark';
  if (type === 'report') return 'report';
  if (type === 'communication') return 'communication';
  return 'chat';
}

interface RecentActivityWidgetProps {
  chatHistory: ChatSession[];
  bookmarks?: BookmarkedProperty[];
  onViewAll: () => void;
}

export const RecentActivityWidget: React.FC<RecentActivityWidgetProps> = ({ chatHistory, bookmarks, onViewAll }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<ActivityItem[]>([]);

  useEffect(() => {
    (async () => {
      try {
        let feedItems: ActivityItem[] = [];
        const userId = user?.id;

        if (userId) {
          try {
            const feed = await activityService.getFeed(userId, 15);
            feedItems = feed.items
              .filter(i => i.timestamp)
              .map((i, idx) => ({
                id: `api-${idx}-${i.timestamp}`,
                type: mapApiType(i.type),
                title: i.title,
                timestamp: i.timestamp!,
              }));
          } catch {
            /* fall through to client-side merge */
          }
        }

        const chatItems: ActivityItem[] = chatHistory
          .filter(c => !c.isArchived && c.title)
          .slice(0, 6)
          .map(c => ({
            id: c.id,
            type: 'chat' as const,
            title: c.title || 'New conversation',
            timestamp: c.createdAt || new Date().toISOString(),
          }));

        let reportItems: ActivityItem[] = [];
        if (feedItems.length === 0) {
          try {
            const res = await getSavedReports();
            reportItems = (res?.reports || []).slice(0, 4).map((r: any) => ({
              id: r.id || r.report_id,
              type: 'report' as const,
              title: r.title || r.property_address || 'Report',
              timestamp: r.created_at || new Date().toISOString(),
            }));
          } catch { /* best-effort */ }
        }

        const bookmarkItems: ActivityItem[] = feedItems.length === 0
          ? (bookmarks || []).slice(0, 4).map(bm => ({
              id: bm.id,
              type: 'bookmark' as const,
              title: bm.displayName || bm.property?.address || 'Saved property',
              timestamp: bm.bookmarkedAt || new Date().toISOString(),
            }))
          : [];

        const allItems = [...feedItems, ...chatItems, ...reportItems, ...bookmarkItems];

        const seen = new Set<string>();
        const deduped = allItems.filter(item => {
          const key = `${item.type}-${item.title}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });

        const merged = deduped
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, 12);

        setItems(merged);
      } finally {
        setLoading(false);
      }
    })();
  }, [chatHistory, bookmarks, user?.id]);

  if (loading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[11px] font-semibold uppercase tracking-widest text-white/25">Recent Activity</h3>
        </div>
        <div className="rounded-xl bg-white/[0.03] border border-white/[0.04] p-5">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-white/[0.05]" />
                <div className="flex-1 h-3 rounded bg-white/[0.05]" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[11px] font-semibold uppercase tracking-widest text-white/25">Recent Activity</h3>
        <button onClick={onViewAll} className="text-[11px] text-[#C08B5C] font-medium hover:text-[#D4A27F]">
          View all
        </button>
      </div>

      {items.length === 0 ? (
        <HomePanelEmptyState
          icon={<MessageSquare className="w-4 h-4" />}
          title="No recent activity"
          description="Start a conversation to see activity here."
          actionLabel="Open chat"
          onAction={onViewAll}
        />
      ) : (
        <div className="rounded-xl bg-white/[0.03] border border-white/[0.04] divide-y divide-white/[0.04]">
          {items.map((item) => {
            const meta = TYPE_META[item.type] || TYPE_META.chat;
            const Icon = meta.icon;
            return (
              <div key={item.id} className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.02]">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${meta.bg}`}>
                  <Icon className={`w-3.5 h-3.5 ${meta.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[13px] text-white/75 truncate block">{item.title}</span>
                </div>
                <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${meta.bg} ${meta.color}`}>
                  {meta.badge}
                </span>
                <span className="text-[11px] text-white/20 flex-shrink-0 tabular-nums">{timeAgo(item.timestamp)}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
