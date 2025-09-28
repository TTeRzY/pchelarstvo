"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import Hero from "@/components/layout/Hero";
import NewsList from "@/components/news/NewsList";
import Categories from "@/components/categories/Categories";
import ApiariesMapClient, { type Pin as ApiaryPin } from "@/components/map/ApiariesMap";
import PriceChart from "@/components/market/PriceChart";

import { news, categories } from "@/data/sample";
import { calendarMonths, type MonthKey } from "@/data/calendar";
import { demoForecast, type ForecastEntry } from "@/data/forecast";
import { fetchApiaries } from "@/lib/apiaries";
import { fetchListings, type Listing } from "@/lib/listings";
import { useAuth } from "@/context/AuthProvider";
import { useModal } from "@/components/modal/ModalProvider";

type QuickAction = {
  key: string;
  title: string;
  description: string;
  disabled?: boolean;
  tooltip?: string;
  onClick?: () => void;
};

const PRODUCT_OPTIONS = [
  "Акациев мед",
  "Полифлорен мед",
  "Липов мед",
  "Слънчогледов мед",
  "Манов мед",
] as const;

const DEFAULT_PRODUCT = PRODUCT_OPTIONS[0];
const MARKET_DAYS = 30;

function buildSeries(items: Listing[], product: string, days: number) {
  const now = new Date();
  const start = new Date();
  start.setDate(now.getDate() - (days - 1));

  const buckets = new Map<string, number[]>();
  for (const listing of items) {
    if (!listing) continue;
    if (listing.product !== product || listing.status !== "completed") continue;
    const created = listing.createdAt ?? (listing as any).created_at;
    if (!created) continue;
    const date = new Date(created);
    if (Number.isNaN(+date) || date < start || date > now) continue;
    const key = date.toISOString().slice(0, 10);
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key)!.push(Number(listing.pricePerKg));
  }

  const rows: { date: string; min: number; avg: number; max: number }[] = [];
  for (let i = 0; i < days; i += 1) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    const key = date.toISOString().slice(0, 10);
    const values = buckets.get(key);
    if (values && values.length) {
      const min = Math.min(...values);
      const max = Math.max(...values);
      const avg = Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 100) / 100;
      rows.push({ date: date.toISOString(), min, avg, max });
    } else {
      rows.push({ date: date.toISOString(), min: NaN, avg: NaN, max: NaN });
    }
  }

  let previous: { min: number; avg: number; max: number } | undefined;
  for (const row of rows) {
    if (Number.isFinite(row.min) && Number.isFinite(row.avg) && Number.isFinite(row.max)) {
      previous = { min: row.min, avg: row.avg, max: row.max };
    } else if (previous) {
      row.min = previous.min;
      row.avg = previous.avg;
      row.max = previous.max;
    }
  }

  let next: { min: number; avg: number; max: number } | undefined;
  for (let i = rows.length - 1; i >= 0; i -= 1) {
    const row = rows[i];
    if (Number.isFinite(row.min) && Number.isFinite(row.avg) && Number.isFinite(row.max)) {
      next = { min: row.min, avg: row.avg, max: row.max };
    } else if (next) {
      row.min = next.min;
      row.avg = next.avg;
      row.max = next.max;
    }
  }

  return rows.filter((row) => Number.isFinite(row.min) && Number.isFinite(row.avg) && Number.isFinite(row.max));
}

