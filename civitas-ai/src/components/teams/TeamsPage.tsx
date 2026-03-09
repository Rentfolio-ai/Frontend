import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Users, UserPlus, Mail, Send, Search, X, Phone, Plus, Trash2,
  MessageCircle, ChevronRight, ChevronDown, Crown, Handshake,
  Lightbulb, Home, MapPin, Percent, DollarSign, ArrowLeft,
  Paperclip, Building2, Landmark, Hammer, TreePine,
  Construction, ArrowRightLeft,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import {
  teamsService,
  type TeamDetail, type TeamMember,
  type MemberRole, type ChatMessage, type EmailMessage, type EmailThread,
  type PropertyType, type PropertyStatus,
} from '../../services/teamsApi';
import { GoogleMeetIcon, ZoomIcon, GmailIcon, OutlookIcon } from '../integrations/BrandIcons';

/* ── Role metadata ── */

const ROLE_META: Record<string, { label: string; icon: React.FC<{ className?: string }> }> = {
  lead_investor: { label: 'Lead Investor', icon: Crown },
  partner: { label: 'Partner', icon: Handshake },
  advisor: { label: 'Advisor', icon: Lightbulb },
};

/* ── Property type metadata ── */

const PROPERTY_TYPE_META: Record<PropertyType, { label: string; icon: React.FC<{ className?: string }>; bg: string; text: string }> = {
  short_term_rental: { label: 'Short-Term Rental', icon: Home, bg: 'bg-[#FF5A5F]/10', text: 'text-[#FF5A5F]' },
  long_term_rental: { label: 'Long-Term Rental', icon: Building2, bg: 'bg-[#3B82F6]/10', text: 'text-[#3B82F6]' },
  flip: { label: 'Flip', icon: Hammer, bg: 'bg-amber-400/10', text: 'text-amber-400' },
  land: { label: 'Land', icon: TreePine, bg: 'bg-emerald-400/10', text: 'text-emerald-400' },
  development: { label: 'Development', icon: Construction, bg: 'bg-purple-400/10', text: 'text-purple-400' },
  wholesale: { label: 'Wholesale', icon: ArrowRightLeft, bg: 'bg-teal-400/10', text: 'text-teal-400' },
};

/* ── Property status metadata ── */

const PROPERTY_STATUS_META: Record<PropertyStatus, { label: string; dot: string }> = {
  sourcing: { label: 'Sourcing', dot: 'bg-white/30' },
  under_contract: { label: 'Under Contract', dot: 'bg-amber-400' },
  renovating: { label: 'Renovating', dot: 'bg-orange-400' },
  listed: { label: 'Listed', dot: 'bg-blue-400' },
  rented: { label: 'Rented', dot: 'bg-indigo-400' },
  earning: { label: 'Earning', dot: 'bg-emerald-400' },
  sold: { label: 'Sold', dot: 'bg-green-500' },
  closed: { label: 'Closed', dot: 'bg-black/12' },
};

/* ── Meeting link detection ── */

type MeetingPlatform = 'zoom' | 'google_meet' | 'generic';

function detectMeetingPlatform(url: string): MeetingPlatform {
  if (/zoom\.(us|com)/i.test(url)) return 'zoom';
  if (/meet\.google\.com/i.test(url)) return 'google_meet';
  return 'generic';
}

const MEETING_CONFIG: Record<MeetingPlatform, {
  label: string; icon: React.FC<{ className?: string }>; bg: string; text: string;
}> = {
  zoom: { label: 'Zoom', icon: ZoomIcon, bg: 'bg-[#2D8CFF]/10', text: 'text-[#2D8CFF]' },
  google_meet: { label: 'Meet', icon: GoogleMeetIcon, bg: 'bg-[#00897B]/10', text: 'text-[#00897B]' },
  generic: { label: 'Call', icon: Phone, bg: 'bg-[#C08B5C]/10', text: 'text-[#C08B5C]' },
};

interface LocalProperty {
  id: string;
  name: string;
  address: string;
  propertyType: PropertyType;
  platform?: string;
  equitySplit: string;
  status: PropertyStatus;
  purchasePrice?: number;
  monthlyRevenue: number | null;
  partnerId: string;
}

/* ── Helpers ── */

function getInitials(member: TeamMember): string {
  if (member.name) return member.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  return member.email.slice(0, 2).toUpperCase();
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 86_400_000) return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  if (diff < 7 * 86_400_000) return d.toLocaleDateString([], { weekday: 'short' });
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' });
}

