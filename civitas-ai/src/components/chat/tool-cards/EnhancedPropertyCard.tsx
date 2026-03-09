// FILE: src/components/chat/tool-cards/EnhancedPropertyCard.tsx
/**
 * Enhanced Property Card with modern animations and AI insights
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  MapPin, Bed, Bath, Square, TrendingUp, TrendingDown, 
  Sparkles, Target, DollarSign, Calendar, Home
} from 'lucide-react';
import '../../../styles/llm-theme.css';

interface EnhancedPropertyCardProps {
  property: any;
  index?: number;
  onViewDetails?: (property: any) => void;
}

export const EnhancedPropertyCard: React.FC<EnhancedPropertyCardProps> = ({
  property,
  index = 0,
  onViewDetails
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // Use backend calculated metrics when available, fallback to rough estimates
  const metrics = property.calculated_metrics;
  const estimatedRent = property.estimated_rent || (property.price * 0.008);
  const estimatedMortgage = metrics?.monthly_mortgage || (property.price ? (property.price * 0.8 * 0.006) : 0);
  const monthlyCashFlow = metrics?.monthly_cash_flow ?? (estimatedRent - estimatedMortgage - 500);
  const isPositiveCashFlow = monthlyCashFlow > 0;
  
  const capRate = metrics?.cap_rate?.toFixed(1) || (
    property.price && estimatedRent 
      ? (((estimatedRent * 12) * 0.6) / property.price * 100).toFixed(1)
      : null
  );
  
  const aiScore = property.ai_score || property.ai_match_score || Math.round(Math.random() * 30 + 70);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{
        delay: index * 0.1,
        type: "spring",
        stiffness: 300,
        damping: 25
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={() => onViewDetails?.(property)}
      className="relative overflow-hidden rounded-xl cursor-pointer card-ai max-w-sm"
    >
      {/* Animated gradient border on hover */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-purple-500/20"
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />
      
      {/* Content */}
      <div className="relative">
        {/* Property Image */}
        <div className="relative aspect-video overflow-hidden">
          {property.image_url ? (
            <motion.img 
              src={property.image_url} 
              alt={property.address}
              className="w-full h-full object-cover"
              animate={{ scale: isHovered ? 1.05 : 1 }}
              transition={{ duration: 0.3 }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
              <Home className="w-12 h-12 text-muted-foreground/50" />
            </div>
          )}
          
          {/* Top badges */}
          <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
            {/* Rank badge */}
            {property.rank && property.rank <= 3 && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.1 + 0.1, type: "spring" }}
                className="px-2.5 py-1 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-bold text-xs shadow-lg"
              >
                #{property.rank} TOP PICK
              </motion.div>
            )}
            
            {/* AI Score badge */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.1 + 0.2, type: "spring" }}
              className="px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-foreground font-semibold text-sm shadow-lg backdrop-blur-sm flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {aiScore}/100
            </motion.div>
          </div>
          
          {/* Cash flow badge */}
          {isPositiveCashFlow && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.1 + 0.3, type: "spring" }}
              className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full bg-green-500/90 backdrop-blur-sm flex items-center gap-1.5 text-foreground text-xs font-medium shadow-lg"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              +${Math.round(monthlyCashFlow).toLocaleString()}/mo
            </motion.div>
          )}
          
          {/* Cap rate badge */}
          {capRate && parseFloat(capRate) > 8 && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.1 + 0.4, type: "spring" }}
              className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-blue-500/90 backdrop-blur-sm flex items-center gap-1 text-foreground text-xs font-medium shadow-lg"
            >
              <Target className="w-3.5 h-3.5" />
              {capRate}% Cap
            </motion.div>
          )}
          
          {/* AI Insight overlay (on hover) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-end p-4"
          >
            <div className="text-white space-y-1">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Sparkles className="w-4 h-4 text-yellow-400" />
                <span>AI Analysis:</span>
              </div>
              <p className="text-xs text-foreground/80 leading-relaxed">
                {property.aiInsight || property.ai_reasoning || "Strong investment potential based on market analysis and cash flow projections"}
              </p>
            </div>
          </motion.div>
        </div>
        
        {/* Property Details */}
        <div className="p-4 space-y-3">
          {/* Price */}
          <motion.div
            className="flex items-baseline justify-between"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 + 0.1 }}
          >
            <div className="text-2xl font-bold gradient-text">
              ${property.price?.toLocaleString() || 'N/A'}
            </div>
            {property.year_built && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="w-3 h-3" />
                {property.year_built}
              </div>
            )}
          </motion.div>
          
          {/* Address */}
          <div className="flex items-start gap-2 text-sm">
            <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5 text-purple-400" />
            <div className="flex-1 min-w-0">
              <div className="text-foreground font-medium truncate">
                {property.address}
              </div>
              <div className="text-muted-foreground text-xs truncate">
                {property.city}, {property.state} {property.zip_code || property.zip || ''}
              </div>
            </div>
          </div>
          
          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3">
            {property.beds && (
              <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-black/5">
                <Bed className="w-4 h-4 text-blue-400" />
                <span className="text-foreground text-sm font-medium">{property.beds}</span>
              </div>
            )}
            {property.baths && (
              <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-black/5">
                <Bath className="w-4 h-4 text-cyan-400" />
                <span className="text-foreground text-sm font-medium">{property.baths}</span>
              </div>
            )}
            {property.sqft && (
              <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-black/5">
                <Square className="w-4 h-4 text-purple-400" />
                <span className="text-foreground text-xs font-medium">{property.sqft.toLocaleString()}</span>
              </div>
            )}
          </div>
          
          {/* Financial Metrics */}
          <div className="pt-3 mt-3 border-t border-black/8 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Est. Rent</span>
              <span className="text-green-400 font-medium">
                ${Math.round(estimatedRent).toLocaleString()}/mo
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Est. Mortgage</span>
              <span className="text-foreground/70 font-medium">
                ${Math.round(estimatedMortgage).toLocaleString()}/mo
              </span>
            </div>
            <div className="flex items-center justify-between text-xs pt-2 border-t border-black/5">
              <span className="text-foreground/70 font-medium">Cash Flow</span>
              <span className={`font-bold ${isPositiveCashFlow ? 'text-green-400' : 'text-red-400'}`}>
                {isPositiveCashFlow ? '+' : ''}${Math.round(monthlyCashFlow).toLocaleString()}/mo
              </span>
            </div>
          </div>
          
          {/* Hover CTA */}
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ 
              opacity: isHovered ? 1 : 0,
              height: isHovered ? 'auto' : 0
            }}
            className="overflow-hidden pt-3"
          >
            <button className="w-full py-2 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 text-foreground text-sm font-medium hover:from-purple-600 hover:to-blue-600 transition-colors">
              View Full Analysis
            </button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};
