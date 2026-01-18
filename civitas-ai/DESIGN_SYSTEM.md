# ProphetAtlas Design System
## Premium Calendar & Visit Notes Design Philosophy

### Core Principles

#### 1. **Contextual Intelligence**
- Show what data means, not just raw data
- Provide actionable insights at a glance
- Reduce cognitive load through smart defaults

#### 2. **Fluid Interactions**
- Every action has immediate visual feedback
- Transitions feel natural and purposeful
- No jarring state changes

#### 3. **Progressive Disclosure**
- Start simple, reveal complexity on demand
- Power users get shortcuts, beginners get guidance
- Information hierarchy guides the eye

#### 4. **Delightful Details**
- Micro-interactions add personality
- Loading states entertain
- Errors guide rather than frustrate

### Design Tokens

#### Spacing Scale
```
xs: 4px   - Tight spacing within components
sm: 8px   - Component internal padding
md: 16px  - Standard gap between elements
lg: 24px  - Section spacing
xl: 32px  - Major section breaks
2xl: 48px - Page-level spacing
```

#### Typography Scale
```
xs: 11px / 16px  - Captions, metadata
sm: 13px / 20px  - Body small, labels
base: 15px / 24px - Body text
lg: 17px / 28px  - Subheadings
xl: 21px / 32px  - Headings
2xl: 28px / 36px - Page titles
3xl: 36px / 44px - Hero text
```

#### Border Radius
```
sm: 6px   - Buttons, small cards
md: 10px  - Standard cards
lg: 16px  - Large cards, modals
xl: 24px  - Hero sections
full: 9999px - Pills, avatars
```

#### Shadows
```
sm: 0 1px 2px rgba(0,0,0,0.05)
md: 0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.05)
lg: 0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05)
xl: 0 20px 25px rgba(0,0,0,0.15), 0 10px 10px rgba(0,0,0,0.04)
```

#### Animation Timing
```
instant: 100ms  - Hover states
fast: 200ms     - Simple transitions
base: 300ms     - Standard animations
slow: 500ms     - Complex transitions
```

#### Easing Functions
```
ease-out: cubic-bezier(0, 0, 0.2, 1)     - Entering elements
ease-in: cubic-bezier(0.4, 0, 1, 1)      - Exiting elements
ease-in-out: cubic-bezier(0.4, 0, 0.2, 1) - Bi-directional
spring: cubic-bezier(0.34, 1.56, 0.64, 1) - Bouncy feel
```

### Color System

#### Semantic Colors
```typescript
// Success
success: {
  50: '#f0fdf4',
  100: '#dcfce7',
  500: '#22c55e',
  600: '#16a34a',
  900: '#14532d'
}

// Warning
warning: {
  50: '#fffbeb',
  100: '#fef3c7',
  500: '#f59e0b',
  600: '#d97706',
  900: '#78350f'
}

// Error
error: {
  50: '#fef2f2',
  100: '#fee2e2',
  500: '#ef4444',
  600: '#dc2626',
  900: '#7f1d1d'
}

// Info
info: {
  50: '#eff6ff',
  100: '#dbeafe',
  500: '#3b82f6',
  600: '#2563eb',
  900: '#1e3a8a'
}
```

#### Calendar-Specific Colors
```typescript
// Event Categories
categories: {
  tax: { bg: '#fef2f2', border: '#fecaca', text: '#991b1b' },
  maintenance: { bg: '#fff7ed', border: '#fed7aa', text: '#9a3412' },
  lease: { bg: '#eff6ff', border: '#bfdbfe', text: '#1e40af' },
  insurance: { bg: '#f5f3ff', border: '#ddd6fe', text: '#5b21b6' },
  meeting: { bg: '#f0fdf4', border: '#bbf7d0', text: '#166534' },
  inspection: { bg: '#ecfeff', border: '#a5f3fc', text: '#155e75' },
  financial: { bg: '#fdf2f8', border: '#fbcfe8', text: '#9f1239' }
}

// Urgency Indicators
urgency: {
  overdue: { bg: '#fee2e2', glow: '#ef4444', pulse: true },
  today: { bg: '#fef3c7', glow: '#f59e0b', pulse: false },
  thisWeek: { bg: '#dbeafe', glow: '#3b82f6', pulse: false },
  upcoming: { bg: '#f3f4f6', glow: '#6b7280', pulse: false }
}
```

