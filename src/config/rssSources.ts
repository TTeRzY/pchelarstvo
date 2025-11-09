export type RSSSource = {
  name: string;
  url: string;
  category: 'Производство' | 'Здраве' | 'Регулации' | 'Пазар' | 'Общество';
  language: 'bg' | 'en';
  type: 'rss' | 'atom' | 'youtube';
  enabled: boolean;
  keywords?: string[]; // Optional: for filtering general news sources
};

export const RSS_SOURCES: RSSSource[] = [
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
  {
    name: 'American Bee Journal',
    url: 'https://americanbeejournal.com/feed/',
    category: 'Пазар',
    language: 'en',
    type: 'rss',
    enabled: true,
  },
  // Bulgarian sources (to be added later when verified)
  // {
  //   name: 'BTA България',
  //   url: 'https://www.bta.bg/bg/rss',
  //   category: 'Пазар',
  //   language: 'bg',
  //   type: 'rss',
  //   enabled: false,
  //   keywords: ['пчеларство', 'пчели', 'мед', 'пчелари'],
  // },
];

