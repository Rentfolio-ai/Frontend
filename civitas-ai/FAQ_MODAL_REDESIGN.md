# FAQ Modal - Minimal & Professional Redesign

**Inspired by Notion and Claude** - Clean, simple, and focused.

---

## 🎯 **Design Philosophy**

### **Minimal & Professional**
- ✅ Clean dark theme (`#1a1a1a`)
- ✅ Subtle borders (`border-white/[0.06]`, `border-white/[0.08]`)
- ✅ No bright colors
- ✅ Simple typography
- ✅ Clear hierarchy

### **Like Notion & Claude**
- Minimal decoration
- Subtle accents
- Clean spacing
- Professional polish
- Focus on content

---

## 🎨 **What Changed**

### **Before → After**

#### **Colors**
- ❌ Teal contact button (`bg-teal-500`)
- ❌ Teal hover state (`hover:bg-teal-600`)
- ✅ **White button** (`bg-white`)
- ✅ **Clean hover** (`hover:bg-white/90`)
- ✅ High contrast on dark background

#### **Typography**
- ❌ Larger text sizes
- ✅ **Smaller, cleaner text** (`text-sm`)
- ✅ Better hierarchy with opacity
- ✅ More refined spacing

#### **Search Input**
- ❌ Larger padding
- ✅ **Compact design** (`py-2.5`)
- ✅ Smaller icon (`w-4 h-4`)
- ✅ Better proportions

#### **Category Pills**
- ❌ Larger pills (`py-2`)
- ✅ **Compact pills** (`py-1.5`)
- ✅ Smaller text (`text-xs`)
- ✅ More refined

#### **FAQ Items**
- ❌ Background color changes
- ❌ Larger padding
- ✅ **Border hover only** (cleaner)
- ✅ **Smaller padding** (`px-5 py-4`)
- ✅ Subtle hover state

#### **Chevron Icon**
- ❌ Larger chevron (`w-5 h-5`)
- ✅ **Smaller chevron** (`w-4 h-4`)
- ✅ More subtle (`text-white/30`)

---

## 🎨 **Design System**

### **Colors**
```css
/* Background */
bg-[#1a1a1a]           - Modal background
bg-white/[0.02]        - Footer subtle bg

/* Borders */
border-white/[0.06]    - Header/footer dividers
border-white/[0.08]    - FAQ item borders
hover:border-white/[0.12] - Hover state

/* Text */
text-white             - Main headings
text-white/90          - Questions, emphasis
text-white/70          - Category hover
text-white/60          - Answers
text-white/50          - Descriptions, inactive
text-white/40          - Very muted
text-white/30          - Placeholder, chevron

/* Buttons */
bg-white               - Contact CTA (high contrast)
hover:bg-white/90      - Hover state
bg-white/[0.10]        - Active category
```

### **Typography**
```css
/* Headings */
text-2xl font-semibold  - Modal title
text-sm font-medium     - Questions, labels
text-xs font-medium     - Category pills

/* Body */
text-sm                 - Search, answers, buttons
text-xs                 - Footer description
```

### **Spacing**
```css
px-8 py-6       - Header/footer
px-8 py-5       - Search section
px-8 py-4       - Categories
px-5 py-4       - FAQ items
space-y-2       - Between FAQ items
gap-2           - Category pills
```

---

## 📐 **Layout Structure**

```
┌──────────────────────────────────────┐
│  [X]  Frequently asked questions     │
│       Find answers...                │
├──────────────────────────────────────┤
│  [🔍] Search for answers...          │
├──────────────────────────────────────┤
│  [All] [Getting Started] [Features]  │
├──────────────────────────────────────┤
│                                      │
│  ┌────────────────────────────────┐ │
│  │ Question 1              [>]    │ │
│  └────────────────────────────────┘ │
│  ┌────────────────────────────────┐ │
│  │ Question 2              [v]    │ │
│  │ Answer expanded here...        │ │
│  └────────────────────────────────┘ │
│                                      │
├──────────────────────────────────────┤
│  Still have questions?               │
│  We're here to help  [Contact] ──────┤
└──────────────────────────────────────┘
```

---

## ✨ **Key Features**

### **1. Clean Search Input**
```tsx
<input className="
  py-2.5 px-11
  bg-white/[0.03]
  border border-white/[0.08]
  focus:border-white/[0.15]
  text-sm
  placeholder:text-white/30
" />
```

**Compact and minimal with subtle focus state.**

### **2. Refined Category Pills**
```tsx
<button className="
  px-3 py-1.5
  rounded-lg
  text-xs
  bg-white/[0.10] (active)
  text-white/50 hover:text-white/70 (inactive)
" />
```

