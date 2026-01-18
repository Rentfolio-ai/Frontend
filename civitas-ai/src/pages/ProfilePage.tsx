/**
 * My Profile Page
 * User profile with stats, investment criteria, and recent activity
 */

import React, { useState } from 'react';
import { User, Mail, Phone, Calendar, TrendingUp, FileText, Home, Edit2, Save, X, ArrowLeft } from 'lucide-react';
import { designTokens } from '../styles/design-tokens';

interface ProfilePageProps {
  onBack?: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onBack }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    minROI: 12,
    maxPrice: 500000,
    preferredMarkets: ['Austin, TX', 'Dallas, TX', 'Houston, TX'],
  });

  const stats = {
    propertiesAnalyzed: 47,
    reportsGenerated: 23,
    shortlisted: 8,
    memberSince: 'January 2025',
  };

  const handleSave = () => {
    // Save profile data
    setIsEditing(false);
  };

  const handleCancel = () => {
    // Reset form data
    setIsEditing(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: designTokens.colors.chat.bg,
      padding: `${designTokens.spacing.xl} ${designTokens.spacing.lg}`,
    }}>
      {/* Header */}
      <div style={{
        maxWidth: '1200px',
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
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: designTokens.spacing.sm,
        }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: designTokens.typography.fontWeight.semibold,
            color: designTokens.colors.text.primary,
            margin: 0,
          }}>
            My Profile
          </h1>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: designTokens.spacing.xs,
                padding: `${designTokens.spacing.sm} ${designTokens.spacing.md}`,
                backgroundColor: designTokens.colors.brand.primary,
                color: '#FFFFFF',
                border: 'none',
                borderRadius: designTokens.radius.md,
                fontSize: '14px',
                fontWeight: designTokens.typography.fontWeight.medium,
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
              <Edit2 size={16} />
              Edit Profile
            </button>
          ) : (
            <div style={{ display: 'flex', gap: designTokens.spacing.xs }}>
              <button
                onClick={handleCancel}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: designTokens.spacing.xs,
                  padding: `${designTokens.spacing.sm} ${designTokens.spacing.md}`,
                  backgroundColor: 'transparent',
                  color: designTokens.colors.text.secondary,
                  border: `1px solid ${designTokens.colors.sidebar.border}`,
                  borderRadius: designTokens.radius.md,
                  fontSize: '14px',
                  fontWeight: designTokens.typography.fontWeight.medium,
                  cursor: 'pointer',
                }}
              >
                <X size={16} />
                Cancel
              </button>
              <button
                onClick={handleSave}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: designTokens.spacing.xs,
                  padding: `${designTokens.spacing.sm} ${designTokens.spacing.md}`,
                  backgroundColor: designTokens.colors.brand.primary,
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: designTokens.radius.md,
                  fontSize: '14px',
                  fontWeight: designTokens.typography.fontWeight.medium,
                  cursor: 'pointer',
                }}
              >
                <Save size={16} />
                Save Changes
              </button>
            </div>
          )}
        </div>
        <p style={{
          fontSize: '15px',
          color: designTokens.colors.text.tertiary,
          margin: 0,
        }}>
          Manage your profile information and investment preferences
        </p>
      </div>

      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: designTokens.spacing.lg,
      }}>
        {/* Personal Information */}
        <div style={{
          gridColumn: '1 / -1',
          backgroundColor: designTokens.colors.chat.surface,
          borderRadius: designTokens.radius.md,
          padding: designTokens.spacing.lg,
          border: `1px solid ${designTokens.colors.sidebar.border}`,
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: designTokens.typography.fontWeight.semibold,
            color: designTokens.colors.text.primary,
            marginBottom: designTokens.spacing.md,
          }}>
            Personal Information
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: designTokens.spacing.md,
          }}>
            {/* Name */}
            <div>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: designTokens.spacing.xs,
                fontSize: '13px',
                fontWeight: designTokens.typography.fontWeight.medium,
                color: designTokens.colors.text.secondary,
                marginBottom: designTokens.spacing.xs,
              }}>
                <User size={14} />
                Full Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={!isEditing}
                style={{
                  width: '100%',
                  padding: `${designTokens.spacing.sm} ${designTokens.spacing.md}`,
                  backgroundColor: isEditing ? designTokens.colors.chat.elevated : designTokens.colors.sidebar.surface,
                  border: `1px solid ${designTokens.colors.sidebar.border}`,
                  borderRadius: designTokens.radius.md,
                  color: designTokens.colors.text.primary,
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
            </div>

            {/* Email */}
            <div>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: designTokens.spacing.xs,
                fontSize: '13px',
                fontWeight: designTokens.typography.fontWeight.medium,
                color: designTokens.colors.text.secondary,
                marginBottom: designTokens.spacing.xs,
              }}>
                <Mail size={14} />
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={!isEditing}
                style={{
                  width: '100%',
                  padding: `${designTokens.spacing.sm} ${designTokens.spacing.md}`,
                  backgroundColor: isEditing ? designTokens.colors.chat.elevated : designTokens.colors.sidebar.surface,
                  border: `1px solid ${designTokens.colors.sidebar.border}`,
                  borderRadius: designTokens.radius.md,
                  color: designTokens.colors.text.primary,
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
            </div>

            {/* Phone */}
            <div>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: designTokens.spacing.xs,
                fontSize: '13px',
                fontWeight: designTokens.typography.fontWeight.medium,
                color: designTokens.colors.text.secondary,
                marginBottom: designTokens.spacing.xs,
              }}>
                <Phone size={14} />
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                disabled={!isEditing}
                style={{
                  width: '100%',
                  padding: `${designTokens.spacing.sm} ${designTokens.spacing.md}`,
                  backgroundColor: isEditing ? designTokens.colors.chat.elevated : designTokens.colors.sidebar.surface,
                  border: `1px solid ${designTokens.colors.sidebar.border}`,
                  borderRadius: designTokens.radius.md,
                  color: designTokens.colors.text.primary,
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
            </div>
          </div>
        </div>

        {/* Portfolio Stats */}
        <div style={{
          backgroundColor: designTokens.colors.chat.surface,
          borderRadius: designTokens.radius.md,
          padding: designTokens.spacing.lg,
          border: `1px solid ${designTokens.colors.sidebar.border}`,
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: designTokens.typography.fontWeight.semibold,
            color: designTokens.colors.text.primary,
            marginBottom: designTokens.spacing.md,
          }}>
            Portfolio Stats
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: designTokens.spacing.md }}>
            <StatItem icon={<TrendingUp size={18} />} label="Properties Analyzed" value={stats.propertiesAnalyzed.toString()} />
            <StatItem icon={<FileText size={18} />} label="Reports Generated" value={stats.reportsGenerated.toString()} />
            <StatItem icon={<Home size={18} />} label="Shortlisted" value={stats.shortlisted.toString()} />
            <StatItem icon={<Calendar size={18} />} label="Member Since" value={stats.memberSince} />
          </div>
        </div>

        {/* Investment Criteria */}
        <div style={{
          backgroundColor: designTokens.colors.chat.surface,
          borderRadius: designTokens.radius.md,
          padding: designTokens.spacing.lg,
          border: `1px solid ${designTokens.colors.sidebar.border}`,
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: designTokens.typography.fontWeight.semibold,
            color: designTokens.colors.text.primary,
            marginBottom: designTokens.spacing.md,
          }}>
            Investment Criteria
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: designTokens.spacing.md }}>
            {/* Min ROI */}
            <div>
              <label style={{
                fontSize: '13px',
                fontWeight: designTokens.typography.fontWeight.medium,
                color: designTokens.colors.text.secondary,
                marginBottom: designTokens.spacing.xs,
                display: 'block',
              }}>
                Minimum ROI
              </label>
              <input
                type="number"
                value={formData.minROI}
                onChange={(e) => setFormData({ ...formData, minROI: Number(e.target.value) })}
                disabled={!isEditing}
                style={{
                  width: '100%',
                  padding: `${designTokens.spacing.sm} ${designTokens.spacing.md}`,
                  backgroundColor: isEditing ? designTokens.colors.chat.elevated : designTokens.colors.sidebar.surface,
                  border: `1px solid ${designTokens.colors.sidebar.border}`,
                  borderRadius: designTokens.radius.md,
                  color: designTokens.colors.text.primary,
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
            </div>

            {/* Max Price */}
            <div>
              <label style={{
                fontSize: '13px',
                fontWeight: designTokens.typography.fontWeight.medium,
                color: designTokens.colors.text.secondary,
                marginBottom: designTokens.spacing.xs,
                display: 'block',
              }}>
                Maximum Price
              </label>
              <input
                type="number"
                value={formData.maxPrice}
                onChange={(e) => setFormData({ ...formData, maxPrice: Number(e.target.value) })}
                disabled={!isEditing}
                style={{
                  width: '100%',
                  padding: `${designTokens.spacing.sm} ${designTokens.spacing.md}`,
                  backgroundColor: isEditing ? designTokens.colors.chat.elevated : designTokens.colors.sidebar.surface,
                  border: `1px solid ${designTokens.colors.sidebar.border}`,
                  borderRadius: designTokens.radius.md,
                  color: designTokens.colors.text.primary,
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
            </div>

            {/* Preferred Markets */}
            <div>
              <label style={{
                fontSize: '13px',
                fontWeight: designTokens.typography.fontWeight.medium,
                color: designTokens.colors.text.secondary,
                marginBottom: designTokens.spacing.xs,
                display: 'block',
              }}>
                Preferred Markets
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: designTokens.spacing.xs }}>
                {formData.preferredMarkets.map((market, index) => (
                  <span
                    key={index}
                    style={{
                      padding: `${designTokens.spacing.xs} ${designTokens.spacing.sm}`,
                      backgroundColor: designTokens.colors.brand.subtle,
                      color: designTokens.colors.brand.light,
                      borderRadius: designTokens.radius.pill,
                      fontSize: '12px',
                      fontWeight: designTokens.typography.fontWeight.medium,
                    }}
                  >
                    {market}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper Component
const StatItem: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: designTokens.spacing.sm,
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
      flexShrink: 0,
    }}>
      {icon}
    </div>
    <div style={{ flex: 1 }}>
      <div style={{
        fontSize: '13px',
        color: designTokens.colors.text.tertiary,
        marginBottom: '2px',
      }}>
        {label}
      </div>
      <div style={{
        fontSize: '17px',
        fontWeight: designTokens.typography.fontWeight.semibold,
        color: designTokens.colors.text.primary,
      }}>
        {value}
      </div>
    </div>
  </div>
);
