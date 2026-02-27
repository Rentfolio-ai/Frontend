/**
 * IntegrationsPage — Premium modal popup for managing integrations
 * Overlays the current view with a glassmorphic card and blurred backdrop
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { X, CheckCircle2, AlertCircle, Loader2, ExternalLink, Mic } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL, jsonHeaders } from '../../services/apiConfig';
import {
  GmailIcon,
  OutlookIcon,
  WhatsAppIcon,
  IMessageIcon,
  GoogleMeetIcon,
  ZoomIcon,
} from '../integrations/BrandIcons';
import { VoiceSampleRecorder } from '../integrations/VoiceSampleRecorder';

interface IntegrationsPageProps {
  isOpen: boolean;
  onClose: () => void;
}

interface IntegrationStatus {
  gmail?: { connected: boolean; email?: string };
  outlook?: { connected: boolean; email?: string };
  twilio_sms?: { connected: boolean; phone?: string };
  whatsapp?: { connected: boolean; phone?: string };
  voice_profile?: { status: string };
}

type CategoryFilter = 'all' | 'email' | 'messaging' | 'voice' | 'meetings';

interface IntegrationDef {
  id: string;
  title: string;
  category: CategoryFilter;
  icon: React.FC<{ className?: string }>;
  brandBg: string;
  capabilityTag: string;
  description: string;
}

const INTEGRATIONS: IntegrationDef[] = [
  {
    id: 'gmail',
    title: 'Gmail',
    category: 'email',
    icon: GmailIcon,
    brandBg: 'bg-red-500/10',
    capabilityTag: 'Send & receive',
    description: 'Send emails through your Google account',
  },
  {
    id: 'outlook',
    title: 'Outlook',
    category: 'email',
    icon: OutlookIcon,
    brandBg: 'bg-blue-500/10',
    capabilityTag: 'Send & receive',
    description: 'Send emails through your Microsoft account',
  },
  {
    id: 'twilio_sms',
    title: 'iMessage',
    category: 'messaging',
    icon: IMessageIcon,
    brandBg: 'bg-green-500/10',
    capabilityTag: 'Outbound only',
    description: 'Send text messages to professionals via iMessage',
  },
  {
    id: 'whatsapp',
    title: 'WhatsApp',
    category: 'messaging',
    icon: WhatsAppIcon,
    brandBg: 'bg-green-500/10',
    capabilityTag: 'Outbound only',
    description: 'Send WhatsApp messages via Twilio',
  },
  {
    id: 'voice_profile',
    title: 'Voice Clone',
    category: 'voice',
    icon: ({ className }: { className?: string }) => <Mic className={className || 'w-5 h-5'} />,
    brandBg: 'bg-[#C08B5C]/10',
    capabilityTag: 'AI Voice',
    description: 'Clone your voice so Vasthu can make calls for you',
  },
  {
    id: 'google_meet',
    title: 'Google Meet',
    category: 'meetings',
    icon: GoogleMeetIcon,
    brandBg: 'bg-green-500/10',
    capabilityTag: 'Video calls',
    description: 'Create and join Google Meet video calls',
  },
  {
    id: 'zoom',
    title: 'Zoom',
    category: 'meetings',
    icon: ZoomIcon,
    brandBg: 'bg-blue-500/10',
    capabilityTag: 'Video calls',
    description: 'Create and join Zoom video meetings',
  },
];

const CATEGORY_LABELS: Record<CategoryFilter, string> = {
  all: 'All',
  email: 'Email',
  messaging: 'Messaging',
  voice: 'Voice',
  meetings: 'Meetings',
};

const MEETING_IDS = new Set(['google_meet', 'zoom']);

const MeetingBadge: React.FC = () => (
  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/15 text-blue-400">
    <ExternalLink className="w-3 h-3" />
    Available
  </span>
);

const StatusBadge: React.FC<{ connected: boolean }> = ({ connected }) => (
  <span
    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
      connected
        ? 'bg-emerald-500/15 text-emerald-400'
        : 'bg-white/[0.04] text-white/30'
    }`}
  >
    {connected ? (
      <CheckCircle2 className="w-3 h-3" />
    ) : (
      <AlertCircle className="w-3 h-3" />
    )}
    {connected ? 'Connected' : 'Not connected'}
  </span>
);

const VoiceStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const config: Record<string, { label: string; cls: string }> = {
    none: { label: 'Not connected', cls: 'bg-white/[0.04] text-white/30' },
    pending: { label: 'Pending', cls: 'bg-amber-500/15 text-amber-400' },
    processing: { label: 'Processing', cls: 'bg-blue-500/15 text-blue-400' },
    ready: { label: 'Connected', cls: 'bg-emerald-500/15 text-emerald-400' },
  };
  const { label, cls } = config[status] || config.none;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${cls}`}>
      {status === 'processing' ? (
        <Loader2 className="w-3 h-3 animate-spin" />
      ) : status === 'ready' ? (
        <CheckCircle2 className="w-3 h-3" />
      ) : (
        <AlertCircle className="w-3 h-3" />
      )}
      {label}
    </span>
  );
};

const VoiceProgressIndicator: React.FC<{ status: string }> = ({ status }) => {
  const steps = ['pending', 'processing', 'ready'];
  const currentIdx = steps.indexOf(status);

  return (
    <div className="flex items-center gap-1.5 mt-2">
      {steps.map((step, i) => (
        <React.Fragment key={step}>
          <div
            className={`w-2 h-2 rounded-full transition-colors ${
              i <= currentIdx ? 'bg-emerald-400' : 'bg-white/10'
            }`}
          />
          {i < steps.length - 1 && (
            <div
              className={`flex-1 h-0.5 rounded-full transition-colors ${
                i < currentIdx ? 'bg-emerald-400/60' : 'bg-white/[0.06]'
              }`}
            />
          )}
        </React.Fragment>
      ))}
      <span className="text-[9px] text-white/30 ml-1 capitalize">{status === 'none' ? '' : status}</span>
    </div>
  );
};

const cardVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.06 * i, duration: 0.3 },
  }),
};

export const IntegrationsPage: React.FC<IntegrationsPageProps> = ({ isOpen, onClose }) => {
  const [status, setStatus] = useState<IntegrationStatus>({});
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('all');
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/v2/integrations/status`, {
        headers: jsonHeaders(),
      });
      if (res.ok) {
        setStatus(await res.json());
      }
    } catch {
      // Fallback: show all disconnected
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) fetchStatus();
  }, [isOpen, fetchStatus]);

  const startOAuth = useCallback(
    (provider: 'gmail' | 'outlook') => {
      const url = `${API_BASE_URL}/v2/integrations/oauth/start?provider=${provider}`;
      const popup = window.open(url, 'oauth', 'width=500,height=700,left=200,top=100');
      const interval = setInterval(() => {
        if (popup?.closed) {
          clearInterval(interval);
          fetchStatus();
        }
      }, 500);
    },
    [fetchStatus],
  );

  const disconnect = useCallback(
    async (provider: string) => {
      try {
        await fetch(`${API_BASE_URL}/v2/integrations/${provider}`, {
          method: 'DELETE',
          headers: jsonHeaders(),
        });
        fetchStatus();
      } catch {
        /* ignore */
      }
    },
    [fetchStatus],
  );

  const isConnected = useCallback(
    (id: string): boolean => {
      if (id === 'voice_profile') return status.voice_profile?.status === 'ready';
      const entry = status[id as keyof IntegrationStatus] as { connected?: boolean } | undefined;
      return entry?.connected ?? false;
    },
    [status],
  );

  const getDetail = useCallback(
    (id: string): string | undefined => {
      switch (id) {
        case 'gmail':
          return status.gmail?.email;
        case 'outlook':
          return status.outlook?.email;
        case 'twilio_sms':
          return status.twilio_sms?.phone;
        case 'whatsapp':
          return status.whatsapp?.phone;
        case 'voice_profile':
          return status.voice_profile?.status === 'ready' ? 'Voice clone ready' : undefined;
        default:
          return undefined;
      }
    },
    [status],
  );

  const connectedCount = useMemo(
    () => INTEGRATIONS.filter((i) => isConnected(i.id)).length,
    [isConnected],
  );

  const categoryCounts = useMemo(() => {
    const counts: Record<CategoryFilter, number> = { all: INTEGRATIONS.length, email: 0, messaging: 0, voice: 0, meetings: 0 };
    for (const i of INTEGRATIONS) counts[i.category]++;
    return counts;
  }, []);

  const filteredIntegrations = useMemo(
    () => (activeCategory === 'all' ? INTEGRATIONS : INTEGRATIONS.filter((i) => i.category === activeCategory)),
    [activeCategory],
  );

  const handleAction = useCallback(
    (id: string) => {
      switch (id) {
        case 'gmail':
          isConnected('gmail') ? disconnect('gmail') : startOAuth('gmail');
          break;
        case 'outlook':
          isConnected('outlook') ? disconnect('outlook') : startOAuth('outlook');
          break;
        case 'voice_profile':
          setShowVoiceRecorder(true);
          break;
        case 'google_meet':
          window.open('https://meet.google.com/new', '_blank');
          break;
        case 'zoom':
          window.open('https://zoom.us/start/videomeeting', '_blank');
          break;
        default:
          break;
      }
    },
    [isConnected, disconnect, startOAuth],
  );

  const getActionLabel = useCallback(
    (id: string): string => {
      if (MEETING_IDS.has(id)) return 'New Meeting';
      if (isConnected(id)) return 'Disconnect';
      if (id === 'voice_profile') {
        const vs = status.voice_profile?.status;
        if (vs === 'processing') return 'Processing…';
        return 'Record Sample';
      }
      if (id === 'twilio_sms' || id === 'whatsapp') return 'Configure';
      return 'Connect';
    },
    [isConnected, status],
  );

  const voiceStatus = status.voice_profile?.status ?? 'none';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-lg max-h-[80vh] rounded-2xl border border-white/[0.08] overflow-hidden flex flex-col"
            style={{ backgroundColor: '#161619' }}
          >
            {/* Copper accent bar */}
            <div
              className="h-[2px] w-full flex-shrink-0"
              style={{
                background: 'linear-gradient(90deg, #C08B5C 0%, #D4A27F 50%, #C08B5C 100%)',
              }}
            />

            {/* Header */}
            <div className="px-5 pt-4 pb-3 border-b border-white/[0.06] flex-shrink-0">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-[17px] font-semibold text-white/90">Integrations</h1>
                  <p className="text-[11px] text-white/35 mt-0.5">
                    Manage how Vasthu communicates on your behalf
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-white/30 hover:bg-white/[0.06] hover:text-white/60 transition-colors -mt-0.5"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Connection progress */}
              <div className="mt-3 flex items-center gap-3">
                <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{
                      background: 'linear-gradient(90deg, #C08B5C, #D4A27F)',
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${(connectedCount / INTEGRATIONS.length) * 100}%` }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                  />
                </div>
                <span className="text-[11px] text-white/40 font-medium whitespace-nowrap">
                  {connectedCount}/{INTEGRATIONS.length}
                </span>
              </div>

              {/* Category tabs */}
              <div className="flex items-center gap-1.5 mt-3">
                {(Object.keys(CATEGORY_LABELS) as CategoryFilter[]).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all border ${
                      activeCategory === cat
                        ? 'bg-white/[0.1] border-white/[0.15] text-white'
                        : 'bg-transparent border-transparent text-white/35 hover:text-white/60 hover:bg-white/[0.04]'
                    }`}
                  >
                    {CATEGORY_LABELS[cat]}
                    <span className="ml-1 text-[10px] opacity-50">{categoryCounts[cat]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Content (scrollable) */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-5 h-5 text-white/20 animate-spin" />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {filteredIntegrations.map((integration, idx) => {
                    const Icon = integration.icon;
                    const connected = isConnected(integration.id);
                    const detail = getDetail(integration.id);
                    const isVoice = integration.id === 'voice_profile';
                    const isMeeting = MEETING_IDS.has(integration.id);
                    const actionLabel = getActionLabel(integration.id);

                    return (
                      <motion.div
                        key={integration.id}
                        custom={idx}
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                        className="relative rounded-2xl bg-white/[0.025] border border-white/[0.06] hover:bg-white/[0.05] hover:border-white/[0.12] hover:shadow-[0_0_20px_rgba(192,139,92,0.04)] transition-all p-4 flex flex-col gap-3"
                      >
                        {/* Icon + Status */}
                        <div className="flex items-start justify-between">
                          <div className={`w-10 h-10 rounded-xl ${isVoice ? integration.brandBg : ''} flex items-center justify-center flex-shrink-0 overflow-hidden`}>
                            <Icon className={isVoice ? 'w-5 h-5 text-[#C08B5C]' : 'w-10 h-10'} />
                          </div>
                          {isMeeting ? (
                            <MeetingBadge />
                          ) : isVoice ? (
                            <VoiceStatusBadge status={voiceStatus} />
                          ) : (
                            <StatusBadge connected={connected} />
                          )}
                        </div>

                        {/* Title + Capability */}
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-[13px] font-semibold text-white/90">{integration.title}</h3>
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-white/[0.05] text-white/35 border border-white/[0.06]">
                              {integration.capabilityTag}
                            </span>
                          </div>
                          <p className="text-[11px] text-white/40 mt-1 leading-relaxed">
                            {connected && detail ? detail : integration.description}
                          </p>
                        </div>

                        {/* Voice Progress */}
                        {isVoice && voiceStatus !== 'none' && voiceStatus !== 'ready' && (
                          <VoiceProgressIndicator status={voiceStatus} />
                        )}

                        {/* Voice Recorder */}
                        {isVoice && showVoiceRecorder && (
                          <div className="mt-1 p-3 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                            <VoiceSampleRecorder
                              onComplete={() => {
                                setShowVoiceRecorder(false);
                                fetchStatus();
                              }}
                            />
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center justify-between mt-auto pt-1">
                          <button
                            onClick={() => handleAction(integration.id)}
                            disabled={actionLabel === 'Processing…'}
                            className={`px-3.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                              isMeeting
                                ? 'text-white/80 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/20'
                                : connected
                                  ? 'text-white/40 hover:text-red-400/80 bg-white/[0.04] hover:bg-red-500/10 border border-white/[0.06] hover:border-red-500/20'
                                  : 'text-white/80 bg-[#C08B5C]/20 hover:bg-[#C08B5C]/30 border border-[#C08B5C]/20'
                            } disabled:opacity-40 disabled:cursor-not-allowed`}
                          >
                            {actionLabel}
                          </button>
                          <button className="flex items-center gap-1 text-[10px] text-white/25 hover:text-white/45 transition-colors">
                            <ExternalLink className="w-3 h-3" />
                            Learn more
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
