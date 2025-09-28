"use client";

import { useMemo, useState } from "react";
import { calendarMonths, type MonthKey } from "@/data/calendar";
import { cn } from "@/lib/cd";

export default function BeekeeperCalendar() {
  const [active, setActive] = useState<MonthKey>(new Date().toLocaleString("bg-BG", { month: "long" }).toLowerCase() as MonthKey);

  const month = useMemo(() => {
    return calendarMonths[active] ?? Object.values(calendarMonths)[0];
  }, [active]);

  return (
    <section aria-labelledby="bee-cal-title" className="bg-white">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex items-end justify-between flex-wrap gap-3 mb-4">
          <h2 id="bee-cal-title" className="text-xl font-extrabold uppercase">Календар на пчеларя</h2>
          <div className="text-xs text-gray-500">
            Данните са ориентировъчни и зависят от район/времето.
          </div>
        </div>

        {/* Month tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 md:mx-0">
          {Object.values(calendarMonths).map((m) => (
            <button
              key={m.key}
              onClick={() => setActive(m.key)}
              className={cn(
                "shrink-0 px-3 py-1.5 rounded-full text-sm font-semibold border",
                active === m.key ? "bg-gray-900 text-white border-gray-900" : "bg-white hover:bg-gray-50"
              )}
              aria-pressed={active === m.key}
            >
              {m.title}
            </button>
          ))}
        </div>

        {/* Month content */}
        <div className="mt-4 bg-white rounded-2xl shadow p-5 space-y-4">
          <div>
            <h3 className="text-sm uppercase font-bold text-gray-700">Основни задачи</h3>
            <ul className="mt-2 list-disc list-inside space-y-1 text-sm text-gray-800">
              {month.tasks.map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ul>
          </div>

          {month.flow && (
            <div>
              <h3 className="text-sm uppercase font-bold text-gray-700">Цъфтеж / Паша</h3>
              <p className="mt-2 text-sm text-gray-800">{month.flow}</p>
            </div>
          )}

          {month.notes && (
            <div className="border-t pt-4">
              <p className="text-xs text-gray-500">{month.notes}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/** If you don't have a `cn` helper, replace `cn(...)` with a simple join:
 * className={[cond ? "a" : "b", "common"].join(" ")}
 */
