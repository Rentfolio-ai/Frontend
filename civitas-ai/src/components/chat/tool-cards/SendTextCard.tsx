/**
 * SendTextCard — Premium SMS/WhatsApp draft card.
 *
 * Single-surface design: the bubble IS the editing surface.
 * No duplicate compose bar. Rich gradient bubble with depth.
 * Inline delivery status. Civitas copper/gold brand system.
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  Send, AlertCircle, Loader2,
  CheckCheck, ChevronDown, ChevronUp, RotateCcw,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL, jsonHeaders } from '../../../services/apiConfig';

/* ── Design tokens ──────────────────────────────────────────────── */

const T = {
  card: {
    bg: 'bg-[#161210]',
    border: 'border-[#2a2218]',
    radius: 'rounded-2xl',
    shadow: 'shadow-[0_8px_32px_rgba(0,0,0,0.5)]',
  },
  bubble: {
    bg: 'bg-gradient-to-br from-[#C08B5C]/25 via-[#A77B4F]/20 to-[#8B6940]/18',
    border: 'border border-[#C08B5C]/15',
    glow: 'shadow-[0_2px_12px_rgba(192,139,92,0.08),inset_0_1px_0_rgba(255,255,255,0.04)]',
    radius: 'rounded-[18px] rounded-br-[4px]',
    text: 'text-[#F5EDE3]',
    editRing: 'ring-1 ring-[#C08B5C]/10 border-[#C08B5C]/30',
  },
  bubbleWA: {
    bg: 'bg-gradient-to-br from-emerald-500/20 via-emerald-600/15 to-emerald-700/12',
    border: 'border border-emerald-500/15',
    glow: 'shadow-[0_2px_12px_rgba(16,185,129,0.06),inset_0_1px_0_rgba(255,255,255,0.04)]',
  },
  contact: {
    name: 'text-[14px] font-semibold text-[#F0E4D4]',
    phone: 'text-[11px] text-[#D4A27F]/40',
    avatar: 'bg-gradient-to-br from-[#C08B5C]/25 to-[#8B6940]/18',
    avatarText: 'text-[12px] font-bold text-[#D4A27F]',
  },
  meta: 'text-[9px] text-[#E8DED2]/15',
  sendBtn: {
    base: 'bg-gradient-to-r from-[#C08B5C] to-[#A77B4F]',
    hover: 'hover:from-[#D49B6C] hover:to-[#B88B5F]',
    icon: 'text-[#0F0D0B]',
    disabled: 'opacity-30 cursor-not-allowed',
  },
  pill: {
    sms: 'bg-[#C08B5C]/12 text-[#D4A27F]/70 border-[#C08B5C]/18',
    whatsapp: 'bg-emerald-500/12 text-emerald-400/70 border-emerald-500/18',
  },
} as const;

/* ── Props & constants ──────────────────────────────────────────── */

interface SendTextCardProps {
  professionalId: string;
  professionalName: string;
  toPhone: string;
  body: string;
  defaultChannel?: 'sms' | 'whatsapp';
  tone?: string;
  onRefine?: (instruction: string) => void;
  onSendComplete?: (summary: string) => void;
}

const SMS_SEGMENT = 160;
const SMS_WARN = 240;

const TONES = [
  { id: 'warm_professional', label: 'Warm' },
  { id: 'direct_professional', label: 'Direct' },
  { id: 'friendly', label: 'Casual' },
  { id: 'formal', label: 'Formal' },
] as const;

type ActiveField = 'body' | 'phone' | null;

/* ── Component ──────────────────────────────────────────────────── */

