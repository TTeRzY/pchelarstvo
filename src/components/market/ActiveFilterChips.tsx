"use client";

import { useTranslations } from "next-intl";

type FilterChip = {
  key: string;
  label: string;
  value: string;
  onRemove: () => void;
};

type ActiveFilterChipsProps = {
  chips: FilterChip[];
  onClearAll: () => void;
};

export default function ActiveFilterChips({ chips, onClearAll }: ActiveFilterChipsProps) {
  const t = useTranslations("marketplace.filters");

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-200">
      <span className="text-xs font-medium text-gray-600">{t("active")}:</span>
      {chips.map((chip) => (
        <button
          key={chip.key}
          onClick={chip.onRemove}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-gray-300 text-sm hover:bg-gray-100 hover:border-gray-400 transition-colors"
        >
          <span className="text-gray-700">{chip.label}</span>
          <svg
            className="w-4 h-4 text-gray-500"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      ))}
      <button
        onClick={onClearAll}
        className="text-xs font-medium text-red-600 hover:text-red-700 underline ml-2"
      >
        {t("clearAll")}
      </button>
    </div>
  );
}

