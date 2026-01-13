# Civitas Command Center - Implementation Guide

## Overview

The **Civitas Command Center** transforms property search into a professional, Bloomberg Terminal-like experience. It's a modeless, split-screen workspace designed specifically for real estate intelligence.

## Key Features

### 1. **Split-Screen Layout** (60/40)
- **Left Side (60%)**: Property results grid
- **Right Side (40%)**: Intelligence Pane with detailed analysis
- **Resizable divider**: Drag to adjust (40-80% range)
- **Holographic divider handle**: Teal glow on hover

### 2. **Comparison Dock** (Bottom)
- Persistent floating bar at bottom
- Drag properties from grid into dock slots
- Maximum 4 properties for side-by-side comparison
- Animated teal/purple gradient border
- Collapsible to reclaim screen space

### 3. **Property Grid**
- 2-column responsive layout
- **Click** to select → updates Intelligence Pane
- **Drag** to add to Comparison Dock
- **Right-click** for context menu
- **Holographic selection**: Animated teal border "scan" effect
- **Hover**: Lift effect with shadow

### 4. **Intelligence Pane**
- **Empty state**: Tips and quick start guide
- **Property selected**: Tabs for Overview | Financials | AI Insights | 3D View
- **Comparison mode**: Side-by-side matrix
- **Pin feature**: Lock property while browsing others
- **Keyboard shortcuts**: Press 1-4 to switch tabs

### 5. **Context Menu** (Right-Click)
- View Details
- 3D Holographic View (H)
- Analyze Deal (A)
- Add to Comparison (C)
- Add to Portfolio (P)
- Copy Link (⌘C)
- Bookmark (B)

## Usage

### Integrating Command Center

In your `DesktopShell.tsx` or main layout:

```typescript
import { CommandCenterChatView } from './components/desktop-shell/CommandCenterChatView';
import { useDesktopShell } from './hooks/useDesktopShell';

function YourComponent() {
  const shellState = useDesktopShell();

  return (
    <CommandCenterChatView
      // Chat props
      messages={shellState.messages}
      isLoading={shellState.isLoading}
      onSendMessage={shellState.handleSendMessage}
      // ... other chat props

      // Command Center props
      commandCenter={shellState.commandCenter}
      selectProperty={shellState.selectProperty}
      addToComparisonDock={shellState.addToComparisonDock}
      removeFromComparisonDock={shellState.removeFromComparisonDock}
      clearComparisonDock={shellState.clearComparisonDock}
      startComparison={shellState.startComparison}
      togglePanePin={shellState.togglePanePin}
    />
  );
}
```

### Automatic Layout Switching

The `CommandCenterChatView` automatically switches layouts:
- **No properties**: Shows normal chat view
- **Properties found**: Switches to split-screen Command Center

### User Interactions

**Selecting a Property:**
```typescript
// Click any property card in the grid
// The Intelligence Pane updates automatically
```

**Adding to Comparison:**
```typescript
// Method 1: Drag property card to dock at bottom
// Method 2: Right-click → "Add to Comparison"
// Method 3: Click Compare icon in Intelligence Pane
```

**Comparing Properties:**
```typescript
// 1. Add 2-4 properties to dock
// 2. Click "Compare" button in dock
// 3. Intelligence Pane switches to comparison matrix
```

**Keyboard Shortcuts:**
- `1`: Overview tab
- `2`: Financials tab
- `3`: AI Insights tab
- `4`: 3D View tab
- `Esc`: Close context menu

## Architecture

### Component Hierarchy

```
CommandCenterChatView
├── CommandCenterLayout (60/40 split)
│   ├── Left: PropertyGrid
│   │   └── PropertyGridCard (individual cards)
│   ├── Right: IntelligencePane
│   │   ├── Empty State
│   │   ├── Property Details (tabs)
│   │   └── Comparison Matrix
│   └── Bottom: ComparisonDock
│       └── Property Slots (max 4)
└── ContextMenu (right-click)
```

### State Management

The Command Center state is managed in `useDesktopShell` hook:

```typescript
interface CommandCenterState {
  selectedPropertyId: string | null;
  comparisonDockProperties: ScoutedProperty[];
  intelligencePaneView: 'details' | 'comparison';
  isPanePinned: boolean;
}
```

### Key Files

