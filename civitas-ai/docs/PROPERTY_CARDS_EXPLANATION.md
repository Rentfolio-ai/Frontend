# Property Cards Layout & Deal Analyzer

## ✅ Current Implementation

### 1. **Horizontal Scrollable Cards**

The property cards ARE already side-by-side with horizontal scrolling:

**File**: `src/components/chat/tool-cards/PropertyListCard.tsx` (Line 449)

```tsx
<div className="flex overflow-x-auto gap-4 py-4 -mx-4 px-4 scrollbar-hide snap-x">
    {properties.map((property) => (
        <PropertyCardItemWithHolo ... />
    ))}
</div>
```

**Features**:
- ✅ `flex` - Cards arranged horizontally
- ✅ `overflow-x-auto` - Horizontal scroll when cards overflow
- ✅ `scrollbar-hide` - Clean scroll without visible scrollbar
- ✅ `snap-x` - Smooth snap scrolling
- ✅ `gap-4` - 1rem spacing between cards
- ✅ Each card: `min-w-[280px] w-[280px]` - Fixed width for consistent layout

### 2. **"Analyze Deal" Button** 

**What it does**: Opens the P&L (Profit & Loss) Analysis modal

**File**: `src/components/chat/tool-cards/PropertyListCard.tsx` (Line 171-178)

```tsx
<button
    onClick={() => onOpenDealAnalyzer?.(
        property.listing_id || null, 
        'LTR',  // Long-term rental strategy
        property.price, 
        property.address
    )}
    className="..."
>
    <svg>...</svg>
    Analyze
</button>
```

**Fixed Issue**: Added `onOpenDealAnalyzer` prop to `MessageBubble.tsx` (Line 693) so the button now works correctly.

### 3. **Card Layout Details**

Each card shows:
- Property image (with carousel if multiple photos)
- Price & address
- Badges (winning highlights, value score)
- Bed/bath/sqft stats
- Financial snapshot (Est. Rent, Cash Flow)
- Action buttons:
  - **View Details** - Opens property details modal
  - **Analyze** - Opens P&L analysis ✅

## 🎨 Visual Layout

```
┌──────────────────────────────────────────────────────────────────┐
│  [Toolbar: Holographic View Toggle | Compare Button]             │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────┐   ┌──────┐   ┌──────┐   ┌──────┐   ┌──────┐  ←scroll→│
│  │ Card │   │ Card │   │ Card │   │ Card │   │ Card │           │
│  │  1   │   │  2   │   │  3   │   │  4   │   │  5   │           │
│  └──────┘   └──────┘   └──────┘   └──────┘   └──────┘           │
│    280px      280px      280px      280px      280px             │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

## 🔧 If Cards Are Stacking Vertically

If you're seeing cards stacked vertically instead of horizontally, check:

1. **Browser width**: Cards need ~300px each + spacing. On narrow screens, you'll need to scroll.

2. **Parent container**: Make sure no parent has `flex-col` or `block` display that overrides the flex layout.

3. **Cached styles**: Try hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)

4. **CSS conflicts**: Check if any custom styles are overriding the `flex` layout.

## 🧪 Testing

To test horizontal scrolling:
1. Search for properties (e.g., "Find properties in Austin under $400k")
2. See property cards appear side-by-side
3. Drag/scroll horizontally to see more cards
4. Click "Analyze" button on any card
5. P&L analysis modal should open with property details pre-filled

## 📊 Deal Analyzer (P&L Analysis)

When you click "Analyze", it opens a comprehensive P&L analysis showing:
- Purchase price
- Down payment calculations
- Monthly mortgage (with interest rate)
- Operating expenses (taxes, insurance, HOA, maintenance)
- Rental income projections
- Monthly cash flow
- Annual ROI metrics
- Cap rate
- Cash-on-cash return

**Strategy**: Default is 'LTR' (Long-Term Rental) but can be changed to 'STR' (Short-Term Rental)
