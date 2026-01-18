/**
 * Shared Event Protocol: Single source of truth for FE/BE communication.
 * 
 * All events follow a strict schema with typed payloads.
 * No chain-of-thought leakage, no internal tool names.
 */

export type EventType =
  | 'session.started'
  | 'chapter.started'
  | 'step.started'
  | 'step.completed'
  | 'step.failed'
  | 'properties.found'
  | 'property.scored'
  | 'analysis.ready'
  | 'answer.delta'
  | 'answer.complete'
  | 'next_action.suggested'
  | 'error';

export type ConfidenceLevel = 'high' | 'medium' | 'low';
export type ActionType = 'compare' | 'analyze' | 'refine' | 'choose' | 'search';

// Base event structure
export interface BaseEvent<T = unknown> {
  type: EventType;
  trace_id: string;
  timestamp: number;
  payload: T;
  confidence?: ConfidenceLevel;
}

// Payload types
export interface SessionStartedPayload {
  session_id: string;
}

export interface ChapterStartedPayload {
  chapter_id: string;
  title: string;
  estimated_steps: number;
}

export interface StepStartedPayload {
  step_id: string;
  chapter_id: string;
  label: string;
  detail?: string;
}

export interface StepCompletedPayload {
  step_id: string;
  summary?: string;
  duration_ms: number;
}

export interface StepFailedPayload {
  step_id: string;
  error: string;
}

export interface PropertiesFoundPayload {
  properties: Property[];
  count: number;
  search_criteria?: SearchCriteria;
}

export interface PropertyScoredPayload {
  property_id: string;
  scores: ListingScore;
}

export interface AnalysisReadyPayload {
  property_id: string;
  analysis: PropertyAnalysis;
}

export interface AnswerDeltaPayload {
  text: string;
}

export interface NextActionPayload {
  action: ActionType;
  label: string;
  context?: Record<string, unknown>;
}

export interface ErrorPayload {
  message: string;
  retryable: boolean;
  error_code?: string;
}

// Domain types
export interface Property {
  id: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  image_url?: string;
  listing_url?: string;
}

export interface ListingScore {
  fit: number; // 0-100
  price_signal: 'good' | 'fair' | 'high';
  approval_likelihood: 'high' | 'medium' | 'low';
  risk_flags: RiskFlag[];
  confidence: ConfidenceLevel;
}

export interface RiskFlag {
  type: 'regulatory' | 'financial' | 'market' | 'property';
  severity: 'low' | 'medium' | 'high';
  message: string;
  source?: string;
}

export interface PropertyAnalysis {
  monthly_cash_flow: number;
  cap_rate: number;
  deal_grade: 'A' | 'B' | 'C' | 'D' | 'F';
  roi: number;
  risks: string[];
  opportunities: string[];
  confidence: ConfidenceLevel;
}

export interface SearchCriteria {
  location?: string;
  max_price?: number;
  min_bedrooms?: number;
  strategy?: 'STR' | 'LTR' | 'FLIP';
}

export interface Evidence {
  id: string;
  type: 'listing' | 'comp' | 'regulation' | 'market_stat';
  label: string;
  source: string;
  url?: string;
}

export interface Recommendation {
  listing_id: string;
  headline: string;
  why: string[]; // 3-5 bullets
  next_action: string;
  evidence: Evidence[];
}

// Timeline types
export interface TimelineChapter {
  id: string;
  title: string;
  steps: TimelineStep[];
  status: 'pending' | 'active' | 'completed' | 'failed';
  started_at?: number;
  completed_at?: number;
}

export interface TimelineStep {
  id: string;
  chapter_id: string;
  label: string;
  detail?: string;
  status: 'pending' | 'active' | 'completed' | 'failed';
  started_at?: number;
  completed_at?: number;
  duration_ms?: number;
}

// Typed event unions
export type SystemEvent =
  | BaseEvent<SessionStartedPayload>
  | BaseEvent<ChapterStartedPayload>
  | BaseEvent<StepStartedPayload>
  | BaseEvent<StepCompletedPayload>
  | BaseEvent<StepFailedPayload>
  | BaseEvent<PropertiesFoundPayload>
  | BaseEvent<PropertyScoredPayload>
  | BaseEvent<AnalysisReadyPayload>
  | BaseEvent<AnswerDeltaPayload>
  | BaseEvent<NextActionPayload>
  | BaseEvent<ErrorPayload>;
