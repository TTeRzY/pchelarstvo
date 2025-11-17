"use client";

import PageShell from "@/components/layout/PageShell";
import dynamic from "next/dynamic";
const ApiariesMapClient = dynamic(() => import("@/components/map/ApiariesMap"), { ssr: false });
import { useAuth } from "@/context/AuthProvider";
import AddApiaryModal from "@/components/map/AddApiaryModal";
import { useModal } from "@/components/modal/ModalProvider";
import { useEffect, useMemo, useState } from "react";
import { fetchApiaries, type Apiary } from "@/lib/apiaries";
import type { TreatmentReport } from "@/components/treatments/TreatmentTicker";

type ViewMode = "clusters" | "heatmap" | "points";

export default function MapPage() {
  const { user } = useAuth();
  const { open } = useModal();

  // Данни
  const [apiaries, setApiaries] = useState<Apiary[]>([]);
  const [treatments, setTreatments] = useState<TreatmentReport[]>([]);
  const [showTreatments, setShowTreatments] = useState(true);
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState<string | "Всички">("Всички");
  const [flora, setFlora] = useState<string | "Всички">("Всички");
  const [visibility, setVisibility] = useState<"Всички" | "public" | "unlisted">("Всички");
  const [view, setView] = useState<ViewMode>("clusters");
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

  useEffect(() => {
    fetch("/api/treatment-reports", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => setTreatments(data ?? []))
      .catch(() => setTreatments([]));
    
    const handler = () => {
      fetch("/api/treatment-reports", { cache: "no-store" })
        .then((res) => res.json())
        .then((data) => setTreatments(data ?? []))
        .catch(() => setTreatments([]));
    };
    window.addEventListener("treatment:updated", handler);
    return () => window.removeEventListener("treatment:updated", handler);
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
          (a.notes ?? "").toLowerCase().includes(s) ||
          (a.flora ?? []).some((f) => f.toLowerCase().includes(s))
      );
    }
    if (region !== "Всички") arr = arr.filter((a) => a.region === region);
    if (flora !== "Всички") arr = arr.filter((a) => (a.flora ?? []).includes(flora));
    if (visibility !== "Всички") arr = arr.filter((a) => a.visibility === visibility);
    return arr;
  }, [apiaries, query, region, flora, visibility]);

  function handleAddClicked() {
    setAddOpen(true);
  }

  function handleCreate(a: Apiary) {
    // TODO: Изпрати към бекенда и презареди
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
                placeholder="Търсене по име, регион, бележки"
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
              <select className="rounded-xl border px-3 py-2 text-sm" value={visibility} onChange={(e) => setVisibility(e.target.value as any)}>
                <option value="Всички">Всички</option>
                <option value="public">Публични</option>
                <option value="unlisted">Скрит</option>
              </select>
            </div>
          </section>

          {/* Бързи връзки */}
          <section className="rounded-2xl border p-4">
            <h2 className="text-lg font-semibold">Бързи връзки</h2>
            <ul className="mt-3 text-sm space-y-2">
              <li>
                <a className="hover:underline" href="/epord">
                  Справки (EPORD)
                </a>
              </li>
              <li>
                <a className="hover:underline" href="/directory">
                  Каталог на пчелини
                </a>
              </li>
              <li>
                <a className="hover:underline" href="/knowledge">
                  Знания и статии
                </a>
              </li>
            </ul>
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
                  <div>
                    <span className="text-gray-500">Код / номер:</span> {selected.code ?? "-"}
                  </div>
                  <div>
                    <span className="text-gray-500">Регион:</span> {selected.region ?? "—"}
                  </div>
                  <div>
                    <span className="text-gray-500">Населено място:</span> {selected.city ?? "—"}
                  </div>
                  <div>
                    <span className="text-gray-500">Адрес / местност:</span> {selected.address ?? "—"}
                  </div>
                  <div>
                    <span className="text-gray-500">Собственик / пчелар:</span>{" "}
                    {selected.owner ?? selected.contact?.name ?? "—"}
                  </div>
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
                {selected.notes && (
                  <div className="mt-2 text-gray-700">
                    <span className="text-gray-500">Бележки:</span> {selected.notes}
                  </div>
                )}
                {selected.updatedAt && (
                  <div className="text-xs text-gray-500 mt-2">
                    Обновено: {new Date(selected.updatedAt).toLocaleDateString("bg-BG")}
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Съвети */}
          <section className="rounded-2xl border p-5 shadow-sm">
            <h2 className="text-lg font-semibold">Съвети</h2>
            <ul className="mt-2 text-sm space-y-1 text-gray-700">
              <li>В режим „Клъстери“ маркерите се групират.</li>
              <li>Топлинната карта показва концентрации.</li>
              <li>Публични/Скрит контролира видимостта.</li>
            </ul>
          </section>
        </aside>
      }
    >
      {/* Лента с инструменти */}
      <section className="rounded-2xl border p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="font-semibold mr-auto">Преглед на пчелините</div>
          <div className="flex items-center gap-2 text-sm">
            <button onClick={() => setView("clusters")} className={`rounded-xl border px-3 py-1 hover:bg-gray-50 ${view === "clusters" ? "bg-gray-100" : ""}`}>
              Клъстери
            </button>
            <button onClick={() => setView("heatmap")} className={`rounded-xl border px-3 py-1 hover:bg-gray-50 ${view === "heatmap" ? "bg-gray-100" : ""}`}>
              Топлинна карта
            </button>
            <button onClick={() => setView("points")} className={`rounded-xl border px-3 py-1 hover:bg-gray-50 ${view === "points" ? "bg-gray-100" : ""}`}>
              Точки
            </button>
            <div className="w-px h-6 bg-gray-200" />
            <button 
              onClick={() => setShowTreatments(!showTreatments)} 
              className={`rounded-xl border px-3 py-1 hover:bg-gray-50 ${showTreatments ? "bg-red-50 border-red-300" : ""}`}
              title="Покажи/скрий сигнали за третиране"
            >
              {showTreatments ? "⚠️ Третирания" : "⚠️ Третирания (скрити)"}
            </button>
            <div className="w-px h-6 bg-gray-200" />
            <button
              onClick={() =>
                defaultCoords &&
                setSelected({
                  id: "preview",
                  name: "Моята позиция",
                  lat: defaultCoords.lat,
                  lng: defaultCoords.lng,
                  visibility: "unlisted",
                  updatedAt: new Date().toISOString(),
                })
              }
              className="rounded-xl border px-3 py-1 hover:bg-gray-50"
              title="Покажи моето местоположение"
            >
              Моето местоположение
            </button>
          </div>

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
          <ApiariesMapClient pins={filtered.map((a) => ({ id: a.id, lat: a.lat, lng: a.lng, label: a.name }))} heightClass="h-96" scrollWheelZoom={true} />
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
                <div>
                  <span className="text-gray-500">Код / номер:</span> {a.code ?? "-"}
                </div>
                <div>
                  <span className="text-gray-500">Регион:</span> {a.region ?? "—"}
                </div>
                <div>
                  <span className="text-gray-500">Населено място:</span> {a.city ?? "—"}
                </div>
                <div>
                  <span className="text-gray-500">Адрес / местност:</span> {a.address ?? "—"}
                </div>
                <div>
                  <span className="text-gray-500">Собственик / пчелар:</span>{" "}
                  {a.owner ?? a.contact?.name ?? "—"}
                </div>
                <div>
                  <span className="text-gray-500">Брой кошери:</span>{" "}
                  {typeof a.hiveCount === "number" ? a.hiveCount : "—"}
                </div>
              </div>
              {a.flora?.length ? (
                <div className="text-xs text-gray-600 mt-1">Флора: {a.flora.join(", ")}</div>
              ) : null}
              <div className="text-xs text-gray-600 mt-1">
                Видимост: {a.visibility === "public" ? "Публичен" : "Скрит"}
              </div>
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
