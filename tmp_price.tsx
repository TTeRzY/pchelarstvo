"use client";

import { useMemo } from "react";
import {
  ResponsiveContainer, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from "recharts";

type RowTriplet = { date: string; min: number; max: number; avg: number };
type RowSingle  = { t: string; v: number };

function toLabel(iso?: string) {
  if (!iso) return "";
  // РїРѕРєР°Р·РІР°РјРµ "РњРњ-Р”Р”" Р·Р° РєРѕРјРїР°РєС‚РЅРѕСЃС‚
  try {
    return iso.slice(5, 10);
  } catch {
    return iso;
  }
}

export default function PriceChart({
  data,
  title = "РђРєР°С†РёРµРІ РјРµРґ (Р»РІ/РєРі)",
}: {
  data: Array<RowTriplet | RowSingle>;
  title?: string;
}) {
  // РќРѕСЂРјР°Р»РёР·РёСЂР°РјРµ Рё РґРІР°С‚Р° С„РѕСЂРјР°С‚Р° РґРѕ { label, min, avg, max }
  const formatted = useMemo(() => {
    if (!Array.isArray(data)) return [];

    return data.map((d: any) => {
      // РџРѕРґРґСЉСЂР¶Р° Рё {date,...} Рё {t,v}
      const iso = typeof d.date === "string" ? d.date : d.t;
      const label = toLabel(iso);

      // РђРєРѕ РёРјР°РјРµ min/avg/max -> РёР·РїРѕР»Р·РІР°РјРµ С‚СЏС…; РёРЅР°С‡Рµ РґСѓР±Р»РёСЂР°РјРµ v
      const hasTriplet = typeof d.min === "number" && typeof d.avg === "number" && typeof d.max === "number";
      const min = hasTriplet ? d.min : typeof d.v === "number" ? d.v : null;
      const avg = hasTriplet ? d.avg : typeof d.v === "number" ? d.v : null;
      const max = hasTriplet ? d.max : typeof d.v === "number" ? d.v : null;

      return { label, min, avg, max };
    }).filter(r => r.min != null && r.avg != null && r.max != null);
  }, [data]);

  const hasData = formatted.length > 0;

  return (
    <div className="bg-white shadow rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-extrabold uppercase text-sm">{title}</h3>
      </div>
      <div className="h-72">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={formatted} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} width={50} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="min" dot={false} strokeWidth={2} />
              <Line type="monotone" dataKey="avg" dot={false} strokeWidth={2} />
              <Line type="monotone" dataKey="max" dot={false} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-sm text-gray-500">
            РќСЏРјР° РґРѕСЃС‚Р°С‚СЉС‡РЅРѕ РґР°РЅРЅРё Р·Р° РІРёР·СѓР°Р»РёР·Р°С†РёСЏ.
          </div>
        )}
      </div>
    </div>
  );
}
