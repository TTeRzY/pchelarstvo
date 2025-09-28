// data/news.ts
export type NewsType = "article" | "video" | "podcast";
export type NewsTopic = "Практики" | "Болести" | "Регулации" | "Пазар" | "Сезон";

export type NewsItem = {
  id: string;
  title: string;
  summary: string;
  cover?: string;
  type: NewsType;             // article | video | podcast
  topic: NewsTopic;           // Практики | Болести | Регулации | Пазар | Сезон
  readingMinutes?: number;    // за статии
  durationMinutes?: number;   // за видео/подкаст
  updatedAt: string;          // ISO
  source?: string;            // напр. "Pchelarstvo.bg редакция"
  views?: number;             // за "Тенденции"
  region?: string;            // опц. филтър по регион
};

export const newsSample: NewsItem[] = [
  {
    id: "n1",
    title: "Какво да направим през септември: кратко ръководство",
    summary: "Храна при нужда, контрол на вароа, подмяна на стари пити, стесняване и изолация.",
    cover: "https://placehold.co/800x500?text=Hero",
    type: "article",
    topic: "Сезон",
    readingMinutes: 4,
    updatedAt: new Date("2025-09-08").toISOString(),
    source: "Pchelarstvo.bg редакция",
    views: 412,
  },
  {
    id: "n2",
    title: "Нов регламент: какво се променя",
    summary: "Основни изисквания, срокове и обхват за пчеларите.",
    cover: "https://placehold.co/600x400?text=Regulations",
    type: "article",
    topic: "Регулации",
    readingMinutes: 3,
    updatedAt: new Date("2025-09-06").toISOString(),
    source: "Агенция по храните",
    views: 368,
  },
  {
    id: "n3",
    title: "Вароа: есенна стратегия",
    summary: "Добри практики, грешки и контролни списъци.",
    cover: "https://placehold.co/600x400?text=Varroa",
    type: "article",
    topic: "Болести",
    readingMinutes: 5,
    updatedAt: new Date("2025-09-05").toISOString(),
    source: "Pchelarstvo.bg редакция",
    views: 544,
  },
  {
    id: "n4",
    title: "Пазар: цени на меда по региони",
    summary: "Седмична справка: динамика по области и сортове.",
    cover: "https://placehold.co/600x400?text=Market",
    type: "article",
    topic: "Пазар",
    readingMinutes: 2,
    updatedAt: new Date("2025-09-04").toISOString(),
    source: "Pchelarstvo.bg Маркет Тракер",
    views: 220,
  },
  {
    id: "n5",
    title: "Интервю: подготовка за зима",
    summary: "Кратко видео с основните стъпки и често срещани пропуски.",
    cover: "https://placehold.co/600x400?text=Video",
    type: "video",
    topic: "Практики",
    durationMinutes: 12,
    updatedAt: new Date("2025-09-03").toISOString(),
    source: "Pchelarstvo.bg Видео",
    views: 781,
  },
  {
    id: "n6",
    title: "Подкаст #5: цъфтежи и добиви",
    summary: "Гост-агроном за влиянието на времето и пашите.",
    cover: "https://placehold.co/600x400?text=Podcast",
    type: "podcast",
    topic: "Сезон",
    durationMinutes: 24,
    updatedAt: new Date("2025-09-02").toISOString(),
    source: "Pchelarstvo.bg Подкаст",
    views: 295,
  },
  // още примери
  ...Array.from({ length: 10 }).map((_, idx) => ({
    id: `n${7 + idx}`,
    title: `Статия #${7 + idx}`,
    summary: "Кратко резюме на съдържанието…",
    cover: "https://placehold.co/600x400?text=News",
    type: "article" as const,
    topic: (["Практики", "Болести", "Регулации", "Пазар", "Сезон"] as NewsTopic[])[idx % 5],
    readingMinutes: 3 + (idx % 4),
    updatedAt: new Date(2025, 8, 1 - idx).toISOString(),
    source: "Pchelarstvo.bg",
    views: 100 + idx * 17,
  })),
];