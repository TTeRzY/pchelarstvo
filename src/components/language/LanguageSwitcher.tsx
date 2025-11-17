"use client";

import { useState, useRef, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useLocaleController, type Locale } from "@/context/LocaleProvider";

const SUPPORTED_LOCALES: Locale[] = ["bg", "en"];
const FLAG_ICON: Record<Locale, string> = {
  bg: "/bg.svg",
  en: "/en.svg",
};

export default function LanguageSwitcher() {
  const { setLocale } = useLocaleController();
  const locale = useLocale() as Locale;
  const t = useTranslations("common");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const labels: Record<Locale, string> = {
    bg: t("language.bg"),
    en: t("language.en"),
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  function handleSelect(loc: Locale) {
    setLocale(loc);
    setIsOpen(false);
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={t("languageSwitcher.label")}
        title={labels[locale]}
        className="flex items-center gap-1.5 rounded-lg border border-black px-2.5 py-1.5 text-base text-black transition-colors"
      >
        <img 
          src={FLAG_ICON[locale]} 
          alt={labels[locale]}
          className="w-5 h-5 object-contain"
        />
        <span className="text-xs text-black uppercase font-medium">{locale}</span>
        <span className="text-black text-xs">▼</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[160px] overflow-hidden">
          {SUPPORTED_LOCALES.map((loc) => (
            <button
              key={loc}
              type="button"
              onClick={() => handleSelect(loc)}
              aria-label={labels[loc]}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${
                locale === loc ? "bg-gray-50 font-medium" : ""
              }`}
            >
              <img 
                src={FLAG_ICON[loc]} 
                alt={labels[loc]}
                className="w-5 h-5 object-contain"
              />
              <span className="text-gray-700">{labels[loc]}</span>
              {locale === loc && <span className="ml-auto text-blue-600">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
