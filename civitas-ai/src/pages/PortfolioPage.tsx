/**
 * Portfolio Page - Real Estate Health Profile
 * 
 * Fetches real portfolio data from backend API
 * Displays properties, metrics, and AI insights
 */

import React, { useState, useEffect } from 'react';
import { 
  AlertCircle,
  Activity,
  MapPin,
  Loader2,
  ArrowLeft
} from 'lucide-react';
import { portfolioTokens as tokens } from '../styles/design-tokens-portfolio';
import { api } from '../services/api';

interface HealthMetric {
  label: string;
  value: string;
  change: string;
  status: string;
}

interface Property {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  imageUrl: string;
  status: string;
  statusColor: string;
  monthlyRent: string;
  cashFlow: string;
  occupancy: string;
  tenants: string;
}

interface Alert {
  type: string;
  message: string;
}

interface PortfolioData {
  user: {
    name: string;
    email: string;
    joinedDate: string;
    healthScore: number;
  };
  healthMetrics: HealthMetric[];
  properties: Property[];
  alerts: Alert[];
}

interface PortfolioPageProps {
  onBack?: () => void;
}

export const PortfolioPage: React.FC<PortfolioPageProps> = ({ onBack }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<PortfolioData | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [hoveredProperty, setHoveredProperty] = useState<string | null>(null);

  useEffect(() => {
    fetchPortfolioData();
  }, []);

  const fetchPortfolioData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get<PortfolioData>('/api/portfolio/overview');
      setData(response.data);  // Extract data from response
    } catch (err) {
      console.error('Error fetching portfolio:', err);
      setError('Failed to load portfolio data');
    } finally {
      setLoading(false);
    }
  };

  const handleAskAI = () => {
    if (!inputValue.trim()) return;
    // Navigate to chat with pre-filled question
    window.location.href = `/?question=${encodeURIComponent(inputValue)}`;
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: tokens.colors.bg.app,
      }}>
        <div style={{
          textAlign: 'center',
          color: tokens.colors.text.tertiary,
        }}>
          <Loader2 size={48} style={{ animation: 'spin 1s linear infinite', marginBottom: '16px' }} />
          <p style={{ fontSize: tokens.typography.fontSize.lg }}>Loading your portfolio...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: tokens.colors.bg.app,
        padding: tokens.spacing.xl,
      }}>
        <div style={{
          textAlign: 'center',
          maxWidth: '500px',
        }}>
          <AlertCircle size={64} style={{ color: tokens.colors.semantic.error, marginBottom: '16px' }} />
          <h2 style={{
            fontSize: tokens.typography.fontSize.xl,
            fontWeight: tokens.typography.fontWeight.bold,
            color: tokens.colors.text.primary,
            marginBottom: '8px',
          }}>
            Unable to Load Portfolio
          </h2>
          <p style={{
            fontSize: tokens.typography.fontSize.base,
            color: tokens.colors.text.secondary,
            marginBottom: '24px',
          }}>
            {error || 'Something went wrong'}
          </p>
          <button
            onClick={fetchPortfolioData}
            style={{
              padding: '12px 24px',
              fontSize: tokens.typography.fontSize.base,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: '#fff',
              backgroundColor: tokens.colors.brand.primary,
              border: 'none',
              borderRadius: tokens.border.radius.md,
              cursor: 'pointer',
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const { user, healthMetrics, properties, alerts } = data;

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
        {/* Back Button */}
        {onBack && (
          <button
            onClick={onBack}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing.xs,
              padding: `${tokens.spacing.sm} ${tokens.spacing.md}`,
              backgroundColor: 'transparent',
              color: tokens.colors.text.secondary,
              border: 'none',
              borderRadius: tokens.border.radius.md,
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              alignSelf: 'flex-start',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = tokens.colors.brand.primary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = tokens.colors.text.secondary;
            }}
          >
            <ArrowLeft size={18} />
            Back
          </button>
        )}
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

        {/* ProphetAtlas Assistant Card */}
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
                {properties.length > 0 
                  ? `Hi ${user.name.split(' ')[0]}! Your portfolio is ${user.healthScore >= 80 ? 'performing well' : 'showing opportunities for improvement'}. ${alerts.length > 0 ? `I've identified ${alerts.length} item${alerts.length > 1 ? 's' : ''} that need attention.` : ''} What would you like to know?`
                  : `Hi ${user.name.split(' ')[0]}! Start building your portfolio by exploring properties and adding them to your shortlist. I can help you find great investment opportunities.`
                }
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
              onKeyPress={(e) => e.key === 'Enter' && handleAskAI()}
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
              onClick={handleAskAI}
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

        {/* Quick Health Metrics */}
        {healthMetrics.length > 0 && (
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
        )}

        {/* Properties Section */}
        {properties.length > 0 ? (
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
              gridTemplateColumns: 'repeat(auto-fill, minmax(500px, 1fr))',
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
                    
                    {/* Status Badge */}
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

                    {/* Metrics Grid */}
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
        ) : (
          <div style={{
            padding: tokens.spacing.xxxl,
            backgroundColor: tokens.colors.bg.primary,
            border: `1px solid ${tokens.colors.border.default}`,
            borderRadius: tokens.border.radius.xl,
            textAlign: 'center',
          }}>
            <h3 style={{
              fontSize: tokens.typography.fontSize.xl,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.text.primary,
              marginBottom: '12px',
            }}>
              No Properties Yet
            </h3>
            <p style={{
              fontSize: tokens.typography.fontSize.base,
              color: tokens.colors.text.tertiary,
              marginBottom: tokens.spacing.lg,
            }}>
              Start exploring properties and add them to your shortlist to build your portfolio.
            </p>
            <button
              onClick={() => window.location.href = '/'}
              style={{
                padding: '12px 24px',
                fontSize: tokens.typography.fontSize.base,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: '#fff',
                backgroundColor: tokens.colors.brand.primary,
                border: 'none',
                borderRadius: tokens.border.radius.md,
                cursor: 'pointer',
              }}
            >
              Explore Properties
            </button>
          </div>
        )}

        {/* Alerts */}
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
