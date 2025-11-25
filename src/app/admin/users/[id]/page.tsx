'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import type { User, UserRole } from '@/types/user';
import { UserBadge } from '@/components/admin/UserBadge';
import { StatusBadge } from '@/components/admin/StatusBadge';

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default function AdminUserDetailsPage({ params }: PageProps) {
  const t = useTranslations('admin.users.details');
  const resolvedParams = use(params);
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [suspendReason, setSuspendReason] = useState('');
  
  // Alert/Confirm modals
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);

  const showSuccess = (message: string) => {
    setModalMessage(message);
    setShowSuccessModal(true);
  };

  const showError = (message: string) => {
    setModalMessage(message);
    setShowErrorModal(true);
  };

  const showConfirm = (message: string, onConfirm: () => void) => {
    setModalMessage(message);
    setConfirmAction(() => onConfirm);
    setShowConfirmModal(true);
  };

  const loadUser = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      showError(t('error.notAuthenticated'));
      router.push('/');
      return;
    }
    
    fetch(`/api/admin/users/${resolvedParams.id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          showError(data.error);
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
  }, [resolvedParams.id]);

  const updateUser = (updates: Partial<User>) => {
    if (!user || !user.id) return;
    setSaving(true);
    
    const token = localStorage.getItem('token');
    if (!token) {
      showError(t('error.notAuthenticated'));
      setSaving(false);
      return;
    }
    
    fetch(`/api/admin/users/${user.id}`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setUser(data.user);
          showSuccess(t('success.updated'));
        } else {
          showError(t('error.updateFailed'));
        }
        setSaving(false);
      })
      .catch(err => {
        console.error('Failed to update user:', err);
        showError(t('error.updateFailed'));
        setSaving(false);
      });
  };

  const suspendUser = () => {
    if (!user || !user.id || !suspendReason.trim()) return;
    setSaving(true);
    
    const token = localStorage.getItem('token');
    if (!token) {
      showError(t('error.notAuthenticated'));
      setSaving(false);
      return;
    }
    
    fetch(`/api/admin/users/${user.id}/suspend`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ reason: suspendReason }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          showSuccess(t('success.suspended'));
          setShowSuspendModal(false);
          setSuspendReason('');
          loadUser(); // Reload user data
        } else {
          showError(t('error.suspendFailed'));
        }
        setSaving(false);
      })
      .catch(err => {
        console.error('Failed to suspend user:', err);
        showError(t('error.suspendFailed'));
        setSaving(false);
      });
  };

  const verifyUser = () => {
    if (!user || !user.id) return;
    setSaving(true);
    
    const token = localStorage.getItem('token');
    if (!token) {
      showError(t('error.notAuthenticated'));
      setSaving(false);
      return;
    }
    
    fetch(`/api/admin/users/${user.id}/verify`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          showSuccess(t('success.verified'));
          loadUser(); // Reload user data
        } else {
          showError(t('error.verifyFailed'));
        }
        setSaving(false);
      })
      .catch(err => {
        console.error('Failed to verify user:', err);
        showError(t('error.verifyFailed'));
        setSaving(false);
      });
  };

  const deleteUser = () => {
    if (!user || !user.id) return;
    
    showConfirm(t('confirm.deleteMessage'), () => {
      setSaving(true);
      
      const token = localStorage.getItem('token');
      if (!token) {
        showError(t('error.notAuthenticated'));
        setSaving(false);
        return;
      }
      
      fetch(`/api/admin/users/${user.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            showSuccess(t('success.deleted'));
            setTimeout(() => router.push('/admin/users'), 1500);
          } else {
            showError(t('error.deleteFailed'));
          }
          setSaving(false);
        })
        .catch(err => {
          console.error('Failed to delete user:', err);
          showError(t('error.deleteFailed'));
          setSaving(false);
        });
    });
  };

  if (loading) {
    return (
      <div className="text-center py-12 text-gray-600">{t('loading')}</div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12 text-red-600">{t('notFound')}</div>
    );
  }

  return (
    <div className="space-y-6">
      {/* User Info Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{user.name}</h2>
            <p className="text-gray-600">{user.email}</p>
          </div>
          <div className="flex flex-col gap-2 items-end">
            <UserBadge role={user.role} />
            <StatusBadge status={user.status} type="user" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('userId')}
            </label>
            <p className="text-gray-900">{user.id}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trust Level
            </label>
            <p className="text-gray-900 capitalize">{user.trustLevel}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Joined
            </label>
            <p className="text-gray-900">
              {new Date(user.createdAt).toLocaleDateString('bg-BG')}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('lastLogin')}
            </label>
            <p className="text-gray-900">
              {user.lastLoginAt 
                ? new Date(user.lastLoginAt).toLocaleDateString('bg-BG')
                : t('never')}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Verified
            </label>
            <p className="text-gray-900">
              {user.verifiedAt 
                ? `✓ ${new Date(user.verifiedAt).toLocaleDateString('bg-BG')}`
                : `✗ ${t('notVerified')}`}
            </p>
          </div>
        </div>
      </div>

      {/* Edit Role */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">{t('changeRole')}</h3>
        <div className="flex gap-4">
          <select
            value={user.role}
            onChange={(e) => updateUser({ role: e.target.value as UserRole })}
            disabled={saving}
            className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="user">User</option>
            <option value="moderator">Moderator</option>
            <option value="admin">Admin</option>
            <option value="super_admin">Super Admin</option>
          </select>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">{t('actions')}</h3>
        <div className="flex flex-wrap gap-3">
          {!user.verifiedAt && (
            <button
              onClick={verifyUser}
              disabled={saving || !user.id}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white rounded-lg font-medium"
            >
              ✓ {t('verifyUser')}
            </button>
          )}
          {user.status === 'active' && (
            <button
              onClick={() => setShowSuspendModal(true)}
              disabled={saving}
              className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-800 text-white rounded-lg font-medium"
            >
              ⏸ {t('suspendUser')}
            </button>
          )}
          {user.status === 'suspended' && (
            <button
              onClick={() => updateUser({ status: 'active' })}
              disabled={saving}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white rounded-lg font-medium"
            >
              ▶ {t('reactivateUser')}
            </button>
          )}
          {user.status !== 'banned' && (
            <button
              onClick={() => {
                showConfirm(t('confirm.banMessage'), () => {
                  updateUser({ status: 'banned' });
                });
              }}
              disabled={saving}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white rounded-lg font-medium"
            >
              🚫 {t('banUser')}
            </button>
          )}
          <button
            onClick={deleteUser}
            disabled={saving}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white rounded-lg font-medium ml-auto"
          >
            🗑 {t('deleteUser')}
          </button>
        </div>
      </div>

      {/* Suspend Modal */}
      {showSuspendModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4">{t('suspendModal.title')}</h3>
            <p className="text-gray-600 mb-4">{t('suspendModal.description')}</p>
            <textarea
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 mb-4"
              rows={4}
              placeholder={t('suspendModal.placeholder')}
            />
            <div className="flex gap-3">
              <button
                onClick={suspendUser}
                disabled={saving || !suspendReason.trim()}
                className="flex-1 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-400 disabled:cursor-not-allowed text-white rounded-lg font-medium"
              >
                {t('suspendModal.confirm')}
              </button>
              <button
                onClick={() => setShowSuspendModal(false)}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg font-medium"
              >
                {t('suspendModal.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl border border-gray-200">
            <div className="flex flex-col items-center text-center">
              <div className="text-6xl mb-4">✅</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t('success.title')}</h3>
              <p className="text-gray-600 mb-6">{modalMessage}</p>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium"
              >
                {t('success.ok')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl border border-gray-200">
            <div className="flex flex-col items-center text-center">
              <div className="text-6xl mb-4">❌</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t('error.title')}</h3>
              <p className="text-gray-600 mb-6">{modalMessage}</p>
              <button
                onClick={() => setShowErrorModal(false)}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium"
              >
                {t('error.ok')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl border border-gray-200">
            <div className="flex flex-col items-center text-center">
              <div className="text-6xl mb-4">⚠️</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t('confirm.title')}</h3>
              <p className="text-gray-600 mb-6">{modalMessage}</p>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => {
                    setShowConfirmModal(false);
                    if (confirmAction) {
                      confirmAction();
                    }
                  }}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium"
                >
                  {t('confirm.confirm')}
                </button>
                <button
                  onClick={() => {
                    setShowConfirmModal(false);
                    setConfirmAction(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg font-medium"
                >
                  {t('confirm.cancel')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

