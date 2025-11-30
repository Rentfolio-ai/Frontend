# Backend Onboarding Tour API

This document specifies the backend API endpoints required for the ProphetAtlas onboarding tour feature.

## Base URL

All endpoints are prefixed with `/api/onboarding`

**Base URL:** `{VITE_CIVITAS_API_URL}/api/onboarding`

---

## Endpoints

### 1. Get Onboarding Steps

Fetches the list of onboarding tour steps to display.

**Endpoint:** `GET /api/onboarding/steps`

**Headers:**
```
Content-Type: application/json
X-API-Key: <optional_api_key>  # If API key authentication is enabled
```

**Query Parameters:** None

**Response (200 OK):**
```json
{
  "steps": [
    {
      "id": "chat",
      "tab": "chat",
      "title": "Chat with ProphetAtlas",
      "description": "Ask me anything about properties, markets, or investments. I can analyze deals, generate reports, and provide real-time market insights.",
      "duration": 18,
      "order": 1,
      "enabled": true
    },
    {
      "id": "reports",
      "tab": "reports",
      "title": "View Your Reports",
      "description": "Access all your saved investment reports here. I generate comprehensive analyses that you can review anytime.",
      "duration": 18,
      "order": 2,
      "enabled": true
    },
    {
      "id": "settings",
      "tab": "settings",
      "title": "Customize Your Experience",
      "description": "Set your preferred state, notification preferences, and theme. I'll remember your choices for future sessions.",
      "duration": 18,
      "order": 3,
      "enabled": true
    }
  ],
  "version": "1.0.0"
}
```

**Response Schema:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `steps` | `Array<OnboardingStep>` | Yes | Array of onboarding steps |
| `version` | `string` | No | API version (optional) |

**OnboardingStep Schema:**

| Field | Type | Required | Description | Valid Values |
|-------|------|----------|-------------|--------------|
| `id` | `string` | Yes | Unique identifier for the step | Any string (e.g., "chat", "reports", "settings") |
| `tab` | `string` | Yes | Tab to navigate to during this step | `"chat"`, `"reports"`, `"settings"` |
| `title` | `string` | Yes | Step title displayed in tour card | Any string |
| `description` | `string` | Yes | Step description text | Any string |
| `duration` | `number` | Yes | Auto-advance duration in seconds | 15-20 recommended |
| `order` | `number` | Yes | Display order (1-based) | Positive integer |
| `enabled` | `boolean` | Yes | Whether step is active | `true` or `false` |

**Error Responses:**

- `500 Internal Server Error`: Server error
  ```json
  {
    "error": "Internal server error",
    "message": "Failed to fetch onboarding steps"
  }
  ```

**Notes:**
- Steps are filtered by `enabled: true` on the frontend
- Steps are sorted by `order` field (ascending)
- If the API is unavailable, the frontend falls back to default steps

---

### 2. Complete Onboarding

Marks onboarding as completed or skipped and tracks analytics.

**Endpoint:** `POST /api/onboarding/complete`

**Headers:**
```
Content-Type: application/json
X-API-Key: <optional_api_key>  # If API key authentication is enabled
```

**Request Body:**
```json
{
  "completed": true,
  "steps_completed": 3,
  "skipped": false,
  "duration_seconds": 54
}
```

