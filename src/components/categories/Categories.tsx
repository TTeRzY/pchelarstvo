import Link from "next/link";

type CategoryItem = {
  id: number | string;
  title: string;
  img?: string;
  price?: string | number | null;
  href?: string;
  description?: string;
};

export default function Categories({ items }: { items: CategoryItem[] }) {
  return (
    <section aria-labelledby="categories-title" className="mt-6">
      <div className="flex flex-wrap gap-4">
        {items.map((c) => {
          const CardWrapper = c.href ? Link : 'div';
          const wrapperProps = c.href ? { href: c.href } : {};
          
          return (
            <CardWrapper
              key={c.id}
              {...wrapperProps}
              className="group flex-1 min-w-[200px] max-w-[280px] bg-white rounded-2xl shadow hover:shadow-md transition overflow-hidden cursor-pointer"
            >
              <article>
                {/* Image */}
                <div
                  className="h-28 bg-gray-200 bg-cover bg-center relative"
                  style={{
                    backgroundImage: `url(${
                      c.img ?? "https://placehold.co/600x400?text=Category"
                    })`,
                  }}
                >
                  {c.href && (
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                  )}
                </div>
                {/* Content */}
                <div className="p-4">
                  <h4 className="font-bold text-gray-900 group-hover:text-amber-600 transition-colors">
                    {c.title}
                  </h4>
                  {c.description && (
                    <p className="text-sm text-gray-600 mt-1">{c.description}</p>
                  )}
                  {c.price !== undefined && c.price !== null && (
                    <div className="mt-1 font-extrabold text-amber-600">
                      {c.price}
                    </div>
                  )}
                  {c.href && (
                    <div className="mt-2 text-xs text-amber-600 group-hover:translate-x-1 transition-transform inline-block">
                      Виж ресурсите →
                    </div>
                  )}
                </div>
              </article>
            </CardWrapper>
          );
        })}
      </div>
    </section>
  );
}