**Smaller, cleaner, more professional.**

### **3. Minimal FAQ Items**
```tsx
<div className="
  border border-white/[0.08]
  hover:border-white/[0.12]
  rounded-lg
">
  <button className="hover:bg-white/[0.02]">
    Question
    <ChevronRight className="w-4 h-4 text-white/30" />
  </button>
</div>
```

**Border hover only - no background color changes.**

### **4. High Contrast CTA**
```tsx
<a className="
  bg-white
  hover:bg-white/90
  text-[#1a1a1a]
">
  <Mail />
  Contact support
</a>
```

**White button on dark - clean and professional.**

---

## 🆚 **Comparison**

| Element | Before | After |
|---------|--------|-------|
| **Contact button** | Teal | **White** (high contrast) |
| **Search input** | Larger | **Compact** (`py-2.5`) |
| **Category pills** | Larger | **Smaller** (`py-1.5`, `text-xs`) |
| **FAQ items** | Background changes | **Border hover only** |
| **Chevron** | `w-5 h-5` | **`w-4 h-4`** (smaller) |
| **Text sizes** | Mixed | **Consistent & smaller** |
| **Overall** | Good but colorful | **Minimal & professional** |

---

## 🎯 **Design Principles**

### **Notion-Inspired**
1. **Minimal colors** - Mostly grayscale
2. **Subtle accents** - No bright colors
3. **Clean spacing** - Compact and organized
4. **Simple interactions** - Border hovers, not backgrounds
5. **Professional** - Trustworthy appearance

### **Claude-Inspired**
1. **Dark theme** - `#1a1a1a` background
2. **Simple borders** - `white/[0.08]`
3. **High contrast CTA** - White button
4. **Clean typography** - Small and refined
5. **Minimal decoration** - Content-focused

---

## 📊 **Component Breakdown**

### **Header**
- Semibold title: "Frequently asked questions"
- Subtle description below
- Clean close button with hover state
- Border bottom for separation

### **Search**
- Compact input (`py-2.5`)
- Small search icon (`w-4 h-4`)
- Subtle placeholder (`text-white/30`)
- Focus border brightens slightly

### **Categories**
- Small pills (`py-1.5`, `text-xs`)
- Active: `bg-white/[0.10]`
- Inactive: `text-white/50` with hover
- Horizontal scroll for many categories

### **FAQ Items**
- Minimal border (`border-white/[0.08]`)
- Hover border brightens (`hover:border-white/[0.12]`)
- Small chevron (`w-4 h-4`)
- Rotates 90° when expanded
- Answer revealed with top border

### **Footer**
- Two-column layout
- Left: Question + description
- Right: White contact button (high contrast)
- Subtle background (`bg-white/[0.02]`)

---

## ✅ **Benefits**

### **For Users**
- ✅ **Cleaner** - Less visual noise
- ✅ **Easier to scan** - Better hierarchy
- ✅ **Professional** - More trustworthy
- ✅ **Focused** - Content stands out

### **For Brand**
- ✅ **Consistent** - Matches dark theme
- ✅ **Professional** - Premium feel
- ✅ **Timeless** - Won't look dated
- ✅ **Cohesive** - Matches pricing modal

---

## 🎨 **Color Philosophy**

### **No Bright Colors**
- No teal, no green, no blue
- Only white with varying opacity
- Clean and professional

### **Opacity-Based Hierarchy**
```css
text-white        - Most important (headings)
text-white/90     - Very important (questions)
text-white/70     - Important (hovers)
text-white/60     - Standard (answers)
text-white/50     - Less important (descriptions)
text-white/40     - Muted (footer)
text-white/30     - Very muted (placeholder, icons)
```

**Simple, consistent, and scalable.**

---

## 🚀 **Result**

### **A minimal, professional FAQ modal:**

1. ✅ **Dark theme** (`#1a1a1a`)
2. ✅ **No bright colors** (white button only)
3. ✅ **Compact design** (smaller text/spacing)
4. ✅ **Subtle interactions** (border hovers)
5. ✅ **High contrast CTA** (white button)
6. ✅ **Clean typography** (refined hierarchy)
7. ✅ **Like Notion & Claude** (minimal and clean)

---

## 📝 **Usage**

```tsx
import { FAQModal } from './components/FAQModal';

<FAQModal 
  isOpen={showFAQ}
  onClose={() => setShowFAQ(false)}
/>
```

**That's it!** Simple, clean, professional. ✨

---

**✅ 0 linter errors**  
**✅ Fully responsive**  
**✅ Minimal & professional**  
**✅ Like Notion & Claude**  
**✅ Ready to ship! 🚀**
