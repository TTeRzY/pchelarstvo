"use client";

import PageShell from "@/components/layout/PageShell";
import { useEffect, useMemo, useState } from "react";
import { fetchNews, type NewsItem } from "@/lib/news";

type NewsType = "article" | "video" | "podcast";
type SortKey = "newest" | "top";

const ALL_TOPICS: string[] = ["Производство", "Здраве", "Регулации", "Пазар", "Общество"];
const TYPES: { key: NewsType; label: string }[] = [
  { key: "article", label: "Статия" },
  { key: "video", label: "Видео" },
  { key: "podcast", label: "Подкаст" },
];

export default function NewsPage() {
  // UI state
  const [q, setQ] = useState("");
  const [topic, setTopic] = useState<string | "Всички">("Всички");
  const [type, setType] = useState<NewsType | "Всички">("Всички");
  const [sort, setSort] = useState<SortKey>("newest");
  const [limit, setLimit] = useState<number>(9);

  // Data
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    setLoading(true);
    fetchNews().then(setItems).finally(() => setLoading(false));
  }, []);

  // Derivations
  const filtered = useMemo(() => {
    let arr = [...items];
    if (q.trim()) {
      const s = q.toLowerCase();
      arr = arr.filter(
        (n) =>
          n.title.toLowerCase().includes(s) ||
          n.summary.toLowerCase().includes(s) ||
          (n.source ?? "").toLowerCase().includes(s)
      );
    }
    if (topic !== "Всички") arr = arr.filter((n) => (n.topic ?? "").toLowerCase() === topic.toLowerCase());
    if (type !== "Всички") arr = arr.filter((n) => n.type === type);
    if (sort === "newest") arr.sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt));
    else if (sort === "top") arr.sort((a, b) => (b.views ?? 0) - (a.views ?? 0));
    return arr;
  }, [items, q, topic, type, sort]);

  const visible = filtered.slice(0, limit);
  const canLoadMore = filtered.length > visible.length;
  const trending = useMemo(
    () => [...items].sort((a, b) => (b.views ?? 0) - (a.views ?? 0)).slice(0, 5),
    [items]
  );

  return (
    <PageShell
      right={
        <aside className="flex flex-col gap-6">
          {/* Trending */}
          <section className="rounded-2xl border p-5 shadow-sm">
            <h2 className="text-lg font-semibold">Тенденции (24ч)</h2>
            <ul className="mt-3 space-y-3 text-sm">
              {trending.map((t, i) => (
                <li key={t.id} className="flex gap-3">
                  <span className="inline-block w-6 text-gray-500">{i + 1}.</span>
                  <a className="hover:underline" href={`/news/${t.id}`}>{t.title}</a>
                </li>
              ))}
            </ul>
          </section>

          {/* Video / Podcast */}
          <section className="rounded-2xl border p-5 shadow-sm">
            <h2 className="text-lg font-semibold">Видео / Подкаст</h2>
            <div className="mt-4 flex flex-col gap-4">
              {items
                .filter((n) => n.type !== "article")
                .slice(0, 3)
                .map((n) => (
                  <a key={n.id} className="rounded-xl border p-3 hover:bg-gray-50" href={`/news/${n.id}`}>
                    <div className="h-28 rounded-lg bg-gray-200" />
                    <div className="mt-2 text-sm font-medium">{n.title}</div>
                    <div className="text-xs text-gray-500">
                      {n.type === "video" ? "Видео" : "Подкаст"} · {n.durationMinutes ?? "—"} мин
                    </div>
                  </a>
                ))}
            </div>
          </section>

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
      {visible.length > 0 && (
        <section className="rounded-2xl border shadow-sm overflow-hidden" id={visible[0].id}>
          <div className="flex flex-col lg:flex-row">
            <div className="w-full lg:w-2/3 h-56 lg:h-auto bg-gray-200" />
            <div className="flex-1 p-6">
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="rounded-lg bg-amber-100 px-2 py-1 text-amber-700">{visible[0].topic}</span>
                <span className="rounded-lg bg-gray-100 px-2 py-1 text-gray-700">
                  {visible[0].type === "article" ? "Статия" : visible[0].type === "video" ? "Видео" : "Подкаст"}
                </span>
              </div>
              <h1 className="mt-3 text-2xl font-bold">{visible[0].title}</h1>
              <p className="mt-2 text-gray-600">{visible[0].summary}</p>
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
      <section className="flex flex-col lg:flex-row gap-6">
        {visible.slice(1, 4).map((n, idx) => (
          <a href={`/news/${n.id}`} key={n.id} id={n.id} className={`rounded-2xl border p-5 shadow-sm hover:shadow-md ${idx === 0 ? "flex-1" : "w-full lg:max-w-[360px]"}`}>
            <div className={`${idx === 0 ? "h-40" : "h-28"} rounded-xl bg-gray-200`} />
            <h3 className="mt-3 text-lg font-semibold">{n.title}</h3>
            <p className="text-sm text-gray-600 mt-1">{n.summary}</p>
            <div className="mt-2 text-xs text-gray-500">
              {n.type === "article" ? `${n.readingMinutes ?? "—"} мин четене` : `${n.durationMinutes ?? "—"} мин`} {n.topic}
            </div>
          </a>
        ))}
      </section>

      {/* STANDARD FEED */}
      <section className="flex flex-wrap gap-6">
        {visible.slice(4).map((n) => (
          <a key={n.id} id={n.id} className="flex-1 min-w-[260px] max-w-[360px] rounded-2xl border p-5 shadow-sm hover:shadow-md" href={`/news/${n.id}`}>
            <div className="h-32 rounded-xl bg-gray-200" />
            <h3 className="mt-3 font-semibold">{n.title}</h3>
            <p className="text-sm text-gray-600 mt-1">{n.summary}</p>
            <div className="mt-2 text-xs text-gray-500">
              {n.type === "article" ? `${n.readingMinutes ?? "—"} мин четене` : `${n.durationMinutes ?? "—"} мин`} {n.topic}
              <span className="mx-1">·</span>
              {new Date(n.updatedAt).toLocaleDateString("bg-BG")}
            </div>
          </a>
        ))}
      </section>

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

