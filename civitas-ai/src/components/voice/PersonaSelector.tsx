import { motion } from 'framer-motion';
import { PERSONAS, type Persona } from '@/types/persona';
import { ArrowRight } from 'lucide-react';

interface PersonaSelectorProps {
    onSelect: (persona: Persona) => void;
    onClose: () => void;
}

export function PersonaSelector({ onSelect, onClose }: PersonaSelectorProps) {
    const personaMeta = {
        professional: { tone: 'Formal · Data-first' },
        friendly: { tone: 'Warm · Approachable' },
        expert: { tone: 'Technical · Deep-dive' },
        concise: { tone: 'Brief · To-the-point' },
    } as const;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center p-8 bg-gradient-to-b from-[#171a23] via-[#0f1118] to-[#0a0d14]"
        >
            {/* Subtle noise overlay */}
            <div
                className="absolute inset-0 pointer-events-none opacity-[0.04]"
                style={{
                    backgroundImage:
                        "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E\")",
                }}
            />

            {/* Header */}
            <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-center mb-12 relative z-10"
            >
                <h1 className="text-4xl font-bold text-white mb-3">Choose Your Vasthu</h1>
                <p className="text-lg text-white/60">Select a persona that matches your style</p>
            </motion.div>

            {/* Persona cards grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl w-full relative z-10">
                {PERSONAS.map((persona, index) => (
                    <motion.button
                        key={persona.id}
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 + index * 0.1 }}
                        onClick={() => onSelect(persona)}
                        className="group relative overflow-hidden rounded-2xl bg-white/4 backdrop-blur-md 
                       border border-white/10 p-6 text-left transition-all duration-300
                       hover:bg-white/8 hover:border-white/20 hover:scale-[1.02]
                       focus:outline-none focus:ring-2 focus:ring-white/30"
                    >
                        {/* Gradient overlay on hover */}
                        <div
                            className={`absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity 
                          bg-gradient-to-br ${persona.gradient}`}
                        />

                        {/* Content */}
                        <div className="relative z-10">
                            {/* Icon */}
                            <div className="text-5xl mb-4">{persona.icon}</div>

                            {/* Name */}
                            <h3 className="text-xl font-semibold text-white mb-2">{persona.name}</h3>

                            {/* Description */}
                            <p className="text-sm text-white/60 leading-relaxed mb-4">
                                {persona.description}
                            </p>

                            {/* Tone */}
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-white/60">
                                <span className="h-2 w-2 rounded-full bg-white/60" />
                                <span>{personaMeta[persona.id as keyof typeof personaMeta]?.tone || 'Balanced tone'}</span>
                            </div>

                            {/* Select indicator */}
                            <div className="flex items-center gap-2 text-sm text-white/40 group-hover:text-white/70 transition-colors">
                                <span>Select</span>
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    </motion.button>
                ))}
            </div>

            {/* Close button */}
            <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                onClick={onClose}
                className="mt-8 px-6 py-2 text-white/50 hover:text-white/80 transition-colors relative z-10"
            >
                Cancel
            </motion.button>
        </motion.div>
    );
}
