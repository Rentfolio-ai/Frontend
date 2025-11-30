# Backend Stream Implementation Guide

This document describes what needs to be implemented on the backend to support the thinking state UI with SSE streaming.

## Overview

The frontend now uses Server-Sent Events (SSE) streaming via `/api/stream` endpoint to show real-time thinking states, tool execution progress, and streamed responses.

---

## Required Endpoint

### `POST /api/stream`

**Request Body:**
```json
{
  "message": "Find properties in Austin under $400K",
  "thread_id": "optional-existing-thread-id",
  "temperature": 0.2,
  "context": {
    "user_context": {
      "name": "John"
    }
  }
}
```

**Response:** Server-Sent Events (SSE) stream with `text/event-stream` content type

---

## SSE Event Format

All events must follow the SSE format:
```
data: {json_object}\n\n
```

Each event is a JSON object with a `type` field. The frontend expects these event types:

---

## Event Types

### 1. `init` - Connection Established

**When to send:** Immediately when stream connection opens, before any other events

**Format:**
```json
{
  "type": "init",
  "thread_id": "abc-123-def-456"
}
```

**Example SSE:**
```
data: {"type":"init","thread_id":"abc-123-def-456"}\n\n
```

---

### 2. `thinking` - AI is Processing

**When to send:** When AI decides to use a tool or is processing the request

**Format:**
```json
{
  "type": "thinking",
  "title": "Searching for properties",
  "status": "Searching for properties...",
  "explanation": "I'm searching the RentCast database to find properties that match your criteria in that area.",
  "source": "RentCast Listings API",
  "icon": "🔍",
  "tool": "scout_properties"
}
```

**Fields:**
- `title` (optional): Main action title shown as "Title >" (e.g., "Searching for properties")
- `status`: Status text (e.g., "Searching for properties...")
- `explanation` (optional): **GPT-style natural explanation** - conversational, clear, and helpful (e.g., "I'm searching the RentCast database to find properties that match your criteria in that area.")
- `source` (optional): Data source name
- `icon` (optional): Emoji icon
- `tool` (optional): Tool name

**Best Practices for GPT-style Messages:**
- Use first person ("I'm", "I'll", "I need to")
- Be conversational and natural
- Explain what you're doing and why
- Keep explanations concise but informative
- Examples:
  - ✅ "I'm analyzing the market data to give you accurate pricing and rental trends for that location."
  - ✅ "I'll search for properties matching your criteria and filter by price range and location."
  - ❌ "Searching properties database" (too technical)
  - ❌ "Processing request" (too vague)

**Example SSE:**
```
data: {"type":"thinking","title":"Searching for properties","status":"Searching for properties...","explanation":"I need to find properties matching your criteria, so I'll search the RentCast listings database for available properties in that area.","source":"RentCast Listings API","icon":"🔍","tool":"scout_properties"}\n\n
```

---

### 3. `tool_start` - Tool Execution Begins

**When to send:** When tool actually starts executing (after `thinking` event)

**Format:**
```json
{
  "type": "tool_start",
  "title": "Analyzing market data",
  "tool": "get_market_stats",
  "thinking": "Analyzing market data...",
  "explanation": "I'm fetching current market statistics including median prices, rental rates, and growth trends to give you accurate insights for this location.",
  "source": "RentCast Market Statistics",
  "icon": "📊"
}
```

**Fields:**
- `title` (optional): Main action title shown as "Title >" (e.g., "Analyzing market data")
- `tool`: Tool name
- `thinking`: Status text (e.g., "Analyzing market data...")
- `explanation` (optional): **GPT-style natural explanation** - what you're doing and what the user will get
- `source` (optional): Data source name
- `icon` (optional): Emoji icon

**Best Practices:**
- Explain what data you're gathering
- Mention what insights the user will receive
- Use natural, conversational language

**Example SSE:**
```
data: {"type":"tool_start","title":"Analyzing market data","tool":"get_market_stats","thinking":"Analyzing market data...","explanation":"I need to get current market statistics for this location, so I'll fetch median prices, rents, and market trends from RentCast to give you accurate context.","source":"RentCast Market Statistics","icon":"📊"}\n\n
```

---

### 4. `tool_end` - Tool Execution Complete

**When to send:** When tool finishes execution successfully

**Format:**
```json
{
  "type": "tool_end",
  "tool": "get_market_stats",
  "icon": "📊",
  "summary": "Market data loaded for ZIP 78701"
}
```

**Example SSE:**
```
data: {"type":"tool_end","tool":"get_market_stats","icon":"📊","summary":"Market data loaded for ZIP 78701"}\n\n
```

---

### 5. `content` - Streamed Response Text

**When to send:** As AI generates response text (can be sent multiple times)

**Format:**
```json
{
  "type": "content",
  "content": "Based on my analysis..."
}
```

**Example SSE (multiple chunks):**
```
data: {"type":"content","content":"Based on "}\n\n
data: {"type":"content","content":"my analysis "}\n\n
data: {"type":"content","content":"of the Austin market..."}\n\n
```

**Note:** Send content in small chunks for smooth streaming effect. Each chunk should be a complete word or phrase.