export const SendTextCard: React.FC<SendTextCardProps> = ({
  professionalId,
  professionalName,
  toPhone,
  body,
  defaultChannel = 'sms',
  tone: initialTone = 'direct_professional',
  onRefine,
  onSendComplete,
}) => {
  const [editPhone, setEditPhone] = useState(toPhone);
  const [editBody, setEditBody] = useState(body);
  const [channel, setChannel] = useState<'sms' | 'whatsapp'>(defaultChannel);
  const [activeField, setActiveField] = useState<ActiveField>(null);
  const [showOptions, setShowOptions] = useState(false);
  const [status, setStatus] = useState<'draft' | 'sending' | 'sent' | 'error'>('draft');
  const [errorMsg, setErrorMsg] = useState('');
  const [selectedTone, setSelectedTone] = useState(initialTone);
  const [sentAt, setSentAt] = useState<Date | null>(null);

  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setEditPhone(toPhone); setEditBody(body); }, [toPhone, body]);

  useEffect(() => {
    if (activeField === 'body' && bodyRef.current) {
      bodyRef.current.focus();
      bodyRef.current.style.height = 'auto';
      bodyRef.current.style.height = `${bodyRef.current.scrollHeight}px`;
    } else if (activeField === 'phone' && phoneRef.current) {
      phoneRef.current.focus();
    }
  }, [activeField]);

  const autoResize = useCallback(() => {
    const el = bodyRef.current;
    if (el) { el.style.height = 'auto'; el.style.height = `${el.scrollHeight}px`; }
  }, []);

  const handleSend = useCallback(async () => {
    setStatus('sending');
    try {
      const res = await fetch(`${API_BASE_URL}/v2/communications/text`, {
        method: 'POST',
        headers: jsonHeaders(),
        body: JSON.stringify({
          professional_id: professionalId,
          to_phone: editPhone,
          body: editBody,
          channel,
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
        `${channel === 'whatsapp' ? 'WhatsApp' : 'Text'} sent to ${editPhone} at ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
      );
    } catch (e: any) {
      setErrorMsg(e.message);
      setStatus('error');
    }
  }, [professionalId, editPhone, editBody, channel, onSendComplete]);

  const handleToneChange = useCallback((tone: string) => {
    setSelectedTone(tone);
    if (onRefine) {
      const label = TONES.find(t => t.id === tone)?.label || tone;
      onRefine(`Rewrite the text message in a ${label.toLowerCase()} tone`);
    }
  }, [onRefine]);

  /* ── Derived values ── */
  const chars = editBody.length;
  const segments = Math.ceil(chars / SMS_SEGMENT) || 1;
  const missingPhone = !editPhone.trim();
  const isWA = channel === 'whatsapp';
  const timeStr = (sentAt || new Date()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const bub = isWA ? T.bubbleWA : T.bubble;
  const pillCls = isWA ? T.pill.whatsapp : T.pill.sms;

  return (
    <motion.div
      layout
      className={`overflow-hidden max-w-[340px]
                  ${T.card.bg} ${T.card.border} ${T.card.radius} ${T.card.shadow}`}
    >
      {/* ── Contact bar ──────────────────────────────── */}
      <div
        className="flex items-center justify-between px-4 py-3"
        onClick={() => status === 'draft' && activeField !== 'phone' && setActiveField('phone')}
      >
        <div className="flex items-center gap-2.5 min-w-0 cursor-pointer">
          <div className={`w-7 h-7 rounded-full ${T.contact.avatar} flex items-center justify-center flex-shrink-0`}>
            <span className={T.contact.avatarText}>
              {professionalName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            {activeField === 'phone' ? (
              <input
                ref={phoneRef}
                type="tel"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                onBlur={() => setActiveField(null)}
                onKeyDown={(e) => e.key === 'Enter' && setActiveField(null)}
                className={`${T.contact.name} bg-transparent outline-none w-full`}
                placeholder="+1 (555) 000-0000"
              />
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <span className={`${T.contact.name} truncate`}>{professionalName}</span>
                  <span className={`text-[9px] font-medium px-1.5 py-px rounded-full border ${pillCls}`}>
                    {isWA ? 'WhatsApp' : 'SMS'}
                  </span>
                </div>
                <span className={`${T.contact.phone} truncate block`}>
                  {editPhone || <span className="italic opacity-60">Tap to add number</span>}
                </span>
              </>
            )}
          </div>
        </div>
        {missingPhone && activeField !== 'phone' && (
          <AlertCircle className="w-3.5 h-3.5 text-amber-400/30 flex-shrink-0" />
        )}
      </div>

      {/* ── Message bubble ───────────────────────────── */}
      <div className="px-4 pb-1">
        <div className="flex justify-end">
          <div
            className={`max-w-[92%] ${status === 'draft' ? 'cursor-text' : ''}`}
            onClick={() => status === 'draft' && activeField !== 'body' && setActiveField('body')}
          >
            {activeField === 'body' ? (
              <textarea
                ref={bodyRef}
                value={editBody}
                onChange={(e) => { setEditBody(e.target.value); autoResize(); }}
                onBlur={() => setActiveField(null)}
                className={`w-full min-w-[200px] min-h-[44px] px-4 py-3
                            ${bub.bg} ${T.bubble.radius} ${bub.glow}
                            ${T.bubble.editRing}
                            text-[15px] font-[420] leading-[1.65] ${T.bubble.text}
                            bg-transparent outline-none resize-none`}
              />
            ) : (
              <div
                className={`px-4 py-3
                            ${bub.bg} ${bub.border} ${T.bubble.radius} ${bub.glow}
                            text-[15px] font-[420] leading-[1.65] ${T.bubble.text}
                            whitespace-pre-wrap
                            ${status === 'sending' ? 'animate-pulse' : ''}`}
              >
                {editBody || <span className="text-[#E8DED2]/20 italic font-normal text-[14px]">Tap to compose...</span>}
              </div>
            )}
          </div>
        </div>

        {/* ── Action row (inline below bubble) ────────── */}
        <div className="flex items-center justify-end gap-2 mt-1.5 mb-2 pr-0.5">
          {/* Char count — ultra muted */}
          {status === 'draft' && channel === 'sms' && (
            <span className={`${T.meta} ${chars > SMS_WARN ? 'text-red-400/40' : chars > SMS_SEGMENT ? 'text-amber-400/25' : ''}`}>
              {chars}{segments > 1 ? `·${segments}` : ''}
            </span>
          )}

          {/* Timestamp */}
          <span className={T.meta}>{timeStr}</span>

          {/* Status indicators — inline */}
          {status === 'sending' && (
            <Loader2 className="w-3 h-3 animate-spin text-[#D4A27F]/40" />
          )}
          {status === 'sent' && (
            <CheckCheck className="w-3.5 h-3.5 text-emerald-400/70" />
          )}
          {status === 'error' && (
            <button
              onClick={handleSend}
              className="flex items-center gap-1 text-[9px] text-red-400/50 hover:text-red-400/80 transition-colors"
            >
              <RotateCcw className="w-2.5 h-2.5" />
              Retry
            </button>
          )}

          {/* Send button — only in draft */}
          {status === 'draft' && (
            <button
              onClick={handleSend}
              disabled={missingPhone || !editBody.trim()}
              className={`w-[26px] h-[26px] rounded-full flex items-center justify-center
                          ${T.sendBtn.base} ${T.sendBtn.hover}
                          transition-all
                          ${missingPhone || !editBody.trim() ? T.sendBtn.disabled : ''}`}
              title={missingPhone ? 'Add phone number' : 'Send'}
            >
              <Send className={`w-3 h-3 ${T.sendBtn.icon}`} />
            </button>
          )}
        </div>
      </div>

      {/* ── Error message (if any) ───────────────────── */}
      {status === 'error' && errorMsg && (
        <div className="px-4 pb-2">
          <div className="flex justify-end">
            <span className="text-[10px] text-red-400/40">{errorMsg}</span>
          </div>
        </div>
      )}

      {/* ── Options toggle + panel ───────────────────── */}
      {status === 'draft' && (
        <div className="border-t border-[#C08B5C]/06">
          <button
            onClick={() => setShowOptions(prev => !prev)}
            className="flex items-center gap-1 px-4 py-1.5 text-[10px] text-[#D4A27F]/20 hover:text-[#D4A27F]/45 transition-colors w-full"
          >
            {showOptions ? <ChevronUp className="w-2.5 h-2.5" /> : <ChevronDown className="w-2.5 h-2.5" />}
            Options
          </button>
          <AnimatePresence>
            {showOptions && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-3 pt-0.5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      onClick={() => setChannel('sms')}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-medium transition-all border ${
                        !isWA
                          ? 'bg-[#C08B5C]/15 text-[#D4A27F] border-[#C08B5C]/25'
                          : 'text-[#E8DED2]/20 border-[#C08B5C]/06 hover:text-[#E8DED2]/35'
                      }`}
                    >
                      SMS
                    </button>
                    <button
                      onClick={() => setChannel('whatsapp')}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-medium transition-all border ${
                        isWA
                          ? 'bg-emerald-500/15 text-emerald-400/70 border-emerald-500/20'
                          : 'text-[#E8DED2]/20 border-[#C08B5C]/06 hover:text-[#E8DED2]/35'
                      }`}
                    >
                      WhatsApp
                    </button>
                    <div className="w-px h-3 bg-[#C08B5C]/08 mx-0.5" />
                    <span className="text-[9px] text-[#D4A27F]/20 uppercase tracking-wider">Tone</span>
                    {TONES.map(t => (
                      <button
                        key={t.id}
                        onClick={() => handleToneChange(t.id)}
                        className={`px-1.5 py-px rounded-full text-[10px] font-medium transition-all border ${
                          selectedTone === t.id
                            ? 'bg-[#C08B5C]/15 text-[#D4A27F] border-[#C08B5C]/25'
                            : 'text-[#E8DED2]/15 border-[#C08B5C]/06 hover:text-[#E8DED2]/30'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
};
