// FILE: src/components/desktop-shell/SettingsTabView.tsx
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useSettingsStore } from '../../stores/settingsStore';
import { motion, AnimatePresence } from 'framer-motion';
import { AgentAvatar } from '../common/AgentAvatar';

interface ThemeOption {
  name: string;
  emoji: string;
  color: string;
}

interface SettingsTabViewProps {
  selectedState: string;
  setSelectedState: (state: string) => void;
  emailNotifications: boolean;
  setEmailNotifications: (value: boolean) => void;
  marketAlerts: boolean;
  setMarketAlerts: (value: boolean) => void;
  stateOptions: ThemeOption[];
}

type SettingsSubTab = 'profile' | 'preferences';

export const SettingsTabView: React.FC<SettingsTabViewProps> = () => {
  const { user } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState<SettingsSubTab>('profile');
  
  const {
    emailNotifications,
    marketAlerts,
    roiAlerts,
    pushNotifications,
    setEmailNotifications,
    setMarketAlerts,
    setRoiAlerts,
    setPushNotifications,
  } = useSettingsStore();

  const subTabs = [
    { id: 'profile' as const, label: 'Profile', icon: '👤' },
    { id: 'preferences' as const, label: 'Preferences', icon: '⚙️' },
  ];

  const profileItems = [
    { title: 'Full Name', value: user?.name || 'Not set' },
    { title: 'Email Address', value: user?.email || 'Not set' },
    { title: 'Account Type', value: 'Premium Investor' },
    { title: 'Member Since', value: 'October 2025' }
  ];

  const notificationItems = [
    { icon: '📧', title: 'Email Notifications', desc: 'Property updates and market trends' },
    { icon: '📊', title: 'Market Alerts', desc: 'New investment opportunities' },
    { icon: '🔔', title: 'Push Notifications', desc: 'Real-time browser notifications' }
  ];

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Sub-tabs Navigation */}
      <div className="flex-shrink-0 px-8 pt-6 pb-4">
        <div className="max-w-4xl mx-auto">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold text-white mb-6"
          >
            Settings
          </motion.h1>
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex gap-2 p-1.5 rounded-xl relative"
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)',
            }}
          >
            {subTabs.map((tab, index) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.2 + index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 font-medium text-sm relative overflow-hidden"
                style={{
                  background: activeSubTab === tab.id 
                    ? 'rgba(255, 255, 255, 0.95)'
                    : 'transparent',
                  color: activeSubTab === tab.id ? '#1e293b' : '#ffffff',
                  boxShadow: activeSubTab === tab.id
                    ? '0 2px 8px rgba(0, 0, 0, 0.1)'
                    : 'none',
                }}
              >
                {activeSubTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 rounded-lg"
                    style={{
                      background: 'rgba(255, 255, 255, 0.95)',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                    }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{tab.icon}</span>
                <span className="relative z-10">{tab.label}</span>
              </motion.button>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Sub-tab Content */}
      <div className="flex-1 overflow-y-auto px-8 pb-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <AnimatePresence mode="wait">
          {/* Profile Tab */}
          {activeSubTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="rounded-2xl p-6 shadow-lg" 
              style={{
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)'
              }}
            >
              <motion.h2 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-xl font-bold mb-6 text-gray-900"
              >
                User Information
              </motion.h2>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-start gap-6 mb-8"
              >
                <motion.div 
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ 
                    delay: 0.3, 
                    type: 'spring', 
                    stiffness: 200, 
                    damping: 15 
                  }}
                  whileHover={{ 
                    scale: 1.1, 
                    rotate: 5,
                    boxShadow: '0 8px 24px rgba(59, 130, 246, 0.5)'
                  }}
                  className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white flex-shrink-0 cursor-pointer"
                  style={{ 
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                  }}
                >
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </motion.div>
                <div className="flex-1">
                  <motion.h3 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-2xl font-bold text-gray-900 mb-1"
                  >
                    {user?.name || 'User'}
                  </motion.h3>
                  <motion.p 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="text-gray-600 mb-4"
                  >
                    {user?.email || 'user@example.com'}
                  </motion.p>
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6, type: 'spring' }}
                    className="flex gap-3"
                  >
                    <motion.span 
                      whileHover={{ scale: 1.05 }}
                      className="px-3 py-1 rounded-full text-xs font-semibold cursor-pointer"
                      style={{
                        background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                        color: 'white'
                      }}
                    >
                      <motion.span
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="inline-block mr-1"
                      >
                        ✓
                      </motion.span>
                      Active Account
                    </motion.span>
                  </motion.div>
                </div>
              </motion.div>

              <div className="space-y-4 pt-6 border-t border-gray-200">
                {profileItems.map((item, index) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ 
                      delay: 0.7 + index * 0.1,
                      type: 'spring',
                      stiffness: 100
                    }}
                    whileHover={{ 
                      scale: 1.02, 
                      x: 10,
                      backgroundColor: 'rgba(243, 244, 246, 1)',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                    }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center justify-between p-4 rounded-xl bg-gray-50 cursor-pointer transition-all relative overflow-hidden"
                  >
                    {/* Hover gradient effect */}
                    <motion.div
                      className="absolute inset-0 opacity-0"
                      whileHover={{ opacity: 0.1 }}
                      style={{
                        background: 'linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.3), transparent)'
                      }}
                    />
                    <div className="relative z-10">
                      <motion.h4 
                        className="font-semibold text-gray-900"
                        whileHover={{ color: '#3b82f6' }}
                      >
                        {item.title}
                      </motion.h4>
                      <p className="text-sm text-gray-600 mt-1">{item.value}</p>
                    </div>
                    {/* Arrow indicator on hover */}
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      whileHover={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-blue-600"
                    >
                      →
                    </motion.div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Preferences Tab */}
          {activeSubTab === 'preferences' && (
            <motion.div
              key="preferences"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              {/* AI Instructions Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
                className="rounded-2xl p-6 shadow-lg mb-6 relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                }}
              >
                {/* Animated background glow */}
                <motion.div
                  className="absolute inset-0 opacity-30"
                  animate={{
                    background: [
                      'radial-gradient(circle at 0% 0%, rgba(255,255,255,0.3) 0%, transparent 50%)',
                      'radial-gradient(circle at 100% 100%, rgba(255,255,255,0.3) 0%, transparent 50%)',
                      'radial-gradient(circle at 0% 0%, rgba(255,255,255,0.3) 0%, transparent 50%)',
                    ],
                  }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                />
                <div className="flex items-start gap-4 relative z-10">
                  <motion.div
                    animate={{ 
                      y: [0, -8, 0],
                      rotate: [0, 2, -2, 0]
                    }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <AgentAvatar size="lg" />
                  </motion.div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Adjust Your Preferences with Ease</h3>
                    <p className="text-white/90 text-sm leading-relaxed mb-3">
                      Just chat with me naturally! Here are some examples:
                    </p>
                    <div className="space-y-2">
                      <div className="text-sm text-white/80">💬 "Turn off email notifications"</div>
                      <div className="text-sm text-white/80">💬 "Enable push notifications"</div>
                      <div className="text-sm text-white/80">💬 "Disable market alerts"</div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Current Settings - Read Only */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-2xl p-6 shadow-lg"
                style={{
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <motion.h2 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-xl font-bold mb-4 text-gray-900"
                >
                  Current Preferences
                </motion.h2>
                <div className="space-y-4">
                  {notificationItems.map((item, index) => (
                    <motion.div
                      key={item.title}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                      className="flex items-center justify-between p-4 rounded-xl bg-gray-50 opacity-60"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                            {item.icon} {item.title}
                          </h3>
                          <motion.span 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.5 + index * 0.1, type: 'spring' }}
                            className="px-2 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-700"
                          >
                            Phase 2
                          </motion.span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{item.desc}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <motion.span
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-200 text-gray-500"
                        >
                          Coming Soon
                        </motion.span>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  whileHover={{ scale: 1.02 }}
                  className="mt-6 p-4 rounded-xl bg-blue-50 border border-blue-200 relative overflow-hidden"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-blue-100 to-transparent opacity-50"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  />
                  <p className="text-sm text-blue-800 relative z-10">
                    <motion.span
                      animate={{ rotate: [0, 20, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="inline-block"
                    >
                      💡
                    </motion.span>{' '}
                    <strong>Tip:</strong> Click "New Chat" in the sidebar and tell me what you'd like to change. I'll update your settings instantly!
                  </p>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default SettingsTabView;
