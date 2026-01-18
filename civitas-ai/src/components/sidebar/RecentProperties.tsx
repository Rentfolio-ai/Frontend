/**
 * Recent Activity - Combined Properties + Chats
 * Unified "Recent" section for sidebar
 */

import React from 'react';
import { MapPin, MessageSquare } from 'lucide-react';
import { designTokens } from '../../styles/design-tokens';

interface Property {
  id: string;
  address: string;
  city: string;
  state: string;
  price: string;
  imageUrl?: string;
  timestamp: string;
}

interface Chat {
  id: string;
  title: string;
  timestamp: string;
}

interface RecentPropertiesProps {
  isExpanded: boolean;
  recentChats?: Chat[];
}

export const RecentProperties: React.FC<RecentPropertiesProps> = ({ isExpanded, recentChats = [] }) => {
  // Mock properties (would come from context/store)
  const recentProperties: Property[] = [
    {
      id: '1',
      address: '123 Main St',
      city: 'Austin',
      state: 'TX',
      price: '$425K',
      timestamp: '2h ago',
      imageUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=100&q=80',
    },
    {
      id: '2',
      address: '456 Oak Ave',
      city: 'Dallas',
      state: 'TX',
      price: '$310K',
      timestamp: '5h ago',
      imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=100&q=80',
    },
  ];

  if (!isExpanded) {
    return null; // Hidden when collapsed
  }

  return (
    <div style={{
      padding: `0 ${designTokens.spacing.sm}`,
      marginTop: designTokens.spacing.md,
    }}>
      {/* Section Header */}
      <div style={{
        fontSize: designTokens.typography.fontSize.xs,
        color: designTokens.colors.text.tertiary,
        textTransform: 'uppercase',
        letterSpacing: designTokens.typography.letterSpacing.wide,
        fontWeight: designTokens.typography.fontWeight.medium,
        marginBottom: designTokens.spacing.xs,
        padding: `0 ${designTokens.spacing.xs}`,
      }}>
        Recent Activity
      </div>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: designTokens.spacing.xs,
      }}>
        {/* Recent Properties (with larger images) */}
        {recentProperties.map((property) => (
          <button
            key={property.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: designTokens.spacing.sm,
              padding: designTokens.spacing.xs,
              backgroundColor: 'transparent',
              border: `1px solid ${designTokens.colors.sidebar.border}`,
              borderRadius: designTokens.radius.md,
              cursor: 'pointer',
              transition: `all ${designTokens.transition.fast}`,
              textAlign: 'left',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = designTokens.colors.sidebar.surface;
              e.currentTarget.style.borderColor = designTokens.colors.brand.primary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.borderColor = designTokens.colors.sidebar.border;
            }}
            onClick={() => console.log('View property:', property.id)}
          >
            {/* Property thumbnail (larger: 60px) */}
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: designTokens.radius.sm,
              overflow: 'hidden',
              flexShrink: 0,
              backgroundColor: designTokens.colors.sidebar.surface,
            }}>
              {property.imageUrl ? (
                <img
                  src={property.imageUrl}
                  alt={property.address}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              ) : (
                <div style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <MapPin size={20} style={{ color: designTokens.colors.text.tertiary }} />
                </div>
              )}
            </div>

            {/* Property info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: designTokens.typography.fontSize.sm,
                fontWeight: designTokens.typography.fontWeight.medium,
                color: designTokens.colors.text.primary,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                marginBottom: '4px',
              }}>
                {property.address}
              </div>
              <div style={{
                fontSize: designTokens.typography.fontSize.xs,
                color: designTokens.colors.text.tertiary,
                marginBottom: '2px',
              }}>
                {property.city}, {property.state}
              </div>
              <div style={{
                fontSize: designTokens.typography.fontSize.xs,
                color: designTokens.colors.text.tertiary,
                display: 'flex',
                alignItems: 'center',
                gap: designTokens.spacing.xs,
              }}>
                <span style={{ 
                  color: designTokens.colors.brand.primary, 
                  fontWeight: designTokens.typography.fontWeight.medium 
                }}>
                  {property.price}
                </span>
                <span>•</span>
                <span>{property.timestamp}</span>
              </div>
            </div>
          </button>
        ))}

        {/* Recent Chats (compact list) */}
        {recentChats.slice(0, 2).map((chat) => (
          <button
            key={chat.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: designTokens.spacing.sm,
              padding: designTokens.spacing.xs,
              backgroundColor: 'transparent',
              border: 'none',
              borderRadius: designTokens.radius.md,
              cursor: 'pointer',
              transition: `all ${designTokens.transition.fast}`,
              textAlign: 'left',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = designTokens.colors.sidebar.surface;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
            onClick={() => console.log('Open chat:', chat.id)}
          >
            <MessageSquare size={14} style={{ color: designTokens.colors.text.tertiary, flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: designTokens.typography.fontSize.xs,
                color: designTokens.colors.text.secondary,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>
                {chat.title}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
