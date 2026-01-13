# Civitas Preferences Redesign Plan
## "The Investor Profile" - Notion-Inspired Simplicity with Civitas Power

---

## 🎯 Current State Analysis

### What We Have Now:
- **Large modal** (5xl width, 90vh height)
- **3 separate tabs** (General, Financial DNA, Investment Goals)
- **50+ input fields** across all tabs
- **Complex dropdowns** and multi-selects
- **Preset buttons** for financial templates
- **Categorized markets** with 5 categories
- **Property type cards** with detailed stats
- **Manual save button** required

### Problems:
1. **Overwhelming** - Too many fields at once
2. **Modal fatigue** - Takes over the entire screen
3. **Tab confusion** - Users don't know which tab to start with
4. **No context** - Fields shown without explaining why they matter
5. **Manual sync** - Users must click "Save" to persist
6. **Not conversational** - Doesn't match Civitas' AI-first nature
7. **Disconnected** - Preferences feel separate from the main experience

---

## 🎨 Notion's Philosophy (What We'll Adapt)

### Notion's Principles:
1. **Inline editing** - No "edit mode", just click and type
2. **Progressive disclosure** - Show basics first, reveal depth on demand
3. **Hover actions** - Actions appear when you need them
4. **Minimal chrome** - Less borders, buttons, and visual noise
5. **Smart defaults** - System fills in sensible values
6. **Instant feedback** - Changes save automatically
7. **Natural hierarchy** - Visual organization without heavy UI

---

## 💡 The Civitas Approach: "Conversational Preferences"

### Core Concept:
**"Preferences are a living document, not a form to fill out"**

Instead of a modal with tabs and forms, we create:
- **Inline preference editor** (like Notion pages)
- **Conversational prompts** (AI suggests what to set based on chat history)
- **Smart cards** that expand/collapse
- **Live preview** of how preferences affect search results
- **No save button** - Everything auto-saves

---

## 📐 The New Design

### Layout: Side Panel (Not Modal)

```
┌─────────────────────────────────────────────────────────┐
│  CHAT                                    │ PROFILE │ ✕  │
│  ────────────────────────────────────────┼─────────────┤
│                                          │             │
│  [Chat messages...]                      │ Your        │
│                                          │ Investor    │
│                                          │ Profile     │
│                                          │             │
│                                          │ [Content]   │
│                                          │             │
│                                          │             │
│                                          │             │
│  [Composer]                              │             │
└─────────────────────────────────────────────────────────┘
        ← 70% →                    ← 30% →
```

