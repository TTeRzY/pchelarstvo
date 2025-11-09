import Link from 'next/link';
import type { NewsItem } from '@/types/news';

type NewsListProps = {
  items: NewsItem[];
};

export default function NewsList({ items }: NewsListProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Няма налични новини в момента.
      </div>
    );
  }

  // Check if any items are in English
  const hasEnglishContent = items.some(item => item.source && 
    (item.source.toLowerCase().includes('bee culture') || 
     item.source.toLowerCase().includes('honey bee') ||
     item.source.toLowerCase().includes('american bee')));

  return (
    <div>
      {/* Language Notice */}
      {hasEnglishContent && (
        <div className="mb-4 text-sm bg-blue-50 border border-blue-100 rounded-lg p-3 flex items-start gap-2">
          <span className="text-blue-600 font-semibold">ℹ️</span>
          <div className="flex-1 text-gray-700">
            <span className="font-medium">Международни новини:</span> Статиите са от авторитетни международни източници и са на английски език. 
            Работим по добавяне на български пчеларски новини.
          </div>
        </div>
      )}

      <div className="space-y-4">
        {items.map((n) => (
          <Link
            key={n.id}
            href={n.link || `/news/${n.id}`}
            target={n.link ? '_blank' : undefined}
            rel={n.link ? 'noopener noreferrer' : undefined}
            className="block group"
          >
            <article className="bg-white rounded-lg shadow overflow-hidden transition-shadow hover:shadow-md">
              {n.cover && (
                <div
                  className="h-32 bg-cover bg-center"
                  style={{ backgroundImage: `url(${n.cover})` }}
                />
              )}
              <div className="p-4">
                <div className="flex items-start gap-2 mb-2">
                  <h4 className="font-semibold group-hover:text-amber-600 transition-colors flex-1">
                    {n.title}
                  </h4>
                  {/* Language badge */}
                  <span className="shrink-0 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full border border-gray-200">
                    🇬🇧 EN
                  </span>
                </div>
                <p className="text-gray-600 text-sm mt-1">{n.summary}</p>
                {n.source && (
                  <p className="text-xs text-gray-400 mt-2">
                    📰 {n.source}
                    {n.readingMinutes && ` • ${n.readingMinutes} мин четене`}
                  </p>
                )}
              </div>
            </article>
          </Link>
        ))}
      </div>
    </div>
  );
}