### Component Patterns

#### Cards
```typescript
// Base Card
<div className="
  bg-white dark:bg-gray-800
  rounded-xl
  border border-gray-200 dark:border-gray-700
  shadow-sm hover:shadow-md
  transition-all duration-200
  p-6
">

// Interactive Card
<div className="
  group
  bg-white dark:bg-gray-800
  rounded-xl
  border-2 border-gray-200 dark:border-gray-700
  hover:border-blue-500 dark:hover:border-blue-400
  shadow-sm hover:shadow-lg
  transition-all duration-300
  transform hover:-translate-y-1
  cursor-pointer
  p-6
">

// Glassmorphism Card
<div className="
  bg-white/70 dark:bg-gray-800/70
  backdrop-blur-xl
  rounded-2xl
  border border-white/20 dark:border-white/10
  shadow-xl
  p-6
">
```

#### Buttons
```typescript
// Primary
<button className="
  px-4 py-2
  bg-blue-600 hover:bg-blue-700
  text-white font-medium
  rounded-lg
  shadow-sm hover:shadow-md
  transition-all duration-200
  active:scale-95
">

// Secondary
<button className="
  px-4 py-2
  bg-gray-100 dark:bg-gray-800
  hover:bg-gray-200 dark:hover:bg-gray-700
  text-gray-900 dark:text-white font-medium
  rounded-lg
  transition-all duration-200
  active:scale-95
">

// Ghost
<button className="
  px-4 py-2
  hover:bg-gray-100 dark:hover:bg-gray-800
  text-gray-700 dark:text-gray-300 font-medium
  rounded-lg
  transition-all duration-200
">
```

#### Inputs
```typescript
// Text Input
<input className="
  w-full px-4 py-2
  bg-gray-50 dark:bg-gray-900
  border border-gray-300 dark:border-gray-700
  rounded-lg
  text-gray-900 dark:text-white
  placeholder-gray-500
  focus:outline-none
  focus:ring-2 focus:ring-blue-500/50
  focus:border-blue-500
  transition-all duration-200
">

// Search Input
<div className="relative">
  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
  <input className="
    w-full pl-10 pr-4 py-2
    bg-gray-100 dark:bg-gray-800
    border-0 rounded-lg
    text-gray-900 dark:text-white
    placeholder-gray-500
    focus:outline-none
    focus:ring-2 focus:ring-blue-500/50
    transition-all duration-200
  ">
</div>
```

### Micro-interactions

#### Hover States
```typescript
// Scale on hover
className="transition-transform duration-200 hover:scale-105"

// Lift on hover
className="transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"

// Glow on hover
className="transition-all duration-200 hover:shadow-[0_0_20px_rgba(59,130,246,0.5)]"

// Color shift on hover
className="transition-colors duration-200 hover:text-blue-600"
```

#### Click/Tap Feedback
```typescript
// Scale down on active
className="active:scale-95 transition-transform duration-100"

// Ripple effect (using Framer Motion)
<motion.button
  whileTap={{ scale: 0.95 }}
  transition={{ type: "spring", stiffness: 400, damping: 17 }}
>
```

#### Loading States
```typescript
// Spinner
<div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-blue-600" />

// Skeleton
<div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg h-20" />

// Shimmer
<div className="relative overflow-hidden bg-gray-200 dark:bg-gray-700 rounded-lg">
  <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
</div>
```

#### Success/Error States
```typescript
// Success checkmark animation
<motion.div
  initial={{ scale: 0 }}
  animate={{ scale: 1 }}
  transition={{ type: "spring", stiffness: 260, damping: 20 }}
>
  <CheckCircle className="w-16 h-16 text-green-500" />
</motion.div>

// Error shake animation
<motion.div
  animate={{ x: [0, -10, 10, -10, 10, 0] }}
  transition={{ duration: 0.5 }}
>
  <AlertCircle className="w-16 h-16 text-red-500" />
</motion.div>
```

### Calendar-Specific Patterns

