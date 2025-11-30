# Backend Integration Guide: Streaming Thinking State

To fully power the frontend's "Thinking State" UI, your backend should stream Server-Sent Events (SSE) with the following JSON structure.

## Event Types

### 1. `thinking`
Sent when the AI is planning or processing, but not running a specific tool yet.

```json
{
  "type": "thinking",
  "status": "Searching for properties...",
  "explanation": "I need to find condos in Miami under $500k.",
  "source": "Checking Zillow..."
}
```

### 2. `tool_start`
Sent immediately before a tool execution begins.

```json
{
  "type": "tool_start",
  "tool": "market_search",
  "thinking": "Searching for properties...",
  "source": "Zillow API"
}
```

### 3. `tool_end`
Sent when a tool execution completes. This adds a "step" to the UI (e.g., "✓ Market Search").

```json
{
  "type": "tool_end",
  "tool": "market_search",
  "summary": "Found 7 properties",
  "icon": "✓"
}
```

### 4. `content`
Sent for chunks of the final text response.

```json
{
  "type": "content",
  "content": "Here are the "
}
```

## Example Flow

1.  **User**: "Find me a condo."
2.  **Backend Streams**:
    *   `{"type": "thinking", "status": "Searching for properties..."}`
    *   `{"type": "tool_start", "tool": "search", "thinking": "Checking Zillow..."}`
    *   *(Tool runs...)*
    *   `{"type": "tool_end", "tool": "search", "summary": "Found 5 condos"}`
    *   `{"type": "thinking", "status": "Analyzing results..."}`
    *   `{"type": "content", "content": "I found..."}`
