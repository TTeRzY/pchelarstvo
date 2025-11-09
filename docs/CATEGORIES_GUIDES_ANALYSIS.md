# Категории и ръководства - Analysis & Recommendations

## 📊 Current State

### **What Exists Now:**

```typescript
// src/data/sample.ts
export const categories = [
  {
    id: 1,
    title: "Практики в пчеларството",
    img: "...",
    price: null,
  },
  {
    id: 2,
    title: "Рецепти и продукти с мед",
    img: "...",
    price: null,
  },
  {
    id: 3,
    title: "Здраве на пчелните семейства",
    img: "...",
    price: null,
  },
];
```

**Issues:**
- ❌ Only 3 basic categories
- ❌ No actual content/guides
- ❌ Cards are not clickable
- ❌ No educational value yet
- ❌ Just placeholders with images

---

## 🎯 What Bulgarian Beekeepers Need

Based on БАБХ resources and beekeeping best practices, here's what would be **actually useful**:

### **Category 1: Seasonal Guides (По сезони)**
Monthly task lists for the entire beekeeping year.

**Content Ideas:**
- ✅ **Пролет (Spring)**: Colony inspection, swarm prevention, super addition
- ✅ **Лято (Summer)**: Honey harvest, varroa monitoring, feeding
- ✅ **Есен (Autumn)**: Winter prep, treatment, feeding
- ✅ **Зима (Winter)**: Minimal intervention, monitoring, planning

---

### **Category 2: Bee Health & Diseases (Здраве на пчелите)**
Critical for disease prevention and treatment.

**Content Ideas:**
- ✅ **Вароа (Varroa)**: Detection, treatment methods, timing
- ✅ **Нозематоза (Nosema)**: Symptoms, prevention, treatment
- ✅ **Гнилец (Foulbrood)**: Recognition, reporting to БАБХ, eradication
- ✅ **Вирози (Viruses)**: Common types, prevention strategies
- ✅ **Профилактика (Prevention)**: Hygiene, equipment sterilization

---

### **Category 3: Equipment & Hives (Оборудване и кошери)**
Practical guides for beekeeping equipment.

**Content Ideas:**
- ✅ **Типове кошери (Hive Types)**: Дадан-Блат, Лангстрот, horizontal
- ✅ **Основно оборудване (Basic Equipment)**: Smoker, suit, tools
- ✅ **Изграждане на кошер (DIY Hives)**: Plans, materials, costs
- ✅ **Избор на оборудване (Buying Guide)**: What to buy first
- ✅ **Поддръжка (Maintenance)**: Cleaning, repairs, storage

---

### **Category 4: Queen Bee & Breeding (Майка и развъждане)**
For beekeepers interested in breeding.

**Content Ideas:**
- ✅ **Отглеждане на майки (Queen Rearing)**: Methods, timing
- ✅ **Смяна на майка (Re-queening)**: When and how
- ✅ **Генетика (Genetics)**: Selecting good stock
- ✅ **Rojене (Swarming)**: Prevention and management
- ✅ **Нуклеуси (Nucs)**: Creating and managing splits

---

### **Category 5: Honey Production (Производство на мед)**
Core business for most beekeepers.

**Content Ideas:**
- ✅ **Добив на мед (Honey Harvest)**: Timing, extraction methods
- ✅ **Видове мед (Honey Types)**: Акация, липа, слънчоглед, etc.
- ✅ **Пакетиране (Packaging)**: Jars, labels, legal requirements
- ✅ **Съхранение (Storage)**: Temperature, humidity, containers
- ✅ **Качество (Quality Control)**: Tests, standards, certification

---

### **Category 6: Bee Products (Пчелни продукти)**
Beyond honey - other valuable products.

**Content Ideas:**
- ✅ **Прополис (Propolis)**: Collection, uses, health benefits
- ✅ **Пчелен прашец (Pollen)**: Collection, drying, storage
- ✅ **Восък (Beeswax)**: Rendering, uses, candles
- ✅ **Пчелна отрова (Bee Venom)**: Collection, therapeutic uses
- ✅ **Маточно мляко (Royal Jelly)**: Production, storage

---

### **Category 7: Legal & Regulations (Законодателство)**
Essential for compliance and subsidies.

