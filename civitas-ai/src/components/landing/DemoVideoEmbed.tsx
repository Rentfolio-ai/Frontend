import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play } from 'lucide-react';

interface DemoVideoEmbedProps {
  videoUrl?: string;
}

const DEFAULT_VIDEO_URL = 'https://www.youtube.com/embed/dQw4w9WgXcQ';

export const DemoVideoEmbed: React.FC<DemoVideoEmbedProps> = ({
  videoUrl = DEFAULT_VIDEO_URL,
}) => {
  const [playing, setPlaying] = useState(false);

  const embedUrl = playing
    ? `${videoUrl}${videoUrl.includes('?') ? '&' : '?'}autoplay=1&rel=0`
    : '';

  return (
    <div className="relative w-full rounded-[20px] overflow-hidden border border-white/[0.04] shadow-[0_8px_80px_rgba(192,139,92,0.12)]">
      <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
        <AnimatePresence mode="wait">
          {!playing ? (
            <motion.button
              key="poster"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              onClick={() => setPlaying(true)}
              className="absolute inset-0 w-full h-full flex flex-col items-center justify-center gap-5 cursor-pointer group bg-[#111113]"
            >
              {/* Subtle grid pattern */}
              <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                  backgroundImage:
                    'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)',
                  backgroundSize: '48px 48px',
                }}
              />

              {/* Radial glow behind play button */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(192,139,92,0.08)_0%,transparent_60%)]" />

              {/* Play button */}
              <div className="relative z-10 w-[72px] h-[72px] rounded-full bg-gradient-to-br from-[#C08B5C] to-[#A8734A] flex items-center justify-center shadow-[0_0_40px_rgba(192,139,92,0.3)] group-hover:shadow-[0_0_60px_rgba(192,139,92,0.45)] group-hover:scale-105 transition-all duration-300">
                <Play className="w-7 h-7 text-white ml-1" fill="white" />
              </div>

              {/* Label */}
              <span className="relative z-10 text-[14px] font-medium text-white/40 group-hover:text-white/60 transition-colors duration-300 tracking-wide">
                Watch the full demo
              </span>

              {/* Bottom gradient fade */}
              <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#0A0A0C]/40 to-transparent" />
            </motion.button>
          ) : (
            <motion.iframe
              key="video"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              src={embedUrl}
              title="Civitas Product Demo"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
              style={{ border: 'none' }}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
