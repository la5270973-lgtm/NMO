/**
 * NMO | نمو — Child Growth Application
 * Language & Localization Context Provider
 * Founder: Dr. Hasan Abdulzahra Al_Zaidi
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Direction, Language, TranslationDictionary } from './types.ts';
import { translations } from './translations.ts';
import {
  formatDisplayDate,
  formatChildAge,
  UnitSystem,
  formatHeight,
  formatWeight,
  formatHeadCircumference,
  formatBMI,
  formatMedicalValue,
  cleanPercentile,
  formatPercentileDisplay,
} from './formatters.ts';
import { AgeCalculationResult } from '../types/growth.ts';

interface LanguageContextType {
  language: Language;
  direction: Direction;
  isRTL: boolean;
  unitSystem: UnitSystem;
  setLanguage: (lang: Language) => void;
  setUnitSystem: (system: UnitSystem) => void;
  t: (key: keyof TranslationDictionary) => string;
  formatDate: (isoDate: string) => string;
  formatAge: (age: AgeCalculationResult) => string;
  formatHeightVal: (cmVal: number | string | undefined) => string;
  formatWeightVal: (kgVal: number | string | undefined) => string;
  formatHCVal: (cmVal: number | string | undefined) => string;
  formatBMIVal: (bmiVal: number | string | undefined) => string;
  formatPercentile: (val: number | string | undefined | null) => string;
  cleanPercentileVal: (val: number | string | undefined | null) => string;
}

const STORAGE_KEY = 'nmo_preferred_language';
const UNITS_STORAGE_KEY = 'nmo_preferred_units';

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Requirement: Default language must strictly be Arabic ('ar')
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'en' || saved === 'ar') {
        return saved;
      }
    } catch {
      // ignore storage access issues
    }
    return 'ar'; // Default is always Arabic
  });

  // Requirement: Metric must remain the default
  const [unitSystem, setUnitSystemState] = useState<UnitSystem>(() => {
    try {
      const saved = localStorage.getItem(UNITS_STORAGE_KEY);
      if (saved === 'metric' || saved === 'imperial') {
        return saved;
      }
    } catch {
      // ignore
    }
    return 'metric'; // Default is Metric
  });

  const direction: Direction = language === 'ar' ? 'rtl' : 'ltr';
  const isRTL = direction === 'rtl';

  const setLanguage = (newLang: Language) => {
    setLanguageState(newLang);
    try {
      localStorage.setItem(STORAGE_KEY, newLang);
    } catch {
      // ignore
    }
  };

  const setUnitSystem = (system: UnitSystem) => {
    setUnitSystemState(system);
    try {
      localStorage.setItem(UNITS_STORAGE_KEY, system);
    } catch {
      // ignore
    }
  };

  // Sync document element attributes immediately
  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = direction;
    if (language === 'ar') {
      document.title = 'نمو | NMO — متابعة نمو الأطفال وفق معايير منظمة الصحة العالمية';
    } else {
      document.title = 'NMO | نمو — Child Growth Monitoring Based on WHO Standards';
    }
  }, [language, direction]);

  const t = (key: keyof TranslationDictionary): string => {
    const dict = translations[language] || translations.ar;
    return dict[key] || translations.ar[key] || String(key);
  };

  const formatDate = (isoDate: string): string => {
    return formatDisplayDate(isoDate, language);
  };

  const formatAge = (age: AgeCalculationResult): string => {
    return formatChildAge(age, language);
  };

  const formatHeightVal = (cmVal: number | string | undefined): string => {
    return formatHeight(cmVal, unitSystem);
  };

  const formatWeightVal = (kgVal: number | string | undefined): string => {
    return formatWeight(kgVal, unitSystem);
  };

  const formatHCVal = (cmVal: number | string | undefined): string => {
    return formatHeadCircumference(cmVal, unitSystem);
  };

  const formatBMIVal = (bmiVal: number | string | undefined): string => {
    return formatBMI(bmiVal);
  };

  const formatPercentile = (val: number | string | undefined | null): string => {
    return formatPercentileDisplay(val, language);
  };

  const cleanPercentileVal = (val: number | string | undefined | null): string => {
    return cleanPercentile(val);
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        direction,
        isRTL,
        unitSystem,
        setLanguage,
        setUnitSystem,
        t,
        formatDate,
        formatAge,
        formatHeightVal,
        formatWeightVal,
        formatHCVal,
        formatBMIVal,
        formatPercentile,
        cleanPercentileVal,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
}
