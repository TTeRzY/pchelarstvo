export type NewsType = 'article' | 'video' | 'podcast';
export type NewsTopic = 'Производство' | 'Здраве' | 'Регулации' | 'Пазар' | 'Общество';

export type NewsItem = {
  id: string;
  title: string;
  summary: string;
  cover?: string;
  type: NewsType;
  topic: NewsTopic;
  readingMinutes?: number;
  durationMinutes?: number;
  updatedAt: string;
  source?: string;
  views?: number;
  link?: string; // External link to original article
};

export type NewsListResponse = {
  items: NewsItem[];
  count: number;
};

export type NewsDetailResponse = NewsItem;

