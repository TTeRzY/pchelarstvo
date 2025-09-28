type NewsItem = {
  id: number | string;
  title: string;
  excerpt: string;
  img: string;
};

export default function NewsList({ items }: { items: NewsItem[] }) {
  return (
    <div>
      <div className="space-y-4">
        {items.map((n) => (
          <article
            key={n.id}
            className="bg-white rounded-lg shadow overflow-hidden"
          >
            <div
              className="h-32 bg-cover bg-center"
              style={{ backgroundImage: `url(${n.img})` }}
            />
            <div className="p-4">
              <h4 className="font-semibold">{n.title}</h4>
              <p className="text-gray-600 text-sm">{n.excerpt}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
