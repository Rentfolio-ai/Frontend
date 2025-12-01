import React from 'react';
import { useVoiceAssistant } from '../hooks/useVoiceAssistant';
import { useWakeWordDetection } from '../hooks/useWakeWordDetection';
import { Mic, X, BarChart3, Settings, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface VoiceOverlayProps {
    context?: Record<string, any>;
}

export const VoiceOverlay: React.FC<VoiceOverlayProps> = ({ context }) => {
    const { state, startListening, stopListening } = useVoiceAssistant();
    const [isOpen, setIsOpen] = React.useState(false);
    const [wakeWordEnabled, setWakeWordEnabled] = React.useState(() => {
        // Load from localStorage
        const saved = localStorage.getItem('wakeWordEnabled');
        return saved === 'true';
    });
    const [showSettings, setShowSettings] = React.useState(false);
    const [showAlerts, setShowAlerts] = React.useState(false);
    const [alertCount, setAlertCount] = React.useState(0);
    const [alerts, setAlerts] = React.useState<any[]>([]);

    // Wake word detection
    const wakeWordState = useWakeWordDetection(
        () => {
            // Auto-open and start listening when wake word detected
            console.log('[VoiceOverlay] Wake word detected, opening...');
            setIsOpen(true);
            startListening(context);
        },
        wakeWordEnabled && !isOpen // Only listen when enabled and overlay is closed
    );

    // Fetch alerts on mount and periodically
    React.useEffect(() => {
        const fetchAlerts = async () => {
            try {
                // TODO: Get actual user_id from auth context
                const userId = 'test_user_123';
                // Call DataLayer directly for alerts
                const response = await fetch(`http://localhost:8001/api/alerts/${userId}?unread_only=true`);

                if (response.ok) {
                    const data = await response.json();
                    setAlerts(data);
                    setAlertCount(data.length);
                }
            } catch (error) {
                console.error('Failed to fetch alerts:', error);
            }
        };

        fetchAlerts();

        // Refresh alerts every 5 minutes
        const interval = setInterval(fetchAlerts, 5 * 60 * 1000);

        return () => clearInterval(interval);
    }, []);

    // Save wake word preference
    React.useEffect(() => {
        localStorage.setItem('wakeWordEnabled', String(wakeWordEnabled));
    }, [wakeWordEnabled]);

    const toggleVoice = (e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        if (isOpen) {
            setIsOpen(false);
            stopListening();
        } else {
            setIsOpen(true);
            startListening(context);
        }
    };

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            toggleVoice(e);
        }
    };

    if (!isOpen) {
        return (
            <>
                {/* Wake Word Listening Indicator */}
                {wakeWordState.isListening && wakeWordEnabled && (
                    <motion.div
                        className="fixed bottom-24 right-8 z-40 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 shadow-lg"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                    >
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                            <span className="text-white/80 text-sm">Listening for "Hey CIVI"</span>
                        </div>
                    </motion.div>
                )}

                {/* Settings Button */}
                <motion.button
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowSettings(!showSettings);
                    }}
                    className="fixed bottom-24 right-24 w-10 h-10 z-50 group"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    title="Voice Assistant Settings"
                >
                    <div className="relative w-full h-full flex items-center justify-center">
                        <div className="absolute inset-0 bg-gray-500/20 blur-lg rounded-full group-hover:bg-gray-500/40 transition-colors" />
                        <div className="relative w-8 h-8 bg-[#0F172A] rounded-full border border-white/10 flex items-center justify-center shadow-lg">
                            <Settings className="w-4 h-4 text-white/60" />
                        </div>
                    </div>
                </motion.button>

                {/* Settings Panel */}
                <AnimatePresence>
                    {showSettings && (
                        <motion.div
                            className="fixed bottom-36 right-8 z-40 bg-[#0F172A] border border-white/10 rounded-2xl p-4 shadow-2xl min-w-[280px]"
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        >
                            <h3 className="text-white font-medium mb-3">Voice Assistant Settings</h3>

                            {/* Wake Word Toggle */}
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <p className="text-white/90 text-sm font-medium">Always listen for "Hey CIVI"</p>
                                    <p className="text-white/50 text-xs mt-1">
                                        {wakeWordState.isSupported
                                            ? 'Activate assistant hands-free'
                                            : 'Not supported in this browser'}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setWakeWordEnabled(!wakeWordEnabled)}
                                    disabled={!wakeWordState.isSupported}
                                    className={`ml-3 relative w-11 h-6 rounded-full transition-colors ${wakeWordEnabled
                                        ? 'bg-blue-500'
                                        : 'bg-white/20'
                                        } ${!wakeWordState.isSupported ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <motion.div
                                        className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md"
                                        animate={{ x: wakeWordEnabled ? 20 : 0 }}
                                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                    />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Alert Notification Panel */}
                <AnimatePresence>
                    {showAlerts && alerts.length > 0 && (
                        <motion.div
                            className="fixed bottom-28 right-8 z-40 bg-[#0F172A] border border-white/10 rounded-2xl p-4 shadow-2xl max-w-md max-h-96 overflow-y-auto"
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-white font-medium">Insights from CIVI</h3>
                                <button
                                    onClick={() => setShowAlerts(false)}
                                    className="text-white/50 hover:text-white/90 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="space-y-3">
                                {alerts.map((alert: any) => (
                                    <div
                                        key={alert.id}
                                        className="bg-white/5 rounded-lg p-3 border border-white/10"
                                    >
                                        <div className="flex items-start gap-2">
                                            <span className="text-xl mt-0.5">
                                                {alert.severity === 'critical' ? '🚨' : alert.severity === 'warning' ? '⚠️' : '📊'}
                                            </span>
                                            <div className="flex-1">
                                                <p className="text-white text-sm font-medium">{alert.title}</p>
                                                <p className="text-white/60 text-xs mt-1">{alert.message}</p>
                                                <div className="flex gap-2 mt-2">
                                                    <button
                                                        onClick={async () => {
                                                            try {
                                                                await fetch(`http://localhost:8001/api/alerts/${alert.id}/read`, {
                                                                    method: 'PATCH'
                                                                });
                                                                setAlerts(alerts.filter(a => a.id !== alert.id));
                                                                setAlertCount(prev => Math.max(0, prev - 1));
                                                            } catch (error) {
                                                                console.error('Failed to dismiss alert:', error);
                                                            }
                                                        }}
                                                        className="text-blue-400 hover:text-blue-300 text-xs transition-colors"
                                                    >
                                                        Dismiss
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Alert Bell Button */}
                {alertCount > 0 && (
                    <motion.button
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowAlerts(!showAlerts);
                        }}
                        className="fixed bottom-24 right-16 w-10 h-10 z-50 group"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        title={`${alertCount} new insight${alertCount > 1 ? 's' : ''}`}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                    >
                        <div className="relative w-full h-full flex items-center justify-center">
                            <div className="absolute inset-0 bg-orange-500/20 blur-lg rounded-full group-hover:bg-orange-500/40 transition-colors" />
                            <div className="relative w-8 h-8 bg-[#0F172A] rounded-full border border-orange-500/30 flex items-center justify-center shadow-lg">
                                <Bell className="w-4 h-4 text-orange-400 group-hover:text-orange-300 transition-colors" />
                            </div>
                            {/* Badge count */}
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center shadow-md">
                                <span className="text-white text-xs font-bold">{alertCount > 9 ? '9+' : alertCount}</span>
                            </div>
                        </div>
                    </motion.button>
                )}

                {/* Main Mic Button */}
                <motion.button
                    onClick={toggleVoice}
                    className="fixed bottom-8 right-8 w-16 h-16 z-50 group"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <div className="relative w-full h-full flex items-center justify-center">
                        {/* Soft Glow */}
                        <div className="absolute inset-0 bg-blue-500/30 blur-xl rounded-full group-hover:bg-blue-500/50 transition-colors" />

                        {/* Trigger Icon */}
                        <div className="relative w-14 h-14 bg-[#0F172A] rounded-full border border-white/10 flex items-center justify-center shadow-2xl overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-cyan-500/20" />
                            <Mic className="w-6 h-6 text-white/90" />
                        </div>
                    </div>
                </motion.button>
            </>
        );
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 0.3 } }}
                    onClick={handleBackdropClick}
                    className="fixed inset-0 bg-[#020617]/80 backdrop-blur-xl z-50 flex items-center justify-center overflow-hidden"
                >
                    {/* Ambient Background Lights */}
                    <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-600/20 blur-[120px] rounded-full mix-blend-screen pointer-events-none" />
                    <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-600/20 blur-[120px] rounded-full mix-blend-screen pointer-events-none" />

                    {/* THE CIVI CARD */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative w-[380px] h-[600px] rounded-[40px] border border-white/10 bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-2xl shadow-2xl flex flex-col items-center overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Avatar Section (The Orb) */}
                        <div className="mt-12 relative">
                            {/* Halo */}
                            <motion.div
                                animate={{ opacity: [0.5, 0.8, 0.5], scale: [1, 1.05, 1] }}
                                transition={{ duration: 3, repeat: Infinity }}
                                className="absolute -top-6 left-1/2 -translate-x-1/2 w-24 h-6 bg-cyan-400/50 blur-xl rounded-full"
                            />
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-20 h-1 bg-cyan-400/80 blur-[2px] rounded-full shadow-[0_0_10px_cyan]" />

                            {/* 3D Orb Avatar */}
                            <div className="w-40 h-40 rounded-full flex items-center justify-center relative">
                                <img
                                    src="/assets/civi_orb_3d.png"
                                    alt="CIVI Avatar"
                                    className="w-full h-full object-contain drop-shadow-2xl"
                                />
                                {/* Breathing Glow */}
                                <motion.div
                                    className="absolute inset-0 rounded-full bg-cyan-400/10 blur-xl"
                                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                                    transition={{ duration: 4, repeat: Infinity }}
                                />
                            </div>
                        </div>

                        {/* Text Section */}
                        <div className="mt-6 text-center px-8">
                            <h2 className="text-3xl font-semibold text-white tracking-tight">
                                Hi, I'm CIVI.
                            </h2>
                            <p className="mt-3 text-lg text-white/60 font-light leading-relaxed">
                                {state.status === 'listening' ? "I'm listening..." :
                                    state.status === 'processing' ? "Thinking..." :
                                        state.status === 'speaking' ? "Speaking..." :
                                            "What property should we look at today?"}
                            </p>

                            {/* Live Transcript */}
                            {state.transcript && (
                                <motion.p
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-4 text-sm text-cyan-300/90 font-medium"
                                >
                                    "{state.transcript}"
                                </motion.p>
                            )}
                        </div>

                        {/* Context Card (Restored) */}
                        <div className="mt-auto mb-20 w-full px-6 relative z-0">
                            <div className="w-full p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                                    <BarChart3 className="w-5 h-5 text-orange-400" />
                                </div>
                                <div className="flex-1">
                                    <div className="text-sm text-white/80 font-medium">Fin Find finance</div>
                                    <div className="text-xs text-white/40">Find investment...</div>
                                </div>
                            </div>
                        </div>

                        {/* Mic Button (Floating over bottom) */}
                        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-10">
                            <motion.button
                                onClick={state.status === 'listening' ? stopListening : () => startListening(context)}
                                animate={state.status === 'listening' ? {
                                    scale: [1, 1.1, 1],
                                    boxShadow: [
                                        "0 0 20px rgba(6, 182, 212, 0.5)",
                                        "0 0 40px rgba(6, 182, 212, 0.8)",
                                        "0 0 20px rgba(6, 182, 212, 0.5)"
                                    ]
                                } : { scale: 1, boxShadow: "0 0 0px rgba(0,0,0,0)" }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                                className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 border border-white/10 ${state.status === 'listening'
                                    ? 'bg-gradient-to-br from-cyan-500 to-blue-600 shadow-[0_0_30px_rgba(6,182,212,0.6)]'
                                    : 'bg-[#0F172A] hover:bg-white/10'
                                    }`}
                            >
                                <Mic className={`w-8 h-8 ${state.status === 'listening' ? 'text-white' : 'text-cyan-400'}`} />
                            </motion.button>
                        </div>

                        {/* Action Buttons */}
                        <div className="absolute bottom-5 w-full px-8 flex justify-between text-xs font-medium text-white/40 uppercase tracking-wider z-0">
                            <button className="hover:text-white transition-colors py-2">Calculate</button>
                            <button className="hover:text-white transition-colors py-2">Hold</button>
                            <button className="hover:text-white transition-colors py-2">Analyze</button>
                        </div>
                    </motion.div>

                    {/* Close Button */}
                    <button
                        onClick={toggleVoice}
                        className="fixed top-8 right-8 p-4 text-white/40 hover:text-white transition-colors rounded-full hover:bg-white/5 z-50"
                    >
                        <X className="w-8 h-8" />
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
