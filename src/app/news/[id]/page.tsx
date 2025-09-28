import { notFound } from "next/navigation";
import PageShell from "@/components/layout/PageShell";
import Link from "next/link";
import { fetchNews, fetchNewsItem, type NewsItem } from "@/lib/news";

function formatMeta(n: NewsItem) {
  const date = new Date(n.updatedAt).toLocaleDateString("bg-BG");
  const length = n.type === "article" ? `${n.readingMinutes ?? "—"} мин четене` : `${n.durationMinutes ?? "—"} мин ${n.type === "video" ? "видео" : "подкаст"}`;
  return { date, length, kind: n.type === "article" ? "Статия" : n.type === "video" ? "Видео" : "Подкаст" };
}

export default async function NewsDetailPage({ params }: { params: { id: string } }) {
  const item = await fetchNewsItem(params.id);
  if (!item) return notFound();

  const meta = formatMeta(item);
  const all = await fetchNews();
  const related = all.filter((n) => n.id !== item.id && n.topic === item.topic).slice(0, 5);
  const latest = [...all].sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt)).slice(0, 5);

  return (
    <PageShell
      right={
        <aside className="flex flex-col gap-6">
          {/* Related by topic */}
          <section className="rounded-2xl border p-5 shadow-sm">
            <h2 className="text-lg font-semibold">Още по темата: {item.topic}</h2>
            <ul className="mt-3 space-y-3 text-sm">
              {related.map((r) => (
                <li key={r.id}>
                  <Link className="hover:underline" href={`/news/${r.id}`}>{r.title}</Link>
                  <div className="text-xs text-gray-500">{new Date(r.updatedAt).toLocaleDateString("bg-BG")}</div>
                </li>
              ))}
              {related.length === 0 && <li className="text-sm text-gray-500">Няма свързани материали.</li>}
            </ul>
          </section>

          {/* Latest */}
          <section className="rounded-2xl border p-5 shadow-sm">
            <h2 className="text-lg font-semibold">Най-нови</h2>
            <ul className="mt-3 space-y-3 text-sm">
              {latest.slice(0, 5).map((r) => (
                <li key={r.id}>
                  <Link className="hover:underline" href={`/news/${r.id}`}>{r.title}</Link>
                </li>
              ))}
            </ul>
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
      {/* Breadcrumbs */}
      <nav className="text-sm text-gray-500">
        <Link href="/news" className="hover:underline">Новини</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-700">{item.topic}</span>
      </nav>

      {/* Header */}
      <header>
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <span className="rounded-lg bg-amber-100 px-2 py-1 text-amber-700">{item.topic}</span>
          <span className="rounded-lg bg-gray-100 px-2 py-1 text-gray-700">{meta.kind}</span>
        </div>
        <h1 className="mt-3 text-3xl font-bold leading-tight">{item.title}</h1>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-gray-500">
          <span>{meta.length}</span>
          <span>·</span>
          <span>Обновено: {meta.date}</span>
          {item.source && (
            <>
              <span>·</span>
              <span>Източник: {item.source}</span>
            </>
          )}
        </div>
      </header>

      {/* Cover */}
      {item.cover && (
        <div className="mt-6 h-64 md:h-80 rounded-2xl bg-gray-200 overflow-hidden">
          <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${item.cover})` }} role="img" aria-label={item.title} />
        </div>
      )}

      {/* Body (placeholder) */}
      <article className="prose max-w-none mt-6 prose-p:leading-relaxed prose-headings:scroll-mt-24">
        <p>
          Тук ще бъде съдържанието на публикацията. Текстът е примерен и може да бъде заменен с реални данни от CMS
          или Markdown източник, когато интеграцията е готова.
        </p>
        <h2>Акцент</h2>
        <ul>
          <li>Важен извод от съдържанието</li>
          <li>Ключов показател или статистика</li>
          <li>Практически съвет</li>
        </ul>
        <p>
          Още текст, който разработва темата и дава контекст. При нужда можем да изведем съдържанието динамично от
          бекенда или отделен CMS.
        </p>
      </article>

      {/* Share / actions */}
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <button className="rounded-xl border px-3 py-2 text-sm hover:bg-gray-50">Сподели</button>
        <button className="rounded-xl border px-3 py-2 text-sm hover:bg-gray-50">Запази</button>
        <Link href="/news" className="rounded-2xl border px-3 py-2 text-sm hover:bg-gray-50">Обратно към новини</Link>
      </div>
    </PageShell>
  );
}

