# Clean New Chat Button Design

## Simple, Elegant Approach:

Replace lines 110-136 in `SimpleSidebar.tsx` with:

```tsx
<button
    onClick={onNewChat}
    className="group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 hover:bg-gradient-to-r hover:from-teal-500/15 hover:to-blue-500/15"
>
    {/* Message Square with Plus */}
    <div className="flex-shrink-0">
        <svg className="w-5 h-5 text-white/70 group-hover:text-white transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 9v6M9 12h6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    </div>
    
    {isExpanded && (
        <span className="text-sm font-medium text-white/80 group-hover:text-white transition-colors whitespace-nowrap">
            New chat
        </span>
    )}
</button>
```

## What This Design Offers:

1. **Clean Icon** - Message bubble + plus sign (universal "new message" symbol)
2. **Subtle Hover** - Gentle teal-blue gradient background on hover
3. **Simple Transitions** - Icon and text brighten on hover
4. **No Overdesign** - No scales, pings, borders, or complex elements
5. **Professional** - Minimal and clean like modern apps

This is the minimal, clean approach that should work well!
