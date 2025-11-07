'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { Listing } from '@/types/listing';
import { DataTable } from '@/components/admin/DataTable';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { adminClient } from '@/lib/adminClient';

export default function AdminApprovedListingsPage() {
  const t = useTranslations('admin');
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const loadListings = async () => {
    setLoading(true);
    try {
      const data = await adminClient.getListings({ status: 'approved', page, perPage: 20 });
      setListings(data.listings || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Failed to load listings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadListings();
  }, [page]);

  const columns = [
    {
      key: 'title',
      label: 'Title',
      sortable: true,
      render: (listing: Listing) => (
        <div>
          <div className="font-medium text-gray-900">{listing.title}</div>
          <div className="text-sm text-gray-600">{listing.product}</div>
        </div>
      ),
    },
    {
      key: 'type',
      label: 'Type',
      render: (listing: Listing) => (
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          listing.type === 'sell' 
            ? 'bg-blue-100 text-blue-800' 
            : 'bg-green-100 text-green-800'
        }`}>
          {listing.type === 'sell' ? '📤 Sell' : '📥 Buy'}
        </span>
      ),
    },
    {
      key: 'region',
      label: 'Region',
      sortable: true,
      render: (listing: Listing) => (
        <span className="text-gray-700">📍 {listing.region}</span>
      ),
    },
    {
      key: 'pricePerKg',
      label: 'Price',
      sortable: true,
      render: (listing: Listing) => (
        <span className="text-gray-900 font-medium">{listing.pricePerKg} лв/kg</span>
      ),
    },
    {
      key: 'quantityKg',
      label: 'Quantity',
      sortable: true,
      render: (listing: Listing) => (
        <span className="text-gray-700">{listing.quantityKg} kg</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (listing: Listing) => <StatusBadge status={listing.status} type="listing" />,
    },
    {
      key: 'createdAt',
      label: 'Date',
      sortable: true,
      render: (listing: Listing) => (
        <span className="text-gray-700">
          {new Date(listing.createdAt).toLocaleDateString('bg-BG')}
        </span>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="text-center py-12 text-gray-900">
        {t('dashboard.loading')}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
        <p className="text-green-700 font-medium">
          ✓ {total} {t('listings.approved')}
        </p>
      </div>

      {/* Listings Table */}
      {listings.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
          <p className="text-gray-600">{t('listings.noApproved')}</p>
        </div>
      ) : (
        <>
          <DataTable
            columns={columns}
            data={listings}
            keyExtractor={(listing) => listing.id}
          />
          
          {/* Pagination */}
          {total > 20 && (
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="px-4 py-2 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-900 border border-gray-200 rounded-lg"
              >
                {t('listings.previous')}
              </button>
              <span className="text-gray-600">
                {t('listings.page')} {page} {t('listings.of')} {Math.ceil(total / 20)}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page >= Math.ceil(total / 20)}
                className="px-4 py-2 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-900 border border-gray-200 rounded-lg"
              >
                {t('listings.next')}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

