# News Translation - Implementation Guide

## 🎯 Problem
Home page displays English beekeeping news, but the website is primarily Bulgarian.

## 💡 Solutions (4 Options)

---

## **Option 1: Google Translate API** ⭐ RECOMMENDED

### Pros:
- ✅ High quality translations
- ✅ Supports 100+ languages
- ✅ Fast (<500ms per article)
- ✅ Reliable (Google service)
- ✅ Good for technical content

### Cons:
- 💰 Paid ($20 per 1M characters)
- 🔑 Requires API key
- 📊 Free tier: $300 credit (translates ~15M characters)

### Cost Estimate:
- **Average article**: 500 characters
- **3 articles**: 1,500 characters
- **Per load**: ~$0.00003
- **10,000 loads/month**: ~$0.30/month
- **Free tier lasts**: ~100 months

### Implementation:

```typescript
// src/lib/translator.ts
const GOOGLE_TRANSLATE_API_KEY = process.env.GOOGLE_TRANSLATE_API_KEY;

export async function translateText(
  text: string,
  sourceLang: string = 'en',
  targetLang: string = 'bg'
): Promise<string> {
  if (!GOOGLE_TRANSLATE_API_KEY) {
    return text; // Return original if no API key
  }

  try {
    const response = await fetch(
      `https://translation.googleapis.com/language/translate/v2?key=${GOOGLE_TRANSLATE_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          q: text,
          source: sourceLang,
          target: targetLang,
          format: 'text',
        }),
      }
    );

    const data = await response.json();
    return data.data.translations[0].translatedText;
  } catch (error) {
    console.error('Translation failed:', error);
    return text; // Fallback to original
  }
}

export async function translateNewsItem(item: NewsItem): Promise<NewsItem> {
  if (item.language === 'bg') return item; // Already Bulgarian

  const [translatedTitle, translatedSummary] = await Promise.all([
    translateText(item.title),
    translateText(item.summary),
  ]);

  return {
    ...item,
    title: translatedTitle,
    summary: translatedSummary,
    originalTitle: item.title, // Keep original
    originalSummary: item.summary,
    translated: true,
  };
}
```

**Setup Steps**:
1. Go to https://console.cloud.google.com/
2. Enable "Cloud Translation API"
3. Create API key
4. Add to `.env.local`: `GOOGLE_TRANSLATE_API_KEY=your_key_here`

---

## **Option 2: DeepL API** ⭐⭐ BEST QUALITY

### Pros:
- ✅ **Better quality** than Google (especially for European languages)
- ✅ More natural translations
- ✅ Great for Bulgarian
- ✅ Free tier: 500,000 characters/month

### Cons:
- 💰 Paid after free tier ($5 per 1M characters)
- 🔑 Requires API key
- 📊 Limited free tier

### Cost Estimate:
- **Free tier**: 500,000 chars/month
- **~1,000 article translations/month free**
- **After that**: $5 per 1M characters

### Implementation:

```typescript
// src/lib/translator.ts
const DEEPL_API_KEY = process.env.DEEPL_API_KEY;

