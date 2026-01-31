# 🎨 Frontend Token Streaming Integration
## Handle Real-Time Token-by-Token Streaming

---

## ✅ **What's Been Created**

### **1. Token Streaming Hook** ⚡
**File:** `src/hooks/useTokenStreamingChat.ts`

**Features:**
- Real-time token-by-token streaming
- Thinking state management
- Tool completion tracking
- Abort support
- Error handling

### **2. StreamingText Component** 💬
**File:** `src/components/chat/StreamingText.tsx`

**Features:**
- Smooth text animation
- Blinking cursor
- onComplete callback

---

## 🚀 **Quick Integration**

### **Step 1: Use the Hook** (2 minutes)

```tsx
import { useTokenStreamingChat } from './hooks/useTokenStreamingChat';
import { StreamingText } from './components/chat/StreamingText';
import { EnhancedThinkingIndicator } from './components/chat/EnhancedThinkingIndicator';

function ChatComponent() {
  const {
    messages,
    thinking,
    completedTools,
    isLoading,
    sendMessage,
    cancelRequest
  } = useTokenStreamingChat({
    apiUrl: '/api/chat/stream',           // Your backend URL
    apiKey: process.env.REACT_APP_API_KEY,
    streamingMode: 'fast',                // fast, normal, word, smart
    enableTokenStreaming: true            // Enable token streaming
  });
  
  const handleSend = (text: string) => {
    sendMessage(text);
  };
  
  return (
    <div className="chat-container">
      {/* Messages */}
      {messages.map(message => (
        <div key={message.id} className={`message ${message.role}`}>
          {message.streaming ? (
            <StreamingText content={message.content} speed={0} />
          ) : (
            <div>{message.content}</div>
          )}
        </div>
      ))}
      
      {/* Thinking Indicator */}
      {thinking && (
        <EnhancedThinkingIndicator
          thinking={thinking}
          completedTools={completedTools}
          onCancel={cancelRequest}
        />
      )}
      
      {/* Input */}
      <ChatInput onSend={handleSend} disabled={isLoading} />
    </div>
  );
}
```

**That's it!** You now have real token-by-token streaming! ✨

---

## 🎨 **Streaming Modes**

### **Fast Mode** (ChatGPT-like)
```tsx
useTokenStreamingChat({
  streamingMode: 'fast',
  enableTokenStreaming: true
})
```
- ⚡ 10ms per token
- 🚀 Very fast, engaging
- 📊 Best for most cases

### **Normal Mode** (Comfortable)
```tsx
useTokenStreamingChat({
  streamingMode: 'normal'
})
```
- ⏱️ 20ms per token
- 😌 Natural reading speed
- 📖 Good for longer responses

### **Word Mode** (Cleaner)
```tsx
useTokenStreamingChat({
  streamingMode: 'word'
})
```
- 📝 Word-by-word
- 🎯 Professional appearance
- 💼 Good for formal content

### **Smart Mode** (Adaptive)
```tsx
useTokenStreamingChat({
  streamingMode: 'smart'
})
```
- 🧠 Pauses at punctuation
- ⚡ Fast in code blocks
- 🎨 Most natural reading

### **Disable Streaming**
```tsx
useTokenStreamingChat({
  enableTokenStreaming: false
})
```
- 📦 Chunk-based (original)
- 🏎️ Faster total time
- 💰 Less network traffic

---

## 🔧 **Advanced Usage**

### **With User Preferences:**

```tsx
const { sendMessage } = useTokenStreamingChat();

const handleSend = () => {
  sendMessage(
    "Find properties in Austin",
    {
      // User preferences
      budget_max: 500000,
      default_strategy: 'LTR',
      dislikes: ['HOA', 'Flood Zone'],
      user_id: currentUser.id
    },
    {
      // Additional context
      user_context: { location: 'Austin, TX' }
    }
  );
};
```

### **With Error Handling:**

