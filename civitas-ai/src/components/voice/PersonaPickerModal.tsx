// FILE: src/components/voice/PersonaPickerModal.tsx
// Centered modal for selecting a voice persona before starting a voice session.
// Extracted from VoiceOrbOverlay's "picking" phase.

import React from 'react';
import { X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { VOICE_PERSONAS, type VoicePersona } from '../../config/voicePersonas';

interface PersonaPickerModalProps {
  isOpen: boolean;
  onSelect: (persona: VoicePersona) => void;
  onClose: () => void;
  currentPersonaId?: string;
}

export const PersonaPickerModal: React.FC<PersonaPickerModalProps> = ({
  isOpen,
  onSelect,
  onClose,
  currentPersonaId,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="relative w-full max-w-lg mx-4 bg-[#111] border border-white/[0.08] rounded-2xl shadow-2xl p-6"
            onClick={e => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/[0.05] hover:bg-white/[0.10] text-white/40 hover:text-white transition-all"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="mb-6 text-center">
              <h2 className="text-white/90 text-lg font-semibold tracking-tight">
                Choose your advisor
              </h2>
              <p className="text-white/35 text-[13px] mt-1">
                Each advisor brings a distinct perspective and expertise
              </p>
            </div>

            {/* Persona cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {VOICE_PERSONAS.map((persona, index) => {
                const isSelected = persona.id === currentPersonaId;
                const { r1, g1, b1 } = persona.orbColors.speaking;
                const accentColor = `rgb(${r1},${g1},${b1})`;
                const initial = persona.name.charAt(0).toUpperCase();

                return (
                  <motion.button
                    key={persona.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onSelect(persona)}
                    className={`relative flex items-start gap-3 p-3.5 rounded-xl text-left transition-all border overflow-hidden ${
                      isSelected
                        ? 'border-opacity-40'
                        : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05] hover:border-white/[0.10]'
                    }`}
                    style={
                      isSelected
                        ? {
                            borderColor: `rgba(${r1},${g1},${b1},0.35)`,
                            background: `linear-gradient(135deg, rgba(${r1},${g1},${b1},0.06) 0%, rgba(${r1},${g1},${b1},0.02) 100%)`,
                          }
                        : undefined
                    }
                  >
                    {/* Left accent bar */}
                    <div
                      className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-xl"
                      style={{
                        backgroundColor: accentColor,
                        opacity: isSelected ? 0.8 : 0.3,
                      }}
                    />

                    {/* Monogram */}
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 text-sm font-bold"
                      style={{
                        background: `linear-gradient(135deg, rgba(${r1},${g1},${b1},0.25) 0%, rgba(${r1},${g1},${b1},0.10) 100%)`,
                        color: accentColor,
                        border: `1px solid rgba(${r1},${g1},${b1},0.2)`,
                      }}
                    >
                      {initial}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">
                          {persona.name}
                        </span>
                        {isSelected && (
                          <Check
                            className="w-3.5 h-3.5 ml-auto shrink-0"
                            style={{ color: accentColor }}
                          />
                        )}
                      </div>
                      <span className="text-[11px] text-white/30 font-medium uppercase tracking-wider">
                        {persona.tagline}
                      </span>
                      <p className="text-xs text-white/40 mt-1 leading-relaxed line-clamp-2">
                        {persona.description}
                      </p>

                      {/* Specialty chips */}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {persona.specialties.map(s => (
                          <span
                            key={s}
                            className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                            style={{
                              backgroundColor: `rgba(${r1},${g1},${b1},${isSelected ? 0.12 : 0.06})`,
                              color: `rgba(${r1},${g1},${b1},${isSelected ? 0.9 : 0.6})`,
                              border: `1px solid rgba(${r1},${g1},${b1},${isSelected ? 0.15 : 0.08})`,
                            }}
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
