// app/news/page.tsx
"use client";

import PageShell from "@/components/layout/PageShell";
import { useMemo, useState } from "react";
import { newsSample, type NewsItem, type NewsTopic, type NewsType } from "@/data/news";

type SortKey = "newest" | "top"; // РјРѕР¶Рµ РґР° РґРѕР±Р°РІРёРј "recommended" РїРѕ-РєСЉСЃРЅРѕ

const ALL_TOPICS: NewsTopic[] = ["РџСЂР°РєС‚РёРєРё", "Р‘РѕР»РµСЃС‚Рё", "Р РµРіСѓР»Р°С†РёРё", "РџР°Р·Р°СЂ", "РЎРµР·РѕРЅ"];
const TYPES: { key: NewsType; label: string }[] = [
  { key: "article", label: "РЎС‚Р°С‚РёРё" },
  { key: "video", label: "Р’РёРґРµРѕ" },
  { key: "podcast", label: "РџРѕРґРєР°СЃС‚Рё" },
];

export default function NewsPage() {
  // UI state
  const [q, setQ] = useState("");
  const [topic, setTopic] = useState<NewsTopic | "Р’СЃРёС‡РєРё">("Р’СЃРёС‡РєРё");
  const [type, setType] = useState<NewsType | "Р’СЃРёС‡РєРё">("Р’СЃРёС‡РєРё");
  const [sort, setSort] = useState<SortKey>("newest");
  const [limit, setLimit] = useState<number>(9); // "load more" СЃС‚СЉРїРєР°

  // Derivations
  const filtered = useMemo(() => {
    let arr = [...newsSample];

    if (q.trim()) {
      const s = q.toLowerCase();
      arr = arr.filter(
        (n) =>
          n.title.toLowerCase().includes(s) ||
          n.summary.toLowerCase().includes(s) ||
          (n.source ?? "").toLowerCase().includes(s)
      );
    }
    if (topic !== "Р’СЃРёС‡РєРё") arr = arr.filter((n) => n.topic === topic);
    if (type !== "Р’СЃРёС‡РєРё") arr = arr.filter((n) => n.type === type);

    if (sort === "newest") {
      arr.sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt));
    } else if (sort === "top") {
      arr.sort((a, b) => (b.views ?? 0) - (a.views ?? 0));
    }

    return arr;
  }, [q, topic, type, sort]);

  const visible = filtered.slice(0, limit);
  const canLoadMore = filtered.length > visible.length;

  const trending = useMemo(
    () => [...newsSample].sort((a, b) => (b.views ?? 0) - (a.views ?? 0)).slice(0, 5),
    []
  );

  return (
    <PageShell
      right={
        <aside className="flex flex-col gap-6">
          {/* Trending */}
          <section className="rounded-2xl border p-5 shadow-sm">
            <h2 className="text-lg font-semibold">РўРµРЅРґРµРЅС†РёРё (24С‡)</h2>
            <ul className="mt-3 space-y-3 text-sm">
              {trending.map((t, i) => (
                <li key={t.id} className="flex gap-3">
                  <span className="inline-block w-6 text-gray-500">{i + 1}.</span>
                  <a className="hover:underline" href={`/news/${t.id}`}>{t.title}</a>
                </li>
              ))}
            </ul>
          </section>

          {/* Video / Podcast (Р±СЉСЂР·Рё РїР»РѕС‡РєРё РѕС‚ С„РёР»С‚СЂРёСЂР°РЅРёСЏ СЂРµР·СѓР»С‚Р°С‚) */}
          <section className="rounded-2xl border p-5 shadow-sm">
            <h2 className="text-lg font-semibold">Р’РёРґРµРѕ / РџРѕРґРєР°СЃС‚</h2>
            <div className="mt-4 flex flex-col gap-4">
              {newsSample
                .filter((n) => n.type !== "article")
                .slice(0, 3)
                .map((n) => (
                  <a key={n.id} className="rounded-xl border p-3 hover:bg-gray-50" href={`/news/${n.id}`}>
                    <div className="h-28 rounded-lg bg-gray-200" />
                    <div className="mt-2 text-sm font-medium">{n.title}</div>
                    <div className="text-xs text-gray-500">
                      {n.type === "video" ? "Р’РёРґРµРѕ" : "РџРѕРґРєР°СЃС‚"} вЂў {n.durationMinutes ?? "вЂ”"} РјРёРЅ
                    </div>
                  </a>
                ))}
            </div>
          </section>

          {/* Newsletter */}
          <section className="rounded-2xl border p-5 shadow-sm">
            <h2 className="text-lg font-semibold">Р‘СЋР»РµС‚РёРЅ</h2>
            <p className="text-sm text-gray-600 mt-1">РљСЂР°С‚РєРё СЂРµР·СЋРјРµС‚Р° Рё СЃСЉРІРµС‚Рё вЂ” РІРµРґРЅСЉР¶ СЃРµРґРјРёС‡РЅРѕ.</p>
            <form className="mt-4 flex gap-2">
              <input className="flex-1 rounded-xl border px-3 py-2 text-sm" placeholder="you@example.com" />
              <button className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-amber-400">Р—Р°РїРёС€Рё РјРµ</button>
            </form>
          </section>
        </aside>
      }
    >
      {/* HERO FEATURED = РїСЉСЂРІРёСЏС‚ РµР»РµРјРµРЅС‚ РѕС‚ СЃРѕСЂС‚РёСЂР°РЅРёСЏ РјР°СЃРёРІ РїРѕ С‚РµРєСѓС‰РёСЏ sort/filters */}
      {visible.length > 0 && (
        <section className="rounded-2xl border shadow-sm overflow-hidden" id={visible[0].id}>
          <div className="flex flex-col lg:flex-row">
            <div className="w-full lg:w-2/3 h-56 lg:h-auto bg-gray-200" />
            <div className="flex-1 p-6">
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="rounded-lg bg-amber-100 px-2 py-1 text-amber-700">{visible[0].topic}</span>
                <span className="rounded-lg bg-gray-100 px-2 py-1 text-gray-700">
                  {visible[0].type === "article" ? "РЎС‚Р°С‚РёСЏ" : visible[0].type === "video" ? "Р’РёРґРµРѕ" : "РџРѕРґРєР°СЃС‚"}
                </span>
              </div>
              <h1 className="mt-3 text-2xl font-bold">{visible[0].title}</h1>
              <p className="mt-2 text-gray-600">{visible[0].summary}</p>
              <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-gray-500">
                {visible[0].type === "article" && <span>{visible[0].readingMinutes ?? "вЂ”"} РјРёРЅ С‡РµС‚РёРІРѕ</span>}
                {visible[0].type !== "article" && <span>{visible[0].durationMinutes ?? "вЂ”"} РјРёРЅ</span>}
                <span>вЂў</span>
                <span>РћР±РЅРѕРІРµРЅРѕ: {new Date(visible[0].updatedAt).toLocaleDateString("bg-BG")}</span>
                {visible[0].source && (
                  <>
                    <span>вЂў</span>
                    <span>РР·С‚РѕС‡РЅРёРє: {visible[0].source}</span>
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
              placeholder="РўСЉСЂСЃРё Р·Р°РіР»Р°РІРёРµ, СЂРµР·СЋРјРµ, РёР·С‚РѕС‡РЅРёРєвЂ¦"
              className="w-64 max-w-full rounded-xl border px-3 py-2 text-sm"
            />
          </div>

          {/* Topics */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500">РўРµРјР°:</span>
            <button
              onClick={() => setTopic("Р’СЃРёС‡РєРё")}
              className={`rounded-xl border px-3 py-1 text-sm hover:bg-gray-50 ${topic === "Р’СЃРёС‡РєРё" ? "bg-gray-100" : ""}`}
            >
              Р’СЃРёС‡РєРё
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
            <span className="text-gray-500">РўРёРї:</span>
            <button
              onClick={() => setType("Р’СЃРёС‡РєРё")}
              className={`rounded-xl border px-3 py-1 text-sm hover:bg-gray-50 ${type === "Р’СЃРёС‡РєРё" ? "bg-gray-100" : ""}`}
            >
              Р’СЃРёС‡РєРё
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
              <option value="newest">РќР°Р№-РЅРѕРІРё</option>
              <option value="top">РўРѕРї</option>
            </select>
          </div>
        </div>
      </section>

      {/* FIRST ROW: 1 large + 2 medium (РёР·РєР»СЋС‡РІР°РјРµ РІРµС‡Рµ РїРѕРєР°Р·Р°РЅРёСЏ HERO) */}
      <section className="flex flex-col lg:flex-row gap-6">
        {visible.slice(1, 4).map((n, idx) => (
          <a href={`/news/${n.id}`} key={n.id} id={n.id} className={`rounded-2xl border p-5 shadow-sm hover:shadow-md ${idx === 0 ? "flex-1" : "w-full lg:max-w-[360px]"}`}>
            <div className={`${idx === 0 ? "h-40" : "h-28"} rounded-xl bg-gray-200`} />
            <h3 className="mt-3 text-lg font-semibold">{n.title}</h3>
            <p className="text-sm text-gray-600 mt-1">{n.summary}</p>
            <div className="mt-2 text-xs text-gray-500">
              {n.type === "article" ? `${n.readingMinutes ?? "вЂ”"} РјРёРЅ вЂў` : `${n.durationMinutes ?? "вЂ”"} РјРёРЅ вЂў`} {n.topic}
            </div>
          </a>
        ))}
      </section>

      {/* STANDARD FEED */}
      <section className="flex flex-wrap gap-6">
        {visible.slice(4).map((n) => (
          <a key={n.id} id={n.id} className="flex-1 min-w-[260px] max-w-[360px] rounded-2xl border p-5 shadow-sm hover:shadow-md">
            <div className="h-32 rounded-xl bg-gray-200" />
            <h3 className="mt-3 font-semibold">{n.title}</h3>
            <p className="text-sm text-gray-600 mt-1">{n.summary}</p>
            <div className="mt-2 text-xs text-gray-500">
              {n.type === "article" ? `${n.readingMinutes ?? "вЂ”"} РјРёРЅ вЂў` : `${n.durationMinutes ?? "вЂ”"} РјРёРЅ вЂў`} {n.topic}
              <span className="mx-1">вЂў</span>
              {new Date(n.updatedAt).toLocaleDateString("bg-BG")}
            </div>
          </a>
        ))}
      </section>

      {/* LOAD MORE */}
      {canLoadMore && (
        <div className="flex justify-center">
          <button
            onClick={() => setLimit((x) => x + 9)}
            className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50"
          >
            Р—Р°СЂРµРґРё РѕС‰Рµ
          </button>
        </div>
      )}
    </PageShell>
  );
}