```tsx
const { sendMessage } = useTokenStreamingChat({
  onError: (error) => {
    console.error('Chat error:', error);
    toast.error(`Failed to send message: ${error.message}`);
  },
  onComplete: () => {
    console.log('Streaming complete!');
    playSound('message-received');
  }
});
```

### **With Abort:**

```tsx
const { sendMessage, cancelRequest, isLoading } = useTokenStreamingChat();

return (
  <>
    <button onClick={() => sendMessage(text)}>
      Send
    </button>
    
    {isLoading && (
      <button onClick={cancelRequest}>
        Stop
      </button>
    )}
  </>
);
```

### **With Retry:**

```tsx
const { retryLastMessage } = useTokenStreamingChat();

return (
  <button onClick={retryLastMessage}>
    Regenerate Response
  </button>
);
```

---

## 💡 **Complete Example**

Here's a full working chat component:

```tsx
// FILE: src/components/ChatWithTokenStreaming.tsx

import React, { useState, useRef, useEffect } from 'react';
import { useTokenStreamingChat } from '../hooks/useTokenStreamingChat';
import { StreamingText } from './chat/StreamingText';
import { EnhancedThinkingIndicator } from './chat/EnhancedThinkingIndicator';
import '../styles/llm-theme.css';

export const ChatWithTokenStreaming = () => {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const {
    messages,
    thinking,
    completedTools,
    isLoading,
    sendMessage,
    cancelRequest,
    clearMessages,
    retryLastMessage
  } = useTokenStreamingChat({
    apiUrl: import.meta.env.VITE_API_BASE_URL + '/api/chat/stream',
    apiKey: import.meta.env.VITE_API_KEY,
    streamingMode: 'fast',
    enableTokenStreaming: true,
    onError: (error) => {
      console.error('Chat error:', error);
    },
    onComplete: () => {
      console.log('Message complete!');
    }
  });
  
  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    
    sendMessage(inputValue);
    setInputValue('');
  };
  
  return (
    <div className="flex flex-col h-screen bg-black">
      {/* Header */}
      <div className="glass p-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <h1 className="gradient-text text-2xl font-bold">
            AI Chat
          </h1>
          <button
            onClick={clearMessages}
            className="px-3 py-1 text-sm text-white/60 hover:text-white/90 transition-colors"
          >
            Clear Chat
          </button>
        </div>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.map((message, index) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-4 rounded-xl ${
                message.role === 'user'
                  ? 'user-message'
                  : message.role === 'assistant'
                  ? 'ai-message'
                  : 'system-message'
              }`}
            >
              {message.role === 'assistant' && message.streaming ? (
                <StreamingText
                  content={message.content}
                  speed={0}  // Speed controlled by backend
                />
              ) : (
                <div className="text-white/90 whitespace-pre-wrap">
                  {message.content}
                </div>
              )}
            </div>
          </div>
        ))}
        
        {/* Thinking Indicator */}
        {thinking && (
          <div className="flex justify-start">
            <div className="max-w-[80%]">
              <EnhancedThinkingIndicator
                thinking={thinking}
                completedTools={completedTools}
                onCancel={cancelRequest}
                showDetails={true}
              />
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input */}
      <div className="glass p-4 border-t border-white/10">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask me anything..."
            disabled={isLoading}
            className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-purple-500/50 transition-colors"
          />
          
          {isLoading ? (
            <button
              type="button"
              onClick={cancelRequest}
              className="px-6 py-3 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 font-medium transition-colors"
            >
              Stop
            </button>
          ) : (
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          )}
        </form>
        
        {/* Retry Button */}
        {messages.length > 0 && !isLoading && (
          <button
            onClick={retryLastMessage}
            className="mt-2 text-sm text-white/50 hover:text-white/80 transition-colors"
          >
            Regenerate Response
          </button>
        )}
      </div>
    </div>
  );
};
```

---

## 🎯 **Key Features Explained**

### **1. Real-Time Token Updates**

The hook updates the message content **immediately** as each token arrives:

```tsx
// In useTokenStreamingChat.ts
case 'content':
  const token = data.content || '';
  currentMessageRef.current += token;
  
  // Update message immediately
  setMessages(prev => prev.map(msg =>
    msg.id === aiMessageId
      ? { ...msg, content: currentMessageRef.current }
      : msg
  ));
  break;
