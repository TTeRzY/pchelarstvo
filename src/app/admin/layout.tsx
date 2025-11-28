'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { authClient } from '@/lib/authClient';
import { useAuth } from '@/context/AuthProvider';
import { canAccessAdmin } from '@/types/user';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations('admin');
  const router = useRouter();
  const pathname = usePathname();
  const { logout } = useAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Check if user is authenticated and has access (moderator, admin, or super_admin)
    authClient.me().then(user => {
      if (!user || !canAccessAdmin(user)) {
        router.push('/');
      } else {
        setIsAuthenticated(true);
      }
      setIsLoading(false);
    }).catch(() => {
      router.push('/');
      setIsLoading(false);
    });
  }, [router]);

  if (!isMounted || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-900 text-xl" suppressHydrationWarning>
          {isMounted ? t('dashboard.loading') : 'Loading...'}
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const menuItems = [
    {
      href: '/admin/dashboard',
      label: t('nav.dashboard'),
      icon: '🏠',
    },
    {
      href: '/admin/users',
      label: t('nav.users'),
      icon: '👨‍🌾',
    },
    {
      href: '/admin/listings/pending',
      label: t('nav.pending'),
      icon: '⌛',
    },
    {
      href: '/admin/listings/approved',
      label: t('nav.approved'),
      icon: '✅',
    },
    {
      href: '/admin/listings/flagged',
      label: t('nav.flagged'),
      icon: '🚨',
    },
    {
      href: '/admin/reports',
      label: t('nav.reports'),
      icon: '📊',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed left-0 lg:top-0 top-[65px] h-[calc(100vh-65px)] lg:h-full w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm z-40 transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        {/* Logo/Header */}
        <div className="p-6 border-b border-gray-200 bg-amber-50">
          <Link href="/admin/dashboard" className="flex items-center gap-3">
            <div className="text-3xl">🐝</div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{t('nav.dashboard')}</h1>
              <p className="text-xs text-gray-600">{t('dashboard.title')}</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => {
                  // Auto-close sidebar on mobile when navigation link is clicked
                  setSidebarOpen(false);
                }}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-colors
                  ${isActive 
                    ? 'bg-amber-100 text-amber-900 font-semibold shadow-sm' 
                    : 'text-gray-700 hover:bg-gray-100'
                  }
                `}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <Link
            href="/"
            onClick={() => {
              // Auto-close sidebar on mobile when link is clicked
              setSidebarOpen(false);
            }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <span className="text-xl">🌻</span>
            <span className="font-medium">{t('nav.backToSite')}</span>
          </Link>
          <button
            onClick={() => {
              logout();
              // Auto-close sidebar on mobile when logout is clicked
              setSidebarOpen(false);
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors mt-1"
          >
            <span className="text-xl">🚪</span>
            <span className="font-medium">{t('nav.logout')}</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:ml-64 min-h-screen">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-4 lg:px-8 py-4 lg:py-5 shadow-sm sticky top-0 z-30 h-[65px] flex items-center">
          <div className="flex items-center justify-between gap-4">
            {/* Mobile Menu Toggle Button - Inside Header */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Toggle sidebar"
            >
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {sidebarOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
            
            <h2 className="text-xl lg:text-2xl font-bold text-gray-900 flex-1">
              {menuItems.find(item => pathname === item.href || pathname.startsWith(item.href))?.label || t('dashboard.title')}
            </h2>
            
            <div className="text-sm text-gray-600 flex items-center gap-2">
              <span className="hidden sm:inline">📅</span>
              <span suppressHydrationWarning className="hidden sm:inline">
                {new Date().toLocaleDateString('bg-BG', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
              <span className="sm:hidden" suppressHydrationWarning>
                {new Date().toLocaleDateString('bg-BG', { 
                  day: 'numeric',
                  month: 'short'
                })}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

