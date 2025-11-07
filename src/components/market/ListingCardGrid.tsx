"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { ListingCardData } from "./ListingCard";

type ListingCardGridProps = {
  listing: ListingCardData;
  productLabel: string;
  formattedPrice: string;
  formattedDate: string;
  onContact: () => void;
  isNew?: boolean;
};

export default function ListingCardGrid({
  listing,
  productLabel,
  formattedPrice,
  formattedDate,
  onContact,
  isNew = false,
}: ListingCardGridProps) {
  const t = useTranslations("marketplace.listings");
  const tCommon = useTranslations("common");

  const borderColor = listing.type === "sell" ? "border-t-green-500" : "border-t-blue-500";
  const badgeBg = listing.type === "sell" ? "bg-emerald-100 text-emerald-700" : "bg-sky-100 text-sky-700";

  return (
    <article className={`rounded-2xl bg-white shadow-sm border border-t-4 ${borderColor} overflow-hidden hover:shadow-md transition-shadow relative`}>
      {/* NEW badge */}
      {isNew && (
        <div className="absolute top-2 right-2 z-10 bg-yellow-400 text-gray-900 text-xs font-bold px-2 py-1 rounded">
          {t("badge.new")}
        </div>
      )}

      {/* Image */}
      <div className="h-48 bg-gray-100 overflow-hidden">
        <div
          className="w-full h-full bg-cover bg-center hover:scale-105 transition-transform duration-300"
          style={{
            backgroundImage: `url(${listing.image ?? "https://placehold.co/600x400?text=Listing"})`,
          }}
          role="img"
          aria-label={listing.title}
        />
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Badges */}
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className={`px-2 py-0.5 text-xs rounded-full ${badgeBg}`}>
            {listing.type === "sell" ? t("badge.sell") : t("badge.buy")}
          </span>
          <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700">
            {productLabel}
          </span>
        </div>

        {/* Title */}
        <Link href={`/marketplace/${listing.id}`} className="font-semibold hover:underline text-gray-900 block mb-2">
          {listing.title}
        </Link>

        {/* Price */}
        <div className="text-2xl font-bold text-gray-900 mb-2">{formattedPrice}</div>

        {/* Meta */}
        <div className="text-sm text-gray-600 space-y-1 mb-4">
          <div>{listing.region}</div>
          {typeof listing.quantityKg === "number" && (
            <div>{t("quantity", { value: listing.quantityKg })}</div>
          )}
          {listing.sellerName && <div className="text-xs">{listing.sellerName}</div>}
        </div>

        {/* Actions */}
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
    </article>
  );
}