**Why Side Panel?**
- ✅ Non-blocking - Don't leave chat context
- ✅ See chat while editing preferences
- ✅ Easier to reference recent conversations
- ✅ More natural flow (like Notion's sidebars)
- ✅ Can stay open while working

---

## 🎴 Component Structure

### 1. Profile Header (Always Visible)

```
┌──────────────────────────────────────┐
│  Your Investor Profile               │
│  ────────────────────────────────    │
│  You're a STR Investor               │ ← AI-generated summary
│  Looking for $200-400k deals         │
│  in Austin, Nashville +3 more        │
│                                      │
│  [⚡ 85% Complete]                   │ ← Progress indicator
└──────────────────────────────────────┘
```

**Features:**
- One-line AI summary of your profile
- Natural language (not technical jargon)
- Shows completion percentage
- Click anywhere to edit

---

### 2. The Quick Start Card (If < 50% Complete)

```
┌──────────────────────────────────────┐
│  ✨ Quick Start                       │
│                                      │
│  Civitas learns from your chats,     │
│  but you can speed things up:        │
│                                      │
│  1. I want to invest in...           │
│     [STR] [LTR] [FLIP]               │
│                                      │
│  2. My budget is around...           │
│     [$200k] [$400k] [$600k] [Other]  │
│                                      │
│  3. I'm focused on...                │
│     [+ Add City]                     │
│                                      │
│  [Skip - I'll chat instead]          │
└──────────────────────────────────────┘
```

**Features:**
- Only shown to new users or incomplete profiles
- 3 key questions max
- Can skip entirely
- Dismisses after completion

---

### 3. Core Sections (Collapsible Cards)

Each section is a clean, minimal card:

```
┌──────────────────────────────────────┐
│  🎯 Investment Strategy          ▾   │
├──────────────────────────────────────┤
│  Short-Term Rental (STR)             │ ← Click to change
│  Airbnb, VRBO, vacation rentals      │
│                                      │
│  Why this matters:                   │
│  "STR properties need different      │
│   criteria like tourism appeal..."   │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│  💰 Budget & Buying Power        ▾   │
├──────────────────────────────────────┤
│  $200,000 - $400,000                 │ ← Inline slider
│  [─────●═══════────]                 │
│                                      │
│  With 20% down, you can afford       │
│  ~$500k properties                   │
│                                      │
│  [⚙️ Adjust loan terms]              │ ← Expands to show details
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│  📍 Target Markets               ▾   │
├──────────────────────────────────────┤
│  Austin, TX          [✕]             │
│  Nashville, TN       [✕]             │
│  Raleigh, NC         [✕]             │
│                                      │
│  [+ Add Market]                      │
│                                      │
│  💡 Based on your chats, you might   │
│     also like: Charlotte, NC [+]     │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│  🏠 Property Preferences         ▾   │
├──────────────────────────────────────┤
│  Property Types                      │
│  [✓] Single Family  [✓] Multi-Family │
│  [ ] Condo          [ ] Townhouse    │
│                                      │
│  Bedrooms: Any  [2+] [3+] [4+]       │
│                                      │
│  Property Age: Any preference        │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│  🎯 Investment Goals            ▾    │
├──────────────────────────────────────┤
│  Minimum Cash Flow                   │
│  $200/month                          │
│  [────●════════────]                 │
│                                      │
│  Target Cash-on-Cash Return          │
│  8% annually                         │
│  [────●════════────]                 │
│                                      │
│  [Show advanced criteria]            │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│  🧬 Financial Assumptions       ▾    │
├──────────────────────────────────────┤
│  Use preset: [Conservative] [Moderate] [Aggressive]
│                                      │
│  Or customize:                       │
│  Down Payment        20%             │
│  Interest Rate       7.0%            │
│  Management Fee      10%             │
│  Vacancy Rate        5%              │
│                                      │
│  [Restore defaults]                  │
└──────────────────────────────────────┘
```

**Key Features:**
- **Collapsible** - Collapse what you don't need
- **Inline editing** - Click any value to change it
- **Smart labels** - "Why this matters" tooltips
- **AI suggestions** - "You might also like..."
- **No tabs** - Everything in one scroll
- **Auto-save** - Changes save as you type
- **Visual feedback** - Subtle animations on save

---

### 4. The Learning Section (AI Intelligence)

```
┌──────────────────────────────────────┐
│  🧠 What Civitas Has Learned     ▾   │
├──────────────────────────────────────┤
│  From your conversations:            │
│                                      │
│  ✓ You prefer properties near        │
│    universities (mentioned 3x)       │
│                                      │
│  ✓ You're risk-averse with repairs   │
│    (avoid fixer-uppers)              │
│                                      │
│  ✓ You care about appreciation       │
│    over immediate cash flow          │
│                                      │
│  [Clear learned preferences]         │
└──────────────────────────────────────┘
```

**Features:**
- Shows implicit preferences learned from chat
- Transparent AI behavior
- Can clear/override learnings
- Helps users understand what Civitas knows

---

## 🎭 Interaction Patterns

### 1. **Inline Value Editing**

**Clicking any value:**
```
Before:  $200,000 - $400,000
         
After:   ┌─────────────────────┐
         │ Min: [200,000]      │
         │ Max: [400,000]      │
         │ [Cancel] [✓]        │
         └─────────────────────┘
```

**Or use a popover:**
```
Click "20%":    ┌─────────────────┐
                │ Down Payment    │
                │ [─────●─────]   │
                │ 20%             │
                └─────────────────┘
```

---

### 2. **Smart Suggestions (Inline)**

```
┌──────────────────────────────────────┐
│  📍 Target Markets                   │
├──────────────────────────────────────┤
│  Austin, TX          [✕]             │
│  Nashville, TN       [✕]             │
│                                      │
│  💡 You asked about Raleigh earlier. │
│     [Add Raleigh, NC] [Dismiss]      │
└──────────────────────────────────────┘
```

---

### 3. **Progressive Disclosure**

**Collapsed:**
```
┌──────────────────────────────────────┐
│  🧬 Financial Assumptions        ▸   │
│  Using Moderate preset               │
└──────────────────────────────────────┘
```

**Expanded:**
```
┌──────────────────────────────────────┐
│  🧬 Financial Assumptions        ▾   │
├──────────────────────────────────────┤
│  Down Payment        20%             │
│  Interest Rate       7.0%            │
│  Management Fee      10%             │
│  ...                                 │
└──────────────────────────────────────┘
```

---

### 4. **Auto-Save Indicator**

```
Top-right corner of panel:

[Saved ✓]           ← Default state

[Saving...]         ← While typing (debounced)

[Failed to save ✕]  ← Error state (rare)
```

---

## 🎨 Visual Design (Civitas Glass Style)

### Color Palette:
```css
Background:     bg-slate-900/95 backdrop-blur-xl
Cards:          bg-white/[0.03] border border-white/[0.08]
Hover:          hover:bg-white/[0.05]
Active:         bg-white/[0.08]
Text Primary:   text-white/90
Text Secondary: text-white/60
Text Tertiary:  text-white/40
Accent:         text-cyan-400, text-emerald-400
```

### Typography:
```css
Panel Title:    text-xl font-semibold
Section Title:  text-sm font-medium uppercase tracking-wide
Values:         text-base font-normal
Labels:         text-xs font-medium text-white/50
```

### Spacing:
```css
Panel Padding:  p-6
Card Gap:       space-y-3
Inner Padding:  p-4
Element Gap:    gap-3
```

### Animations:
```css
Card Expand:    duration-200 ease-out
Value Change:   duration-150 ease-in-out
Save Flash:     pulse once on save
```

---

## 📱 Responsive Behavior

### Desktop (1024px+):
- Side panel: 400px fixed width
- Slides in from right
- Overlay on chat with backdrop blur

### Tablet (768px - 1023px):
- Full-screen panel
- Slides in from right
- Back button top-left
- Slightly wider (500px)

### Mobile (< 768px):
- Full-screen modal
- Slides up from bottom
- Swipe down to dismiss
- Simplified layout (no side-by-side)

---

## 🔄 User Flows

### Flow 1: First-Time User

```
1. Opens chat → Sees welcome message
2. "Let me know your preferences to get better results"
3. Clicks "Set Preferences" → Side panel opens
4. Sees "Quick Start" card (3 questions)
5. Fills in basics → Auto-saves → Panel stays open
6. Continues chatting → Panel slides away
7. Next search uses preferences
```

### Flow 2: Adjusting Budget Mid-Chat

```
1. User: "Find properties in Austin under $500k"
2. Civitas: Shows results + "I've updated your budget to $500k"
3. User clicks preferences chip → Panel opens
4. Sees budget updated to $500k automatically
5. Adjusts to $400k manually → Auto-saves
6. Panel closes → Civitas re-runs search with new budget
```

### Flow 3: Advanced User

```
1. Clicks preferences chip → Panel opens
2. Scrolls to "Financial Assumptions"
3. Clicks "Customize" → Expands to show all fields
4. Adjusts down payment, interest rate, etc.
5. Clicks "Show advanced criteria" in Goals section
6. Sets max rehab cost, min cap rate, etc.
7. All changes auto-save as they type
8. Closes panel → Preferences applied to future searches
```

---

## 🧩 Component Breakdown

### New Components to Build:

1. **`PreferencesPanel.tsx`**
   - Main container (side panel)
   - Handles open/close animations
   - Auto-save coordination

2. **`ProfileSummary.tsx`**
   - AI-generated summary at top
   - Completion percentage
   - Edit mode toggle

3. **`QuickStartCard.tsx`**
   - 3-question onboarding
   - Only shown if < 50% complete
   - Dismissible

4. **`PreferenceSection.tsx`**
   - Reusable collapsible card
   - Takes: title, icon, children
   - Manages expand/collapse state

5. **`InlineEdit.tsx`**
   - Generic inline editor
   - Supports: text, number, select, slider
   - Auto-save on blur/change

6. **`SmartSuggestion.tsx`**
   - Inline AI suggestion card
   - "You might like..." prompts
   - One-click accept/dismiss

7. **`LearningDisplay.tsx`**
   - Shows implicit learnings
   - List of inferred preferences
   - Clear option

8. **`BudgetSlider.tsx`**
   - Custom dual-handle slider
   - Shows buying power calculation
   - Smooth animations

9. **`MarketSelector.tsx`**
   - Tag-based market list
   - Autocomplete input
   - AI suggestions

10. **`PresetSelector.tsx`**
    - Financial preset buttons
    - Smooth transition to custom values
    - Visual feedback

---

## 🚀 Implementation Strategy

### Phase 1: Foundation (Days 1-2)
- ✅ Create `PreferencesPanel` component
- ✅ Build basic slide-in/out animation
- ✅ Add backdrop blur overlay
- ✅ Implement close on escape/backdrop click
- ✅ Create `PreferenceSection` collapsible card

### Phase 2: Core Sections (Days 3-4)
- ✅ Build `ProfileSummary` with AI summary
- ✅ Create `BudgetSlider` component
- ✅ Build `MarketSelector` with autocomplete
- ✅ Create `InlineEdit` for simple values
- ✅ Implement strategy selector

### Phase 3: Advanced Features (Days 5-6)
- ✅ Add `QuickStartCard` for onboarding
- ✅ Build `SmartSuggestion` components
- ✅ Create `LearningDisplay` section
- ✅ Implement financial presets
- ✅ Add advanced goals section

### Phase 4: Polish & Integration (Days 7-8)
- ✅ Auto-save functionality
- ✅ Real-time validation
- ✅ Error handling
- ✅ Loading states
- ✅ Animations and transitions
- ✅ Responsive design
- ✅ Keyboard navigation
- ✅ Integrate with existing store
- ✅ Update backend sync

---

## 🎯 Success Metrics

### User Experience:
- ✅ Users can set basic preferences in < 30 seconds
- ✅ < 3 clicks to change any preference
- ✅ No confusion about what to set first
- ✅ Preferences feel integrated, not separate

### Technical:
- ✅ Auto-save latency < 200ms
- ✅ Panel animation 60fps smooth
- ✅ No layout shift on open/close
- ✅ Works on all screen sizes

---

## 🆚 Key Differences from Current Modal

| Current Modal | New Panel |
|--------------|-----------|
| 5xl width (1280px) | 400px side panel |
| 90vh height | Full height |
| 3 tabs | Single scroll |
| 50+ visible fields | ~15 visible, rest collapsed |
| Manual save button | Auto-save |
| Blocks entire screen | Non-blocking |
| Form-like | Document-like |
| Technical language | Natural language |
| Static | AI-enhanced |
| Separate experience | Integrated experience |

---

## 🎨 Design Inspiration Summary

### From Notion:
- ✅ Inline editing (click-to-edit values)
- ✅ Collapsible sections (progressive disclosure)
- ✅ Clean, minimal design (less chrome)
- ✅ Auto-save (no save button)
- ✅ Hover actions (subtle UI)

### Unique to Civitas:
- ✅ AI-generated summary ("You're a STR investor...")
- ✅ Smart suggestions ("You might like...")
- ✅ Learning display ("What Civitas knows...")
- ✅ Live impact preview (buying power, etc.)
- ✅ Conversational prompts (not form fields)
- ✅ Glass morphism aesthetic
- ✅ Non-blocking side panel (not modal)

---

## 📋 Next Steps

1. **Review & Approve** this plan
2. **Create components** in phases
3. **Test with users** at each phase
4. **Iterate** based on feedback
5. **Replace old modal** when ready

---

## 💬 Open Questions

1. Should preferences panel remember its open/closed state?
2. Should we add a "Compare" mode to see before/after preferences?
3. Should advanced users be able to create multiple profiles?
4. Should we add preset templates ("The STR Pro", "The Flipper", etc.)?
5. Should preferences sync across devices in real-time?

---

**Ready to implement? Let's make preferences feel like a natural extension of the conversation, not a form to fill out.**

