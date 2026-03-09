/**
 * Contact & Feedback Page
 *
 * Simple form for users to report something broken or share feedback.
 * Backend auto-categorizes, notifies team, and creates a GitHub issue.
 */

import React, { useState } from 'react';
import {
    ArrowLeft,
    Bug,
    ThumbsDown,
    Send,
    Loader2,
    CheckCircle2,
    AlertTriangle,
    Frown,
    HelpCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supportApi } from '../../services/supportApi';

interface ContactSupportPageProps {
    onBack: () => void;
}

// ── Reason chips — what the user is filing about ──────────────────────────────

const REASONS = [
    { key: 'broken', label: 'Something is broken', icon: Bug, color: 'text-foreground/70', bg: 'bg-black/[0.04]' },
    { key: 'bad_response', label: 'Bad AI response', icon: ThumbsDown, color: 'text-foreground/70', bg: 'bg-black/[0.04]' },
    { key: 'confusing', label: 'Confusing / hard to use', icon: Frown, color: 'text-foreground/70', bg: 'bg-black/[0.04]' },
    { key: 'other', label: 'Other feedback', icon: HelpCircle, color: 'text-foreground/70', bg: 'bg-black/[0.04]' },
] as const;

type ReasonKey = typeof REASONS[number]['key'];

// Map user-facing reasons to backend categories
const REASON_TO_CATEGORY: Record<ReasonKey, 'bug' | 'general' | 'feature'> = {
    broken: 'bug',
    bad_response: 'bug',
    confusing: 'feature',
    other: 'general',
};

const REASON_TO_PRIORITY: Record<ReasonKey, 'high' | 'medium' | 'low'> = {
    broken: 'high',
    bad_response: 'medium',
    confusing: 'low',
    other: 'low',
};

// ── Component ─────────────────────────────────────────────────────────────────

export const ContactSupportPage: React.FC<ContactSupportPageProps> = ({ onBack }) => {
    const [reason, setReason] = useState<ReasonKey>('broken');
    const [message, setMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) return;

        setSubmitting(true);
        setError(null);

        try {
            const reasonObj = REASONS.find((r) => r.key === reason);
            await supportApi.createTicket({
                category: REASON_TO_CATEGORY[reason],
                subject: `[${reasonObj?.label}] User feedback`,
                description: message.trim(),
                priority: REASON_TO_PRIORITY[reason],
            });
            setSubmitted(true);
            setTimeout(() => {
                setSubmitted(false);
                setMessage('');
                setReason('broken');
            }, 5000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="h-full flex flex-col bg-background">
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-3.5 border-b border-black/[0.08]">
                <button
                    onClick={onBack}
                    className="w-8 h-8 rounded-lg bg-black/[0.04] hover:bg-black/[0.06] flex items-center justify-center transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 text-muted-foreground" />
                </button>
                <div>
                    <h1 className="text-lg font-semibold text-foreground">Send Feedback</h1>
                    <p className="text-[11px] text-muted-foreground/60">Let us know what's wrong or what could be better</p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
                <div className="max-w-lg mx-auto space-y-5">

                    {/* ── Success ── */}
                    <AnimatePresence>
                        {submitted && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/[0.08] border border-emerald-500/20"
                            >
                                <div className="w-9 h-9 rounded-lg bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                </div>
                                <div>
                                    <h3 className="text-[13px] font-medium text-emerald-300">Thanks for your feedback!</h3>
                                    <p className="text-[11px] text-muted-foreground/70">
                                        Our team has been notified and a ticket has been created.
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* ── What happened? ── */}
                    <div>
                        <h2 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 mb-2.5 px-1">
                            What happened?
                        </h2>
                        <div className="grid grid-cols-2 gap-2">
                            {REASONS.map((r) => {
                                const Icon = r.icon;
                                const isActive = reason === r.key;
                                return (
                                    <button
                                        key={r.key}
                                        onClick={() => setReason(r.key)}
                                        className={`flex items-center gap-2.5 p-3 rounded-xl border-2 transition-all text-left ${isActive
                                                ? 'border-[#C08B5C]/30 bg-[#C08B5C]/[0.06]'
                                                : 'border-black/[0.06] bg-black/[0.02] hover:bg-black/[0.03]'
                                            }`}
                                    >
                                        <div className={`w-8 h-8 rounded-lg ${r.bg} flex items-center justify-center flex-shrink-0`}>
                                            <Icon className={`w-4 h-4 ${r.color}`} />
                                        </div>
                                        <span className="text-[12px] font-medium text-foreground/75">{r.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* ── Message ── */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <h2 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 mb-1.5 px-1">
                                Tell us more
                            </h2>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder={
                                    reason === 'broken'
                                        ? 'What happened? What were you trying to do?'
                                        : reason === 'bad_response'
                                            ? 'What was wrong with the response? What did you expect?'
                                            : reason === 'confusing'
                                                ? 'What part was confusing? How can we make it clearer?'
                                                : 'Share any feedback, questions, or suggestions...'
                                }
                                rows={5}
                                maxLength={5000}
                                required
                                className="w-full px-3.5 py-2.5 bg-black/[0.05] border border-black/[0.08] rounded-xl text-[13px] text-foreground/85 placeholder:text-muted-foreground/50 focus:outline-none focus:border-[#C08B5C]/30 transition-colors resize-none leading-relaxed"
                            />
                            <p className="text-[10px] text-muted-foreground/40 text-right mt-1 px-1">
                                {message.length}/5000
                            </p>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                                <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                                <p className="text-[12px] text-red-300">{error}</p>
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={submitting || !message.trim()}
                            className={`w-full py-2.5 rounded-xl text-[13px] font-semibold transition-all flex items-center justify-center gap-2 ${submitting || !message.trim()
                                    ? 'bg-black/[0.05] text-muted-foreground/50 cursor-not-allowed'
                                    : 'bg-[#C08B5C] text-white hover:bg-[#A8734A]'
                                }`}
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Sending…
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4" />
                                    Send Feedback
                                </>
                            )}
                        </button>

                        <p className="text-[10px] text-center text-muted-foreground/40">
                            Your feedback creates a tracked issue for our team.
                            We'll follow up if needed.
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
};
