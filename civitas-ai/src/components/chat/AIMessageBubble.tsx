// FILE: src/components/chat/AIMessageBubble.tsx
/**
 * AI Message Component with Avatar and Human-Readable Analysis
 * Generates natural language summaries from thinking pipeline data
 */

import React, { useState, useMemo } from 'react';
import { Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import type { ThinkingState, CompletedTool } from '../../types/stream';

interface AIMessageBubbleProps {
    content: string;
    thinkingData?: {
        thinking: ThinkingState | null;
        completedTools: CompletedTool[];
    };
    isStreaming?: boolean;
    onCopy?: () => void;
    onFeedback?: (type: 'positive' | 'negative') => void;
}

/**
 * Generate human-readable summary from thinking data
 */
function generateAnalysisSummary(completedTools: CompletedTool[]): string {
    if (!completedTools || completedTools.length === 0) {
        return "I processed your request using my knowledge base";
    }

    const sources: string[] = [];
    const actions: string[] = [];

    completedTools.forEach(tool => {
        const name = tool.tool.toLowerCase();

        // Map tool names to human-readable sources/actions
        if (name.includes('search') || name.includes('knowledge')) {
            sources.push('knowledge base');
        }
        if (name.includes('portfolio') || name.includes('property')) {
            sources.push('your portfolio data');
        }
        if (name.includes('market') || name.includes('analyze')) {
            sources.push('market analysis');
        }
        if (name.includes('calculate') || name.includes('metric')) {
            actions.push('calculated key metrics');
        }
        if (name.includes('report') || name.includes('generate')) {
            actions.push('generated analysis');
        }
    });

    // Remove duplicates
    const uniqueSources = [...new Set(sources)];
    const uniqueActions = [...new Set(actions)];

    // Build natural language summary
    let summary = "I ";

    if (uniqueActions.length > 0) {
        summary += uniqueActions.join(' and ');
    } else {
        summary += "analyzed your request";
    }

    if (uniqueSources.length > 0) {
        summary += ` using ${uniqueSources.join(', ')}`;
    }

    return summary;
}

/**
 * Generate full human-readable analysis
 */
function generateFullAnalysis(completedTools: CompletedTool[]): {
    overview: string;
    steps: string[];
    reasoning?: string;
} {
    if (!completedTools || completedTools.length === 0) {
        return {
            overview: "I processed this request using my built-in knowledge and reasoning capabilities.",
            steps: []
        };
    }

    const steps: string[] = [];
    let hasUserContext = false;
    let hasKnowledgeBase = false;
    let hasAnalysis = false;

    completedTools.forEach(tool => {
        const name = tool.tool.toLowerCase();

        if (name.includes('search') || name.includes('knowledge')) {
            hasKnowledgeBase = true;
            steps.push("Searched my knowledge base for relevant information");
        }
        if (name.includes('portfolio') || name.includes('property')) {
            hasUserContext = true;
            steps.push("Retrieved your portfolio and property data");
        }
        if (name.includes('market')) {
            steps.push("Analyzed current market conditions and trends");
        }
        if (name.includes('calculate')) {
            hasAnalysis = true;
            steps.push("Calculated financial metrics and projections");
        }
        if (name.includes('report')) {
            steps.push("Generated detailed analysis report");
        }
    });

    // Generate overview based on what was used
    let overview = "I approached this by ";
    const sources = [];
    if (hasUserContext) sources.push("your specific context");
    if (hasKnowledgeBase) sources.push("my knowledge base");
    if (hasAnalysis) sources.push("quantitative analysis");

    overview += sources.join(', ');
    overview += ". ";

    // Add context about sources
    const reasoning = `This analysis combines ${sources.join(' with ')} to provide a comprehensive answer tailored to your situation.`;

    return {
        overview,
        steps: steps.length > 0 ? steps : ["Processed your request using AI reasoning"],
        reasoning
    };
}

export const AIMessageBubble: React.FC<AIMessageBubbleProps> = ({
    content,
    thinkingData,
    isStreaming = false,
    onCopy,
    onFeedback
}) => {
    const [isAnalysisExpanded, setIsAnalysisExpanded] = useState(false);

    // Generate analysis from thinking data
    const analysis = useMemo(() => {
        if (!thinkingData?.completedTools) return null;

        return {
            short: generateAnalysisSummary(thinkingData.completedTools),
            full: generateFullAnalysis(thinkingData.completedTools)
        };
    }, [thinkingData]);

    const hasAnalysis = analysis && thinkingData?.completedTools && thinkingData.completedTools.length > 0;

    return (
        <div
            className="flex gap-3 w-full"
            style={{
                marginBottom: '24px',
                fontFamily: "'Inter', sans-serif"
            }}
        >
            {/* Avatar */}
            <div
                className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
                style={{
                    background: 'var(--color-accent-teal-500)',
                    animation: isStreaming ? 'pulse 2s ease-in-out infinite' : 'none'
                }}
            >
                <Sparkles className="w-5 h-5" style={{ color: 'var(--color-bg-primary)' }} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                {/* Message */}
                <div
                    className="prose prose-invert max-w-none"
                    style={{
                        color: 'var(--color-text-primary)',
                        fontSize: '15px',
                        lineHeight: '1.6'
                    }}
                >
                    <ReactMarkdown>{content}</ReactMarkdown>
                </div>

                {/* Analysis Section - GPT-o1 Minimal Style */}
                {hasAnalysis && analysis && (
                    <div className="py-2 mt-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                        <button
                            onClick={() => setIsAnalysisExpanded(!isAnalysisExpanded)}
                            className="flex items-center gap-2 text-sm hover:opacity-80 transition-opacity"
                            style={{
                                color: '#9ca3af', // gray-400
                                background: 'none',
                                border: 'none',
                                padding: '4px 0',
                                cursor: 'pointer'
                            }}
                        >
                            <span>🧠</span>
                            <span>Thought process</span>
                            {isAnalysisExpanded ? (
                                <ChevronUp className="w-3.5 h-3.5" />
                            ) : (
                                <ChevronDown className="w-3.5 h-3.5" />
                            )}
                        </button>

                        {/* Expanded Analysis */}
                        {isAnalysisExpanded && (
                            <div
                                className="mt-2 ml-7 space-y-2 text-sm"
                                style={{ color: '#9ca3af' }} // gray-400
                            >
                                {analysis.full.steps.map((step, i) => (
                                    <div key={i}>• {step}</div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <div
                className="flex items-center gap-2 mt-3"
                style={{ fontSize: '13px' }}
            >
                <button
                    onClick={onCopy}
                    className="px-3 py-1.5 rounded transition-colors"
                    style={{
                        background: 'var(--color-bg-tertiary)',
                        border: '1px solid var(--color-border-default)',
                        color: 'var(--color-text-tertiary)'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.color = 'var(--color-text-primary)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'var(--color-text-tertiary)';
                    }}
                >
                    Copy
                </button>
                <button
                    onClick={() => onFeedback?.('positive')}
                    className="px-2 py-1.5 rounded transition-colors"
                    style={{
                        background: 'transparent',
                        border: '1px solid var(--color-border-default)',
                        color: 'var(--color-text-tertiary)'
                    }}
                    title="Good response"
                >
                    👍
                </button>
                <button
                    onClick={() => onFeedback?.('negative')}
                    className="px-2 py-1.5 rounded transition-colors"
                    style={{
                        background: 'transparent',
                        border: '1px solid var(--color-border-default)',
                        color: 'var(--color-text-tertiary)'
                    }}
                    title="Bad response"
                >
                    👎
                </button>
            </div>
        </div>
    );
};
