# Find Beekeeper Feature - Analysis & UI Design 🐝

## 📊 Current Platform Analysis

### **Existing User System:**
✅ **User Profile Fields:**
- `id`, `name`, `email`
- `phone`, `region`, `city`, `bio`
- `trustLevel`: 'bronze' | 'silver' | 'gold'
- `verifiedAt`: Email verification status
- `privacy`: 'public' | 'members' | 'private'
- `apiariesCount`, `activeListingsCount`
- `memberSince`, `avatarUrl`

✅ **Apiary System:**
- Users can add apiaries with location
- `hiveCount`, `region`, `city`, `lat`, `lng`
- `visibility`: 'public' | 'unlisted'

✅ **Trust Levels Already Implemented:**
- Bronze 🥉
- Silver 🥈  
- Gold 🥇

✅ **Modal System Exists:**
- Login, Register, ForgotPassword, ReportSwarm, ContactSeller
- Can easily extend for "BeekeeperProfile" modal

---

## 🎯 Feature Concept

### **"Намери пчелар" (Find Beekeeper)**

A **directory/marketplace for beekeepers** where:
- Users can **browse beekeepers** by region, experience, specialization
- See **validated**, **trusted beekeepers** with ratings
- **View profiles** (in modal or separate page)
- **Contact beekeepers** directly
- **Filter by**: Region, trust level, specialization, verification status

---

## 🎨 Proposed UI Design

### **Option A: Card Grid with Modal** (Recommended)

```
┌─────────────────────────────────────────────────┐
│  🐝 Намери пчелар                               │
│  Свържете се с опитни пчелари в региона        │
└─────────────────────────────────────────────────┘

[Filters: Region ▼] [Trust Level ▼] [Verified Only ☑] [Search...]

┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ 👤 Avatar    │ │ 👤 Avatar    │ │ 👤 Avatar    │
│              │ │              │ │              │
│ Иван Петров  │ │ Мария Г.     │ │ Георги Д.    │
│ ⭐⭐⭐⭐⭐    │ │ ⭐⭐⭐⭐☆    │ │ ⭐⭐⭐☆☆    │
│ 🥇 Златно    │ │ 🥈 Сребърно  │ │ 🥉 Бронзово  │
│ ✓ Верифициран│ │ ✓ Верифициран│ │              │
│              │ │              │ │              │
│ 📍 София     │ │ 📍 Пловдив   │ │ 📍 Варна     │
│ 🏺 15 кошера │ │ 🏺 8 кошера  │ │ 🏺 5 кошера  │
│ 📅 5 години  │ │ 📅 3 години  │ │ 📅 1 година  │
│              │ │              │ │              │
│ [Виж профил] │ │ [Виж профил] │ │ [Виж профил] │
│ [Свържи се]  │ │ [Свържи се]  │ │ [Свържи се]  │
└──────────────┘ └──────────────┘ └──────────────┘

Click "Виж профил" → Opens modal with full details
```

