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
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm">
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
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <span className="text-xl">🌻</span>
            <span className="font-medium">{t('nav.backToSite')}</span>
          </Link>
          <button
            onClick={() => logout()}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors mt-1"
          >
            <span className="text-xl">🚪</span>
            <span className="font-medium">{t('nav.logout')}</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="ml-64 min-h-screen">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              {menuItems.find(item => pathname === item.href || pathname.startsWith(item.href))?.label || t('dashboard.title')}
            </h2>
            <div className="text-sm text-gray-600 flex items-center gap-2">
              <span>📅</span>
              <span suppressHydrationWarning>
                {new Date().toLocaleDateString('bg-BG', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
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