**Core Components:**
- `layouts/CommandCenterLayout.tsx` - Split-screen container
- `components/property/PropertyGrid.tsx` - Grid of property cards
- `components/property/IntelligencePane.tsx` - Right pane with details
- `components/property/ComparisonDock.tsx` - Bottom comparison bar
- `components/primitives/ContextMenu.tsx` - Right-click menu
- `components/desktop-shell/CommandCenterChatView.tsx` - Integration wrapper

**Hooks:**
- `hooks/useDesktopShell.ts` - Updated with Command Center state

## Design System

### Colors

**Primary Accents:**
- Teal: `#14B8A6` (rgb(20, 184, 166))
- Purple: `#A855F7` (rgb(168, 85, 247))

**Backgrounds:**
- Dark base: `#1E1E1E`
- Slate: `#0F172A` / `#1E293B`
- Translucent: `bg-black/80 backdrop-blur-xl`

**Borders:**
- Default: `border-white/10`
- Hover: `border-white/20`
- Selected: `border-teal-500`

### Animations

**Holographic Effects:**
- Scan animation (selected cards): 2s infinite
- Gradient border (dock): 3s infinite
- Tab indicator: Smooth sliding underline

**Transitions:**
- Property selection: 300ms ease-out
- Pane updates: 200ms cross-fade
- Dock expand/collapse: 400ms ease-in-out
- Hover lift: translateY(-4px) with shadow

### Typography

- **Property Price**: text-xl font-bold
- **Address**: text-xs text-white/70
- **Stats**: text-[11px] text-white/60
- **Section Headers**: font-semibold

## Customization

### Adjusting Split Ratio

Default is 60/40, stored in `localStorage` as `civitas-split-ratio`:

```typescript
// Users can drag divider between 40-80%
// Ratio is persisted automatically
```

### Adding New Context Menu Items

In `primitives/ContextMenu.tsx`:

```typescript
export const createPropertyContextMenuItems = (property, handlers) => {
  return [
    // ... existing items
    {
      id: 'your-action',
      label: 'Your Action',
      icon: <YourIcon className="w-4 h-4" />,
      onClick: handlers.onYourAction,
      shortcut: 'Y',
    },
  ];
};
```

### Extending Intelligence Pane

Add new tabs in `property/IntelligencePane.tsx`:

```typescript
const tabs: Array<{ id: TabType; label: string; ... }> = [
  // ... existing tabs
  { 
    id: 'your-tab', 
    label: 'Your Tab', 
    icon: <YourIcon />, 
    shortcut: '5' 
  },
];
```

## Performance Considerations

### Progressive Loading

Properties load with 50ms stagger for smooth appearance:

```typescript
// In PropertyGrid.tsx
properties.map((property, index) => (
  <PropertyGridCard
    key={property.id}
    style={{ animationDelay: `${index * 50}ms` }}
    // ...
  />
));
```

### Memoization

Components use `useMemo` for expensive calculations:
- Property filtering
- Selected property lookup
- Context menu items generation

### Drag Performance

Uses native HTML5 Drag & Drop API (no external libraries):
- Custom ghost images for visual feedback
- Efficient event handling

## Troubleshooting

### Properties Not Appearing in Grid

Check that messages contain tool results with properties:

```typescript
// Expected structure:
{
  role: 'assistant',
  tools: [{
    name: 'scout_properties',
    result: {
      properties: [/* ScoutedProperty[] */]
    }
  }]
}
```

### Context Menu Not Opening

Ensure event propagation:

```typescript
onContextMenu={(e) => {
  e.preventDefault();  // Required!
  e.stopPropagation();
  // ...
}}
```

### Comparison Dock Not Receiving Drops

Check drag event handlers:

```typescript
onDragOver={(e) => {
  e.preventDefault();  // Required!
  // ...
}}
```

## Future Enhancements

Planned features:
- [ ] Portfolio integration (add properties directly)
- [ ] Bookmark system with tags
- [ ] Export comparison matrix to PDF
- [ ] Advanced filters in property grid
- [ ] Heatmap overlay for market data
- [ ] Property recommendations based on AI
- [ ] Collaborative comparison (share with team)

## Support

For questions or issues:
- Check console logs for `[CommandCenter]` prefixed messages
- Review component props in React DevTools
- Verify `commandCenter` state in `useDesktopShell`

---

**Civitas AI Command Center** - Professional Real Estate Intelligence Workspace

