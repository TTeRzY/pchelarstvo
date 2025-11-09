# Bulgarian Beekeeping News - RSS Sources Guide

## 🔍 Research Summary

**Finding**: Dedicated Bulgarian beekeeping RSS feeds are **very limited**. Most Bulgarian beekeeping websites don't have native RSS feeds.

**Solution**: We have 3 practical approaches:
1. Use general agricultural news RSS + keyword filtering
2. Create RSS feeds from websites without native RSS (using tools)
3. Mix Bulgarian sources with international beekeeping RSS

---

## 📰 Bulgarian News Sources (General Agricultural)

### 1. **Българска телеграфна агенция (BTA)** ⭐ RECOMMENDED
- **URL**: https://www.bta.bg/
- **RSS**: https://www.bta.bg/rss (check their site for specific feeds)
- **Coverage**: National news agency, covers agriculture and beekeeping occasionally
- **Language**: Bulgarian
- **How to use**: Filter for keywords "пчеларство", "пчели", "мед", "пчелари"

**Example Article**: BTA has published articles like "Agriculture Ministry, beekeeping industry discuss current state of sector"

---

### 2. **AgroTV.bg / Agro.bg**
- **URL**: https://agro.bg/
- **RSS**: Check site for `/feed` or `/rss`
- **Coverage**: Agricultural news, sometimes includes beekeeping
- **Language**: Bulgarian
- **Filtering**: "пчеларство", "пчелин", "мед"

---

### 3. **Dnevnik.bg** (General News)
- **URL**: https://www.dnevnik.bg/
- **RSS**: https://www.dnevnik.bg/rss (multiple categories available)
- **Coverage**: General news, agriculture section
- **Language**: Bulgarian
- **Note**: Low frequency of beekeeping-specific content

---

### 4. **Fermer.bg** (Agricultural Portal)
- **URL**: https://www.fermer.bg/
- **Coverage**: Agricultural news and market prices
- **RSS**: Look for `/feed` or `/rss.xml`
- **Potential**: Good source if they have beekeeping section

---

## 🛠️ **Creating RSS from Non-RSS Sites**

Many Bulgarian beekeeping sites don't have RSS, but we can create feeds using these tools:

### Option 1: **FetchRSS** (RECOMMENDED)
- **URL**: https://fetchrss.com/
- **Free Tier**: 5 feeds, updated every 12 hours
- **How it works**:
  1. Enter website URL
  2. Tool generates RSS feed from HTML
  3. Use generated RSS URL in your app

**Example Sites to Convert**:
- Bulgarian beekeeping forums
- Local apiary associations
- Ministry of Agriculture beekeeping news page

---

### Option 2: **Feed43**
- **URL**: https://feed43.com/
- **Free**: Yes
- **Advanced**: Allows custom HTML parsing rules

---

### Option 3: **Page2RSS**
- **URL**: https://page2rss.com/
- **Simple**: Just enter URL, get RSS

---

## 🌍 International Beekeeping RSS (English)

To supplement Bulgarian sources, use these high-quality international feeds:

### 1. **Bee Culture Magazine** ⭐⭐⭐
```
https://www.beeculture.com/feed/
```
- High-quality articles
- Multiple posts per week
- Professional content

### 2. **Honey Bee Suite**
```
https://honeybeesuite.com/feed/
```
- Educational content
- Active blog

### 3. **American Bee Journal**
```
https://americanbeejournal.com/feed/
```
- Industry news
- Research articles

### 4. **BeeSource Forums**
```
https://www.beesource.com/forums/external.php?type=RSS2
```
- Community discussions
- Practical tips

---

## 🎯 **Recommended Implementation Strategy**

### **Phase 1: Quick Start (2-3 hours)**

Use this mix for immediate results:

