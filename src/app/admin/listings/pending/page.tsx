'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { Listing } from '@/types/listing';
import { ModerationCard } from '@/components/admin/ModerationCard';
import { adminClient } from '@/lib/adminClient';

export default function AdminPendingListingsPage() {
  const t = useTranslations('admin');
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  const loadListings = async () => {
    setLoading(true);
    try {
      const data = await adminClient.getPendingListings();
      setListings(data.listings || []);
    } catch (err) {
      console.error('Failed to load listings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadListings();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await adminClient.approveListing(id);
      loadListings(); // Reload listings
    } catch (err) {
      console.error('Failed to approve listing:', err);
      alert('Failed to approve listing');
    }
  };

  const handleReject = async (id: string, reason: string) => {
    try {
      await adminClient.rejectListing(id, reason);
      loadListings(); // Reload listings
    } catch (err) {
      console.error('Failed to reject listing:', err);
      alert('Failed to reject listing');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12 text-gray-900">
        {t('dashboard.loading')}
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
        <div className="text-6xl mb-4">✓</div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">{t('listings.allCaughtUp')}</h3>
        <p className="text-gray-600">{t('listings.noPending')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="text-amber-700 font-medium">
          ⏳ {listings.length} {t('listings.awaitingModeration')}
        </p>
      </div>

      {/* Moderation Queue */}
      <div className="space-y-4">
        {listings.map((listing) => (
          <ModerationCard
            key={listing.id}
            listing={listing}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        ))}
      </div>
    </div>
  );
}

