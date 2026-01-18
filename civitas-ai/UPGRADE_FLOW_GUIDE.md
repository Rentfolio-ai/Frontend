# Upgrade Flow Implementation Guide

A complete guide for implementing contextual upgrade prompts throughout your app. This makes upgrading discoverable and contextual, following best practices from Notion, Linear, and other modern SaaS apps.

## 🎯 Philosophy

**Show upgrade options when users need them, not before.**

- ✅ Contextual - Show upgrades when trying premium features
- ✅ Non-intrusive - Don't block free features with popups
- ✅ Value-focused - Explain why upgrading helps
- ✅ Multiple touchpoints - Make it easy to find

---

## 📍 Upgrade Touchpoints

### 1. **Profile Menu** (Already Implemented)
Location: `ProfileMenuModal.tsx`

The "Upgrade plan" option with PRO badge appears in the profile menu:

```tsx
<MenuItem
    icon={Zap}
    label="Upgrade plan"
    badge={!isPremium ? "PRO" : undefined}
    onClick={onUpgradeClick}
/>
```

**When to use:** Always visible, non-intrusive

---

### 2. **Usage Indicator** (New Component)
Location: `src/components/usage/UsageIndicator.tsx`

Shows remaining queries with upgrade CTA:

```tsx
import { UsageIndicator } from './components/usage';

<UsageIndicator onUpgradeClick={handleShowPricing} />
```

**Visual:**
```
┌─────────────────────────────────────────┐
│ 📈 Free Plan                            │
│ 0 / 1 queries left         [Upgrade] ⚡ │
└─────────────────────────────────────────┘
```

**Where to add:**
- Sidebar (below menu items)
- Dashboard header
- Settings page

**When to show:** For free users only

---

### 3. **Usage Badge** (New Component)
Location: `src/components/usage/UsageIndicator.tsx`

Compact badge for toolbar/composer:

```tsx
import { UsageBadge } from './components/usage';

<UsageBadge onUpgradeClick={handleShowPricing} />
```

**Visual:**
```
[⚡ Limit reached]  ← Orange badge when at limit
```

**Where to add:**
- Composer toolbar (next to Context button)
- Top navigation bar
- Chat input area

**When to show:** Only when user hits query limit

---

### 4. **Feature Gate Hook** (New Hook)
Location: `src/hooks/useFeatureGate.ts`

Check if user can access premium features:

```tsx
import { useFeatureGate } from '../hooks/useFeatureGate';

const { checkFeature, isAtQueryLimit } = useFeatureGate();

// Before allowing a premium action
const handleExportPDF = () => {
    if (!checkFeature('export_pdf', () => setPricingModalOpen(true))) {
        return; // User doesn't have access, modal shown
    }
    
    // User has access, proceed
    exportToPDF();
};
```

**Available features:**
- `unlimited_queries` - More than 1 query per month
- `advanced_reports` - Investment-grade reports
- `portfolio_analysis` - Portfolio analytics
- `export_pdf` - PDF export
- `priority_support` - Priority support
- `ai_simulation` - Advanced AI features

---

### 5. **Upgrade Prompt** (New Component)
Location: `src/components/usage/UpgradePrompt.tsx`

Inline prompt when trying to use premium features:

```tsx
import { UpgradePrompt } from './components/usage';

<UpgradePrompt
    feature="Advanced Reports"
    description="Get investment-grade reports with detailed analytics and projections"
    onUpgrade={handleShowPricing}
    onDismiss={() => setShowPrompt(false)}
    isVisible={showPrompt}
/>
```

**Visual:**
```
┌──────────────────────────────────────────────┐
│ ✨ Upgrade to use Advanced Reports           │
│ Get investment-grade reports with detailed   │
│ analytics and projections                    │
│ [View plans] [Maybe later]              [×]  │
└──────────────────────────────────────────────┘
```

**When to show:** When user clicks on a premium feature

---

### 6. **Query Limit Prompt** (New Component)
Location: `src/components/usage/UpgradePrompt.tsx`

