import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useSettingsStore } from '../stores/settingsStore';

interface SettingCardProps {
  icon: string;
  title: string;
  description: string;
  isEnabled: boolean;
  onToggle: () => void;
  delay?: number;
}

const SettingCard: React.FC<SettingCardProps> = ({
  icon,
  title,
  description,
  isEnabled,
  onToggle,
  delay = 0,
}) => {
  const [isFlipping, setIsFlipping] = useState(false);
  const cardRef = React.useRef<HTMLDivElement>(null);
  const timeoutRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleToggle = () => {
    // Clear any existing timeout to prevent multiple timeouts from accumulating
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
    }
    
    setIsFlipping(true);
    timeoutRef.current = window.setTimeout(() => {
      onToggle();
      setIsFlipping(false);
      timeoutRef.current = null;
    }, 600); // Match the CSS animation duration (0.6s)
  };

  // Alternative: Handle animation end event for better sync
  const handleAnimationComplete = () => {
    if (isFlipping) {
      setIsFlipping(false);
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ scale: 1.02 }}
      className="relative cursor-pointer"
      onClick={handleToggle}
      style={{ perspective: 1000 }}
    >
      <motion.div
        ref={cardRef}
        animate={{ rotateY: isFlipping ? 180 : 0 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
        onAnimationComplete={handleAnimationComplete}
        className="relative rounded-2xl p-6 overflow-hidden"
        style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          border: `2px solid ${isEnabled ? 'rgba(0, 199, 140, 0.5)' : 'rgba(255, 255, 255, 0.2)'}`,
          boxShadow: isEnabled
            ? '0 8px 32px rgba(0, 199, 140, 0.3)'
            : '0 8px 32px rgba(0, 0, 0, 0.2)',
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Glow effect when enabled */}
        {isEnabled && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            animate={{
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            style={{
              background: 'radial-gradient(circle at 50% 50%, rgba(0, 199, 140, 0.3) 0%, transparent 70%)',
              filter: 'blur(20px)',
            }}
          />
        )}

        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-4xl">{icon}</div>
            <div>
              <h3 className="text-lg font-bold text-white font-['Inter_Tight']">{title}</h3>
              <p className="text-sm text-white/60 font-['Inter_Tight'] mt-1">{description}</p>
            </div>
          </div>

          {/* Toggle Indicator */}
          <motion.div
            animate={{
              backgroundColor: isEnabled ? '#00C78C' : 'rgba(255, 255, 255, 0.2)',
              scale: isEnabled ? 1.1 : 1,
            }}
            transition={{ duration: 0.3 }}
            className="w-14 h-8 rounded-full relative flex-shrink-0"
          >
            <motion.div
              animate={{
                x: isEnabled ? 24 : 2,
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg"
            />
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};

interface ThemeCardProps {
  value: string;
  label: string;
  icon: string;
  isSelected: boolean;
  onSelect: () => void;
  delay?: number;
}

const ThemeCard: React.FC<ThemeCardProps> = ({
  label,
  icon,
  isSelected,
  onSelect,
  delay = 0,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ scale: 1.05, y: -5 }}
      whileTap={{ scale: 0.95 }}
      className="relative cursor-pointer"
      onClick={onSelect}
    >
      <div
        className="rounded-xl p-6 text-center"
        style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          border: `2px solid ${isSelected ? '#00C78C' : 'rgba(255, 255, 255, 0.2)'}`,
          boxShadow: isSelected ? '0 8px 32px rgba(0, 199, 140, 0.4)' : '0 4px 16px rgba(0, 0, 0, 0.2)',
        }}
      >
        {isSelected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-r from-teal-400 to-cyan-500 flex items-center justify-center"
          >
            <span className="text-white text-lg">✓</span>
          </motion.div>
        )}
        <div className="text-5xl mb-3">{icon}</div>
        <h4 className="text-white font-['Inter_Tight'] font-semibold text-lg">{label}</h4>
      </div>
    </motion.div>
  );
};

