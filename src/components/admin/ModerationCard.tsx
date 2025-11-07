'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { Listing } from '@/types/listing';
import { StatusBadge } from './StatusBadge';
import { ActionButtons } from './ActionButtons';

type ModerationCardProps = {
  listing: Listing;
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string, reason: string) => Promise<void>;
};

export function ModerationCard({ listing, onApprove, onReject }: ModerationCardProps) {
  const t = useTranslations('admin.listings');
  const [loading, setLoading] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const handleApprove = async () => {
    setLoading(true);
    try {
      await onApprove(listing.id);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim() || rejectReason.length < 5) {
      alert('Please provide a rejection reason (minimum 5 characters)');
      return;
    }
    setLoading(true);
    try {
      await onReject(listing.id, rejectReason);
      setShowRejectModal(false);
      setRejectReason('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-xl font-semibold text-gray-900">{listing.title}</h3>
              <StatusBadge status={listing.status} type="listing" />
            </div>
            <p className="text-sm text-gray-600">
              {listing.product} • {listing.quantityKg} kg @ {listing.pricePerKg} лв/kg
            </p>
            <p className="text-sm text-gray-600">
              📍 {listing.region}{listing.city ? `, ${listing.city}` : ''}
            </p>
          </div>
          <div className="text-sm text-gray-500">
            {new Date(listing.createdAt).toLocaleDateString('bg-BG')}
          </div>
        </div>

        {listing.description && (
          <div className="mb-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
            <p className="text-sm text-gray-700">{listing.description}</p>
          </div>
        )}

        {listing.user && (
          <div className="mb-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <p className="text-sm text-blue-900">
              <span className="font-medium">{t('postedBy')}</span> {listing.user.name}
              {listing.user.email && <span> • {listing.user.email}</span>}
            </p>
          </div>
        )}

        {listing.flagCount && listing.flagCount > 0 && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-700">
              🚩 {t('flaggedTimes', { count: listing.flagCount })}
            </p>
          </div>
        )}

        <ActionButtons
          onApprove={listing.status === 'pending' || listing.status === 'flagged' ? handleApprove : undefined}
          onReject={listing.status === 'pending' || listing.status === 'flagged' ? () => setShowRejectModal(true) : undefined}
          loading={loading}
        />
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-xl font-bold text-gray-900 mb-4">{t('rejectTitle')}</h3>
            <p className="text-gray-600 mb-4">{t('rejectReason')}</p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent mb-4"
              rows={4}
              placeholder={t('reasonPlaceholder')}
            />
            <div className="flex gap-3">
              <button
                onClick={handleReject}
                disabled={loading || !rejectReason.trim() || rejectReason.length < 5}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors"
              >
                {t('reject')}
              </button>
              <button
                onClick={() => setShowRejectModal(false)}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-xl font-medium transition-colors"
              >
                {t('cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

