export type NewsType = "article" | "video" | "podcast";
export type NewsItem = {
  id: string;
  title: string;
  summary: string;
  cover?: string;
  type: NewsType;
  topic?: string;
  readingMinutes?: number;
  durationMinutes?: number;
  updatedAt: string;
  source?: string;
  views?: number;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "";

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { cache: "no-store" });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<T>;
}

export async function fetchNews(queryString?: string): Promise<NewsItem[]> {
  const url = queryString ? `/api/news?${queryString}` : '/api/news';
  const data = await get<any>(url);
  // Support multiple shapes: {items:[...]}, {items:{data:[...]}}, {data:[...]}, or top-level array
  if (Array.isArray(data)) return data as NewsItem[];
  if (Array.isArray(data.items)) return data.items as NewsItem[];
  if (data.items && Array.isArray(data.items.data)) return data.items.data as NewsItem[];
  if (Array.isArray(data.data)) return data.data as NewsItem[];
  return [];
}

export async function fetchNewsItem(id: string): Promise<NewsItem | null> {
  try {
    return await get<NewsItem>(`/api/news/${id}`);
  } catch {
    return null;
  }
}
