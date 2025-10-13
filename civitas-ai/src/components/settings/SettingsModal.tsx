import React, { useState, useEffect } from 'react';
import { User, Mail, Camera, Save, Palette } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { useAuth } from '../../contexts/AuthContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabId = 'profile' | 'theme';

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>('profile');
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    avatar: user?.avatar || ''
  });
  
  // Reset form data when modal opens or user changes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: user?.name || '',
        email: user?.email || '',
        avatar: user?.avatar || ''
      });
    }
  }, [isOpen, user]);
  
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
  }>({});

  const tabs = [
    { id: 'profile' as const, label: 'Profile', icon: User },
    { id: 'theme' as const, label: 'State Theme', icon: Palette }
  ];

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSave = () => {
    setErrors({});
    const newErrors: {name?: string; email?: string} = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    console.log('Saving profile:', formData);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Settings" size="lg">
      <div className="flex flex-col h-full">
        {/* Tabs */}
        <div className="flex border-b border-border mb-6">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-foreground/60 hover:text-foreground hover:border-foreground/20'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              {/* Avatar Section */}
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent-from rounded-full flex items-center justify-center">
                    <span className="text-2xl font-semibold text-white">
                      {formData.avatar || formData.name.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  {/* TODO: Implement avatar upload functionality */}
                  <button 
                    className="absolute -bottom-1 -right-1 w-7 h-7 bg-gray-400 rounded-full flex items-center justify-center text-white opacity-50 cursor-not-allowed"
                    disabled
                    aria-disabled="true"
                    title="Feature coming soon"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-foreground">Profile Photo</h4>
                  <p className="text-xs text-foreground/60">Avatar upload coming soon</p>
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full px-3 py-2 border ${errors.name ? 'border-red-500' : 'border-border'} rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 ${errors.name ? 'focus:ring-red-500/50' : 'focus:ring-primary/50'}`}
                    placeholder="Enter your full name"
                  />
                  {errors.name && (
                    <p className="mt-1 text-xs text-red-500">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    <Mail className="w-4 h-4 inline mr-2" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`w-full px-3 py-2 border ${errors.email ? 'border-red-500' : 'border-border'} rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 ${errors.email ? 'focus:ring-red-500/50' : 'focus:ring-primary/50'}`}
                    placeholder="your@email.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-500">{errors.email}</p>
                  )}
                </div>
              </div>

              {/* Usage Statistics */}
              <div className="pt-6 border-t border-border">
                <h4 className="text-sm font-medium text-foreground mb-4">Usage Statistics</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <p className="text-2xl font-bold text-primary">24</p>
                    <p className="text-xs text-foreground/60 mt-1">Chats Created</p>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <p className="text-2xl font-bold text-primary">156</p>
                    <p className="text-xs text-foreground/60 mt-1">Messages Sent</p>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <p className="text-2xl font-bold text-primary">43</p>
                    <p className="text-xs text-foreground/60 mt-1">Properties Viewed</p>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <p className="text-2xl font-bold text-primary">8</p>
                    <p className="text-xs text-foreground/60 mt-1">Reports Generated</p>
                  </div>
                </div>
              </div>

              {/* API Usage */}
              <div className="pt-6 border-t border-border">
                <h4 className="text-sm font-medium text-foreground mb-4">API Usage This Month</h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-foreground/60">Requests</span>
                      <span className="text-foreground font-medium">750 / 1,000</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: '75%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-foreground/60">Storage</span>
                      <span className="text-foreground font-medium">2.3 GB / 5 GB</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: '46%' }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end pt-6 border-t border-border">
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {activeTab === 'theme' && (
            <div className="space-y-6">
              <div className="bg-muted/30 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  State Theme
                </h4>
                <p className="text-sm text-foreground/60 mb-6">
                  Choose your preferred state theme to customize the appearance of Civitas AI. Each state has its own unique color scheme and branding.
                </p>
                
                {/* StateSelector will go here - for now, placeholder */}
                <div className="flex justify-center">
                  <div className="w-full max-w-md">
                    <select className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50">
                      <option>🗽 New York - Empire Blue</option>
                      <option>☀️ California - Golden State</option>
                      <option>🌴 Florida - Sunshine Orange</option>
                      <option>🌟 Texas - Lone Star</option>
                      <option>⛰️ Colorado - Rocky Mountain</option>
                    </select>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-border">
                  <h5 className="text-sm font-semibold text-foreground mb-3">About State Themes</h5>
                  <ul className="space-y-2 text-sm text-foreground/70">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span>Each state theme includes unique colors and branding</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span>Themes are applied across the entire application</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span>Your preference is saved automatically</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
