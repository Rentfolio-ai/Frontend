import { motion } from 'framer-motion';

export type OrbStatus = 'idle' | 'listening' | 'thinking' | 'speaking' | 'error';

interface AnimatedOrbProps {
  size?: 'md' | 'lg' | 'xl';
  status: OrbStatus;
  audioLevel?: number; // 0-1 for visualizing audio input
}

export function AnimatedOrb({ 
  size = 'lg',
  status,
  audioLevel = 0.5,
}: AnimatedOrbProps) {
  const sizeClasses = {
    md: 'h-24 w-24',
    lg: 'h-48 w-48',
    xl: 'h-64 w-64',
  };

  const animations: any = {
    idle: {
      scale: [1, 1.05, 1],
      opacity: [0.8, 1, 0.8],
      transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
    },
    listening: {
      scale: [1, 1 + (audioLevel * 0.2), 1],
      transition: { duration: 0.3, repeat: Infinity }
    },
    thinking: {
      rotate: [0, 360],
      transition: { duration: 2, repeat: Infinity, ease: "linear" }
    },
    speaking: {
      scale: [1, 1.15, 1, 1.08, 1],
      transition: { duration: 0.6, repeat: Infinity }
    },
    error: {
      x: [-10, 10, -10, 10, 0],
      backgroundColor: ['#ef4444', '#dc2626', '#ef4444'],
      transition: { duration: 0.5 }
    }
  };

  const glowColors = {
    idle: 'from-cyan-400 via-blue-500 to-purple-500',
    listening: 'from-green-400 via-emerald-500 to-teal-500',
    thinking: 'from-yellow-400 via-orange-500 to-amber-500',
    speaking: 'from-purple-400 via-pink-500 to-rose-500',
    error: 'from-red-400 via-red-500 to-red-600',
  };

  return (
    <div className={`relative ${sizeClasses[size]} flex items-center justify-center`}>
      {/* Outer glow layer */}
      <motion.div
        className={`absolute inset-0 rounded-full bg-gradient-to-r ${glowColors[status]} blur-3xl opacity-50`}
        animate={animations[status]}
      />

      {/* Middle glow layer */}
      <motion.div
        className={`absolute inset-4 rounded-full bg-gradient-to-br ${glowColors[status]} blur-2xl opacity-60`}
        animate={{
          scale: status === 'listening' ? [1, 1.2, 1] : status === 'speaking' ? [1, 1.1, 1] : 1,
          transition: { duration: 1, repeat: Infinity }
        }}
      />

      {/* Core orb */}
      <motion.div
        className={`absolute inset-8 rounded-full bg-gradient-conic ${glowColors[status]} shadow-2xl`}
        animate={animations[status]}
        style={{
          boxShadow: `0 0 60px rgba(139, 92, 246, 0.5)`,
        }}
      />

      {/* Inner shine */}
      <motion.div
        className="absolute inset-12 rounded-full bg-gradient-to-br from-white/30 to-transparent"
        animate={{
          opacity: [0.3, 0.5, 0.3],
          transition: { duration: 2, repeat: Infinity }
        }}
      />

      {/* Thinking particles */}
      {status === 'thinking' && (
        <div className="absolute inset-0">
          {[...Array(8)].map((_, i) => {
            const angle = (i * 45 * Math.PI) / 180;
            const radius = size === 'xl' ? 100 : size === 'lg' ? 80 : 60;
            return (
              <motion.div
                key={i}
                className="absolute h-2 w-2 rounded-full bg-white/70 shadow-lg"
                style={{
                  top: '50%',
                  left: '50%',
                }}
                animate={{
                  x: [0, Math.cos(angle) * radius, 0],
                  y: [0, Math.sin(angle) * radius, 0],
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.15,
                  ease: "easeInOut"
                }}
              />
            );
          })}
        </div>
      )}

      {/* Audio level bars (when listening) */}
      {status === 'listening' && (
        <div className="absolute inset-0 flex items-center justify-center gap-1">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="w-1.5 bg-white/70 rounded-full shadow-lg"
              style={{
                height: size === 'xl' ? '40px' : size === 'lg' ? '30px' : '20px',
              }}
              animate={{
                scaleY: [
                  1,
                  1 + audioLevel * (1 + Math.random()),
                  1 + audioLevel * (0.5 + Math.random() * 0.5),
                  1
                ],
              }}
              transition={{
                duration: 0.4,
                repeat: Infinity,
                delay: i * 0.08,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
      )}

      {/* Speaking wave (when speaking) */}
      {status === 'speaking' && (
        <div className="absolute inset-0 flex items-center justify-center">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute inset-0 rounded-full border-2 border-white/30"
              animate={{
                scale: [1, 1.8, 1],
                opacity: [0.6, 0, 0.6],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.5,
              }}
            />
          ))}
        </div>
      )}

      {/* Error indicator */}
      {status === 'error' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className="text-white text-4xl font-bold"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [1, 0.7, 1],
            }}
            transition={{
              duration: 0.5,
              repeat: 3,
            }}
          >
            ⚠️
          </motion.div>
        </div>
      )}
    </div>
  );
}

