/**
 * Privacy Policy Page
 * Privacy policy and data protection information
 */

import React from 'react';
import { ArrowLeft, Shield, Eye, Lock, UserCheck, Database, Globe } from 'lucide-react';
import { designTokens } from '../styles/design-tokens';

interface PrivacyPageProps {
  onBack?: () => void;
}

export const PrivacyPage: React.FC<PrivacyPageProps> = ({ onBack }) => {
  const sections = [
    {
      icon: <Eye size={20} />,
      title: 'Information We Collect',
      content: `We collect information you provide directly to us, including:
      
• Account information (name, email, password)
• Property data you input for analysis
• Payment and billing information
• Communication preferences
• Usage data and analytics
      
We automatically collect certain information about your device and how you interact with our service, including IP address, browser type, and usage patterns.`,
    },
    {
      icon: <Database size={20} />,
      title: 'How We Use Your Information',
      content: `We use the information we collect to:
      
• Provide, maintain, and improve our services
• Process your property analyses and generate reports
• Send you important updates and notifications
• Respond to your questions and support requests
• Analyze usage patterns to improve user experience
• Detect and prevent fraud or security issues
• Comply with legal obligations
      
We never sell your personal information to third parties.`,
    },
    {
      icon: <Lock size={20} />,
      title: 'Data Security',
      content: `We take data security seriously and implement industry-standard measures to protect your information:
      
• All data is encrypted in transit using TLS 1.3
• Data at rest is encrypted using AES-256
• Regular security audits and penetration testing
• Access controls and authentication requirements
• Secure cloud infrastructure (AWS/GCP)
• SOC 2 Type II compliance
      
While we strive to protect your information, no system is completely secure. We encourage you to use strong passwords and enable two-factor authentication.`,
    },
    {
      icon: <Globe size={20} />,
      title: 'Data Sharing',
      content: `We may share your information with:
      
• Service providers who help us operate our platform (hosting, analytics, payment processing)
• Law enforcement when required by law or to protect rights and safety
• Business partners with your explicit consent
      
We require all third parties to respect the security of your data and treat it in accordance with the law. We do not allow our third-party service providers to use your personal data for their own purposes.`,
    },
    {
      icon: <UserCheck size={20} />,
      title: 'Your Rights',
      content: `You have the right to:
      
• Access your personal data
• Correct inaccurate data
• Delete your account and data
• Export your data
• Opt-out of marketing communications
• Object to certain processing activities
• Lodge a complaint with a data protection authority
      
To exercise these rights, contact us at privacy@vasthu.ai or through your account settings.`,
    },
    {
      icon: <Shield size={20} />,
      title: 'Compliance',
      content: `Vasthu is committed to compliance with global privacy regulations:
      
• GDPR (General Data Protection Regulation) - European Union
• CCPA (California Consumer Privacy Act) - California, USA
• SOC 2 Type II Certification
• PIPEDA (Personal Information Protection) - Canada
      
We regularly review and update our privacy practices to ensure ongoing compliance with evolving regulations.`,
    },
  ];

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
          Privacy Policy
        </h1>
        <p style={{
          fontSize: '15px',
          color: designTokens.colors.text.tertiary,
          margin: 0,
        }}>
          Last updated: January 17, 2026
        </p>
      </div>

      {/* Content */}
      <div style={{
        maxWidth: '900px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: designTokens.spacing.lg,
      }}>
        {/* Introduction */}
        <div style={{
          backgroundColor: designTokens.colors.chat.surface,
          borderRadius: designTokens.radius.md,
          padding: designTokens.spacing.lg,
          border: `1px solid ${designTokens.colors.sidebar.border}`,
        }}>
          <p style={{
            fontSize: '15px',
            color: designTokens.colors.text.secondary,
            lineHeight: 1.7,
            margin: 0,
          }}>
            At Vasthu, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform. Please read this policy carefully to understand our practices regarding your personal data.
          </p>
        </div>

        {/* Sections */}
        {sections.map((section, index) => (
          <div
            key={index}
            style={{
              backgroundColor: designTokens.colors.chat.surface,
              borderRadius: designTokens.radius.md,
              padding: designTokens.spacing.lg,
              border: `1px solid ${designTokens.colors.sidebar.border}`,
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: designTokens.spacing.sm,
              marginBottom: designTokens.spacing.md,
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
                {section.icon}
              </div>
              <h2 style={{
                fontSize: '20px',
                fontWeight: designTokens.typography.fontWeight.semibold,
                color: designTokens.colors.text.primary,
                margin: 0,
              }}>
                {section.title}
              </h2>
            </div>
            <div style={{
              fontSize: '14px',
              color: designTokens.colors.text.secondary,
              lineHeight: 1.7,
              whiteSpace: 'pre-line',
            }}>
              {section.content}
            </div>
          </div>
        ))}

        {/* Contact */}
        <div style={{
          backgroundColor: designTokens.colors.chat.surface,
          borderRadius: designTokens.radius.md,
          padding: designTokens.spacing.lg,
          border: `1px solid ${designTokens.colors.sidebar.border}`,
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: designTokens.typography.fontWeight.semibold,
            color: designTokens.colors.text.primary,
            marginBottom: designTokens.spacing.sm,
          }}>
            Questions or Concerns?
          </h3>
          <p style={{
            fontSize: '14px',
            color: designTokens.colors.text.secondary,
            lineHeight: 1.7,
            margin: 0,
          }}>
            If you have any questions about this Privacy Policy or our data practices, please contact us at{' '}
            <a
              href="mailto:privacy@vasthu.ai"
              style={{
                color: designTokens.colors.brand.light,
                textDecoration: 'none',
                fontWeight: designTokens.typography.fontWeight.medium,
              }}
            >
              privacy@vasthu.ai
            </a>
            {' '}or through our contact page.
          </p>
        </div>
      </div>
    </div>
  );
};
