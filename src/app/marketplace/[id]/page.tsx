"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuth } from "@/context/AuthProvider";
import { useModal } from "@/components/modal/ModalProvider";
import { useTranslations } from "next-intl";
import { fetchListing, type Listing } from "@/lib/listings";

type NumericField = number | string | null | undefined;

function toNumber(value: NumericField): number | null {
  if (value == null) return null;
  const n = typeof value === "number" ? value : Number(String(value).replace(/,/g, "."));
  return Number.isFinite(n) ? n : null;
}

export default function ListingDetailsPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const { user } = useAuth();
  const { open } = useModal();
  const tCommon = useTranslations("common");
  const t = useTranslations("listingDetails");

  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchListing(id)
      .then((l) => {
        if (cancelled) return;
        setListing(l ?? null);
      })
      .catch(() => {
        if (cancelled) return;
        setError("load-failed");
        setListing(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const pricePerKg = useMemo(() => toNumber(listing?.pricePerKg ?? (listing as any)?.price_per_kg), [listing]);
  const quantityKg = useMemo(() => toNumber(listing?.quantityKg ?? (listing as any)?.quantity_kg), [listing]);

  const totalValue = useMemo(() => {
    if (pricePerKg == null || quantityKg == null) return null;
    const total = pricePerKg * quantityKg;
    return Number.isFinite(total) ? total.toFixed(2) : null;
  }, [pricePerKg, quantityKg]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="flex flex-col items-center gap-3 text-gray-800" role="status" aria-live="polite">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-amber-400 border-t-transparent" aria-hidden="true" />
          <p className="text-sm font-medium">{t("loading")}</p>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center space-y-3">
          <h1 className="text-xl font-bold">{t("notFound")}</h1>
          <p className="text-sm text-gray-600">
            {error ? t("loadError") : t("deletedOrWrongUrl")}
          </p>
          <Link href="/marketplace" className="text-amber-600 underline">
            {t("viewAllListings")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-[1000px] mx-auto px-4 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold">{listing.title}</h1>
            <p className="text-sm text-gray-600 mt-1">
              {listing.createdAt ? new Date(listing.createdAt).toLocaleString("bg-BG") : ""}
              {listing.region ? ` · ${listing.region}` : ""}
              {listing.city ? `, ${listing.city}` : ""}
            </p>
          </div>
          <Link href="/marketplace" className="text-amber-600 underline">
            {t("backToListings")}
          </Link>
        </div>

        {/* Seller Info with Contact */}
        {(listing.user?.name || (listing as any).contactName) && (
          <div className="bg-white rounded-2xl shadow p-5">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              {/* Seller Name */}
              <div className="flex items-center gap-3 flex-1">
                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-2xl shrink-0">
                  👤
                </div>
                <div>
                  <div className="text-xs text-gray-500">{t("postedBy")}</div>
                  <div className="font-semibold text-gray-900">
                    {listing.user?.name || (listing as any).contactName || t("anonymous")}
                  </div>
                </div>
              </div>
              
              {/* Contact Info */}
              <div className="flex flex-wrap gap-3">
                {/* Phone */}
                {((listing as any).phone || listing.contactPhone) && (
                  <a 
                    href={`tel:${(listing as any).phone || listing.contactPhone}`}
                    className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors"
                  >
                    <span className="text-lg">📞</span>
                    <span className="text-sm font-medium text-gray-900">
                      {(listing as any).phone || listing.contactPhone}
                    </span>
                  </a>
                )}
                
                {/* Email */}
                {((listing as any).email || listing.contactEmail || listing.user?.email) && (
                  <a 
                    href={`mailto:${(listing as any).email || listing.contactEmail || listing.user?.email}`}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <span className="text-lg">✉️</span>
                    <span className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
                      {(listing as any).email || listing.contactEmail || listing.user?.email}
                    </span>
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Details */}
        <div className="bg-white rounded-2xl shadow p-5 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">{t("type")}</span>{" "}
              <b>{listing.type === "sell" ? t("sell") : t("buy")}</b>
            </div>
            <div>
              <span className="text-gray-500">{t("product")}</span> <b>{listing.product}</b>
            </div>
            <div>
              <span className="text-gray-500">{t("quantity")}</span>{" "}
              <b>{quantityKg != null ? `${quantityKg} ${t("kg")}` : "-"}</b>
            </div>
            <div>
              <span className="text-gray-500">{t("pricePerKg")}</span>{" "}
              <b>{pricePerKg != null ? `${pricePerKg.toFixed(2)} ${t("bgn")}` : "-"}</b>
            </div>
            {totalValue && (
              <div>
                <span className="text-gray-500">{t("totalValue")}</span> <b>{totalValue} {t("bgn")}</b>
              </div>
            )}
          </div>

          {listing.description && (
            <div className="pt-2">
              <h3 className="font-bold mb-1">{t("description")}</h3>
              <p className="text-gray-800 whitespace-pre-line">{listing.description}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2 flex-wrap">
            <button
              type="button"
              onClick={() => {
                if (!user) {
                  open("login");
                  return;
                }
                open("contactSeller", {
                  listingId: listing.id,
                  listingTitle: listing.title,
                  sellerName: listing.user?.name ?? null,
                  sellerEmail: listing.contactEmail ?? listing.user?.email ?? null,
                  sellerPhone: listing.contactPhone ?? null,
                });
              }}
              className="rounded-xl bg-amber-500 px-3 py-2 text-sm font-medium text-gray-900 hover:bg-amber-400"
            >
              {tCommon("actions.contact")}
            </button>
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(location.href)}
              className="border px-3 py-2 rounded text-sm hover:bg-gray-50"
            >
              {t("copyLink")}
            </button>
          </div>
        </div>

        <p className="text-xs text-gray-500">
          {t("disclaimer")}
        </p>
      </div>
    </div>
  );
}

