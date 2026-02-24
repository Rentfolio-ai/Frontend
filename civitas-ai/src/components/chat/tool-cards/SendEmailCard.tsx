/**
 * SendEmailCard — Civitas-branded email draft card.
 *
 * Compact, content-focused layout with copper/gold accent system.
 * Clean header, bold subject, spacious body. Controls tucked away.
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  Send, AlertCircle, CheckCircle2, Loader2,
  Copy, ChevronDown, ChevronUp, Mail,
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
  const [sentAt, setSentAt] = useState<Date | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [selectedTone, setSelectedTone] = useState(initialTone);
  const [selectedLength, setSelectedLength] = useState('short');
  const [showSubjectPicker, setShowSubjectPicker] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
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
      const now = new Date();
      setSentAt(now);
      onSendComplete?.(
        `Email sent to ${editTo} — "${editSubject}" at ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
      );
    } catch (e: any) {
      setErrorMsg(e.message);
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
      <div className="rounded-2xl bg-white/[0.03] border border-[#C08B5C]/15 p-5 max-w-lg backdrop-blur-sm">
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
    <motion.div
      layout
      className="rounded-2xl overflow-hidden max-w-lg
                 bg-gradient-to-b from-[#1c1916] to-[#171411]
                 border border-[#C08B5C]/12
                 shadow-[0_4px_24px_rgba(0,0,0,0.4),0_0_0_1px_rgba(192,139,92,0.06)]"
      onKeyDown={handleKeyDown}
    >
      {/* ── Header ─────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 py-3">
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-[#C08B5C]/50" />
          <span className="text-[13px] text-[#D4A27F]/60 font-medium tracking-wide">Email</span>
        </div>
        <div className="flex items-center gap-0.5">
          {isEdited && status === 'draft' && (
            <button
              onClick={handleDiscard}
              className="text-[10px] text-[#E8DED2]/20 hover:text-[#E8DED2]/45 px-2 py-1 rounded transition-colors"
            >
              Reset
            </button>
          )}
          <button
            onClick={handleCopy}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#E8DED2]/25 hover:text-[#D4A27F]/70 hover:bg-[#C08B5C]/10 transition-all"
            title="Copy to clipboard"
          >
            {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400/80" /> : <Copy className="w-4 h-4" />}
          </button>
          {status === 'draft' && (
            <button
              onClick={handleSend}
              disabled={missingRecipient}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[#E8DED2]/25 hover:text-[#D4A27F]/70 hover:bg-[#C08B5C]/10
                         transition-all disabled:opacity-20 disabled:cursor-not-allowed"
              title={missingRecipient ? 'Add recipient email first' : 'Send email'}
            >
              <Send className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* ── To (recipient) ─────────────────────────── */}
      <div
        className={`flex items-center gap-2.5 px-5 pb-2 ${status === 'draft' && activeField !== 'to' ? 'cursor-text' : ''}`}
        onClick={() => status === 'draft' && activeField !== 'to' && setActiveField('to')}
      >
        <span className="text-[13px] font-semibold text-[#D4A27F]/50 flex-shrink-0">To</span>
        {activeField === 'to' ? (
          <input
            ref={toRef}
            type="email"
            value={editTo}
            onChange={(e) => setEditTo(e.target.value)}
            onBlur={() => setActiveField(null)}
            className="flex-1 text-[13px] text-[#E8DED2]/80 bg-transparent outline-none"
            placeholder="recipient@email.com"
          />
        ) : (
          <span className="text-[13px] text-[#E8DED2]/60 truncate">
            {editTo || <span className="text-[#E8DED2]/20 italic">Add recipient...</span>}
          </span>
        )}
        {missingRecipient && !activeField && (
          <AlertCircle className="w-3 h-3 text-amber-400/40 flex-shrink-0" />
        )}
      </div>

      {/* ── Subject ────────────────────────────────── */}
      <div
        className={`px-5 pb-3 ${status === 'draft' && activeField !== 'subject' ? 'cursor-text' : ''}`}
        onClick={() => status === 'draft' && activeField !== 'subject' && setActiveField('subject')}
      >
        {activeField === 'subject' ? (
          <div className="flex items-baseline gap-2.5">
            <span className="text-[14px] font-bold text-[#F5E6D0] flex-shrink-0">Subject</span>
            <input
              ref={subjectRef}
              type="text"
              value={editSubject}
              onChange={(e) => setEditSubject(e.target.value)}
              onBlur={() => setActiveField(null)}
              className="flex-1 text-[14px] text-[#E8DED2]/80 bg-transparent outline-none"
              placeholder="Subject line..."
            />
          </div>
        ) : (
          <div className="flex items-baseline gap-2.5 min-w-0">
            <span className="text-[14px] font-bold text-[#F5E6D0] flex-shrink-0">Subject</span>
            <span className="text-[14px] text-[#E8DED2]/75 truncate">
              {editSubject || <span className="text-[#E8DED2]/20 italic">Add subject...</span>}
            </span>
            {subjectVariants && subjectVariants.length > 1 && status === 'draft' && (
              <button
                onClick={(e) => { e.stopPropagation(); setShowSubjectPicker(!showSubjectPicker); }}
                className="flex items-center gap-0.5 text-[9px] text-[#D4A27F]/35 hover:text-[#D4A27F]/60 transition-colors ml-auto flex-shrink-0"
              >
                {showSubjectPicker ? <ChevronUp className="w-2.5 h-2.5" /> : <ChevronDown className="w-2.5 h-2.5" />}
                {subjectVariants.length} alt
              </button>
            )}
          </div>
        )}
        <AnimatePresence>
          {showSubjectPicker && subjectVariants && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mt-2 space-y-0.5"
            >
              {subjectVariants.map((variant, idx) => (
                <button
                  key={idx}
                  onClick={(e) => { e.stopPropagation(); setEditSubject(variant); setShowSubjectPicker(false); }}
                  className={`w-full text-left px-2.5 py-1 rounded-lg text-[12px] transition-all ${
                    editSubject === variant
                      ? 'bg-[#C08B5C]/12 text-[#D4A27F] border border-[#C08B5C]/20'
                      : 'text-[#E8DED2]/40 border border-transparent hover:bg-[#C08B5C]/06 hover:text-[#E8DED2]/60'
                  }`}
                >
                  {variant}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Divider ────────────────────────────────── */}
      <div className="mx-5 h-px bg-gradient-to-r from-transparent via-[#C08B5C]/15 to-transparent" />

      {/* ── Body ───────────────────────────────────── */}
      <div
        className={`px-5 py-4 ${status === 'draft' && activeField !== 'body' ? 'cursor-text' : ''} transition-colors`}
        onClick={() => status === 'draft' && activeField !== 'body' && setActiveField('body')}
      >
        {activeField === 'body' ? (
          <textarea
            ref={bodyRef}
            value={editBody}
            onChange={(e) => { setEditBody(e.target.value); autoResizeBody(); }}
            onBlur={() => setActiveField(null)}
            className="w-full text-[14.5px] text-[#F0E4D4] bg-transparent outline-none resize-none leading-[1.8] min-h-[48px] font-[410]"
          />
        ) : (
          <div className="text-[14.5px] text-[#F0E4D4] leading-[1.8] whitespace-pre-wrap font-[410]">
            {editBody || <span className="text-[#E8DED2]/20 italic font-normal">Compose your email...</span>}
          </div>
        )}
      </div>

      {/* ── Expandable details (To, Tone, Length) ──── */}
      {status === 'draft' && (
        <div className="border-t border-[#C08B5C]/08">
          <button
            onClick={() => setShowDetails(prev => !prev)}
            className="flex items-center gap-1.5 px-5 py-2 text-[11px] text-[#D4A27F]/30 hover:text-[#D4A27F]/55 transition-colors w-full"
          >
            {showDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            Options
          </button>
          <AnimatePresence>
            {showDetails && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="px-5 pb-3 space-y-2.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[9px] text-[#D4A27F]/30 uppercase tracking-wider font-medium">Tone</span>
                    {TONES.map(t => (
                      <button
                        key={t.id}
                        onClick={() => handleToneChange(t.id)}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-medium transition-all border ${
                          selectedTone === t.id
                            ? 'bg-[#C08B5C]/15 text-[#D4A27F] border-[#C08B5C]/25'
                            : 'text-[#E8DED2]/25 border-[#C08B5C]/08 hover:bg-[#C08B5C]/08 hover:text-[#E8DED2]/40'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                    <div className="w-px h-3 bg-[#C08B5C]/10" />
                    <span className="text-[9px] text-[#D4A27F]/30 uppercase tracking-wider font-medium">Length</span>
                    {LENGTHS.map(l => (
                      <button
                        key={l.id}
                        onClick={() => handleLengthChange(l.id)}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-medium transition-all border ${
                          selectedLength === l.id
                            ? 'bg-[#C08B5C]/15 text-[#D4A27F] border-[#C08B5C]/25'
                            : 'text-[#E8DED2]/25 border-[#C08B5C]/08 hover:bg-[#C08B5C]/08 hover:text-[#E8DED2]/40'
                        }`}
                      >
                        {l.label}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ── Status: Sending ────────────────────────── */}
      {status === 'sending' && (
        <div className="flex items-center gap-2 px-5 py-2.5 border-t border-[#C08B5C]/08">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-[#D4A27F]/50" />
          <span className="text-[12px] text-[#E8DED2]/40">Sending...</span>
        </div>
      )}

      {/* ── Status: Error ──────────────────────────── */}
      {status === 'error' && (
        <div className="flex items-center gap-2 px-5 py-2.5 border-t border-[#C08B5C]/08">
          <AlertCircle className="w-3.5 h-3.5 text-red-400/60" />
          <span className="text-[12px] text-red-400/60">{errorMsg}</span>
          <button onClick={handleSend} className="text-[12px] text-[#D4A27F]/50 hover:text-[#D4A27F]/80 underline ml-auto">
            Retry
          </button>
        </div>
      )}

      {/* ── Status: Sent ───────────────────────────── */}
      {status === 'sent' && (
        <div className="border-t border-emerald-500/15 bg-emerald-500/[0.03]">
          <div className="flex items-center justify-between px-5 py-2.5">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400/80" />
              <span className="text-[12px] font-semibold text-emerald-400/80">Delivered</span>
            </div>
            {sentAt && (
              <span className="text-[11px] text-[#E8DED2]/25">
                {sentAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                {' · '}
                {sentAt.toLocaleDateString([], { month: 'short', day: 'numeric' })}
              </span>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
};
