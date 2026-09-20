"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { translations, type Language, type Translations } from "@/src/lib/translations";

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "EN",
  setLang: () => {},
  toggleLang: () => {},
  t: translations.EN,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("bhuvista_lang") as Language;
      if (saved === "EN" || saved === "HI") {
        return saved;
      }
    }
    return "EN";
  });

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    if (typeof window !== "undefined") {
      localStorage.setItem("bhuvista_lang", newLang);
    }
  };

  const toggleLang = () => {
    const next = lang === "EN" ? "HI" : "EN";
    setLang(next);
  };

  const t = translations[lang] || translations.EN;

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