```typescript
// src/config/rssSources.ts
export const RSS_SOURCES = [
  // International (reliable, frequent updates)
  {
    name: 'Bee Culture Magazine',
    url: 'https://www.beeculture.com/feed/',
    category: 'Производство',
    language: 'en',
    enabled: true,
  },
  {
    name: 'Honey Bee Suite',
    url: 'https://honeybeesuite.com/feed/',
    category: 'Здраве',
    language: 'en',
    enabled: true,
  },
  
  // Bulgarian (when available)
  {
    name: 'BTA - Селско стопанство',
    url: 'https://www.bta.bg/bg/rss/agriculture', // Check actual RSS URL
    category: 'Пазар',
    language: 'bg',
    enabled: true,
    keywords: ['пчеларство', 'пчели', 'мед', 'пчелари'], // Filter by these
  },
  
  // YouTube (beekeeping channels)
  {
    name: 'YouTube - Beekeeping',
    url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UC...', // Add real channel ID
    category: 'Производство',
    language: 'en',
    type: 'youtube',
    enabled: false, // Enable when you find good Bulgarian channel
  },
];
```

---

### **Phase 2: Add Custom Feeds (1-2 weeks)**

1. **Research Bulgarian Beekeeping Sites**:
   - Bulgarian National Beekeeping Association (БНПС)
   - Regional beekeeping associations
   - Ministry of Agriculture beekeeping section
   - Local forums

2. **Contact Them**:
   - Email asking if they have RSS
   - If not, ask if they plan to add it

3. **Create RSS with FetchRSS**:
   - For sites without native RSS
   - Add to your config

---

### **Phase 3: Smart Filtering (Advanced)**

Create keyword-based filtering to extract beekeeping content from general agricultural RSS:

```typescript
// src/lib/rssFetcher.ts

const BEEKEEPING_KEYWORDS_BG = [
  'пчеларство',
  'пчели',
  'пчелар',
  'пчелари',
  'мед',
  'кошер',
  'кошери',
  'пчелин',
  'пчелна',
  'восък',
  'рояк',
  'майка',
  'вароа',
];

const BEEKEEPING_KEYWORDS_EN = [
  'beekeeping',
  'beekeeper',
  'honey',
  'hive',
  'apiary',
  'colony',
  'queen',
  'varroa',
  'pollination',
];

function isBeekeepingRelated(title: string, content: string, language: 'bg' | 'en'): boolean {
  const text = `${title} ${content}`.toLowerCase();
  const keywords = language === 'bg' ? BEEKEEPING_KEYWORDS_BG : BEEKEEPING_KEYWORDS_EN;
  
  // Article is beekeeping-related if it contains 2+ keywords
  const matches = keywords.filter(keyword => text.includes(keyword)).length;
  return matches >= 2;
}
```

---

## 🚀 **Practical Implementation Guide**

### Step 1: Verify RSS Feeds (30 minutes)

Test each RSS URL manually:

```bash
# Test if RSS feed works
curl "https://www.beeculture.com/feed/"

# Or use online RSS validator
# Visit: https://validator.w3.org/feed/
```

### Step 2: Update RSS Config (15 minutes)

```typescript
// src/config/rssSources.ts
export const RSS_SOURCES: RSSSource[] = [
  {
    name: 'Bee Culture Magazine',
    url: 'https://www.beeculture.com/feed/',
    category: 'Производство',
    language: 'en',
    enabled: true,
  },
  {
    name: 'Honey Bee Suite',
    url: 'https://honeybeesuite.com/feed/',
    category: 'Производство',
    language: 'en',
    enabled: true,
  },
  {
    name: 'BTA България',
    url: 'https://www.bta.bg/bg/rss', // Verify actual URL
    category: 'Пазар',
    language: 'bg',
    enabled: true,
  },
  // Add more as you find them
];
```

### Step 3: Implement Keyword Filtering (1 hour)

