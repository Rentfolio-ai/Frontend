// FILE: src/components/chat/AgentModeSelector.tsx
import React from 'react';
import { Brain, Search, Target } from 'lucide-react';
import type { AgentMode } from '../../types/chat';

interface AgentModeSelectorProps {
    currentMode: AgentMode;
    onModeChange: (mode: AgentMode) => void;
    disabled?: boolean;
}

export const AgentModeSelector: React.FC<AgentModeSelectorProps> = ({
    currentMode,
    onModeChange,
    disabled
}) => {
    // Define modes here for easy customization
    const modes: { id: AgentMode, label: string, icon: React.ReactNode, description?: string }[] = [
        { id: 'research', label: 'Research', icon: <Search className="w-3 h-3" /> },
        { id: 'strategist', label: 'Strategist', icon: <Brain className="w-3 h-3" /> },
        { id: 'hunter', label: 'Hunter', icon: <Target className="w-3 h-3" /> },
        // Future modes can be added here, e.g.:
        // { id: 'builder', label: 'Build', icon: <Wrench className="w-4 h-4" /> },
        // { id: 'planner', label: 'Plan', icon: <FileText className="w-4 h-4" /> },
    ];

    return (
        <div className="absolute top-4 left-0 right-0 z-10 flex justify-center pointer-events-none">
            <div className="bg-black/40 backdrop-blur-md p-0.5 rounded-full border border-white/10 pointer-events-auto flex gap-0.5">
                {modes.map(mode => (
                    <button
                        key={mode.id}
                        onClick={() => onModeChange(mode.id)}
                        disabled={disabled}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium transition-all ${currentMode === mode.id
                            ? mode.id === 'hunter' ? 'bg-[#C08B5C]/15 text-[#D4A27F] shadow-lg border border-[#C08B5C]/20' :
                                mode.id === 'research' ? 'bg-blue-400/15 text-blue-300 shadow-lg border border-blue-400/20' :
                                    mode.id === 'strategist' ? 'bg-purple-400/15 text-purple-300 shadow-lg border border-purple-400/20' :
                                        'bg-white/10 text-white shadow-lg border border-white/10'
                            : 'text-white/40 hover:text-white/70 hover:bg-white/5'
                            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                        title={mode.description}
                    >
                        {mode.icon}
                        {mode.label}
                    </button>
                ))}
            </div>
        </div>
    );
};
