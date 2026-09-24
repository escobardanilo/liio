"use client";

import { createContext, useContext, useEffect, useMemo, useSyncExternalStore } from "react";
import { isLocale, translate, type Locale, type TranslationKey } from "../../lib/i18n/translations";

type LocaleContextValue = { locale: Locale; setLocale: (locale: Locale) => void; t: (key: TranslationKey, variables?: Record<string, string | number>) => string };
const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const locale = useSyncExternalStore(
    (onStoreChange) => {
      const notify = () => onStoreChange();
      window.addEventListener("storage", notify);
      window.addEventListener("son-locale-change", notify);
      return () => { window.removeEventListener("storage", notify); window.removeEventListener("son-locale-change", notify); };
    },
    () => {
      const saved = window.localStorage.getItem("son-locale");
      const browserLocale = window.navigator.language.slice(0, 2).toLowerCase();
      return isLocale(saved) ? saved : isLocale(browserLocale) ? browserLocale : "en";
    },
    () => "en" as Locale,
  );
  const setLocale = (nextLocale: Locale) => { window.localStorage.setItem("son-locale", nextLocale); window.dispatchEvent(new Event("son-locale-change")); };
  useEffect(() => { document.documentElement.lang = locale; }, [locale]);
  const value = useMemo<LocaleContextValue>(() => ({ locale, setLocale, t: (key, variables) => translate(locale, key, variables) }), [locale]);
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) throw new Error("useLocale must be used inside LocaleProvider.");
  return context;
}
