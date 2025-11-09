"use client";

import PageShell from "@/components/layout/PageShell";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { fetchNews } from "@/lib/news";
import type { NewsItem, NewsType, NewsTopic } from "@/types/news";

type SortKey = "newest" | "top";

const ALL_TOPICS: NewsTopic[] = ["Производство", "Здраве", "Регулации", "Пазар", "Общество"];
const TYPES: { key: NewsType; label: string }[] = [
  { key: "article", label: "Статия" },
  { key: "video", label: "Видео" },
  { key: "podcast", label: "Подкаст" },
];

export default function NewsPage() {
  // UI state
  const [q, setQ] = useState("");
  const [topic, setTopic] = useState<NewsTopic | "Всички">("Всички");
  const [type, setType] = useState<NewsType | "Всички">("Всички");
  const [sort, setSort] = useState<SortKey>("newest");
  const [limit, setLimit] = useState<number>(9);

  // Data
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    
    // Build query params for server-side filtering
    const params = new URLSearchParams();
    if (q.trim()) params.set('q', q);
    if (topic !== 'Всички') params.set('topic', topic);
    if (type !== 'Всички') params.set('type', type);
    // Note: API doesn't support 'top' sorting yet, handled client-side for now
    
    fetchNews(params.toString())
      .then((data) => {
        if (!cancelled) {
          setItems(data);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });
    
    return () => {
      cancelled = true;
    };
  }, [q, topic, type]);

  // Client-side sorting only (filtering is now server-side)
  const sorted = useMemo(() => {
    let arr = [...items];
    if (sort === "newest") arr.sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt));
    else if (sort === "top") arr.sort((a, b) => (b.views ?? 0) - (a.views ?? 0));
    return arr;
  }, [items, sort]);

  const visible = sorted.slice(0, limit);
  const canLoadMore = sorted.length > visible.length;
  // Latest articles instead of trending (views not tracked yet)
  const latest = useMemo(
    () => [...items].sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt)).slice(0, 5),
    [items]
  );

  const videosAndPodcasts = useMemo(
    () => items.filter((n) => n.type !== "article").slice(0, 3),
    [items]
  );

  return (
    <PageShell
      right={
        <aside className="flex flex-col gap-6">
          {/* Latest Articles */}
          <section className="rounded-2xl border p-5 shadow-sm">
            <h2 className="text-lg font-semibold">Най-нови материали</h2>
            <ul className="mt-3 space-y-3 text-sm">
              {latest.map((t, i) => (
                <li key={t.id} className="flex gap-3">
                  <span className="inline-block w-6 text-gray-500">{i + 1}.</span>
                  <Link 
                    className="hover:underline" 
                    href={t.link || `/news/${t.id}`}
                    target={t.link ? '_blank' : undefined}
                    rel={t.link ? 'noopener noreferrer' : undefined}
                  >
                    {t.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          {/* Video / Podcast - Only show if there are any */}
          {videosAndPodcasts.length > 0 && (
            <section className="rounded-2xl border p-5 shadow-sm">
              <h2 className="text-lg font-semibold">Видео / Подкаст</h2>
              <div className="mt-4 flex flex-col gap-4">
                {videosAndPodcasts.map((n) => (
                  <Link 
                    key={n.id} 
                    className="rounded-xl border p-3 hover:bg-gray-50 block"
                    href={n.link || `/news/${n.id}`}
                    target={n.link ? '_blank' : undefined}
                    rel={n.link ? 'noopener noreferrer' : undefined}
                  >
                    {n.cover ? (
                      <div 
                        className="h-28 rounded-lg bg-cover bg-center" 
                        style={{ backgroundImage: `url(${n.cover})` }}
                      />
                    ) : (
                      <div className="h-28 rounded-lg bg-gray-200 flex items-center justify-center">
                        <span className="text-4xl">{n.type === 'video' ? '🎥' : '🎙️'}</span>
                      </div>
                    )}
                    <div className="mt-2 text-sm font-medium">{n.title}</div>
                    <div className="text-xs text-gray-500">
                      {n.type === "video" ? "Видео" : "Подкаст"} · {n.durationMinutes ?? "—"} мин
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Newsletter */}
          <section className="rounded-2xl border p-5 shadow-sm">
            <h2 className="text-lg font-semibold">Бюлетин</h2>
            <p className="text-sm text-gray-600 mt-1">Абонирайте се за новини и анализи.</p>
            <form className="mt-4 flex gap-2">
              <input className="flex-1 rounded-xl border px-3 py-2 text-sm" placeholder="you@example.com" />
              <button className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-amber-400">Абонирай се</button>
            </form>
          </section>
        </aside>
      }
    >
      {/* HERO FEATURED */}
      {loading ? (
        <section className="rounded-2xl border shadow-sm overflow-hidden">
          <div className="flex flex-col lg:flex-row animate-pulse">
            <div className="w-full lg:w-2/3 h-56 lg:h-96 bg-gray-200" />
            <div className="flex-1 p-6 space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/4" />
              <div className="h-8 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-2/3" />
            </div>
          </div>
        </section>
      ) : visible.length > 0 ? (
        <Link
          href={visible[0].link || `/news/${visible[0].id}`}
          target={visible[0].link ? '_blank' : undefined}
          rel={visible[0].link ? 'noopener noreferrer' : undefined}
          className="block group"
        >
          <section className="rounded-2xl border shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            <div className="flex flex-col lg:flex-row">
              {visible[0].cover ? (
                <div 
                  className="w-full lg:w-2/3 h-56 lg:h-96 bg-cover bg-center" 
                  style={{ backgroundImage: `url(${visible[0].cover})` }}
                />
              ) : (
                <div className="w-full lg:w-2/3 h-56 lg:h-96 bg-gray-200 flex items-center justify-center">
                  <span className="text-6xl">📰</span>
                </div>
              )}
              <div className="flex-1 p-6">
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="rounded-lg bg-amber-100 px-2 py-1 text-amber-700">{visible[0].topic}</span>
                  <span className="rounded-lg bg-gray-100 px-2 py-1 text-gray-700">
                    {visible[0].type === "article" ? "Статия" : visible[0].type === "video" ? "Видео" : "Подкаст"}
                  </span>
                  {visible[0].language === 'en' && (
                    <span className="rounded-lg bg-blue-50 px-2 py-1 text-blue-700 border border-blue-100">
                      🇬🇧 EN
                    </span>
                  )}
                </div>
                <h1 className="mt-3 text-2xl font-bold group-hover:text-amber-600 transition-colors">{visible[0].title}</h1>
                <p className="mt-2 text-gray-600 line-clamp-3">{visible[0].summary}</p>
                <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-gray-500">
                  {visible[0].type === "article" && <span>{visible[0].readingMinutes ?? "—"} мин четене</span>}
                  {visible[0].type !== "article" && <span>{visible[0].durationMinutes ?? "—"} мин</span>}
                  <span>·</span>
                  <span>Обновено: {new Date(visible[0].updatedAt).toLocaleDateString("bg-BG")}</span>
                  {visible[0].source && (
                    <>
                      <span>·</span>
                      <span>Източник: {visible[0].source}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </section>
        </Link>
      ) : (
        <section className="rounded-2xl border shadow-sm p-12 text-center">
          <p className="text-gray-500">Няма налични новини в момента.</p>
        </section>
      )}

      {/* QUICK FILTERS */}
      <section className="rounded-2xl border p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="flex items-center gap-2">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Търси заглавия, теми, източник"
              className="w-64 max-w-full rounded-xl border px-3 py-2 text-sm"
            />
          </div>

          {/* Topics */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500">Теми:</span>
            <button
              onClick={() => setTopic("Всички")}
              className={`rounded-xl border px-3 py-1 text-sm hover:bg-gray-50 ${topic === "Всички" ? "bg-gray-100" : ""}`}
            >
              Всички
            </button>
            {ALL_TOPICS.map((t) => (
              <button
                key={t}
                onClick={() => setTopic(t)}
                className={`rounded-xl border px-3 py-1 text-sm hover:bg-gray-50 ${topic === t ? "bg-gray-100" : ""}`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Types */}
          <div className="flex items-center gap-2 text-sm ml-auto">
            <span className="text-gray-500">Вид:</span>
            <button
              onClick={() => setType("Всички")}
              className={`rounded-xl border px-3 py-1 text-sm hover:bg-gray-50 ${type === "Всички" ? "bg-gray-100" : ""}`}
            >
              Всички
            </button>
            {TYPES.map((t) => (
              <button
                key={t.key}
                onClick={() => setType(t.key)}
                className={`rounded-xl border px-3 py-1 text-sm hover:bg-gray-50 ${type === t.key ? "bg-gray-100" : ""}`}
              >
                {t.label}
              </button>
            ))}
            <div className="w-px h-6 bg-gray-200" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="rounded-xl border px-3 py-1 text-sm"
            >
              <option value="newest">Най-нови</option>
              <option value="top">Топ</option>
            </select>
          </div>
        </div>
      </section>

      {/* FIRST ROW */}
      {!loading && visible.length > 1 && (
        <section className="flex flex-col lg:flex-row gap-6">
          {visible.slice(1, 4).map((n, idx) => (
            <Link 
              href={n.link || `/news/${n.id}`}
              target={n.link ? '_blank' : undefined}
              rel={n.link ? 'noopener noreferrer' : undefined}
              key={n.id} 
              className={`group rounded-2xl border p-5 shadow-sm hover:shadow-md transition-shadow ${idx === 0 ? "flex-1" : "w-full lg:max-w-[360px]"}`}
            >
              {n.cover ? (
                <div 
                  className={`${idx === 0 ? "h-40" : "h-28"} rounded-xl bg-cover bg-center`}
                  style={{ backgroundImage: `url(${n.cover})` }}
                />
              ) : (
                <div className={`${idx === 0 ? "h-40" : "h-28"} rounded-xl bg-gray-200 flex items-center justify-center`}>
                  <span className={idx === 0 ? "text-4xl" : "text-3xl"}>📰</span>
                </div>
              )}
              <div className="flex items-start justify-between gap-2 mt-3">
                <h3 className="text-lg font-semibold group-hover:text-amber-600 transition-colors flex-1">{n.title}</h3>
                {n.language === 'en' && (
                  <span className="shrink-0 text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-100">
                    🇬🇧 EN
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{n.summary}</p>
              <div className="mt-2 text-xs text-gray-500">
                {n.type === "article" ? `${n.readingMinutes ?? "—"} мин четене` : `${n.durationMinutes ?? "—"} мин`} · {n.topic}
              </div>
            </Link>
          ))}
        </section>
      )}

      {/* STANDARD FEED */}
      {!loading && visible.length > 4 && (
        <section className="flex flex-wrap gap-6">
          {visible.slice(4).map((n) => (
            <Link 
              key={n.id}
              href={n.link || `/news/${n.id}`}
              target={n.link ? '_blank' : undefined}
              rel={n.link ? 'noopener noreferrer' : undefined}
              className="group flex-1 min-w-[260px] max-w-[360px] rounded-2xl border p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              {n.cover ? (
                <div 
                  className="h-32 rounded-xl bg-cover bg-center" 
                  style={{ backgroundImage: `url(${n.cover})` }}
                />
              ) : (
                <div className="h-32 rounded-xl bg-gray-200 flex items-center justify-center">
                  <span className="text-3xl">📰</span>
                </div>
              )}
              <div className="flex items-start justify-between gap-2 mt-3">
                <h3 className="font-semibold group-hover:text-amber-600 transition-colors flex-1">{n.title}</h3>
                {n.language === 'en' && (
                  <span className="shrink-0 text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-100">
                    🇬🇧 EN
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{n.summary}</p>
              <div className="mt-2 text-xs text-gray-500">
                {n.type === "article" ? `${n.readingMinutes ?? "—"} мин четене` : `${n.durationMinutes ?? "—"} мин`} · {n.topic}
                <span className="mx-1">·</span>
                {new Date(n.updatedAt).toLocaleDateString("bg-BG")}
              </div>
            </Link>
          ))}
        </section>
      )}

      {/* LOAD MORE */}
      {canLoadMore && (
        <div className="flex justify-center">
          <button onClick={() => setLimit((x) => x + 9)} className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50">
            Зареди още
          </button>
        </div>
      )}
    </PageShell>
  );
}

