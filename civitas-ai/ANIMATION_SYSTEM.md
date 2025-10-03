# Animation System Documentation

## Overview

This document describes the animation system implemented in the Civitas AI frontend. The animation system provides reusable animation utilities that follow accessibility best practices and offer consistent motion patterns.

## Animation Keyframes

The following animation keyframes are available:

- `fadeIn` - Fades in an element while slightly moving it upward
- `slideIn` - Slides an element in from the left with a fade
- `slideInLeft` - Slides an element in from the left edge of the screen
- `slideInRight` - Slides an element in from the right edge of the screen
- `scaleIn` - Scales an element from slightly smaller to its full size with a fade

## Animation Utility Classes

Use these Tailwind utility classes to apply animations to any element:

- `.animate-fade-in` - Apply the fadeIn animation
- `.animate-slide-in` - Apply the slideIn animation
- `.animate-slide-in-left` - Apply the slideInLeft animation
- `.animate-slide-in-right` - Apply the slideInRight animation
- `.animate-scale-in` - Apply the scaleIn animation

## Animation Timing Utilities

Control the timing aspects of animations with these utility classes:

- `.animation-delay-100` - Delay animation by 100ms
- `.animation-delay-200` - Delay animation by 200ms
- `.animation-delay-300` - Delay animation by 300ms
- `.animation-delay-400` - Delay animation by 400ms
- `.animation-delay-500` - Delay animation by 500ms

- `.animation-duration-fast` - Set animation duration to 200ms (faster than default)
- `.animation-duration-normal` - Set animation duration to 300ms (default speed)
- `.animation-duration-slow` - Set animation duration to 500ms (slower than default)

## Accessibility

The animation system automatically respects the user's motion preference settings through the `prefers-reduced-motion` media query. When a user has requested reduced motion in their operating system settings, all animations will be disabled.

## Notification Component

A new `Notification` component has been added that leverages these animations. It supports:

- Different notification types (info, success, warning, error)
- Auto-dismissal with configurable duration
- Different animation styles
- Accessibility features including proper ARIA attributes

## Demo Mode

To view demos of the animation system and components:

1. **URL Parameter**: Add `?view=demo` to the URL
2. **Keyboard Shortcut**: Press `Alt+D` to toggle between the main app and demo view
3. **Local Storage**: The view preference is stored in localStorage as 'civitas-app-view'

The demo showcases:

- All available animations
- Notification component with different styles and behaviors
- Animation timing variations
- Staggered animation sequences

## Best Practices

1. Use animations sparingly and with purpose
2. Keep animations short (300ms or less for most UI transitions)
3. Use staggered animations for related elements appearing in sequence
4. Ensure all animations have a clear start and end state
5. Avoid animations that could cause motion sickness or discomfort
6. Always provide a way for users to disable animations (already implemented)
