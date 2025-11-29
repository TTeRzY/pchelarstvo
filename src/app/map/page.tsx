"use client";

import PageShell from "@/components/layout/PageShell";
import dynamic from "next/dynamic";
const ApiariesMapClient = dynamic(() => import("@/components/map/ApiariesMap"), { ssr: false });
import { useAuth } from "@/context/AuthProvider";
import AddApiaryModal from "@/components/map/AddApiaryModal";
import { useModal } from "@/components/modal/ModalProvider";
import { useEffect, useMemo, useState } from "react";
import { fetchApiaries, type Apiary } from "@/lib/apiaries";

export default function MapPage() {
  const { user } = useAuth();
  const { open } = useModal();

  // Данни
  const [apiaries, setApiaries] = useState<Apiary[]>([]);
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState<string | "Всички">("Всички");
  const [flora, setFlora] = useState<string | "Всички">("Всички");
  const [selected, setSelected] = useState<Apiary | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [defaultCoords, setDefaultCoords] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    // Текущо местоположение (ако е позволено)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setDefaultCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setDefaultCoords(null)
      );
    }
  }, []);

  useEffect(() => {
    fetchApiaries()
      .then(setApiaries)
      .catch(() => setApiaries([]));
  }, []);

  const regions = useMemo(() => {
    const set = new Set(apiaries.map((a) => a.region).filter(Boolean) as string[]);
    return ["Всички", ...Array.from(set)];
  }, [apiaries]);

  const floras = useMemo(() => {
    const set = new Set<string>();
    apiaries.forEach((a) => (a.flora ?? []).forEach((f) => set.add(f)));
    return ["Всички", ...Array.from(set)];
  }, [apiaries]);

  const filtered = useMemo(() => {
    let arr = [...apiaries];
    if (query.trim()) {
      const s = query.toLowerCase();
      arr = arr.filter(
        (a) =>
          a.name.toLowerCase().includes(s) ||
          (a.region ?? "").toLowerCase().includes(s) ||
          (a.flora ?? []).some((f) => f.toLowerCase().includes(s))
      );
    }
    if (region !== "Всички") arr = arr.filter((a) => a.region === region);
    if (flora !== "Всички") arr = arr.filter((a) => (a.flora ?? []).includes(flora));
    return arr;
  }, [apiaries, query, region, flora]);

  function handleAddClicked() {
    setAddOpen(true);
  }

  function handleCreate(a: Apiary) {
    // Add to local state (backend save is handled by AddApiaryModal)
    setApiaries((prev) => [a, ...prev]);
    setSelected(a);
  }

  return (
    <PageShell
      left={
        <aside className="flex flex-col gap-6" aria-label="Филтри за картата">
          {/* Филтри */}
          <section className="rounded-2xl border p-4">
            <h2 className="text-lg font-semibold">Филтри</h2>
            <div className="mt-3 flex flex-col gap-3">
              <input
                className="rounded-xl border px-3 py-2 text-sm"
                placeholder="Търсене по име, регион"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <select className="rounded-xl border px-3 py-2 text-sm" value={region} onChange={(e) => setRegion(e.target.value as any)}>
                {regions.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              <select className="rounded-xl border px-3 py-2 text-sm" value={flora} onChange={(e) => setFlora(e.target.value as any)}>
                {floras.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>
          </section>
        </aside>
      }
      right={
        <aside className="flex flex-col gap-6" aria-label="Подробности за избрания пчелин">
          {/* Подробности */}
          <section className="rounded-2xl border p-5 shadow-sm">
            <h2 className="text-lg font-semibold">Подробности за пчелина</h2>
            {!selected ? (
              <p className="text-sm text-gray-600 mt-2">Изберете пчелин от картата или списъка.</p>
            ) : (
              <div className="mt-3 text-sm">
                <div className="font-semibold">{selected.name}</div>
                <div className="mt-2 space-y-1">
                  {selected.apiaryNumber && (
                    <div>
                      <span className="text-gray-500">Регистрационен номер:</span> {selected.apiaryNumber}
                    </div>
                  )}
                  <div>
                    <span className="text-gray-500">Регион:</span> {selected.region ?? "—"}
                  </div>
                  <div>
                    <span className="text-gray-500">Населено място:</span> {selected.city ?? "—"}
                  </div>
                  <div>
                    <span className="text-gray-500">Адрес / местност:</span> {selected.address ?? "—"}
                  </div>
                  {selected.owner && (
                    <div>
                      <span className="text-gray-500">Собственик:</span> {selected.owner}
                    </div>
                  )}
                  {!selected.owner && selected.contact?.name && (
                    <div>
                      <span className="text-gray-500">Контакт:</span> {selected.contact.name}
                    </div>
                  )}
                  <div>
                    <span className="text-gray-500">Брой кошери:</span>{" "}
                    {typeof selected.hiveCount === "number" ? selected.hiveCount : "—"}
                  </div>
                </div>
                {selected.flora?.length ? (
                  <div className="mt-2">
                    <span className="text-gray-500">Флора:</span> {selected.flora.join(", ")}
                  </div>
                ) : null}
                {selected.updatedAt && (
                  <div className="text-xs text-gray-500 mt-2">
                    Обновено: {new Date(selected.updatedAt).toLocaleDateString("bg-BG")}
                  </div>
                )}
              </div>
            )}
          </section>
        </aside>
      }
    >
      {/* Лента с инструменти */}
      <section className="rounded-2xl border p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="font-semibold mr-auto">Преглед на пчелините</div>

          {user && (
            <button onClick={handleAddClicked} className="rounded-xl bg-amber-500 px-3 py-2 text-sm font-medium text-gray-900 hover:bg-amber-400">
                Добави пчелин
            </button>
          )}
          <button 
            onClick={() => open("reportTreatment")} 
            className="rounded-xl bg-orange-500 px-3 py-2 text-sm font-medium text-white hover:bg-orange-600"
            title="Съобщи за третиране с растителнозащитни препарати"
          >
              ⚠️ Съобщи за третиране
          </button>
        </div>
      </section>

      {/* Карта + списък */}
      <section className="flex flex-col gap-6">
        <div className="rounded-2xl border shadow-sm overflow-hidden">
          <ApiariesMapClient 
            pins={filtered
              .filter((a) => a.lat != null && a.lng != null && typeof a.lat === 'number' && typeof a.lng === 'number')
              .map((a) => ({ id: a.id, lat: a.lat!, lng: a.lng!, label: a.name }))} 
            heightClass="h-96" 
            scrollWheelZoom={true} 
          />
        </div>

        {/* Списък (по избор) */}
        <div className="flex flex-wrap gap-4">
          {filtered.map((a) => (
            <button
              key={a.id}
              onClick={() => setSelected(a)}
              className="text-left flex-1 min-w-[240px] max-w-[320px] rounded-2xl border p-4 hover:shadow-sm"
            >
              <div className="text-sm font-semibold">{a.name}</div>
              <div className="mt-2 space-y-1 text-xs text-gray-700">
                {a.apiaryNumber && (
                  <div>
                    <span className="text-gray-500">Регистрационен номер:</span> {a.apiaryNumber}
                  </div>
                )}
                <div>
                  <span className="text-gray-500">Регион:</span> {a.region ?? "—"}
                </div>
                <div>
                  <span className="text-gray-500">Населено място:</span> {a.city ?? "—"}
                </div>
                <div>
                  <span className="text-gray-500">Адрес / местност:</span> {a.address ?? "—"}
                </div>
                {a.owner && (
                  <div>
                    <span className="text-gray-500">Собственик:</span> {a.owner}
                  </div>
                )}
                {!a.owner && a.contact?.name && (
                  <div>
                    <span className="text-gray-500">Контакт:</span> {a.contact.name}
                  </div>
                )}
                <div>
                  <span className="text-gray-500">Брой кошери:</span>{" "}
                  {typeof a.hiveCount === "number" ? a.hiveCount : "—"}
                </div>
              </div>
              {a.flora?.length ? (
                <div className="text-xs text-gray-600 mt-1">Флора: {a.flora.join(", ")}</div>
              ) : null}
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="text-sm text-gray-600">Няма резултати за текущите филтри.</div>
          )}
        </div>
      </section>

      {/* Диалог за добавяне на пчелин */}
      <AddApiaryModal open={addOpen} onClose={() => setAddOpen(false)} onCreate={handleCreate} defaultCoords={defaultCoords} />
    </PageShell>
  );
}
