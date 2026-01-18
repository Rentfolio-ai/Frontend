/**
 * Contact Support Page
 * Contact form and support resources
 */

import React, { useState } from 'react';
import { ArrowLeft, Mail, MessageSquare, Phone, Send, CheckCircle } from 'lucide-react';
import { designTokens } from '../styles/design-tokens';

interface ContactPageProps {
  onBack?: () => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ onBack }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Contact form submitted:', formData);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
        priority: 'medium',
      });
    }, 3000);
  };

  if (submitted) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: designTokens.colors.chat.bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: designTokens.spacing.lg,
      }}>
        <div style={{
          textAlign: 'center',
          maxWidth: '500px',
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: designTokens.colors.semantic.successSubtle,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto',
            marginBottom: designTokens.spacing.lg,
          }}>
            <CheckCircle size={40} style={{ color: designTokens.colors.semantic.success }} />
          </div>
          <h2 style={{
            fontSize: '28px',
            fontWeight: designTokens.typography.fontWeight.semibold,
            color: designTokens.colors.text.primary,
            marginBottom: designTokens.spacing.sm,
          }}>
            Message Sent!
          </h2>
          <p style={{
            fontSize: '15px',
            color: designTokens.colors.text.tertiary,
            lineHeight: 1.6,
          }}>
            Thank you for contacting us. We'll get back to you within 24 hours.
          </p>
        </div>
      </div>
    );
  }

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
          Contact Support
        </h1>
        <p style={{
          fontSize: '15px',
          color: designTokens.colors.text.tertiary,
          margin: 0,
        }}>
          Have a question or need help? We're here for you.
        </p>
      </div>

      <div style={{
        maxWidth: '900px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: designTokens.spacing.lg,
      }}>
        {/* Contact Methods */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: designTokens.spacing.md,
        }}>
          {/* Email */}
          <div style={{
            backgroundColor: designTokens.colors.chat.surface,
            borderRadius: designTokens.radius.md,
            padding: designTokens.spacing.lg,
            border: `1px solid ${designTokens.colors.sidebar.border}`,
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: designTokens.radius.md,
              backgroundColor: designTokens.colors.brand.subtle,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: designTokens.spacing.md,
            }}>
              <Mail size={24} style={{ color: designTokens.colors.brand.light }} />
            </div>
            <h3 style={{
              fontSize: '18px',
              fontWeight: designTokens.typography.fontWeight.semibold,
              color: designTokens.colors.text.primary,
              marginBottom: designTokens.spacing.xs,
            }}>
              Email Us
            </h3>
            <p style={{
              fontSize: '14px',
              color: designTokens.colors.text.tertiary,
              marginBottom: designTokens.spacing.sm,
              lineHeight: 1.5,
            }}>
              Send us an email and we'll respond within 24 hours.
            </p>
            <a
              href="mailto:support@vasthu.ai"
              style={{
                fontSize: '14px',
                color: designTokens.colors.brand.light,
                textDecoration: 'none',
                fontWeight: designTokens.typography.fontWeight.medium,
              }}
            >
              support@vasthu.ai
            </a>
          </div>

          {/* Chat */}
          <div style={{
            backgroundColor: designTokens.colors.chat.surface,
            borderRadius: designTokens.radius.md,
            padding: designTokens.spacing.lg,
            border: `1px solid ${designTokens.colors.sidebar.border}`,
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: designTokens.radius.md,
              backgroundColor: designTokens.colors.brand.subtle,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: designTokens.spacing.md,
            }}>
              <MessageSquare size={24} style={{ color: designTokens.colors.brand.light }} />
            </div>
            <h3 style={{
              fontSize: '18px',
              fontWeight: designTokens.typography.fontWeight.semibold,
              color: designTokens.colors.text.primary,
              marginBottom: designTokens.spacing.xs,
            }}>
              Live Chat
            </h3>
            <p style={{
              fontSize: '14px',
              color: designTokens.colors.text.tertiary,
              marginBottom: designTokens.spacing.md,
              lineHeight: 1.5,
            }}>
              Chat with our support team in real-time.
            </p>
            <button
              style={{
                width: '100%',
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
              Start Chat
            </button>
          </div>

          {/* Phone */}
          <div style={{
            backgroundColor: designTokens.colors.chat.surface,
            borderRadius: designTokens.radius.md,
            padding: designTokens.spacing.lg,
            border: `1px solid ${designTokens.colors.sidebar.border}`,
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: designTokens.radius.md,
              backgroundColor: designTokens.colors.brand.subtle,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: designTokens.spacing.md,
            }}>
              <Phone size={24} style={{ color: designTokens.colors.brand.light }} />
            </div>
            <h3 style={{
              fontSize: '18px',
              fontWeight: designTokens.typography.fontWeight.semibold,
              color: designTokens.colors.text.primary,
              marginBottom: designTokens.spacing.xs,
            }}>
              Call Us
            </h3>
            <p style={{
              fontSize: '14px',
              color: designTokens.colors.text.tertiary,
              marginBottom: designTokens.spacing.sm,
              lineHeight: 1.5,
            }}>
              Available Monday-Friday, 9am-6pm PST
            </p>
            <a
              href="tel:+15551234567"
              style={{
                fontSize: '14px',
                color: designTokens.colors.brand.light,
                textDecoration: 'none',
                fontWeight: designTokens.typography.fontWeight.medium,
              }}
            >
              +1 (555) 123-4567
            </a>
          </div>
        </div>

        {/* Contact Form */}
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
            Send us a message
          </h2>

          <form onSubmit={handleSubmit} style={{
            display: 'flex',
            flexDirection: 'column',
            gap: designTokens.spacing.md,
          }}>
            {/* Name */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: designTokens.typography.fontWeight.medium,
                color: designTokens.colors.text.secondary,
                marginBottom: designTokens.spacing.xs,
              }}>
                Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                style={{
                  width: '100%',
                  padding: `${designTokens.spacing.sm} ${designTokens.spacing.md}`,
                  backgroundColor: designTokens.colors.chat.elevated,
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
                display: 'block',
                fontSize: '13px',
                fontWeight: designTokens.typography.fontWeight.medium,
                color: designTokens.colors.text.secondary,
                marginBottom: designTokens.spacing.xs,
              }}>
                Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                style={{
                  width: '100%',
                  padding: `${designTokens.spacing.sm} ${designTokens.spacing.md}`,
                  backgroundColor: designTokens.colors.chat.elevated,
                  border: `1px solid ${designTokens.colors.sidebar.border}`,
                  borderRadius: designTokens.radius.md,
                  color: designTokens.colors.text.primary,
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
            </div>

            {/* Subject */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: designTokens.typography.fontWeight.medium,
                color: designTokens.colors.text.secondary,
                marginBottom: designTokens.spacing.xs,
              }}>
                Subject *
              </label>
              <input
                type="text"
                required
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                style={{
                  width: '100%',
                  padding: `${designTokens.spacing.sm} ${designTokens.spacing.md}`,
                  backgroundColor: designTokens.colors.chat.elevated,
                  border: `1px solid ${designTokens.colors.sidebar.border}`,
                  borderRadius: designTokens.radius.md,
                  color: designTokens.colors.text.primary,
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
            </div>

            {/* Priority */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: designTokens.typography.fontWeight.medium,
                color: designTokens.colors.text.secondary,
                marginBottom: designTokens.spacing.xs,
              }}>
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as 'low' | 'medium' | 'high' })}
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
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            {/* Message */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: designTokens.typography.fontWeight.medium,
                color: designTokens.colors.text.secondary,
                marginBottom: designTokens.spacing.xs,
              }}>
                Message *
              </label>
              <textarea
                required
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={6}
                style={{
                  width: '100%',
                  padding: `${designTokens.spacing.sm} ${designTokens.spacing.md}`,
                  backgroundColor: designTokens.colors.chat.elevated,
                  border: `1px solid ${designTokens.colors.sidebar.border}`,
                  borderRadius: designTokens.radius.md,
                  color: designTokens.colors.text.primary,
                  fontSize: '14px',
                  outline: 'none',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                }}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: designTokens.spacing.xs,
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
              <Send size={18} />
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
