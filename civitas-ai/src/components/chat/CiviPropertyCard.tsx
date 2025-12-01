import React from 'react';
import { Mic, Building2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface CiviPropertyCardProps {
    activeProperty?: {
        address: string;
        city?: string;
        imageUrl?: string;
        capRate?: number;
        cashFlow?: number;
        dscr?: number;
    };
    onFindSimilar?: () => void;
    onMicClick?: () => void;
    isListening?: boolean;
    className?: string;
}

export const CiviPropertyCard: React.FC<CiviPropertyCardProps> = ({
    activeProperty,
    onFindSimilar,
    onMicClick,
    isListening,
    className,
}) => {
    return (
        <div className={cn(
            "relative overflow-hidden rounded-[24px] border border-white/10 bg-gradient-to-b from-[#0f172a] to-[#020617] flex flex-col h-full shadow-2xl",
            className
        )}>
            {/* Ambient Background Glow */}
            <div className="absolute top-[-20%] right-[-20%] w-[80%] h-[40%] bg-blue-500/10 blur-[60px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[40%] bg-purple-500/10 blur-[60px] rounded-full pointer-events-none" />

            {/* Digital Assistant Layout */}
            <div className="flex-1 flex flex-col items-center justify-end relative z-10 px-6 pt-6 pb-20 space-y-8">

                {/* Avatar Section */}
                <div className="relative">
                    {/* Halo Ring */}
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-32 h-8 bg-cyan-500/30 blur-2xl rounded-full" />
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-24 h-1 bg-cyan-400/50 blur-sm rounded-full" />

                    <div className="relative w-40 h-40 rounded-full flex items-center justify-center z-10">
                        <img
                            src="/assets/civi_avatar_3d.png"
                            alt="CIVI"
                            className="w-full h-full object-cover drop-shadow-2xl scale-110"
                        />
                    </div>
                </div>

                {/* Text Section */}
                <div className="text-center space-y-3">
                    <h2 className="text-4xl font-bold text-white tracking-tight">
                        Hi, I'm CIVI.
                    </h2>
                    <p className="text-lg text-white/60 font-light max-w-[240px] mx-auto leading-relaxed">
                        What property should we look at today?
                    </p>
                </div>

                {/* Active Property Context (Mini Card) */}
                {activeProperty && (
                    <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-3 flex items-center gap-3 backdrop-blur-md animate-fade-in-up">
                        <div className="w-12 h-12 rounded-lg bg-black/40 overflow-hidden flex-shrink-0">
                            {activeProperty.imageUrl ? (
                                <img src={activeProperty.imageUrl} alt="Property" className="w-full h-full object-cover" />
                            ) : (
                                <Building2 className="w-6 h-6 text-white/40 m-auto h-full" />
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-white font-medium truncate">{activeProperty.address}</h3>
                            <p className="text-white/40 text-xs truncate">
                                Cap: {activeProperty.capRate}% • CF: ${activeProperty.cashFlow}
                            </p>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-1 h-4 bg-cyan-500 rounded-full animate-pulse" />
                            <div className="w-1 h-6 bg-cyan-500 rounded-full animate-pulse delay-75" />
                            <div className="w-1 h-3 bg-cyan-500 rounded-full animate-pulse delay-150" />
                        </div>
                    </div>
                )}

                {/* Mic Button - Prominent & Glowing */}
                <div className="relative group cursor-pointer mt-auto" onClick={onMicClick}>
                    <div className={`absolute inset-0 bg-cyan-500/30 rounded-full blur-xl transition-all duration-500 ${isListening ? 'scale-150 opacity-100' : 'scale-100 opacity-0 group-hover:opacity-50'}`} />
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center border transition-all duration-300 ${isListening ? 'bg-cyan-500 border-cyan-400 shadow-[0_0_40px_rgba(6,182,212,0.6)]' : 'bg-gradient-to-b from-cyan-500/20 to-cyan-900/20 border-cyan-500/30 hover:border-cyan-400/50'}`}>
                        <Mic className={`w-8 h-8 ${isListening ? 'text-white animate-pulse' : 'text-cyan-400'}`} />
                    </div>
                </div>

                {/* Bottom Actions */}
                <div className="flex items-center gap-3 w-full pt-4">
                    <button className="flex-1 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 text-white/60 hover:text-white text-sm font-medium transition-all">
                        Buy
                    </button>
                    <button className="flex-1 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 text-white/60 hover:text-white text-sm font-medium transition-all">
                        Hold
                    </button>
                    <button
                        onClick={() => onFindSimilar && onFindSimilar()}
                        className="flex-1 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 text-white/60 hover:text-white text-sm font-medium transition-all"
                    >
                        Analyze
                    </button>
                </div>

            </div>
        </div>
    );
};
