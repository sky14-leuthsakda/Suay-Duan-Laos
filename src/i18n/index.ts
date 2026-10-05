import lo from './lo.json';
import en from './en.json';
import { useAppStore } from '../stores/appStore';
import { useCallback } from 'react';

export type Language = 'lo' | 'en';

const translations = { lo, en };

let currentLang: Language = 'lo';

export const setLanguage = (lang: Language) => {
  currentLang = lang;
  if (typeof document !== 'undefined') {
    document.documentElement.lang = lang;
  }
};

export const getLanguage = (): Language => currentLang;

export const t = (key: string, lang: Language = currentLang): string => {
  const parts = key.split('.');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let current: any = translations[lang] || translations.lo;
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      return key;
    }
  }
  return typeof current === 'string' ? current : key;
};

export const useTranslation = () => {
  const language = useAppStore((s) => s.language);
  const translate = useCallback((key: string) => t(key, language), [language]);
  return { t: translate, language };
};