**Request Schema:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `completed` | `boolean` | Yes | Whether user completed the tour |
| `steps_completed` | `number` | Yes | Number of steps completed (0 to total_steps) |
| `skipped` | `boolean` | Yes | Whether user skipped the tour |
| `duration_seconds` | `number` | Yes | Total time spent in tour (seconds) |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Onboarding completed successfully",
  "redirect_to_tab": "chat"
}
```

**Response Schema:**

| Field | Type | Required | Description | Valid Values |
|-------|------|----------|-------------|--------------|
| `success` | `boolean` | Yes | Whether the operation succeeded | `true` or `false` |
| `message` | `string` | No | Optional success message | Any string |
| `redirect_to_tab` | `string` | Yes | Tab to navigate to after completion | `"chat"`, `"reports"`, or `"settings"` |

**Error Responses:**

- `400 Bad Request`: Invalid request body
  ```json
  {
    "error": "Validation error",
    "message": "Missing required field: completed"
  }
  ```

- `500 Internal Server Error`: Server error
  ```json
  {
    "error": "Internal server error",
    "message": "Failed to save onboarding completion"
  }
  ```

**Notes:**
- This endpoint should store the completion status in the user's profile
- Analytics data (steps_completed, duration_seconds) can be logged for insights
- If `skipped: true`, `steps_completed` indicates how many steps were viewed before skipping

---

### 3. Check Onboarding Status

Checks whether the user has completed onboarding.

**Endpoint:** `GET /api/onboarding/status`

**Headers:**
```
Content-Type: application/json
X-API-Key: <optional_api_key>  # If API key authentication is enabled
```

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | `string` | No | User ID to check status for (optional) |

**Response (200 OK):**
```json
{
  "completed": true,
  "completed_at": "2024-01-15T10:30:00Z"
}
```

**Response Schema:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `completed` | `boolean` | Yes | Whether user has completed onboarding |
| `completed_at` | `string` | No | ISO 8601 timestamp of completion (optional) |

**Error Responses:**

- `401 Unauthorized`: User not authenticated
  ```json
  {
    "error": "Unauthorized",
    "message": "Authentication required"
  }
  ```

- `500 Internal Server Error`: Server error
  ```json
  {
    "error": "Internal server error",
    "message": "Failed to check onboarding status"
  }
  ```

**Notes:**
- This endpoint should check the user's profile/account for onboarding completion status
- If user is not authenticated, return `completed: false` or 401

---

## Authentication

All endpoints should support the same authentication mechanism as other ProphetAtlas APIs:

- **API Key:** `X-API-Key` header (if enabled)
- **Session/Token:** Standard authentication headers (if user-based auth is implemented)

---

## Example Implementation Flow

### Frontend Flow:

1. **On App Load:**
   - Frontend calls `GET /api/onboarding/status?user_id=<user_id>` (if user is authenticated)
   - If `completed: false`, show onboarding tour
   - If `completed: true`, skip onboarding

2. **On Tour Start:**
   - Frontend calls `GET /api/onboarding/steps`
   - Displays steps in order, filtered by `enabled: true`
   - Automatically navigates to each tab as steps progress

3. **On Tour Complete/Skip:**
   - Frontend calls `POST /api/onboarding/complete`
   - Sends analytics data (steps_completed, duration_seconds, skipped)
   - Receives `redirect_to_tab` in response
   - Navigates to the specified tab (typically "chat")

### Backend Flow:

1. **Get Steps:**
   - Query database/config for onboarding steps
   - Return steps sorted by `order`
   - Filter by `enabled: true` (optional, frontend also filters)

2. **Complete Onboarding:**
   - Update user profile: `onboarding_completed = true`
   - Store completion timestamp
   - Log analytics data (optional)

3. **Check Status:**
   - Query user profile for `onboarding_completed` field
   - Return status and optional timestamp

---

## Database Schema (Suggested)

### User Table
```sql
ALTER TABLE users ADD COLUMN onboarding_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN onboarding_completed_at TIMESTAMP;
```

### Onboarding Steps Table (Optional - for dynamic configuration)
```sql
CREATE TABLE onboarding_steps (
  id VARCHAR(50) PRIMARY KEY,
  tab VARCHAR(20) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  duration INTEGER NOT NULL,
  step_order INTEGER NOT NULL,
  enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Onboarding Analytics Table (Optional)
```sql
CREATE TABLE onboarding_analytics (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  completed BOOLEAN NOT NULL,
  steps_completed INTEGER NOT NULL,
  skipped BOOLEAN NOT NULL,
  duration_seconds INTEGER NOT NULL,
  completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Default Steps (Fallback)

If the backend API is unavailable, the frontend uses these default steps:

```json
{
  "steps": [
    {
      "id": "chat",
      "tab": "chat",
      "title": "Chat with ProphetAtlas",
      "description": "Ask me anything about properties, markets, or investments. I can analyze deals, generate reports, and provide real-time market insights.",
      "duration": 18,
      "order": 1,
      "enabled": true
    },
    {
      "id": "reports",
      "tab": "reports",
      "title": "View Your Reports",
      "description": "Access all your saved investment reports here. I generate comprehensive analyses that you can review anytime.",
      "duration": 18,
      "order": 2,
      "enabled": true
    },
    {
      "id": "settings",
      "tab": "settings",
      "title": "Customize Your Experience",
      "description": "Set your preferred state, notification preferences, and theme. I'll remember your choices for future sessions.",
      "duration": 18,
      "order": 3,
      "enabled": true
    }
  ]
}
```

---

## Testing

### Test Cases:

1. **Get Steps:**
   - ✅ Returns valid steps array
   - ✅ Steps are sorted by order
   - ✅ Disabled steps are filtered (or returned with enabled: false)

2. **Complete Onboarding:**
   - ✅ Successfully saves completion status
   - ✅ Handles skipped tours
   - ✅ Validates required fields

3. **Check Status:**
   - ✅ Returns correct completion status
   - ✅ Handles unauthenticated users
   - ✅ Returns false for new users

---

## Environment Variables

The frontend expects these environment variables:

- `VITE_CIVITAS_API_URL`: Base URL for the API (default: `http://localhost:8000`)
- `VITE_API_KEY`: Optional API key for authentication

---

## Version History

- **v1.0.0** (2024-01-15): Initial API specification

