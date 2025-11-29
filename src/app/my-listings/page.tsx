"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PageShell from "@/components/layout/PageShell";
import { useAuth } from "@/context/AuthProvider";
import { useModal } from "@/components/modal/ModalProvider";
import { getMyListings, updateListingStatus, type Listing, type GetMyListingsParams } from "@/lib/listings";
import StatusBadge from "@/components/listings/StatusBadge";
import { getUserErrorMessage } from "@/lib/errorUtils";
import { useTranslations } from "next-intl";
import Link from "next/link";

export default function MyListingsPage() {
  const { user } = useAuth();
  const { open } = useModal();
  const router = useRouter();
  const t = useTranslations("myListings");
  const tCommon = useTranslations("common");

  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [updating, setUpdating] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 20,
    total: 0,
    last_page: 1,
  });

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    loadListings();
  }, [user, statusFilter]);

  const loadListings = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      const filters: GetMyListingsParams =
        statusFilter !== "all" ? { status: statusFilter as any } : {};
      const response = await getMyListings(filters);
      setListings(response.data);
      setPagination({
        current_page: response.current_page,
        per_page: response.per_page,
        total: response.total,
        last_page: response.last_page,
      });
    } catch (err) {
      setError(getUserErrorMessage(err, "Неуспешно зареждане на обявите."));
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsCompleted = async (listingId: string) => {
    if (!user) {
      open("login");
      return;
    }

    // Confirmation dialog
    if (!confirm("Сигурни ли сте, че искате да маркирате тази обява като завършена?")) {
      return;
    }

    try {
      setUpdating(listingId);
      await updateListingStatus(listingId, "completed");
      // Refresh listings
      await loadListings();
    } catch (err) {
      alert(getUserErrorMessage(err, "Неуспешно обновяване на обявата."));
    } finally {
      setUpdating(null);
    }
  };

  const canMarkAsCompleted = (status?: Listing["status"]): boolean => {
    return status === "pending" || status === "approved" || status === "active";
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return "—";
    try {
      return new Date(dateString).toLocaleDateString("bg-BG", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "—";
    }
  };

  if (!user) {
    return (
      <PageShell>
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">Трябва да влезете в системата, за да видите вашите обяви.</p>
          <button
            onClick={() => open("login")}
            className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-amber-400"
          >
            Вход
          </button>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Моите обяви</h1>
            <p className="text-sm text-gray-600 mt-1">
              Управлявайте вашите обяви и маркирайте ги като завършени
            </p>
          </div>
          <Link
            href="/marketplace/new?returnTo=/my-listings"
            className="inline-flex items-center justify-center rounded-xl bg-amber-500 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-amber-400 transition-colors"
          >
            + Нова обява
          </Link>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-4">
          <label htmlFor="status-filter" className="text-sm font-medium text-gray-700">
            Филтър по статус:
          </label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-gray-300 px-3 py-2 text-sm bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          >
            <option value="all">Всички</option>
            <option value="pending">В очакване</option>
            <option value="approved">Одобрени</option>
            <option value="active">Активни</option>
            <option value="completed">Завършени</option>
            <option value="rejected">Отхвърлени</option>
            <option value="flagged">Сигнализирани</option>
          </select>
          {pagination.total > 0 && (
            <span className="text-sm text-gray-600">
              Общо: <strong>{pagination.total}</strong>
            </span>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && listings.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-600">Зареждане...</div>
          </div>
        )}

        {/* Empty State */}
        {!loading && listings.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
            <div className="text-4xl mb-4">📋</div>
            <p className="text-gray-600 mb-4">
              {statusFilter === "all"
                ? "Нямате публикувани обяви."
                : "Няма обяви с избрания статус."}
            </p>
            <Link
              href="/marketplace/new?returnTo=/my-listings"
              className="inline-flex items-center justify-center rounded-xl bg-amber-500 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-amber-400 transition-colors"
            >
              Създай първата обява
            </Link>
          </div>
        )}

        {/* Listings List */}
        {!loading && listings.length > 0 && (
          <div className="space-y-4">
            {listings.map((listing) => (
              <div
                key={listing.id}
                className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{listing.title}</h3>
                    <p className="text-sm text-gray-600">
                      {listing.product} • {listing.region}
                      {listing.city && ` • ${listing.city}`}
                    </p>
                  </div>
                  <StatusBadge status={listing.status} />
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                  <div>
                    <span className="text-gray-500">Количество:</span>
                    <span className="ml-2 font-medium">{listing.quantityKg} кг</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Цена:</span>
                    <span className="ml-2 font-medium">{listing.pricePerKg} лв/кг</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Тип:</span>
                    <span className="ml-2 font-medium">
                      {listing.type === "sell" ? "Продавам" : "Купувам"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Създадена:</span>
                    <span className="ml-2 font-medium">{formatDate(listing.createdAt)}</span>
                  </div>
                </div>

                {/* Description */}
                {listing.description && (
                  <p className="text-sm text-gray-700 mb-4 line-clamp-2">{listing.description}</p>
                )}

                {/* Rejection Reason */}
                {listing.status === "rejected" && listing.rejection_reason && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                    <strong className="font-medium">Причина за отхвърляне:</strong>{" "}
                    {listing.rejection_reason}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2">
                  {canMarkAsCompleted(listing.status) && (
                    <button
                      onClick={() => handleMarkAsCompleted(listing.id)}
                      disabled={updating === listing.id}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
                    >
                      {updating === listing.id ? "Запазване..." : "Маркирай като завършено"}
                    </button>
                  )}
                  <Link
                    href={`/marketplace/${listing.id}`}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors"
                  >
                    Виж обява
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}

