# Backend Integration Guide - Conversational Settings

## Overview
The frontend is ready to handle conversational settings changes. Users can say things like "turn off email notifications" in the chat, and the backend should respond with tool calls that the frontend will execute.

## API Endpoint Required

### `POST /api/chat`

**Request Body:**
```json
{
  "message": "Turn off email notifications",
  "history": [
    {
      "role": "user",
      "content": "Previous message"
    },
    {
      "role": "assistant",
      "content": "Previous response"
    }
  ],
  "context": {
    "settings": {
      "emailNotifications": true,
      "marketAlerts": true,
      "roiAlerts": true,
      "pushNotifications": false,
      "theme": "auto",
      "aiVerbosity": "balanced",
      "autoSuggest": true,
      "currency": "USD",
      "dateFormat": "MM/DD/YYYY"
    },
    "user": {
      "id": "123",
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
}
```

**Response Format:**
```json
{
  "message": "I've turned off email notifications for you. You won't receive property updates via email anymore.",
  "toolCalls": [
    {
      "name": "updateUserSettings",
      "parameters": {
        "emailNotifications": false
      }
    }
  ]
}
```

## Available Tools

### 1. `updateUserSettings`
Updates user preferences and notification settings.

**Parameters:**
- `emailNotifications` (boolean) - Email notification toggle
- `marketAlerts` (boolean) - Market alerts toggle
- `roiAlerts` (boolean) - ROI alerts toggle
- `pushNotifications` (boolean) - Push notifications toggle
- `theme` (string: 'light' | 'dark' | 'auto') - UI theme
- `aiVerbosity` (string: 'concise' | 'balanced' | 'detailed') - AI response verbosity
- `autoSuggest` (boolean) - Auto-suggest feature toggle
- `currency` (string: 'USD' | 'EUR' | 'GBP') - Display currency
- `dateFormat` (string: 'MM/DD/YYYY' | 'DD/MM/YYYY') - Date format preference

**Example:**
```json
{
  "name": "updateUserSettings",
  "parameters": {
    "emailNotifications": false,
    "marketAlerts": true
  }
}
```

### 2. `updateUserProfile`
Updates user profile information.

**Parameters:**
- `name` (string) - User's full name
- `email` (string) - User's email address

**Example:**
```json
{
  "name": "updateUserProfile",
  "parameters": {
    "name": "Jane Smith"
  }
}
```

## LLM System Prompt Suggestion

```text
You are Civitas AI, a real estate investment assistant. You can help users manage their settings and preferences through conversation.

Available tools:
1. updateUserSettings - Update notification preferences, theme, AI behavior, and display settings
2. updateUserProfile - Update user profile information

When a user asks to change settings or profile info, use the appropriate tool.

Examples:
- "Turn off email notifications" → updateUserSettings({ emailNotifications: false })
- "Change my name to John" → updateUserProfile({ name: "John" })
- "Enable dark mode" → updateUserSettings({ theme: "dark" })
- "Disable all notifications" → updateUserSettings({ emailNotifications: false, marketAlerts: false, roiAlerts: false, pushNotifications: false })

Always confirm the changes in a friendly, conversational way.
```

## Example User Queries

- "Turn off email notifications"
- "Enable market alerts"
- "Change theme to dark mode"
- "Disable all notifications"
- "Set AI verbosity to detailed"
- "Change my name to Jane Smith"
- "Enable push notifications and disable ROI alerts"
- "Switch to light theme"

## Frontend Implementation

The frontend will:
1. Send user message to `/api/chat`
2. Receive response with `toolCalls` array
3. Execute each tool call locally (update Zustand store)
4. Display the LLM's message as confirmation

The Settings tab UI will automatically update in real-time due to Zustand reactivity.

## Testing

You can test the integration by:
1. Sending a mock response from your backend with toolCalls
2. Verifying the frontend executes the tool and updates the UI
3. Checking that the Settings tab reflects the changes immediately

## Notes

- Tool calls are executed **client-side** to update local state instantly
- The backend should **persist** these changes to the database
- The LLM should include current settings in context to provide accurate responses
- Multiple tool calls can be returned in a single response
