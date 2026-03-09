import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play } from 'lucide-react';

interface DemoVideoEmbedProps {
  videoUrl?: string;
}

export const DemoVideoEmbed: React.FC<DemoVideoEmbedProps> = ({
  videoUrl,
}) => {
  const [playing, setPlaying] = useState(false);
  const hasVideo = !!videoUrl;

  const embedUrl = playing && hasVideo
    ? `${videoUrl}${videoUrl.includes('?') ? '&' : '?'}autoplay=1&rel=0`
    : '';

  return (
    <div className="relative w-full overflow-hidden">
      <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
        <AnimatePresence mode="wait">
          {!playing || !hasVideo ? (
            <motion.div
              key="poster"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              onClick={hasVideo ? () => setPlaying(true) : undefined}
              className={`absolute inset-0 w-full h-full flex flex-col items-center justify-center gap-5 bg-background ${hasVideo ? 'cursor-pointer group' : ''}`}
              role={hasVideo ? 'button' : undefined}
              tabIndex={hasVideo ? 0 : undefined}
            >
              <div
                className="absolute inset-0 opacity-[0.04]"
                style={{
                  backgroundImage:
                    'linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)',
                  backgroundSize: '48px 48px',
                }}
              />

              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(192,139,92,0.1)_0%,transparent_60%)]" />

              <div className="relative z-10 w-[72px] h-[72px] rounded-full bg-gradient-to-br from-[#C08B5C] to-[#A8734A] flex items-center justify-center shadow-[0_0_40px_rgba(192,139,92,0.3)] group-hover:shadow-[0_0_60px_rgba(192,139,92,0.45)] group-hover:scale-105 transition-all duration-300">
                <Play className="w-7 h-7 text-white ml-1" fill="white" />
              </div>

              <span className="relative z-10 text-[14px] font-medium text-muted-foreground group-hover:text-foreground/70 transition-colors duration-300 tracking-wide">
                {hasVideo ? 'Watch the full demo' : 'Demo video coming soon'}
              </span>
            </motion.div>
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
