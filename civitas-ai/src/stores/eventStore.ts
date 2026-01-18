/**
 * Event Store: Single source of truth driven by SSE events.
 * 
 * Replaces multiple state management hooks with one clean store
 * that responds to backend events.
 */

import { create } from 'zustand';

// Event types matching backend protocol
export type SystemEvent = 
  | { type: 'session.started'; session_id: string; timestamp: number }
  | { type: 'work.started'; label: string; detail?: string; timestamp: number }
  | { type: 'work.progress'; label: string; progress: number; timestamp: number }
  | { type: 'work.completed'; label: string; summary?: string; timestamp: number }
  | { type: 'properties.found'; properties: Property[]; count: number; timestamp: number }
  | { type: 'analysis.ready'; property_id: string; analysis: Analysis; timestamp: number }
  | { type: 'answer.delta'; text: string; timestamp: number }
  | { type: 'answer.complete'; timestamp: number }
  | { type: 'next_action.suggested'; action: string; label: string; timestamp: number }
  | { type: 'error'; message: string; retryable: boolean; timestamp: number };

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
  fit_score?: number;
  price_signal?: 'good' | 'fair' | 'high';
  approval_likelihood?: 'high' | 'medium' | 'low';
  risk_flags?: string[];
  image_url?: string;
}

export interface Analysis {
  monthly_cash_flow: number;
  cap_rate: number;
  deal_grade: 'A' | 'B' | 'C' | 'D' | 'F';
  roi: number;
  risks: string[];
  opportunities: string[];
}

export interface WorkState {
  label: string;
  progress: number;
  detail?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface EventState {
  // Session
  sessionId: string | null;
  
  // Current work
  currentWork: WorkState | null;
  
  // Properties
  properties: Property[];
  shortlisted: string[]; // property IDs
  
  // Active analysis
  activeAnalysis: { property_id: string; analysis: Analysis } | null;
  
  // Messages
  messages: Message[];
  currentAnswer: string;
  
  // Next action
  nextAction: { action: string; label: string } | null;
  
  // Error state
  error: string | null;
  
  // Actions
  handleEvent: (event: SystemEvent) => void;
  addUserMessage: (content: string) => void;
  toggleShortlist: (propertyId: string) => void;
  clearSession: () => void;
  setActiveAnalysis: (propertyId: string | null) => void;
}

export const useEventStore = create<EventState>((set, get) => ({
  sessionId: null,
  currentWork: null,
  properties: [],
  shortlisted: [],
  activeAnalysis: null,
  messages: [],
  currentAnswer: '',
  nextAction: null,
  error: null,
  
  handleEvent: (event: SystemEvent) => {
    const state = get();
    
    switch (event.type) {
      case 'session.started':
        set({
          sessionId: event.session_id,
          currentWork: null,
          error: null,
          currentAnswer: '',
        });
        break;
      
      case 'work.started':
        set({
          currentWork: {
            label: event.label,
            progress: 0,
            detail: event.detail,
          },
        });
        break;
      
      case 'work.progress':
        set({
          currentWork: {
            label: event.label,
            progress: event.progress,
          },
        });
        break;
      
      case 'work.completed':
        set({ currentWork: null });
        break;
      
      case 'properties.found':
        set({ properties: event.properties });
        break;
      
      case 'analysis.ready':
        set({
          activeAnalysis: {
            property_id: event.property_id,
            analysis: event.analysis,
          },
        });
        break;
      
      case 'answer.delta':
        set({ currentAnswer: state.currentAnswer + event.text });
        break;
      
      case 'answer.complete':
        // Move current answer to messages
        if (state.currentAnswer.trim()) {
          set({
            messages: [
              ...state.messages,
              {
                id: `msg_${Date.now()}`,
                role: 'assistant',
                content: state.currentAnswer.trim(),
                timestamp: event.timestamp,
              },
            ],
            currentAnswer: '',
          });
        }
        break;
      
      case 'next_action.suggested':
        set({
          nextAction: {
            action: event.action,
            label: event.label,
          },
        });
        break;
      
      case 'error':
        set({
          error: event.message,
          currentWork: null,
        });
        break;
    }
  },
  
  addUserMessage: (content: string) => {
    const state = get();
    set({
      messages: [
        ...state.messages,
        {
          id: `msg_${Date.now()}`,
          role: 'user',
          content,
          timestamp: Date.now(),
        },
      ],
      error: null,
    });
  },
  
  toggleShortlist: (propertyId: string) => {
    const state = get();
    const isShortlisted = state.shortlisted.includes(propertyId);
    
    set({
      shortlisted: isShortlisted
        ? state.shortlisted.filter(id => id !== propertyId)
        : [...state.shortlisted, propertyId],
    });
  },
  
  clearSession: () => {
    set({
      sessionId: null,
      currentWork: null,
      properties: [],
      shortlisted: [],
      activeAnalysis: null,
      messages: [],
      currentAnswer: '',
      nextAction: null,
      error: null,
    });
  },
  
  setActiveAnalysis: (propertyId: string | null) => {
    if (!propertyId) {
      set({ activeAnalysis: null });
      return;
    }
    
    // Keep existing analysis if it matches
    const state = get();
    if (state.activeAnalysis?.property_id === propertyId) {
      return;
    }
    
    // Clear analysis, will be populated by analysis.ready event
    set({ activeAnalysis: null });
  },
}));
