// FILE: src/components/portfolio/AIRecommendationsPanel.tsx
/**
 * AI Recommendations Panel - Displays optimization recommendations
 * Actionable cards with priority indicators and type badges
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    TrendingDown,
    TrendingUp,
    RefreshCw,
    Hammer,
    DollarSign,
    Shuffle,
    ArrowRight,
    Sparkles,
    AlertTriangle,
    Lightbulb,
    Target,
} from 'lucide-react';
import type { Recommendation, RecommendationType, RecommendationPriority, PropertySuggestion } from '../../types/portfolio';

interface AIRecommendationsPanelProps {
    recommendations: Recommendation[];
    nextAcquisition?: PropertySuggestion | null;
    summary?: string;
    loading?: boolean;
    onRecommendationClick?: (recommendation: Recommendation) => void;
    onViewAll?: () => void;
}

const typeConfig: Record<RecommendationType, { icon: React.ReactNode; color: string; label: string }> = {
    sell: { icon: <TrendingDown className="w-4 h-4" />, color: 'text-red-400 bg-red-500/20', label: 'Sell' },
    buy: { icon: <TrendingUp className="w-4 h-4" />, color: 'text-green-400 bg-green-500/20', label: 'Buy' },
    hold: { icon: <Target className="w-4 h-4" />, color: 'text-blue-400 bg-blue-500/20', label: 'Hold' },
    improve: { icon: <Hammer className="w-4 h-4" />, color: 'text-amber-400 bg-amber-500/20', label: 'Improve' },
    refinance: { icon: <RefreshCw className="w-4 h-4" />, color: 'text-purple-400 bg-purple-500/20', label: 'Refinance' },
    diversify: { icon: <Shuffle className="w-4 h-4" />, color: 'text-cyan-400 bg-cyan-500/20', label: 'Diversify' },
};

const priorityConfig: Record<RecommendationPriority, { color: string; dot: string }> = {
    urgent: { color: 'border-l-red-500', dot: 'bg-red-500' },
    high: { color: 'border-l-orange-500', dot: 'bg-orange-500' },
    medium: { color: 'border-l-yellow-500', dot: 'bg-yellow-500' },
    low: { color: 'border-l-blue-500', dot: 'bg-blue-500' },
};

const RecommendationCard: React.FC<{
    recommendation: Recommendation;
    onClick?: () => void;
    index: number;
}> = ({ recommendation, onClick, index }) => {
    const typeInfo = typeConfig[recommendation.type];
    const priorityInfo = priorityConfig[recommendation.priority];

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={onClick}
            className={`bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-4 border-l-4 ${priorityInfo.color} cursor-pointer hover:bg-white/10 transition-all group`}
        >
            <div className="flex items-start gap-3">
                {/* Type Badge */}
                <div className={`p-2 rounded-lg ${typeInfo.color}`}>
                    {typeInfo.icon}
                </div>

                <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${typeInfo.color}`}>
                            {typeInfo.label}
                        </span>
                        <span className="text-xs text-slate-500 capitalize">{recommendation.priority}</span>
                        <span className={`w-2 h-2 rounded-full ${priorityInfo.dot}`} />
                    </div>

                    {/* Title */}
                    <h4 className="text-sm font-medium text-white mb-1 line-clamp-1">
                        {recommendation.title}
                    </h4>

                    {/* Description */}
                    <p className="text-xs text-slate-400 line-clamp-2">
                        {recommendation.description}
                    </p>

                    {/* Expected Impact */}
                    {recommendation.expected_impact && (
                        <div className="mt-2 flex items-center gap-1 text-xs text-teal-400">
                            <DollarSign className="w-3 h-3" />
                            <span>{recommendation.expected_impact}</span>
                        </div>
                    )}
                </div>

                {/* Arrow */}
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-teal-400 transition-colors flex-shrink-0" />
            </div>
        </motion.div>
    );
};

const NextAcquisitionCard: React.FC<{ suggestion: PropertySuggestion }> = ({ suggestion }) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-teal-500/20 to-cyan-500/20 backdrop-blur-sm rounded-lg border border-teal-500/30 p-4"
    >
        <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-teal-500/30 text-teal-400">
                <Lightbulb className="w-5 h-5" />
            </div>
            <div className="flex-1">
                <h4 className="text-sm font-medium text-teal-300 mb-1">Next Acquisition Suggestion</h4>
                <p className="text-xs text-slate-300 mb-2">
                    Consider a <span className="font-medium text-white">{suggestion.strategy}</span> property in{' '}
                    <span className="font-medium text-white">{suggestion.market}</span>
                </p>
                <div className="flex flex-wrap gap-3 text-xs text-slate-400">
                    <span>
                        💰 ${suggestion.price_range.min.toLocaleString()} - ${suggestion.price_range.max.toLocaleString()}
                    </span>
                    <span>📈 {suggestion.expected_cap_rate}% cap rate</span>
                    <span>💵 +${suggestion.expected_cash_flow}/mo</span>
                </div>
                <p className="mt-2 text-xs text-slate-500">{suggestion.reasoning}</p>
            </div>
        </div>
    </motion.div>
);

export const AIRecommendationsPanel: React.FC<AIRecommendationsPanelProps> = ({
    recommendations,
    nextAcquisition,
    summary,
    loading = false,
    onRecommendationClick,
    onViewAll,
}) => {
    if (loading) {
        return (
            <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5 text-teal-400 animate-pulse" />
                    <span className="text-white font-medium">Analyzing portfolio...</span>
                </div>
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-20 bg-white/5 rounded-lg animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    if (recommendations.length === 0 && !nextAcquisition) {
        return (
            <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
                <div className="text-center text-slate-400">
                    <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No recommendations available</p>
                    <p className="text-sm opacity-70">Your portfolio is well-optimized!</p>
                </div>
            </div>
        );
    }

    const urgentCount = recommendations.filter(r => r.priority === 'urgent').length;
    // const highCount = recommendations.filter(r => r.priority === 'high').length;

    return (
        <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm rounded-xl border border-white/10 p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-teal-400" />
                    <h3 className="text-lg font-semibold text-white">AI Recommendations</h3>
                    {urgentCount > 0 && (
                        <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400">
                            <AlertTriangle className="w-3 h-3" />
                            {urgentCount} urgent
                        </span>
                    )}
                </div>
                {onViewAll && recommendations.length > 5 && (
                    <button
                        onClick={onViewAll}
                        className="text-sm text-teal-400 hover:text-teal-300 transition-colors"
                    >
                        View All ({recommendations.length})
                    </button>
                )}
            </div>

            {/* Summary */}
            {summary && (
                <p className="text-sm text-slate-300 mb-4 p-3 bg-white/5 rounded-lg">
                    {summary}
                </p>
            )}

            {/* Recommendations List */}
            <AnimatePresence>
                <div className="space-y-3 mb-4">
                    {recommendations.slice(0, 5).map((rec, idx) => (
                        <RecommendationCard
                            key={`${rec.type}-${rec.title}-${idx}`}
                            recommendation={rec}
                            index={idx}
                            onClick={() => onRecommendationClick?.(rec)}
                        />
                    ))}
                </div>
            </AnimatePresence>

            {/* Next Acquisition */}
            {nextAcquisition && <NextAcquisitionCard suggestion={nextAcquisition} />}
        </div>
    );
};

export default AIRecommendationsPanel;
