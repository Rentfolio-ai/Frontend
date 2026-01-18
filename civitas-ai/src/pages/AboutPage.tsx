/**
 * About Vasthu Page
 * Company information, mission, and team
 */

import React from 'react';
import { ArrowLeft, Target, Users, Zap, TrendingUp, Award, Globe } from 'lucide-react';
import { designTokens } from '../styles/design-tokens';

interface AboutPageProps {
  onBack?: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onBack }) => {
  const values = [
    {
      icon: <Target size={24} />,
      title: 'Accuracy First',
      description: 'We use real-time data and advanced algorithms to provide the most accurate property analyses possible.',
    },
    {
      icon: <Zap size={24} />,
      title: 'AI-Powered',
      description: 'Our AI assistant learns from millions of data points to give you personalized investment recommendations.',
    },
    {
      icon: <Users size={24} />,
      title: 'Investor-Focused',
      description: 'Built by investors, for investors. We understand the challenges of real estate investing.',
    },
  ];

  const stats = [
    { label: 'Properties Analyzed', value: '1M+' },
    { label: 'Active Investors', value: '50K+' },
    { label: 'Total Invested', value: '$2.5B+' },
    { label: 'Markets Covered', value: '500+' },
  ];

  const milestones = [
    { year: '2023', event: 'Vasthu founded', description: 'Started with a vision to democratize real estate investing' },
    { year: '2023', event: 'Beta Launch', description: 'Released beta to 100 early investors' },
    { year: '2024', event: 'AI Integration', description: 'Launched ProphetAtlas AI assistant' },
    { year: '2024', event: 'Series A', description: 'Raised $10M to scale platform' },
    { year: '2025', event: '50K Users', description: 'Reached 50,000 active investors' },
    { year: '2026', event: 'Global Expansion', description: 'Expanding to international markets' },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: designTokens.colors.chat.bg,
      padding: `${designTokens.spacing.xl} ${designTokens.spacing.lg}`,
    }}>
      {/* Header */}
      <div style={{
        maxWidth: '1000px',
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
          About Vasthu
        </h1>
        <p style={{
          fontSize: '15px',
          color: designTokens.colors.text.tertiary,
          margin: 0,
        }}>
          Empowering investors with AI-driven real estate intelligence
        </p>
      </div>

      {/* Content */}
      <div style={{
        maxWidth: '1000px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: designTokens.spacing.xl,
      }}>
        {/* Mission */}
        <div style={{
          backgroundColor: designTokens.colors.chat.surface,
          borderRadius: designTokens.radius.md,
          padding: designTokens.spacing.xl,
          border: `1px solid ${designTokens.colors.sidebar.border}`,
        }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: designTokens.typography.fontWeight.semibold,
            color: designTokens.colors.text.primary,
            marginBottom: designTokens.spacing.md,
          }}>
            Our Mission
          </h2>
          <p style={{
            fontSize: '16px',
            color: designTokens.colors.text.secondary,
            lineHeight: 1.8,
            margin: 0,
          }}>
            Vasthu was born from a simple observation: real estate investing is incredibly data-driven, yet most investors rely on gut feeling and outdated spreadsheets. We believe every investor deserves access to institutional-grade analysis tools powered by cutting-edge AI.
            <br /><br />
            Our mission is to democratize real estate intelligence, making it accessible, affordable, and actionable for investors of all experience levels. From first-time buyers to seasoned portfolios, we help you make smarter, data-backed decisions.
          </p>
        </div>

        {/* Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: designTokens.spacing.md,
        }}>
          {stats.map((stat, index) => (
            <div
              key={index}
              style={{
                backgroundColor: designTokens.colors.chat.surface,
                borderRadius: designTokens.radius.md,
                padding: designTokens.spacing.lg,
                border: `1px solid ${designTokens.colors.sidebar.border}`,
                textAlign: 'center',
              }}
            >
              <div style={{
                fontSize: '36px',
                fontWeight: designTokens.typography.fontWeight.bold,
                color: designTokens.colors.brand.light,
                marginBottom: designTokens.spacing.xs,
              }}>
                {stat.value}
              </div>
              <div style={{
                fontSize: '14px',
                color: designTokens.colors.text.tertiary,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Values */}
        <div style={{
          backgroundColor: designTokens.colors.chat.surface,
          borderRadius: designTokens.radius.md,
          padding: designTokens.spacing.xl,
          border: `1px solid ${designTokens.colors.sidebar.border}`,
        }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: designTokens.typography.fontWeight.semibold,
            color: designTokens.colors.text.primary,
            marginBottom: designTokens.spacing.lg,
          }}>
            Our Values
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: designTokens.spacing.lg,
          }}>
            {values.map((value, index) => (
              <div key={index}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: designTokens.radius.md,
                  backgroundColor: designTokens.colors.brand.subtle,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: designTokens.colors.brand.light,
                  marginBottom: designTokens.spacing.md,
                }}>
                  {value.icon}
                </div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: designTokens.typography.fontWeight.semibold,
                  color: designTokens.colors.text.primary,
                  marginBottom: designTokens.spacing.xs,
                }}>
                  {value.title}
                </h3>
                <p style={{
                  fontSize: '14px',
                  color: designTokens.colors.text.secondary,
                  lineHeight: 1.6,
                  margin: 0,
                }}>
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div style={{
          backgroundColor: designTokens.colors.chat.surface,
          borderRadius: designTokens.radius.md,
          padding: designTokens.spacing.xl,
          border: `1px solid ${designTokens.colors.sidebar.border}`,
        }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: designTokens.typography.fontWeight.semibold,
            color: designTokens.colors.text.primary,
            marginBottom: designTokens.spacing.lg,
          }}>
            Our Journey
          </h2>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: designTokens.spacing.lg,
          }}>
            {milestones.map((milestone, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  gap: designTokens.spacing.md,
                  position: 'relative',
                }}
              >
                {/* Timeline line */}
                {index < milestones.length - 1 && (
                  <div style={{
                    position: 'absolute',
                    left: '19px',
                    top: '40px',
                    bottom: '-24px',
                    width: '2px',
                    backgroundColor: designTokens.colors.sidebar.border,
                  }} />
                )}
                
                {/* Dot */}
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: designTokens.colors.brand.subtle,
                  border: `3px solid ${designTokens.colors.brand.primary}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  zIndex: 1,
                }}>
                  <div style={{
                    fontSize: '11px',
                    fontWeight: designTokens.typography.fontWeight.bold,
                    color: designTokens.colors.brand.light,
                  }}>
                    {milestone.year}
                  </div>
                </div>

                {/* Content */}
                <div style={{ flex: 1, paddingTop: '4px' }}>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: designTokens.typography.fontWeight.semibold,
                    color: designTokens.colors.text.primary,
                    marginBottom: '4px',
                  }}>
                    {milestone.event}
                  </div>
                  <div style={{
                    fontSize: '14px',
                    color: designTokens.colors.text.tertiary,
                  }}>
                    {milestone.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team/Contact CTA */}
        <div style={{
          backgroundColor: designTokens.colors.chat.surface,
          borderRadius: designTokens.radius.md,
          padding: designTokens.spacing.xl,
          border: `1px solid ${designTokens.colors.sidebar.border}`,
          textAlign: 'center',
        }}>
          <Globe size={48} style={{ color: designTokens.colors.brand.light, margin: '0 auto', marginBottom: designTokens.spacing.md }} />
          <h2 style={{
            fontSize: '24px',
            fontWeight: designTokens.typography.fontWeight.semibold,
            color: designTokens.colors.text.primary,
            marginBottom: designTokens.spacing.sm,
          }}>
            Join Us on Our Journey
          </h2>
          <p style={{
            fontSize: '15px',
            color: designTokens.colors.text.secondary,
            lineHeight: 1.6,
            marginBottom: designTokens.spacing.lg,
            maxWidth: '600px',
            margin: '0 auto',
            marginBottom: designTokens.spacing.lg,
          }}>
            We're always looking for talented individuals who share our passion for real estate and technology. Interested in joining the team or partnering with us?
          </p>
          <div style={{
            display: 'flex',
            gap: designTokens.spacing.md,
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}>
            <button
              style={{
                padding: `${designTokens.spacing.sm} ${designTokens.spacing.lg}`,
                backgroundColor: designTokens.colors.brand.primary,
                color: '#FFFFFF',
                border: 'none',
                borderRadius: designTokens.radius.md,
                fontSize: '14px',
                fontWeight: designTokens.typography.fontWeight.semibold,
                cursor: 'pointer',
              }}
            >
              View Careers
            </button>
            <button
              style={{
                padding: `${designTokens.spacing.sm} ${designTokens.spacing.lg}`,
                backgroundColor: 'transparent',
                color: designTokens.colors.brand.primary,
                border: `1px solid ${designTokens.colors.brand.primary}`,
                borderRadius: designTokens.radius.md,
                fontSize: '14px',
                fontWeight: designTokens.typography.fontWeight.semibold,
                cursor: 'pointer',
              }}
            >
              Partner With Us
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
