
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronDown,
    ChevronRight,
    FileText,
    Play,
    Clock,
    ListTodo,
    Lightbulb
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface VoiceSummaryCardProps {
    data: {
        type: 'voice_summary';
        summary: {
            title?: string;
            summary: string;
            key_insights: string[];
            action_items: string[];
            mentioned_properties?: string[];
            mentioned_markets?: string[];
        };
        duration?: number;
        persona?: string;
        voice_note_id?: string;
        transcript?: any[];
    };
}

export const VoiceSummaryCard: React.FC<VoiceSummaryCardProps> = ({ data }) => {
    const { summary, duration, persona, voice_note_id, transcript: initialTranscript } = data;
    const [isTranscriptOpen, setIsTranscriptOpen] = useState(false);
    const [transcript, setTranscript] = useState<any[] | null>(initialTranscript || null);
    const [isLoadingTranscript, setIsLoadingTranscript] = useState(false);

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleToggleTranscript = async () => {
        const nextState = !isTranscriptOpen;
        setIsTranscriptOpen(nextState);

        if (nextState && !transcript && voice_note_id) {
            setIsLoadingTranscript(true);
            try {
                const token = localStorage.getItem('civitas-api-key'); // Or however auth is handled
                const res = await fetch(`${import.meta.env.VITE_DATALAYER_API_URL}/api/voice/notes/${voice_note_id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'X-User-ID': JSON.parse(localStorage.getItem('civitas-user') || '{}')?.id
                    }
                });
                if (res.ok) {
                    const noteData = await res.json();
                    setTranscript(noteData.transcript);
                }
            } catch (e) {
                console.error("Failed to load transcript", e);
            } finally {
                setIsLoadingTranscript(false);
            }
        }
    };

    return (
        <div className="w-full max-w-3xl mx-auto my-6 font-sans antialiased">
            <div className="bg-[#0f0f11] border border-white/[0.06] rounded-xl overflow-hidden shadow-xl shadow-black/80">

                {/* ── Professional Header ── */}
                <div className="px-6 py-5 border-b border-white/[0.06] flex items-start justify-between bg-white/[0.01]">
                    <div className="flex-1 min-w-0 pr-4">
                        <h3 className="text-lg font-medium text-white/95 leading-snug tracking-tight">
                            {summary.title || "Voice Session Insight"}
                        </h3>
                        <div className="flex items-center gap-4 mt-3">
                            <div className="flex items-center gap-1.5 text-white/40 text-xs">
                                <Clock className="w-3.5 h-3.5" />
                                <span className="font-mono text-[11px] tracking-wide opacity-80">
                                    {duration ? formatDuration(duration) : '--:--'}
                                </span>
                            </div>
                            {persona && (
                                <div className="flex items-center gap-1.5 text-white/40 text-xs text-xs px-2 py-0.5 rounded-full bg-white/[0.03] border border-white/[0.04]">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/50" />
                                    <span>{persona}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Play Button - Subtle */}
                    <button className="flex-shrink-0 w-9 h-9 rounded-full bg-white/[0.04] hover:bg-white/[0.08] flex items-center justify-center text-white/50 hover:text-white/90 transition-all border border-white/[0.02] hover:border-white/[0.1]">
                        <Play className="w-3.5 h-3.5 ml-0.5 fill-current" />
                    </button>
                </div>

                <div className="p-6 space-y-8">

                    {/* ── Executive Summary ── */}
                    <div className="space-y-3">
                        <h4 className="text-[11px] font-semibold text-white/30 uppercase tracking-widest pl-0.5">Executive Summary</h4>
                        <div className="prose prose-invert prose-sm max-w-none text-white/80 leading-relaxed text-[14px]">
                            <ReactMarkdown>{summary.summary}</ReactMarkdown>
                        </div>
                    </div>

                    {/* ── Grid Layout for Insights & Actions ── */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
                        {/* ── Key Insights ── */}
                        {summary.key_insights && summary.key_insights.length > 0 && (
                            <div className="space-y-3">
                                <h4 className="flex items-center gap-2 text-[11px] font-semibold text-amber-400/70 uppercase tracking-widest">
                                    <Lightbulb className="w-3 h-3" />
                                    Key Findings
                                </h4>
                                <ul className="space-y-3">
                                    {summary.key_insights.map((insight, i) => (
                                        <li key={i} className="flex gap-3 text-[13px] text-white/70 leading-relaxed group">
                                            <span className="mt-1.5 w-1 h-1 rounded-full bg-amber-500/40 flex-shrink-0 group-hover:bg-amber-400 transition-colors" />
                                            <span>{insight}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* ── Action Items ── */}
                        {summary.action_items && summary.action_items.length > 0 && (
                            <div className="space-y-3">
                                <h4 className="flex items-center gap-2 text-[11px] font-semibold text-blue-400/70 uppercase tracking-widest">
                                    <ListTodo className="w-3 h-3" />
                                    Next Steps
                                </h4>
                                <div className="space-y-2">
                                    {summary.action_items.map((item, i) => (
                                        <div key={i} className="flex gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.02] hover:border-white/[0.05] transition-all group">
                                            <div className="mt-0.5 w-4 h-4 rounded border border-white/20 flex items-center justify-center flex-shrink-0 group-hover:border-blue-500/50 transition-colors">
                                                <div className="w-2 h-2 rounded-[1px] bg-transparent group-hover:bg-blue-500/80 transition-colors opacity-0 group-hover:opacity-100" />
                                            </div>
                                            <span className="text-[13px] text-white/80 leading-snug">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Professional Transcript ── */}
                <div className="border-t border-white/[0.06] bg-[#0c0c0e]">
                    <button
                        onClick={handleToggleTranscript}
                        className="w-full flex items-center justify-between px-6 py-3 text-xs font-medium text-white/40 hover:text-white/80 hover:bg-white/[0.02] transition-all group"
                    >
                        <div className="flex items-center gap-2 group-hover:text-indigo-300/80 transition-colors">
                            <FileText className="w-3.5 h-3.5" />
                            <span className="tracking-wide uppercase text-[11px] font-semibold">
                                {isTranscriptOpen ? 'Hide Transcript' : 'Review Transcript'}
                            </span>
                        </div>
                        {isTranscriptOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                    </button>

                    <AnimatePresence>
                        {isTranscriptOpen && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="px-6 pb-6 pt-2 space-y-5 max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                                    <div className="h-px w-full bg-gradient-to-r from-transparent via-white/[0.06] to-transparent mb-4" />

                                    {isLoadingTranscript ? (
                                        <div className="flex items-center justify-center py-8 text-white/30 gap-2">
                                            <div className="w-4 h-4 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
                                            <span className="text-xs">Retrieving session data...</span>
                                        </div>
                                    ) : transcript ? (
                                        transcript.map((turn, i) => (
                                            <div key={i} className="flex gap-4 group">
                                                {/* Left: Time & Speaker */}
                                                <div className="w-24 flex-shrink-0 text-right space-y-0.5 pt-0.5">
                                                    <div className={`text-[11px] font-semibold tracking-wide uppercase ${turn.role === 'user' ? 'text-blue-400/80' : 'text-emerald-400/80'}`}>
                                                        {turn.role === 'user' ? 'You' : (persona || 'AI')}
                                                    </div>
                                                    <div className="text-[10px] font-mono text-white/20 group-hover:text-white/30 transition-colors">
                                                        {turn.timestamp ? new Date(turn.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }) : ''}
                                                    </div>
                                                </div>

                                                {/* Right: Content */}
                                                <div className="flex-1 pb-2 border-b border-white/[0.02] group-last:border-0">
                                                    <p className="text-[13px] text-white/80 leading-[1.6]">
                                                        {turn.content}
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="py-6 text-center text-white/20 text-xs italic">Transcript data unavailable for this session.</div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};
