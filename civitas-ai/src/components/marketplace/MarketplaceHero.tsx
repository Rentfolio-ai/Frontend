import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star, Phone, Globe, Mail, MapPin, MessageSquare } from 'lucide-react';
import type { Professional } from './marketplaceData';
import { CATEGORY_LABELS } from './marketplaceData';

interface MarketplaceHeroProps {
  featured: Professional[];
  onSelect: (professional: Professional) => void;
  onEmail?: (professional: Professional) => void;
  onText?: (professional: Professional) => void;
  onCall?: (professional: Professional) => void;
}

export const MarketplaceHero: React.FC<MarketplaceHeroProps> = ({ featured, onSelect, onEmail, onText, onCall }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const advance = useCallback(() => {
    setActiveIndex(prev => (prev + 1) % featured.length);
  }, [featured.length]);

  const goBack = useCallback(() => {
    setActiveIndex(prev => (prev - 1 + featured.length) % featured.length);
  }, [featured.length]);

  useEffect(() => {
    if (isPaused || featured.length <= 1) return;
    const timer = setInterval(advance, 5000);
    return () => clearInterval(timer);
  }, [isPaused, advance, featured.length]);

  if (featured.length === 0) return null;

  const current = featured[activeIndex];
  const hasContact = current.phone || current.email || current.website;

  return (
    <div
      className="relative rounded-2xl overflow-hidden glass-strong"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-[#A8734A]/20 via-transparent to-[#C08B5C]/10 z-[1]" />

      {/* Counter */}
      <div className="absolute top-3 right-4 z-[4] text-[10px] text-white/20 font-mono">
        {activeIndex + 1} / {featured.length}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          className="relative z-[3]"
        >
          <div className="px-12 py-5">
            {/* Top row: avatar + info + connect */}
            <div className="flex gap-4 items-start">
              {/* Avatar */}
              {current.imageUrl ? (
                <img
                  src={current.imageUrl}
                  alt={current.name}
                  className="w-[72px] h-[72px] rounded-xl object-cover flex-shrink-0 shadow-lg"
                />
              ) : (
                <div
                  className={`w-[72px] h-[72px] rounded-xl bg-gradient-to-br ${current.accentColor}
                              flex items-center justify-center text-white text-2xl font-bold shadow-lg flex-shrink-0`}
                >
                  {current.name.charAt(0)}
                </div>
              )}

              {/* Text content */}
              <div className="flex-1 min-w-0">
                <span className="text-[10px] text-white/30 font-medium uppercase tracking-wider">
                  {CATEGORY_LABELS[current.category]}
                </span>

                <h2 className="font-display text-[17px] text-white font-bold tracking-tight truncate mt-0.5">
                  {current.name}
                </h2>

                <div className="flex items-center gap-1.5 mt-1">
                  <Star className="w-3 h-3 text-[#D4A27F] fill-[#D4A27F]" />
                  <span className="text-[12px] text-white/80 font-medium">{current.rating}</span>
                  {current.reviewCount > 0 && (
                    <span className="text-[11px] text-white/30">({current.reviewCount} reviews)</span>
                  )}
                  {current.serviceAreas[0] && (
                    <span className="flex items-center gap-0.5 text-[11px] text-white/25 ml-1.5">
                      <MapPin className="w-2.5 h-2.5" />
                      {current.serviceAreas[0]}
                    </span>
                  )}
                </div>

                <p className="text-[12px] text-white/40 leading-snug mt-1.5 line-clamp-2">
                  {current.description}
                </p>
              </div>

              {/* Connect button */}
              <button
                onClick={() => onSelect(current)}
                className="flex-shrink-0 mt-3 px-4 py-1.5 rounded-full bg-white/[0.10] hover:bg-white/[0.15]
                           text-[12px] text-white/90 font-medium transition-all duration-150"
              >
                Connect
              </button>
            </div>

            {/* Contact actions row */}
            {hasContact && (
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/[0.06]">
                {current.email && (
                  <button
                    onClick={() => onEmail?.(current)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium
                               text-white/40 hover:text-white/70 hover:bg-white/[0.06] transition-all"
                  >
                    <Mail className="w-3 h-3" />
                    <span>Email</span>
                  </button>
                )}
                {current.phone && (
                  <button
                    onClick={() => onText?.(current)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium
                               text-white/40 hover:text-white/70 hover:bg-white/[0.06] transition-all"
                  >
                    <MessageSquare className="w-3 h-3" />
                    <span>Text</span>
                  </button>
                )}
                {current.phone && (
                  <button
                    onClick={() => onCall?.(current)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium
                               text-white/40 hover:text-white/70 hover:bg-white/[0.06] transition-all"
                  >
                    <Phone className="w-3 h-3" />
                    <span>Call</span>
                  </button>
                )}
                {current.website && (
                  <a
                    href={current.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium
                               text-white/40 hover:text-white/70 hover:bg-white/[0.06] transition-all truncate ml-auto"
                  >
                    <Globe className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{current.website.replace(/^https?:\/\/(www\.)?/, '')}</span>
                  </a>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation arrows */}
      {featured.length > 1 && (
        <>
          <button
            onClick={goBack}
            className="absolute left-1.5 top-1/2 -translate-y-1/2 z-[4] p-1 rounded-full
                       bg-black/30 hover:bg-black/50 text-white/30 hover:text-white/60 transition-all"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={advance}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 z-[4] p-1 rounded-full
                       bg-black/30 hover:bg-black/50 text-white/30 hover:text-white/60 transition-all"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </>
      )}

      {/* Progress bar */}
      {featured.length > 1 && (
        <div className="absolute bottom-0 left-0 right-0 h-[2px] z-[5] flex">
          {featured.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className="flex-1 relative h-full"
            >
              <div className="absolute inset-0 bg-white/[0.04]" />
              {i === activeIndex && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-[#C08B5C] to-[#D4A27F]"
                  layoutId="hero-progress"
                  transition={{ duration: 0.3 }}
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