export default function HomePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { open } = useModal();

  const [mapPins, setMapPins] = useState<ApiaryPin[]>([]);
  const [mapLoading, setMapLoading] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);

  const [selectedProduct, setSelectedProduct] = useState<string>(DEFAULT_PRODUCT);
  const [marketListings, setMarketListings] = useState<Listing[]>([]);
  const [marketChartLoading, setMarketChartLoading] = useState(true);
  const [marketChartError, setMarketChartError] = useState<string | null>(null);

  const [forecast, setForecast] = useState<ForecastEntry>(demoForecast);
  const [forecastLoading, setForecastLoading] = useState(true);
  const [forecastError, setForecastError] = useState<string | null>(null);

  const months = useMemo(() => Object.values(calendarMonths), []);
  const initialMonth = months[0]?.key ?? (Object.keys(calendarMonths)[0] as MonthKey);
  const [activeMonth, setActiveMonth] = useState<MonthKey>(initialMonth);
  const activeMonthData = calendarMonths[activeMonth] ?? months[0];

  useEffect(() => {
    let cancelled = false;
    setMapLoading(true);

    fetchApiaries({ limit: 30 })
      .then((items) => {
        if (cancelled) return;
        const pins = (items ?? [])
          .filter(
            (item): item is { id: string; lat: number; lng: number; name: string } =>
              item != null && typeof item.id === "string" && typeof item.lat === "number" && typeof item.lng === "number"
          )
          .map<ApiaryPin>((item) => ({
            id: item.id,
            lat: item.lat,
            lng: item.lng,
            label: item.name,
          }));
        setMapPins(pins);
        setMapError(null);
      })
      .catch(() => {
        if (!cancelled) {
          setMapPins([]);
          setMapError("В момента не успяваме да заредим пчелините. Опитайте отново по-късно.");
        }
      })
      .finally(() => {
        if (!cancelled) setMapLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setMarketChartLoading(true);

    fetchListings()
      .then((items) => {
        if (cancelled) return;
        setMarketListings(items ?? []);
        setMarketChartError(null);
      })
      .catch(() => {
        if (!cancelled) {
          setMarketListings([]);
          setMarketChartError("Пазарните данни не успяха да се заредят.");
        }
      })
      .finally(() => {
        if (!cancelled) setMarketChartLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setForecastLoading(true);

    fetch("/api/forecast")
      .then(async (res) => {
        const payload = await res.json();
        if (cancelled) return;
        if (payload?.forecast) {
          setForecast(payload.forecast as ForecastEntry);
          setForecastError(payload.source === "fallback" ? "Показани са примерни стойности." : null);
        } else {
          setForecast(demoForecast);
          setForecastError("Използваме примерна прогноза.");
        }
      })
      .catch(() => {
        if (!cancelled) {
          setForecast(demoForecast);
          setForecastError("Не успяхме да заредим прогнозата. Показваме примерни данни.");
        }
      })
      .finally(() => {
        if (!cancelled) setForecastLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const marketChartData = useMemo(
    () => buildSeries(marketListings, selectedProduct, MARKET_DAYS),
    [marketListings, selectedProduct]
  );

  function handleSubmitListing() {
    if (user) {
      router.push("/marketplace/new");
      return;
    }
    open("login");
  }

  function handleGoToMap() {
    router.push("/map");
  }

  function handleBuyHoney() {
    router.push("/marketplace");
  }

  function handleReportSwarm() {
    open("reportSwarm");
  }

  const quickActions: QuickAction[] = [
    {
      key: "map",
      title: "Разгледай картата",
      description: "Виж споделените пчелини и добави своя.",
      onClick: handleGoToMap,
    },
    {
      key: "submit",
      title: "Публикувай обява",
      description: "Предложи или потърси продукти, оборудване и услуги.",
      onClick: handleSubmitListing,
    },
    {
      key: "findBeekeeper",
      title: "Намери пчелар",
      description: "Каталогът с контакти е в подготовка.",
      disabled: true,
      tooltip: "Очаквайте скоро",
    },
    {
      key: "buyHoney",
      title: "Пазарувай мед",
      description: "Разгледай последните предложения в пазарната секция.",
      onClick: handleBuyHoney,
    },
    {
      key: "reportSwarm",
      title: "Сигнализирай за рояк",
      description: "Помогни на доброволците да реагират навреме.",
      onClick: handleReportSwarm,
    },
  ];

  return (
    <div className="bg-gray-50">
      <div className="min-h-screen flex flex-col">
        <main className="flex-1">
          <Hero />

          <section className="py-8 border-b bg-white">
            <div className="max-w-[1400px] mx-auto px-6">
              <div className="flex flex-wrap gap-4 justify-between">
                {quickActions.map((action) => (
                  <button
                    key={action.key}
                    type="button"
                    onClick={action.disabled ? undefined : action.onClick}
                    disabled={action.disabled}
                    title={action.tooltip ?? undefined}
                    className={`flex-1 min-w-[160px] rounded-2xl border border-gray-200 shadow-sm p-4 text-left transition ${action.disabled ? "opacity-60 cursor-not-allowed" : "hover:shadow-md"}`}
                  >
                    <div className="font-semibold text-gray-900">{action.title}</div>
                    <div className="text-sm text-gray-600 mt-1">{action.description}</div>
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className="bg-white">
            <div className="max-w-[1400px] mx-auto px-6 py-8 grid grid-cols-12 gap-8">
              <aside className="hidden lg:flex col-span-12 lg:col-span-3 flex-col gap-6 sticky top-6 h-fit">
                <section className="rounded-2xl border border-gray-200 shadow-sm p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">Прогноза и паши</h2>
                    {forecastLoading ? (
                      <span className="rounded-full bg-gray-100 text-gray-500 text-xs font-semibold px-3 py-1">зареждане…</span>
                    ) : (
                      <span className="rounded-full bg-amber-100 text-amber-700 text-xs font-semibold px-3 py-1">
                        {forecast.nectarLevel.toUpperCase()}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">Обобщена информация за района.</p>
                  {forecastError ? (
                    <div className="rounded-xl bg-orange-50 border border-orange-100 px-3 py-2 text-xs text-orange-800">
                      {forecastError}
                    </div>
                  ) : null}
                  {forecastLoading ? (
                    <div className="space-y-2">
                      <div className="h-4 rounded bg-gray-100 animate-pulse" />
                      <div className="h-4 rounded bg-gray-100 animate-pulse" />
                      <div className="h-4 rounded bg-gray-100 animate-pulse" />
                    </div>
                  ) : (
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li>
                        <span className="font-medium">Регион:</span> {forecast.region}
                      </li>
                      <li>
                        <span className="font-medium">Температура:</span> {forecast.temperatureC}°C
                      </li>
                      <li>
                        <span className="font-medium">Вятър:</span> {forecast.wind}
                      </li>
                      <li>
                        <span className="font-medium">Влажност:</span> {forecast.humidity}%
                      </li>
                      <li>
                        <span className="font-medium">Следващи валежи:</span> {forecast.nextRain}
                      </li>
                    </ul>
                  )}
                  {forecast.notes ? (
                    <div className="rounded-xl bg-blue-50 border border-blue-100 px-3 py-2 text-xs text-blue-900">
                      {forecast.notes}
                    </div>
                  ) : null}
                  {/* <button
                    type="button"
                    className="w-full rounded-xl border px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Виж детайлна прогноза
                  </button> */}
                </section>
                <section className="rounded-2xl border border-gray-200 shadow-sm p-5 space-y-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Календар на задачите</h2>
                    <p className="text-sm text-gray-600">Актуални препоръки за грижи през месеца.</p>
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {months.map((month) => (
                      <button
                        key={month.key}
                        type="button"
                        onClick={() => setActiveMonth(month.key)}
                        className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold transition ${activeMonth === month.key ? "bg-gray-900 text-white border-gray-900" : "bg-white hover:bg-gray-50"}`}
                      >
                        {month.title}
                      </button>
                    ))}
                  </div>
                  <div className="space-y-3 text-sm text-gray-700">
                    <div>
                      <h3 className="text-sm uppercase font-semibold text-gray-700">{activeMonthData?.title}</h3>
                      <ul className="mt-2 list-disc list-inside space-y-1">
                        {(activeMonthData?.tasks ?? []).map((task, index) => (
                          <li key={`task-${activeMonthData?.key ?? "month"}-${index}`}>{task}</li>
                        ))}
                      </ul>
                    </div>
                    {activeMonthData?.flow ? (
                      <div>
                        <h3 className="text-sm uppercase font-semibold text-gray-700">Цъфтеж и паша</h3>
                        <p className="mt-1 text-gray-700">{activeMonthData.flow}</p>
                      </div>
                    ) : null}
                    {activeMonthData?.notes ? (
                      <div className="border-t pt-3 text-xs text-gray-500">{activeMonthData.notes}</div>
                    ) : null}
                  </div>
                </section>
              </aside>

              <main className="col-span-12 lg:col-span-6 flex flex-col gap-8">
                <section className="rounded-2xl border border-gray-200 shadow-sm">
                  <div className="p-5 border-b">
                    <div className="flex flex-wrap items-center gap-3">
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900">Цени на пазара</h2>
                        <p className="text-sm text-gray-500">Последни сделки за {MARKET_DAYS} дни</p>
                      </div>
                      <div className="flex items-center gap-2 ml-auto">
                        <label htmlFor="market-product" className="text-sm text-gray-500">
                          Продукт
                        </label>
                        <select
                          id="market-product"
                          value={selectedProduct}
                          onChange={(event) => setSelectedProduct(event.target.value)}
                          className="rounded-xl border px-3 py-2 text-sm bg-white"
                        >
                          {PRODUCT_OPTIONS.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="p-5">
                    {marketChartLoading ? (
                      <div className="h-72 rounded-xl bg-gray-100 animate-pulse" aria-hidden="true" />
                    ) : marketChartError ? (
                      <div className="h-72 rounded-xl border border-amber-200 bg-amber-50 grid place-items-center text-sm text-amber-900">
                        {marketChartError}
                      </div>
                    ) : marketChartData.length === 0 ? (
                      <div className="h-72 rounded-xl border border-dashed border-gray-300 grid place-items-center text-sm text-gray-500">
                        Все още няма завършени сделки за избрания продукт.
                      </div>
                    ) : (
                      <PriceChart data={marketChartData} title={`${selectedProduct} (лв./kg)`} />
                    )}
                  </div>
                </section>

                <section className="rounded-2xl border border-gray-200 shadow-sm">
                  <div className="p-5 border-b">
                    <h2 className="text-xl font-semibold text-gray-900">Новини и полезни материали</h2>
                    <p className="text-sm text-gray-500">Акценти от общността и специализирани статии</p>
                  </div>
                  <div className="p-5">
                    <NewsList items={news} />
                  </div>
                </section>

                <section className="rounded-2xl border border-gray-200 shadow-sm">
                  <div className="p-5 border-b">
                    <h2 className="text-xl font-semibold text-gray-900">Категории и ръководства</h2>
                    <p className="text-sm text-gray-500">Избрани теми за обучение и вдъхновение</p>
                  </div>
                  <div className="p-5">
                    <Categories items={categories} />
                  </div>
                </section>
              </main>

              <aside className="col-span-12 lg:col-span-3 flex flex-col gap-8">
                <section className="rounded-2xl border border-gray-200 shadow-sm p-5">
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">Преглед на картата</h2>
                  {mapLoading ? (
                    <div className="h-80 w-full rounded-xl bg-gray-100 animate-pulse" aria-hidden="true" />
                  ) : mapError ? (
                    <div className="h-80 w-full rounded-xl border border-amber-200 bg-amber-50 grid place-items-center text-sm text-amber-900">
                      {mapError}
                    </div>
                  ) : mapPins.length === 0 ? (
                    <div className="h-80 w-full rounded-xl border border-dashed border-gray-300 grid place-items-center text-sm text-gray-500">
                      Все още няма заредени пчелини.
                    </div>
                  ) : (
                    <ApiariesMapClient pins={mapPins} heightClass="h-80" scrollWheelZoom={false} />
                  )}
                </section>
              </aside>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

