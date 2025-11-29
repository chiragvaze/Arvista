'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';

export const dynamic = 'force-dynamic';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: '📊' },
    { name: 'Artworks', href: '/admin/artworks', icon: '🎨' },
    { name: 'Collections', href: '/admin/collections', icon: '📚' },
    { name: 'Categories', href: '/admin/categories', icon: '🏷️' },
    { name: 'Orders', href: '/admin/orders', icon: '🛒' },
    { name: 'Users', href: '/admin/users', icon: '👥' },
    { name: 'Messages', href: '/admin/messages', icon: '✉️' },
    { name: 'Reviews', href: '/admin/reviews', icon: '⭐' },
    { name: 'Newsletter', href: '/admin/newsletter', icon: '📧' },
  ];

  // Return loading state during SSR to avoid session errors
  if (typeof window === 'undefined') {
    return <div className="min-h-screen bg-gray-50"></div>;
  }

  // Show loading state during auth check
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <Link href="/admin" className="text-xl font-bold">
              Arvista Admin
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden"
            >
              ✕
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-black text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-3 text-lg">{item.icon}</span>
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User Info */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center mb-3">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {session?.user?.name || 'User'}
                </p>
                <p className="text-xs text-gray-500">{session?.user?.email || ''}</p>
              </div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="w-full px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`lg:pl-64 ${sidebarOpen ? 'pl-64' : 'pl-0'}`}>
        {/* Top Bar */}
        <div className="sticky top-0 z-40 flex items-center h-16 px-6 bg-white border-b border-gray-200">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="mr-4"
          >
            <span className="text-2xl">☰</span>
          </button>
          <div className="flex items-center justify-between flex-1">
            <h1 className="text-lg font-semibold text-gray-900">
              {navigation.find((item) => item.href === pathname)?.name ||
                'Dashboard'}
            </h1>
            <Link
              href="/"
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
            >
              View Site →
            </Link>
          </div>
        </div>

        {/* Page Content */}
        <main className="p-6">{children}</main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
