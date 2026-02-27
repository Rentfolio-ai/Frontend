import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Users, UserPlus, Mail, Send, Search, X, Phone, Plus, Trash2,
  MessageCircle, ChevronRight, ChevronDown, Crown, Handshake,
  Lightbulb, Home, MapPin, Percent, DollarSign, ArrowLeft,
  Paperclip, Building2, Landmark, Hammer, TreePine,
  Construction, ArrowRightLeft, Briefcase,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import {
  teamsService,
  type TeamDetail, type TeamMember,
  type MemberRole, type ChatMessage, type EmailMessage, type EmailThread,
  type PropertyType, type PropertyStatus,
} from '../../services/teamsApi';
import { GoogleMeetIcon, ZoomIcon, GmailIcon, OutlookIcon } from '../integrations/BrandIcons';
import { AmbientBackground } from '../ui/AmbientBackground';

/* ── Role metadata ── */

const ROLE_META: Record<string, { label: string; icon: React.FC<{ className?: string }> }> = {
  lead_investor: { label: 'Lead Investor', icon: Crown },
  partner:       { label: 'Partner',       icon: Handshake },
  advisor:       { label: 'Advisor',       icon: Lightbulb },
};

/* ── Property type metadata ── */

const PROPERTY_TYPE_META: Record<PropertyType, { label: string; icon: React.FC<{ className?: string }>; bg: string; text: string }> = {
  short_term_rental: { label: 'Short-Term Rental', icon: Home,          bg: 'bg-[#FF5A5F]/10', text: 'text-[#FF5A5F]' },
  long_term_rental:  { label: 'Long-Term Rental',  icon: Building2,     bg: 'bg-[#3B82F6]/10', text: 'text-[#3B82F6]' },
  flip:              { label: 'Flip',               icon: Hammer,        bg: 'bg-amber-400/10', text: 'text-amber-400' },
  land:              { label: 'Land',               icon: TreePine,      bg: 'bg-emerald-400/10', text: 'text-emerald-400' },
  development:       { label: 'Development',        icon: Construction,  bg: 'bg-purple-400/10', text: 'text-purple-400' },
  wholesale:         { label: 'Wholesale',          icon: ArrowRightLeft, bg: 'bg-teal-400/10', text: 'text-teal-400' },
};

/* ── Property status metadata ── */

const PROPERTY_STATUS_META: Record<PropertyStatus, { label: string; dot: string }> = {
  sourcing:       { label: 'Sourcing',       dot: 'bg-white/30' },
  under_contract: { label: 'Under Contract', dot: 'bg-amber-400' },
  renovating:     { label: 'Renovating',     dot: 'bg-orange-400' },
  listed:         { label: 'Listed',         dot: 'bg-blue-400' },
  rented:         { label: 'Rented',         dot: 'bg-indigo-400' },
  earning:        { label: 'Earning',        dot: 'bg-emerald-400' },
  sold:           { label: 'Sold',           dot: 'bg-green-500' },
  closed:         { label: 'Closed',         dot: 'bg-white/20' },
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
  zoom:        { label: 'Zoom',  icon: ZoomIcon,       bg: 'bg-[#2D8CFF]/10', text: 'text-[#2D8CFF]' },
  google_meet: { label: 'Meet',  icon: GoogleMeetIcon, bg: 'bg-[#00897B]/10', text: 'text-[#00897B]' },
  generic:     { label: 'Call',  icon: Phone,          bg: 'bg-[#C08B5C]/10', text: 'text-[#C08B5C]' },
};

/* ── Mock data ── */

