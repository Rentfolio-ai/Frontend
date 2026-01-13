import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, BedDouble, Bath, DollarSign, Calendar, Heart, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

export interface PropertyData {
  id: string;
  name: string;
  address: string;
  bedrooms: number;
  bathrooms: number;
  rent: number;
  image?: string;
  description?: string;
  amenities?: string[];
  available?: string;
}

interface FloatingPropertyCardProps {
  properties: PropertyData[];
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onSchedule: (property: PropertyData) => void;
  onSave: (property: PropertyData) => void;
  onMore: (property: PropertyData) => void;
}

export function FloatingPropertyCard({
  properties,
  currentIndex,
  onClose,
  onNext,
  onPrevious,
  onSchedule,
  onSave,
  onMore,
}: FloatingPropertyCardProps) {
  const [isSaved, setIsSaved] = useState(false);
  
  if (properties.length === 0) return null;
  
  const property = properties[currentIndex];
  if (!property) return null;

  const handleSave = () => {
    setIsSaved(!isSaved);
    onSave(property);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: 400, opacity: 0, scale: 0.9 }}
        animate={{ x: 0, opacity: 1, scale: 1 }}
        exit={{ x: 400, opacity: 0, scale: 0.9 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="fixed right-8 top-1/2 -translate-y-1/2 w-[420px] max-h-[80vh] 
                   bg-slate-900/95 backdrop-blur-2xl rounded-3xl border border-white/20 
                   overflow-hidden shadow-2xl shadow-black/50 z-[10000]"
      >
        {/* Property image */}
        <div className="relative h-56 bg-gradient-to-br from-blue-500 to-purple-600 overflow-hidden">
          {property.image ? (
            <img 
              src={property.image} 
              alt={property.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-white/50 text-6xl">🏠</span>
            </div>
          )}
          
          {/* Top controls */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
            <motion.button
              onClick={handleSave}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className={`p-3 rounded-full backdrop-blur-md transition-all ${
                isSaved 
                  ? 'bg-red-500/80 border-red-400' 
                  : 'bg-black/30 hover:bg-black/50 border-white/20'
              } border`}
            >
              <Heart 
                className={`h-5 w-5 ${isSaved ? 'fill-white text-white' : 'text-white'}`} 
              />
            </motion.button>

            <motion.button
              onClick={onClose}
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              className="p-3 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-md 
                         text-white border border-white/20 transition-all"
            >
              <X className="h-5 w-5" />
            </motion.button>
          </div>

          {/* Property counter */}
          {properties.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
              <div className="px-4 py-2 rounded-full bg-black/50 backdrop-blur-md border border-white/20">
                <span className="text-white text-sm font-medium">
                  {currentIndex + 1} / {properties.length}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Property details */}
        <div className="p-6 space-y-5">
          {/* Title and price */}
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-2xl font-bold text-white leading-tight">
                {property.name}
              </h3>
              <div className="flex items-center gap-1 text-emerald-400 font-bold text-xl whitespace-nowrap">
                <DollarSign className="h-5 w-5" />
                <span>{property.rent.toLocaleString()}</span>
                <span className="text-sm text-white/50 font-normal">/mo</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-white/60">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span className="text-sm">{property.address}</span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10">
              <BedDouble className="h-5 w-5 text-blue-400" />
              <div>
                <div className="text-white font-semibold">{property.bedrooms}</div>
                <div className="text-white/50 text-xs">Beds</div>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10">
              <Bath className="h-5 w-5 text-purple-400" />
              <div>
                <div className="text-white font-semibold">{property.bathrooms}</div>
                <div className="text-white/50 text-xs">Baths</div>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10">
              <Calendar className="h-5 w-5 text-green-400" />
              <div>
                <div className="text-white font-semibold text-xs">{property.available || 'Now'}</div>
                <div className="text-white/50 text-xs">Available</div>
              </div>
            </div>
          </div>

          {/* Description */}
          {property.description && (
            <p className="text-white/70 text-sm leading-relaxed line-clamp-2">
              {property.description}
            </p>
          )}

          {/* Amenities */}
          {property.amenities && property.amenities.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {property.amenities.slice(0, 3).map((amenity, i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 
                             text-blue-300 text-xs font-medium"
                >
                  {amenity}
                </span>
              ))}
              {property.amenities.length > 3 && (
                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 
                                 text-white/50 text-xs">
                  +{property.amenities.length - 3} more
                </span>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2 pt-2">
            <motion.button
              onClick={() => onMore(property)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/15 
                         text-white font-medium transition-all border border-white/20"
            >
              Details
            </motion.button>
            <motion.button
              onClick={() => onSchedule(property)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 
                         hover:from-blue-600 hover:to-purple-700 text-white font-semibold 
                         transition-all shadow-lg shadow-blue-500/20 flex items-center 
                         justify-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              Schedule
            </motion.button>
          </div>

          {/* Navigation */}
          {properties.length > 1 && (
            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <motion.button
                onClick={onPrevious}
                disabled={currentIndex === 0}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 
                           hover:bg-white/10 text-white/70 hover:text-white disabled:opacity-30 
                           disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </motion.button>
              
              <motion.button
                onClick={onNext}
                disabled={currentIndex === properties.length - 1}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 
                           hover:bg-white/10 text-white/70 hover:text-white disabled:opacity-30 
                           disabled:cursor-not-allowed transition-all"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </motion.button>
            </div>
          )}

          {/* Voice hint */}
          <div className="text-center text-white/40 text-xs pt-2 border-t border-white/5">
            Say "next", "previous", "schedule", or "tell me more"
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

