# Backend Emoji Integration Guide

## Quick Copy-Paste for Your Backend

### Add to System Prompt
```python
EMOJI_GUIDELINES = """
Include contextual emojis in your responses:

PROPERTY & REAL ESTATE:
🏠 - Properties, homes  
🏢 - Commercial buildings
📍 - Locations
🔑 - Opportunities

FINANCIAL:
💰 - Money, pricing
💵 - Cash flow
📊 - Statistics, data
📈 - Growth, positive trends
📉 - Decline, concerns

ANALYSIS:
🔍 - Investigation, details
🎯 - Goals, targets
✅ - Confirmed, recommended
⚠️ - Cautions, risks
❌ - Not recommended

SENTIMENT:
✨ - Excellent features
🌟 - Highly recommended  
🚀 - High potential
🔥 - Hot opportunity
💎 - Hidden gem

RULES:
1. Use 1-3 emojis per response
2. Place at section starts or key points
3. Match emoji to context
4. Maintain professional tone
"""
```

### Example Integration
```python
SYSTEM_PROMPT = f"""
You are Civitas AI, a real estate investment advisor.

{EMOJI_GUIDELINES}

Respond with helpful insights...
"""
```

### Example Output
```
🏠 **Property Overview**
3-bedroom, 2-bath single-family home

💰 **Financial Analysis**
- Purchase: $450,000
- Monthly rent: $2,800

✅ **Strengths**
- Strong rental demand
-  Recent renovations

⚠️ **Considerations**  
- HOA fees above average

🎯 **Investment Summary**
Solid cash flow opportunity
```

## Files to Update

Look in `/DataLayer/app/services/`:
- `llm_service.py` - Main LLM integration
- `agent/prompts.py` - Prompt templates  
- `tools/*.py` - Tool-specific prompts

Add `EMOJI_GUIDELINES` to your system prompts.

## Testing

```python
# Test query
query = "Find properties in Austin under $500K"

# Expected emojis in response
expected = ["🏠", "💰", "📍"]

# Verify presence
response = get_llm_response(query)
assert any(emoji in response for emoji in expected)
```

That'sit! Emojis will now appear in AI responses automatically.
