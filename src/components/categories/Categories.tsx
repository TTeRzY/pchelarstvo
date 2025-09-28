type CategoryItem = {
  id: number | string;
  title: string;
  img?: string;
  price?: string | number | null;
};

export default function Categories({ items }: { items: CategoryItem[] }) {
  return (
    <section aria-labelledby="categories-title" className="mt-6">
      <div className="flex flex-wrap gap-4">
        {items.map((c) => (
          <article
            key={c.id}
            className="flex-1 min-w-[200px] max-w-[280px] bg-white rounded-2xl shadow hover:shadow-md transition overflow-hidden cursor-pointer"
          >
            {/* Image */}
            <div
              className="h-28 bg-gray-200 bg-cover bg-center"
              style={{
                backgroundImage: `url(${
                  c.img ?? "https://placehold.co/600x400?text=Category"
                })`,
              }}
            />
            {/* Content */}
            <div className="p-4">
              <h4 className="font-bold text-gray-900">{c.title}</h4>
              {c.price !== undefined && c.price !== null && (
                <div className="mt-1 font-extrabold text-amber-600">
                  {c.price}
                </div>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}