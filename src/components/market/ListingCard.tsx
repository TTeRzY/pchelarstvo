"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

export type ListingCardData = {
  id: string;
  title: string;
  type: "sell" | "buy";
  product: string;
  pricePerKg: number;
  region: string;
  quantityKg?: number;
  created_at?: string;
  status?: "active" | "completed";
  image?: string;
  sellerName?: string;
  sellerEmail?: string | null;
  sellerPhone?: string | null;
};

type ListingCardProps = {
  listing: ListingCardData;
  productLabel: string;
  formattedPrice: string;
  formattedDate: string;
  onContact: () => void;
  isNew?: boolean;
};

export default function ListingCard({
  listing,
  productLabel,
  formattedPrice,
  formattedDate,
  onContact,
  isNew = false,
}: ListingCardProps) {
  const t = useTranslations("marketplace.listings");
  const tCommon = useTranslations("common");

  // Color coding based on type
  const borderColor = listing.type === "sell" ? "border-l-green-500" : "border-l-blue-500";
  const badgeBg = listing.type === "sell" ? "bg-emerald-100 text-emerald-700" : "bg-sky-100 text-sky-700";

  return (
    <article className={`p-4 border-l-4 ${borderColor} hover:bg-gray-50 transition-colors relative`}>
      {/* NEW badge */}
      {isNew && (
        <div className="absolute top-2 left-2 bg-yellow-400 text-gray-900 text-xs font-bold px-2 py-1 rounded shadow-sm z-10">
          {t("badge.new")}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4">
        {/* Image */}
        <div className="w-full sm:w-28 h-40 sm:h-20 flex-shrink-0 rounded-xl bg-gray-100 overflow-hidden">
          <div
            className="w-full h-full bg-cover bg-center"
            style={{
              backgroundImage: `url(${listing.image ?? "https://placehold.co/400x300?text=Listing"})`,
            }}
            role="img"
            aria-label={listing.title}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Link href={`/marketplace/${listing.id}`} className="font-semibold hover:underline text-gray-900">
              {listing.title}
            </Link>
            <span className={`px-2 py-0.5 text-xs rounded-full ${badgeBg}`}>
              {listing.type === "sell" ? t("badge.sell") : t("badge.buy")}
            </span>
            <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700">
              {productLabel}
            </span>
          </div>
          <div className="mt-1 text-sm text-gray-600 flex flex-wrap items-center gap-x-3 gap-y-1">
            <span>{listing.region}</span>
            {typeof listing.quantityKg === "number" && (
              <span>{t("quantity", { value: listing.quantityKg })}</span>
            )}
            {listing.created_at && <span>{t("published", { date: formattedDate })}</span>}
            {listing.status === "completed" && <span>{t("statusCompleted")}</span>}
          </div>

          {/* Price & Actions - Mobile */}
          <div className="sm:hidden mt-3 space-y-2">
            <div className="text-xl font-bold text-gray-900">{formattedPrice}</div>
            {listing.sellerName && <div className="text-xs text-gray-500">{listing.sellerName}</div>}
            <div className="flex gap-2">
              <Link
                href={`/marketplace/${listing.id}`}
                className="flex-1 text-center rounded-xl border px-3 py-2 text-sm hover:bg-gray-50"
              >
                {tCommon("actions.details")}
              </Link>
              <button
                type="button"
                onClick={onContact}
                className="flex-1 rounded-xl bg-yellow-400 hover:bg-yellow-500 px-3 py-2 text-sm font-medium"
              >
                {tCommon("actions.contact")}
              </button>
            </div>
          </div>
        </div>

        {/* Price & Actions - Desktop */}
        <div className="hidden sm:flex text-right flex-shrink-0 flex-col">
          <div className="text-lg font-bold text-gray-900">{formattedPrice}</div>
          <div className="text-xs text-gray-500">{listing.sellerName}</div>
          <div className="mt-2 flex justify-end gap-2">
            <Link
              href={`/marketplace/${listing.id}`}
              className="rounded-xl border px-3 py-1.5 text-sm hover:bg-gray-50 whitespace-nowrap"
            >
              {tCommon("actions.details")}
            </Link>
            <button
              type="button"
              onClick={onContact}
              className="rounded-xl bg-yellow-400 hover:bg-yellow-500 px-3 py-1.5 text-sm font-medium whitespace-nowrap"
            >
              {tCommon("actions.contact")}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

