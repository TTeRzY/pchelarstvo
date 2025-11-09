"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { ListingCardData } from "./ListingCard";

type ListingCardCompactProps = {
  listing: ListingCardData;
  productLabel: string;
  formattedPrice: string;
  onContact: () => void;
  isNew?: boolean;
};

export default function ListingCardCompact({
  listing,
  productLabel,
  formattedPrice,
  onContact,
  isNew = false,
}: ListingCardCompactProps) {
  const t = useTranslations("marketplace.listings");
  const tCommon = useTranslations("common");

  const borderColor = listing.type === "sell" ? "border-l-green-500" : "border-l-blue-500";
  const badgeBg = listing.type === "sell" ? "bg-emerald-100 text-emerald-700" : "bg-sky-100 text-sky-700";

  return (
    <article className={`py-3 px-4 border-l-4 ${borderColor} hover:bg-gray-50 transition-colors relative`}>
      {/* NEW badge */}
      {isNew && (
        <div className="absolute top-1 left-2 bg-yellow-400 text-gray-900 text-xs font-bold px-2 py-0.5 rounded shadow-sm z-10">
          {t("badge.new")}
        </div>
      )}

      {/* Desktop Layout */}
      <div className={`hidden md:flex items-center gap-4 ${isNew ? 'pt-6' : ''}`}>
        {/* Title & Badges */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Link href={`/marketplace/${listing.id}`} className="font-medium hover:underline text-gray-900 truncate">
              {listing.title}
            </Link>
            <span className={`px-2 py-0.5 text-xs rounded-full shrink-0 ${badgeBg}`}>
              {listing.type === "sell" ? t("badge.sell") : t("badge.buy")}
            </span>
          </div>
          <div className="mt-0.5 text-sm text-gray-600 flex items-center gap-3">
            <span>{productLabel}</span>
            <span>{listing.region}</span>
            {typeof listing.quantityKg === "number" && <span>{listing.quantityKg} kg</span>}
          </div>
        </div>

        {/* Price */}
        <div className="text-lg font-bold text-gray-900 shrink-0">{formattedPrice}</div>

        {/* Seller */}
        {listing.sellerName && (
          <div className="text-sm text-gray-500 shrink-0 w-32 truncate">
            {listing.sellerName}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 shrink-0">
          <Link
            href={`/marketplace/${listing.id}`}
            className="rounded-lg border px-3 py-1 text-sm hover:bg-gray-100 whitespace-nowrap"
          >
            {tCommon("actions.details")}
          </Link>
          <button
            type="button"
            onClick={onContact}
            className="rounded-lg bg-yellow-400 hover:bg-yellow-500 px-3 py-1 text-sm font-medium whitespace-nowrap"
          >
            {tCommon("actions.contact")}
          </button>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className={`md:hidden space-y-2 ${isNew ? 'pt-6' : ''}`}>
        {/* Title & Badges */}
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <Link href={`/marketplace/${listing.id}`} className="font-medium hover:underline text-gray-900">
              {listing.title}
            </Link>
            <span className={`px-2 py-0.5 text-xs rounded-full shrink-0 ${badgeBg}`}>
              {listing.type === "sell" ? t("badge.sell") : t("badge.buy")}
            </span>
          </div>
          <div className="mt-1 text-sm text-gray-600 flex flex-wrap items-center gap-x-3 gap-y-1">
            <span>{productLabel}</span>
            <span>{listing.region}</span>
            {typeof listing.quantityKg === "number" && <span>{listing.quantityKg} kg</span>}
          </div>
        </div>

        {/* Price & Seller */}
        <div className="flex items-baseline gap-3">
          <div className="text-lg font-bold text-gray-900">{formattedPrice}</div>
          {listing.sellerName && (
            <div className="text-sm text-gray-500 truncate flex-1">{listing.sellerName}</div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Link
            href={`/marketplace/${listing.id}`}
            className="flex-1 text-center rounded-lg border px-3 py-2 text-sm hover:bg-gray-100"
          >
            {tCommon("actions.details")}
          </Link>
          <button
            type="button"
            onClick={onContact}
            className="flex-1 rounded-lg bg-yellow-400 hover:bg-yellow-500 px-3 py-2 text-sm font-medium"
          >
            {tCommon("actions.contact")}
          </button>
        </div>
      </div>
    </article>
  );
}

