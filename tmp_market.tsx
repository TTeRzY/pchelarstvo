"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthProvider";
import PriceChart from "@/components/market/PriceChart";

/** =========================
 *  Types
 * ========================= */
type Listing = {
  id: number;
  title: string;
  type: "sell" | "buy";
  region: string;
  product: string;  // РІРёРґ РјРµРґ
  price: number;    // Р»РІ/РєРі
  priceUnit?: string;
  quantityKg?: number;
  negotiable?: boolean;
  postedAt?: string; // ISO
  seller?: { name: string; verified?: boolean };
  image?: string;

  status: "open" | "closed";
  closedAt?: string; // ISO (Р°РєРѕ Рµ Р·Р°С‚РІРѕСЂРµРЅР°)
};

type Range = "7d" | "30d" | "1y";

/** =========================
 *  Demo data (РјРµРґ СЃР°РјРѕ)
 * ========================= */
const HONEY_PRODUCTS = [
  "РђРєР°С†РёРµРІ РјРµРґ",
  "Р›РёРїРѕРІ РјРµРґ",
  "Р‘СѓРєРµС‚ (РїРѕР»РёС„Р»РѕСЂРµРЅ)",
  "РњР°РЅРѕРІ РјРµРґ",
  "РЎР»СЉРЅС‡РѕРіР»РµРґРѕРІ РјРµРґ",
  "Р›Р°РІР°РЅРґСѓР»РѕРІ РјРµРґ",
  "Р Р°РїРёС‡РµРЅ РјРµРґ",
] as const;

const listings: Listing[] = [
  { id: 1, title: "РџСЂРѕРґР°РІР°Рј Р°РєР°С†РёРµРІ РјРµРґ вЂ“ 300 РєРі", type: "sell", region: "РџР»РµРІРµРЅ", product: "РђРєР°С†РёРµРІ РјРµРґ", price: 8.20, priceUnit: "Р»РІ/РєРі", quantityKg: 300, postedAt: "2025-09-01", status:"closed", closedAt:"2025-09-05", seller:{name:"РРІР°РЅ РџРµС‚СЂРѕРІ", verified:true}, image:"https://placehold.co/600x400?text=Acacia" },
  { id: 2, title: "РљСѓРїСѓРІР°Рј Р»РёРїРѕРІ РјРµРґ вЂ“ 500 РєРі", type: "buy", region: "РЎРѕС„РёСЏ", product: "Р›РёРїРѕРІ РјРµРґ", price: 7.60, priceUnit: "Р»РІ/РєРі", quantityKg: 500, postedAt: "2025-09-03", status:"closed", closedAt:"2025-09-05", seller:{name:"РњР°СЂРёСЏ Р”."}, image:"https://placehold.co/600x400?text=Linden" },
  { id: 3, title: "РџСЂРѕРґР°РІР°Рј РјР°РЅРѕРІ РјРµРґ вЂ“ 150 РєРі", type: "sell", region: "Р‘СѓСЂРіР°СЃ", product: "РњР°РЅРѕРІ РјРµРґ", price: 9.80, priceUnit: "Р»РІ/РєРі", quantityKg: 150, postedAt: "2025-08-30", status:"closed", closedAt:"2025-09-04", seller:{name:"РЎС‚РѕСЏРЅ Рљ.", verified:true}, image:"https://placehold.co/600x400?text=Honeydew" },
  { id: 4, title: "РџСЂРѕРґР°РІР°Рј Р±СѓРєРµС‚ вЂ“ 200 РєРі", type: "sell", region: "Р’Р°СЂРЅР°", product: "Р‘СѓРєРµС‚ (РїРѕР»РёС„Р»РѕСЂРµРЅ)", price: 6.80, priceUnit: "Р»РІ/РєРі", quantityKg: 200, postedAt: "2025-09-04", status:"open", seller:{name:"РџРµС‚СЉСЂ Рќ."}, image:"https://placehold.co/600x400?text=Bouquet" },
  { id: 5, title: "РљСѓРїСѓРІР°Рј СЃР»СЉРЅС‡РѕРіР»РµРґРѕРІ вЂ“ 1000 РєРі", type: "buy", region: "РЎС‚Р°СЂР° Р—Р°РіРѕСЂР°", product: "РЎР»СЉРЅС‡РѕРіР»РµРґРѕРІ РјРµРґ", price: 6.10, priceUnit: "Р»РІ/РєРі", quantityKg: 1000, postedAt: "2025-09-05", status:"closed", closedAt:"2025-09-06", seller:{name:"Р”Р°РЅР°РёР» Рџ."}, image:"https://placehold.co/600x400?text=Sunflower" },
  { id: 6, title: "РџСЂРѕРґР°РІР°Рј Р°РєР°С†РёРµРІ вЂ“ 120 РєРі", type: "sell", region: "Р СѓСЃРµ", product: "РђРєР°С†РёРµРІ РјРµРґ", price: 8.35, priceUnit: "Р»РІ/РєРі", quantityKg: 120, postedAt: "2025-09-06", status:"closed", closedAt:"2025-09-07", seller:{name:"Р•Р»РµРЅР° Рњ.", verified:true}, image:"https://placehold.co/600x400?text=Acacia" },
];

