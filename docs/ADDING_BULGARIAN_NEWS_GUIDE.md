# Adding Bulgarian News Sources - Quick Guide

## 📍 Current Status

✅ RSS integration is live with 3 international sources (English)  
🔄 Bulgarian sources: To be added when found/verified  
📝 Translation: Not implemented (keeping original English)  

---

## 🎯 How to Add Bulgarian Sources

### Step 1: Find Bulgarian RSS Feeds

#### Option A: Check Existing Sites
Try these URLs on Bulgarian beekeeping sites:
- `https://site.bg/feed`
- `https://site.bg/rss`
- `https://site.bg/rss.xml`
- `https://site.bg/feed.xml`

**How to verify**:
1. Paste URL in browser
2. Should see XML content with `<rss>` or `<feed>` tags
3. Or use: https://validator.w3.org/feed/

#### Option B: Create RSS from Non-RSS Sites
If site doesn't have RSS:
1. Go to https://fetchrss.com/ (free tier: 5 feeds)
2. Enter website URL
3. Tool generates RSS feed URL
4. Use generated URL in config

### Step 2: Add to Configuration

Edit `src/config/rssSources.ts`:

```typescript
export const RSS_SOURCES: RSSSource[] = [
  // ... existing sources ...
  
  // Add new Bulgarian source
  {
    name: 'БНПС - Новини',
    url: 'https://bnps.bg/feed', // Replace with real URL
    category: 'Производство',
    language: 'bg',
    type: 'rss',
    enabled: true,
  },
];
```

### Step 3: Test

```bash
# Restart dev server
npm run dev

# Visit homepage
# Check browser console for:
# [RSS] ✅ Fetched X items from БНПС - Новини
```

---

## 📋 Bulgarian Sources to Research

### 🔍 Potential Sources:

1. **Bulgarian National Beekeeping Association (БНПС)**
   - Website: Check if exists
   - Look for news/blog section
   - Try: `/feed`, `/rss`, `/news/feed`

2. **Ministry of Agriculture - Beekeeping Section**
   - Government agriculture news
   - May cover beekeeping topics
   - Contact them for RSS or use FetchRSS

3. **AgroTV / Agro.bg**
   - Agricultural news portal
   - URL: https://agro.bg/
   - Check for: https://agro.bg/feed or https://agro.bg/rss
   - Filter for beekeeping keywords

4. **BTA (Bulgarian Telegraph Agency)**
   - General news with agriculture section
   - URL: https://www.bta.bg/
   - RSS: Check https://www.bta.bg/rss
   - Use keyword filtering: "пчеларство", "пчели", "мед"

5. **Fermer.bg**
   - Agricultural marketplace/news
   - URL: https://www.fermer.bg/
   - Check for RSS feed

6. **Local Beekeeping Forums**
   - Search Google: "български пчеларски форум"
   - Many forums have RSS for latest posts
   - Use FetchRSS if needed

### 📧 Contact Strategy:

**Email Template** (Bulgarian):
```
Тема: Заявка за RSS емисия

Здравейте,

Работим по портал за пчеларство (pchelarstvo.bg) и бихме искали да 
интегрираме вашите новини за пчеларство. Имате ли RSS емисия за 
новини или блог публикации?

Благодаря предварително!
```

---

## 🛠️ Using FetchRSS for Sites Without RSS

### For: Sites without native RSS feed

**Steps**:

1. **Sign up**: https://fetchrss.com/
   - Free tier: 5 feeds
   - Updates: Every 12 hours

2. **Create Feed**:
   - Click "Create New Feed"
   - Enter website URL
   - Tool auto-detects articles
   - Adjust selectors if needed
   - Click "Generate Feed"

3. **Get RSS URL**:
   - Copy generated RSS URL
   - Format: `https://fetchrss.com/rss/xxxxx.xml`

4. **Add to Config**:
   ```typescript
   {
     name: 'Site Name (via FetchRSS)',
     url: 'https://fetchrss.com/rss/xxxxx.xml',
     category: 'Производство',
     language: 'bg',
     type: 'rss',
     enabled: true,
   }
   ```

---

## 🔍 Keyword Filtering (For General News)

If adding general agricultural news (like BTA), filter for beekeeping:

```typescript
{
  name: 'BTA - Селско стопанство',
  url: 'https://www.bta.bg/bg/rss/agriculture',
  category: 'Пазар',
  language: 'bg',
  type: 'rss',
  enabled: true,
  keywords: ['пчеларство', 'пчели', 'мед', 'пчелари', 'кошер', 'пчелин'],
}
```

