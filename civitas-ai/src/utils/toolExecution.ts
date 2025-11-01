import { useSettingsStore } from '../stores/settingsStore';

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
    
    // TODO: Implement actual profile update via API
    // In a real implementation, this would call an API endpoint
    // For now, return not implemented error
    
    return {
      success: false,
      error: 'Update user profile not implemented',
      message: 'Profile update functionality will be available in a future release',
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
  
  // Attempt to retrieve user from localStorage
  let user: { id?: string; name?: string; email?: string } | undefined;
  
  if (typeof window !== 'undefined') {
    try {
      const userStr = window.localStorage.getItem('civitas-user');
      if (userStr) {
        const parsed = JSON.parse(userStr);
        user = {
          id: parsed.id,
          name: parsed.name,
          email: parsed.email
        };
      }
    } catch (error) {
      console.error('Failed to parse user from localStorage:', error);
    }
  }
  
  return {
    ...getContextForChat(),
    ...(user && { user })
  };
}
