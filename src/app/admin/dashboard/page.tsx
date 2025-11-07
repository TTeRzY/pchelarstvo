'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { StatCard } from '@/components/admin/StatCard';
import Link from 'next/link';
import { adminClient, type AdminStatsResponse } from '@/lib/adminClient';

export default function AdminDashboard() {
  const t = useTranslations('admin');
  const [stats, setStats] = useState<AdminStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await adminClient.getStats();

      // Validate response structure
      if (!data.users || !data.listings) {
        setError('Invalid data format received from server');
        setLoading(false);
        return;
      }

      setStats(data);
      setLoading(false);
    } catch (err: any) {
      console.error('Failed to load stats:', err);
      setError(err.message || 'Cannot connect to backend server');
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-gray-900 text-xl">{t('dashboard.loading')}</div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="text-6xl">⚠️</div>
        <div className="text-red-600 text-xl font-semibold">
          {error || t('errors.backendUnavailable')}
        </div>
        <div className="text-gray-600 text-sm max-w-md text-center">
          {t('errors.configMissing')}
        </div>
        <button
          onClick={loadStats}
          className="mt-4 px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
        >
          {t('errors.retry')}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title={t('dashboard.totalUsers')}
          value={stats.users.total}
          icon="👨‍🌾"
          color="blue"
          trend={{
            value: `${stats.users.todayRegistrations} ${t('dashboard.today')}`,
            isPositive: stats.users.todayRegistrations > 0,
          }}
        />
        <StatCard
          title={t('dashboard.pendingListings')}
          value={stats.listings.byStatus.pending || 0}
          icon="⌛"
          color="yellow"
        />
        <StatCard
          title={t('dashboard.totalListings')}
          value={stats.listings.total}
          icon="🍯"
          color="green"
          trend={{
            value: `${stats.listings.todayListings} ${t('dashboard.today')}`,
            isPositive: stats.listings.todayListings > 0,
          }}
        />
        <StatCard
          title={t('dashboard.flaggedContent')}
          value={stats.listings.byStatus.flagged || 0}
          icon="⚠️"
          color="red"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span>🔧</span>
          <span>{t('dashboard.quickActions')}</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/admin/listings/pending"
            className="p-5 bg-amber-50 border border-amber-200 rounded-xl hover:bg-amber-100 hover:shadow-md transition-all"
          >
            <div className="text-3xl mb-2">🔍</div>
            <div className="text-amber-700 font-medium">{t('dashboard.reviewPending')}</div>
            <div className="text-2xl font-bold text-amber-900 mt-1">
              {stats.listings.byStatus.pending || 0}
            </div>
          </Link>
          <Link
            href="/admin/listings/flagged"
            className="p-5 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 hover:shadow-md transition-all"
          >
            <div className="text-3xl mb-2">🚨</div>
            <div className="text-red-700 font-medium">{t('dashboard.checkFlagged')}</div>
            <div className="text-2xl font-bold text-red-900 mt-1">
              {stats.listings.byStatus.flagged || 0}
            </div>
          </Link>
          <Link
            href="/admin/users"
            className="p-5 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 hover:shadow-md transition-all"
          >
            <div className="text-3xl mb-2">👨‍🌾</div>
            <div className="text-blue-700 font-medium">{t('dashboard.manageUsers')}</div>
            <div className="text-2xl font-bold text-blue-900 mt-1">
              {stats.users.total}
            </div>
          </Link>
        </div>
      </div>

      {/* User Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span>👨‍🌾</span>
            <span>{t('dashboard.usersByRole')}</span>
          </h3>
          <div className="space-y-3">
            {Object.entries(stats.users.byRole).map(([role, count]) => (
              <div key={role} className="flex items-center justify-between">
                <span className="text-gray-700 capitalize">{role}</span>
                <span className="text-gray-900 font-bold">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span>📊</span>
            <span>{t('dashboard.usersByStatus')}</span>
          </h3>
          <div className="space-y-3">
            {Object.entries(stats.users.byStatus).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <span className="text-gray-700 capitalize">{status}</span>
                <span className="text-gray-900 font-bold">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Listing Statistics */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span>🍯</span>
          <span>{t('dashboard.listingsByStatus')}</span>
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Object.entries(stats.listings.byStatus).map(([status, count]) => (
            <div key={status} className="text-center p-3 bg-gray-50 rounded-xl border border-gray-100">
              <div className="text-2xl font-bold text-gray-900">{count}</div>
              <div className="text-sm text-gray-600 capitalize">{status}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span>📋</span>
          <span>{t('dashboard.recentActivity')}</span>
        </h3>
        {stats.recentActivity.length === 0 ? (
          <p className="text-gray-600 text-center py-8">{t('dashboard.noActivity')}</p>
        ) : (
          <div className="space-y-3">
            {stats.recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <div className="text-gray-900 font-medium">
                    {activity.action === 'approved' ? '✅' : '❌'} {activity.targetTitle}
                  </div>
                  <div className="text-sm text-gray-600">
                    {activity.action} by {activity.moderatedBy}
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(activity.moderatedAt).toLocaleString('bg-BG')}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

