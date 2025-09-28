"use client";

import PageShell from "@/components/layout/PageShell";
import ApiariesMapClient from "@/components/map/ApiariesMap"; // С‚РІРѕСЏ РєР°СЂС‚РѕРІР° РёРјРїР»РµРјРµРЅС‚Р°С†РёСЏ
import { useAuth } from "@/context/AuthProvider";
import { useModal } from "@/components/modal/ModalProvider"; // Р·Р° login modal РїСЂРё РіРѕСЃС‚Рё
import AddApiaryModal from "@/components/map/AddApiaryModal";
import { useEffect, useMemo, useState } from "react";
import { apiariesSample, type Apiary } from "@/data/apiaries";

type ViewMode = "clusters" | "heatmap" | "points";

export default function MapPage() {
  const { user } = useAuth();
  const { open: openAuthModal } = useModal();

  // Р»РѕРєР°Р»РЅРѕ СЃСЉСЃС‚РѕСЏРЅРёРµ (РґРѕ Р±РµРєРµРЅРґ)
  const [apiaries, setApiaries] = useState<Apiary[]>(apiariesSample);
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState<string | "Р’СЃРёС‡РєРё">("Р’СЃРёС‡РєРё");
  const [flora, setFlora] = useState<string | "Р’СЃРёС‡РєРё">("Р’СЃРёС‡РєРё");
  const [visibility, setVisibility] = useState<"Р’СЃРёС‡РєРё" | "public" | "unlisted">("Р’СЃРёС‡РєРё");
  const [view, setView] = useState<ViewMode>("clusters");
  const [selected, setSelected] = useState<Apiary | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [defaultCoords, setDefaultCoords] = useState<{lat:number; lng:number} | null>(null);

  useEffect(() => {
    // РїСЂРёРјРµСЂ: РІР·РµРјРё С‚РµРєСѓС‰Р° РїРѕР·РёС†РёСЏ Р·Р° default coords РїСЂРё РґРѕР±Р°РІСЏРЅРµ
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setDefaultCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setDefaultCoords(null)
      );
    }
  }, []);

  const regions = useMemo(() => {
    const set = new Set(apiaries.map(a => a.region).filter(Boolean) as string[]);
    return ["Р’СЃРёС‡РєРё", ...Array.from(set)];
  }, [apiaries]);

  const floras = useMemo(() => {
    const set = new Set<string>();
    apiaries.forEach(a => (a.flora ?? []).forEach(f => set.add(f)));
    return ["Р’СЃРёС‡РєРё", ...Array.from(set)];
  }, [apiaries]);

  const filtered = useMemo(() => {
    let arr = [...apiaries];
    if (query.trim()) {
      const s = query.toLowerCase();
      arr = arr.filter(a =>
        a.name.toLowerCase().includes(s) ||
        (a.region ?? "").toLowerCase().includes(s) ||
        (a.notes ?? "").toLowerCase().includes(s) ||
        (a.flora ?? []).some(f => f.toLowerCase().includes(s))
      );
    }
    if (region !== "Р’СЃРёС‡РєРё") arr = arr.filter(a => a.region === region);
    if (flora !== "Р’СЃРёС‡РєРё") arr = arr.filter(a => (a.flora ?? []).includes(flora));
    if (visibility !== "Р’СЃРёС‡РєРё") arr = arr.filter(a => a.visibility === visibility);
    return arr;
  }, [apiaries, query, region, flora, visibility]);

  function handleAddClicked() {
    if (!user) {
      openAuthModal("login");
      return;
    }
    setAddOpen(true);
  }

  function handleCreate(a: Apiary) {
    // РїСЂРё СЂРµР°Р»РµРЅ Р±РµРєРµРЅРґ: POST /api/apiaries в†’ РїРѕСЃР»Рµ refresh
    setApiaries(prev => [a, ...prev]);
    setSelected(a);
  }

  return (
    <PageShell
      left={
        <aside className="flex flex-col gap-6" aria-label="Р¤РёР»С‚СЂРё РЅР° РєР°СЂС‚Р°С‚Р°">
          {/* Р¤РёР»С‚СЂРё */}
          <section className="rounded-2xl border p-4">
            <h2 className="text-lg font-semibold">Р¤РёР»С‚СЂРё</h2>
            <div className="mt-3 flex flex-col gap-3">
              <input
                className="rounded-xl border px-3 py-2 text-sm"
                placeholder="РўСЉСЂСЃРё РїРѕ РёРјРµ, СЂРµРіРёРѕРЅ, РїР°С€Р°вЂ¦"
                value={query}
                onChange={(e)=>setQuery(e.target.value)}
              />
              <select className="rounded-xl border px-3 py-2 text-sm" value={region} onChange={(e)=>setRegion(e.target.value as any)}>
                {regions.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              <select className="rounded-xl border px-3 py-2 text-sm" value={flora} onChange={(e)=>setFlora(e.target.value as any)}>
                {floras.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
              <select className="rounded-xl border px-3 py-2 text-sm" value={visibility} onChange={(e)=>setVisibility(e.target.value as any)}>
                <option value="Р’СЃРёС‡РєРё">Р’СЃРёС‡РєРё</option>
                <option value="public">РџСѓР±Р»РёС‡РЅРё</option>
                <option value="unlisted">РЎРєСЂРёС‚Рѕ</option>
              </select>
            </div>
          </section>

          {/* Р‘СЉСЂР·Рё СЂРµСЃСѓСЂСЃРё */}
          <section className="rounded-2xl border p-4">
            <h2 className="text-lg font-semibold">Р‘СЉСЂР·Рё СЂРµСЃСѓСЂСЃРё</h2>
            <ul className="mt-3 text-sm space-y-2">
              <li><a className="hover:underline" href="/epord">Р•РџРћР Р” РёР·РІРµСЃС‚РёСЏ</a></li>
              <li><a className="hover:underline" href="/directory">Р”РёСЂРµРєС‚РѕСЂРёСЏ РїС‡РµР»Р°СЂРё</a></li>
              <li><a className="hover:underline" href="/knowledge">РџСЂР°РєС‚РёРєРё РїРѕ СЃРµР·РѕРЅРё</a></li>
            </ul>
          </section>
        </aside>
      }
      right={
        <aside className="flex flex-col gap-6" aria-label="Р”РµС‚Р°Р№Р»Рё Рё СЃСЉРІРµС‚Рё">
          {/* Р”РµС‚Р°Р№Р»Рё Р·Р° РёР·Р±СЂР°РЅ РїС‡РµР»РёРЅ */}
          <section className="rounded-2xl border p-5 shadow-sm">
            <h2 className="text-lg font-semibold">Р”РµС‚Р°Р№Р»Рё</h2>
            {!selected ? (
              <p className="text-sm text-gray-600 mt-2">РР·Р±РµСЂРё РїС‡РµР»РёРЅ РѕС‚ РєР°СЂС‚Р°С‚Р° РёР»Рё СЃРїРёСЃСЉРєР°.</p>
            ) : (
              <div className="mt-3 text-sm">
                <div className="font-semibold">{selected.name}</div>
                <div className="text-gray-600">{selected.region ?? "вЂ”"}</div>
                {selected.flora?.length ? <div className="mt-1">РџР°С€Р°: {selected.flora.join(", ")}</div> : null}
                {selected.hiveCount ? <div>РљРѕС€РµСЂРё: {selected.hiveCount}</div> : null}
                <div className="text-xs text-gray-500 mt-1">РћР±РЅРѕРІРµРЅРѕ: {new Date(selected.updatedAt).toLocaleDateString("bg-BG")}</div>
                {selected.notes && <div className="mt-2 text-gray-700">{selected.notes}</div>}
              </div>
            )}
          </section>

          {/* РџРѕРґСЃРєР°Р·РєРё/Р»РµРіРµРЅРґР° */}
          <section className="rounded-2xl border p-5 shadow-sm">
            <h2 className="text-lg font-semibold">Р›РµРіРµРЅРґР°</h2>
            <ul className="mt-2 text-sm space-y-1 text-gray-700">
              <li>вЂў РљР»СЉСЃС‚РµСЂРё: РїСЂРёР±Р»РёР¶Рё, Р·Р° РґР° РІРёРґРёС€ РѕС‚РґРµР»РЅРё РїС‡РµР»РёРЅРё</li>
              <li>вЂў Heatmap: РёРЅС‚РµРЅР·РёС‚РµС‚ РЅР° РїС‡РµР»РёРЅРё</li>
              <li>вЂў Public/Unlisted: РєРѕРЅС‚СЂРѕР» РЅР° РІРёРґРёРјРѕСЃС‚С‚Р°</li>
            </ul>
          </section>
        </aside>
      }
    >
      {/* Toolbar РЅР°Рґ РєР°СЂС‚Р°С‚Р° */}
      <section className="rounded-2xl border p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="font-semibold mr-auto">РљР°СЂС‚Р° РЅР° РїС‡РµР»РёРЅРёС‚Рµ</div>
          <div className="flex items-center gap-2 text-sm">
            <button
              onClick={()=>setView("clusters")}
              className={`rounded-xl border px-3 py-1 hover:bg-gray-50 ${view==="clusters"?"bg-gray-100":""}`}
            >
              РљР»СЉСЃС‚РµСЂРё
            </button>
            <button
              onClick={()=>setView("heatmap")}
              className={`rounded-xl border px-3 py-1 hover:bg-gray-50 ${view==="heatmap"?"bg-gray-100":""}`}
            >
              Heatmap
            </button>
            <button
              onClick={()=>setView("points")}
              className={`rounded-xl border px-3 py-1 hover:bg-gray-50 ${view==="points"?"bg-gray-100":""}`}
            >
              РўРѕС‡РєРё
            </button>
            <div className="w-px h-6 bg-gray-200" />
            <button
              onClick={()=>defaultCoords && setSelected({
                id:"preview",
                name:"РњРѕСЏ РїРѕР·РёС†РёСЏ",
                lat: defaultCoords.lat, lng: defaultCoords.lng,
                visibility:"unlisted", updatedAt: new Date().toISOString()
              })}
              className="rounded-xl border px-3 py-1 hover:bg-gray-50"
              title="Р›РѕРєР°Р»РёР·РёСЂР°Р№ РјРµ"
            >
              РњРѕРµС‚Рѕ РјРµСЃС‚РѕРїРѕР»РѕР¶РµРЅРёРµ
            </button>
          </div>
          
          {user && (
            <button
              onClick={handleAddClicked}
              className="rounded-xl bg-amber-500 px-3 py-2 text-sm font-medium text-gray-900 hover:bg-amber-400"
            >
              Р”РѕР±Р°РІРё РїС‡РµР»РёРЅ
            </button>
          )}
        </div>
      </section>

      {/* РћСЃРЅРѕРІРЅР° СЃРµРєС†РёСЏ: РєР°СЂС‚Р° + СЃРїРёСЃСЉРє (Р·Р° РјРѕР±РёР»РЅРѕ вЂ“ РїР°РґР° РїРѕРґ РєР°СЂС‚Р°С‚Р°) */}
      <section className="flex flex-col gap-6">
        <div className="rounded-2xl border shadow-sm overflow-hidden">
          {/* РўСѓРє РїРѕРґР°Р№ filtered + view РєСЉРј СЂРµР°Р»РЅР°С‚Р° РєР°СЂС‚Р°, Рё callback Р·Р° select */}
          <ApiariesMapClient
            // @ts-ignore вЂ“ Р·Р°РІРёСЃРё РѕС‚ С‚РІРѕСЏС‚Р° РёРјРїР»РµРјРµРЅС‚Р°С†РёСЏ
            items={filtered}
            viewMode={view}
            onSelect={(a: Apiary) => setSelected(a)}
          />
        </div>

        {/* РЎРїРёСЃСЉРє (РєРѕРјРїР°РєС‚РµРЅ) */}
        <div className="flex flex-wrap gap-4">
          {filtered.map(a => (
            <button
              key={a.id}
              onClick={()=>setSelected(a)}
              className="text-left flex-1 min-w-[240px] max-w-[320px] rounded-2xl border p-4 hover:shadow-sm"
            >
              <div className="text-sm font-semibold">{a.name}</div>
              <div className="text-xs text-gray-600">{a.region ?? "вЂ”"} вЂў {a.visibility === "public" ? "РџСѓР±Р»РёС‡РµРЅ" : "РЎРєСЂРёС‚"}</div>
              {a.flora?.length ? <div className="text-xs text-gray-600 mt-1">РџР°С€Р°: {a.flora.join(", ")}</div> : null}
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="text-sm text-gray-600">РќСЏРјР° СЂРµР·СѓР»С‚Р°С‚Рё РїРѕ С‚РµРєСѓС‰РёС‚Рµ С„РёР»С‚СЂРё.</div>
          )}
        </div>
      </section>

      {/* РњРѕРґР°Р» Р·Р° РґРѕР±Р°РІСЏРЅРµ */}
      { user && <AddApiaryModal
        open={addOpen}
        onClose={()=>setAddOpen(false)}
        onCreate={handleCreate}
        defaultCoords={defaultCoords}
      /> }
    </PageShell>
  );
}
