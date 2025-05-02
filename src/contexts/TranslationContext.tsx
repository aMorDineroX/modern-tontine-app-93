import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define supported languages
export type Language = 'en' | 'fr' | 'es' | 'de' | 'it' | 'pt' | 'ar';

// Define translation namespaces
export type TranslationNamespace =
  | 'common'
  | 'accessibility'
  | 'components'
  | 'pages'
  | 'errors'
  | 'validation';

interface TranslationContextType {
  /** Current language */
  language: Language;
  /** Change the current language */
  setLanguage: (language: Language) => void;
  /** Get a translation by key */
  t: (key: string, namespace?: TranslationNamespace, params?: Record<string, string | number>) => string;
  /** Get a translation by key with pluralization */
  tPlural: (key: string, count: number, namespace?: TranslationNamespace, params?: Record<string, string | number>) => string;
  /** Check if a language is RTL */
  isRtl: boolean;
  /** Get all supported languages */
  supportedLanguages: { code: Language; name: string; nativeName: string }[];
  /** Check if translations are loaded */
  isLoaded: boolean;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

// Define supported languages with metadata
const supportedLanguages = [
  { code: 'en' as Language, name: 'English', nativeName: 'English', rtl: false },
  { code: 'fr' as Language, name: 'French', nativeName: 'Français', rtl: false },
  { code: 'es' as Language, name: 'Spanish', nativeName: 'Español', rtl: false },
  { code: 'de' as Language, name: 'German', nativeName: 'Deutsch', rtl: false },
  { code: 'it' as Language, name: 'Italian', nativeName: 'Italiano', rtl: false },
  { code: 'pt' as Language, name: 'Portuguese', nativeName: 'Português', rtl: false },
  { code: 'ar' as Language, name: 'Arabic', nativeName: 'العربية', rtl: true },
];

// Define RTL languages
const rtlLanguages: Language[] = ['ar'];

/**
 * Provider component for translations
 *
 * @component
 * @param {Object} props - Component props
 * @param {ReactNode} props.children - Child components
 * @returns {JSX.Element} TranslationProvider component
 */
export function TranslationProvider({ children }: { children: ReactNode }) {
  // Get initial language from localStorage or browser settings
  const [language, setLanguageState] = useState<Language>(() => {
    const savedLanguage = localStorage.getItem('naat-language');
    if (savedLanguage && supportedLanguages.some(lang => lang.code === savedLanguage)) {
      return savedLanguage as Language;
    }

    // Try to get language from browser settings
    const browserLanguage = navigator.language.split('-')[0];
    if (supportedLanguages.some(lang => lang.code === browserLanguage)) {
      return browserLanguage as Language;
    }

    // Default to English
    return 'en';
  });

  // Track loaded translations
  const [translations, setTranslations] = useState<Record<string, any>>({});
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // Load translations for the current language
  useEffect(() => {
    const loadTranslations = async () => {
      setIsLoaded(false);

      try {
        // Load translations for each namespace
        const namespaces: TranslationNamespace[] = [
          'common',
          'accessibility',
          'components',
          'pages',
          'errors',
          'validation',
        ];

        const loadedTranslations: Record<string, any> = {};

        for (const namespace of namespaces) {
          try {
            // Dynamic import for translations
            const module = await import(`../locales/${language}/${namespace}.json`);
            loadedTranslations[namespace] = module.default;
          } catch (error) {
            console.warn(`Failed to load translations for ${namespace} in ${language}`, error);

            // Try to load English translations as fallback
            if (language !== 'en') {
              try {
                const fallbackModule = await import(`../locales/en/${namespace}.json`);
                loadedTranslations[namespace] = fallbackModule.default;
              } catch (fallbackError) {
                console.error(`Failed to load fallback translations for ${namespace}`, fallbackError);
                loadedTranslations[namespace] = {};
              }
            } else {
              loadedTranslations[namespace] = {};
            }
          }
        }

        setTranslations(loadedTranslations);
        setIsLoaded(true);
      } catch (error) {
        console.error('Failed to load translations', error);
        setIsLoaded(true); // Set to true to prevent infinite loading
      }
    };

    loadTranslations();
  }, [language]);

  // Check if the current language is RTL
  const isRtl = rtlLanguages.includes(language);

  // Update document language and direction
  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';

    // Save language preference
    localStorage.setItem('naat-language', language);
  }, [language, isRtl]);

  // Set language
  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
  };

  // Get a translation by key
  const t = (
    key: string,
    namespace: TranslationNamespace = 'common',
    params?: Record<string, string | number>
  ): string => {
    // Split the key by dots to access nested properties
    const keys = key.split('.');

    // Get the namespace translations
    const namespaceTranslations = translations[namespace] || {};

    // Get the translation
    let translation = keys.reduce((obj, k) => (obj && obj[k] !== undefined ? obj[k] : undefined), namespaceTranslations);

    // If translation is not found, return the key
    if (translation === undefined) {
      console.warn(`Translation not found: ${namespace}.${key}`);
      return key;
    }

    // If translation is not a string, return the key
    if (typeof translation !== 'string') {
      console.warn(`Translation is not a string: ${namespace}.${key}`);
      return key;
    }

    // Replace parameters
    if (params) {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        translation = translation.replace(new RegExp(`{{${paramKey}}}`, 'g'), String(paramValue));
      });
    }

    return translation;
  };

  // Get a translation by key with pluralization
  const tPlural = (
    key: string,
    count: number,
    namespace: TranslationNamespace = 'common',
    params?: Record<string, string | number>
  ): string => {
    // Add count to params
    const mergedParams = { ...params, count };

    // Get the appropriate plural form
    const pluralKey = `${key}_${getPluralForm(count, language)}`;

    // Try to get the plural form
    const pluralTranslation = t(pluralKey, namespace, mergedParams);

    // If the plural form is not found (returns the key), try the singular form
    if (pluralTranslation === pluralKey) {
      return t(key, namespace, mergedParams);
    }

    return pluralTranslation;
  };

  // Get the plural form based on count and language
  const getPluralForm = (count: number, language: Language): string => {
    // Different languages have different plural rules
    switch (language) {
      case 'en':
      case 'de':
      case 'es':
      case 'it':
      case 'pt':
        return count === 1 ? 'one' : 'other';
      case 'fr':
        return count === 0 || count === 1 ? 'one' : 'other';
      case 'ar':
        if (count === 0) return 'zero';
        if (count === 1) return 'one';
        if (count === 2) return 'two';
        if (count >= 3 && count <= 10) return 'few';
        if (count >= 11 && count <= 99) return 'many';
        return 'other';
      default:
        return count === 1 ? 'one' : 'other';
    }
  };

  const value: TranslationContextType = {
    language,
    setLanguage,
    t,
    tPlural,
    isRtl,
    supportedLanguages: supportedLanguages.map(({ code, name, nativeName }) => ({ code, name, nativeName })),
    isLoaded,
  };

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
}

/**
 * Hook to use translations
 *
 * @returns {TranslationContextType} Translation context
 */
export function useTranslation(): TranslationContextType {
  const context = useContext(TranslationContext);

  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }

  return context;
}