export const SettingsContext: React.FC = () => {
  const {
    theme,
    emailNotifications,
    marketAlerts,
    roiAlerts,
    pushNotifications,
    autoSuggest,
    setTheme,
    setEmailNotifications,
    setMarketAlerts,
    setRoiAlerts,
    setPushNotifications,
    setAutoSuggest,
  } = useSettingsStore();

  return (
    <div
      className="flex-1 overflow-y-auto p-8"
      style={{
        background: 'linear-gradient(145deg, #0E0023, #2A0059, #00C78C)',
      }}
    >
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, type: 'spring', stiffness: 100 }}
            className="text-7xl mb-4"
          >
            ⚙️
          </motion.div>
          <h1 className="text-5xl font-bold text-white mb-4 font-['Inter_Tight']">
            Conversational Settings
          </h1>
          <p className="text-xl text-white/70 font-['Inter_Tight']">
            Customize Civitas by talking to it — no menus required
          </p>
        </motion.div>

        {/* AI Instruction Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl p-6 mb-8"
          style={{
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
          }}
        >
          <div className="flex items-start gap-4">
            <div className="text-4xl">💬</div>
            <div>
              <h3 className="text-lg font-bold text-white font-['Inter_Tight'] mb-2">
                Talk to Civitas
              </h3>
              <p className="text-white/80 font-['Inter_Tight'] text-sm leading-relaxed">
                Try saying: "Change theme to dark", "Turn off ROI alerts", "Enable push notifications"
                — I'll confirm each change instantly.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Theme Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-white font-['Inter_Tight'] mb-6 flex items-center gap-3">
            <span>🎨</span> Theme
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <ThemeCard
              value="light"
              label="Light"
              icon="☀️"
              isSelected={theme === 'light'}
              onSelect={() => setTheme('light')}
              delay={0.35}
            />
            <ThemeCard
              value="dark"
              label="Dark"
              icon="🌙"
              isSelected={theme === 'dark'}
              onSelect={() => setTheme('dark')}
              delay={0.4}
            />
            <ThemeCard
              value="auto"
              label="Auto"
              icon="🌓"
              isSelected={theme === 'auto'}
              onSelect={() => setTheme('auto')}
              delay={0.45}
            />
          </div>
        </motion.div>

        {/* Notification Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-white font-['Inter_Tight'] mb-6 flex items-center gap-3">
            <span>🔔</span> Notifications
          </h2>
          <div className="space-y-4">
            <SettingCard
              icon="📧"
              title="Email Notifications"
              description="Receive property updates and market trends via email"
              isEnabled={emailNotifications}
              onToggle={() => setEmailNotifications(!emailNotifications)}
              delay={0.55}
            />
            <SettingCard
              icon="📊"
              title="Market Alerts"
              description="Get notified about new investment opportunities"
              isEnabled={marketAlerts}
              onToggle={() => setMarketAlerts(!marketAlerts)}
              delay={0.6}
            />
            <SettingCard
              icon="💰"
              title="ROI Alerts"
              description="Receive alerts when properties meet your ROI threshold"
              isEnabled={roiAlerts}
              onToggle={() => setRoiAlerts(!roiAlerts)}
              delay={0.65}
            />
            <SettingCard
              icon="🔔"
              title="Push Notifications"
              description="Real-time browser notifications for important updates"
              isEnabled={pushNotifications}
              onToggle={() => setPushNotifications(!pushNotifications)}
              delay={0.7}
            />
          </div>
        </motion.div>

        {/* AI Preferences */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75 }}
        >
          <h2 className="text-2xl font-bold text-white font-['Inter_Tight'] mb-6 flex items-center gap-3">
            <span>🤖</span> AI Preferences
          </h2>
          <div className="space-y-4">
            <SettingCard
              icon="✨"
              title="Auto-Suggest"
              description="AI suggests follow-up questions and insights automatically"
              isEnabled={autoSuggest}
              onToggle={() => setAutoSuggest(!autoSuggest)}
              delay={0.8}
            />
          </div>
        </motion.div>

        {/* Footer Hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-12 text-center"
        >
          <p className="text-white/50 font-['Inter_Tight'] text-sm">
            All changes are saved automatically and synced in real-time 💾
          </p>
        </motion.div>
      </div>
    </div>
  );
};