function mockChatMessages(partnerId: string, partnerName: string, userId: string): ChatMessage[] {
  const now = Date.now();
  const day = 86_400_000;
  return [
    { id: `${partnerId}-c1`, senderId: partnerId, senderName: partnerName, text: `Hey — I just got the appraisal back on that 4-plex in Phoenix. ARV came in at $620K, which puts us right where we need to be for the flip.`, timestamp: new Date(now - 3 * day).toISOString(), status: 'read' },
    { id: `${partnerId}-c2`, senderId: userId, senderName: 'You', text: `That's great news. What's our all-in number looking like with the renovation budget?`, timestamp: new Date(now - 3 * day + 3_600_000).toISOString(), status: 'read' },
    { id: `${partnerId}-c3`, senderId: partnerId, senderName: partnerName, text: `Purchase at $385K + $95K reno = $480K all-in. If we sell at $600K conservative, that's $120K gross profit. 60/40 split puts you at $72K.`, timestamp: new Date(now - 2 * day).toISOString(), status: 'read' },
    { id: `${partnerId}-c4`, senderId: userId, senderName: 'You', text: `I'm in. I also wanted to circle back on the Austin land parcel — the seller accepted our $180K offer. We should talk about the development timeline.`, timestamp: new Date(now - day).toISOString(), status: 'read' },
    { id: `${partnerId}-c5`, senderId: partnerId, senderName: partnerName, text: `Perfect. Let me pull together the numbers for both deals and we can go over everything on our call Thursday. I'll send the partnership docs by email.`, timestamp: new Date(now - 3_600_000).toISOString(), status: 'delivered' },
  ];
}

function mockEmailThread(partnerId: string, partnerName: string, partnerEmail: string, userEmail: string): EmailThread {
  const now = Date.now();
  const day = 86_400_000;
  return {
    partnerId,
    messages: [
      { id: `${partnerId}-e1`, from: partnerEmail, to: userEmail, subject: 'Partnership Agreement — Phoenix 4-Plex Flip', body: `Hi,\n\nAttached is the draft partnership agreement for the Phoenix 4-plex. Key terms:\n\n- 60/40 equity split (you 60%, me 40%)\n- I handle renovation management and contractor coordination\n- You handle financing and deal underwriting\n- Projected timeline: 6 months to flip\n- Exit strategy: sell at ARV or convert to long-term rental if market softens\n\nLet me know if you'd like any changes before we finalize.\n\nBest,\n${partnerName}`, timestamp: new Date(now - 7 * day).toISOString(), provider: 'gmail', read: true },
      { id: `${partnerId}-e2`, from: userEmail, to: partnerEmail, subject: 'Re: Partnership Agreement — Phoenix 4-Plex Flip', body: `Looks solid. Two notes:\n\n1. Let's add a provision that if we convert to rental, we reassess equity based on capital contributed for the conversion\n2. Can you add the contractor payment schedule as an appendix?\n\nOtherwise ready to sign. Also — the land deal in Austin is moving forward. I'll send a separate agreement for that one.\n\nCheers`, timestamp: new Date(now - 5 * day).toISOString(), provider: 'sent', read: true },
      { id: `${partnerId}-e3`, from: partnerEmail, to: userEmail, subject: 'Q4 Revenue Report — Denver Long-Term Rental', body: `Here's the Q4 report for our Denver rental property:\n\n- Gross Rental Income: $8,400 ($2,800/mo)\n- Property Management: $840\n- Maintenance/Repairs: $620\n- Insurance: $450\n- Net Operating Income: $6,490\n\nTenant lease renews in March — they've indicated they want to stay. Cap rate holding steady at 6.8%. Vacancy was 0% this quarter.\n\nI'll schedule the profit distribution for next week.`, timestamp: new Date(now - 2 * day).toISOString(), provider: 'outlook', read: false },
    ],
  };
}

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

