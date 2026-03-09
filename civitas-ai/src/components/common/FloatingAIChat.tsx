import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, X, ArrowUp, SquarePen, Search, Expand, BarChart2, Mail } from 'lucide-react';
import { MessageList } from '../chat/MessageList';
import { ModelSelector } from '../chat/ModelSelector';
import type { Message, PageContextData } from '../../types/chat';
import type { ThinkingState, CompletedTool } from '../../types/stream';
import type { ThinkingStep } from '@/hooks/useThinkingQueue';
import { AVAILABLE_MODELS, modelSupportsThinking } from '../../constants/models';

const COMPACT_MODELS = AVAILABLE_MODELS.filter(m =>
    ['auto', 'gpt-4o', 'claude-sonnet-4.5', 'gemini-2.5-flash'].includes(m.id)
);

interface FloatingAIChatProps {
    onExpandToFullChat: (initialQuery?: string) => void;
    pageContext?: PageContextData;
    messages: Message[];
    isStreaming: boolean;
    thinking: ThinkingState | null;
    error: string | null;
    selectedModel: string;
    onModelChange: (modelId: string) => void;
    onSendMessage: (message: string, options?: any, extra?: { propertyContext?: any; hidePropertyCard?: boolean; pageContext?: any }) => void;
    onNewChat: () => void;
    // Full thinking pipeline (parity with main chat)
    completedTools?: CompletedTool[];
    thinkingSteps?: ThinkingStep[];
    thinkingIsActive?: boolean;
    thinkingIsDone?: boolean;
    thinkingElapsed?: number;
    nativeThinkingText?: string | null;
    reasoningText?: string | null;
    onAction?: (actionValue: string, actionContext?: any) => void;
}

type Suggestion = { label: string; icon: typeof BarChart2; query: string };

const PAGE_SUGGESTIONS: Record<string, Suggestion[]> = {
    home: [
        { label: 'Summarize my pipeline', icon: BarChart2, query: 'Summarize my current investment pipeline and deal status' },
        { label: 'What deals need attention?', icon: Search, query: 'Which deals in my pipeline need immediate attention?' },
        { label: 'Draft a follow-up email', icon: Mail, query: 'Draft a follow-up email to a property owner' },
    ],
    deals: [
        { label: 'Analyze this deal', icon: BarChart2, query: 'Analyze the deal I\'m currently looking at' },
        { label: 'Compare my saved properties', icon: Search, query: 'Compare my saved properties side by side' },
        { label: 'Draft an offer email', icon: Mail, query: 'Draft an offer email for this property' },
    ],
    portfolio: [
        { label: 'How is my portfolio performing?', icon: BarChart2, query: 'How is my investment portfolio performing overall?' },
        { label: 'Which property has best ROI?', icon: Search, query: 'Which property in my portfolio has the best ROI?' },
        { label: 'Suggest portfolio improvements', icon: Sparkles, query: 'What improvements would you suggest for my portfolio strategy?' },
    ],
    marketplace: [
        { label: 'Find me off-market deals', icon: Search, query: 'Help me find off-market deals in my target markets' },
        { label: 'What\'s trending?', icon: BarChart2, query: 'What are the current real estate market trends in my areas?' },
        { label: 'Filter by cash flow', icon: Sparkles, query: 'Show me properties with the best cash flow potential' },
    ],
    reports: [
        { label: 'Summarize my latest report', icon: BarChart2, query: 'Summarize the findings from my most recent report' },
        { label: 'Generate a new report', icon: Sparkles, query: 'Generate a comprehensive investment report for my top deal' },
        { label: 'Compare report insights', icon: Search, query: 'Compare insights across my recent reports' },
    ],
    teams: [
        { label: 'Draft a follow-up email', icon: Mail, query: 'Draft a follow-up email to my investment partner' },
        { label: 'Who should I contact next?', icon: Search, query: 'Based on my deals, who should I reach out to next?' },
        { label: 'Summarize team activity', icon: BarChart2, query: 'Summarize recent team activity and communications' },
    ],
};

const DEFAULT_SUGGESTIONS = PAGE_SUGGESTIONS.home;

