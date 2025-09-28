import { NextResponse } from 'next/server';
import { newsSample, type NewsItem, type NewsTopic, type NewsType } from '@/data/news';

function filterNews(params: URLSearchParams): NewsItem[] {
  let arr = [...newsSample];
  const q = params.get('q')?.toLowerCase().trim();
  const topic = params.get('topic') as NewsTopic | null;
  const type = params.get('type') as NewsType | null;
  const sort = params.get('sort'); // 'newest' | 'top'
  const limit = params.get('limit');

  if (q) {
    arr = arr.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.summary.toLowerCase().includes(q) ||
        (n.source ?? '').toLowerCase().includes(q)
    );
  }
  if (topic) arr = arr.filter((n) => n.topic === topic);
  if (type) arr = arr.filter((n) => n.type === type);

  if (sort === 'newest') {
    arr.sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt));
  } else if (sort === 'top') {
    arr.sort((a, b) => (b.views ?? 0) - (a.views ?? 0));
  }

  if (limit) {
    const l = Number(limit);
    if (!Number.isNaN(l) && l > 0) arr = arr.slice(0, l);
  }
  return arr;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const items = filterNews(url.searchParams);
  return NextResponse.json({ items, count: items.length });
}

