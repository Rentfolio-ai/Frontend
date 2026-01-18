/**
 * FAQ Page
 * Searchable frequently asked questions with accordion UI
 */

import React, { useState } from 'react';
import { Search, ChevronDown, ThumbsUp, ThumbsDown, ArrowLeft } from 'lucide-react';
import { designTokens } from '../styles/design-tokens';

interface FAQItem {
  category: string;
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  // Getting Started
  {
    category: 'Getting Started',
    question: 'How do I analyze my first property?',
    answer: 'Start a chat with ProphetAtlas and share the property address or URL. Our AI will analyze market data, calculate potential returns, and provide a detailed P&L report within seconds.',
  },
  {
    category: 'Getting Started',
    question: 'What information do I need to provide?',
    answer: 'Just provide the property address or listing URL. Our system automatically pulls market data, property details, and comparable sales to generate comprehensive analysis.',
  },
  
  // Property Analysis
  {
    category: 'Property Analysis',
    question: 'How accurate are the AI recommendations?',
    answer: 'Our AI analyzes real-time market data from multiple sources including MLS, public records, and rental comps. Historical accuracy is 85-90% for rental estimates and 80-85% for appreciation forecasts.',
  },
  {
    category: 'Property Analysis',
    question: 'What metrics should I focus on?',
    answer: 'Key metrics include Cash-on-Cash Return (CoC), Cap Rate, monthly cash flow, and occupancy rates. We recommend a minimum 8-12% CoC for rental properties and positive cash flow from day one.',
  },
  {
    category: 'Property Analysis',
    question: 'Can I compare multiple properties?',
    answer: 'Yes! Add properties to your comparison list and view side-by-side metrics. Compare cash flow, returns, locations, and market trends to make informed decisions.',
  },
  {
    category: 'Property Analysis',
    question: 'How is cash flow calculated?',
    answer: 'Cash flow = Monthly Rent - (Mortgage + Property Tax + Insurance + HOA + Maintenance Reserve + Vacancy Reserve + Property Management). We use conservative estimates for all expenses.',
  },
  
  // AI Recommendations
  {
    category: 'AI Recommendations',
    question: 'How does ProphetAtlas find properties?',
    answer: 'ProphetAtlas continuously scans MLS listings, off-market deals, and your preferred markets. It matches properties against your investment criteria (ROI, price range, location) and alerts you to opportunities.',
  },
  {
    category: 'AI Recommendations',
    question: 'Can I customize recommendation criteria?',
    answer: 'Absolutely! Set your minimum ROI, maximum price, preferred markets, property types, and risk tolerance in your profile settings. ProphetAtlas learns from your decisions over time.',
  },
  {
    category: 'AI Recommendations',
    question: 'What makes a property "recommended"?',
    answer: 'Recommended properties meet your criteria AND show strong fundamentals: positive cash flow, below-market pricing, high-growth markets, and favorable rent-to-price ratios.',
  },
  
  // Reports & Exports
  {
    category: 'Reports & Exports',
    question: 'Can I export my analysis reports?',
    answer: 'Yes! Export detailed PDF reports including property analysis, P&L breakdowns, market comparisons, and charts. Premium users can also export to Excel for custom modeling.',
  },
  {
    category: 'Reports & Exports',
    question: 'How long are reports stored?',
    answer: 'All your analysis reports are stored indefinitely in your account. Access them anytime from the Reports tab or your portfolio dashboard.',
  },
  
  // Billing & Subscription
  {
    category: 'Billing & Subscription',
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards (Visa, Mastercard, Amex), debit cards, and ACH bank transfers. All payments are processed securely through Stripe.',
  },
  {
    category: 'Billing & Subscription',
    question: 'Can I cancel anytime?',
    answer: 'Yes, cancel anytime from your billing settings. You\'ll retain access until the end of your current billing period, and no further charges will be made.',
  },
  {
    category: 'Billing & Subscription',
    question: 'Is there a free trial?',
    answer: 'New users get a 14-day free trial with full access to all features. No credit card required to start your trial.',
  },
  
  // Technical Support
  {
    category: 'Technical Support',
    question: 'What browsers are supported?',
    answer: 'Vasthu works best on Chrome, Firefox, Safari, and Edge (latest versions). We recommend Chrome for the best experience.',
  },
  {
    category: 'Technical Support',
    question: 'Is my data secure?',
    answer: 'Yes! All data is encrypted in transit (TLS 1.3) and at rest (AES-256). We never sell your data and comply with GDPR, CCPA, and SOC 2 standards.',
  },
];

interface FAQPageProps {
  onBack?: () => void;
}

