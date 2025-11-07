'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { User, UserRole, UserStatus } from '@/types/user';
import { UserBadge } from '@/components/admin/UserBadge';
import { StatusBadge } from '@/components/admin/StatusBadge';

type PageProps = {
  params: {
    id: string;
  };
};

export default function AdminUserDetailsPage({ params }: PageProps) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [suspendReason, setSuspendReason] = useState('');

  const loadUser = () => {
    fetch(`/api/admin/users/${params.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          alert(data.error);
          router.push('/admin/users');
        } else {
          setUser(data);
          setLoading(false);
        }
      })
      .catch(err => {
        console.error('Failed to load user:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadUser();
  }, [params.id]);

  const updateUser = (updates: Partial<User>) => {
    if (!user) return;
    setSaving(true);
    fetch(`/api/admin/users/${user.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setUser(data.user);
          alert('User updated successfully');
        } else {
          alert('Failed to update user');
        }
        setSaving(false);
      })
      .catch(err => {
        console.error('Failed to update user:', err);
        alert('Failed to update user');
        setSaving(false);
      });
  };

  const suspendUser = () => {
    if (!user || !suspendReason.trim()) return;
    setSaving(true);
    fetch(`/api/admin/users/${user.id}/suspend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: suspendReason }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          alert('User suspended successfully');
          setShowSuspendModal(false);
          setSuspendReason('');
          loadUser(); // Reload user data
        } else {
          alert('Failed to suspend user');
        }
        setSaving(false);
      })
      .catch(err => {
        console.error('Failed to suspend user:', err);
        alert('Failed to suspend user');
        setSaving(false);
      });
  };

  const verifyUser = () => {
    if (!user) return;
    setSaving(true);
    fetch(`/api/admin/users/${user.id}/verify`, {
      method: 'POST',
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          alert('User verified successfully');
          loadUser(); // Reload user data
        } else {
          alert('Failed to verify user');
        }
        setSaving(false);
      })
      .catch(err => {
        console.error('Failed to verify user:', err);
        alert('Failed to verify user');
        setSaving(false);
      });
  };

  const deleteUser = () => {
    if (!user) return;
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }
    setSaving(true);
    fetch(`/api/admin/users/${user.id}`, {
      method: 'DELETE',
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          alert('User deleted successfully');
          router.push('/admin/users');
        } else {
          alert('Failed to delete user');
        }
        setSaving(false);
      })
      .catch(err => {
        console.error('Failed to delete user:', err);
        alert('Failed to delete user');
        setSaving(false);
      });
  };

  if (loading) {
    return (
      <div className="text-center py-12 text-gray-400">Loading user...</div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12 text-red-400">User not found</div>
    );
  }

  return (
    <div className="space-y-6">
      {/* User Info Card */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">{user.name}</h2>
            <p className="text-gray-400">{user.email}</p>
          </div>
          <div className="flex flex-col gap-2 items-end">
            <UserBadge role={user.role} />
            <StatusBadge status={user.status} type="user" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              User ID
            </label>
            <p className="text-white">{user.id}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Trust Level
            </label>
            <p className="text-white capitalize">{user.trustLevel}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Joined
            </label>
            <p className="text-white">
              {new Date(user.createdAt).toLocaleDateString('bg-BG')}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Last Login
            </label>
            <p className="text-white">
              {user.lastLoginAt 
                ? new Date(user.lastLoginAt).toLocaleDateString('bg-BG')
                : 'Never'}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Verified
            </label>
            <p className="text-white">
              {user.verifiedAt 
                ? `✓ ${new Date(user.verifiedAt).toLocaleDateString('bg-BG')}`
                : '✗ Not verified'}
            </p>
          </div>
        </div>
      </div>

      {/* Edit Role */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <h3 className="text-lg font-bold text-white mb-4">Change Role</h3>
        <div className="flex gap-4">
          <select
            value={user.role}
            onChange={(e) => updateUser({ role: e.target.value as UserRole })}
            disabled={saving}
            className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="user">User</option>
            <option value="moderator">Moderator</option>
            <option value="admin">Admin</option>
            <option value="super_admin">Super Admin</option>
          </select>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <h3 className="text-lg font-bold text-white mb-4">Actions</h3>
        <div className="flex flex-wrap gap-3">
          {!user.verifiedAt && (
            <button
              onClick={verifyUser}
              disabled={saving}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white rounded-lg font-medium"
            >
              ✓ Verify User
            </button>
          )}
          {user.status === 'active' && (
            <button
              onClick={() => setShowSuspendModal(true)}
              disabled={saving}
              className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-800 text-white rounded-lg font-medium"
            >
              ⏸ Suspend User
            </button>
          )}
          {user.status === 'suspended' && (
            <button
              onClick={() => updateUser({ status: 'active' })}
              disabled={saving}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white rounded-lg font-medium"
            >
              ▶ Reactivate User
            </button>
          )}
          {user.status !== 'banned' && (
            <button
              onClick={() => {
                if (confirm('Are you sure you want to ban this user?')) {
                  updateUser({ status: 'banned' });
                }
              }}
              disabled={saving}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white rounded-lg font-medium"
            >
              🚫 Ban User
            </button>
          )}
          <button
            onClick={deleteUser}
            disabled={saving}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white rounded-lg font-medium ml-auto"
          >
            🗑 Delete User
          </button>
        </div>
      </div>

      {/* Suspend Modal */}
      {showSuspendModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-white mb-4">Suspend User</h3>
            <p className="text-gray-400 mb-4">Please provide a reason for suspending this user:</p>
            <textarea
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 mb-4"
              rows={4}
              placeholder="Reason for suspension..."
            />
            <div className="flex gap-3">
              <button
                onClick={suspendUser}
                disabled={saving || !suspendReason.trim()}
                className="flex-1 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-800 disabled:cursor-not-allowed text-white rounded-lg font-medium"
              >
                Suspend
              </button>
              <button
                onClick={() => setShowSuspendModal(false)}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

