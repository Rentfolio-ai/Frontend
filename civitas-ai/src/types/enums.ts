// FILE: src/types/enums.ts
// Centralized constants for the application (using const objects instead of enums)
// This approach is more modern and works with TypeScript's strict mode

/**
 * Avatar sizes
 */
export const AvatarSize = {
  Small: 'sm',
  Medium: 'md',
  Large: 'lg'
} as const;
export type AvatarSize = typeof AvatarSize[keyof typeof AvatarSize];

/**
 * Report status
 */
export const ReportStatus = {
  Ready: 'ready',
  Generating: 'generating',
  Draft: 'draft'
} as const;
export type ReportStatus = typeof ReportStatus[keyof typeof ReportStatus];

/**
 * Report types
 */
export const ReportType = {
  MarketAnalysis: 'market_analysis',
  PortfolioSummary: 'portfolio_summary',
  ROIAnalysis: 'roi_analysis',
  ComparativeAnalysis: 'comparative_analysis'
} as const;
export type ReportType = typeof ReportType[keyof typeof ReportType];

/**
 * Tool result kinds
 */
export const ToolKind = {
  ROIAnalysis: 'roi_analysis',
  MarketData: 'market_data',
  PropertyComparison: 'property_comparison',
  Alert: 'alert'
} as const;
export type ToolKind = typeof ToolKind[keyof typeof ToolKind];

/**
 * Tool result status
 */
export const ToolStatus = {
  Success: 'success',
  Warning: 'warning',
  Error: 'error'
} as const;
export type ToolStatus = typeof ToolStatus[keyof typeof ToolStatus];

/**
 * Message roles
 */
export const MessageRole = {
  User: 'user',
  Assistant: 'assistant'
} as const;
export type MessageRole = typeof MessageRole[keyof typeof MessageRole];

/**
 * Priority levels
 */
export const Priority = {
  High: 'high',
  Medium: 'medium',
  Low: 'low'
} as const;
export type Priority = typeof Priority[keyof typeof Priority];

/**
 * Action types
 */
export const ActionType = {
  Analysis: 'analysis',
  Alert: 'alert',
  Opportunity: 'opportunity',
  FollowUp: 'follow_up'
} as const;
export type ActionType = typeof ActionType[keyof typeof ActionType];

/**
 * Property types
 */
export const PropertyType = {
  SingleFamily: 'single_family',
  Condo: 'condo',
  Townhouse: 'townhouse',
  MultiFamily: 'multi_family',
  Land: 'land'
} as const;
export type PropertyType = typeof PropertyType[keyof typeof PropertyType];

/**
 * Badge variants
 */
export const BadgeVariant = {
  Default: 'default',
  Success: 'success',
  Warning: 'warning',
  Danger: 'danger',
  Primary: 'primary'
} as const;
export type BadgeVariant = typeof BadgeVariant[keyof typeof BadgeVariant];

/**
 * Button variants
 */
export const ButtonVariant = {
  Default: 'default',
  Primary: 'primary',
  Secondary: 'secondary',
  Outline: 'outline',
  Ghost: 'ghost',
  Danger: 'danger'
} as const;
export type ButtonVariant = typeof ButtonVariant[keyof typeof ButtonVariant];

/**
 * KPI formats
 */
export const KPIFormat = {
  Currency: 'currency',
  Percentage: 'percentage',
  Number: 'number',
  Text: 'text'
} as const;
export type KPIFormat = typeof KPIFormat[keyof typeof KPIFormat];

/**
 * Trend directions
 */
export const Trend = {
  Up: 'up',
  Down: 'down',
  Neutral: 'neutral'
} as const;
export type Trend = typeof Trend[keyof typeof Trend];

/**
 * Subscription tiers
 */
export const SubscriptionTier = {
  Free: 'free',
  Pro: 'pro',
  Enterprise: 'enterprise'
} as const;
export type SubscriptionTier = typeof SubscriptionTier[keyof typeof SubscriptionTier];

/**
 * Suggestion categories
 */
export const SuggestionCategory = {
  Market: 'market',
  Analysis: 'analysis',
  Comparison: 'comparison',
  Report: 'report'
} as const;
export type SuggestionCategory = typeof SuggestionCategory[keyof typeof SuggestionCategory];
