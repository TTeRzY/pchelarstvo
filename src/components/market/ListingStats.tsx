"use client";

import { useTranslations } from "next-intl";

type ListingStatsProps = {
  shown: number;
  total: number;
  average?: number;
  min?: number;
  max?: number;
  priceUnit: string;
  numberFormatter: Intl.NumberFormat;
};

export default function ListingStats({
  shown,
  total,
  average,
  min,
  max,
  priceUnit,
  numberFormatter,
}: ListingStatsProps) {
  const t = useTranslations("marketplace.listings.stats");

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-sm">
      <span className="font-medium text-gray-900">
        {t("showing", { shown, total })}
      </span>
      {average !== undefined && !isNaN(average) && (
        <span className="text-gray-600">
          {t("average", { price: `${numberFormatter.format(average)} ${priceUnit}` })}
        </span>
      )}
      {min !== undefined && max !== undefined && !isNaN(min) && !isNaN(max) && (
        <span className="text-gray-600">
          {t("range", { 
            min: `${numberFormatter.format(min)} ${priceUnit}`, 
            max: `${numberFormatter.format(max)} ${priceUnit}` 
          })}
        </span>
      )}
    </div>
  );
}

