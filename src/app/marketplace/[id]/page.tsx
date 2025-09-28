"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
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

  const [listing, setListing] = useState<Listing | null>(null);

  useEffect(() => {
    fetchListing(id).then((l) => setListing(l));
  }, [id]);

  const pricePerKg = useMemo(() => toNumber(listing?.pricePerKg ?? (listing as any)?.price_per_kg), [listing]);
  const quantityKg = useMemo(() => toNumber(listing?.quantityKg ?? (listing as any)?.quantity_kg), [listing]);

  const totalValue = useMemo(() => {
    if (pricePerKg == null || quantityKg == null) return null;
    const total = pricePerKg * quantityKg;
    return Number.isFinite(total) ? total.toFixed(2) : null;
  }, [pricePerKg, quantityKg]);

  if (!listing) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center space-y-3">
          <h1 className="text-xl font-bold">Обявата не е намерена</h1>
          <p className="text-sm text-gray-600">
            Възможно е да е изтрита или да е въведен грешен адрес.
          </p>
          <Link href="/marketplace" className="text-amber-600 underline">
            Виж всички обяви
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
            Обратно към обявите
          </Link>
        </div>

        {/* Details */}
        <div className="bg-white rounded-2xl shadow p-5 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Тип:</span>{" "}
              <b>{listing.type === "sell" ? "Продажба" : "Покупка"}</b>
            </div>
            <div>
              <span className="text-gray-500">Продукт:</span> <b>{listing.product}</b>
            </div>
            <div>
              <span className="text-gray-500">Количество:</span>{" "}
              <b>{quantityKg != null ? `${quantityKg} кг` : "-"}</b>
            </div>
            <div>
              <span className="text-gray-500">Цена/kg:</span>{" "}
              <b>{pricePerKg != null ? `${pricePerKg.toFixed(2)} лв` : "-"}</b>
            </div>
            {totalValue && (
              <div>
                <span className="text-gray-500">Обща стойност:</span> <b>{totalValue} лв</b>
              </div>
            )}
          </div>

          {listing.description && (
            <div className="pt-2">
              <h3 className="font-bold mb-1">Описание</h3>
              <p className="text-gray-800 whitespace-pre-line">{listing.description}</p>
            </div>
          )}

          {/* Actions (contact disabled until backend supports) */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => navigator.clipboard.writeText(location.href)}
              className="border px-3 py-2 rounded text-sm hover:bg-gray-50"
            >
              Копирай връзката към обявата
            </button>
          </div>
        </div>

        <p className="text-xs text-gray-500">
          Забележка: платформата не носи отговорност за съдържанието на потребителските обяви.
          Проверявайте партньорите си преди финализиране на сделка.
        </p>
      </div>
    </div>
  );
}