Shows when user reaches query limit:

```tsx
import { QueryLimitPrompt } from './components/usage';

<QueryLimitPrompt
    onUpgrade={handleShowPricing}
    isVisible={isAtQueryLimit()}
/>
```

**Visual:**
```
┌──────────────────────────────────────────────┐
│ 🚀 You've reached your monthly limit         │
│ Upgrade to Professional for unlimited        │
│ queries and advanced features                │
│ [Upgrade now]                                │
└──────────────────────────────────────────────┘
```

**Where to show:**
- Top of chat interface
- Before sending a query
- In empty state

---

## 🔌 Integration Examples

### Example 1: Composer with Usage Badge

```tsx
// src/components/chat/Composer.tsx
import { UsageBadge } from '../usage';
import { useFeatureGate } from '../../hooks/useFeatureGate';

export const Composer = ({ onSend, onShowPricing }) => {
    const { isAtQueryLimit } = useFeatureGate();
    
    const handleSend = (message: string) => {
        // Check query limit before sending
        if (isAtQueryLimit()) {
            onShowPricing(); // Show pricing modal
            return;
        }
        
        onSend(message);
    };
    
    return (
        <div>
            {/* Composer toolbar */}
            <div className="flex items-center gap-2">
                <button>@Context</button>
                <button>📎</button>
                <UsageBadge onUpgradeClick={onShowPricing} />
            </div>
            
            {/* Input area */}
            <textarea onChange={...} />
        </div>
    );
};
```

---

### Example 2: Sidebar with Usage Indicator

```tsx
// src/components/DesktopShell.tsx
import { UsageIndicator } from './components/usage';

export const DesktopShell = () => {
    const [pricingModalOpen, setPricingModalOpen] = useState(false);
    
    return (
        <div>
            {/* Sidebar */}
            <aside className="w-64">
                {/* Menu items */}
                <nav>...</nav>
                
                {/* Usage indicator at bottom */}
                <div className="mt-auto p-4">
                    <UsageIndicator 
                        onUpgradeClick={() => setPricingModalOpen(true)} 
                    />
                </div>
            </aside>
            
            {/* Pricing Modal */}
            <PricingModal 
                isOpen={pricingModalOpen}
                onClose={() => setPricingModalOpen(false)}
            />
        </div>
    );
};
```

---

### Example 3: Feature-Gated Export

```tsx
// src/components/reports/ReportDrawer.tsx
import { useFeatureGate } from '../../hooks/useFeatureGate';
import { UpgradePrompt } from '../usage';

export const ReportDrawer = ({ onShowPricing }) => {
    const { checkFeature } = useFeatureGate();
    const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
    
    const handleExportPDF = () => {
        if (!checkFeature('export_pdf', () => setShowUpgradePrompt(true))) {
            return;
        }
        
        // User has access, export PDF
        exportToPDF();
    };
    
    return (
        <div>
            <UpgradePrompt
                feature="PDF Export"
                description="Export professional reports to share with clients and partners"
                onUpgrade={() => {
                    setShowUpgradePrompt(false);
                    onShowPricing();
                }}
                onDismiss={() => setShowUpgradePrompt(false)}
                isVisible={showUpgradePrompt}
            />
            
            <button onClick={handleExportPDF}>
                Export PDF
            </button>
        </div>
    );
};
```

---

### Example 4: Query Limit Check

```tsx
// src/hooks/useChat.ts
import { useFeatureGate } from './useFeatureGate';

export const useChat = (onShowPricing: () => void) => {
    const { isAtQueryLimit } = useFeatureGate();
    
    const sendMessage = async (message: string) => {
        // Check limit before sending
        if (isAtQueryLimit()) {
            onShowPricing();
            return {
                error: 'Query limit reached. Please upgrade to continue.',
            };
        }
        
        // Send message to API
        const response = await api.sendMessage(message);
        return response;
    };
    
    return { sendMessage };
};
```

