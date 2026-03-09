import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap, ZapOff, Loader2, CheckCircle2, XCircle, Clock,
  X, Square, Crosshair, Search, FileText, Mail,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { autopilotService, type AutopilotTask, type AutopilotSettings, type TaskStatus } from '../../services/autopilotApi';

const TASK_TYPE_META: Record<string, { label: string; icon: React.FC<{ className?: string }> }> = {
  market_scan: { label: 'Market Scan', icon: Crosshair },
  deal_monitor: { label: 'Deal Monitor', icon: Search },
  email_draft: { label: 'Email Draft', icon: Mail },
  report: { label: 'Report', icon: FileText },
  custom: { label: 'Custom', icon: Zap },
};

const STATUS_META: Record<TaskStatus, { label: string; color: string; icon: React.FC<{ className?: string }> }> = {
  queued: { label: 'Queued', color: 'text-muted-foreground/60', icon: Clock },
  running: { label: 'Running', color: 'text-[#C08B5C]', icon: Loader2 },
  done: { label: 'Done', color: 'text-emerald-400', icon: CheckCircle2 },
  failed: { label: 'Failed', color: 'text-red-400', icon: XCircle },
  cancelled: { label: 'Cancelled', color: 'text-muted-foreground/40', icon: XCircle },
};

