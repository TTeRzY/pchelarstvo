'use client';

import { useEffect, useState } from 'react';
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
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load stats:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="text-center py-12 text-gray-400">Loading reports...</div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12 text-red-400">Failed to load reports</div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Total Users"
          value={stats.users.total}
          icon="👥"
          color="blue"
        />
        <StatCard
          title="Verified Users"
          value={stats.users.verifiedCount}
          icon="✓"
          color="green"
        />
        <StatCard
          title="Total Listings"
          value={stats.listings.total}
          icon="📋"
          color="purple"
        />
      </div>

      {/* User Analytics */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <h2 className="text-xl font-bold text-white mb-6">User Analytics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Users by Role */}
          <div>
            <h3 className="text-lg font-semibold text-gray-300 mb-4">Distribution by Role</h3>
            <div className="space-y-3">
              {Object.entries(stats.users.byRole).map(([role, count]) => {
                const percentage = (count / stats.users.total * 100).toFixed(1);
                return (
                  <div key={role}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400 capitalize">{role}</span>
                      <span className="text-white font-medium">{count} ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
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
            <h3 className="text-lg font-semibold text-gray-300 mb-4">Distribution by Status</h3>
            <div className="space-y-3">
              {Object.entries(stats.users.byStatus).map(([status, count]) => {
                const percentage = (count / stats.users.total * 100).toFixed(1);
                const color = status === 'active' ? 'bg-green-500' : status === 'suspended' ? 'bg-yellow-500' : 'bg-red-500';
                return (
                  <div key={status}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400 capitalize">{status}</span>
                      <span className="text-white font-medium">{count} ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
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
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <h2 className="text-xl font-bold text-white mb-6">Listing Analytics</h2>
        <div>
          <h3 className="text-lg font-semibold text-gray-300 mb-4">Distribution by Status</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {Object.entries(stats.listings.byStatus).map(([status, count]) => {
              const percentage = (count / stats.listings.total * 100).toFixed(1);
              return (
                <div key={status} className="text-center">
                  <div className="text-3xl font-bold text-white mb-1">{count}</div>
                  <div className="text-sm text-gray-400 capitalize mb-2">{status}</div>
                  <div className="text-xs text-gray-500">{percentage}%</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Growth Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <h3 className="text-lg font-bold text-white mb-4">Today's Activity</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">New Registrations</span>
              <span className="text-2xl font-bold text-green-400">
                +{stats.users.todayRegistrations}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">New Listings</span>
              <span className="text-2xl font-bold text-blue-400">
                +{stats.listings.todayListings}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <h3 className="text-lg font-bold text-white mb-4">Platform Health</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Verification Rate</span>
              <span className="text-2xl font-bold text-green-400">
                {((stats.users.verifiedCount / stats.users.total) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Approval Rate</span>
              <span className="text-2xl font-bold text-blue-400">
                {((stats.listings.byStatus.approved / stats.listings.total) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

