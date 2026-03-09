import React from 'react';
import { motion } from 'framer-motion';
import { Star, MessageSquare, Phone, Mail } from 'lucide-react';
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
  rank: _rank,
  onChat,
  onVoice,
  onEmail,
  onText,
}) => {
  const area = professional.serviceAreas?.[0];
  const companyOrCategory = professional.specialties?.[0] || professional.category;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.04 }}
      className="group flex items-center justify-between gap-4 p-3 rounded-2xl bg-muted hover:bg-muted border border-transparent transition-all duration-200 cursor-pointer"
      onClick={() => onChat(professional)} // Default action on whole card click
    >
      {/* ━━ Left: Avatar & Details ━━ */}
      <div className="flex items-center gap-4 min-w-0 flex-1">
        {/* Avatar */}
        {professional.imageUrl ? (
          <img
            src={professional.imageUrl}
            alt={professional.name}
            className="w-[52px] h-[52px] rounded-[14px] object-cover flex-shrink-0"
          />
        ) : (
          <div
            className={`w-[52px] h-[52px] rounded-[14px] bg-gradient-to-br ${professional.accentColor}
                        flex items-center justify-center text-white text-[18px] font-bold flex-shrink-0 shadow-sm`}
          >
            {professional.name.charAt(0)}
          </div>
        )}

        {/* Text Details */}
        <div className="flex flex-col min-w-0 flex-1 pt-0.5">
          {/* Name & Byline */}
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-[14px] font-medium text-foreground truncate">
              {professional.name}
            </span>
            <span className="text-[13px] text-muted-foreground/70 truncate">
              <span className="text-muted-foreground/40 mx-1">By</span>
              {companyOrCategory}
            </span>
          </div>

          {/* Description */}
          <p className="text-[13px] leading-[1.3] text-muted-foreground line-clamp-1 mb-1.5 pr-4">
            {professional.description || `${professional.category} professional located in ${area || 'your area'}.`}
          </p>

          {/* Bottom Metatadata: Rating + Location */}
          <div className="flex items-center gap-3">
            {professional.reviewCount > 0 ? (
              <div className="flex items-center gap-1">
                <span className="text-[12px] text-muted-foreground/70 font-medium">{professional.rating}</span>
                <Star className="w-3 h-3 text-muted-foreground/50 fill-foreground/20" />
                <span className="text-[12px] text-muted-foreground/50">({professional.reviewCount})</span>
              </div>
            ) : (
              <span className="text-[12px] text-muted-foreground/50 italic">New</span>
            )}

            {area && (
              <div className="flex items-center gap-1 text-[12px] text-muted-foreground/50">
                <span className="w-1 h-1 rounded-full bg-black/8" />
                <span>{area}</span>
              </div>
            )}

            {professional.featured && (
              <div className="flex items-center gap-1 text-[12px] text-[#C08B5C]">
                <span className="w-1 h-1 rounded-full bg-[#C08B5C]/30" />
                <span>Top Pick</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ━━ Right: Flat Icon Buttons ━━ */}
      <div className="flex items-center gap-1.5 pr-1 flex-shrink-0">
        <button
          onClick={(e) => { e.stopPropagation(); onChat(professional); }}
          className="w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-black/[0.06] border border-black/5 transition-colors"
          title="Chat"
        >
          <MessageSquare className="w-4 h-4" />
        </button>

        {professional.email && onEmail && (
          <button
            onClick={(e) => { e.stopPropagation(); onEmail(professional); }}
            className="w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-black/[0.06] border border-black/5 transition-colors"
            title="Email"
          >
            <Mail className="w-4 h-4" />
          </button>
        )}

        <button
          onClick={(e) => { e.stopPropagation(); onVoice(professional); }}
          className="w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-black/[0.06] border border-black/5 transition-colors"
          title="Call"
        >
          <Phone className="w-4 h-4" />
        </button>

        {professional.phone && onText && (
          <button
            onClick={(e) => { e.stopPropagation(); onText(professional); }}
            className="w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-black/[0.06] border border-black/5 transition-colors"
            title="Text"
          >
            <MessageSquare className="w-4 h-4" />
          </button>
        )}
      </div>
    </motion.div>
  );
};