**Content Ideas:**
- ✅ **Регистрация на пчелин (Apiary Registration)**: БАБХ requirements
- ✅ **Субсидии (Subsidies)**: How to apply, deadlines, documents
- ✅ **Етикетиране (Labeling)**: Legal requirements for honey sales
- ✅ **Биологично пчеларство (Organic)**: Certification process
- ✅ **Ветеринарни изисквания (Veterinary)**: Health checks, records

---

### **Category 8: Business & Marketing (Бизнес и маркетинг)**
For commercial beekeepers.

**Content Ideas:**
- ✅ **Стартиране на бизнес (Starting a Business)**: Costs, planning
- ✅ **Ценообразуване (Pricing)**: Market rates, profit margins
- ✅ **Продажби (Sales)**: Direct, wholesale, farmers markets
- ✅ **Онлайн присъствие (Online Presence)**: Website, social media
- ✅ **Туристически пчелини (Bee Tourism)**: Educational visits

---

### **Category 9: Beginner's Corner (За начинаещи)**
Essential for new beekeepers.

**Content Ideas:**
- ✅ **С какво да започна? (Getting Started)**: Complete beginner guide
- ✅ **Първи стъпки (First Steps)**: Buying bees, first inspection
- ✅ **Основи на анатомията (Bee Anatomy)**: Understanding bees
- ✅ **Типични грешки (Common Mistakes)**: What to avoid
- ✅ **Речник на термините (Glossary)**: Beekeeping terminology

---

### **Category 10: Advanced Topics (Напреднали теми)**
For experienced beekeepers.

**Content Ideas:**
- ✅ **Опрашване (Pollination Services)**: Contracts, logistics
- ✅ **Миграционно пчеларство (Migratory Beekeeping)**: Planning, transport
- ✅ **Експерименти и иновации (Innovations)**: New techniques
- ✅ **Научни изследвания (Research)**: Latest studies
- ✅ **Менторство (Mentoring)**: Teaching others

---

## 🎨 Proposed UI Solution

### **Option A: Expandable Category Cards** (Recommended)

```
┌─────────────────────────────────────────────┐
│  Категории и ръководства                    │
│  Избрани теми за обучение и вдъхновение     │
└─────────────────────────────────────────────┘

┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│  📅 Сезонни  │ │  🐝 Здраве   │ │  🔧 Оборудване│
│  ръководства │ │  на пчелите  │ │  и кошери    │
│              │ │              │ │              │
│ 12 статии ↗  │ │ 8 статии ↗   │ │ 10 статии ↗  │
└──────────────┘ └──────────────┘ └──────────────┘

┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│  👑 Майки и  │ │  🍯 Производ- │ │  💼 Бизнес и │
│  развъждане  │ │  ство на мед │ │  маркетинг   │
│              │ │              │ │              │
│ 6 статии ↗   │ │ 9 статии ↗   │ │ 7 статии ↗   │
└──────────────┘ └──────────────┘ └──────────────┘
```

**Features:**
- Click card → Opens guide list page
- Shows article count per category
- Beautiful images related to each topic
- Responsive grid layout

---

### **Option B: Accordion with Quick Links**

```
▼ 📅 Сезонни ръководства (12 статии)
  └─ • Пролетни грижи за пчелните семейства
     • Летни задачи в пчелина
     • Подготовка за зимата
     [Виж всички →]

▼ 🐝 Здраве на пчелите (8 статии)
  └─ • Борба с вароа: Ефективни методи
     • Разпознаване на гнилец
     • Профилактика на болести
     [Виж всички →]
```

**Features:**
- Expandable sections
- Shows top 3 articles per category
- Link to full category page
- More compact

---

### **Option C: Tab-Based Navigation**

```
[Сезонни] [Здраве] [Оборудване] [Майки] [Производство] [Още ▼]

┌────────────────────────────────────────┐
│  📅 Сезонни ръководства                │
│                                        │
│  • Пролетна проверка на семействата   │
│  • Превенция на роене през май        │
│  • Добив на акациев мед              │
│  • Есенно подхранване                │
│                                        │
│  [Виж още 8 статии →]                 │
└────────────────────────────────────────┘
```

---

## ✅ Recommended Approach: Hybrid Solution

Combine expandable cards with actual content:

### **Phase 1: Category Cards** (Quick Win - 2 hours)
- Update `categories` array with 10 meaningful categories
- Make cards clickable
- Link to dedicated category pages
- Add article count badges

### **Phase 2: Content Structure** (Medium - 1 week)
- Create page structure for each category
- Add "Coming Soon" placeholders
- Implement basic article listing