/** =========================
 *  Aggregation utils (РїСЂРѕСЃС‚Рё)
 * ========================= */

// СЃРµСЂРёСЏ {t,v} РѕС‚ Р—РђРўР’РћР Р•РќР РѕР±СЏРІРё (СЃСЂРµРґРЅР° С†РµРЅР°/РґРµРЅ). РџСЂРё Р»РёРїСЃР° РЅР° СЃРґРµР»РєРё Р·Р° РґРµРЅ в†’ carry-forward.
function buildDailySeriesFromClosed(
  all: Listing[],
  product: string,
  days: number
): { t: string; v: number }[] {
  const now = new Date();
  const start = new Date();
  start.setDate(now.getDate() - (days - 1));

  const buckets = new Map<string, number[]>(); // YYYY-MM-DD -> С†РµРЅРё[]

  for (const l of all) {
    if (l.status !== "closed" || !l.closedAt) continue;
    if (l.product !== product) continue;
    const d = new Date(l.closedAt);
    if (d < start || d > now) continue;
    const key = d.toISOString().slice(0, 10);
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key)!.push(l.price);
  }

  const series: { t: string; v: number }[] = [];
  let lastPrice: number | null = null;

  for (let i = 0; i < days; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    const arr = buckets.get(key);
    let value: number | null = null;

    if (arr && arr.length) {
      const avg = arr.reduce((a, b) => a + b, 0) / arr.length;
      value = Math.round(avg * 100) / 100;
      lastPrice = value;
    } else if (lastPrice != null) {
      value = lastPrice; // carry-forward Р·Р° РЅРµРїСЂРµРєСЉСЃРЅР°С‚РѕСЃС‚
    }

    if (value != null) series.push({ t: d.toISOString(), v: value });
  }

  return series;
}

// РџРѕСЃР»РµРґРЅР° РєРѕС‚РёСЂРѕРІРєР° РѕС‚ Р·Р°С‚РІРѕСЂРµРЅРё СЃРґРµР»РєРё (Рё % РїСЂРѕРјСЏРЅР° СЃРїСЂСЏРјРѕ РЅР°С‡Р°Р»РѕС‚Рѕ РЅР° РїРµСЂРёРѕРґР°)
function getCurrentQuoteFromClosed(
  all: Listing[],
  product: string,
  lookbackDays = 7
) {
  const s = buildDailySeriesFromClosed(all, product, lookbackDays);
  if (s.length === 0) return null;
  const latest = s[s.length - 1].v;
  const first = s[0].v;
  const changePct = ((latest - first) / first) * 100;
  return { price: latest, changePct: Math.round(changePct * 10) / 10 };
}

/** =========================
 *  Page
 * ========================= */

