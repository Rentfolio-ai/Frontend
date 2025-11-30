import React from 'react';
import { Sparkles, Lightbulb, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { cn } from '../../lib/utils';
import type {
  PresentationBundle,
  PresentationKPI,
  PresentationInsight,
  TrendDirection,
  Sentiment,
} from '../../types/pnl';
import { MarkdownRenderer } from './MarkdownRenderer';

const sentimentClasses: Record<Sentiment | 'neutral', string> = {
  positive: 'text-success',
  negative: 'text-danger',
  neutral: 'text-foreground',
};

const sentimentBgClasses: Record<Sentiment | 'neutral', string> = {
  positive: 'bg-success/10 border-success/30',
  negative: 'bg-danger/10 border-danger/30',
  neutral: 'bg-muted/50 border-border/50',
};

const trendIconMap: Record<TrendDirection, React.ReactNode> = {
  up: <ArrowUpRight className="w-3.5 h-3.5" />,
  down: <ArrowDownRight className="w-3.5 h-3.5" />,
  flat: <Minus className="w-3.5 h-3.5" />,
};

const isNegativeCashflowInsight = (insight: PresentationInsight) =>
  insight.sentiment === 'negative' && /cash[-\s]?flow/i.test(insight.text);

export const hasNegativeCashflowInsight = (presentation?: PresentationBundle): boolean =>
  Boolean(presentation?.insights?.some(isNegativeCashflowInsight));

interface PresentationSummaryProps {
  presentation: PresentationBundle;
  variant?: 'default' | 'compact';
  maxKpis?: number;
  showInsights?: boolean;
  className?: string;
}

export const PresentationSummary: React.FC<PresentationSummaryProps> = ({
  presentation,
  variant = 'default',
  maxKpis,
  showInsights = true,
  className,
}) => {
  const { headline, markdown, kpis = [], insights = [] } = presentation;
  const limitedKpis = typeof maxKpis === 'number' ? kpis.slice(0, maxKpis) : kpis;
  const negativeCashflow = hasNegativeCashflowInsight(presentation);
  const containerClasses = variant === 'compact'
    ? 'rounded-2xl border border-border/60 bg-background shadow-sm space-y-4 p-4'
    : 'p-5 rounded-2xl border border-border/60 bg-gradient-to-br from-primary/5 via-transparent to-teal-500/5 space-y-5';

  return (
    <div className={cn(containerClasses, className)}>
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-foreground/70">
          <Sparkles className="w-4 h-4 text-primary" />
          AI Deal Brief
          {negativeCashflow && (
            <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-danger/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-danger">
              Negative Cashflow
            </span>
          )}
        </div>
        {headline && (
          <p className="text-lg font-semibold text-foreground tracking-tight">{headline}</p>
        )}
        {markdown && (
          <MarkdownRenderer content={markdown} className="mt-1" />
        )}
      </div>

      {limitedKpis.length > 0 && (
        <PresentationKPIGrid kpis={limitedKpis} variant={variant} />
      )}

      {showInsights && insights.length > 0 && (
        <PresentationInsightsList insights={insights} />
      )}
    </div>
  );
};

interface PresentationKPIGridProps {
  kpis: PresentationKPI[];
  variant?: 'default' | 'compact';
}

export const PresentationKPIGrid: React.FC<PresentationKPIGridProps> = ({ kpis, variant = 'default' }) => (
  <div className={cn('grid gap-3', variant === 'compact' ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-2 lg:grid-cols-3')}>
    {kpis.map((kpi) => (
      <div
        key={kpi.key}
        className={cn(
          'p-3 rounded-xl border transition-colors duration-200',
          sentimentBgClasses[kpi.sentiment || 'neutral']
        )}
      >
        <div className="flex items-center justify-between text-xs text-foreground/60 uppercase tracking-wider">
          <span>{kpi.label}</span>
          {kpi.trend && <span className="flex items-center gap-1 text-foreground/70">{trendIconMap[kpi.trend]}</span>}
        </div>
        <p className={cn('text-2xl font-semibold mt-1', sentimentClasses[kpi.sentiment || 'neutral'])}>
          {kpi.value}
        </p>
        {kpi.helperText && (
          <p className="text-xs text-foreground/60 mt-0.5">{kpi.helperText}</p>
        )}
      </div>
    ))}
  </div>
);

interface PresentationInsightsListProps {
  insights: PresentationInsight[];
}

export const PresentationInsightsList: React.FC<PresentationInsightsListProps> = ({ insights }) => (
  <div>
    <p className="text-xs font-semibold text-foreground/60 uppercase tracking-wider mb-2 flex items-center gap-1">
      <Lightbulb className="w-3.5 h-3.5" /> Actionable Insights
    </p>
    <div className="space-y-2">
      {insights.slice(0, 4).map((insight) => (
        <div
          key={insight.id}
          className="px-3 py-2 rounded-lg border border-border/40 bg-muted/40 text-sm flex items-start gap-2"
        >
          <span className="mt-1 block w-1.5 h-1.5 rounded-full bg-primary" />
          <p className={sentimentClasses[insight.sentiment || 'neutral']}>{insight.text}</p>
        </div>
      ))}
    </div>
  </div>
);

export default PresentationSummary;
