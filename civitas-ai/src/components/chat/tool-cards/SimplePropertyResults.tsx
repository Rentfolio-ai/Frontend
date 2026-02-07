import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HunterPropertyCard } from '../../hunter/HunterPropertyCard';
import { ChevronDown } from 'lucide-react';

interface SimplePropertyResultsProps {
  properties: any[];
  onAction?: (query: string) => void;
}

export const SimplePropertyResults: React.FC<SimplePropertyResultsProps> = ({
  properties,
  onAction
}) => {
  if (!properties || properties.length === 0) {
    return null;
  }

  const [visibleCount, setVisibleCount] = React.useState(5);

  const displayedProperties = properties.slice(0, visibleCount);
  const hasMore = visibleCount < properties.length;
  const remaining = properties.length - visibleCount;

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 5);
  };

  return (
    <div className="my-6">
      <div className="space-y-5 max-w-[640px] flex flex-col items-center">
        <AnimatePresence mode="popLayout">
          {displayedProperties.map((property, index) => {
            const metrics = property.calculated_metrics;
            const rent = property.estimated_rent || property.rent_estimate || 0;
            const price = property.price || 0;

            return (
              <motion.div
                key={property.id || property.property_id || property.listing_id || index}
                layout
                className="w-full"
              >
                <HunterPropertyCard
                  data={{
                    address: property.address || property.formattedAddress,
                    price: price,
                    estimated_rent: rent,
                    city: property.city,
                    state: property.state,
                    zip_code: property.zip_code,
                    beds: property.beds || property.bedrooms,
                    baths: property.baths || property.bathrooms,
                    sqft: property.squareFootage || property.sqft,
                    year_built: property.year_built,
                    image_url: property.image_url || (property.images && property.images[0]) || property.primaryPhoto,
                    summary: property.description || property.ai_reason,
                    ai_score: property.ai_score || property.ai_match_score,
                    analysis: {
                      cap_rate: metrics?.cap_rate ?? property.cap_rate ?? undefined,
                      gross_yield: metrics?.cap_rate ?? property.cap_rate ?? undefined,
                      estimated_rent: rent,
                    },
                    financial_snapshot: property.financial_snapshot || {
                      estimated_monthly_cash_flow: metrics?.monthly_cash_flow != null
                        ? Math.round(metrics.monthly_cash_flow)
                        : property.monthly_cashflow != null
                          ? Math.round(property.monthly_cashflow)
                          : undefined,
                    },
                    calculated_metrics: metrics || property.calculated_metrics,
                  }}
                  index={index}
                  onAction={onAction}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Load More */}
        {hasMore && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={handleLoadMore}
            className="group flex items-center gap-2 px-5 py-2.5 rounded-xl
                       bg-white/[0.03] hover:bg-white/[0.06]
                       text-[12px] font-medium text-white/30 hover:text-white/50
                       transition-all duration-300"
          >
            <span>Show {Math.min(5, remaining)} more</span>
            <span className="text-white/15">({remaining} remaining)</span>
            <ChevronDown className="w-3.5 h-3.5 text-white/20 group-hover:text-[#C08B5C]/60 transition-colors" />
          </motion.button>
        )}
      </div>
    </div>
  );
};
