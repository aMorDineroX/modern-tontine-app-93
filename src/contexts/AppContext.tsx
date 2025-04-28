
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, translations, currencies } from '@/utils/translations';

/**
 * Interface représentant une devise
 *
 * @interface Currency
 * @property {string} code - Le code ISO de la devise (ex: USD, EUR)
 * @property {string} symbol - Le symbole de la devise (ex: $, €)
 * @property {string} name - Le nom complet de la devise (ex: US Dollar, Euro)
 */
type Currency = {
  code: string;
  symbol: string;
  name: string;
};

/**
 * Interface du contexte d'application
 *
 * @interface AppContextType
 * @property {Language} language - La langue actuelle de l'application
 * @property {(lang: Language) => void} setLanguage - Fonction pour changer la langue
 * @property {(key: keyof typeof translations.en) => string} t - Fonction de traduction
 * @property {Currency} currency - La devise actuelle
 * @property {(currency: Currency) => void} setCurrency - Fonction pour changer la devise
 * @property {(amount: number | string) => string} formatAmount - Fonction pour formater un montant avec la devise
 * @property {boolean} isDarkMode - Indique si le mode sombre est activé
 * @property {(isDark: boolean) => void} setIsDarkMode - Fonction pour activer/désactiver le mode sombre
 */
type AppContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations.en) => string;
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  formatAmount: (amount: number | string) => string;
  isDarkMode: boolean;
  setIsDarkMode: (isDark: boolean) => void;
};

const defaultLanguage = navigator.language.startsWith('fr') ? 'fr' :
                        navigator.language.startsWith('es') ? 'es' :
                        navigator.language.startsWith('ar') ? 'ar' :
                        navigator.language.startsWith('sw') ? 'sw' : 'en';

const defaultCurrency = currencies[0]; // Default to USD

const AppContext = createContext<AppContextType | undefined>(undefined);

/**
 * Fournisseur du contexte d'application
 *
 * Ce composant fournit le contexte d'application à tous les composants enfants.
 * Il gère l'état global de l'application comme la langue, la devise et le thème.
 *
 * @component
 * @param {Object} props - Les propriétés du composant
 * @param {ReactNode} props.children - Les composants enfants
 * @example
 * return (
 *   <AppProvider>
 *     <App />
 *   </AppProvider>
 * )
 */
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(
    () => (localStorage.getItem('language') as Language) || defaultLanguage as Language
  );

  const [currency, setCurrencyState] = useState<Currency>(
    () => {
      const savedCurrency = localStorage.getItem('currency');
      return savedCurrency ? JSON.parse(savedCurrency) : defaultCurrency;
    }
  );

  const [isDarkMode, setIsDarkModeState] = useState<boolean>(
    localStorage.getItem('theme') === 'dark' ||
    (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
  );

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const setCurrency = (curr: Currency) => {
    setCurrencyState(curr);
    localStorage.setItem('currency', JSON.stringify(curr));
  };

  const setIsDarkMode = (isDark: boolean) => {
    setIsDarkModeState(isDark);
    const root = window.document.documentElement;

    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  // Apply dark mode on initial load
  useEffect(() => {
    const root = window.document.documentElement;

    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, []);

  // Function to get translation
  const t = (key: keyof typeof translations.en): string => {
    return translations[language][key];
  };

  // Format amount with the selected currency
  const formatAmount = (amount: number | string): string => {
    const numAmount = typeof amount === 'string'
      ? parseFloat(amount.replace(/[^0-9.-]+/g, ''))
      : amount;

    if (isNaN(numAmount)) return `${currency.symbol}0`;

    return `${currency.symbol}${numAmount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  // Create the context value object
  const contextValue: AppContextType = {
    language,
    setLanguage,
    t,
    currency,
    setCurrency,
    formatAmount,
    isDarkMode,
    setIsDarkMode
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