function formatCurrency(cents: number): string {
  return `$${(cents / 100).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

/* ── Component ── */

interface TeamsPageProps { onBack: () => void; }

export const TeamsPage: React.FC<TeamsPageProps> = ({ onBack: _onBack }) => {
  const { user } = useAuth();
  const userId = user?.id || '';
  const userEmail = user?.email || 'you@example.com';

  const [team, setTeam] = useState<TeamDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showInvite, setShowInvite] = useState(false);
  type DetailTab = 'chat' | 'email' | 'properties';
  const [detailTab, setDetailTab] = useState<DetailTab>('chat');

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState<MemberRole>('partner');
  const [inviting, setInviting] = useState(false);

  const [chatStore, setChatStore] = useState<Record<string, ChatMessage[]>>({});
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [emailStore, setEmailStore] = useState<Record<string, EmailThread>>({});
  const [expandedEmailId, setExpandedEmailId] = useState<string | null>(null);
  const [showCompose, setShowCompose] = useState(false);
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');

  const [propertiesStore, setPropertiesStore] = useState<Record<string, LocalProperty[]>>({});
  const [showNewProperty, setShowNewProperty] = useState(false);
  const [newPropName, setNewPropName] = useState('');
  const [newPropAddress, setNewPropAddress] = useState('');
  const [newPropType, setNewPropType] = useState<PropertyType>('long_term_rental');
  const [newPropEquity, setNewPropEquity] = useState('50/50');
  const [newPropStatus, setNewPropStatus] = useState<PropertyStatus>('sourcing');

  const loadTeam = useCallback(async () => {
    if (!userId) return;
    try {
      const { teams } = await teamsService.listTeams(userId);
      if (teams.length > 0) {
        const detail = await teamsService.getTeam(teams[0].id, userId);
        setTeam(detail);
      } else {
        const created = await teamsService.createTeam(userId, { name: 'My Partnership', description: 'Investment partnership hub' });
        const detail = await teamsService.getTeam(created.id, userId);
        setTeam(detail);
      }
    } catch (err) {
      console.error('Failed to load team:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { loadTeam(); }, [loadTeam]);

  useEffect(() => {
    if (!team) return;
    const partners = team.members.filter(m => m.user_id !== userId);
    if (!selectedPartnerId && partners.length > 0) setSelectedPartnerId(partners[0].id);

    const loadPartnerData = async () => {
      const newChat: Record<string, ChatMessage[]> = {};
      const newEmail: Record<string, EmailThread> = {};
      const newProps: Record<string, LocalProperty[]> = {};

      await Promise.all(partners.map(async (p) => {
        try {
          const { messages } = await teamsService.getMessages(team.id, p.id, userId);
          newChat[p.id] = messages.map(m => ({
            id: m.id,
            senderId: m.sender_id,
            senderName: m.sender_id === userId ? 'You' : (p.name || p.email),
            text: m.text,
            timestamp: m.created_at,
            status: 'read' as const,
          }));
        } catch { newChat[p.id] = []; }

        try {
          const { emails } = await teamsService.getEmails(team.id, p.id, userId);
          newEmail[p.id] = {
            partnerId: p.id,
            messages: emails.map(e => ({
              id: e.id,
              from: e.sender_id === userId ? userEmail : p.email,
              to: e.sender_id === userId ? p.email : userEmail,
              subject: e.subject,
              body: e.body,
              timestamp: e.created_at,
              provider: (e.sender_id === userId ? 'sent' : 'gmail') as 'gmail' | 'outlook' | 'sent',
              read: true,
            })),
          };
        } catch { newEmail[p.id] = { partnerId: p.id, messages: [] }; }
      }));

      try {
        const { projects } = await teamsService.listProjects(team.id, userId);
        partners.forEach(p => {
          newProps[p.id] = projects
            .filter(proj => proj.member_ids?.includes(p.id) || true)
            .map(proj => ({
              id: proj.id,
              name: proj.name,
              address: proj.property_address || '',
              propertyType: 'long_term_rental' as PropertyType,
              equitySplit: '50/50',
              status: (proj.status || 'sourcing') as PropertyStatus,
              purchasePrice: undefined,
              monthlyRevenue: null,
              partnerId: p.id,
            }));
        });
      } catch {
        partners.forEach(p => { newProps[p.id] = []; });
      }

      setChatStore(newChat);
      setEmailStore(newEmail);
      setPropertiesStore(newProps);
    };

    loadPartnerData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [team]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatStore, selectedPartnerId, detailTab]);

  /* ── Handlers ── */

  const handleInvite = async () => {
    if (!team || !inviteEmail.trim()) return;
    setInviting(true);
    try {
      await teamsService.inviteMember(team.id, userId, {
        email: inviteEmail.trim(), name: inviteName.trim() || undefined, role: inviteRole,
      });
      setInviteEmail(''); setInviteName(''); setShowInvite(false);
      await loadTeam();
    } catch (err) { console.error('Failed to invite:', err); }
    finally { setInviting(false); }
  };

  const handleRemovePartner = async (memberId: string) => {
    if (!team || !window.confirm('Remove this partner?')) return;
    try {
      await teamsService.removeMember(team.id, memberId, userId);
      if (selectedPartnerId === memberId) setSelectedPartnerId(null);
      await loadTeam();
    } catch (err) { console.error('Failed to remove:', err); }
  };

  const handleSendChat = async () => {
    if (!chatInput.trim() || !selectedPartnerId || !team) return;
    const text = chatInput.trim();
    setChatInput('');
    const optimisticMsg: ChatMessage = {
      id: `temp-${Date.now()}`, senderId: userId, senderName: 'You',
      text, timestamp: new Date().toISOString(), status: 'sent',
    };
    setChatStore(prev => ({ ...prev, [selectedPartnerId!]: [...(prev[selectedPartnerId!] || []), optimisticMsg] }));
    try {
      const result = await teamsService.sendMessage(team.id, userId, selectedPartnerId, text, userId);
      setChatStore(prev => ({
        ...prev,
        [selectedPartnerId!]: (prev[selectedPartnerId!] || []).map(m =>
          m.id === optimisticMsg.id ? { ...m, id: result.id, status: 'delivered' as const } : m
        ),
      }));
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const handleSendEmail = async () => {
    if (!composeSubject.trim() || !composeBody.trim() || !selectedPartnerId || !team) return;
    const partner = members.find(m => m.id === selectedPartnerId);
    if (!partner) return;
    const subject = composeSubject.trim();
    const body = composeBody.trim();
    setComposeSubject(''); setComposeBody(''); setShowCompose(false);
    const optimisticEmail: EmailMessage = {
      id: `temp-${Date.now()}`, from: userEmail, to: partner.email,
      subject, body, timestamp: new Date().toISOString(), provider: 'sent', read: true,
    };
    setEmailStore(prev => ({
      ...prev,
      [selectedPartnerId!]: { partnerId: selectedPartnerId!, messages: [...(prev[selectedPartnerId!]?.messages || []), optimisticEmail] },
    }));
    try {
      const result = await teamsService.sendEmail(team.id, userId, selectedPartnerId, subject, body, userId);
      setEmailStore(prev => ({
        ...prev,
        [selectedPartnerId!]: {
          partnerId: selectedPartnerId!,
          messages: (prev[selectedPartnerId!]?.messages || []).map(e =>
            e.id === optimisticEmail.id ? { ...e, id: result.id } : e
          ),
        },
      }));
    } catch (err) {
      console.error('Failed to send email:', err);
    }
  };

  const handleAddProperty = async () => {
    if (!newPropName.trim() || !selectedPartnerId || !team) return;
    const name = newPropName.trim();
    const address = newPropAddress.trim();
    setNewPropName(''); setNewPropAddress(''); setShowNewProperty(false);
    try {
      const result = await teamsService.createProject(team.id, userId, {
        name,
        property_address: address || undefined,
        member_ids: [selectedPartnerId],
      });
      const prop: LocalProperty = {
        id: result.id, name: result.name, address: result.property_address || '',
        propertyType: newPropType, equitySplit: newPropEquity,
        status: (result.status || 'sourcing') as PropertyStatus,
        monthlyRevenue: null, partnerId: selectedPartnerId,
      };
      setPropertiesStore(prev => ({ ...prev, [selectedPartnerId!]: [...(prev[selectedPartnerId!] || []), prop] }));
    } catch (err) {
      console.error('Failed to add property:', err);
    }
  };

  const handleDeleteProperty = async (propId: string) => {
    if (!selectedPartnerId || !team) return;
    setPropertiesStore(prev => ({
      ...prev, [selectedPartnerId!]: (prev[selectedPartnerId!] || []).filter(p => p.id !== propId),
    }));
    try {
      await teamsService.deleteProject(team.id, propId, userId);
    } catch (err) {
      console.error('Failed to delete property:', err);
    }
  };

  /* ── Derived ── */

  const members = team?.members || [];
  const partners = members.filter(m => m.user_id !== userId);
  const filteredPartners = partners.filter(p =>
    !searchQuery || (p.name || p.email).toLowerCase().includes(searchQuery.toLowerCase())
  );
  const selectedPartner = partners.find(p => p.id === selectedPartnerId) || null;
  const selectedChat = selectedPartnerId ? (chatStore[selectedPartnerId] || []) : [];
  const selectedEmails = selectedPartnerId ? (emailStore[selectedPartnerId]?.messages || []) : [];
  const selectedProperties = selectedPartnerId ? (propertiesStore[selectedPartnerId] || []) : [];

  const partnershipSummary = {
    totalProperties: selectedProperties.length,
    totalRevenue: selectedProperties.reduce((sum, p) => sum + (p.monthlyRevenue || 0), 0),
    totalValue: selectedProperties.reduce((sum, p) => sum + (p.purchasePrice || 0), 0),
  };

  const allProperties = Object.values(propertiesStore).flat();
  const globalSummary = {
    totalPartners: partners.length,
    totalProperties: allProperties.length,
    totalRevenue: allProperties.reduce((s, p) => s + (p.monthlyRevenue || 0), 0),
  };

  /* ── Styles ── */

  const inputClasses = 'w-full px-3 py-2 rounded-lg bg-black/[0.03] border border-black/[0.06] text-[13px] text-foreground/80 placeholder-muted-foreground/40 focus:outline-none focus:border-[#C08B5C]/30';
  const labelClasses = 'text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 mb-1.5 block';

  if (loading) {
    return (
      <div className="h-full overflow-y-auto bg-background" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(0,0,0,0.06) transparent' }}>
        <div className="max-w-[900px] mx-auto px-6 py-8 space-y-5">
          <div className="h-7 w-40 rounded bg-black/[0.02] animate-pulse" />
          <div className="h-4 w-56 rounded bg-black/[0.02] animate-pulse" />
          <div className="grid grid-cols-3 gap-1">
            {[...Array(3)].map((_, i) => <div key={i} className="h-16 rounded-lg bg-black/[0.02] animate-pulse" />)}
          </div>
          <div className="space-y-1">
            {[...Array(3)].map((_, i) => <div key={i} className="h-20 rounded-xl bg-black/[0.02] animate-pulse" />)}
          </div>
        </div>
      </div>
    );
  }

  /* ── Partner Detail View ── */
  if (selectedPartner) {
    const partnerRole = ROLE_META[selectedPartner.role] || { label: selectedPartner.role, icon: Users };
    const PartnerRoleIcon = partnerRole.icon;

    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="h-full overflow-y-auto bg-background relative overflow-x-hidden"
        style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(0,0,0,0.06) transparent' }}
      >

        <div className="max-w-[900px] mx-auto px-6 py-8 space-y-6 relative z-10">

          {/* Back + partner name */}
          <div>
            <button
              onClick={() => { setSelectedPartnerId(null); setDetailTab('chat'); }}
              className="flex items-center gap-1.5 text-[12px] text-muted-foreground/50 hover:text-muted-foreground mb-3 -ml-0.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to partners
            </button>
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-black/[0.05] flex items-center justify-center">
                  <span className="text-[12px] font-bold text-muted-foreground">{getInitials(selectedPartner)}</span>
                </div>
                <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-border ${selectedPartner.status === 'active' ? 'bg-emerald-400' : 'bg-black/12'
                  }`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="text-[22px] font-semibold text-foreground tracking-[-0.02em] truncate">{selectedPartner.name || selectedPartner.email}</h1>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/[0.03] text-[10px] font-semibold text-muted-foreground/70 flex-shrink-0">
                    <PartnerRoleIcon className="w-3 h-3" /> {partnerRole.label}
                  </span>
                </div>
                <p className="text-[12px] text-muted-foreground/60">{selectedPartner.email}</p>
              </div>
            </div>
          </div>

          {/* Profile card */}
          <div className="rounded-xl bg-black/[0.02] border border-black/[0.04] p-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/70">
                <Mail className="w-3 h-3" /> {selectedPartner.email}
              </div>
              {selectedPartner.phone && (
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/70">
                  <Phone className="w-3 h-3" /> {selectedPartner.phone}
                </div>
              )}
              {selectedPartner.external_link && (() => {
                const plat = detectMeetingPlatform(selectedPartner.external_link);
                const cfg = MEETING_CONFIG[plat];
                const PlatIcon = cfg.icon;
                return (
                  <button onClick={() => window.open(selectedPartner!.external_link!, '_blank')}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${cfg.bg} text-[10px] font-semibold ${cfg.text}`}>
                    <PlatIcon className="w-3.5 h-3.5" /> {cfg.label}
                  </button>
                );
              })()}
              <button onClick={() => handleRemovePartner(selectedPartner.id)}
                className="flex items-center gap-1.5 text-[10px] text-red-400/30 hover:text-red-400/70 ml-auto">
                <Trash2 className="w-3 h-3" /> Remove
              </button>
            </div>
          </div>

          <div>
            <div className="text-[11px] text-[#C08B5C] font-semibold tracking-[0.1em] uppercase mb-2">Partnership</div>
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-xl bg-background border border-black/[0.05] px-4 py-3.5 text-center">
                <div className="text-[18px] font-semibold text-foreground/85 tabular-nums">{partnershipSummary.totalProperties}</div>
                <div className="text-[10px] text-muted-foreground/50 mt-0.5">Properties</div>
              </div>
              <div className="rounded-xl bg-background border border-black/[0.05] px-4 py-3.5 text-center">
                <div className="text-[17px] font-semibold text-foreground/85 tabular-nums">{formatCurrency(partnershipSummary.totalValue)}</div>
                <div className="text-[10px] text-muted-foreground/50 mt-0.5">Total Value</div>
              </div>
              <div className="rounded-xl bg-background border border-black/[0.05] px-4 py-3.5 text-center">
                <div className="text-[17px] font-semibold text-emerald-400/70 tabular-nums">${partnershipSummary.totalRevenue.toLocaleString()}/mo</div>
                <div className="text-[10px] text-muted-foreground/50 mt-0.5">Revenue</div>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-6 border-b border-black/[0.06] mb-5">
              {(['chat', 'email', 'properties'] as const).map(tab => (
                <button key={tab} onClick={() => setDetailTab(tab)}
                  className={`flex items-center gap-1.5 pb-2.5 text-[13px] font-medium border-b-2 transition-colors ${detailTab === tab ? 'border-[#C08B5C] text-foreground/85' : 'border-transparent text-muted-foreground/50 hover:text-muted-foreground'
                    }`}>
                  {tab === 'chat' && <MessageCircle className="w-3.5 h-3.5" />}
                  {tab === 'email' && <Mail className="w-3.5 h-3.5" />}
                  {tab === 'properties' && <Home className="w-3.5 h-3.5" />}
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* Chat tab */}
            {detailTab === 'chat' && (
              <div>
                <div className="rounded-xl bg-black/[0.02] border border-black/[0.04] overflow-hidden">
                  <div className="max-h-[500px] overflow-y-auto px-4 py-3 space-y-1" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(0,0,0,0.06) transparent' }}>
                    {selectedChat.length === 0 ? (
                      <div className="text-center py-12">
                        <MessageCircle className="w-7 h-7 text-white/8 mx-auto mb-2" />
                        <p className="text-[12px] text-muted-foreground/40">No messages yet</p>
                      </div>
                    ) : selectedChat.map((msg, i) => {
                      const isOwn = msg.senderId === userId;
                      const showDateSep = i === 0 || new Date(msg.timestamp).toDateString() !== new Date(selectedChat[i - 1].timestamp).toDateString();
                      return (
                        <React.Fragment key={msg.id}>
                          {showDateSep && (
                            <div className="flex items-center justify-center py-3">
                              <span className="text-[10px] text-muted-foreground/40 font-medium px-3 py-0.5 rounded-full bg-black/[0.02]">{formatDate(msg.timestamp)}</span>
                            </div>
                          )}
                          <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[75%] px-3.5 py-2 rounded-2xl ${isOwn ? 'bg-[#C08B5C]/15 text-foreground/85 rounded-br-md border border-[#C08B5C]/10'
                              : 'bg-black/[0.03] text-foreground/75 rounded-bl-md border border-black/[0.04]'
                              }`}>
                              <p className="text-[13px] leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                              <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                                <span className="text-[9px] text-muted-foreground/40">{formatTime(msg.timestamp)}</span>
                              </div>
                            </div>
                          </div>
                        </React.Fragment>
                      );
                    })}
                    <div ref={chatEndRef} />
                  </div>

                  <div className="px-3 py-2.5 border-t border-black/[0.04]">
                    <div className="flex items-center gap-2 rounded-xl bg-black/[0.02] border border-black/[0.06] px-3 py-2">
                      <button className="p-1 rounded hover:bg-black/[0.03] text-muted-foreground/40 hover:text-muted-foreground/70">
                        <Paperclip className="w-4 h-4" />
                      </button>
                      <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendChat(); } }}
                        placeholder="Type a message..."
                        className="flex-1 bg-transparent text-[13px] text-foreground/80 placeholder-muted-foreground/40 focus:outline-none" />
                      <button onClick={handleSendChat} disabled={!chatInput.trim()}
                        className="p-1.5 rounded-lg bg-[#C08B5C] text-[#0A0A0C] disabled:opacity-30">
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Email tab */}
            {detailTab === 'email' && (
              <div className="space-y-2">
                <div className="flex justify-end mb-1">
                  <button onClick={() => setShowCompose(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#C08B5C] text-[#0A0A0C] text-[11px] font-bold">
                    <Mail className="w-3 h-3" /> Compose
                  </button>
                </div>

                {showCompose && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="w-full max-w-lg rounded-2xl bg-popover border border-black/[0.08] p-5 shadow-2xl mx-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-[14px] font-semibold text-foreground/85">New Email</h3>
                        <button onClick={() => { setShowCompose(false); setComposeSubject(''); setComposeBody(''); }}
                          className="p-1 rounded-lg hover:bg-black/[0.03] text-muted-foreground/50"><X className="w-4 h-4" /></button>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-[12px]">
                          <span className="text-muted-foreground/50 w-10">To:</span>
                          <span className="text-muted-foreground">{selectedPartner.email}</span>
                        </div>
                        <input type="text" value={composeSubject} onChange={e => setComposeSubject(e.target.value)}
                          placeholder="Subject" className={inputClasses} />
                        <textarea value={composeBody} onChange={e => setComposeBody(e.target.value)}
                          placeholder="Write your message..." rows={6} className={`${inputClasses} resize-none`} />
                        <div className="flex justify-end gap-2 pt-1">
                          <button onClick={() => { setShowCompose(false); setComposeSubject(''); setComposeBody(''); }}
                            className="px-4 py-1.5 text-[11px] text-muted-foreground/50 hover:text-muted-foreground">Cancel</button>
                          <button onClick={handleSendEmail} disabled={!composeSubject.trim() || !composeBody.trim()}
                            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#C08B5C] text-[#0A0A0C] text-[11px] font-bold disabled:opacity-40">
                            <Send className="w-3 h-3" /> Send
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedEmails.length === 0 ? (
                  <div className="text-center py-12">
                    <Mail className="w-7 h-7 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-[12px] text-muted-foreground/40">No email history yet</p>
                  </div>
                ) : selectedEmails.map(email => {
                  const isExpanded = expandedEmailId === email.id;
                  const isSent = email.provider === 'sent';
                  const ProviderIcon = email.provider === 'gmail' ? GmailIcon : email.provider === 'outlook' ? OutlookIcon : Mail;
                  const borderAccent = email.provider === 'gmail' ? 'border-l-[#EA4335]/30' : email.provider === 'outlook' ? 'border-l-[#0078D4]/30' : 'border-l-[#C08B5C]/30';
                  return (
                    <div key={email.id} className={`rounded-xl border border-l-2 ${borderAccent} ${email.read ? 'border-black/[0.04] bg-black/[0.02]' : 'border-black/[0.08] bg-black/[0.02]'
                      }`}>
                      <button onClick={() => setExpandedEmailId(isExpanded ? null : email.id)}
                        className="w-full flex items-start gap-3 px-4 py-3 text-left">
                        <div className="flex-shrink-0 mt-0.5">
                          {isSent ? (
                            <div className="w-6 h-6 rounded-full bg-[#C08B5C]/10 flex items-center justify-center"><Send className="w-3 h-3 text-[#C08B5C]" /></div>
                          ) : (
                            <div className="w-6 h-6 rounded flex items-center justify-center"><ProviderIcon className="w-5 h-5" /></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className={`text-[12px] truncate ${email.read ? 'text-muted-foreground' : 'text-foreground/80 font-medium'}`}>
                              {isSent ? `To: ${email.to}` : `From: ${email.from}`}
                            </span>
                            <span className="text-[10px] text-muted-foreground/40 flex-shrink-0 ml-2">{formatTime(email.timestamp)}</span>
                          </div>
                          <div className={`text-[13px] truncate mt-0.5 ${email.read ? 'text-muted-foreground/70' : 'text-foreground/70 font-medium'}`}>{email.subject}</div>
                          {!isExpanded && <div className="text-[11px] text-muted-foreground/40 truncate mt-0.5">{email.body.split('\n')[0]}</div>}
                        </div>
                        <div className="flex-shrink-0 mt-1">
                          {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground/40" /> : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40" />}
                        </div>
                      </button>
                      {isExpanded && (
                        <div className="px-4 pb-4 pl-[52px]">
                          <div className="border-t border-black/[0.04] pt-3">
                            <pre className="text-[12px] text-muted-foreground leading-relaxed whitespace-pre-wrap font-sans">{email.body}</pre>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Properties tab */}
            {detailTab === 'properties' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-muted-foreground/50 font-medium">{selectedProperties.length} shared properties</span>
                  <button onClick={() => setShowNewProperty(!showNewProperty)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/[0.03] hover:bg-black/[0.05] text-[11px] text-muted-foreground/70 hover:text-muted-foreground">
                    <Plus className="w-3 h-3" /> Add
                  </button>
                </div>

                {showNewProperty && (
                  <div className="rounded-xl bg-black/[0.02] border border-black/[0.04] p-4 space-y-3">
                    <div>
                      <label className={labelClasses}>Name *</label>
                      <input type="text" value={newPropName} onChange={e => setNewPropName(e.target.value)}
                        placeholder="e.g. Phoenix 4-Plex" className={inputClasses} />
                    </div>
                    <div>
                      <label className={labelClasses}>Address</label>
                      <input type="text" value={newPropAddress} onChange={e => setNewPropAddress(e.target.value)}
                        placeholder="2840 N 32nd St, Phoenix, AZ" className={inputClasses} />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className={labelClasses}>Type</label>
                        <select value={newPropType} onChange={e => setNewPropType(e.target.value as PropertyType)}
                          className={`${inputClasses} appearance-none`}>
                          <option value="short_term_rental">Short-Term Rental</option>
                          <option value="long_term_rental">Long-Term Rental</option>
                          <option value="flip">Flip</option>
                          <option value="land">Land</option>
                          <option value="development">Development</option>
                          <option value="wholesale">Wholesale</option>
                        </select>
                      </div>
                      <div>
                        <label className={labelClasses}>Equity Split</label>
                        <input type="text" value={newPropEquity} onChange={e => setNewPropEquity(e.target.value)}
                          placeholder="60/40" className={inputClasses} />
                      </div>
                    </div>
                    <div>
                      <label className={labelClasses}>Status</label>
                      <select value={newPropStatus} onChange={e => setNewPropStatus(e.target.value as PropertyStatus)}
                        className={`${inputClasses} appearance-none`}>
                        <option value="sourcing">Sourcing</option>
                        <option value="under_contract">Under Contract</option>
                        <option value="renovating">Renovating</option>
                        <option value="listed">Listed</option>
                        <option value="rented">Rented</option>
                        <option value="earning">Earning</option>
                        <option value="sold">Sold</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setShowNewProperty(false)} className="flex-1 py-1.5 text-[11px] text-muted-foreground/50 hover:text-muted-foreground">Cancel</button>
                      <button onClick={handleAddProperty} disabled={!newPropName.trim()}
                        className="flex-1 py-1.5 rounded-lg bg-[#C08B5C] text-[#0A0A0C] text-[11px] font-bold disabled:opacity-40">
                        Add Property
                      </button>
                    </div>
                  </div>
                )}

                {selectedProperties.length === 0 ? (
                  <div className="text-center py-12">
                    <Home className="w-7 h-7 text-white/8 mx-auto mb-2" />
                    <p className="text-[12px] text-muted-foreground/40">No shared properties yet</p>
                  </div>
                ) : selectedProperties.map(prop => {
                  const typeMeta = PROPERTY_TYPE_META[prop.propertyType];
                  const statusMeta = PROPERTY_STATUS_META[prop.status];
                  const TypeIcon = typeMeta.icon;
                  return (
                    <div key={prop.id} className="rounded-xl bg-black/[0.02] border border-black/[0.04] p-4 hover:bg-black/[0.03] transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${typeMeta.bg}`}>
                            <TypeIcon className={`w-4 h-4 ${typeMeta.text}`} />
                          </div>
                          <div>
                            <span className="text-[13px] font-medium text-foreground/75">{prop.name}</span>
                            {prop.address && (
                              <div className="flex items-center gap-1 mt-0.5">
                                <MapPin className="w-3 h-3 text-muted-foreground/40" />
                                <span className="text-[10px] text-muted-foreground/50">{prop.address}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <button onClick={() => handleDeleteProperty(prop.id)}
                          className="p-1 rounded hover:bg-red-500/10 text-muted-foreground/30 hover:text-red-400">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap ml-[38px]">
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-semibold ${typeMeta.bg} ${typeMeta.text}`}>
                          {typeMeta.label}
                        </span>
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/[0.03] text-[9px] text-muted-foreground/60">
                          <Percent className="w-2.5 h-2.5" /> {prop.equitySplit}
                        </span>
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/[0.03] text-[9px] text-muted-foreground/60">
                          <div className={`w-1.5 h-1.5 rounded-full ${statusMeta.dot}`} /> {statusMeta.label}
                        </span>
                        {prop.purchasePrice && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/[0.03] text-[9px] text-muted-foreground/60">
                            <Landmark className="w-2.5 h-2.5" /> {formatCurrency(prop.purchasePrice)}
                          </span>
                        )}
                        {prop.monthlyRevenue && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-400/[0.06] text-[9px] text-emerald-400/60">
                            <DollarSign className="w-2.5 h-2.5" /> {prop.monthlyRevenue.toLocaleString()}/mo
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  /* ── Partners List View ── */
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="h-full overflow-y-auto bg-background relative overflow-x-hidden"
      style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(0,0,0,0.06) transparent' }}
    >

      <div className="max-w-[900px] mx-auto px-6 py-8 space-y-6 relative z-10">

        {/* Header */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <h1 className="text-[26px] font-semibold text-foreground tracking-[-0.02em]">Teams</h1>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/40" />
                <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search partners..."
                  className="pl-8 pr-3 py-2 rounded-xl bg-background border border-black/[0.06] text-[12px] text-foreground/70 placeholder-muted-foreground/40 focus:outline-none focus:border-[#C08B5C]/30 w-52" />
              </div>
              <button onClick={() => setShowInvite(!showInvite)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#C08B5C] text-[#0A0A0C] text-[12px] font-bold hover:bg-[#D4A27F] transition-colors">
                <UserPlus className="w-3.5 h-3.5" /> Invite
              </button>
            </div>
          </div>
          <p className="text-[13px] text-muted-foreground/60">
            {partners.length} partner{partners.length !== 1 ? 's' : ''}
            {partners.filter(p => p.status === 'active').length > 0 && (
              <span> · <span className="text-emerald-400/60">{partners.filter(p => p.status === 'active').length} online</span></span>
            )}
          </p>
        </div>

        {/* Invite form */}
        {showInvite && (
          <div className="rounded-xl bg-black/[0.02] border border-black/[0.04] p-4 space-y-3">
            <div className="text-[12px] font-medium text-muted-foreground mb-1">Invite a Partner</div>
            <input type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)}
              placeholder="partner@email.com" className={inputClasses} />
            <input type="text" value={inviteName} onChange={e => setInviteName(e.target.value)}
              placeholder="Name (optional)" className={inputClasses} />
            <select value={inviteRole} onChange={e => setInviteRole(e.target.value as MemberRole)}
              className={`${inputClasses} appearance-none`}>
              <option value="partner">Partner</option>
              <option value="advisor">Advisor</option>
            </select>
            <div className="flex gap-2">
              <button onClick={() => setShowInvite(false)} className="flex-1 py-1.5 text-[11px] text-muted-foreground/50 hover:text-muted-foreground">Cancel</button>
              <button onClick={handleInvite} disabled={inviting || !inviteEmail.trim()}
                className="flex-1 py-1.5 rounded-lg bg-[#C08B5C] text-[#0A0A0C] text-[11px] font-bold disabled:opacity-40">
                {inviting ? 'Sending...' : 'Invite'}
              </button>
            </div>
          </div>
        )}

        {/* KPI strip */}
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-xl bg-background border border-black/[0.05] px-4 py-3.5 text-center">
            <div className="text-[18px] font-semibold text-foreground/85 tabular-nums">{globalSummary.totalPartners}</div>
            <div className="text-[10px] text-muted-foreground/50 mt-0.5">Partners</div>
          </div>
          <div className="rounded-xl bg-background border border-black/[0.05] px-4 py-3.5 text-center">
            <div className="text-[18px] font-semibold text-foreground/85 tabular-nums">{globalSummary.totalProperties}</div>
            <div className="text-[10px] text-muted-foreground/50 mt-0.5">Properties</div>
          </div>
          <div className="rounded-xl bg-background border border-black/[0.05] px-4 py-3.5 text-center">
            <div className="text-[17px] font-semibold text-emerald-400/70 tabular-nums">${globalSummary.totalRevenue.toLocaleString()}/mo</div>
            <div className="text-[10px] text-muted-foreground/50 mt-0.5">Revenue</div>
          </div>
        </div>

        {/* Partners section */}
        <div>
          <div className="text-[11px] text-[#C08B5C] font-semibold tracking-[0.1em] uppercase mb-3">Partners</div>
          {filteredPartners.length === 0 ? (
            partners.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-b from-black/[0.04] to-black/[0.01] border border-black/[0.06] flex items-center justify-center mx-auto mb-4">
                  <UserPlus className="w-7 h-7 text-muted-foreground/30" />
                </div>
                <p className="text-[15px] text-muted-foreground/60 font-medium mb-1">No partners yet</p>
                <p className="text-[12px] text-muted-foreground/40 mb-5 max-w-[260px] mx-auto">Invite investment partners to collaborate on deals and properties.</p>
                <button onClick={() => setShowInvite(true)}
                  className="px-5 py-2 rounded-xl bg-[#C08B5C]/[0.1] border border-[#C08B5C]/20 text-[#C08B5C] text-[12px] font-semibold hover:bg-[#C08B5C]/[0.18] transition-colors">
                  <UserPlus className="w-3 h-3 inline mr-1.5" /> Invite your first partner
                </button>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-[12px] text-muted-foreground/40">No partners match your search.</p>
              </div>
            )
          ) : (
            <div className="space-y-2">
              {filteredPartners.map(partner => {
                const partnerProps = propertiesStore[partner.id] || [];
                const partnerEquity = partnerProps.reduce((s, p) => s + (p.purchasePrice || 0), 0);
                const partnerRevenue = partnerProps.reduce((s, p) => s + (p.monthlyRevenue || 0), 0);
                const lastMsg = (chatStore[partner.id] || []).at(-1);
                const roleMeta = ROLE_META[partner.role] || { label: partner.role, icon: Users };
                const RoleIcon = roleMeta.icon;

                // Detect meeting platform
                const meetingLink = partner.external_link;
                const meetingPlatform = meetingLink ? detectMeetingPlatform(meetingLink) : null;
                const meetingCfg = meetingPlatform ? MEETING_CONFIG[meetingPlatform] : null;
                const MeetingIcon = meetingCfg?.icon;

                return (
                  <button
                    key={partner.id}
                    onClick={() => setSelectedPartnerId(partner.id)}
                    className="w-full rounded-xl bg-background border border-black/[0.05] p-4 hover:border-[#C08B5C]/20 text-left transition-all group"
                  >
                    <div className="flex items-start gap-3.5">
                      {/* Avatar */}
                      <div className="relative flex-shrink-0">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-black/[0.08] to-black/[0.03] flex items-center justify-center">
                          <span className="text-[14px] font-bold text-muted-foreground">{getInitials(partner)}</span>
                        </div>
                        <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background ${partner.status === 'active' ? 'bg-emerald-400' : 'bg-black/12'
                          }`} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        {/* Row 1: Name + role */}
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[14px] font-semibold text-foreground/85 truncate">{partner.name || partner.email}</span>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#C08B5C]/[0.08] text-[9px] font-semibold text-[#C08B5C] flex-shrink-0">
                            <RoleIcon className="w-2.5 h-2.5" /> {roleMeta.label}
                          </span>
                        </div>

                        {/* Row 2: Email */}
                        <p className="text-[11px] text-muted-foreground/50 mb-2">{partner.email}</p>

                        {/* Row 3: Properties summary + meeting link */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[11px] text-muted-foreground/70">
                            {partnerProps.length} properties
                          </span>
                          {partnerEquity > 0 && (
                            <>
                              <span className="text-muted-foreground/30">·</span>
                              <span className="text-[11px] text-muted-foreground/50">{formatCurrency(partnerEquity)} value</span>
                            </>
                          )}
                          {partnerRevenue > 0 && (
                            <>
                              <span className="text-muted-foreground/30">·</span>
                              <span className="text-[11px] text-emerald-400/50">${partnerRevenue.toLocaleString()}/mo</span>
                            </>
                          )}
                          {meetingLink && meetingCfg && MeetingIcon && (
                            <button
                              onClick={(e) => { e.stopPropagation(); window.open(meetingLink, '_blank'); }}
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-semibold ${meetingCfg.bg} ${meetingCfg.text} ml-auto`}
                            >
                              <MeetingIcon className="w-3 h-3" /> {meetingCfg.label}
                            </button>
                          )}
                        </div>

                        {/* Row 4: Last message preview */}
                        {lastMsg && (
                          <p className="text-[11px] text-muted-foreground/40 truncate mt-1.5 border-t border-black/[0.05] pt-1.5">{lastMsg.text}</p>
                        )}
                      </div>

                      <ChevronRight className="w-4 h-4 text-muted-foreground/30 flex-shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Gmail/Outlook sync — compact row */}
        <div className="flex items-center gap-2">
          <button onClick={() => alert('Gmail integration coming soon!')}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-background border border-black/[0.05] hover:border-[#C08B5C]/15 transition-all flex-1">
            <GmailIcon className="w-4 h-4" />
            <span className="text-[11px] text-muted-foreground/70">Connect Gmail</span>
          </button>
          <button onClick={() => alert('Outlook integration coming soon!')}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-background border border-black/[0.05] hover:border-[#C08B5C]/15 transition-all flex-1">
            <OutlookIcon className="w-4 h-4" />
            <span className="text-[11px] text-muted-foreground/70">Connect Outlook</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};
