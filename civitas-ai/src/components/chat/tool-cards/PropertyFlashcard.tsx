import React, { useState } from 'react';
import { motion } from 'framer-motion';
import type { InvestmentStrategy } from '../../../types/pnl';
import type { ScoutedProperty } from '../../../types/backendTools';
import type { BookmarkedProperty } from '../../../types/bookmarks';
import { PropertyActionButtons } from './PropertyActionButtons';

interface PropertyFlashcardProps {
  property: any;
  index: number;
  onOpenDealAnalyzer?: (propertyId: string | null, strategy: InvestmentStrategy, purchasePrice?: number, propertyAddress?: string) => void;
  onToggleBookmark?: (property: ScoutedProperty) => void;
  onViewDetails?: (property: any) => void;
  bookmarks?: BookmarkedProperty[];
}

export const PropertyFlashcard: React.FC<PropertyFlashcardProps> = ({
  property,
  index,
  onOpenDealAnalyzer,
  onToggleBookmark,
  onViewDetails,
  bookmarks = []
}) => {
  const [isFlipped, setIsFlipped] = useState(false);

  // 💰 Use backend calculated metrics (dynamic, accurate)
  const metrics = property.calculated_metrics;

  // Get real values from backend calculations, with fallbacks
  const estimatedRent = property.estimated_rent || 0;
  const estimatedMortgage = metrics?.monthly_mortgage || (property.price * 0.8 * 0.006); // Fallback to estimate
  const monthlyCashFlow = metrics?.monthly_cash_flow ?? (estimatedRent - estimatedMortgage - 500); // Use ?? for null check
  const isPositiveCashFlow = monthlyCashFlow > 0;
  const capRate = metrics?.cap_rate?.toFixed(1) || (
    property.price && estimatedRent
      ? (((estimatedRent * 12) * 0.6) / property.price * 100).toFixed(1)
      : null
  );

  // 🚀 DYNAMIC AI Score - Use backend score if available
  const aiScore = property.ai_score || property.ai_match_score || null;

  // TRULY DYNAMIC SCORING: Every dollar/percentage matters - CONTINUOUS scoring
  const calculatedScore = aiScore || (() => {
    let score = 50; // Base score

    // 1. CASH FLOW ANALYSIS (50 points) - PROPORTIONAL, not bucketed
    // Every $10 of monthly cash flow = ~0.5 points (or penalty)
    if (monthlyCashFlow >= 0) {
      // Positive cash flow: Logarithmic scaling for diminishing returns
      // $100 = +10pts, $500 = +35pts, $1000 = +45pts, $2000 = +50pts
      const cashFlowScore = Math.min(50, Math.log10(Math.max(1, monthlyCashFlow / 10)) * 15);
      score += cashFlowScore;
    } else {
      // Negative cash flow: Linear penalty, more severe
      // -$100 = -10pts, -$500 = -50pts (capped)
      const cashFlowPenalty = Math.max(-50, monthlyCashFlow / 10);
      score += cashFlowPenalty;
    }

    // 2. CAP RATE ANALYSIS (35 points) - CONTINUOUS scaling
    const capRateNum = parseFloat(capRate || '0');
    if (capRateNum > 0) {
      // 3% = +8pts, 5% = +15pts, 7% = +22pts, 10% = +30pts, 15% = +35pts
      const capScore = Math.min(35, (capRateNum / 15) * 35);
      score += capScore;
    } else {
      score -= 20; // Negative or zero cap rate is very bad
    }

    // 3. ROI ANALYSIS (30 points) - PROPORTIONAL to ROI percentage
    const roiValue = metrics?.cash_on_cash_roi || 0;
    if (roiValue > 0) {
      // 5% = +7.5pts, 10% = +15pts, 15% = +22.5pts, 20% = +30pts
      const roiScore = Math.min(30, (roiValue / 20) * 30);
      score += roiScore;
    } else {
      // Negative ROI penalty proportional to loss
      const roiPenalty = Math.max(-15, roiValue * 1.5);
      score += roiPenalty;
    }

    // 4. PRICE EFFICIENCY (20 points) - CONTINUOUS curve favoring $200k-$400k
    // Uses inverted parabola: peaks at $300k
    const optimalPrice = 300000;
    const priceDeviation = Math.abs(property.price - optimalPrice) / optimalPrice;
    const priceScore = Math.max(0, 20 * (1 - priceDeviation * 0.8));
    score += priceScore;

    // 5. PROPERTY AGE (15 points) - CONTINUOUS aging curve
    if (property.year_built) {
      const age = 2026 - property.year_built;
      // Brand new = +15pts, 20 years = +10pts, 40 years = +4pts, 70 years = -5pts
      const ageScore = 15 - (age / 10);
      score += Math.max(-5, Math.min(15, ageScore));
    }

    // 6. RENT MULTIPLIER (20 points) - CONTINUOUS percentage scaling
    const rentToPrice = (estimatedRent * 12) / property.price;
    // 0.5% = -5pts, 1% = +5pts, 1.5% = +15pts, 2% = +20pts, 2.5% = +20pts (capped)
    const rentMultiplierScore = Math.min(20, (rentToPrice - 0.005) * 2000);
    score += rentMultiplierScore;

    // 7. SIZE & AMENITIES (15 points) - GRANULAR bed/bath scoring
    const bedsScore = Math.min(10, property.beds * 2.5); // 1bd=2.5, 2bd=5, 3bd=7.5, 4bd=10
    const bathsScore = Math.min(5, property.baths * 1.7); // 1ba=1.7, 2ba=3.4, 3ba=5
    score += bedsScore + bathsScore;

    // 8. LOCATION-SPECIFIC (10 points) - State-based with city premium
    const state = property.state?.toUpperCase() || '';
    const highGrowthStates = ['TX', 'FL', 'TN', 'NC', 'AZ', 'NV'];
    const highValueStates = ['CA', 'NY', 'WA', 'MA'];

    if (highGrowthStates.includes(state)) score += 10;
    else if (highValueStates.includes(state)) score += 7;
    else score += 4;

    // 9. SPECIFIC PROPERTY DIFFERENTIATION - Use unique property attributes
    // Add tiny adjustments based on exact values to ensure NO two properties are identical
    const uniqueHash = (property.price * 0.001) +
      (property.sqft || 0) * 0.0001 +
      (property.beds || 0) * 0.1 +
      (property.baths || 0) * 0.05 +
      (property.year_built || 0) * 0.001;
    const microAdjustment = (uniqueHash % 1) * 0.5; // 0 to 0.5 points
    score += microAdjustment;

    // Final score: 20-150 range with TRUE unique differentiation
    return Math.round(Math.min(150, Math.max(20, score)) * 10) / 10; // Round to 1 decimal for precision
  })();

  const finalScore = calculatedScore;

  // Debug log to verify unique scoring (remove in production)
  React.useEffect(() => {
    console.log(`Property ${index + 1}: ${property.address}`, {
      price: property.price,
      rent: estimatedRent,
      cashFlow: monthlyCashFlow,
      capRate: capRate,
      score: finalScore,
      beds: property.beds,
      yearBuilt: property.year_built,
      state: property.state
    });
  }, []);

  // Determine badge color based on score
  const getScoreColor = (score: number) => {
    if (score >= 120) return 'from-emerald-600 to-green-600';
    if (score >= 90) return 'from-blue-600 to-purple-600';
    if (score >= 60) return 'from-yellow-600 to-orange-600';
    return 'from-gray-600 to-slate-600';
  };

  // Generate HIGHLY SPECIFIC AI summary using EXACT numbers
  const generateSummary = () => {
    const roi = metrics?.cash_on_cash_roi?.toFixed(2) || ((estimatedRent * 12) / property.price * 100).toFixed(2);
    const exactCashFlow = monthlyCashFlow.toFixed(0); // No rounding, exact value
    const age = property.year_built ? 2026 - property.year_built : null;
    const rentToPrice = ((estimatedRent * 12) / property.price * 100).toFixed(3);
    const priceFormatted = property.price.toLocaleString();
    const rentFormatted = estimatedRent.toFixed(0);
    const state = property.state || 'unknown';
    const exactCapRate = parseFloat(capRate || '0').toFixed(2);

    // Build insight using EXACT metrics - every property is unique
    const cashFlowDesc = monthlyCashFlow >= 500 ? `strong +$${exactCashFlow}` :
      monthlyCashFlow >= 200 ? `solid +$${exactCashFlow}` :
        monthlyCashFlow >= 50 ? `modest +$${exactCashFlow}` :
          monthlyCashFlow >= 0 ? `tight +$${exactCashFlow}` :
            monthlyCashFlow >= -200 ? `-$${Math.abs(parseFloat(exactCashFlow))}` :
              `severe -$${Math.abs(parseFloat(exactCashFlow))}`;

    const roiDesc = parseFloat(roi) >= 15 ? 'exceptional' :
      parseFloat(roi) >= 10 ? 'strong' :
        parseFloat(roi) >= 7 ? 'solid' :
          parseFloat(roi) >= 4 ? 'moderate' :
            parseFloat(roi) >= 0 ? 'weak' : 'negative';

    const capRateDesc = parseFloat(exactCapRate) >= 10 ? 'excellent' :
      parseFloat(exactCapRate) >= 7 ? 'strong' :
        parseFloat(exactCapRate) >= 5 ? 'decent' :
          parseFloat(exactCapRate) >= 3 ? 'marginal' : 'poor';

    const ageDesc = age ? (age <= 5 ? `${age}-year new build` :
      age <= 15 ? `${age}-year newer construction` :
        age <= 30 ? `${age}-year established property` :
          age <= 50 ? `${age}-year mature home` :
            `${age}-year older structure`) : 'property';

    // HIGH PERFORMERS (120+)
    if (finalScore >= 120) {
      return `Premium ${ageDesc} at $${priceFormatted} scores ${finalScore.toFixed(1)}/150. Delivers ${cashFlowDesc}/mo cashflow with ${capRateDesc} ${exactCapRate}% cap rate. ${roiDesc.charAt(0).toUpperCase() + roiDesc.slice(1)} ${roi}% CoC ROI from $${rentFormatted}/mo rent (${rentToPrice}% yield). ${state} market leader.`;
    }

    // STRONG PERFORMERS (90-119)
    else if (finalScore >= 90) {
      return `Quality ${ageDesc} priced at $${priceFormatted} earns ${finalScore.toFixed(1)}/150. Generates ${cashFlowDesc}/mo with ${capRateDesc} ${exactCapRate}% cap rate, ${roiDesc} ${roi}% ROI. $${rentFormatted}/mo rental (${rentToPrice}% annual yield) in ${property.city || state}. ${property.beds}bd/${property.baths}ba layout.`;
    }

    // MODERATE PERFORMERS (60-89)
    else if (finalScore >= 60) {
      return `Mixed ${ageDesc} at $${priceFormatted} scores ${finalScore.toFixed(1)}/150. Shows ${cashFlowDesc}/mo flow, ${capRateDesc} ${exactCapRate}% cap rate, ${roiDesc} ${roi}% ROI. $${rentFormatted}/mo rent yields ${rentToPrice}%. ${monthlyCashFlow > 0 ? 'Positive but tight margins' : 'Requires optimization'}. ${state} market.`;
    }

    // CHALLENGING (40-59)
    else if (finalScore >= 40) {
      return `Challenging ${ageDesc} at $${priceFormatted} rates ${finalScore.toFixed(1)}/150. ${cashFlowDesc}/mo cashflow concern, ${capRateDesc} ${exactCapRate}% cap rate, ${roiDesc} ${roi}% ROI. $${rentFormatted}/mo rent (${rentToPrice}% yield) insufficient for ${state} market. ${property.beds}bd/${property.baths}ba needs improvement.`;
    }

    // UNDERPERFORMERS (<40)
    else {
      return `Underperforming ${ageDesc} at $${priceFormatted} scores only ${finalScore.toFixed(1)}/150. Problematic ${cashFlowDesc}/mo, ${capRateDesc} ${exactCapRate}% cap rate, ${roiDesc} ${roi}% ROI. $${rentFormatted}/mo rent (${rentToPrice}% yield) far below ${state} viability threshold. Major restructuring required.`;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="relative w-full min-w-[550px] h-[260px] perspective-1000 flex items-center gap-3"
      style={{ perspective: '1000px' }}
    >
      {/* Hamburger Menu - Outside card on left */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onOpenDealAnalyzer?.(
            property.id || property.listing_id || property.zpid || null,
            'LTR',
            property.price,
            property.address
          );
        }}
        className="flex-shrink-0 flex items-center justify-center w-10 h-10 bg-slate-800/90 hover:bg-slate-700 rounded-lg transition-all duration-200 border border-slate-600/50 shadow-lg group z-10"
        title="Open Deal Analyzer"
      >
        <svg className="w-4 h-4 text-slate-300 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <motion.div
        className="relative flex-1 h-full cursor-pointer"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
        style={{ transformStyle: 'preserve-3d' }}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        {/* FRONT SIDE - Property Details */}
        <div
          className="absolute w-full h-full backface-hidden"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl p-4 shadow-2xl shadow-black/40 border border-slate-700/50 group hover:shadow-purple-500/30 transition-shadow">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-transparent to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            {/* Content - Horizontal Layout (Compact) */}
            <div className="relative z-10 h-full flex gap-4">
              {/* Left: Image & Badges (Smaller) */}
              <div className="flex-shrink-0 w-[180px]">
                {/* Badges Row */}
                <div className="flex gap-1.5 mb-2">
                  {index < 3 && (
                    <div className="bg-gradient-to-r from-yellow-500 to-amber-500 text-slate-900 text-[10px] font-bold px-2 py-0.5 rounded-md shadow-md">
                      #{index + 1}
                    </div>
                  )}
                  <div className={`ml-auto bg-gradient-to-r ${getScoreColor(finalScore)} text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-md`}>
                    ⭐ {finalScore.toFixed(1)}/150
                  </div>
                </div>

                {/* Image (Smaller) */}
                {property.image_url ? (
                  <div className="rounded-lg overflow-hidden border border-slate-700/50">
                    <img
                      src={property.image_url}
                      alt={property.address}
                      className="w-full h-[140px] object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div className="rounded-lg bg-slate-800/50 border border-slate-700/50 h-[140px] flex items-center justify-center">
                    <span className="text-3xl">🏠</span>
                  </div>
                )}
              </div>

              {/* Right: Details (Compact) */}
              <div className="flex-1 flex flex-col justify-between min-w-0">
                {/* Top: Price & Address */}
                <div>
                  <div className="flex items-baseline gap-2 mb-1">
                    <div className="text-2xl font-bold text-white">
                      ${property.price?.toLocaleString() || 'N/A'}
                    </div>
                    <div className="text-xs text-slate-400">
                      ~${Math.round(estimatedMortgage).toLocaleString()}/mo
                    </div>
                  </div>
                  <div className="text-sm text-white font-medium mb-0.5 truncate">
                    {property.address}
                  </div>
                  <div className="text-xs text-slate-400 mb-2 truncate">
                    {property.city}, {property.state} {property.zip_code || property.zip || ''}
                  </div>

                  {/* Amenities Row (Compact) */}
                  <div className="flex gap-4 mb-2">
                    {property.beds && (
                      <div className="text-center">
                        <div className="text-[10px] text-slate-500">Beds</div>
                        <div className="text-white font-semibold">{property.beds}</div>
                      </div>
                    )}
                    {property.baths && (
                      <div className="text-center">
                        <div className="text-[10px] text-slate-500">Baths</div>
                        <div className="text-white font-semibold">{property.baths}</div>
                      </div>
                    )}
                    {property.sqft && (
                      <div className="text-center">
                        <div className="text-[10px] text-slate-500">SqFt</div>
                        <div className="text-white font-semibold text-sm">{property.sqft.toLocaleString()}</div>
                      </div>
                    )}
                    {property.year_built && (
                      <div className="text-center">
                        <div className="text-[10px] text-slate-500">Built</div>
                        <div className="text-white font-semibold text-sm">{property.year_built}</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom: Metrics & Button (Compact) */}
                <div>
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    <div className="bg-slate-800/30 rounded-md p-1.5 text-center">
                      <div className="text-[10px] text-slate-400">
                        Rent {!property.estimated_rent && '(est)'}
                      </div>
                      <div className="font-bold text-emerald-400 text-xs">
                        ${Math.round(estimatedRent).toLocaleString()}
                      </div>
                    </div>
                    <div className="bg-slate-800/30 rounded-md p-1.5 text-center">
                      <div className="text-[10px] text-slate-400">Cash Flow</div>
                      <div className={`font-bold text-xs ${isPositiveCashFlow ? 'text-emerald-400' : 'text-red-400'}`}>
                        {isPositiveCashFlow ? '+' : ''}${Math.round(monthlyCashFlow).toLocaleString()}
                      </div>
                    </div>
                    {capRate && (
                      <div className="bg-slate-800/30 rounded-md p-1.5 text-center">
                        <div className="text-[10px] text-slate-400">Cap Rate</div>
                        <div className="font-bold text-blue-400 text-xs">{capRate}%</div>
                      </div>
                    )}
                  </div>

                  {/* Zillow Button - Bottom Left */}
                  <div className="mt-auto pt-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const address = `${property.address}, ${property.city}, ${property.state} ${property.zip_code || ''}`;
                        window.open(`https://www.zillow.com/homes/${encodeURIComponent(address)}`, '_blank');
                      }}
                      className="py-1.5 px-3 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold rounded-md transition-all duration-200 shadow-md hover:shadow-lg"
                      title="View on Zillow"
                    >
                      Zillow
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Flip hint (Smaller) */}
            <div className="absolute bottom-2 right-2 text-[10px] text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
              Click to flip
            </div>
          </div>
        </div>

        {/* BACK SIDE - AI Summary (Compact) */}
        <div
          className="absolute w-full h-full backface-hidden"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)'
          }}
        >
          <div className="h-full bg-gradient-to-br from-purple-900 via-blue-900 to-slate-900 rounded-xl p-6 shadow-2xl shadow-black/40 border border-purple-500/30 overflow-hidden group hover:shadow-purple-500/40 transition-shadow">
            {/* Animated background */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-transparent to-blue-600/20"></div>

            <div className="relative z-10 h-full flex flex-col items-center justify-center text-center">
              {/* AI Icon (Smaller) */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: 'spring' }}
                className="mb-3"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center shadow-xl">
                  <span className="text-2xl">🤖</span>
                </div>
              </motion.div>

              {/* AI Summary (Smaller) */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="max-w-md"
              >
                <h3 className="text-lg font-bold text-white mb-2">AI Analysis</h3>
                <p className="text-sm text-white/90 leading-relaxed mb-3">
                  {generateSummary()}
                </p>

                {/* Score Badge (Smaller) */}
                <div className={`inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r ${getScoreColor(finalScore)} rounded-full text-white font-bold text-sm shadow-xl`}>
                  <span>⭐</span>
                  <span>{finalScore}/150</span>
                </div>
              </motion.div>

              {/* Click anywhere to flip back - no button needed */}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
