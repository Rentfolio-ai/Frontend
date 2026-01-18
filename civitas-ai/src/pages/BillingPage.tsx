/**
 * Billing & Subscription Page
 * Manage subscription plans, payment methods, and billing history
 */

import React, { useState } from 'react';
import { ArrowLeft, CreditCard, Check, Calendar, Download, AlertCircle } from 'lucide-react';
import { designTokens } from '../styles/design-tokens';

interface Plan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  popular?: boolean;
}

interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  downloadUrl?: string;
}

const plans: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 29,
    interval: 'month',
    features: [
      '10 property analyses per month',
      'Basic market data',
      'Email support',
      'Standard reports',
      'Portfolio tracking (up to 5 properties)',
    ],
  },
  {
    id: 'pro',
    name: 'Professional',
    price: 79,
    interval: 'month',
    popular: true,
    features: [
      'Unlimited property analyses',
      'Advanced market data & trends',
      'Priority email & chat support',
      'Premium reports with custom branding',
      'Unlimited portfolio tracking',
      'Property comparison tool',
      'AI recommendations',
      'Export to Excel/PDF',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 199,
    interval: 'month',
    features: [
      'Everything in Professional',
      'API access',
      'White-label reports',
      'Dedicated account manager',
      'Custom integrations',
      'Team collaboration (up to 10 users)',
      'Advanced analytics',
      'Priority phone support',
    ],
  },
];

const mockInvoices: Invoice[] = [
  {
    id: 'inv-2025-01',
    date: 'January 15, 2025',
    amount: 79,
    status: 'paid',
  },
  {
    id: 'inv-2024-12',
    date: 'December 15, 2024',
    amount: 79,
    status: 'paid',
  },
  {
    id: 'inv-2024-11',
    date: 'November 15, 2024',
    amount: 79,
    status: 'paid',
  },
];

interface BillingPageProps {
  onBack?: () => void;
}