export default function MarketplacePage() {
  const { user } = useAuth();

  // РљРѕС‚РёСЂРѕРІРєРё РѕС‚ Р—РђРўР’РћР Р•РќР СЃРґРµР»РєРё (РїРѕСЃР»РµРґРЅРё 7 РґРЅРё)
  const dashboard = useMemo(() => {
    return HONEY_PRODUCTS.map((p) => {
      const q = getCurrentQuoteFromClosed(listings, p, 7);
      return q ? { product: p, price: q.price, change: q.changePct } : null;
    }).filter(Boolean) as { product: string; price: number; change: number }[];
  }, []);

  // Chart state: РїСЂРѕРґСѓРєС‚ + РїРµСЂРёРѕРґ
  const [chartProduct, setChartProduct] = useState<(typeof HONEY_PRODUCTS)[number]>("РђРєР°С†РёРµРІ РјРµРґ");
  const [range, setRange] = useState<Range>("7d");
  const chartDays = range === "7d" ? 7 : range === "30d" ? 30 : 365;

  const chartData = useMemo(
    () => buildDailySeriesFromClosed(listings, chartProduct, chartDays),
    [chartProduct, chartDays]
  );

  // Filters
  const [q, setQ] = useState("");
  const [type, setType] = useState<"sell" | "buy" | "all">("all");
  const [region, setRegion] = useState<string | "all">("all");
  const [product, setProduct] = useState<(typeof HONEY_PRODUCTS)[number] | "all">("all");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [negotiableOnly, setNegotiableOnly] = useState(false);
  const [sort, setSort] = useState<"newest" | "priceAsc" | "priceDesc">("newest");

  const regions = useMemo(
    () => Array.from(new Set(listings.map((l) => l.region))).sort(),
    []
  );

  const filteredListings = useMemo(() => {
    let arr = [...listings];

    if (q.trim()) {
      const s = q.toLowerCase();
      arr = arr.filter(
        (l) =>
          l.title.toLowerCase().includes(s) ||
          l.region.toLowerCase().includes(s) ||
          l.product.toLowerCase().includes(s) ||
          (l.seller?.name || "").toLowerCase().includes(s)
      );
    }
    if (type !== "all") arr = arr.filter((l) => l.type === type);
    if (region !== "all") arr = arr.filter((l) => l.region === region);
    if (product !== "all") arr = arr.filter((l) => l.product === product);
    if (negotiableOnly) arr = arr.filter((l) => !!l.negotiable);

    const min = minPrice ? Number(minPrice) : undefined;
    const max = maxPrice ? Number(maxPrice) : undefined;
    if (!Number.isNaN(min) && min !== undefined) arr = arr.filter((l) => l.price >= min);
    if (!Number.isNaN(max) && max !== undefined) arr = arr.filter((l) => l.price <= max);

    switch (sort) {
      case "priceAsc":
        arr.sort((a, b) => a.price - b.price);
        break;
      case "priceDesc":
        arr.sort((a, b) => b.price - a.price);
        break;
      default:
        arr.sort((a, b) => +new Date(b.postedAt || 0) - +new Date(a.postedAt || 0));
    }
    return arr;
  }, [q, type, region, product, negotiableOnly, minPrice, maxPrice, sort]);

  // Helpers
  function fmtPrice(n: number, unit?: string) {
    return `${n.toFixed(2)}${unit ? ` ${unit}` : ""}`;
  }
  function fmtDate(iso?: string) {
    return iso ? new Date(iso).toLocaleDateString("bg-BG") : "";
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-[1200px] mx-auto px-4 space-y-10">
        {/* HEADER + CTA */}
        <section className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">РџР°Р·Р°СЂ (РїС‡РµР»РµРЅ РјРµРґ)</h1>
            <p className="text-gray-600 text-sm">РљРѕС‚РёСЂРѕРІРєРё, РіСЂР°С„РёРєРё Рё РѕР±СЏРІРё вЂ” РґР°РЅРЅРё СЃР°РјРѕ РѕС‚ Р·Р°С‚РІРѕСЂРµРЅРё СЃРґРµР»РєРё.</p>
          </div>
          {user && (
            <Link
              href="/marketplace/new"
              className="inline-flex items-center rounded-xl bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2"
            >
              РџСѓР±Р»РёРєСѓРІР°Р№ РѕР±СЏРІР°
            </Link>
          )}
        </section>

        {/* DASHBOARD: С‚РµРєСѓС‰Рё РєРѕС‚РёСЂРѕРІРєРё (РѕС‚ Р·Р°С‚РІРѕСЂРµРЅРё СЃРґРµР»РєРё) */}
        <section aria-labelledby="price-dashboard">
          <h2 id="price-dashboard" className="text-lg font-semibold mb-3">
            РўРµРєСѓС‰Рё РєРѕС‚РёСЂРѕРІРєРё (РїРѕСЃР»РµРґРЅРё 7 РґРЅРё)
          </h2>
          <div className="flex flex-wrap gap-4">
            {dashboard.map((p) => (
              <div
                key={p.product}
                className="flex-1 min-w-[220px] max-w-[360px] rounded-2xl bg-white px-5 py-4 shadow-sm hover:shadow transition"
              >
                <div className="text-sm text-gray-500">{p.product}</div>
                <div className="mt-1 text-2xl font-bold">{p.price.toFixed(2)} Р»РІ/РєРі</div>
                <div className={`mt-1 text-sm font-medium ${p.change >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                  {p.change >= 0 ? `в–І +${p.change}%` : `в–ј ${Math.abs(p.change)}%`}
                </div>
                <div className="mt-3 h-10 rounded-lg bg-gray-100" />
              </div>
            ))}
            {dashboard.length === 0 && (
              <div className="text-sm text-gray-500">РќСЏРјР° Р·Р°С‚РІРѕСЂРµРЅРё СЃРґРµР»РєРё Р·Р° РїРѕРєР°Р·РІР°РЅРµ.</div>
            )}
          </div>
        </section>

        {/* CHART: РёСЃС‚РѕСЂРёС‡РµСЃРєРё С†РµРЅРё РѕС‚ Р·Р°С‚РІРѕСЂРµРЅРё СЃРґРµР»РєРё */}
        <section aria-labelledby="charts">
          <div className="flex items-center justify-between mb-3 gap-3">
            <h2 id="charts" className="text-lg font-semibold">РСЃС‚РѕСЂРёС‡РµСЃРєРё С†РµРЅРё</h2>
            <div className="flex items-center gap-2">
              <select
                value={chartProduct}
                onChange={(e) => setChartProduct(e.target.value as (typeof HONEY_PRODUCTS)[number])}
                className="rounded-xl border px-3 py-2 text-sm bg-white"
              >
                {HONEY_PRODUCTS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              <div className="flex gap-2">
                {(["7d", "30d", "1y"] as Range[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => setRange(r)}
                    className={`px-3 py-1 rounded-xl text-sm font-medium ${
                      range === r ? "bg-gray-900 text-white" : "bg-white border"
                    }`}
                  >
                    {r === "7d" ? "7 РґРЅРё" : r === "30d" ? "30 РґРЅРё" : "1 РіРѕРґРёРЅР°"}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <PriceChart data={chartData} title={`${chartProduct} (Р»РІ/РєРі)`} />
          </div>
        </section>

        {/* FILTER BAR */}
        <section aria-labelledby="filters" className="rounded-2xl bg-white p-4 shadow-sm">
          <h2 id="filters" className="sr-only">Р¤РёР»С‚СЂРё</h2>
          <div className="flex flex-wrap items-center gap-3">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="РўСЉСЂСЃРё РїРѕ Р·Р°РіР»Р°РІРёРµ, РїСЂРѕРґСѓРєС‚, СЂРµРіРёРѕРЅ РёР»Рё РїСЂРѕРґР°РІР°С‡вЂ¦"
              className="flex-1 min-w-[220px] rounded-xl border px-3 py-2 text-sm"
            />
            <select value={type} onChange={(e) => setType(e.target.value as any)} className="rounded-xl border px-3 py-2 text-sm">
              <option value="all">Р’СЃРёС‡РєРё С‚РёРїРѕРІРµ</option>
              <option value="sell">РџСЂРѕРґР°РІР°Рј</option>
              <option value="buy">РљСѓРїСѓРІР°Рј</option>
            </select>
            <select value={product} onChange={(e) => setProduct(e.target.value as any)} className="rounded-xl border px-3 py-2 text-sm">
              <option value="all">Р’СЃРёС‡РєРё РїСЂРѕРґСѓРєС‚Рё</option>
              {HONEY_PRODUCTS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            <select value={region} onChange={(e) => setRegion(e.target.value as any)} className="rounded-xl border px-3 py-2 text-sm">
              <option value="all">Р’СЃРёС‡РєРё СЂРµРіРёРѕРЅРё</option>
              {regions.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>

            <div className="flex items-center gap-2">
              <input
                type="number"
                inputMode="decimal"
                placeholder="РњРёРЅ Р»РІ/РєРі"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-28 rounded-xl border px-3 py-2 text-sm"
              />
              <input
                type="number"
                inputMode="decimal"
                placeholder="РњР°РєСЃ Р»РІ/РєРі"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-28 rounded-xl border px-3 py-2 text-sm"
              />
            </div>

            <label className="inline-flex items-center gap-2 text-sm ml-1">
              <input
                type="checkbox"
                checked={negotiableOnly}
                onChange={(e) => setNegotiableOnly(e.target.checked)}
              />
              <span>РЎР°РјРѕ СЃ РїР°Р·Р°СЂР»СЉРє</span>
            </label>

            <div className="ml-auto flex items-center gap-2">
              <span className="text-sm text-gray-500">РЎРѕСЂС‚РёСЂР°Р№:</span>
              <select value={sort} onChange={(e) => setSort(e.target.value as any)} className="rounded-xl border px-3 py-2 text-sm">
                <option value="newest">РќР°Р№-РЅРѕРІРё</option>
                <option value="priceAsc">Р¦РµРЅР° в†‘</option>
                <option value="priceDesc">Р¦РµРЅР° в†“</option>
              </select>
            </div>
          </div>
        </section>

        {/* LISTINGS */}
        <section aria-labelledby="listings">
          <div className="flex items-center justify-between mb-3">
            <h2 id="listings" className="text-lg font-semibold">РћР±СЏРІРё ({filteredListings.length})</h2>
            {!user && <span className="text-xs text-gray-500">Р’Р»РµР· Р·Р° РґР° РїСѓР±Р»РёРєСѓРІР°С€ РѕР±СЏРІР°.</span>}
          </div>

          <div className="flex flex-col rounded-2xl overflow-hidden bg-white shadow-sm divide-y">
            {filteredListings.map((l) => (
              <article key={l.id} className="p-4">
                <div className="flex gap-4">
                  {/* Image */}
                  <div className="w-28 h-20 flex-shrink-0 rounded-xl bg-gray-100 overflow-hidden">
                    <div
                      className="w-full h-full bg-cover bg-center"
                      style={{ backgroundImage: `url(${l.image ?? "https://placehold.co/400x300?text=Listing"})` }}
                      role="img"
                      aria-label={l.title}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link href={`/marketplace/${l.id}`} className="font-semibold hover:underline">
                        {l.title}
                      </Link>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                        l.type === "sell" ? "bg-emerald-100 text-emerald-700" : "bg-sky-100 text-sky-700"
                      }`}>
                        {l.type === "sell" ? "РџСЂРѕРґР°РІР°Рј" : "РљСѓРїСѓРІР°Рј"}
                      </span>
                      <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700">{l.product}</span>
                      {l.seller?.verified && (
                        <span className="px-2 py-0.5 text-xs rounded-full bg-indigo-100 text-indigo-700">РџРѕС‚РІСЉСЂРґРµРЅ</span>
                      )}
                    </div>

                    <div className="mt-1 text-sm text-gray-600 flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span>{l.region}</span>
                      {typeof l.quantityKg === "number" && <span>вЂў РљРѕР»РёС‡РµСЃС‚РІРѕ: {l.quantityKg} РєРі</span>}
                      {l.negotiable && <span>вЂў РџР°Р·Р°СЂР»СЉРє: РґР°</span>}
                      {l.postedAt && <span>вЂў {fmtDate(l.postedAt)}</span>}
                      {l.status === "closed" && l.closedAt && <span>вЂў Р—Р°С‚РІРѕСЂРµРЅР°: {fmtDate(l.closedAt)}</span>}
                    </div>
                  </div>

                  {/* Price + CTA */}
                  <div className="text-right flex-shrink-0">
                    <div className="text-lg font-bold">{fmtPrice(l.price, l.priceUnit)}</div>
                    <div className="text-xs text-gray-500">{l.seller?.name}</div>
                    <div className="mt-2 flex justify-end gap-2">
                      <Link href={`/marketplace/${l.id}`} className="rounded-xl border px-3 py-1.5 text-sm hover:bg-gray-50">
                        Р”РµС‚Р°Р№Р»Рё
                      </Link>
                      <button className="rounded-xl bg-yellow-400 hover:bg-yellow-500 px-3 py-1.5 text-sm font-medium">
                        РЎРІСЉСЂР¶Рё СЃРµ
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}

            {filteredListings.length === 0 && (
              <div className="p-6 text-center text-sm text-gray-500">
                РќСЏРјР° СЂРµР·СѓР»С‚Р°С‚Рё РїРѕ РІСЉРІРµРґРµРЅРёСЏ С„РёР»С‚СЉСЂ.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
