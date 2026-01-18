# Premium Calendar - Design Documentation

## Overview
A modern, professional calendar component inspired by Google Calendar, Apple Calendar, and Notion with custom enhancements for real estate investment management.

## Design Philosophy

### 1. **Google Calendar Influence**
- **Clean Hierarchy**: Clear visual organization with distinct header, sidebar, and main content areas
- **Smart Scheduling**: Quick add with natural language processing
- **Multiple Views**: Month, Week, Day, Agenda, Timeline
- **Color Coding**: Category-based color system for quick visual scanning
- **Quick Actions**: Inline event management without modal friction

### 2. **Apple Calendar Influence**
- **Beautiful Typography**: San Francisco-inspired font hierarchy
- **Smooth Animations**: Framer Motion for buttery transitions
- **Intuitive Gestures**: Hover states, click interactions, keyboard shortcuts
- **Premium Aesthetics**: Gradients, glassmorphism, subtle shadows
- **Light/Dark Mode**: Full theme support with proper contrast

### 3. **Notion Influence**
- **Database Views**: Multiple perspectives on the same data
- **Flexible Filtering**: Category, priority, completion status
- **List-Based Agenda**: Clean, scannable event lists
- **Timeline View**: Gantt-style project timeline
- **Minimal Design**: Focus on content, not chrome

## Key Features

### View Modes (5 Total)

#### 1. Month View
- **Layout**: 7x6 grid (42 days including overflow)
- **Design**: Google Calendar-inspired with clean cells
- **Features**:
  - Current month highlighted
  - Today indicator (blue circle)
  - Up to 3 events per day visible
  - "+X more" indicator for overflow
  - Hover effects on cells
  - Click to select date

#### 2. Week View
- **Layout**: 7 columns for full week
- **Design**: Apple Calendar-inspired with time blocks
- **Features**:
  - Large date numbers
  - Full event cards with descriptions
  - Time indicators
  - Recurring event badges
  - Smooth card animations

#### 3. Day View
- **Layout**: Single day focus with large event cards
- **Design**: Detailed view for deep focus
- **Features**:
  - Large emoji icons
  - Full descriptions
  - Priority badges
  - Time and recurrence info
  - Spacious layout for readability

#### 4. Agenda View
- **Layout**: Chronological list grouped by date
- **Design**: Notion-inspired clean lists
- **Features**:
  - Sticky date headers
  - "Today" highlighting
  - Compact event cards
  - Smooth hover animations
  - Easy scanning

#### 5. Timeline View
- **Layout**: Gantt-style horizontal timeline
- **Design**: Project management inspired
- **Features**:
  - Days until/overdue indicators
  - Chronological sorting
  - Priority badges
  - Staggered animations
  - Quick status overview

### Sidebar Features

#### Mini Calendar
- **Compact month view**
- **Event indicators** (blue dots)
- **Today highlighting**
- **Month navigation**
- **Date selection**

#### Category Filtering
- **7 Event Categories**:
  - 🏛️ Tax & Compliance (Red)
  - 🔧 Maintenance (Orange)
  - 📄 Lease & Rental (Blue)
  - 🛡️ Insurance (Purple)
  - 👥 Meetings (Green)
  - 🔍 Inspections (Cyan)
  - 💰 Financial (Pink)

- **Multi-select filtering**
- **Event count badges**
- **Active state highlighting**

#### Show Completed Toggle
- **Toggle switch UI**
- **Filter completed events**
- **Persistent state**

### Header Features

#### Stats Pills
- **Today count** with pulsing indicator
- **Overdue count** with bell icon
- **Color-coded urgency**

#### Search
- **Real-time filtering**
- **Search across titles**
- **Debounced input**

#### Date Navigation
- **Previous/Next buttons**
- **Today quick jump**
- **Current date display**
- **Context-aware formatting**

#### View Switcher
- **5 view mode buttons**
- **Icon + label**
- **Active state highlighting**
- **Smooth transitions**

### Modals

#### Quick Add Modal
- **Natural language input**
- **Example prompts**
- **Keyboard shortcuts**
- **Backdrop blur**
- **Smooth animations**

#### Event Detail Modal
- **Full event information**
- **Category color header**
- **Mark complete action**
- **Delete action**
- **Close button**

## Design Tokens

### Colors

#### Light Mode
- **Background**: `bg-gradient-to-br from-gray-50 via-white to-blue-50/30`
- **Cards**: `bg-white` with `border-gray-200`
- **Text Primary**: `text-gray-900`
- **Text Secondary**: `text-gray-600`
- **Text Tertiary**: `text-gray-500`

#### Dark Mode
- **Background**: `bg-gradient-to-br from-gray-950 via-gray-900 to-blue-950/20`
- **Cards**: `bg-gray-900` with `border-white/5`
- **Text Primary**: `text-white`
- **Text Secondary**: `text-gray-400`
- **Text Tertiary**: `text-gray-500`

