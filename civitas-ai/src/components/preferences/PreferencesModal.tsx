import React, { useState } from 'react';
import { Monitor, Moon, Sun, Bell, Globe, Shield } from 'lucide-react';
import { Modal } from '../ui/Modal';

interface PreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PreferencesModal: React.FC<PreferencesModalProps> = ({ isOpen, onClose }) => {
  const [preferences, setPreferences] = useState({
    theme: 'system',
    notifications: {
      email: true,
      push: true,
      marketing: false
    },
    language: 'en',
    privacy: {
      analytics: true,
      cookies: true
    }
  });

  const handleSave = () => {
    // TODO: Implement preferences save logic
    console.log('Saving preferences:', preferences);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Preferences" size="lg">
      <div className="space-y-6">
        {/* Theme Settings */}
        <div>
          <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
            <Monitor className="w-4 h-4" />
            Theme
          </h4>
          <div className="grid grid-cols-3 gap-3">
            {[
              { key: 'light', label: 'Light', icon: Sun },
              { key: 'dark', label: 'Dark', icon: Moon },
              { key: 'system', label: 'System', icon: Monitor }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setPreferences({ ...preferences, theme: key })}
                className={`p-3 border rounded-lg text-center transition-colors ${
                  preferences.theme === key
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border text-foreground/70 hover:text-foreground hover:bg-muted/50'
                }`}
              >
                <Icon className="w-5 h-5 mx-auto mb-1" />
                <span className="text-xs font-medium">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div>
          <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Notifications
          </h4>
          <div className="space-y-3">
            {[
              { key: 'email', label: 'Email Notifications', description: 'Receive updates via email' },
              { key: 'push', label: 'Push Notifications', description: 'Receive browser notifications' },
              { key: 'marketing', label: 'Marketing Communications', description: 'Receive promotional content' }
            ].map(({ key, label, description }) => (
              <div key={key} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-foreground">{label}</p>
                  <p className="text-xs text-foreground/60">{description}</p>
                </div>
                <button
                  onClick={() => setPreferences({
                    ...preferences,
                    notifications: {
                      ...preferences.notifications,
                      [key]: !preferences.notifications[key as keyof typeof preferences.notifications]
                    }
                  })}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    preferences.notifications[key as keyof typeof preferences.notifications]
                      ? 'bg-primary'
                      : 'bg-border'
                  }`}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                      preferences.notifications[key as keyof typeof preferences.notifications]
                        ? 'translate-x-5'
                        : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Language */}
        <div>
          <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Language
          </h4>
          <select
            value={preferences.language}
            onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
            className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
            <option value="de">Deutsch</option>
          </select>
        </div>

        {/* Privacy */}
        <div>
          <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Privacy
          </h4>
          <div className="space-y-3">
            {[
              { key: 'analytics', label: 'Analytics', description: 'Help improve the app with usage data' },
              { key: 'cookies', label: 'Cookies', description: 'Allow cookies for better experience' }
            ].map(({ key, label, description }) => (
              <div key={key} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-foreground">{label}</p>
                  <p className="text-xs text-foreground/60">{description}</p>
                </div>
                <button
                  onClick={() => setPreferences({
                    ...preferences,
                    privacy: {
                      ...preferences.privacy,
                      [key]: !preferences.privacy[key as keyof typeof preferences.privacy]
                    }
                  })}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    preferences.privacy[key as keyof typeof preferences.privacy]
                      ? 'bg-primary'
                      : 'bg-border'
                  }`}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                      preferences.privacy[key as keyof typeof preferences.privacy]
                        ? 'translate-x-5'
                        : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-border">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </Modal>
  );
};