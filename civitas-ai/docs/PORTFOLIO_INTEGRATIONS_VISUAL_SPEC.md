# Portfolio Integrations - Visual Specification

## 🎨 Brand Assets Required

### Company Logos (SVG preferred, PNG fallback)

```
src/assets/integrations/
├── stessa-logo.svg          # Stessa logo
├── buildium-logo.svg        # Buildium logo  
├── reiwise-logo.svg         # REIwise logo
├── quickbooks-logo.svg      # QuickBooks logo
├── appfolio-logo.svg        # AppFolio logo
├── rentec-logo.svg          # Rentec Direct logo
├── csv-icon.svg             # Generic CSV icon
├── excel-icon.svg           # Excel icon
├── pdf-icon.svg             # PDF icon
└── index.ts                 # Export all logos
```

### Logo Specifications
- **Size**: 32x32px (displayed at 16-24px)
- **Format**: SVG (scales perfectly)
- **Background**: Transparent
- **Style**: Original brand colors

---

## 📐 UI States & Specs

### State 1: Not Connected

**Composer Button**:
```
┌─────────────────────────┐
│  [🔗]                   │
│   ↑                     │
│ Chain link (18px)       │
│ No badge                │
└─────────────────────────┘
```

**Style**:
```tsx
className="p-2 rounded-lg text-white/60 hover:text-white/90"
```

---

### State 2: Single Connection (e.g., Stessa)

**Composer Button**:
```
┌───────────────────────────────────┐
│  [Logo] Stessa ●                  │
│   16px   12px  8px green dot      │
└───────────────────────────────────┘
```

**Hover Tooltip**:
```
┌─────────────────────────┐
│  Connected: 12 properties│
└─────────────────────────┘
```

**Style**:
```tsx
<button className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-white/90 hover:bg-white/[0.08]">
  <img src={stessaLogo} className="w-4 h-4" />
  <span className="text-xs font-medium">Stessa</span>
  <div className="w-2 h-2 bg-green-500 rounded-full" />
</button>
```

---

### State 3: Multiple Connections

**Composer Button**:
```
┌───────────────────────────────────┐
│  [🔗] 2 Connected ●               │
│   18px   12px text  8px dot       │
└───────────────────────────────────┘
```

**Hover Tooltip** (Shows all):
```
┌──────────────────────────────────┐
│  [Logo] Stessa (12 properties)   │
│  [Logo] Buildium (8 properties)  │
└──────────────────────────────────┘
```

**Style**:
```tsx
<button className="flex items-center gap-1.5 px-2 py-1.5">
  <Link className="w-[18px] h-[18px]" />
  <span className="text-xs">2 Connected</span>
  <div className="w-2 h-2 bg-green-500 rounded-full" />
</button>
```

---

## 🖼️ Connected Account Card Design

### Full Card Layout

```
┌────────────────────────────────────────────────┐
│  ┌─────┐  Stessa                         ✓    │
│  │Logo │  john@email.com           Connected   │
│  └─────┘                                       │
│                                                 │
│  Properties imported:  12                      │
│  Last synced:  2 hours ago                     │
│                                                 │
│  [🔄 Sync Now] [⚙️ Settings]  [🗑️ Disconnect]   │
└────────────────────────────────────────────────┘
```

### Spacing & Colors

```css
/* Card Container */
padding: 16px
background: #1F2937 (gray-800)
border: 1px solid #374151 (gray-700)
border-radius: 8px

/* Logo */
width: 40px
height: 40px
border-radius: 4px

/* Company Name */
font-size: 16px
font-weight: 600
color: #FFFFFF

/* Status Badge */
font-size: 12px
color: #10B981 (green-400)
display: flex with 8px green dot

/* Account Email */
font-size: 12px
color: #9CA3AF (gray-400)
margin-top: 2px

/* Stats Row */
font-size: 14px
label: #9CA3AF (gray-400)
value: #FFFFFF
margin-bottom: 16px

/* Buttons */
Sync: bg-blue-600, hover:bg-blue-700
Settings: text-gray-400, hover:bg-gray-700
Disconnect: text-red-400, hover:bg-red-500/10
```

---

## 🎭 Interaction States

### Hover Effects

**Composer Button (Not Connected)**:
```
Default: text-white/60
Hover: text-white/90, bg-white/[0.08]
```

**Composer Button (Connected)**:
```
Default: text-white/90, bg-white/[0.05]
Hover: bg-white/[0.08], tooltip appears
```

**Connected Card Buttons**:
```
Sync: bg-blue-600 → bg-blue-700 (on hover)
Settings: opacity-60 → opacity-100 + bg-gray-700
Disconnect: text-red-400 → text-red-300 + bg-red-500/10
```

### Loading States

