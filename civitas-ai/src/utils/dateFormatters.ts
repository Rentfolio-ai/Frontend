// FILE: src/utils/dateFormatters.ts

/**
 * Format a date to show relative time (Today, Yesterday) or absolute date
 */
export function formatChatDate(dateString: string | undefined): string {
  if (!dateString) return 'Just now';

  const date = new Date(dateString);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const chatDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  // Check if it's today
  if (chatDate.getTime() === today.getTime()) {
    return `Today, ${date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
  }

  // Check if it's yesterday
  if (chatDate.getTime() === yesterday.getTime()) {
    return `Yesterday, ${date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
  }

  // Check if it's within the last 7 days
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  if (chatDate >= weekAgo) {
    const dayName = date.toLocaleDateString([], { weekday: 'long' });
    return `${dayName}, ${date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
  }

  // For older dates, show full date
  return date.toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
}

/**
 * Format a date for compact display in the sidebar
 */
export function formatChatDateCompact(dateString: string | undefined): string {
  if (!dateString) {
    return 'Just now';
  }

  try {
    const date = new Date(dateString);

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Just now';
    }

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    // For older dates, show the actual date
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch (error) {
    console.error('Error formatting date:', dateString, error);
    return 'Just now';
  }
}
