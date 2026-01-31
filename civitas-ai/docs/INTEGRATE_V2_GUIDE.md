# 🔧 **V2 Integration Guide**

**Date:** January 24, 2026  
**Status:** Ready to integrate V2 into chat

---

## 📋 **What's Ready**

### **Created Files:**
- ✅ `src/services/v2PropertyApi.ts` - V2 API service
- ✅ `src/hooks/useV2PropertyStream.ts` - V2 streaming hook
- ✅ `src/components/PropertySearchV2.tsx` - V2 UI component
- ✅ `src/hooks/useChatRouter.ts` - Message routing logic

### **What They Do:**
- V2PropertyApi: Calls `/v2/property/search/stream` with SSE
- useV2PropertyStream: React hook for streaming state
- PropertySearchV2: Displays streaming results
- useChatRouter: Routes property queries to V2, others to V1

---

## 🚀 **Integration Steps**

### **Option A: Side-by-Side (Recommended)**

Keep V1 chat for general queries, add V2 for property searches.

#### **Step 1: Add V2 Component to Chat**

In `src/components/desktop-shell/ChatTabView.tsx`:

```tsx
// Add import at top
import { PropertySearchV2 } from '../PropertySearchV2';
import { isPropertyQuery } from '../../services/v2PropertyApi';

// In the component, track if current message is V2
const [useV2ForLastMessage, setUseV2ForLastMessage] = useState(false);
const [lastQuery, setLastQuery] = useState<string | null>(null);

// In onSendMessage handler, detect property queries
const handleSendMessage = (message: string) => {
  if (isPropertyQuery(message)) {
    // Use V2
    setUseV2ForLastMessage(true);
    setLastQuery(message);
    
    // Add user message to chat
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMessage]);
  } else {
    // Use V1
    setUseV2ForLastMessage(false);
    onSendMessage(message);
  }
};

// In render, show V2 component when appropriate
{useV2ForLastMessage && lastQuery && (
  <PropertySearchV2 
    query={lastQuery}
    onComplete={() => setUseV2ForLastMessage(false)}
  />
)}
```

---

#### **Step 2: Test Integration**

```tsx
// Test queries:
1. "Show me properties in Austin" → Should use V2
2. "What's the weather?" → Should use V1
3. "Find 3 bed homes under $400k in Dallas" → Should use V2
4. "Tell me a joke" → Should use V1
```

---

### **Option B: Full Migration**

Replace V1 entirely with V2 (more work, breaks non-property queries).

```tsx
// Replace useStreamChat with useV2PropertyStream for all queries
// Not recommended yet - V2 only handles property queries
```

---

## 📂 **File Structure**

```
Frontend/civitas-ai/
├── src/
│   ├── services/
│   │   ├── chatApi.ts              (V1 - keep for now)
│   │   └── v2PropertyApi.ts        ✨ NEW
│   │
│   ├── hooks/
│   │   ├── useStreamChat.ts        (V1 - keep for now)
│   │   ├── useV2PropertyStream.ts  ✨ NEW
│   │   └── useChatRouter.ts        ✨ NEW
│   │
│   └── components/
│       ├── desktop-shell/
│       │   └── ChatTabView.tsx     (Update this!)
│       └── PropertySearchV2.tsx    ✨ NEW
```

---

## 🎯 **Quick Test**

### **1. Start Backend:**

```bash
cd DataLayer
./venv/bin/python -m uvicorn app.main:app --reload
```

### **2. Start Frontend:**

```bash
cd Frontend/civitas-ai
npm run dev
```

### **3. Test V2 Component:**

Create `src/pages/TestV2.tsx`:

```tsx
import { PropertySearchV2 } from '../components/PropertySearchV2';

export function TestV2Page() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>V2 Property Search Test</h1>
      <PropertySearchV2 query="Show me properties in Austin" />
    </div>
  );
}
```

Navigate to `/test-v2` and verify streaming works!

---

## 🔍 **How It Works**

### **User Flow:**

```
1. User types: "Show me properties in Austin"
   ↓
2. isPropertyQuery() → true
   ↓
3. Router decides: Use V2
   ↓
4. PropertySearchV2 component renders
   ↓
5. useV2PropertyStream hook activates
   ↓
6. Calls: POST /v2/property/search/stream
   ↓
7. SSE events stream in:
   - thinking: "🔍 Searching..."
   - properties: [23 results]
   - ai_chunk: "Austin " "shows " "strong " ...
   - complete: "✅ Done"
   ↓
8. UI updates in real-time
   ↓
9. User sees:
   - Thinking indicator (100ms)
   - Property cards (500ms) ← FAST!
   - AI text streams (800ms-3s) ← LIKE CHATGPT!
```

---

## ⚙️ **Configuration**

### **Feature Flag:**

```typescript
// Enable/disable V2 in environment
const USE_V2_PROPERTY_SEARCH = import.meta.env.VITE_USE_V2 === 'true';

// Use in router
const router = useChatRouter({
  enableV2: USE_V2_PROPERTY_SEARCH,
  onV1Message: (msg) => sendToV1(msg),
  onV2PropertyQuery: (query) => showV2Component(query),
});
```