export async function translateWithDeepL(
  text: string,
  targetLang: string = 'BG'
): Promise<string> {
  if (!DEEPL_API_KEY) return text;

  try {
    const response = await fetch(
      'https://api-free.deepl.com/v2/translate',
      {
        method: 'POST',
        headers: {
          'Authorization': `DeepL-Auth-Key ${DEEPL_API_KEY}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          text: text,
          target_lang: targetLang,
        }),
      }
    );

    const data = await response.json();
    return data.translations[0].text;
  } catch (error) {
    console.error('DeepL translation failed:', error);
    return text;
  }
}
```

**Setup Steps**:
1. Go to https://www.deepl.com/pro-api
2. Sign up for free tier
3. Get API key
4. Add to `.env.local`: `DEEPL_API_KEY=your_key_here`

---

## **Option 3: OpenAI/Claude API** 🤖 CONTEXT-AWARE

### Pros:
- ✅ Best context understanding
- ✅ Can preserve beekeeping terminology
- ✅ Can summarize while translating
- ✅ Very natural translations

### Cons:
- 💰 More expensive ($0.50-2.00 per 1M tokens)
- 🐌 Slower (1-3 seconds)
- 🔑 Requires API key
- ⚡ Overkill for simple translation

### Cost Estimate:
- **Per article**: ~1,000 tokens = $0.001
- **10,000 loads/month**: ~$10-30/month

### Implementation:

```typescript
// src/lib/aiTranslator.ts
export async function translateWithAI(text: string): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a professional translator specializing in beekeeping content. Translate to Bulgarian, preserving technical terms.',
        },
        {
          role: 'user',
          content: `Translate this to Bulgarian: ${text}`,
        },
      ],
    }),
  });

  const data = await response.json();
  return data.choices[0].message.content;
}
```

---

## **Option 4: Browser Translation** 🌐 FREE (NO API)

### Pros:
- ✅ Completely free
- ✅ No API keys needed
- ✅ No server cost
- ✅ Works offline (browser feature)

### Cons:
- ❌ Quality varies by browser
- ❌ User must enable it manually
- ❌ Not automatic
- ❌ Inconsistent experience

### Implementation:

Add a translation notice:

```typescript
// Add to NewsList component
<div className="text-sm text-gray-600 bg-blue-50 border border-blue-100 rounded-lg p-3 mb-4">
  ℹ️ Новините са на английски език. 
  <button 
    onClick={() => {
      // Trigger browser translation
      document.documentElement.lang = 'en';
      window.location.reload();
    }}
    className="ml-2 text-blue-600 underline"
  >
    Преведи с браузъра
  </button>
</div>
```

---

## **Recommended Solution: Hybrid Approach** 🎯

Combine multiple strategies:

### **Strategy A: DeepL for Translation + Cache**

```typescript
// src/lib/rssFetcher.ts - Enhanced

import { translateWithDeepL } from './translator';

// Add translation cache
const translationCache = new Map<string, string>();

async function translateAndCache(text: string, id: string): Promise<string> {
  const cacheKey = `${id}-${text.substring(0, 50)}`;
  
  // Check cache first
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey)!;
  }

  // Translate
  const translated = await translateWithDeepL(text);
  
  // Cache result
  translationCache.set(cacheKey, translated);
  
  return translated;
}

export async function fetchAllRSS(translate: boolean = true): Promise<NewsItem[]> {
  // ... existing fetch logic ...

  // Translate if enabled
  if (translate) {
    const translatedItems = await Promise.all(
      allItems.map(async (item) => {
        if (item.language === 'en') {
          return {
            ...item,
            title: await translateAndCache(item.title, item.id),
            summary: await translateAndCache(item.summary, item.id),
            originalTitle: item.title,
            originalSummary: item.summary,
            translated: true,
          };
        }
        return item;
      })
    );
    return translatedItems;
  }

  return allItems;
}
```

### **Strategy B: Show Both Languages**

Update `NewsItem` type:

```typescript
// src/types/news.ts
export type NewsItem = {
  // ... existing fields ...
  translated?: boolean;
  originalTitle?: string;
  originalSummary?: string;
  language: 'bg' | 'en';
};
```

Update `NewsList` component:

```typescript
// src/components/news/NewsList.tsx
export default function NewsList({ items }: NewsListProps) {
  const [showOriginal, setShowOriginal] = useState(false);

  return (
    <div>
      {items.some(i => i.translated) && (
        <div className="mb-4 flex items-center justify-between text-sm">
          <span className="text-gray-600">
            ℹ️ Новините са преведени автоматично
          </span>
          <button
            onClick={() => setShowOriginal(!showOriginal)}
            className="text-blue-600 hover:underline"
          >
            {showOriginal ? 'Покажи превод' : 'Покажи оригинал'}
          </button>
        </div>
      )}

      <div className="space-y-4">
        {items.map((n) => (
          <Link key={n.id} href={n.link || `/news/${n.id}`}>
            <article>
              {/* ... image ... */}
              <div className="p-4">
                <h4>
                  {showOriginal && n.originalTitle 
                    ? n.originalTitle 
                    : n.title}
                </h4>
                <p>
                  {showOriginal && n.originalSummary 
                    ? n.originalSummary 
                    : n.summary}
                </p>
                {n.translated && (
                  <span className="text-xs text-blue-600 mt-2 block">
                    🌐 {showOriginal ? 'Original (EN)' : 'Преведено от EN'}
                  </span>
                )}
              </div>
            </article>
          </Link>
        ))}
      </div>
    </div>
  );
}
```

---

## **My Recommendation** 🎖️

### **Best Overall: DeepL API + Cache**

**Why?**
1. ✅ Best quality for Bulgarian
2. ✅ Free tier covers most use cases
3. ✅ Fast with caching
4. ✅ Professional results
5. ✅ Easy to implement

**Implementation Time**: 1-2 hours

**Steps**:
1. Sign up for DeepL free tier
2. Add translation function to `rssFetcher.ts`
3. Translate title + summary on fetch
4. Cache translations (30 min like RSS)
5. Update UI to show "Translated" badge
6. Add "Show Original" toggle

---

## **Quick Implementation** (15 minutes)

### Option: Client-side Google Translate Widget

Add to home page:

```html
<!-- Add to layout.tsx or page.tsx -->
<script type="text/javascript">
  function googleTranslateElementInit() {
    new google.translate.TranslateElement(
      {pageLanguage: 'bg', includedLanguages: 'en,bg'},
      'google_translate_element'
    );
  }
</script>
<script src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"></script>

<div id="google_translate_element"></div>
```

**Pros**: Free, instant, no code  
**Cons**: Translates entire page, not just news

---

## **Comparison Table**

| Solution | Quality | Cost | Speed | Setup Time |
|----------|---------|------|-------|------------|
| **DeepL API** | ⭐⭐⭐⭐⭐ | Free/Cheap | Fast | 1-2h |
| **Google Translate API** | ⭐⭐⭐⭐ | Cheap | Fast | 1-2h |
| **OpenAI/Claude** | ⭐⭐⭐⭐⭐ | Expensive | Slow | 2-3h |
| **Browser Widget** | ⭐⭐⭐ | Free | Instant | 15min |
| **No Translation** | N/A | Free | N/A | 0min |

---

## **Decision Tree**

```
Do you want automatic translation?
├─ YES
│  ├─ Best Quality → DeepL API
│  ├─ Cheapest → Google Translate API
│  ├─ Context-aware → OpenAI
│  └─ Quick & Dirty → Browser Widget
└─ NO
   ├─ Show language badges → Keep English
   ├─ Manual translation → Hire translator
   └─ Mix sources → Add Bulgarian RSS later
```

---

## **My Suggestion for You** 💡

### **Phase 1: Start Without Translation** (Current)
- Keep English news
- Add language badge (🇬🇧 EN)
- Add "Original article in English" note
- Focus on finding Bulgarian sources

### **Phase 2: Add DeepL Translation** (When traffic grows)
- Sign up for DeepL (free)
- Add translation to RSS fetcher
- Cache translated articles
- Show "Translated" badge

### **Phase 3: Mix Sources** (Ideal)
- English sources (translated)
- Bulgarian sources (native)
- Best of both worlds

---

## **Want me to implement translation now?**

I can add DeepL translation in 30 minutes:
1. Create translation utility
2. Integrate with RSS fetcher
3. Add caching
4. Update UI with badges
5. Add "Show Original" toggle

**Just say "yes" and I'll implement it!** 🚀

