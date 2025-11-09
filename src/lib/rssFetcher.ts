import Parser from 'rss-parser';
import type { NewsItem, NewsTopic } from '@/types/news';
import { RSS_SOURCES, type RSSSource } from '@/config/rssSources';

const parser = new Parser({
  customFields: {
    item: [
      ['media:content', 'mediaContent'],
      ['media:thumbnail', 'mediaThumbnail'],
      ['content:encoded', 'contentEncoded'],
    ],
  },
});

// In-memory cache
const cache = new Map<string, { data: NewsItem[]; timestamp: number }>();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

function getCached(key: string): NewsItem[] | null {
  const item = cache.get(key);
  if (!item) return null;
  if (Date.now() - item.timestamp > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  return item.data;
}

function setCache(key: string, data: NewsItem[]) {
  cache.set(key, { data, timestamp: Date.now() });
}

/**
 * Generate consistent ID from RSS item
 */
function generateId(item: Parser.Item, sourceName: string): string {
  const uniqueString = item.guid || item.link || `${sourceName}-${item.title}-${item.pubDate}`;
  return Buffer.from(uniqueString).toString('base64').substring(0, 32);
}

/**
 * Extract summary from RSS item
 */
function extractSummary(item: Parser.Item): string {
  const content = item.contentSnippet || item.content || item.summary || '';
  const cleaned = content.replace(/<[^>]*>/g, ''); // Remove HTML tags
  return cleaned.substring(0, 200).trim() + (cleaned.length > 200 ? '...' : '');
}

/**
 * Extract cover image from RSS item
 */
function extractCover(item: Parser.Item): string | undefined {
  // Try different image sources
  if (item.enclosure?.url && item.enclosure.type?.startsWith('image/')) {
    return item.enclosure.url;
  }
  
  // Media content
  const mediaContent = (item as any).mediaContent;
  if (mediaContent?.$?.url) {
    return mediaContent.$.url;
  }
  
  // Media thumbnail
  const mediaThumbnail = (item as any).mediaThumbnail;
  if (mediaThumbnail?.$?.url) {
    return mediaThumbnail.$.url;
  }
  
  // Try to extract first image from content
  const content = item.content || (item as any).contentEncoded || '';
  const imgMatch = content.match(/<img[^>]+src="([^">]+)"/);
  if (imgMatch) {
    return imgMatch[1];
  }
  
  return undefined;
}

/**
 * Estimate reading time from content
 */
function estimateReadingTime(content: string): number {
  const wordCount = content.split(/\s+/).length;
  const minutes = Math.ceil(wordCount / 200); // Assume 200 words per minute
  return Math.max(1, Math.min(minutes, 15)); // Clamp between 1-15 minutes
}

/**
 * Transform RSS item to NewsItem
 */
function transformRSSItem(
  item: Parser.Item,
  source: RSSSource
): NewsItem | null {
  try {
    const title = item.title?.trim();
    if (!title) {
      console.warn(`Skipping RSS item from ${source.name}: no title`);
      return null;
    }

    const summary = extractSummary(item);
    const cover = extractCover(item);
    const content = item.content || item.contentSnippet || '';
    const readingMinutes = estimateReadingTime(content);

    return {
      id: generateId(item, source.name),
      title,
      summary,
      cover,
      type: source.type === 'youtube' ? 'video' : 'article',
      topic: source.category,
      readingMinutes,
      updatedAt: item.pubDate || item.isoDate || new Date().toISOString(),
      source: source.name,
      views: 0,
      link: item.link, // Link to original article
    };
  } catch (error) {
    console.error(`Failed to transform RSS item from ${source.name}:`, error);
    return null;
  }
}

/**
 * Fetch news from a single RSS source
 */
async function fetchFromSource(source: RSSSource): Promise<NewsItem[]> {
  try {
    console.log(`[RSS] Fetching from ${source.name}...`);
    
    const feed = await parser.parseURL(source.url);

    const items = feed.items
      .map((item) => transformRSSItem(item, source))
      .filter((item): item is NewsItem => item !== null);

    console.log(`[RSS] ✅ Fetched ${items.length} items from ${source.name}`);
    return items;
  } catch (error) {
    console.error(`[RSS] ❌ Failed to fetch from ${source.name}:`, error);
    return [];
  }
}

/**
 * Fetch news from all enabled RSS sources
 */
export async function fetchAllRSS(): Promise<NewsItem[]> {
  // Check cache
  const cached = getCached('all-rss');
  if (cached) {
    console.log('[RSS] 📦 Returning cached RSS data');
    return cached;
  }

  console.log('[RSS] 🔄 Fetching fresh RSS data...');

  // Filter enabled sources
  const enabledSources = RSS_SOURCES.filter((s) => s.enabled);

  if (enabledSources.length === 0) {
    console.warn('[RSS] ⚠️ No enabled RSS sources');
    return [];
  }

  // Fetch from all sources in parallel
  const results = await Promise.allSettled(
    enabledSources.map((source) => fetchFromSource(source))
  );

  // Combine all successful results
  const allItems: NewsItem[] = [];
  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      allItems.push(...result.value);
    } else {
      console.error(`[RSS] Source ${enabledSources[index].name} failed:`, result.reason);
    }
  });

  // Sort by date (newest first)
  allItems.sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt));

  // Cache the results
  setCache('all-rss', allItems);

  console.log(`[RSS] ✅ Total fetched: ${allItems.length} items from ${enabledSources.length} sources`);
  return allItems;
}

/**
 * Fetch news with filters
 */
export async function fetchRSSWithFilters(params: {
  q?: string;
  topic?: NewsTopic;
  type?: string;
  limit?: number;
}): Promise<NewsItem[]> {
  let items = await fetchAllRSS();

  // Apply filters
  if (params.q) {
    const query = params.q.toLowerCase();
    items = items.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.summary.toLowerCase().includes(query) ||
        (item.source || '').toLowerCase().includes(query)
    );
  }

  if (params.topic) {
    items = items.filter((item) => item.topic === params.topic);
  }

  if (params.type) {
    items = items.filter((item) => item.type === params.type);
  }

  if (params.limit) {
    items = items.slice(0, params.limit);
  }

  return items;
}

/**
 * Get a single news item by ID
 */
export async function fetchRSSItemById(id: string): Promise<NewsItem | null> {
  const items = await fetchAllRSS();
  return items.find((item) => item.id === id) || null;
}

/**
 * Clear cache (for admin use or scheduled jobs)
 */
export function clearRSSCache() {
  cache.clear();
  console.log('[RSS] 🗑️ Cache cleared');
}

