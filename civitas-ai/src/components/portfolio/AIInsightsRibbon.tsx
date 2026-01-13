import React from 'react';

interface AIInsight {
    text: string;
    severity: 'info' | 'warning' | 'success';
}

interface AIInsightsRibbonProps {
    insights: AIInsight[];
    onInsightClick?: (insight: string) => void;
}

export const AIInsightsRibbon: React.FC<AIInsightsRibbonProps> = ({ insights, onInsightClick }) => {
    if (insights.length === 0) return null;

    const getSeverityIcon = (severity: string) => {
        switch (severity) {
            case 'warning':
                return '⚠️';
            case 'success':
                return '✅';
            default:
                return '💡';
        }
    };

    return (
        <div
            className="relative p-4 rounded-lg mt-6 cursor-pointer transition-all duration-200"
            style={{
                background: 'var(--color-bg-elevated)',
                border: '1px solid var(--color-border-default)',
                borderLeft: '3px solid var(--color-accent-teal-500)',
                fontFamily: "'Inter', sans-serif"
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-border-emphasis)';
                e.currentTarget.style.borderLeftColor = 'var(--color-accent-teal-400)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-border-default)';
                e.currentTarget.style.borderLeftColor = 'var(--color-accent-teal-500)';
            }}
        >
            {/* Header */}
            <div className="flex items-center gap-2 mb-3">
                <div
                    className="w-2 h-2 rounded-full"
                    style={{ background: 'var(--color-accent-teal-400)' }}
                />
                <span
                    className="text-sm font-medium"
                    style={{ color: 'var(--color-accent-teal-400)' }}
                >
                    AI Insights
                </span>
            </div>

            {/* Insights List */}
            <div className="space-y-2">
                {insights.slice(0, 3).map((insight, index) => (
                    <button
                        key={index}
                        onClick={() => onInsightClick?.(insight.text)}
                        className="flex items-start gap-2 text-left w-full hover:opacity-80 transition-opacity"
                        style={{ fontWeight: 300 }}
                    >
                        <span className="flex-shrink-0 mt-0.5">{getSeverityIcon(insight.severity)}</span>
                        <span
                            className="text-sm leading-relaxed"
                            style={{ color: 'var(--color-text-secondary)' }}
                        >
                            {insight.text}
                        </span>
                    </button>
                ))}
            </div>

            {/* Subtle hint */}
            {insights.length > 3 && (
                <div
                    className="mt-3 pt-3 text-xs"
                    style={{
                        borderTop: '1px solid var(--color-border-default)',
                        color: 'var(--color-text-tertiary)'
                    }}
                >
                    +{insights.length - 3} more insights
                </div>
            )}
        </div>
    );
};