```typescript
// src/lib/rssFetcher.ts

function transformRSSItem(item: Parser.Item, source: RSSSource): NewsItem | null {
  // ... existing logic ...

  // If source requires filtering (Bulgarian general news)
  if (source.keywords) {
    const isRelevant = isBeekeepingRelated(
      item.title || '',
      item.contentSnippet || '',
      source.language
    );
    
    if (!isRelevant) {
      return null; // Skip this article
    }
  }

  return {
    id: generateId(item),
    title: item.title || 'Без заглавие',
    summary: extractSummary(item),
    // ... rest of the transformation
  };
}
```

### Step 4: Test & Deploy (30 minutes)

```bash
# Start dev server
npm run dev

# Visit home page
# Check console for RSS fetch logs
# Verify news display correctly
```

---

## 📋 **Tested RSS Feeds (Ready to Use)**

### ✅ **Working International Feeds**:
```
https://www.beeculture.com/feed/
https://honeybeesuite.com/feed/
https://americanbeejournal.com/feed/
```

### ⚠️ **Bulgarian Feeds (Need Verification)**:
```
https://www.bta.bg/bg/rss (check if agriculture category exists)
https://agro.bg/feed (verify if exists)
https://www.fermer.bg/rss (verify if exists)
```

### 🔧 **Feeds to Create (Using FetchRSS)**:
- Bulgarian Ministry of Agriculture beekeeping news
- БНПС (Bulgarian National Beekeeping Association) website
- Local beekeeping forums

---

## 💡 **Alternative: NewsAPI.org**

If RSS feeds are insufficient, use NewsAPI:

```typescript
// src/lib/newsApiClient.ts
const NEWS_API_KEY = process.env.NEWSAPI_KEY;

async function fetchBeekeepingNews() {
  const response = await fetch(
    `https://newsapi.org/v2/everything?` +
    `q=пчеларство OR beekeeping&` +
    `language=bg,en&` +
    `sortBy=publishedAt&` +
    `apiKey=${NEWS_API_KEY}`
  );
  
  return response.json();
}
```

**Pros**:
- Aggregates from many sources
- Supports Bulgarian language
- Easy filtering

**Cons**:
- Requires API key (free tier: 100 requests/day)
- May include irrelevant results

---

## 🎯 **Recommended Starting Mix**

For immediate implementation, use these 5 sources:

1. **Bee Culture** (English, reliable)
2. **Honey Bee Suite** (English, educational)
3. **American Bee Journal** (English, industry news)
4. **BTA RSS** (Bulgarian, filtered for beekeeping)
5. **Custom feed from БНПС** (Bulgarian, via FetchRSS)

This gives you:
- ✅ Regular updates (2-3 articles per day)
- ✅ Mix of Bulgarian and English
- ✅ High-quality content
- ✅ Diverse topics

---

## 🔄 **Next Steps**

### Immediate (This Week):
1. ✅ Verify BTA RSS URL and structure
2. ✅ Test international RSS feeds
3. ✅ Implement basic RSS fetcher
4. ✅ Deploy to home page

### Short-term (Next 2 Weeks):
1. 📧 Contact Bulgarian beekeeping organizations
2. 🛠️ Create RSS from non-RSS sites (FetchRSS)
3. 🔍 Add keyword filtering for Bulgarian sources
4. ✅ Expand to 10+ sources

### Long-term (Next Month):
1. 🤖 Add AI-powered topic classification
2. 📊 Track which articles get most views
3. 🌐 Add more languages (if needed)
4. 💬 Consider community-submitted news

---

## ⚠️ **Important Notes**

1. **Legal**: Verify terms of service for each RSS feed
2. **Attribution**: Always credit original source
3. **Caching**: Cache RSS results (30-60 minutes) to avoid overloading sources
4. **Fallback**: Keep some mock articles as fallback if all RSS fails

---

## 📞 **Need Help?**

If you need assistance with:
- Verifying specific RSS URLs
- Implementing keyword filtering
- Creating custom RSS feeds
- Troubleshooting feed parsing

Just ask! 🐝

