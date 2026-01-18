/**
 * Settings & Preferences Page
 * Comprehensive settings for account, notifications, and preferences
 */

import React, { useState } from 'react';
import { Bell, Eye, Lock, Shield, DollarSign, ArrowLeft } from 'lucide-react';
import { designTokens } from '../styles/design-tokens';

interface SettingsPageProps {
  onBack?: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onBack }) => {
  const [settings, setSettings] = useState({
    // Notifications
    emailNotifications: true,
    smsAlerts: false,
    pushNotifications: true,
    marketAlerts: true,
    newProperties: true,
    
    // Display Preferences
    defaultView: 'chat' as 'chat' | 'portfolio',
    theme: 'dark' as 'light' | 'dark',
    currency: 'USD',
    
    // Privacy
    dataSharing: true,
    analyticsTracking: true,
  });

  const handleSave = () => {
    // Save settings to backend
    console.log('Saving settings:', settings);
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: designTokens.colors.chat.bg,
      padding: `${designTokens.spacing.xl} ${designTokens.spacing.lg}`,
    }}>
      {/* Header */}
      <div style={{
        maxWidth: '900px',
        margin: '0 auto',
        marginBottom: designTokens.spacing.xl,
      }}>
        {/* Back Button */}
        {onBack && (
          <button
            onClick={onBack}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: designTokens.spacing.xs,
              padding: `${designTokens.spacing.sm} ${designTokens.spacing.md}`,
              backgroundColor: 'transparent',
              color: designTokens.colors.text.secondary,
              border: 'none',
              borderRadius: designTokens.radius.md,
              fontSize: '14px',
              fontWeight: designTokens.typography.fontWeight.medium,
              cursor: 'pointer',
              marginBottom: designTokens.spacing.md,
              transition: `all ${designTokens.transition.fast}`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = designTokens.colors.brand.primary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = designTokens.colors.text.secondary;
            }}
          >
            <ArrowLeft size={18} />
            Back
          </button>
        )}
        <h1 style={{
          fontSize: '32px',
          fontWeight: designTokens.typography.fontWeight.semibold,
          color: designTokens.colors.text.primary,
          marginBottom: designTokens.spacing.sm,
        }}>
          Settings & Preferences
        </h1>
        <p style={{
          fontSize: '15px',
          color: designTokens.colors.text.tertiary,
          margin: 0,
        }}>
          Customize your experience and manage your account settings
        </p>
      </div>

      <div style={{
        maxWidth: '900px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: designTokens.spacing.lg,
      }}>
        {/* Notifications Section */}
        <SettingsSection icon={<Bell size={20} />} title="Notifications">
          <SettingToggle
            label="Email Notifications"
            description="Receive updates about your portfolio via email"
            checked={settings.emailNotifications}
            onChange={(checked) => setSettings({ ...settings, emailNotifications: checked })}
          />
          <SettingToggle
            label="SMS Alerts"
            description="Get important alerts via text message"
            checked={settings.smsAlerts}
            onChange={(checked) => setSettings({ ...settings, smsAlerts: checked })}
          />
          <SettingToggle
            label="Push Notifications"
            description="Browser notifications for real-time updates"
            checked={settings.pushNotifications}
            onChange={(checked) => setSettings({ ...settings, pushNotifications: checked })}
          />
          <SettingToggle
            label="Market Alerts"
            description="Get notified about market changes and trends"
            checked={settings.marketAlerts}
            onChange={(checked) => setSettings({ ...settings, marketAlerts: checked })}
          />
          <SettingToggle
            label="New Properties"
            description="Alert me when properties match my criteria"
            checked={settings.newProperties}
            onChange={(checked) => setSettings({ ...settings, newProperties: checked })}
          />
        </SettingsSection>

        {/* Display Preferences Section */}
        <SettingsSection icon={<Eye size={20} />} title="Display Preferences">
          <div>
            <label style={{
              fontSize: '14px',
              fontWeight: designTokens.typography.fontWeight.medium,
              color: designTokens.colors.text.primary,
              marginBottom: designTokens.spacing.xs,
              display: 'block',
            }}>
              Default View
            </label>
            <p style={{
              fontSize: '13px',
              color: designTokens.colors.text.tertiary,
              marginBottom: designTokens.spacing.sm,
            }}>
              Choose which page to show when you log in
            </p>
            <select
              value={settings.defaultView}
              onChange={(e) => setSettings({ ...settings, defaultView: e.target.value as 'chat' | 'portfolio' })}
              style={{
                width: '100%',
                padding: `${designTokens.spacing.sm} ${designTokens.spacing.md}`,
                backgroundColor: designTokens.colors.chat.elevated,
                border: `1px solid ${designTokens.colors.sidebar.border}`,
                borderRadius: designTokens.radius.md,
                color: designTokens.colors.text.primary,
                fontSize: '14px',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="chat">Chat</option>
              <option value="portfolio">Portfolio</option>
            </select>
          </div>

          <div>
            <label style={{
              fontSize: '14px',
              fontWeight: designTokens.typography.fontWeight.medium,
              color: designTokens.colors.text.primary,
              marginBottom: designTokens.spacing.xs,
              display: 'block',
            }}>
              Theme
            </label>
            <p style={{
              fontSize: '13px',
              color: designTokens.colors.text.tertiary,
              marginBottom: designTokens.spacing.sm,
            }}>
              Choose your preferred color theme
            </p>
            <select
              value={settings.theme}
              onChange={(e) => setSettings({ ...settings, theme: e.target.value as 'light' | 'dark' })}
              style={{
                width: '100%',
                padding: `${designTokens.spacing.sm} ${designTokens.spacing.md}`,
                backgroundColor: designTokens.colors.chat.elevated,
                border: `1px solid ${designTokens.colors.sidebar.border}`,
                borderRadius: designTokens.radius.md,
                color: designTokens.colors.text.primary,
                fontSize: '14px',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>

          <div>
            <label style={{
              fontSize: '14px',
              fontWeight: designTokens.typography.fontWeight.medium,
              color: designTokens.colors.text.primary,
              marginBottom: designTokens.spacing.xs,
              display: 'block',
            }}>
              Currency
            </label>
            <p style={{
              fontSize: '13px',
              color: designTokens.colors.text.tertiary,
              marginBottom: designTokens.spacing.sm,
            }}>
              Display prices and values in your preferred currency
            </p>
            <select
              value={settings.currency}
              onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
              style={{
                width: '100%',
                padding: `${designTokens.spacing.sm} ${designTokens.spacing.md}`,
                backgroundColor: designTokens.colors.chat.elevated,
                border: `1px solid ${designTokens.colors.sidebar.border}`,
                borderRadius: designTokens.radius.md,
                color: designTokens.colors.text.primary,
                fontSize: '14px',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>
        </SettingsSection>

        {/* Privacy & Data Section */}
        <SettingsSection icon={<Shield size={20} />} title="Privacy & Data">
          <SettingToggle
            label="Data Sharing"
            description="Share anonymized data to help improve our service"
            checked={settings.dataSharing}
            onChange={(checked) => setSettings({ ...settings, dataSharing: checked })}
          />
          <SettingToggle
            label="Analytics Tracking"
            description="Allow us to track usage to improve your experience"
            checked={settings.analyticsTracking}
            onChange={(checked) => setSettings({ ...settings, analyticsTracking: checked })}
          />
        </SettingsSection>

        {/* Account Security Section */}
        <SettingsSection icon={<Lock size={20} />} title="Account Security">
          <button
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: `${designTokens.spacing.md} ${designTokens.spacing.md}`,
              backgroundColor: designTokens.colors.chat.elevated,
              border: `1px solid ${designTokens.colors.sidebar.border}`,
              borderRadius: designTokens.radius.md,
              color: designTokens.colors.text.primary,
              fontSize: '14px',
              fontWeight: designTokens.typography.fontWeight.medium,
              cursor: 'pointer',
              transition: `all ${designTokens.transition.fast}`,
              textAlign: 'left',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = designTokens.colors.brand.primary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = designTokens.colors.sidebar.border;
            }}
          >
            Change Password
            <span style={{ color: designTokens.colors.text.tertiary }}>→</span>
          </button>

          <button
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: `${designTokens.spacing.md} ${designTokens.spacing.md}`,
              backgroundColor: designTokens.colors.chat.elevated,
              border: `1px solid ${designTokens.colors.sidebar.border}`,
              borderRadius: designTokens.radius.md,
              color: designTokens.colors.text.primary,
              fontSize: '14px',
              fontWeight: designTokens.typography.fontWeight.medium,
              cursor: 'pointer',
              transition: `all ${designTokens.transition.fast}`,
              textAlign: 'left',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = designTokens.colors.brand.primary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = designTokens.colors.sidebar.border;
            }}
          >
            Enable Two-Factor Authentication
            <span style={{ 
              padding: `2px 8px`,
              backgroundColor: designTokens.colors.semantic.successSubtle,
              color: designTokens.colors.semantic.success,
              borderRadius: designTokens.radius.sm,
              fontSize: '11px',
              fontWeight: designTokens.typography.fontWeight.semibold,
            }}>
              Recommended
            </span>
          </button>
        </SettingsSection>

        {/* Save Button */}
        <button
          onClick={handleSave}
          style={{
            padding: `${designTokens.spacing.md} ${designTokens.spacing.lg}`,
            backgroundColor: designTokens.colors.brand.primary,
            color: '#FFFFFF',
            border: 'none',
            borderRadius: designTokens.radius.md,
            fontSize: '15px',
            fontWeight: designTokens.typography.fontWeight.semibold,
            cursor: 'pointer',
            transition: `all ${designTokens.transition.fast}`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = designTokens.colors.brand.dark;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = designTokens.colors.brand.primary;
          }}
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

// Helper Components
const SettingsSection: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
  <div style={{
    backgroundColor: designTokens.colors.chat.surface,
    borderRadius: designTokens.radius.md,
    padding: designTokens.spacing.lg,
    border: `1px solid ${designTokens.colors.sidebar.border}`,
  }}>
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: designTokens.spacing.sm,
      marginBottom: designTokens.spacing.lg,
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        borderRadius: designTokens.radius.md,
        backgroundColor: designTokens.colors.brand.subtle,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: designTokens.colors.brand.light,
      }}>
        {icon}
      </div>
      <h2 style={{
        fontSize: '20px',
        fontWeight: designTokens.typography.fontWeight.semibold,
        color: designTokens.colors.text.primary,
        margin: 0,
      }}>
        {title}
      </h2>
    </div>
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: designTokens.spacing.md,
    }}>
      {children}
    </div>
  </div>
);

