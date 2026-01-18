/**
 * Portfolio Demo - Real Estate Health Profile (Warm & Visual)
 * 
 * Balance between health profile structure and real estate warmth:
 * - Health profile sections (ProphetAtlas upfront, health summary, alerts)
 * - Property photos as hero (large, beautiful, prominent)
 * - Warm neutral palette (not clinical, not dark)
 * - Human, approachable feel
 */

import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Home, 
  DollarSign,
  AlertCircle,
  Sparkles,
  MapPin,
  Calendar,
  Users,
  Activity
} from 'lucide-react';
import { portfolioTokens as tokens } from '../../styles/design-tokens-portfolio';

export const PortfolioDemo: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [hoveredProperty, setHoveredProperty] = useState<string | null>(null);

  // User info
  const user = {
    name: 'John Anderson',
    joinedDate: 'March 2019',
    healthScore: 87,
  };

  // Quick health metrics (small cards)
  const healthMetrics = [
    { label: 'Monthly Cash Flow', value: '$4,847', change: '+12.5%', status: 'good' },
    { label: 'Occupancy Rate', value: '85%', change: '+3.2%', status: 'good' },
    { label: 'Portfolio Value', value: '$2.1M', change: '+5.7%', status: 'excellent' },
  ];

  // Properties with photos
  const properties = [
    {
      id: '1',
      name: 'Skyline Apartments',
      address: '123 Downtown Ave',
      city: 'Austin',
      state: 'TX',
      imageUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&q=80',
      status: 'Excellent',
      statusColor: tokens.colors.semantic.success,
      monthlyRent: '$4,500',
      cashFlow: '+$847',
      occupancy: '100%',
      tenants: '8/8',
    },
    {
      id: '2',
      name: 'Harbor View Condos',
      address: '456 Waterfront Blvd',
      city: 'Miami',
      state: 'FL',
      imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80',
      status: 'Good',
      statusColor: tokens.colors.semantic.info,
      monthlyRent: '$5,200',
      cashFlow: '+$623',
      occupancy: '83%',
      tenants: '5/6',
    },
    {
      id: '3',
      name: 'Suburban Estates',
      address: '789 Oak Street',
      city: 'Dallas',
      state: 'TX',
      imageUrl: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=1200&q=80',
      status: 'Needs Attention',
      statusColor: tokens.colors.semantic.warning,
      monthlyRent: '$2,800',
      cashFlow: '-$120',
      occupancy: '0%',
      tenants: '0/1',
    },
    {
      id: '4',
      name: 'Downtown Lofts',
      address: '321 Main Street',
      city: 'Austin',
      state: 'TX',
      imageUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=80',
      status: 'Good',
      statusColor: tokens.colors.semantic.info,
      monthlyRent: '$3,200',
      cashFlow: '+$445',
      occupancy: '100%',
      tenants: '2/2',
    },
  ];

  // Alerts
  const alerts = [
    { type: 'warning', message: 'Suburban Estates has been vacant for 45 days. Consider price adjustment.' },
    { type: 'info', message: 'Insurance renewal for 2 properties due in 30 days.' },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: tokens.colors.bg.app,
      padding: `${tokens.spacing.xxl} ${tokens.spacing.xl}`,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: tokens.spacing.xl,
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}>
          <div>
            <h1 style={{
              fontSize: tokens.typography.fontSize.xxxl,
              fontWeight: tokens.typography.fontWeight.bold,
              color: tokens.colors.text.primary,
              margin: 0,
              marginBottom: '8px',
              letterSpacing: tokens.typography.letterSpacing.tight,
              lineHeight: tokens.typography.lineHeight.tight,
            }}>
              {user.name}
            </h1>
            <p style={{
              fontSize: tokens.typography.fontSize.base,
              color: tokens.colors.text.tertiary,
              margin: 0,
            }}>
              Investor since {user.joinedDate}
            </p>
          </div>

          {/* Health Score Badge */}
          <div style={{
            padding: tokens.spacing.lg,
            backgroundColor: tokens.colors.bg.primary,
            border: `2px solid ${tokens.colors.brand.primary}`,
            borderRadius: tokens.border.radius.xl,
            textAlign: 'center',
            minWidth: '120px',
            boxShadow: tokens.shadow.sm,
          }}>
            <div style={{
              fontSize: tokens.typography.fontSize.xs,
              color: tokens.colors.text.tertiary,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '6px',
            }}>
              Portfolio Health
            </div>
            <div style={{
              fontSize: tokens.typography.fontSize.xxl,
              fontWeight: tokens.typography.fontWeight.bold,
              color: tokens.colors.brand.primary,
              lineHeight: 1,
            }}>
              {user.healthScore}
            </div>
          </div>
        </div>

        {/* ProphetAtlas Assistant Card - UPFRONT */}
        <div style={{
          padding: tokens.spacing.xl,
          backgroundColor: tokens.colors.bg.primary,
          border: `1px solid ${tokens.colors.border.default}`,
          borderRadius: tokens.border.radius.xl,
          boxShadow: tokens.shadow.md,
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '20px',
            marginBottom: tokens.spacing.lg,
          }}>
            {/* Avatar */}
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: tokens.border.radius.lg,
              background: `linear-gradient(135deg, ${tokens.colors.brand.primary} 0%, ${tokens.colors.brand.primaryHover} 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: tokens.shadow.md,
            }}>
              <Activity size={32} style={{ color: '#fff' }} strokeWidth={2.5} />
            </div>

            <div style={{ flex: 1 }}>
              <h2 style={{
                fontSize: tokens.typography.fontSize.xl,
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.text.primary,
                margin: 0,
                marginBottom: '8px',
              }}>
                ProphetAtlas
              </h2>
              <p style={{
                fontSize: tokens.typography.fontSize.base,
                color: tokens.colors.text.secondary,
                margin: 0,
                lineHeight: tokens.typography.lineHeight.relaxed,
              }}>
                Hi John! Your portfolio is performing well. I've noticed Suburban Estates needs attention - it's been vacant for 45 days. I can help you analyze pricing or find similar performing properties in Dallas. What would you like to know?
              </p>
            </div>
          </div>

          {/* Input */}
          <div style={{
            display: 'flex',
            gap: '12px',
          }}>
            <input
              type="text"
              placeholder="Ask ProphetAtlas anything..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              style={{
                flex: 1,
                padding: '14px 18px',
                fontSize: tokens.typography.fontSize.base,
                color: tokens.colors.text.primary,
                backgroundColor: tokens.colors.bg.secondary,
                border: `1px solid ${tokens.colors.border.default}`,
                borderRadius: tokens.border.radius.md,
                outline: 'none',
                transition: `all ${tokens.transition.fast}`,
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = tokens.colors.brand.primary;
                e.currentTarget.style.backgroundColor = tokens.colors.bg.primary;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = tokens.colors.border.default;
                e.currentTarget.style.backgroundColor = tokens.colors.bg.secondary;
              }}
            />
            <button
              style={{
                padding: '14px 28px',
                fontSize: tokens.typography.fontSize.base,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: '#fff',
                backgroundColor: tokens.colors.brand.primary,
                border: 'none',
                borderRadius: tokens.border.radius.md,
                cursor: 'pointer',
                transition: `all ${tokens.transition.fast}`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = tokens.colors.brand.primaryHover;
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = tokens.shadow.md;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = tokens.colors.brand.primary;
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              Send
            </button>
          </div>
        </div>

        {/* Quick Health Metrics - Small cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: tokens.spacing.md,
        }}>
          {healthMetrics.map((metric, index) => (
            <div
              key={index}
              style={{
                padding: tokens.spacing.lg,
                backgroundColor: tokens.colors.bg.primary,
                border: `1px solid ${tokens.colors.border.default}`,
                borderRadius: tokens.border.radius.lg,
                boxShadow: tokens.shadow.sm,
              }}
            >
              <div style={{
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.text.tertiary,
                marginBottom: '8px',
              }}>
                {metric.label}
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'baseline',
                justifyContent: 'space-between',
              }}>
                <div style={{
                  fontSize: tokens.typography.fontSize.xl,
                  fontWeight: tokens.typography.fontWeight.bold,
                  color: tokens.colors.text.primary,
                }}>
                  {metric.value}
                </div>
                <div style={{
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.semantic.success,
                }}>
                  {metric.change}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Your Properties - HERO SECTION WITH PHOTOS */}
        <div>
          <h2 style={{
            fontSize: tokens.typography.fontSize.xl,
            fontWeight: tokens.typography.fontWeight.bold,
            color: tokens.colors.text.primary,
            marginBottom: tokens.spacing.lg,
          }}>
            Your Properties
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: tokens.spacing.lg,
          }}>
            {properties.map((property) => (
              <div
                key={property.id}
                onMouseEnter={() => setHoveredProperty(property.id)}
                onMouseLeave={() => setHoveredProperty(null)}
                style={{
                  backgroundColor: tokens.colors.bg.primary,
                  borderRadius: tokens.border.radius.xl,
                  overflow: 'hidden',
                  boxShadow: hoveredProperty === property.id ? tokens.shadow.xl : tokens.shadow.md,
                  transition: `all ${tokens.transition.normal}`,
                  transform: hoveredProperty === property.id ? 'translateY(-4px)' : 'translateY(0)',
                  cursor: 'pointer',
                }}
              >
                {/* Property Image */}
                <div style={{
                  position: 'relative',
                  height: '240px',
                  overflow: 'hidden',
                }}>
                  <img
                    src={property.imageUrl}
                    alt={property.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: `transform ${tokens.transition.slow}`,
                      transform: hoveredProperty === property.id ? 'scale(1.05)' : 'scale(1)',
                    }}
                  />
                  
                  {/* Status Badge Overlay */}
                  <div style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    padding: '6px 14px',
                    borderRadius: tokens.border.radius.full,
                    backgroundColor: property.statusColor,
                    color: '#fff',
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    boxShadow: tokens.shadow.md,
                  }}>
                    {property.status}
                  </div>

                  {/* Location Tag */}
                  <div style={{
                    position: 'absolute',
                    bottom: '16px',
                    left: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    borderRadius: tokens.border.radius.md,
                    backgroundColor: tokens.colors.overlay.darker,
                    backdropFilter: 'blur(8px)',
                  }}>
                    <MapPin size={14} style={{ color: '#fff' }} />
                    <span style={{
                      fontSize: tokens.typography.fontSize.sm,
                      color: '#fff',
                      fontWeight: tokens.typography.fontWeight.medium,
                    }}>
                      {property.city}, {property.state}
                    </span>
                  </div>
                </div>

                {/* Property Details */}
                <div style={{ padding: tokens.spacing.lg }}>
                  <h3 style={{
                    fontSize: tokens.typography.fontSize.lg,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: tokens.colors.text.primary,
                    margin: 0,
                    marginBottom: '6px',
                  }}>
                    {property.name}
                  </h3>
                  <p style={{
                    fontSize: tokens.typography.fontSize.sm,
                    color: tokens.colors.text.tertiary,
                    margin: 0,
                    marginBottom: tokens.spacing.md,
                  }}>
                    {property.address}
                  </p>

                  {/* Metrics */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '12px',
                    padding: '16px',
                    backgroundColor: tokens.colors.bg.secondary,
                    borderRadius: tokens.border.radius.md,
                  }}>
                    <div>
                      <div style={{
                        fontSize: tokens.typography.fontSize.xs,
                        color: tokens.colors.text.tertiary,
                        marginBottom: '4px',
                      }}>
                        Monthly Rent
                      </div>
                      <div style={{
                        fontSize: tokens.typography.fontSize.base,
                        fontWeight: tokens.typography.fontWeight.semibold,
                        color: tokens.colors.text.primary,
                      }}>
                        {property.monthlyRent}
                      </div>
                    </div>

                    <div>
                      <div style={{
                        fontSize: tokens.typography.fontSize.xs,
                        color: tokens.colors.text.tertiary,
                        marginBottom: '4px',
                      }}>
                        Cash Flow
                      </div>
                      <div style={{
                        fontSize: tokens.typography.fontSize.base,
                        fontWeight: tokens.typography.fontWeight.semibold,
                        color: property.cashFlow.startsWith('+') 
                          ? tokens.colors.semantic.success 
                          : tokens.colors.semantic.error,
                      }}>
                        {property.cashFlow}
                      </div>
                    </div>

                    <div>
                      <div style={{
                        fontSize: tokens.typography.fontSize.xs,
                        color: tokens.colors.text.tertiary,
                        marginBottom: '4px',
                      }}>
                        Occupancy
                      </div>
                      <div style={{
                        fontSize: tokens.typography.fontSize.base,
                        fontWeight: tokens.typography.fontWeight.semibold,
                        color: tokens.colors.text.primary,
                      }}>
                        {property.occupancy}
                      </div>
                    </div>

                    <div>
                      <div style={{
                        fontSize: tokens.typography.fontSize.xs,
                        color: tokens.colors.text.tertiary,
                        marginBottom: '4px',
                      }}>
                        Tenants
                      </div>
                      <div style={{
                        fontSize: tokens.typography.fontSize.base,
                        fontWeight: tokens.typography.fontWeight.semibold,
                        color: tokens.colors.text.primary,
                      }}>
                        {property.tenants}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts & Recommendations */}
        {alerts.length > 0 && (
          <div style={{
            padding: tokens.spacing.lg,
            backgroundColor: tokens.colors.bg.primary,
            border: `1px solid ${tokens.colors.border.default}`,
            borderRadius: tokens.border.radius.lg,
            boxShadow: tokens.shadow.sm,
          }}>
            <h3 style={{
              fontSize: tokens.typography.fontSize.lg,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.text.primary,
              margin: 0,
              marginBottom: tokens.spacing.md,
            }}>
              Alerts & Recommendations
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {alerts.map((alert, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    backgroundColor: alert.type === 'warning' 
                      ? tokens.colors.semantic.warningSubtle 
                      : tokens.colors.semantic.infoSubtle,
                    border: `1px solid ${alert.type === 'warning' 
                      ? tokens.colors.semantic.warning 
                      : tokens.colors.semantic.info}`,
                    borderRadius: tokens.border.radius.md,
                  }}
                >
                  <AlertCircle 
                    size={18} 
                    style={{ 
                      color: alert.type === 'warning' 
                        ? tokens.colors.semantic.warning 
                        : tokens.colors.semantic.info,
                      flexShrink: 0,
                    }} 
                  />
                  <span style={{
                    fontSize: tokens.typography.fontSize.base,
                    color: tokens.colors.text.secondary,
                  }}>
                    {alert.message}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
