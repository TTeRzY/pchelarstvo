// components/layout/PageShell.tsx
export default function PageShell({
  left,
  right,
  children,
}: {
  left?: React.ReactNode;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-white">
      <div className="max-w-[1400px] mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {left ? (
            <aside className="w-full lg:sticky lg:top-6 lg:h-fit lg:max-w-[300px] flex-shrink-0 flex flex-col gap-6">
              {left}
            </aside>
          ) : null}

          <main className="flex-1 min-w-0 flex flex-col gap-8">{children}</main>

          {right ? (
            <aside className="w-full lg:max-w-[340px] flex-shrink-0 flex flex-col gap-6">
              {right}
            </aside>
          ) : null}
        </div>
      </div>
    </section>
  );
}
