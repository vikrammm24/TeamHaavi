import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';

export type LocaleCode = 'en' | 'es' | 'hi' | 'fr' | 'mr' | 'te';

interface LocaleContextValue {
  locale: LocaleCode;
  setLocale: (loc: LocaleCode) => void;
  /**
   * Translate a key. If translation is missing in current locale it falls back to English.
   * If annotateFallback = true and we had to fallback, " [EN]" will be appended.
   */
  t: (key: string, vars?: Record<string, string | number>, annotateFallback?: boolean) => string;
  /** Return true if key not present in current locale but exists in English */
  isFallback: (key: string) => boolean;
  available: LocaleCode[];
}

const STORAGE_KEY = 'locale:selected';

const RESOURCES: Record<LocaleCode, Record<string, string>> = {
  en: {
    'app.loading': 'Loading CityConnect...',
    'issue.report.title': 'Report an Issue',
    'issue.field.title': 'Issue Title',
    'issue.submit.success': 'Issue Reported Successfully',
    'points.bonus.firstReport': 'First report bonus: +{points} pts!',
  },
  es: {
    'app.loading': 'Cargando CityConnect...',
    'issue.report.title': 'Reportar un problema',
    'issue.field.title': 'Título del problema',
    'issue.submit.success': 'Problema reportado con éxito',
    'points.bonus.firstReport': 'Bono primer reporte: +{points} pts!',
  },
  hi: {
    'app.loading': 'CityConnect लोड हो रहा है...',
    'issue.report.title': 'समस्या रिपोर्ट करें',
    'issue.field.title': 'समस्या का शीर्षक',
    'issue.submit.success': 'समस्या सफलतापूर्वक दर्ज हुई',
    'points.bonus.firstReport': 'पहली रिपोर्ट बोनस: +{points} अंक!',
  },
  fr: {
    'app.loading': 'Chargement de CityConnect...',
    'issue.report.title': 'Signaler un problème',
    'issue.field.title': 'Titre du problème',
    'issue.submit.success': 'Problème signalé avec succès',
    'points.bonus.firstReport': 'Bonus premier signalement : +{points} pts !',
  },
  mr: {
    'app.loading': 'CityConnect लोड होत आहे...',
    'issue.report.title': 'समस्या नोंदवा',
    'issue.field.title': 'समस्येचे शीर्षक',
    'issue.submit.success': 'समस्या यशस्वीरित्या नोंदली गेली',
    'points.bonus.firstReport': 'पहिला अहवाल बोनस: +{points} गुण!',
  },
  te: {
    'app.loading': 'CityConnect లోడ్ అవుతోంది...',
    'issue.report.title': 'సమస్యను నివేదించండి',
    'issue.field.title': 'సమస్య శీర్షిక',
    'issue.submit.success': 'సమస్య విజయవంతంగా నమోదు చేయబడింది',
    'points.bonus.firstReport': 'మొదటి నివేదిక బోనస్: +{points} పాయింట్లు!',
  },
};

const LocaleContext = createContext<LocaleContextValue | undefined>(undefined);

export const LocaleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<LocaleCode>(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as LocaleCode | null;
  if (stored && ['en','es','hi','fr','mr','te'].includes(stored)) return stored as LocaleCode;
    return 'en';
  });

  const setLocale = useCallback((loc: LocaleCode) => {
    setLocaleState(loc);
    localStorage.setItem(STORAGE_KEY, loc);
  }, []);

  useEffect(() => {
    // Could plug in automatic browser language detection here.
  }, []);

  const t = useCallback<LocaleContextValue['t']>((key, vars, annotateFallback) => {
    const dict = RESOURCES[locale] || RESOURCES.en;
    const raw = dict[key];
    const usingFallback = raw === undefined && RESOURCES.en[key] !== undefined;
    let value = raw !== undefined ? raw : (RESOURCES.en[key] !== undefined ? RESOURCES.en[key] : key);
    if (vars) {
      for (const k of Object.keys(vars)) {
        value = value.replace(new RegExp(`{${k}}`, 'g'), String(vars[k]));
      }
    }
    if (annotateFallback && usingFallback && locale !== 'en') {
      value += ' [EN]';
    }
    return value;
  }, [locale]);

  const isFallback = useCallback<LocaleContextValue['isFallback']>((key) => {
    if (locale === 'en') return false;
    const dict = RESOURCES[locale];
    return dict && dict[key] === undefined && RESOURCES.en[key] !== undefined;
  }, [locale]);

  const value = useMemo<LocaleContextValue>(() => ({
    locale,
    setLocale,
    t,
    isFallback,
  available: ['en', 'es', 'hi', 'fr', 'mr', 'te'],
  }), [locale, setLocale, t, isFallback]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
};

export default LocaleContext;
