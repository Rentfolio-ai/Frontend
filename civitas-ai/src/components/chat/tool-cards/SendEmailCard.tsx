import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  Send, AlertCircle, CheckCircle2, Loader2,
  Copy, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL, jsonHeaders } from '../../../services/apiConfig';

interface SendEmailCardProps {
  professionalId: string;
  professionalName: string;
  toEmail: string;
  subject: string;
  body: string;
  subjectVariants?: string[];
  tone?: string;
  length?: string;
  emailConnected?: boolean;
  onGoToIntegrations?: () => void;
  onRefine?: (instruction: string) => void;
  onSendComplete?: (summary: string) => void;
}

type EditField = 'to' | 'subject' | 'body' | null;

const TONES = [
  { id: 'warm_professional', label: 'Warm' },
  { id: 'direct_professional', label: 'Direct' },
  { id: 'friendly', label: 'Friendly' },
  { id: 'formal', label: 'Formal' },
] as const;

const LENGTHS = [
  { id: 'short', label: 'Short' },
  { id: 'medium', label: 'Medium' },
] as const;

export const SendEmailCard: React.FC<SendEmailCardProps> = ({
  professionalId,
  toEmail,
  subject,
  body,
  subjectVariants,
  tone: initialTone = 'direct_professional',
  emailConnected = true,
  onGoToIntegrations,
  onRefine,
  onSendComplete,
}) => {
  const [editTo, setEditTo] = useState(toEmail);
  const [editSubject, setEditSubject] = useState(subject);
  const [editBody, setEditBody] = useState(body);
  const [activeField, setActiveField] = useState<EditField>(null);
  const [status, setStatus] = useState<'draft' | 'sending' | 'sent' | 'error'>('draft');
  const [selectedTone, setSelectedTone] = useState(initialTone);
  const [selectedLength, setSelectedLength] = useState('short');
  const [showSubjectPicker, setShowSubjectPicker] = useState(false);
  const [copied, setCopied] = useState(false);

  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const subjectRef = useRef<HTMLInputElement>(null);
  const toRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditTo(toEmail);
    setEditSubject(subject);
    setEditBody(body);
  }, [toEmail, subject, body]);

  useEffect(() => {
    if (activeField === 'body' && bodyRef.current) {
      bodyRef.current.focus();
      bodyRef.current.style.height = 'auto';
      bodyRef.current.style.height = `${bodyRef.current.scrollHeight}px`;
    } else if (activeField === 'subject' && subjectRef.current) {
      subjectRef.current.focus();
    } else if (activeField === 'to' && toRef.current) {
      toRef.current.focus();
    }
  }, [activeField]);

  const autoResizeBody = useCallback(() => {
    if (bodyRef.current) {
      bodyRef.current.style.height = 'auto';
      bodyRef.current.style.height = `${bodyRef.current.scrollHeight}px`;
    }
  }, []);

  const handleSend = useCallback(async () => {
    setStatus('sending');
    try {
      const res = await fetch(`${API_BASE_URL}/v2/communications/email`, {
        method: 'POST',
        headers: jsonHeaders(),
        body: JSON.stringify({
          professional_id: professionalId,
          to_email: editTo,
          subject: editSubject,
          body: editBody,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(data.detail || `HTTP ${res.status}`);
      }
      setStatus('sent');
      onSendComplete?.(
        `Email sent to ${editTo} — "${editSubject}"`
      );
    } catch (e: any) {
      console.error(e);
      setStatus('error');
    }
  }, [professionalId, editTo, editSubject, editBody, onSendComplete]);

  const handleCopy = useCallback(() => {
    const text = `Subject: ${editSubject}\n\n${editBody}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [editSubject, editBody]);

  const handleDiscard = useCallback(() => {
    setEditTo(toEmail);
    setEditSubject(subject);
    setEditBody(body);
    setActiveField(null);
  }, [toEmail, subject, body]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') setActiveField(null);
  }, []);

  const handleToneChange = useCallback((tone: string) => {
    setSelectedTone(tone);
    if (onRefine) {
      const toneLabel = TONES.find(t => t.id === tone)?.label || tone;
      onRefine(`Rewrite the email in a ${toneLabel.toLowerCase()} tone`);
    }
  }, [onRefine]);

  const handleLengthChange = useCallback((len: string) => {
    setSelectedLength(len);
    if (onRefine) {
      onRefine(len === 'short' ? 'Make the email shorter and more concise' : 'Expand the email with more detail');
    }
  }, [onRefine]);

  const missingRecipient = !editTo.trim() || !editTo.includes('@');
  const isEdited = editTo !== toEmail || editSubject !== subject || editBody !== body;

  if (!emailConnected) {
    return (
      <div className="rounded-xl bg-black/[0.02] border border-[#C08B5C]/15 p-5 max-w-[680px] backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-2">
          <AlertCircle className="w-4 h-4 text-amber-400/80" />
          <span className="text-[14px] font-medium text-[#F5E6D0]/90">Email not connected</span>
        </div>
        <p className="text-[13px] text-[#E8DED2]/50 mb-3">
          Connect Gmail or Outlook in Integrations to send emails.
        </p>
        <button
          onClick={onGoToIntegrations}
          className="px-3 py-1.5 rounded-lg text-[12px] font-medium
                     bg-[#C08B5C]/15 hover:bg-[#C08B5C]/25 text-[#D4A27F] border border-[#C08B5C]/20
                     transition-all"
        >
          Go to Integrations
        </button>
      </div>
    );
  }

  return (
    <div
      className="relative rounded-xl w-full max-w-[680px] overflow-hidden
                 bg-black/[0.02] border border-black/[0.06] shadow-sm
                 flex flex-col z-10 mt-2"
      onKeyDown={handleKeyDown}
    >
      {/* Left accent stripe */}
      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-[#C08B5C] to-[#C08B5C]/30 rounded-l-xl" />

      {/* Header: type badge + actions */}
      <div className="flex items-center justify-between px-5 py-2.5 pl-6">
        <div className="flex items-center gap-2.5">
          <span className="text-[11px] font-semibold tracking-wide uppercase text-[#C08B5C]/80">
            Email
          </span>
          {status === 'sent' && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/15">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span className="text-[10px] font-semibold text-emerald-400">Sent</span>
            </div>
          )}
          {status === 'sending' && (
            <div className="flex items-center gap-1.5">
              <Loader2 className="w-3 h-3 animate-spin text-muted-foreground/70" />
              <span className="text-[10px] font-medium text-muted-foreground/70">Sending...</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1">
          {isEdited && status === 'draft' && (
            <button
              onClick={handleDiscard}
              className="text-[10px] font-medium text-muted-foreground/50 hover:text-foreground/70 px-2 py-1 rounded transition-colors"
            >
              Reset
            </button>
          )}
          <button
            onClick={handleCopy}
            className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground/50 hover:text-foreground/80 hover:bg-black/[0.04] transition-all"
            title="Copy to clipboard"
          >
            {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          {status === 'draft' && (
            <button
              onClick={handleSend}
              disabled={missingRecipient || !editBody.trim()}
              className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground/50 hover:text-[#C08B5C] hover:bg-[#C08B5C]/10 transition-all disabled:opacity-20 disabled:hover:text-muted-foreground/50 disabled:hover:bg-transparent"
              title="Send email"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          )}
          {status === 'error' && (
            <button
              onClick={handleSend}
              className="w-7 h-7 rounded-md flex items-center justify-center text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-all"
              title="Retry"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Subject: bold visual anchor */}
      <div className="px-5 pl-6 relative z-20">
        <div
          className={`${status === 'draft' && activeField !== 'subject' ? 'cursor-text' : ''}`}
          onClick={() => status === 'draft' && activeField !== 'subject' && setActiveField('subject')}
        >
          <div className="flex items-center gap-2">
            {activeField === 'subject' ? (
              <input
                ref={subjectRef}
                type="text"
                value={editSubject}
                onChange={(e) => setEditSubject(e.target.value)}
                onBlur={() => setActiveField(null)}
                className="flex-1 text-[15px] font-semibold text-foreground bg-transparent outline-none placeholder-muted-foreground/40"
                placeholder="Subject line..."
              />
            ) : (
              <span className={`text-[15px] font-semibold ${editSubject ? 'text-foreground' : 'text-muted-foreground/40'}`}>
                {editSubject || 'Add subject...'}
              </span>
            )}
            {subjectVariants && subjectVariants.length > 1 && status === 'draft' && activeField !== 'subject' && (
              <button
                onClick={(e) => { e.stopPropagation(); setShowSubjectPicker(!showSubjectPicker); }}
                className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground/70 hover:text-foreground/70 transition-colors flex-shrink-0 bg-black/[0.03] hover:bg-black/[0.05] px-2 py-0.5 rounded-full"
              >
                <Sparkles className="w-2.5 h-2.5" />
                {subjectVariants.length}
              </button>
            )}
          </div>
        </div>

        <AnimatePresence>
          {showSubjectPicker && subjectVariants && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute left-5 right-5 top-full mt-2 p-1.5 rounded-xl bg-card border border-black/[0.08] shadow-[0_8px_24px_rgba(0,0,0,0.12)] z-30"
            >
              {subjectVariants.map((variant, idx) => (
                <button
                  key={idx}
                  onClick={(e) => { e.stopPropagation(); setEditSubject(variant); setShowSubjectPicker(false); }}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-[13px] transition-all font-medium ${editSubject === variant
                    ? 'bg-[#C08B5C]/15 text-[#E2A76F]'
                    : 'text-[#A89E92] hover:bg-black/[0.03] hover:text-[#F3E8D8]'
                    }`}
                >
                  {variant}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Recipient line */}
      <div className="px-5 pl-6 pt-1 pb-3 border-b border-black/[0.05]">
        <div
          className={`flex items-center gap-1.5 ${status === 'draft' && activeField !== 'to' ? 'cursor-text' : ''}`}
          onClick={() => status === 'draft' && activeField !== 'to' && setActiveField('to')}
        >
          <span className="text-[12px] text-muted-foreground/50">To</span>
          {activeField === 'to' ? (
            <input
              ref={toRef}
              type="email"
              value={editTo}
              onChange={(e) => setEditTo(e.target.value)}
              onBlur={() => setActiveField(null)}
              className="flex-1 text-[12px] text-muted-foreground bg-transparent outline-none placeholder-black/25"
              placeholder="recipient@example.com"
            />
          ) : (
            <span className={`text-[12px] ${editTo ? 'text-muted-foreground' : 'text-muted-foreground/40'} truncate`}>
              {editTo || 'Add recipient...'}
            </span>
          )}
          {missingRecipient && activeField !== 'to' && (
            <AlertCircle className="w-3 h-3 text-amber-500/60 flex-shrink-0" />
          )}
        </div>
      </div>

      {/* Body */}
      <div className="px-5 pl-6 py-4 flex-1 relative z-10">
        <div
          className={`${status === 'draft' && activeField !== 'body' ? 'cursor-text' : ''} transition-colors`}
          onClick={() => status === 'draft' && activeField !== 'body' && setActiveField('body')}
        >
          {activeField === 'body' ? (
            <textarea
              ref={bodyRef}
              value={editBody}
              onChange={(e) => { setEditBody(e.target.value); autoResizeBody(); }}
              onBlur={() => setActiveField(null)}
              className="w-full text-[13.5px] text-foreground/75 bg-transparent outline-none resize-none leading-[1.7] min-h-[80px] placeholder-black/25"
              placeholder="Draft your email..."
            />
          ) : (
            <div className={`text-[13.5px] text-foreground/75 leading-[1.7] whitespace-pre-wrap min-h-[80px] ${status === 'sending' ? 'animate-pulse opacity-60' : ''}`}>
              {editBody || <span className="text-muted-foreground/40">Draft your email...</span>}
            </div>
          )}
        </div>
      </div>

      {/* Footer: tone/length + send */}
      {status === 'draft' && (
        <div className="px-5 pl-6 py-2 border-t border-black/[0.05] flex items-center justify-between">
          <div className="flex gap-1 items-center">
            {TONES.slice(0, 2).map((t) => (
              <button
                key={t.id}
                onClick={() => handleToneChange(t.id)}
                className={`px-2 py-1 rounded-md text-[10px] font-medium transition-all ${selectedTone === t.id
                  ? 'bg-[#C08B5C]/12 text-[#E2A76F]'
                  : 'text-muted-foreground/50 hover:text-muted-foreground hover:bg-black/[0.03]'
                  }`}
              >
                {t.label}
              </button>
            ))}
            <div className="w-px h-3 bg-black/[0.05] mx-0.5" />
            {LENGTHS.map((l) => (
              <button
                key={l.id}
                onClick={() => handleLengthChange(l.id)}
                className={`px-2 py-1 rounded-md text-[10px] font-medium transition-all ${selectedLength === l.id
                  ? 'bg-[#C08B5C]/12 text-[#E2A76F]'
                  : 'text-muted-foreground/50 hover:text-muted-foreground hover:bg-black/[0.03]'
                  }`}
              >
                {l.label}
              </button>
            ))}
          </div>
          <button
            onClick={handleSend}
            disabled={missingRecipient || !editBody.trim()}
            className="px-3 py-1.5 flex items-center gap-1.5 rounded-lg text-[11px] font-semibold
                       bg-[#C08B5C] text-white hover:bg-[#D49E6A] shadow-sm
                       transition-all disabled:opacity-25"
          >
            Send
            <Send className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Error footer */}
      {status === 'error' && (
        <div className="px-5 pl-6 py-2 border-t border-red-500/10 flex items-center justify-between">
          <span className="text-[11px] text-red-400/60">Failed to send</span>
          <button
            onClick={handleSend}
            className="px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/15 flex items-center gap-1.5 transition-all"
          >
            <AlertCircle className="w-3 h-3" />
            Retry
          </button>
        </div>
      )}
    </div>
  );
};