export const BillingPage: React.FC<BillingPageProps> = ({ onBack }) => {
  const [currentPlan] = useState<string>('pro');
  const [billingInterval, setBillingInterval] = useState<'month' | 'year'>('month');

  const getStatusBadge = (status: Invoice['status']) => {
    const styles = {
      paid: { bg: designTokens.colors.semantic.successSubtle, color: designTokens.colors.semantic.success },
      pending: { bg: 'rgba(251, 191, 36, 0.12)', color: '#FBBF24' },
      failed: { bg: designTokens.colors.semantic.errorSubtle, color: designTokens.colors.semantic.error },
    };

    return (
      <span style={{
        padding: `4px ${designTokens.spacing.xs}`,
        backgroundColor: styles[status].bg,
        color: styles[status].color,
        borderRadius: designTokens.radius.sm,
        fontSize: '11px',
        fontWeight: designTokens.typography.fontWeight.semibold,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
      }}>
        {status}
      </span>
    );
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
        <h1 style={{
          fontSize: '32px',
          fontWeight: designTokens.typography.fontWeight.semibold,
          color: designTokens.colors.text.primary,
          marginBottom: designTokens.spacing.sm,
        }}>
          Billing & Subscription
        </h1>
        <p style={{
          fontSize: '15px',
          color: designTokens.colors.text.tertiary,
          margin: 0,
        }}>
          Manage your subscription, payment methods, and billing history
        </p>
      </div>

      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: designTokens.spacing.xl,
      }}>
        {/* Current Subscription */}
        <div style={{
          backgroundColor: designTokens.colors.chat.surface,
          borderRadius: designTokens.radius.md,
          padding: designTokens.spacing.lg,
          border: `1px solid ${designTokens.colors.sidebar.border}`,
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: designTokens.spacing.md,
          }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: designTokens.typography.fontWeight.semibold,
              color: designTokens.colors.text.primary,
              margin: 0,
            }}>
              Current Plan
            </h2>
            <span style={{
              padding: `${designTokens.spacing.xs} ${designTokens.spacing.md}`,
              backgroundColor: designTokens.colors.brand.subtle,
              color: designTokens.colors.brand.light,
              borderRadius: designTokens.radius.pill,
              fontSize: '12px',
              fontWeight: designTokens.typography.fontWeight.semibold,
            }}>
              Active
            </span>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: designTokens.spacing.md,
            backgroundColor: designTokens.colors.chat.elevated,
            borderRadius: designTokens.radius.md,
          }}>
            <div>
              <div style={{
                fontSize: '24px',
                fontWeight: designTokens.typography.fontWeight.bold,
                color: designTokens.colors.text.primary,
                marginBottom: '4px',
              }}>
                Professional Plan
              </div>
              <div style={{
                fontSize: '14px',
                color: designTokens.colors.text.tertiary,
              }}>
                $79/month • Renews on February 15, 2026
              </div>
            </div>
            <button
              style={{
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
              Manage Subscription
            </button>
          </div>
        </div>

        {/* Billing Interval Toggle */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: designTokens.spacing.xs,
          padding: designTokens.spacing.sm,
          backgroundColor: designTokens.colors.chat.surface,
          borderRadius: designTokens.radius.pill,
          width: 'fit-content',
          margin: '0 auto',
        }}>
          <button
            onClick={() => setBillingInterval('month')}
            style={{
              padding: `${designTokens.spacing.xs} ${designTokens.spacing.md}`,
              backgroundColor: billingInterval === 'month' ? designTokens.colors.brand.primary : 'transparent',
              color: billingInterval === 'month' ? '#FFFFFF' : designTokens.colors.text.secondary,
              border: 'none',
              borderRadius: designTokens.radius.pill,
              fontSize: '14px',
              fontWeight: designTokens.typography.fontWeight.medium,
              cursor: 'pointer',
              transition: `all ${designTokens.transition.fast}`,
            }}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingInterval('year')}
            style={{
              padding: `${designTokens.spacing.xs} ${designTokens.spacing.md}`,
              backgroundColor: billingInterval === 'year' ? designTokens.colors.brand.primary : 'transparent',
              color: billingInterval === 'year' ? '#FFFFFF' : designTokens.colors.text.secondary,
              border: 'none',
              borderRadius: designTokens.radius.pill,
              fontSize: '14px',
              fontWeight: designTokens.typography.fontWeight.medium,
              cursor: 'pointer',
              transition: `all ${designTokens.transition.fast}`,
              display: 'flex',
              alignItems: 'center',
              gap: designTokens.spacing.xs,
            }}
          >
            Yearly
            <span style={{
              padding: '2px 6px',
              backgroundColor: designTokens.colors.semantic.successSubtle,
              color: designTokens.colors.semantic.success,
              borderRadius: designTokens.radius.sm,
              fontSize: '10px',
              fontWeight: designTokens.typography.fontWeight.bold,
            }}>
              Save 20%
            </span>
          </button>
        </div>

        {/* Plans */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: designTokens.spacing.md,
        }}>
          {plans.map((plan) => {
            const price = billingInterval === 'year' ? Math.round(plan.price * 12 * 0.8) : plan.price;
            const isCurrent = plan.id === currentPlan;

            return (
              <div
                key={plan.id}
                style={{
                  backgroundColor: designTokens.colors.chat.surface,
                  border: plan.popular 
                    ? `2px solid ${designTokens.colors.brand.primary}` 
                    : `1px solid ${designTokens.colors.sidebar.border}`,
                  borderRadius: designTokens.radius.md,
                  padding: designTokens.spacing.lg,
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {plan.popular && (
                  <div style={{
                    position: 'absolute',
                    top: '-12px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    padding: `4px ${designTokens.spacing.sm}`,
                    backgroundColor: designTokens.colors.brand.primary,
                    color: '#FFFFFF',
                    borderRadius: designTokens.radius.pill,
                    fontSize: '11px',
                    fontWeight: designTokens.typography.fontWeight.bold,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}>
                    Most Popular
                  </div>
                )}

                <div style={{
                  fontSize: '20px',
                  fontWeight: designTokens.typography.fontWeight.semibold,
                  color: designTokens.colors.text.primary,
                  marginBottom: designTokens.spacing.xs,
                }}>
                  {plan.name}
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: '4px',
                  marginBottom: designTokens.spacing.md,
                }}>
                  <span style={{
                    fontSize: '36px',
                    fontWeight: designTokens.typography.fontWeight.bold,
                    color: designTokens.colors.text.primary,
                  }}>
                    ${price}
                  </span>
                  <span style={{
                    fontSize: '14px',
                    color: designTokens.colors.text.tertiary,
                  }}>
                    /{billingInterval}
                  </span>
                </div>

                <div style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: designTokens.spacing.sm,
                  marginBottom: designTokens.spacing.lg,
                }}>
                  {plan.features.map((feature, index) => (
                    <div
                      key={index}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: designTokens.spacing.xs,
                      }}
                    >
                      <Check 
                        size={16} 
                        style={{ 
                          color: designTokens.colors.brand.primary, 
                          flexShrink: 0,
                          marginTop: '2px',
                        }} 
                      />
                      <span style={{
                        fontSize: '13px',
                        color: designTokens.colors.text.secondary,
                        lineHeight: 1.5,
                      }}>
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  disabled={isCurrent}
                  style={{
                    padding: `${designTokens.spacing.sm} ${designTokens.spacing.md}`,
                    backgroundColor: isCurrent 
                      ? designTokens.colors.chat.elevated 
                      : plan.popular 
                        ? designTokens.colors.brand.primary 
                        : 'transparent',
                    color: isCurrent 
                      ? designTokens.colors.text.tertiary 
                      : plan.popular 
                        ? '#FFFFFF' 
                        : designTokens.colors.brand.primary,
                    border: isCurrent 
                      ? `1px solid ${designTokens.colors.sidebar.border}` 
                      : plan.popular 
                        ? 'none' 
                        : `1px solid ${designTokens.colors.brand.primary}`,
                    borderRadius: designTokens.radius.md,
                    fontSize: '14px',
                    fontWeight: designTokens.typography.fontWeight.semibold,
                    cursor: isCurrent ? 'not-allowed' : 'pointer',
                    transition: `all ${designTokens.transition.fast}`,
                  }}
                >
                  {isCurrent ? 'Current Plan' : 'Upgrade'}
                </button>
              </div>
            );
          })}
        </div>

        {/* Payment Method */}
        <div style={{
          backgroundColor: designTokens.colors.chat.surface,
          borderRadius: designTokens.radius.md,
          padding: designTokens.spacing.lg,
          border: `1px solid ${designTokens.colors.sidebar.border}`,
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: designTokens.spacing.md,
          }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: designTokens.typography.fontWeight.semibold,
              color: designTokens.colors.text.primary,
              margin: 0,
            }}>
              Payment Method
            </h2>
            <button
              style={{
                padding: `${designTokens.spacing.xs} ${designTokens.spacing.md}`,
                backgroundColor: designTokens.colors.brand.primary,
                color: '#FFFFFF',
                border: 'none',
                borderRadius: designTokens.radius.md,
                fontSize: '13px',
                fontWeight: designTokens.typography.fontWeight.medium,
                cursor: 'pointer',
              }}
            >
              Update
            </button>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: designTokens.spacing.md,
            padding: designTokens.spacing.md,
            backgroundColor: designTokens.colors.chat.elevated,
            borderRadius: designTokens.radius.md,
          }}>
            <div style={{
              width: '48px',
              height: '32px',
              borderRadius: designTokens.radius.sm,
              backgroundColor: designTokens.colors.brand.subtle,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: designTokens.colors.brand.light,
            }}>
              <CreditCard size={20} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: '14px',
                fontWeight: designTokens.typography.fontWeight.medium,
                color: designTokens.colors.text.primary,
                marginBottom: '2px',
              }}>
                Visa ending in 4242
              </div>
              <div style={{
                fontSize: '12px',
                color: designTokens.colors.text.tertiary,
              }}>
                Expires 12/2027
              </div>
            </div>
          </div>
        </div>

        {/* Billing History */}
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
            Billing History
          </h2>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: designTokens.spacing.xs,
          }}>
            {mockInvoices.map((invoice) => (
              <div
                key={invoice.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: designTokens.spacing.md,
                  backgroundColor: designTokens.colors.chat.elevated,
                  borderRadius: designTokens.radius.md,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: designTokens.spacing.md }}>
                  <Calendar size={18} style={{ color: designTokens.colors.text.tertiary }} />
                  <div>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: designTokens.typography.fontWeight.medium,
                      color: designTokens.colors.text.primary,
                      marginBottom: '2px',
                    }}>
                      {invoice.date}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: designTokens.colors.text.tertiary,
                    }}>
                      Invoice #{invoice.id}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: designTokens.spacing.md }}>
                  <div style={{
                    fontSize: '15px',
                    fontWeight: designTokens.typography.fontWeight.semibold,
                    color: designTokens.colors.text.primary,
                  }}>
                    ${invoice.amount}
                  </div>
                  {getStatusBadge(invoice.status)}
                  <button
                    style={{
                      padding: designTokens.spacing.xs,
                      backgroundColor: 'transparent',
                      color: designTokens.colors.text.tertiary,
                      border: `1px solid ${designTokens.colors.sidebar.border}`,
                      borderRadius: designTokens.radius.sm,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <Download size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
