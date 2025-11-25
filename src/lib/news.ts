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
  const data = await get<unknown>(url);
  // Support multiple shapes: {items:[...]}, {items:{data:[...]}}, {data:[...]}, or top-level array
  if (Array.isArray(data)) return data as NewsItem[];
  if (isItemsArray(data)) return data.items;
  if (isNestedItemsArray(data)) return data.items.data;
  if (isDataArray(data)) return data.data;
  return [];
}

type ItemsArray = { items: NewsItem[] };
type NestedItemsArray = { items: { data: NewsItem[] } };
type DataArray = { data: NewsItem[] };

function isItemsArray(payload: unknown): payload is ItemsArray {
  if (typeof payload !== 'object' || payload === null) return false;
  return Array.isArray((payload as ItemsArray).items);
}

function isNestedItemsArray(payload: unknown): payload is NestedItemsArray {
  if (typeof payload !== 'object' || payload === null) return false;
  const candidate = payload as NestedItemsArray;
  return Array.isArray(candidate.items?.data);
}

function isDataArray(payload: unknown): payload is DataArray {
  if (typeof payload !== 'object' || payload === null) return false;
  return Array.isArray((payload as DataArray).data);
}

export async function fetchNewsItem(id: string): Promise<NewsItem | null> {
  try {
    return await get<NewsItem>(`/api/news/${id}`);
  } catch {
    return null;
  }
}
