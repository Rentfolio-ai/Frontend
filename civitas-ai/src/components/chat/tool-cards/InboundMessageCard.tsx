/**
 * InboundMessageCard — renders an incoming message from a professional
 * as a left-aligned chat bubble with quick-reply action.
 */

import React from 'react';
import { Mail, MessageSquare, Reply } from 'lucide-react';
import { motion } from 'framer-motion';

export interface InboundMessage {
  conversationId: string;
  messageId?: string;
  channel: 'sms' | 'email' | 'whatsapp';
  fromName: string;
  subject?: string;
  content: string;
  timestamp?: string;
}

interface InboundMessageCardProps {
  message: InboundMessage;
  onReply?: (conversationId: string, fromName: string, channel: string, content: string) => void;
}

export const InboundMessageCard: React.FC<InboundMessageCardProps> = ({
  message,
  onReply,
}) => {
  const { channel, fromName, subject, content, timestamp, conversationId } = message;
  const isEmail = channel === 'email';
  const ChannelIcon = isEmail ? Mail : MessageSquare;
  const channelLabel = channel === 'whatsapp' ? 'WhatsApp' : channel === 'email' ? 'Email' : 'SMS';

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      className="max-w-sm"
    >
      {/* Contact line */}
      <div className="flex items-center gap-1.5 mb-1.5">
        <div className="w-5 h-5 rounded-full bg-[#C08B5C]/10 flex items-center justify-center">
          <span className="text-[9px] font-bold text-[#D4A27F]">
            {fromName.charAt(0).toUpperCase()}
          </span>
        </div>
        <span className="text-[12px] font-semibold text-[#F0E4D4]/80 truncate">{fromName}</span>
        <span className="text-[9px] text-[#D4A27F]/40 flex items-center gap-0.5">
          <ChannelIcon className="w-2.5 h-2.5" />
          {channelLabel}
        </span>
      </div>

      {/* Left-aligned bubble */}
      <div className="rounded-2xl rounded-bl-sm bg-white/[0.04] border border-white/[0.06] px-3.5 py-2.5 max-w-[85%]">
        {isEmail && subject && (
          <div className="text-[11px] font-semibold text-[#D4A27F]/60 mb-1 truncate">{subject}</div>
        )}
        <div className="text-[13.5px] text-[#F0E4D4]/85 leading-[1.6] whitespace-pre-wrap">
          {content}
        </div>
      </div>

      {/* Footer: timestamp + reply */}
      <div className="flex items-center justify-between mt-1 px-1">
        <span className="text-[9px] text-[#E8DED2]/20">
          {timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
        {onReply && (
          <button
            onClick={() => onReply(conversationId, fromName, channel, content)}
            className="flex items-center gap-1 text-[10px] text-[#D4A27F]/40 hover:text-[#D4A27F]/70 transition-colors"
          >
            <Reply className="w-3 h-3" />
            Reply
          </button>
        )}
      </div>
    </motion.div>
  );
};