**During Sync**:
```
┌────────────────────────────────┐
│  [🔄] Syncing...               │
│  Progress: 8/12 properties     │
└────────────────────────────────┘
```

**Sync Button**:
```
<button disabled className="opacity-50 cursor-not-allowed">
  <SpinnerIcon className="animate-spin" />
  Syncing...
</button>
```

---

## 🎨 Integration Grid Layout

**Modal: Available Integrations**

```
┌────────────────────────────────────────────────┐
│                                                 │
│  🔗 INTEGRATIONS                               │
│                                                 │
│  ┌──────────────────┐  ┌──────────────────┐  │
│  │ [Logo] Stessa    │  │ [Logo] Buildium  │  │
│  │ Property mgmt    │  │ PM software      │  │
│  │                  │  │                  │  │
│  │   [Connect →]    │  │   [Connect →]    │  │
│  └──────────────────┘  └──────────────────┘  │
│                                                 │
│  ┌──────────────────┐  ┌──────────────────┐  │
│  │ [Logo] REIwise   │  │ [Logo] QuickBooks│  │
│  │ Investor tool    │  │ Accounting       │  │
│  │                  │  │                  │  │
│  │   [Connect →]    │  │   [Connect →]    │  │
│  └──────────────────┘  └──────────────────┘  │
│                                                 │
└────────────────────────────────────────────────┘
```

**Grid Specs**:
```css
display: grid
grid-template-columns: repeat(2, 1fr)
gap: 16px
padding: 16px

/* Card */
background: #1F2937
border: 1px solid #374151
border-radius: 8px
padding: 16px
hover: border-color: #3B82F6 (blue-500)
```

---

## 🏷️ Badge Colors by Status

| Status | Color | Hex |
|--------|-------|-----|
| **Connected** | Green | `#10B981` |
| **Syncing** | Blue | `#3B82F6` |
| **Error** | Red | `#EF4444` |
| **Disconnected** | Gray | `#6B7280` |

**Visual Indicators**:
```tsx
// Connected
<div className="flex items-center gap-1 text-green-400">
  <div className="w-2 h-2 bg-green-500 rounded-full" />
  Connected
</div>

// Syncing
<div className="flex items-center gap-1 text-blue-400">
  <SpinnerIcon className="w-3 h-3 animate-spin" />
  Syncing
</div>

// Error
<div className="flex items-center gap-1 text-red-400">
  <AlertIcon className="w-3 h-3" />
  Error
</div>
```

---

## 📱 Responsive Design

### Desktop (>768px)
- Grid: 2 columns
- Button: Full text + icon + logo
- Tooltip: Bottom placement

### Tablet (768px - 1024px)
- Grid: 2 columns
- Button: Condensed
- Tooltip: Adaptive placement

### Mobile (<768px)
- Grid: 1 column
- Button: Icon only + count
- Modal: Full screen

**Example Mobile Button**:
```
[🔗●2]  ← Icon + dot + count only
```

---

## 🎬 Animation Specs

### Button Transitions
```css
transition: all 150ms ease-in-out
```

### Tooltip Fade
```css
opacity: 0 → 1
transition: opacity 200ms
```

### Card Hover
```css
border-color transition: 150ms
background transition: 150ms
```

### Sync Spinner
```css
animation: spin 1s linear infinite
```

---

## 🔤 Typography

**Company Name (Button)**:
```
font-size: 12px (0.75rem)
font-weight: 500 (medium)
color: rgba(255, 255, 255, 0.9)
```

**Company Name (Card)**:
```
font-size: 16px (1rem)
font-weight: 600 (semibold)
color: #FFFFFF
```

**Property Count**:
```
font-size: 12px (0.75rem)
font-weight: 400 (regular)
color: rgba(255, 255, 255, 0.6)
```

**Status Text**:
```
font-size: 12px (0.75rem)
font-weight: 500 (medium)
color: #10B981 (green) / #EF4444 (red)
```

---

## 📦 Export Format

```typescript
// src/assets/integrations/index.ts

export { default as StessaLogo } from './stessa-logo.svg';
export { default as BuildiumLogo } from './buildium-logo.svg';
export { default as REIwiseLogo } from './reiwise-logo.svg';
export { default as QuickBooksLogo } from './quickbooks-logo.svg';

// Integration metadata
export const INTEGRATIONS = {
  stessa: {
    name: 'Stessa',
    logo: StessaLogo,
    color: '#1E40AF', // Brand blue
  },
  buildium: {
    name: 'Buildium',
    logo: BuildiumLogo,
    color: '#059669', // Brand green
  },
  reiwise: {
    name: 'REIwise',
    logo: REIwiseLogo,
    color: '#DC2626', // Brand red
  },
  // ... more
};
```

---

This spec ensures **consistent branding** across all connected integration displays! 🎨
