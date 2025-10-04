import React, { createContext, useContext, ReactNode } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Language } from '../types';
import { en, tr } from '../i18n/locales';

const translations = { en, tr };

interface I18nContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, variables?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useLocalStorage<Language>('language', 'tr');

  const t = (key: string, variables?: Record<string, string | number>): string => {
    let translation = key.split('.').reduce((acc, currentKey) => {
      if (acc && typeof acc === 'object' && currentKey in acc) {
        return (acc as any)[currentKey];
      }
      return undefined;
    }, translations[language]) as string | undefined;

    if (translation === undefined) {
      console.warn(`Translation not found for key: ${key}`);
      return key;
    }

    if (variables) {
      Object.keys(variables).forEach(varKey => {
        const regex = new RegExp(`\\{\\{\\s*${varKey}\\s*\\}\\}`, 'g');
        translation = translation!.replace(regex, String(variables[varKey]));
      });
    }

    return translation;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = (): I18nContextType => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};