export const FloatingAIChat: React.FC<FloatingAIChatProps> = ({
    onExpandToFullChat,
    pageContext,
    messages,
    isStreaming,
    thinking,
    error,
    selectedModel,
    onModelChange,
    onSendMessage,
    onNewChat,
    completedTools,
    thinkingSteps,
    thinkingIsActive,
    thinkingIsDone,
    thinkingElapsed,
    nativeThinkingText,
    reasoningText,
    onAction,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [inputMessage, setInputMessage] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    const handleSubmit = (e?: React.FormEvent, presetQuery?: string) => {
        if (e) e.preventDefault();
        const query = presetQuery || inputMessage.trim();
        if (!query || isStreaming) return;
        setInputMessage('');
        // Pass pageContext for backend context injection, but hide the visual card
        onSendMessage(query, undefined, { pageContext, hidePropertyCard: true });
    };

    const activeModelLabel = COMPACT_MODELS.find(m => m.id === selectedModel)?.name || 'Auto';
    const showEmptyState = messages.length === 0 && !isStreaming;

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">

            {/* Floating Action Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="group flex items-center justify-center w-12 h-12 rounded-full bg-[#C08B5C] shadow-lg hover:shadow-[0_4px_20px_rgba(192,139,92,0.4)] transition-all hover:-translate-y-0.5 hover:scale-105"
                >
                    <Sparkles className="w-5 h-5 text-white transition-transform group-hover:scale-110" />
                </button>
            )}

            {/* Panel */}
            {isOpen && (
                <div className="w-[400px] max-h-[520px] h-[calc(100vh-120px)] bg-surface rounded-xl border border-black/[0.08] shadow-[0_8px_24px_rgba(0,0,0,0.4)] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-200">

                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-black/[0.06]">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-[#C08B5C]" />
                            <span className="text-[14px] font-medium text-foreground">Civitas AI</span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground/60">
                            <button onClick={onNewChat} className="hover:text-foreground/70 transition-colors rounded-md p-1.5 hover:bg-black/[0.03]" title="New Chat">
                                <SquarePen className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => onExpandToFullChat(inputMessage)} className="hover:text-foreground/70 transition-colors rounded-md p-1.5 hover:bg-black/[0.03]" title="Expand">
                                <Expand className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => setIsOpen(false)} className="hover:text-foreground/70 transition-colors rounded-md p-1.5 hover:bg-black/[0.03]">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="flex-1 overflow-y-auto">
                        {showEmptyState ? (
                            <div className="flex flex-col items-center justify-center h-full px-6">
                                {/* Greeting */}
                                <h2 className="text-[20px] font-semibold text-foreground tracking-tight mb-3">
                                    How can I help?
                                </h2>

                                {/* Suggestions */}
                                <div className="w-full space-y-1 mt-2">
                                    {(PAGE_SUGGESTIONS[pageContext?.page || ''] || DEFAULT_SUGGESTIONS).map((s, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleSubmit(undefined, s.query)}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left hover:bg-black/[0.03] transition-colors group"
                                        >
                                            <s.icon className="w-4 h-4 text-muted-foreground/50 group-hover:text-muted-foreground/70 transition-colors flex-shrink-0" />
                                            <span className="text-[13px] text-muted-foreground group-hover:text-foreground/75 transition-colors">{s.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            /* Active Chat — MessageList for full rendering parity */
                            <MessageList
                                messages={messages}
                                isLoading={isStreaming}
                                thinking={thinking}
                                completedTools={completedTools}
                                thinkingSteps={thinkingSteps}
                                thinkingIsActive={thinkingIsActive}
                                thinkingIsDone={thinkingIsDone}
                                thinkingElapsed={thinkingElapsed}
                                nativeThinkingText={nativeThinkingText}
                                reasoningText={reasoningText}
                                hasThinkingModel={modelSupportsThinking(selectedModel)}
                                activeModel={activeModelLabel}
                                error={typeof error === 'string' ? error : null}
                                onAction={onAction}
                            />
                        )}
                    </div>

                    {/* Input */}
                    <div className="p-3 pt-2 mt-auto">
                        <form onSubmit={handleSubmit} className="bg-muted rounded-xl border border-black/[0.06] focus-within:border-black/[0.10] transition-colors flex flex-col">
                            <input
                                ref={inputRef}
                                type="text"
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                placeholder="Ask Civitas AI anything..."
                                className="w-full bg-transparent border-none outline-none px-3.5 py-2.5 text-[13px] text-foreground/85 placeholder:text-muted-foreground/50"
                                disabled={isStreaming}
                            />
                            {/* Accessory row */}
                            <div className="flex items-center justify-between px-2 pb-2">
                                <ModelSelector
                                    models={COMPACT_MODELS}
                                    selectedModel={selectedModel}
                                    onModelChange={onModelChange}
                                    isPro={true}
                                    dropdownAlign="right"
                                />
                                <button
                                    type="submit"
                                    disabled={!inputMessage.trim() || isStreaming}
                                    className={`w-7 h-7 flex items-center justify-center rounded-full flex-shrink-0 transition-all duration-200 ${inputMessage.trim() ? 'bg-[#C08B5C] text-white' : 'bg-black/[0.05] text-muted-foreground/50'}`}
                                >
                                    <ArrowUp className="w-3.5 h-3.5" strokeWidth={2.5} />
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