### **Phase 3: Real Content** (Long-term - Ongoing)
- Write/curate actual guides
- Add PDF downloads
- Video tutorials
- Interactive tools (calculators, checklists)

---

## 🛠️ Implementation Plan

### **Step 1: Update Categories Data**

```typescript
// src/data/categories.ts (NEW FILE)

export type CategoryItem = {
  id: string;
  slug: string;
  title: string;
  description: string;
  icon: string;
  img: string;
  articleCount: number;
  color: string; // For theming
  featured: boolean;
};

export const CATEGORIES: CategoryItem[] = [
  {
    id: 'seasonal',
    slug: 'sezonni-rukovodstva',
    title: 'Сезонни ръководства',
    description: 'Месечни задачи и препоръки за цялата година',
    icon: '📅',
    img: 'https://images.unsplash.com/photo-1478293237537-3f1c8d5f9e2d',
    articleCount: 12,
    color: 'amber',
    featured: true,
  },
  {
    id: 'health',
    slug: 'zdrave-na-pchelite',
    title: 'Здраве на пчелите',
    description: 'Болести, профилактика и лечение',
    icon: '🐝',
    img: 'https://images.unsplash.com/photo-1514996937319-344454492b37',
    articleCount: 8,
    color: 'blue',
    featured: true,
  },
  {
    id: 'equipment',
    slug: 'oborudvane-i-kosheri',
    title: 'Оборудване и кошери',
    description: 'Избор, изграждане и поддръжка',
    icon: '🔧',
    img: 'https://images.unsplash.com/photo-1589656966895-2f33e7653819',
    articleCount: 10,
    color: 'gray',
    featured: true,
  },
  {
    id: 'queen',
    slug: 'mayki-i-razvuzhdane',
    title: 'Майки и развъждане',
    description: 'Отглеждане на майки и управление на семейства',
    icon: '👑',
    img: 'https://images.unsplash.com/photo-1516526223056-d8bcb7b60c8e',
    articleCount: 6,
    color: 'purple',
    featured: false,
  },
  {
    id: 'honey',
    slug: 'proizvodstvo-na-med',
    title: 'Производство на мед',
    description: 'Добив, пакетиране и съхранение',
    icon: '🍯',
    img: 'https://images.unsplash.com/photo-1587049352847-19543f5e34c3',
    articleCount: 9,
    color: 'yellow',
    featured: true,
  },
  {
    id: 'products',
    slug: 'pchelni-produkti',
    title: 'Пчелни продукти',
    description: 'Прополис, прашец, восък и други',
    icon: '🏺',
    img: 'https://images.unsplash.com/photo-1558642084-fd07fae5282e',
    articleCount: 7,
    color: 'orange',
    featured: false,
  },
  {
    id: 'legal',
    slug: 'zakonodatelstvo',
    title: 'Законодателство',
    description: 'Регистрация, субсидии и нормативи',
    icon: '📋',
    img: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f',
    articleCount: 5,
    color: 'green',
    featured: false,
  },
  {
    id: 'business',
    slug: 'biznes-i-marketing',
    title: 'Бизнес и маркетинг',
    description: 'Продажби, ценообразуване и маркетинг',
    icon: '💼',
    img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f',
    articleCount: 7,
    color: 'indigo',
    featured: false,
  },
  {
    id: 'beginners',
    slug: 'za-nachinaeshti',
    title: 'За начинаещи',
    description: 'Пълно ръководство за новите пчелари',
    icon: '🌱',
    img: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353',
    articleCount: 15,
    color: 'teal',
    featured: true,
  },
  {
    id: 'advanced',
    slug: 'naprednali-temi',
    title: 'Напреднали теми',
    description: 'Иновации, изследвания и професионални техники',
    icon: '🎓',
    img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
    articleCount: 4,
    color: 'red',
    featured: false,
  },
];
```

---

### **Step 2: Enhanced Category Component**

