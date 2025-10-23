// FILE: src/services/toolExecutor.ts
import { useSettingsStore } from '../stores/settingsStore';

export interface ToolCall {
  name: string;
  parameters: Record<string, any>;
}

export interface ToolResult {
  success: boolean;
  message: string;
  data?: any;
}

/**
 * Executes tool calls received from the backend LLM
 */
export const executeToolCall = (toolCall: ToolCall): ToolResult => {
  const { name, parameters } = toolCall;

  switch (name) {
    case 'updateUserSettings':
      return updateUserSettings(parameters);
    
    case 'updateUserProfile':
      return updateUserProfile(parameters);
    
    default:
      return {
        success: false,
        message: `Unknown tool: ${name}`,
      };
  }
};

/**
 * Update user settings (notifications, preferences, etc.)
 */
const updateUserSettings = (params: Record<string, any>): ToolResult => {
  const store = useSettingsStore.getState();
  const updates: string[] = [];

  if ('emailNotifications' in params) {
    store.setEmailNotifications(params.emailNotifications);
    updates.push(`Email notifications ${params.emailNotifications ? 'enabled' : 'disabled'}`);
  }

  if ('marketAlerts' in params) {
    store.setMarketAlerts(params.marketAlerts);
    updates.push(`Market alerts ${params.marketAlerts ? 'enabled' : 'disabled'}`);
  }

  if ('roiAlerts' in params) {
    store.setRoiAlerts(params.roiAlerts);
    updates.push(`ROI alerts ${params.roiAlerts ? 'enabled' : 'disabled'}`);
  }

  if ('pushNotifications' in params) {
    store.setPushNotifications(params.pushNotifications);
    updates.push(`Push notifications ${params.pushNotifications ? 'enabled' : 'disabled'}`);
  }

  if ('theme' in params) {
    store.setTheme(params.theme);
    updates.push(`Theme set to ${params.theme}`);
  }

  if ('aiVerbosity' in params) {
    store.setAiVerbosity(params.aiVerbosity);
    updates.push(`AI verbosity set to ${params.aiVerbosity}`);
  }

  if ('autoSuggest' in params) {
    store.setAutoSuggest(params.autoSuggest);
    updates.push(`Auto-suggest ${params.autoSuggest ? 'enabled' : 'disabled'}`);
  }

  if ('currency' in params) {
    store.setCurrency(params.currency);
    updates.push(`Currency set to ${params.currency}`);
  }

  if ('dateFormat' in params) {
    store.setDateFormat(params.dateFormat);
    updates.push(`Date format set to ${params.dateFormat}`);
  }

  return {
    success: true,
    message: updates.join(', '),
    data: params,
  };
};

/**
 * Update user profile information
 */
const updateUserProfile = (params: Record<string, any>): ToolResult => {
  // This would typically call an API to update user profile
  // For now, we'll just return success
  const updates: string[] = [];

  if ('name' in params) {
    updates.push(`Name updated to ${params.name}`);
  }

  if ('email' in params) {
    updates.push(`Email updated to ${params.email}`);
  }

  // TODO: Integrate with AuthContext to update user info
  console.log('Profile update requested:', params);

  return {
    success: true,
    message: updates.join(', '),
    data: params,
  };
};