```

### **2. Streaming vs. Static Display**

```tsx
{message.streaming ? (
  // Show with cursor animation
  <StreamingText content={message.content} speed={0} />
) : (
  // Show static content
  <div>{message.content}</div>
)}
```

### **3. Auto-Scroll**

```tsx
useEffect(() => {
  messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
}, [messages]);  // Scroll when messages update
```

### **4. Abort Support**

```tsx
const abortControllerRef = useRef<AbortController | null>(null);

// On send:
abortControllerRef.current = new AbortController();
fetch(url, { signal: abortControllerRef.current.signal });

// On cancel:
abortControllerRef.current?.abort();
```

---

## 🐛 **Troubleshooting**

### **Issue: Tokens not appearing**

**Check:**
1. Backend is streaming token-by-token (not chunks)
2. SSE events are type `content`
3. Network tab shows multiple small events

**Solution:**
```tsx
// Add console log to verify tokens
case 'content':
  console.log('Token:', data.content);  // Should see individual tokens
  break;
```

### **Issue: Text appearing in chunks**

**Cause:** Backend sending large chunks

**Solution:** Use backend token streaming (see BACKEND_TOKEN_STREAMING_INTEGRATION.md)

### **Issue: Streaming too fast/slow**

**Frontend Speed:**
```tsx
<StreamingText
  content={message.content}
  speed={30}  // Adjust speed (ms)
/>
```

**Backend Speed:**
```python
# In chat.py
streamer = TokenStreamer(delay_ms=15)  # Adjust delay
```

### **Issue: Auto-scroll not working**

**Solution:**
```tsx
useEffect(() => {
  const timer = setTimeout(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, 100);  // Small delay ensures content is rendered
  
  return () => clearTimeout(timer);
}, [messages]);
```

---

## 📊 **Performance Tips**

### **1. Debounce Updates for Long Messages:**

```tsx
// For very long responses, batch updates
let updateTimer: NodeJS.Timeout | null = null;

case 'content':
  currentMessageRef.current += token;
  
  // Batch updates (every 50ms instead of every token)
  if (updateTimer) clearTimeout(updateTimer);
  updateTimer = setTimeout(() => {
    setMessages(/* update */);
  }, 50);
  break;
```

### **2. Virtualized Message List:**

```tsx
import { useVirtualizer } from '@tanstack/react-virtual';

// For chats with 100+ messages
const virtualizer = useVirtualizer({
  count: messages.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 100,
});
```

### **3. Lazy Load Old Messages:**

```tsx
// Only show last 50 messages, load more on scroll
const visibleMessages = messages.slice(-50);
```

---

## ✅ **Integration Checklist**

- [ ] Add `useTokenStreamingChat.ts` hook
- [ ] Import in your chat component
- [ ] Connect to backend streaming endpoint
- [ ] Test with different streaming modes
- [ ] Add error handling
- [ ] Add abort functionality
- [ ] Test on slow networks
- [ ] Optimize for mobile
- [ ] Add loading states
- [ ] Deploy and celebrate! 🎉

---

## 🎉 **You're Done!**

Your frontend now handles real-time token-by-token streaming!

**Features:**
- ✅ ChatGPT-like streaming
- ✅ Real-time updates
- ✅ Smooth animations
- ✅ Abort support
- ✅ Error handling
- ✅ Multiple streaming modes

**Next:** Test it end-to-end and show your users! 🚀

---

## 📚 **Related Files**

- `src/hooks/useTokenStreamingChat.ts` - Main hook
- `src/components/chat/StreamingText.tsx` - Text animation
- `src/components/chat/EnhancedThinkingIndicator.tsx` - Thinking display
- `BACKEND_TOKEN_STREAMING_INTEGRATION.md` - Backend guide
