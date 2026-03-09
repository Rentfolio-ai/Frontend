import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, CheckCircle2, AlertCircle, Loader2, Crown, Handshake, Lightbulb } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { teamsService, type InviteDetail } from '../../services/teamsApi';

const ROLE_META: Record<string, { label: string; icon: React.FC<{ className?: string }> }> = {
  lead_investor: { label: 'Lead Investor', icon: Crown },
  partner: { label: 'Partner', icon: Handshake },
  advisor: { label: 'Advisor', icon: Lightbulb },
};

interface InviteAcceptPageProps {
  token: string;
  onNavigateToSignUp: () => void;
  onNavigateToSignIn: () => void;
  onAccepted: () => void;
}

export const InviteAcceptPage: React.FC<InviteAcceptPageProps> = ({
  token,
  onNavigateToSignUp,
  onNavigateToSignIn,
  onAccepted,
}) => {
  const { user } = useAuth();
  const [invite, setInvite] = useState<InviteDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accepting, setAccepting] = useState(false);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await teamsService.getInvite(token);
        setInvite(data);
        if (data.status === 'accepted') {
          setAccepted(true);
        }
      } catch {
        setError('This invitation link is invalid or has expired.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  const handleAccept = async () => {
    if (!user || !invite) return;
    setAccepting(true);
    try {
      await teamsService.acceptInvite(token, user.id);
      setAccepted(true);
      setTimeout(() => onAccepted(), 2000);
    } catch (err) {
      setError('Failed to accept invitation. Please try again.');
    } finally {
      setAccepting(false);
    }
  };

  const roleMeta = invite ? (ROLE_META[invite.role] || { label: invite.role, icon: Users }) : null;
  const RoleIcon = roleMeta?.icon || Users;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md"
      >
        {/* Copper accent */}
        <div
          className="h-[2px] w-full rounded-t-2xl"
          style={{ background: 'linear-gradient(90deg, #C08B5C 0%, #D4A27F 50%, #C08B5C 100%)' }}
        />

        <div className="rounded-b-2xl border border-t-0 border-black/[0.08] bg-background p-8">
          {loading ? (
            <div className="flex flex-col items-center py-8">
              <Loader2 className="w-8 h-8 text-[#C08B5C] animate-spin mb-4" />
              <p className="text-[14px] text-muted-foreground/60">Loading invitation...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center py-8">
              <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center mb-4">
                <AlertCircle className="w-7 h-7 text-red-400" />
              </div>
              <h2 className="text-[18px] font-semibold text-foreground mb-2">Invalid Invitation</h2>
              <p className="text-[13px] text-muted-foreground/60 text-center max-w-[300px]">{error}</p>
              <button
                onClick={() => { window.history.replaceState({}, '', '/'); window.location.reload(); }}
                className="mt-6 px-6 py-2.5 rounded-xl bg-[#C08B5C] text-[#0A0A0C] text-[13px] font-semibold"
              >
                Go to Home
              </button>
            </div>
          ) : accepted ? (
            <div className="flex flex-col items-center py-8">
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-4"
              >
                <CheckCircle2 className="w-7 h-7 text-emerald-400" />
              </motion.div>
              <h2 className="text-[18px] font-semibold text-foreground mb-2">You're in!</h2>
              <p className="text-[13px] text-muted-foreground/60 text-center">
                You've joined <strong className="text-foreground/80">{invite?.team_name}</strong>. Redirecting...
              </p>
            </div>
          ) : (
            <>
              {/* Team icon */}
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-b from-[#C08B5C]/15 to-[#C08B5C]/5 border border-[#C08B5C]/15 flex items-center justify-center">
                  <Users className="w-8 h-8 text-[#C08B5C]" />
                </div>
              </div>

              <h2 className="text-[20px] font-semibold text-foreground text-center mb-2">
                You're invited to join
              </h2>
              <h3 className="text-[22px] font-bold text-foreground text-center mb-1">
                {invite?.team_name}
              </h3>
              {invite?.team_description && (
                <p className="text-[13px] text-muted-foreground/60 text-center mb-6">{invite.team_description}</p>
              )}

              {/* Invite details card */}
              <div className="rounded-xl bg-black/[0.02] border border-black/[0.06] p-4 mb-6 space-y-3">
                {invite?.name && (
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] text-muted-foreground/50">Invited as</span>
                    <span className="text-[13px] text-foreground/80 font-medium">{invite.name}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-muted-foreground/50">Email</span>
                  <span className="text-[13px] text-foreground/80">{invite?.email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-muted-foreground/50">Role</span>
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#C08B5C]/10 text-[11px] font-semibold text-[#C08B5C]">
                    <RoleIcon className="w-3 h-3" /> {roleMeta?.label}
                  </span>
                </div>
              </div>

              {user ? (
                <button
                  onClick={handleAccept}
                  disabled={accepting}
                  className="w-full py-3 rounded-xl bg-[#C08B5C] text-[#0A0A0C] text-[14px] font-bold hover:bg-[#D4A27F] transition-colors disabled:opacity-50"
                >
                  {accepting ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" /> Accepting...
                    </span>
                  ) : (
                    'Accept Invitation'
                  )}
                </button>
              ) : (
                <div className="space-y-3">
                  <p className="text-[12px] text-muted-foreground/50 text-center">
                    Sign in or create an account to accept this invitation
                  </p>
                  <button
                    onClick={onNavigateToSignIn}
                    className="w-full py-3 rounded-xl bg-[#C08B5C] text-[#0A0A0C] text-[14px] font-bold hover:bg-[#D4A27F] transition-colors"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={onNavigateToSignUp}
                    className="w-full py-3 rounded-xl bg-black/[0.03] border border-black/[0.06] text-foreground/70 text-[14px] font-medium hover:bg-black/[0.05] transition-colors"
                  >
                    Create Account
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};
