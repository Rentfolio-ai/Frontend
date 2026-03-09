import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Inbox, Mail, MessageSquare, Phone, ChevronRight, ArrowLeft,
  Send, Search, X, Loader2,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { inboxService, type Conversation, type ConversationMessage } from '../../services/inboxApi';

const CHANNEL_META: Record<string, { label: string; icon: React.FC<{ className?: string }>; color: string }> = {
  email: { label: 'Email', icon: Mail, color: 'text-red-400' },
  sms: { label: 'SMS', icon: MessageSquare, color: 'text-green-400' },
  whatsapp: { label: 'WhatsApp', icon: MessageSquare, color: 'text-emerald-400' },
  voice_call: { label: 'Call', icon: Phone, color: 'text-blue-400' },
};

function formatTime(ts: string | null) {
  if (!ts) return '';
  const d = new Date(ts);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 60_000) return 'Just now';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  if (diff < 604_800_000) return d.toLocaleDateString(undefined, { weekday: 'short' });
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

interface InboxPageProps {
  onBack?: () => void;
}

export const InboxPage: React.FC<InboxPageProps> = ({ onBack }) => {
  const { user } = useAuth();
  const token = (user as any)?.token || '';

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [channelFilter, setChannelFilter] = useState<string>('all');
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [replyText, setReplyText] = useState('');

  const loadConversations = useCallback(async () => {
    if (!token) return;
    try {
      const { conversations: convs } = await inboxService.listConversations(token);
      setConversations(convs);
    } catch (err) {
      console.error('Failed to load conversations:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  const loadMessages = useCallback(async (convId: string) => {
    if (!token) return;
    setMessagesLoading(true);
    try {
      const { messages: msgs } = await inboxService.getMessages(token, convId);
      setMessages(msgs);
      await inboxService.markRead(token, convId);
      setConversations(prev => prev.map(c =>
        c.id === convId ? { ...c, unread_count: 0 } : c
      ));
    } catch (err) {
      console.error('Failed to load messages:', err);
    } finally {
      setMessagesLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (selectedConvId) loadMessages(selectedConvId);
  }, [selectedConvId, loadMessages]);

  const filteredConvs = conversations.filter(c => {
    if (channelFilter !== 'all' && c.channel !== channelFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (c.professional_name || '').toLowerCase().includes(q);
    }
    return true;
  });

  const selectedConv = conversations.find(c => c.id === selectedConvId) || null;
  const totalUnread = conversations.reduce((s, c) => s + (c.unread_count || 0), 0);

  const channelCounts = conversations.reduce((acc, c) => {
    acc[c.channel] = (acc[c.channel] || 0) + (c.unread_count || 0);
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="h-full overflow-hidden bg-background flex flex-col">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="flex-1 flex flex-col max-w-[1100px] mx-auto w-full px-6 py-6"
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          {onBack && (
            <button onClick={onBack} className="w-8 h-8 rounded-lg hover:bg-black/[0.03] flex items-center justify-center -ml-1">
              <ArrowLeft className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
          <div className="flex-1">
            <h1 className="text-[22px] font-semibold text-foreground tracking-[-0.02em]">Inbox</h1>
            <p className="text-[12px] text-muted-foreground/60">
              {totalUnread > 0 ? `${totalUnread} unread message${totalUnread !== 1 ? 's' : ''}` : 'All caught up'}
            </p>
          </div>
        </div>

        {/* Channel tabs */}
        <div className="flex items-center gap-2 mb-4">
          {[
            { key: 'all', label: 'All', count: totalUnread },
            { key: 'email', label: 'Email', count: channelCounts.email || 0 },
            { key: 'sms', label: 'SMS', count: channelCounts.sms || 0 },
            { key: 'whatsapp', label: 'WhatsApp', count: channelCounts.whatsapp || 0 },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setChannelFilter(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${
                channelFilter === tab.key
                  ? 'bg-[#C08B5C]/10 text-[#C08B5C] border border-[#C08B5C]/20'
                  : 'bg-black/[0.02] text-muted-foreground/60 border border-transparent hover:bg-black/[0.04]'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#C08B5C] text-[#0A0A0C] text-[9px] font-bold">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className="w-full pl-9 pr-8 py-2 rounded-lg bg-black/[0.02] border border-black/[0.06] text-[12px] text-foreground/80 placeholder:text-muted-foreground/40 focus:outline-none focus:border-[#C08B5C]/20"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2">
              <X className="w-3 h-3 text-muted-foreground/40" />
            </button>
          )}
        </div>

        {/* Main content: split view */}
        <div className="flex-1 flex gap-4 min-h-0">
          {/* Conversation list */}
          <div className={`${selectedConvId ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-[340px] flex-shrink-0 rounded-xl border border-black/[0.06] bg-background overflow-hidden`}>
            <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-5 h-5 text-[#C08B5C] animate-spin" />
                </div>
              ) : filteredConvs.length === 0 ? (
                <div className="text-center py-12">
                  <Inbox className="w-8 h-8 text-muted-foreground/20 mx-auto mb-2" />
                  <p className="text-[12px] text-muted-foreground/40">No conversations</p>
                </div>
              ) : (
                filteredConvs.map(conv => {
                  const meta = CHANNEL_META[conv.channel] || CHANNEL_META.email;
                  const Icon = meta.icon;
                  const isSelected = conv.id === selectedConvId;
                  const hasUnread = (conv.unread_count || 0) > 0;
                  return (
                    <button
                      key={conv.id}
                      onClick={() => setSelectedConvId(conv.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left border-b border-black/[0.04] transition-colors ${
                        isSelected ? 'bg-[#C08B5C]/[0.06]' : 'hover:bg-black/[0.02]'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        hasUnread ? 'bg-[#C08B5C]/10' : 'bg-black/[0.03]'
                      }`}>
                        <Icon className={`w-4 h-4 ${hasUnread ? 'text-[#C08B5C]' : 'text-muted-foreground/40'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className={`text-[12px] truncate ${hasUnread ? 'font-semibold text-foreground' : 'text-foreground/70'}`}>
                            {conv.professional_name || 'Unknown'}
                          </span>
                          <span className="text-[9px] text-muted-foreground/40 flex-shrink-0 ml-2">
                            {formatTime(conv.last_message_at)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className={`text-[9px] font-medium ${meta.color}`}>{meta.label}</span>
                          {hasUnread && (
                            <span className="inline-flex items-center justify-center min-w-[14px] h-[14px] rounded-full bg-[#C08B5C] text-[#0A0A0C] text-[8px] font-bold px-1">
                              {conv.unread_count}
                            </span>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/25 flex-shrink-0" />
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Message thread */}
          <div className={`${selectedConvId ? 'flex' : 'hidden md:flex'} flex-col flex-1 rounded-xl border border-black/[0.06] bg-background overflow-hidden`}>
            {!selectedConvId ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <Inbox className="w-10 h-10 text-muted-foreground/15 mx-auto mb-3" />
                  <p className="text-[13px] text-muted-foreground/40">Select a conversation</p>
                </div>
              </div>
            ) : (
              <>
                {/* Thread header */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-black/[0.06]">
                  <button
                    onClick={() => setSelectedConvId(null)}
                    className="md:hidden w-7 h-7 rounded-lg hover:bg-black/[0.03] flex items-center justify-center"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                  {selectedConv && (
                    <>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        selectedConv.channel === 'email' ? 'bg-red-500/10' : selectedConv.channel === 'sms' ? 'bg-green-500/10' : 'bg-emerald-500/10'
                      }`}>
                        {React.createElement(CHANNEL_META[selectedConv.channel]?.icon || Mail, {
                          className: `w-4 h-4 ${CHANNEL_META[selectedConv.channel]?.color || 'text-muted-foreground'}`,
                        })}
                      </div>
                      <div>
                        <div className="text-[13px] font-medium text-foreground/80">{selectedConv.professional_name || 'Unknown'}</div>
                        <div className="text-[10px] text-muted-foreground/50">{CHANNEL_META[selectedConv.channel]?.label}</div>
                      </div>
                    </>
                  )}
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3" style={{ scrollbarWidth: 'thin' }}>
                  {messagesLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-5 h-5 text-[#C08B5C] animate-spin" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-[12px] text-muted-foreground/40">No messages yet</p>
                    </div>
                  ) : (
                    <AnimatePresence initial={false}>
                      {messages.map(msg => {
                        const isOutbound = msg.direction === 'outbound';
                        return (
                          <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${isOutbound ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`max-w-[75%] rounded-xl px-3.5 py-2.5 ${
                              isOutbound
                                ? 'bg-[#C08B5C]/10 border border-[#C08B5C]/15'
                                : 'bg-black/[0.03] border border-black/[0.06]'
                            }`}>
                              <p className="text-[12px] text-foreground/80 leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                              <p className="text-[9px] text-muted-foreground/40 mt-1">{formatTime(msg.created_at)}</p>
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  )}
                </div>

                {/* Reply input */}
                <div className="px-4 py-3 border-t border-black/[0.06]">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && !e.shiftKey && replyText.trim()) {
                          e.preventDefault();
                          setReplyText('');
                        }
                      }}
                      placeholder="Type a reply..."
                      className="flex-1 px-3 py-2 rounded-lg bg-black/[0.02] border border-black/[0.06] text-[12px] text-foreground/80 placeholder:text-muted-foreground/40 focus:outline-none focus:border-[#C08B5C]/20"
                    />
                    <button
                      disabled={!replyText.trim()}
                      className="w-8 h-8 rounded-lg bg-[#C08B5C] flex items-center justify-center disabled:opacity-30 hover:bg-[#D4A27F] transition-colors"
                    >
                      <Send className="w-3.5 h-3.5 text-[#0A0A0C]" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
