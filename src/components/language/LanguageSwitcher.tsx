"use client";

import { useLocale, useTranslations } from "next-intl";
import { useLocaleController, type Locale } from "@/context/LocaleProvider";

const SUPPORTED_LOCALES: Locale[] = ["bg", "en"];
const FLAG_ICON: Record<Locale, string> = {
  bg: "🇧🇬",
  en: "🇬🇧",
};

export default function LanguageSwitcher() {
  const { setLocale } = useLocaleController();
  const locale = useLocale() as Locale;
  const t = useTranslations("common");

  const labels: Record<Locale, string> = {
    bg: t("language.bg"),
    en: t("language.en"),
  };

  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="sr-only">{t("languageSwitcher.label")}</span>
      <select
        aria-label={t("languageSwitcher.label")}
        title={labels[locale]}
        value={locale}
        onChange={(event) => setLocale(event.target.value as Locale)}
        className="rounded-lg border px-2 py-1 text-base"
      >
        {SUPPORTED_LOCALES.map((loc) => (
          <option key={loc} value={loc} aria-label={labels[loc]}>
            {FLAG_ICON[loc]}
          </option>
        ))}
      </select>
    </label>
  );
}
