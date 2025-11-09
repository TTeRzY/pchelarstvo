# How to Re-Enable News Section 📰

## Why is News Hidden?

The news section is temporarily hidden because currently only **English** beekeeping news from international RSS sources is available. Since **Pchelarstvo.bg** is a **Bulgarian-first** platform, it's better to hide the feature until Bulgarian sources are available.

---

## ✅ What's Ready

All the news functionality is **fully implemented and working**:
- ✅ RSS feed integration
- ✅ Image display
- ✅ External link handling
- ✅ Server-side filtering
- ✅ Language badges
- ✅ Beautiful UI
- ✅ Loading states
- ✅ All fixes from `NEWS_PAGE_FIXES_COMPLETE.md`

**The code is production-ready!** Just hidden from users.

---

## 📋 What You Need

To re-enable news, you need **Bulgarian beekeeping RSS feeds**.

### Option A: Use Bulgarian Beekeeping Websites
See `ADDING_BULGARIAN_NEWS_GUIDE.md` for a complete list of potential sources.

### Option B: Use Mixed Sources with Language Badges
Keep English sources but add Bulgarian ones alongside (already implemented with 🇬🇧 EN badges).

---

## 🔧 How to Re-Enable (3 Simple Steps)

### **Step 1: Add Bulgarian RSS Sources** (5 minutes)

Edit `src/config/rssSources.ts`:

```typescript
export const RSS_SOURCES: RSSSource[] = [
  // 🇧🇬 Bulgarian Sources (ADD THESE)
  {
    name: 'Bulgarian Beekeeping Association',
    url: 'https://example.bg/feed/',  // Replace with real URL
    category: 'Производство',
    language: 'bg',
    enabled: true,
  },
  {
    name: 'Bulgarian Bee Journal',
    url: 'https://pcheli.bg/rss',  // Replace with real URL
    category: 'Здраве',
    language: 'bg',
    enabled: true,
  },
  
  // 🇬🇧 International Sources (Already there)
  {
    name: 'Bee Culture Magazine',
    url: 'https://www.beeculture.com/feed/',
    category: 'Производство',
    language: 'en',
    enabled: true,  // Keep or set to false if Bulgarian-only
  },
  // ... other English sources
];
```

---

### **Step 2: Uncomment Header Navigation** (1 minute)

Edit `src/components/layout/Header.tsx`:

**Find this:**
```typescript
const NAV_ITEMS: NavItem[] = [
  { key: "home", path: "/" },
  { key: "marketplace", path: "/marketplace" },
  { key: "map", path: "/map" },
  // 🚧 NEWS TEMPORARILY HIDDEN - Waiting for Bulgarian RSS sources
  // To re-enable: Uncomment the line below
  // { key: "news", path: "/news" },
  { key: "contacts", path: "/contacts" },
];
```

**Change to:**
```typescript
const NAV_ITEMS: NavItem[] = [
  { key: "home", path: "/" },
  { key: "marketplace", path: "/marketplace" },
  { key: "map", path: "/map" },
  { key: "news", path: "/news" },  // ✅ UNCOMMENTED
  { key: "contacts", path: "/contacts" },
];
```

---

### **Step 3: Uncomment Home Page News Section** (2 minutes)

Edit `src/app/page.tsx`:

#### 3a. Uncomment State Variables (around line 119)

**Find this:**
```typescript
// 🚧 NEWS TEMPORARILY HIDDEN - Waiting for Bulgarian RSS sources
// To re-enable: Uncomment these lines and the news section below
// const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
// const [newsLoading, setNewsLoading] = useState(true);
// const [newsError, setNewsError] = useState<string | null>(null);
```

**Change to:**
```typescript
const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
const [newsLoading, setNewsLoading] = useState(true);
const [newsError, setNewsError] = useState<string | null>(null);
```

#### 3b. Uncomment useEffect (around line 225)

**Find this:**
```typescript
// 🚧 NEWS TEMPORARILY HIDDEN - Waiting for Bulgarian RSS sources
// To re-enable: Uncomment the entire useEffect below
/*
useEffect(() => {
  let cancelled = false;
  setNewsLoading(true);

  fetch("/api/news?limit=3")
    .then(async (res) => {
      if (!res.ok) throw new Error("Failed to fetch news");
      const data = await res.json();
      if (cancelled) return;
      setNewsItems(data.items || []);
      setNewsError(null);
    })
    .catch((error) => {
      if (!cancelled) {
        console.error("Failed to fetch news:", error);
        setNewsItems([]);
        setNewsError("Новините не успяха да се заредят.");
      }
    })
    .finally(() => {
      if (!cancelled) setNewsLoading(false);
    });

  return () => {
    cancelled = true;
  };
}, []);
*/
```

**Change to:**
```typescript
useEffect(() => {
  let cancelled = false;
  setNewsLoading(true);

  fetch("/api/news?limit=3")
    .then(async (res) => {
      if (!res.ok) throw new Error("Failed to fetch news");
      const data = await res.json();
      if (cancelled) return;
      setNewsItems(data.items || []);
      setNewsError(null);
    })
    .catch((error) => {
      if (!cancelled) {
        console.error("Failed to fetch news:", error);
        setNewsItems([]);
        setNewsError("Новините не успяха да се заредят.");
      }
    })
    .finally(() => {
      if (!cancelled) setNewsLoading(false);
    });

  return () => {
    cancelled = true;
  };
}, []);
```

