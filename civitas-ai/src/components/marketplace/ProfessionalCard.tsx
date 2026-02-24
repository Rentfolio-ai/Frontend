import React from 'react';
import { motion } from 'framer-motion';
import { Star, MessageSquare, Phone, Mail, MapPin } from 'lucide-react';
import type { Professional } from './marketplaceData';

interface ProfessionalCardProps {
  professional: Professional;
  index: number;
  rank: number;
  onChat: (professional: Professional) => void;
  onVoice: (professional: Professional) => void;
  onEmail?: (professional: Professional) => void;
  onText?: (professional: Professional) => void;
}

export const ProfessionalCard: React.FC<ProfessionalCardProps> = ({
  professional,
  index,
  rank,
  onChat,
  onVoice,
  onEmail,
  onText,
}) => {
  const area = professional.serviceAreas?.[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.04 }}
      className="group relative flex items-start gap-2.5 px-3 py-2 rounded-xl
                 hover:bg-white/[0.04] transition-all duration-150"
    >
      {/* Rank number */}
      <span className="text-[11px] text-white/15 font-mono w-5 pt-1 text-right flex-shrink-0 select-none">
        #{rank}
      </span>

      {/* Avatar */}
      {professional.imageUrl ? (
        <img
          src={professional.imageUrl}
          alt={professional.name}
          className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
        />
      ) : (
        <div
          className={`w-10 h-10 rounded-lg bg-gradient-to-br ${professional.accentColor}
                      flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}
        >
          {professional.name.charAt(0)}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Row 1: name + rating */}
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-[13px] font-semibold text-white/90 truncate">
            {professional.name}
          </span>
          {professional.featured && (
            <span className="gradient-text text-[10px] font-semibold flex-shrink-0">
              Featured
            </span>
          )}
          <div className="flex items-center gap-1 ml-auto flex-shrink-0">
            <Star className="w-3 h-3 text-[#D4A27F] fill-[#D4A27F]" />
            <span className="text-[12px] text-white/70 font-medium">{professional.rating}</span>
            {professional.reviewCount > 0 && (
              <span className="text-[11px] text-white/25">({professional.reviewCount})</span>
            )}
          </div>
        </div>

        {/* Row 2: description */}
        <p className="text-[12px] text-white/45 line-clamp-1">
          {professional.description}
        </p>

        {/* Row 3: location + actions */}
        <div className="flex items-center gap-1.5 mt-0.5">
          {area && (
            <span className="flex items-center gap-0.5 text-[10px] text-white/20 ml-1">
              <MapPin className="w-2.5 h-2.5" />
              {area}
            </span>
          )}

          {/* Inline action buttons — visible on hover */}
          <div className="flex items-center gap-1 ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-150">
            <button
              onClick={(e) => { e.stopPropagation(); onChat(professional); }}
              className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium
                         text-white/50 hover:text-white/80 hover:bg-white/[0.06] transition-all"
              title="Chat"
            >
              <MessageSquare className="w-3 h-3" />
              <span>Chat</span>
            </button>
            {professional.email && onEmail && (
              <button
                onClick={(e) => { e.stopPropagation(); onEmail(professional); }}
                className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium
                           text-white/50 hover:text-white/80 hover:bg-white/[0.06] transition-all"
                title="Email"
              >
                <Mail className="w-3 h-3" />
                <span>Email</span>
              </button>
            )}
            {professional.phone && onText && (
              <button
                onClick={(e) => { e.stopPropagation(); onText(professional); }}
                className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium
                           text-white/50 hover:text-white/80 hover:bg-white/[0.06] transition-all"
                title="Text"
              >
                <MessageSquare className="w-3 h-3" />
                <span>Text</span>
              </button>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); onVoice(professional); }}
              className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium
                         text-white/50 hover:text-white/80 hover:bg-white/[0.06] transition-all"
              title="Voice"
            >
              <Phone className="w-3 h-3" />
              <span>Call</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
