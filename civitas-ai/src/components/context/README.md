# @-Mention Context System

This folder contains the implementation of the @-mention context picker feature, which allows users to reference conversations, properties, files, and reports in their searches and messages.

## Components

### ContextPicker
A dropdown component that appears when users type `@` in the Composer or CommandSearch components.

**Features:**
- Fuzzy search across all context types using Fuse.js
- Grouped results by type (Conversations, Properties, Files, Reports, Other)
- Keyboard navigation (↑↓ to navigate, Enter to select, Esc to close)
- Recent contexts when no search query
- Empty states for no results

**Usage:**
```tsx
import { ContextPicker } from '../components/context';

<ContextPicker
  isOpen={showPicker}
  query={searchQuery}
  onSelect={handleContextSelect}
  onClose={handleClose}
  position={{ bottom: 8 }}
  maxHeight={300}
/>
```

### ContextPill
A visual chip/badge component that displays selected contexts.

**Features:**
- Color-coded by context type
- Remove button (×)
- Responsive sizing (sm, md, lg)
- Hover states

**Usage:**
```tsx
import { ContextPill, ContextPillsContainer } from '../components/context';

// Single pill
<ContextPill
  context={selectedContext}
  onRemove={handleRemove}
  showRemove={true}
  size="md"
/>

// Multiple pills in a container
<ContextPillsContainer
  contexts={selectedContexts}
  onRemove={handleRemove}
  showRemove={true}
  maxVisible={5}
  size="sm"
/>
```

### ContextProvider
A provider component that automatically populates the context store with data from various sources.

**Usage:**
Place this component high in your component tree (e.g., in your main layout):

```tsx
import { ContextProvider } from '../components/context';

<ContextProvider
  chatSessions={chatHistory}
  properties={properties}
  files={uploadedFiles}
  reports={generatedReports}
  preferences={userPreferences}
  currentMessages={messages}
/>
```

## Hooks

### useContextDetection
(Located in `src/hooks/useContextDetection.ts`)

A hook that detects when users type `@` and manages the context picker state.

**Features:**
- Detects @ character at cursor position
- Extracts query text after @
- Provides insertion logic for contexts
- Manages picker open/close state

**Usage:**
```tsx
import { useContextDetection } from '../../hooks/useContextDetection';

const {
  detection,
  showPicker,
  query,
  handleInputChange,
  insertContext,
  closePicker,
  reset,
} = useContextDetection({
  trigger: '@',
  onContextSelect: (context) => console.log('Selected:', context),
  onPickerOpen: () => console.log('Picker opened'),
  onPickerClose: () => console.log('Picker closed'),
});
```

### useExtractContexts
(Located in `src/hooks/useContextDetection.ts`)

A hook that extracts @-mentioned contexts from input text for backend processing.

**Usage:**
```tsx
import { useExtractContexts } from '../../hooks/useContextDetection';

const { extractContexts } = useExtractContexts();

// Extract contexts from text
const { contexts, cleanedText } = extractContexts(
  messageText,
  availableContexts
);

// Send contexts to backend
sendMessage(cleanedText, { contextSources: contexts.map(c => c.id) });
```

## Store

### useContextStore
(Located in `src/stores/contextStore.ts`)

Zustand store that manages all available contexts and recent contexts.

**State:**
- `availableContexts`: All contexts from various sources
- `recentContexts`: Recently used contexts (persisted in localStorage)

**Actions:**
- `setAvailableContexts(contexts)`: Set all available contexts
- `addContext(context)`: Add a single context
- `removeContext(contextId)`: Remove a context
- `addRecentContext(context)`: Add to recent contexts
- `clearRecentContexts()`: Clear recent contexts
- `searchContexts(query)`: Search with fuzzy matching
- `getGroupedContexts(contexts)`: Group contexts by type
- `getContextsByType(type)`: Filter by type

**Usage:**
```tsx
import { useContextStore } from '../../stores/contextStore';

const {
  availableContexts,
  recentContexts,
  searchContexts,
  addRecentContext,
} = useContextStore();

// Search contexts
const results = searchContexts('san francisco');

// Add to recent
addRecentContext(selectedContext);
```

## Types

### ContextItem
(Located in `src/types/context.ts`)

Base interface for all context items:

```typescript
interface ContextItem {
  id: string;
  type: 'page' | 'property' | 'file' | 'report' | 'custom';
  title: string;
  subtitle?: string;
  icon: string | LucideIcon;
  metadata?: Record<string, any>;
  timestamp?: string;
  preview?: string;
}
```

### Specialized Context Types
- `PageContext`: For chat/conversation pages
- `PropertyContext`: For properties
- `FileContext`: For uploaded files
- `ReportContext`: For generated reports
- `CustomContext`: For preferences, locations, strategies, etc.

## Utilities

### contextUtils.ts
(Located in `src/lib/contextUtils.ts`)

Helper functions for converting data to contexts:

