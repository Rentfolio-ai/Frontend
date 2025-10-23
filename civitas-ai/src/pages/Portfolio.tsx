import React from 'react';
import { motion } from 'framer-motion';
import { GradientBackground } from '../components/GradientBackground';

interface StatCard {
  id: string;
  label: string;
  value: string;
  icon: string;
  color: string;
  trend?: string;
}

const STATS: StatCard[] = [
  {
    id: '1',
    label: 'Total ROI',
    value: '12.4%',
    icon: '📈',
    color: 'from-emerald-400 to-green-500',
    trend: '+2.3%'
  },
  {
    id: '2',
    label: 'Active Markets',
    value: '8',
    icon: '🌍',
    color: 'from-blue-400 to-indigo-500',
    trend: '+3'
  },
  {
    id: '3',
    label: 'Avg Occupancy',
    value: '87%',
    icon: '🏘️',
    color: 'from-teal-400 to-cyan-500',
    trend: '+5%'
  }
];

const PortfolioFolder: React.FC = () => {
  return (
    <div className="relative flex flex-col items-center justify-center mb-16">
      {/* Animated Folder */}
      <motion.div
        initial={{ rotateX: -90, opacity: 0, y: -50 }}
        animate={{ rotateX: 0, opacity: 1, y: 0 }}
        transition={{
          duration: 1.2,
          type: 'spring',
          stiffness: 80,
          damping: 15
        }}
        style={{ perspective: 1000 }}
        className="relative"
      >
        {/* Main Folder */}
        <div
          className="relative rounded-3xl p-8 overflow-hidden"
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(30px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            width: '500px',
            height: '300px'
          }}
        >
          {/* Folder Tab */}
          <div
            className="absolute -top-6 left-8 rounded-t-2xl px-8 py-2"
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              borderBottom: 'none'
            }}
          >
            <span className="text-white font-semibold font-['Inter_Tight']">
              📁 Portfolio Overview
            </span>
          </div>

          {/* Glow effect */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            animate={{
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            style={{
              background: 'radial-gradient(circle at 50% 50%, rgba(0, 199, 140, 0.2) 0%, transparent 60%)',
              filter: 'blur(30px)'
            }}
          />

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center justify-center h-full space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
              className="text-7xl"
            >
              💼
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="text-3xl font-bold text-white font-['Inter_Tight']"
            >
              Your Portfolio
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="text-lg text-white/60 font-['Inter_Tight']"
            >
              6 properties • $3.2M total value
            </motion.p>
          </div>

          {/* Shimmer effect */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.1) 50%, transparent 100%)',
              backgroundSize: '200% 100%'
            }}
            animate={{
              backgroundPosition: ['200% 0', '-200% 0']
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'linear',
              repeatDelay: 2
            }}
          />
        </div>

        {/* Reflection Effect */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="absolute top-full left-0 right-0 h-32 overflow-hidden"
          style={{
            maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, transparent 100%)'
          }}
        >
          <div
            className="rounded-3xl p-8 transform scale-y-[-1]"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              width: '500px',
              height: '300px'
            }}
          />
        </motion.div>
      </motion.div>
    </div>
  );
};

const StatCard: React.FC<{ stat: StatCard; index: number }> = ({ stat, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: 1.2 + index * 0.2,
        duration: 0.6,
        type: 'spring',
        stiffness: 100
      }}
      whileHover={{
        y: -8,
        scale: 1.03,
        transition: { type: 'spring', stiffness: 300, damping: 20 }
      }}
      className="relative group"
    >
      <div
        className="relative rounded-2xl p-6 overflow-hidden"
        style={{
          background: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
        }}
      >
        {/* Shimmer overlay */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.15) 50%, transparent 100%)',
            backgroundSize: '200% 100%'
          }}
          animate={{
            backgroundPosition: ['200% 0', '-200% 0']
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'linear',
            repeatDelay: 1,
            delay: index * 0.5
          }}
        />

        {/* Hover glow */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"
          style={{
            background: 'radial-gradient(circle at 50% 50%, rgba(0, 199, 140, 0.15) 0%, transparent 70%)',
            filter: 'blur(20px)'
          }}
        />

        {/* Content */}
        <div className="relative z-10 space-y-4">
          {/* Icon and Label */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-4xl">{stat.icon}</div>
              <div>
                <p className="text-sm text-gray-400 font-['Inter_Tight']">{stat.label}</p>
                {stat.trend && (
                  <span className="text-xs text-emerald-400 font-['Inter_Tight']">
                    {stat.trend}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Value */}
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-white font-['Inter_Tight']">
              {stat.value}
            </span>
          </div>

          {/* Badge */}
          <div className={`inline-flex px-3 py-1 rounded-full bg-gradient-to-r ${stat.color}`}>
            <span className="text-xs font-semibold text-white font-['Inter_Tight']">
              Active
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export const Portfolio: React.FC = () => {
  return (
    <div
      className="min-h-screen w-full"
      style={{
        background: `
          radial-gradient(circle at 20% 20%, #2A0059, transparent 40%), 
          radial-gradient(circle at 80% 80%, #00C78C, transparent 40%),
          linear-gradient(135deg, #12002E 0%, #2E0B50 70%, #00C78C 100%)
        `
      }}
    >
      <div className="min-h-screen px-8 py-16">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-6xl font-bold text-white mb-3 font-['Inter_Tight']">
              Portfolio Dashboard
            </h1>
            <p className="text-xl text-white/70 font-['Inter_Tight']">
              Complete overview of your investment performance
            </p>
          </motion.div>

          {/* Animated Folder */}
          <PortfolioFolder />

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {STATS.map((stat, index) => (
              <StatCard key={stat.id} stat={stat} index={index} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Portfolio;