---

## 🎨 Visual Hierarchy

### Urgency Levels

1. **Low** - Profile menu (always visible, subtle)
2. **Medium** - Usage indicator (shows remaining, not urgent)
3. **High** - Usage badge (appears when at limit)
4. **Critical** - Query limit prompt (blocks action)

### Color Coding

- **Teal/Purple** - Upgrade CTA (positive, exciting)
- **Orange** - Limit warnings (attention, not error)
- **White/Gray** - Information (neutral)

---

## 📍 Recommended Placement

### Must Have (High Priority)
1. ✅ **Profile menu** - "Upgrade plan" option (already exists)
2. ✅ **Sidebar bottom** - Usage indicator
3. ✅ **Before sending query** - Check if at limit

### Should Have (Medium Priority)
4. **Composer toolbar** - Usage badge (when at limit)
5. **Export buttons** - Feature gate with prompt
6. **Advanced features** - Feature gate with prompt

### Nice to Have (Low Priority)
7. **Dashboard** - Usage indicator in header
8. **Settings page** - Usage breakdown
9. **Empty states** - Upgrade prompt for premium features

---

## 🚀 Implementation Checklist

### Phase 1: Core Components (Already Done)
- [x] Create `UsageIndicator` component
- [x] Create `UsageBadge` component
- [x] Create `UpgradePrompt` component
- [x] Create `QueryLimitPrompt` component
- [x] Create `useFeatureGate` hook

### Phase 2: Integration Points
- [ ] Add `UsageIndicator` to sidebar
- [ ] Add query limit check before sending messages
- [ ] Add `UsageBadge` to composer toolbar
- [ ] Gate PDF export with `useFeatureGate`
- [ ] Gate advanced reports with `useFeatureGate`

### Phase 3: Polish
- [ ] Add analytics tracking for upgrade clicks
- [ ] A/B test different prompt copy
- [ ] Add "Learn more" links to pricing page
- [ ] Track conversion funnel

---

## 📊 Example User Flows

### Flow 1: New User Exploration
```
1. User signs up (free tier)
2. User sees "0/1 queries left" in sidebar
3. User asks first question → Success
4. User tries second question → Query limit prompt
5. User clicks "Upgrade now" → Pricing modal
```

### Flow 2: Power User
```
1. User uses free query quickly
2. User sees "Limit reached" badge in composer
3. User clicks badge → Pricing modal
4. User upgrades → Badge disappears
```

### Flow 3: Export Attempt
```
1. User generates report
2. User clicks "Export PDF"
3. Feature gate triggers → Upgrade prompt
4. User clicks "View plans" → Pricing modal
```

---

## 🎯 Best Practices

### Do ✅
- Show value before asking for money
- Make it easy to dismiss prompts
- Explain what premium features do
- Use contextual prompts (not random popups)
- Track which touchpoints convert best

### Don't ❌
- Block free features with paywalls
- Show upgrade prompts on every action
- Use annoying popups
- Hide the upgrade option
- Make free tier unusable

---

## 💡 Tips from Notion, Linear, etc.

1. **Notion**: Usage indicator in sidebar, subtle reminders
2. **Linear**: Feature gates with "Upgrade to use X" inline
3. **Superhuman**: Usage badge in composer when at limit
4. **Slack**: "Try Premium" in menu, feature-specific prompts

---

## 📝 Next Steps

1. **Add to sidebar**: Integrate `UsageIndicator` in your sidebar component
2. **Gate features**: Use `useFeatureGate` for premium features
3. **Test the flow**: Try the full upgrade journey
4. **Track conversions**: Add analytics to see what works
5. **Iterate**: A/B test different prompts and placements

---

## 🎉 Result

Users will:
- ✅ Know they're on the free plan
- ✅ See how many queries they have left
- ✅ Get prompted at the right time
- ✅ Understand why upgrading helps
- ✅ Have multiple ways to upgrade

No annoying popups, just helpful, contextual prompts! 🚀