---

### 6. `done` - Stream Complete

**When to send:** When entire response is complete (after all content and tool events)

**Format:**
```json
{
  "type": "done"
}
```

**Example SSE:**
```
data: {"type":"done"}\n\n
```

---

### 7. `error` - Error Occurred

**When to send:** When an error occurs during processing

**Format:**
```json
{
  "type": "error",
  "error": "Failed to fetch market data"
}
```

**Example SSE:**
```
data: {"type":"error","error":"Failed to fetch market data"}\n\n
```

---

## Tool Descriptions Mapping

The backend should maintain a mapping of tool names to their human-readable descriptions:

```python
TOOL_DESCRIPTIONS = {
    "scout_properties": {
        "thinking": "Searching for properties...",
        "source": "RentCast Listings API",
        "icon": "🔍"
    },
    "get_market_stats": {
        "thinking": "Analyzing market data...",
        "source": "RentCast Market Statistics",
        "icon": "📊"
    },
    "request_pnl_calculation": {
        "thinking": "Running P&L calculations...",
        "source": "Civitas Calculation Engine",
        "icon": "🧮"
    },
    "request_metrics_calculation": {
        "thinking": "Computing investment metrics...",
        "source": "Civitas Calculation Engine",
        "icon": "📈"
    },
    "check_compliance": {
        "thinking": "Checking regulations and compliance...",
        "source": "Regulatory Database",
        "icon": "📋"
    },
    "compare_properties": {
        "thinking": "Comparing properties side-by-side...",
        "source": "Property Comparison Engine",
        "icon": "⚖️"
    },
    "get_property_details": {
        "thinking": "Fetching property details...",
        "source": "RentCast Property Records",
        "icon": "🏠"
    },
    "generate_report": {
        "thinking": "Generating investment report...",
        "source": "Report Generator",
        "icon": "📄"
    },
    "analyze_property_image": {
        "thinking": "Analyzing property image...",
        "source": "Vision AI Analysis",
        "icon": "🖼️"
    },
    "analyze_renovation_from_image": {
        "thinking": "Estimating renovation costs...",
        "source": "Renovation Estimator",
        "icon": "🔨"
    },
    "portfolio_analyzer_tool": {
        "thinking": "Analyzing portfolio...",
        "source": "Portfolio Analytics",
        "icon": "💼"
    },
    "cashflow_timeseries_tool": {
        "thinking": "Analyzing cash flow history...",
        "source": "Cash Flow Analytics",
        "icon": "💵"
    },
}
```

---

## Implementation Example (Python/FastAPI)

```python
from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse
import json
import asyncio

app = FastAPI()

TOOL_DESCRIPTIONS = {
    # ... (as defined above)
}

@app.post("/api/stream")
async def stream_chat(request: Request):
    """
    SSE streaming endpoint for chat with thinking states
    """
    body = await request.json()
    message = body.get("message")
    thread_id = body.get("thread_id")
    temperature = body.get("temperature", 0.2)
    context = body.get("context", {})
    
    async def generate_events():
        # 1. Send init event
        new_thread_id = thread_id or generate_thread_id()
        yield f"data: {json.dumps({'type': 'init', 'thread_id': new_thread_id})}\n\n"
        
        try:
            # 2. Send initial thinking state
            yield f"data: {json.dumps({'type': 'thinking', 'status': 'Understanding your request...', 'icon': '🤔'})}\n\n"
            
            # 3. Process message and determine tools needed
            tools_to_use = await determine_tools(message)
            
            for tool_name in tools_to_use:
                tool_info = TOOL_DESCRIPTIONS.get(tool_name, {
                    "thinking": f"Running {tool_name}...",
                    "source": "System",
                    "icon": "⚙️"
                })
                
                # 4. Send thinking event with title and explanation
                thinking_title = tool_info.get('title') or tool_name.replace('_', ' ').title()
                thinking_explanation = tool_info.get('explanation') or f"I need to {tool_info['thinking'].lower()}"
                yield f"data: {json.dumps({'type': 'thinking', 'title': thinking_title, 'status': tool_info['thinking'], 'explanation': thinking_explanation, 'source': tool_info.get('source'), 'icon': tool_info.get('icon'), 'tool': tool_name})}\n\n"
                
                # 5. Send tool_start event with title and explanation
                yield f"data: {json.dumps({'type': 'tool_start', 'title': thinking_title, 'tool': tool_name, 'thinking': tool_info['thinking'], 'explanation': thinking_explanation, 'source': tool_info.get('source'), 'icon': tool_info.get('icon')})}\n\n"
                
                # 6. Execute tool
                try:
                    tool_result = await execute_tool(tool_name, message, context)
                    
                    # 7. Send tool_end event
                    summary = generate_tool_summary(tool_name, tool_result)
                    yield f"data: {json.dumps({'type': 'tool_end', 'tool': tool_name, 'icon': tool_info.get('icon'), 'summary': summary})}\n\n"
                    
                except Exception as e:
                    yield f"data: {json.dumps({'type': 'error', 'error': f'Tool {tool_name} failed: {str(e)}'})}\n\n"
                    return
            
            # 8. Generate and stream response content
            response_text = await generate_response(message, tools_to_use, tool_results)
            
            # Stream content in chunks
            words = response_text.split()
            current_chunk = ""
            
            for word in words:
                current_chunk += word + " "
                if len(current_chunk) > 20:  # Send chunks of ~20 chars
                    yield f"data: {json.dumps({'type': 'content', 'content': current_chunk})}\n\n"
                    current_chunk = ""
                    await asyncio.sleep(0.05)  # Small delay for smooth streaming
            
            # Send remaining content
            if current_chunk:
                yield f"data: {json.dumps({'type': 'content', 'content': current_chunk})}\n\n"
            
            # 9. Send done event
            yield f"data: {json.dumps({'type': 'done'})}\n\n"
            
        except Exception as e:
            yield f"data: {json.dumps({'type': 'error', 'error': str(e)})}\n\n"
    
    return StreamingResponse(
        generate_events(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"  # Disable nginx buffering
        }
    )
```

