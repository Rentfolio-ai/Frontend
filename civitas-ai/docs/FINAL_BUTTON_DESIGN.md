# Final New Chat Button Design

## Clean, Simple, Functional

Replace the entire button (lines 110-124 in SimpleSidebar.tsx) with:

```tsx
<button
    onClick={onNewChat}
    className="group flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-white/5 transition-colors"
>
    {/* Square bordered icon button */}
    <div className="w-8 h-8 rounded-lg border border-white/20 group-hover:border-white/30 flex items-center justify-center flex-shrink-0 transition-colors">
        <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path d="M12 5v14M5 12h14" strokeLinecap="round"/>
        </svg>
    </div>
    
    {isExpanded && (
        <span className="text-sm font-medium text-white/90 whitespace-nowrap">
            New chat
        </span>
    )}
</button>
```

## Why This Works:

1. **Square Icon Button** - Clean, bordered box with plus sign
2. **Left-Aligned** - Natural sidebar button placement
3. **Subtle Hover** - Just background tint, no fancy effects
4. **Simple Plus Icon** - Universal "new/add" symbol
5. **No Gimmicks** - Clean, minimal, functional

This is as simple and clean as it gets while still being polished.