#### Event Cards
```typescript
// Compact Event
<div className="
  group relative
  px-3 py-2
  bg-blue-50 dark:bg-blue-500/10
  border-l-4 border-blue-500
  rounded-r-lg
  hover:bg-blue-100 dark:hover:bg-blue-500/20
  transition-all duration-200
  cursor-pointer
">
  <div className="flex items-center justify-between">
    <span className="text-sm font-medium text-blue-900 dark:text-blue-100 truncate">
      {title}
    </span>
    <span className="text-xs text-blue-600 dark:text-blue-400">
      {time}
    </span>
  </div>
</div>

// Detailed Event
<div className="
  group relative
  p-4
  bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20
  border-2 border-blue-200 dark:border-blue-700
  rounded-xl
  hover:shadow-lg hover:scale-[1.02]
  transition-all duration-300
  cursor-pointer
">
  <div className="flex items-start gap-3">
    <div className="w-1 h-full bg-blue-500 rounded-full" />
    <div className="flex-1">
      <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
        {title}
      </h4>
      <p className="text-sm text-blue-700 dark:text-blue-300">
        {description}
      </p>
    </div>
  </div>
</div>
```

#### Date Cells
```typescript
// Calendar Day Cell
<button className="
  group relative
  aspect-square
  flex flex-col items-center justify-center
  rounded-lg
  hover:bg-gray-100 dark:hover:bg-gray-800
  transition-all duration-200
  ${isToday ? 'bg-blue-600 text-white font-bold' : ''}
  ${!isCurrentMonth ? 'text-gray-400' : 'text-gray-900 dark:text-white'}
">
  <span className="text-sm">{day}</span>
  {hasEvents && (
    <div className="absolute bottom-1 flex gap-0.5">
      {events.slice(0, 3).map((event, i) => (
        <div key={i} className={`w-1 h-1 rounded-full ${getCategoryColor(event.type)}`} />
      ))}
    </div>
  )}
</button>
```

### Visit Notes-Specific Patterns

#### Note Cards
```typescript
// Grid Card
<motion.div
  whileHover={{ y: -4, shadow: "0 10px 30px rgba(0,0,0,0.1)" }}
  className="
    group relative
    bg-white dark:bg-gray-800
    rounded-2xl
    border-2 border-gray-200 dark:border-gray-700
    overflow-hidden
    cursor-pointer
    transition-all duration-300
  "
>
  {/* Color accent bar */}
  <div className={`h-2 ${colorClass}`} />
  
  <div className="p-6">
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
      {title}
    </h3>
    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
      {preview}
    </p>
  </div>
  
  {/* Hover overlay */}
  <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
</motion.div>

// List Item
<motion.div
  whileHover={{ x: 4 }}
  className="
    group
    flex items-center gap-4
    p-4
    bg-white dark:bg-gray-800
    border-l-4 border-transparent
    hover:border-blue-500
    hover:bg-gray-50 dark:hover:bg-gray-700
    rounded-r-lg
    transition-all duration-200
    cursor-pointer
  "
>
  <div className="flex-1 min-w-0">
    <h4 className="font-semibold text-gray-900 dark:text-white truncate">
      {title}
    </h4>
    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
      {subtitle}
    </p>
  </div>
  <ChevronRight className="w-5 h-5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
</motion.div>
```

### Accessibility

#### Focus States
```typescript
// Keyboard focus
className="
  focus:outline-none
  focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
  dark:focus:ring-offset-gray-900
"

// Focus visible (keyboard only)
className="
  focus-visible:outline-none
  focus-visible:ring-2 focus-visible:ring-blue-500
"
```

#### ARIA Labels
```typescript
// Interactive elements
<button aria-label="Add new event" aria-describedby="add-event-tooltip">
  <Plus className="w-5 h-5" />
</button>

// Status indicators
<div role="status" aria-live="polite">
  {isLoading ? 'Loading events...' : `${events.length} events loaded`}
</div>
```

### Performance Optimizations

#### Lazy Loading
```typescript
// Intersection Observer for infinite scroll
const { ref, inView } = useInView({
  threshold: 0,
  triggerOnce: false
});

// Load more when in view
useEffect(() => {
  if (inView) {
    loadMore();
  }
}, [inView]);
```

#### Virtualization
```typescript
// For long lists (100+ items)
import { useVirtualizer } from '@tanstack/react-virtual';

const rowVirtualizer = useVirtualizer({
  count: items.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 80,
  overscan: 5
});
```

#### Debouncing
```typescript
// Search input
const debouncedSearch = useMemo(
  () => debounce((query: string) => {
    performSearch(query);
  }, 300),
  []
);
```

This design system provides the foundation for creating premium, accessible, and performant calendar and visit notes components.
