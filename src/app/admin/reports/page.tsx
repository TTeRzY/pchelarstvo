'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { StatCard } from '@/components/admin/StatCard';

type Stats = {
  users: {
    total: number;
    byRole: Record<string, number>;
    byStatus: Record<string, number>;
    todayRegistrations: number;
    verifiedCount: number;
  };
  listings: {
    total: number;
    byStatus: Record<string, number>;
    todayListings: number;
  };
};

export default function AdminReportsPage() {
  const t = useTranslations('admin.reports');
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError(t('notAuthenticated'));
      setLoading(false);
      return;
    }

    fetch('/api/admin/stats', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
        } else if (!data.users || !data.listings) {
          setError(t('loadFailed'));
        } else {
          setStats(data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load stats:', err);
        setError(err.message || t('loadFailed'));
        setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="text-center py-12 text-gray-600">{t('loading')}</div>
    );
  }

  if (error || !stats) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">{t('unableToLoad')}</h3>
        <p className="text-gray-600 mb-4">{error || t('loadFailed')}</p>
        <p className="text-sm text-gray-500">{t('ensureBackend')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title={t('totalUsers')}
          value={stats.users.total}
          icon="👥"
          color="blue"
        />
        <StatCard
          title={t('verifiedUsers')}
          value={stats.users.verifiedCount}
          icon="✓"
          color="green"
        />
        <StatCard
          title={t('totalListings')}
          value={stats.listings.total}
          icon="📋"
          color="purple"
        />
      </div>

      {/* User Analytics */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">{t('userAnalytics')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Users by Role */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-4">{t('distributionByRole')}</h3>
            <div className="space-y-3">
              {Object.entries(stats.users.byRole).map(([role, count]) => {
                const percentage = (count / stats.users.total * 100).toFixed(1);
                return (
                  <div key={role}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600 capitalize">{role}</span>
                      <span className="text-gray-900 font-medium">{count} ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Users by Status */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-4">{t('distributionByStatus')}</h3>
            <div className="space-y-3">
              {Object.entries(stats.users.byStatus).map(([status, count]) => {
                const percentage = (count / stats.users.total * 100).toFixed(1);
                const color = status === 'active' ? 'bg-green-500' : status === 'suspended' ? 'bg-yellow-500' : 'bg-red-500';
                return (
                  <div key={status}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600 capitalize">{status}</span>
                      <span className="text-gray-900 font-medium">{count} ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`${color} h-2 rounded-full`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Listing Analytics */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">{t('listingAnalytics')}</h2>
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-4">{t('distributionByStatus')}</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {Object.entries(stats.listings.byStatus).map(([status, count]) => {
              const percentage = (count / stats.listings.total * 100).toFixed(1);
              return (
                <div key={status} className="text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-1">{count}</div>
                  <div className="text-sm text-gray-600 capitalize mb-2">{status}</div>
                  <div className="text-xs text-gray-500">{percentage}%</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Growth Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">{t('todayActivity')}</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">{t('newRegistrations')}</span>
              <span className="text-2xl font-bold text-green-600">
                +{stats.users.todayRegistrations}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">{t('newListings')}</span>
              <span className="text-2xl font-bold text-blue-600">
                +{stats.listings.todayListings}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">{t('platformHealth')}</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">{t('verificationRate')}</span>
              <span className="text-2xl font-bold text-green-600">
                {((stats.users.verifiedCount / stats.users.total) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">{t('approvalRate')}</span>
              <span className="text-2xl font-bold text-blue-600">
                {((stats.listings.byStatus.approved || 0) / stats.listings.total * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

