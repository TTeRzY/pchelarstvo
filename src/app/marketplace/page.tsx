"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useAuth } from "@/context/AuthProvider";
import { useModal } from "@/components/modal/ModalProvider";
import PriceChart from "@/components/market/PriceChart";
import { fetchListings } from "@/lib/listings";
import { useDebounce } from "@/hooks/useDebounce";
import ActiveFilterChips from "@/components/market/ActiveFilterChips";
import ListingStats from "@/components/market/ListingStats";
import ViewModeToggle, { type ViewMode } from "@/components/market/ViewModeToggle";
import MobileFilterDrawer from "@/components/market/MobileFilterDrawer";
import ListingCard from "@/components/market/ListingCard";
import ListingCardGrid from "@/components/market/ListingCardGrid";
import ListingCardCompact from "@/components/market/ListingCardCompact";

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

function mapApiListing(l: any): ListingVM {
  return {
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
    sellerName: l.user?.name || (l as any).contactName || "Анонимен",
    sellerEmail: l.contactEmail ?? l.user?.email ?? null,
    sellerPhone: l.contactPhone ?? (l as any).phone ?? null,
    sellerId: l.user?.id ?? null,
  };
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
  const t = useTranslations("marketplace");
  const tCommon = useTranslations("common");
  const locale = useLocale();

  // Chart state (separate from listings)
  const [chartProduct, setChartProduct] = useState<string>(HONEY_PRODUCTS[0]?.value ?? "");
  const [range, setRange] = useState<Range>("7d");
  const [chartListings, setChartListings] = useState<ListingVM[]>([]);
  const [chartLoading, setChartLoading] = useState(true);
  const chartDays = range === "7d" ? 7 : range === "30d" ? 30 : 365;
  const chartData = useMemo(() => seriesFromListings(chartListings, chartProduct, chartDays), [chartListings, chartProduct, chartDays]);
  const chartRanges: { value: Range; label: string }[] = useMemo(
    () => [
      { value: "7d", label: t("charts.range.7d") },
      { value: "30d", label: t("charts.range.30d") },
      { value: "1y", label: t("charts.range.1y") },
    ],
    [t]
  );

  // Listings state (paginated, server-filtered)
  const [listings, setListings] = useState<ListingVM[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  // Filter state
  const [q, setQ] = useState("");
  const debouncedQ = useDebounce(q, 300); // Debounce search input
  const [type, setType] = useState<"sell" | "buy" | "all">("all");
  const [region, setRegion] = useState<string | "all">("all");
  const [product, setProduct] = useState<string | "all">("all");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [sort, setSort] = useState<"newest" | "priceAsc" | "priceDesc">("newest");
  const [page, setPage] = useState(1);
  const pageSize = 20;

  // UI state
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Regions for filter dropdown (computed from all chart data)
  const regions = useMemo(() => Array.from(new Set(chartListings.map((l) => l.region))).sort(), [chartListings]);

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

  // Fetch all listings once for chart data (no filters, high limit)
  useEffect(() => {
    setChartLoading(true);
    fetchListings({ perPage: 1000 })
      .then((response) => {
        setChartListings(response.items.map(mapApiListing));
      })
      .catch(() => {
        setChartListings([]);
      })
      .finally(() => {
        setChartLoading(false);
      });
  }, []);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
    scrollToTop();
  }, [debouncedQ, type, region, product, minPrice, maxPrice, sort, scrollToTop]);

  // Fetch filtered and paginated listings from server
  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    fetchListings({
      type: type !== "all" ? type : undefined,
      region: region !== "all" ? region : undefined,
      product: product !== "all" ? product : undefined,
      q: debouncedQ || undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      sort,
      page,
      perPage: pageSize,
    })
      .then((response) => {
        if (cancelled) return;
        setListings(response.items.map(mapApiListing));
        setTotal(response.total);
      })
      .catch(() => {
        if (cancelled) return;
        setListings([]);
        setTotal(0);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedQ, type, region, product, minPrice, maxPrice, sort, page, pageSize]);

  // Pagination calculations
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, pageCount);

  // Calculate statistics
  const stats = useMemo(() => {
    if (listings.length === 0) return { average: undefined, min: undefined, max: undefined };
    const prices = listings.map((l) => l.pricePerKg).filter((p) => Number.isFinite(p));
    if (prices.length === 0) return { average: undefined, min: undefined, max: undefined };
    const average = prices.reduce((a, b) => a + b, 0) / prices.length;
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    return { average, min, max };
  }, [listings]);

  // Build active filter chips
  const filterChips = useMemo(() => {
    const chips: Array<{ key: string; label: string; value: string; onRemove: () => void }> = [];
    if (type !== "all") {
      chips.push({
        key: "type",
        label: t("filters.typeLabel") + " " + t(`filters.type.${type}`),
        value: type,
        onRemove: () => setType("all"),
      });
    }
    if (region !== "all") {
      chips.push({
        key: "region",
        label: t("filters.regionLabel") + " " + region,
        value: region,
        onRemove: () => setRegion("all"),
      });
    }
    if (product !== "all") {
      const productOption = HONEY_PRODUCTS.find((p) => p.value === product);
      const label = productOption ? t(productOption.labelKey) : product;
      chips.push({
        key: "product",
        label: t("filters.productLabel") + " " + label,
        value: product,
        onRemove: () => setProduct("all"),
      });
    }
    if (minPrice) {
      chips.push({
        key: "minPrice",
        label: t("filters.minPlaceholder") + " " + minPrice,
        value: minPrice,
        onRemove: () => setMinPrice(""),
      });
    }
    if (maxPrice) {
      chips.push({
        key: "maxPrice",
        label: t("filters.maxPlaceholder") + " " + maxPrice,
        value: maxPrice,
        onRemove: () => setMaxPrice(""),
      });
    }
    if (debouncedQ) {
      chips.push({
        key: "search",
        label: `"${debouncedQ}"`,
        value: debouncedQ,
        onRemove: () => setQ(""),
      });
    }
    return chips;
  }, [type, region, product, minPrice, maxPrice, debouncedQ, t]);

  function clearAllFilters() {
    setType("all");
    setRegion("all");
    setProduct("all");
    setMinPrice("");
    setMaxPrice("");
    setQ("");
  }

  function fmtPrice(n: unknown, unit?: string) {
    const v = typeof n === "number" ? n : Number(n);
    if (!Number.isFinite(v)) return "Р Р†Р вЂљРІР‚Сњ";
    const formatted = numberFormatter.format(v);
    return `${formatted} ${unit ?? defaultPriceUnit}`;
  }
  function fmtDate(iso?: string) {
    return iso ? new Date(iso).toLocaleDateString(numberLocale) : "";
  }

  // Check if listing is new (< 24 hours)
  function isNewListing(created_at?: string): boolean {
    if (!created_at) return false;
    const date = new Date(created_at);
    const now = new Date();
    const hoursDiff = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    return hoursDiff < 24;
  }

  // Handle contact seller
  function handleContactSeller(listing: ListingVM) {
    if (!user) {
      open("login");
      return;
    }
    open("contactSeller", {
      listingId: listing.id,
      listingTitle: listing.title,
      sellerName: listing.sellerName ?? null,
      sellerEmail: listing.sellerEmail ?? null,
      sellerPhone: listing.sellerPhone ?? null,
    });
  }

  // Filter sidebar component
  const FilterSidebar = () => (
    <div className="space-y-6">
      {/* Search */}
      <div>
        <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
          {t("filters.searchPlaceholder")}
        </label>
        <input
          id="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("filters.searchPlaceholder")}
          className="w-full rounded-xl border px-3 py-2 text-sm"
        />
      </div>

      {/* Type */}
      <div>
        <label htmlFor="type-filter" className="block text-sm font-medium text-gray-700 mb-2">
          {t("filters.typeLabel")}
        </label>
        <select
          id="type-filter"
          value={type}
          onChange={(e) => setType(e.target.value as any)}
          className="w-full rounded-xl border px-3 py-2 text-sm"
        >
          <option value="all">{t("filters.type.all")}</option>
          <option value="sell">{t("filters.type.sell")}</option>
          <option value="buy">{t("filters.type.buy")}</option>
        </select>
      </div>

      {/* Product */}
      <div>
        <label htmlFor="product-filter" className="block text-sm font-medium text-gray-700 mb-2">
          {t("filters.productLabel")}
        </label>
        <select
          id="product-filter"
          value={product}
          onChange={(e) => setProduct(e.target.value as any)}
          className="w-full rounded-xl border px-3 py-2 text-sm"
        >
          <option value="all">{t("filters.productAll")}</option>
          {HONEY_PRODUCTS.map((p) => (
            <option key={p.value} value={p.value}>
              {t(p.labelKey)}
            </option>
          ))}
        </select>
      </div>

      {/* Region */}
      <div>
        <label htmlFor="region-filter" className="block text-sm font-medium text-gray-700 mb-2">
          {t("filters.regionLabel")}
        </label>
        <select
          id="region-filter"
          value={region}
          onChange={(e) => setRegion(e.target.value as any)}
          className="w-full rounded-xl border px-3 py-2 text-sm"
        >
          <option value="all">{t("filters.regionAll")}</option>
          {regions.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      {/* Price Range */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t("filters.priceLabel")}
        </label>
        <div className="flex flex-col gap-2">
          <input
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-full rounded-xl border px-3 py-2 text-sm"
            placeholder={t("filters.minPlaceholder")}
            type="number"
            min="0"
            step="0.1"
          />
          <input
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-full rounded-xl border px-3 py-2 text-sm"
            placeholder={t("filters.maxPlaceholder")}
            type="number"
            min="0"
            step="0.1"
          />
        </div>
      </div>

      {/* Sort */}
      <div>
        <label htmlFor="sort-filter" className="block text-sm font-medium text-gray-700 mb-2">
          {t("filters.sortLabel")}
        </label>
        <select
          id="sort-filter"
          value={sort}
          onChange={(e) => setSort(e.target.value as any)}
          className="w-full rounded-xl border px-3 py-2 text-sm"
        >
          <option value="newest">{t("filters.sort.newest")}</option>
          <option value="priceAsc">{t("filters.sort.priceAsc")}</option>
          <option value="priceDesc">{t("filters.sort.priceDesc")}</option>
        </select>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Filter Drawer */}
      <MobileFilterDrawer isOpen={mobileFiltersOpen} onClose={() => setMobileFiltersOpen(false)}>
        <FilterSidebar />
      </MobileFilterDrawer>

      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b sticky top-0 z-30 px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-xl font-bold">{t("title")}</h1>
            <p className="text-gray-600 text-xs">{t("subtitle")}</p>
          </div>
          {user && (
            <Link href="/marketplace/new" className="rounded-xl bg-green-600 hover:bg-green-700 text-white font-medium px-3 py-2 text-sm">
              {t("cta")}
            </Link>
          )}
        </div>
        <button
          onClick={() => setMobileFiltersOpen(true)}
          className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-gray-300 px-4 py-2.5 font-medium text-gray-700 hover:bg-gray-50"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          {t("filters.mobileOpen")}
          {filterChips.length > 0 && (
            <span className="rounded-full bg-yellow-400 text-gray-900 text-xs font-bold px-2 py-0.5">
              {filterChips.length}
            </span>
          )}
        </button>
      </div>

      {/* Desktop Layout */}
      <div className="max-w-[1400px] mx-auto px-4 py-8">
        {/* Desktop Header */}
        <section className="hidden lg:flex items-start md:items-center justify-between gap-3 mb-8">
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

        {/* Market Indicators */}
        <div className="mb-8 flex flex-wrap gap-4">
            {HONEY_PRODUCTS.map((p) => {
              const sample = chartListings.filter((l) => l.product === p.value);
              if (!sample.length) return null;
              const avg = sample.reduce((a, b) => a + b.pricePerKg, 0) / sample.length;
              
              // Calculate trend data for last 90 days (more data = better trend visibility)
              const trendData = seriesFromListings(sample, p.value, 90);
              const validData = trendData.filter((d) => typeof d.avg === "number" && Number.isFinite(d.avg));
              
              // Alternative: if we don't have enough daily data, use individual listing prices sorted by date
              let sparklineValues: number[] = [];
              let priceChangePercent: number | null = null;
              
              if (validData.length >= 2) {
                // Use daily averages from seriesFromListings
                sparklineValues = validData.map((d) => d.avg as number);
              } else {
                // Fallback: use individual listings sorted by date (last 90 days)
                const now = new Date();
                const ninetyDaysAgo = new Date();
                ninetyDaysAgo.setDate(now.getDate() - 90);
                
                const recentListings = sample
                  .filter((l) => {
                    if (!l.created_at) return false;
                    try {
                      const date = new Date(l.created_at);
                      if (Number.isNaN(+date)) return false;
                      // Include listings from the last 90 days
                      return date >= ninetyDaysAgo && date <= now;
                    } catch {
                      return false;
                    }
                  })
                  .sort((a, b) => {
                    try {
                      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
                      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
                      return dateA - dateB;
                    } catch {
                      return 0;
                    }
                  });
                
                if (recentListings.length >= 2) {
                  sparklineValues = recentListings.map((l) => l.pricePerKg);
                }
              }
              
              // Calculate price change: compare first vs last data points
              // Positive = price went UP (green), Negative = price went DOWN (red)
              const hasTrend = sparklineValues.length >= 2;
              if (hasTrend && sparklineValues.length >= 2) {
                const firstPrice = sparklineValues[0];
                const lastPrice = sparklineValues[sparklineValues.length - 1];
                if (firstPrice > 0) {
                  priceChangePercent = ((lastPrice - firstPrice) / firstPrice) * 100;
                }
              }
              
              const minPrice = hasTrend ? Math.min(...sparklineValues) : 0;
              const maxPrice = hasTrend ? Math.max(...sparklineValues) : 0;
              const priceRange = maxPrice - minPrice || 1;
              
              // Normalize values for SVG (0-100 scale)
              const normalizedPoints = sparklineValues.map((val, idx) => {
                const x = (idx / (sparklineValues.length - 1 || 1)) * 100;
                const y = 100 - ((val - minPrice) / priceRange) * 100;
                return `${x},${y}`;
              }).join(" ");
              
              // Determine colors: UP = green, DOWN = red
              const isPriceUp = priceChangePercent !== null && priceChangePercent > 0;
              const isPriceDown = priceChangePercent !== null && priceChangePercent < 0;
              const lineColor = isPriceUp ? "#10b981" : isPriceDown ? "#ef4444" : "#6b7280"; // green for up, red for down, gray for neutral
              
              return (
                <div key={p.value} className="flex-1 min-w-[220px] max-w-[360px] rounded-2xl bg-white px-5 py-4 shadow-sm hover:shadow transition">
                  <div className="text-sm text-gray-500">{t(p.labelKey)}</div>
                  <div className="mt-1 text-2xl font-bold">{fmtPrice(avg)}</div>
                  <div className="mt-3 h-10 rounded-lg bg-gray-50 border border-gray-200 p-2 flex items-center justify-between gap-2">
                    {hasTrend ? (
                      <>
                        <div className="flex-1 h-full relative">
                          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
                            <polyline
                              points={normalizedPoints}
                              fill="none"
                              stroke={lineColor}
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                        {priceChangePercent !== null && (
                          <div className={`flex items-center gap-1 text-xs font-medium ${isPriceUp ? "text-green-600" : isPriceDown ? "text-red-600" : "text-gray-600"}`}>
                            {isPriceUp ? (
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                              </svg>
                            ) : isPriceDown ? (
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            ) : null}
                            <span>{Math.abs(priceChangePercent).toFixed(1)}%</span>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                        {sample.length === 1 
                          ? t("dashboard.insufficientData")
                          : t("dashboard.noTrendData")
                        }
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            {chartListings.length === 0 && <div className="text-sm text-gray-500 p-4">{t("dashboard.empty")}</div>}
        </div>

        {/* Chart */}
        <div className="mb-8 bg-white rounded-2xl border p-4">
            <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
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
            {chartLoading ? (
              <div className="h-72 animate-pulse bg-gray-100 rounded-xl" />
            ) : (
              <PriceChart data={chartData} title={t("charts.priceTitle", { product: getProductLabel(chartProduct), unit: t("price.unitShort") })} />
            )}
        </div>

        {/* Sidebar Layout for Filters & Listings */}
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
          {/* Sidebar (Desktop only) */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-6">
              <div className="rounded-2xl bg-white p-5 shadow-sm border">
                <h2 className="font-semibold text-gray-900 mb-4">{t("filters.label")}</h2>
                <FilterSidebar />
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main>
            {/* Active Filters */}
            {filterChips.length > 0 && (
              <div className="mb-4">
                <ActiveFilterChips chips={filterChips} onClearAll={clearAllFilters} />
              </div>
            )}

            {/* Stats Bar & View Toggle */}
            <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center mb-4">
              <ListingStats
                shown={listings.length}
                total={total}
                average={stats.average}
                min={stats.min}
                max={stats.max}
                priceUnit={defaultPriceUnit}
                numberFormatter={numberFormatter}
              />
              <ViewModeToggle value={viewMode} onChange={setViewMode} />
            </div>

            {/* Listings */}
            {loading ? (
              <div className="rounded-2xl bg-white p-8 shadow-sm">
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
                  ))}
                </div>
              </div>
            ) : (
              <>
                {/* List View */}
                {viewMode === "list" && (
                  <div className="flex flex-col rounded-2xl overflow-hidden bg-white shadow-sm divide-y">
                    {listings.map((l) => (
                      <ListingCard
                        key={l.id}
                        listing={l}
                        productLabel={getProductLabel(l.product)}
                        formattedPrice={fmtPrice(l.pricePerKg)}
                        formattedDate={fmtDate(l.created_at)}
                        onContact={() => handleContactSeller(l)}
                        isNew={isNewListing(l.created_at)}
                      />
                    ))}
                    {listings.length === 0 && (
                      <div className="p-6 text-center text-sm text-gray-500">{t("listings.empty")}</div>
                    )}
                  </div>
                )}

                {/* Grid View */}
                {viewMode === "grid" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {listings.map((l) => (
                      <ListingCardGrid
                        key={l.id}
                        listing={l}
                        productLabel={getProductLabel(l.product)}
                        formattedPrice={fmtPrice(l.pricePerKg)}
                        formattedDate={fmtDate(l.created_at)}
                        onContact={() => handleContactSeller(l)}
                        isNew={isNewListing(l.created_at)}
                      />
                    ))}
                    {listings.length === 0 && (
                      <div className="col-span-full p-6 text-center text-sm text-gray-500 bg-white rounded-2xl">{t("listings.empty")}</div>
                    )}
                  </div>
                )}

                {/* Compact View */}
                {viewMode === "compact" && (
                  <div className="flex flex-col rounded-2xl overflow-hidden bg-white shadow-sm divide-y">
                    {listings.map((l) => (
                      <ListingCardCompact
                        key={l.id}
                        listing={l}
                        productLabel={getProductLabel(l.product)}
                        formattedPrice={fmtPrice(l.pricePerKg)}
                        onContact={() => handleContactSeller(l)}
                        isNew={isNewListing(l.created_at)}
                      />
                    ))}
                    {listings.length === 0 && (
                      <div className="p-6 text-center text-sm text-gray-500">{t("listings.empty")}</div>
                    )}
                  </div>
                )}
              </>
            )}
            {/* Pagination */}
            {pageCount > 1 && (
              <div className="mt-6 flex items-center justify-center gap-2">
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
                      <span key={`ellipsis-${idx}`} className="px-2 text-sm text-gray-400">…</span>
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
          </main>
        </div>
      </div>
    </div>
  );
}