---

## Event Flow Example

Here's the expected sequence for a typical request:

```
1. data: {"type":"init","thread_id":"abc-123"}\n\n

2. data: {"type":"thinking","status":"Understanding your request...","icon":"🤔"}\n\n

3. data: {"type":"thinking","title":"Searching for properties","status":"Searching for properties...","explanation":"I need to find properties matching your criteria, so I'll search the RentCast listings database for available properties in that area.","source":"RentCast Listings API","icon":"🔍","tool":"scout_properties"}\n\n

4. data: {"type":"tool_start","title":"Searching for properties","tool":"scout_properties","thinking":"Searching for properties...","explanation":"I need to find properties matching your criteria, so I'll search the RentCast listings database for available properties in that area.","source":"RentCast Listings API","icon":"🔍"}\n\n

5. data: {"type":"tool_end","tool":"scout_properties","icon":"🔍","summary":"Found 12 properties, showing 10"}\n\n

6. data: {"type":"thinking","title":"Analyzing market data","status":"Analyzing market data...","explanation":"I need to get current market statistics for this location, so I'll fetch median prices, rents, and market trends from RentCast to give you accurate context.","source":"RentCast Market Statistics","icon":"📊","tool":"get_market_stats"}\n\n

7. data: {"type":"tool_start","title":"Analyzing market data","tool":"get_market_stats","thinking":"Analyzing market data...","explanation":"I need to get current market statistics for this location, so I'll fetch median prices, rents, and market trends from RentCast to give you accurate context.","source":"RentCast Market Statistics","icon":"📊"}\n\n

8. data: {"type":"tool_end","tool":"get_market_stats","icon":"📊","summary":"Market data loaded for ZIP 78744"}\n\n

9. data: {"type":"content","content":"Based on "}\n\n

10. data: {"type":"content","content":"my analysis "}\n\n

11. data: {"type":"content","content":"of the Austin market..."}\n\n

12. data: {"type":"done"}\n\n
```

---

## Important Notes

1. **SSE Format:** Each event must end with `\n\n` (double newline)
2. **JSON Encoding:** All JSON must be properly escaped
3. **Error Handling:** Always send `error` or `done` event to close the stream
4. **Content Chunking:** Send content in small chunks (words or phrases) for smooth streaming
5. **Thread ID:** Generate new thread_id if not provided, return it in `init` event
6. **CORS:** Ensure CORS headers allow SSE connections from frontend origin
7. **Headers:** Set proper SSE headers (`text/event-stream`, `Cache-Control: no-cache`)

---

## Testing

You can test the endpoint with curl:

```bash
curl -X POST http://localhost:8000/api/stream \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-key" \
  -d '{"message": "What is the market like in Austin?"}' \
  --no-buffer
```

Expected output should show SSE events as described above.

---

## Quick Action Pills (No Special Backend Handling Required)

The frontend includes "quick action pills" (buttons) in the empty state that help new users get started. These pills simply send predefined queries as regular messages to the `/api/stream` endpoint.

**Example pill queries:**
- `"Show me investment properties in Austin, TX under $500k with good rental potential"`
- `"I want to analyze a rental property. What information do you need to calculate my potential returns?"`
- `"What are the best markets for rental property investing right now? Show me data on prices, rents, and growth."`
- `"I'm new to real estate investing. Can you walk me through the basics and what I should know?"`

**Backend Requirements:**
- ✅ **No special handling needed** - These are just regular user messages
- ✅ Handle them through the normal `/api/stream` flow
- ✅ Provide appropriate responses using the same tools and logic

**Optional Enhancements:**
- You could detect these specific queries and provide more beginner-friendly, detailed responses
- For the "Get started guide" query, consider providing a comprehensive, educational response
- You could track if a user is new (no previous messages) and adjust response tone/level of detail

---

## Backward Compatibility

The frontend still supports the old `/api/chat` endpoint as a fallback. However, the new `/api/stream` endpoint provides a better user experience with real-time thinking states.

If `/api/stream` is not available or returns an error, the frontend will fall back to the existing chat flow (though without thinking states).
