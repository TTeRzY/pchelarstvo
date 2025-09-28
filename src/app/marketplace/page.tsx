"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useAuth } from "@/context/AuthProvider";
import { useModal } from "@/components/modal/ModalProvider";
import PriceChart from "@/components/market/PriceChart";
import { fetchListings, type Listing as ApiListing } from "@/lib/listings";

type Range = "7d" | "30d" | "1y";

type ListingVM = {
  id: string;
  title: string;
  type: "sell" | "buy";
  region: string;
  product: string;
  pricePerKg: number;
  quantityKg?: number;
  created_at?: string;
  status?: "active" | "completed";
  image?: string;
  sellerName?: string;
  sellerEmail?: string | null;
  sellerPhone?: string | null;
  sellerId?: string | null;
};

type ProductOption = {
  value: string;
  labelKey:
    | "products.acacia"
    | "products.linden"
    | "products.honeydew"
    | "products.bouquet"
    | "products.sunflower"
    | "products.herbs"
    | "products.lavender";
};

const HONEY_PRODUCTS: ProductOption[] = [
  { value: "Акациев мед", labelKey: "products.acacia" },
  { value: "Липов мед", labelKey: "products.linden" },
  { value: "Манов мед", labelKey: "products.honeydew" },
  { value: "Букет", labelKey: "products.bouquet" },
  { value: "Слънчогледов мед", labelKey: "products.sunflower" },
  { value: "Билков мед", labelKey: "products.herbs" },
  { value: "Лавандула", labelKey: "products.lavender" },
];

function useMarketListings() {
  const [raw, setRaw] = useState<ApiListing[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    fetchListings({ perPage: 500 })
      .then(setRaw)
      .catch(() => setRaw([]))
      .finally(() => setLoading(false));
  }, []);

  const items = useMemo<ListingVM[]>(
    () =>
      raw.map((l: any) => ({
        id: String(l.id),
        title: String(l.title ?? ""),
        type: l.type,
        region: String(l.region ?? ""),
        product: String(l.product ?? ""),
        pricePerKg: Number(l.pricePerKg ?? l.price_per_kg),
        quantityKg:
          l.quantityKg != null
            ? Number(l.quantityKg)
            : l.quantity_kg != null
            ? Number(l.quantity_kg)
            : undefined,
        created_at: (l.created_at ?? l.createdAt ?? l.updated_at) as string | undefined,
        status: l.status,
        image: undefined,
        sellerName: l.user?.name,
        sellerEmail: l.contactEmail ?? l.user?.email ?? null,
        sellerPhone: l.contactPhone ?? null,
        sellerId: l.user?.id ?? null,
      })),
    [raw]
  );

  return { items, loading };
}

// Build triplet series (min/avg/max) per day from completed deals
function seriesFromListings(items: ListingVM[], product: string, days: number) {
  const now = new Date();
  const start = new Date();
  start.setDate(now.getDate() - (days - 1));

  const buckets = new Map<string, number[]>();
  for (const l of items) {
    if (l.product !== product || !l.created_at) continue;
    const d = new Date(l.created_at);
    if (Number.isNaN(+d) || d < start || d > now) continue;
    const key = d.toISOString().slice(0, 10);
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key)!.push(Number(l.pricePerKg));
  }

  const daysArr: { date: string; min?: number; avg?: number; max?: number }[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    const arr = buckets.get(key);
    if (arr && arr.length) {
      const sum = arr.reduce((a, b) => a + b, 0);
      const avg = Math.round((sum / arr.length) * 100) / 100;
      const min = Math.min(...arr);
      const max = Math.max(...arr);
      daysArr.push({ date: d.toISOString(), min, avg, max });
    } else {
      daysArr.push({ date: d.toISOString() });
    }
  }

  let last: { min: number; avg: number; max: number } | undefined;
  for (let i = 0; i < daysArr.length; i++) {
    const d = daysArr[i];
    if (typeof d.min === "number" && typeof d.avg === "number" && typeof d.max === "number") {
      last = { min: d.min, avg: d.avg, max: d.max };
    } else if (last) {
      d.min = last.min;
      d.avg = last.avg;
      d.max = last.max;
    }
  }
  let next: { min: number; avg: number; max: number } | undefined;
  for (let i = daysArr.length - 1; i >= 0; i--) {
    const d = daysArr[i];
    if (typeof d.min === "number" && typeof d.avg === "number" && typeof d.max === "number") {
      next = { min: d.min, avg: d.avg, max: d.max };
    } else if (next) {
      d.min = next.min;
      d.avg = next.avg;
      d.max = next.max;
    }
  }

  return daysArr as { date: string; min: number; avg: number; max: number }[];
}

