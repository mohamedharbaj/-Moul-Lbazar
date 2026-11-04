import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../translations';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: typeof TRANSLATIONS.ar;
  isRtl: boolean;
  L: <T,>(ar: T, fr: T, en: T) => T;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// قراءة اللغة بشكل آمن
const getSavedLanguage = (): Language => {
  try {
    const saved = localStorage.getItem('moullbazar_lang');

    if (saved === 'fr' || saved === 'en') {
      return saved;
    }
  } catch (error) {
    console.warn('Could not access saved language:', error);
  }

  return 'ar';
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>(getSavedLanguage);

  const setLang = (newLang: Language) => {
    setLangState(newLang);

    try {
      localStorage.setItem('moullbazar_lang', newLang);
    } catch (error) {
      console.warn('Could not save language:', error);
    }
  };

  const isRtl = lang === 'ar';
  const t = TRANSLATIONS[lang] as typeof TRANSLATIONS.ar;

  const L = <T,>(ar: T, fr: T, en: T): T => {
    return lang === 'ar' ? ar : lang === 'fr' ? fr : en;
  };

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';

    if (t?.metaTitle) {
      document.title = t.metaTitle;
    }
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
