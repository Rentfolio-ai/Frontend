import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';

interface CiviPanelProps {
    mode: 'idle' | 'docked';
    status: 'idle' | 'listening' | 'processing' | 'speaking';
    transcript?: string;
    onMicClick: () => void;
    suggestedPrompts?: string[];
    onPromptClick?: (prompt: string) => void;
    className?: string;
}

export const CiviPanel: React.FC<CiviPanelProps> = ({
    mode,
    status,
    transcript,
    onMicClick,
    suggestedPrompts = [
        'Analyze this address',
        'Find cash-flowing deals in Austin',
        'Explain my DSCR and cap rate'
    ],
    onPromptClick,
    className
}) => {
    const isDocked = mode === 'docked';

    return (
        <motion.div
            layout
            className={cn(
                "relative overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-2xl shadow-2xl flex flex-col items-center transition-all duration-500",
                isDocked ? "w-full h-full" : "w-full max-w-[400px] h-[600px]",
                className
            )}
        >
            {/* Ambient Background Lights inside the card */}
            <div className="absolute top-[-20%] left-[-10%] w-[150%] h-[50%] bg-blue-600/20 blur-[80px] rounded-full mix-blend-screen pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[150%] h-[50%] bg-purple-600/20 blur-[80px] rounded-full mix-blend-screen pointer-events-none" />

            {/* Content Container */}
            <div className={cn(
                "relative z-10 flex flex-col items-center w-full h-full p-8",
                isDocked ? "justify-start pt-12" : "justify-center"
            )}>

                {/* Avatar Section */}
                <motion.div
                    layout
                    className={cn(
                        "relative flex-shrink-0",
                        isDocked ? "mb-6 scale-90" : "mb-8"
                    )}
                >
                    {/* Halo */}
                    <motion.div
                        animate={{
                            opacity: status === 'speaking' || status === 'processing' ? [0.5, 0.8, 0.5] : 0.3,
                            scale: status === 'speaking' || status === 'processing' ? [1, 1.1, 1] : 1
                        }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="absolute -top-6 left-1/2 -translate-x-1/2 w-24 h-6 bg-cyan-400/50 blur-xl rounded-full"
                    />

                    {/* 3D Orb Avatar */}
                    <div className="w-32 h-32 rounded-full flex items-center justify-center relative">
                        <img
                            src="/assets/civi_orb_3d.png"
                            alt="CIVI Avatar"
                            className="w-full h-full object-contain drop-shadow-2xl"
                        />
                        {/* Breathing Glow */}
                        <motion.div
                            className="absolute inset-0 rounded-full bg-cyan-400/10 blur-xl"
                            animate={{
                                scale: status === 'listening' ? [1, 1.2, 1] : 1,
                                opacity: status === 'listening' ? [0.3, 0.6, 0.3] : 0.2
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                        />
                    </div>
                </motion.div>

                {/* Text Section */}
                <motion.div layout className="text-center space-y-2 max-w-xs">
                    <motion.h2 layout className="text-2xl font-bold text-white tracking-tight">
                        Hi, I'm CIVI.
                    </motion.h2>
                    <motion.p layout className="text-white/60 font-light leading-relaxed">
                        {status === 'listening' ? "Listening..." :
                            status === 'processing' ? "Thinking..." :
                                status === 'speaking' ? "Speaking..." :
                                    "Your ProphetAtlas real estate co-pilot."}
                    </motion.p>

                    {/* Live Transcript */}
                    <AnimatePresence mode="wait">
                        {transcript && (
                            <motion.p
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="text-sm text-cyan-300/90 font-medium mt-2 min-h-[20px]"
                            >
                                "{transcript}"
                            </motion.p>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Suggested Prompts (Only in Idle mode) */}
                {!isDocked && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="mt-8 flex flex-col gap-2 w-full"
                    >
                        {suggestedPrompts.map((prompt, idx) => (
                            <button
                                key={idx}
                                onClick={() => onPromptClick?.(prompt)}
                                className="w-full p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all text-sm text-white/70 hover:text-white text-left flex items-center gap-3 group"
                            >
                                <Sparkles className="w-4 h-4 text-cyan-400/50 group-hover:text-cyan-400 transition-colors" />
                                {prompt}
                            </button>
                        ))}
                    </motion.div>
                )}

                {/* Mic Button (Always visible, moves to bottom) */}
                <div className="mt-auto pt-8">
                    <motion.button
                        onClick={onMicClick}
                        animate={status === 'listening' ? {
                            scale: [1, 1.1, 1],
                            boxShadow: [
                                "0 0 20px rgba(6, 182, 212, 0.5)",
                                "0 0 40px rgba(6, 182, 212, 0.8)",
                                "0 0 20px rgba(6, 182, 212, 0.5)"
                            ]
                        } : { scale: 1, boxShadow: "0 0 0px rgba(0,0,0,0)" }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className={cn(
                            "w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 border border-white/10",
                            status === 'listening'
                                ? 'bg-gradient-to-br from-cyan-500 to-blue-600 shadow-[0_0_30px_rgba(6,182,212,0.6)]'
                                : 'bg-[#0F172A] hover:bg-white/10'
                        )}
                    >
                        <Mic className={cn(
                            "w-6 h-6 transition-colors",
                            status === 'listening' ? 'text-white' : 'text-cyan-400'
                        )} />
                    </motion.button>
                </div>
            </div>
        </motion.div>
    );
};
