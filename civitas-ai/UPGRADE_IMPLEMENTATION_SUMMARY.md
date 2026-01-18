# Upgrade Flow - Implementation Summary

## ✅ What Was Built

### 1. **Usage Indicator Component**
`src/components/usage/UsageIndicator.tsx`

Two variants:
- **Full Indicator**: Shows "X/Y queries left" with upgrade button
- **Compact Badge**: Shows "Limit reached" when at limit

**Usage:**
```tsx
import { UsageIndicator, UsageBadge } from './components/usage';

// In sidebar
<UsageIndicator onUpgradeClick={handleShowPricing} />

// In composer toolbar
<UsageBadge onUpgradeClick={handleShowPricing} />
```

---

### 2. **Upgrade Prompts**
`src/components/usage/UpgradePrompt.tsx`

Two types:
- **Feature Prompt**: When trying to use premium features
- **Query Limit Prompt**: When monthly limit is reached

**Usage:**
```tsx
import { UpgradePrompt, QueryLimitPrompt } from './components/usage';

<UpgradePrompt
    feature="PDF Export"
    description="Export professional reports"
    onUpgrade={handleShowPricing}
    onDismiss={() => setShow(false)}
    isVisible={showPrompt}
/>
```

---

### 3. **Feature Gate Hook**
`src/hooks/useFeatureGate.ts`

Check if users can access premium features:

**Usage:**
```tsx
import { useFeatureGate } from '../hooks/useFeatureGate';

const { checkFeature, isAtQueryLimit, getRemainingQueries } = useFeatureGate();

// Check before action
if (!checkFeature('export_pdf', showPricingModal)) {
    return; // User doesn't have access
}

// Check query limit
if (isAtQueryLimit()) {
    showPricingModal();
    return;
}
```

**Available Features:**
- `unlimited_queries`
- `advanced_reports`
- `portfolio_analysis`
- `export_pdf`
- `priority_support`
- `ai_simulation`

---

## 🎯 Upgrade Touchpoints

### Already Exists ✅
1. **Profile Menu** - "Upgrade plan" with PRO badge (`ProfileMenuModal.tsx`)

### New Components 🆕
2. **Usage Indicator** - Shows remaining queries (sidebar)
3. **Usage Badge** - Shows "Limit reached" (composer toolbar)
4. **Feature Gates** - Blocks premium features with upgrade prompt
5. **Query Limit Check** - Prevents queries when at limit

---

## 📍 Where to Add

### High Priority
1. **Sidebar** - Add `UsageIndicator` at the bottom
2. **Query Check** - Check `isAtQueryLimit()` before sending
3. **Composer** - Add `UsageBadge` to toolbar

### Medium Priority
4. **Export Buttons** - Gate with `checkFeature('export_pdf')`
5. **Advanced Reports** - Gate with `checkFeature('advanced_reports')`
6. **Portfolio Features** - Gate with `checkFeature('portfolio_analysis')`

---

## 🚀 Quick Start

### Step 1: Add to Sidebar

```tsx
// In your sidebar component
import { UsageIndicator } from './components/usage';

<div className="sidebar">
    {/* Menu items */}
    
    {/* Add at bottom */}
    <div className="mt-auto p-4">
        <UsageIndicator onUpgradeClick={() => setPricingOpen(true)} />
    </div>
</div>
```

### Step 2: Add Query Limit Check

```tsx
// In your chat/message sending logic
import { useFeatureGate } from '../hooks/useFeatureGate';

const { isAtQueryLimit } = useFeatureGate();

const handleSendMessage = (message: string) => {
    if (isAtQueryLimit()) {
        setPricingModalOpen(true);
        return;
    }
    
    // Send message
    sendToAPI(message);
};
```

### Step 3: Add to Composer (Optional)

```tsx
// In Composer.tsx
import { UsageBadge } from '../components/usage';

<div className="composer-toolbar">
    <button>@Context</button>
    <UsageBadge onUpgradeClick={() => setPricingOpen(true)} />
    <button>📎</button>
</div>
```

---

## 🎨 Design

All components follow the Notion-inspired design:
- **Clean borders**: `border-white/[0.08]`
- **Subtle backgrounds**: `bg-white/[0.02]`
- **Teal accents**: For upgrade CTAs
- **Orange warnings**: For limits reached
- **Smooth transitions**: Hover states, animations

---

## ✅ Features

### Usage Indicator
- Shows remaining queries
- Shows "Limit reached" when at 0
- Upgrade button with gradient
- Only shows for free users
- Responsive design

### Feature Gate
- Checks user tier (free/pro/enterprise)
- Returns true/false for feature access
- Optionally shows upgrade modal
- Tracks query limits
- Easy to extend

### Upgrade Prompts
- Contextual explanations
- Dismissible
- Call-to-action buttons
- Animated entrance
- Professional appearance

---

## 📊 User Flows

### Flow 1: Sidebar Discovery
```
User sees usage indicator → 
"0/1 queries left" → 
Clicks "Upgrade" → 
Pricing modal
```

### Flow 2: Query Limit
```
User sends query → 
At limit → 
Query limit prompt → 
Clicks "Upgrade now" → 
Pricing modal
```

### Flow 3: Feature Gate
```
User clicks "Export PDF" → 
Feature gated → 
Upgrade prompt → 
"View plans" → 
Pricing modal
```

---

## 🎯 Best Practices

✅ **Do:**
- Show value before asking
- Make dismissible
- Explain benefits
- Multiple touchpoints
- Non-intrusive

❌ **Don't:**
- Block free features
- Spam popups
- Hide upgrade option
- Make free tier unusable

---

## 📝 Complete Guide

See `UPGRADE_FLOW_GUIDE.md` for:
- Detailed integration examples
- All component APIs
- User flow diagrams
- Best practices
- Recommended placements
- Implementation checklist

---

## 🎉 Result

Users can now:
- ✅ See their usage status
- ✅ Know when they're at limit
- ✅ Discover premium features
- ✅ Upgrade at the right moment
- ✅ Understand why upgrading helps

**0 linter errors** • **Notion-inspired design** • **Ready to integrate** 🚀
