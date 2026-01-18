/**
 * Decision History Store
 * Steve Jobs Priority 2: Remember what users want/don't want
 * 
 * Tracks:
 * - Properties viewed
 * - Properties rejected (with reasons)
 * - Properties analyzed
 * - Properties starred (tracking list)
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '../services/api';

export interface TrackedProperty {
  id: string;
  address: string;
  city: string;
  state: string;
  price: number;
  property_type: string;
  decision_type: 'viewed' | 'rejected' | 'analyzed' | 'starred';
  decision_reason?: string;
  starred_at?: string;
  cap_rate?: number;
  coc_return?: number;
  monthly_cash_flow?: number;
  fit_score?: number;
  notes?: string;
}

export interface RejectionPattern {
  reason: string;
  count: number;
}

export interface DecisionSummary {
  total_decisions: number;
  by_type: Record<string, number>;
  starred_properties: number;
  rejection_patterns: {
    total_rejections: number;
    top_reasons: RejectionPattern[];
    insights: string[];
  };
  learned_preferences: {
    max_price: number | null;
    min_coc: number | null;
    preferred_types: string[];
    confidence: number;
  };
}

interface DecisionHistoryState {
  // Starred properties (tracking list)
  starredProperties: TrackedProperty[];
  
  // Decision summary (insights)
  decisionSummary: DecisionSummary | null;
  
  // Loading states
  isLoadingStarred: boolean;
  isLoadingSummary: boolean;
  
  // Actions
  trackDecision: (
    propertyId: string,
    decisionType: 'viewed' | 'rejected' | 'analyzed' | 'starred' | 'unstarred',
    propertyData?: any,
    reason?: string,
    context?: any
  ) => Promise<void>;
  
  loadStarredProperties: () => Promise<void>;
  loadDecisionSummary: (days?: number) => Promise<void>;
  
  starProperty: (propertyId: string, propertyData: any) => Promise<void>;
  unstarProperty: (propertyId: string) => Promise<void>;
  
  rejectProperty: (propertyId: string, reason: string, propertyData: any) => Promise<void>;
  analyzeProperty: (propertyId: string, propertyData: any) => Promise<void>;
  
  updatePropertyNotes: (propertyId: string, notes: string) => void;
  
  // Reset
  reset: () => void;
}

export const useDecisionHistoryStore = create<DecisionHistoryState>()(
  persist(
    (set, get) => ({
      starredProperties: [],
      decisionSummary: null,
      isLoadingStarred: false,
      isLoadingSummary: false,
      
      // Generic decision tracker
      trackDecision: async (propertyId, decisionType, propertyData, reason, context) => {
        try {
          await api.post('/api/recommendations/track', {
            property_id: propertyId,
            decision_type: decisionType,
            property_data: propertyData,
            reason,
            context
          });
          
          // Refresh starred list if this was a star/unstar
          if (decisionType === 'starred' || decisionType === 'unstarred') {
            await get().loadStarredProperties();
          }
          
          // Refresh summary if this was a rejection or star
          if (decisionType === 'rejected' || decisionType === 'starred') {
            await get().loadDecisionSummary();
          }
        } catch (error) {
          console.error('[DecisionHistory] Failed to track decision:', error);
          throw error;
        }
      },
      
      // Load starred properties (tracking list)
      loadStarredProperties: async () => {
        set({ isLoadingStarred: true });
        try {
          const response = await api.get('/api/recommendations/starred');
          const data = response.data?.data;
          
          if (data?.starred_properties) {
            set({ 
              starredProperties: data.starred_properties.map((s: any) => ({
                id: s.id,
                address: s.address,
                city: s.city,
                price: s.price,
                decision_type: 'starred',
                starred_at: s.starred_at,
                notes: s.notes
              })),
              isLoadingStarred: false
            });
          }
        } catch (error) {
          console.error('[DecisionHistory] Failed to load starred properties:', error);
          set({ isLoadingStarred: false });
        }
      },
      
      // Load decision summary (insights)
      loadDecisionSummary: async (days = 30) => {
        set({ isLoadingSummary: true });
        try {
          const response = await api.get(`/api/recommendations/decision-summary?days=${days}`);
          const data = response.data?.data;
          
          if (data) {
            set({ 
              decisionSummary: data,
              isLoadingSummary: false
            });
          }
        } catch (error) {
          console.error('[DecisionHistory] Failed to load decision summary:', error);
          set({ isLoadingSummary: false });
        }
      },
      
      // Star a property (add to tracking list)
      starProperty: async (propertyId, propertyData) => {
        await get().trackDecision(propertyId, 'starred', propertyData);
      },
      
      // Unstar a property (remove from tracking list)
      unstarProperty: async (propertyId) => {
        await get().trackDecision(propertyId, 'unstarred');
      },
      
      // Reject a property (with reason)
      rejectProperty: async (propertyId, reason, propertyData) => {
        await get().trackDecision(propertyId, 'rejected', propertyData, reason);
      },
      
      // Analyze a property (deep dive)
      analyzeProperty: async (propertyId, propertyData) => {
        await get().trackDecision(propertyId, 'analyzed', propertyData);
      },
      
      // Update notes on starred property (local only, sync later)
      updatePropertyNotes: (propertyId, notes) => {
        set((state) => ({
          starredProperties: state.starredProperties.map((p) =>
            p.id === propertyId ? { ...p, notes } : p
          )
        }));
      },
      
      // Reset state
      reset: () => set({
        starredProperties: [],
        decisionSummary: null,
        isLoadingStarred: false,
        isLoadingSummary: false
      })
    }),
    {
      name: 'civitas-decision-history',
      partialize: (state) => ({
        // Only persist starred properties (summary is fetched from backend)
        starredProperties: state.starredProperties
      })
    }
  )
);
