import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../translations';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: typeof TRANSLATIONS.ar;
  isRtl: boolean;
  /** Pick a value by language: L(arabic, french, english) */
  L: <T,>(ar: T, fr: T, en: T) => T;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>(() => {
    const saved = localStorage.getItem('moullbazar_lang') as Language;
    return saved === 'fr' || saved === 'en' ? saved : 'ar'; // Default Arabic
  });

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('moullbazar_lang', newLang);
  };

  const isRtl = lang === 'ar';
  const t = TRANSLATIONS[lang] as typeof TRANSLATIONS.ar;
  const L = <T,>(ar: T, fr: T, en: T): T => (lang === 'ar' ? ar : lang === 'fr' ? fr : en);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.title = t.metaTitle;
  }, [lang, isRtl, t]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, isRtl, L }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
