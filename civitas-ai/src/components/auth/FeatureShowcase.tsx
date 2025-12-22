// FILE: src/components/auth/FeatureShowcase.tsx
import React from 'react';
import { motion } from 'framer-motion';

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: (
      <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
      </svg>
    ),
    title: 'Chat with Vasthu',
    description: 'Get instant insights and answers about STR investments, market trends, and property analysis. Ask about cash flow, cap rates, and investment strategies.',
  },
  {
    icon: (
      <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
    title: 'Analyze Property Performance',
    description: 'Track revenue, occupancy rates, and ROI across your entire portfolio in real-time. Get detailed P&L calculations and cash flow projections.',
  },
  {
    icon: (
      <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
      </svg>
    ),
    title: 'Scout & Compare Properties',
    description: 'Search for investment properties by location, price, and criteria. Compare multiple deals side-by-side with detailed metrics.',
  },
  {
    icon: (
      <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
      </svg>
    ),
    title: 'Market Insights & Trends',
    description: 'Get data-driven investment recommendations based on current market conditions. Access median prices, rents, and days on market for any location.',
  },
];

export const FeatureShowcase: React.FC = () => {
  return (
    <div className="w-full h-full flex flex-col justify-center px-10 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-3" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
          Welcome to Vasthu
        </h2>
        <p className="text-xl text-white/90 mb-12" style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 400 }}>
          All-Knowing Real Estate Intelligence
        </p>
      </motion.div>

      <div className="space-y-8">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            className="flex items-start gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
          >
            <motion.div
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-white border-2 border-white/30"
              whileHover={{ scale: 1.1, backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
              role="img"
              aria-label={`${feature.title} icon`}
            >
              {feature.icon}
            </motion.div>
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-1 text-white" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                {feature.title}
              </h3>
              <p className="text-white/80 text-sm leading-relaxed" style={{ fontFamily: 'Inter, system-ui, sans-serif', lineHeight: '1.6' }}>
                {feature.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
