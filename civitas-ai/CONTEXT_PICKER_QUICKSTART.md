# @-Mention Context Picker - Quick Start Guide

## What Was Built

A complete @-mention system similar to Cursor, Notion, and Slack that allows users to:
- Type `@` to reference conversations, properties, files, and reports
- Search and filter contexts with fuzzy matching
- Select contexts that appear as visual chips/pills
- Use contexts to provide better search and chat results

## 5-Minute Integration

### Step 1: Add ContextProvider to Your App

Find your main layout component (likely `src/layouts/DesktopLayout.tsx` or where `useDesktopShell` is used) and add:

```tsx
import { ContextProvider } from '../components/context';

function YourLayout() {
  const { chatHistory, messages } = useDesktopShell();
  
  return (
    <>
      {/* Add this provider */}
      <ContextProvider
        chatSessions={chatHistory}
        currentMessages={messages}
      />
      
      {/* Your existing components */}
      <YourExistingComponents />
    </>
  );
}
```

That's it! The feature is now active.

### Step 2: Test It

1. Start your dev server: `npm run dev`
2. Open your app
3. Go to the chat composer or search bar
4. Type `@` and you'll see the context picker
5. Your chat history will appear as selectable contexts
6. Select one and it becomes a pill chip
7. Send a message or search!

## What Already Works

✅ **Composer** - Type `@` in the chat input
✅ **CommandSearch** - Type `@` in the search overlay (⌘K)
✅ **Keyboard Navigation** - Use ↑↓ arrows, Enter to select, Esc to close
✅ **Recent Contexts** - Last 10 used contexts saved to localStorage
✅ **Visual Pills** - Selected contexts show as color-coded chips
✅ **Fuzzy Search** - Type partial names to find contexts

## Where Are The Files?

All new code is in:
```
src/
├── components/context/
│   ├── ContextPicker.tsx      # Dropdown UI
│   ├── ContextPill.tsx        # Chip/pill UI
│   ├── ContextProvider.tsx    # Data population
│   ├── index.ts               # Exports
│   └── README.md              # Full docs
├── hooks/
│   └── useContextDetection.ts # @ detection logic
├── stores/
│   └── contextStore.ts        # State management
├── types/
│   └── context.ts             # TypeScript types
└── lib/
    └── contextUtils.ts        # Helper functions
```

Modified files:
- `src/components/chat/Composer.tsx` - Added @ support
- `src/components/desktop-shell/CommandSearch.tsx` - Added @ support

## How To Add More Context Sources

To populate contexts from other sources, update your ContextProvider:

```tsx
<ContextProvider
  chatSessions={chatHistory}
  currentMessages={messages}
  
  // Add these as you have them:
  properties={properties}  // From tool results or portfolio
  files={uploadedFiles}    // From file service
  reports={reports}        // From reports service
  preferences={{           // User preferences
    location: "San Francisco",
    strategy: "STR",
    budget: { min: 100000, max: 500000 }
  }}
/>
```

## Backend Integration (Optional)

To send selected contexts to your backend:

```tsx
import { useExtractContexts } from '../hooks/useContextDetection';
import { useContextStore } from '../stores/contextStore';

function YourComponent() {
  const { extractContexts } = useExtractContexts();
  const { availableContexts } = useContextStore();
  
  const handleSend = (message: string) => {
    // Extract @-mentioned contexts from message
    const { contexts, cleanedText } = extractContexts(
      message,
      availableContexts
    );
    
    // Send to backend with context metadata
    yourApiCall(cleanedText, {
      contextSources: contexts.map(c => ({
        id: c.id,
        type: c.type,
        title: c.title,
        metadata: c.metadata
      }))
    });
  };
}
```

## Customization

### Change Trigger Character

Don't like `@`? Change it:

```tsx
// In useContextDetection hook or component
const detection = useContextDetection({
  trigger: '#',  // Use # instead of @
  // ... other options
});
```

### Customize Colors

Edit the color scheme in `src/components/context/ContextPill.tsx`:

```tsx
const getTypeColors = (type: ContextItem['type']) => {
  switch (type) {
    case 'page':
      return {
        bg: 'bg-blue-500/10',     // Change these
        border: 'border-blue-500/20',
        text: 'text-blue-400',
        // ...
      };
    // ... other types
  }
};
```

### Add Custom Context Types

1. Update `ContextType` in `src/types/context.ts`
2. Add converter in `src/lib/contextUtils.ts`
3. Add color scheme in `ContextPill.tsx`
4. Pass data to `ContextProvider`

## Common Use Cases

### Filter Search by Context
```
User types: @San Francisco Report what are top properties?
→ Search only within that report
```

### Compare Multiple Items
```
User types: @Property A @Property B compare these
→ AI knows exactly which properties to analyze
```

### Reference Past Conversations
```
User types: @Yesterday's Chat continue that discussion
→ Load context from previous chat
```

## Troubleshooting

**Q: Context picker doesn't show up**
A: Make sure ContextProvider is mounted. Check React DevTools to see if `availableContexts` has items.

**Q: No contexts available**
A: ContextProvider needs data. Pass `chatSessions`, `properties`, etc. to it.

**Q: Styling looks broken**
A: Ensure Tailwind CSS is configured. Run `npm run dev` to rebuild.

**Q: Recent contexts not persisting**
A: Check browser localStorage. Clear it and try again: `localStorage.removeItem('civitas-recent-contexts')`

## Learn More

- **Full Documentation**: `src/components/context/README.md`
- **Implementation Details**: `CONTEXT_PICKER_IMPLEMENTATION.md`
- **Type Definitions**: `src/types/context.ts`

## Demo GIF (How It Works)

```
1. User types: "@"
   ↓
2. Dropdown appears with contexts
   ↓
3. User types: "san"
   ↓
4. Results filter to "San Francisco Report", "San Diego Chat", etc.
   ↓
5. User presses ↓ to navigate, Enter to select
   ↓
6. "@San Francisco Report" appears as a blue pill
   ↓
7. User continues typing: "@San Francisco Report show cap rates"
   ↓
8. Message sent with context metadata
```

## What's Next?

Once you've tested the basic feature, you can:

1. **Add more data sources** - Properties, files, reports
2. **Integrate with backend** - Send contexts for RAG/search
3. **Add context attribution** - Show which contexts were used in responses
4. **Custom contexts** - Add user preferences, saved searches, etc.

## Need Help?

Check the full documentation in:
- `src/components/context/README.md` - Component docs
- `CONTEXT_PICKER_IMPLEMENTATION.md` - Implementation details

All code has zero linter errors and follows your project's conventions!

---

**Enjoy your new @-mention context feature! 🎉**
