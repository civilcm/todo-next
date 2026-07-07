"use client";

import { createContext, useContext, useEffect, type ReactNode } from "react";
import { translations, type Lang, type TranslationKey } from "@/lib/i18n";
import { useLocalStorageState } from "@/lib/useLocalStorageState";

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

const STORAGE_KEY = "todo-lang";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useLocalStorageState<Lang>(STORAGE_KEY, "ko");

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const t = (key: TranslationKey) => translations[lang][key];

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return ctx;
}
