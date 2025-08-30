'use client';

import { usePathname, useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Home } from 'lucide-react';
import Link from 'next/link';
import clsx from 'clsx';

interface BreadcrumbItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
}

const pathMap: Record<string, BreadcrumbItem> = {
  '/dashboard': { label: 'Civitas', href: '/dashboard', icon: <Home className="w-4 h-4" /> },
  '/properties': { label: 'Properties', href: '/properties' },
  '/reports': { label: 'Reports', href: '/reports' },
  '/insights': { label: 'Insights', href: '/insights' },
  '/dashboard/subscription': { label: 'Subscription', href: '/dashboard/subscription' },
  '/account': { label: 'Account', href: '/account' },
};

export function NavigationBreadcrumb() {
  const pathname = usePathname();
  const router = useRouter();

  // Generate breadcrumb items based on current path
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const breadcrumbs: BreadcrumbItem[] = [];

    // Always start with home/dashboard
    if (pathname !== '/dashboard') {
      breadcrumbs.push(pathMap['/dashboard']);
    }

    // Add current page if it exists in pathMap
    if (pathMap[pathname] && pathname !== '/dashboard') {
      breadcrumbs.push(pathMap[pathname]);
    }

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  // Don't show breadcrumbs on dashboard (main page) or if only one item
  if (pathname === '/dashboard' || breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <nav className="flex items-center space-x-2 text-sm text-slate-400 mb-6">
      {breadcrumbs.map((item, index) => (
        <div key={item.href} className="flex items-center">
          {index > 0 && (
            <ChevronRight className="w-4 h-4 mx-2 text-slate-500" />
          )}
          {index === breadcrumbs.length - 1 ? (
            // Current page - not clickable
            <span className="flex items-center gap-2 text-slate-200 font-medium">
              {item.icon}
              {item.label}
            </span>
          ) : (
            // Previous pages - clickable
            <Link
              href={item.href}
              className="flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors"
            >
              {item.icon}
              {item.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}

export function BackButton({ fallbackHref = '/dashboard' }: { fallbackHref?: string }) {
  const router = useRouter();

  const handleBack = () => {
    // Try to go back in browser history first
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      // Fallback to specific route
      router.push(fallbackHref);
    }
  };

  return (
    <button
      onClick={handleBack}
      className="flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors mb-4 p-2 rounded-lg hover:bg-slate-800/50"
    >
      <ChevronLeft className="w-4 h-4" />
      <span>Back</span>
    </button>
  );
}