export default function MarketplacePage() {
  const { user } = useAuth();
  const { open } = useModal();
  const { items: live, loading } = useMarketListings();
  const t = useTranslations("marketplace");
  const tCommon = useTranslations("common");
  const locale = useLocale();

  const [chartProduct, setChartProduct] = useState<string>(HONEY_PRODUCTS[0]?.value ?? "");
  const [range, setRange] = useState<Range>("7d");
  const chartDays = range === "7d" ? 7 : range === "30d" ? 30 : 365;
  const chartData = useMemo(() => seriesFromListings(live, chartProduct, chartDays), [live, chartProduct, chartDays]);
  const chartRanges: { value: Range; label: string }[] = useMemo(
    () => [
      { value: "7d", label: t("charts.range.7d") },
      { value: "30d", label: t("charts.range.30d") },
      { value: "1y", label: t("charts.range.1y") },
    ],
    [t]
  );

  const [q, setQ] = useState("");
  const [type, setType] = useState<"sell" | "buy" | "all">("all");
  const [region, setRegion] = useState<string | "all">("all");
  const [product, setProduct] = useState<string | "all">("all");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [negotiableOnly, setNegotiableOnly] = useState(false);
  const [sort, setSort] = useState<"newest" | "priceAsc" | "priceDesc">("newest");
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const regions = useMemo(() => Array.from(new Set(live.map((l) => l.region))).sort(), [live]);

  const defaultPriceUnit = t("price.unitShort");
  const numberLocale = locale === "bg" ? "bg-BG" : "en-GB";
  const numberFormatter = useMemo(
    () =>
      new Intl.NumberFormat(numberLocale, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    [numberLocale]
  );

  const getProductLabel = useCallback(
    (value: string) => {
      const match = HONEY_PRODUCTS.find((item) => item.value === value);
      return match ? t(match.labelKey) : value;
    },
    [t]
  );

  const scrollToTop = useCallback(() => {
    if (typeof window === "undefined") return;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    setPage(1);
    scrollToTop();
  }, [live, q, type, region, product, negotiableOnly, minPrice, maxPrice, sort, scrollToTop]);

  useEffect(() => {
    setPage(1);
  }, [live, q, type, region, product, negotiableOnly, minPrice, maxPrice, sort]);

  const filteredListings = useMemo(() => {
    let arr = [...live];
    if (q.trim()) {
      const s = q.toLowerCase();
      arr = arr.filter(
        (l) =>
          l.title.toLowerCase().includes(s) ||
          l.region.toLowerCase().includes(s) ||
          l.product.toLowerCase().includes(s) ||
          (l.sellerName || "").toLowerCase().includes(s)
      );
    }
    if (type !== "all") arr = arr.filter((l) => l.type === type);
    if (region !== "all") arr = arr.filter((l) => l.region === region);
    if (product !== "all") arr = arr.filter((l) => l.product === product);
    if (negotiableOnly) arr = arr.filter(() => false);

    const min = minPrice ? Number(minPrice) : undefined;
    const max = maxPrice ? Number(maxPrice) : undefined;
    if (!Number.isNaN(min) && min !== undefined) arr = arr.filter((l) => l.pricePerKg >= min);
    if (!Number.isNaN(max) && max !== undefined) arr = arr.filter((l) => l.pricePerKg <= max);

    switch (sort) {
      case "priceAsc":
        arr.sort((a, b) => a.pricePerKg - b.pricePerKg);
        break;
      case "priceDesc":
        arr.sort((a, b) => b.pricePerKg - a.pricePerKg);
        break;
      default:
        arr.sort((a, b) => +new Date(b.created_at || 0) - +new Date(a.created_at || 0));
    }
    return arr;
  }, [live, q, type, region, product, negotiableOnly, minPrice, maxPrice, sort]);

  const pageCount = Math.max(1, Math.ceil(filteredListings.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const paginatedListings = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredListings.slice(start, start + pageSize);
  }, [filteredListings, currentPage, pageSize]);

  function fmtPrice(n: unknown, unit?: string) {
    const v = typeof n === "number" ? n : Number(n);
    if (!Number.isFinite(v)) return "Р Р†Р вЂљРІР‚Сњ";
    const formatted = numberFormatter.format(v);
    return `${formatted} ${unit ?? defaultPriceUnit}`;
  }
  function fmtDate(iso?: string) {
    return iso ? new Date(iso).toLocaleDateString(numberLocale) : "";
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-[1200px] mx-auto px-4 space-y-10">
        {/* HEADER + CTA */}
        <section className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">{t("title")}</h1>
            <p className="text-gray-600 text-sm">{t("subtitle")}</p>
          </div>
          {user && (
            <Link href="/marketplace/new" className="inline-flex items-center rounded-xl bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2">
              {t("cta")}
            </Link>
          )}
        </section>

        {/* DASHBOARD */}
        <section aria-labelledby="price-dashboard">
          <h2 id="price-dashboard" className="text-lg font-semibold mb-3">{t("dashboard.title")}</h2>
          <div className="flex flex-wrap gap-4">
            {HONEY_PRODUCTS.map((p) => {
              const sample = live.filter((l) => l.product === p.value);
              if (!sample.length) return null;
              const avg = sample.reduce((a, b) => a + b.pricePerKg, 0) / sample.length;
              return (
                <div key={p.value} className="flex-1 min-w-[220px] max-w-[360px] rounded-2xl bg-white px-5 py-4 shadow-sm hover:shadow transition">
                  <div className="text-sm text-gray-500">{t(p.labelKey)}</div>
                  <div className="mt-1 text-2xl font-bold">{fmtPrice(avg)}</div>
                  <div className="mt-3 h-10 rounded-lg bg-gray-100" />
                </div>
              );
            })}
            {live.length === 0 && <div className="text-sm text-gray-500">{t("dashboard.empty")}</div>}
          </div>
        </section>

        {/* CHART */}
        <section aria-labelledby="charts">
          <div className="flex items-center justify-between mb-3 gap-3">
            <h2 id="charts" className="text-lg font-semibold">{t("charts.title")}</h2>
            <div className="flex items-center gap-2">
              <select value={chartProduct} onChange={(e) => setChartProduct(e.target.value)} className="rounded-xl border px-3 py-2 text-sm bg-white">
                {HONEY_PRODUCTS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {t(p.labelKey)}
                  </option>
                ))}
              </select>
              <div className="flex gap-2">
                {chartRanges.map(({ value, label }) => (
                  <button key={value} onClick={() => setRange(value)} className={`px-3 py-1 rounded-xl text-sm font-medium ${range === value ? "bg-gray-900 text-white" : "bg-white border"}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            {loading && live.length === 0 ? (
              <div className="h-72 animate-pulse bg-gray-100 rounded-xl" />
            ) : (
              <PriceChart data={chartData} title={t("charts.priceTitle", { product: getProductLabel(chartProduct), unit: t("price.unitShort") })} />
            )}
          </div>
        </section>

        {/* FILTER BAR */}
        <section aria-labelledby="filters" className="rounded-2xl bg-white p-4 shadow-sm">
          <h2 id="filters" className="sr-only">{t("filters.label")}</h2>
          <div className="flex flex-wrap items-center gap-3">
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("filters.searchPlaceholder")}
              className="flex-1 min-w-[220px] rounded-xl border px-3 py-2 text-sm" />
            <select value={type} onChange={(e) => setType(e.target.value as any)} className="rounded-xl border px-3 py-2 text-sm">
              <option value="all">{t("filters.type.all")}</option>
              <option value="sell">{t("filters.type.sell")}</option>
              <option value="buy">{t("filters.type.buy")}</option>
            </select>
            <select value={region} onChange={(e) => setRegion(e.target.value as any)} className="rounded-xl border px-3 py-2 text-sm">
              <option value="all">{t("filters.regionAll")}</option>
              {regions.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            <select value={product} onChange={(e) => setProduct(e.target.value as any)} className="rounded-xl border px-3 py-2 text-sm">
              <option value="all">{t("filters.productAll")}</option>
              {HONEY_PRODUCTS.map((p) => (
                <option key={p.value} value={p.value}>
                  {t(p.labelKey)}
                </option>
              ))}
            </select>
            <input value={minPrice} onChange={(e) => setMinPrice(e.target.value)} className="w-24 rounded-xl border px-3 py-2 text-sm" placeholder={t("filters.minPlaceholder")} />
            <input value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="w-24 rounded-xl border px-3 py-2 text-sm" placeholder={t("filters.maxPlaceholder")} />
            <label className="flex items-center gap-2 text-sm ml-1">
              <input type="checkbox" checked={negotiableOnly} onChange={(e) => setNegotiableOnly(e.target.checked)} />
              <span>{t("filters.negotiableOnly")}</span>
            </label>
            <div className="ml-auto flex items-center gap-2">
              <span className="text-sm text-gray-500">{t("filters.sortLabel")}</span>
              <select value={sort} onChange={(e) => setSort(e.target.value as any)} className="rounded-xl border px-3 py-2 text-sm">
                <option value="newest">{t("filters.sort.newest")}</option>
                <option value="priceAsc">{t("filters.sort.priceAsc")}</option>
                <option value="priceDesc">{t("filters.sort.priceDesc")}</option>
              </select>
            </div>
          </div>
        </section>

        {/* LISTINGS */}
        <section aria-labelledby="listings">
          <div className="flex items-center justify-between mb-3">
            <h2 id="listings" className="text-lg font-semibold">
              {t("listings.heading", { count: filteredListings.length })}
            </h2>
            {!user && <span className="text-xs text-gray-500">{t("listings.signinPrompt")}</span>}
          </div>
          <div className="flex flex-col rounded-2xl overflow-hidden bg-white shadow-sm divide-y">
            {paginatedListings.map((l) => (
              <article key={l.id} className="p-4">
                <div className="flex gap-4">
                  <div className="w-28 h-20 flex-shrink-0 rounded-xl bg-gray-100 overflow-hidden">
                    <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${l.image ?? "https://placehold.co/400x300?text=Listing"})` }} role="img" aria-label={l.title} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link href={`/marketplace/${l.id}`} className="font-semibold hover:underline">{l.title}</Link>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${l.type === "sell" ? "bg-emerald-100 text-emerald-700" : "bg-sky-100 text-sky-700"}`}>
                        {l.type === "sell" ? t("listings.badge.sell") : t("listings.badge.buy")}
                      </span>
                      <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700">{getProductLabel(l.product)}</span>
                    </div>
                    <div className="mt-1 text-sm text-gray-600 flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span>{l.region}</span>
                      {typeof l.quantityKg === "number" && <span>{t("listings.quantity", { value: l.quantityKg })}</span>}
                      {l.created_at && <span>{t("listings.published", { date: fmtDate(l.created_at) })}</span>}
                      {l.status === "completed" && <span>{t("listings.statusCompleted")}</span>}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-lg font-bold">{fmtPrice(l.pricePerKg)}</div>
                    <div className="text-xs text-gray-500">{l.sellerName}</div>
                    <div className="mt-2 flex justify-end gap-2">
                      <Link href={`/marketplace/${l.id}`} className="rounded-xl border px-3 py-1.5 text-sm hover:bg-gray-50">{tCommon("actions.details")}</Link>
                      <button
                        type="button"
                        onClick={() => {
                          if (!user) {
                            open("login");
                            return;
                          }
                          open("contactSeller", {
                            listingId: l.id,
                            listingTitle: l.title,
                            sellerName: l.sellerName ?? null,
                            sellerEmail: l.sellerEmail ?? null,
                            sellerPhone: l.sellerPhone ?? null,
                          });
                        }}
                        className="rounded-xl bg-yellow-400 hover:bg-yellow-500 px-3 py-1.5 text-sm font-medium"
                      >
                        {tCommon("actions.contact")}
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
            {filteredListings.length === 0 && <div className="p-6 text-center text-sm text-gray-500">{t("listings.empty")}</div>}
          </div>
          {pageCount > 1 && (
            <div className="mt-4 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded-lg text-sm border ${currentPage === 1 ? "text-gray-300 border-gray-200" : "hover:bg-gray-100"}`}
              >
                {tCommon("pagination.previous")}
              </button>
              {Array.from({ length: pageCount }, (_, i) => i + 1)
                .filter((num) =>
                  num === 1 || num === pageCount || Math.abs(num - currentPage) <= 2
                )
                .reduce((acc, num) => {
                  if (acc.length === 0 || num - acc[acc.length - 1] <= 1) {
                    acc.push(num);
                  } else {
                    acc.push(-1, num);
                  }
                  return acc;
                }, [] as number[])
                .map((num, idx) =>
                  num === -1 ? (
                    <span key={`ellipsis-${idx}`} className="px-2 text-sm text-gray-400">РІР‚В¦</span>
                  ) : (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setPage(num)}
                      className={`cursor-pointer px-3 py-1 rounded-lg text-sm border ${num === currentPage ? "bg-gray-900 text-white border-gray-900" : "hover:bg-gray-100"}`}
                    >
                      {num}
                    </button>
                  )
                )}
              <button
                type="button"
                onClick={() => setPage((prev) => Math.min(pageCount, prev + 1))}
                disabled={currentPage === pageCount}
                className={`cursor-pointer px-3 py-1 rounded-lg text-sm border ${currentPage === pageCount ? "text-gray-300 border-gray-200" : "hover:bg-gray-100"}`}
              >
                {tCommon("pagination.next")}
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