```typescript
// src/components/categories/CategoryGrid.tsx

import Link from 'next/link';
import type { CategoryItem } from '@/data/categories';

type CategoryGridProps = {
  categories: CategoryItem[];
  showAll?: boolean; // Show all or just featured
};

export default function CategoryGrid({ 
  categories, 
  showAll = false 
}: CategoryGridProps) {
  const displayCategories = showAll 
    ? categories 
    : categories.filter(c => c.featured);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {displayCategories.map((category) => (
        <Link
          key={category.id}
          href={`/guides/${category.slug}`}
          className="group block bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
        >
          {/* Image */}
          <div 
            className="h-40 bg-cover bg-center relative"
            style={{ backgroundImage: `url(${category.img})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-3 left-3 text-4xl">
              {category.icon}
            </div>
          </div>

          {/* Content */}
          <div className="p-5">
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-amber-600 transition-colors">
              {category.title}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {category.description}
            </p>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-gray-500">
                {category.articleCount} {category.articleCount === 1 ? 'статия' : 'статии'}
              </span>
              <span className="text-amber-600 group-hover:translate-x-1 transition-transform">
                →
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
```

---

### **Step 3: Category Landing Pages**

```typescript
// src/app/guides/[slug]/page.tsx

import { notFound } from 'next/navigation';
import { CATEGORIES } from '@/data/categories';
import PageShell from '@/components/layout/PageShell';

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const category = CATEGORIES.find(c => c.slug === slug);

  if (!category) {
    return notFound();
  }

  return (
    <PageShell>
      {/* Category Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-5xl">{category.icon}</span>
          <h1 className="text-3xl font-bold text-gray-900">
            {category.title}
          </h1>
        </div>
        <p className="text-lg text-gray-600">{category.description}</p>
      </div>

      {/* Coming Soon Message */}
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center">
        <div className="text-4xl mb-4">🚧</div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Скоро тук
        </h2>
        <p className="text-gray-700">
          Работим по създаването на {category.articleCount} полезни статии в тази категория.
          Следете за актуализации!
        </p>
      </div>

      {/* Related Categories */}
      <div className="mt-12">
        <h2 className="text-xl font-semibold mb-4">Други категории</h2>
        <CategoryGrid 
          categories={CATEGORIES.filter(c => c.id !== category.id).slice(0, 3)} 
        />
      </div>
    </PageShell>
  );
}
```

---

## 📊 Content Priority Matrix

| Category | Priority | User Need | Effort | Impact |
|----------|----------|-----------|--------|--------|
| **Сезонни** | 🔴 High | Essential | Medium | High |
| **Здраве** | 🔴 High | Critical | High | High |
| **За начинаещи** | 🔴 High | Essential | Low | High |
| **Оборудване** | 🟡 Medium | Useful | Medium | Medium |
| **Производство** | 🟡 Medium | Useful | Medium | Medium |
| **Законодателство** | 🟡 Medium | Important | Low | High |
| **Майки** | 🟢 Low | Advanced | High | Medium |
| **Бизнес** | 🟢 Low | Professional | High | Medium |
| **Продукти** | 🟢 Low | Niche | Medium | Low |
| **Напреднали** | 🟢 Low | Expert | High | Low |

---

## 🎯 Next Steps

### **Immediate (This Session):**
1. ✅ Update category data with 10 categories
2. ✅ Enhance category component
3. ✅ Add click functionality
4. ✅ Create placeholder pages

### **Short-term (This Week):**
1. Write "Сезонни ръководства" content (12 articles)
2. Write "За начинаещи" guide (starter pack)
3. Curate "Здраве" resources from БАБХ

### **Long-term (Ongoing):**
1. Build article CMS
2. Accept community contributions
3. Add video tutorials
4. Interactive tools (calculators, checklists)

---

## 💡 Content Ideas - Top 20 Articles to Write First

### **Must-Have Guides:**
1. "Какво трябва да знам преди да започна пчеларство?"
2. "Месечен календар на задачите в пчелина"
3. "Как да открия и лекувам вароа?"
4. "Подготовка на пчелите за зимата"
5. "Избор на първи кошер - пълно ръководство"
6. "Регистрация на пчелин в БАБХ - стъпка по стъпка"
7. "Как да извлека мед без центрофуга?"
8. "Превенция на роене"
9. "Смяна на майка - кога и как?"
10. "Органолептичен анализ на меда"
11. "Пчелен прашец - събиране и съхранение"
12. "Типични грешки на начинаещите пчелари"
13. "Колко струва да започнеш пчеларство?"
14. "Как да продавам мед онлайн?"
15. "Лечение на нозематоза"
16. "Избор на локация за пчелин"
17. "Етикетиране на мед - законови изисквания"
18. "Биологично пчеларство - изисквания"
19. "Как да направя рояк?"
20. "Зимна проверка на семействата"

---

**Status**: Ready for implementation  
**Estimated Time**: 2-3 hours for UI, ongoing for content  
**Priority**: High (educational value)

