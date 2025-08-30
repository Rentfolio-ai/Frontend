'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Home, BarChart3, Map, Search, FileText, User } from 'lucide-react';
import { FilterToggle } from '@/components/filters/filter-toggle';

export function Navbar() {
  const { data: session } = useSession();

  const navigation = [
    { name: 'AI Dashboard', href: '/dashboard', icon: BarChart3 },
    { name: 'Smart Map', href: '/map', icon: Map },
    { name: 'Properties', href: '/properties', icon: Search },
    { name: 'AI Reports', href: '/reports', icon: FileText },
  ];

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Home className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">
                AI Real Estate Intelligence
              </span>
            </Link>

            <div className="hidden md:ml-10 md:flex md:space-x-8">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <FilterToggle />

            {session ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center">
                  {session.user?.image ? (
                    <img
                      className="h-8 w-8 rounded-full"
                      src={session.user.image}
                      alt={session.user.name || 'User'}
                    />
                  ) : (
                    <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-gray-600" />
                    </div>
                  )}
                  <span className="ml-2 text-sm font-medium text-gray-700">
                    {session.user?.name}
                  </span>
                </div>
                <button
                  onClick={() => signOut()}
                  className="text-gray-700 hover:text-red-600 text-sm font-medium transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                href="/api/auth/signin"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