export const FAQPage: React.FC<FAQPageProps> = ({ onBack }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Get unique categories
  const categories = ['All', ...Array.from(new Set(faqData.map(item => item.category)))];

  // Filter FAQs
  const filteredFAQs = faqData.filter(item => {
    const matchesSearch = searchQuery === '' || 
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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
          Frequently Asked Questions
        </h1>
        <p style={{
          fontSize: '15px',
          color: designTokens.colors.text.tertiary,
          margin: 0,
        }}>
          Find answers to common questions about Vasthu
        </p>
      </div>

      <div style={{
        maxWidth: '900px',
        margin: '0 auto',
      }}>
        {/* Search Bar */}
        <div style={{
          position: 'relative',
          marginBottom: designTokens.spacing.lg,
        }}>
          <Search 
            size={20} 
            style={{
              position: 'absolute',
              left: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: designTokens.colors.text.tertiary,
            }}
          />
          <input
            type="text"
            placeholder="Search FAQs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: `${designTokens.spacing.md} ${designTokens.spacing.md} ${designTokens.spacing.md} 48px`,
              backgroundColor: designTokens.colors.chat.surface,
              border: `1px solid ${designTokens.colors.sidebar.border}`,
              borderRadius: designTokens.radius.md,
              color: designTokens.colors.text.primary,
              fontSize: '15px',
              outline: 'none',
              transition: `all ${designTokens.transition.fast}`,
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = designTokens.colors.brand.primary;
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = designTokens.colors.sidebar.border;
            }}
          />
        </div>

        {/* Category Filter */}
        <div style={{
          display: 'flex',
          gap: designTokens.spacing.xs,
          marginBottom: designTokens.spacing.lg,
          flexWrap: 'wrap',
        }}>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              style={{
                padding: `${designTokens.spacing.xs} ${designTokens.spacing.md}`,
                backgroundColor: selectedCategory === category ? designTokens.colors.brand.primary : designTokens.colors.chat.surface,
                color: selectedCategory === category ? '#FFFFFF' : designTokens.colors.text.secondary,
                border: `1px solid ${selectedCategory === category ? designTokens.colors.brand.primary : designTokens.colors.sidebar.border}`,
                borderRadius: designTokens.radius.pill,
                fontSize: '13px',
                fontWeight: designTokens.typography.fontWeight.medium,
                cursor: 'pointer',
                transition: `all ${designTokens.transition.fast}`,
              }}
              onMouseEnter={(e) => {
                if (selectedCategory !== category) {
                  e.currentTarget.style.borderColor = designTokens.colors.brand.primary;
                }
              }}
              onMouseLeave={(e) => {
                if (selectedCategory !== category) {
                  e.currentTarget.style.borderColor = designTokens.colors.sidebar.border;
                }
              }}
            >
              {category}
            </button>
          ))}
        </div>

        {/* FAQ Accordion */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: designTokens.spacing.sm,
        }}>
          {filteredFAQs.map((faq, index) => {
            const isExpanded = expandedIndex === index;
            return (
              <div
                key={index}
                style={{
                  backgroundColor: designTokens.colors.chat.surface,
                  border: `1px solid ${isExpanded ? designTokens.colors.brand.primary : designTokens.colors.sidebar.border}`,
                  borderRadius: designTokens.radius.md,
                  overflow: 'hidden',
                  transition: `all ${designTokens.transition.fast}`,
                }}
              >
                {/* Question */}
                <button
                  onClick={() => setExpandedIndex(isExpanded ? null : index)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: `${designTokens.spacing.md} ${designTokens.spacing.md}`,
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <div>
                    <div style={{
                      fontSize: '11px',
                      fontWeight: designTokens.typography.fontWeight.semibold,
                      color: designTokens.colors.brand.light,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      marginBottom: '4px',
                    }}>
                      {faq.category}
                    </div>
                    <div style={{
                      fontSize: '15px',
                      fontWeight: designTokens.typography.fontWeight.semibold,
                      color: designTokens.colors.text.primary,
                    }}>
                      {faq.question}
                    </div>
                  </div>
                  <ChevronDown
                    size={20}
                    style={{
                      color: designTokens.colors.text.tertiary,
                      transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: `transform ${designTokens.transition.fast}`,
                      flexShrink: 0,
                      marginLeft: designTokens.spacing.md,
                    }}
                  />
                </button>

                {/* Answer */}
                {isExpanded && (
                  <div style={{
                    padding: `0 ${designTokens.spacing.md} ${designTokens.spacing.md} ${designTokens.spacing.md}`,
                    borderTop: `1px solid ${designTokens.colors.sidebar.border}`,
                  }}>
                    <p style={{
                      fontSize: '14px',
                      color: designTokens.colors.text.secondary,
                      lineHeight: 1.6,
                      margin: `${designTokens.spacing.md} 0`,
                    }}>
                      {faq.answer}
                    </p>

                    {/* Was this helpful? */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: designTokens.spacing.sm,
                      paddingTop: designTokens.spacing.sm,
                      borderTop: `1px solid ${designTokens.colors.sidebar.border}`,
                    }}>
                      <span style={{
                        fontSize: '13px',
                        color: designTokens.colors.text.tertiary,
                      }}>
                        Was this helpful?
                      </span>
                      <button
                        style={{
                          padding: `${designTokens.spacing.xs} ${designTokens.spacing.sm}`,
                          backgroundColor: 'transparent',
                          border: `1px solid ${designTokens.colors.sidebar.border}`,
                          borderRadius: designTokens.radius.sm,
                          color: designTokens.colors.text.tertiary,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '12px',
                        }}
                      >
                        <ThumbsUp size={14} /> Yes
                      </button>
                      <button
                        style={{
                          padding: `${designTokens.spacing.xs} ${designTokens.spacing.sm}`,
                          backgroundColor: 'transparent',
                          border: `1px solid ${designTokens.colors.sidebar.border}`,
                          borderRadius: designTokens.radius.sm,
                          color: designTokens.colors.text.tertiary,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '12px',
                        }}
                      >
                        <ThumbsDown size={14} /> No
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* No Results */}
        {filteredFAQs.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: `${designTokens.spacing.xl} ${designTokens.spacing.lg}`,
            backgroundColor: designTokens.colors.chat.surface,
            borderRadius: designTokens.radius.md,
            border: `1px solid ${designTokens.colors.sidebar.border}`,
          }}>
            <p style={{
              fontSize: '15px',
              color: designTokens.colors.text.tertiary,
              margin: 0,
            }}>
              No FAQs found matching your search. Try different keywords or browse categories.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
