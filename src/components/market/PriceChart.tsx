"use client";

import { useMemo } from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

type RowTriplet = { date: string; min: number | string; max: number | string; avg: number | string };
type RowSingle = { t: string; v: number | string };

function toLabel(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(+d)) return iso;
  return d.toLocaleDateString("bg-BG", { month: "2-digit", day: "2-digit" });
}

export default function PriceChart({
  data,
  title = "Цена (лв./kg)",
}: {
  data: Array<RowTriplet | RowSingle>;
  title?: string;
}) {
  const formatted = useMemo(() => {
    if (!Array.isArray(data)) return [];
    return data
      .map((d: any) => {
        const iso = typeof d.date === "string" ? d.date : d.t;
        const label = toLabel(iso);
        let value: number | null = null;
        if (d.avg != null) {
          value = Number(d.avg);
        } else if (d.v != null) {
          value = Number(d.v);
        } else if (d.min != null && d.max != null) {
          value = (Number(d.min) + Number(d.max)) / 2;
        }
        if (value == null || Number.isNaN(value)) return null;
        return { label, value } as { label: string; value: number };
      })
      .filter(Boolean) as { label: string; value: number }[];
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
              <Tooltip formatter={(value: number) => `${value.toFixed(2)} лв./kg`} labelFormatter={(label) => `Дата: ${label}`} />
              <Line type="monotone" dataKey="value" dot={false} strokeWidth={2} stroke="#2563eb" name="Цена" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-sm text-gray-500">Няма данни за визуализация.</div>
        )}
      </div>
    </div>
  );
}