Then update `rssFetcher.ts` to filter:

```typescript
function transformRSSItem(item: Parser.Item, source: RSSSource): NewsItem | null {
  // ... existing logic ...

  // If source has keywords, check if article matches
  if (source.keywords && source.keywords.length > 0) {
    const text = `${item.title} ${item.contentSnippet || ''}`.toLowerCase();
    const matches = source.keywords.filter(kw => text.includes(kw.toLowerCase()));
    
    if (matches.length === 0) {
      return null; // Skip this article - not about beekeeping
    }
  }

  return newsItem;
}
```

---

## 📊 Recommended Mix

### Ideal Setup:

```typescript
export const RSS_SOURCES: RSSSource[] = [
  // International (English) - Keep these
  {
    name: 'Bee Culture Magazine',
    url: 'https://www.beeculture.com/feed/',
    category: 'Производство',
    language: 'en',
    type: 'rss',
    enabled: true,
  },
  {
    name: 'Honey Bee Suite',
    url: 'https://honeybeesuite.com/feed/',
    category: 'Здраве',
    language: 'en',
    type: 'rss',
    enabled: true,
  },
  
  // Bulgarian sources (when found)
  {
    name: 'БНПС Новини',
    url: 'TBD - when verified',
    category: 'Общество',
    language: 'bg',
    type: 'rss',
    enabled: false, // Enable when URL is verified
  },
  {
    name: 'BTA - Пчеларство',
    url: 'https://www.bta.bg/bg/rss',
    category: 'Пазар',
    language: 'bg',
    type: 'rss',
    enabled: false,
    keywords: ['пчеларство', 'пчели', 'мед'],
  },
];
```

**Target**: 2-3 Bulgarian + 2-3 International = 5-6 total sources

---

## ✅ Checklist for Adding New Source

- [ ] Find RSS URL or create with FetchRSS
- [ ] Verify RSS is valid (paste in browser or validator)
- [ ] Add to `src/config/rssSources.ts`
- [ ] Set correct `language: 'bg'`
- [ ] Choose appropriate `category`
- [ ] Set `enabled: true`
- [ ] Restart dev server
- [ ] Check console for `[RSS] ✅ Fetched X items from [Source Name]`
- [ ] Visit homepage, verify news display
- [ ] Check if articles are relevant
- [ ] Adjust keywords if needed (for general news sources)

---

## 🎯 Priority Actions

### This Week:
1. ✅ Research 3-5 potential Bulgarian sources
2. ✅ Verify which have RSS feeds
3. ✅ Contact organizations without RSS
4. ✅ Test 1-2 sources

### Next Week:
1. ✅ Add verified Bulgarian sources to config
2. ✅ Test mixed Bulgarian + English news
3. ✅ Adjust filtering if needed
4. ✅ Monitor which sources work best

### Next Month:
1. ✅ Expand to 5-6 sources (mix Bulgarian + English)
2. ✅ Consider translation for English sources
3. ✅ Add more categories (videos, podcasts)
4. ✅ Community feedback on sources

---

## 📞 Need Help?

### Troubleshooting:

**Issue**: RSS URL doesn't work
→ Try `/feed`, `/rss`, `/rss.xml`, `/feed.xml`
→ Use FetchRSS as fallback

**Issue**: Too many irrelevant articles
→ Add `keywords` filter
→ Contact site for dedicated beekeeping RSS

**Issue**: No Bulgarian sources found
→ Keep English sources for now
→ Consider translation (DeepL)
→ Create your own content section

---

## 🌐 Alternative: Mix Approaches

If Bulgarian RSS is limited:

1. **RSS (English)** → Auto-translate → Display in Bulgarian
2. **Manual curation** → Write summaries of English articles in Bulgarian
3. **Community posts** → Let users submit/share news
4. **Aggregator** → Use NewsAPI to search "пчеларство България"

---

## 📚 Resources

- **RSS Validator**: https://validator.w3.org/feed/
- **FetchRSS**: https://fetchrss.com/
- **Feed43** (Advanced): https://feed43.com/
- **RSS Search**: https://feedspot.com/
- **BG News Aggregator**: https://www.bta.bg/

---

## ✨ Remember

**Don't wait for perfect Bulgarian sources!**

Current setup (English sources) is:
- ✅ Working
- ✅ High quality
- ✅ Updated daily
- ✅ Better than no news

Bulgarian sources = nice to have, not required. Add them gradually as you find them! 🐝

