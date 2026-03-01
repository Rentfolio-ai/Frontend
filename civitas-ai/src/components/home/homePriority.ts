import type { DealsPipeline } from './DealsOverviewWidget';
import type { TeamsSummary } from './TeamsOverviewWidget';
import type { ReportsSummary } from './ReportsOverviewWidget';

export type HomePriorityTarget = 'chat' | 'deals' | 'reports' | 'teams';
export type HomePriorityUrgency = 'high' | 'medium' | 'low';

export interface HomePriorityAction {
  id: string;
  title: string;
  description: string;
  ctaLabel: string;
  target: HomePriorityTarget;
  urgency: HomePriorityUrgency;
}

interface BuildHomePriorityQueueParams {
  pipeline: DealsPipeline;
  teams: TeamsSummary;
  reports: ReportsSummary;
  bookmarksCount: number;
  chatCount: number;
}

const URGENCY_SCORE: Record<HomePriorityUrgency, number> = {
  high: 3,
  medium: 2,
  low: 1,
};

export function buildHomePriorityQueue({
  pipeline,
  teams,
  reports,
  bookmarksCount,
  chatCount,
}: BuildHomePriorityQueueParams): HomePriorityAction[] {
  const queue: HomePriorityAction[] = [];

  if (pipeline.total === 0) {
    queue.push({
      id: 'source-first-deal',
      title: 'Source your first deal',
      description: 'Start with a market search and save one promising property.',
      ctaLabel: 'Open deals',
      target: 'deals',
      urgency: 'high',
    });
  }

  if (pipeline.total > 0 && reports.totalReports === 0) {
    queue.push({
      id: 'generate-first-report',
      title: 'Generate your first report',
      description: 'Convert your shortlisted deals into comparable investment insights.',
      ctaLabel: 'Create report',
      target: 'reports',
      urgency: 'high',
    });
  }

  if (bookmarksCount === 0) {
    queue.push({
      id: 'save-watchlist',
      title: 'Build a watchlist',
      description: 'Bookmark 2-3 properties so market changes become easier to track.',
      ctaLabel: 'Find properties',
      target: 'deals',
      urgency: 'medium',
    });
  }

  if (teams.partnerCount === 0 && (pipeline.total > 0 || reports.totalReports > 0)) {
    queue.push({
      id: 'invite-partner',
      title: 'Invite a partner',
      description: 'Share your pipeline and reports to speed up decisions with collaborators.',
      ctaLabel: 'Open teams',
      target: 'teams',
      urgency: 'medium',
    });
  }

  if (teams.unreadMessages > 0) {
    queue.push({
      id: 'review-unread-messages',
      title: 'Review partner updates',
      description: `${teams.unreadMessages} unread team message${teams.unreadMessages === 1 ? '' : 's'} waiting for your input.`,
      ctaLabel: 'View messages',
      target: 'teams',
      urgency: 'high',
    });
  }

  if (chatCount === 0) {
    queue.push({
      id: 'start-first-analysis-chat',
      title: 'Run your first analysis',
      description: 'Ask Vasthu AI to screen a market and suggest next best moves.',
      ctaLabel: 'Start analysis',
      target: 'chat',
      urgency: 'medium',
    });
  } else {
    queue.push({
      id: 'continue-analysis',
      title: 'Continue active analysis',
      description: 'Pick up your latest conversation and move it toward a decision.',
      ctaLabel: 'Open chat',
      target: 'chat',
      urgency: 'low',
    });
  }

  if (queue.length === 0) {
    queue.push({
      id: 'default-next-step',
      title: 'Start your next investment cycle',
      description: 'Use quick actions to source, evaluate, and compare fresh opportunities.',
      ctaLabel: 'Start analysis',
      target: 'chat',
      urgency: 'low',
    });
  }

  const seen = new Set<string>();
  const deduped = queue.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });

  return deduped
    .sort((a, b) => URGENCY_SCORE[b.urgency] - URGENCY_SCORE[a.urgency])
    .slice(0, 5);
}
