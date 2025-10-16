// FILE: src/components/desktop-shell/SettingsTabView.tsx
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

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

type SettingsSubTab = 'profile' | 'themes' | 'preferences';

export const SettingsTabView: React.FC<SettingsTabViewProps> = ({
  selectedState,
  setSelectedState,
  emailNotifications,
  setEmailNotifications,
  marketAlerts,
  setMarketAlerts,
  stateOptions
}) => {
  const { user } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState<SettingsSubTab>('profile');

  const subTabs = [
    { id: 'profile' as const, label: 'Profile', icon: '👤' },
    { id: 'themes' as const, label: 'State Themes', icon: '🎨' },
    { id: 'preferences' as const, label: 'Preferences', icon: '⚙️' },
  ];

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Sub-tabs Navigation */}
      <div className="flex-shrink-0 px-8 pt-6 pb-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-6">Settings</h1>
          <div 
            className="flex gap-2 p-1.5 rounded-xl"
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)',
            }}
          >
            {subTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className="flex-1 px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 font-medium text-sm"
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
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sub-tab Content */}
      <div className="flex-1 overflow-y-auto px-8 pb-8">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* Profile Tab */}
          {activeSubTab === 'profile' && (
            <div className="rounded-2xl p-6 shadow-lg" style={{
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)'
            }}>
              <h2 className="text-xl font-bold mb-6 text-gray-900">User Information</h2>
              
              <div className="flex items-start gap-6 mb-8">
                <div 
                  className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white flex-shrink-0"
                  style={{ 
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                  }}
                >
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">{user?.name || 'User'}</h3>
                  <p className="text-gray-600 mb-4">{user?.email || 'user@example.com'}</p>
                  <div className="flex gap-3">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{
                      background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                      color: 'white'
                    }}>
                      ✓ Active Account
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50">
                  <div>
                    <h4 className="font-semibold text-gray-900">Full Name</h4>
                    <p className="text-sm text-gray-600 mt-1">{user?.name || 'Not set'}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50">
                  <div>
                    <h4 className="font-semibold text-gray-900">Email Address</h4>
                    <p className="text-sm text-gray-600 mt-1">{user?.email || 'Not set'}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50">
                  <div>
                    <h4 className="font-semibold text-gray-900">Account Type</h4>
                    <p className="text-sm text-gray-600 mt-1">Premium Investor</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50">
                  <div>
                    <h4 className="font-semibold text-gray-900">Member Since</h4>
                    <p className="text-sm text-gray-600 mt-1">October 2025</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Themes Tab */}
          {activeSubTab === 'themes' && (
            <div className="space-y-6">
              <div className="rounded-2xl p-6 shadow-lg" style={{
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)'
              }}>
                <h2 className="text-xl font-bold mb-4 text-gray-900">State-Based Theme Customization</h2>
                <p className="text-sm text-gray-600 mb-6">
                  Select a state to customize Civitas with localized insights, regulations, and market data specific to that region.
                </p>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                  <button
                    className="rounded-xl p-4 border-2 transition-all hover:scale-105 hover:shadow-lg relative"
                    style={{
                      borderColor: selectedState === '' ? '#3b82f6' : '#E5E7EB',
                      background: selectedState === '' 
                        ? 'linear-gradient(135deg, #3b82f615 0%, #2563eb08 100%)'
                        : 'white',
                      boxShadow: selectedState === '' 
                        ? '0 4px 12px #3b82f630'
                        : 'none'
                    }}
                    onClick={() => setSelectedState('')}
                  >
                    {selectedState === '' && (
                      <div 
                        className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: '#3b82f6' }}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                    )}
                    <div className="text-center">
                      <div className="text-3xl mb-2">🏠</div>
                      <div 
                        className="font-semibold text-sm"
                        style={{ color: selectedState === '' ? '#3b82f6' : '#111827' }}
                      >
                        Default
                      </div>
                      <div 
                        className="mt-2 h-1.5 rounded-full transition-all"
                        style={{ 
                          background: 'linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)',
                          opacity: selectedState === '' ? 1 : 0.4
                        }}
                      />
                    </div>
                  </button>
                  
                  {stateOptions.map((state) => {
                    const isSelected = selectedState === state.name;
                    return (
                      <button
                        key={state.name}
                        className="rounded-xl p-4 border-2 transition-all hover:scale-105 hover:shadow-lg relative"
                        style={{
                          borderColor: isSelected ? state.color : '#E5E7EB',
                          background: isSelected 
                            ? `linear-gradient(135deg, ${state.color}15 0%, ${state.color}08 100%)`
                            : 'white',
                          boxShadow: isSelected 
                            ? `0 4px 12px ${state.color}30`
                            : 'none'
                        }}
                        onClick={() => setSelectedState(state.name)}
                      >
                        {isSelected && (
                          <div 
                            className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: state.color }}
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </div>
                        )}
                        <div className="text-center">
                          <div className="text-3xl mb-2">{state.emoji}</div>
                          <div 
                            className="font-semibold text-sm"
                            style={{ color: isSelected ? state.color : '#111827' }}
                          >
                            {state.name}
                          </div>
                          <div 
                            className="mt-2 h-1.5 rounded-full transition-all"
                            style={{ 
                              backgroundColor: state.color,
                              opacity: isSelected ? 1 : 0.4
                            }}
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {selectedState && (
                <div className="rounded-2xl p-6 shadow-lg" style={{
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)'
                }}>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{
                      background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                    }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">✅ {selectedState} Theme Active</h3>
                      <p className="text-sm text-gray-600">
                        Civitas is now customizing insights based on {selectedState}'s STR regulations, 
                        tax laws, seasonal trends, and market conditions. Your chat responses will include 
                        state-specific guidance and recommendations.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {!selectedState && (
                <div className="rounded-2xl p-6 shadow-lg" style={{
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)'
                }}>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{
                      background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
                    }}>
                      <span className="text-xl">🏠</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">✅ Default Theme Active</h3>
                      <p className="text-sm text-gray-600">
                        You're using the classic Civitas theme. Select a state above to customize insights 
                        based on local STR regulations, tax laws, seasonal trends, and market conditions 
                        specific to that region.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Preferences Tab */}
          {activeSubTab === 'preferences' && (
            <div className="rounded-2xl p-6 shadow-lg" style={{
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)'
            }}>
              <h2 className="text-xl font-bold mb-4 text-gray-900">Notification Preferences</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">Email Notifications</h3>
                    <p className="text-sm text-gray-600">Receive updates about your properties and market trends</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={emailNotifications}
                      onChange={(e) => {
                        const newValue = e.target.checked;
                        setEmailNotifications(newValue);
                        window.localStorage.setItem('civitas-email-notifications', JSON.stringify(newValue));
                      }}
                    />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div>
                    <h3 className="font-semibold text-gray-900">Market Alerts</h3>
                    <p className="text-sm text-gray-600">Get notified about new investment opportunities</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={marketAlerts}
                      onChange={(e) => {
                        const newValue = e.target.checked;
                        setMarketAlerts(newValue);
                        window.localStorage.setItem('civitas-market-alerts', JSON.stringify(newValue));
                      }}
                    />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsTabView;
