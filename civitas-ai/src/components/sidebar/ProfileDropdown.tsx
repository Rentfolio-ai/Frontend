/**
 * ProfileDropdown - User menu with settings, preferences, etc.
 * Like ChatGPT/Claude profile menu
 */

import React from 'react';
import { 
  Settings, 
  User, 
  HelpCircle, 
  LogOut, 
  CreditCard,
  BookOpen,
  MessageCircle,
  Shield,
  FileText,
  Info
} from 'lucide-react';
import { designTokens } from '../../styles/design-tokens';

interface ProfileDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  userEmail: string;
  portfolioValue?: string;
  onProfileClick: () => void;
  onSettingsClick: () => void;
  onBillingClick?: () => void;
  onFAQClick: () => void;
  onDocsClick: () => void;
  onContactClick: () => void;
  onPrivacyClick: () => void;
  onTermsClick: () => void;
  onAboutClick: () => void;
  onLogout: () => void;
}

export const ProfileDropdown: React.FC<ProfileDropdownProps> = ({
  isOpen,
  onClose,
  userName,
  userEmail,
  portfolioValue,
  onProfileClick,
  onSettingsClick,
  onBillingClick,
  onFAQClick,
  onDocsClick,
  onContactClick,
  onPrivacyClick,
  onTermsClick,
  onAboutClick,
  onLogout,
}) => {
  if (!isOpen) return null;

  // All menu items (ChatGPT/Claude style presentation)
  const menuItems = [
    { icon: User, label: 'My profile', onClick: onProfileClick },
    { icon: Settings, label: 'Settings', onClick: onSettingsClick },
    { icon: CreditCard, label: 'My plan', onClick: onBillingClick, show: !!onBillingClick },
    { icon: HelpCircle, label: 'Help & FAQ', onClick: onFAQClick },
    { icon: BookOpen, label: 'Documentation', onClick: onDocsClick },
    { icon: MessageCircle, label: 'Contact support', onClick: onContactClick },
    { icon: Shield, label: 'Privacy policy', onClick: onPrivacyClick },
    { icon: FileText, label: 'Terms of service', onClick: onTermsClick },
    { icon: Info, label: 'About', onClick: onAboutClick },
  ].filter(item => item.show !== false);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1300,
        }}
      />

      {/* Dropdown Menu - ChatGPT/Claude style (compact size from screenshot) */}
      <div
        style={{
          position: 'fixed',
          bottom: '70px',
          left: '12px',
          width: '220px',
          maxHeight: '480px',
          backgroundColor: designTokens.colors.sidebar.surface,
          border: `1px solid ${designTokens.colors.sidebar.border}`,
          borderRadius: '10px',
          boxShadow: designTokens.shadow.xl,
          zIndex: 1400,
          overflow: 'auto',
        }}
      >
        {/* User Info Header - Very compact like screenshot */}
        <div style={{
          padding: '10px 12px 8px 12px',
          borderBottom: `1px solid ${designTokens.colors.sidebar.border}`,
        }}>
          <div style={{
            fontSize: '15px',
            fontWeight: designTokens.typography.fontWeight.semibold,
            color: designTokens.colors.text.primary,
            marginBottom: '1px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {userName}
          </div>
          <div style={{
            fontSize: '13px',
            color: designTokens.colors.text.tertiary,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {userEmail}
          </div>
        </div>

        {/* All Menu Items - Very compact vertical spacing like screenshot */}
        <div style={{ padding: '2px 0' }}>
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={index}
                onClick={() => {
                  item.onClick();
                  onClose();
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '8px 12px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderRadius: '0',
                  color: designTokens.colors.text.primary,
                  fontSize: '14px',
                  fontWeight: designTokens.typography.fontWeight.normal,
                  cursor: 'pointer',
                  transition: `all ${designTokens.transition.fast}`,
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = designTokens.colors.sidebar.hover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <Icon size={20} style={{ flexShrink: 0 }} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Divider before Logout */}
        <div style={{ height: '1px', backgroundColor: designTokens.colors.sidebar.border, margin: '2px 0' }} />

        {/* Logout - Very compact like screenshot */}
        <div style={{ padding: '2px 0' }}>
          <button
            onClick={() => {
              onLogout();
              onClose();
            }}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '8px 12px',
              backgroundColor: 'transparent',
              border: 'none',
              borderRadius: '0',
              color: designTokens.colors.text.primary,
              fontSize: '14px',
              fontWeight: designTokens.typography.fontWeight.normal,
              cursor: 'pointer',
              transition: `all ${designTokens.transition.fast}`,
              textAlign: 'left',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = designTokens.colors.sidebar.hover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <LogOut size={20} style={{ flexShrink: 0 }} />
            <span>Log out</span>
          </button>
        </div>
      </div>
    </>
  );
};
