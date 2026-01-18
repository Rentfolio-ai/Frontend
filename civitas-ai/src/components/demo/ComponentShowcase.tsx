/**
 * Component Showcase - Test new visual components
 * 
 * Temporary page to test:
 * - Design tokens
 * - Card components
 * - InlineComposer
 * 
 * Delete this file once components are integrated
 */

import React, { useState } from 'react';
import { Card, StatusCard, IntegrationCard } from '../primitives/Card';
import { InlineComposer, PropertyInlineComposer } from '../chat/InlineComposer';
import { designTokens } from '../../styles/design-tokens';
import { Sparkles, Home, TrendingUp } from 'lucide-react';

export const ComponentShowcase: React.FC = () => {
  const [messages, setMessages] = useState<string[]>([]);

  const handleSend = (message: string) => {
    setMessages(prev => [...prev, message]);
    console.log('[ComponentShowcase] Message sent:', message);
  };

  return (
    <div style={{
      padding: designTokens.spacing.xl,
      backgroundColor: designTokens.colors.bg.primary,
      minHeight: '100vh',
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: designTokens.spacing.xxl }}>
        
        {/* Header */}
        <div>
          <h1 style={{
            fontSize: designTokens.typography.fontSize.xxl,
            fontWeight: designTokens.typography.fontWeight.bold,
            color: designTokens.colors.text.primary,
            marginBottom: designTokens.spacing.sm,
          }}>
            Component Showcase
          </h1>
          <p style={{
            fontSize: designTokens.typography.fontSize.base,
            color: designTokens.colors.text.secondary,
          }}>
            Testing SolidHealth.ai inspired components
          </p>
        </div>

        {/* Design Tokens */}
        <section>
          <h2 style={{
            fontSize: designTokens.typography.fontSize.xl,
            fontWeight: designTokens.typography.fontWeight.semibold,
            color: designTokens.colors.text.primary,
            marginBottom: designTokens.spacing.lg,
          }}>
            Design Tokens
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: designTokens.spacing.md }}>
            {/* Colors */}
            <Card padding="lg">
              <h3 style={{ fontSize: designTokens.typography.fontSize.lg, fontWeight: designTokens.typography.fontWeight.semibold, color: designTokens.colors.text.primary, marginBottom: designTokens.spacing.md }}>
                Colors
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: designTokens.spacing.sm }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: designTokens.spacing.sm }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: designTokens.border.radius.md, backgroundColor: designTokens.colors.brand.primary }} />
                  <span style={{ fontSize: designTokens.typography.fontSize.sm, color: designTokens.colors.text.secondary }}>Brand Primary</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: designTokens.spacing.sm }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: designTokens.border.radius.md, backgroundColor: designTokens.colors.semantic.success }} />
                  <span style={{ fontSize: designTokens.typography.fontSize.sm, color: designTokens.colors.text.secondary }}>Success</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: designTokens.spacing.sm }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: designTokens.border.radius.md, backgroundColor: designTokens.colors.semantic.warning }} />
                  <span style={{ fontSize: designTokens.typography.fontSize.sm, color: designTokens.colors.text.secondary }}>Warning</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: designTokens.spacing.sm }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: designTokens.border.radius.md, backgroundColor: designTokens.colors.semantic.error }} />
                  <span style={{ fontSize: designTokens.typography.fontSize.sm, color: designTokens.colors.text.secondary }}>Error</span>
                </div>
              </div>
            </Card>

            {/* Spacing */}
            <Card padding="lg">
              <h3 style={{ fontSize: designTokens.typography.fontSize.lg, fontWeight: designTokens.typography.fontWeight.semibold, color: designTokens.colors.text.primary, marginBottom: designTokens.spacing.md }}>
                Spacing (8px system)
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: designTokens.spacing.xs }}>
                {Object.entries(designTokens.spacing).map(([key, value]) => (
                  <div key={key} style={{ display: 'flex', alignItems: 'center', gap: designTokens.spacing.sm }}>
                    <div style={{ width: value, height: '16px', backgroundColor: designTokens.colors.brand.primary, borderRadius: '2px' }} />
                    <span style={{ fontSize: designTokens.typography.fontSize.xs, color: designTokens.colors.text.tertiary }}>
                      {key}: {value}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Typography */}
            <Card padding="lg">
              <h3 style={{ fontSize: designTokens.typography.fontSize.lg, fontWeight: designTokens.typography.fontWeight.semibold, color: designTokens.colors.text.primary, marginBottom: designTokens.spacing.md }}>
                Typography
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: designTokens.spacing.sm }}>
                <div style={{ fontSize: designTokens.typography.fontSize.xxl, color: designTokens.colors.text.primary }}>Page Title (32px)</div>
                <div style={{ fontSize: designTokens.typography.fontSize.xl, color: designTokens.colors.text.primary }}>Heading (24px)</div>
                <div style={{ fontSize: designTokens.typography.fontSize.lg, color: designTokens.colors.text.primary }}>Subheading (18px)</div>
                <div style={{ fontSize: designTokens.typography.fontSize.base, color: designTokens.colors.text.secondary }}>Body (15px)</div>
                <div style={{ fontSize: designTokens.typography.fontSize.sm, color: designTokens.colors.text.tertiary }}>Small (14px)</div>
                <div style={{ fontSize: designTokens.typography.fontSize.xs, color: designTokens.colors.text.tertiary }}>Micro (12px)</div>
              </div>
            </Card>
          </div>
        </section>

        {/* Card Variants */}
        <section>
          <h2 style={{
            fontSize: designTokens.typography.fontSize.xl,
            fontWeight: designTokens.typography.fontWeight.semibold,
            color: designTokens.colors.text.primary,
            marginBottom: designTokens.spacing.lg,
          }}>
            Card Components
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: designTokens.spacing.md }}>
            {/* Default Card */}
            <Card variant="default" padding="lg">
              <div style={{ display: 'flex', alignItems: 'center', gap: designTokens.spacing.sm, marginBottom: designTokens.spacing.md }}>
                <Home size={20} style={{ color: designTokens.colors.brand.primary }} />
                <h3 style={{ fontSize: designTokens.typography.fontSize.lg, fontWeight: designTokens.typography.fontWeight.semibold, color: designTokens.colors.text.primary, margin: 0 }}>
                  Default Card
                </h3>
              </div>
              <p style={{ fontSize: designTokens.typography.fontSize.sm, color: designTokens.colors.text.secondary, margin: 0 }}>
                Standard card with subtle shadow
              </p>
            </Card>

            {/* Elevated Card */}
            <Card variant="elevated" padding="lg">
              <div style={{ display: 'flex', alignItems: 'center', gap: designTokens.spacing.sm, marginBottom: designTokens.spacing.md }}>
                <TrendingUp size={20} style={{ color: designTokens.colors.semantic.success }} />
                <h3 style={{ fontSize: designTokens.typography.fontSize.lg, fontWeight: designTokens.typography.fontWeight.semibold, color: designTokens.colors.text.primary, margin: 0 }}>
                  Elevated Card
                </h3>
              </div>
              <p style={{ fontSize: designTokens.typography.fontSize.sm, color: designTokens.colors.text.secondary, margin: 0 }}>
                Higher elevation, more prominent
              </p>
            </Card>

            {/* Flat Card */}
            <Card variant="flat" padding="lg">
              <div style={{ display: 'flex', alignItems: 'center', gap: designTokens.spacing.sm, marginBottom: designTokens.spacing.md }}>
                <Sparkles size={20} style={{ color: designTokens.colors.semantic.info }} />
                <h3 style={{ fontSize: designTokens.typography.fontSize.lg, fontWeight: designTokens.typography.fontWeight.semibold, color: designTokens.colors.text.primary, margin: 0 }}>
                  Flat Card
                </h3>
              </div>
              <p style={{ fontSize: designTokens.typography.fontSize.sm, color: designTokens.colors.text.secondary, margin: 0 }}>
                No shadow, minimal styling
              </p>
            </Card>

            {/* Hoverable Card */}
            <Card variant="default" padding="lg" hoverable>
              <h3 style={{ fontSize: designTokens.typography.fontSize.lg, fontWeight: designTokens.typography.fontWeight.semibold, color: designTokens.colors.text.primary, marginBottom: designTokens.spacing.sm }}>
                Hoverable Card
              </h3>
              <p style={{ fontSize: designTokens.typography.fontSize.sm, color: designTokens.colors.text.secondary, margin: 0 }}>
                Hover over me to see the effect!
              </p>
            </Card>
          </div>
        </section>

        {/* Status Cards */}
        <section>
          <h2 style={{
            fontSize: designTokens.typography.fontSize.xl,
            fontWeight: designTokens.typography.fontWeight.semibold,
            color: designTokens.colors.text.primary,
            marginBottom: designTokens.spacing.lg,
          }}>
            Status Cards
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: designTokens.spacing.md }}>
            <StatusCard status="success">
              <p style={{ fontSize: designTokens.typography.fontSize.sm, fontWeight: designTokens.typography.fontWeight.medium, color: designTokens.colors.semantic.success, margin: 0 }}>
                ✓ Successfully connected to Zillow
              </p>
            </StatusCard>

            <StatusCard status="warning">
              <p style={{ fontSize: designTokens.typography.fontSize.sm, fontWeight: designTokens.typography.fontWeight.medium, color: designTokens.colors.semantic.warning, margin: 0 }}>
                ⚠ Limited API calls remaining
              </p>
            </StatusCard>

            <StatusCard status="error">
              <p style={{ fontSize: designTokens.typography.fontSize.sm, fontWeight: designTokens.typography.fontWeight.medium, color: designTokens.colors.semantic.error, margin: 0 }}>
                ✕ Connection failed
              </p>
            </StatusCard>

            <StatusCard status="info">
              <p style={{ fontSize: designTokens.typography.fontSize.sm, fontWeight: designTokens.typography.fontWeight.medium, color: designTokens.colors.semantic.info, margin: 0 }}>
                ℹ Data sync in progress
              </p>
            </StatusCard>
          </div>
        </section>

        {/* Integration Cards */}
        <section>
          <h2 style={{
            fontSize: designTokens.typography.fontSize.xl,
            fontWeight: designTokens.typography.fontWeight.semibold,
            color: designTokens.colors.text.primary,
            marginBottom: designTokens.spacing.lg,
          }}>
            Integration Cards
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: designTokens.spacing.md }}>
            <IntegrationCard
              name="Zillow"
              logo={<span style={{ fontSize: '24px' }}>🏠</span>}
              status="connected"
              lastSync={new Date(Date.now() - 120000)}
              onRefresh={() => alert('Refreshing Zillow data...')}
              onEdit={() => alert('Edit Zillow connection...')}
            />

            <IntegrationCard
              name="Redfin"
              logo={<span style={{ fontSize: '24px' }}>🏘️</span>}
              status="syncing"
              onRefresh={() => alert('Refreshing Redfin data...')}
              onEdit={() => alert('Edit Redfin connection...')}
            />

            <IntegrationCard
              name="RentCast"
              logo={<span style={{ fontSize: '24px' }}>📊</span>}
              status="error"
              onRefresh={() => alert('Refreshing RentCast data...')}
              onEdit={() => alert('Edit RentCast connection...')}
            />

            <IntegrationCard
              name="Realtor.com"
              logo={<span style={{ fontSize: '24px' }}>🔍</span>}
              status="disconnected"
              onRefresh={() => alert('Connect Realtor.com...')}
            />
          </div>
        </section>

        {/* Inline Composer */}
        <section>
          <h2 style={{
            fontSize: designTokens.typography.fontSize.xl,
            fontWeight: designTokens.typography.fontWeight.semibold,
            color: designTokens.colors.text.primary,
            marginBottom: designTokens.spacing.lg,
          }}>
            Inline Composer
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: designTokens.spacing.xl }}>
            {/* Generic */}
            <div>
              <h3 style={{ fontSize: designTokens.typography.fontSize.base, fontWeight: designTokens.typography.fontWeight.medium, color: designTokens.colors.text.secondary, marginBottom: designTokens.spacing.md }}>
                Generic Inline Composer
              </h3>
              <InlineComposer
                placeholder="Ask a question..."
                context="about Austin market"
                quickQuestions={[
                  'Average home prices',
                  'Best neighborhoods',
                  'Price trends',
                  'Rental yields'
                ]}
                onSend={handleSend}
                size="md"
              />
            </div>

            {/* Property Specific */}
            <div>
              <h3 style={{ fontSize: designTokens.typography.fontSize.base, fontWeight: designTokens.typography.fontWeight.medium, color: designTokens.colors.text.secondary, marginBottom: designTokens.spacing.md }}>
                Property Inline Composer
              </h3>
              <PropertyInlineComposer
                propertyAddress="123 Main St, Austin, TX"
                onSend={handleSend}
              />
            </div>

            {/* Messages */}
            {messages.length > 0 && (
              <Card padding="lg">
                <h3 style={{ fontSize: designTokens.typography.fontSize.base, fontWeight: designTokens.typography.fontWeight.semibold, color: designTokens.colors.text.primary, marginBottom: designTokens.spacing.md }}>
                  Sent Messages
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: designTokens.spacing.sm }}>
                  {messages.map((msg, i) => (
                    <div key={i} style={{ 
                      padding: designTokens.spacing.sm, 
                      backgroundColor: designTokens.colors.bg.tertiary,
                      borderRadius: designTokens.border.radius.md,
                      fontSize: designTokens.typography.fontSize.sm,
                      color: designTokens.colors.text.secondary,
                    }}>
                      {msg}
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </section>

      </div>
    </div>
  );
};
