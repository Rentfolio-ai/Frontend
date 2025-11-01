import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SettingsState {
  // Theme & Appearance
  theme: 'light' | 'dark' | 'auto';
  selectedState: string;
  
  // Notifications
  emailNotifications: boolean;
  marketAlerts: boolean;
  roiAlerts: boolean;
  pushNotifications: boolean;
  
  // AI Preferences
  aiVerbosity: 'concise' | 'balanced' | 'detailed';
  autoSuggest: boolean;
  
  // Display Preferences
  currency: 'USD' | 'EUR' | 'GBP';
  dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY';
  
  // Actions
  setTheme: (theme: 'light' | 'dark' | 'auto') => void;
  setSelectedState: (state: string) => void;
  setEmailNotifications: (enabled: boolean) => void;
  setMarketAlerts: (enabled: boolean) => void;
  setRoiAlerts: (enabled: boolean) => void;
  setPushNotifications: (enabled: boolean) => void;
  setAiVerbosity: (level: 'concise' | 'balanced' | 'detailed') => void;
  setAutoSuggest: (enabled: boolean) => void;
  setCurrency: (currency: 'USD' | 'EUR' | 'GBP') => void;
  setDateFormat: (format: 'MM/DD/YYYY' | 'DD/MM/YYYY') => void;
  resetSettings: () => void;
  updateSettings: (updates: Partial<Omit<SettingsState, 'setTheme' | 'setSelectedState' | 'setEmailNotifications' | 'setMarketAlerts' | 'setRoiAlerts' | 'setPushNotifications' | 'setAiVerbosity' | 'setAutoSuggest' | 'setCurrency' | 'setDateFormat' | 'resetSettings' | 'updateSettings' | 'getContextForChat'>>) => void;
  getContextForChat: () => { settings: Omit<SettingsState, 'setTheme' | 'setSelectedState' | 'setEmailNotifications' | 'setMarketAlerts' | 'setRoiAlerts' | 'setPushNotifications' | 'setAiVerbosity' | 'setAutoSuggest' | 'setCurrency' | 'setDateFormat' | 'resetSettings' | 'updateSettings' | 'getContextForChat'> };
}

const initialState = {
  theme: 'auto' as const,
  selectedState: '',
  emailNotifications: true,
  marketAlerts: true,
  roiAlerts: true,
  pushNotifications: false,
  aiVerbosity: 'balanced' as const,
  autoSuggest: true,
  currency: 'USD' as const,
  dateFormat: 'MM/DD/YYYY' as const,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      setTheme: (theme) => set({ theme }),
      setSelectedState: (selectedState) => set({ selectedState }),
      setEmailNotifications: (emailNotifications) => set({ emailNotifications }),
      setMarketAlerts: (marketAlerts) => set({ marketAlerts }),
      setRoiAlerts: (roiAlerts) => set({ roiAlerts }),
      setPushNotifications: (pushNotifications) => set({ pushNotifications }),
      setAiVerbosity: (aiVerbosity) => set({ aiVerbosity }),
      setAutoSuggest: (autoSuggest) => set({ autoSuggest }),
      setCurrency: (currency) => set({ currency }),
      setDateFormat: (dateFormat) => set({ dateFormat }),
      resetSettings: () => set(initialState),
      
      // Batch update for tool execution
      updateSettings: (updates: Partial<Omit<SettingsState, 'setTheme' | 'setSelectedState' | 'setEmailNotifications' | 'setMarketAlerts' | 'setRoiAlerts' | 'setPushNotifications' | 'setAiVerbosity' | 'setAutoSuggest' | 'setCurrency' | 'setDateFormat' | 'resetSettings' | 'updateSettings' | 'getContextForChat'>>) => set(updates),
      
      // Get context for chat API
      getContextForChat: () => {
        const state = get();
        return {
          settings: {
            emailNotifications: state.emailNotifications,
            marketAlerts: state.marketAlerts,
            roiAlerts: state.roiAlerts,
            pushNotifications: state.pushNotifications,
            theme: state.theme,
            aiVerbosity: state.aiVerbosity,
            autoSuggest: state.autoSuggest,
            currency: state.currency,
            dateFormat: state.dateFormat,
          },
        };
      },
    }),
    {
      name: 'civitas-settings',
    }
  )
);
