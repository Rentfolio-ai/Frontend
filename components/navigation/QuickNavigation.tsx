'use client';

import { useState, useEffect } from 'react';
import { useSidebar } from '@/contexts/SidebarContext';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, Home, FileText, BarChart2, User, Crown, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import clsx from 'clsx';

const quickNavItems = [
  { label: 'Civitas', href: '/dashboard', icon: <MessageSquare className="w-5 h-5" /> },
  { label: 'Properties', href: '/properties', icon: <FileText className="w-5 h-5" /> },
  { label: 'Reports', href: '/reports', icon: <BarChart2 className="w-5 h-5" /> },
  { label: 'Account', href: '/account', icon: <User className="w-5 h-5" /> },
];

export function QuickNavigation() {
  const { isCollapsed } = useSidebar();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Show on mobile OR when sidebar is collapsed on desktop
  const shouldShow = isMobile || isCollapsed;

  if (!shouldShow) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Quick Nav Menu */}
      {isOpen && (
        <div className="fixed bottom-20 left-4 bg-slate-800 rounded-lg shadow-xl border border-slate-700 p-2 z-50 min-w-[200px]">
          <div className="space-y-1">
            {quickNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={clsx(
                  'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  pathname === item.href
                    ? 'bg-purple-600 text-white'
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                )}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          "fixed bottom-6 left-4 w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center z-50",
          isOpen && "rotate-45"
        )}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>
    </>
  );
}