function timeAgo(ts: string | null): string {
  if (!ts) return '';
  const diff = Date.now() - new Date(ts).getTime();
  if (diff < 60_000) return 'Just now';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

interface AutopilotPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AutopilotPanel: React.FC<AutopilotPanelProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const userId = user?.id || '';

  const [settings, setSettings] = useState<AutopilotSettings | null>(null);
  const [tasks, setTasks] = useState<AutopilotTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'tasks' | 'settings'>('tasks');

  const refresh = useCallback(async () => {
    if (!userId) return;
    try {
      const [s, t] = await Promise.all([
        autopilotService.getSettings(userId),
        autopilotService.listTasks(userId),
      ]);
      setSettings(s);
      setTasks(t.tasks);
    } catch (err) {
      console.error('Autopilot load failed:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { if (isOpen) refresh(); }, [isOpen, refresh]);

  const handleToggle = async () => {
    if (!settings || !userId) return;
    const next = !settings.enabled;
    setSettings({ ...settings, enabled: next });
    try {
      await autopilotService.updateSettings(userId, { enabled: next });
    } catch {
      setSettings({ ...settings, enabled: !next });
    }
  };

  const handleCancel = async (taskId: string) => {
    if (!userId) return;
    try {
      const updated = await autopilotService.cancelTask(userId, taskId);
      setTasks(prev => prev.map(t => t.id === taskId ? updated : t));
    } catch (err) {
      console.error('Cancel failed:', err);
    }
  };

  const activeCount = tasks.filter(t => t.status === 'queued' || t.status === 'running').length;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="fixed right-4 top-16 bottom-4 w-[360px] z-50 rounded-2xl border border-black/[0.08] bg-background shadow-2xl flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-black/[0.06]">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${settings?.enabled ? 'bg-[#C08B5C]/10' : 'bg-black/[0.03]'}`}>
              {settings?.enabled ? (
                <Zap className="w-4 h-4 text-[#C08B5C]" />
              ) : (
                <ZapOff className="w-4 h-4 text-muted-foreground/40" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[14px] font-semibold text-foreground">Autopilot</div>
              <div className="text-[10px] text-muted-foreground/50">
                {settings?.enabled ? `${activeCount} active task${activeCount !== 1 ? 's' : ''}` : 'Disabled'}
              </div>
            </div>

            {/* Toggle */}
            <button
              onClick={handleToggle}
              className={`relative w-10 h-5.5 rounded-full transition-colors ${
                settings?.enabled ? 'bg-[#C08B5C]' : 'bg-black/[0.08]'
              }`}
              style={{ width: 40, height: 22 }}
            >
              <motion.div
                className="absolute top-[2px] w-[18px] h-[18px] rounded-full bg-white shadow-sm"
                animate={{ left: settings?.enabled ? 20 : 2 }}
                transition={{ duration: 0.2 }}
              />
            </button>

            <button onClick={onClose} className="p-1 rounded-md hover:bg-black/[0.04] text-muted-foreground/40">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex items-center border-b border-black/[0.04] px-5">
            {(['tasks', 'settings'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-3 py-2.5 text-[12px] font-medium border-b-2 transition-colors capitalize ${
                  tab === t
                    ? 'border-[#C08B5C] text-foreground/80'
                    : 'border-transparent text-muted-foreground/50 hover:text-foreground/60'
                }`}
              >
                {t === 'tasks' ? `Tasks (${tasks.length})` : 'Settings'}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-5 h-5 text-[#C08B5C] animate-spin" />
              </div>
            ) : tab === 'tasks' ? (
              tasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Zap className="w-8 h-8 text-muted-foreground/15 mb-3" />
                  <p className="text-[13px] text-muted-foreground/40">No tasks yet</p>
                  <p className="text-[11px] text-muted-foreground/30 mt-1">
                    Ask Vasthu AI to run tasks autonomously
                  </p>
                </div>
              ) : (
                <div className="py-2">
                  {tasks.map(task => {
                    const typeMeta = TASK_TYPE_META[task.task_type] || TASK_TYPE_META.custom;
                    const statusMeta = STATUS_META[task.status];
                    const TypeIcon = typeMeta.icon;
                    const StatusIcon = statusMeta.icon;
                    const isActive = task.status === 'queued' || task.status === 'running';

                    return (
                      <div key={task.id} className="px-5 py-3 border-b border-black/[0.03] hover:bg-black/[0.01] transition-colors">
                        <div className="flex items-start gap-3">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            isActive ? 'bg-[#C08B5C]/10' : 'bg-black/[0.03]'
                          }`}>
                            <TypeIcon className={`w-3.5 h-3.5 ${isActive ? 'text-[#C08B5C]' : 'text-muted-foreground/40'}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-[12px] font-medium text-foreground/80 truncate">{task.description}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <StatusIcon className={`w-3 h-3 ${statusMeta.color} ${task.status === 'running' ? 'animate-spin' : ''}`} />
                              <span className={`text-[10px] font-medium ${statusMeta.color}`}>{statusMeta.label}</span>
                              <span className="text-[9px] text-muted-foreground/30">{timeAgo(task.created_at)}</span>
                              {task.schedule && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-black/[0.03] text-muted-foreground/50">{task.schedule}</span>
                              )}
                            </div>
                            {task.error && (
                              <p className="text-[10px] text-red-400/70 mt-1 truncate">{task.error}</p>
                            )}
                          </div>
                          {isActive && (
                            <button
                              onClick={() => handleCancel(task.id)}
                              className="p-1 rounded hover:bg-black/[0.04] text-muted-foreground/30 hover:text-red-400 flex-shrink-0"
                              title="Cancel"
                            >
                              <Square className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            ) : (
              /* Settings tab */
              <div className="p-5 space-y-5">
                <SettingRow
                  label="Auto Market Scan"
                  description="Automatically scan markets matching your preferences"
                  enabled={settings?.auto_scan_enabled || false}
                  onToggle={async (val) => {
                    if (!userId || !settings) return;
                    setSettings({ ...settings, auto_scan_enabled: val });
                    await autopilotService.updateSettings(userId, { auto_scan_enabled: val }).catch(() => {});
                  }}
                />
                <SettingRow
                  label="Auto Email Drafts"
                  description="Draft outreach emails to agents and sellers automatically"
                  enabled={settings?.auto_email_drafts || false}
                  onToggle={async (val) => {
                    if (!userId || !settings) return;
                    setSettings({ ...settings, auto_email_drafts: val });
                    await autopilotService.updateSettings(userId, { auto_email_drafts: val }).catch(() => {});
                  }}
                />
                <SettingRow
                  label="Notifications"
                  description="Get notified when tasks complete or find results"
                  enabled={settings?.notifications_enabled ?? true}
                  onToggle={async (val) => {
                    if (!userId || !settings) return;
                    setSettings({ ...settings, notifications_enabled: val });
                    await autopilotService.updateSettings(userId, { notifications_enabled: val }).catch(() => {});
                  }}
                />

                <div className="pt-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 mb-2 block">
                    Max Concurrent Tasks
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 3, 5].map(n => (
                      <button
                        key={n}
                        onClick={async () => {
                          if (!userId || !settings) return;
                          setSettings({ ...settings, max_concurrent_tasks: n });
                          await autopilotService.updateSettings(userId, { max_concurrent_tasks: n }).catch(() => {});
                        }}
                        className={`px-3 py-1.5 rounded-lg text-[11px] font-medium border transition-colors ${
                          settings?.max_concurrent_tasks === n
                            ? 'border-[#C08B5C]/30 bg-[#C08B5C]/10 text-[#C08B5C]'
                            : 'border-black/[0.06] text-muted-foreground/60 hover:bg-black/[0.02]'
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 mb-2 block">
                    Agent Mode
                  </label>
                  <div className="flex items-center gap-2">
                    {(['hunter', 'research', 'strategist'] as const).map(m => (
                      <button
                        key={m}
                        onClick={async () => {
                          if (!userId || !settings) return;
                          setSettings({ ...settings, mode: m });
                          await autopilotService.updateSettings(userId, { mode: m }).catch(() => {});
                        }}
                        className={`px-3 py-1.5 rounded-lg text-[11px] font-medium border transition-colors capitalize ${
                          settings?.mode === m
                            ? 'border-[#C08B5C]/30 bg-[#C08B5C]/10 text-[#C08B5C]'
                            : 'border-black/[0.06] text-muted-foreground/60 hover:bg-black/[0.02]'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ── Sub-components ────────────────────────────────────────────────

const SettingRow: React.FC<{
  label: string;
  description: string;
  enabled: boolean;
  onToggle: (val: boolean) => void;
}> = ({ label, description, enabled, onToggle }) => (
  <div className="flex items-center gap-3">
    <div className="flex-1 min-w-0">
      <div className="text-[12px] font-medium text-foreground/80">{label}</div>
      <div className="text-[10px] text-muted-foreground/50 mt-0.5">{description}</div>
    </div>
    <button
      onClick={() => onToggle(!enabled)}
      className={`relative rounded-full transition-colors flex-shrink-0 ${
        enabled ? 'bg-[#C08B5C]' : 'bg-black/[0.08]'
      }`}
      style={{ width: 36, height: 20 }}
    >
      <motion.div
        className="absolute top-[2px] w-[16px] h-[16px] rounded-full bg-white shadow-sm"
        animate={{ left: enabled ? 18 : 2 }}
        transition={{ duration: 0.2 }}
      />
    </button>
  </div>
);