#### 3c. Uncomment News Section JSX (around line 473)

**Find this:**
```typescript
{/* 🚧 NEWS SECTION TEMPORARILY HIDDEN - Waiting for Bulgarian RSS sources
    To re-enable: Uncomment this section and the state/useEffect above
<section className="rounded-2xl border border-gray-200 shadow-sm">
  <div className="p-5 border-b">
    <h2 className="text-xl font-semibold text-gray-900">Новини и полезни материали</h2>
    <p className="text-sm text-gray-500">Акценти от общността и специализирани статии</p>
  </div>
  <div className="p-5">
    {newsLoading ? (
      <div className="space-y-4">
        <div className="h-32 rounded-lg bg-gray-100 animate-pulse" />
        <div className="h-32 rounded-lg bg-gray-100 animate-pulse" />
        <div className="h-32 rounded-lg bg-gray-100 animate-pulse" />
      </div>
    ) : newsError ? (
      <div className="text-center py-8 text-amber-700 bg-amber-50 rounded-lg border border-amber-100">
        {newsError}
      </div>
    ) : (
      <NewsList items={newsItems} />
    )}
  </div>
</section>
*/}
```

**Change to:**
```typescript
<section className="rounded-2xl border border-gray-200 shadow-sm">
  <div className="p-5 border-b">
    <h2 className="text-xl font-semibold text-gray-900">Новини и полезни материали</h2>
    <p className="text-sm text-gray-500">Акценти от общността и специализирани статии</p>
  </div>
  <div className="p-5">
    {newsLoading ? (
      <div className="space-y-4">
        <div className="h-32 rounded-lg bg-gray-100 animate-pulse" />
        <div className="h-32 rounded-lg bg-gray-100 animate-pulse" />
        <div className="h-32 rounded-lg bg-gray-100 animate-pulse" />
      </div>
    ) : newsError ? (
      <div className="text-center py-8 text-amber-700 bg-amber-50 rounded-lg border border-amber-100">
        {newsError}
      </div>
    ) : (
      <NewsList items={newsItems} />
    )}
  </div>
</section>
```

---

## 🎉 That's It!

**Total time: ~10 minutes**

After these 3 steps:
1. ✅ News link appears in header navigation
2. ✅ News section shows on home page
3. ✅ `/news` page is accessible
4. ✅ Bulgarian RSS feeds load and display

---

## 🧪 Testing

### After Re-enabling:

1. **Check Home Page** → Should see "Новини и полезни материали" section with 3 articles
2. **Check Header** → Should see "НОВИНИ" link
3. **Click News Link** → Should navigate to `/news` page
4. **Verify RSS Feeds** → Articles should display with:
   - Real images
   - Correct titles in Bulgarian/English
   - Language badges (🇧🇬 or 🇬🇧)
   - Working links to original sources

---

## 🇧🇬 Finding Bulgarian RSS Sources

See the complete guide in **`ADDING_BULGARIAN_NEWS_GUIDE.md`** for:
- List of potential Bulgarian beekeeping websites
- How to find RSS feeds
- How to create RSS feeds with FetchRSS
- Contact templates for requesting RSS access
- Keyword filtering for general news sites

---

## 📊 Current Status

| Feature | Status |
|---------|--------|
| **Code** | ✅ Complete & Production-ready |
| **RSS Integration** | ✅ Working with international sources |
| **UI/UX** | ✅ Beautiful, responsive, fast |
| **Language Badges** | ✅ Shows 🇬🇧 EN for international |
| **Filtering** | ✅ Server-side, efficient |
| **Images** | ✅ Displaying correctly |
| **Links** | ✅ External links open in new tab |
| **Loading States** | ✅ Professional skeletons |
| **Bulgarian Sources** | ⏳ **Waiting** (you need to add) |
| **Visibility** | 🚧 **Hidden from users** |

---

## 💡 Tips

### If You Want Mixed Language Content (Recommended)

Keep both Bulgarian and English sources enabled. The language badges (🇬🇧 EN) clearly indicate the language, and users can benefit from international beekeeping knowledge while waiting for more Bulgarian content.

### If You Want Bulgarian-Only

Set `enabled: false` for all English sources in `src/config/rssSources.ts` once you have enough Bulgarian sources.

---

## 🆘 Need Help?

1. **Finding RSS Feeds** → See `ADDING_BULGARIAN_NEWS_GUIDE.md`
2. **Understanding the Code** → See `NEWS_PAGE_FIXES_COMPLETE.md`
3. **Original Analysis** → See `NEWS_PAGE_ANALYSIS.md`
4. **RSS Integration** → See `RSS_INTEGRATION_COMPLETE.md`

---

**Status**: 🚧 News temporarily hidden, ready to be re-enabled in ~10 minutes when Bulgarian RSS sources are available.