#### Category Colors
Each category has 4 states: `bg`, `border`, `text`, `hover`
- **Blue**: Primary actions, default events
- **Purple**: Insurance, premium features
- **Green**: Meetings, positive actions
- **Orange**: Maintenance, warnings
- **Red**: Tax, critical items
- **Pink**: Financial, revenue
- **Cyan**: Inspections, reviews

### Typography
- **Headers**: `text-2xl font-semibold` to `text-3xl font-bold`
- **Body**: `text-sm` to `text-base`
- **Labels**: `text-xs font-semibold uppercase tracking-wider`
- **Buttons**: `text-sm font-medium`

### Spacing
- **Section Gap**: `space-y-6` to `space-y-8`
- **Card Padding**: `p-4` to `p-6`
- **Button Padding**: `px-4 py-2`
- **Grid Gap**: `gap-1` to `gap-4`

### Animations
- **Page Transitions**: `duration-200ms ease-in-out`
- **Hover Effects**: `scale-1.01` to `scale-1.02`
- **Modal Entry**: `opacity + scale + y-offset`
- **Staggered Lists**: `delay: index * 0.05s`

### Shadows
- **Cards**: `shadow-sm`
- **Modals**: `shadow-2xl`
- **Buttons**: `shadow-sm hover:shadow-md`

## User Experience Patterns

### Event Management Flow
1. **View Events**: Select view mode → Browse calendar
2. **Quick Add**: Click + button → Type naturally → Create
3. **Event Detail**: Click event → View details → Take action
4. **Complete**: Click complete → Event marked done
5. **Delete**: Click delete → Confirm → Event removed

### Filtering Flow
1. **Search**: Type query → Real-time filter
2. **Category**: Click category → Toggle filter
3. **Completed**: Toggle switch → Show/hide
4. **Clear**: Remove all filters → Reset view

### Navigation Flow
1. **Date**: Click prev/next → Navigate time
2. **Today**: Click today → Jump to current
3. **View**: Click view mode → Switch perspective
4. **Sidebar**: Collapse/expand → Adjust space

## Technical Implementation

### Performance
- **Memoization**: `useMemo` for filtered events and stats
- **Lazy Loading**: Views load on demand
- **Debounced Search**: 300ms delay on input
- **Optimized Renders**: React.memo on view components
- **Animation GPU**: Transform and opacity only

### Accessibility
- **Keyboard Navigation**: Tab through all interactive elements
- **ARIA Labels**: Descriptive labels on buttons
- **Focus Indicators**: Clear visual focus states
- **Screen Reader**: Semantic HTML structure
- **Color Contrast**: WCAG AA compliant

### Responsive Design
- **Mobile**: Single column, bottom nav, compact cards
- **Tablet**: 2 columns, top nav, medium cards
- **Desktop**: Sidebar + main, full features
- **Breakpoints**: sm (640px), md (768px), lg (1024px)

## Comparison to Industry Leaders

### vs Google Calendar
**Adopted:**
- Multiple view modes
- Color-coded categories
- Quick add functionality
- Clean grid layout

**Enhanced:**
- More view options (5 vs 4)
- Better dark mode
- Smoother animations
- Real estate specific categories

### vs Apple Calendar
**Adopted:**
- Beautiful typography
- Smooth animations
- Premium aesthetics
- Intuitive interactions

**Enhanced:**
- More filtering options
- Timeline view
- Better search
- Category system

### vs Notion
**Adopted:**
- Database-style views
- Flexible filtering
- List-based agenda
- Minimal design

**Enhanced:**
- Better date navigation
- Quick add modal
- Event detail modal
- Time-based views

## Future Enhancements

### Phase 2
- [ ] Drag & drop event rescheduling
- [ ] Recurring event management
- [ ] Event templates
- [ ] Bulk actions
- [ ] Export to iCal

### Phase 3
- [ ] AI scheduling suggestions
- [ ] Conflict detection
- [ ] Time blocking
- [ ] Meeting scheduling
- [ ] Calendar sync (Google, Apple)

### Phase 4
- [ ] Team calendars
- [ ] Shared events
- [ ] Availability sharing
- [ ] Booking links
- [ ] Analytics dashboard

## Usage

```tsx
import { PremiumCalendar } from '@/components/calendar/PremiumCalendar';

// Basic usage
<PremiumCalendar />

// With custom className
<PremiumCalendar className="custom-styles" />
```

## Dependencies
- `framer-motion`: Smooth animations
- `lucide-react`: Icon library
- `calendarService`: Data fetching
- `AuthContext`: User authentication

## File Structure
```
src/components/calendar/
├── PremiumCalendar.tsx          # Main component (600+ lines)
├── CalendarViews.tsx            # View components (500+ lines)
├── CustomCalendar.tsx           # Legacy (deprecated)
├── RedesignedCalendarView.tsx   # Legacy (deprecated)
└── FocusCalendarView.tsx        # Legacy (deprecated)
```

## Migration Guide

### From RedesignedCalendarView to PremiumCalendar
```tsx
// Old
<RedesignedCalendarView className="..." />

// New
<PremiumCalendar className="..." />
```

**Benefits:**
- 5 view modes vs 2
- Better filtering
- Cleaner design
- Smoother animations
- Better performance
- Modern UI patterns
