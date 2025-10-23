import { useSettingsStore } from '../stores/settingsStore';
import { useAuth } from '../contexts/AuthContext';

export interface ToolCall {
  name: string;
  parameters: Record<string, any>;
}

export interface ToolExecutionResult {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * Execute tool calls returned from the chat API
 */
export function executeToolCalls(toolCalls: ToolCall[]): ToolExecutionResult[] {
  const results: ToolExecutionResult[] = [];

  for (const toolCall of toolCalls) {
    try {
      const result = executeSingleTool(toolCall);
      results.push(result);
    } catch (error) {
      results.push({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  return results;
}

/**
 * Execute a single tool call
 */
function executeSingleTool(toolCall: ToolCall): ToolExecutionResult {
  switch (toolCall.name) {
    case 'updateUserSettings':
      return executeUpdateUserSettings(toolCall.parameters);
    
    case 'updateUserProfile':
      return executeUpdateUserProfile(toolCall.parameters);
    
    default:
      return {
        success: false,
        error: `Unknown tool: ${toolCall.name}`,
      };
  }
}

/**
 * Update user settings
 */
function executeUpdateUserSettings(parameters: Record<string, any>): ToolExecutionResult {
  try {
    const { updateSettings } = useSettingsStore.getState();
    
    // Map parameters to settings store format
    const updates: Record<string, any> = {};
    
    if ('emailNotifications' in parameters) {
      updates.emailNotifications = parameters.emailNotifications;
    }
    if ('marketAlerts' in parameters) {
      updates.marketAlerts = parameters.marketAlerts;
    }
    if ('roiAlerts' in parameters) {
      updates.roiAlerts = parameters.roiAlerts;
    }
    if ('pushNotifications' in parameters) {
      updates.pushNotifications = parameters.pushNotifications;
    }
    if ('theme' in parameters) {
      updates.theme = parameters.theme;
    }
    if ('aiVerbosity' in parameters) {
      updates.aiVerbosity = parameters.aiVerbosity;
    }
    if ('autoSuggest' in parameters) {
      updates.autoSuggest = parameters.autoSuggest;
    }
    if ('currency' in parameters) {
      updates.currency = parameters.currency;
    }
    if ('dateFormat' in parameters) {
      updates.dateFormat = parameters.dateFormat;
    }
    
    updateSettings(updates);
    
    return {
      success: true,
      message: 'Settings updated successfully',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update settings',
    };
  }
}

/**
 * Update user profile
 * Note: This requires integration with AuthContext
 */
function executeUpdateUserProfile(parameters: Record<string, any>): ToolExecutionResult {
  try {
    // TODO: Implement actual profile update via API
    // For now, just validate the parameters
    
    if (parameters.name && typeof parameters.name !== 'string') {
      return {
        success: false,
        error: 'Invalid name parameter',
      };
    }
    
    if (parameters.email && typeof parameters.email !== 'string') {
      return {
        success: false,
        error: 'Invalid email parameter',
      };
    }
    
    // In a real implementation, this would call an API endpoint
    console.log('Profile update requested:', parameters);
    
    return {
      success: true,
      message: 'Profile updated successfully',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update profile',
    };
  }
}

/**
 * Get current context for chat API
 */
export function getChatContext() {
  const { getContextForChat } = useSettingsStore.getState();
  
  // TODO: Add user context from AuthContext
  return {
    ...getContextForChat(),
    user: {
      id: '123', // Replace with actual user ID
      name: 'John Doe', // Replace with actual user name
      email: 'john@example.com', // Replace with actual user email
    },
  };
}