const SettingToggle: React.FC<{ label: string; description: string; checked: boolean; onChange: (checked: boolean) => void }> = ({ 
  label, 
  description, 
  checked, 
  onChange 
}) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${designTokens.spacing.sm} 0`,
  }}>
    <div style={{ flex: 1 }}>
      <div style={{
        fontSize: '14px',
        fontWeight: designTokens.typography.fontWeight.medium,
        color: designTokens.colors.text.primary,
        marginBottom: '4px',
      }}>
        {label}
      </div>
      <div style={{
        fontSize: '13px',
        color: designTokens.colors.text.tertiary,
      }}>
        {description}
      </div>
    </div>
    <button
      onClick={() => onChange(!checked)}
      style={{
        width: '48px',
        height: '28px',
        borderRadius: '14px',
        backgroundColor: checked ? designTokens.colors.brand.primary : designTokens.colors.sidebar.surface,
        border: `2px solid ${checked ? designTokens.colors.brand.primary : designTokens.colors.sidebar.border}`,
        cursor: 'pointer',
        transition: `all ${designTokens.transition.fast}`,
        position: 'relative',
        flexShrink: 0,
      }}
    >
      <div style={{
        width: '20px',
        height: '20px',
        borderRadius: '50%',
        backgroundColor: '#FFFFFF',
        position: 'absolute',
        top: '2px',
        left: checked ? '24px' : '2px',
        transition: `left ${designTokens.transition.fast}`,
      }} />
    </button>
  </div>
);
