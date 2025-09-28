"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { NextIntlClientProvider } from "next-intl";
import bgMessages from "@/i18n/messages/bg.json";
import enMessages from "@/i18n/messages/en.json";

type Messages = {
  bg: typeof bgMessages;
  en: typeof enMessages;
};

const allMessages: Messages = {
  bg: bgMessages,
  en: enMessages,
};

export type Locale = keyof Messages;

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
};

const LocaleContext = createContext<LocaleContextValue | undefined>(undefined);

export function useLocaleController() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useLocaleController must be used within LocaleProvider");
  }
  return context;
}

export default function LocaleProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [locale, setLocale] = useState<Locale>("bg");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("locale");
    if (stored === "bg" || stored === "en") {
      setLocale(stored);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("locale", locale);
    }
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  const value = useMemo(() => ({ locale, setLocale }), [locale]);

  return (
    <LocaleContext.Provider value={value}>
      <NextIntlClientProvider locale={locale} messages={allMessages[locale]}>
        {children}
      </NextIntlClientProvider>
    </LocaleContext.Provider>
  );
}