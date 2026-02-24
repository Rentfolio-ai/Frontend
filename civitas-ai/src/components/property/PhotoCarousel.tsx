/**
 * PhotoCarousel – Swipeable photo carousel for property cards.
 * Shows navigation arrows and dot indicators for multiple photos.
 * Gracefully handles single-photo and no-photo states.
 */

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Home } from 'lucide-react';
import { cn } from '../../lib/utils';

interface PhotoCarouselProps {
  photos: string[];
  alt?: string;
  aspectRatio?: string;
  className?: string;
  showDots?: boolean;
  showArrows?: boolean;
  children?: React.ReactNode;
}

export const PhotoCarousel: React.FC<PhotoCarouselProps> = ({
  photos,
  alt = 'Property',
  aspectRatio = 'aspect-[4/3]',
  className,
  showDots = true,
  showArrows = true,
  children,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imgErrors, setImgErrors] = useState<Set<number>>(new Set());

  const validPhotos = photos.filter((_, i) => !imgErrors.has(i));
  const hasMultiple = validPhotos.length > 1;

  const handlePrev = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex(prev => (prev - 1 + photos.length) % photos.length);
  }, [photos.length]);

  const handleNext = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex(prev => (prev + 1) % photos.length);
  }, [photos.length]);

  const handleImgError = useCallback((index: number) => {
    setImgErrors(prev => {
      const next = new Set(prev).add(index);
      // Auto-advance to next valid photo
      const nextValid = photos.findIndex((_, i) => i !== index && !next.has(i));
      if (nextValid !== -1) {
        setCurrentIndex(nextValid);
      }
      return next;
    });
  }, [photos]);

  const currentPhoto = photos[currentIndex];
  const isCurrentValid = currentPhoto && !imgErrors.has(currentIndex);

  return (
    <div className={cn('relative overflow-hidden group/carousel', aspectRatio, className)}>
      {/* Photo or placeholder */}
      {isCurrentValid ? (
        <AnimatePresence mode="wait">
          <motion.img
            key={currentIndex}
            src={currentPhoto}
            alt={`${alt} ${currentIndex + 1}`}
            onError={() => handleImgError(currentIndex)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full h-full object-cover"
          />
        </AnimatePresence>
      ) : (
        <div className="w-full h-full bg-gradient-to-b from-[#1a1a1f] to-[#16161a] flex flex-col items-center justify-center gap-1.5">
          <Home className="w-7 h-7 text-white/15" />
          <span className="text-[10px] text-white/20 font-medium">No image</span>
        </div>
      )}

      {/* Vignette overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/5 pointer-events-none" />

      {/* Navigation arrows */}
      {hasMultiple && showArrows && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 backdrop-blur-sm
                       flex items-center justify-center text-white/70 hover:text-white hover:bg-black/60
                       opacity-0 group-hover/carousel:opacity-100 transition-all duration-200 z-10"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 backdrop-blur-sm
                       flex items-center justify-center text-white/70 hover:text-white hover:bg-black/60
                       opacity-0 group-hover/carousel:opacity-100 transition-all duration-200 z-10"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </>
      )}

      {/* Dot indicators (max 5 dots) */}
      {hasMultiple && showDots && photos.length <= 5 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 z-10">
          {photos.map((_, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); setCurrentIndex(i); }}
              className={cn(
                'w-1.5 h-1.5 rounded-full transition-all duration-200',
                i === currentIndex
                  ? 'bg-white w-3'
                  : 'bg-white/40 hover:bg-white/60'
              )}
            />
          ))}
        </div>
      )}

      {/* Photo count badge */}
      {hasMultiple && (
        <span className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded bg-black/50 backdrop-blur-sm text-[9px] text-white/80 font-medium z-10">
          {currentIndex + 1}/{photos.length}
        </span>
      )}

      {/* Overlay children (badges, buttons, etc.) */}
      {children}
    </div>
  );
};

export default PhotoCarousel;
