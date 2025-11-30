// FILE: src/components/auth/CivitasLogo.tsx
import React from 'react';
import { motion } from 'framer-motion';

interface CivitasLogoProps {
  size?: number;
  showText?: boolean;
}

export const CivitasLogo: React.FC<CivitasLogoProps> = ({ size = 64, showText = true }) => {
  return (
    <motion.div
      className="flex flex-col items-center"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      {/* Logo Icon - Rounded square with house symbol */}
      <motion.div
        className="rounded-2xl flex items-center justify-center mb-4"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
          boxShadow: '0 4px 20px rgba(16, 185, 129, 0.3)',
        }}
        whileHover={{ scale: 1.05, rotate: 2 }}
        transition={{ type: 'spring', stiffness: 300 }}
      >
        {/* House icon with red roof and beige/white walls */}
        <svg
          width={size * 0.7}
          height={size * 0.7}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Red roof */}
          <path
            d="M12 3L2 12h3v9h6v-6h4v6h6v-9h3L12 3z"
            fill="#DC2626"
            stroke="#B91C1C"
            strokeWidth="0.5"
          />
          {/* Beige/white walls */}
          <path
            d="M5 12v9h6v-6h2v6h6v-9H5z"
            fill="#FEF3C7"
            stroke="#FDE68A"
            strokeWidth="0.5"
          />
          {/* Door */}
          <rect x="10" y="16" width="4" height="5" fill="#92400E" rx="0.5" />
          {/* Window left */}
          <rect x="6" y="13" width="2.5" height="2.5" fill="#3B82F6" rx="0.3" />
          {/* Window right */}
          <rect x="15.5" y="13" width="2.5" height="2.5" fill="#3B82F6" rx="0.3" />
        </svg>
      </motion.div>

      {/* App Name */}
      {showText && (
        <motion.h1
          className="text-3xl font-bold text-white"
          style={{
            fontFamily: 'Inter, system-ui, sans-serif',
            textShadow: '0 0 20px rgba(255, 255, 255, 0.3), 0 0 40px rgba(139, 92, 246, 0.2)',
            letterSpacing: '-0.02em',
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          Civitas
        </motion.h1>
      )}
    </motion.div>
  );
};