- `chatSessionsToContexts(sessions)`: Convert chat sessions to page contexts
- `propertiesToContexts(properties)`: Convert properties to property contexts
- `filesToContexts(files)`: Convert files to file contexts
- `reportsToContexts(reports)`: Convert reports to report contexts
- `createCustomContexts(preferences)`: Create custom contexts from preferences
- `extractPropertiesFromMessages(messages)`: Extract properties from tool results

## Integration Guide

### 1. Add ContextProvider to Your App

In your main layout component (e.g., `DesktopShell.tsx`):

```tsx
import { ContextProvider } from '../components/context';

function DesktopShell() {
  const { chatHistory, messages, /* ... */ } = useDesktopShell();
  
  return (
    <>
      <ContextProvider
        chatSessions={chatHistory}
        currentMessages={messages}
        // Add other data sources as they become available
      />
      
      {/* Your app components */}
    </>
  );
}
```

### 2. Use in Composer or Search

The Composer and CommandSearch components already have @-mention support integrated. Users can:

1. Type `@` to trigger the context picker
2. Search for contexts by typing after `@`
3. Navigate with ↑↓ arrow keys
4. Select with Enter
5. Selected contexts appear as pills above the input
6. Remove contexts by clicking the × button

### 3. Backend Integration

When sending messages, extract the selected contexts and send them to the backend:

```tsx
import { useExtractContexts } from '../../hooks/useContextDetection';

const { extractContexts } = useExtractContexts();

const handleSendMessage = (message: string) => {
  const { contexts, cleanedText } = extractContexts(
    message,
    availableContexts
  );
  
  // Send to backend with context metadata
  sendMessage(cleanedText, {
    contextSources: contexts.map(c => ({
      id: c.id,
      type: c.type,
      title: c.title,
      metadata: c.metadata,
    })),
  });
};
```

## Color Coding

Contexts are color-coded by type:
- **Pages/Conversations**: Blue
- **Properties**: Teal
- **Files**: Purple
- **Reports**: Orange
- **Custom**: White/Gray

## Keyboard Shortcuts

- `@`: Trigger context picker
- `↑` / `↓`: Navigate results
- `Enter`: Select context
- `Esc`: Close picker
- `Backspace` (on empty query): Remove last context (future enhancement)

## Example Use Cases

### Search with Context
```
@San Francisco Market Report what are the average cap rates?
```

### Compare Properties
```
@123 Main St @456 Oak Ave compare these two properties
```

### Chat with File Context
```
@property-analysis.pdf what's the ROI projection in this document?
```

### Query with Multiple Contexts
```
@Portfolio @Q4 Report show me year over year growth
```

## Future Enhancements

1. **Backend RAG Integration**: Use contexts for retrieval-augmented generation
2. **Context Suggestions**: Auto-suggest relevant contexts based on user query
3. **Context Relationships**: Show related contexts (e.g., properties in a report)
4. **Context Preview**: Hover tooltip with more details
5. **Keyboard Shortcut**: `Backspace` on empty query removes last context
6. **Context History**: Show which contexts were used in past conversations
7. **Smart Filtering**: Filter search results based on selected contexts
8. **Context Actions**: Right-click menu for context-specific actions

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     User Interface                      │
│  (Composer, CommandSearch)                             │
│                                                         │
│  - Type @ to trigger                                   │
│  - ContextPicker shows available contexts              │
│  - Selected contexts displayed as ContextPills         │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                   State Management                      │
│  (useContextStore - Zustand)                           │
│                                                         │
│  - availableContexts: All contexts                     │
│  - recentContexts: Recently used                       │
│  - searchContexts(): Fuzzy search                      │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                   Data Population                       │
│  (ContextProvider)                                     │
│                                                         │
│  - Chats → Page contexts                              │
│  - Properties → Property contexts                      │
│  - Files → File contexts                              │
│  - Reports → Report contexts                          │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                   Data Sources                          │
│                                                         │
│  - chatHistory (useDesktopShell)                       │
│  - properties (tool results, portfolio)                │
│  - uploadedFiles (file service)                        │
│  - generatedReports (reports service)                  │
└─────────────────────────────────────────────────────────┘
```

## Testing

To test the @-mention feature:

1. Open the app and start typing in the Composer or CommandSearch
2. Type `@` to see the context picker
3. Verify that contexts from chat history appear
4. Search for a specific context (e.g., type `@san` to find San Francisco related items)
5. Select a context and verify it appears as a pill
6. Remove a context by clicking the × button
7. Send a message with contexts and verify they're included
8. Test keyboard navigation (↑↓, Enter, Esc)

## Troubleshooting

### Context picker doesn't show
- Verify ContextProvider is mounted in your app
- Check that data sources are being passed to ContextProvider
- Ensure contexts are being populated in the store (use React DevTools)

### Search results are empty
- Check that availableContexts has items in the store
- Verify Fuse.js search configuration
- Test with exact matches first, then fuzzy matches

### Contexts not persisting
- Recent contexts are stored in localStorage under key: `civitas-recent-contexts`
- Check browser console for localStorage errors
- Verify localStorage is not full

### Styling issues
- Ensure Tailwind CSS is properly configured
- Check that custom-scrollbar class is defined
- Verify z-index layering for overlays
