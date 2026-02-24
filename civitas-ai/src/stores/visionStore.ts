/**
 * Vision Store — Zustand state management for Vasthu Vision
 *
 * Manages scan sessions, walkthrough state, portfolio data,
 * and persists history to localStorage.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ── Types ──────────────────────────────────────────────────

export interface Detection {
  damage_class: string;
  severity: string;
  confidence: number;
  class_confidence: number;
  severity_confidence: number;
  bbox: number[];
}

export interface RepairEstimate {
  category: string;
  repair_type: string;
  description: string;
  quantity: number;
  unit: string;
  basic_cost: number;
  standard_cost: number;
  premium_cost: number;
}

export interface InvestmentMetrics {
  deal_score: number;
  value_add_potential: number;
  brrrr_viable: boolean;
  risk_level: string;
  recommended_strategy: string;
  estimated_arv: number | null;
  reasoning: string;
  renovation_roi_estimate?: number;
  time_to_rent_ready?: string;
  risk_adjusted_score?: number;
  comparable_condition_rank?: number;
}

export interface VastuAnalysis {
  directional_score: number;
  element_score: number;
  energy_score: number;
  overall_vastu_score: number;
  compliance_level: string;
  recommendations: VastuRecommendation[];
}

export interface VastuRecommendation {
  category: string;
  current_state: string;
  ideal_state: string;
  impact: string;
  suggestion: string;
  priority: 'high' | 'medium' | 'low';
}

export interface PropertyHealth {
  structural_score: number;
  systems_score: number;
  exterior_score: number;
  interior_score: number;
  safety_score: number;
  overall_health: number;
  risk_factors: string[];
  urgent_repairs: string[];
}

export interface VisionScore {
  overall: number;
  deal_component: number;
  health_component: number;
  vastu_component: number;
  condition_component: number;
}

export interface ScanResult {
  analysis_id?: string;
  room_type: string;
  room_confidence: number;
  condition: string;
  condition_confidence: number;
  detections: Detection[];
  renovation_costs: {
    basic_refresh: number;
    standard_rental: number;
    premium_upgrade: number;
    region: string;
    regional_multiplier: number;
    repairs: RepairEstimate[];
  };
  investment_metrics: InvestmentMetrics;
  vastu_analysis?: VastuAnalysis;
  property_health?: PropertyHealth;
  vision_score?: VisionScore;
  summary: string;
  model_version: string;
  inference_time_ms: number;
}

export interface RoomScan {
  id: string;
  room_type: string;
  direction?: string; // compass direction for Vastu
  image_data_url?: string;
  result: ScanResult;
  scanned_at: string;
}

export interface WalkthroughSession {
  id: string;
  property_address?: string;
  property_id?: string;
  started_at: string;
  completed_at?: string;
  rooms: RoomScan[];
  composite_score?: VisionScore;
  vastu_analysis?: VastuAnalysis;
  property_health?: PropertyHealth;
}

export interface ScanHistoryItem {
  id: string;
  image_data_url?: string;
  result: ScanResult;
  scanned_at: string;
  property_address?: string;
}

export interface PortfolioProperty {
  id: string;
  address: string;
  last_scanned: string;
  vision_score?: number;
  condition: string;
  room_count: number;
  total_renovation_cost: number;
  walkthrough_id?: string;
  thumbnail_url?: string;
}

// ── Live scan finding (accumulated during real-time scanning) ──

export interface LiveFinding {
  id: string;
  damage_class: string;
  severity: string;
  confidence: number;
  room_type: string;
  detected_at: string;
  frame_number: number;
}

// ── Store interface ──────────────────────────────────────────

interface VisionState {
  // Active tab
  activeTab: 'scan' | 'walkthrough' | 'portfolio' | 'settings';
  setActiveTab: (tab: VisionState['activeTab']) => void;

  // Live scanning
  isScanning: boolean;
  liveFindings: LiveFinding[];
  currentRoom: string | null;
  setScanning: (scanning: boolean) => void;
  addLiveFinding: (finding: LiveFinding) => void;
  setCurrentRoom: (room: string | null) => void;
  clearLiveFindings: () => void;

  // Scan history
  scanHistory: ScanHistoryItem[];
  addScanResult: (item: ScanHistoryItem) => void;
  removeScanResult: (id: string) => void;
  clearScanHistory: () => void;

  // Walkthrough
  activeWalkthrough: WalkthroughSession | null;
  walkthroughHistory: WalkthroughSession[];
  startWalkthrough: (propertyAddress?: string) => void;
  addRoomToWalkthrough: (room: RoomScan) => void;
  completeWalkthrough: (composite?: {
    score?: VisionScore;
    vastu?: VastuAnalysis;
    health?: PropertyHealth;
  }) => void;
  cancelWalkthrough: () => void;

  // Portfolio
  portfolioProperties: PortfolioProperty[];
  addPortfolioProperty: (property: PortfolioProperty) => void;
  removePortfolioProperty: (id: string) => void;

  // Settings
  defaultRegion: string;
  defaultPropertyValue: number | null;
  setDefaultRegion: (region: string) => void;
  setDefaultPropertyValue: (value: number | null) => void;
}

// ── Store implementation ─────────────────────────────────────

export const useVisionStore = create<VisionState>()(
  persist(
    (set, get) => ({
      // Active tab
      activeTab: 'scan',
      setActiveTab: (tab) => set({ activeTab: tab }),

      // Live scanning
      isScanning: false,
      liveFindings: [],
      currentRoom: null,
      setScanning: (scanning) => set({ isScanning: scanning }),
      addLiveFinding: (finding) =>
        set((state) => {
          // Deduplicate: skip if same damage_class + room_type already found
          const exists = state.liveFindings.some(
            (f) =>
              f.damage_class === finding.damage_class &&
              f.room_type === finding.room_type
          );
          if (exists) return state;
          return { liveFindings: [...state.liveFindings, finding] };
        }),
      setCurrentRoom: (room) => set({ currentRoom: room }),
      clearLiveFindings: () => set({ liveFindings: [], currentRoom: null }),

      // Scan history
      scanHistory: [],
      addScanResult: (item) =>
        set((state) => ({
          scanHistory: [item, ...state.scanHistory].slice(0, 100), // Keep last 100
        })),
      removeScanResult: (id) =>
        set((state) => ({
          scanHistory: state.scanHistory.filter((s) => s.id !== id),
        })),
      clearScanHistory: () => set({ scanHistory: [] }),

      // Walkthrough
      activeWalkthrough: null,
      walkthroughHistory: [],
      startWalkthrough: (propertyAddress) => {
        const session: WalkthroughSession = {
          id: `wt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          property_address: propertyAddress,
          started_at: new Date().toISOString(),
          rooms: [],
        };
        set({ activeWalkthrough: session });
      },
      addRoomToWalkthrough: (room) =>
        set((state) => {
          if (!state.activeWalkthrough) return state;
          return {
            activeWalkthrough: {
              ...state.activeWalkthrough,
              rooms: [...state.activeWalkthrough.rooms, room],
            },
          };
        }),
      completeWalkthrough: (composite) =>
        set((state) => {
          if (!state.activeWalkthrough) return state;
          const completed: WalkthroughSession = {
            ...state.activeWalkthrough,
            completed_at: new Date().toISOString(),
            composite_score: composite?.score,
            vastu_analysis: composite?.vastu,
            property_health: composite?.health,
          };
          return {
            activeWalkthrough: null,
            walkthroughHistory: [completed, ...state.walkthroughHistory].slice(0, 50),
          };
        }),
      cancelWalkthrough: () => set({ activeWalkthrough: null }),

      // Portfolio
      portfolioProperties: [],
      addPortfolioProperty: (property) =>
        set((state) => {
          // Update if exists, otherwise add
          const idx = state.portfolioProperties.findIndex((p) => p.id === property.id);
          if (idx >= 0) {
            const updated = [...state.portfolioProperties];
            updated[idx] = property;
            return { portfolioProperties: updated };
          }
          return { portfolioProperties: [property, ...state.portfolioProperties] };
        }),
      removePortfolioProperty: (id) =>
        set((state) => ({
          portfolioProperties: state.portfolioProperties.filter((p) => p.id !== id),
        })),

      // Settings
      defaultRegion: 'national_average',
      defaultPropertyValue: null,
      setDefaultRegion: (region) => set({ defaultRegion: region }),
      setDefaultPropertyValue: (value) => set({ defaultPropertyValue: value }),
    }),
    {
      name: 'vasthu-vision',
      partialize: (state) => ({
        scanHistory: state.scanHistory,
        walkthroughHistory: state.walkthroughHistory,
        portfolioProperties: state.portfolioProperties,
        defaultRegion: state.defaultRegion,
        defaultPropertyValue: state.defaultPropertyValue,
      }),
    }
  )
);