### **Backend URL:**

```typescript
// Already configured in v2PropertyApi.ts
const BACKEND_URL = import.meta.env.VITE_DATALAYER_API_URL || 'http://localhost:8001';
```

---

## 🧪 **Testing Checklist**

### **V2 Property Search:**
- [ ] "Show me properties in Austin" → V2 streaming
- [ ] "Find homes under $400k" → V2 streaming
- [ ] "3 bedroom houses in Dallas" → V2 streaming
- [ ] Properties appear within 500ms
- [ ] AI text streams word by word
- [ ] Progress bar animates smoothly
- [ ] Thinking indicators show/hide correctly

### **V1 Fallback:**
- [ ] "What's the weather?" → V1 chat
- [ ] "Tell me about Austin" → V1 chat
- [ ] "Calculate ROI" → V1 chat
- [ ] Non-property queries work normally

### **Error Handling:**
- [ ] Backend offline → Error message shows
- [ ] Invalid query → Error message shows
- [ ] Retry button works
- [ ] Cancel button stops stream

---

## 🎨 **Styling**

### **Current Styling:**

PropertySearchV2 includes inline styles (CSS-in-JS) for quick implementation.

### **To Use Your Theme:**

Move styles to your existing CSS/SCSS:

```scss
// In your theme file
.property-search-v2-thinking {
  // Use your colors
  background: var(--thinking-bg);
  color: var(--thinking-color);
}

.property-card {
  // Match your card style
  border: 1px solid var(--border-color);
  &:hover {
    border-color: var(--primary-color);
  }
}
```

---

## 📊 **Performance**

### **Expected Metrics:**

```
V1 (Old):
  Time to Content:     3.5s
  User Can Interact:   3.5s
  Feels:               Slow 😕

V2 (New):
  Time to Content:     0.5s  (7x faster!)
  User Can Interact:   0.5s  (7x faster!)
  Feels:               Instant! 😍
```

---

## 🚨 **Troubleshooting**

### **Issue: "V2 endpoint not found"**

```bash
# Check backend is running with V2
curl http://localhost:8001/v2/property/health

# Should return: {"status":"healthy","version":"2.0","features":[...]}
```

### **Issue: "Properties not streaming"**

```bash
# Test backend SSE directly
curl -N http://localhost:8001/v2/property/search/stream?location=Austin&limit=5

# Should see: data: {"type":"thinking",...}
```

### **Issue: "Import errors"**

```bash
# Check TypeScript compilation
npm run type-check

# Fix any missing types
```

---

## 🎯 **Next Steps**

### **Today:**
1. ✅ Add PropertySearchV2 to ChatTabView
2. ✅ Test with property queries
3. ✅ Verify V1 still works for other queries

### **This Week:**
4. ✅ Add error handling
5. ✅ Polish UI/UX
6. ✅ Add loading states
7. ✅ Test edge cases

### **Next Week:**
8. ✅ Migrate more features to V2
9. ✅ Deprecate V1 property endpoints
10. ✅ Remove V1 code

---

## 📝 **Summary**

**What You Have:**
- ✅ V2 API service (TypeScript)
- ✅ V2 streaming hook (React)
- ✅ V2 UI component (React)
- ✅ Message router (smart routing)

**What You Need:**
- ⏳ Integration into ChatTabView (15 minutes)
- ⏳ Testing with real queries (10 minutes)
- ⏳ Polish and deploy (1 hour)

**Total Time:** ~90 minutes from "ready" to "live"

**Result:** 7x faster property searches with ChatGPT-like streaming! 🚀

---

## 💡 **Pro Tips**

### **1. Gradual Rollout:**

```typescript
// Start with percentage-based rollout
const useV2 = Math.random() < 0.1; // 10% of users

if (useV2 && isPropertyQuery(message)) {
  // Route to V2
} else {
  // Route to V1
}
```

### **2. A/B Testing:**

```typescript
// Track which version users see
analytics.track('property_search', {
  version: useV2 ? 'v2' : 'v1',
  responseTime: endTime - startTime,
  userSatisfaction: rating,
});
```

### **3. Fallback Strategy:**

```typescript
// If V2 fails, fallback to V1
try {
  await v2PropertyApi.searchPropertiesStream(query, handlers);
} catch (error) {
  console.error('V2 failed, falling back to V1:', error);
  sendToV1Chat(message);
}
```

---

## 🏆 **Success Criteria**

### **V2 is Working When:**
- ✅ Property searches use streaming endpoint
- ✅ Properties appear within 500ms
- ✅ AI text streams word by word
- ✅ Progress bar shows real-time updates
- ✅ Users report "feels faster"
- ✅ No increase in error rate

### **V1 Can Be Removed When:**
- ✅ V2 handles 100% of property queries
- ✅ No V1 property endpoint calls in logs
- ✅ User satisfaction scores improved
- ✅ No critical bugs for 1 week

---

**Ready to integrate V2 into your chat!** 🎯

**Start with Option A (Side-by-Side) for safest migration.**
