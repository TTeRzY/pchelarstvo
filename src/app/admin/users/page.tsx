'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import type { User, UserRole, UserStatus } from '@/types/user';
import { DataTable } from '@/components/admin/DataTable';
import { UserBadge } from '@/components/admin/UserBadge';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { adminClient } from '@/lib/adminClient';

export default function AdminUsersPage() {
  const t = useTranslations('admin');
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    role: '' as UserRole | '',
    status: '' as UserStatus | '',
    search: '',
  });

  const loadUsers = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (filters.role) params.role = filters.role;
      if (filters.status) params.status = filters.status;
      if (filters.search) params.search = filters.search;

      console.log('Loading users with params:', params);
      const data = await adminClient.getUsers(params);
      console.log('Received users data:', data);
      setUsers(data.users || []);
    } catch (err) {
      console.error('Failed to load users:', err);
      alert('Грешка при зареждане на потребители: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [filters]);

  const columns = [
    {
      key: 'name',
      label: t('users.name'),
      sortable: true,
      render: (user: User) => (
        <div>
          <div className="font-medium text-gray-900">{user.name}</div>
          <div className="text-sm text-gray-600">{user.email}</div>
        </div>
      ),
    },
    {
      key: 'role',
      label: t('users.role'),
      sortable: true,
      render: (user: User) => <UserBadge role={user.role} />,
    },
    {
      key: 'status',
      label: t('users.status'),
      sortable: true,
      render: (user: User) => <StatusBadge status={user.status} type="user" />,
    },
    {
      key: 'trustLevel',
      label: t('users.trustLevel'),
      sortable: true,
      render: (user: User) => (
        <span className="capitalize text-gray-700">{user.trustLevel}</span>
      ),
    },
    {
      key: 'verifiedAt',
      label: t('users.verified'),
      render: (user: User) => (
        <span className="text-gray-700">
          {user.verifiedAt ? '✓ Да' : '✗ Не'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: t('users.joined'),
      sortable: true,
      render: (user: User) => {
        if (!user.createdAt) return <span className="text-gray-400">—</span>;
        try {
          const date = new Date(user.createdAt);
          if (isNaN(date.getTime())) return <span className="text-gray-400">—</span>;
          return (
            <span className="text-gray-700">
              {date.toLocaleDateString('bg-BG')}
            </span>
          );
        } catch {
          return <span className="text-gray-400">—</span>;
        }
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-4">{t('users.filters')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('users.search')}
            </label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              placeholder={t('users.searchPlaceholder')}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('users.roleFilter')}
            </label>
            <select
              value={filters.role}
              onChange={(e) => setFilters({ ...filters, role: e.target.value as UserRole | '' })}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="">{t('users.allRoles')}</option>
              <option value="user">{t('roles.user')}</option>
              <option value="moderator">{t('roles.moderator')}</option>
              <option value="admin">{t('roles.admin')}</option>
              <option value="super_admin">{t('roles.super_admin')}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('users.statusFilter')}
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value as UserStatus | '' })}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="">{t('users.allStatuses')}</option>
              <option value="active">{t('status.active')}</option>
              <option value="suspended">{t('status.suspended')}</option>
              <option value="banned">{t('status.banned')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="text-center py-12 text-gray-900">{t('dashboard.loading')}</div>
      ) : users.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
          <div className="text-6xl mb-4">👥</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Няма намерени потребители</h3>
          <p className="text-gray-600">Не са открити потребители с избраните филтри.</p>
        </div>
      ) : (
        <>
          <DataTable
            columns={columns}
            data={users}
            keyExtractor={(user) => user.id}
            onRowClick={(user) => router.push(`/admin/users/${user.id}`)}
          />
          {/* Summary */}
          <div className="text-sm text-gray-600 text-center">
            {t('users.showing')} {users.length} {t('users.usersCount')}
          </div>
        </>
      )}
    </div>
  );
}

