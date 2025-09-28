"use client";

import PageShell from "@/components/layout/PageShell";

const stats = [
  { id: "apiaries", label: "Apiaries", value: "5" },
  { id: "years", label: "Years active", value: "10" },
  { id: "specialty", label: "Specialty", value: "Acacia honey" },
];

export default function PublicProfilePage() {
  return (
    <PageShell
      right={
        <section className="rounded-2xl border shadow-sm bg-white p-5 space-y-3">
          <h2 className="text-lg font-semibold">Get in touch</h2>
          <div className="text-sm text-gray-600">
            <p>Email: anton@pchelarstvo.bg</p>
            <p>Phone: +359 88 123 4567</p>
          </div>
          <button className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50">Send message</button>
          <p className="text-xs text-gray-500">
            Direct contact actions and verification badges are planned for v2.
          </p>
        </section>
      }
    >
      <section className="rounded-2xl border shadow-sm bg-white p-6 space-y-4">
        <div>
          <h1 className="text-2xl font-extrabold">Anton Terziyski</h1>
          <p className="text-sm text-gray-600">Samokov, Southwest Bulgaria</p>
          <p className="text-sm text-gray-600 mt-2">
            Beekeeper since 2015. Focused on mountain apiaries and certified production of acacia honey.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stats.map((item) => (
            <div key={item.id} className="rounded-2xl border bg-gray-50 p-4 text-center">
              <div className="text-xs uppercase tracking-wide text-gray-500">{item.label}</div>
              <div className="text-2xl font-bold mt-1">{item.value}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border shadow-sm bg-white p-6 space-y-3">
        <h2 className="text-lg font-semibold">Apiaries</h2>
        <p className="text-sm text-gray-600">
          We will show a map and list with public apiaries owned by the beekeeper. Data will load from the
          backend in the next iteration.
        </p>
        <div className="rounded-xl border border-dashed border-gray-300 p-6 text-sm text-gray-500">
          Map and apiary list (TODO)
        </div>
      </section>

      <section className="rounded-2xl border shadow-sm bg-white p-6 space-y-3">
        <h2 className="text-lg font-semibold">Recent listings</h2>
        <p className="text-sm text-gray-600">
          A lightweight feed with the beekeeper's latest marketplace listings will appear here in v2.
        </p>
        <div className="rounded-xl border border-dashed border-gray-300 p-6 text-sm text-gray-500">
          Listings feed (TODO)
        </div>
      </section>
    </PageShell>
  );
}

