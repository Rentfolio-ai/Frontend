import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  Send, AlertCircle, Loader2, CheckCheck, Copy, CheckCircle2,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { API_BASE_URL, jsonHeaders } from '../../../services/apiConfig';

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
type ActiveField = 'body' | 'phone' | null;

export const SendTextCard: React.FC<SendTextCardProps> = ({
  professionalId,
  professionalName,
  toPhone,
  body,
  defaultChannel = 'sms',
  onSendComplete,
}) => {
  const [editPhone, setEditPhone] = useState(toPhone);
  const [editBody, setEditBody] = useState(body);
  const [channel, setChannel] = useState<'sms' | 'whatsapp'>(defaultChannel);
  const [activeField, setActiveField] = useState<ActiveField>(null);
  const [status, setStatus] = useState<'draft' | 'sending' | 'sent' | 'error'>('draft');
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);

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
      onSendComplete?.(
        `${channel === 'whatsapp' ? 'WhatsApp' : 'Text'} sent to ${editPhone}`
      );
    } catch (e: any) {
      setErrorMsg(e.message);
      setStatus('error');
    }
  }, [professionalId, editPhone, editBody, channel, onSendComplete]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(editBody);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [editBody]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') setActiveField(null);
  }, []);

  const chars = editBody.length;
  const segments = Math.ceil(chars / SMS_SEGMENT) || 1;
  const missingPhone = !editPhone.trim();
  const isWA = channel === 'whatsapp';

  const accentColor = isWA ? 'emerald' : 'copper';
  const accentFrom = isWA ? 'from-emerald-500' : 'from-[#C08B5C]';
  const accentTo = isWA ? 'to-emerald-500/30' : 'to-[#C08B5C]/30';
  const badgeColor = isWA ? 'text-emerald-400/80' : 'text-[#C08B5C]/80';

  return (
    <motion.div
      layout
      className="relative rounded-xl w-full max-w-[520px] overflow-hidden
                 bg-black/[0.02] border border-black/[0.06] shadow-sm
                 flex flex-col z-10 mt-2"
      onKeyDown={handleKeyDown}
    >
      {/* Left accent stripe */}
      <div className={`absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b ${accentFrom} ${accentTo} rounded-l-xl`} />

      {/* Header: type badge + actions */}
      <div className="flex items-center justify-between px-5 py-2.5 pl-6">
        <div className="flex items-center gap-2.5">
          <span className={`text-[11px] font-semibold tracking-wide uppercase ${badgeColor}`}>
            {isWA ? 'WhatsApp' : 'SMS'}
          </span>
          {status === 'sent' && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/15">
              <CheckCheck className="w-3 h-3 text-emerald-400" />
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
          <button
            onClick={handleCopy}
            className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground/50 hover:text-foreground/80 hover:bg-black/[0.04] transition-all"
            title="Copy message"
          >
            {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          {status === 'draft' && (
            <button
              onClick={handleSend}
              disabled={missingPhone || !editBody.trim()}
              className={`w-7 h-7 rounded-md flex items-center justify-center transition-all disabled:opacity-20 disabled:hover:bg-transparent ${
                isWA
                  ? 'text-muted-foreground/50 hover:text-emerald-400 hover:bg-emerald-500/10 disabled:hover:text-muted-foreground/50'
                  : 'text-muted-foreground/50 hover:text-[#C08B5C] hover:bg-[#C08B5C]/10 disabled:hover:text-muted-foreground/50'
              }`}
              title="Send message"
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

      {/* Contact: name + phone */}
      <div className="px-5 pl-6 pb-3 border-b border-black/[0.05]">
        <div
          className={`${status === 'draft' && activeField !== 'phone' ? 'cursor-text' : ''}`}
          onClick={() => status === 'draft' && activeField !== 'phone' && setActiveField('phone')}
        >
          <div className="text-[15px] font-semibold text-foreground">{professionalName}</div>
          <div className="flex items-center gap-1.5 mt-0.5">
            {activeField === 'phone' ? (
              <input
                ref={phoneRef}
                type="tel"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                onBlur={() => setActiveField(null)}
                onKeyDown={(e) => e.key === 'Enter' && setActiveField(null)}
                className="flex-1 text-[12px] text-muted-foreground bg-transparent outline-none placeholder-white/15"
                placeholder="+1 (555) 000-0000"
              />
            ) : (
              <span className={`text-[12px] ${editPhone ? 'text-muted-foreground/70' : 'text-muted-foreground/40'} truncate`}>
                {editPhone || 'Tap to add number'}
              </span>
            )}
            {missingPhone && activeField !== 'phone' && (
              <AlertCircle className="w-3 h-3 text-amber-500/60 flex-shrink-0" />
            )}
          </div>
        </div>
      </div>

      {/* Message body */}
      <div className="px-5 pl-6 py-4 flex-1 relative z-10">
        <div
          className={`${status === 'draft' && activeField !== 'body' ? 'cursor-text' : ''} transition-colors`}
          onClick={() => status === 'draft' && activeField !== 'body' && setActiveField('body')}
        >
          {activeField === 'body' ? (
            <textarea
              ref={bodyRef}
              value={editBody}
              onChange={(e) => { setEditBody(e.target.value); autoResize(); }}
              onBlur={() => setActiveField(null)}
              className="w-full text-[13.5px] text-foreground/75 bg-transparent outline-none resize-none leading-[1.7] min-h-[60px] placeholder-white/15"
              placeholder="Compose message..."
            />
          ) : (
            <div className={`text-[13.5px] text-foreground/75 leading-[1.7] whitespace-pre-wrap min-h-[60px] ${status === 'sending' ? 'animate-pulse opacity-60' : ''}`}>
              {editBody || <span className="text-muted-foreground/40">Compose message...</span>}
            </div>
          )}
        </div>
      </div>

      {/* Footer: channel toggle + char count + send */}
      {status === 'draft' && (
        <div className="px-5 pl-6 py-2 border-t border-black/[0.05] flex items-center justify-between">
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => { e.stopPropagation(); setChannel('sms'); }}
              className={`px-2.5 py-1 rounded-md text-[10px] font-medium transition-all ${
                !isWA ? 'bg-[#C08B5C]/12 text-[#E2A76F]' : 'text-muted-foreground/50 hover:text-muted-foreground hover:bg-black/[0.03]'
              }`}
            >
              SMS
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setChannel('whatsapp'); }}
              className={`px-2.5 py-1 rounded-md text-[10px] font-medium transition-all ${
                isWA ? 'bg-emerald-500/12 text-emerald-400' : 'text-muted-foreground/50 hover:text-muted-foreground hover:bg-black/[0.03]'
              }`}
            >
              WhatsApp
            </button>
            {channel === 'sms' && (
              <>
                <div className="w-px h-3 bg-black/[0.05] mx-0.5" />
                <span className={`text-[10px] font-medium ${chars > SMS_WARN ? 'text-red-400/70' : chars > SMS_SEGMENT ? 'text-amber-400/70' : 'text-muted-foreground/50'}`}>
                  {chars}<span className="opacity-50">/{SMS_SEGMENT * segments}</span>
                </span>
              </>
            )}
          </div>
          <button
            onClick={handleSend}
            disabled={missingPhone || !editBody.trim()}
            className={`px-3 py-1.5 flex items-center gap-1.5 rounded-lg text-[11px] font-semibold shadow-sm transition-all disabled:opacity-25 ${
              isWA
                ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                : 'bg-[#C08B5C] text-white hover:bg-[#D49E6A]'
            }`}
          >
            {isWA ? 'WhatsApp' : 'Send'}
            <Send className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Error footer */}
      {status === 'error' && (
        <div className="px-5 pl-6 py-2 border-t border-red-500/10 flex items-center justify-between">
          <span className="text-[11px] text-red-400/60">{errorMsg || 'Failed to send'}</span>
          <button
            onClick={handleSend}
            className="px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/15 flex items-center gap-1.5 transition-all"
          >
            <AlertCircle className="w-3 h-3" />
            Retry
          </button>
        </div>
      )}
    </motion.div>
  );
};
