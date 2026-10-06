"use client";

import { useEffect, useState } from "react";
import { saveFamilyLanguage } from "@/lib/services/settings-service";

export type LiioLanguage = "pt" | "en" | "es" | "de";

export const LIIO_LANGUAGE_STORAGE_KEY = "liio-ui-language";

export const liioLanguages: LiioLanguage[] = ["pt", "en", "es", "de"];

export function useLiioLanguage() {
  const [language, setLanguageState] = useState<LiioLanguage>("en");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(
        LIIO_LANGUAGE_STORAGE_KEY,
      ) as LiioLanguage | null;

      if (stored && liioLanguages.includes(stored)) {
        setLanguageState(stored);
      }
    } catch {
      setLanguageState("en");
    } finally {
      setReady(true);
    }
  }, []);

  function setLanguage(nextLanguage: LiioLanguage) {
    setLanguageState(nextLanguage);

    try {
      window.localStorage.setItem(
        LIIO_LANGUAGE_STORAGE_KEY,
        nextLanguage,
      );

      window.dispatchEvent(
        new CustomEvent("liio-language-change", {
          detail: nextLanguage,
        }),
      );

      void saveFamilyLanguage(nextLanguage);
    } catch {
      // Keep the selected language in memory if browser storage is unavailable.
    }
  }

  useEffect(() => {
    function handleLanguageChange(event: Event) {
      const nextLanguage = (event as CustomEvent<LiioLanguage>).detail;

      if (liioLanguages.includes(nextLanguage)) {
        setLanguageState(nextLanguage);
      }
    }

    window.addEventListener(
      "liio-language-change",
      handleLanguageChange,
    );

    return () =>
      window.removeEventListener(
        "liio-language-change",
        handleLanguageChange,
      );
  }, []);

  return {
    language,
    setLanguage,
    ready,
  };
}