**Pros:**
- ✅ Fast browsing (grid view)
- ✅ Modal keeps context (don't leave page)
- ✅ Modern UX pattern
- ✅ Similar to marketplace cards (consistency!)

---

### **Option B: List View with Side Panel**

```
┌────────────────┬─────────────────────────────┐
│ FILTERS        │  BEEKEEPERS LIST           │
│                ├─────────────────────────────┤
│ 📍 Region      │ 👤 Иван Петров              │
│ ▢ София        │ ⭐⭐⭐⭐⭐ 🥇 ✓ Верифициран │
│ ▢ Пловдив      │ София • 15 кошера • 5 години│
│                │ [Виж профил] [Свържи се]    │
│ ⭐ Trust       ├─────────────────────────────┤
│ ☑ Златно       │ 👤 Мария Георгиева          │
│ ☑ Сребърно     │ ⭐⭐⭐⭐☆ 🥈 ✓ Верифициран │
│ ☑ Бронзово     │ Пловдив • 8 кошера • 3 год. │
│                │ [Виж профил] [Свържи се]    │
│ ✓ Verified Only├─────────────────────────────┤
│                │ ... more beekeepers         │
└────────────────┴─────────────────────────────┘
```

**Pros:**
- ✅ More compact
- ✅ Sidebar filters (like marketplace)
- ✅ See more beekeepers at once

**Cons:**
- ⚠️ Less visual appeal

---

## ✅ **Recommended: Option A (Card Grid + Modal)**

**Why:**
- Matches existing marketplace card design
- Modern, visual approach
- Mobile-friendly
- Modal pattern already exists
- Easy to scan profiles quickly

---

## 🛠️ Implementation Plan

### **Phase 1: Data Structure** (2 hours)

#### **New Type: Public Beekeeper Profile**

```typescript
// src/types/beekeeper.ts

export type BeekeeperProfile = {
  id: string;
  name: string;
  region: string;
  city?: string;
  avatarUrl?: string;
  
  // Trust & Verification
  trustLevel: 'bronze' | 'silver' | 'gold';
  verifiedAt: string | null;
  rating: number; // 0-5 stars
  reviewCount: number;
  
  // Beekeeping Info
  apiariesCount: number;
  totalHives: number;
  experience: 'beginner' | 'intermediate' | 'expert'; // Based on memberSince
  memberSince: string;
  
  // Specializations
  specializations?: string[]; // ['Майкопроизводство', 'Опрашване', 'Мед']
  products?: string[]; // ['Акациев мед', 'Прополис', 'Восък']
  
  // Bio & Contact (respects privacy)
  bio?: string;
  canContact: boolean; // Based on privacy settings
  
  // Stats
  activeListingsCount: number;
  completedDeals: number;
};
```

---

### **Phase 2: Backend API** (3 hours)

#### **New Endpoints:**

```typescript
// GET /api/beekeepers - List beekeepers
// Query params:
// - region?: string
// - trustLevel?: 'bronze' | 'silver' | 'gold'
// - verified?: boolean
// - specialization?: string
// - search?: string
// - page?: number
// - perPage?: number

// GET /api/beekeepers/[id] - Get single beekeeper profile
// Returns full public profile based on privacy settings

// POST /api/beekeepers/[id]/contact - Contact beekeeper
// Body: { message: string }
// Sends email notification
```

---

### **Phase 3: UI Components** (4 hours)

#### **1. Beekeeper Card Component**

```typescript
// src/components/beekeepers/BeekeeperCard.tsx

<article className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-200">
  {/* Avatar Section */}
  <div className="relative h-32 bg-gradient-to-br from-amber-400 to-yellow-500">
    <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
      <div className="w-24 h-24 rounded-full border-4 border-white bg-gray-200 overflow-hidden">
        <img src={avatarUrl} alt={name} />
      </div>
    </div>
    
    {/* Verified Badge */}
    {verifiedAt && (
      <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
        ✓ Верифициран
      </div>
    )}
  </div>

  {/* Content */}
  <div className="pt-14 pb-4 px-4 text-center">
    {/* Name & Trust Level */}
    <h3 className="font-bold text-lg text-gray-900">{name}</h3>
    <div className="flex items-center justify-center gap-2 mt-1">
      <span className="text-2xl">{trustIcon}</span>
      <span className="text-sm text-gray-600">{trustLabel}</span>
    </div>

    {/* Rating */}
    <div className="flex items-center justify-center gap-1 mt-2">
      {renderStars(rating)}
      <span className="text-xs text-gray-500 ml-1">({reviewCount})</span>
    </div>

    {/* Info */}
    <div className="mt-3 space-y-1 text-sm text-gray-600">
      <div>📍 {region}{city ? `, ${city}` : ''}</div>
      <div>🏺 {totalHives} кошера</div>
      <div>📅 {experienceYears} години опит</div>
    </div>

    {/* Specializations (Tags) */}
    {specializations && (
      <div className="mt-3 flex flex-wrap gap-1 justify-center">
        {specializations.map(spec => (
          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
            {spec}
          </span>
        ))}
      </div>
    )}

    {/* Actions */}
    <div className="mt-4 flex gap-2">
      <button 
        onClick={() => openProfile(id)}
        className="flex-1 rounded-xl border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50"
      >
        Виж профил
      </button>
      <button 
        onClick={() => contactBeekeeper(id)}
        className="flex-1 rounded-xl bg-yellow-400 hover:bg-yellow-500 px-3 py-2 text-sm font-medium"
      >
        Свържи се
      </button>
    </div>
  </div>
</article>
```

---

#### **2. Beekeeper Profile Modal**

```typescript
// src/components/beekeepers/BeekeeperProfileModal.tsx

<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
  <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
    {/* Header with gradient */}
    <div className="relative h-48 bg-gradient-to-br from-amber-400 via-yellow-400 to-amber-500">
      <button onClick={onClose} className="absolute top-4 right-4 text-white">
        ✕
      </button>
      
      {/* Avatar */}
      <div className="absolute -bottom-16 left-8">
        <img 
          src={avatarUrl} 
          className="w-32 h-32 rounded-full border-4 border-white"
        />
      </div>
    </div>

    <div className="pt-20 pb-8 px-8">
      {/* Name & Badges */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">{name}</h2>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-2xl">{trustIcon}</span>
            <span className="text-gray-600">{trustLabel}</span>
            {verifiedAt && (
              <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                ✓ Верифициран
              </span>
            )}
          </div>
        </div>
        
        {/* Rating */}
        <div className="text-right">
          <div className="flex items-center gap-1">
            {renderStars(rating)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {reviewCount} отзива
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="text-center p-4 bg-gray-50 rounded-xl">
          <div className="text-2xl font-bold text-amber-600">{apiariesCount}</div>
          <div className="text-xs text-gray-600">Пчелина</div>
        </div>
        <div className="text-center p-4 bg-gray-50 rounded-xl">
          <div className="text-2xl font-bold text-amber-600">{totalHives}</div>
          <div className="text-xs text-gray-600">Кошера</div>
        </div>
        <div className="text-center p-4 bg-gray-50 rounded-xl">
          <div className="text-2xl font-bold text-amber-600">{completedDeals}</div>
          <div className="text-xs text-gray-600">Сделки</div>
        </div>
        <div className="text-center p-4 bg-gray-50 rounded-xl">
          <div className="text-2xl font-bold text-amber-600">{experienceYears}</div>
          <div className="text-xs text-gray-600">Години</div>
        </div>
      </div>

      {/* Location */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-900 mb-2">Локация</h3>
        <div className="text-gray-700">
          📍 {region}, {city}
        </div>
      </div>

      {/* Bio */}
      {bio && (
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-2">За мен</h3>
          <p className="text-gray-700 leading-relaxed">{bio}</p>
        </div>
      )}

      {/* Specializations */}
      {specializations && (
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-2">Специализации</h3>
          <div className="flex flex-wrap gap-2">
            {specializations.map(spec => (
              <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm">
                {spec}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Products */}
      {products && (
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-2">Продукти</h3>
          <div className="flex flex-wrap gap-2">
            {products.map(product => (
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                🍯 {product}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Map Preview (if apiaries are public) */}
      {hasPublicApiaries && (
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-2">Пчелини на картата</h3>
          <div className="h-48 rounded-xl bg-gray-200">
            {/* Mini map showing beekeeper's apiaries */}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button className="flex-1 rounded-xl border border-gray-300 px-4 py-3 font-medium hover:bg-gray-50">
          Виж обяви
        </button>
        <button className="flex-1 rounded-xl bg-yellow-400 hover:bg-yellow-500 px-4 py-3 font-medium">
          Изпрати съобщение
        </button>
      </div>
    </div>
  </div>
</div>
```

---

## 🎨 Modern UI Features

### **1. Trust Level Visual System**

```typescript
const TRUST_CONFIG = {
  gold: {
    icon: '🥇',
    label: 'Златно ниво',
    color: 'from-yellow-400 to-amber-500',
    badgeBg: 'bg-yellow-100 text-yellow-800',
    borderColor: 'border-yellow-400',
  },
  silver: {
    icon: '🥈',
    label: 'Сребърно ниво',
    color: 'from-gray-300 to-gray-400',
    badgeBg: 'bg-gray-200 text-gray-700',
    borderColor: 'border-gray-400',
  },
  bronze: {
    icon: '🥉',
    label: 'Бронзово ниво',
    color: 'from-orange-400 to-amber-600',
    badgeBg: 'bg-orange-100 text-orange-700',
    borderColor: 'border-orange-400',
  },
};
```

---

### **2. Star Rating Component**

```typescript
// src/components/beekeepers/StarRating.tsx

function StarRating({ rating, reviewCount }: { rating: number; reviewCount: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <span 
          key={star}
          className={star <= rating ? 'text-yellow-400' : 'text-gray-300'}
        >
          ⭐
        </span>
      ))}
      <span className="text-xs text-gray-500 ml-1">
        ({reviewCount})
      </span>
    </div>
  );
}
```

---

### **3. Verification Badge**

```typescript
// Visual indicator for verified beekeepers

<div className="inline-flex items-center gap-1 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
  <span>✓</span>
  <span>Верифициран</span>
</div>

// Or for unverified:
<div className="inline-flex items-center gap-1 bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full">
  <span>⏳</span>
  <span>В процес</span>
</div>
```

---

### **4. Filter Sidebar**

```typescript
// Similar to marketplace filters

<aside className="space-y-6">
  {/* Search */}
  <div>
    <label className="block text-sm font-medium mb-2">Търсене</label>
    <input 
      type="text"
      placeholder="Име, град, специализация..."
      className="w-full rounded-xl border px-3 py-2"
    />
  </div>

  {/* Region */}
  <div>
    <label className="block text-sm font-medium mb-2">Регион</label>
    <select className="w-full rounded-xl border px-3 py-2">
      <option>Всички</option>
      <option>София</option>
      <option>Пловдив</option>
      <option>Варна</option>
      <option>Бургас</option>
      <option>Русе</option>
      {/* ... */}
    </select>
  </div>

  {/* Trust Level */}
  <div>
    <label className="block text-sm font-medium mb-2">Ниво на доверие</label>
    <div className="space-y-2">
      <label className="flex items-center gap-2">
        <input type="checkbox" />
        <span className="text-2xl">🥇</span>
        <span className="text-sm">Златно</span>
      </label>
      <label className="flex items-center gap-2">
        <input type="checkbox" />
        <span className="text-2xl">🥈</span>
        <span className="text-sm">Сребърно</span>
      </label>
      <label className="flex items-center gap-2">
        <input type="checkbox" />
        <span className="text-2xl">🥉</span>
        <span className="text-sm">Бронзово</span>
      </label>
    </div>
  </div>

  {/* Verified Only */}
  <div>
    <label className="flex items-center gap-2">
      <input type="checkbox" />
      <span className="text-sm">Само верифицирани</span>
    </label>
  </div>

  {/* Sort */}
  <div>
    <label className="block text-sm font-medium mb-2">Подреди по</label>
    <select className="w-full rounded-xl border px-3 py-2">
      <option>Най-високо оценени</option>
      <option>Най-опитни</option>
      <option>Най-нови</option>
      <option>Най-близки</option>
    </select>
  </div>
</aside>
```

---

### **5. Main Page Structure**

```typescript
// src/app/beekeepers/page.tsx

<PageShell>
  <div className="grid grid-cols-12 gap-8">
    {/* Filters Sidebar (Desktop) */}
    <aside className="hidden lg:block col-span-3">
      <BeekeeperFilters />
    </aside>

    {/* Main Content */}
    <main className="col-span-12 lg:col-span-9">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">🐝 Намери пчелар</h1>
        <p className="text-gray-600 mt-1">
          Свържете се с опитни пчелари в региона
        </p>
      </div>

      {/* Mobile Filter Button */}
      <button className="lg:hidden mb-4 w-full rounded-xl border px-4 py-2">
        🔍 Филтри
      </button>

      {/* Stats Bar */}
      <div className="mb-6 flex items-center gap-4 text-sm text-gray-600">
        <span>Показани: {visibleCount} от {totalCount}</span>
        <span>•</span>
        <span>Верифицирани: {verifiedCount}</span>
      </div>

      {/* Beekeeper Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {beekeepers.map(bk => (
          <BeekeeperCard 
            key={bk.id}
            beekeeper={bk}
            onViewProfile={() => openModal(bk.id)}
            onContact={() => contactBeekeeper(bk.id)}
          />
        ))}
      </div>

      {/* Load More */}
      {hasMore && (
        <div className="mt-8 text-center">
          <button className="rounded-xl border px-6 py-3 hover:bg-gray-50">
            Зареди още
          </button>
        </div>
      )}
    </main>
  </div>
</PageShell>
```

---

## 📋 Trust Level & Rating System

### **Trust Level Criteria:**

| Level | Criteria | Icon |
|-------|----------|------|
| **🥇 Gold** | 10+ completed deals, 4.5+ rating, 2+ years | Gold gradient |
| **🥈 Silver** | 5+ completed deals, 4.0+ rating, 1+ year | Silver gradient |
| **🥉 Bronze** | New or <5 deals | Bronze gradient |

### **Rating System:**

- **Stars**: 1-5 based on reviews
- **Reviews**: From buyers who dealt with beekeeper
- **Factors**: 
  - Product quality
  - Communication
  - Delivery/pickup experience
  - Accuracy of description

---

## 🎨 Design Mockups

### **Desktop View:**

```
┌────────────────────────────────────────────────────────────────┐
│  Header                                   [User] [Language] [⚙] │
├────────────────────────────────────────────────────────────────┤
│                                                                  │
│  🐝 Намери пчелар                                               │
│  Свържете се с опитни пчелари в региона                        │
│                                                                  │
│  ┌──────────┬──────────────────────────────────────────────┐  │
│  │ FILTERS  │  BEEKEEPERS (showing 12 of 45)               │  │
│  ├──────────┼──────────────────────────────────────────────┤  │
│  │ Search   │  ┌─────┐ ┌─────┐ ┌─────┐                     │  │
│  │ [____]   │  │ 👤  │ │ 👤  │ │ 👤  │                     │  │
│  │          │  │ Иван│ │ Мария│ │ Георги│                    │  │
│  │ Region   │  │⭐⭐⭐⭐⭐│ │⭐⭐⭐⭐│ │⭐⭐⭐│                   │  │
│  │ [Select] │  │🥇✓  │ │🥈✓  │ │🥉  │                     │  │
│  │          │  │Sofia│ │Plovdiv│ │Varna│                    │  │
│  │ Trust    │  │15🏺 │ │8🏺  │ │5🏺  │                     │  │
│  │ ☑ Gold   │  │     │ │     │ │     │                     │  │
│  │ ☑ Silver │  │[View] [Contact]│ │[View] [Contact]│      │  │
│  │ □ Bronze │  └─────┘ └─────┘ └─────┘                     │  │
│  │          │                                                │  │
│  │ ☑ Verified│ [... more beekeeper cards ...]               │  │
│  │          │                                                │  │
│  │ Sort By  │  [Load More]                                  │  │
│  │ [Select] │                                                │  │
│  └──────────┴──────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
```

### **Mobile View:**

```
┌──────────────────────────┐
│  🐝 Намери пчелар        │
│                          │
│  [🔍 Филтри]            │
│                          │
│  ┌────────────────────┐  │
│  │  👤  Иван Петров   │  │
│  │  ⭐⭐⭐⭐⭐ 🥇 ✓     │  │
│  │  📍 София          │  │
│  │  🏺 15 кошера      │  │
│  │  [Виж] [Свържи]   │  │
│  └────────────────────┘  │
│                          │
│  ┌────────────────────┐  │
│  │  👤  Мария Г.      │  │
│  │  ⭐⭐⭐⭐☆ 🥈 ✓     │  │
│  │  📍 Пловдив        │  │
│  │  🏺 8 кошера       │  │
│  │  [Виж] [Свържи]   │  │
│  └────────────────────┘  │
│                          │
│  [Зареди още]           │
└──────────────────────────┘
```

---

## 🚀 Implementation Steps

### **Phase 1: Database & Backend** (4-6 hours)

1. **Extend User Profile**
   - Add `specializations` field
   - Add `products` field
   - Add `rating` and `reviewCount` fields
   - Add `completedDeals` counter

2. **Create Beekeepers API**
   - `/api/beekeepers` - List with filters
   - `/api/beekeepers/[id]` - Get profile
   - `/api/beekeepers/[id]/contact` - Send message

3. **Privacy Logic**
   - Respect user privacy settings
   - Show limited info if privacy = 'private'
   - Full info if privacy = 'public'

---

### **Phase 2: UI Components** (6-8 hours)

1. **BeekeeperCard.tsx** - Card component
2. **BeekeeperProfileModal.tsx** - Modal view
3. **BeekeeperFilters.tsx** - Filter sidebar
4. **StarRating.tsx** - Star display
5. **TrustBadge.tsx** - Trust level indicator

---

### **Phase 3: Pages** (4-6 hours)

1. **`/beekeepers`** - Main directory page
2. **Navigation Link** - Add to header
3. **Home Page CTA** - "Намери пчелар" quick action

---

### **Phase 4: Features** (8-10 hours)

1. **Contact System** - Message beekeepers
2. **Review System** - Rate after deals
3. **Favorite Beekeepers** - Save for later
4. **Map Integration** - Show locations
5. **Notifications** - When contacted

---

## 📊 Comparison: Modal vs. Separate Page

| Feature | Modal | Separate Page |
|---------|-------|---------------|
| **Speed** | ⚡ Fast (no navigation) | ⏱️ Slower (new page) |
| **Context** | ✅ Keeps filter state | ❌ Loses filters |
| **SEO** | ❌ Not indexable | ✅ Each profile = URL |
| **Sharing** | ❌ Can't share link | ✅ Shareable URL |
| **Mobile UX** | ⚠️ Full-screen | ✅ Native feel |
| **Back Button** | ✅ Closes modal | ✅ Browser back |

**Recommendation**: **Start with Modal**, add separate page URLs later for SEO.

---

## 🎯 Key Features

### **Must-Have (MVP):**
1. ✅ Beekeeper cards with photo, name, region
2. ✅ Trust level indicator (gold/silver/bronze)
3. ✅ Verification badge
4. ✅ Star rating display
5. ✅ Contact button
6. ✅ Profile modal with full details
7. ✅ Basic filters (region, verified)

### **Nice-to-Have (V2):**
1. ⭐ Review/rating system
2. ⭐ Favorite beekeepers
3. ⭐ Messaging system
4. ⭐ Map view of beekeepers
5. ⭐ Advanced filters (specialization, products)
6. ⭐ Beekeeper badges/achievements

---

## 💡 Unique Features Ideas

### **1. "Ментор" Badge**
For experienced beekeepers willing to help beginners

### **2. "Локален експерт"**
Badge for beekeepers with deep regional knowledge

### **3. "Опрашител"**
For beekeepers offering pollination services

### **4. "Сертифициран Био"**
For organic certified beekeepers

### **5. Distance Indicator**
"15 км от вас" - if user shares location

---

## 🎨 Visual Style Guide

### **Color Palette** (matching current site):
- **Primary**: Yellow/Amber (#FACC15, #F59E0B)
- **Success**: Green (#10B981)
- **Trust Gold**: Yellow (#FBBF24)
- **Trust Silver**: Gray (#9CA3AF)
- **Trust Bronze**: Orange (#F97316)
- **Verified**: Blue (#3B82F6)

### **Components Style:**
- **Border Radius**: `rounded-2xl` (consistent)
- **Shadows**: `shadow-sm hover:shadow-md`
- **Transitions**: `transition-all duration-200`
- **Badges**: `rounded-full px-2 py-0.5 text-xs`
- **Buttons**: `rounded-xl px-4 py-2 font-medium`

---

## ✅ Next Steps

**Option 1**: Create complete plan document (30 min)  
**Option 2**: Start implementation - build UI first with mock data (4-6 hours)  
**Option 3**: Review and adjust design based on your feedback  

**Which would you prefer?** 🚀

I can start implementing right away, or we can refine the design first!

