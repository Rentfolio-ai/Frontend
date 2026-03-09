import { useState } from 'react';
import { Sparkles, SquarePen, X, Plus, ArrowUp, BarChart2, FileText, Search, Expand } from 'lucide-react';
import { AgentAvatarSvg } from './AgentAvatarSvg';
import { ModelSelector } from '../chat/ModelSelector';
import type { ModelInfo } from '../../types/chat';

const MOCK_MODELS: ModelInfo[] = [
    { id: 'auto', name: 'Auto', provider: 'auto', description: 'Best model for the task', context_window: 128000, accessible: true, tier: 'free' },
    { id: 'claude-3-5-sonnet', name: 'Sonnet 3.5', provider: 'anthropic', description: 'Advanced reasoning', context_window: 200000, accessible: true, tier: 'pro' },
    { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai', description: 'Fast and smart', context_window: 128000, accessible: true, tier: 'pro' },
    { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', provider: 'google', description: 'Google flagship', context_window: 2000000, accessible: true, tier: 'pro' },
];

export const FloatingAIPanelMockup = () => {
    const [input, setInput] = useState('');
    const [selectedModel, setSelectedModel] = useState('auto');

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-8 font-sans bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] relative overflow-hidden">

            {/* Dynamic Background Orbs to highlight the Glassmorphism */}
            <div className="absolute top-1/4 left-1/4 w-[40vw] h-[40vw] bg-[#C08B5C]/10 rounded-full blur-[120px] mix-blend-screen animate-pulse pointer-events-none"></div>
            <div className="absolute bottom-1/4 right-1/4 w-[30vw] h-[30vw] bg-[#3b82f6]/10 rounded-full blur-[100px] mix-blend-screen pointer-events-none"></div>

            <div className="w-[420px] text-foreground relative z-10">
                {/* 1. Premium Glassmorphic Container */}
                <div className="w-full bg-surface/40 backdrop-blur-3xl rounded-2xl border border-black/[0.10] shadow-[0_24px_60px_-15px_rgba(0,0,0,0.8)] overflow-visible relative flex flex-col h-[650px] ring-1 ring-black/[0.05]">

                    {/* Inner Glare Effect */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-black/[0.08] to-transparent pointer-events-none"></div>

                    {/* Header Top Bar */}
                    <div className="flex items-center justify-between px-5 pt-4 pb-2 relative z-20">
                        <div className="flex items-center gap-2">
                            <span className="text-[14px] font-semibold text-foreground tracking-wide">Civitas AI</span>
                            <span className="px-1.5 py-0.5 rounded-full bg-[#C08B5C]/20 border border-[#C08B5C]/30 text-[#C08B5C] text-[9px] font-bold uppercase tracking-wider">Beta</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground/70">
                            <button className="hover:text-foreground/80 transition-colors rounded p-1 hover:bg-black/5"><SquarePen className="w-4 h-4" /></button>
                            <button className="hover:text-foreground/80 transition-colors rounded p-1 hover:bg-black/5"><Expand className="w-4 h-4" /></button>
                            <button className="hover:text-foreground/80 transition-colors rounded p-1 hover:bg-black/5"><X className="w-4.5 h-4.5" /></button>
                        </div>
                    </div>

                    {/* Empty State Body */}
                    <div className="px-5 pt-8 flex-1 flex flex-col justify-center">
                        {/* Avatar Wrapper */}
                        <div className="flex justify-center mb-6">
                            <div className="relative">
                                <div className="absolute inset-0 bg-[#C08B5C]/20 blur-xl rounded-full"></div>
                                <div className="w-16 h-16 bg-gradient-to-br from-[#1E1E1E] to-[#2A2A2A] rounded-full flex items-center justify-center ring-2 ring-[#C08B5C]/30 relative z-10 shadow-lg">
                                    <AgentAvatarSvg className="w-8 h-8 drop-shadow-md text-[#C08B5C]" />
                                </div>
                            </div>
                        </div>

                        {/* Title */}
                        <h2 className="text-[22px] font-semibold text-center text-foreground tracking-tight mb-8">
                            How can I help you today?
                        </h2>

                        {/* 2x2 Grid Quick Actions */}
                        <div className="grid grid-cols-2 gap-3 mb-4 relative z-20">
                            <button className="flex flex-col items-start gap-2.5 p-3.5 rounded-xl bg-gradient-to-br from-black/[0.05] to-black/[0.01] hover:from-black/[0.08] hover:to-black/[0.03] border border-black/[0.08] hover:border-[#C08B5C]/50 hover:shadow-[0_0_15px_rgba(192,139,92,0.1)] transition-all group text-left">
                                <Sparkles className="w-4.5 h-4.5 text-[#C08B5C] group-hover:scale-110 transition-transform" />
                                <span className="text-[13px] font-medium text-foreground/80 group-hover:text-foreground leading-tight">Scout off-market</span>
                            </button>
                            <button className="flex flex-col items-start gap-2.5 p-3.5 rounded-xl bg-gradient-to-br from-black/[0.05] to-black/[0.01] hover:from-black/[0.08] hover:to-black/[0.03] border border-black/[0.08] hover:border-[#3b82f6]/50 hover:shadow-[0_0_15px_rgba(59,130,246,0.1)] transition-all group text-left">
                                <Search className="w-4.5 h-4.5 text-[#3b82f6] group-hover:scale-110 transition-transform" />
                                <span className="text-[13px] font-medium text-foreground/80 group-hover:text-foreground leading-tight">Search marketplace</span>
                            </button>
                            <button className="flex flex-col items-start gap-2.5 p-3.5 rounded-xl bg-gradient-to-br from-black/[0.05] to-black/[0.01] hover:from-black/[0.08] hover:to-black/[0.03] border border-black/[0.08] hover:border-[#10b981]/50 hover:shadow-[0_0_15px_rgba(16,185,129,0.1)] transition-all group text-left">
                                <BarChart2 className="w-4.5 h-4.5 text-[#10b981] group-hover:scale-110 transition-transform" />
                                <span className="text-[13px] font-medium text-foreground/80 group-hover:text-foreground leading-tight">Analyze properties</span>
                            </button>
                            <button className="flex flex-col items-start gap-2.5 p-3.5 rounded-xl bg-gradient-to-br from-black/[0.05] to-black/[0.01] hover:from-black/[0.08] hover:to-black/[0.03] border border-black/[0.08] hover:border-[#8b5cf6]/50 hover:shadow-[0_0_15px_rgba(139,92,246,0.1)] transition-all group text-left">
                                <FileText className="w-4.5 h-4.5 text-[#8b5cf6] group-hover:scale-110 transition-transform" />
                                <span className="text-[13px] font-medium text-foreground/80 group-hover:text-foreground leading-tight">Draft outreach</span>
                            </button>
                        </div>
                    </div>

                    {/* Input Bar */}
                    <div className="p-4 pt-0 relative z-20">
                        <div className="bg-background/60 backdrop-blur-md border border-black/[0.10] focus-within:border-[#C08B5C]/50 focus-within:ring-1 focus-within:ring-[#C08B5C]/30 rounded-xl flex flex-col transition-all shadow-inner">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Do anything with AI..."
                                className="w-full bg-transparent border-none outline-none px-4 py-3.5 text-[14px] text-foreground placeholder:text-muted-foreground/50"
                            />

                            {/* Accessory Bar */}
                            <div className="flex items-center justify-between px-3 pb-3">
                                <div className="flex items-center gap-1">
                                    <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-black/8 text-muted-foreground/70 hover:text-foreground/80 transition-colors">
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="flex items-center gap-3">
                                    {/* Implemented Real Model Selector */}
                                    <ModelSelector
                                        models={MOCK_MODELS}
                                        selectedModel={selectedModel}
                                        onModelChange={setSelectedModel}
                                        isPro={true}
                                    />

                                    <button className={`w-7 h-7 flex items-center justify-center rounded-full transition-colors ${input ? 'bg-[#C08B5C] text-white' : 'bg-black/8 text-muted-foreground/50'}`}>
                                        <ArrowUp className="w-4 h-4" strokeWidth={3} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};
export default FloatingAIPanelMockup;