function mockProperties(partnerId: string): LocalProperty[] {
  return [
    { id: `${partnerId}-p1`, name: 'Phoenix 4-Plex', address: '2840 N 32nd St, Phoenix, AZ', propertyType: 'flip', equitySplit: '60/40', status: 'renovating', purchasePrice: 385000, monthlyRevenue: null, partnerId },
    { id: `${partnerId}-p2`, name: 'Denver Duplex', address: '1450 Vine St, Denver, CO', propertyType: 'long_term_rental', equitySplit: '50/50', status: 'earning', purchasePrice: 420000, monthlyRevenue: 2800, partnerId },
    { id: `${partnerId}-p3`, name: 'Austin Land Parcel', address: 'Lot 14, Bee Cave Rd, Austin, TX', propertyType: 'land', equitySplit: '70/30', status: 'under_contract', purchasePrice: 180000, monthlyRevenue: null, partnerId },
  ];
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

export const TeamsPage: React.FC<TeamsPageProps> = ({ onBack }) => {
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
    const newChat: Record<string, ChatMessage[]> = {};
    const newEmail: Record<string, EmailThread> = {};
    const newProps: Record<string, LocalProperty[]> = {};
    partners.forEach(p => {
      if (!chatStore[p.id]) newChat[p.id] = mockChatMessages(p.id, p.name || p.email, userId);
      if (!emailStore[p.id]) newEmail[p.id] = mockEmailThread(p.id, p.name || p.email, p.email, userEmail);
      if (!propertiesStore[p.id]) newProps[p.id] = mockProperties(p.id);
    });
    if (Object.keys(newChat).length) setChatStore(prev => ({ ...prev, ...newChat }));
    if (Object.keys(newEmail).length) setEmailStore(prev => ({ ...prev, ...newEmail }));
    if (Object.keys(newProps).length) setPropertiesStore(prev => ({ ...prev, ...newProps }));
    if (!selectedPartnerId && partners.length > 0) setSelectedPartnerId(partners[0].id);
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

  const handleSendChat = () => {
    if (!chatInput.trim() || !selectedPartnerId) return;
    const msg: ChatMessage = {
      id: `${Date.now()}`, senderId: userId, senderName: 'You',
      text: chatInput.trim(), timestamp: new Date().toISOString(), status: 'sent',
    };
    setChatStore(prev => ({ ...prev, [selectedPartnerId!]: [...(prev[selectedPartnerId!] || []), msg] }));
    setChatInput('');
  };

  const handleSendEmail = () => {
    if (!composeSubject.trim() || !composeBody.trim() || !selectedPartnerId) return;
    const partner = members.find(m => m.id === selectedPartnerId);
    if (!partner) return;
    const email: EmailMessage = {
      id: `${Date.now()}`, from: userEmail, to: partner.email,
      subject: composeSubject.trim(), body: composeBody.trim(),
      timestamp: new Date().toISOString(), provider: 'sent', read: true,
    };
    setEmailStore(prev => ({
      ...prev,
      [selectedPartnerId!]: { partnerId: selectedPartnerId!, messages: [...(prev[selectedPartnerId!]?.messages || []), email] },
    }));
    setComposeSubject(''); setComposeBody(''); setShowCompose(false);
  };

  const handleAddProperty = () => {
    if (!newPropName.trim() || !selectedPartnerId) return;
    const prop: LocalProperty = {
      id: `${Date.now()}`, name: newPropName.trim(), address: newPropAddress.trim(),
      propertyType: newPropType, equitySplit: newPropEquity, status: newPropStatus,
      monthlyRevenue: null, partnerId: selectedPartnerId,
    };
    setPropertiesStore(prev => ({ ...prev, [selectedPartnerId!]: [...(prev[selectedPartnerId!] || []), prop] }));
    setNewPropName(''); setNewPropAddress(''); setShowNewProperty(false);
  };

  const handleDeleteProperty = (propId: string) => {
    if (!selectedPartnerId) return;
    setPropertiesStore(prev => ({
      ...prev, [selectedPartnerId!]: (prev[selectedPartnerId!] || []).filter(p => p.id !== propId),
    }));
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

  const inputClasses = 'w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.06] text-[13px] text-white/80 placeholder-white/20 focus:outline-none focus:border-[#C08B5C]/30';
  const labelClasses = 'text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1.5 block';

  if (loading) {
    return (
      <div className="h-full overflow-y-auto bg-[#161619]" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.06) transparent' }}>
        <div className="max-w-3xl mx-auto px-6 py-6 space-y-5">
          <div className="h-7 w-40 rounded bg-white/[0.03] animate-pulse" />
          <div className="h-4 w-56 rounded bg-white/[0.03] animate-pulse" />
          <div className="grid grid-cols-3 gap-1">
            {[...Array(3)].map((_, i) => <div key={i} className="h-16 rounded-lg bg-white/[0.03] animate-pulse" />)}
          </div>
          <div className="space-y-1">
            {[...Array(3)].map((_, i) => <div key={i} className="h-20 rounded-xl bg-white/[0.03] animate-pulse" />)}
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
        className="h-full overflow-y-auto bg-[#161619] relative overflow-x-hidden"
        style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.06) transparent' }}
      >
        <AmbientBackground variant="teams" />

        <div className="max-w-3xl mx-auto px-6 py-6 space-y-5 relative z-10">

          {/* Back + partner name */}
          <div>
            <button
              onClick={() => { setSelectedPartnerId(null); setDetailTab('chat'); }}
              className="flex items-center gap-1.5 text-[12px] text-white/30 hover:text-white/60 mb-3 -ml-0.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to partners
            </button>
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-white/[0.06] flex items-center justify-center">
                  <span className="text-[12px] font-bold text-white/50">{getInitials(selectedPartner)}</span>
                </div>
                <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#161619] ${
                  selectedPartner.status === 'active' ? 'bg-emerald-400' : 'bg-white/20'
                }`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold gradient-text truncate">{selectedPartner.name || selectedPartner.email}</h1>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/[0.04] text-[10px] font-semibold text-white/40 flex-shrink-0">
                    <PartnerRoleIcon className="w-3 h-3" /> {partnerRole.label}
                  </span>
                </div>
                <p className="text-[12px] text-white/35">{selectedPartner.email}</p>
              </div>
            </div>
          </div>

          {/* Profile card */}
          <div className="rounded-xl bg-white/[0.03] border border-white/[0.04] p-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-1.5 text-[11px] text-white/40">
                <Mail className="w-3 h-3" /> {selectedPartner.email}
              </div>
              {selectedPartner.phone && (
                <div className="flex items-center gap-1.5 text-[11px] text-white/40">
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

          {/* Partnership KPIs */}
          <div>
            <div className="text-[12px] text-white/30 font-medium mb-2">Partnership</div>
            <div className="grid grid-cols-3 gap-1">
              <div className="rounded-lg bg-white/[0.03] border border-white/[0.04] px-3 py-2.5 text-center">
                <div className="text-[16px] font-semibold text-white/80">{partnershipSummary.totalProperties}</div>
                <div className="text-[10px] text-white/25">Properties</div>
              </div>
              <div className="rounded-lg bg-white/[0.03] border border-white/[0.04] px-3 py-2.5 text-center">
                <div className="text-[15px] font-semibold text-white/80">{formatCurrency(partnershipSummary.totalValue)}</div>
                <div className="text-[10px] text-white/25">Total Value</div>
              </div>
              <div className="rounded-lg bg-white/[0.03] border border-white/[0.04] px-3 py-2.5 text-center">
                <div className="text-[15px] font-semibold text-emerald-400/70">${partnershipSummary.totalRevenue.toLocaleString()}/mo</div>
                <div className="text-[10px] text-white/25">Revenue</div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div>
            <div className="flex rounded-lg bg-white/[0.03] border border-white/[0.04] p-0.5 mb-4">
              {(['chat', 'email', 'properties'] as const).map(tab => (
                <button key={tab} onClick={() => setDetailTab(tab)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-[12px] font-medium transition-colors ${
                    detailTab === tab ? 'bg-white/[0.06] text-white/80' : 'text-white/30 hover:text-white/50'
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
                <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] overflow-hidden">
                  <div className="max-h-[500px] overflow-y-auto px-4 py-3 space-y-1" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.06) transparent' }}>
                    {selectedChat.length === 0 ? (
                      <div className="text-center py-12">
                        <MessageCircle className="w-7 h-7 text-white/8 mx-auto mb-2" />
                        <p className="text-[12px] text-white/20">No messages yet</p>
                      </div>
                    ) : selectedChat.map((msg, i) => {
                      const isOwn = msg.senderId === userId;
                      const showDateSep = i === 0 || new Date(msg.timestamp).toDateString() !== new Date(selectedChat[i - 1].timestamp).toDateString();
                      return (
                        <React.Fragment key={msg.id}>
                          {showDateSep && (
                            <div className="flex items-center justify-center py-3">
                              <span className="text-[10px] text-white/15 font-medium px-3 py-0.5 rounded-full bg-white/[0.02]">{formatDate(msg.timestamp)}</span>
                            </div>
                          )}
                          <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[75%] px-3.5 py-2 rounded-2xl ${
                              isOwn ? 'bg-[#C08B5C]/15 text-white/85 rounded-br-md border border-[#C08B5C]/10'
                                     : 'bg-white/[0.04] text-white/75 rounded-bl-md border border-white/[0.04]'
                            }`}>
                              <p className="text-[13px] leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                              <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                                <span className="text-[9px] text-white/15">{formatTime(msg.timestamp)}</span>
                              </div>
                            </div>
                          </div>
                        </React.Fragment>
                      );
                    })}
                    <div ref={chatEndRef} />
                  </div>

                  <div className="px-3 py-2.5 border-t border-white/[0.04]">
                    <div className="flex items-center gap-2 rounded-xl bg-white/[0.03] border border-white/[0.06] px-3 py-2">
                      <button className="p-1 rounded hover:bg-white/[0.04] text-white/20 hover:text-white/40">
                        <Paperclip className="w-4 h-4" />
                      </button>
                      <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendChat(); } }}
                        placeholder="Type a message..."
                        className="flex-1 bg-transparent text-[13px] text-white/80 placeholder-white/20 focus:outline-none" />
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
                    <div className="w-full max-w-lg rounded-2xl bg-[#1C1C20] border border-white/[0.08] p-5 shadow-2xl mx-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-[14px] font-semibold text-white/85">New Email</h3>
                        <button onClick={() => { setShowCompose(false); setComposeSubject(''); setComposeBody(''); }}
                          className="p-1 rounded-lg hover:bg-white/[0.04] text-white/30"><X className="w-4 h-4" /></button>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-[12px]">
                          <span className="text-white/25 w-10">To:</span>
                          <span className="text-white/50">{selectedPartner.email}</span>
                        </div>
                        <input type="text" value={composeSubject} onChange={e => setComposeSubject(e.target.value)}
                          placeholder="Subject" className={inputClasses} />
                        <textarea value={composeBody} onChange={e => setComposeBody(e.target.value)}
                          placeholder="Write your message..." rows={6} className={`${inputClasses} resize-none`} />
                        <div className="flex justify-end gap-2 pt-1">
                          <button onClick={() => { setShowCompose(false); setComposeSubject(''); setComposeBody(''); }}
                            className="px-4 py-1.5 text-[11px] text-white/30 hover:text-white/50">Cancel</button>
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
                    <Mail className="w-7 h-7 text-white/10 mx-auto mb-2" />
                    <p className="text-[12px] text-white/20">No email history yet</p>
                  </div>
                ) : selectedEmails.map(email => {
                  const isExpanded = expandedEmailId === email.id;
                  const isSent = email.provider === 'sent';
                  const ProviderIcon = email.provider === 'gmail' ? GmailIcon : email.provider === 'outlook' ? OutlookIcon : Mail;
                  const borderAccent = email.provider === 'gmail' ? 'border-l-[#EA4335]/30' : email.provider === 'outlook' ? 'border-l-[#0078D4]/30' : 'border-l-[#C08B5C]/30';
                  return (
                    <div key={email.id} className={`rounded-xl border border-l-2 ${borderAccent} ${
                      email.read ? 'border-white/[0.04] bg-white/[0.02]' : 'border-white/[0.08] bg-white/[0.03]'
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
                            <span className={`text-[12px] truncate ${email.read ? 'text-white/50' : 'text-white/80 font-medium'}`}>
                              {isSent ? `To: ${email.to}` : `From: ${email.from}`}
                            </span>
                            <span className="text-[10px] text-white/20 flex-shrink-0 ml-2">{formatTime(email.timestamp)}</span>
                          </div>
                          <div className={`text-[13px] truncate mt-0.5 ${email.read ? 'text-white/40' : 'text-white/70 font-medium'}`}>{email.subject}</div>
                          {!isExpanded && <div className="text-[11px] text-white/20 truncate mt-0.5">{email.body.split('\n')[0]}</div>}
                        </div>
                        <div className="flex-shrink-0 mt-1">
                          {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-white/20" /> : <ChevronRight className="w-3.5 h-3.5 text-white/20" />}
                        </div>
                      </button>
                      {isExpanded && (
                        <div className="px-4 pb-4 pl-[52px]">
                          <div className="border-t border-white/[0.04] pt-3">
                            <pre className="text-[12px] text-white/50 leading-relaxed whitespace-pre-wrap font-sans">{email.body}</pre>
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
                  <span className="text-[12px] text-white/30 font-medium">{selectedProperties.length} shared properties</span>
                  <button onClick={() => setShowNewProperty(!showNewProperty)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.06] text-[11px] text-white/40 hover:text-white/60">
                    <Plus className="w-3 h-3" /> Add
                  </button>
                </div>

                {showNewProperty && (
                  <div className="rounded-xl bg-white/[0.03] border border-white/[0.04] p-4 space-y-3">
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
                      <button onClick={() => setShowNewProperty(false)} className="flex-1 py-1.5 text-[11px] text-white/30 hover:text-white/50">Cancel</button>
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
                    <p className="text-[12px] text-white/20">No shared properties yet</p>
                  </div>
                ) : selectedProperties.map(prop => {
                  const typeMeta = PROPERTY_TYPE_META[prop.propertyType];
                  const statusMeta = PROPERTY_STATUS_META[prop.status];
                  const TypeIcon = typeMeta.icon;
                  return (
                    <div key={prop.id} className="rounded-xl bg-white/[0.03] border border-white/[0.04] p-4 hover:bg-white/[0.04] transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${typeMeta.bg}`}>
                            <TypeIcon className={`w-4 h-4 ${typeMeta.text}`} />
                          </div>
                          <div>
                            <span className="text-[13px] font-medium text-white/75">{prop.name}</span>
                            {prop.address && (
                              <div className="flex items-center gap-1 mt-0.5">
                                <MapPin className="w-3 h-3 text-white/15" />
                                <span className="text-[10px] text-white/25">{prop.address}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <button onClick={() => handleDeleteProperty(prop.id)}
                          className="p-1 rounded hover:bg-red-500/10 text-white/10 hover:text-red-400">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap ml-[38px]">
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-semibold ${typeMeta.bg} ${typeMeta.text}`}>
                          {typeMeta.label}
                        </span>
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/[0.04] text-[9px] text-white/35">
                          <Percent className="w-2.5 h-2.5" /> {prop.equitySplit}
                        </span>
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/[0.04] text-[9px] text-white/35">
                          <div className={`w-1.5 h-1.5 rounded-full ${statusMeta.dot}`} /> {statusMeta.label}
                        </span>
                        {prop.purchasePrice && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/[0.04] text-[9px] text-white/35">
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
      className="h-full overflow-y-auto bg-[#161619] relative overflow-x-hidden"
      style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.06) transparent' }}
    >
      <AmbientBackground variant="teams" />

      <div className="max-w-3xl mx-auto px-6 py-6 space-y-5 relative z-10">

        {/* Header */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <h1 className="text-lg font-bold gradient-text">Teams</h1>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" />
                <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search partners..."
                  className="pl-8 pr-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm text-[12px] text-white/70 placeholder-white/15 focus:outline-none focus:border-[#C08B5C]/30 w-52" />
              </div>
              <button onClick={() => setShowInvite(!showInvite)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#C08B5C] text-[#0A0A0C] text-[11px] font-bold">
                <UserPlus className="w-3 h-3" /> Invite
              </button>
            </div>
          </div>
          <p className="text-[12px] text-white/35">
            {partners.length} partner{partners.length !== 1 ? 's' : ''}
            {partners.filter(p => p.status === 'active').length > 0 && (
              <span> · {partners.filter(p => p.status === 'active').length} online</span>
            )}
          </p>
        </div>

        {/* Invite form */}
        {showInvite && (
          <div className="rounded-xl bg-white/[0.03] border border-white/[0.04] p-4 space-y-3">
            <div className="text-[12px] font-medium text-white/50 mb-1">Invite a Partner</div>
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
              <button onClick={() => setShowInvite(false)} className="flex-1 py-1.5 text-[11px] text-white/30 hover:text-white/50">Cancel</button>
              <button onClick={handleInvite} disabled={inviting || !inviteEmail.trim()}
                className="flex-1 py-1.5 rounded-lg bg-[#C08B5C] text-[#0A0A0C] text-[11px] font-bold disabled:opacity-40">
                {inviting ? 'Sending...' : 'Invite'}
              </button>
            </div>
          </div>
        )}

        {/* KPI strip */}
        <div className="grid grid-cols-3 gap-1">
          <div className="rounded-lg bg-white/[0.03] border border-white/[0.04] px-3 py-2.5 text-center">
            <div className="text-[16px] font-semibold text-white/80">{globalSummary.totalPartners}</div>
            <div className="text-[10px] text-white/25">Partners</div>
          </div>
          <div className="rounded-lg bg-white/[0.03] border border-white/[0.04] px-3 py-2.5 text-center">
            <div className="text-[16px] font-semibold text-white/80">{globalSummary.totalProperties}</div>
            <div className="text-[10px] text-white/25">Properties</div>
          </div>
          <div className="rounded-lg bg-white/[0.03] border border-white/[0.04] px-3 py-2.5 text-center">
            <div className="text-[16px] font-semibold text-emerald-400/70">${globalSummary.totalRevenue.toLocaleString()}/mo</div>
            <div className="text-[10px] text-white/25">Revenue</div>
          </div>
        </div>

        {/* Partners section */}
        <div>
          <div className="text-[12px] text-white/30 font-medium mb-2">Partners</div>
          {filteredPartners.length === 0 ? (
            partners.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.04] flex items-center justify-center mx-auto mb-3">
                  <UserPlus className="w-6 h-6 text-white/10" />
                </div>
                <p className="text-[13px] text-white/30 font-medium">No partners yet</p>
                <p className="text-[12px] text-white/15 mt-1">Invite investment partners to collaborate on deals and properties.</p>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-[12px] text-white/20">No partners match your search.</p>
              </div>
            )
          ) : (
            <div className="space-y-0.5">
              {filteredPartners.map(partner => {
                const partnerProps = propertiesStore[partner.id] || [];
                const partnerEquity = partnerProps.reduce((s, p) => s + (p.purchasePrice || 0), 0);
                const partnerRevenue = partnerProps.reduce((s, p) => s + (p.monthlyRevenue || 0), 0);
                const lastMsg = (chatStore[partner.id] || []).at(-1);
                const roleMeta = ROLE_META[partner.role] || { label: partner.role, icon: Users };
                const RoleIcon = roleMeta.icon;

                return (
                  <button
                    key={partner.id}
                    onClick={() => setSelectedPartnerId(partner.id)}
                    className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl hover:bg-white/[0.04] text-left transition-colors group"
                  >
                    <div className="relative flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-white/[0.06] flex items-center justify-center group-hover:bg-white/[0.08] transition-colors">
                        <span className="text-[12px] font-bold text-white/50">{getInitials(partner)}</span>
                      </div>
                      <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#161619] ${
                        partner.status === 'active' ? 'bg-emerald-400' : 'bg-white/20'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[13px] font-medium text-white/80 truncate">{partner.name || partner.email}</span>
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] text-white/25 bg-white/[0.04] flex-shrink-0">
                          <RoleIcon className="w-2.5 h-2.5" /> {roleMeta.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px]">
                        <span className="text-white/25">{partnerProps.length} properties</span>
                        <span className="text-white/15">${partnerEquity.toLocaleString()} equity</span>
                        {partnerRevenue > 0 && <span className="text-emerald-400/40">${partnerRevenue.toLocaleString()}/mo</span>}
                      </div>
                      {lastMsg && (
                        <p className="text-[11px] text-white/20 truncate mt-0.5">{lastMsg.text}</p>
                      )}
                    </div>
                    <ChevronRight className="w-4 h-4 text-white/10 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Email sync */}
        <div>
          <div className="text-[12px] text-white/30 font-medium mb-2">Quick Actions</div>
          <div className="grid grid-cols-2 gap-1">
            <button onClick={() => alert('Gmail integration coming soon!')}
              className="flex items-center gap-2.5 px-3.5 py-3 rounded-xl bg-white/[0.03] border border-white/[0.04] hover:bg-white/[0.04] transition-colors">
              <GmailIcon className="w-4 h-4" />
              <div className="text-left">
                <div className="text-[11px] text-white/50">Connect Gmail</div>
                <div className="text-[9px] text-white/15">Sync email threads</div>
              </div>
            </button>
            <button onClick={() => alert('Outlook integration coming soon!')}
              className="flex items-center gap-2.5 px-3.5 py-3 rounded-xl bg-white/[0.03] border border-white/[0.04] hover:bg-white/[0.04] transition-colors">
              <OutlookIcon className="w-4 h-4" />
              <div className="text-left">
                <div className="text-[11px] text-white/50">Connect Outlook</div>
                <div className="text-[9px] text-white/15">Sync email threads</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
